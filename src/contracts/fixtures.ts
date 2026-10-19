const fixtureNames = [
  'fixture-ts-tiny',
  'fixture-preflight-invalid',
  'fixture-redaction',
  'fixture-search',
  'fixture-generate-missing-evidence',
  'fixture-generate-determinism',
  'fixture-codegraph-errors',
  'fixture-codegraph-http-client',
] as const;

export type FixtureName = (typeof fixtureNames)[number];

export const FIXTURE_NAMES: readonly FixtureName[] = fixtureNames;

export type FixtureKind = 'synthetic' | 'invalid' | 'safety' | 'search' | 'generate' | 'real-package';

export interface FixtureDefinition {
  readonly name: FixtureName;
  readonly kind: FixtureKind;
  readonly proves: readonly string[];
  readonly packageName?: string;
  readonly packagePath?: string;
}

export const fixtureRegistry = Object.freeze({
  'fixture-ts-tiny': {
    name: 'fixture-ts-tiny',
    kind: 'synthetic',
    proves: ['now-symbol-kinds', 'typechecker-exceptions', 'stable-ids', 'load-counts'],
  },
  'fixture-preflight-invalid': {
    name: 'fixture-preflight-invalid',
    kind: 'invalid',
    proves: ['check-failure-diagnostics', 'no-mutation'],
  },
  'fixture-redaction': {
    name: 'fixture-redaction',
    kind: 'safety',
    proves: ['json-redaction', 'markdown-redaction'],
  },
  'fixture-search': {
    name: 'fixture-search',
    kind: 'search',
    proves: ['exact-symbol-query', 'prefix-query', 'identifier-splits', 'empty-result'],
  },
  'fixture-generate-missing-evidence': {
    name: 'fixture-generate-missing-evidence',
    kind: 'generate',
    proves: ['optional-fact-omission', 'no-invented-prose'],
  },
  'fixture-generate-determinism': {
    name: 'fixture-generate-determinism',
    kind: 'generate',
    proves: ['byte-identical-output', 'manifest-dataset-agreement'],
  },
  'fixture-codegraph-errors': {
    name: 'fixture-codegraph-errors',
    kind: 'real-package',
    packageName: '@codegraph/errors',
    packagePath: 'test/fixtures/real-packages/errors',
    proves: ['real-extraction', 'stable-ids', 'safe-sparse-evidence-docs'],
  },
  'fixture-codegraph-http-client': {
    name: 'fixture-codegraph-http-client',
    kind: 'real-package',
    packageName: '@codegraph/http-client',
    packagePath: 'test/fixtures/real-packages/http-client',
    proves: ['jsdoc-extraction', 'sanitization', 'substantive-doc-value'],
  },
} satisfies Record<FixtureName, FixtureDefinition>);
