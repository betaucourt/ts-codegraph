import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

import { AppError, ERROR_CODES, getCliExitCodeForError } from '../internal/errors/index.js';
import {
  readPackageManifest,
  summarizeGitState,
  findTsconfigFiles,
  type GitSummary,
} from '../internal/repo-inventory/index.js';
import { hashFileContent, scanSourceFiles } from '../internal/source-files/index.js';

import { NOW_TRAVERSAL_POLICY, deriveProjectKey } from './check.js';
import {
  parseLoadEnvelope,
  type Diagnostic,
  type LoadData,
  type LoadEnvelope,
} from '../contracts/index.js';
import {
  buildDiagnosticId,
  buildEvidenceId,
  buildPackageId,
  buildProjectId,
  buildSearchDocId,
  buildSignatureId,
  buildSourceFileId,
  buildSourceFileVersionId,
  buildSymbolId,
  computeSnapshotIdentity,
  DATASET_SCHEMA_ID,
  DATASET_SCHEMA_VERSION,
  closeDataset,
  insertDiagnostic,
  insertEvidence,
  insertLoadRun,
  insertPackage,
  insertPackageDependency,
  insertPackageExport,
  insertProject,
  insertSearchDocument,
  insertSignature,
  insertSnapshot,
  insertSourceFile,
  insertSourceFileVersion,
  insertSymbol,
  indexSearchDocument,
  openDataset,
  withDatasetTransaction,
  type Dataset,
  type DiagnosticRowInput,
  type EvidenceRow,
  type IncludedFile,
  type PackageDependencyRowInput,
  type PackageExportRowInput,
  type PackageRowInput,
  type ProjectRow,
  type SearchDocumentRowInput,
  type SignatureRow,
  type SnapshotRowInput,
  type LoadRunRowInput,
  type SourceFileRowInput,
  type SourceFileVersionRow,
  type SymbolRowInput,
} from '../dataset/index.js';
import { extractPackageFacts, splitIdentifier, type PackageFacts } from '../extractor/index.js';
import { managedAll, managedRun } from '../dataset/sqlite-runtime.js';

/**
 * `ts-codegraph load` — the sole fact writer (step-04 §3, decision record §5/§6/§7).
 *
 * Pipeline: discovery → snapshot identity → safe traversal + content hashing →
 * opaque extraction → **single-transaction** persistence of every fact plus
 * per-symbol search documents (FTS pre-split with the Row-3 identifier splitter) →
 * a validated `ts-codegraph.load@1` envelope. Any error inside the transaction rolls
 * everything back: no partial snapshot, no partial search state. Persistence order
 * is explicitly sorted so repeated loads of the same snapshot are deterministic.
 */

export const LOAD_TOOL_VERSION = '0.0.0';
export const SEARCH_TOKENIZER_VERSION = 'identifier-v1' as const;

/** Ordered persistence phases (also the fault-injection points for the rollback test). */
export type LoadPhase =
  | 'project'
  | 'snapshot'
  | 'load-run'
  | 'packages'
  | 'dependencies'
  | 'exports'
  | 'source-files'
  | 'source-file-versions'
  | 'symbols'
  | 'signatures'
  | 'evidence'
  | 'diagnostics'
  | 'search-documents';

export interface RunLoadOptions {
  readonly projectPath: string;
  readonly dataDirOverride?: string;
  readonly timestamp?: string;
  /** Test-only seam for fixtures that must be independent of the parent checkout. */
  readonly gitSummaryOverride?: GitSummary;
  /** Test-only seam: called at the start of each persistence phase; throw to force rollback. */
  readonly injectFault?: (phase: LoadPhase) => void;
}

export interface LoadOutcome {
  readonly envelope: LoadEnvelope;
  readonly ok: boolean;
  readonly exitCode: number;
}

interface PersistModel {
  readonly project: ProjectRow;
  readonly snapshot: SnapshotRowInput;
  readonly loadRun: LoadRunRowInput;
  readonly packages: readonly PackageRowInput[];
  readonly dependencies: readonly PackageDependencyRowInput[];
  readonly exports: readonly PackageExportRowInput[];
  readonly sourceFiles: readonly SourceFileRowInput[];
  readonly sourceFileVersions: readonly SourceFileVersionRow[];
  readonly symbols: readonly SymbolRowInput[];
  readonly signatures: readonly SignatureRow[];
  readonly evidence: readonly EvidenceRow[];
  readonly diagnosticRows: readonly DiagnosticRowInput[];
  readonly searchDocuments: readonly SearchDocumentRowInput[];
  /** The extractor diagnostics as contract objects (for the envelope). */
  readonly diagnostics: readonly Diagnostic[];
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Deterministic load-run id derived from the snapshot (one canonical run per snapshot in Now). */
function buildLoadRunId(snapshotId: string): string {
  return `load-run:v1:${sha256Hex(snapshotId).slice(0, 16)}`;
}

function byId<T extends { readonly id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Tables cleared before a full-snapshot load, children before parents (FK-safe). */
const CLEAR_ORDER = [
  'search_document_fts',
  'search_document',
  'generated_doc',
  'diagnostic',
  'evidence',
  'signature',
  'symbol',
  'source_file_version',
  'source_file',
  'package_dependency',
  'package_export',
  'package',
  'load_run',
  'snapshot',
  'project',
] as const;

// --- Model building (all async work happens before the transaction) ---------

async function buildModel(options: RunLoadOptions): Promise<PersistModel> {
  const projectRoot = resolve(options.projectPath);
  const manifest = await readPackageManifest(join(projectRoot, 'package.json'), projectRoot);
  const projectKey = deriveProjectKey(manifest.name, projectRoot);
  const projectId = buildProjectId(projectKey);
  const packageName = manifest.name ?? projectKey;

  const gitSummary = options.gitSummaryOverride ?? await summarizeGitState(projectRoot);
  const tsconfigPaths = await findTsconfigFiles(projectRoot);

  const scan = await scanSourceFiles(projectRoot, NOW_TRAVERSAL_POLICY);
  const scannedFiles = scan.files
    .filter((file) => file.kind === 'text')
    .map((file) => file.relativePath.replace(/\\/g, '/'))
    .sort((a, b) => a.localeCompare(b));

  const includedFiles: IncludedFile[] = [];
  const absoluteByRepoPath = new Map<string, string>();
  for (const repoRelativePath of scannedFiles) {
    const absolutePath = join(projectRoot, repoRelativePath);
    absoluteByRepoPath.set(repoRelativePath, absolutePath);
    const contentHash = await hashFileContent(absolutePath, projectRoot);
    includedFiles.push({ repoRelativePath, contentHash });
  }

  const { snapshotId, summary } = computeSnapshotIdentity({ projectId, gitSummary, includedFiles });
  const loadRunId = buildLoadRunId(snapshotId);

  const facts: PackageFacts = await extractPackageFacts({
    packageName,
    sourceFiles: scannedFiles.map((repoRelativePath) => ({
      repoRelativePath,
      absolutePath: absoluteByRepoPath.get(repoRelativePath) ?? join(projectRoot, repoRelativePath),
    })),
    ...(tsconfigPaths[0] !== undefined ? { tsConfigFilePath: tsconfigPaths[0] } : {}),
  });

  // Source files + versions (content hash addresses the version).
  const contentHashByPath = new Map(includedFiles.map((file) => [file.repoRelativePath, file.contentHash]));
  const sourceFileIdByPath = new Map<string, string>();
  const sourceFileVersionIdByPath = new Map<string, string>();
  const sourceFiles: SourceFileRowInput[] = [];
  const sourceFileVersions: SourceFileVersionRow[] = [];
  const packageId = buildPackageId({
    projectId,
    packageName,
    manifestPath: 'package.json',
  });
  for (const repoRelativePath of scannedFiles) {
    const contentHash = contentHashByPath.get(repoRelativePath) ?? '';
    const sourceFileId = buildSourceFileId({ snapshotId, repoRelativePath });
    const versionId = buildSourceFileVersionId({ sourceFileId, contentHash });
    sourceFileIdByPath.set(repoRelativePath, sourceFileId);
    sourceFileVersionIdByPath.set(repoRelativePath, versionId);
    sourceFiles.push({ id: sourceFileId, snapshotId, packageId, repoRelativePath, contentHash });
    sourceFileVersions.push({ id: versionId, sourceFileId, contentHash });
  }

  // Package + dependencies + exports.
  const packageRow: PackageRowInput = {
    id: packageId,
    projectId,
    name: packageName,
    ...(manifest.version !== undefined ? { version: manifest.version } : {}),
    ...(manifest.description !== undefined ? { description: manifest.description } : {}),
    manifestPath: 'package.json',
  };
  const dependencies: PackageDependencyRowInput[] = [];
  for (const [name, range] of Object.entries(manifest.dependencies ?? {})) {
    dependencies.push({ packageId, dependencyName: name, dependencyKind: 'runtime', versionRange: range });
  }
  for (const [name, range] of Object.entries(manifest.devDependencies ?? {})) {
    dependencies.push({ packageId, dependencyName: name, dependencyKind: 'dev', versionRange: range });
  }

  // Symbols, signatures, evidence, search docs from the extracted declarations.
  const symbols: SymbolRowInput[] = [];
  const signatures: SignatureRow[] = [];
  const evidence: EvidenceRow[] = [];
  const searchDocuments: SearchDocumentRowInput[] = [];
  const exportPaths = new Set<string>();

  for (const declaration of facts.declarations) {
    for (const exportPath of declaration.exportPaths) {
      exportPaths.add(exportPath);
    }
    const versionId = sourceFileVersionIdByPath.get(declaration.sourceRange.path);
    if (versionId === undefined) {
      continue;
    }
    const symbolId = buildSymbolId({
      sourceFileVersionId: versionId,
      kind: declaration.kind,
      name: declaration.name,
      startLine: declaration.sourceRange.startLine,
    });
    symbols.push({
      id: symbolId,
      sourceFileVersionId: versionId,
      packageId,
      kind: declaration.kind,
      name: declaration.name,
      exported: true,
      startLine: declaration.sourceRange.startLine,
      ...(declaration.sourceRange.endLine !== undefined ? { endLine: declaration.sourceRange.endLine } : {}),
    });
    signatures.push({
      id: buildSignatureId({ symbolId, signatureText: declaration.signatureText }),
      symbolId,
      signatureText: declaration.signatureText,
    });
    if (declaration.evidence !== undefined) {
      const contentHash = sha256Hex(declaration.evidence.text);
      evidence.push({
        id: buildEvidenceId({ symbolId, evidenceKind: 'jsdoc', contentHash }),
        symbolId,
        evidenceKind: 'jsdoc',
        contentHash,
        text: declaration.evidence.text,
      });
    }
    const qualifiedName = `${packageName}/${declaration.name}`;
    const tokens = [
      ...new Set([
        ...splitIdentifier(declaration.name),
        ...splitIdentifier(packageName),
        declaration.name.toLowerCase(),
      ]),
    ].join(' ');
    searchDocuments.push({
      id: buildSearchDocId({ snapshotId, symbolId }),
      snapshotId,
      symbolId,
      packageName,
      symbolName: declaration.name,
      kind: declaration.kind,
      qualifiedName,
      tokens,
    });
  }

  const exports: PackageExportRowInput[] = [...exportPaths]
    .sort(compareStrings)
    .map((exportPath) => ({ packageId, exportPath }));

  // Extractor diagnostics -> diagnostic rows (deterministic location keys).
  const diagnosticRows: DiagnosticRowInput[] = facts.diagnostics.map((diagnostic, index) => ({
    id: buildDiagnosticId({ snapshotId, code: diagnostic.code, locationKey: `${diagnostic.code}#${index}` }),
    snapshotId,
    loadRunId,
    code: diagnostic.code,
    severity: diagnostic.severity,
    message: diagnostic.message,
    locationKey: `${diagnostic.code}#${index}`,
  }));

  const startedAt = new Date(0).toISOString();
  const loadRun: LoadRunRowInput = {
    id: loadRunId,
    projectId,
    snapshotId,
    status: 'succeeded',
    startedAt,
    finishedAt: startedAt,
    toolVersion: LOAD_TOOL_VERSION,
    datasetSchemaVersion: DATASET_SCHEMA_VERSION,
  };

  return {
    project: { id: projectId, name: projectKey },
    snapshot: {
      id: snapshotId,
      projectId,
      kind: summary.kind,
      ...(summary.baseCommit !== undefined ? { baseCommit: summary.baseCommit } : {}),
      includedFileCount: summary.includedFileCount,
      ...(summary.dirtyFileCount !== undefined ? { dirtyFileCount: summary.dirtyFileCount } : {}),
    },
    loadRun,
    packages: [packageRow],
    dependencies: dependencies.sort((a, b) =>
      compareStrings(`${a.dependencyName} ${a.dependencyKind}`, `${b.dependencyName} ${b.dependencyKind}`),
    ),
    exports,
    sourceFiles: byId(sourceFiles),
    sourceFileVersions: byId(sourceFileVersions),
    symbols: byId(symbols),
    signatures: byId(signatures),
    evidence: byId(evidence),
    diagnosticRows: byId(diagnosticRows),
    searchDocuments: byId(searchDocuments),
    diagnostics: facts.diagnostics,
  };
}

// --- Persistence (single transaction) --------------------------------------

function clearDatasetContent(dataset: Dataset): void {
  for (const table of CLEAR_ORDER) {
    managedRun(dataset.db, `DELETE FROM ${table}`, []);
  }
}

function persist(dataset: Dataset, model: PersistModel, injectFault?: (phase: LoadPhase) => void): void {
  withDatasetTransaction(dataset, () => {
    clearDatasetContent(dataset);

    injectFault?.('project');
    insertProject(dataset, model.project);

    injectFault?.('snapshot');
    insertSnapshot(dataset, model.snapshot);

    injectFault?.('load-run');
    insertLoadRun(dataset, model.loadRun);

    injectFault?.('packages');
    for (const row of model.packages) insertPackage(dataset, row);

    injectFault?.('dependencies');
    for (const row of model.dependencies) insertPackageDependency(dataset, row);

    injectFault?.('source-files');
    for (const row of model.sourceFiles) insertSourceFile(dataset, row);

    injectFault?.('source-file-versions');
    for (const row of model.sourceFileVersions) insertSourceFileVersion(dataset, row);

    injectFault?.('symbols');
    for (const row of model.symbols) insertSymbol(dataset, row);

    injectFault?.('signatures');
    for (const row of model.signatures) insertSignature(dataset, row);

    injectFault?.('evidence');
    for (const row of model.evidence) insertEvidence(dataset, row);

    injectFault?.('exports');
    for (const row of model.exports) insertPackageExport(dataset, row);

    injectFault?.('diagnostics');
    for (const row of model.diagnosticRows) insertDiagnostic(dataset, row);

    injectFault?.('search-documents');
    for (const row of model.searchDocuments) {
      insertSearchDocument(dataset, row);
      indexSearchDocument(dataset, row);
    }
  });
}

// --- Envelope assembly ------------------------------------------------------

function buildEnvelope(model: PersistModel, timestamp: string): LoadEnvelope {
  const changed: LoadData['changed'] = [
    { kind: 'project' as const, id: model.project.id },
    { kind: 'snapshot' as const, id: model.snapshot.id },
    ...model.packages.map((row) => ({ kind: 'package' as const, id: row.id })),
    ...model.sourceFiles.map((row) => ({ kind: 'source-file' as const, id: row.id })),
    ...model.symbols.map((row) => ({ kind: 'symbol' as const, id: row.id })),
    ...model.diagnosticRows.map((row) => ({ kind: 'diagnostic' as const, id: row.id })),
    ...model.searchDocuments.map((row) => ({ kind: 'search-document' as const, id: row.id })),
  ].sort((a, b) => compareStrings(`${a.kind} ${a.id}`, `${b.kind} ${b.id}`));

  const errors = model.diagnostics.filter((d) => d.severity === 'error');
  const warnings = model.diagnostics.filter((d) => d.severity === 'warning');
  const info = model.diagnostics.filter((d) => d.severity === 'info');

  const data: LoadData = {
    projectId: model.project.id,
    snapshotId: model.snapshot.id,
    loadRunId: model.loadRun.id,
    counts: {
      projects: 1,
      snapshots: 1,
      packages: model.packages.length,
      sourceFiles: model.sourceFiles.length,
      exports: model.exports.length,
      symbols: model.symbols.length,
      signatures: model.signatures.length,
      evidence: model.evidence.length,
      diagnostics: model.diagnosticRows.length,
      searchDocuments: model.searchDocuments.length,
    },
    changed,
    skipped: [],
    diagnosticSummary: { errors: errors.length, warnings: warnings.length, info: info.length },
    searchIndexStatus: {
      status: model.searchDocuments.length > 0 ? 'ready' : 'skipped',
      documentCount: model.searchDocuments.length,
      tokenizerVersion: SEARCH_TOKENIZER_VERSION,
    },
  };

  const envelopeInput = {
    ok: errors.length === 0,
    diagnostics: errors,
    warnings,
    meta: { toolVersion: LOAD_TOOL_VERSION, datasetSchemaVersion: DATASET_SCHEMA_ID, timestamp },
    command: 'load',
    schemaVersion: 'ts-codegraph.load@1',
    data,
  };

  const parsed = parseLoadEnvelope(envelopeInput);
  if (!parsed.success) {
    throw new Error('assembled ts-codegraph.load@1 envelope failed self-validation');
  }
  return parsed.value;
}

/**
 * Run a full load: build the model (async), persist it in one transaction, and
 * return a validated envelope. Throws (after rollback) if persistence fails.
 */
export async function runLoad(options: RunLoadOptions): Promise<LoadOutcome> {
  const model = await buildModel(options);

  const openOptions =
    options.dataDirOverride !== undefined
      ? { create: true as const, dataDirOverride: options.dataDirOverride }
      : { create: true as const };
  const dataset = await openDataset(model.project.id, openOptions);
  try {
    persist(dataset, model, options.injectFault);
  } finally {
    // Persist opens its own transaction; the connection is closed regardless.
    closeDataset(dataset);
  }

  const envelope = buildEnvelope(model, options.timestamp ?? new Date().toISOString());
  return { envelope, ok: envelope.ok, exitCode: 0 };
}

// --- Performance timing harness (measurement only; no assertion) ------------

export interface LoadTimingEntry {
  readonly target: string;
  readonly medianMs: number;
  readonly p95Ms: number;
  readonly runs: number;
  readonly node: string;
  readonly tsMorph: string;
  readonly datasetSchema: string;
}

function percentile(sortedMs: readonly number[], fraction: number): number {
  if (sortedMs.length === 0) return 0;
  const index = Math.min(sortedMs.length - 1, Math.max(0, Math.ceil(fraction * sortedMs.length) - 1));
  return sortedMs[index] ?? 0;
}

export function summarizeTimings(input: {
  readonly target: string;
  readonly samplesMs: readonly number[];
  readonly tsMorph: string;
}): LoadTimingEntry {
  const sorted = [...input.samplesMs].sort((a, b) => a - b);
  return {
    target: input.target,
    medianMs: Math.round(percentile(sorted, 0.5) * 100) / 100,
    p95Ms: Math.round(percentile(sorted, 0.95) * 100) / 100,
    runs: input.samplesMs.length,
    node: process.version,
    tsMorph: input.tsMorph,
    datasetSchema: DATASET_SCHEMA_ID,
  };
}

/** Merge a timing entry (keyed by target) into the baseline JSON file. */
export async function appendLoadTimingEntry(baselinePath: string, entry: LoadTimingEntry): Promise<void> {
  let existing: LoadTimingEntry[] = [];
  try {
    existing = JSON.parse(await readFile(baselinePath, 'utf8')) as LoadTimingEntry[];
  } catch {
    existing = [];
  }
  const merged = [...existing.filter((item) => item.target !== entry.target), entry].sort((a, b) =>
    compareStrings(a.target, b.target),
  );
  await mkdir(dirname(baselinePath), { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
}

/** Count rows in a dataset table (used by rollback tests). */
export function countRows(dataset: Dataset, table: string): number {
  const rows = managedAll<{ n: number }>(dataset.db, `SELECT COUNT(*) AS n FROM ${table}`, []);
  return rows[0]?.n ?? 0;
}
