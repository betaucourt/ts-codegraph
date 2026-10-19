import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod/v4';

import {
  checkEnvelopeSchema,
  generateEnvelopeSchema,
  loadEnvelopeSchema,
  searchEnvelopeSchema,
} from '../src/contracts/envelopes.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutputDir = path.join(repoRoot, 'test', 'fixtures', 'contracts');

export const contractSchemaTargets = [
  {
    id: 'ts-codegraph.check@1',
    title: 'ts-codegraph check envelope',
    fileName: 'ts-codegraph.check@1.schema.json',
    schema: checkEnvelopeSchema,
  },
  {
    id: 'ts-codegraph.load@1',
    title: 'ts-codegraph load envelope',
    fileName: 'ts-codegraph.load@1.schema.json',
    schema: loadEnvelopeSchema,
  },
  {
    id: 'ts-codegraph.search@1',
    title: 'ts-codegraph search envelope',
    fileName: 'ts-codegraph.search@1.schema.json',
    schema: searchEnvelopeSchema,
  },
  {
    id: 'ts-codegraph.generate@1',
    title: 'ts-codegraph generate envelope',
    fileName: 'ts-codegraph.generate@1.schema.json',
    schema: generateEnvelopeSchema,
  },
] as const;

export interface EmittedContractSchema {
  readonly fileName: string;
  readonly content: string;
}

function withSchemaMetadata(
  target: (typeof contractSchemaTargets)[number],
): Record<string, unknown> {
  const emitted = z.toJSONSchema(target.schema, {
    target: 'draft-2020-12',
  }) as Record<string, unknown>;
  const { $schema: _schema, ...rest } = emitted;

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://ts-codegraph.local/contracts/${target.id}.schema.json`,
    title: target.title,
    ...rest,
  };
}

export function generateContractSchemaFiles(): readonly EmittedContractSchema[] {
  return contractSchemaTargets.map((target) => ({
    fileName: target.fileName,
    content: `${JSON.stringify(withSchemaMetadata(target), null, 2)}\n`,
  }));
}

export async function emitContractSchemas(outputDir = defaultOutputDir): Promise<void> {
  await mkdir(outputDir, {
    recursive: true,
  });

  for (const schemaFile of generateContractSchemaFiles()) {
    await writeFile(path.join(outputDir, schemaFile.fileName), schemaFile.content, 'utf8');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await emitContractSchemas();
}
