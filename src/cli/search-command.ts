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

import { runSearch, SEARCH_KINDS, type RunSearchOptions, type SearchOutcome } from '../commands/search.js';
import type { SearchKind } from '../search/rank.js';

/**
 * CLI wiring for `ts-codegraph search`. Positional query plus `--project`, `--kind`,
 * `--limit`, `--json`. JSON mode prints exactly one validated `ts-codegraph.search@1`
 * envelope; empty results are `ok: true` with a neutral human message otherwise.
 */

export interface SearchCliOptions {
  readonly query?: string;
  readonly project?: string;
  readonly kind?: string;
  readonly limit?: string;
}

export interface SearchCliOverrides {
  readonly dataDirOverride?: string;
  readonly timestamp?: string;
}

export interface ExecuteSearchParams {
  readonly argv: readonly string[];
  readonly stdout?: NodeJS.WritableStream;
  readonly stderr?: NodeJS.WritableStream;
  readonly overrides?: SearchCliOverrides;
}

const VALUE_FLAGS = new Set(['--project', '--kind', '--limit', '--cwd', '--config', '--output']);

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

/** First bare positional argument (the query), skipping flags and their values. */
function readPositional(argv: readonly string[]): string | undefined {
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

export function parseSearchArgs(argv: readonly string[]): SearchCliOptions {
  const query = readPositional(argv);
  const project = readStringFlag(argv, '--project');
  const kind = readStringFlag(argv, '--kind');
  const limit = readStringFlag(argv, '--limit');
  return {
    ...(query !== undefined ? { query } : {}),
    ...(project !== undefined ? { project } : {}),
    ...(kind !== undefined ? { kind } : {}),
    ...(limit !== undefined ? { limit } : {}),
  };
}

function validationError(title: string, detail: string): AppError {
  return new AppError({ code: ERROR_CODES.VALIDATION, category: 'validation', title, clientDetail: detail });
}

function buildRunSearchOptions(
  options: SearchCliOptions,
  overrides?: SearchCliOverrides,
): RunSearchOptions {
  if (options.project === undefined) {
    throw validationError('--project is required', 'Pass --project <path> to search a project.');
  }
  if (options.query === undefined) {
    throw validationError('a search query is required', 'Pass a query string, e.g. `ts-codegraph search "AppError"`.');
  }
  let kind: SearchKind | undefined;
  if (options.kind !== undefined) {
    if (!SEARCH_KINDS.includes(options.kind as SearchKind)) {
      throw validationError('invalid --kind', `--kind must be one of: ${SEARCH_KINDS.join(', ')}.`);
    }
    kind = options.kind as SearchKind;
  }
  let limit: number | undefined;
  if (options.limit !== undefined) {
    const parsed = Number(options.limit);
    if (!Number.isFinite(parsed)) {
      throw validationError('invalid --limit', '--limit must be a number.');
    }
    limit = parsed;
  }
  return {
    projectPath: options.project,
    query: options.query,
    ...(kind !== undefined ? { kind } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(overrides?.dataDirOverride !== undefined ? { dataDirOverride: overrides.dataDirOverride } : {}),
    ...(overrides?.timestamp !== undefined ? { timestamp: overrides.timestamp } : {}),
  };
}

export const searchCommandDefinition = defineCliCommand<SearchCliOptions, SearchOutcome>({
  name: 'search',
  description: 'search the loaded ts-codegraph dataset (read-only)',
  options: [
    { flags: '--project <path>', description: 'project whose dataset to search' },
    { flags: '--kind <kind>', description: 'filter by kind: package|file|symbol|export|diagnostic' },
    { flags: '--limit <n>', description: 'max results (default 20, max 100)' },
  ],
  run: async (options: SearchCliOptions, _context: CliExecutionContext): Promise<SearchOutcome> => {
    return runSearch(buildRunSearchOptions(options));
  },
});

function emitHumanSummary(outcome: SearchOutcome, output: CliOutput): void {
  const { results, query } = outcome.envelope.data;
  if (results.length === 0) {
    output.writeLine(`No results for "${query}".`);
    return;
  }
  output.writeLine(`${results.length} result(s) for "${query}":`);
  for (const result of results) {
    output.writeLine(`  ${result.kind.padEnd(10)} ${result.label}  (${result.matchReasons.join(', ')})`);
  }
}

export async function executeSearchCommand(params: ExecuteSearchParams): Promise<number> {
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

  const emitError = (error: unknown): number => {
    const appError =
      error instanceof AppError
        ? error
        : new AppError({
            code: ERROR_CODES.INTERNAL,
            category: 'internal',
            title: 'search failed',
            clientDetail: 'The search did not complete.',
          });
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

  let outcome: SearchOutcome;
  try {
    outcome = await runSearch(buildRunSearchOptions(parseSearchArgs(params.argv), params.overrides));
  } catch (error) {
    return emitError(error);
  }

  if (globals.json) {
    output.writeJson(outcome.envelope);
  } else {
    emitHumanSummary(outcome, output);
  }
  return outcome.exitCode;
}
