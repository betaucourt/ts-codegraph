import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runLoad } from '../../src/commands/load.js';
import {
  buildApiReferenceDto,
  buildPackageOverviewDto,
  packageOverviewDtoSchema,
  apiReferenceDtoSchema,
} from '../../src/projection/index.js';
import { buildDiagnosticId, buildPackageId } from '../../src/dataset/ids.js';
import { closeDataset, insertDiagnostic, openDataset, type Dataset } from '../../src/dataset/index.js';

const FIXTURE = resolve('test/fixtures/load/fixture-load-tiny');
const PACKAGE_NAME = '@fixture/load-tiny';
const TS = '2026-07-07T00:00:00.000Z';

let dataDir: string;
let dataset: Dataset;
let packageId: string;
let projectId: string;
let snapshotId: string;

beforeAll(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'ts-codegraph-proj-'));
  const load = await runLoad({ projectPath: FIXTURE, dataDirOverride: dataDir, timestamp: TS });
  projectId = load.envelope.data.projectId;
  snapshotId = load.envelope.data.snapshotId;
  packageId = buildPackageId({ projectId, packageName: PACKAGE_NAME, manifestPath: 'package.json' });
  dataset = await openDataset(projectId, { immutable: true, dataDirOverride: dataDir });
});

afterAll(async () => {
  closeDataset(dataset);
  await rm(dataDir, { recursive: true, force: true });
});

describe('projection — package-overview DTO', () => {
  it('projects the eight top-level keys and validates against the schema', () => {
    const outcome = buildPackageOverviewDto(dataset, packageId, snapshotId);
    expect(outcome.status).toBe('ok');
    if (outcome.status !== 'ok') return;
    expect(Object.keys(outcome.dto).sort()).toEqual([
      'diagnostics',
      'evidence',
      'exports',
      'meta',
      'pkg',
      'project',
      'repository',
      'symbols',
    ]);
    expect(packageOverviewDtoSchema.safeParse(outcome.dto).success).toBe(true);
    expect(outcome.dto.pkg.name).toBe(PACKAGE_NAME);
    expect(outcome.dto.meta.templateId).toBe('ts-codegraph.package-overview@1');
    expect(outcome.dto.meta.datasetSchemaVersion).toBe('ts-codegraph.dataset@1');
    // Default meta timestamp is the normalized fixture timestamp (not wall clock).
    expect(outcome.dto.meta.generatedTimestamp).toBe('2026-07-03T00:00:00+02:00');
  });

  it('is plain JSON that round-trips through JSON.stringify/parse unchanged', () => {
    const outcome = buildPackageOverviewDto(dataset, packageId, snapshotId);
    if (outcome.status !== 'ok') throw new Error('expected ok');
    const roundTripped = JSON.parse(JSON.stringify(outcome.dto));
    expect(roundTripped).toEqual(outcome.dto);
  });

  it('applies the optional-fact policy: absent facts collapse the section present flag', () => {
    const outcome = buildPackageOverviewDto(dataset, packageId, snapshotId);
    if (outcome.status !== 'ok') throw new Error('expected ok');
    // fixture-load-tiny has no diagnostics -> section absent; has exports/symbols/evidence -> present.
    expect(outcome.dto.diagnostics.present).toBe(false);
    expect(outcome.dto.diagnostics.items).toEqual([]);
    expect(outcome.dto.exports.present).toBe(true);
    expect(outcome.dto.symbols.present).toBe(true);
    expect(outcome.dto.evidence.present).toBe(true);
    for (const s of [outcome.dto.exports, outcome.dto.symbols, outcome.dto.evidence, outcome.dto.diagnostics]) {
      expect(s.present).toBe(s.items.length > 0);
    }
  });

  it('orders projection queries explicitly (deterministic; two projections deeply equal)', () => {
    const first = buildPackageOverviewDto(dataset, packageId, snapshotId);
    const second = buildPackageOverviewDto(dataset, packageId, snapshotId);
    if (first.status !== 'ok' || second.status !== 'ok') throw new Error('expected ok');
    expect(second.dto).toEqual(first.dto);
    const symbolNames = first.dto.symbols.items.map((s) => s.name);
    expect(symbolNames).toEqual([...symbolNames].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    const exportPaths = first.dto.exports.items.map((e) => e.exportPath);
    expect(exportPaths).toEqual([...exportPaths].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });
});

describe('projection — api-reference DTO', () => {
  it('projects per-symbol signature, source citation, and optional evidence', () => {
    const outcome = buildApiReferenceDto(dataset, packageId, snapshotId);
    expect(outcome.status).toBe('ok');
    if (outcome.status !== 'ok') return;
    expect(apiReferenceDtoSchema.safeParse(outcome.dto).success).toBe(true);
    const bySymbol = new Map(outcome.dto.symbols.items.map((s) => [s.name, s]));
    const widget = bySymbol.get('Widget');
    expect(widget?.signatureText).toBe('export class Widget');
    expect(widget?.sourceRef.path).toBe('src/index.ts');
    expect(widget?.sourceRef.startLine).toBeGreaterThan(0);
    expect(widget?.evidence.present).toBe(true);
    // UtilMode has no JSDoc -> optional evidence absent for that symbol.
    expect(bySymbol.get('UtilMode')?.evidence.present).toBe(false);
    expect(bySymbol.get('UtilMode')?.evidence.text).toBe('');
  });
});

describe('projection — skip decisions before render', () => {
  it('skips with GENERATE_REQUIRED_FACT_MISSING when the package is absent', () => {
    const outcome = buildPackageOverviewDto(dataset, 'package:v1:0000000000000000', snapshotId);
    expect(outcome.status).toBe('skip');
    if (outcome.status !== 'skip') return;
    expect(outcome.diagnostics[0]?.code).toBe('GENERATE_REQUIRED_FACT_MISSING');
  });

  it('skips api-reference with GENERATE_REQUIRED_FACT_MISSING when no symbols exist', () => {
    const outcome = buildApiReferenceDto(dataset, 'package:v1:0000000000000000', snapshotId);
    expect(outcome.status).toBe('skip');
  });

  it('fails DTO validation BEFORE render with GENERATE_DTO_INVALID on out-of-contract data', async () => {
    // Fresh dataset; seed a diagnostic with an out-of-enum severity so the projected
    // DTO fails schema validation (a stable, pre-render skip).
    const dir = await mkdtemp(join(tmpdir(), 'ts-codegraph-proj-bad-'));
    try {
      const load = await runLoad({ projectPath: FIXTURE, dataDirOverride: dir, timestamp: TS });
      const seededSnapshot = load.envelope.data.snapshotId;
      const seededPackage = buildPackageId({
        projectId: load.envelope.data.projectId,
        packageName: PACKAGE_NAME,
        manifestPath: 'package.json',
      });
      const writable = await openDataset(load.envelope.data.projectId, { dataDirOverride: dir });
      insertDiagnostic(writable, {
        id: buildDiagnosticId({ snapshotId: seededSnapshot, code: 'X_BAD', locationKey: 'seed' }),
        snapshotId: seededSnapshot,
        code: 'X_BAD',
        severity: 'critical',
        message: 'out-of-contract severity',
      });
      closeDataset(writable);

      const reader = await openDataset(load.envelope.data.projectId, { immutable: true, dataDirOverride: dir });
      try {
        const outcome = buildPackageOverviewDto(reader, seededPackage, seededSnapshot);
        expect(outcome.status).toBe('skip');
        if (outcome.status !== 'skip') return;
        expect(outcome.diagnostics[0]?.code).toBe('GENERATE_DTO_INVALID');
      } finally {
        closeDataset(reader);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
