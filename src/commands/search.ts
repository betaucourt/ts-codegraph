import { stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { AppError, ERROR_CODES } from '../internal/errors/index.js';
import { readPackageManifest } from '../internal/repo-inventory/index.js';

import { deriveProjectKey } from './check.js';
import {
  createDiagnostic,
  DiagnosticCodes,
  parseSearchEnvelope,
  type Diagnostic,
  type SearchData,
  type SearchEnvelope,
} from '../contracts/index.js';
import { buildProjectId } from '../dataset/ids.js';
import { DATASET_SCHEMA_ID } from '../dataset/schema.js';
import { resolveDatasetPaths } from '../dataset/open.js';
import { executeSearch } from '../search/execute.js';
import type { SearchKind } from '../search/rank.js';

/**
 * `ts-codegraph search` — read-only retrieval over the loaded dataset (step-05 §3).
 *
 * Resolves the project id (reading the manifest — permitted in the command layer),
 * clamps the limit, runs the read-only `executeSearch`, and assembles a validated
 * `ts-codegraph.search@1` envelope. Empty results are `ok: true`. No write helper is
 * imported here.
 */

export const SEARCH_TOOL_VERSION = '0.0.0';
export const DEFAULT_SEARCH_LIMIT = 20;
export const MAX_SEARCH_LIMIT = 100;
const MAX_QUERY_LENGTH = 200;

export const SEARCH_KINDS: readonly SearchKind[] = ['package', 'file', 'symbol', 'export', 'diagnostic'];

export interface RunSearchOptions {
  readonly projectPath: string;
  readonly query: string;
  readonly kind?: SearchKind;
  readonly limit?: number;
  readonly dataDirOverride?: string;
  readonly timestamp?: string;
}

export interface SearchOutcome {
  readonly envelope: SearchEnvelope;
  readonly ok: boolean;
  readonly exitCode: number;
}

function clampLimit(requested: number | undefined): { readonly effective: number; readonly clamped: boolean } {
  if (requested === undefined || !Number.isFinite(requested)) {
    return { effective: DEFAULT_SEARCH_LIMIT, clamped: false };
  }
  const rounded = Math.trunc(requested);
  const effective = Math.min(MAX_SEARCH_LIMIT, Math.max(1, rounded));
  return { effective, clamped: effective !== rounded };
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export async function runSearch(options: RunSearchOptions): Promise<SearchOutcome> {
  const projectRoot = resolve(options.projectPath);
  const query = options.query.trim();
  if (query.length === 0) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION,
      category: 'validation',
      title: 'a search query is required',
      clientDetail: 'Pass a non-empty query string to search.',
    });
  }

  const manifest = await readPackageManifest(join(projectRoot, 'package.json'), projectRoot);
  const projectId = buildProjectId(deriveProjectKey(manifest.name, projectRoot));

  const paths = resolveDatasetPaths(
    projectId,
    options.dataDirOverride !== undefined ? { dataDirOverride: options.dataDirOverride } : {},
  );
  if (!(await pathExists(paths.dbPath))) {
    throw new AppError({
      code: ERROR_CODES.NOT_FOUND,
      category: 'not_found',
      title: 'no dataset for this project',
      clientDetail: 'Run `ts-codegraph load` before searching.',
    });
  }

  const { effective, clamped } = clampLimit(options.limit);

  const execution = await executeSearch({
    projectId,
    ...(options.dataDirOverride !== undefined ? { dataDirOverride: options.dataDirOverride } : {}),
    query,
    ...(options.kind !== undefined ? { kind: options.kind } : {}),
    limit: effective,
  });

  if (execution.snapshotId.length === 0) {
    throw new AppError({
      code: ERROR_CODES.NOT_FOUND,
      category: 'not_found',
      title: 'dataset has no snapshot',
      clientDetail: 'Run `ts-codegraph load` to populate the dataset.',
    });
  }

  const warnings: Diagnostic[] = [];
  if (clamped) {
    warnings.push(
      createDiagnostic({
        code: DiagnosticCodes.SEARCH_LIMIT_CLAMPED,
        severity: 'warning',
        message: 'Requested result limit was clamped to the allowed range (1-100).',
        safeDetail: { requested: Math.trunc(options.limit ?? DEFAULT_SEARCH_LIMIT), effective },
      }),
    );
  }

  const data: SearchData = {
    query: query.slice(0, MAX_QUERY_LENGTH),
    snapshotId: execution.snapshotId,
    results: [...execution.results],
    resultLimit: effective,
    matchPolicy: { tokenizerVersion: 'identifier-v1', rankingVersion: 'exact-prefix-token-v1' },
  };

  const envelopeInput = {
    ok: true,
    diagnostics: [],
    warnings,
    meta: {
      toolVersion: SEARCH_TOOL_VERSION,
      datasetSchemaVersion: DATASET_SCHEMA_ID,
      timestamp: options.timestamp ?? new Date().toISOString(),
    },
    command: 'search',
    schemaVersion: 'ts-codegraph.search@1',
    data,
  };

  const parsed = parseSearchEnvelope(envelopeInput);
  if (!parsed.success) {
    throw new Error('assembled ts-codegraph.search@1 envelope failed self-validation');
  }
  return { envelope: parsed.value, ok: true, exitCode: 0 };
}
