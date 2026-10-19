import { DatabaseSync } from 'node:sqlite';
import { mkdir } from 'node:fs/promises';
import { lstatSync } from 'node:fs';
import { isAbsolute, dirname, join } from 'node:path';
import { AppError } from '../errors/index.js';
import { getDataDir } from '../app-paths/index.js';
import { isPathInside } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/sqlite-entities.js';
import type {
  SqliteDatabase, SqliteOpenOptions, SqliteCreateOptions, SqlitePolicy,
} from './types.js';
import { runMigrations } from './migrations.js';

const ADAPTER_NAME = 'node-sqlite';
const TRACER_NAME = 'codegraph.sqlite';
const DEFAULT_BUSY_TIMEOUT_MS = 5000;
const MAX_BUSY_TIMEOUT_MS = 300_000; // 5 minutes
const MEMORY_PATH = ':memory:';

// WeakMap so the handle is GC'd with the wrapper object.
const handleMap = new WeakMap<SqliteDatabase, DatabaseSync>();

export function getHandle(db: SqliteDatabase): DatabaseSync {
  const handle = handleMap.get(db);
  if (!handle) {
    throw new AppError({
      code: ERROR_CODES.SQLITE_ADAPTER_UNSUPPORTED,
      category: 'validation',
      title: 'SQLite database handle is not supported',
      clientDetail: 'The provided database was not created by this package',
    });
  }
  return handle;
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function validateDbPath(path: string): void {
  if (!path || typeof path !== 'string' || hasControlChars(path)) {
    throw new AppError({
      code: ERROR_CODES.SQLITE_PATH_INVALID,
      category: 'validation',
      title: 'SQLite database path is invalid',
      clientDetail: 'Database path must be a non-empty string without control characters',
    });
  }
  if (path === MEMORY_PATH) return;
  if (!isAbsolute(path)) {
    throw new AppError({
      code: ERROR_CODES.SQLITE_PATH_INVALID,
      category: 'validation',
      title: 'SQLite database path must be absolute',
      clientDetail: 'Database path must be an absolute filesystem path',
    });
  }
}

function checkSymlinkSafety(path: string): void {
  if (path === MEMORY_PATH) return;
  // Deny if the database file itself is a symlink (regardless of target location).
  // lstatSync on the link returns info about the link, not the target.
  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      throw new AppError({
        code: ERROR_CODES.SQLITE_PATH_UNSAFE,
        category: 'authz',
        title: 'SQLite database path is a symbolic link',
        clientDetail: 'Database path must not be a symbolic link',
      });
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return; // File does not exist yet — new database, OK.
    // Other stat errors (permissions, etc.) — let the DB open handle it.
  }
}

function resolveDbPath(options: SqliteOpenOptions): string {
  if (options.path !== undefined) return options.path;
  const app = options.app ?? 'codegraph-sqlite';
  const name = options.name ?? 'default';
  const dataDir = getDataDir({ app, policy: { readXdg: true } });
  const dbPath = join(dataDir, `${name}.db`);
  // Belt-and-suspenders: verify the constructed path is still inside the data dir.
  if (!isPathInside(dataDir, dbPath)) {
    throw new AppError({
      code: ERROR_CODES.SQLITE_PATH_UNSAFE,
      category: 'authz',
      title: 'Resolved database path escapes the app data directory',
      clientDetail: 'Database path must remain within the application data directory',
    });
  }
  return dbPath;
}

function classifyOpenError(err: unknown, code: string): AppError {
  if (err instanceof AppError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('SQLITE_BUSY') || msg.toLowerCase().includes('database is locked')) {
    return new AppError({
      code: ERROR_CODES.SQLITE_BUSY_TIMEOUT,
      category: 'unavailable',
      title: 'SQLite database is busy',
      clientDetail: 'The database is currently locked and could not be opened',
      cause: err,
    });
  }
  if (msg.includes('SQLITE_CORRUPT') || msg.toLowerCase().includes('malformed')) {
    return new AppError({
      code: ERROR_CODES.SQLITE_CORRUPT,
      category: 'internal',
      title: 'SQLite database is corrupt',
      clientDetail: 'The database file appears to be corrupt',
      cause: err,
    });
  }
  return new AppError({
    code,
    category: 'internal',
    title: 'SQLite database operation failed',
    clientDetail: 'The database could not be opened or closed',
    cause: err,
  });
}

export function validatePolicy(policy: SqlitePolicy): void {
  if (policy.walMode !== undefined && typeof policy.walMode !== 'boolean') {
    throw new AppError({
      code: ERROR_CODES.SQLITE_UNSAFE_INPUT,
      category: 'validation',
      title: 'SQLite policy walMode must be a boolean',
      clientDetail: 'walMode must be true or false',
    });
  }
  if (policy.readOnly !== undefined && typeof policy.readOnly !== 'boolean') {
    throw new AppError({
      code: ERROR_CODES.SQLITE_UNSAFE_INPUT,
      category: 'validation',
      title: 'SQLite policy readOnly must be a boolean',
      clientDetail: 'readOnly must be true or false',
    });
  }
  if (policy.busyTimeoutMs !== undefined) {
    const t = policy.busyTimeoutMs;
    if (
      typeof t !== 'number' ||
      !Number.isFinite(t) ||
      !Number.isSafeInteger(t) ||
      t < 0 ||
      t > MAX_BUSY_TIMEOUT_MS
    ) {
      throw new AppError({
        code: ERROR_CODES.SQLITE_UNSAFE_INPUT,
        category: 'validation',
        title: 'SQLite policy busyTimeoutMs is invalid',
        clientDetail: 'busyTimeoutMs must be a non-negative safe integer (0 to 300000 ms)',
      });
    }
  }
}

function applyPolicy(rawDb: DatabaseSync, path: string, policy: SqlitePolicy): void {
  const isMemory = path === MEMORY_PATH;
  if (policy.walMode !== false && !isMemory) {
    rawDb.exec('PRAGMA journal_mode=WAL');
  }
  // busyTimeoutMs is validated to be a safe integer; coerce with Number() as an extra guard.
  const timeout = policy.busyTimeoutMs ?? DEFAULT_BUSY_TIMEOUT_MS;
  rawDb.exec(`PRAGMA busy_timeout=${Number(timeout)}`);
}

function startSpan(operation: string) {
  const tracer = getTracer(TRACER_NAME);
  return tracer.startSpan(`codegraph.sqlite.${operation}`, {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OPERATION]: operation,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ADAPTER]: ADAPTER_NAME,
    },
  });
}

function endSpanOk(span: ReturnType<ReturnType<typeof getTracer>['startSpan']>): void {
  span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'success');
  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

function endSpanError(span: ReturnType<ReturnType<typeof getTracer>['startSpan']>, err: unknown): void {
  const code = err instanceof AppError ? err.code : ERROR_CODES.SQLITE_OPEN_FAILED;
  span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
  span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
  span.setStatus({ code: SpanStatusCode.ERROR, message: code });
  span.end();
}

export async function openSqliteDatabase(options: SqliteOpenOptions = {}): Promise<SqliteDatabase> {
  const span = startSpan('open');
  try {
    const dbPath = resolveDbPath(options);
    validateDbPath(dbPath);
    checkSymlinkSafety(dbPath);

    const policy = options.policy ?? {};
    validatePolicy(policy);

    if (dbPath !== MEMORY_PATH) {
      await mkdir(dirname(dbPath), { recursive: true }).catch(() => {});
    }

    let rawDb: DatabaseSync;
    try {
      rawDb = new DatabaseSync(dbPath, { readOnly: policy.readOnly ?? false });
    } catch (err) {
      throw classifyOpenError(err, ERROR_CODES.SQLITE_OPEN_FAILED);
    }

    applyPolicy(rawDb, dbPath, policy);

    const db: SqliteDatabase = {
      path: dbPath,
      adapter: ADAPTER_NAME,
      close() { rawDb.close(); },
    };
    handleMap.set(db, rawDb);

    endSpanOk(span);
    return db;
  } catch (err) {
    endSpanError(span, err);
    if (err instanceof AppError) throw err;
    throw classifyOpenError(err, ERROR_CODES.SQLITE_OPEN_FAILED);
  }
}

export async function createSqliteDatabase(options: SqliteCreateOptions = {}): Promise<SqliteDatabase> {
  const db = await openSqliteDatabase(options);
  if (options.migrations && options.migrations.length > 0) {
    try {
      await runMigrations(db, options.migrations);
    } catch (err) {
      db.close();
      throw err;
    }
  }
  return db;
}

export async function closeSqliteDatabase(db: SqliteDatabase): Promise<void> {
  const span = startSpan('close');
  try {
    db.close();
    handleMap.delete(db);
    endSpanOk(span);
  } catch (err) {
    endSpanError(span, err);
    if (err instanceof AppError) throw err;
    throw classifyOpenError(err, ERROR_CODES.SQLITE_OPEN_FAILED);
  }
}

export { startSpan, endSpanOk, endSpanError, TRACER_NAME };
