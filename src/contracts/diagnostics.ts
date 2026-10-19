import { z } from 'zod/v4';

const diagnosticCodePattern =
  /^(CHECK|LOAD|SEARCH|GENERATE|OKF|SAFETY)_[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

export function createDiagnosticCodeRegistry<const T extends readonly string[]>(
  codes: T,
): T {
  const seen = new Set<string>();

  for (const code of codes) {
    if (!diagnosticCodePattern.test(code)) {
      throw new Error(`Invalid diagnostic code: ${code}`);
    }

    if (seen.has(code)) {
      throw new Error(`Duplicate diagnostic code: ${code}`);
    }

    seen.add(code);
  }

  return codes;
}

export const DIAGNOSTIC_CODE_REGISTRY = createDiagnosticCodeRegistry([
  'CHECK_ENVELOPE_INVALID',
  'CHECK_PROJECT_NOT_FOUND',
  'CHECK_PROJECT_UNREADABLE',
  'CHECK_PROJECT_UNSAFE',
  'CHECK_PACKAGE_MANIFEST_MISSING',
  'CHECK_TSCONFIG_MISSING',
  'CHECK_GIT_UNAVAILABLE',
  'CHECK_TRAVERSAL_POLICY_INVALID',
  'CHECK_DATASET_MISSING',
  'CHECK_DATASET_UNREADABLE',
  'CHECK_DATASET_UNHEALTHY',
  'CHECK_TEMPLATE_PACK_MISSING',
  'CHECK_TEMPLATE_PACK_INVALID',
  'CHECK_OUTPUT_NOT_WRITABLE',
  'CHECK_OUTPUT_UNSAFE',
  'LOAD_ENVELOPE_INVALID',
  'SEARCH_ENVELOPE_INVALID',
  'GENERATE_ENVELOPE_INVALID',
  'GENERATE_REQUIRED_FACT_MISSING',
  'GENERATE_DTO_INVALID',
  'GENERATE_OUTPUT_REQUIRED',
  'GENERATE_DATASET_MISSING',
  'OKF_TYPE_MISSING',
  'OKF_TITLE_MISSING',
  'OKF_DESCRIPTION_MISSING',
  'OKF_RESOURCE_MISSING',
  'OKF_TAGS_MISSING',
  'OKF_TIMESTAMP_MISSING',
  'OKF_GENERATED_BY_MISSING',
  'OKF_SCHEMA_VERSION_MISSING',
  'OKF_SOURCE_SNAPSHOT_MISSING',
  'OKF_TEMPLATE_ID_MISSING',
  'OKF_TEMPLATE_VERSION_MISSING',
  'OKF_DATASET_SCHEMA_VERSION_MISSING',
  'OKF_FIELD_INVALID',
  'OKF_RESERVED_FILENAME',
  'OKF_EVIDENCE_SECTION_MISSING',
  'LOAD_ID_COLLISION',
  'LOAD_REEXPORT_UNRESOLVED',
  'LOAD_UNANNOTATED_TYPE_UNRESOLVED',
  'SEARCH_LIMIT_CLAMPED',
  'SAFETY_ABSOLUTE_PATH',
  'SAFETY_HOME_PATH',
  'SAFETY_SECRET_VALUE',
  'SAFETY_STACK_TRACE',
  'SAFETY_CREDENTIAL_URL',
  'SAFETY_RAW_SQL',
  'SAFETY_COMMAND_OUTPUT',
  'SAFETY_PATH_ESCAPE',
] as const);

export type DiagnosticCode = (typeof DIAGNOSTIC_CODE_REGISTRY)[number];

export const DiagnosticCodes = Object.freeze(
  Object.fromEntries(DIAGNOSTIC_CODE_REGISTRY.map((code) => [code, code])) as {
    readonly [Code in DiagnosticCode]: Code;
  },
);

export const diagnosticCodeSchema = z.enum(
  DIAGNOSTIC_CODE_REGISTRY as unknown as [DiagnosticCode, ...DiagnosticCode[]],
);

export const diagnosticSeveritySchema = z.enum(['error', 'warning', 'info']);

export type DiagnosticSeverity = z.infer<typeof diagnosticSeveritySchema>;

const safeSourcePathSchema = z
  .string()
  .min(1)
  .max(240)
  .refine((value) => !value.startsWith('/'), {
    message: 'source path must be relative',
  })
  .refine((value) => !value.startsWith('~'), {
    message: 'source path must not use a home shortcut',
  })
  .refine((value) => !value.includes('\\'), {
    message: 'source path must use POSIX separators',
  });

export const sourceRefSchema = z
  .object({
    path: safeSourcePathSchema,
    line: z.number().int().positive().optional(),
    endLine: z.number().int().positive().optional(),
    symbol: z.string().min(1).max(160).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.line === undefined ||
      value.endLine === undefined ||
      value.endLine >= value.line,
    {
      message: 'endLine must be greater than or equal to line',
      path: ['endLine'],
    },
  );

const safeDetailValueSchema = z.union([
  z.string().min(1).max(200),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const safeDetailSchema = z.record(z.string().min(1).max(80), safeDetailValueSchema);

export const diagnosticSchema = z
  .object({
    code: diagnosticCodeSchema,
    severity: diagnosticSeveritySchema,
    message: z.string().min(1).max(300),
    sourceRef: sourceRefSchema.optional(),
    safeDetail: safeDetailSchema.optional(),
    suggestedAction: z.string().min(1).max(300).optional(),
  })
  .strict();

export type SourceRef = z.infer<typeof sourceRefSchema>;
export type SafeDetail = z.infer<typeof safeDetailSchema>;
export type Diagnostic = z.infer<typeof diagnosticSchema>;

export interface DiagnosticInput {
  readonly code: DiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly sourceRef?: SourceRef;
  readonly safeDetail?: SafeDetail;
  readonly suggestedAction?: string;
}

export function createDiagnostic(input: DiagnosticInput): Diagnostic {
  return diagnosticSchema.parse(input);
}

export function createValidationDiagnostic(
  code: DiagnosticCode,
  message: string,
  safeDetail?: SafeDetail,
): Diagnostic {
  const input: DiagnosticInput = {
    code,
    severity: 'error',
    message,
  };

  if (safeDetail !== undefined) {
    return createDiagnostic({
      ...input,
      safeDetail,
    });
  }

  return createDiagnostic(input);
}
