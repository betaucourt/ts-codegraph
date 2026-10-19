import { AppError } from '../errors/index.js';
import { ERROR_CODES } from './generated/app-paths-entities.js';

const MAX_NAME_LEN = 100;

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function isInvalidName(name: string): boolean {
  return (
    !name ||
    name.length > MAX_NAME_LEN ||
    hasControlChars(name) ||
    name.includes('/') ||
    name.includes('\\') ||
    name === '.' ||
    name === '..'
  );
}

export function validateAppName(name: string): string {
  if (isInvalidName(name)) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_INVALID_APP_NAME,
      category: 'validation',
      title: 'Application name is invalid',
      clientDetail:
        'App name must be 1-100 characters with no path separators, control characters, or reserved names',
    });
  }
  return name;
}

export function validateProfileName(name: string): string {
  if (isInvalidName(name)) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_INVALID_PROFILE_NAME,
      category: 'validation',
      title: 'Profile name is invalid',
      clientDetail:
        'Profile name must be 1-100 characters with no path separators, control characters, or reserved names',
    });
  }
  return name;
}
