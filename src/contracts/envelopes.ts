import { z } from 'zod/v4';

import {
  DiagnosticCodes,
  type Diagnostic,
  type DiagnosticCode,
  createValidationDiagnostic,
  diagnosticSchema,
} from './diagnostics.js';
import { normalizedTimestampSchema } from './timestamp.js';

const idSchema = z.string().min(1).max(180);
const safeLabelSchema = z.string().min(1).max(200);
const relativePathSchema = z
  .string()
  .min(1)
  .max(240)
  .refine((value) => !value.startsWith('/'), {
    message: 'path must be relative',
  })
  .refine((value) => !value.startsWith('~'), {
    message: 'path must not use a home shortcut',
  });

const schemaVersion = {
  check: 'ts-codegraph.check@1',
  load: 'ts-codegraph.load@1',
  search: 'ts-codegraph.search@1',
  generate: 'ts-codegraph.generate@1',
} as const;

export const envelopeMetaSchema = z
  .object({
    toolVersion: z.string().min(1).max(80),
    datasetSchemaVersion: z.literal('ts-codegraph.dataset@1'),
    timestamp: normalizedTimestampSchema,
  })
  .strict();

const statusSchema = z.enum(['pass', 'fail', 'warn', 'skip']);

const diagnosticSummarySchema = z
  .object({
    errors: z.number().int().nonnegative(),
    warnings: z.number().int().nonnegative(),
    info: z.number().int().nonnegative(),
  })
  .strict();

const envelopeBaseSchema = z.object({
  ok: z.boolean(),
  diagnostics: z.array(diagnosticSchema),
  warnings: z.array(diagnosticSchema),
  meta: envelopeMetaSchema,
});

export const checkPreflightCheckSchema = z
  .object({
    id: idSchema,
    label: safeLabelSchema,
    status: statusSchema,
    diagnostics: z.array(diagnosticSchema),
  })
  .strict();

export const checkTemplateReadinessSchema = z
  .object({
    ok: z.boolean(),
    packs: z.array(
      z
        .object({
          packName: idSchema,
          packVersion: z.string().min(1).max(80),
          templateCount: z.number().int().nonnegative(),
        })
        .strict(),
    ),
  })
  .strict();

export const checkDatabaseReadinessSchema = z
  .object({
    ok: z.boolean(),
    policy: z.enum(['app-managed', 'not-created']),
    datasetSchemaVersion: z.literal('ts-codegraph.dataset@1'),
  })
  .strict();

export const checkDataSchema = z
  .object({
    preflightChecks: z.array(checkPreflightCheckSchema),
    templateReadiness: checkTemplateReadinessSchema,
    databaseReadiness: checkDatabaseReadinessSchema,
    willWrite: z.literal(false),
  })
  .strict();

export const checkEnvelopeSchema = envelopeBaseSchema
  .extend({
    command: z.literal('check'),
    schemaVersion: z.literal(schemaVersion.check),
    data: checkDataSchema,
  })
  .strict();

const changeRecordSchema = z
  .object({
    kind: z.enum([
      'project',
      'snapshot',
      'package',
      'source-file',
      'export',
      'symbol',
      'diagnostic',
      'search-document',
    ]),
    id: idSchema,
  })
  .strict();

const skippedRecordSchema = changeRecordSchema
  .extend({
    reasonCode: diagnosticSchema.shape.code,
  })
  .strict();

export const loadCountsSchema = z
  .object({
    projects: z.number().int().nonnegative(),
    snapshots: z.number().int().nonnegative(),
    packages: z.number().int().nonnegative(),
    sourceFiles: z.number().int().nonnegative(),
    exports: z.number().int().nonnegative(),
    symbols: z.number().int().nonnegative(),
    signatures: z.number().int().nonnegative(),
    evidence: z.number().int().nonnegative(),
    diagnostics: z.number().int().nonnegative(),
    searchDocuments: z.number().int().nonnegative(),
  })
  .strict();

export const searchIndexStatusSchema = z
  .object({
    status: z.enum(['ready', 'skipped', 'failed']),
    documentCount: z.number().int().nonnegative(),
    tokenizerVersion: z.literal('identifier-v1'),
  })
  .strict();

export const loadDataSchema = z
  .object({
    projectId: idSchema,
    snapshotId: idSchema,
    loadRunId: idSchema,
    counts: loadCountsSchema,
    changed: z.array(changeRecordSchema),
    skipped: z.array(skippedRecordSchema),
    diagnosticSummary: diagnosticSummarySchema,
    searchIndexStatus: searchIndexStatusSchema,
  })
  .strict();

export const loadEnvelopeSchema = envelopeBaseSchema
  .extend({
    command: z.literal('load'),
    schemaVersion: z.literal(schemaVersion.load),
    data: loadDataSchema,
  })
  .strict();

const matchReasonSchema = z.enum([
  'exact_label',
  'prefix_label',
  'symbol_token',
  'package_name',
  'file_path',
  'export_name',
  'diagnostic_code',
]);

export const searchResultSchema = z
  .object({
    id: idSchema,
    kind: z.enum(['package', 'file', 'symbol', 'export', 'diagnostic', 'generated-doc']),
    label: safeLabelSchema,
    context: z.string().min(1).max(280),
    rank: z.number().finite().nonnegative(),
    matchReasons: z.array(matchReasonSchema).min(1),
  })
  .strict();

export const searchMatchPolicySchema = z
  .object({
    tokenizerVersion: z.literal('identifier-v1'),
    rankingVersion: z.literal('exact-prefix-token-v1'),
  })
  .strict();

export const searchDataSchema = z
  .object({
    query: z.string().min(1).max(200),
    snapshotId: idSchema,
    results: z.array(searchResultSchema),
    resultLimit: z.number().int().positive().max(100),
    matchPolicy: searchMatchPolicySchema,
  })
  .strict();

export const searchEnvelopeSchema = envelopeBaseSchema
  .extend({
    command: z.literal('search'),
    schemaVersion: z.literal(schemaVersion.search),
    data: searchDataSchema,
  })
  .strict();

const templatePackReferenceSchema = z
  .object({
    packName: idSchema,
    packVersion: z.string().min(1).max(80),
  })
  .strict();

const generatedDocSummarySchema = z
  .object({
    id: idSchema,
    conceptPath: relativePathSchema,
    templateId: idSchema,
    contentHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  })
  .strict();

const skippedDocSummarySchema = z
  .object({
    id: idSchema,
    conceptPath: relativePathSchema,
    templateId: idSchema,
    reasonCode: diagnosticSchema.shape.code,
  })
  .strict();

const manifestSectionSchema = z
  .object({
    sectionId: idSchema,
    slotId: idSchema,
    heading: safeLabelSchema,
    headingSlug: idSchema,
  })
  .strict();

export const generationManifestSchema = z
  .object({
    manifestId: idSchema,
    manifestPath: relativePathSchema,
    contentHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    sections: z.array(manifestSectionSchema),
  })
  .strict();

export const determinismInputsSchema = z
  .object({
    snapshotId: idSchema,
    datasetSchemaVersion: z.literal('ts-codegraph.dataset@1'),
    templatePackVersion: z.string().min(1).max(80),
    normalizedTimestamp: normalizedTimestampSchema,
  })
  .strict();

export const generateDataSchema = z
  .object({
    snapshotId: idSchema,
    templatePack: templatePackReferenceSchema,
    generatedDocs: z.array(generatedDocSummarySchema),
    skippedDocs: z.array(skippedDocSummarySchema),
    manifest: generationManifestSchema,
    diagnosticSummary: diagnosticSummarySchema,
    determinismInputs: determinismInputsSchema,
  })
  .strict();

export const generateEnvelopeSchema = envelopeBaseSchema
  .extend({
    command: z.literal('generate'),
    schemaVersion: z.literal(schemaVersion.generate),
    data: generateDataSchema,
  })
  .strict();

export const commandEnvelopeSchemas = Object.freeze({
  check: checkEnvelopeSchema,
  load: loadEnvelopeSchema,
  search: searchEnvelopeSchema,
  generate: generateEnvelopeSchema,
});

export const commandEnvelopeSchemaVersions = Object.freeze(schemaVersion);

export type EnvelopeMeta = z.infer<typeof envelopeMetaSchema>;
export type CheckData = z.infer<typeof checkDataSchema>;
export type CheckEnvelope = z.infer<typeof checkEnvelopeSchema>;
export type LoadData = z.infer<typeof loadDataSchema>;
export type LoadEnvelope = z.infer<typeof loadEnvelopeSchema>;
export type SearchData = z.infer<typeof searchDataSchema>;
export type SearchEnvelope = z.infer<typeof searchEnvelopeSchema>;
export type GenerateData = z.infer<typeof generateDataSchema>;
export type GenerateEnvelope = z.infer<typeof generateEnvelopeSchema>;
export type CommandEnvelope = CheckEnvelope | LoadEnvelope | SearchEnvelope | GenerateEnvelope;

export type ContractParseResult<T> =
  | {
      readonly success: true;
      readonly value: T;
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly Diagnostic[];
    };

function parseContract<T>(
  schema: z.ZodType<T>,
  input: unknown,
  code: DiagnosticCode,
): ContractParseResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      value: result.data,
    };
  }

  return {
    success: false,
    diagnostics: [
      createValidationDiagnostic(code, 'Contract validation failed.', {
        issueCount: result.error.issues.length,
      }),
    ],
  };
}

export function parseCheckEnvelope(input: unknown): ContractParseResult<CheckEnvelope> {
  return parseContract(checkEnvelopeSchema, input, DiagnosticCodes.CHECK_ENVELOPE_INVALID);
}

export function parseLoadEnvelope(input: unknown): ContractParseResult<LoadEnvelope> {
  return parseContract(loadEnvelopeSchema, input, DiagnosticCodes.LOAD_ENVELOPE_INVALID);
}

export function parseSearchEnvelope(input: unknown): ContractParseResult<SearchEnvelope> {
  return parseContract(searchEnvelopeSchema, input, DiagnosticCodes.SEARCH_ENVELOPE_INVALID);
}

export function parseGenerateEnvelope(input: unknown): ContractParseResult<GenerateEnvelope> {
  return parseContract(generateEnvelopeSchema, input, DiagnosticCodes.GENERATE_ENVELOPE_INVALID);
}
