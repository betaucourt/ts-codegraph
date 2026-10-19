import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

import { describe, expect, it } from 'vitest';

import {
  appendLoadTimingEntry,
  runLoad,
  summarizeTimings,
  type LoadTimingEntry,
} from '../../src/commands/load.js';
import { NO_GIT_SUMMARY } from '../helpers/git-summary.js';

const require = createRequire(import.meta.url);
// The pinned ts-morph version from package.json (no ts-morph import in tests).
const TS_MORPH_VERSION = (require('../../package.json') as { dependencies: Record<string, string> })
  .dependencies['ts-morph'];
const TS = '2026-07-07T00:00:00.000Z';

async function measure(target: string, projectPath: string, runs: number): Promise<LoadTimingEntry> {
  const samplesMs: number[] = [];
  for (let index = 0; index < runs; index += 1) {
    const dir = await mkdtemp(join(tmpdir(), 'ts-codegraph-load-timing-'));
    const start = performance.now();
    await runLoad({
      projectPath,
      dataDirOverride: dir,
      timestamp: TS,
      gitSummaryOverride: NO_GIT_SUMMARY,
    });
    samplesMs.push(performance.now() - start);
    await rm(dir, { recursive: true, force: true });
  }
  return summarizeTimings({ target, samplesMs, tsMorph: TS_MORPH_VERSION ?? 'unknown' });
}

describe('ts-codegraph load — performance timing harness', () => {
  it('writes well-formed baseline entries for the tiny fixture and @codegraph/errors', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ts-codegraph-load-baseline-'));
    const baseline = join(dir, 'load-timings.json');
    await writeFile(baseline, '[]\n', 'utf8');

    try {
      const tinyEntry = await measure('fixture-load-tiny', resolve('test/fixtures/load/fixture-load-tiny'), 3);
      const errorsEntry = await measure('@codegraph/errors', resolve('test/fixtures/real-packages/errors'), 3);
      await appendLoadTimingEntry(baseline, tinyEntry);
      await appendLoadTimingEntry(baseline, errorsEntry);

      const written = JSON.parse(await readFile(baseline, 'utf8')) as LoadTimingEntry[];
      for (const target of ['fixture-load-tiny', '@codegraph/errors']) {
        const entry = written.find((item) => item.target === target);
        expect(entry, `entry for ${target}`).toBeDefined();
        expect(typeof entry?.medianMs).toBe('number');
        expect(entry?.medianMs).toBeGreaterThanOrEqual(0);
        expect(typeof entry?.p95Ms).toBe('number');
        expect(entry?.runs).toBe(3);
        expect(entry?.node).toBe(process.version);
        expect(entry?.tsMorph).toBe(TS_MORPH_VERSION);
        expect(entry?.datasetSchema).toBe('ts-codegraph.dataset@1');
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }, 30_000);
});
