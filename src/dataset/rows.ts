import type { Dataset } from './open.js';
import { managedAll, managedGet, managedRun, type SqlParam } from './sqlite-runtime.js';

/**
 * Thin, typed row helpers for the `ts-codegraph.dataset@1` tables (step-02 §3).
 *
 * These are deliberately dumb: parametrized SQL only, no business logic, no query
 * builder, and no ORM abstraction. Every helper accepts and returns **public**
 * IDs (typed strings from `ids.ts` / `snapshot.ts`); SQLite numeric row ids do
 * not exist (the tables are `WITHOUT ROWID`) and are never surfaced. Steps 4-6
 * compose these inside `withDatasetTransaction`.
 */

function run(dataset: Dataset, sql: string, params: readonly SqlParam[]): number {
  return managedRun(dataset.db, sql, params);
}

function get<T>(dataset: Dataset, sql: string, params: readonly SqlParam[]): T | undefined {
  return managedGet<T>(dataset.db, sql, params);
}

function all<T>(dataset: Dataset, sql: string, params: readonly SqlParam[]): T[] {
  return managedAll<T>(dataset.db, sql, params);
}

// --- project ---------------------------------------------------------------

export interface ProjectRow {
  readonly id: string;
  readonly name: string;
}

export function insertProject(dataset: Dataset, row: ProjectRow): void {
  run(dataset, 'INSERT INTO project (id, name) VALUES (?, ?)', [row.id, row.name]);
}

export function selectProject(dataset: Dataset, id: string): ProjectRow | undefined {
  return get<ProjectRow>(dataset, 'SELECT id, name FROM project WHERE id = ?', [id]);
}

// --- snapshot --------------------------------------------------------------

export interface SnapshotRowInput {
  readonly id: string;
  readonly projectId: string;
  readonly kind: string;
  readonly baseCommit?: string;
  readonly includedFileCount: number;
  readonly dirtyFileCount?: number;
}

export interface SnapshotRow {
  readonly id: string;
  readonly projectId: string;
  readonly kind: string;
  readonly baseCommit: string | null;
  readonly includedFileCount: number;
  readonly dirtyFileCount: number | null;
}

export function insertSnapshot(dataset: Dataset, row: SnapshotRowInput): void {
  run(
    dataset,
    `INSERT INTO snapshot (id, project_id, kind, base_commit, included_file_count, dirty_file_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.projectId, row.kind, row.baseCommit, row.includedFileCount, row.dirtyFileCount],
  );
}

export function selectSnapshot(dataset: Dataset, id: string): SnapshotRow | undefined {
  return get<SnapshotRow>(
    dataset,
    `SELECT id, project_id AS projectId, kind, base_commit AS baseCommit,
            included_file_count AS includedFileCount, dirty_file_count AS dirtyFileCount
     FROM snapshot WHERE id = ?`,
    [id],
  );
}

// --- load_run --------------------------------------------------------------

export interface LoadRunRowInput {
  readonly id: string;
  readonly projectId: string;
  readonly snapshotId: string;
  readonly status: string;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly toolVersion?: string;
  readonly datasetSchemaVersion: number;
}

export interface LoadRunRow {
  readonly id: string;
  readonly projectId: string;
  readonly snapshotId: string;
  readonly status: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly toolVersion: string | null;
  readonly datasetSchemaVersion: number;
}

export function insertLoadRun(dataset: Dataset, row: LoadRunRowInput): void {
  run(
    dataset,
    `INSERT INTO load_run (id, project_id, snapshot_id, status, started_at, finished_at, tool_version, dataset_schema_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.projectId,
      row.snapshotId,
      row.status,
      row.startedAt,
      row.finishedAt,
      row.toolVersion,
      row.datasetSchemaVersion,
    ],
  );
}

export function selectLoadRun(dataset: Dataset, id: string): LoadRunRow | undefined {
  return get<LoadRunRow>(
    dataset,
    `SELECT id, project_id AS projectId, snapshot_id AS snapshotId, status,
            started_at AS startedAt, finished_at AS finishedAt, tool_version AS toolVersion,
            dataset_schema_version AS datasetSchemaVersion
     FROM load_run WHERE id = ?`,
    [id],
  );
}

// --- package ---------------------------------------------------------------

export interface PackageRowInput {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly version?: string;
  readonly manifestPath: string;
  readonly description?: string;
}

export interface PackageRow {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly version: string | null;
  readonly manifestPath: string;
  readonly description: string | null;
}

export function insertPackage(dataset: Dataset, row: PackageRowInput): void {
  run(
    dataset,
    `INSERT INTO package (id, project_id, name, version, manifest_path, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.projectId, row.name, row.version, row.manifestPath, row.description],
  );
}

export function selectPackage(dataset: Dataset, id: string): PackageRow | undefined {
  return get<PackageRow>(
    dataset,
    `SELECT id, project_id AS projectId, name, version, manifest_path AS manifestPath, description
     FROM package WHERE id = ?`,
    [id],
  );
}

// --- package_export --------------------------------------------------------

export interface PackageExportRowInput {
  readonly packageId: string;
  readonly exportPath: string;
  readonly symbolId?: string;
}

export interface PackageExportRow {
  readonly packageId: string;
  readonly exportPath: string;
  readonly symbolId: string | null;
}

export function insertPackageExport(dataset: Dataset, row: PackageExportRowInput): void {
  run(
    dataset,
    'INSERT INTO package_export (package_id, export_path, symbol_id) VALUES (?, ?, ?)',
    [row.packageId, row.exportPath, row.symbolId],
  );
}

export function selectPackageExports(dataset: Dataset, packageId: string): PackageExportRow[] {
  return all<PackageExportRow>(
    dataset,
    `SELECT package_id AS packageId, export_path AS exportPath, symbol_id AS symbolId
     FROM package_export WHERE package_id = ? ORDER BY export_path`,
    [packageId],
  );
}

// --- package_dependency ----------------------------------------------------

export interface PackageDependencyRowInput {
  readonly packageId: string;
  readonly dependencyName: string;
  readonly dependencyKind: string;
  readonly versionRange?: string;
}

export interface PackageDependencyRow {
  readonly packageId: string;
  readonly dependencyName: string;
  readonly dependencyKind: string;
  readonly versionRange: string | null;
}

export function insertPackageDependency(dataset: Dataset, row: PackageDependencyRowInput): void {
  run(
    dataset,
    `INSERT INTO package_dependency (package_id, dependency_name, dependency_kind, version_range)
     VALUES (?, ?, ?, ?)`,
    [row.packageId, row.dependencyName, row.dependencyKind, row.versionRange],
  );
}

export function selectPackageDependencies(
  dataset: Dataset,
  packageId: string,
): PackageDependencyRow[] {
  return all<PackageDependencyRow>(
    dataset,
    `SELECT package_id AS packageId, dependency_name AS dependencyName,
            dependency_kind AS dependencyKind, version_range AS versionRange
     FROM package_dependency WHERE package_id = ? ORDER BY dependency_name, dependency_kind`,
    [packageId],
  );
}

// --- source_file -----------------------------------------------------------

export interface SourceFileRowInput {
  readonly id: string;
  readonly snapshotId: string;
  readonly packageId?: string;
  readonly repoRelativePath: string;
  readonly contentHash: string;
}

export interface SourceFileRow {
  readonly id: string;
  readonly snapshotId: string;
  readonly packageId: string | null;
  readonly repoRelativePath: string;
  readonly contentHash: string;
}

export function insertSourceFile(dataset: Dataset, row: SourceFileRowInput): void {
  run(
    dataset,
    `INSERT INTO source_file (id, snapshot_id, package_id, repo_relative_path, content_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [row.id, row.snapshotId, row.packageId, row.repoRelativePath, row.contentHash],
  );
}

export function selectSourceFile(dataset: Dataset, id: string): SourceFileRow | undefined {
  return get<SourceFileRow>(
    dataset,
    `SELECT id, snapshot_id AS snapshotId, package_id AS packageId,
            repo_relative_path AS repoRelativePath, content_hash AS contentHash
     FROM source_file WHERE id = ?`,
    [id],
  );
}

// --- source_file_version ---------------------------------------------------

export interface SourceFileVersionRow {
  readonly id: string;
  readonly sourceFileId: string;
  readonly contentHash: string;
}

export function insertSourceFileVersion(dataset: Dataset, row: SourceFileVersionRow): void {
  run(
    dataset,
    'INSERT INTO source_file_version (id, source_file_id, content_hash) VALUES (?, ?, ?)',
    [row.id, row.sourceFileId, row.contentHash],
  );
}

export function selectSourceFileVersion(
  dataset: Dataset,
  id: string,
): SourceFileVersionRow | undefined {
  return get<SourceFileVersionRow>(
    dataset,
    `SELECT id, source_file_id AS sourceFileId, content_hash AS contentHash
     FROM source_file_version WHERE id = ?`,
    [id],
  );
}

// --- symbol ----------------------------------------------------------------

export interface SymbolRowInput {
  readonly id: string;
  readonly sourceFileVersionId: string;
  readonly packageId?: string;
  readonly kind: string;
  readonly name: string;
  readonly exported: boolean;
  readonly startLine: number;
  readonly endLine?: number;
  readonly startColumn?: number;
  readonly endColumn?: number;
}

export interface SymbolRow {
  readonly id: string;
  readonly sourceFileVersionId: string;
  readonly packageId: string | null;
  readonly kind: string;
  readonly name: string;
  readonly exported: boolean;
  readonly startLine: number;
  readonly endLine: number | null;
  readonly startColumn: number | null;
  readonly endColumn: number | null;
}

interface SymbolRowRaw extends Omit<SymbolRow, 'exported'> {
  readonly exported: number;
}

export function insertSymbol(dataset: Dataset, row: SymbolRowInput): void {
  run(
    dataset,
    `INSERT INTO symbol (id, source_file_version_id, package_id, kind, name, exported, start_line, end_line, start_column, end_column)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.sourceFileVersionId,
      row.packageId,
      row.kind,
      row.name,
      row.exported,
      row.startLine,
      row.endLine,
      row.startColumn,
      row.endColumn,
    ],
  );
}

export function selectSymbol(dataset: Dataset, id: string): SymbolRow | undefined {
  const raw = get<SymbolRowRaw>(
    dataset,
    `SELECT id, source_file_version_id AS sourceFileVersionId, package_id AS packageId,
            kind, name, exported, start_line AS startLine, end_line AS endLine,
            start_column AS startColumn, end_column AS endColumn
     FROM symbol WHERE id = ?`,
    [id],
  );
  if (raw === undefined) {
    return undefined;
  }
  return { ...raw, exported: raw.exported !== 0 };
}

// --- signature -------------------------------------------------------------

export interface SignatureRow {
  readonly id: string;
  readonly symbolId: string;
  readonly signatureText: string;
}

export function insertSignature(dataset: Dataset, row: SignatureRow): void {
  run(dataset, 'INSERT INTO signature (id, symbol_id, signature_text) VALUES (?, ?, ?)', [
    row.id,
    row.symbolId,
    row.signatureText,
  ]);
}

export function selectSignature(dataset: Dataset, id: string): SignatureRow | undefined {
  return get<SignatureRow>(
    dataset,
    'SELECT id, symbol_id AS symbolId, signature_text AS signatureText FROM signature WHERE id = ?',
    [id],
  );
}

// --- evidence --------------------------------------------------------------

export interface EvidenceRow {
  readonly id: string;
  readonly symbolId: string;
  readonly evidenceKind: string;
  readonly contentHash: string;
  readonly text: string;
}

export function insertEvidence(dataset: Dataset, row: EvidenceRow): void {
  run(
    dataset,
    'INSERT INTO evidence (id, symbol_id, evidence_kind, content_hash, text) VALUES (?, ?, ?, ?, ?)',
    [row.id, row.symbolId, row.evidenceKind, row.contentHash, row.text],
  );
}

export function selectEvidence(dataset: Dataset, id: string): EvidenceRow | undefined {
  return get<EvidenceRow>(
    dataset,
    `SELECT id, symbol_id AS symbolId, evidence_kind AS evidenceKind,
            content_hash AS contentHash, text
     FROM evidence WHERE id = ?`,
    [id],
  );
}

// --- diagnostic ------------------------------------------------------------

export interface DiagnosticRowInput {
  readonly id: string;
  readonly snapshotId: string;
  readonly loadRunId?: string;
  readonly code: string;
  readonly severity: string;
  readonly message: string;
  readonly locationKey?: string;
  readonly sourcePath?: string;
  readonly sourceLine?: number;
  readonly sourceEndLine?: number;
}

export interface DiagnosticRow {
  readonly id: string;
  readonly snapshotId: string;
  readonly loadRunId: string | null;
  readonly code: string;
  readonly severity: string;
  readonly message: string;
  readonly locationKey: string | null;
  readonly sourcePath: string | null;
  readonly sourceLine: number | null;
  readonly sourceEndLine: number | null;
}

export function insertDiagnostic(dataset: Dataset, row: DiagnosticRowInput): void {
  run(
    dataset,
    `INSERT INTO diagnostic (id, snapshot_id, load_run_id, code, severity, message, location_key, source_path, source_line, source_end_line)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.snapshotId,
      row.loadRunId,
      row.code,
      row.severity,
      row.message,
      row.locationKey,
      row.sourcePath,
      row.sourceLine,
      row.sourceEndLine,
    ],
  );
}

export function selectDiagnostic(dataset: Dataset, id: string): DiagnosticRow | undefined {
  return get<DiagnosticRow>(
    dataset,
    `SELECT id, snapshot_id AS snapshotId, load_run_id AS loadRunId, code, severity, message,
            location_key AS locationKey, source_path AS sourcePath,
            source_line AS sourceLine, source_end_line AS sourceEndLine
     FROM diagnostic WHERE id = ?`,
    [id],
  );
}

// --- search_document -------------------------------------------------------

export interface SearchDocumentRowInput {
  readonly id: string;
  readonly snapshotId: string;
  readonly symbolId: string;
  readonly packageName?: string;
  readonly symbolName: string;
  readonly kind: string;
  readonly qualifiedName?: string;
  readonly tokens: string;
}

export interface SearchDocumentRow {
  readonly id: string;
  readonly snapshotId: string;
  readonly symbolId: string;
  readonly packageName: string | null;
  readonly symbolName: string;
  readonly kind: string;
  readonly qualifiedName: string | null;
  readonly tokens: string;
}

export function insertSearchDocument(dataset: Dataset, row: SearchDocumentRowInput): void {
  run(
    dataset,
    `INSERT INTO search_document (id, snapshot_id, symbol_id, package_name, symbol_name, kind, qualified_name, tokens)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.snapshotId,
      row.symbolId,
      row.packageName,
      row.symbolName,
      row.kind,
      row.qualifiedName,
      row.tokens,
    ],
  );
}

export function selectSearchDocument(dataset: Dataset, id: string): SearchDocumentRow | undefined {
  return get<SearchDocumentRow>(
    dataset,
    `SELECT id, snapshot_id AS snapshotId, symbol_id AS symbolId, package_name AS packageName,
            symbol_name AS symbolName, kind, qualified_name AS qualifiedName, tokens
     FROM search_document WHERE id = ?`,
    [id],
  );
}

/**
 * Populate the FTS index for a search document. Kept separate from
 * `insertSearchDocument` so persistence and indexing stay independently callable;
 * this is index population, not query logic.
 */
export function indexSearchDocument(dataset: Dataset, row: SearchDocumentRowInput): void {
  run(
    dataset,
    `INSERT INTO search_document_fts (search_doc_id, symbol_id, package_name, symbol_name, qualified_name, tokens)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.symbolId, row.packageName, row.symbolName, row.qualifiedName, row.tokens],
  );
}

// --- generated_doc ---------------------------------------------------------

export interface GeneratedDocRow {
  readonly id: string;
  readonly snapshotId: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly conceptPath: string;
  readonly contentHash: string;
  readonly datasetSchemaVersion: number;
}

export function insertGeneratedDoc(dataset: Dataset, row: GeneratedDocRow): void {
  run(
    dataset,
    `INSERT INTO generated_doc (id, snapshot_id, template_id, template_version, concept_path, content_hash, dataset_schema_version)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.snapshotId,
      row.templateId,
      row.templateVersion,
      row.conceptPath,
      row.contentHash,
      row.datasetSchemaVersion,
    ],
  );
}

export function selectGeneratedDoc(dataset: Dataset, id: string): GeneratedDocRow | undefined {
  return get<GeneratedDocRow>(
    dataset,
    `SELECT id, snapshot_id AS snapshotId, template_id AS templateId,
            template_version AS templateVersion, concept_path AS conceptPath,
            content_hash AS contentHash, dataset_schema_version AS datasetSchemaVersion
     FROM generated_doc WHERE id = ?`,
    [id],
  );
}
