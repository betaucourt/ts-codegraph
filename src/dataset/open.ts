import { join } from 'node:path';

import { assertAppPathInside, ensureAppPath, getDataDir } from '../internal/app-paths/index.js';

import { createDiagnostic, type Diagnostic } from '../contracts/diagnostics.js';
import { DATASET_MIGRATIONS } from './migrations/index.js';
import { DATASET_SCHEMA_ID } from './schema.js';
import {
  openManagedDatabase,
  runManagedMigrations,
  withManagedTransaction,
  type ManagedDatabase,
} from './sqlite-runtime.js';

/**
 * Dataset location and lifecycle (step-02 §3, decision record §6/§7).
 *
 * The dataset lives in an app-managed data directory resolved via
 * `@codegraph/app-paths`, keyed by the public project ID. There is no repo-local
 * database path. Containment inside the app-paths boundary is asserted on every
 * open; a boundary violation surfaces as a safe `SAFETY_PATH_ESCAPE` diagnostic
 * carrying no absolute path. Migrations run idempotently on open, so opening a
 * fresh directory creates the schema and re-opening is a no-op.
 */

/** App name used to resolve the app-managed data directory. */
export const DATASET_APP_NAME = 'ts-codegraph' as const;

/** Directory that holds all per-project datasets under the data directory. */
export const DATASET_SUBDIR = 'datasets' as const;

/** The dataset database filename inside a project's dataset directory. */
export const DATASET_DB_FILENAME = 'dataset.db' as const;

/** Raised when a resolved dataset path escapes its app-paths boundary. */
export class DatasetContainmentError extends Error {
  readonly diagnostic: Diagnostic;

  constructor(diagnostic: Diagnostic) {
    super(diagnostic.message);
    this.name = 'DatasetContainmentError';
    this.diagnostic = diagnostic;
  }
}

export interface OpenDatasetOptions {
  /** Create the dataset directory and schema if absent. Default: false. */
  readonly create?: boolean;
  /** Open the connection read-only (used by `check`/`search`). Default: false. */
  readonly readOnly?: boolean;
  /**
   * Open the dataset `immutable` (implies read-only, runs no migrations, and
   * creates no WAL sidecars). Used by `search` for a strictly non-mutating read.
   */
  readonly immutable?: boolean;
  /**
   * Override the base data directory (tests only). Passed to `@codegraph/app-paths`
   * as a data-path override so resolution still goes through the shared resolver.
   */
  readonly dataDirOverride?: string;
}

export interface DatasetPaths {
  /** The app-managed data directory (the containment boundary). */
  readonly dataDir: string;
  /** The per-project dataset directory. */
  readonly datasetDir: string;
  /** The dataset database file. */
  readonly dbPath: string;
}

export interface Dataset {
  readonly projectId: string;
  readonly schemaId: string;
  readonly path: string;
  /** The managed connection; row helpers accept this and never expose its handle. */
  readonly db: ManagedDatabase;
  close(): void;
}

/**
 * Derive a filesystem-safe directory key from a public project ID. The ID is the
 * opaque `project:v1:<hash16>` string, so slugging its non-word characters keeps
 * it deterministic and path-safe while rejecting any separator or traversal that
 * could escape the datasets directory.
 */
export function projectDirKey(projectId: string): string {
  const trimmed = projectId.trim();
  if (trimmed.length === 0) {
    throw new Error('project id must not be empty');
  }
  if (
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('..') ||
    trimmed.includes(' ')
  ) {
    throw new Error('project id must not contain path separators or traversal');
  }
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Assert `pathRef` is contained by `boundary`, converting an app-paths boundary
 * violation into a safe `SAFETY_PATH_ESCAPE` diagnostic with no path in it.
 */
export function assertDatasetPathContained(pathRef: string, boundary: string): void {
  try {
    assertAppPathInside(pathRef, boundary);
  } catch {
    throw new DatasetContainmentError(
      createDiagnostic({
        code: 'SAFETY_PATH_ESCAPE',
        severity: 'error',
        message: 'Resolved dataset path is outside the app-managed data directory.',
        suggestedAction:
          'Use the app-managed dataset location; do not point the dataset outside the data directory.',
      }),
    );
  }
}

/** Resolve the app-managed dataset paths for a project without touching disk. */
export function resolveDatasetPaths(
  projectId: string,
  options: Pick<OpenDatasetOptions, 'dataDirOverride'> = {},
): DatasetPaths {
  const dataDir =
    options.dataDirOverride !== undefined
      ? getDataDir({
          app: DATASET_APP_NAME,
          policy: { readXdg: false, overrides: { data: options.dataDirOverride } },
        })
      : getDataDir({ app: DATASET_APP_NAME, policy: { readXdg: true } });

  const datasetDir = join(dataDir, DATASET_SUBDIR, projectDirKey(projectId));
  const dbPath = join(datasetDir, DATASET_DB_FILENAME);

  assertDatasetPathContained(datasetDir, dataDir);
  assertDatasetPathContained(dbPath, datasetDir);

  return { dataDir, datasetDir, dbPath };
}

/**
 * Open (or create) the dataset for a project. On `create`, the dataset directory
 * is created inside the app-paths boundary and the schema migration runs. On a
 * read-write open the migration runs idempotently (a no-op when up to date). A
 * read-only open skips creation and migration and requires an existing dataset.
 */
export async function openDataset(
  projectId: string,
  options: OpenDatasetOptions = {},
): Promise<Dataset> {
  const create = options.create ?? false;
  const immutable = options.immutable ?? false;
  const readOnly = immutable || (options.readOnly ?? false);
  const { dataDir, datasetDir, dbPath } = resolveDatasetPaths(
    projectId,
    options.dataDirOverride !== undefined
      ? { dataDirOverride: options.dataDirOverride }
      : {},
  );

  if (create && !readOnly) {
    await ensureAppPath(datasetDir, { boundary: dataDir });
  }

  const db = openManagedDatabase({ path: dbPath, readOnly, immutable });
  try {
    if (!readOnly) {
      runManagedMigrations(db, DATASET_MIGRATIONS);
    }
  } catch (error) {
    db.close();
    throw error;
  }

  return {
    projectId,
    schemaId: DATASET_SCHEMA_ID,
    path: dbPath,
    db,
    close(): void {
      db.close();
    },
  };
}

/** Close a dataset connection cleanly. */
export function closeDataset(dataset: Dataset): void {
  dataset.close();
}

/** Run `fn` inside a transaction on the dataset connection. */
export function withDatasetTransaction<T>(dataset: Dataset, fn: () => T): T {
  return withManagedTransaction(dataset.db, fn);
}
