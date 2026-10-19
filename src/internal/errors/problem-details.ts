import type { AppError, FieldViolation } from './core.js';
import { sanitizeTraceId, sanitizeBaseType } from './sanitize.js';

// RFC 9457-compatible problem details shape. Only the safe subset of AppError
// fields appears here — never cause, stack, internal message, or raw context.
export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly code: string;
  readonly detail?: string;
  readonly traceId?: string;
  readonly fields?: readonly FieldViolation[];
}

// Stripped-down error summary safe for API responses. Contains only
// machine-readable metadata — no message, cause, or stack.
export interface SafeError {
  readonly code: string;
  readonly category: string;
  readonly title: string;
  readonly retryable: boolean;
  readonly httpStatus: number;
}

export interface ToProblemDetailsOptions {
  readonly traceId?: string;
  readonly baseType?: string;
}

// Produces a ProblemDetails object from an AppError. Only clientDetail is
// forwarded as the user-facing `detail` — error.message and error.cause are
// never included. Fields are included only when present and non-empty.
export function toProblemDetails(
  error: AppError,
  opts?: ToProblemDetailsOptions,
): ProblemDetails {
  // Validate baseType: must be a bounded http/https URL with no userinfo/query/fragment/secrets.
  // Falls back to the workspace default for any invalid or secret-like value.
  const baseType = sanitizeBaseType(opts?.baseType ?? 'https://errors.codegraph.dev');
  const slug = error.code.toLowerCase().replace(/_/g, '-');
  const type = `${baseType}/${slug}`;

  const result: {
    type: string;
    title: string;
    status: number;
    code: string;
    detail?: string;
    traceId?: string;
    fields?: readonly FieldViolation[];
  } = {
    type,
    title: error.title,
    status: error.httpStatus,
    code: error.code,
  };

  if (error.clientDetail !== undefined) {
    result.detail = error.clientDetail;
  }

  const rawTraceId = opts?.traceId;
  if (rawTraceId !== undefined) {
    const safeTraceId = sanitizeTraceId(rawTraceId);
    if (safeTraceId !== undefined) {
      result.traceId = safeTraceId;
    }
  }

  if (error.fields !== undefined && error.fields.length > 0) {
    result.fields = error.fields;
  }

  return result;
}

// Returns a stripped-down object with only the machine-readable metadata from
// the error — code, category, title, retryable, httpStatus. Never includes
// cause, stack, clientDetail, fields, or any potentially sensitive context.
export function toSafeError(error: AppError): SafeError {
  return {
    code: error.code,
    category: error.category,
    title: error.title,
    retryable: error.retryable,
    httpStatus: error.httpStatus,
  };
}
