import { z } from 'zod/v4';

import { normalizedTimestampSchema } from '../contracts/index.js';

/**
 * Projection DTO contracts (`ts-codegraph.package-overview@1`, `ts-codegraph.api-reference@1`).
 *
 * DTOs are plain JSON built by the projection layer and validated **after
 * projection and before render** (step-06 §3). Top-level keys are exactly:
 * `project`, `repository`, `pkg`, `exports`, `symbols`, `diagnostics`, `evidence`,
 * `meta`. Optional sections are modelled as `{ present, items }` where `present`
 * is `true` iff `items` is non-empty — so the template renders sections from the
 * DTO, never from a conditional over maybe-missing data.
 */

const idSchema = z.string().min(1).max(180);
const label = z.string().min(1).max(200);
const bounded = (max: number) => z.string().min(1).max(max);

const projectSchema = z.object({ id: idSchema, name: label }).strict();

const repositorySchema = z
  .object({
    snapshotId: idSchema,
    kind: z.enum(['git-clean', 'git-dirty', 'no-git']),
    baseCommit: z.string().min(1).max(80).optional(),
  })
  .strict();

const dependencySchema = z
  .object({
    name: label,
    kind: z.enum(['runtime', 'dev']),
    versionRange: z.string().min(1).max(80).optional(),
  })
  .strict();

const pkgSchema = z
  .object({
    id: idSchema,
    name: label,
    version: z.string().min(1).max(80).optional(),
    manifestPath: z.string().min(1).max(240),
    description: bounded(400).optional(),
    dependencies: z.array(dependencySchema),
  })
  .strict();

const metaSchema = z
  .object({
    snapshotId: idSchema,
    datasetSchemaVersion: z.literal('ts-codegraph.dataset@1'),
    generatedTimestamp: normalizedTimestampSchema,
    toolVersion: z.string().min(1).max(80),
    templateId: idSchema,
    templateVersion: z.string().min(1).max(80),
  })
  .strict();

/** A DTO section whose `present` flag equals `items` being non-empty. */
function section<T extends z.ZodTypeAny>(itemSchema: T) {
  return z
    .object({ present: z.boolean(), items: z.array(itemSchema) })
    .strict()
    .refine((value) => value.present === (value.items.length > 0), {
      message: 'section.present must equal items being non-empty',
      path: ['present'],
    });
}

const exportItemSchema = z.object({ exportPath: z.string().min(1).max(240) }).strict();

const diagnosticItemSchema = z
  .object({
    code: bounded(80),
    severity: z.enum(['error', 'warning', 'info']),
    message: bounded(300),
  })
  .strict();

const evidenceItemSchema = z
  .object({ symbolId: idSchema, symbolName: label, kind: label, text: bounded(2000) })
  .strict();

const overviewSymbolSchema = z.object({ id: idSchema, name: label, kind: label }).strict();

const sourceRefSchema = z
  .object({
    path: z
      .string()
      .min(1)
      .max(240)
      .refine((v) => !v.startsWith('/') && !v.startsWith('~'), { message: 'source path must be repo-relative' }),
    startLine: z.number().int().positive(),
    endLine: z.number().int().positive(),
  })
  .strict()
  .refine((v) => v.endLine >= v.startLine, { message: 'endLine must be >= startLine', path: ['endLine'] });

const apiSymbolSchema = z
  .object({
    id: idSchema,
    name: label,
    kind: label,
    // Real documented interfaces / const-object types carry inline member JSDoc in
    // their declaration text; the bound accommodates those (surfaced by Step 07 on
    // @codegraph/http-client, whose HttpClientPolicy signature is ~1 KB).
    signatureText: bounded(8000),
    sourceRef: sourceRefSchema,
    evidence: z.object({ present: z.boolean(), text: z.string().max(2000) }).strict(),
  })
  .strict();

export const packageOverviewDtoSchema = z
  .object({
    project: projectSchema,
    repository: repositorySchema,
    pkg: pkgSchema,
    exports: section(exportItemSchema),
    symbols: section(overviewSymbolSchema),
    diagnostics: section(diagnosticItemSchema),
    evidence: section(evidenceItemSchema),
    meta: metaSchema,
  })
  .strict();

export const apiReferenceDtoSchema = z
  .object({
    project: projectSchema,
    repository: repositorySchema,
    pkg: pkgSchema,
    exports: section(exportItemSchema),
    symbols: section(apiSymbolSchema),
    diagnostics: section(diagnosticItemSchema),
    evidence: section(evidenceItemSchema),
    meta: metaSchema,
  })
  .strict();

export type PackageOverviewDto = z.infer<typeof packageOverviewDtoSchema>;
export type ApiReferenceDto = z.infer<typeof apiReferenceDtoSchema>;

export const PACKAGE_OVERVIEW_DTO_SCHEMA_ID = 'ts-codegraph.package-overview@1' as const;
export const API_REFERENCE_DTO_SCHEMA_ID = 'ts-codegraph.api-reference@1' as const;
