import type { SqliteMigration } from '../../internal/sqlite/index.js';

import { buildSearchFtsCreateStatement } from '../schema.js';

/**
 * The single numbered migration that creates the `ts-codegraph.dataset@1` schema
 * (step-02 §3). One migration, no destructive statements, re-run as a no-op by
 * the product-local migration runner (which mirrors `@codegraph/sqlite`
 * `runMigrations`: an `_migrations` table keyed by id with a sha256 checksum).
 *
 * Every table uses explicit column types, `NOT NULL` where the fact model
 * requires it, `WITHOUT ROWID` with a public-ID `TEXT PRIMARY KEY` (so SQLite
 * numeric row ids never exist to leak), and foreign keys into the tables it
 * depends on. Tables are created in dependency order.
 *
 * Fact-model constraints (decision record §6, load feature spec):
 *  - `source_file`/`source_file_version` store a repo-relative path and content
 *    hash, never full source text.
 *  - `signature.signature_text` is declaration text only, never a body.
 *  - `evidence.text` is sanitized, bounded JSDoc/comment text.
 *  - `generated_doc` stores template id/version, snapshot, concept path, and a
 *    content hash — never rendered bytes.
 */

const TABLE_STATEMENTS = `
CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS snapshot (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id),
  kind TEXT NOT NULL,
  base_commit TEXT,
  included_file_count INTEGER NOT NULL,
  dirty_file_count INTEGER
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS load_run (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id),
  snapshot_id TEXT NOT NULL REFERENCES snapshot(id),
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  tool_version TEXT,
  dataset_schema_version INTEGER NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS package (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id),
  name TEXT NOT NULL,
  version TEXT,
  manifest_path TEXT NOT NULL,
  description TEXT
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS source_file (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES snapshot(id),
  package_id TEXT REFERENCES package(id),
  repo_relative_path TEXT NOT NULL,
  content_hash TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS source_file_version (
  id TEXT PRIMARY KEY,
  source_file_id TEXT NOT NULL REFERENCES source_file(id),
  content_hash TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS symbol (
  id TEXT PRIMARY KEY,
  source_file_version_id TEXT NOT NULL REFERENCES source_file_version(id),
  package_id TEXT REFERENCES package(id),
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  exported INTEGER NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER,
  start_column INTEGER,
  end_column INTEGER
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS signature (
  id TEXT PRIMARY KEY,
  symbol_id TEXT NOT NULL REFERENCES symbol(id),
  signature_text TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  symbol_id TEXT NOT NULL REFERENCES symbol(id),
  evidence_kind TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  text TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS package_export (
  package_id TEXT NOT NULL REFERENCES package(id),
  export_path TEXT NOT NULL,
  symbol_id TEXT REFERENCES symbol(id),
  PRIMARY KEY (package_id, export_path)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS package_dependency (
  package_id TEXT NOT NULL REFERENCES package(id),
  dependency_name TEXT NOT NULL,
  dependency_kind TEXT NOT NULL,
  version_range TEXT,
  PRIMARY KEY (package_id, dependency_name, dependency_kind)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS diagnostic (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES snapshot(id),
  load_run_id TEXT REFERENCES load_run(id),
  code TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  location_key TEXT,
  source_path TEXT,
  source_line INTEGER,
  source_end_line INTEGER
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS search_document (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES snapshot(id),
  symbol_id TEXT NOT NULL REFERENCES symbol(id),
  package_name TEXT,
  symbol_name TEXT NOT NULL,
  kind TEXT NOT NULL,
  qualified_name TEXT,
  tokens TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS generated_doc (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES snapshot(id),
  template_id TEXT NOT NULL,
  template_version TEXT NOT NULL,
  concept_path TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  dataset_schema_version INTEGER NOT NULL
) WITHOUT ROWID;
`;

function buildInitSql(): string {
  return `${TABLE_STATEMENTS}\n${buildSearchFtsCreateStatement()}\n`;
}

/** The one numbered migration for the `ts-codegraph.dataset@1` schema. */
export const initMigration: SqliteMigration = {
  id: '001-init',
  sql: buildInitSql(),
};
