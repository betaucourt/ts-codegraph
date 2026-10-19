import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/sqlite-entities.js';
import { getHandle } from './database.js';
import type { SqliteDatabase, SqliteFtsDefinition, SqliteFtsOptions } from './types.js';

const TRACER_NAME = 'codegraph.sqlite';
const ADAPTER_NAME = 'node-sqlite';
const SAFE_IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateIdentifier(name: string): void {
  if (!name || !SAFE_IDENTIFIER_RE.test(name)) {
    throw new AppError({
      code: ERROR_CODES.SQLITE_UNSAFE_INPUT,
      category: 'validation',
      title: 'Invalid SQLite identifier',
      clientDetail: 'SQLite identifiers must start with a letter or underscore and contain only letters, numbers, and underscores',
    });
  }
}

export async function createFtsTable(
  db: SqliteDatabase,
  definition: SqliteFtsDefinition,
  options?: SqliteFtsOptions,
): Promise<void> {
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.sqlite.fts', {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OPERATION]: 'fts',
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ADAPTER]: ADAPTER_NAME,
    },
  });

  try {
    validateIdentifier(definition.tableName);
    if (!definition.columns || definition.columns.length === 0) {
      throw new AppError({
        code: ERROR_CODES.SQLITE_UNSAFE_INPUT,
        category: 'validation',
        title: 'FTS table must have at least one column',
        clientDetail: 'At least one column must be specified for the FTS table',
      });
    }
    for (const col of definition.columns) {
      validateIdentifier(col);
    }
    if (definition.contentTable !== undefined) {
      validateIdentifier(definition.contentTable);
    }

    const rawDb = getHandle(db);
    const ifNotExists = options?.ifNotExists !== false ? 'IF NOT EXISTS' : '';
    const colList = definition.columns.join(', ');
    const contentClause = definition.contentTable !== undefined
      ? `, content=${definition.contentTable}`
      : '';
    const sql = `CREATE VIRTUAL TABLE ${ifNotExists} ${definition.tableName} USING fts5(${colList}${contentClause})`;

    try {
      rawDb.exec(sql);
    } catch (err) {
      throw new AppError({
        code: ERROR_CODES.SQLITE_FTS_FAILED,
        category: 'internal',
        title: 'FTS5 table creation failed',
        clientDetail: 'The full-text search table could not be created',
        cause: err,
      });
    }

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.SQLITE_FTS_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SQLITE_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    if (err instanceof AppError) throw err;
    throw new AppError({
      code: ERROR_CODES.SQLITE_FTS_FAILED,
      category: 'internal',
      title: 'FTS operation failed',
      clientDetail: 'The full-text search operation could not complete',
      cause: err,
    });
  }
}
