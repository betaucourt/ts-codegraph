import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const DEFAULT_IGNORE_PATTERNS: readonly string[] = [
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.turbo',
  '*.tgz',
  '*.tar.gz',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '.DS_Store',
  'Thumbs.db',
];

// Convert a gitignore-style glob to a RegExp that tests a relative Unix path.
// Handles most practical patterns: exact names, *.ext, dir/, **/glob, negation.
function globToRegex(pattern: string): RegExp | null {
  try {
    let p = pattern;

    // Leading slash = anchored to root; strip it
    const anchored = p.startsWith('/');
    if (anchored) p = p.slice(1);

    // Trailing slash = directory only; strip it (we match dir itself or subtree)
    const dirOnly = p.endsWith('/');
    if (dirOnly) p = p.slice(0, -1);

    // Escape regex special chars but NOT *, ?, /
    p = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');

    // ** → any path segment separator
    // * → any non-/ chars
    // ? → any single non-/ char
    const parts = p.split('\\*\\*');
    const converted = parts
      .map((part) => part.replace(/\\\*/g, '[^/]*').replace(/\\\?/g, '[^/]'))
      .join('.*');

    let regStr: string;
    if (dirOnly) {
      // Match the directory itself or anything inside it
      regStr = `^${converted}(/.*)?$`;
    } else if (!anchored && !pattern.includes('/')) {
      // No slash in original (non-anchored): match in any directory or at root
      regStr = `(^|/)${converted}(/.*)?$`;
    } else {
      regStr = `^${converted}(/.*)?$`;
    }

    return new RegExp(regStr);
  } catch {
    return null;
  }
}

export interface IgnoreChecker {
  isIgnored(relPath: string): boolean;
}

export function buildIgnoreChecker(patterns: readonly string[]): IgnoreChecker {
  const positive: RegExp[] = [];
  const negative: RegExp[] = [];

  for (const raw of patterns) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('!')) {
      const re = globToRegex(line.slice(1));
      if (re) negative.push(re);
    } else {
      const re = globToRegex(line);
      if (re) positive.push(re);
    }
  }

  return {
    isIgnored(relPath: string): boolean {
      const path = relPath.replace(/\\/g, '/');
      let ignored = false;
      for (const re of positive) {
        if (re.test(path)) {
          ignored = true;
          break;
        }
      }
      if (!ignored) return false;
      for (const re of negative) {
        if (re.test(path)) return false;
      }
      return true;
    },
  };
}

export async function loadGitignorePatterns(root: string): Promise<string[]> {
  try {
    const content = await readFile(join(root, '.gitignore'), 'utf8');
    return content
      .split('\n')
      .map((l) => l.trimEnd())
      .filter((l) => l && !l.startsWith('#'));
  } catch {
    return [];
  }
}
