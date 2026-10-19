import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  DATASET_MIGRATIONS,
  DATASET_SCHEMA_ID,
  DATASET_SCHEMA_VERSION,
  DATASET_TABLES,
  FORBIDDEN_TABLES,
  SEARCH_DOCUMENT_FTS_TABLE,
  assertDatasetPathContained,
  buildDiagnosticId,
  buildEvidenceId,
  buildGeneratedDocId,
  buildPackageId,
  buildProjectId,
  buildSearchDocId,
  buildSignatureId,
  buildSourceFileId,
  buildSourceFileVersionId,
  buildSymbolId,
  closeDataset,
  DatasetContainmentError,
  indexSearchDocument,
  insertDiagnostic,
  insertEvidence,
  insertGeneratedDoc,
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
  openDataset,
  projectDirKey,
  resolveDatasetPaths,
  selectDiagnostic,
  selectEvidence,
  selectGeneratedDoc,
  selectLoadRun,
  selectPackage,
  selectPackageDependencies,
  selectPackageExports,
  selectProject,
  selectSearchDocument,
  selectSignature,
  selectSnapshot,
  selectSourceFile,
  selectSourceFileVersion,
  selectSymbol,
  withDatasetTransaction,
  type Dataset,
} from '../../src/dataset/index.js';
import {
  managedAll,
  openManagedDatabase,
  runManagedMigrations,
} from '../../src/dataset/sqlite-runtime.js';

const PROJECT_ID = buildProjectId('acme/widgets');
const SNAPSHOT_ID = `snapshot:v1:${PROJECT_ID}:git:${'a'.repeat(40)}`;

function tableNames(dataset: Dataset): string[] {
  return managedAll<{ name: string }>(
    dataset.db,
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    [],
  ).map((row) => row.name);
}

describe('ts-codegraph dataset schema and migration', () => {
  let base: string;

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'ts-codegraph-dataset-'));
  });

  afterEach(async () => {
    await rm(base, { recursive: true, force: true });
  });

  it('creates every required Now table on a clean dataset', async () => {
    const dataset = await openDataset(PROJECT_ID, { create: true, dataDirOverride: base });
    const names = tableNames(dataset);
    for (const table of DATASET_TABLES) {
      expect(names).toContain(table);
    }
    // The migration version table exists from day one.
    expect(names).toContain('_migrations');
    // The FTS virtual table exists.
    expect(names).toContain(SEARCH_DOCUMENT_FTS_TABLE);
    closeDataset(dataset);
  });

  it('creates no speculative Next/Later tables', async () => {
    const dataset = await openDataset(PROJECT_ID, { create: true, dataDirOverride: base });
    const names = tableNames(dataset);
    for (const forbidden of FORBIDDEN_TABLES) {
      expect(names).not.toContain(forbidden);
    }
    closeDataset(dataset);
  });

  it('runs the migration set idempotently', () => {
    const db = openManagedDatabase({ path: ':memory:' });
    const first = runManagedMigrations(db, DATASET_MIGRATIONS);
    expect(first).toEqual({ applied: 1, skipped: 0 });
    const second = runManagedMigrations(db, DATASET_MIGRATIONS);
    expect(second).toEqual({ applied: 0, skipped: 1 });
    db.close();
  });

  it('re-opens an existing dataset as a no-op that preserves data', async () => {
    const first = await openDataset(PROJECT_ID, { create: true, dataDirOverride: base });
    insertProject(first, { id: PROJECT_ID, name: 'acme/widgets' });
    const tablesAfterCreate = tableNames(first).sort();
    closeDataset(first);

    const second = await openDataset(PROJECT_ID, { create: true, dataDirOverride: base });
    expect(tableNames(second).sort()).toEqual(tablesAfterCreate);
    expect(selectProject(second, PROJECT_ID)).toEqual({ id: PROJECT_ID, name: 'acme/widgets' });
    closeDataset(second);
  });

  it('exposes the dataset schema identity', () => {
    expect(DATASET_SCHEMA_ID).toBe('ts-codegraph.dataset@1');
    expect(DATASET_SCHEMA_VERSION).toBe(1);
  });
});

describe('ts-codegraph dataset location and containment', () => {
  let base: string;

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'ts-codegraph-dataset-'));
  });

  afterEach(async () => {
    await rm(base, { recursive: true, force: true });
  });

  it('resolves the dataset path inside the app-paths boundary', () => {
    const paths = resolveDatasetPaths(PROJECT_ID, { dataDirOverride: base });
    expect(paths.datasetDir.startsWith(paths.dataDir)).toBe(true);
    expect(paths.dbPath.startsWith(paths.datasetDir)).toBe(true);
    // The database lives under the override, never in a repo-local path.
    expect(paths.dbPath.startsWith(base)).toBe(true);
    expect(paths.dbPath.endsWith('dataset.db')).toBe(true);
  });

  it('derives a filesystem-safe key that keeps a colon-bearing id path-safe', () => {
    const key = projectDirKey(PROJECT_ID);
    expect(key).not.toContain(':');
    expect(key).not.toContain('/');
    expect(key).toMatch(/^[a-zA-Z0-9._-]+$/);
  });

  it('rejects a project id containing path traversal', () => {
    expect(() => projectDirKey('../escape')).toThrow(/traversal/);
  });

  it('surfaces a containment failure as a safe diagnostic with no path', () => {
    try {
      assertDatasetPathContained('/etc/passwd', join(base, 'boundary'));
      expect.unreachable('expected a containment error');
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetContainmentError);
      const diagnostic = (error as DatasetContainmentError).diagnostic;
      expect(diagnostic.code).toBe('SAFETY_PATH_ESCAPE');
      expect(diagnostic.severity).toBe('error');
      expect(diagnostic.message).not.toContain('/etc/passwd');
      expect(diagnostic.message).not.toContain('/');
    }
  });
});

describe('ts-codegraph dataset row helpers', () => {
  let base: string;
  let dataset: Dataset;

  const packageId = buildPackageId({
    projectId: PROJECT_ID,
    packageName: '@acme/widgets',
    manifestPath: 'packages/widgets/package.json',
  });
  const sourceFileId = buildSourceFileId({
    snapshotId: SNAPSHOT_ID,
    repoRelativePath: 'packages/widgets/src/index.ts',
  });
  const sourceFileVersionId = buildSourceFileVersionId({
    sourceFileId,
    contentHash: 'c'.repeat(64),
  });
  const symbolId = buildSymbolId({
    sourceFileVersionId,
    kind: 'function',
    name: 'makeWidget',
    startLine: 12,
  });
  const signatureId = buildSignatureId({
    symbolId,
    signatureText: 'export function makeWidget(): Widget',
  });
  const evidenceId = buildEvidenceId({
    symbolId,
    evidenceKind: 'jsdoc',
    contentHash: 'd'.repeat(64),
  });
  const diagnosticId = buildDiagnosticId({
    snapshotId: SNAPSHOT_ID,
    code: 'LOAD_ID_COLLISION',
    locationKey: 'packages/widgets/src/index.ts:12',
  });
  const searchDocId = buildSearchDocId({ snapshotId: SNAPSHOT_ID, symbolId });
  const generatedDocId = buildGeneratedDocId({
    snapshotId: SNAPSHOT_ID,
    templateId: 'api-reference',
    templateVersion: '1',
    conceptPath: 'packages/widgets/api-reference.md',
    contentHash: 'e'.repeat(64),
  });
  const loadRunId = `load-run:v1:${SNAPSHOT_ID}:0001`;

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'ts-codegraph-dataset-'));
    dataset = await openDataset(PROJECT_ID, { create: true, dataDirOverride: base });

    withDatasetTransaction(dataset, () => {
      insertProject(dataset, { id: PROJECT_ID, name: 'acme/widgets' });
      insertSnapshot(dataset, {
        id: SNAPSHOT_ID,
        projectId: PROJECT_ID,
        kind: 'git-clean',
        baseCommit: 'a'.repeat(40),
        includedFileCount: 1,
      });
      insertLoadRun(dataset, {
        id: loadRunId,
        projectId: PROJECT_ID,
        snapshotId: SNAPSHOT_ID,
        status: 'succeeded',
        startedAt: '2026-07-06T00:00:00.000Z',
        datasetSchemaVersion: DATASET_SCHEMA_VERSION,
      });
      insertPackage(dataset, {
        id: packageId,
        projectId: PROJECT_ID,
        name: '@acme/widgets',
        version: '1.0.0',
        manifestPath: 'packages/widgets/package.json',
      });
      insertSourceFile(dataset, {
        id: sourceFileId,
        snapshotId: SNAPSHOT_ID,
        packageId,
        repoRelativePath: 'packages/widgets/src/index.ts',
        contentHash: 'c'.repeat(64),
      });
      insertSourceFileVersion(dataset, {
        id: sourceFileVersionId,
        sourceFileId,
        contentHash: 'c'.repeat(64),
      });
      insertSymbol(dataset, {
        id: symbolId,
        sourceFileVersionId,
        packageId,
        kind: 'function',
        name: 'makeWidget',
        exported: true,
        startLine: 12,
        endLine: 20,
      });
      insertSignature(dataset, {
        id: signatureId,
        symbolId,
        signatureText: 'export function makeWidget(): Widget',
      });
      insertEvidence(dataset, {
        id: evidenceId,
        symbolId,
        evidenceKind: 'jsdoc',
        contentHash: 'd'.repeat(64),
        text: 'Builds a widget.',
      });
      insertPackageExport(dataset, { packageId, exportPath: '.', symbolId });
      insertPackageDependency(dataset, {
        packageId,
        dependencyName: '@acme/core',
        dependencyKind: 'runtime',
        versionRange: '^1.0.0',
      });
      insertDiagnostic(dataset, {
        id: diagnosticId,
        snapshotId: SNAPSHOT_ID,
        loadRunId,
        code: 'LOAD_ID_COLLISION',
        severity: 'warning',
        message: 'collision resolved',
        locationKey: 'packages/widgets/src/index.ts:12',
      });
      insertSearchDocument(dataset, {
        id: searchDocId,
        snapshotId: SNAPSHOT_ID,
        symbolId,
        packageName: '@acme/widgets',
        symbolName: 'makeWidget',
        kind: 'function',
        qualifiedName: '@acme/widgets/makeWidget',
        tokens: 'make widget makeWidget',
      });
      indexSearchDocument(dataset, {
        id: searchDocId,
        snapshotId: SNAPSHOT_ID,
        symbolId,
        packageName: '@acme/widgets',
        symbolName: 'makeWidget',
        kind: 'function',
        qualifiedName: '@acme/widgets/makeWidget',
        tokens: 'make widget makeWidget',
      });
      insertGeneratedDoc(dataset, {
        id: generatedDocId,
        snapshotId: SNAPSHOT_ID,
        templateId: 'api-reference',
        templateVersion: '1',
        conceptPath: 'packages/widgets/api-reference.md',
        contentHash: 'e'.repeat(64),
        datasetSchemaVersion: DATASET_SCHEMA_VERSION,
      });
    });
  });

  afterEach(async () => {
    closeDataset(dataset);
    await rm(base, { recursive: true, force: true });
  });

  it('inserts and selects every table by public ID', () => {
    expect(selectProject(dataset, PROJECT_ID)?.id).toBe(PROJECT_ID);
    expect(selectSnapshot(dataset, SNAPSHOT_ID)?.kind).toBe('git-clean');
    expect(selectLoadRun(dataset, loadRunId)?.status).toBe('succeeded');
    expect(selectPackage(dataset, packageId)?.name).toBe('@acme/widgets');
    expect(selectSourceFile(dataset, sourceFileId)?.repoRelativePath).toBe(
      'packages/widgets/src/index.ts',
    );
    expect(selectSourceFileVersion(dataset, sourceFileVersionId)?.contentHash).toBe('c'.repeat(64));
    expect(selectSignature(dataset, signatureId)?.signatureText).toContain('makeWidget');
    expect(selectEvidence(dataset, evidenceId)?.text).toBe('Builds a widget.');
    expect(selectDiagnostic(dataset, diagnosticId)?.code).toBe('LOAD_ID_COLLISION');
    expect(selectSearchDocument(dataset, searchDocId)?.symbolName).toBe('makeWidget');
    expect(selectGeneratedDoc(dataset, generatedDocId)?.conceptPath).toBe(
      'packages/widgets/api-reference.md',
    );
  });

  it('round-trips the exported boolean as a real boolean', () => {
    const symbol = selectSymbol(dataset, symbolId);
    expect(symbol?.exported).toBe(true);
    expect(typeof symbol?.exported).toBe('boolean');
  });

  it('selects junction rows by package id', () => {
    const exports = selectPackageExports(dataset, packageId);
    expect(exports).toEqual([{ packageId, exportPath: '.', symbolId }]);
    const deps = selectPackageDependencies(dataset, packageId);
    expect(deps).toHaveLength(1);
    expect(deps[0]?.dependencyName).toBe('@acme/core');
  });

  it('never surfaces a numeric SQLite row id from a select helper', () => {
    const project = selectProject(dataset, PROJECT_ID);
    expect(project && Object.keys(project).sort()).toEqual(['id', 'name']);
    const symbol = selectSymbol(dataset, symbolId);
    expect(symbol && 'rowid' in symbol).toBe(false);
    expect(typeof project?.id).toBe('string');
  });

  it('has no addressable numeric row id (WITHOUT ROWID tables)', () => {
    for (const table of DATASET_TABLES) {
      expect(() => managedAll(dataset.db, `SELECT rowid FROM ${table} LIMIT 1`, [])).toThrow(
        /no such column: rowid/,
      );
    }
  });

  it('indexes the search document into FTS for a MATCH query', () => {
    const rows = managedAll<{ search_doc_id: string }>(
      dataset.db,
      'SELECT search_doc_id FROM search_document_fts WHERE search_document_fts MATCH ?',
      ['widget'],
    );
    expect(rows.map((row) => row.search_doc_id)).toContain(searchDocId);
  });
});
