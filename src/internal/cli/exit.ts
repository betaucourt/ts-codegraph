import { isAppError, normalizeAppError, getCliExitCodeForError } from '../errors/index.js';

export function mapErrorToExitCode(error?: unknown): number {
  if (error === undefined || error === null) return 0;
  const appError = isAppError(error) ? error : normalizeAppError(error);
  return getCliExitCodeForError(appError);
}
