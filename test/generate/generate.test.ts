import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runLoad } from '../../src/commands/load.js';
import { GenerateRefusedError, runGenerate } from '../../src/commands/generate.js';
import { buildDocument } from '../../src/generate/document.js';
import { loadPack } from '../../src/generate/packs.js';
import { buildApiReferenceDto, buildPackageOverviewDto } from '../../src/projection/index.js';
import { validateGeneratedDoc } from '../../src/contracts/index.js';
import { buildGeneratedSectionId, buildProjectId } from '../../src/dataset/ids.js';
import { deriveProjectKey } from '../../src/commands/check.js';
import { closeDataset, openDataset } from '../../src/dataset/index.js';
import { managedAll } from '../../src/dataset/sqlite-runtime.js';
import { NO_GIT_SUMMARY } from '../helpers/git-summary.js';

const DET_FIXTURE = resolve('test/fixtures/generate/fixture-generate-determinism');
const ME_FIXTURE = resolve('test/fixtures/generate/fixture-generate-missing-evidence');
const NOSYM_FIXTURE = resolve('test/fixtures/generate/fixture-generate-no-symbols');
const EXPECTED_DIR = resolve('test/fixtures/generate/expected/fixture-generate-determinism');
const TS = '2026-07-07T00:00:00.000Z';

async function walk(dir: string, base = dir): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) Object.assign(out, await walk(full, base));
    else out[full.slice(base.length + 1)] = await readFile(full, 'utf8');
  }
  return out;
}

async function loadFixture(fixture: string): Promise<string> {
  const dataDir = await mkdtemp(join(tmpdir(), 'ts-codegraph-gen-'));
  await runLoad({
    projectPath: fixture,
    dataDirOverride: dataDir,
    timestamp: TS,
    gitSummaryOverride: NO_GIT_SUMMARY,
  });
  return dataDir;
}

describe('generate — two-run determinism', () => {
  let dataDir: string;
  const cleanup: string[] = [];

  beforeAll(async () => {
    dataDir = await loadFixture(DET_FIXTURE);
    cleanup.push(dataDir);
  });
  afterAll(async () => {
    for (const dir of cleanup) await rm(dir, { recursive: true, force: true });
  });

  it('produces byte-identical files and identical content hashes across two runs', async () => {
    const out1 = await mkdtemp(join(tmpdir(), 'gen-out1-'));
    const out2 = await mkdtemp(join(tmpdir(), 'gen-out2-'));
    cleanup.push(out1, out2);
    const r1 = await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out1, dataDirOverride: dataDir });
    const r2 = await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out2, dataDirOverride: dataDir });

    const files1 = await walk(out1);
    const files2 = await walk(out2);
    expect(Object.keys(files1).sort()).toEqual(Object.keys(files2).sort());
    for (const key of Object.keys(files1)) {
      expect(files2[key]).toBe(files1[key]);
    }
    expect(r1.envelope.data.generatedDocs.map((d) => d.contentHash)).toEqual(
      r2.envelope.data.generatedDocs.map((d) => d.contentHash),
    );
    expect(r1.envelope.data.manifest.contentHash).toBe(r2.envelope.data.manifest.contentHash);
  });

  it('matches the committed sample docs (regeneration is stable)', async () => {
    const out = await mkdtemp(join(tmpdir(), 'gen-out-sample-'));
    cleanup.push(out);
    await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
    const expected = await walk(EXPECTED_DIR);
    const actual = await walk(out);
    for (const [rel, content] of Object.entries(expected)) {
      expect(actual[rel], `mismatch in ${rel}`).toBe(content);
    }
  });

  it('emits a validated ts-codegraph.generate@1 envelope with enumerated determinism inputs', async () => {
    const out = await mkdtemp(join(tmpdir(), 'gen-out-env-'));
    cleanup.push(out);
    const { envelope } = await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
    expect(envelope.command).toBe('generate');
    expect(envelope.schemaVersion).toBe('ts-codegraph.generate@1');
    expect(envelope.data.determinismInputs).toMatchObject({
      datasetSchemaVersion: 'ts-codegraph.dataset@1',
      templatePackVersion: '1.0.0',
      normalizedTimestamp: '2026-07-03T00:00:00+02:00',
    });
    expect(envelope.data.determinismInputs.snapshotId).toBe(envelope.data.snapshotId);
    // Frontmatter timestamp is the normalized snapshot-policy value, not wall clock.
    for (const content of Object.values(await walk(out))) {
      if (content.startsWith('---')) {
        expect(content).toContain('timestamp: "2026-07-03T00:00:00+02:00"');
      }
    }
  });

  it('anchors sections by slot ID (per-symbol sections embed the symbol stable id), not heading text', async () => {
    const out = await mkdtemp(join(tmpdir(), 'gen-out-anchor-'));
    cleanup.push(out);
    const { envelope } = await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
    const manifest = JSON.parse((await walk(out))['manifest.json']!);
    const apiDoc = manifest.documents.find((d: { templateId: string }) => d.templateId === 'api-reference');
    const symbolSections = apiDoc.sections.filter((s: { slotId: string }) => s.slotId === 'symbol');
    expect(symbolSections.length).toBeGreaterThan(0);
    for (const section of symbolSections) {
      expect(section.symbolId).toBeTruthy();
      // sectionId derives from (docId, slotId, symbolId) — independent of heading text.
      expect(section.sectionId).toBe(
        buildGeneratedSectionId({ generatedDocId: apiDoc.docId, slotId: 'symbol', symbolId: section.symbolId }),
      );
    }
    // distinct symbols -> distinct section ids
    const ids = symbolSections.map((s: { sectionId: string }) => s.sectionId);
    expect(new Set(ids).size).toBe(ids.length);
    // envelope manifest sections carry the slot id and slug, never rely on heading text for the id
    for (const section of envelope.data.manifest.sections) {
      expect(section.slotId.length).toBeGreaterThan(0);
    }
  });

  it('agrees field-for-field between the manifest documents and the generated_doc rows', async () => {
    const out = await mkdtemp(join(tmpdir(), 'gen-out-agree-'));
    cleanup.push(out);
    await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
    const manifest = JSON.parse((await walk(out))['manifest.json']!);

    const projectId = buildProjectId(deriveProjectKey('@fixture/gen-determinism', DET_FIXTURE));
    const dataset = await openDataset(projectId, { immutable: true, dataDirOverride: dataDir });
    try {
      const rows = managedAll<{
        id: string;
        template_id: string;
        template_version: string;
        concept_path: string;
        content_hash: string;
        snapshot_id: string;
      }>(
        dataset.db,
        'SELECT id, template_id, template_version, concept_path, content_hash, snapshot_id FROM generated_doc ORDER BY concept_path',
        [],
      );
      expect(rows.length).toBe(manifest.documents.length);
      for (const doc of manifest.documents) {
        const row = rows.find((r) => r.id === doc.docId);
        expect(row, `no generated_doc row for ${doc.docId}`).toBeDefined();
        expect(row!.concept_path).toBe(doc.conceptPath);
        expect(row!.content_hash).toBe(doc.contentHash);
        expect(row!.template_id).toBe(doc.templateId);
        expect(row!.template_version).toBe(doc.templateVersion);
        expect(row!.snapshot_id).toBe(manifest.snapshotId);
      }
    } finally {
      closeDataset(dataset);
    }
  });

  it('generates only template boilerplate, facts, and citations (no deferred sections)', async () => {
    const out = await mkdtemp(join(tmpdir(), 'gen-out-noinvent-'));
    cleanup.push(out);
    await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
    for (const [rel, content] of Object.entries(await walk(out))) {
      if (!rel.endsWith('.md')) continue;
      for (const banned of ['Quick Start', 'switchMap', 'Reverse Dep']) {
        expect(content, `${rel} must not contain ${banned}`).not.toContain(banned);
      }
      // OKF + safety validation holds for the generated body.
      const [, body] = content.split(/\n---\n/);
      const okf = validateGeneratedDoc({ type: 'x', title: 'x', description: 'x', resource: 'x', tags: ['x'], timestamp: '2026-07-03T00:00:00+02:00', generated_by: 'ts-codegraph generate', schema_version: 'x', source_snapshot: 'x', template_id: 'x', template_version: 'x', dataset_schema_version: 'ts-codegraph.dataset@1' }, body ?? '');
      // body-safety rules produce no diagnostics (frontmatter here is a stand-in).
      const safetyCodes = okf.diagnostics.filter((d) => d.code.startsWith('SAFETY_'));
      expect(safetyCodes).toEqual([]);
    }
  });
});

describe('generate — missing evidence and required-gap skips', () => {
  it('omits optional sections and invents no prose when evidence is absent', async () => {
    const dataDir = await loadFixture(ME_FIXTURE);
    const out = await mkdtemp(join(tmpdir(), 'gen-out-me-'));
    try {
      const { envelope } = await runGenerate({ projectPath: ME_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
      expect(envelope.data.generatedDocs.length).toBe(2);
      const files = await walk(out);
      const overview = Object.entries(files).find(([k]) => k.endsWith('overview.md'))![1];
      const api = Object.entries(files).find(([k]) => k.endsWith('api-reference.md'))![1];
      // No dependencies (package has none) and no documentation-evidence lines (no JSDoc).
      expect(overview).not.toContain('## Dependencies');
      expect(overview).not.toContain('documentation evidence');
      expect(overview).toContain('## Sources Used');
      // API reference lists signatures + citations but no JSDoc prose block.
      expect(api).toContain('export function toggle(value: boolean): boolean');
      expect(api).toContain('`src/index.ts:');
    } finally {
      await rm(dataDir, { recursive: true, force: true });
      await rm(out, { recursive: true, force: true });
    }
  });

  it('skips a required-gap doc (no symbols) and reports it in skippedDocs, unwritten', async () => {
    const dataDir = await loadFixture(NOSYM_FIXTURE);
    const out = await mkdtemp(join(tmpdir(), 'gen-out-nosym-'));
    try {
      const { envelope } = await runGenerate({ projectPath: NOSYM_FIXTURE, template: 'all', outputDir: out, dataDirOverride: dataDir });
      const skippedApi = envelope.data.skippedDocs.find((d) => d.templateId === 'api-reference');
      expect(skippedApi).toBeDefined();
      expect(skippedApi!.reasonCode).toBe('GENERATE_REQUIRED_FACT_MISSING');
      const files = await walk(out);
      // The skipped api-reference file was never written; the overview was.
      expect(Object.keys(files).some((k) => k.endsWith('api-reference.md'))).toBe(false);
      expect(Object.keys(files).some((k) => k.endsWith('overview.md'))).toBe(true);
    } finally {
      await rm(dataDir, { recursive: true, force: true });
      await rm(out, { recursive: true, force: true });
    }
  });

  it('skips a doc that fails OKF validation BEFORE any write (evidence section missing)', async () => {
    const dataDir = await loadFixture(DET_FIXTURE);
    try {
      const projectId = buildProjectId(deriveProjectKey('@fixture/gen-determinism', DET_FIXTURE));
      const dataset = await openDataset(projectId, { immutable: true, dataDirOverride: dataDir });
      try {
        const snapshotId = managedAll<{ id: string }>(dataset.db, 'SELECT id FROM snapshot ORDER BY id', [])[0]!.id;
        const packageId = managedAll<{ id: string }>(dataset.db, 'SELECT id FROM package ORDER BY id', [])[0]!.id;
        const projected = buildPackageOverviewDto(dataset, packageId, snapshotId);
        expect(projected.status).toBe('ok');
        if (projected.status !== 'ok') return;
        const realPack = await loadPack('package-overview');
        // A template with no `## Sources Used` section fails the OKF evidence rule.
        const badPack = { ...realPack, templateSource: '# {{pkg.name}}\n\n## Objective\n\nNothing else.\n' };
        const result = buildDocument(badPack, 'package-overview', projected.dto);
        expect(result.status).toBe('skip');
        if (result.status !== 'skip') return;
        expect(result.reasonCode).toBe('OKF_EVIDENCE_SECTION_MISSING');
      } finally {
        closeDataset(dataset);
      }
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });
});

describe('generate — explicit output and no-dataset refusals', () => {
  it('refuses without --output and writes nothing (stable diagnostic)', async () => {
    const dataDir = await loadFixture(DET_FIXTURE);
    try {
      await expect(runGenerate({ projectPath: DET_FIXTURE, template: 'all', dataDirOverride: dataDir })).rejects.toMatchObject({
        diagnostic: { code: 'GENERATE_OUTPUT_REQUIRED' },
      });
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });

  it('refuses with no dataset (never parses source) and writes nothing', async () => {
    const emptyDataDir = await mkdtemp(join(tmpdir(), 'gen-empty-'));
    const out = await mkdtemp(join(tmpdir(), 'gen-out-nodata-'));
    try {
      let refused: unknown;
      try {
        await runGenerate({ projectPath: DET_FIXTURE, template: 'all', outputDir: out, dataDirOverride: emptyDataDir });
      } catch (error) {
        refused = error;
      }
      expect(refused).toBeInstanceOf(GenerateRefusedError);
      expect((refused as GenerateRefusedError).diagnostic.code).toBe('GENERATE_DATASET_MISSING');
      // Nothing written — no source access, no output.
      expect(await readdir(out)).toEqual([]);
    } finally {
      await rm(emptyDataDir, { recursive: true, force: true });
      await rm(out, { recursive: true, force: true });
    }
  });
});
