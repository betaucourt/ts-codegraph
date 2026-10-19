import { readdir, readFile } from 'node:fs/promises';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  NORMALIZED_FIXTURE_TIMESTAMP,
  normalizedTimestampForFixture,
  normalizedTimestampFromSnapshot,
} from '../../src/contracts/timestamp.js';

async function readContractSources(dir: string): Promise<readonly string[]> {
  const entries = await readdir(dir, {
    withFileTypes: true,
  });
  const files: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await readContractSources(absolute)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(await readFile(absolute, 'utf8'));
    }
  }

  return files;
}

describe('normalized timestamp policy', () => {
  it('accepts normalized timestamps supplied by snapshot or fixture policy', () => {
    expect(normalizedTimestampFromSnapshot('2026-07-03T00:00:00+02:00')).toBe(
      '2026-07-03T00:00:00+02:00',
    );
    expect(normalizedTimestampForFixture()).toBe(NORMALIZED_FIXTURE_TIMESTAMP);
  });

  it('rejects non-normalized timestamp values', () => {
    expect(() => normalizedTimestampFromSnapshot('2026-07-03')).toThrow();
  });

  it('keeps contract source paths free of wall-clock calls', async () => {
    const sources = await readContractSources(path.resolve('src/contracts'));
    const joined = sources.join('\n');

    expect(joined).not.toMatch(/\bDate\.now\s*\(/);
    expect(joined).not.toMatch(/\bnew\s+Date\s*\(/);
    expect(joined).not.toMatch(/\bperformance\.now\s*\(/);
  });
});
