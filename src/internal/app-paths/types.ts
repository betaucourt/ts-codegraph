export const APP_PATH_KINDS = ['config', 'cache', 'data', 'state', 'log', 'temp'] as const;

export type AppPathKind = (typeof APP_PATH_KINDS)[number];

export type AppPathErrorCode =
  | 'APP_PATHS_INVALID_APP_NAME'
  | 'APP_PATHS_INVALID_PROFILE_NAME'
  | 'APP_PATHS_INVALID_OVERRIDE'
  | 'APP_PATHS_INVALID_HOME'
  | 'APP_PATHS_PATH_ESCAPE'
  | 'APP_PATHS_CREATION_FAILED';

export interface AppPathOverrides {
  readonly config?: string;
  readonly cache?: string;
  readonly data?: string;
  readonly state?: string;
  readonly log?: string;
  readonly temp?: string;
}

export interface AppPathPolicy {
  readonly overrides?: AppPathOverrides;
  readonly platform?: 'linux' | 'darwin' | 'auto';
  readonly readXdg?: boolean;
  readonly home?: string;
}

export interface AppPathOptions {
  readonly app: string;
  readonly profile?: string;
  readonly policy?: AppPathPolicy;
}

export interface EnsureAppPathOptions {
  readonly boundary?: string;
}

export interface AppPathResolution {
  readonly app: string;
  readonly profile: string | undefined;
  readonly config: string;
  readonly cache: string;
  readonly data: string;
  readonly state: string;
  readonly log: string;
  readonly temp: string;
}
