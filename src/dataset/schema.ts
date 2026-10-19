import { validateIdentifier } from '../internal/sqlite/index.js';

/**
 * Product-local `ts-codegraph.dataset@1` schema constants (kickoff §5, step-02 §3).
 *
 * This module names the durable-fact tables, the FTS surface, and the columns
 * that later steps read and write. The concrete DDL lives in
 * `migrations/001-init.ts`; the constants here are the single source of truth for
 * introspection tests, row helpers, and identifier validation.
 *
 * Scope is Now only: the fourteen fact tables plus the search FTS table. No
 * Next/Later tables (`generated_section`, `citation`) and no speculative tables
 * (`calls`, `switch_maps`, telemetry, security, relationship, or graph tables)
 * exist by construction — see `FORBIDDEN_TABLES`.
 */

/** Dataset schema identity, versioned from day one. */
export const DATASET_SCHEMA_ID = 'ts-codegraph.dataset@1' as const;

/** Numeric dataset schema version stored on `load_run` and `generated_doc`. */
export const DATASET_SCHEMA_VERSION = 1 as const;

/**
 * The fourteen Now fact tables, in the logical order of the fact model
 * (`docs/features/load.md` minimum fact model).
 */
export const DATASET_TABLES = [
  'project',
  'snapshot',
  'load_run',
  'package',
  'package_export',
  'package_dependency',
  'source_file',
  'source_file_version',
  'symbol',
  'signature',
  'evidence',
  'diagnostic',
  'search_document',
  'generated_doc',
] as const;

export type DatasetTable = (typeof DATASET_TABLES)[number];

/** Standalone FTS5 search index populated from `search_document` facts. */
export const SEARCH_DOCUMENT_FTS_TABLE = 'search_document_fts' as const;

/**
 * FTS5 columns. `search_doc_id` and `symbol_id` are stored `UNINDEXED` so results
 * carry stable public IDs without being tokenized; the remaining columns are the
 * searchable text derived from facts (never raw source).
 */
export const SEARCH_DOCUMENT_FTS_COLUMNS = [
  'search_doc_id',
  'symbol_id',
  'package_name',
  'symbol_name',
  'qualified_name',
  'tokens',
] as const;

/**
 * Tables that must never appear in a `ts-codegraph.dataset@1` dataset. `generated_section`
 * and `citation` are Next scope; the rest are explicitly rejected speculative
 * surfaces (decision record, step-02 §4). Tests assert none of these exist.
 */
export const FORBIDDEN_TABLES = [
  'generated_section',
  'generated_sections',
  'citation',
  'citations',
  'calls',
  'switch_maps',
  'switchmaps',
  'telemetry',
  'security',
  'relationship',
  'relationships',
  'graph',
  'graphs',
] as const;

/**
 * Defensive build-time check: every table and FTS identifier this module names
 * passes the shared `@codegraph/sqlite` identifier validator. Called when the
 * migration SQL is assembled so an unsafe identifier can never reach SQLite.
 */
export function assertDatasetIdentifiersSafe(): void {
  for (const table of DATASET_TABLES) {
    validateIdentifier(table);
  }
  validateIdentifier(SEARCH_DOCUMENT_FTS_TABLE);
  for (const column of SEARCH_DOCUMENT_FTS_COLUMNS) {
    validateIdentifier(column);
  }
}

/**
 * The `CREATE VIRTUAL TABLE` statement for the search FTS index. Identifiers are
 * validated with the shared validator before the SQL string is built, satisfying
 * the "validate every dynamic identifier" rule even though the identifiers are
 * static.
 */
export function buildSearchFtsCreateStatement(): string {
  assertDatasetIdentifiersSafe();
  const columns = SEARCH_DOCUMENT_FTS_COLUMNS.map((column, index) =>
    index <= 1 ? `${column} UNINDEXED` : column,
  ).join(', ');
  return `CREATE VIRTUAL TABLE IF NOT EXISTS ${SEARCH_DOCUMENT_FTS_TABLE} USING fts5(${columns});`;
}
