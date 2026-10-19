import type { FieldViolation } from './core.js';

// --- Bounds ---

const MAX_TITLE_LEN = 200;
const MAX_DETAIL_LEN = 500;
const MAX_FIELD_COUNT = 50;
const MAX_FIELD_NAME_LEN = 100;
const MAX_FIELD_MESSAGE_LEN = 500;
const MAX_FIELD_CODE_LEN = 64;

// --- Secret-detection patterns ---

// Matches env-variable assignment style: UPPER_KEY=something e.g. PASSWORD=supersecret
const ENV_ASSIGN_PATTERN = /\b[A-Z][A-Z0-9_]{2,}=[^\s]/;
// Matches common secret keyword prefixes: password=, token:, jwt=, bearer=, etc.
const SECRET_KEYWORD_PATTERN =
  /(?:password|passwd|secret|token|jwt|bearer|api[_-]?key|private[_-]?key)\s*[:=]/i;

function containsSecretLike(s: string): boolean {
  return ENV_ASSIGN_PATTERN.test(s) || SECRET_KEYWORD_PATTERN.test(s);
}

// --- Code ---

// AppError code must be UPPER_SNAKE_CASE, 1–64 chars.
// Any code that doesn't match becomes INTERNAL so the type slug in problem-details
// never contains raw user-supplied content.
const SAFE_CODE_PATTERN = /^[A-Z][A-Z0-9_]{0,63}$/;

export function sanitizeCode(code: string): string {
  return SAFE_CODE_PATTERN.test(code) ? code : 'INTERNAL';
}

// --- HTTP status ---

// Only 4xx and 5xx are valid for error responses.
// Anything outside that range (e.g. 200, NaN) is replaced with the category default.
export function sanitizeHttpStatus(status: number, fallback: number): number {
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : fallback;
}

// --- Title ---

// Unsafe or over-long titles are replaced with a generic safe string.
// The fallback is used so callers can provide a category-appropriate default.
const SAFE_TITLE_FALLBACK = 'An unexpected error occurred';

export function sanitizeTitle(title: string, fallback: string = SAFE_TITLE_FALLBACK): string {
  if (title.length > MAX_TITLE_LEN || containsSecretLike(title)) return fallback;
  return title;
}

// --- clientDetail ---

// Unsafe or over-long clientDetail is omitted (undefined) rather than truncated.
// Truncating a long string might still expose a secret near the beginning.
export function sanitizeClientDetail(detail: string): string | undefined {
  if (detail.length > MAX_DETAIL_LEN || containsSecretLike(detail)) return undefined;
  return detail;
}

// --- traceId ---

// traceId must be a bounded, safe alphanumeric/separator string.
// Unsafe values are omitted rather than included in problem-details output.
const SAFE_TRACE_ID_PATTERN = /^[a-zA-Z0-9_.\-]{1,128}$/;

export function sanitizeTraceId(traceId: string): string | undefined {
  return SAFE_TRACE_ID_PATTERN.test(traceId) ? traceId : undefined;
}

// --- baseType ---

const FALLBACK_BASE_TYPE = 'https://errors.codegraph.dev';
const MAX_BASE_TYPE_LEN = 256;

// Allow only bounded http/https URLs with no userinfo, query string, or fragment.
// Rejects env assignments and secret-keyword patterns via containsSecretLike.
// Invalid values fall back to the workspace default rather than being echoed.
export function sanitizeBaseType(baseType: string): string {
  if (
    baseType.length > MAX_BASE_TYPE_LEN ||
    !/^https?:\/\//.test(baseType) ||
    baseType.includes('@') ||
    baseType.includes('?') ||
    baseType.includes('#') ||
    containsSecretLike(baseType)
  ) {
    return FALLBACK_BASE_TYPE;
  }
  return baseType;
}

// --- Field violations ---

function sanitizeFieldViolation(f: FieldViolation): FieldViolation {
  // Field name: redact if it contains a secret-like pattern; always bound length.
  const field = containsSecretLike(f.field)
    ? '[redacted]'
    : f.field.slice(0, MAX_FIELD_NAME_LEN);

  // Message: replace with generic text if secret-like; always bound length.
  const message = containsSecretLike(f.message)
    ? 'invalid value'
    : f.message.slice(0, MAX_FIELD_MESSAGE_LEN);

  // Optional code: omit if secret-like; bound length. Do NOT set to undefined on
  // the property key — exactOptionalPropertyTypes requires omission, not assignment.
  if (f.code !== undefined && !containsSecretLike(f.code)) {
    return { field, message, code: f.code.slice(0, MAX_FIELD_CODE_LEN) };
  }
  return { field, message };
}

export function sanitizeFieldViolations(
  fields: readonly FieldViolation[],
): readonly FieldViolation[] {
  return fields.slice(0, MAX_FIELD_COUNT).map(sanitizeFieldViolation);
}
