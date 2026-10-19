import { access, readFile, stat } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { constants as fsConstants } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { AppError, ERROR_CODES, getCliExitCodeForError } from '../internal/errors/index.js';
import { discoverWorkspace, readPackageManifest, findTsconfigFiles, summarizeGitState } from '../internal/repo-inventory/index.js';
import { validateSourceFilePolicy, type SourceFilePolicy } from '../internal/source-files/index.js';
import {
  createRedactor,
  createSafePathPolicy,
  redactValue,
  type Redactor,
  type SafePathPolicy,
} from '../internal/security/index.js';

import {
  createDiagnostic,
  DiagnosticCodes,
  parseCheckEnvelope,
  templatePackManifestSchema,
  type CheckData,
  type CheckEnvelope,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticSeverity,
} from '../contracts/index.js';
import { buildProjectId } from '../dataset/ids.js';
import { resolveDatasetPaths } from '../dataset/open.js';
import { DATASET_SCHEMA_ID } from '../dataset/schema.js';
import { checkManagedDatabaseHealth } from '../dataset/sqlite-runtime.js';

/**
 * `ts-codegraph check` — the strict, zero-mutation preflight (step-03 §3).
 *
 * This module owns the eight ordered gates and assembles a validated
 * `ts-codegraph.check@1` envelope with `willWrite: false`. It reads everything it
 * needs and writes nothing: no dataset creation, no migration, no directory
 * creation (`ensureAppPath` is never called), no writes to `--output`. When a
 * dataset already exists its health is read through an immutable
 * (`file:…?immutable=1`) open that creates no WAL sidecars, so the app-managed
 * directory is never touched. Every path that
 * enters a diagnostic is reduced to a repo-relative or app-path-relative label
 * through `@codegraph/security`; absolute paths never appear in output.
 *
 * There is no write-capable import in this file (no row-insert helpers, no write
 * plans, no `ensureAppPath`), so no code path can mutate the filesystem.
 */

/** Tool version stamped into the envelope meta. */
export const CHECK_TOOL_VERSION = '0.0.0';

/** Default template pack name when `--template-pack` is omitted. */
export const DEFAULT_TEMPLATE_PACK = 'default';

/** Manifest filename inside a template pack directory. */
export const TEMPLATE_PACK_MANIFEST_FILE = 'manifest.json';

/**
 * The Now source-traversal policy `load` will use. `check` validates it for
 * self-consistency (gate 5); it is deliberately fixed and small.
 */
export const NOW_TRAVERSAL_POLICY: SourceFilePolicy = {
  includeExtensions: ['.ts', '.tsx'],
  maxFileCount: 50_000,
  maxFileSizeBytes: 1_048_576,
  maxReadBytes: 1_048_576,
  allowSymlinks: false,
  gitignore: true,
  defaultIgnores: true,
  extraIgnorePatterns: ['test', 'tests', '__tests__', 'scripts'],
};

/**
 * Default location of the ts-codegraph-provided template packs, resolved relative to
 * this module so it is stable in both `src` and `dist`. Tests override it; Row 7
 * populates the real packs. Until then a production `check --template-pack
 * default` correctly reports the pack is not yet present.
 */
export const DEFAULT_TEMPLATE_PACKS_DIR = fileURLToPath(
  new URL('../../templates/packs', import.meta.url),
);

/** The eight preflight gate ids, in their fixed order. */
export const CHECK_GATE_IDS = [
  'project-path',
  'repository-discovery',
  'tsconfig-presence',
  'git-state',
  'traversal-policy',
  'dataset-readiness',
  'template-pack',
  'output-strategy',
] as const;

export type CheckGateId = (typeof CHECK_GATE_IDS)[number];

type PreflightCheck = CheckData['preflightChecks'][number];
type GateStatus = PreflightCheck['status'];
type TemplateReadiness = CheckData['templateReadiness'];
type DatabaseReadiness = CheckData['databaseReadiness'];

export interface RunCheckOptions {
  /** Target project path (`--project`). Resolved to an absolute path internally. */
  readonly projectPath: string;
  /** Template pack name (`--template-pack`). Defaults to `default`. */
  readonly templatePack?: string;
  /** Output directory (`--output`). Checked only; never created. */
  readonly outputDir?: string;
  /** Override the app-managed data directory (tests only). */
  readonly dataDirOverride?: string;
  /** Override the template packs root (tests only). */
  readonly templatePacksDir?: string;
  /** Normalized envelope timestamp. Defaults to the current time. */
  readonly timestamp?: string;
}

export interface CheckOutcome {
  readonly envelope: CheckEnvelope;
  /** `true` when no gate failed (warnings still count as success). */
  readonly ok: boolean;
  /** POSIX exit code (0 on success, `validation` mapping otherwise). */
  readonly exitCode: number;
}

/** A path-label helper bound to the project root plus a secret redactor. */
interface Redaction {
  readonly redactor: Redactor;
  readonly projectPolicy: SafePathPolicy | undefined;
}

function toBoundedText(redaction: Redaction, value: string): string {
  return redactValue(redaction.redactor, value).value.slice(0, 200);
}

/**
 * Exit code for a failed preflight, derived from the shared `validation`
 * category mapping (`getCliExitCodeForError`) rather than hard-coded.
 */
const PREFLIGHT_FAIL_EXIT_CODE = getCliExitCodeForError(
  new AppError({ code: ERROR_CODES.VALIDATION, category: 'validation', title: 'preflight failed' }),
);

function makeDiagnostic(
  code: DiagnosticCode,
  severity: DiagnosticSeverity,
  message: string,
  extra?: { readonly safeDetail?: Record<string, string | number | boolean | null>; readonly suggestedAction?: string },
): Diagnostic {
  return createDiagnostic({
    code,
    severity,
    message,
    ...(extra?.safeDetail !== undefined ? { safeDetail: extra.safeDetail } : {}),
    ...(extra?.suggestedAction !== undefined ? { suggestedAction: extra.suggestedAction } : {}),
  });
}

function gate(id: CheckGateId, label: string, status: GateStatus, diagnostics: Diagnostic[]): PreflightCheck {
  return { id, label, status, diagnostics };
}

function skipGate(id: CheckGateId, label: string, reason: string): PreflightCheck {
  return gate(id, label, 'skip', [
    makeDiagnostic(DiagnosticCodes.CHECK_PROJECT_NOT_FOUND, 'info', reason),
  ]);
}

async function pathExists(target: string): Promise<{ exists: boolean; isDirectory: boolean }> {
  try {
    const stats = await stat(target);
    return { exists: true, isDirectory: stats.isDirectory() };
  } catch {
    return { exists: false, isDirectory: false };
  }
}

async function isReadable(target: string): Promise<boolean> {
  try {
    await access(target, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

// --- Gate 1: project path --------------------------------------------------

interface ProjectGateResult {
  readonly check: PreflightCheck;
  readonly ready: boolean;
  readonly projectRoot: string;
  readonly projectPolicy: SafePathPolicy | undefined;
}

async function gateProjectPath(projectRoot: string, redaction: Redaction): Promise<ProjectGateResult> {
  const label = 'Project path';
  const id: CheckGateId = 'project-path';

  if (redaction.projectPolicy === undefined) {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_PROJECT_UNSAFE, 'error', 'Project path is not a safe path.', {
          suggestedAction: 'Pass a --project path without control characters.',
        }),
      ]),
      ready: false,
      projectRoot,
      projectPolicy: undefined,
    };
  }

  const { exists, isDirectory } = await pathExists(projectRoot);
  if (!exists) {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_PROJECT_NOT_FOUND, 'error', 'Project path does not exist.', {
          suggestedAction: 'Pass an existing directory to --project.',
        }),
      ]),
      ready: false,
      projectRoot,
      projectPolicy: redaction.projectPolicy,
    };
  }
  if (!isDirectory) {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_PROJECT_NOT_FOUND, 'error', 'Project path is not a directory.', {
          suggestedAction: 'Pass a directory to --project, not a file.',
        }),
      ]),
      ready: false,
      projectRoot,
      projectPolicy: redaction.projectPolicy,
    };
  }
  if (!(await isReadable(projectRoot))) {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_PROJECT_UNREADABLE, 'error', 'Project path is not readable.', {
          suggestedAction: 'Grant read access to the project directory.',
        }),
      ]),
      ready: false,
      projectRoot,
      projectPolicy: redaction.projectPolicy,
    };
  }

  return {
    check: gate(id, label, 'pass', []),
    ready: true,
    projectRoot,
    projectPolicy: redaction.projectPolicy,
  };
}

// --- Gate 2: repository discovery ------------------------------------------

interface RepositoryGateResult {
  readonly check: PreflightCheck;
  readonly projectKey: string;
}

async function gateRepositoryDiscovery(projectRoot: string, redaction: Redaction): Promise<RepositoryGateResult> {
  const label = 'Repository discovery';
  const id: CheckGateId = 'repository-discovery';
  const fallbackKey = basename(projectRoot) || 'project';

  let manifestName: string | undefined;
  try {
    const manifest = await readPackageManifest(join(projectRoot, 'package.json'), projectRoot);
    manifestName = manifest.name;
  } catch {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(
          DiagnosticCodes.CHECK_PACKAGE_MANIFEST_MISSING,
          'error',
          'No readable package.json found at the project root.',
          {
            suggestedAction: 'Point --project at a package or workspace root that contains package.json.',
          },
        ),
      ]),
      projectKey: fallbackKey,
    };
  }

  // Workspace inventory is informational (workspace kind and package count).
  let packageCount = 0;
  let workspaceKind = 'none';
  try {
    const workspace = await discoverWorkspace(projectRoot);
    packageCount = workspace.packages.length;
    workspaceKind = workspace.kind;
  } catch {
    // A workspace scan failure is not fatal for the preflight; the root manifest
    // already established a documentable package.
    packageCount = 0;
    workspaceKind = 'none';
  }

  const diagnostics: Diagnostic[] = [];
  if (manifestName === undefined) {
    diagnostics.push(
      makeDiagnostic(
        DiagnosticCodes.CHECK_PACKAGE_MANIFEST_MISSING,
        'info',
        'Root package.json has no name; using the directory name as the project key.',
      ),
    );
  }

  return {
    check: gate(id, label, 'pass', [
      makeDiagnostic(DiagnosticCodes.CHECK_PACKAGE_MANIFEST_MISSING, 'info', 'Repository discovery succeeded.', {
        safeDetail: { workspaceKind: toBoundedText(redaction, workspaceKind), packageCount },
      }),
      ...diagnostics,
    ]),
    projectKey: manifestName ?? fallbackKey,
  };
}

// --- Gate 3: tsconfig presence ---------------------------------------------

async function gateTsconfigPresence(projectRoot: string): Promise<PreflightCheck> {
  const label = 'TypeScript config presence';
  const id: CheckGateId = 'tsconfig-presence';
  let tsconfigCount = 0;
  try {
    const found = await findTsconfigFiles(projectRoot);
    tsconfigCount = found.length;
  } catch {
    tsconfigCount = 0;
  }

  if (tsconfigCount === 0) {
    return gate(id, label, 'fail', [
      makeDiagnostic(DiagnosticCodes.CHECK_TSCONFIG_MISSING, 'error', 'No tsconfig.json found in the project.', {
        suggestedAction: 'Add a tsconfig.json; ts-codegraph documents TypeScript projects.',
      }),
    ]);
  }
  return gate(id, label, 'pass', [
    makeDiagnostic(DiagnosticCodes.CHECK_TSCONFIG_MISSING, 'info', 'TypeScript config found.', {
      safeDetail: { tsconfigCount },
    }),
  ]);
}

// --- Gate 4: git state (informational) -------------------------------------

async function gateGitState(projectRoot: string): Promise<PreflightCheck> {
  const label = 'Git state';
  const id: CheckGateId = 'git-state';
  let available = false;
  let isDirty = false;
  try {
    const summary = await summarizeGitState(projectRoot);
    available = summary.available;
    isDirty = summary.isDirty;
  } catch {
    available = false;
  }

  if (!available) {
    return gate(id, label, 'pass', [
      makeDiagnostic(
        DiagnosticCodes.CHECK_GIT_UNAVAILABLE,
        'info',
        'No git repository detected; the snapshot will be content-derived (worktree kind).',
      ),
    ]);
  }
  return gate(id, label, 'pass', [
    makeDiagnostic(DiagnosticCodes.CHECK_GIT_UNAVAILABLE, 'info', 'Git repository detected.', {
      safeDetail: { snapshotKind: isDirty ? 'git-dirty' : 'git-clean' },
    }),
  ]);
}

// --- Gate 5: traversal policy validity -------------------------------------

function gateTraversalPolicy(): PreflightCheck {
  const label = 'Traversal policy';
  const id: CheckGateId = 'traversal-policy';
  try {
    validateSourceFilePolicy(NOW_TRAVERSAL_POLICY);
  } catch {
    return gate(id, label, 'fail', [
      makeDiagnostic(
        DiagnosticCodes.CHECK_TRAVERSAL_POLICY_INVALID,
        'error',
        'The Now source-traversal policy is invalid.',
      ),
    ]);
  }
  return gate(id, label, 'pass', []);
}

// --- Gate 6: dataset readiness ---------------------------------------------

interface DatasetGateResult {
  readonly check: PreflightCheck;
  readonly databaseReadiness: DatabaseReadiness;
}

async function gateDatasetReadiness(
  projectKey: string,
  options: RunCheckOptions,
): Promise<DatasetGateResult> {
  const label = 'Dataset readiness';
  const id: CheckGateId = 'dataset-readiness';
  const notCreated: DatabaseReadiness = {
    ok: false,
    policy: 'not-created',
    datasetSchemaVersion: DATASET_SCHEMA_ID,
  };

  const projectId = buildProjectId(projectKey);
  const pathsOptions =
    options.dataDirOverride !== undefined ? { dataDirOverride: options.dataDirOverride } : {};

  let dbPath: string;
  try {
    const paths = resolveDatasetPaths(projectId, pathsOptions);
    dbPath = paths.dbPath;
  } catch {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(
          DiagnosticCodes.CHECK_DATASET_UNREADABLE,
          'error',
          'The dataset path could not be resolved inside the app-managed data directory.',
        ),
      ]),
      databaseReadiness: notCreated,
    };
  }

  const { exists } = await pathExists(dbPath);
  if (!exists) {
    return {
      check: gate(id, label, 'warn', [
        makeDiagnostic(DiagnosticCodes.CHECK_DATASET_MISSING, 'warning', 'No dataset found for this project.', {
          suggestedAction: 'Run `ts-codegraph load` to create the dataset before generating docs.',
        }),
      ]),
      databaseReadiness: notCreated,
    };
  }

  // Health is read through a `file:…?immutable=1` open (see
  // `checkManagedDatabaseHealth`) so a WAL-mode dataset is read without ever
  // creating `-wal`/`-shm` sidecars — `check` stays strictly non-mutating.
  let integrityOk = false;
  try {
    integrityOk = checkManagedDatabaseHealth(dbPath).integrityPassed;
  } catch {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_DATASET_UNREADABLE, 'error', 'The dataset exists but could not be opened read-only.', {
          suggestedAction: 'Re-run `ts-codegraph load` to rebuild the dataset.',
        }),
      ]),
      databaseReadiness: { ok: false, policy: 'app-managed', datasetSchemaVersion: DATASET_SCHEMA_ID },
    };
  }

  if (!integrityOk) {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_DATASET_UNHEALTHY, 'error', 'The dataset failed its SQLite integrity check.', {
          suggestedAction: 'Re-run `ts-codegraph load` to rebuild the dataset.',
        }),
      ]),
      databaseReadiness: { ok: false, policy: 'app-managed', datasetSchemaVersion: DATASET_SCHEMA_ID },
    };
  }

  return {
    check: gate(id, label, 'pass', [
      makeDiagnostic(DiagnosticCodes.CHECK_DATASET_MISSING, 'info', 'Dataset is present and healthy.'),
    ]),
    databaseReadiness: { ok: true, policy: 'app-managed', datasetSchemaVersion: DATASET_SCHEMA_ID },
  };
}

// --- Gate 7: template pack manifest (parse only) ---------------------------

interface TemplateGateResult {
  readonly check: PreflightCheck;
  readonly templateReadiness: TemplateReadiness;
}

async function gateTemplatePack(
  templatePack: string,
  options: RunCheckOptions,
  redaction: Redaction,
): Promise<TemplateGateResult> {
  const label = 'Template pack';
  const id: CheckGateId = 'template-pack';
  const notReady: TemplateReadiness = { ok: false, packs: [] };
  const packsDir = options.templatePacksDir ?? DEFAULT_TEMPLATE_PACKS_DIR;
  const manifestPath = join(packsDir, templatePack, TEMPLATE_PACK_MANIFEST_FILE);
  const safePackName = toBoundedText(redaction, templatePack);

  let raw: string;
  try {
    raw = await readFile(manifestPath, 'utf8');
  } catch {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_TEMPLATE_PACK_MISSING, 'error', 'The requested template pack manifest is missing.', {
          safeDetail: { packName: safePackName },
          suggestedAction: 'Pass a --template-pack that exists, or install the pack.',
        }),
      ]),
      templateReadiness: notReady,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_TEMPLATE_PACK_INVALID, 'error', 'The template pack manifest is not valid JSON.', {
          safeDetail: { packName: safePackName },
        }),
      ]),
      templateReadiness: notReady,
    };
  }

  const result = templatePackManifestSchema.safeParse(parsed);
  if (!result.success) {
    return {
      check: gate(id, label, 'fail', [
        makeDiagnostic(DiagnosticCodes.CHECK_TEMPLATE_PACK_INVALID, 'error', 'The template pack manifest failed schema validation.', {
          safeDetail: { packName: safePackName, issueCount: result.error.issues.length },
        }),
      ]),
      templateReadiness: notReady,
    };
  }

  const manifest = result.data;
  return {
    check: gate(id, label, 'pass', [
      makeDiagnostic(DiagnosticCodes.CHECK_TEMPLATE_PACK_MISSING, 'info', 'Template pack manifest parsed successfully.', {
        safeDetail: { packName: manifest.packName, templateCount: manifest.templateFiles.length },
      }),
    ]),
    templateReadiness: {
      ok: true,
      packs: [
        {
          packName: manifest.packName,
          packVersion: manifest.packVersion,
          templateCount: manifest.templateFiles.length,
        },
      ],
    },
  };
}

// --- Gate 8: output strategy -----------------------------------------------

async function nearestExistingEntry(target: string): Promise<{ path: string; isDirectory: boolean } | undefined> {
  let current = resolve(target);
  for (;;) {
    const { exists, isDirectory } = await pathExists(current);
    if (exists) {
      return { path: current, isDirectory };
    }
    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

async function gateOutputStrategy(options: RunCheckOptions): Promise<PreflightCheck> {
  const label = 'Output strategy';
  const id: CheckGateId = 'output-strategy';

  if (options.outputDir === undefined) {
    return gate(id, label, 'skip', [
      makeDiagnostic(DiagnosticCodes.CHECK_OUTPUT_NOT_WRITABLE, 'info', 'No --output supplied; output strategy not checked.'),
    ]);
  }

  const resolvedOut = resolve(options.outputDir);
  try {
    createSafePathPolicy(resolvedOut);
  } catch {
    return gate(id, label, 'fail', [
      makeDiagnostic(DiagnosticCodes.CHECK_OUTPUT_UNSAFE, 'error', 'The --output path is not a safe path.'),
    ]);
  }

  const nearest = await nearestExistingEntry(resolvedOut);
  if (nearest === undefined || !nearest.isDirectory) {
    return gate(id, label, 'fail', [
      makeDiagnostic(
        DiagnosticCodes.CHECK_OUTPUT_NOT_WRITABLE,
        'error',
        'The --output location has no existing writable parent directory.',
        { suggestedAction: 'Point --output at (or inside) an existing directory.' },
      ),
    ]);
  }

  try {
    await access(nearest.path, fsConstants.W_OK);
  } catch {
    return gate(id, label, 'fail', [
      makeDiagnostic(DiagnosticCodes.CHECK_OUTPUT_NOT_WRITABLE, 'error', 'The --output location is not writable.', {
        suggestedAction: 'Grant write access to the output directory.',
      }),
    ]);
  }

  return gate(id, label, 'pass', [
    makeDiagnostic(DiagnosticCodes.CHECK_OUTPUT_NOT_WRITABLE, 'info', 'The --output location looks writable; nothing was created.'),
  ]);
}

/**
 * Derive the stable project key used to resolve the dataset location. `load`
 * (Row 4) must derive the same key so `check` inspects the dataset `load`
 * writes: the root package name when present, else the directory name.
 */
export function deriveProjectKey(manifestName: string | undefined, projectRoot: string): string {
  return manifestName ?? (basename(projectRoot) || 'project');
}

/**
 * Run the eight preflight gates and assemble a validated `ts-codegraph.check@1`
 * envelope. Never mutates the filesystem; an existing dataset's health is read
 * through an immutable open that creates no sidecars.
 */
export async function runCheck(options: RunCheckOptions): Promise<CheckOutcome> {
  const projectRoot = resolve(options.projectPath);
  const templatePack = options.templatePack ?? DEFAULT_TEMPLATE_PACK;

  let projectPolicy: SafePathPolicy | undefined;
  try {
    projectPolicy = createSafePathPolicy(projectRoot, { allowSymlinks: false });
  } catch {
    projectPolicy = undefined;
  }
  const redaction: Redaction = { redactor: createRedactor(), projectPolicy };

  const projectGate = await gateProjectPath(projectRoot, redaction);
  const checks: PreflightCheck[] = [projectGate.check];

  let repository: RepositoryGateResult | undefined;
  if (projectGate.ready) {
    repository = await gateRepositoryDiscovery(projectRoot, redaction);
    checks.push(repository.check);
    checks.push(await gateTsconfigPresence(projectRoot));
    checks.push(await gateGitState(projectRoot));
  } else {
    checks.push(skipGate('repository-discovery', 'Repository discovery', 'Skipped: project path gate failed.'));
    checks.push(skipGate('tsconfig-presence', 'TypeScript config presence', 'Skipped: project path gate failed.'));
    checks.push(skipGate('git-state', 'Git state', 'Skipped: project path gate failed.'));
  }

  // Gate 5 is project-independent; always run it.
  checks.push(gateTraversalPolicy());

  let databaseReadiness: DatabaseReadiness = {
    ok: false,
    policy: 'not-created',
    datasetSchemaVersion: DATASET_SCHEMA_ID,
  };
  if (projectGate.ready) {
    const projectKey = deriveProjectKey(repository?.projectKey, projectRoot);
    const datasetGate = await gateDatasetReadiness(projectKey, options);
    checks.push(datasetGate.check);
    databaseReadiness = datasetGate.databaseReadiness;
  } else {
    checks.push(skipGate('dataset-readiness', 'Dataset readiness', 'Skipped: project path gate failed.'));
  }

  // Gate 7 is project-independent (packs ship with ts-codegraph); always run it.
  const templateGate = await gateTemplatePack(templatePack, options, redaction);
  checks.push(templateGate.check);

  checks.push(await gateOutputStrategy(options));

  const allDiagnostics = checks.flatMap((check) => check.diagnostics);
  const hasFailure = checks.some((check) => check.status === 'fail');

  const data: CheckData = {
    preflightChecks: checks,
    templateReadiness: templateGate.templateReadiness,
    databaseReadiness,
    willWrite: false,
  };

  const envelopeInput = {
    ok: !hasFailure,
    diagnostics: allDiagnostics.filter((diagnostic) => diagnostic.severity === 'error'),
    warnings: allDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning'),
    meta: {
      toolVersion: CHECK_TOOL_VERSION,
      datasetSchemaVersion: DATASET_SCHEMA_ID,
      timestamp: options.timestamp ?? new Date().toISOString(),
    },
    command: 'check',
    schemaVersion: 'ts-codegraph.check@1',
    data,
  };

  const parsed = parseCheckEnvelope(envelopeInput);
  if (!parsed.success) {
    // A self-validation failure is a programmer error, never a gate outcome.
    throw new Error('assembled ts-codegraph.check@1 envelope failed self-validation');
  }

  return {
    envelope: parsed.value,
    ok: !hasFailure,
    exitCode: hasFailure ? PREFLIGHT_FAIL_EXIT_CODE : 0,
  };
}
