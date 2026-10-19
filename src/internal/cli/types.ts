export interface CliGlobalOptions {
  readonly cwd?: string;
  readonly config?: string;
  readonly output?: string;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly quiet: boolean;
  readonly verbose: boolean;
  readonly noColor: boolean;
}

export interface CliExecutionContext {
  readonly globalOptions: CliGlobalOptions;
  readonly output: CliOutput;
}

export interface CliErrorDetail {
  readonly code: string;
  readonly category: string;
  readonly title: string;
  readonly detail?: string;
}

export interface CliResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: CliErrorDetail;
  readonly exitCode: number;
}

export interface CliCommandOption {
  readonly flags: string;
  readonly description: string;
  readonly defaultValue?: string | boolean;
}

export interface CliCommandDefinition<TOptions = Record<string, unknown>, TResult = unknown> {
  readonly name: string;
  readonly description: string;
  readonly options?: readonly CliCommandOption[];
  readonly run: (options: TOptions, context: CliExecutionContext) => Promise<TResult>;
}

/**
 * A parent command group that owns a flat list of leaf child commands, e.g.
 * `codegraph-cli run start`. This row supports exactly one structural parent level:
 * a group owns leaf {@link CliCommandDefinition} children. Recursive groups,
 * group actions, and group-local options are intentionally out of scope.
 */
export interface CliCommandGroupDefinition {
  readonly name: string;
  readonly description: string;
  readonly commands: readonly CliCommandDefinition[];
}

export interface CliProgramOptions {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly packageName?: string;
  readonly stdout?: NodeJS.WritableStream;
  readonly stderr?: NodeJS.WritableStream;
}

export interface CliOutputOptions {
  readonly stdout?: NodeJS.WritableStream;
  readonly stderr?: NodeJS.WritableStream;
  readonly json?: boolean;
  readonly quiet?: boolean;
  readonly noColor?: boolean;
}

export interface CliOutput {
  readonly json: boolean;
  readonly quiet: boolean;
  readonly noColor: boolean;
  write(text: string): void;
  writeLine(text: string): void;
  writeError(text: string): void;
  writeErrorLine(text: string): void;
  writeJson(data: unknown): void;
}

export interface CliProgram {
  addCommand<TOptions, TResult>(def: CliCommandDefinition<TOptions, TResult>): this;
  addCommandGroup(def: CliCommandGroupDefinition): this;
  parseAsync(argv?: readonly string[]): Promise<void>;
}
