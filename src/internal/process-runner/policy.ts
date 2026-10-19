import { basename } from 'node:path';
import { AppError } from '../errors/index.js';
import { ERROR_CODES } from './generated/process-runner-entities.js';
import type { ProcessCommand, ProcessRunnerPolicy } from './types.js';

/** Detached frozen snapshot of a validated ProcessRunnerPolicy. */
export interface ProcessRunnerPolicySnapshot {
  readonly name: string;
  readonly allowedExecutables: readonly string[];
  readonly allowedEnvKeys: readonly string[] | undefined;
  readonly allowShell: boolean;
  readonly failOnNonZeroExit: boolean;
  readonly maxOutputBytes: number | undefined;
  readonly defaultTimeoutMs: number | undefined;
}

/** Detached frozen snapshot of a validated ProcessCommand. */
export interface ProcessCommandSnapshot {
  readonly executable: string;
  readonly args: readonly string[] | undefined;
  readonly cwd: string | undefined;
  readonly timeout: number | undefined;
  readonly env: Readonly<Record<string, string>> | undefined;
  readonly stdin: string | undefined;
  readonly signal: AbortSignal | undefined;
}

export const SAFE_DEFAULT_ENV_KEYS: readonly string[] = [
  'PATH',
  'HOME',
  'TMPDIR',
  'LANG',
  'LC_ALL',
  'NODE_ENV',
  'npm_config_cache',
  'npm_config_prefix',
];

// Exported so callers can document and test against known limits.
// Exceeding these values is rejected at policy-validation time.
export const MAX_OUTPUT_BYTES = 1_073_741_824;   // 1 GB per stream
export const MAX_TIMEOUT_MS   = 3_600_000;        // 1 hour
export const MAX_POLICY_NAME_LENGTH = 128;
export const MAX_ALLOWED_EXECUTABLES = 256;
export const MAX_ALLOWED_ENV_KEYS = 256;

// Reads a string[] from an object's own property descriptors, one element at a time.
// Rejects accessor descriptors on any index, sparse arrays (missing indexes), and arrays
// exceeding maxLen. The validated entries satisfy validateEntry; return a frozen snapshot.
function snapshotDescriptorStringArray(
  arr: unknown,
  maxLen: number,
  errCode: string,
  validateEntry: (s: string) => boolean,
  arrayErrTitle: string,
  arrayErrDetail: string,
  accessorErrTitle: string,
  entryErrTitle: string,
  entryErrDetail: string,
): readonly string[] {
  if (!Array.isArray(arr)) {
    throw new AppError({ code: errCode as never, category: 'validation', title: arrayErrTitle, clientDetail: arrayErrDetail });
  }
  const lengthDesc = Object.getOwnPropertyDescriptor(arr, 'length');
  if (!lengthDesc || 'get' in lengthDesc || 'set' in lengthDesc) {
    throw new AppError({ code: errCode as never, category: 'validation', title: accessorErrTitle, clientDetail: 'Array length must be a plain data property' });
  }
  const len = lengthDesc.value as number;
  if (len > maxLen) {
    throw new AppError({ code: errCode as never, category: 'validation', title: arrayErrTitle, clientDetail: arrayErrDetail });
  }
  const snapshot: string[] = [];
  for (let i = 0; i < len; i++) {
    const desc = Object.getOwnPropertyDescriptor(arr, String(i));
    if (!desc) {
      throw new AppError({ code: errCode as never, category: 'validation', title: accessorErrTitle, clientDetail: 'Array must be dense (no holes)' });
    }
    if ('get' in desc || 'set' in desc) {
      throw new AppError({ code: errCode as never, category: 'validation', title: accessorErrTitle, clientDetail: 'Array element accessor descriptors are not permitted' });
    }
    const entry = desc.value as unknown;
    if (typeof entry !== 'string' || !validateEntry(entry)) {
      throw new AppError({ code: errCode as never, category: 'validation', title: entryErrTitle, clientDetail: entryErrDetail });
    }
    snapshot.push(entry);
  }
  return Object.freeze(snapshot);
}

// Rejects accessor descriptors on all own properties of an object.
function rejectObjectAccessors(obj: object, errCode: string, errTitle: string): void {
  for (const key of Object.getOwnPropertyNames(obj)) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc && ('get' in desc || 'set' in desc)) {
      throw new AppError({
        code: errCode as never,
        category: 'validation',
        title: errTitle,
        clientDetail: 'Fields must be plain data values, not getters or setters',
      });
    }
  }
}

// Reads the value of a field from an object's own data property. Returns undefined if the
// field is absent or inherited — prevents prototype-chain reads in snapshot functions.
function ownDataValue(obj: object, key: string): unknown {
  return Object.getOwnPropertyDescriptor(obj, key)?.value;
}

// Shell executables that are never allowed unless policy.allowShell is explicitly true.
const SHELL_BASENAMES = new Set([
  'sh', 'bash', 'zsh', 'fish',
  'cmd', 'cmd.exe',
  'powershell', 'powershell.exe',
  'pwsh', 'pwsh.exe',
]);

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function containsPathSeparator(s: string): boolean {
  return s.includes('/') || s.includes('\\');
}

// Valid env key names: allow uppercase/lowercase letters, digits, and underscores.
// Reject names containing '=' (env injection) or control chars.
function isValidEnvKey(key: string): boolean {
  return key.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
}

// Policy names appear in span attributes and metric labels so they must be low-cardinality.
const POLICY_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._\-]*$/;

/**
 * Validates all fields of a ProcessRunnerPolicy and returns a frozen detached snapshot.
 * Reads each field and array element exactly once via property descriptors; rejects accessor
 * descriptors. Use the returned snapshot (not the original policy) for all subsequent reads.
 */
export function snapshotAndValidateProcessRunnerPolicy(policy: unknown): ProcessRunnerPolicySnapshot {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_POLICY,
      category: 'validation',
      title: 'Process runner policy is invalid',
      clientDetail: 'Policy must be a non-null object',
    });
  }

  rejectObjectAccessors(policy as object, ERROR_CODES.PROCESS_INVALID_POLICY, 'Process runner policy has an accessor descriptor');

  // Read each field from own data properties only. Bracket notation (`p['name']`) would
  // traverse the prototype chain and silently accept inherited values; ownDataValue does not.
  const name               = ownDataValue(policy as object, 'name');
  const allowedExecutablesRaw = ownDataValue(policy as object, 'allowedExecutables');
  const allowedEnvKeysRaw  = ownDataValue(policy as object, 'allowedEnvKeys');
  const allowShell         = ownDataValue(policy as object, 'allowShell');
  const failOnNonZeroExit  = ownDataValue(policy as object, 'failOnNonZeroExit');
  const maxOutputBytes     = ownDataValue(policy as object, 'maxOutputBytes');
  const defaultTimeoutMs   = ownDataValue(policy as object, 'defaultTimeoutMs');

  // Validate name
  if (typeof name !== 'string' || name.length === 0 || name.length > MAX_POLICY_NAME_LENGTH || !POLICY_NAME_RE.test(name)) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_POLICY,
      category: 'validation',
      title: 'Process runner policy has an invalid name',
      clientDetail: 'Policy name must be a non-empty alphanumeric string (letters, digits, dots, underscores, hyphens) up to 128 chars',
    });
  }

  // Snapshot allowedExecutables — descriptor-based pass rejects index getters
  if (!Array.isArray(allowedExecutablesRaw) || allowedExecutablesRaw.length === 0) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_POLICY,
      category: 'validation',
      title: 'Process runner policy has an invalid allowedExecutables list',
      clientDetail: 'allowedExecutables must be a non-empty array',
    });
  }
  const allowedExecutables = snapshotDescriptorStringArray(
    allowedExecutablesRaw,
    MAX_ALLOWED_EXECUTABLES,
    ERROR_CODES.PROCESS_INVALID_POLICY,
    (e) => e.length > 0 && !hasControlChars(e),
    'Process runner policy allowedExecutables list is too long or invalid',
    'allowedExecutables must be a non-empty array within the maximum length',
    'Process runner policy has an accessor descriptor in allowedExecutables',
    'Process runner policy has an invalid allowedExecutables entry',
    'Each allowedExecutables entry must be a non-empty string without control characters',
  );

  // Snapshot allowedEnvKeys if present
  let allowedEnvKeys: readonly string[] | undefined;
  if (allowedEnvKeysRaw !== undefined) {
    allowedEnvKeys = snapshotDescriptorStringArray(
      allowedEnvKeysRaw,
      MAX_ALLOWED_ENV_KEYS,
      ERROR_CODES.PROCESS_INVALID_POLICY,
      isValidEnvKey,
      'Process runner policy has an invalid allowedEnvKeys list',
      'allowedEnvKeys must be an array within the allowed length',
      'Process runner policy has an accessor descriptor in allowedEnvKeys',
      'Process runner policy has an invalid allowedEnvKeys entry',
      'Each allowedEnvKeys entry must be a valid env variable name (letters, digits, underscores)',
    );
  }

  if (allowShell !== undefined && typeof allowShell !== 'boolean') {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_POLICY,
      category: 'validation',
      title: 'Process runner policy has an invalid allowShell value',
      clientDetail: 'allowShell must be a boolean when provided',
    });
  }

  if (failOnNonZeroExit !== undefined && typeof failOnNonZeroExit !== 'boolean') {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_POLICY,
      category: 'validation',
      title: 'Process runner policy has an invalid failOnNonZeroExit value',
      clientDetail: 'failOnNonZeroExit must be a boolean when provided',
    });
  }

  if (maxOutputBytes !== undefined) {
    if (
      typeof maxOutputBytes !== 'number' ||
      !Number.isSafeInteger(maxOutputBytes) ||
      maxOutputBytes < 1 ||
      maxOutputBytes > MAX_OUTPUT_BYTES
    ) {
      throw new AppError({
        code: ERROR_CODES.PROCESS_INVALID_POLICY,
        category: 'validation',
        title: 'Process runner policy has an invalid maxOutputBytes value',
        clientDetail: 'maxOutputBytes must be a positive safe integer within the allowed range',
      });
    }
  }

  if (defaultTimeoutMs !== undefined) {
    if (
      typeof defaultTimeoutMs !== 'number' ||
      !Number.isSafeInteger(defaultTimeoutMs) ||
      defaultTimeoutMs < 1 ||
      defaultTimeoutMs > MAX_TIMEOUT_MS
    ) {
      throw new AppError({
        code: ERROR_CODES.PROCESS_INVALID_POLICY,
        category: 'validation',
        title: 'Process runner policy has an invalid defaultTimeoutMs value',
        clientDetail: 'defaultTimeoutMs must be a positive safe integer within the allowed range',
      });
    }
  }

  return Object.freeze({
    name: name as string,
    allowedExecutables,
    allowedEnvKeys,
    allowShell: (allowShell as boolean | undefined) ?? false,
    failOnNonZeroExit: (failOnNonZeroExit as boolean | undefined) ?? true,
    maxOutputBytes: maxOutputBytes as number | undefined,
    defaultTimeoutMs: defaultTimeoutMs as number | undefined,
  });
}

/**
 * Validates all fields of a ProcessRunnerPolicy. Must be called before any span,
 * metric, env copy, or process spawn so that invalid policies cannot reach the OS.
 * Throws PROCESS_INVALID_POLICY for any invalid field; never includes raw field values.
 * For internal use, prefer snapshotAndValidateProcessRunnerPolicy which returns a snapshot.
 */
export function validateProcessRunnerPolicy(policy: unknown): asserts policy is ProcessRunnerPolicy {
  snapshotAndValidateProcessRunnerPolicy(policy);
}

/**
 * Validates all fields of a ProcessCommand against a validated policy snapshot and returns
 * a frozen detached command snapshot. Reads each field exactly once via property descriptors;
 * rejects accessor descriptors. Use the returned snapshot for all subsequent reads.
 */
export function snapshotAndValidateProcessCommand(command: unknown, policySnap: ProcessRunnerPolicySnapshot): ProcessCommandSnapshot {
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_COMMAND,
      category: 'validation',
      title: 'Process command is invalid',
      clientDetail: 'Command must be a non-null object',
    });
  }

  rejectObjectAccessors(command as object, ERROR_CODES.PROCESS_INVALID_COMMAND, 'Process command has an accessor descriptor');

  // Read each field from own data properties only — inherited prototype values return undefined.
  const executable = ownDataValue(command as object, 'executable');
  const argsRaw    = ownDataValue(command as object, 'args');
  const cwd        = ownDataValue(command as object, 'cwd');
  const timeout    = ownDataValue(command as object, 'timeout');
  const envRaw     = ownDataValue(command as object, 'env');
  const stdin      = ownDataValue(command as object, 'stdin');
  const signal     = ownDataValue(command as object, 'signal');

  // Validate executable
  if (typeof executable !== 'string' || !executable || hasControlChars(executable as string)) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_COMMAND,
      category: 'validation',
      title: 'Process command has an invalid executable',
      clientDetail: 'Executable must be a non-empty string without control characters',
    });
  }

  const base = basename(executable as string).toLowerCase();
  if (SHELL_BASENAMES.has(base) && policySnap.allowShell !== true) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_SHELL_DENIED,
      category: 'authz',
      title: 'Shell execution is not permitted by the current policy',
      clientDetail: 'Shell executables require allowShell: true in the process runner policy',
    });
  }

  if (!isExecutableAllowed(executable as string, policySnap.allowedExecutables)) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_EXECUTABLE_DENIED,
      category: 'authz',
      title: 'Executable is not in the allowed list',
      clientDetail: 'The requested executable is not permitted by the process runner policy',
    });
  }

  // Snapshot args via descriptor-based pass — rejects index getters
  let argsSnapshot: readonly string[] | undefined;
  if (argsRaw !== undefined) {
    argsSnapshot = snapshotDescriptorStringArray(
      argsRaw,
      Number.MAX_SAFE_INTEGER, // no count limit on args
      ERROR_CODES.PROCESS_INVALID_COMMAND,
      () => true,  // any string value is acceptable as an arg
      'Process command has an invalid args list',
      'args must be an array',
      'Process command has an accessor descriptor in args',
      'Process command has an invalid args entry',
      'Each arg must be a string',
    );
  }

  if (cwd !== undefined && (typeof cwd !== 'string' || hasControlChars(cwd as string))) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_COMMAND,
      category: 'validation',
      title: 'Process command has an invalid working directory',
      clientDetail: 'Working directory must not contain control characters',
    });
  }

  if (timeout !== undefined) {
    if (
      typeof timeout !== 'number' ||
      !Number.isSafeInteger(timeout) ||
      (timeout as number) < 1 ||
      (timeout as number) > MAX_TIMEOUT_MS
    ) {
      throw new AppError({
        code: ERROR_CODES.PROCESS_INVALID_COMMAND,
        category: 'validation',
        title: 'Process command has an invalid timeout value',
        clientDetail: 'command.timeout must be a positive safe integer within the allowed range',
      });
    }
  }

  // Snapshot env — read keys and values via descriptor, validate against allowlist
  let envSnapshot: Readonly<Record<string, string>> | undefined;
  if (envRaw !== undefined) {
    if (typeof envRaw !== 'object' || Array.isArray(envRaw) || envRaw === null) {
      throw new AppError({
        code: ERROR_CODES.PROCESS_INVALID_COMMAND,
        category: 'validation',
        title: 'Process command has an invalid env object',
        clientDetail: 'command.env must be a plain object',
      });
    }
    rejectObjectAccessors(envRaw as object, ERROR_CODES.PROCESS_ENV_DENIED, 'Process command env has an accessor descriptor');
    const effectiveKeys = policySnap.allowedEnvKeys ?? SAFE_DEFAULT_ENV_KEYS;
    const envObj: Record<string, string> = {};
    for (const key of Object.getOwnPropertyNames(envRaw)) {
      const desc = Object.getOwnPropertyDescriptor(envRaw as object, key);
      if (!desc || 'get' in desc || 'set' in desc) {
        throw new AppError({
          code: ERROR_CODES.PROCESS_ENV_DENIED,
          category: 'authz',
          title: 'Process command env has an accessor descriptor',
          clientDetail: 'Env entries must be plain data values, not getters or setters',
        });
      }
      if (!effectiveKeys.includes(key)) {
        throw new AppError({
          code: ERROR_CODES.PROCESS_ENV_DENIED,
          category: 'authz',
          title: 'Command env contains a key not permitted by the policy',
          clientDetail: 'All env keys in command.env must appear in the effective env allowlist',
        });
      }
      const val = desc.value as unknown;
      if (typeof val !== 'string') {
        throw new AppError({
          code: ERROR_CODES.PROCESS_INVALID_COMMAND,
          category: 'validation',
          title: 'Process command env has a non-string value',
          clientDetail: 'All env values must be strings',
        });
      }
      envObj[key] = val;
    }
    envSnapshot = Object.freeze(envObj);
  }

  if (stdin !== undefined && typeof stdin !== 'string') {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_COMMAND,
      category: 'validation',
      title: 'Process command has an invalid stdin value',
      clientDetail: 'command.stdin must be a string when provided',
    });
  }

  if (signal !== undefined && (typeof signal !== 'object' || signal === null)) {
    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_COMMAND,
      category: 'validation',
      title: 'Process command has an invalid signal value',
      clientDetail: 'command.signal must be an AbortSignal when provided',
    });
  }

  return Object.freeze({
    executable: executable as string,
    args: argsSnapshot,
    cwd: cwd as string | undefined,
    timeout: timeout as number | undefined,
    env: envSnapshot,
    stdin: stdin as string | undefined,
    signal: signal as AbortSignal | undefined,
  });
}

/**
 * Checks whether the executable is permitted by the allowlist.
 *
 * Rules:
 * - If executable contains a path separator (absolute/relative path), it must
 *   exactly match an entry in allowedExecutables. Bare allowlist entries do NOT
 *   match absolute executable paths.
 * - If executable is a bare name (no separator), it must exactly match a bare
 *   entry in allowedExecutables (entries that themselves contain no separators).
 *   Absolute allowlist entries do NOT match bare executable names.
 */
export function isExecutableAllowed(executable: string, allowedExecutables: readonly string[]): boolean {
  const execHasPath = containsPathSeparator(executable);

  if (execHasPath) {
    // Absolute/relative path: require exact match in allowlist
    return allowedExecutables.includes(executable);
  }

  // Bare executable name: match only bare (non-path) allowlist entries
  return allowedExecutables.some((entry) => !containsPathSeparator(entry) && entry === executable);
}

/**
 * Validates that command.env keys are all in the EFFECTIVE env allowlist.
 * The effective list is `allowedEnvKeys ?? SAFE_DEFAULT_ENV_KEYS` — so even
 * when no explicit allowedEnvKeys is provided, command.env is still validated
 * against the safe defaults. Never includes key names or values in clientDetail.
 */
export function validateCommandEnv(
  commandEnv: Readonly<Record<string, string>> | undefined,
  allowedEnvKeys: readonly string[] | undefined,
): void {
  if (commandEnv === undefined) return;
  const effectiveKeys = allowedEnvKeys ?? SAFE_DEFAULT_ENV_KEYS;
  for (const key of Object.keys(commandEnv)) {
    if (!effectiveKeys.includes(key)) {
      throw new AppError({
        code: ERROR_CODES.PROCESS_ENV_DENIED,
        category: 'authz',
        title: 'Command env contains a key not permitted by the policy',
        clientDetail: 'All env keys in command.env must appear in the effective env allowlist',
      });
    }
  }
}

export function validateProcessCommand(command: ProcessCommand, policy: ProcessRunnerPolicy): void {
  const policySnap = snapshotAndValidateProcessRunnerPolicy(policy);
  snapshotAndValidateProcessCommand(command, policySnap);
}

export function buildProcessEnv(
  commandEnv: Readonly<Record<string, string>> | undefined,
  allowedEnvKeys: readonly string[] | undefined,
): Record<string, string> {
  const keys = allowedEnvKeys ?? SAFE_DEFAULT_ENV_KEYS;
  const env: Record<string, string> = {};

  // PATH is always included so the OS can resolve bare executable names.
  const pathVal = process.env['PATH'];
  if (pathVal !== undefined) env['PATH'] = pathVal;

  // Copy remaining allowed keys from current process env
  for (const key of keys) {
    if (key === 'PATH') continue; // already handled above
    const val = process.env[key];
    if (val !== undefined) env[key] = val;
  }

  // Merge command-specific env overrides (already validated against effective allowlist)
  if (commandEnv !== undefined) {
    for (const [k, v] of Object.entries(commandEnv)) {
      env[k] = v;
    }
  }

  return env;
}

export function executableLabel(executable: string): string {
  // Safe label for telemetry: basename only, no path
  return basename(executable);
}
