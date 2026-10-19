import { appendFile, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// Partial mock so the filesystem-write methods are call-counting wrappers (still
// delegating to the real implementation). ESM namespaces cannot be spied via
// vi.spyOn, so this is how the read-only "filesystem-access spy" is realized.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  const wrap = (fn: unknown): unknown => vi.fn((...args: unknown[]) => (fn as (...a: unknown[]) => unknown)(...args));
  return {
    ...actual,
    writeFile: wrap(actual.writeFile),
    appendFile: wrap(actual.appendFile),
    mkdir: wrap(actual.mkdir),
  };
});

import { runLoad } from '../../src/commands/load.js';
import { runSearch } from '../../src/commands/search.js';
import { executeSearch } from '../../src/search/execute.js';
import { executeSearchCommand } from '../../src/cli/search-command.js';
import { parseSearchEnvelope } from '../../src/contracts/index.js';
import { buildDiagnosticId } from '../../src/dataset/ids.js';
import { closeDataset, insertDiagnostic, openDataset } from '../../src/dataset/index.js';
import { NO_GIT_SUMMARY } from '../helpers/git-summary.js';

const FIXTURE = resolve('test/fixtures/search/fixture-search');
const EXPECTED_PATH = resolve('test/fixtures/search/expected.json');
const TS = '2026-07-07T00:00:00.000Z';

interface ExpectedResult {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly rank: number;
  readonly matchReasons: readonly string[];
}
interface Expected {
  readonly queries: Record<string, { readonly query: string; readonly results: readonly ExpectedResult[] }>;
}

let dataDir: string;
let projectId: string;
let expected: Expected;

function pick(results: readonly { id: string; kind: string; label: string; rank: number; matchReasons: readonly string[] }[]): ExpectedResult[] {
  return results.map((r) => ({ id: r.id, kind: r.kind, label: r.label, rank: r.rank, matchReasons: [...r.matchReasons] }));
}

async function snapshotDir(root: string): Promise<string> {
  const entries: string[] = [];
  async function walk(dir: string): Promise<void> {
    let listing;
    try {
      listing = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of listing) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const stats = await stat(full);
        entries.push(`${relative(root, full)}:${stats.size}`);
      }
    }
  }
  await walk(root);
  return entries.sort().join('|');
}

async function search(query: string, extra?: { kind?: string; limit?: number }) {
  return runSearch({
    projectPath: FIXTURE,
    dataDirOverride: dataDir,
    timestamp: TS,
    query,
    ...(extra?.kind !== undefined ? { kind: extra.kind as never } : {}),
    ...(extra?.limit !== undefined ? { limit: extra.limit } : {}),
  });
}

beforeAll(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'ts-codegraph-search-'));
  expected = JSON.parse(await readFile(EXPECTED_PATH, 'utf8')) as Expected;
  const load = await runLoad({
    projectPath: FIXTURE,
    dataDirOverride: dataDir,
    timestamp: TS,
    gitSummaryOverride: NO_GIT_SUMMARY,
  });
  projectId = load.envelope.data.projectId;
  const snapshotId = load.envelope.data.snapshotId;
  // Seed one diagnostic — a clean extraction produces none, and the diagnostic
  // search path still needs coverage. Its id is a deterministic builder output.
  const dataset = await openDataset(projectId, { dataDirOverride: dataDir });
  insertDiagnostic(dataset, {
    id: buildDiagnosticId({ snapshotId, code: 'LOAD_ID_COLLISION', locationKey: 'seed' }),
    snapshotId,
    code: 'LOAD_ID_COLLISION',
    severity: 'warning',
    message: 'seeded diagnostic',
  });
  closeDataset(dataset);
});

afterAll(async () => {
  await rm(dataDir, { recursive: true, force: true });
});

describe('ts-codegraph search — query-class fixtures (exact stable IDs, reasons, order)', () => {
  it('matches every committed query-class output exactly', async () => {
    for (const [name, spec] of Object.entries(expected.queries)) {
      const outcome = await search(spec.query);
      expect(pick(outcome.envelope.data.results), `query class: ${name}`).toEqual(spec.results);
      expect(parseSearchEnvelope(outcome.envelope).success).toBe(true);
      expect(outcome.envelope.data.snapshotId.length).toBeGreaterThan(0);
    }
  });
});

describe('ts-codegraph search — determinism', () => {
  it('returns a byte-identical result array for the same query twice', async () => {
    const first = await search('create');
    const second = await search('create');
    expect(JSON.stringify(second.envelope.data.results)).toBe(JSON.stringify(first.envelope.data.results));
  });
});

describe('ts-codegraph search — injection safety', () => {
  it('neutralizes FTS metacharacters and MATCH keywords without crashing', async () => {
    const injections = [
      '"AppError" OR name MATCH x',
      'App*^2 -foo (bar)',
      'NEAR("x", "y")',
      '"""""',
      'symbol:AppError AND 1=1',
    ];
    for (const query of injections) {
      const outcome = await search(query);
      expect(parseSearchEnvelope(outcome.envelope).success, `query: ${query}`).toBe(true);
      expect(outcome.ok).toBe(true);
      expect(Array.isArray(outcome.envelope.data.results)).toBe(true);
    }
  });
});

describe('ts-codegraph search — empty result', () => {
  it('returns a valid envelope with empty results and success semantics', async () => {
    const outcome = await search('zzznotfoundxyz');
    expect(outcome.ok).toBe(true);
    expect(outcome.exitCode).toBe(0);
    expect(outcome.envelope.data.results).toEqual([]);
    expect(parseSearchEnvelope(outcome.envelope).success).toBe(true);
  });
});

describe('ts-codegraph search — limit clamp', () => {
  it('clamps an over-max limit and emits a warning diagnostic', async () => {
    const outcome = await search('a', { limit: 500 });
    expect(outcome.envelope.data.resultLimit).toBe(100);
    expect(outcome.envelope.warnings.map((w) => w.code)).toContain('SEARCH_LIMIT_CLAMPED');
  });

  it('respects a within-range limit with no warning', async () => {
    const outcome = await search('@fixture/search-tiny', { limit: 2 });
    expect(outcome.envelope.data.resultLimit).toBe(2);
    expect(outcome.envelope.data.results.length).toBeLessThanOrEqual(2);
    expect(outcome.envelope.warnings).toEqual([]);
  });
});

describe('ts-codegraph search — read-only boundary', () => {
  it('src/search imports no fs/path and no write helper', async () => {
    const files = ['query.ts', 'rank.ts', 'execute.ts'];
    for (const file of files) {
      const text = await readFile(resolve('src/search', file), 'utf8');
      expect(/from ['"]node:fs['"]|from ['"]node:fs\/promises['"]|from ['"]node:path['"]/.test(text), `${file} fs/path`).toBe(false);
      expect(/insert[A-Z]|managedRun|withDatasetTransaction|withManagedTransaction|ensureAppPath/.test(text), `${file} write helper`).toBe(false);
    }
    const command = await readFile(resolve('src/commands/search.ts'), 'utf8');
    expect(/insert[A-Z]|managedRun|withDatasetTransaction|withManagedTransaction|ensureAppPath/.test(command)).toBe(false);
  });

  it('makes zero filesystem changes during execution (no WAL sidecars)', async () => {
    const before = await snapshotDir(dataDir);
    await executeSearch({ projectId, dataDirOverride: dataDir, query: 'createWidget', limit: 20 });
    const after = await snapshotDir(dataDir);
    expect(after).toBe(before);
  });

  it('makes no filesystem write calls during execution (fs spy)', async () => {
    const writers = [writeFile, appendFile, mkdir];
    const callsOf = (fn: unknown): number => (fn as { mock: { calls: unknown[] } }).mock.calls.length;
    const before = writers.map(callsOf);
    await executeSearch({ projectId, dataDirOverride: dataDir, query: 'AppError', limit: 20 });
    writers.forEach((fn, index) => {
      expect(callsOf(fn), 'no fs write during search execution').toBe(before[index]);
    });
  });
});

describe('ts-codegraph search — CLI JSON purity', () => {
  it('prints exactly one ts-codegraph.search@1 envelope on stdout in --json mode', async () => {
    const chunks: string[] = [];
    const stdout = {
      write(value: string | Uint8Array): boolean {
        chunks.push(typeof value === 'string' ? value : Buffer.from(value).toString('utf8'));
        return true;
      },
    } as unknown as NodeJS.WritableStream;
    const errChunks: string[] = [];
    const stderr = {
      write(value: string | Uint8Array): boolean {
        errChunks.push(typeof value === 'string' ? value : Buffer.from(value).toString('utf8'));
        return true;
      },
    } as unknown as NodeJS.WritableStream;

    const exitCode = await executeSearchCommand({
      argv: ['AppError', '--project', FIXTURE, '--json'],
      stdout,
      stderr,
      overrides: { dataDirOverride: dataDir, timestamp: TS },
    });

    const lines = chunks.join('').trim().split('\n');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0] ?? '');
    expect(parsed.schemaVersion).toBe('ts-codegraph.search@1');
    expect(parseSearchEnvelope(parsed).success).toBe(true);
    expect(exitCode).toBe(0);
    expect(errChunks.join('')).toBe('');
  });
});
