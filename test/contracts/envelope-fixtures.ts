import type {
  CheckEnvelope,
  GenerateEnvelope,
  LoadEnvelope,
  SearchEnvelope,
} from '../../src/contracts/envelopes.js';

const meta = {
  toolVersion: '0.0.0',
  datasetSchemaVersion: 'ts-codegraph.dataset@1',
  timestamp: '2026-07-03T00:00:00+02:00',
} as const;

const contentHash = `sha256:${'a'.repeat(64)}`;

export const validCheckEnvelope: CheckEnvelope = {
  command: 'check',
  schemaVersion: 'ts-codegraph.check@1',
  ok: true,
  data: {
    preflightChecks: [
      {
        id: 'check:v1:project-readable',
        label: 'project readable',
        status: 'pass',
        diagnostics: [],
      },
    ],
    templateReadiness: {
      ok: true,
      packs: [
        {
          packName: 'package-overview',
          packVersion: '0.1.0',
          templateCount: 1,
        },
      ],
    },
    databaseReadiness: {
      ok: true,
      policy: 'app-managed',
      datasetSchemaVersion: 'ts-codegraph.dataset@1',
    },
    willWrite: false,
  },
  diagnostics: [],
  warnings: [],
  meta,
};

export const validLoadEnvelope: LoadEnvelope = {
  command: 'load',
  schemaVersion: 'ts-codegraph.load@1',
  ok: true,
  data: {
    projectId: 'project:v1:ts-codegraph',
    snapshotId: 'snapshot:v1:ts-codegraph:git:abcdef',
    loadRunId: 'load-run:v1:ts-codegraph:abcdef',
    counts: {
      projects: 1,
      snapshots: 1,
      packages: 1,
      sourceFiles: 2,
      exports: 3,
      symbols: 4,
      signatures: 4,
      evidence: 2,
      diagnostics: 0,
      searchDocuments: 7,
    },
    changed: [
      {
        kind: 'snapshot',
        id: 'snapshot:v1:ts-codegraph:git:abcdef',
      },
    ],
    skipped: [],
    diagnosticSummary: {
      errors: 0,
      warnings: 0,
      info: 0,
    },
    searchIndexStatus: {
      status: 'ready',
      documentCount: 7,
      tokenizerVersion: 'identifier-v1',
    },
  },
  diagnostics: [],
  warnings: [],
  meta,
};

export const validSearchEnvelope: SearchEnvelope = {
  command: 'search',
  schemaVersion: 'ts-codegraph.search@1',
  ok: true,
  data: {
    query: 'AppError',
    snapshotId: 'snapshot:v1:ts-codegraph:git:abcdef',
    results: [
      {
        id: 'symbol:v1:ts-codegraph:apperror',
        kind: 'symbol',
        label: 'AppError',
        context: 'packages/errors/src/core.ts:1-80',
        rank: 1,
        matchReasons: ['exact_label'],
      },
    ],
    resultLimit: 20,
    matchPolicy: {
      tokenizerVersion: 'identifier-v1',
      rankingVersion: 'exact-prefix-token-v1',
    },
  },
  diagnostics: [],
  warnings: [],
  meta,
};

export const validGenerateEnvelope: GenerateEnvelope = {
  command: 'generate',
  schemaVersion: 'ts-codegraph.generate@1',
  ok: true,
  data: {
    snapshotId: 'snapshot:v1:ts-codegraph:git:abcdef',
    templatePack: {
      packName: 'package-overview',
      packVersion: '0.1.0',
    },
    generatedDocs: [
      {
        id: 'generated-doc:v1:ts-codegraph:errors-overview',
        conceptPath: 'packages/errors/overview.md',
        templateId: 'package-overview',
        contentHash,
      },
    ],
    skippedDocs: [],
    manifest: {
      manifestId: 'manifest:v1:ts-codegraph:abcdef',
      manifestPath: 'manifest.json',
      contentHash,
      sections: [
        {
          sectionId: 'generated-section:v1:ts-codegraph:objective',
          slotId: 'objective',
          heading: 'Objective',
          headingSlug: 'objective',
        },
      ],
    },
    diagnosticSummary: {
      errors: 0,
      warnings: 0,
      info: 0,
    },
    determinismInputs: {
      snapshotId: 'snapshot:v1:ts-codegraph:git:abcdef',
      datasetSchemaVersion: 'ts-codegraph.dataset@1',
      templatePackVersion: '0.1.0',
      normalizedTimestamp: '2026-07-03T00:00:00+02:00',
    },
  },
  diagnostics: [],
  warnings: [],
  meta,
};
