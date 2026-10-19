import { isAbsolute } from 'node:path';
import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/repo-inventory-entities.js';
import { detectPackageManager } from './package-manager.js';
import { discoverWorkspace } from './workspace.js';
import { summarizeGitState } from './git.js';
import { findTsconfigFiles } from './tsconfig.js';
import { safePositiveInt } from './utils.js';
import type { RepoInventory, DiscoverRepositoryOptions } from './types.js';

const TRACER_NAME = 'codegraph.repo-inventory';

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function countBucket(n: number): string {
  if (n === 0) return '0';
  if (n <= 5) return '1-5';
  if (n <= 20) return '6-20';
  if (n <= 100) return '21-100';
  return '100+';
}

export async function discoverRepository(
  root: string,
  opts?: DiscoverRepositoryOptions,
): Promise<RepoInventory> {
  // Span is created BEFORE validation so that validation failures are also recorded.
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.repo_inventory.discover', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OPERATION]: 'discover' },
  });

  try {
    if (!root || !isAbsolute(root) || hasControlChars(root)) {
      throw new AppError({
        code: ERROR_CODES.REPO_INVALID_ROOT,
        category: 'validation',
        title: 'Repository root is invalid',
        clientDetail: 'Root must be a non-empty absolute path without control characters',
      });
    }

    // Validate and sanitise all numeric limits before passing down
    const maxPkg = safePositiveInt(opts?.maxPackages, 500, 10_000);
    const maxTs = safePositiveInt(opts?.maxTsconfigFiles, 100, 10_000);
    const wsOpts = {
      maxPackages: maxPkg,
      ...(opts?.extraIgnorePatterns !== undefined ? { extraIgnorePatterns: opts.extraIgnorePatterns } : {}),
    };
    const tsOpts = { maxFiles: maxTs };

    const [packageManager, workspace, tsconfigPaths, gitSummary] = await Promise.all([
      detectPackageManager(root),
      discoverWorkspace(root, wsOpts),
      findTsconfigFiles(root, tsOpts),
      opts?.skipGit
        ? Promise.resolve({ available: false, isDirty: false, untrackedCount: 0, modifiedCount: 0, stagedCount: 0 })
        : summarizeGitState(root),
    ]);

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_PACKAGE_MANAGER, packageManager.name);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_WORKSPACE_KIND, workspace.kind);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_PACKAGE_COUNT_BUCKET, countBucket(workspace.packages.length));
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return {
      root,
      gitSummary,
      packageManager,
      workspace,
      tsconfigPaths,
      packageCount: workspace.packages.length,
    };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.REPO_INVENTORY_LIMIT_EXCEEDED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw err;
  }
}
