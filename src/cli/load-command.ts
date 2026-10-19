import {
  createCliOutput,
  defineCliCommand,
  mapErrorToExitCode,
  parseGlobalCliOptions,
  writeCliResult,
  type CliExecutionContext,
  type CliOutput,
  type CliResult,
} from '../internal/cli/index.js';
import { AppError, ERROR_CODES } from '../internal/errors/index.js';

import { runLoad, type LoadOutcome, type RunLoadOptions } from '../commands/load.js';

/**
 * CLI wiring for `ts-codegraph load`. Like `check`, JSON mode prints exactly one
 * validated `ts-codegraph.load@1` envelope on stdout; the shared `@codegraph/cli`
 * `CliResult` wrapper is bypassed so the envelope is the sole JSON document.
 */

export interface LoadCliOptions {
  readonly project?: string;
}

/** Test-only injection seams; never wired to a CLI flag. */
export interface LoadCliOverrides {
  readonly dataDirOverride?: string;
  readonly timestamp?: string;
}

export interface ExecuteLoadParams {
  readonly argv: readonly string[];
  readonly stdout?: NodeJS.WritableStream;
  readonly stderr?: NodeJS.WritableStream;
  readonly overrides?: LoadCliOverrides;
}

function readStringFlag(argv: readonly string[], flag: string): string | undefined {
  const prefix = `${flag}=`;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) continue;
    if (arg.startsWith(prefix)) return arg.slice(prefix.length);
    if (arg === flag) {
      const next = argv[index + 1];
      if (next !== undefined && !next.startsWith('-')) return next;
    }
  }
  return undefined;
}

export function parseLoadArgs(argv: readonly string[]): LoadCliOptions {
  const project = readStringFlag(argv, '--project') ?? argv.find((arg) => !arg.startsWith('-'));
  return project !== undefined ? { project } : {};
}

function missingProjectError(): AppError {
  return new AppError({
    code: ERROR_CODES.VALIDATION,
    category: 'validation',
    title: '--project is required',
    clientDetail: 'Pass --project <path> to load a project.',
  });
}

function buildRunLoadOptions(project: string, overrides?: LoadCliOverrides): RunLoadOptions {
  return {
    projectPath: project,
    ...(overrides?.dataDirOverride !== undefined ? { dataDirOverride: overrides.dataDirOverride } : {}),
    ...(overrides?.timestamp !== undefined ? { timestamp: overrides.timestamp } : {}),
  };
}

/** The `defineCliCommand` contract for `load` (used for registration/help). */
export const loadCommandDefinition = defineCliCommand<LoadCliOptions, LoadOutcome>({
  name: 'load',
  description: 'load a project into the ts-codegraph dataset (the sole fact writer)',
  options: [{ flags: '--project <path>', description: 'target project directory to load' }],
  run: async (options: LoadCliOptions, _context: CliExecutionContext): Promise<LoadOutcome> => {
    const project = typeof options.project === 'string' ? options.project : undefined;
    if (project === undefined) {
      throw missingProjectError();
    }
    return runLoad(buildRunLoadOptions(project));
  },
});

function emitHumanSummary(outcome: LoadOutcome, output: CliOutput): void {
  const { counts } = outcome.envelope.data;
  output.writeLine(`load: ${outcome.ok ? 'ok' : 'completed with diagnostics'}`);
  output.writeLine(`  snapshot ${outcome.envelope.data.snapshotId}`);
  output.writeLine(
    `  packages ${counts.packages}  files ${counts.sourceFiles}  symbols ${counts.symbols}  search ${counts.searchDocuments}`,
  );
}

/**
 * Execute `load` end to end. JSON mode writes exactly one validated
 * `ts-codegraph.load@1` envelope; a failed load (rolled back) reports a safe CLI error.
 */
export async function executeLoadCommand(params: ExecuteLoadParams): Promise<number> {
  const stdout = params.stdout ?? process.stdout;
  const stderr = params.stderr ?? process.stderr;
  const globals = parseGlobalCliOptions(params.argv);
  const { project } = parseLoadArgs(params.argv);
  const output = createCliOutput({
    stdout,
    stderr,
    json: globals.json,
    quiet: globals.quiet,
    noColor: globals.noColor,
  });

  const emitError = (error: unknown): number => {
    const appError = error instanceof AppError ? error : missingProjectError();
    const exitCode = mapErrorToExitCode(appError);
    const result: CliResult = {
      success: false,
      error: {
        code: appError.code,
        category: appError.category,
        title: appError.title,
        ...(appError.clientDetail !== undefined ? { detail: appError.clientDetail } : {}),
      },
      exitCode,
    };
    writeCliResult(result, output);
    return exitCode;
  };

  if (project === undefined) {
    return emitError(missingProjectError());
  }

  let outcome: LoadOutcome;
  try {
    outcome = await runLoad(buildRunLoadOptions(project, params.overrides));
  } catch (error) {
    // A failed load has already rolled back; surface a safe error and non-zero exit.
    const appError =
      error instanceof AppError
        ? error
        : new AppError({
            code: ERROR_CODES.INTERNAL,
            category: 'internal',
            title: 'load failed',
            clientDetail: 'The load did not complete; the dataset was left unchanged.',
          });
    return emitError(appError);
  }

  if (globals.json) {
    output.writeJson(outcome.envelope);
  } else {
    emitHumanSummary(outcome, output);
  }
  return outcome.exitCode;
}
