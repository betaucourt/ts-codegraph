// Core error class and types
export {
  AppError,
  APP_ERROR_CATEGORIES,
  isAppError,
  createAppError,
  normalizeAppError,
  withErrorCause,
  ERROR_CODES,
  ENTITY_IDS,
} from './core.js';

export type {
  AppErrorCode,
  AppErrorCategory,
  AppErrorOptions,
  AppErrorAttributes,
  FieldViolation,
  ErrorCode,
  EntityId,
} from './core.js';

// Problem-details serialization
export { toProblemDetails, toSafeError } from './problem-details.js';
export type {
  ProblemDetails,
  SafeError,
  ToProblemDetailsOptions,
} from './problem-details.js';

// Error registry and status/exit-code helpers
export {
  ErrorRegistry,
  createErrorRegistry,
  getHttpStatusForError,
  getCliExitCodeForError,
  isRetryableError,
} from './registry.js';
export type { ErrorCodeMeta } from './registry.js';
