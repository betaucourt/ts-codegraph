import { createHash } from 'node:crypto';

import {
  createDiagnostic,
  type Diagnostic,
  type SafeDetail,
} from '../contracts/diagnostics.js';

/**
 * Public stable ID builders for ts-codegraph (decision record §6, kickoff §5).
 *
 * Every public ID is a deterministic typed string with a `:v1:` version segment.
 * IDs never contain SQLite row ids, absolute paths, or home directories.
 *
 * Two ID shapes exist:
 *  - Hashed families (`project`, `package`, `source-file`, `source-file-version`,
 *    `symbol`, `signature`, `evidence`, `diagnostic`, `search-doc`,
 *    `generated-doc`) use `<type>:v1:<hash16>`, where `<hash16>` is the first 16
 *    lowercase-hex characters of the sha256 of a NUL-joined, normalized input
 *    tuple. The scope is folded into the hash input so no raw path or name leaks
 *    into the public ID. The exact hash inputs are documented on each builder.
 *  - Literal families (`snapshot`, `generated-section`, `citation`) follow the
 *    formats fixed by decision record §7 and §9. `snapshot` lives in
 *    `./snapshot.ts`; the other two are built here.
 *
 * Truncation is 16 hex by default. Within a snapshot scope, `detectIdCollisions`
 * finds distinct inputs that collide at the truncated length and extends the
 * truncation for the colliding IDs, emitting a `LOAD_ID_COLLISION` diagnostic
 * (decision record §6).
 */

export const ID_VERSION = 'v1';

/** Default public hash truncation, in hex characters (decision record §6). */
export const DEFAULT_HASH_HEX_LENGTH = 16;

/** Maximum truncation length before a collision is treated as unresolvable. */
const MAX_HASH_HEX_LENGTH = 64;

/** Field separator for hash-input tuples. A raw NUL cannot appear in the inputs. */
const NUL = '\u0000';

/** Hashed ID families that use the `<type>:v1:<hash16>` shape. */
export type HashedIdType =
  | 'project'
  | 'package'
  | 'source-file'
  | 'source-file-version'
  | 'symbol'
  | 'signature'
  | 'evidence'
  | 'diagnostic'
  | 'search-doc'
  | 'generated-doc';

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Unicode-normalize and trim a scalar ID input segment. */
function normalizeSegment(value: string): string {
  return value.normalize('NFC').trim();
}

/**
 * Normalize a repo-relative POSIX path for use as an ID input. Rejects absolute
 * paths, home shortcuts, and parent-directory escapes so a public ID can never
 * embed a machine-specific or out-of-tree location (decision record §6). Throws
 * a clear error rather than a raw runtime failure.
 */
export function normalizeRepoRelativePath(path: string): string {
  const normalized = path.normalize('NFC').trim().replace(/\\/g, '/');
  if (normalized.length === 0) {
    throw new Error('repo-relative path must not be empty');
  }
  if (normalized.startsWith('/')) {
    throw new Error('repo-relative path must not be absolute');
  }
  if (normalized.startsWith('~')) {
    throw new Error('repo-relative path must not use a home shortcut');
  }
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '..')) {
    throw new Error('repo-relative path must not escape the repository root');
  }
  return normalized.replace(/^\.\//, '').replace(/\/+/g, '/');
}

function joinHashInput(type: HashedIdType, parts: readonly string[]): string {
  return [type, ...parts].join(NUL);
}

/** Truncate a full hex digest to `length` characters. */
export function truncateHash(
  hex: string,
  length: number = DEFAULT_HASH_HEX_LENGTH,
): string {
  return hex.slice(0, length);
}

/**
 * Build a hashed public ID: `<type>:v1:<hash16>`. `hashInput` is the already
 * NUL-joined, normalized input tuple. Prefer the typed builders below, which
 * document their inputs; this is the shared primitive they call.
 */
export function buildHashedId(
  type: HashedIdType,
  hashInput: string,
  length: number = DEFAULT_HASH_HEX_LENGTH,
): string {
  return `${type}:${ID_VERSION}:${truncateHash(sha256Hex(hashInput), length)}`;
}

/**
 * `project:v1:<hash16>`.
 * Hash inputs: `project` NUL normalized(projectKey). `projectKey` is the caller's
 * canonical project identity (e.g. the repo identity string), never an absolute
 * path.
 */
export function buildProjectId(projectKey: string): string {
  return buildHashedId('project', joinHashInput('project', [normalizeSegment(projectKey)]));
}

/**
 * `package:v1:<hash16>`.
 * Hash inputs: `package` NUL projectId NUL normalized(packageName) NUL
 * repo-relative(manifestPath).
 */
export function buildPackageId(input: {
  readonly projectId: string;
  readonly packageName: string;
  readonly manifestPath: string;
}): string {
  return buildHashedId(
    'package',
    joinHashInput('package', [
      input.projectId,
      normalizeSegment(input.packageName),
      normalizeRepoRelativePath(input.manifestPath),
    ]),
  );
}

/**
 * `source-file:v1:<hash16>`.
 * Hash inputs: `source-file` NUL snapshotId NUL repo-relative(path).
 */
export function buildSourceFileId(input: {
  readonly snapshotId: string;
  readonly repoRelativePath: string;
}): string {
  return buildHashedId(
    'source-file',
    joinHashInput('source-file', [
      input.snapshotId,
      normalizeRepoRelativePath(input.repoRelativePath),
    ]),
  );
}

/**
 * `source-file-version:v1:<hash16>`.
 * Hash inputs: `source-file-version` NUL sourceFileId NUL contentHash (full
 * sha256 of the file bytes).
 */
export function buildSourceFileVersionId(input: {
  readonly sourceFileId: string;
  readonly contentHash: string;
}): string {
  return buildHashedId(
    'source-file-version',
    joinHashInput('source-file-version', [
      input.sourceFileId,
      normalizeSegment(input.contentHash),
    ]),
  );
}

/**
 * `symbol:v1:<hash16>`.
 * Hash inputs: `symbol` NUL sourceFileVersionId NUL kind NUL name NUL startLine.
 * The start line disambiguates same-named declarations within a file version.
 */
export function buildSymbolId(input: {
  readonly sourceFileVersionId: string;
  readonly kind: string;
  readonly name: string;
  readonly startLine: number;
}): string {
  return buildHashedId(
    'symbol',
    joinHashInput('symbol', [
      input.sourceFileVersionId,
      normalizeSegment(input.kind),
      normalizeSegment(input.name),
      String(input.startLine),
    ]),
  );
}

/**
 * `signature:v1:<hash16>`.
 * Hash inputs: `signature` NUL symbolId NUL normalized(signatureText). Signature
 * text is the declaration/signature only, never a body (decision record §6).
 */
export function buildSignatureId(input: {
  readonly symbolId: string;
  readonly signatureText: string;
}): string {
  return buildHashedId(
    'signature',
    joinHashInput('signature', [
      input.symbolId,
      normalizeSegment(input.signatureText),
    ]),
  );
}

/**
 * `evidence:v1:<hash16>`.
 * Hash inputs: `evidence` NUL symbolId NUL evidenceKind NUL contentHash. The
 * content hash is over the sanitized evidence text.
 */
export function buildEvidenceId(input: {
  readonly symbolId: string;
  readonly evidenceKind: string;
  readonly contentHash: string;
}): string {
  return buildHashedId(
    'evidence',
    joinHashInput('evidence', [
      input.symbolId,
      normalizeSegment(input.evidenceKind),
      normalizeSegment(input.contentHash),
    ]),
  );
}

/**
 * `diagnostic:v1:<hash16>`.
 * Hash inputs: `diagnostic` NUL snapshotId NUL code NUL locationKey. The location
 * key is a safe, repo-relative reference (e.g. `path:line`), never an absolute
 * path.
 */
export function buildDiagnosticId(input: {
  readonly snapshotId: string;
  readonly code: string;
  readonly locationKey: string;
}): string {
  return buildHashedId(
    'diagnostic',
    joinHashInput('diagnostic', [
      input.snapshotId,
      normalizeSegment(input.code),
      normalizeSegment(input.locationKey),
    ]),
  );
}

/**
 * `search-doc:v1:<hash16>`.
 * Hash inputs: `search-doc` NUL snapshotId NUL symbolId.
 */
export function buildSearchDocId(input: {
  readonly snapshotId: string;
  readonly symbolId: string;
}): string {
  return buildHashedId(
    'search-doc',
    joinHashInput('search-doc', [input.snapshotId, input.symbolId]),
  );
}

/**
 * `generated-doc:v1:<hash16>`.
 * Hash inputs: `generated-doc` NUL snapshotId NUL templateId NUL templateVersion
 * NUL repo-relative(conceptPath) NUL contentHash.
 */
export function buildGeneratedDocId(input: {
  readonly snapshotId: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly conceptPath: string;
  readonly contentHash: string;
}): string {
  return buildHashedId(
    'generated-doc',
    joinHashInput('generated-doc', [
      input.snapshotId,
      normalizeSegment(input.templateId),
      normalizeSegment(input.templateVersion),
      normalizeRepoRelativePath(input.conceptPath),
      normalizeSegment(input.contentHash),
    ]),
  );
}

/**
 * `generated-section:v1:<generated-doc-id>:<slot-id>` or, for per-symbol slots,
 * `generated-section:v1:<generated-doc-id>:<slot-id>:<symbol-id-hash>` (decision
 * record §9). The stable section ID is independent of rendered heading text.
 * `symbolId`, when present, is folded into a 16-hex hash so the section ID stays
 * bounded.
 */
export function buildGeneratedSectionId(input: {
  readonly generatedDocId: string;
  readonly slotId: string;
  readonly symbolId?: string;
}): string {
  const base = `generated-section:${ID_VERSION}:${input.generatedDocId}:${normalizeSegment(input.slotId)}`;
  if (input.symbolId === undefined) {
    return base;
  }
  return `${base}:${truncateHash(sha256Hex(normalizeSegment(input.symbolId)))}`;
}

/**
 * `citation:v1:<generated-section-id>:<evidence-id>` (decision record §9).
 */
export function buildCitationId(input: {
  readonly generatedSectionId: string;
  readonly evidenceId: string;
}): string {
  return `citation:${ID_VERSION}:${input.generatedSectionId}:${input.evidenceId}`;
}

/** One entry to check for truncated-hash collisions within a snapshot scope. */
export interface IdCollisionEntry {
  /** Caller key used to correlate the resolved ID back to the source row. */
  readonly key: string;
  readonly type: HashedIdType;
  /** The NUL-joined, normalized hash-input tuple (as passed to `buildHashedId`). */
  readonly hashInput: string;
}

export interface ResolvedId {
  readonly key: string;
  readonly id: string;
  /** The hex length used; longer than the default only when a collision extended it. */
  readonly hashLength: number;
}

export interface IdCollisionResolution {
  readonly ids: readonly ResolvedId[];
  readonly diagnostics: readonly Diagnostic[];
}

/**
 * Detect and resolve truncated-hash collisions within a snapshot scope.
 *
 * Distinct hash inputs that share the same truncated hash at `length` are a
 * collision. For each colliding group the truncation is extended (16 hex at a
 * time, up to the full digest) until the group's IDs are distinct, and a single
 * `LOAD_ID_COLLISION` diagnostic is emitted per group. Entries that share a hash
 * input are the same logical ID and are not a collision.
 *
 * `length` defaults to 16; tests force the extension path with a smaller length.
 */
export function detectIdCollisions(
  entries: readonly IdCollisionEntry[],
  length: number = DEFAULT_HASH_HEX_LENGTH,
): IdCollisionResolution {
  const digests = new Map<string, string>();
  const digestFor = (hashInput: string): string => {
    const cached = digests.get(hashInput);
    if (cached !== undefined) {
      return cached;
    }
    const digest = sha256Hex(hashInput);
    digests.set(hashInput, digest);
    return digest;
  };

  // Group entries by their truncated hash at the base length.
  const groups = new Map<string, IdCollisionEntry[]>();
  for (const entry of entries) {
    const truncated = digestFor(entry.hashInput).slice(0, length);
    const bucket = groups.get(truncated);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(truncated, [entry]);
    }
  }

  const ids: ResolvedId[] = [];
  const diagnostics: Diagnostic[] = [];

  for (const bucket of groups.values()) {
    const distinctInputs = new Set(bucket.map((entry) => entry.hashInput));
    if (distinctInputs.size <= 1) {
      for (const entry of bucket) {
        ids.push({
          key: entry.key,
          id: `${entry.type}:${ID_VERSION}:${digestFor(entry.hashInput).slice(0, length)}`,
          hashLength: length,
        });
      }
      continue;
    }

    const extendedLength = resolveExtendedLength(bucket, digestFor, length);
    for (const entry of bucket) {
      ids.push({
        key: entry.key,
        id: `${entry.type}:${ID_VERSION}:${digestFor(entry.hashInput).slice(0, extendedLength)}`,
        hashLength: extendedLength,
      });
    }
    const safeDetail: SafeDetail = {
      colliding_id_count: distinctInputs.size,
      base_hash_length: length,
      extended_hash_length: extendedLength,
    };
    diagnostics.push(
      createDiagnostic({
        code: 'LOAD_ID_COLLISION',
        severity: 'warning',
        message: `Truncated ID hash collision resolved by extending truncation to ${extendedLength} hex characters.`,
        safeDetail,
        suggestedAction:
          'No action required; colliding IDs use an extended, still-deterministic truncation.',
      }),
    );
  }

  ids.sort((left, right) => left.key.localeCompare(right.key));
  return { ids, diagnostics };
}

function resolveExtendedLength(
  bucket: readonly IdCollisionEntry[],
  digestFor: (hashInput: string) => string,
  startLength: number,
): number {
  for (
    let candidate = startLength + DEFAULT_HASH_HEX_LENGTH;
    candidate <= MAX_HASH_HEX_LENGTH;
    candidate += DEFAULT_HASH_HEX_LENGTH
  ) {
    const truncated = new Set(
      bucket.map((entry) => digestFor(entry.hashInput).slice(0, candidate)),
    );
    if (truncated.size === new Set(bucket.map((entry) => entry.hashInput)).size) {
      return candidate;
    }
  }
  return MAX_HASH_HEX_LENGTH;
}
