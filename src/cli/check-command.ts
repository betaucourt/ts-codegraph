import {
  createCliOutput,
  defineCliCommand,
  mapErrorToExitCode,
  parseGlobalCliOptions,
  writeCliResult,
  type CliExecutionContext,
  type CliGlobalOptions,
  type CliOutput,
  type CliResult,
} from '../internal/cli/index.js';
import { AppError, ERROR_CODES } from '../internal/errors/index.js';

import { DEFAULT_TEMPLATE_PACK, runCheck, type CheckOutcome, type RunCheckOptions } from '../commands/check.js';

/**
 * CLI wiring for `ts-codegraph check`.
 *
 * `check` must print, in `--json` mode, exactly one `ts-codegraph.check@1` envelope
 * on stdout. The `@codegraph/cli` program action always appends a `CliResult`
 * wrapper through `writeCliResult`, which would either wrap the envelope or emit
 * a second JSON document. So this module composes the shared CLI primitives
 * directly — `defineCliCommand` for the command contract, `parseGlobalCliOptions`
 * for the standard globals, `createCliOutput`/`writeCliResult`/`mapErrorToExitCode`
 * for human output and exit mapping — and owns the JSON boundary itself so the
 * validated envelope is the sole JSON document written.
 */

export interface CheckCliOptions {
  readonly project?: string;
  readonly templatePack?: string;
}

/** Test-only injection seams; never wired to a CLI flag. */
export interface CheckCliOverrides {
  readonly dataDirOverride?: string;
  readonly templatePacksDir?: string;
  readonly timestamp?: string;
}

export interface ExecuteCheckParams {
  readonly argv: readonly string[];
  readonly stdout?: NodeJS.WritableStream;
  readonly stderr?: NodeJS.WritableStream;
  readonly overrides?: CheckCliOverrides;
}

function buildRunCheckOptions(
  project: string,
  templatePack: string,
  globals: CliGlobalOptions,
  overrides?: CheckCliOverrides,
): RunCheckOptions {
  return {
    projectPath: project,
    templatePack,
    ...(globals.output !== undefined ? { outputDir: globals.output } : {}),
    ...(overrides?.dataDirOverride !== undefined ? { dataDirOverride: overrides.dataDirOverride } : {}),
    ...(overrides?.templatePacksDir !== undefined ? { templatePacksDir: overrides.templatePacksDir } : {}),
    ...(overrides?.timestamp !== undefined ? { timestamp: overrides.timestamp } : {}),
  };
}

/** Read a `--flag value` / `--flag=value` string option from an argv array. */
function readStringFlag(argv: readonly string[], flag: string): string | undefined {
  const prefix = `${flag}=`;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) {
      continue;
    }
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length);
    }
    if (arg === flag) {
      const next = argv[index + 1];
      if (next !== undefined && !next.startsWith('-')) {
        return next;
      }
    }
  }
  return undefined;
}

/** Parse the two `check`-specific options from argv (globals come separately). */
export function parseCheckArgs(argv: readonly string[]): CheckCliOptions {
  const project = readStringFlag(argv, '--project');
  const templatePack = readStringFlag(argv, '--template-pack');
  return {
    ...(project !== undefined ? { project } : {}),
    ...(templatePack !== undefined ? { templatePack } : {}),
  };
}

function missingProjectError(): AppError {
  return new AppError({
    code: ERROR_CODES.VALIDATION,
    category: 'validation',
    title: '--project is required',
    clientDetail: 'Pass --project <path> to check a project.',
  });
}

/** The `defineCliCommand` contract for `check` (used for registration/help). */
export const checkCommandDefinition = defineCliCommand<CheckCliOptions, CheckOutcome>({
  name: 'check',
  description: 'preflight a project for ts-codegraph load and generation (reads only; writes nothing)',
  options: [
    { flags: '--project <path>', description: 'target project directory to check' },
    {
      flags: '--template-pack <name>',
      description: 'template pack to validate',
      defaultValue: DEFAULT_TEMPLATE_PACK,
    },
  ],
  run: async (options: CheckCliOptions, context: CliExecutionContext): Promise<CheckOutcome> => {
    const project = typeof options.project === 'string' ? options.project : undefined;
    if (project === undefined) {
      throw missingProjectError();
    }
    const templatePack = typeof options.templatePack === 'string' ? options.templatePack : DEFAULT_TEMPLATE_PACK;
    return runCheck(buildRunCheckOptions(project, templatePack, context.globalOptions));
  },
});

function emitHumanSummary(outcome: CheckOutcome, output: CliOutput): void {
  output.writeLine(`check: ${outcome.ok ? 'ok' : 'failed'}`);
  for (const preflight of outcome.envelope.data.preflightChecks) {
    output.writeLine(`  ${preflight.status.toUpperCase().padEnd(4)} ${preflight.label}`);
  }
}

/**
 * Execute `check` end to end. In `--json` mode stdout is exactly one validated
 * `ts-codegraph.check@1` envelope; otherwise a minimal human summary is written and
 * errors go through `writeCliResult`. Returns the POSIX exit code.
 */
export async function executeCheckCommand(params: ExecuteCheckParams): Promise<number> {
  const stdout = params.stdout ?? process.stdout;
  const stderr = params.stderr ?? process.stderr;
  const globals = parseGlobalCliOptions(params.argv);
  const { project, templatePack } = parseCheckArgs(params.argv);
  const output = createCliOutput({
    stdout,
    stderr,
    json: globals.json,
    quiet: globals.quiet,
    noColor: globals.noColor,
  });

  if (project === undefined) {
    const error = missingProjectError();
    const exitCode = mapErrorToExitCode(error);
    const result: CliResult = {
      success: false,
      error: {
        code: error.code,
        category: error.category,
        title: error.title,
        ...(error.clientDetail !== undefined ? { detail: error.clientDetail } : {}),
      },
      exitCode,
    };
    writeCliResult(result, output);
    return exitCode;
  }

  const runOptions = buildRunCheckOptions(
    project,
    templatePack ?? DEFAULT_TEMPLATE_PACK,
    globals,
    params.overrides,
  );
  const outcome = await runCheck(runOptions);

  if (globals.json) {
    output.writeJson(outcome.envelope);
  } else {
    emitHumanSummary(outcome, output);
  }

  return outcome.exitCode;
}
