import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runLoad } from '../../src/commands/load.js';
import { NORMALIZED_TS } from './helpers.js';
import { NO_GIT_SUMMARY } from '../helpers/git-summary.js';

/**
 * Performance regression gate (decision record §5): 3× the recorded baseline median
 * per target, enforced as an active assertion. The baseline was measured first and
 * committed to test/fixtures/e2e/performance-baseline.json; this test re-measures the
 * median of three loads per target and asserts it stays under the recorded 3× threshold.
 * The multiplier gives headroom for machine variance; loosening it requires a
 * decision-record update.
 */

interface Baseline {
  readonly regressionMultiplier: number;
  readonly targets: Record<string, { readonly medianMs: number; readonly thresholdMs: number }>;
}

const TARGET_PATHS: Record<string, string> = {
  'fixture-ts-tiny': resolve('test/fixtures/load/fixture-load-tiny'),
  errors: resolve('../../packages/errors'),
  workspace: resolve('../..'),
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

async function timedLoadMedian(projectPath: string, runs = 3): Promise<number> {
  const samples: number[] = [];
  for (let i = 0; i < runs; i += 1) {
    const dataDir = await mkdtemp(join(tmpdir(), 'perf-'));
    const start = process.hrtime.bigint();
    await runLoad({
      projectPath,
      dataDirOverride: dataDir,
      timestamp: NORMALIZED_TS,
      gitSummaryOverride: NO_GIT_SUMMARY,
    });
    samples.push(Number(process.hrtime.bigint() - start) / 1e6);
    await rm(dataDir, { recursive: true, force: true });
  }
  return median(samples);
}

describe('e2e — load performance regression (3x recorded baseline median)', () => {
  const performanceIt = process.env.TS_CODEGRAPH_RUN_PERFORMANCE === '1' ? it : it.skip;

  performanceIt('every target stays under its recorded 3x-median threshold', async () => {
    const baseline = JSON.parse(
      await readFile(resolve('test/fixtures/e2e/performance-baseline.json'), 'utf8'),
    ) as Baseline;
    expect(baseline.regressionMultiplier).toBe(3);

    for (const [name, spec] of Object.entries(baseline.targets)) {
      const projectPath = TARGET_PATHS[name];
      expect(projectPath, `no path for baseline target ${name}`).toBeDefined();
      const observedMedian = await timedLoadMedian(projectPath!);
      expect(
        observedMedian,
        `${name}: observed median ${observedMedian.toFixed(1)}ms exceeds 3x baseline (${spec.thresholdMs}ms; baseline median ${spec.medianMs}ms)`,
      ).toBeLessThanOrEqual(spec.thresholdMs);
    }
  }, 60_000);
});
