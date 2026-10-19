import {
  DiagnosticCodes,
  type Diagnostic,
  type DiagnosticCode,
  createValidationDiagnostic,
} from './diagnostics.js';
import { normalizedTimestampSchema } from './timestamp.js';

export type GeneratedDocFrontmatter = Record<string, unknown>;

export interface ValidateGeneratedDocResult {
  readonly ok: boolean;
  readonly diagnostics: readonly Diagnostic[];
}

interface RequiredField {
  readonly name: string;
  readonly missingCode: DiagnosticCode;
  readonly validate: (value: unknown) => boolean;
}

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const stringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((entry) => typeof entry === 'string' && entry.trim().length > 0);

const requiredFields: readonly RequiredField[] = [
  {
    name: 'type',
    missingCode: DiagnosticCodes.OKF_TYPE_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'title',
    missingCode: DiagnosticCodes.OKF_TITLE_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'description',
    missingCode: DiagnosticCodes.OKF_DESCRIPTION_MISSING,
    validate: (value) => nonEmptyString(value) && !value.includes('\n'),
  },
  {
    name: 'resource',
    missingCode: DiagnosticCodes.OKF_RESOURCE_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'tags',
    missingCode: DiagnosticCodes.OKF_TAGS_MISSING,
    validate: stringArray,
  },
  {
    name: 'timestamp',
    missingCode: DiagnosticCodes.OKF_TIMESTAMP_MISSING,
    validate: (value) =>
      typeof value === 'string' && normalizedTimestampSchema.safeParse(value).success,
  },
  {
    name: 'generated_by',
    missingCode: DiagnosticCodes.OKF_GENERATED_BY_MISSING,
    validate: (value) => value === 'ts-codegraph generate',
  },
  {
    name: 'schema_version',
    missingCode: DiagnosticCodes.OKF_SCHEMA_VERSION_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'source_snapshot',
    missingCode: DiagnosticCodes.OKF_SOURCE_SNAPSHOT_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'template_id',
    missingCode: DiagnosticCodes.OKF_TEMPLATE_ID_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'template_version',
    missingCode: DiagnosticCodes.OKF_TEMPLATE_VERSION_MISSING,
    validate: nonEmptyString,
  },
  {
    name: 'dataset_schema_version',
    missingCode: DiagnosticCodes.OKF_DATASET_SCHEMA_VERSION_MISSING,
    validate: (value) => value === 'ts-codegraph.dataset@1',
  },
];

const bodySafetyRules: readonly {
  readonly code: DiagnosticCode;
  readonly patternName: string;
  readonly pattern: RegExp;
}[] = [
  {
    code: DiagnosticCodes.SAFETY_HOME_PATH,
    patternName: 'home-path',
    pattern: /(?:^|[\s(["'`])(?:~\/|\/Users\/[^/\s]+\/|\/home\/[^/\s]+\/)/m,
  },
  {
    code: DiagnosticCodes.SAFETY_ABSOLUTE_PATH,
    patternName: 'absolute-path',
    pattern:
      /(?:^|[\s(["'`])\/(?:Applications|Library|System|Volumes|bin|boot|dev|etc|opt|private|sbin|tmp|usr|var)\//m,
  },
  {
    code: DiagnosticCodes.SAFETY_SECRET_VALUE,
    patternName: 'secret-like-value',
    pattern:
      /\b(?:api[_-]?key|secret|token|password|passwd|authorization)\b\s*[:=]\s*['"]?[A-Za-z0-9._~+/=-]{8,}/i,
  },
  {
    code: DiagnosticCodes.SAFETY_STACK_TRACE,
    patternName: 'stack-trace',
    pattern: /(?:^|\n)\s*at\s+[\w.$<>]+\s+\([^)]+:\d+:\d+\)/,
  },
  {
    code: DiagnosticCodes.SAFETY_CREDENTIAL_URL,
    patternName: 'credential-url',
    pattern: /\bhttps?:\/\/[^/\s:@]+:[^/\s:@]+@[^/\s]+/i,
  },
  {
    code: DiagnosticCodes.SAFETY_RAW_SQL,
    patternName: 'raw-sql',
    pattern: /\b(?:SELECT\s+[^\n;]+\s+FROM|INSERT\s+INTO|UPDATE\s+[\w".-]+\s+SET|DELETE\s+FROM)\s+[\w".-]+/i,
  },
  {
    code: DiagnosticCodes.SAFETY_COMMAND_OUTPUT,
    patternName: 'raw-command-output',
    pattern: /(?:^|\n)(?:npm ERR!|pnpm ERR!|Traceback \(most recent call last\):|\$ [\w./-]+ )/,
  },
];

const evidenceHeadingPattern = /^##\s+(?:Sources Used|Citations|Evidence)\s*$/im;

function diagnostic(code: DiagnosticCode, message: string, field: string): Diagnostic {
  return createValidationDiagnostic(code, message, {
    field,
  });
}

function basename(resource: string): string {
  const segments = resource.split('/').filter(Boolean);
  return segments.at(-1) ?? resource;
}

export function validateGeneratedDoc(
  frontmatter: GeneratedDocFrontmatter,
  body: string,
): ValidateGeneratedDocResult {
  const diagnostics: Diagnostic[] = [];

  for (const field of requiredFields) {
    if (!(field.name in frontmatter)) {
      diagnostics.push(diagnostic(field.missingCode, 'Required OKF frontmatter is missing.', field.name));
      continue;
    }

    if (!field.validate(frontmatter[field.name])) {
      diagnostics.push(diagnostic(DiagnosticCodes.OKF_FIELD_INVALID, 'OKF frontmatter is invalid.', field.name));
    }
  }

  const resource = frontmatter.resource;

  if (typeof resource === 'string') {
    const fileName = basename(resource).toLowerCase();

    if (fileName === 'index.md' || fileName === 'log.md') {
      diagnostics.push(
        diagnostic(
          DiagnosticCodes.OKF_RESERVED_FILENAME,
          'Generated docs must not use reserved OKF filenames.',
          'resource',
        ),
      );
    }
  }

  for (const rule of bodySafetyRules) {
    if (rule.pattern.test(body)) {
      diagnostics.push(
        createValidationDiagnostic(rule.code, 'Generated Markdown body contains unsafe content.', {
          pattern: rule.patternName,
        }),
      );
    }
  }

  if (!evidenceHeadingPattern.test(body)) {
    diagnostics.push(
      createValidationDiagnostic(
        DiagnosticCodes.OKF_EVIDENCE_SECTION_MISSING,
        'Generated Markdown body must include an evidence section.',
        {
          field: 'body',
        },
      ),
    );
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics,
  };
}
