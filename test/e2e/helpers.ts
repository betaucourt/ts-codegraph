import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { runCheck } from '../../src/commands/check.js';
import { runLoad } from '../../src/commands/load.js';
import { runSearch } from '../../src/commands/search.js';
import { runGenerate } from '../../src/commands/generate.js';
import { NO_GIT_SUMMARY } from '../helpers/git-summary.js';

/**
 * Shared harness for the Step 07 end-to-end proof. Each target is loaded once into a
 * temp dataset; generation runs against the loaded dataset only (no source parse).
 * `check` runs with an installed pack (`package-overview`) because the built-in
 * default pack name is not shipped — recorded as a consistency drift in step-07-report.
 */

export const NORMALIZED_TS = '2026-07-07T00:00:00.000Z';
export const CHECK_PACK = 'package-overview';

export interface E2eTarget {
  readonly name: string;
  readonly projectPath: string;
  readonly packageSlug: string;
  readonly packageName: string;
  readonly searchSymbols: readonly string[];
}

const WORKSPACE_ROOT = resolve('test/fixtures/real-packages');

export const TARGETS = {
  tiny: {
    name: 'fixture-ts-tiny',
    projectPath: resolve('test/fixtures/load/fixture-load-tiny'),
    packageSlug: 'fixture-load-tiny',
    packageName: '@fixture/load-tiny',
    searchSymbols: ['Widget', 'createWidget'],
  },
  errors: {
    name: 'errors',
    projectPath: join(WORKSPACE_ROOT, 'errors'),
    packageSlug: 'codegraph-errors',
    packageName: '@codegraph/errors',
    searchSymbols: ['AppError'],
  },
  httpClient: {
    name: 'http-client',
    projectPath: join(WORKSPACE_ROOT, 'http-client'),
    packageSlug: 'codegraph-http-client',
    packageName: '@codegraph/http-client',
    searchSymbols: ['HttpClient', 'createHttpClient'],
  },
} as const satisfies Record<string, E2eTarget>;

export async function walk(dir: string, base = dir): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) Object.assign(out, await walk(full, base));
    else out[full.slice(base.length + 1)] = await readFile(full, 'utf8');
  }
  return out;
}

export async function loadTargetDataset(target: E2eTarget): Promise<{ dataDir: string; cleanup: () => Promise<void> }> {
  const dataDir = await mkdtemp(join(tmpdir(), `e2e-${target.name}-`));
  await runLoad({
    projectPath: target.projectPath,
    dataDirOverride: dataDir,
    timestamp: NORMALIZED_TS,
    gitSummaryOverride: NO_GIT_SUMMARY,
  });
  return { dataDir, cleanup: () => rm(dataDir, { recursive: true, force: true }) };
}

export async function checkTarget(target: E2eTarget): ReturnType<typeof runCheck> {
  return runCheck({ projectPath: target.projectPath, templatePack: CHECK_PACK });
}

export async function loadEnvelope(target: E2eTarget): ReturnType<typeof runLoad> {
  const dataDir = await mkdtemp(join(tmpdir(), `e2e-load-${target.name}-`));
  try {
    return await runLoad({
      projectPath: target.projectPath,
      dataDirOverride: dataDir,
      timestamp: NORMALIZED_TS,
      gitSummaryOverride: NO_GIT_SUMMARY,
    });
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

export async function searchTarget(target: E2eTarget, dataDir: string, query: string): ReturnType<typeof runSearch> {
  return runSearch({ projectPath: target.projectPath, query, dataDirOverride: dataDir });
}

export async function generateToTemp(
  target: E2eTarget,
  dataDir: string,
): Promise<{ files: Record<string, string>; envelope: Awaited<ReturnType<typeof runGenerate>>['envelope']; outDir: string }> {
  const outDir = await mkdtemp(join(tmpdir(), `e2e-gen-${target.name}-`));
  const result = await runGenerate({ projectPath: target.projectPath, template: 'all', outputDir: outDir, dataDirOverride: dataDir });
  const files = await walk(outDir);
  return { files, envelope: result.envelope, outDir };
}

/** Count api-reference symbol sections and how many carry JSDoc-derived prose. */
export function apiJsDocCoverage(apiMarkdown: string): { symbols: number; withProse: number } {
  const blocks = apiMarkdown.split(/\n### /).slice(1);
  let withProse = 0;
  for (const block of blocks) {
    const afterFence = block.split('```').slice(2).join('```');
    const prose = afterFence
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('- ') && !line.startsWith('#') && !line.startsWith('##'));
    if (prose.length > 0) withProse += 1;
  }
  return { symbols: blocks.length, withProse };
}
