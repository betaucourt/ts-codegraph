export interface SqlitePolicy {
  /** Enable WAL journal mode. Default: true. Has no effect on :memory: databases. */
  readonly walMode?: boolean;
  /**
   * SQLite busy_timeout in milliseconds. Default: 5000.
   * Must be a non-negative safe integer between 0 and 300000 (inclusive).
   * Values outside this range are rejected with SQLITE_UNSAFE_INPUT before any SQL executes.
   */
  readonly busyTimeoutMs?: number;
  /** Open in read-only mode. Default: false. */
  readonly readOnly?: boolean;
}

export interface SqliteOpenOptions {
  /** Absolute path to the database file, or ':memory:' for in-memory. */
  readonly path?: string;
  /** App name used with @codegraph/app-paths when path is not provided. Default: 'codegraph-sqlite'. */
  readonly app?: string;
  /** Database filename (without .db extension) used with app-paths. Default: 'default'. */
  readonly name?: string;
  /** PRAGMA policy applied after open. */
  readonly policy?: SqlitePolicy;
}

export interface SqliteCreateOptions extends SqliteOpenOptions {
  /** Migrations to run after opening. */
  readonly migrations?: readonly SqliteMigration[];
}

export interface SqliteDatabase {
  readonly path: string;
  readonly adapter: string;
  close(): void;
}

export interface SqliteMigration {
  /** Unique identifier for this migration, e.g. '001_create_users'. */
  readonly id: string;
  /** SQL DDL/DML to execute. Must be deterministic — checksum is verified on re-run. */
  readonly sql: string;
}

export interface SqliteRunMigrationsOptions {
  /** Verify checksums on already-applied migrations. Default: true. */
  readonly verifyChecksums?: boolean;
}

export interface SqliteMigrationResult {
  readonly applied: number;
  readonly skipped: number;
  readonly migrations: readonly {
    readonly id: string;
    readonly checksum: string;
  }[];
}

export interface SqliteTransactionOptions {
  /**
   * Transaction mode. Default: 'deferred'.
   * Only 'deferred', 'immediate', and 'exclusive' are accepted; other values are
   * rejected at runtime with SQLITE_UNSAFE_INPUT before any SQL executes.
   */
  readonly mode?: 'deferred' | 'immediate' | 'exclusive';
}

export interface SqliteFtsDefinition {
  readonly tableName: string;
  readonly columns: readonly string[];
  /** Content table name for content-based FTS5 tables. */
  readonly contentTable?: string;
}

export interface SqliteFtsOptions {
  /** Create the table only if it does not exist. Default: true. */
  readonly ifNotExists?: boolean;
}

export interface SqliteHealthOptions {
  /** Run PRAGMA integrity_check. Default: true. */
  readonly checkIntegrity?: boolean;
}

export interface SqliteHealthResult {
  readonly ok: boolean;
  readonly integrityPassed: boolean;
  readonly walEnabled: boolean;
}

export interface SqliteAdapter {
  readonly name: string;
  open(path: string, policy: SqlitePolicy): SqliteDatabase;
}
