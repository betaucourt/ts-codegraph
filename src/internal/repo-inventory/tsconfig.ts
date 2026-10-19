import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/repo-inventory-entities.js';
import { safePositiveInt } from './utils.js';
import type { FindTsconfigOptions } from './types.js';

const TRACER_NAME = 'codegraph.repo-inventory';
const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', '.turbo',
]);
const DEFAULT_MAX_TSCONFIG_FILES = 100;

export async function findTsconfigFiles(
  root: string,
  opts?: FindTsconfigOptions,
): Promise<readonly string[]> {
  const maxFiles = safePositiveInt(opts?.maxFiles, DEFAULT_MAX_TSCONFIG_FILES, 10_000);
  const results: string[] = [];

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.repo_inventory.tsconfig', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OPERATION]: 'tsconfig' },
  });

  try {
    async function walk(dir: string): Promise<void> {
      if (results.length >= maxFiles) return;
      let entries;
      try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }

      for (const entry of entries) {
        if (results.length >= maxFiles) break;
        const name = entry.name;
        if (entry.isDirectory()) {
          if (DEFAULT_IGNORE_DIRS.has(name) || name.startsWith('.')) continue;
          await walk(join(dir, name));
        } else if (entry.isFile()) {
          if (name === 'tsconfig.json' || (name.startsWith('tsconfig.') && name.endsWith('.json'))) {
            results.push(join(dir, name));
          }
        }
      }
    }

    await walk(root);
    results.sort();

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return results;
  } catch (err) {
    // No tsconfig-specific error code; use AppError code when available
    const code = err instanceof AppError ? err.code : ERROR_CODES.REPO_INVENTORY_LIMIT_EXCEEDED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw err;
  }
}
