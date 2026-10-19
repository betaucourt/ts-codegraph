import {
  createCliOutput,
  mapErrorToExitCode,
  parseGlobalCliOptions,
  writeCliResult,
  type CliOutput,
  type CliResult,
} from '../internal/cli/index.js';
import { AppError, ERROR_CODES } from '../internal/errors/index.js';

import {
  GenerateRefusedError,
  runGenerate,
  type GenerateOutcome,
  type GenerateTemplate,
  type RunGenerateOptions,
} from '../commands/generate.js';

/**
 * CLI wiring for `ts-codegraph generate docs`. `--project`, `--template`, `--output`
 * (required for any write), `--json`. JSON mode prints exactly one validated
 * `ts-codegraph.generate@1` envelope. A refusal (missing `--output`, missing dataset)
 * exits non-zero with a stable diagnostic.
 */

export interface GenerateCliOptions {
  readonly subcommand?: string;
  readonly project?: string;
  readonly template?: string;
  readonly output?: string;
}

export interface GenerateCliOverrides {
  readonly dataDirOverride?: string;
  readonly normalizedTimestamp?: string;
}

export interface ExecuteGenerateParams {
  readonly argv: readonly string[];
  readonly stdout?: NodeJS.WritableStream;
  readonly stderr?: NodeJS.WritableStream;
  readonly overrides?: GenerateCliOverrides;
}

export const GENERATE_TEMPLATES: readonly GenerateTemplate[] = ['package-overview', 'api-reference', 'all'];

const VALUE_FLAGS = new Set(['--project', '--template', '--output', '--out-dir', '--cwd', '--config']);

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

function readSubcommand(argv: readonly string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) continue;
    if (arg.startsWith('--')) {
      if (VALUE_FLAGS.has(arg) && !arg.includes('=')) index += 1;
      continue;
    }
    if (arg.startsWith('-')) continue;
    return arg;
  }
  return undefined;
}

export function parseGenerateArgs(argv: readonly string[]): GenerateCliOptions {
  const subcommand = readSubcommand(argv);
  const explicitProject = readStringFlag(argv, '--project');
  const positionalProject = subcommand !== undefined && subcommand !== 'docs' ? subcommand : undefined;
  const project = explicitProject ?? positionalProject ?? '.';
  const template = readStringFlag(argv, '--template');
  const output = readStringFlag(argv, '--output') ?? readStringFlag(argv, '--out-dir');
  return {
    ...(subcommand === 'docs' ? { subcommand } : {}),
    project,
    ...(template !== undefined ? { template } : {}),
    ...(output !== undefined ? { output } : {}),
  };
}

function validationError(title: string, detail: string): AppError {
  return new AppError({ code: ERROR_CODES.VALIDATION, category: 'validation', title, clientDetail: detail });
}

export function buildRunGenerateOptions(
  options: GenerateCliOptions,
  overrides?: GenerateCliOverrides,
): RunGenerateOptions {
  if (options.subcommand !== undefined && options.subcommand !== 'docs') {
    throw validationError('unknown generate subcommand', 'The only generate subcommand is `docs`.');
  }
  if (options.project === undefined) {
    throw validationError('--project is required', 'Pass --project <path> to generate from a project.');
  }
  const template = options.template ?? 'all';
  if (!GENERATE_TEMPLATES.includes(template as GenerateTemplate)) {
    throw validationError('invalid --template', `--template must be one of: ${GENERATE_TEMPLATES.join(', ')}.`);
  }
  return {
    projectPath: options.project,
    template: template as GenerateTemplate,
    ...(options.output !== undefined ? { outputDir: options.output } : {}),
    ...(overrides?.dataDirOverride !== undefined ? { dataDirOverride: overrides.dataDirOverride } : {}),
    ...(overrides?.normalizedTimestamp !== undefined ? { normalizedTimestamp: overrides.normalizedTimestamp } : {}),
  };
}

function emitHumanSummary(outcome: GenerateOutcome, output: CliOutput): void {
  const { generatedDocs, skippedDocs } = outcome.envelope.data;
  output.writeLine(`Generated ${generatedDocs.length} doc(s), skipped ${skippedDocs.length}.`);
  for (const doc of generatedDocs) {
    output.writeLine(`  + ${doc.conceptPath}  (${doc.templateId})`);
  }
  for (const doc of skippedDocs) {
    output.writeLine(`  - ${doc.conceptPath}  skipped: ${doc.reasonCode}`);
  }
}

export async function executeGenerateCommand(params: ExecuteGenerateParams): Promise<number> {
  const stdout = params.stdout ?? process.stdout;
  const stderr = params.stderr ?? process.stderr;
  const globals = parseGlobalCliOptions(params.argv);
  const output = createCliOutput({
    stdout,
    stderr,
    json: globals.json,
    quiet: globals.quiet,
    noColor: globals.noColor,
  });

  const emitError = (code: string, category: string, title: string, detail: string): number => {
    const exitCode = mapErrorToExitCode(
      new AppError({ code: code as (typeof ERROR_CODES)[keyof typeof ERROR_CODES], category: category as 'validation', title, clientDetail: detail }),
    );
    const result: CliResult = {
      success: false,
      error: { code, category, title, detail },
      exitCode,
    };
    writeCliResult(result, output);
    return exitCode;
  };

  let outcome: GenerateOutcome;
  try {
    outcome = await runGenerate(buildRunGenerateOptions(parseGenerateArgs(params.argv), params.overrides));
  } catch (error) {
    if (error instanceof GenerateRefusedError) {
      return emitError(error.diagnostic.code, 'validation', 'generate refused', error.diagnostic.message);
    }
    if (error instanceof AppError) {
      return emitError(error.code, error.category, error.title, error.clientDetail ?? '');
    }
    return emitError(ERROR_CODES.INTERNAL, 'internal', 'generate failed', 'The generate command did not complete.');
  }

  if (globals.json) {
    output.writeJson(outcome.envelope);
  } else {
    emitHumanSummary(outcome, output);
  }
  return outcome.exitCode;
}
