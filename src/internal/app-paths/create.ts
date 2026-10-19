import { mkdir } from 'node:fs/promises';
import { AppError } from '../errors/index.js';
import { isPathInside } from '../security/index.js';
import { ERROR_CODES } from './generated/app-paths-entities.js';
import type { EnsureAppPathOptions } from './types.js';

export async function ensureAppPath(pathRef: string, options?: EnsureAppPathOptions): Promise<void> {
  if (options?.boundary !== undefined && !isPathInside(options.boundary, pathRef)) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_PATH_ESCAPE,
      category: 'authz',
      title: 'Path is outside the permitted directory',
      clientDetail: 'The application directory is outside the allowed boundary',
    });
  }

  try {
    await mkdir(pathRef, { recursive: true });
  } catch (cause) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_CREATION_FAILED,
      category: 'internal',
      title: 'Directory creation failed',
      clientDetail: 'The application directory could not be created',
      cause,
    });
  }
}

export function assertAppPathInside(pathRef: string, boundary: string): void {
  if (!isPathInside(boundary, pathRef)) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_PATH_ESCAPE,
      category: 'authz',
      title: 'Path is outside the permitted directory',
      clientDetail: 'The given path is outside the allowed boundary',
    });
  }
}
