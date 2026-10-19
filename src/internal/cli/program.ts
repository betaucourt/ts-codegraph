import { Command } from 'commander';
import { AppError, isAppError, normalizeAppError, getCliExitCodeForError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { createRedactor, redactValue, sanitizeDiagnosticText } from '../security/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/cli-entities.js';
import { createCliOutput, writeCliResult } from './output.js';
import type {
  CliCommandDefinition,
  CliCommandGroupDefinition,
  CliCommandOption,
  CliErrorDetail,
  CliExecutionContext,
  CliGlobalOptions,
  CliOutput,
  CliProgram,
  CliProgramOptions,
  CliResult,
} from './types.js';

const CLI_TRACER_NAME = 'codegraph.cli';
const CLI_SPAN_NAME = 'codegraph.cli.command';
const MAX_COMMAND_NAME = 64;
// Command path is at most two sanitized 64-char segments plus a separator dot.
const MAX_COMMAND_PATH = 130;
// Bounds applied to caller-supplied help text before it reaches Commander.
const MAX_DESCRIPTION = 256;
const MAX_OPTION_FLAGS = 128;

const OWN = Object.prototype.hasOwnProperty;

// Module-level redactor for command name credential checks.
const COMMAND_NAME_REDACTOR = createRedactor();

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

// Validates the command name: bounded length, no path separators or control
// chars, and no credential-like patterns that would be redacted.
function validateCommandName(name: string): string {
  if (!name || name.length > MAX_COMMAND_NAME) {
    throw new AppError({
      code: ERROR_CODES.CLI_FLAG_INVALID,
      category: 'validation',
      title: 'Command name is invalid',
      clientDetail: 'Command name must be 1-64 characters',
    });
  }
  if (hasControlChars(name) || name.includes('/') || name.includes('\\')) {
    throw new AppError({
      code: ERROR_CODES.CLI_FLAG_INVALID,
      category: 'validation',
      title: 'Command name contains invalid characters',
      clientDetail: 'Command name must not contain path separators or control characters',
    });
  }
  if (redactValue(COMMAND_NAME_REDACTOR, name).redacted) {
    throw new AppError({
      code: ERROR_CODES.CLI_FLAG_INVALID,
      category: 'validation',
      title: 'Command name is not permitted',
      clientDetail: 'Command name must not resemble credential material',
    });
  }
  return name;
}

// Sanitizes a command name for safe use as a telemetry attribute value.
// Applies sanitizeDiagnosticText + redactValue + length bound.
// This is the package-local span attribute path: codegraph.cli.command spans
// are not registered in @codegraph/otel-contracts (which would require
// touching a shared contract for a package-local span). The trade-off is
// that assertKnownSpanName is not called; we compensate by sanitizing the
// only user-influenced attribute (command_name) before setting it.
function sanitizeCommandNameForTelemetry(name: string): string {
  const sanitized = sanitizeDiagnosticText(name);
  const { value } = redactValue(COMMAND_NAME_REDACTOR, sanitized);
  const bounded = value.trim().slice(0, MAX_COMMAND_NAME);
  return bounded.length > 0 ? bounded : '_cmd';
}

// Builds a bounded, low-cardinality command-path attribute value from ordered
// path segments (e.g. ['run', 'start'] -> 'run.start'). Each segment is
// sanitized with the same policy as command_name, then the joined value is
// length-bounded. For flat commands the single-segment path equals the
// sanitized command name.
function sanitizeCommandPath(segments: readonly string[]): string {
  const joined = segments.map(sanitizeCommandNameForTelemetry).join('.');
  const bounded = joined.slice(0, MAX_COMMAND_PATH);
  return bounded.length > 0 ? bounded : '_cmd';
}

// ---------------------------------------------------------------------------
// Definition trust boundary
//
// Caller-owned command, group, and option definitions are snapshotted from own
// data properties before Commander registration. Accessor descriptors and
// prototype-inherited required fields are rejected WITHOUT invoking any getter,
// so a malicious definition cannot run arbitrary code or smuggle mutable state
// into the registered command tree.
// ---------------------------------------------------------------------------

function invalidDefinition(clientDetail: string): AppError {
  return new AppError({
    code: ERROR_CODES.CLI_FLAG_INVALID,
    category: 'validation',
    title: 'Command definition is invalid',
    clientDetail,
  });
}

// Reads an own property as a data value. Returns { present: false } when the
// key is absent or inherited from the prototype. Throws when the own property
// is an accessor descriptor — the getter is never invoked.
function readOwnData(obj: object, key: string): { present: boolean; value: unknown } {
  if (!OWN.call(obj, key)) {
    return { present: false, value: undefined };
  }
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  if (desc === undefined || !('value' in desc)) {
    throw invalidDefinition('Definition fields must be plain data properties, not accessors');
  }
  return { present: true, value: desc.value };
}

function requireObject(value: unknown, what: string): object {
  if (value === null || typeof value !== 'object') {
    throw invalidDefinition(`${what} must be an object`);
  }
  return value;
}

function requireOwnString(obj: object, key: string, what: string): string {
  const { present, value } = readOwnData(obj, key);
  if (!present) throw invalidDefinition(`${what} is required`);
  if (typeof value !== 'string') throw invalidDefinition(`${what} must be a string`);
  return value;
}

function requireOwnFunction(
  obj: object,
  key: string,
  what: string,
): (...args: never[]) => unknown {
  const { present, value } = readOwnData(obj, key);
  if (!present) throw invalidDefinition(`${what} is required`);
  if (typeof value !== 'function') throw invalidDefinition(`${what} must be a function`);
  return value as (...args: never[]) => unknown;
}

function boundText(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text;
}

// Snapshots a single option definition from own data properties.
function snapshotOption(raw: unknown): CliCommandOption {
  const obj = requireObject(raw, 'Command option');
  const flags = boundText(requireOwnString(obj, 'flags', 'Command option flags'), MAX_OPTION_FLAGS);
  const description = boundText(
    requireOwnString(obj, 'description', 'Command option description'),
    MAX_DESCRIPTION,
  );
  const dv = readOwnData(obj, 'defaultValue');
  if (dv.present && dv.value !== undefined) {
    if (typeof dv.value !== 'string' && typeof dv.value !== 'boolean') {
      throw invalidDefinition('Command option defaultValue must be a string or boolean');
    }
    return { flags, description, defaultValue: dv.value };
  }
  return { flags, description };
}

// Snapshots an own array property element-by-element, rejecting sparse holes
// and accessor-defined indices without invoking getters.
function snapshotOwnArray<T>(
  obj: object,
  key: string,
  what: string,
  required: boolean,
  mapElement: (element: unknown) => T,
): T[] | undefined {
  const { present, value } = readOwnData(obj, key);
  if (!present || value === undefined) {
    if (required) throw invalidDefinition(`${what} is required`);
    return undefined;
  }
  if (!Array.isArray(value)) throw invalidDefinition(`${what} must be an array`);
  const out: T[] = [];
  for (let i = 0; i < value.length; i++) {
    const element = readOwnData(value, String(i));
    if (!element.present) throw invalidDefinition(`${what} must not contain holes`);
    out.push(mapElement(element.value));
  }
  return out;
}

// Produces a detached, validated snapshot of a leaf command definition.
function snapshotCommandDefinition<TOptions, TResult>(
  raw: unknown,
): CliCommandDefinition<TOptions, TResult> {
  const obj = requireObject(raw, 'Command definition');
  const name = requireOwnString(obj, 'name', 'Command name');
  validateCommandName(name);
  const description = boundText(
    requireOwnString(obj, 'description', 'Command description'),
    MAX_DESCRIPTION,
  );
  const run = requireOwnFunction(obj, 'run', 'Command run handler') as CliCommandDefinition<
    TOptions,
    TResult
  >['run'];
  const options = snapshotOwnArray(obj, 'options', 'Command options', false, snapshotOption);
  return options !== undefined
    ? { name, description, options, run }
    : { name, description, run };
}

// Produces a detached, validated snapshot of a parent command group. Child
// command names must be unique within the group so Commander cannot register
// two ambiguous subcommands.
function snapshotGroupDefinition(raw: unknown): CliCommandGroupDefinition {
  const obj = requireObject(raw, 'Command group definition');
  const name = requireOwnString(obj, 'name', 'Group name');
  validateCommandName(name);
  const description = boundText(
    requireOwnString(obj, 'description', 'Group description'),
    MAX_DESCRIPTION,
  );
  const commands = snapshotOwnArray(
    obj,
    'commands',
    'Group commands',
    true,
    (element) => snapshotCommandDefinition(element),
  ) as CliCommandDefinition[];
  if (commands.length === 0) {
    throw invalidDefinition('Group must contain at least one command');
  }
  const seen = new Set<string>();
  for (const child of commands) {
    if (seen.has(child.name)) {
      throw invalidDefinition('Group child command names must be unique');
    }
    seen.add(child.name);
  }
  return { name, description, commands };
}

function extractGlobalOpts(raw: Record<string, unknown>): CliGlobalOptions {
  return {
    ...(typeof raw['cwd'] === 'string' ? { cwd: raw['cwd'] } : {}),
    ...(typeof raw['config'] === 'string' ? { config: raw['config'] } : {}),
    ...(typeof raw['output'] === 'string' ? { output: raw['output'] } : {}),
    dryRun: raw['dryRun'] === true,
    json: raw['json'] === true,
    quiet: raw['quiet'] === true,
    verbose: raw['verbose'] === true,
    noColor: raw['color'] === false || raw['noColor'] === true,
  };
}

function addGlobalOptions(cmd: Command): void {
  cmd
    .option('--cwd <path>', 'working directory')
    .option('--config <path>', 'configuration file path')
    .option('--output <path>', 'output file path')
    .option('--dry-run', 'perform a dry run without making changes', false)
    .option('--json', 'output results as JSON', false)
    .option('--quiet', 'suppress non-error output', false)
    .option('--verbose', 'enable verbose diagnostic output', false)
    .option('--no-color', 'disable ANSI color codes in output');
}

function buildCliError(err: unknown): CliErrorDetail {
  const appErr = isAppError(err) ? err : normalizeAppError(err);
  const safe = appErr.toSafeAttributes();
  if (appErr.clientDetail !== undefined) {
    return { code: safe.code, category: safe.category, title: appErr.title, detail: appErr.clientDetail };
  }
  return { code: safe.code, category: safe.category, title: appErr.title };
}

// Internal execution helper. Grouped program execution passes a sanitized
// command path (e.g. 'run.start') so telemetry can record the full leaf path
// without changing the public runCliCommand signature. `commandPath` is already
// sanitized/bounded by the caller.
async function runCliCommandWithPath<TOptions, TResult>(
  command: CliCommandDefinition<TOptions, TResult>,
  parsedOptions: TOptions,
  context: CliExecutionContext,
  commandPath: string,
): Promise<CliResult<TResult>> {
  const safeCommandName = sanitizeCommandNameForTelemetry(command.name);
  const tracer = getTracer(CLI_TRACER_NAME);
  const span = tracer.startSpan(CLI_SPAN_NAME, {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_COMMAND_NAME]: safeCommandName,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_COMMAND_PATH]: commandPath,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_DRY_RUN]: context.globalOptions.dryRun,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_JSON_MODE]: context.globalOptions.json,
    },
  });

  try {
    const data = await command.run(parsedOptions, context);
    span.setStatus({ code: SpanStatusCode.OK });
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_EXIT_CODE, 0);
    span.end();
    return { success: true, data, exitCode: 0 };
  } catch (err) {
    const appErr = isAppError(err) ? err : normalizeAppError(err);
    const exitCode = getCliExitCodeForError(appErr);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_EXIT_CODE, exitCode);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_CLI_ERROR_CODE, appErr.code);
    span.setStatus({ code: SpanStatusCode.ERROR, message: appErr.code });
    span.end();
    const cliError = buildCliError(err);
    return { success: false as const, error: cliError, exitCode };
  }
}

export async function runCliCommand<TOptions, TResult>(
  command: CliCommandDefinition<TOptions, TResult>,
  parsedOptions: TOptions,
  context: CliExecutionContext,
): Promise<CliResult<TResult>> {
  // Trust boundary: standalone callers pass a caller-owned definition directly,
  // so snapshot and validate it here — the same hardening the program
  // registration paths apply. This rejects accessor descriptors (without
  // invoking getters), prototype-inherited required fields, and unsafe command
  // names before any name read or handler execution. The program action paths
  // pass an already-snapshotted definition through runCliCommandWithPath and do
  // not re-enter this function, so there is no double snapshot.
  const snapshot = snapshotCommandDefinition<TOptions, TResult>(command);
  // Flat execution: the command path is the single sanitized command name.
  const commandPath = sanitizeCommandPath([snapshot.name]);
  return runCliCommandWithPath(snapshot, parsedOptions, context, commandPath);
}

class CliProgramImpl implements CliProgram {
  readonly #commander: Command;
  readonly #stdout: NodeJS.WritableStream;
  readonly #stderr: NodeJS.WritableStream;
  // Reserved top-level command and group names, enforced program-wide so
  // Commander never registers two ambiguous top-level entries.
  readonly #reservedNames = new Set<string>();

  constructor(opts: CliProgramOptions) {
    this.#stdout = opts.stdout ?? process.stdout;
    this.#stderr = opts.stderr ?? process.stderr;

    this.#commander = new Command();
    this.#commander
      .name(opts.name)
      .description(opts.description)
      .version(opts.version, '-v, --version', 'output the version number')
      .configureOutput({
        writeOut: (str) => this.#stdout.write(str),
        writeErr: (str) => this.#stderr.write(str),
      });

    addGlobalOptions(this.#commander);
  }

  #reserveName(name: string): void {
    if (this.#reservedNames.has(name)) {
      throw invalidDefinition('Command and group names must be unique within the program');
    }
    this.#reservedNames.add(name);
  }

  // Routes a subcommand's own output (including its --help text) through the same
  // stdout/stderr streams as the root program. Commander does not inherit output
  // configuration into subcommands, so it must be applied to each command.
  #configureCommandOutput(cmd: Command): void {
    cmd.configureOutput({
      writeOut: (str) => this.#stdout.write(str),
      writeErr: (str) => this.#stderr.write(str),
    });
  }

  // Builds a Commander leaf command from an already-snapshotted definition.
  // `pathSegments` are the ordered path parts used to compute low-cardinality
  // command-path telemetry (e.g. ['run', 'start'] for a grouped child).
  #buildLeafCommand<TOptions, TResult>(
    def: CliCommandDefinition<TOptions, TResult>,
    pathSegments: readonly string[],
  ): Command {
    const sub = new Command(def.name).description(def.description);
    this.#configureCommandOutput(sub);

    for (const opt of def.options ?? []) {
      if (opt.defaultValue !== undefined) {
        // Pass defaultValue directly to preserve boolean types — do not coerce to string.
        sub.option(opt.flags, opt.description, opt.defaultValue as string | boolean);
      } else {
        sub.option(opt.flags, opt.description);
      }
    }

    const parent = this;
    const commandPath = sanitizeCommandPath(pathSegments);
    sub.action(async (...actionArgs: unknown[]) => {
      const subcmd = actionArgs[actionArgs.length - 1] as Command;
      // Global flags are governed by the root program even for grouped children,
      // because Commander routes root-defined options up from any nesting depth.
      const globalOpts = extractGlobalOpts(parent.#commander.opts<Record<string, unknown>>());
      const subOpts = subcmd.opts() as TOptions;
      const output: CliOutput = createCliOutput({
        stdout: parent.#stdout,
        stderr: parent.#stderr,
        json: globalOpts.json,
        quiet: globalOpts.quiet,
        noColor: globalOpts.noColor,
      });
      // stdout/stderr are NOT placed in context — handlers must use context.output.
      const context: CliExecutionContext = {
        globalOptions: globalOpts,
        output,
      };
      const result = await runCliCommandWithPath(def, subOpts, context, commandPath);
      try {
        writeCliResult(result, output);
      } catch (outputErr) {
        // writeCliResult threw CLI_OUTPUT_FAILED (e.g. circular data in --json mode).
        // Use a deterministic internal error exit code and try to emit a safe diagnostic.
        process.exitCode = 1;
        const appErr = isAppError(outputErr) ? outputErr : normalizeAppError(outputErr);
        try {
          parent.#stderr.write(appErr.title + '\n');
        } catch {
          // stderr also unavailable — accept silent failure
        }
        return;
      }
      process.exitCode = result.exitCode;
    });

    return sub;
  }

  addCommand<TOptions, TResult>(def: CliCommandDefinition<TOptions, TResult>): this {
    // Re-snapshot at the boundary so callers cannot bypass defineCliCommand.
    const snapshot = snapshotCommandDefinition<TOptions, TResult>(def);
    this.#reserveName(snapshot.name);
    this.#commander.addCommand(this.#buildLeafCommand(snapshot, [snapshot.name]));
    return this;
  }

  addCommandGroup(def: CliCommandGroupDefinition): this {
    // Re-snapshot at the boundary so callers cannot bypass defineCliCommandGroup.
    const group = snapshotGroupDefinition(def);
    this.#reserveName(group.name);

    // One structural parent level: the group is a Commander command with no
    // action of its own that owns leaf children. Parent --help lists children.
    const parentCommand = new Command(group.name).description(group.description);
    this.#configureCommandOutput(parentCommand);
    for (const child of group.commands) {
      parentCommand.addCommand(this.#buildLeafCommand(child, [group.name, child.name]));
    }
    this.#commander.addCommand(parentCommand);
    return this;
  }

  async parseAsync(argv: readonly string[] = process.argv): Promise<void> {
    await this.#commander.parseAsync([...argv]);
  }
}

export function createCliProgram(opts: CliProgramOptions): CliProgram {
  return new CliProgramImpl(opts);
}

export function defineCliCommand<TOptions = Record<string, unknown>, TResult = unknown>(
  def: CliCommandDefinition<TOptions, TResult>,
): CliCommandDefinition<TOptions, TResult> {
  // Returns a detached validated snapshot taken from own data properties.
  return snapshotCommandDefinition<TOptions, TResult>(def);
}

export function defineCliCommandGroup(
  def: CliCommandGroupDefinition,
): CliCommandGroupDefinition {
  // Returns a detached validated snapshot with snapshotted child commands.
  return snapshotGroupDefinition(def);
}

export function parseGlobalCliOptions(argv: readonly string[]): CliGlobalOptions {
  const result: {
    cwd?: string;
    config?: string;
    output?: string;
    dryRun: boolean;
    json: boolean;
    quiet: boolean;
    verbose: boolean;
    noColor: boolean;
  } = { dryRun: false, json: false, quiet: false, verbose: false, noColor: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // GNU-style long option assignment: --key=value
    if (arg !== undefined && arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex > 2) {
        const key = arg.slice(2, eqIndex);
        const val = arg.slice(eqIndex + 1);
        if (key === 'cwd') { result.cwd = val; continue; }
        if (key === 'config') { result.config = val; continue; }
        if (key === 'output') { result.output = val; continue; }
        continue;
      }
    }

    const next = argv[i + 1];
    switch (arg) {
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--json':
        result.json = true;
        break;
      case '--quiet':
        result.quiet = true;
        break;
      case '--verbose':
        result.verbose = true;
        break;
      case '--no-color':
        result.noColor = true;
        break;
      case '--cwd':
        if (next !== undefined && !next.startsWith('-')) {
          result.cwd = next;
          i++;
        }
        break;
      case '--config':
        if (next !== undefined && !next.startsWith('-')) {
          result.config = next;
          i++;
        }
        break;
      case '--output':
        if (next !== undefined && !next.startsWith('-')) {
          result.output = next;
          i++;
        }
        break;
    }
  }

  return result;
}
