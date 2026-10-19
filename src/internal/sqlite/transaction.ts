import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/sqlite-entities.js';
import { getHandle } from './database.js';
import type { SqliteDatabase, SqliteTransactionOptions } from './types.js';

const TRACER_NAME = 'codegraph.sqlite';
const ADAPTER_NAME = 'node-sqlite';
const ALLOWED_MODES = new Set(['deferred', 'immediate', 'exclusive']);

function validateTransactionMode(mode: unknown): asserts mode is 'deferred' | 'immediate' | 'exclusive' {
  if (typeof mode !== 'string' || !ALLOWED_MODES.has(mode)) {
    throw new AppError({
      code: ERROR_CODES.SQLITE_UNSAFE_INPUT,
      category: 'validation',
      title: 'Invalid SQLite transaction mode',
      clientDetail: 'Transaction mode must be "deferred", "immediate", or "exclusive"',
    });
  }
}

export async function withTransaction<T>(
  db: SqliteDatabase,
  callback: () => T | Promise<T>,
  options?: SqliteTransactionOptions,
): Promise<T> {
  const rawDb = getHandle(db);
  const mode = options?.mode ?? 'deferred';
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.sqlite.transaction', {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OPERATION]: 'transaction',
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ADAPTER]: ADAPTER_NAME,
    },
  });

  // Validate mode before executing any SQL — reject injection-like values.
  try {
    validateTransactionMode(mode);
  } catch (validErr) {
    const code = validErr instanceof AppError ? validErr.code : ERROR_CODES.SQLITE_UNSAFE_INPUT;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw validErr;
  }

  try {
    rawDb.exec(`BEGIN ${mode.toUpperCase()}`);
  } catch (beginErr) {
    const code = beginErr instanceof AppError ? beginErr.code : ERROR_CODES.SQLITE_TRANSACTION_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    if (beginErr instanceof AppError) throw beginErr;
    const msg = beginErr instanceof Error ? beginErr.message : String(beginErr);
    if (msg.includes('SQLITE_BUSY') || msg.toLowerCase().includes('locked')) {
      throw new AppError({
        code: ERROR_CODES.SQLITE_BUSY_TIMEOUT,
        category: 'unavailable',
        title: 'SQLite busy timeout',
        clientDetail: 'The database is locked and the transaction could not begin',
        cause: beginErr,
      });
    }
    throw new AppError({
      code: ERROR_CODES.SQLITE_TRANSACTION_FAILED,
      category: 'internal',
      title: 'SQLite transaction could not begin',
      clientDetail: 'The database transaction failed to start',
      cause: beginErr,
    });
  }

  try {
    // Await the callback so async errors are caught and trigger rollback.
    const result = await Promise.resolve(callback());
    rawDb.exec('COMMIT');
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_TRANSACTION_OUTCOME, 'commit');
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    return result;
  } catch (callbackErr) {
    try { rawDb.exec('ROLLBACK'); } catch { /* ignore */ }
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_TRANSACTION_OUTCOME, 'rollback');
    const code = callbackErr instanceof AppError ? callbackErr.code : ERROR_CODES.SQLITE_TRANSACTION_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    if (callbackErr instanceof AppError) throw callbackErr;
    throw new AppError({
      code: ERROR_CODES.SQLITE_TRANSACTION_FAILED,
      category: 'internal',
      title: 'SQLite transaction callback failed',
      clientDetail: 'The transaction was rolled back due to an error',
      cause: callbackErr,
    });
  }
}
