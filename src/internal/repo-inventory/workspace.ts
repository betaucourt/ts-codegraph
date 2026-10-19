import { readFile, readdir, access } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import { AppError } from '../errors/index.js';
import { createSafePathPolicy, resolveSafePath } from '../security/index.js';
import type { SafePathPolicy } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/repo-inventory-entities.js';
import { readPackageManifest } from './manifest.js';
import { safePositiveInt } from './utils.js';
import type { PackageInventory, WorkspaceInventory, WorkspaceKind, DiscoverWorkspaceOptions } from './types.js';

const TRACER_NAME = 'codegraph.repo-inventory';
const DEFAULT_MAX_PACKAGES = 500;

/** Parse pnpm-workspace.yaml without a YAML library. Handles the common format:
 *   packages:
 *     - "packages/*"
 *     - "apps/*"
 */
export function parsePnpmWorkspaceYaml(content: string): string[] {
  const patterns: string[] = [];
  let inPackages = false;
  for (const raw of content.split('\n')) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (trimmed === 'packages:') { inPackages = true; continue; }
    if (inPackages) {
      if (trimmed.startsWith('- ')) {
        const p = trimmed.slice(2).trim().replace(/^['"]|['"]$/g, '');
        if (p) patterns.push(p);
      } else if (trimmed && !trimmed.startsWith('#')) {
        inPackages = false;
      }
    }
  }
  return patterns;
}

/**
 * Check if a package directory's relative path matches any ignore pattern.
 * Supports exact relative path, prefix, and basename matching.
 */
function isIgnoredDir(relPath: string, patterns: readonly string[]): boolean {
  for (const pattern of patterns) {
    if (relPath === pattern) return true;
    if (relPath.startsWith(pattern + '/')) return true;
    const base = relPath.split('/').at(-1) ?? relPath;
    if (base === pattern) return true;
  }
  return false;
}

/**
 * Expand a workspace glob pattern safely, enforcing root containment via resolveSafePath.
 * - Patterns that escape root (e.g., "../outside") return []
 * - Symlinks whose real target is outside root are silently skipped
 */
async function expandPatternSafe(
  root: string,
  policy: SafePathPolicy,
  pattern: string,
): Promise<string[]> {
  // Normalise: treat `**` as `*` (we only do single-level expansion)
  const clean = pattern.replace(/\/\*\*$/, '/*').replace(/\*\*\//g, '');

  if (clean.endsWith('/*')) {
    const relBase = clean.slice(0, -2) || '.';

    // Verify the base directory is inside root before reading it
    const baseResult = resolveSafePath(policy, relBase);
    if (baseResult.decision !== 'allow' || baseResult.relativePath === undefined) return [];

    const absBase = join(root, baseResult.relativePath);
    let entries;
    try { entries = await readdir(absBase, { withFileTypes: true }); } catch { return []; }

    const results: string[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const entryRel = (relBase === '.' ? '' : relBase + '/') + entry.name;
      const entryResult = resolveSafePath(policy, entryRel);
      if (entryResult.decision === 'allow' && entryResult.relativePath !== undefined) {
        results.push(join(root, entryResult.relativePath));
      }
      // Silently skip entries that escape root or are symlinks to outside
    }
    return results;
  }

  // Exact path: check containment then existence
  const result = resolveSafePath(policy, clean);
  if (result.decision !== 'allow' || result.relativePath === undefined) return [];
  const abs = join(root, result.relativePath);
  try { await access(abs); return [abs]; } catch { return []; }
}

/** Filter a list of dirs to those that contain a package.json. */
async function filterPackageDirs(dirs: string[]): Promise<string[]> {
  const results: string[] = [];
  await Promise.all(dirs.map(async dir => {
    try { await access(join(dir, 'package.json')); results.push(dir); } catch {}
  }));
  return results;
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

export async function discoverWorkspace(
  root: string,
  opts?: DiscoverWorkspaceOptions,
): Promise<WorkspaceInventory> {
  // Span is created BEFORE validation so that validation failures are also recorded.
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.repo_inventory.workspace', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OPERATION]: 'workspace' },
  });

  const maxPackages = safePositiveInt(opts?.maxPackages, DEFAULT_MAX_PACKAGES, 10_000);
  const extraIgnorePatterns = opts?.extraIgnorePatterns ?? [];

  try {
    if (!root || !isAbsolute(root) || hasControlChars(root)) {
      throw new AppError({
        code: ERROR_CODES.REPO_INVALID_ROOT,
        category: 'validation',
        title: 'Repository root is invalid',
        clientDetail: 'Root must be a non-empty absolute path without control characters',
      });
    }

    // Create safety policy once for all pattern expansions
    const policy = createSafePathPolicy(root, { allowSymlinks: false });

    // Determine workspace kind and patterns
    let patterns: string[] = [];
    let kind: WorkspaceKind = 'none';

    // 1. Check pnpm-workspace.yaml
    try {
      const pnpmWs = await readFile(join(root, 'pnpm-workspace.yaml'), 'utf8');
      patterns = parsePnpmWorkspaceYaml(pnpmWs);
      kind = 'pnpm';
    } catch {
      // Not a pnpm workspace — check package.json
      try {
        const pkgRaw = await readFile(join(root, 'package.json'), 'utf8');
        const pkg = JSON.parse(pkgRaw) as Record<string, unknown>;
        const ws = pkg['workspaces'];
        if (Array.isArray(ws)) {
          patterns = ws.filter((p): p is string => typeof p === 'string');
          kind = 'npm';
        } else if (ws !== null && typeof ws === 'object' && Array.isArray((ws as Record<string, unknown>)['packages'])) {
          const pkgs = (ws as Record<string, unknown>)['packages'] as unknown[];
          patterns = pkgs.filter((p): p is string => typeof p === 'string');
          kind = 'yarn';
        }
      } catch {}
    }

    if (patterns.length === 0) {
      // Single-package repo: just read root package.json if present
      let rootPkg: PackageInventory | undefined;
      try { rootPkg = await readPackageManifest(root, root); } catch {}
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_WORKSPACE_KIND, 'none');
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return {
        root,
        kind: 'none',
        packages: rootPkg !== undefined ? [rootPkg] : [],
      };
    }

    // Expand all patterns with safe root-contained expansion
    const allDirs: string[] = [];
    for (const pat of patterns) {
      const expanded = await expandPatternSafe(root, policy, pat);
      allDirs.push(...expanded);
    }

    // Filter to dirs that have a package.json
    let packageDirs = await filterPackageDirs(allDirs);

    // Apply extraIgnorePatterns against relative paths
    if (extraIgnorePatterns.length > 0) {
      packageDirs = packageDirs.filter(dir => {
        const relPath = dir.startsWith(root + '/') ? dir.slice(root.length + 1) : dir;
        return !isIgnoredDir(relPath, extraIgnorePatterns);
      });
    }

    if (packageDirs.length > maxPackages) {
      throw new AppError({
        code: ERROR_CODES.REPO_INVENTORY_LIMIT_EXCEEDED,
        category: 'validation',
        title: 'Repository inventory limit exceeded',
        clientDetail: 'Workspace contains more packages than the configured limit',
      });
    }

    const packages: PackageInventory[] = [];
    await Promise.all(packageDirs.map(async dir => {
      try {
        const pkg = await readPackageManifest(dir, root);
        packages.push(pkg);
      } catch { /* skip unreadable packages */ }
    }));

    // Stable sort by relativePath
    packages.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_WORKSPACE_KIND, kind);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return { root, kind, packages };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.REPO_INVENTORY_LIMIT_EXCEEDED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw err;
  }
}
