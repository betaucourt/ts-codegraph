import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';

import type { SqliteMigration } from '../internal/sqlite/index.js';

/**
 * Product-local minimal SQLite runtime for the ts-codegraph dataset.
 *
 * WHY THIS EXISTS (candidate ts-codegraph gap — decision record §11, kickoff §8):
 * `@codegraph/sqlite` opens/migrates/transacts/creates-FTS but exposes **no
 * parametrized query surface** and does not hand back its managed connection
 * handle (`getHandle` is package-internal). Transactional row persistence
 * (Step 04) requires the row helpers to run on the *same* connection a
 * transaction wraps, so a single shared handle is mandatory. Until a second
 * portfolio product needs the same, this runtime is the product-local workaround:
 * it owns one `node:sqlite` connection and mirrors the shared package's
 * semantics (WAL + busy-timeout policy, an `_migrations` table with sha256
 * checksums, BEGIN/COMMIT/ROLLBACK) so a future swap to a shared query surface is
 * mechanical. It reuses `@codegraph/sqlite` `validateIdentifier` (via `schema.ts`)
 * and `@codegraph/app-paths` for everything those surfaces already cover.
 *
 * The raw `DatabaseSync` handle is held in a module-private `WeakMap` keyed by the
 * opaque `ManagedDatabase` wrapper (the same encapsulation pattern the shared
 * package uses), so it never appears on a public type.
 */

const MIGRATIONS_TABLE = '_migrations';
const MIGRATIONS_DDL = `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (id TEXT NOT NULL PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL)`;
const MEMORY_PATH = ':memory:';
const DEFAULT_BUSY_TIMEOUT_MS = 5000;

/** Value kinds accepted by the parametrized query helpers. */
export type SqlParam = string | number | bigint | boolean | null | undefined | Uint8Array;

export interface ManagedOpenOptions {
  /** Absolute filesystem path, or ':memory:' for an in-memory database. */
  readonly path: string;
  /** Open the connection read-only. Default: false. */
  readonly readOnly?: boolean;
  /** Enable WAL journal mode on file databases. Default: true. */
  readonly walMode?: boolean;
  /** SQLite busy_timeout in milliseconds. Default: 5000. */
  readonly busyTimeoutMs?: number;
  /**
   * Open the file `immutable` (implies read-only). SQLite then reads a WAL-mode
   * database directly and creates **no** `-wal`/`-shm` sidecars, so the open is
   * strictly non-mutating. Use for read-only commands like `search`.
   */
  readonly immutable?: boolean;
}

/** Opaque handle wrapper. The underlying connection is never exposed publicly. */
export interface ManagedDatabase {
  readonly path: string;
  readonly readOnly: boolean;
  close(): void;
}

export interface ManagedMigrationResult {
  readonly applied: number;
  readonly skipped: number;
}

const handles = new WeakMap<ManagedDatabase, DatabaseSync>();

function getHandle(db: ManagedDatabase): DatabaseSync {
  const handle = handles.get(db);
  if (handle === undefined) {
    throw new Error('dataset database handle is closed or not managed by this runtime');
  }
  return handle;
}

function normalizeParam(value: SqlParam): string | number | bigint | null | Uint8Array {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return value;
}

function normalizeParams(
  params: readonly SqlParam[],
): (string | number | bigint | null | Uint8Array)[] {
  return params.map(normalizeParam);
}

/** Open (or create) a managed connection and apply the WAL/busy-timeout policy. */
export function openManagedDatabase(options: ManagedOpenOptions): ManagedDatabase {
  const immutable = options.immutable ?? false;
  const readOnly = immutable || (options.readOnly ?? false);
  const isMemory = options.path === MEMORY_PATH;

  let raw: DatabaseSync;
  if (immutable) {
    // `file:…?immutable=1` reads a WAL database without creating sidecars.
    const url = pathToFileURL(options.path);
    url.searchParams.set('immutable', '1');
    raw = new DatabaseSync(url.href, { readOnly: true });
  } else {
    raw = new DatabaseSync(options.path, { readOnly });
  }

  if (!readOnly) {
    if (options.walMode !== false && !isMemory) {
      raw.exec('PRAGMA journal_mode=WAL');
    }
    const timeout = options.busyTimeoutMs ?? DEFAULT_BUSY_TIMEOUT_MS;
    raw.exec(`PRAGMA busy_timeout=${Number(timeout)}`);
  }
  if (!immutable) {
    raw.exec('PRAGMA foreign_keys=ON');
  }

  const db: ManagedDatabase = {
    path: options.path,
    readOnly,
    close(): void {
      raw.close();
    },
  };
  handles.set(db, raw);
  return db;
}

export interface ManagedHealthResult {
  readonly ok: boolean;
  readonly integrityPassed: boolean;
}

/**
 * Read an existing dataset's health **without mutating the filesystem**.
 *
 * A read-only open of a WAL-mode database still creates `-wal`/`-shm` sidecar
 * files (SQLite needs shared memory to read the WAL), which would violate the
 * `check` command's zero-mutation contract. Opening the file through a
 * `file:…?immutable=1` URI tells SQLite the database cannot change, so it reads a
 * WAL-mode database directly and creates no sidecars. The URI is built with
 * `pathToFileURL` so paths containing spaces (e.g. macOS `Application Support`)
 * are correctly percent-encoded. This opens a standalone throwaway connection
 * (not a managed handle) purely for the integrity read.
 */
export function checkManagedDatabaseHealth(path: string): ManagedHealthResult {
  const url = pathToFileURL(path);
  url.searchParams.set('immutable', '1');
  const raw = new DatabaseSync(url.href, { readOnly: true });
  try {
    const rows = raw.prepare('PRAGMA integrity_check').all() as { integrity_check: string }[];
    const integrityPassed = rows.length === 1 && rows[0]?.integrity_check === 'ok';
    return { ok: integrityPassed, integrityPassed };
  } finally {
    raw.close();
  }
}

function checksum(sql: string): string {
  return createHash('sha256').update(sql, 'utf8').digest('hex');
}

/**
 * Apply the migration set idempotently, mirroring `@codegraph/sqlite`
 * `runMigrations`: unique-id validation, an `_migrations` version table, a
 * sha256 checksum per migration (mismatch on an applied id throws), and each new
 * migration applied inside its own `BEGIN IMMEDIATE` transaction. Re-running an
 * up-to-date dataset applies nothing.
 */
export function runManagedMigrations(
  db: ManagedDatabase,
  migrations: readonly SqliteMigration[],
): ManagedMigrationResult {
  const raw = getHandle(db);

  const seen = new Set<string>();
  for (const migration of migrations) {
    if (!migration.id || typeof migration.id !== 'string') {
      throw new Error('each migration must have a non-empty string id');
    }
    if (seen.has(migration.id)) {
      throw new Error(`duplicate migration id: ${migration.id}`);
    }
    seen.add(migration.id);
  }

  raw.exec(MIGRATIONS_DDL);
  const appliedRows = raw
    .prepare(`SELECT id, checksum FROM ${MIGRATIONS_TABLE}`)
    .all() as { id: string; checksum: string }[];
  const appliedMap = new Map(appliedRows.map((row) => [row.id, row.checksum]));

  let applied = 0;
  let skipped = 0;

  for (const migration of migrations) {
    const sum = checksum(migration.sql);
    const existing = appliedMap.get(migration.id);
    if (existing !== undefined) {
      if (existing !== sum) {
        throw new Error(
          `migration ${migration.id} checksum mismatch: it was modified after being applied`,
        );
      }
      skipped += 1;
      continue;
    }

    raw.exec('BEGIN IMMEDIATE');
    try {
      raw.exec(migration.sql);
      raw
        .prepare(
          `INSERT INTO ${MIGRATIONS_TABLE} (id, checksum, applied_at) VALUES (?, ?, ?)`,
        )
        .run(migration.id, sum, new Date().toISOString());
      raw.exec('COMMIT');
    } catch (error) {
      try {
        raw.exec('ROLLBACK');
      } catch {
        /* ignore rollback failure; surface the original error */
      }
      throw error;
    }
    applied += 1;
  }

  return { applied, skipped };
}

/**
 * Run `fn` inside a transaction on the single managed connection, committing on
 * success and rolling back on any thrown error. The callback is synchronous
 * because `node:sqlite` is synchronous; row helpers called inside it write on the
 * same connection, so their writes participate in this transaction.
 */
export function withManagedTransaction<T>(
  db: ManagedDatabase,
  fn: () => T,
  mode: 'deferred' | 'immediate' | 'exclusive' = 'deferred',
): T {
  const raw = getHandle(db);
  raw.exec(`BEGIN ${mode.toUpperCase()}`);
  try {
    const result = fn();
    raw.exec('COMMIT');
    return result;
  } catch (error) {
    try {
      raw.exec('ROLLBACK');
    } catch {
      /* ignore rollback failure; surface the original error */
    }
    throw error;
  }
}

/** Execute a parametrized write; returns the affected row count. */
export function managedRun(
  db: ManagedDatabase,
  sql: string,
  params: readonly SqlParam[] = [],
): number {
  const raw = getHandle(db);
  const result = raw.prepare(sql).run(...normalizeParams(params));
  return Number(result.changes);
}

/** Execute a parametrized read returning the first row, or undefined. */
export function managedGet<T>(
  db: ManagedDatabase,
  sql: string,
  params: readonly SqlParam[] = [],
): T | undefined {
  const raw = getHandle(db);
  return raw.prepare(sql).get(...normalizeParams(params)) as T | undefined;
}

/** Execute a parametrized read returning every row. */
export function managedAll<T>(
  db: ManagedDatabase,
  sql: string,
  params: readonly SqlParam[] = [],
): T[] {
  const raw = getHandle(db);
  return raw.prepare(sql).all(...normalizeParams(params)) as T[];
}
