import { createHash } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { AppError, ERROR_CODES } from '../internal/errors/index.js';
import { readPackageManifest } from '../internal/repo-inventory/index.js';
import { createAtomicWritePlan, commitWritePlan } from '../internal/source-files/index.js';

import { deriveProjectKey } from './check.js';
import {
  createDiagnostic,
  DiagnosticCodes,
  NORMALIZED_FIXTURE_TIMESTAMP,
  parseGenerateEnvelope,
  type Diagnostic,
  type GenerateData,
  type GenerateEnvelope,
} from '../contracts/index.js';
import { buildProjectId } from '../dataset/ids.js';
import { DATASET_SCHEMA_ID, DATASET_SCHEMA_VERSION } from '../dataset/schema.js';
import { resolveDatasetPaths } from '../dataset/open.js';
import {
  closeDataset,
  insertGeneratedDoc,
  openDataset,
  selectPackage,
  withDatasetTransaction,
  type Dataset,
} from '../dataset/index.js';
import { managedAll, managedRun } from '../dataset/sqlite-runtime.js';
import { buildApiReferenceDto, buildPackageOverviewDto } from '../projection/index.js';
import { buildDocument, conceptPathFor, type GeneratedDocRecord, type SectionRecord } from '../generate/document.js';
import { loadPack, type LoadedPack, type TemplateName } from '../generate/packs.js';

/**
 * `ts-codegraph generate docs` (step-06b). Reads the loaded dataset only (nothing from
 * `src/extractor/`); per doc: projection -> DTO validation -> render -> OKF
 * validation -> atomic write plan -> manifest + `generated_doc` rows, all from one
 * in-memory structure. `--output` is required for any write. Returns a validated
 * `ts-codegraph.generate@1` envelope.
 */

export const GENERATE_TOOL_VERSION = '0.0.0';
const PACK_VERSION = '1.0.0';

export type GenerateTemplate = TemplateName | 'all';

export interface RunGenerateOptions {
  readonly projectPath: string;
  readonly template: GenerateTemplate;
  readonly outputDir?: string;
  readonly dataDirOverride?: string;
  readonly normalizedTimestamp?: string;
  readonly toolVersion?: string;
}

export interface GenerateOutcome {
  readonly envelope: GenerateEnvelope;
  readonly ok: boolean;
  readonly exitCode: number;
  readonly writtenFiles: readonly string[];
}

/** A refusal carries a stable diagnostic (e.g. missing `--output`, missing dataset). */
export class GenerateRefusedError extends Error {
  readonly diagnostic: Diagnostic;
  constructor(diagnostic: Diagnostic) {
    super(diagnostic.message);
    this.name = 'GenerateRefusedError';
    this.diagnostic = diagnostic;
  }
}

interface SkippedDoc {
  readonly id: string;
  readonly conceptPath: string;
  readonly templateId: string;
  readonly reasonCode: Diagnostic['code'];
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function templatesFor(template: GenerateTemplate): readonly TemplateName[] {
  return template === 'all' ? ['package-overview', 'api-reference'] : [template];
}

function skipReasonId(snapshotId: string, packName: string, conceptPath: string): string {
  return `generated-doc:skip:${sha256Hex(`${snapshotId} ${packName} ${conceptPath}`).slice(0, 16)}`;
}

export async function runGenerate(options: RunGenerateOptions): Promise<GenerateOutcome> {
  const projectRoot = resolve(options.projectPath);
  const manifest = await readPackageManifest(join(projectRoot, 'package.json'), projectRoot);
  const projectId = buildProjectId(deriveProjectKey(manifest.name, projectRoot));

  if (options.outputDir === undefined) {
    throw new GenerateRefusedError(
      createDiagnostic({
        code: DiagnosticCodes.GENERATE_OUTPUT_REQUIRED,
        severity: 'error',
        message: 'generate docs requires an explicit --output directory before writing.',
        suggestedAction: 'Pass --output <dir> to choose where generated docs are written.',
      }),
    );
  }

  const paths = resolveDatasetPaths(
    projectId,
    options.dataDirOverride !== undefined ? { dataDirOverride: options.dataDirOverride } : {},
  );
  if (!(await pathExists(paths.dbPath))) {
    throw new GenerateRefusedError(
      createDiagnostic({
        code: DiagnosticCodes.GENERATE_DATASET_MISSING,
        severity: 'error',
        message: 'No dataset for this project; nothing to generate from.',
        suggestedAction: 'Run `ts-codegraph load` before generating (generate never parses source).',
      }),
    );
  }

  const outputRoot = resolve(options.outputDir);
  if (!isAbsolute(outputRoot)) {
    throw new GenerateRefusedError(
      createDiagnostic({
        code: DiagnosticCodes.GENERATE_OUTPUT_REQUIRED,
        severity: 'error',
        message: 'The --output path must resolve to an absolute directory.',
      }),
    );
  }

  const normalizedTimestamp = options.normalizedTimestamp ?? NORMALIZED_FIXTURE_TIMESTAMP;
  const toolVersion = options.toolVersion ?? GENERATE_TOOL_VERSION;

  const dataset = await openDataset(
    projectId,
    options.dataDirOverride !== undefined ? { dataDirOverride: options.dataDirOverride } : {},
  );
  try {
    const snapshotRows = managedAll<{ id: string }>(dataset.db, 'SELECT id FROM snapshot ORDER BY id', []);
    const snapshotId = snapshotRows[0]?.id;
    if (snapshotId === undefined) {
      throw new AppError({
        code: ERROR_CODES.NOT_FOUND,
        category: 'not_found',
        title: 'dataset has no snapshot',
        clientDetail: 'Run `ts-codegraph load` to populate the dataset.',
      });
    }

    const packageIds = managedAll<{ id: string }>(dataset.db, 'SELECT id FROM package ORDER BY id', []).map((r) => r.id);
    const templates = templatesFor(options.template);
    const packs = new Map<TemplateName, LoadedPack>();
    for (const name of templates) {
      packs.set(name, await loadPack(name));
    }

    const records: GeneratedDocRecord[] = [];
    const skipped: SkippedDoc[] = [];
    const diagnostics: Diagnostic[] = [];

    for (const packageId of packageIds) {
      const pkg = selectPackage(dataset, packageId);
      if (pkg === undefined) continue;
      for (const name of templates) {
        const pack = packs.get(name)!;
        const projected =
          name === 'package-overview'
            ? buildPackageOverviewDto(dataset, packageId, snapshotId, { normalizedTimestamp, toolVersion, templateVersion: PACK_VERSION })
            : buildApiReferenceDto(dataset, packageId, snapshotId, { normalizedTimestamp, toolVersion, templateVersion: PACK_VERSION });

        if (projected.status === 'skip') {
          const conceptPath = conceptPathFor(pack, pkg.name);
          const reason = projected.diagnostics[0];
          diagnostics.push(...projected.diagnostics);
          skipped.push({
            id: skipReasonId(snapshotId, pack.manifest.packName, conceptPath),
            conceptPath,
            templateId: pack.manifest.packName,
            reasonCode: reason?.code ?? DiagnosticCodes.GENERATE_REQUIRED_FACT_MISSING,
          });
          continue;
        }

        const built = buildDocument(pack, name, projected.dto);
        if (built.status === 'skip') {
          diagnostics.push(...built.diagnostics);
          skipped.push({
            id: skipReasonId(snapshotId, pack.manifest.packName, built.conceptPath),
            conceptPath: built.conceptPath,
            templateId: pack.manifest.packName,
            reasonCode: built.reasonCode,
          });
          continue;
        }
        records.push(built.record);
      }
    }

    // One in-memory structure -> manifest FILE, envelope, and generated_doc rows.
    const manifestFile = {
      manifestId: `manifest:v1:${sha256Hex(`${snapshotId} ${options.template}`).slice(0, 16)}`,
      snapshotId,
      datasetSchemaVersion: DATASET_SCHEMA_ID,
      templatePack: { packName: options.template, packVersion: PACK_VERSION },
      documents: records.map((r) => ({
        docId: r.docId,
        templateId: r.templateId,
        templateVersion: r.templateVersion,
        conceptPath: r.conceptPath,
        contentHash: r.contentHash,
        sections: r.sections.map((s) => sectionJson(s)),
      })),
      skipped: skipped.map((s) => ({ docId: s.id, templateId: s.templateId, conceptPath: s.conceptPath, reasonCode: s.reasonCode })),
    };
    const manifestJson = `${JSON.stringify(manifestFile, null, 2)}\n`;
    const manifestContentHash = `sha256:${sha256Hex(manifestJson)}`;

    // Atomic write plan: validated docs + manifest only (skipped docs are not written).
    const plan = createAtomicWritePlan(outputRoot, [
      ...records.map((r) => ({ relativePath: r.conceptPath, content: r.content })),
      { relativePath: 'manifest.json', content: manifestJson },
    ]);
    await commitWritePlan(plan);

    // generated_doc metadata from the same records; idempotent for the snapshot.
    withDatasetTransaction(dataset, () => {
      managedRun(dataset.db, 'DELETE FROM generated_doc WHERE snapshot_id = ?', [snapshotId]);
      for (const r of records) {
        insertGeneratedDoc(dataset, {
          id: r.docId,
          snapshotId,
          templateId: r.templateId,
          templateVersion: r.templateVersion,
          conceptPath: r.conceptPath,
          contentHash: r.contentHash,
          datasetSchemaVersion: DATASET_SCHEMA_VERSION,
        });
      }
    });

    const envelope = buildGenerateEnvelope({
      snapshotId,
      template: options.template,
      normalizedTimestamp,
      toolVersion,
      records,
      skipped,
      diagnostics,
      manifestContentHash,
      manifestId: manifestFile.manifestId,
    });

    return {
      envelope,
      ok: envelope.ok,
      exitCode: envelope.ok ? 0 : 1,
      writtenFiles: [...records.map((r) => r.conceptPath), 'manifest.json'],
    };
  } finally {
    closeDataset(dataset);
  }
}

function sectionJson(section: SectionRecord): Record<string, string> {
  return {
    sectionId: section.sectionId,
    slotId: section.slotId,
    heading: section.heading,
    headingSlug: section.headingSlug,
    ...(section.symbolId !== undefined ? { symbolId: section.symbolId } : {}),
  };
}

interface EnvelopeParts {
  readonly snapshotId: string;
  readonly template: GenerateTemplate;
  readonly normalizedTimestamp: string;
  readonly toolVersion: string;
  readonly records: readonly GeneratedDocRecord[];
  readonly skipped: readonly SkippedDoc[];
  readonly diagnostics: readonly Diagnostic[];
  readonly manifestContentHash: string;
  readonly manifestId: string;
}

function buildGenerateEnvelope(parts: EnvelopeParts): GenerateEnvelope {
  const errors = parts.diagnostics.filter((d) => d.severity === 'error');
  const warnings = parts.diagnostics.filter((d) => d.severity === 'warning');
  const info = parts.diagnostics.filter((d) => d.severity === 'info');

  const sections = parts.records.flatMap((r) =>
    r.sections.map((s) => ({ sectionId: s.sectionId, slotId: s.slotId, heading: s.heading, headingSlug: s.headingSlug })),
  );

  const data: GenerateData = {
    snapshotId: parts.snapshotId,
    templatePack: { packName: parts.template, packVersion: PACK_VERSION },
    generatedDocs: parts.records.map((r) => ({
      id: r.docId,
      conceptPath: r.conceptPath,
      templateId: r.templateId,
      contentHash: r.contentHash,
    })),
    skippedDocs: parts.skipped.map((s) => ({
      id: s.id,
      conceptPath: s.conceptPath,
      templateId: s.templateId,
      reasonCode: s.reasonCode,
    })),
    manifest: {
      manifestId: parts.manifestId,
      manifestPath: 'manifest.json',
      contentHash: parts.manifestContentHash,
      sections,
    },
    diagnosticSummary: { errors: errors.length, warnings: warnings.length, info: info.length },
    determinismInputs: {
      snapshotId: parts.snapshotId,
      datasetSchemaVersion: DATASET_SCHEMA_ID,
      templatePackVersion: PACK_VERSION,
      normalizedTimestamp: parts.normalizedTimestamp,
    },
  };

  const envelopeInput = {
    ok: parts.records.length > 0,
    diagnostics: errors,
    warnings,
    meta: { toolVersion: parts.toolVersion, datasetSchemaVersion: DATASET_SCHEMA_ID, timestamp: parts.normalizedTimestamp },
    command: 'generate' as const,
    schemaVersion: 'ts-codegraph.generate@1' as const,
    data,
  };

  const parsed = parseGenerateEnvelope(envelopeInput);
  if (!parsed.success) {
    throw new Error('assembled ts-codegraph.generate@1 envelope failed self-validation');
  }
  return parsed.value;
}
