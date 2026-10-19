import { describe, expect, it } from 'vitest';

import {
  type GeneratedDocFrontmatter,
  validateGeneratedDoc,
} from '../../src/contracts/okf.js';

const validFrontmatter: GeneratedDocFrontmatter = {
  type: 'Package Overview',
  title: 'Errors Package',
  description: 'One sentence summary.',
  resource: '/packages/errors/overview.md',
  tags: ['ts-codegraph', 'generated'],
  timestamp: '2026-07-03T00:00:00+02:00',
  generated_by: 'ts-codegraph generate',
  schema_version: 'ts-codegraph.package-overview@1',
  source_snapshot: 'snapshot:v1:ts-codegraph:git:abcdef',
  template_id: 'package-overview',
  template_version: '0.1.0',
  dataset_schema_version: 'ts-codegraph.dataset@1',
};

const validBody = [
  '## Objective',
  '',
  'This document is generated from package metadata.',
  '',
  '## Sources Used',
  '',
  '- package metadata',
  '',
].join('\n');

const missingFieldCases = [
  ['type', 'OKF_TYPE_MISSING'],
  ['title', 'OKF_TITLE_MISSING'],
  ['description', 'OKF_DESCRIPTION_MISSING'],
  ['resource', 'OKF_RESOURCE_MISSING'],
  ['tags', 'OKF_TAGS_MISSING'],
  ['timestamp', 'OKF_TIMESTAMP_MISSING'],
  ['generated_by', 'OKF_GENERATED_BY_MISSING'],
  ['schema_version', 'OKF_SCHEMA_VERSION_MISSING'],
  ['source_snapshot', 'OKF_SOURCE_SNAPSHOT_MISSING'],
  ['template_id', 'OKF_TEMPLATE_ID_MISSING'],
  ['template_version', 'OKF_TEMPLATE_VERSION_MISSING'],
  ['dataset_schema_version', 'OKF_DATASET_SCHEMA_VERSION_MISSING'],
] as const;

const forbiddenBodyCases = [
  ['home path', 'See /Users/alice/project/src/index.ts', 'SAFETY_HOME_PATH'],
  ['absolute path', 'See /etc/passwd for details.', 'SAFETY_ABSOLUTE_PATH'],
  ['secret-like value', 'api_key=abcdefghi123456', 'SAFETY_SECRET_VALUE'],
  ['raw stack trace', 'Error\n    at run (/repo/src/index.ts:1:2)', 'SAFETY_STACK_TRACE'],
  ['credential URL', 'https://user:password@example.com/path', 'SAFETY_CREDENTIAL_URL'],
  ['raw SQL', 'SELECT * FROM users', 'SAFETY_RAW_SQL'],
  ['command output', 'npm ERR! failed command', 'SAFETY_COMMAND_OUTPUT'],
] as const;

describe('OKF generated document validator', () => {
  it('accepts a generated document with required frontmatter and evidence', () => {
    const result = validateGeneratedDoc(validFrontmatter, validBody);

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });

  for (const [field, expectedCode] of missingFieldCases) {
    it(`rejects a missing ${field} field`, () => {
      const frontmatter = {
        ...validFrontmatter,
      };
      delete frontmatter[field];

      const result = validateGeneratedDoc(frontmatter, validBody);

      expect(result.ok).toBe(false);
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(expectedCode);
    });
  }

  for (const [name, unsafeBody, expectedCode] of forbiddenBodyCases) {
    it(`rejects ${name} in the body`, () => {
      const body = `${unsafeBody}\n\n## Sources Used\n\n- package metadata\n`;
      const result = validateGeneratedDoc(validFrontmatter, body);

      expect(result.ok).toBe(false);
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(expectedCode);
      expect(JSON.stringify(result.diagnostics)).not.toContain(unsafeBody);
    });
  }

  const invalidFieldCases = [
    ['a malformed timestamp', 'timestamp', 'not-a-timestamp'],
    ['a multi-line description', 'description', 'First line.\nSecond line.'],
    ['an unexpected generated_by value', 'generated_by', 'someone else'],
    ['a mismatched dataset_schema_version', 'dataset_schema_version', 'ts-codegraph.dataset@2'],
    ['a non-string-array tags value', 'tags', []],
  ] as const;

  for (const [name, field, invalidValue] of invalidFieldCases) {
    it(`rejects ${name} with OKF_FIELD_INVALID`, () => {
      const frontmatter = {
        ...validFrontmatter,
        [field]: invalidValue,
      };

      const result = validateGeneratedDoc(frontmatter, validBody);
      const codes = result.diagnostics.map((diagnostic) => diagnostic.code);

      expect(result.ok).toBe(false);
      expect(codes).toContain('OKF_FIELD_INVALID');
      expect(codes.some((code) => code.endsWith('_MISSING'))).toBe(false);
    });
  }

  it('rejects reserved index.md filenames', () => {
    const result = validateGeneratedDoc(
      {
        ...validFrontmatter,
        resource: '/packages/errors/index.md',
      },
      validBody,
    );

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'OKF_RESERVED_FILENAME',
    );
  });

  it('rejects reserved log.md filenames', () => {
    const result = validateGeneratedDoc(
      {
        ...validFrontmatter,
        resource: '/packages/errors/log.md',
      },
      validBody,
    );

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'OKF_RESERVED_FILENAME',
    );
  });

  it('requires an evidence section', () => {
    const result = validateGeneratedDoc(validFrontmatter, '## Objective\n\nGenerated from metadata.\n');

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'OKF_EVIDENCE_SECTION_MISSING',
    );
  });
});
