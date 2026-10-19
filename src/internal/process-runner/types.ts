export interface ProcessCommand {
  readonly executable: string;
  readonly args?: readonly string[];
  readonly cwd?: string;
  readonly env?: Readonly<Record<string, string>>;
  readonly stdin?: string;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

export interface ProcessRunnerPolicy {
  readonly name: string;
  readonly allowedExecutables: readonly string[];
  /** Shell execution is disabled by default. Must be explicitly true to enable. */
  readonly allowShell?: boolean;
  readonly maxOutputBytes?: number;
  readonly defaultTimeoutMs?: number;
  readonly allowedEnvKeys?: readonly string[];
  /** When true (default), non-zero exit throws PROCESS_NON_ZERO_EXIT. */
  readonly failOnNonZeroExit?: boolean;
}

export interface ProcessOutputLimit {
  readonly maxBytes: number;
}

export interface ProcessResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly truncatedStdout: boolean;
  readonly truncatedStderr: boolean;
  readonly timedOut: boolean;
  readonly cancelled: boolean;
  readonly durationMs: number;
}

export interface ProcessRunner {
  run(command: ProcessCommand): Promise<ProcessResult>;
  runJson<T>(command: ProcessCommand): Promise<T>;
}
