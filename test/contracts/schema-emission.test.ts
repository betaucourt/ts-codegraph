import { mkdtemp, readFile, rm } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  emitContractSchemas,
  generateContractSchemaFiles,
} from '../../scripts/emit-schemas.js';

describe('emitted JSON Schema contracts', () => {
  it('matches committed schema fixtures', async () => {
    for (const schemaFile of generateContractSchemaFiles()) {
      const committed = await readFile(
        path.join('test', 'fixtures', 'contracts', schemaFile.fileName),
        'utf8',
      );

      expect(schemaFile.content).toBe(committed);
    }
  });

  it('regenerates byte-identical schema files', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'ts-codegraph-contracts-'));

    try {
      await emitContractSchemas(tempDir);

      for (const schemaFile of generateContractSchemaFiles()) {
        const regenerated = await readFile(path.join(tempDir, schemaFile.fileName), 'utf8');

        expect(regenerated).toBe(schemaFile.content);
      }
    } finally {
      await rm(tempDir, {
        recursive: true,
        force: true,
      });
    }
  });
});
