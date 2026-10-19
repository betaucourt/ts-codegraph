import { AppError } from '../errors/index.js';
import { ERROR_CODES } from './generated/cli-entities.js';
import type { CliOutput, CliOutputOptions, CliResult } from './types.js';

class CliOutputImpl implements CliOutput {
  readonly json: boolean;
  readonly quiet: boolean;
  readonly noColor: boolean;
  readonly #out: NodeJS.WritableStream;
  readonly #err: NodeJS.WritableStream;

  constructor(opts: CliOutputOptions) {
    this.#out = opts.stdout ?? process.stdout;
    this.#err = opts.stderr ?? process.stderr;
    this.json = opts.json ?? false;
    this.quiet = opts.quiet ?? false;
    this.noColor = opts.noColor ?? false;
  }

  write(text: string): void {
    if (this.json || this.quiet) return;
    try {
      this.#out.write(text);
    } catch {
      // stream errors on write are silently dropped for non-essential output
    }
  }

  writeLine(text: string): void {
    if (this.json || this.quiet) return;
    try {
      this.#out.write(text + '\n');
    } catch {
      // stream errors on write are silently dropped for non-essential output
    }
  }

  writeError(text: string): void {
    try {
      this.#err.write(text);
    } catch {
      // stderr write failures cannot be reported anywhere safely
    }
  }

  writeErrorLine(text: string): void {
    try {
      this.#err.write(text + '\n');
    } catch {
      // stderr write failures cannot be reported anywhere safely
    }
  }

  writeJson(data: unknown): void {
    let serialized: string;
    try {
      serialized = JSON.stringify(data);
    } catch {
      throw new AppError({
        code: ERROR_CODES.CLI_OUTPUT_FAILED,
        category: 'internal',
        title: 'Output serialization failed',
        clientDetail: 'Command output could not be serialized to JSON',
      });
    }
    try {
      this.#out.write(serialized + '\n');
    } catch {
      throw new AppError({
        code: ERROR_CODES.CLI_OUTPUT_FAILED,
        category: 'internal',
        title: 'Output write failed',
        clientDetail: 'Command output could not be written',
      });
    }
  }
}

export function createCliOutput(opts?: CliOutputOptions): CliOutput {
  return new CliOutputImpl(opts ?? {});
}

export function writeCliResult<T>(result: CliResult<T>, output: CliOutput): void {
  if (output.json) {
    output.writeJson(result);
    return;
  }

  if (!result.success && result.error !== undefined) {
    const { title, detail } = result.error;
    output.writeErrorLine(detail !== undefined ? `${title}: ${detail}` : title);
  }
}
