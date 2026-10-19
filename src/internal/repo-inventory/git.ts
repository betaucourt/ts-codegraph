import { createProcessRunner } from '../process-runner/index.js';
import { AppError } from '../errors/index.js';
import { sanitizeDiagnosticText } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/repo-inventory-entities.js';
import { safePositiveInt } from './utils.js';
import type { GitSummary, GitSummaryOptions } from './types.js';

const TRACER_NAME = 'codegraph.repo-inventory';
const DEFAULT_MAX_DIRTY = 200;

const GIT_POLICY = {
  name: 'repo-inventory-git',
  allowedExecutables: ['git'],
  maxOutputBytes: 65_536,
  defaultTimeoutMs: 10_000,
  failOnNonZeroExit: false,
};

const gitRunner = createProcessRunner(GIT_POLICY);

/** Clamp to [0, max] — dirty counts must never be negative. */
function boundedCount(n: number, max: number): number {
  return Math.max(0, Math.min(n, max));
}

function parseGitPorcelain(output: string): { modified: number; untracked: number; staged: number } {
  let modified = 0, untracked = 0, staged = 0;
  for (const line of output.split('\n')) {
    if (line.length < 2) continue;
    const x = line[0] ?? ' ';
    const y = line[1] ?? ' ';
    if (x === '?' && y === '?') { untracked++; continue; }
    if (x !== ' ' && x !== '?') staged++;
    if (y !== ' ' && y !== '?') modified++;
  }
  return { modified, untracked, staged };
}

export async function summarizeGitState(
  root: string,
  opts?: GitSummaryOptions,
): Promise<GitSummary> {
  const maxDirty = safePositiveInt(opts?.maxDirtyFiles, DEFAULT_MAX_DIRTY, 10_000);

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.repo_inventory.git', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OPERATION]: 'git' },
  });

  try {
    // Check if git is available and root is inside a git repo
    const revParse = await gitRunner.run({
      executable: 'git',
      args: ['-C', root, 'rev-parse', '--git-dir'],
    });

    if (revParse.exitCode !== 0 || revParse.timedOut) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'unavailable');
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return { available: false, isDirty: false, untrackedCount: 0, modifiedCount: 0, stagedCount: 0 };
    }

    // Get branch and commit in parallel
    const [branchResult, commitResult, statusResult] = await Promise.all([
      gitRunner.run({ executable: 'git', args: ['-C', root, 'rev-parse', '--abbrev-ref', 'HEAD'] }),
      gitRunner.run({ executable: 'git', args: ['-C', root, 'rev-parse', 'HEAD'] }),
      gitRunner.run({ executable: 'git', args: ['-C', root, 'status', '--porcelain'] }),
    ]);

    const rawBranch = branchResult.stdout.trim();
    const rawCommit = commitResult.stdout.trim();

    // Sanitize branch name; never include raw output in diagnostics
    const branch = rawBranch.length > 0 && rawBranch !== 'HEAD'
      ? sanitizeDiagnosticText(rawBranch).slice(0, 200)
      : undefined;

    // Commit hash: only accept 40-char lowercase hex
    const commitHash = /^[0-9a-f]{40}$/.test(rawCommit) ? rawCommit : undefined;

    const { modified, untracked, staged } = parseGitPorcelain(statusResult.stdout);
    const isDirty = modified > 0 || untracked > 0 || staged > 0;

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return {
      available: true,
      ...(branch !== undefined ? { branch } : {}),
      ...(commitHash !== undefined ? { commitHash } : {}),
      isDirty,
      untrackedCount: boundedCount(untracked, maxDirty),
      modifiedCount: boundedCount(modified, maxDirty),
      stagedCount: boundedCount(staged, maxDirty),
    };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.REPO_GIT_PROBE_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw err;
  }
}
