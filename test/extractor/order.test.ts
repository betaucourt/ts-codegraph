import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { extractPackageFacts } from '../../src/extractor/index.js';

const ORDER_ROOT = resolve('test/fixtures/extractor/fixture-order');

function sourceFile(root: string, repoRelativePath: string) {
  return { repoRelativePath, absolutePath: resolve(root, repoRelativePath) };
}

describe('extractor determinism — locale-independent (F2)', () => {
  it('orders declarations by code-unit key, not host locale collation', async () => {
    const facts = await extractPackageFacts({
      packageName: 'fixture-order',
      tsConfigFilePath: resolve(ORDER_ROOT, 'tsconfig.json'),
      sourceFiles: [sourceFile(ORDER_ROOT, 'src/mixed.ts')],
    });

    // All four constants share one file and kind, so the tie-break is the name.
    // Code-unit order is fixed and environment-independent. A locale-sensitive
    // comparator (localeCompare) would yield ['a_b','ab','Ab','AB'] and fail here.
    expect(facts.declarations.map((declaration) => declaration.name)).toEqual([
      'AB',
      'Ab',
      'a_b',
      'ab',
    ]);
  });
});
