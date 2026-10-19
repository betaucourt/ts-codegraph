import type { AppError, AppErrorCategory } from './core.js';
import { isAppError } from './core.js';

export interface ErrorCodeMeta {
  readonly category: AppErrorCategory;
  readonly title: string;
  readonly retryable: boolean;
  readonly clientSafe: boolean;
}

// A typed collection of error code metadata for a single error family.
// Packages use this to register their error codes for consistent lookup
// and to create well-typed AppErrors without duplicating metadata.
export class ErrorRegistry {
  readonly family: string;
  private readonly _codes: ReadonlyMap<string, ErrorCodeMeta>;

  constructor(family: string, codes: ReadonlyMap<string, ErrorCodeMeta>) {
    this.family = family;
    this._codes = codes;
  }

  get(code: string): ErrorCodeMeta | undefined {
    return this._codes.get(code);
  }

  has(code: string): boolean {
    return this._codes.has(code);
  }

  codes(): readonly string[] {
    return [...this._codes.keys()];
  }

  size(): number {
    return this._codes.size;
  }
}

// Builds an ErrorRegistry from a plain object of code → metadata entries.
export function createErrorRegistry(
  family: string,
  entries: Readonly<Record<string, ErrorCodeMeta>>,
): ErrorRegistry {
  return new ErrorRegistry(family, new Map(Object.entries(entries)));
}

// Returns the HTTP status code for the error. Delegates to the error's own
// httpStatus which is derived from category at construction time.
export function getHttpStatusForError(error: AppError): number {
  return error.httpStatus;
}

// Maps AppError category to a POSIX-compatible CLI exit code.
// 0 = success (never returned here), 1-9 = typed error categories.
export function getCliExitCodeForError(error: AppError): number {
  switch (error.category) {
    case 'internal':
      return 1;
    case 'validation':
      return 2;
    case 'authn':
      return 3;
    case 'authz':
      return 3;
    case 'not_found':
      return 4;
    case 'conflict':
      return 5;
    case 'rate_limited':
      return 6;
    case 'upstream':
      return 7;
    case 'timeout':
      return 8;
    case 'unavailable':
      return 9;
  }
}

// Returns true if the error is a retryable AppError. Returns false for
// non-AppError values (unknown errors are not safe to retry).
export function isRetryableError(value: unknown): boolean {
  return isAppError(value) && value.retryable;
}
