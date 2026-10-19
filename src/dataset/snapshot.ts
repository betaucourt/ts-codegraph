import { createHash } from 'node:crypto';

import type { GitSummary } from '../internal/repo-inventory/index.js';

import { ID_VERSION, normalizeRepoRelativePath } from './ids.js';

/**
 * Snapshot identity (decision record §7).
 *
 * Snapshot identity is derived from content, never from wall-clock or git-diff
 * text:
 *  - Clean git worktree: `snapshot:v1:<project-id>:git:<commit-sha>`.
 *  - Dirty worktree or no git: `snapshot:v1:<project-id>:worktree:<hash>`, where
 *    `<hash>` is the sha256 over the sorted sequence of
 *    `<normalized-repo-relative-path> NUL <sha256(file-bytes)>` entries for every
 *    included file. The per-file content hashes are already computed by `load`,
 *    so this adds no extra file reads.
 *
 * The same content always yields the same snapshot ID; any content change yields
 * a new one. The public summary carries only `kind`, `baseCommit`,
 * `includedFileCount`, and `dirtyFileCount` — no diffs, no dirty-file listings.
 */

/** NUL separator for the worktree hash sequence (decision record §7). */
const NUL = '\u0000';

export type SnapshotKind = 'git-clean' | 'git-dirty' | 'no-git';

/** A file included by the traversal policy, with its precomputed content hash. */
export interface IncludedFile {
  readonly repoRelativePath: string;
  /** Full sha256 hex digest of the file bytes. */
  readonly contentHash: string;
}

export interface ComputeSnapshotInput {
  /** The project ID this snapshot belongs to (see `buildProjectId`). */
  readonly projectId: string;
  readonly gitSummary: GitSummary;
  readonly includedFiles: readonly IncludedFile[];
}

/** The public, safe snapshot description (decision record §7). */
export interface SnapshotSummary {
  readonly kind: SnapshotKind;
  readonly baseCommit?: string;
  readonly includedFileCount: number;
  readonly dirtyFileCount?: number;
}

export interface SnapshotIdentity {
  readonly snapshotId: string;
  readonly summary: SnapshotSummary;
}

function classify(gitSummary: GitSummary): SnapshotKind {
  if (!gitSummary.available) {
    return 'no-git';
  }
  return gitSummary.isDirty ? 'git-dirty' : 'git-clean';
}

/**
 * Compute the sha256 over the sorted `<path> NUL <contentHash>` sequence. Entries
 * are sorted by their normalized repo-relative path (ties broken by content hash)
 * so the digest is independent of traversal order.
 */
function computeWorktreeHash(includedFiles: readonly IncludedFile[]): string {
  const entries = includedFiles
    .map((file) => {
      const path = normalizeRepoRelativePath(file.repoRelativePath);
      return { path, line: `${path}${NUL}${file.contentHash.trim()}` };
    })
    .sort((left, right) =>
      left.path === right.path
        ? left.line.localeCompare(right.line)
        : left.path.localeCompare(right.path),
    );
  const hash = createHash('sha256');
  for (const entry of entries) {
    hash.update(entry.line, 'utf8');
    hash.update(NUL, 'utf8');
  }
  return hash.digest('hex');
}

/**
 * Build the snapshot ID string (decision record §7). Throws a clear error if a
 * clean git worktree has no commit hash rather than emitting a malformed ID.
 */
export function computeSnapshotId(input: ComputeSnapshotInput): string {
  const kind = classify(input.gitSummary);
  if (kind === 'git-clean') {
    const commit = input.gitSummary.commitHash;
    if (commit === undefined || commit.trim().length === 0) {
      throw new Error('clean git snapshot requires a commit hash');
    }
    return `snapshot:${ID_VERSION}:${input.projectId}:git:${commit.trim()}`;
  }
  const worktreeHash = computeWorktreeHash(input.includedFiles);
  return `snapshot:${ID_VERSION}:${input.projectId}:worktree:${worktreeHash}`;
}

/**
 * Build the safe snapshot summary. Only the four allowed fields are returned; no
 * raw diff, per-file stat, or dirty-path listing is included. `baseCommit` is set
 * whenever git is present (provenance); `dirtyFileCount` is set only when git is
 * available (untracked + modified + staged).
 */
export function buildSnapshotSummary(input: ComputeSnapshotInput): SnapshotSummary {
  const kind = classify(input.gitSummary);
  const includedFileCount = input.includedFiles.length;

  const baseCommit =
    input.gitSummary.available &&
    input.gitSummary.commitHash !== undefined &&
    input.gitSummary.commitHash.trim().length > 0
      ? input.gitSummary.commitHash.trim()
      : undefined;

  const dirtyFileCount = input.gitSummary.available
    ? input.gitSummary.untrackedCount +
      input.gitSummary.modifiedCount +
      input.gitSummary.stagedCount
    : undefined;

  return {
    kind,
    includedFileCount,
    ...(baseCommit !== undefined ? { baseCommit } : {}),
    ...(dirtyFileCount !== undefined ? { dirtyFileCount } : {}),
  };
}

/** Compute both the snapshot ID and its safe summary in one call. */
export function computeSnapshotIdentity(
  input: ComputeSnapshotInput,
): SnapshotIdentity {
  return {
    snapshotId: computeSnapshotId(input),
    summary: buildSnapshotSummary(input),
  };
}
