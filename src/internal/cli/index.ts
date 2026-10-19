export type {
  CliGlobalOptions,
  CliExecutionContext,
  CliErrorDetail,
  CliResult,
  CliCommandOption,
  CliCommandDefinition,
  CliCommandGroupDefinition,
  CliProgramOptions,
  CliOutputOptions,
  CliOutput,
  CliProgram,
} from './types.js';

export {
  createCliProgram,
  defineCliCommand,
  defineCliCommandGroup,
  runCliCommand,
  parseGlobalCliOptions,
} from './program.js';

export { createCliOutput, writeCliResult } from './output.js';

export { mapErrorToExitCode } from './exit.js';

// Re-export config validators useful in CLI command option handlers.

export {
  ERROR_CODES,
  ENTITY_IDS,
  TELEMETRY_ATTRIBUTES,
} from './generated/cli-entities.js';
export type {
  ErrorCode as CliErrorCode,
  EntityId,
  AttributeName,
} from './generated/cli-entities.js';
