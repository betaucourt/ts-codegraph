import { resolve, relative, isAbsolute, dirname } from 'node:path';
import { realpathSync } from 'node:fs';
import { AppError } from '../errors/index.js';
import type { SecurityPolicyDecision } from './types.js';
import { ERROR_CODES } from './generated/security-entities.js';

export type { SecurityPolicyDecision };

export interface SafePathPolicy {
  readonly root: string;
  readonly allowSymlinks: boolean;
}

export interface SafePathResult {
  readonly decision: SecurityPolicyDecision;
  readonly relativePath?: string;
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

export function createSafePathPolicy(
  root: string,
  opts?: { allowSymlinks?: boolean },
): SafePathPolicy {
  if (!root || hasControlChars(root)) {
    throw new AppError({
      code: ERROR_CODES.SECURITY_POLICY_INVALID,
      category: 'validation',
      title: 'Path policy root is invalid',
      clientDetail: 'Root must be a non-empty string without control characters',
    });
  }
  return {
    root: resolve(root),
    allowSymlinks: opts?.allowSymlinks ?? false,
  };
}

export function isPathInside(root: string, target: string): boolean {
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(target);
  const rel = relative(resolvedRoot, resolvedTarget);
  return !rel.startsWith('..') && !isAbsolute(rel);
}

function realPathInsideRoot(root: string, p: string): boolean {
  // Resolve root first — on macOS /tmp is a symlink to /private/tmp
  let realRoot: string;
  try {
    realRoot = realpathSync(root);
  } catch {
    return true; // root doesn't exist — no meaningful symlink to check
  }
  // Walk up parent directories until we find an existing ancestor.
  // This catches "root/link-out/new-file.txt" where link-out exists and escapes root,
  // even though new-file.txt does not yet exist.
  let candidate = p;
  for (;;) {
    try {
      return isPathInside(realRoot, realpathSync(candidate));
    } catch {
      const parent = dirname(candidate);
      if (parent === candidate) return true; // reached fs root, nothing resolved
      candidate = parent;
    }
  }
}

export function resolveSafePath(
  policy: SafePathPolicy,
  target: string,
): SafePathResult {
  if (!target || hasControlChars(target)) {
    return { decision: 'deny' };
  }

  const resolved = resolve(policy.root, target);
  if (!isPathInside(policy.root, resolved)) {
    return { decision: 'deny' };
  }

  if (!policy.allowSymlinks && !realPathInsideRoot(policy.root, resolved)) {
    return { decision: 'deny' };
  }

  const rel = relative(policy.root, resolved);
  return { decision: 'allow', relativePath: rel || '.' };
}

export function assertSafePath(policy: SafePathPolicy, target: string): string {
  const result = resolveSafePath(policy, target);
  if (result.decision !== 'allow' || result.relativePath === undefined) {
    throw new AppError({
      code: ERROR_CODES.SECURITY_PATH_DENIED,
      category: 'authz',
      title: 'Path is not within the allowed root',
      clientDetail: 'The requested path is outside the permitted directory',
    });
  }
  return result.relativePath;
}
