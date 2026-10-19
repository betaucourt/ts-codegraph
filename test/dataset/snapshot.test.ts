import { describe, expect, it } from 'vitest';

import type { GitSummary } from '../../src/internal/repo-inventory/index.js';

import { buildProjectId } from '../../src/dataset/ids.js';
import {
  buildSnapshotSummary,
  computeSnapshotId,
  computeSnapshotIdentity,
  type IncludedFile,
} from '../../src/dataset/snapshot.js';

const PROJECT_ID = buildProjectId('apps/ts-codegraph');

interface GitOverrides {
  readonly branch?: string;
  readonly commitHash?: string | undefined;
  readonly isDirty?: boolean;
  readonly untrackedCount?: number;
  readonly modifiedCount?: number;
  readonly stagedCount?: number;
  readonly available?: boolean;
}

function gitSummary(overrides: GitOverrides = {}): GitSummary {
  const merged = {
    branch: 'main',
    commitHash: 'abcdef1234567890abcdef1234567890abcdef12' as string | undefined,
    isDirty: false,
    untrackedCount: 0,
    modifiedCount: 0,
    stagedCount: 0,
    available: true,
    ...overrides,
  };
  const { commitHash, ...rest } = merged;
  return commitHash === undefined ? rest : { ...rest, commitHash };
}

const FILES: IncludedFile[] = [
  { repoRelativePath: 'src/b.ts', contentHash: 'b'.repeat(64) },
  { repoRelativePath: 'src/a.ts', contentHash: 'a'.repeat(64) },
];

describe('ts-codegraph snapshot identity', () => {
  it('uses the git commit form for a clean worktree', () => {
    const id = computeSnapshotId({ projectId: PROJECT_ID, gitSummary: gitSummary(), includedFiles: FILES });
    expect(id).toBe(`snapshot:v1:${PROJECT_ID}:git:abcdef1234567890abcdef1234567890abcdef12`);
    expect(id).not.toContain('worktree:');
  });

  it('throws rather than emit a malformed clean-snapshot ID without a commit', () => {
    expect(() =>
      computeSnapshotId({
        projectId: PROJECT_ID,
        gitSummary: gitSummary({ commitHash: undefined }),
        includedFiles: FILES,
      }),
    ).toThrow(/commit hash/);
  });

  it('uses the worktree hash form for a dirty worktree', () => {
    const id = computeSnapshotId({
      projectId: PROJECT_ID,
      gitSummary: gitSummary({ isDirty: true, modifiedCount: 1 }),
      includedFiles: FILES,
    });
    expect(id).toMatch(new RegExp(`^snapshot:v1:${escapeRegExp(PROJECT_ID)}:worktree:[0-9a-f]{64}$`));
  });

  it('uses the worktree hash form when git is unavailable', () => {
    const id = computeSnapshotId({
      projectId: PROJECT_ID,
      gitSummary: gitSummary({ available: false, commitHash: undefined }),
      includedFiles: FILES,
    });
    expect(id).toContain(':worktree:');
  });

  it('is stable across two computations of the same dirty state and order-independent', () => {
    const dirty = gitSummary({ isDirty: true, modifiedCount: 2 });
    const first = computeSnapshotId({ projectId: PROJECT_ID, gitSummary: dirty, includedFiles: FILES });
    const reordered = computeSnapshotId({ projectId: PROJECT_ID, gitSummary: dirty, includedFiles: [...FILES].reverse() });
    expect(first).toBe(reordered);
  });

  it('changes the worktree hash when one file byte changes', () => {
    const dirty = gitSummary({ isDirty: true, modifiedCount: 1 });
    const base = computeSnapshotId({ projectId: PROJECT_ID, gitSummary: dirty, includedFiles: FILES });
    const mutated = computeSnapshotId({
      projectId: PROJECT_ID,
      gitSummary: dirty,
      includedFiles: [FILES[0]!, { repoRelativePath: 'src/a.ts', contentHash: `${'a'.repeat(63)}c` }],
    });
    expect(mutated).not.toBe(base);
  });

  it('builds a safe summary with only the four allowed fields', () => {
    const summary = buildSnapshotSummary({
      projectId: PROJECT_ID,
      gitSummary: gitSummary({ isDirty: true, untrackedCount: 1, modifiedCount: 2, stagedCount: 0 }),
      includedFiles: FILES,
    });
    expect(Object.keys(summary).sort()).toEqual(['baseCommit', 'dirtyFileCount', 'includedFileCount', 'kind']);
    expect(summary.kind).toBe('git-dirty');
    expect(summary.dirtyFileCount).toBe(3);
    expect(summary.includedFileCount).toBe(2);
  });

  it('omits dirtyFileCount and baseCommit when git is unavailable', () => {
    const summary = buildSnapshotSummary({
      projectId: PROJECT_ID,
      gitSummary: gitSummary({ available: false, commitHash: undefined }),
      includedFiles: FILES,
    });
    expect(summary.kind).toBe('no-git');
    expect(Object.keys(summary).sort()).toEqual(['includedFileCount', 'kind']);
  });

  it('computeSnapshotIdentity returns the id and summary together', () => {
    const identity = computeSnapshotIdentity({ projectId: PROJECT_ID, gitSummary: gitSummary(), includedFiles: FILES });
    expect(identity.snapshotId).toContain(':git:');
    expect(identity.summary.kind).toBe('git-clean');
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
