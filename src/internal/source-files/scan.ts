import { readdir, stat, realpath } from 'node:fs/promises';
import { join, relative, extname, isAbsolute } from 'node:path';
import { AppError } from '../errors/index.js';
import { createSafePathPolicy, isPathInside } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import {
  DEFAULT_IGNORE_PATTERNS,
  buildIgnoreChecker,
  loadGitignorePatterns,
} from './ignore.js';
import { detectFileKind, readBoundedTextFile } from './read.js';
import { hashFileContent } from './hash.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/source-files-entities.js';
import type {
  SourceFileEntry,
  SourceScanResult,
  SourceFilePolicy,
  SourceExplorer,
  BoundedReadResult,
  SourceFileKind,
} from './types.js';

const DEFAULT_MAX_FILE_SIZE = 1_048_576; // 1 MB
const DEFAULT_MAX_FILE_COUNT = 1000;
const TRACER_NAME = 'codegraph.source-files';
const SPAN_SCAN = 'codegraph.source_files.scan';

// Exported bounds so callers can validate against known limits before calling.
export const MAX_FILE_SIZE_BYTES   = 1_073_741_824; // 1 GB
export const MAX_FILE_COUNT        = 1_000_000;
export const MAX_READ_BYTES        = 1_073_741_824; // 1 GB
export const MAX_EXTENSION_ENTRIES = 1_024;
export const MAX_IGNORE_PATTERNS   = 1_024;

// Reads the value of a field from an object's own data property. Returns undefined if the
// field is absent or inherited — prevents prototype-chain reads in snapshot functions.
function ownDataValue(obj: object, key: string): unknown {
  return Object.getOwnPropertyDescriptor(obj, key)?.value;
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

// Snapshot of a fully-validated SourceFilePolicy with defaults applied. All subsequent
// traversal and read operations use only the snapshot — never the original caller object.
interface SourceFilePolicySnapshot {
  readonly maxFileSizeBytes: number;
  readonly maxFileCount: number;
  readonly maxReadBytes: number;
  readonly allowSymlinks: boolean;
  readonly gitignore: boolean;
  readonly defaultIgnores: boolean;
  readonly includeExtensions: readonly string[] | null;
  readonly extraIgnorePatterns: readonly string[];
}

function requirePositiveSafeIntLocal(value: number, max: number): void {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Source files policy numeric field is invalid',
      clientDetail: 'Numeric policy limits must be positive safe integers within the allowed range',
    });
  }
}

// Reads a string[] from a caller-controlled array via property descriptors.
// Rejects accessor descriptors on array indexes, sparse arrays, and entries exceeding maxLen.
function snapshotPolicyStringArray(
  arr: unknown,
  maxLen: number,
  validateEntry: (s: string) => boolean,
  arrayErrDetail: string,
  entryErrDetail: string,
): readonly string[] {
  if (!Array.isArray(arr)) {
    throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy has an invalid array field', clientDetail: arrayErrDetail });
  }
  const lengthDesc = Object.getOwnPropertyDescriptor(arr, 'length');
  if (!lengthDesc || 'get' in lengthDesc || 'set' in lengthDesc) {
    throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy array has an accessor on length', clientDetail: arrayErrDetail });
  }
  const len = lengthDesc.value as number;
  if (len > maxLen) {
    throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy array exceeds maximum length', clientDetail: arrayErrDetail });
  }
  const snapshot: string[] = [];
  for (let i = 0; i < len; i++) {
    const desc = Object.getOwnPropertyDescriptor(arr, String(i));
    if (!desc) {
      throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy array is sparse', clientDetail: 'Policy arrays must be dense (no holes)' });
    }
    if ('get' in desc || 'set' in desc) {
      throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy array element has an accessor descriptor', clientDetail: 'Policy array elements must be plain data values, not getters or setters' });
    }
    const entry = desc.value as unknown;
    if (typeof entry !== 'string' || !validateEntry(entry)) {
      throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy has an invalid array entry', clientDetail: entryErrDetail });
    }
    snapshot.push(entry);
  }
  return Object.freeze(snapshot);
}

/**
 * Validates all fields of a SourceFilePolicy, rejects accessor descriptors, reads each
 * field and array element exactly once, and returns a frozen snapshot with defaults applied.
 * All subsequent reads use only the snapshot — never the original caller object.
 */
function snapshotAndValidateSourceFilePolicy(policy: SourceFilePolicy | undefined): SourceFilePolicySnapshot {
  if (policy === undefined || policy === null) {
    return Object.freeze({
      maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
      maxFileCount: DEFAULT_MAX_FILE_COUNT,
      maxReadBytes: DEFAULT_MAX_FILE_SIZE,
      allowSymlinks: false,
      gitignore: true,
      defaultIgnores: true,
      includeExtensions: null,
      extraIgnorePatterns: Object.freeze([]) as readonly string[],
    });
  }
  if (typeof policy !== 'object' || Array.isArray(policy)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Source files policy is invalid',
      clientDetail: 'Policy must be a plain object when provided',
    });
  }

  // Reject accessor descriptors on all policy object fields.
  for (const key of Object.getOwnPropertyNames(policy)) {
    const desc = Object.getOwnPropertyDescriptor(policy, key);
    if (desc && ('get' in desc || 'set' in desc)) {
      throw new AppError({
        code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
        category: 'validation',
        title: 'Source files policy has an accessor descriptor',
        clientDetail: 'Policy fields must be plain data values, not getters or setters',
      });
    }
  }

  // Read each field from own data properties only. Bracket notation traverses the prototype
  // chain; ownDataValue does not, so inherited data/getter properties become undefined here.
  const rawMaxFileSizeBytes  = ownDataValue(policy, 'maxFileSizeBytes');
  const rawMaxFileCount      = ownDataValue(policy, 'maxFileCount');
  const rawMaxReadBytes      = ownDataValue(policy, 'maxReadBytes');
  const rawAllowSymlinks     = ownDataValue(policy, 'allowSymlinks');
  const rawGitignore         = ownDataValue(policy, 'gitignore');
  const rawDefaultIgnores    = ownDataValue(policy, 'defaultIgnores');
  const rawIncludeExtensions = ownDataValue(policy, 'includeExtensions');
  const rawExtraIgnore       = ownDataValue(policy, 'extraIgnorePatterns');

  if (rawMaxFileSizeBytes !== undefined) {
    requirePositiveSafeIntLocal(rawMaxFileSizeBytes as number, MAX_FILE_SIZE_BYTES);
  }
  if (rawMaxFileCount !== undefined) {
    requirePositiveSafeIntLocal(rawMaxFileCount as number, MAX_FILE_COUNT);
  }
  if (rawMaxReadBytes !== undefined) {
    requirePositiveSafeIntLocal(rawMaxReadBytes as number, MAX_READ_BYTES);
  }

  if (rawAllowSymlinks !== undefined && typeof rawAllowSymlinks !== 'boolean') {
    throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy field "allowSymlinks" is invalid', clientDetail: 'allowSymlinks must be a boolean when provided' });
  }
  if (rawGitignore !== undefined && typeof rawGitignore !== 'boolean') {
    throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy field "gitignore" is invalid', clientDetail: 'gitignore must be a boolean when provided' });
  }
  if (rawDefaultIgnores !== undefined && typeof rawDefaultIgnores !== 'boolean') {
    throw new AppError({ code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID, category: 'validation', title: 'Source files policy field "defaultIgnores" is invalid', clientDetail: 'defaultIgnores must be a boolean when provided' });
  }

  const includeExtensionsSnap = rawIncludeExtensions !== undefined
    ? snapshotPolicyStringArray(rawIncludeExtensions, MAX_EXTENSION_ENTRIES, (e) => e.length > 0 && !hasControlChars(e), 'includeExtensions must be an array within the allowed length', 'Each includeExtensions entry must be a non-empty string without control characters')
    : null;

  const extraIgnorePatternsSnap = rawExtraIgnore !== undefined
    ? snapshotPolicyStringArray(rawExtraIgnore, MAX_IGNORE_PATTERNS, (p) => !hasControlChars(p), 'extraIgnorePatterns must be an array within the allowed length', 'Each extraIgnorePatterns entry must be a string without control characters')
    : Object.freeze([]) as readonly string[];

  return Object.freeze({
    maxFileSizeBytes:   (rawMaxFileSizeBytes  as number | undefined) ?? DEFAULT_MAX_FILE_SIZE,
    maxFileCount:       (rawMaxFileCount      as number | undefined) ?? DEFAULT_MAX_FILE_COUNT,
    maxReadBytes:       (rawMaxReadBytes      as number | undefined) ?? DEFAULT_MAX_FILE_SIZE,
    allowSymlinks:      (rawAllowSymlinks     as boolean | undefined) ?? false,
    gitignore:          (rawGitignore         as boolean | undefined) ?? true,
    defaultIgnores:     (rawDefaultIgnores    as boolean | undefined) ?? true,
    includeExtensions:  includeExtensionsSnap,
    extraIgnorePatterns: extraIgnorePatternsSnap,
  });
}

/**
 * Validates all numeric and array fields of a SourceFilePolicy. Throws
 * SOURCE_FILES_ROOT_INVALID (validation category) for any invalid field.
 * Must be called before traversal, reads, spans, or file side effects.
 * For internal use, prefer snapshotAndValidateSourceFilePolicy which returns a snapshot.
 */
export function validateSourceFilePolicy(policy: SourceFilePolicy | undefined): void {
  snapshotAndValidateSourceFilePolicy(policy);
}

function validateRoot(root: string): void {
  if (!root || !isAbsolute(root) || hasControlChars(root)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Root path is invalid',
      clientDetail: 'Root must be a non-empty absolute path without control characters',
    });
  }
}

function assertInsideRoot(explorerRoot: string, absPath: string): void {
  if (!isPathInside(explorerRoot, absPath)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_TRAVERSAL_DENIED,
      category: 'authz',
      title: 'Path is outside the permitted root',
      clientDetail: 'The requested path is not within the configured scan root',
    });
  }
}

interface ResolvedPolicy {
  maxFileSizeBytes: number;
  maxFileCount: number;
  allowSymlinks: boolean;
  includeExtensions: readonly string[] | null;
  /** Realpath of the scan root — used for symlink target boundary checks. */
  realRoot: string;
}

interface TraversalState {
  files: SourceFileEntry[];
  truncated: boolean;
  /** Realpath of every directory entered — used to break symlink cycles. */
  visitedDirs: Set<string>;
}

async function walkDir(
  absDir: string,
  root: string,
  ignoreChecker: ReturnType<typeof buildIgnoreChecker>,
  policy: ResolvedPolicy,
  state: TraversalState,
): Promise<void> {
  if (state.truncated) return;

  // Cycle detection: resolve to real path and skip if already visited.
  let realDir: string;
  try {
    realDir = await realpath(absDir);
  } catch {
    realDir = absDir;
  }
  if (state.visitedDirs.has(realDir)) return;
  state.visitedDirs.add(realDir);

  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return; // unreadable directory — skip silently
  }

  for (const entry of entries) {
    if (state.files.length >= policy.maxFileCount) {
      state.truncated = true;
      return;
    }

    const absPath = join(absDir, entry.name);
    const relPath = relative(root, absPath).replace(/\\/g, '/');

    if (entry.isSymbolicLink()) {
      if (!policy.allowSymlinks) continue;

      // Resolve the real target and enforce root containment against the actual inode.
      // Use policy.realRoot (realpath of the scan root) so /tmp→/private/tmp-style
      // aliases on macOS do not cause false denials of intra-root symlinks.
      let resolvedTarget: string;
      try {
        resolvedTarget = await realpath(absPath);
      } catch {
        continue; // broken symlink — skip
      }

      if (!isPathInside(policy.realRoot, resolvedTarget)) {
        // Symlink points outside the scan root — deny even with allowSymlinks
        continue;
      }

      // Determine whether the target is a file or directory
      let targetStat;
      try {
        targetStat = await stat(absPath); // stat follows symlinks
      } catch {
        continue;
      }

      if (targetStat.isDirectory()) {
        if (ignoreChecker.isIgnored(relPath)) continue;
        await walkDir(resolvedTarget, root, ignoreChecker, policy, state);
      } else if (targetStat.isFile()) {
        if (ignoreChecker.isIgnored(relPath)) continue;
        if (targetStat.size > policy.maxFileSizeBytes) continue;
        if (
          policy.includeExtensions !== null &&
          !policy.includeExtensions.includes(extname(entry.name))
        ) {
          continue;
        }
        // Use policy.realRoot (realpath of scan root) since resolvedTarget is also a realpath.
        const kind = await detectFileKind(resolvedTarget, policy.realRoot);
        state.files.push({ relativePath: relPath, kind, sizeBytes: targetStat.size });
      }
      continue;
    }

    if (entry.isDirectory()) {
      if (ignoreChecker.isIgnored(relPath)) continue;
      await walkDir(absPath, root, ignoreChecker, policy, state);
    } else if (entry.isFile()) {
      if (ignoreChecker.isIgnored(relPath)) continue;

      let fileStat;
      try {
        fileStat = await stat(absPath);
      } catch {
        continue;
      }
      if (fileStat.size > policy.maxFileSizeBytes) continue;

      if (
        policy.includeExtensions !== null &&
        !policy.includeExtensions.includes(extname(entry.name))
      ) {
        continue;
      }

      // absPath and root share the same lexical base (no realpath involved here).
      const kind = await detectFileKind(absPath, root);
      state.files.push({ relativePath: relPath, kind, sizeBytes: fileStat.size });
    }
  }
}

// Core scan logic — accepts a frozen snapshot so no caller object is read after this point.
async function scanWithSnapshot(root: string, policySnap: SourceFilePolicySnapshot): Promise<SourceScanResult> {
  let realRoot: string;
  try {
    realRoot = await realpath(root);
  } catch {
    realRoot = root;
  }

  const resolvedPolicy: ResolvedPolicy = {
    maxFileSizeBytes: policySnap.maxFileSizeBytes,
    maxFileCount: policySnap.maxFileCount,
    allowSymlinks: policySnap.allowSymlinks,
    includeExtensions: policySnap.includeExtensions,
    realRoot,
  };

  const patterns: string[] = [
    ...(policySnap.defaultIgnores ? DEFAULT_IGNORE_PATTERNS : []),
    ...policySnap.extraIgnorePatterns,
  ];

  if (policySnap.gitignore) {
    const gitignorePatterns = await loadGitignorePatterns(root);
    patterns.push(...gitignorePatterns);
  }

  const ignoreChecker = buildIgnoreChecker(patterns);
  const state: TraversalState = { files: [], truncated: false, visitedDirs: new Set() };

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan(SPAN_SCAN, {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OPERATION]: 'scan' },
  });

  try {
    createSafePathPolicy(root, { allowSymlinks: resolvedPolicy.allowSymlinks });
    await walkDir(root, root, ignoreChecker, resolvedPolicy, state);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (err) {
    if (err instanceof AppError) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_ERROR_CODE, err.code);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.code });
      span.end();
      throw err;
    }
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
    throw err;
  }

  span.end();
  return { files: state.files, truncated: state.truncated };
}

export async function scanSourceFiles(
  root: string,
  policy?: SourceFilePolicy,
): Promise<SourceScanResult> {
  const policySnap = snapshotAndValidateSourceFilePolicy(policy);
  validateRoot(root);
  return scanWithSnapshot(root, policySnap);
}

/**
 * Creates a source explorer scoped to a declared root directory.
 * All read, detect, and hash operations enforce that the given path
 * is within the explorer root; paths outside throw SOURCE_FILES_TRAVERSAL_DENIED.
 */
export function createSourceExplorer(explorerRoot: string, policy?: SourceFilePolicy): SourceExplorer {
  // Snapshot policy eagerly — all subsequent explorer method calls use the frozen snapshot
  // so post-creation mutation of the original policy object cannot affect behavior.
  const policySnap = snapshotAndValidateSourceFilePolicy(policy);
  validateRoot(explorerRoot);
  const maxReadBytes = policySnap.maxReadBytes;

  function guardPath(absPath: string): void {
    assertInsideRoot(explorerRoot, absPath);
  }

  return {
    root: explorerRoot,

    // scan() uses the snapshot — never re-reads from the original caller policy.
    scan(): Promise<SourceScanResult> {
      return scanWithSnapshot(explorerRoot, policySnap);
    },

    read(absPath: string, opts?: { maxBytes?: number }): Promise<BoundedReadResult> {
      guardPath(absPath);
      return readBoundedTextFile(absPath, { root: explorerRoot, maxBytes: opts?.maxBytes ?? maxReadBytes });
    },

    detect(absPath: string): Promise<SourceFileKind> {
      guardPath(absPath);
      return detectFileKind(absPath, explorerRoot);
    },

    hash(absPath: string): Promise<string> {
      guardPath(absPath);
      return hashFileContent(absPath, explorerRoot);
    },
  };
}
