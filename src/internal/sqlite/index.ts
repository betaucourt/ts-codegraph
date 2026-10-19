export type {
  SqlitePolicy,
  SqliteOpenOptions,
  SqliteCreateOptions,
  SqliteDatabase,
  SqliteMigration,
  SqliteRunMigrationsOptions,
  SqliteMigrationResult,
  SqliteTransactionOptions,
  SqliteFtsDefinition,
  SqliteFtsOptions,
  SqliteHealthOptions,
  SqliteHealthResult,
  SqliteAdapter,
} from './types.js';

export {
  openSqliteDatabase,
  createSqliteDatabase,
  closeSqliteDatabase,
} from './database.js';

export { runMigrations } from './migrations.js';

export { withTransaction } from './transaction.js';

export { createFtsTable, validateIdentifier } from './fts.js';

export { checkSqliteHealth } from './health.js';

export {
  ERROR_CODES,
  ENTITY_IDS,
  TELEMETRY_ATTRIBUTES,
} from './generated/sqlite-entities.js';
export type {
  ErrorCode as SqliteErrorCode,
  EntityId,
  AttributeName,
} from './generated/sqlite-entities.js';
