import {
  createDiagnostic,
  DiagnosticCodes,
  NORMALIZED_FIXTURE_TIMESTAMP,
  type Diagnostic,
} from '../contracts/index.js';
import { selectPackage, selectProject, selectSnapshot, type Dataset } from '../dataset/index.js';
import { managedAll } from '../dataset/sqlite-runtime.js';
import {
  API_REFERENCE_DTO_SCHEMA_ID,
  PACKAGE_OVERVIEW_DTO_SCHEMA_ID,
  apiReferenceDtoSchema,
  packageOverviewDtoSchema,
  type ApiReferenceDto,
  type PackageOverviewDto,
} from './dto.js';

export * from './dto.js';

/**
 * Runtime-validated projection DTOs (step-06 §3, task 2).
 *
 * `buildPackageOverviewDto` / `buildApiReferenceDto` read the loaded dataset with
 * explicitly ordered queries, assemble a plain-JSON DTO, and validate it against
 * its Zod schema **before any render**. Absent optional facts collapse a section's
 * `present` flag; absent required facts return a `skip` decision with a stable
 * diagnostic. No `src/extractor` import; no write helper.
 */

export interface ProjectionOptions {
  /** Normalized timestamp for the DTO meta (default: the fixture timestamp). */
  readonly normalizedTimestamp?: string;
  readonly toolVersion?: string;
  readonly templateVersion?: string;
}

export type ProjectionOutcome<T> =
  | { readonly status: 'ok'; readonly dto: T }
  | { readonly status: 'skip'; readonly diagnostics: readonly Diagnostic[] };

const DATASET_SCHEMA_VERSION_LITERAL = 'ts-codegraph.dataset@1' as const;
const DEFAULT_TOOL_VERSION = '0.0.0';
const DEFAULT_TEMPLATE_VERSION = '1';

function requiredFactMissing(message: string): ProjectionOutcome<never> {
  return {
    status: 'skip',
    diagnostics: [
      createDiagnostic({
        code: DiagnosticCodes.GENERATE_REQUIRED_FACT_MISSING,
        severity: 'error',
        message,
      }),
    ],
  };
}

function dtoInvalid(schemaId: string, issueCount: number): ProjectionOutcome<never> {
  return {
    status: 'skip',
    diagnostics: [
      createDiagnostic({
        code: DiagnosticCodes.GENERATE_DTO_INVALID,
        severity: 'error',
        message: 'Projection produced a DTO that failed schema validation.',
        safeDetail: { schema: schemaId, issueCount },
      }),
    ],
  };
}

function makeSection<T>(items: readonly T[]): { present: boolean; items: T[] } {
  return { present: items.length > 0, items: [...items] };
}

interface CommonFacts {
  readonly project: { id: string; name: string };
  readonly repository: PackageOverviewDto['repository'];
  readonly pkg: PackageOverviewDto['pkg'];
  readonly meta: (templateId: string) => PackageOverviewDto['meta'];
}

interface DependencyRow {
  readonly dependency_name: string;
  readonly dependency_kind: string;
  readonly version_range: string | null;
}
interface ExportRow {
  readonly export_path: string;
}
interface DiagnosticFactRow {
  readonly code: string;
  readonly severity: string;
  readonly message: string;
}
interface EvidenceFactRow {
  readonly symbol_id: string;
  readonly symbol_name: string;
  readonly kind: string;
  readonly text: string;
}

/** Load and shape the facts shared by both DTOs; `undefined` when a required fact is missing. */
function loadCommonFacts(
  dataset: Dataset,
  packageId: string,
  snapshotId: string,
  options: ProjectionOptions,
): CommonFacts | undefined {
  const pkg = selectPackage(dataset, packageId);
  if (pkg === undefined) return undefined;
  const project = selectProject(dataset, pkg.projectId);
  if (project === undefined) return undefined;
  const snapshot = selectSnapshot(dataset, snapshotId);
  if (snapshot === undefined) return undefined;

  const dependencies = managedAll<DependencyRow>(
    dataset.db,
    'SELECT dependency_name, dependency_kind, version_range FROM package_dependency WHERE package_id = ? ORDER BY dependency_name, dependency_kind',
    [packageId],
  ).map((row) => ({
    name: row.dependency_name,
    kind: row.dependency_kind === 'dev' ? ('dev' as const) : ('runtime' as const),
    ...(row.version_range !== null ? { versionRange: row.version_range } : {}),
  }));

  const normalizedTimestamp = options.normalizedTimestamp ?? NORMALIZED_FIXTURE_TIMESTAMP;
  const toolVersion = options.toolVersion ?? DEFAULT_TOOL_VERSION;
  const templateVersion = options.templateVersion ?? DEFAULT_TEMPLATE_VERSION;

  return {
    project: { id: project.id, name: project.name },
    repository: {
      snapshotId: snapshot.id,
      kind: snapshot.kind as PackageOverviewDto['repository']['kind'],
      ...(snapshot.baseCommit !== null ? { baseCommit: snapshot.baseCommit } : {}),
    },
    pkg: {
      id: pkg.id,
      name: pkg.name,
      ...(pkg.version !== null ? { version: pkg.version } : {}),
      manifestPath: pkg.manifestPath,
      ...(pkg.description !== null ? { description: pkg.description } : {}),
      dependencies,
    },
    meta: (templateId: string) => ({
      snapshotId: snapshot.id,
      datasetSchemaVersion: DATASET_SCHEMA_VERSION_LITERAL,
      generatedTimestamp: normalizedTimestamp,
      toolVersion,
      templateId,
      templateVersion,
    }),
  };
}

function loadExports(dataset: Dataset, packageId: string): { exportPath: string }[] {
  return managedAll<ExportRow>(
    dataset.db,
    'SELECT export_path FROM package_export WHERE package_id = ? ORDER BY export_path',
    [packageId],
  ).map((row) => ({ exportPath: row.export_path }));
}

function loadDiagnostics(dataset: Dataset, snapshotId: string) {
  return managedAll<DiagnosticFactRow>(
    dataset.db,
    'SELECT code, severity, message FROM diagnostic WHERE snapshot_id = ? ORDER BY code, id',
    [snapshotId],
  ).map((row) => ({
    code: row.code,
    severity: row.severity as 'error' | 'warning' | 'info',
    message: row.message,
  }));
}

function loadEvidence(dataset: Dataset, packageId: string) {
  return managedAll<EvidenceFactRow>(
    dataset.db,
    `SELECT e.symbol_id AS symbol_id, s.name AS symbol_name, s.kind AS kind, e.text AS text
     FROM evidence e
     JOIN symbol s ON s.id = e.symbol_id
     JOIN source_file_version sfv ON sfv.id = s.source_file_version_id
     JOIN source_file sf ON sf.id = sfv.source_file_id
     WHERE s.package_id = ? ORDER BY s.name, sf.repo_relative_path, s.start_line, e.id`,
    [packageId],
  ).map((row) => ({ symbolId: row.symbol_id, symbolName: row.symbol_name, kind: row.kind, text: row.text }));
}

export function buildPackageOverviewDto(
  dataset: Dataset,
  packageId: string,
  snapshotId: string,
  options: ProjectionOptions = {},
): ProjectionOutcome<PackageOverviewDto> {
  const common = loadCommonFacts(dataset, packageId, snapshotId, options);
  if (common === undefined) {
    return requiredFactMissing('Package, project, or snapshot fact is missing for the overview.');
  }

  const symbols = managedAll<{ id: string; name: string; kind: string }>(
    dataset.db,
    `SELECT s.id, s.name, s.kind
     FROM symbol s
     JOIN source_file_version sfv ON sfv.id = s.source_file_version_id
     JOIN source_file sf ON sf.id = sfv.source_file_id
     WHERE s.package_id = ? ORDER BY s.name, s.kind, sf.repo_relative_path, s.start_line, s.id`,
    [packageId],
  );

  const dto: PackageOverviewDto = {
    project: common.project,
    repository: common.repository,
    pkg: common.pkg,
    exports: makeSection(loadExports(dataset, packageId)),
    symbols: makeSection(symbols),
    diagnostics: makeSection(loadDiagnostics(dataset, snapshotId)),
    evidence: makeSection(loadEvidence(dataset, packageId)),
    meta: common.meta(PACKAGE_OVERVIEW_DTO_SCHEMA_ID),
  };

  const parsed = packageOverviewDtoSchema.safeParse(dto);
  if (!parsed.success) {
    return dtoInvalid(PACKAGE_OVERVIEW_DTO_SCHEMA_ID, parsed.error.issues.length);
  }
  return { status: 'ok', dto: parsed.data };
}

interface ApiSymbolRow {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly start_line: number;
  readonly end_line: number | null;
  readonly signature_text: string;
  readonly repo_relative_path: string;
}

export function buildApiReferenceDto(
  dataset: Dataset,
  packageId: string,
  snapshotId: string,
  options: ProjectionOptions = {},
): ProjectionOutcome<ApiReferenceDto> {
  const common = loadCommonFacts(dataset, packageId, snapshotId, options);
  if (common === undefined) {
    return requiredFactMissing('Package, project, or snapshot fact is missing for the API reference.');
  }

  const symbolRows = managedAll<ApiSymbolRow>(
    dataset.db,
    `SELECT s.id AS id, s.name AS name, s.kind AS kind, s.start_line AS start_line, s.end_line AS end_line,
            sig.signature_text AS signature_text, sf.repo_relative_path AS repo_relative_path
     FROM symbol s
     JOIN signature sig ON sig.symbol_id = s.id
     JOIN source_file_version sfv ON sfv.id = s.source_file_version_id
     JOIN source_file sf ON sf.id = sfv.source_file_id
     WHERE s.package_id = ? ORDER BY s.name, s.kind, sf.repo_relative_path, s.start_line, s.id`,
    [packageId],
  );
  if (symbolRows.length === 0) {
    return requiredFactMissing('No exported symbols with signatures to document in the API reference.');
  }

  const evidenceBySymbol = new Map<string, string>();
  for (const item of loadEvidence(dataset, packageId)) {
    if (!evidenceBySymbol.has(item.symbolId)) {
      evidenceBySymbol.set(item.symbolId, item.text);
    }
  }

  const symbols = symbolRows.map((row) => {
    const evidenceText = evidenceBySymbol.get(row.id);
    return {
      id: row.id,
      name: row.name,
      kind: row.kind,
      signatureText: row.signature_text,
      sourceRef: {
        path: row.repo_relative_path,
        startLine: row.start_line,
        endLine: row.end_line ?? row.start_line,
      },
      evidence:
        evidenceText !== undefined ? { present: true, text: evidenceText } : { present: false, text: '' },
    };
  });

  const dto: ApiReferenceDto = {
    project: common.project,
    repository: common.repository,
    pkg: common.pkg,
    exports: makeSection(loadExports(dataset, packageId)),
    symbols: makeSection(symbols),
    diagnostics: makeSection(loadDiagnostics(dataset, snapshotId)),
    evidence: makeSection(loadEvidence(dataset, packageId)),
    meta: common.meta(API_REFERENCE_DTO_SCHEMA_ID),
  };

  const parsed = apiReferenceDtoSchema.safeParse(dto);
  if (!parsed.success) {
    return dtoInvalid(API_REFERENCE_DTO_SCHEMA_ID, parsed.error.issues.length);
  }
  return { status: 'ok', dto: parsed.data };
}
