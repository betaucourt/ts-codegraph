export { ERROR_CODES, ENTITY_IDS } from './generated/error-entities.js';
export type { ErrorCode, EntityId } from './generated/error-entities.js';

import {
  sanitizeCode,
  sanitizeHttpStatus,
  sanitizeTitle,
  sanitizeClientDetail,
  sanitizeFieldViolations,
} from './sanitize.js';

// AppErrorCode is an open string type — any package can use its own codes while
// remaining compatible with AppError. Use ERROR_CODES for the standard code names.
export type AppErrorCode = string;

export const APP_ERROR_CATEGORIES = [
  'validation',
  'authn',
  'authz',
  'not_found',
  'conflict',
  'rate_limited',
  'upstream',
  'timeout',
  'unavailable',
  'internal',
] as const;
export type AppErrorCategory = (typeof APP_ERROR_CATEGORIES)[number];

export interface FieldViolation {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

// Input options for constructing an AppError. Not readonly so callers can
// build it incrementally; AppError class fields are readonly.
export interface AppErrorOptions {
  code: AppErrorCode;
  category: AppErrorCategory;
  title: string;
  clientDetail?: string;
  retryable?: boolean;
  httpStatus?: number;
  fields?: readonly FieldViolation[];
  cause?: unknown;
}

// Safe low-cardinality attributes for telemetry use.
// Never includes raw message, stack, cause, SQL, token, body, URL-with-query.
export interface AppErrorAttributes {
  readonly code: AppErrorCode;
  readonly category: AppErrorCategory;
  readonly retryable: boolean;
  readonly httpStatus: number;
}

// Validates category at runtime — protects against JS callers that bypass TS types.
// Invalid values become 'internal' so httpStatus always has a valid fallback.
function sanitizeCategory(category: unknown): AppErrorCategory {
  if (typeof category === 'string' && (APP_ERROR_CATEGORIES as readonly string[]).includes(category)) {
    return category as AppErrorCategory;
  }
  return 'internal';
}

// Only the boolean literal true is retryable; strings, numbers, and objects are not.
function sanitizeRetryable(retryable: unknown): boolean {
  return retryable === true;
}

function defaultHttpStatusForCategory(category: AppErrorCategory): number {
  switch (category) {
    case 'validation':
      return 422;
    case 'authn':
      return 401;
    case 'authz':
      return 403;
    case 'not_found':
      return 404;
    case 'conflict':
      return 409;
    case 'rate_limited':
      return 429;
    case 'upstream':
      return 502;
    case 'timeout':
      return 504;
    case 'unavailable':
      return 503;
    case 'internal':
      return 500;
  }
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly category: AppErrorCategory;
  readonly title: string;
  readonly clientDetail: string | undefined;
  readonly retryable: boolean;
  readonly httpStatus: number;
  readonly fields: readonly FieldViolation[] | undefined;
  override readonly cause: unknown;

  constructor(opts: AppErrorOptions) {
    // Sanitize category FIRST — it drives the HTTP status default.
    // TypeScript prevents bad values at compile time; this guard protects JS callers.
    const safeCategory = sanitizeCategory(opts.category);
    const categoryDefault = defaultHttpStatusForCategory(safeCategory);
    // Sanitize title so Error.message is also clean.
    const safeTitle = sanitizeTitle(opts.title);
    super(safeTitle);
    this.name = 'AppError';
    this.code = sanitizeCode(opts.code);
    this.category = safeCategory;
    this.title = safeTitle;
    // Only boolean true is treated as retryable; strings and other non-boolean values become false.
    this.retryable = sanitizeRetryable(opts.retryable);
    // Invalid HTTP statuses (e.g. 200) fall back to the category default.
    this.httpStatus = sanitizeHttpStatus(opts.httpStatus ?? categoryDefault, categoryDefault);
    this.cause = opts.cause;
    // Redefine cause as non-enumerable so JSON.stringify omits it even without toJSON.
    // err.cause remains readable for internal logging; it cannot be forged via JSON.
    Object.defineProperty(this, 'cause', { value: opts.cause, enumerable: false, writable: false, configurable: true });
    // Optional fields: apply sanitization; omit when undefined or unsafe.
    this.clientDetail =
      opts.clientDetail !== undefined ? sanitizeClientDetail(opts.clientDetail) : undefined;
    this.fields =
      opts.fields !== undefined ? sanitizeFieldViolations(opts.fields) : undefined;
  }

  // Returns only low-cardinality attributes safe for telemetry recording.
  // Never includes message, stack, cause, clientDetail, or raw values.
  toSafeAttributes(): AppErrorAttributes {
    return {
      code: this.code,
      category: this.category,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
    };
  }

  // Safe JSON representation — omits cause, stack, and message so that
  // JSON.stringify(appError) never serializes raw internal error chains,
  // stack traces, or untrusted Error.message values. err.cause remains
  // accessible as a property for internal logging and error chains.
  toJSON(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      name: this.name,
      code: this.code,
      category: this.category,
      title: this.title,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
    };
    if (this.clientDetail !== undefined) obj['clientDetail'] = this.clientDetail;
    if (this.fields !== undefined) obj['fields'] = this.fields;
    return obj;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

export function createAppError(opts: AppErrorOptions): AppError {
  return new AppError(opts);
}

// Converts any thrown value into an AppError. Unknown errors produce INTERNAL
// with a generic title — the original value is preserved as cause for logging
// but must never be forwarded to clients.
export function normalizeAppError(value: unknown): AppError {
  if (value instanceof AppError) return value;
  return new AppError({
    code: 'INTERNAL',
    category: 'internal',
    title: 'An unexpected internal error occurred',
    cause: value,
  });
}

// Returns a copy of the error with a new cause attached. Useful for preserving
// the original exception for logging without re-throwing it.
export function withErrorCause(error: AppError, cause: unknown): AppError {
  const opts: AppErrorOptions = {
    code: error.code,
    category: error.category,
    title: error.title,
    retryable: error.retryable,
    httpStatus: error.httpStatus,
    cause,
  };
  if (error.clientDetail !== undefined) {
    opts.clientDetail = error.clientDetail;
  }
  if (error.fields !== undefined) {
    opts.fields = error.fields;
  }
  return new AppError(opts);
}
