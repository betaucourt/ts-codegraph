import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/sqlite-entities.js';
import { getHandle } from './database.js';
import type { SqliteDatabase, SqliteHealthOptions, SqliteHealthResult } from './types.js';

const TRACER_NAME = 'codegraph.sqlite';
const ADAPTER_NAME = 'node-sqlite';

export async function checkSqliteHealth(
  db: SqliteDatabase,
  options?: SqliteHealthOptions,
): Promise<SqliteHealthResult> {
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.sqlite.health', {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OPERATION]: 'health',
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ADAPTER]: ADAPTER_NAME,
    },
  });

  try {
    const rawDb = getHandle(db);
    const checkIntegrity = options?.checkIntegrity !== false;

    let integrityPassed = false;
    if (checkIntegrity) {
      try {
        type IntegrityRow = { integrity_check: string };
        const rows = rawDb.prepare('PRAGMA integrity_check').all() as IntegrityRow[];
        integrityPassed = rows.length === 1 && rows[0]?.integrity_check === 'ok';
      } catch {
        // Corrupt DB — integrity check could not execute
        integrityPassed = false;
      }
    } else {
      integrityPassed = true;
    }

    let walEnabled = false;
    try {
      type JournalRow = { journal_mode: string };
      const rows = rawDb.prepare('PRAGMA journal_mode').all() as JournalRow[];
      walEnabled = rows[0]?.journal_mode === 'wal';
    } catch {
      walEnabled = false;
    }

    const ok = integrityPassed;

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return { ok, integrityPassed, walEnabled };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.SQLITE_HEALTH_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    if (err instanceof AppError) throw err;
    throw new AppError({
      code: ERROR_CODES.SQLITE_HEALTH_FAILED,
      category: 'internal',
      title: 'SQLite health check failed',
      clientDetail: 'The database health check could not complete',
      cause: err,
    });
  }
}
