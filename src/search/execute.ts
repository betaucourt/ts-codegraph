import { closeDataset, openDataset } from '../dataset/open.js';
import { managedAll } from '../dataset/sqlite-runtime.js';
import { splitIdentifier } from '../extractor/identifier.js';
import type { SearchData } from '../contracts/index.js';
import { normalizeQuery, type NormalizedQuery } from './query.js';
import { compareCandidates, rankValue, type SearchKind, type SearchTier } from './rank.js';

/**
 * Read-only search execution (step-05 §3).
 *
 * Opens the dataset **immutable** (read-only, no WAL sidecars), gathers
 * exact/prefix/FTS candidates over the loaded facts using the Step 02 tables,
 * merges them by public stable id, attaches match reasons derived from the actual
 * match, and returns a deterministically ordered, limited result list. No `fs` or
 * `path` import; no write helper is imported.
 */

type SearchResult = SearchData['results'][number];
type MatchReason = SearchResult['matchReasons'][number];

const MAX_LABEL = 200;
const MAX_CONTEXT = 280;

export interface SearchExecutionInput {
  readonly projectId: string;
  readonly dataDirOverride?: string;
  readonly query: string;
  readonly kind?: SearchKind;
  readonly limit: number;
}

export interface SearchExecutionResult {
  readonly snapshotId: string;
  readonly results: readonly SearchResult[];
}

interface Candidate {
  readonly id: string;
  readonly kind: SearchKind;
  readonly label: string;
  readonly context: string;
  tier: SearchTier;
  bm25: number;
  readonly reasons: Set<MatchReason>;
}

type LabelClass =
  | { readonly tier: 'exact'; readonly labelReason: 'exact_label' }
  | { readonly tier: 'prefix'; readonly labelReason: 'prefix_label' }
  | { readonly tier: 'fts' }
  | undefined;

function classifyLabel(label: string, query: NormalizedQuery): LabelClass {
  const lowered = label.toLowerCase();
  if (lowered === query.lowered) {
    return { tier: 'exact', labelReason: 'exact_label' };
  }
  if (query.lowered.length > 0 && lowered.startsWith(query.lowered)) {
    return { tier: 'prefix', labelReason: 'prefix_label' };
  }
  if (query.tokens.length > 0) {
    const labelTokens = new Set(splitIdentifier(label));
    if (query.tokens.every((token) => labelTokens.has(token))) {
      return { tier: 'fts' };
    }
  }
  return undefined;
}

const TIER_WEIGHT: Readonly<Record<SearchTier, number>> = { exact: 3, prefix: 2, fts: 1 };

class CandidateSet {
  readonly #byId = new Map<string, Candidate>();

  add(input: {
    readonly id: string;
    readonly kind: SearchKind;
    readonly label: string;
    readonly context: string;
    readonly tier: SearchTier;
    readonly bm25: number;
    readonly reasons: readonly MatchReason[];
  }): void {
    const existing = this.#byId.get(input.id);
    if (existing === undefined) {
      this.#byId.set(input.id, {
        id: input.id,
        kind: input.kind,
        label: input.label.slice(0, MAX_LABEL),
        context: (input.context.length > 0 ? input.context : input.kind).slice(0, MAX_CONTEXT),
        tier: input.tier,
        bm25: input.bm25,
        reasons: new Set(input.reasons),
      });
      return;
    }
    if (TIER_WEIGHT[input.tier] > TIER_WEIGHT[existing.tier]) {
      existing.tier = input.tier;
    }
    existing.bm25 = Math.min(existing.bm25, input.bm25);
    for (const reason of input.reasons) {
      existing.reasons.add(reason);
    }
  }

  toResults(limit: number): SearchResult[] {
    return [...this.#byId.values()]
      .sort(compareCandidates)
      .slice(0, limit)
      .map((candidate) => ({
        id: candidate.id,
        kind: candidate.kind,
        label: candidate.label,
        context: candidate.context,
        rank: rankValue(candidate.tier),
        matchReasons: [...candidate.reasons].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) as SearchResult['matchReasons'],
      }));
  }
}

function wanted(kind: SearchKind, filter: SearchKind | undefined): boolean {
  return filter === undefined || filter === kind;
}

interface SymbolRow {
  readonly id: string;
  readonly label: string;
  readonly pkg: string | null;
}
interface FtsRow extends SymbolRow {
  readonly bm: number;
}
interface NamedRow {
  readonly id: string;
  readonly label: string;
}
interface DiagnosticRow extends NamedRow {
  readonly severity: string;
}

function gatherSymbols(db: import('../dataset/open.js').Dataset['db'], query: NormalizedQuery, set: CandidateSet): void {
  const rows = managedAll<SymbolRow>(
    db,
    'SELECT symbol_id AS id, symbol_name AS label, package_name AS pkg FROM search_document',
    [],
  );
  for (const row of rows) {
    const classified = classifyLabel(row.label, query);
    if (classified !== undefined && classified.tier !== 'fts') {
      set.add({
        id: row.id,
        kind: 'symbol',
        label: row.label,
        context: row.pkg ?? 'symbol',
        tier: classified.tier,
        bm25: 0,
        reasons: [classified.labelReason],
      });
    }
  }
  if (query.ftsMatch.length > 0) {
    const ftsRows = managedAll<FtsRow>(
      db,
      'SELECT symbol_id AS id, symbol_name AS label, package_name AS pkg, bm25(search_document_fts) AS bm FROM search_document_fts WHERE search_document_fts MATCH ? ORDER BY bm',
      [query.ftsMatch],
    );
    for (const row of ftsRows) {
      set.add({
        id: row.id,
        kind: 'symbol',
        label: row.label,
        context: row.pkg ?? 'symbol',
        tier: 'fts',
        bm25: row.bm,
        reasons: ['symbol_token'],
      });
    }
  }
}

function gatherNamed(
  db: import('../dataset/open.js').Dataset['db'],
  query: NormalizedQuery,
  set: CandidateSet,
  sql: string,
  kind: SearchKind,
  kindReason: MatchReason,
  contextOf: (row: NamedRow) => string,
): void {
  const rows = managedAll<NamedRow>(db, sql, []);
  for (const row of rows) {
    const classified = classifyLabel(row.label, query);
    if (classified === undefined) {
      continue;
    }
    const reasons: MatchReason[] = [kindReason];
    if (classified.tier !== 'fts') {
      reasons.push(classified.labelReason);
    }
    set.add({
      id: row.id,
      kind,
      label: row.label,
      context: contextOf(row),
      tier: classified.tier,
      bm25: 0,
      reasons,
    });
  }
}

export async function executeSearch(input: SearchExecutionInput): Promise<SearchExecutionResult> {
  const query = normalizeQuery(input.query);
  const openOptions =
    input.dataDirOverride !== undefined
      ? { immutable: true as const, dataDirOverride: input.dataDirOverride }
      : { immutable: true as const };
  const dataset = await openDataset(input.projectId, openOptions);
  try {
    const snapshotRows = managedAll<{ id: string }>(
      dataset.db,
      'SELECT id FROM snapshot ORDER BY id LIMIT 1',
      [],
    );
    const snapshotId = snapshotRows[0]?.id ?? '';

    const set = new CandidateSet();
    if (wanted('symbol', input.kind)) {
      gatherSymbols(dataset.db, query, set);
    }
    if (wanted('package', input.kind)) {
      gatherNamed(dataset.db, query, set, 'SELECT id, name AS label FROM package', 'package', 'package_name', () => 'package');
    }
    if (wanted('file', input.kind)) {
      gatherNamed(
        dataset.db,
        query,
        set,
        'SELECT id, repo_relative_path AS label FROM source_file',
        'file',
        'file_path',
        () => 'file',
      );
    }
    if (wanted('diagnostic', input.kind)) {
      const rows = managedAll<DiagnosticRow>(dataset.db, 'SELECT id, code AS label, severity FROM diagnostic', []);
      for (const row of rows) {
        const classified = classifyLabel(row.label, query);
        if (classified === undefined) {
          continue;
        }
        const reasons: MatchReason[] = ['diagnostic_code'];
        if (classified.tier !== 'fts') {
          reasons.push(classified.labelReason);
        }
        set.add({
          id: row.id,
          kind: 'diagnostic',
          label: row.label,
          context: row.severity,
          tier: classified.tier,
          bm25: 0,
          reasons,
        });
      }
    }

    return { snapshotId, results: set.toResults(input.limit) };
  } finally {
    closeDataset(dataset);
  }
}
