import { createHash } from 'node:crypto';
import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/sqlite-entities.js';
import { getHandle } from './database.js';
import type { SqliteDatabase, SqliteMigration, SqliteRunMigrationsOptions, SqliteMigrationResult } from './types.js';

const TRACER_NAME = 'codegraph.sqlite';
const ADAPTER_NAME = 'node-sqlite';
const MIGRATIONS_TABLE = '_migrations';
const MIGRATIONS_DDL = `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (id TEXT NOT NULL PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL)`;

function computeChecksum(sql: string): string {
  return createHash('sha256').update(sql, 'utf8').digest('hex');
}

function migrationCountBucket(count: number): string {
  if (count === 0) return '0';
  if (count <= 5) return '1-5';
  if (count <= 20) return '6-20';
  if (count <= 100) return '21-100';
  return '100+';
}

function startSpan() {
  const tracer = getTracer(TRACER_NAME);
  return tracer.startSpan('codegraph.sqlite.migration', {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OPERATION]: 'migration',
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ADAPTER]: ADAPTER_NAME,
    },
  });
}

export async function runMigrations(
  db: SqliteDatabase,
  migrations: readonly SqliteMigration[],
  options?: SqliteRunMigrationsOptions,
): Promise<SqliteMigrationResult> {
  const rawDb = getHandle(db);
  const verifyChecksums = options?.verifyChecksums !== false;
  const span = startSpan();

  try {
    // Validate migration list
    const seenIds = new Set<string>();
    for (const m of migrations) {
      if (!m.id || typeof m.id !== 'string') {
        throw new AppError({
          code: ERROR_CODES.SQLITE_MIGRATION_FAILED,
          category: 'validation',
          title: 'Invalid migration ID',
          clientDetail: 'Each migration must have a non-empty string ID',
        });
      }
      if (seenIds.has(m.id)) {
        throw new AppError({
          code: ERROR_CODES.SQLITE_MIGRATION_FAILED,
          category: 'validation',
          title: 'Duplicate migration ID',
          clientDetail: 'Migration IDs must be unique within a single runMigrations call',
        });
      }
      seenIds.add(m.id);
    }

    // Ensure migrations tracking table exists
    rawDb.exec(MIGRATIONS_DDL);

    // Load applied migrations
    type MigRow = { id: string; checksum: string };
    const applied = rawDb.prepare(`SELECT id, checksum FROM ${MIGRATIONS_TABLE}`).all() as MigRow[];
    const appliedMap = new Map(applied.map(r => [r.id, r.checksum]));

    let appliedCount = 0;
    let skippedCount = 0;
    const resultMigrations: { id: string; checksum: string }[] = [];

    for (const migration of migrations) {
      const checksum = computeChecksum(migration.sql);

      if (appliedMap.has(migration.id)) {
        if (verifyChecksums && appliedMap.get(migration.id) !== checksum) {
          throw new AppError({
            code: ERROR_CODES.SQLITE_MIGRATION_CHECKSUM_MISMATCH,
            category: 'validation',
            title: 'Migration checksum mismatch',
            clientDetail: 'An applied migration has been modified since it was first applied',
          });
        }
        skippedCount++;
        resultMigrations.push({ id: migration.id, checksum });
        continue;
      }

      // Run in a transaction
      try {
        rawDb.exec('BEGIN IMMEDIATE');
        try {
          rawDb.exec(migration.sql);
          rawDb.prepare(`INSERT INTO ${MIGRATIONS_TABLE} (id, checksum, applied_at) VALUES (?, ?, ?)`)
            .run(migration.id, checksum, new Date().toISOString());
          rawDb.exec('COMMIT');
        } catch (innerErr) {
          try { rawDb.exec('ROLLBACK'); } catch { /* ignore */ }
          throw innerErr;
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('SQLITE_BUSY') || msg.toLowerCase().includes('locked')) {
          throw new AppError({
            code: ERROR_CODES.SQLITE_BUSY_TIMEOUT,
            category: 'unavailable',
            title: 'SQLite busy timeout during migration',
            clientDetail: 'The database was locked during migration; retry later',
            cause: err,
          });
        }
        throw new AppError({
          code: ERROR_CODES.SQLITE_MIGRATION_FAILED,
          category: 'internal',
          title: 'Migration execution failed',
          clientDetail: 'A migration could not be applied to the database',
          cause: err,
        });
      }

      appliedCount++;
      resultMigrations.push({ id: migration.id, checksum });
    }

    const countBucket = migrationCountBucket(appliedCount);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_MIGRATION_COUNT_BUCKET, countBucket);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return { applied: appliedCount, skipped: skippedCount, migrations: resultMigrations };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.SQLITE_MIGRATION_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    if (err instanceof AppError) throw err;
    throw new AppError({
      code: ERROR_CODES.SQLITE_MIGRATION_FAILED,
      category: 'internal',
      title: 'Migration operation failed',
      clientDetail: 'An error occurred during database migration',
      cause: err,
    });
  }
}
