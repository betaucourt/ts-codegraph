import { homedir, tmpdir } from 'node:os';
import { join, isAbsolute } from 'node:path';
import { AppError } from '../errors/index.js';
import { isPathInside } from '../security/index.js';
import { ERROR_CODES } from './generated/app-paths-entities.js';
import { validateAppName, validateProfileName } from './names.js';
import type { AppPathKind, AppPathOptions, AppPathOverrides, AppPathPolicy, AppPathResolution } from './types.js';

type DetectedPlatform = 'linux' | 'darwin';

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function validateHome(home: string): string {
  if (!home || !isAbsolute(home) || hasControlChars(home)) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_INVALID_HOME,
      category: 'validation',
      title: 'Home directory override is invalid',
      clientDetail: 'Home directory must be a non-empty absolute path without control characters',
    });
  }
  return home;
}

function detectPlatform(policy?: AppPathPolicy): DetectedPlatform {
  if (policy?.platform === 'linux') return 'linux';
  if (policy?.platform === 'darwin') return 'darwin';
  if (process.platform === 'darwin') return 'darwin';
  return 'linux';
}

function readXdgEnv(name: string): string | undefined {
  const val = process.env[name];
  if (val === undefined || val === '') return undefined;
  if (!isAbsolute(val) || hasControlChars(val)) return undefined;
  return val;
}

function readTmpEnv(): string {
  const val = process.env['TMPDIR'];
  if (val !== undefined && val !== '' && isAbsolute(val) && !hasControlChars(val)) return val;
  return tmpdir();
}

interface KindResolution {
  readonly base: string;
  readonly suffix?: string;
}

function computeKind(
  kind: AppPathKind,
  platform: DetectedPlatform,
  home: string,
  readXdg: boolean,
  overrides?: AppPathOverrides,
): KindResolution {
  const override = overrides?.[kind];
  if (override !== undefined) {
    if (!override || !isAbsolute(override) || hasControlChars(override)) {
      throw new AppError({
        code: ERROR_CODES.APP_PATHS_INVALID_OVERRIDE,
        category: 'validation',
        title: `Path override for ${kind} is invalid`,
        clientDetail: 'Override paths must be non-empty absolute paths without control characters',
      });
    }
    return { base: override };
  }

  if (kind === 'temp') {
    return { base: readXdg ? readTmpEnv() : tmpdir() };
  }

  const xdgConfig = readXdg ? readXdgEnv('XDG_CONFIG_HOME') : undefined;
  const xdgCache = readXdg ? readXdgEnv('XDG_CACHE_HOME') : undefined;
  const xdgData = readXdg ? readXdgEnv('XDG_DATA_HOME') : undefined;
  const xdgState = readXdg ? readXdgEnv('XDG_STATE_HOME') : undefined;

  if (platform === 'darwin') {
    const libAppSupport = join(home, 'Library', 'Application Support');
    const libCaches = join(home, 'Library', 'Caches');
    const libLogs = join(home, 'Library', 'Logs');
    const localState = join(home, '.local', 'state');
    switch (kind) {
      case 'config':
        return { base: xdgConfig ?? libAppSupport };
      case 'cache':
        return { base: xdgCache ?? libCaches };
      case 'data':
        return { base: xdgData ?? libAppSupport };
      case 'state':
        return { base: xdgState ?? localState };
      case 'log':
        if (xdgState !== undefined) return { base: xdgState, suffix: 'logs' };
        return { base: libLogs };
    }
  }

  const dotConfig = join(home, '.config');
  const dotCache = join(home, '.cache');
  const localShare = join(home, '.local', 'share');
  const localState = join(home, '.local', 'state');

  switch (kind) {
    case 'config':
      return { base: xdgConfig ?? dotConfig };
    case 'cache':
      return { base: xdgCache ?? dotCache };
    case 'data':
      return { base: xdgData ?? localShare };
    case 'state':
      return { base: xdgState ?? localState };
    case 'log':
      return { base: xdgState ?? localState, suffix: 'logs' };
  }
}

function assertPathInBoundary(resolved: string, boundary: string, kind: AppPathKind): void {
  if (!isPathInside(boundary, resolved)) {
    throw new AppError({
      code: ERROR_CODES.APP_PATHS_PATH_ESCAPE,
      category: 'authz',
      title: `Resolved ${kind} path escapes the permitted directory`,
      clientDetail: `The computed path for the ${kind} directory is outside the allowed root`,
    });
  }
}

export function resolveAppPaths(options: AppPathOptions): AppPathResolution {
  const app = validateAppName(options.app);
  const profile = options.profile !== undefined ? validateProfileName(options.profile) : undefined;
  const policy = options.policy;
  const rawHome = policy?.home;
  const home = rawHome !== undefined ? validateHome(rawHome) : homedir();
  const platform = detectPlatform(policy);
  const readXdg = policy?.readXdg !== false;
  const overrides = policy?.overrides;

  function resolveOne(kind: AppPathKind): string {
    const { base, suffix } = computeKind(kind, platform, home, readXdg, overrides);
    let resolved = join(base, app);
    if (profile !== undefined) resolved = join(resolved, profile);
    if (suffix !== undefined) resolved = join(resolved, suffix);
    assertPathInBoundary(resolved, base, kind);
    return resolved;
  }

  return {
    app,
    profile,
    config: resolveOne('config'),
    cache: resolveOne('cache'),
    data: resolveOne('data'),
    state: resolveOne('state'),
    log: resolveOne('log'),
    temp: resolveOne('temp'),
  };
}

export function resolveAppPath(kind: AppPathKind, options: AppPathOptions): string {
  return resolveAppPaths(options)[kind];
}

export function getConfigDir(options: AppPathOptions): string {
  return resolveAppPath('config', options);
}

export function getCacheDir(options: AppPathOptions): string {
  return resolveAppPath('cache', options);
}

export function getDataDir(options: AppPathOptions): string {
  return resolveAppPath('data', options);
}

export function getStateDir(options: AppPathOptions): string {
  return resolveAppPath('state', options);
}

export function getLogDir(options: AppPathOptions): string {
  return resolveAppPath('log', options);
}

export function getTempDir(options: AppPathOptions): string {
  return resolveAppPath('temp', options);
}
