#!/usr/bin/env node
import { executeCheckCommand } from '../cli/check-command.js';
import { executeGenerateCommand } from '../cli/generate-command.js';
import { executeLoadCommand } from '../cli/load-command.js';
import { executeSearchCommand } from '../cli/search-command.js';

/**
 * `ts-codegraph` CLI entrypoint. Routes the `check`, `load`, `search`, and `generate`
 * subcommands; flags are recognised by position-independent scanning. `check` is the
 * default when no known subcommand token leads.
 */
async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  if (rawArgs[0] === 'load') {
    process.exitCode = await executeLoadCommand({ argv: rawArgs.slice(1) });
    return;
  }
  if (rawArgs[0] === 'search') {
    process.exitCode = await executeSearchCommand({ argv: rawArgs.slice(1) });
    return;
  }
  if (rawArgs[0] === 'generate') {
    process.exitCode = await executeGenerateCommand({ argv: rawArgs.slice(1) });
    return;
  }
  const argv = rawArgs[0] === 'check' ? rawArgs.slice(1) : rawArgs;
  process.exitCode = await executeCheckCommand({ argv });
}

main().catch((error: unknown) => {
  process.exitCode = 1;
  const message = error instanceof Error ? error.message : 'ts-codegraph failed';
  try {
    process.stderr.write(`${message}\n`);
  } catch {
    // stderr unavailable — accept silent failure
  }
});
