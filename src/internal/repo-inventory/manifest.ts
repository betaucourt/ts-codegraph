import { readFile } from 'node:fs/promises';
import { join, relative, isAbsolute } from 'node:path';
import { AppError } from '../errors/index.js';
import { sanitizeDiagnosticText, createSafePathPolicy, resolveSafePath } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/repo-inventory-entities.js';
import type { PackageInventory } from './types.js';

const TRACER_NAME = 'codegraph.repo-inventory';

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function safeString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = sanitizeDiagnosticText(v.trim());
  return s.length > 0 ? s : undefined;
}

function safeStringRecord(v: unknown): Readonly<Record<string, string>> | undefined {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return undefined;
  const obj = v as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const [k, val] of Object.entries(obj)) {
    if (typeof val === 'string') result[k] = val;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function safeStringArray(v: unknown): readonly string[] | undefined {
  if (!Array.isArray(v)) {
    if (v !== null && typeof v === 'object' && 'packages' in v && Array.isArray((v as Record<string, unknown>)['packages'])) {
      return safeStringArray((v as Record<string, unknown>)['packages']);
    }
    return undefined;
  }
  return v.filter((x): x is string => typeof x === 'string');
}

export async function readPackageManifest(
  pathRef: string,
  repoRoot?: string,
): Promise<PackageInventory> {
  // Span is created BEFORE validation so that validation and traversal failures are also recorded.
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.repo_inventory.manifest', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OPERATION]: 'manifest' },
  });

  try {
    if (!pathRef || !isAbsolute(pathRef) || hasControlChars(pathRef)) {
      throw new AppError({
        code: ERROR_CODES.REPO_INVALID_ROOT,
        category: 'validation',
        title: 'Package manifest path is invalid',
        clientDetail: 'Path must be a non-empty absolute path without control characters',
      });
    }

    // Root containment check: when repoRoot is provided, ensure pathRef is inside it.
    if (repoRoot !== undefined) {
      try {
        const policy = createSafePathPolicy(repoRoot, { allowSymlinks: false });
        // relative() returns '' when pathRef === repoRoot; use '.' so resolveSafePath accepts it
        const rel = relative(repoRoot, pathRef) || '.';
        const check = resolveSafePath(policy, rel);
        if (check.decision !== 'allow') {
          throw new AppError({
            code: ERROR_CODES.REPO_TRAVERSAL_DENIED,
            category: 'authz',
            title: 'Package manifest path is outside the repository root',
            clientDetail: 'The manifest path must be within the repository root',
          });
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError({
          code: ERROR_CODES.REPO_TRAVERSAL_DENIED,
          category: 'authz',
          title: 'Package manifest path could not be validated against the repository root',
          clientDetail: 'The manifest path must be within the repository root',
          cause: err,
        });
      }
    }

    const manifestPath = pathRef.endsWith('package.json') ? pathRef : join(pathRef, 'package.json');
    const dir = manifestPath.endsWith('package.json')
      ? manifestPath.slice(0, -'package.json'.length - 1)
      : pathRef;

    let raw: string;
    try {
      raw = await readFile(manifestPath, 'utf8');
    } catch (cause) {
      throw new AppError({
        code: ERROR_CODES.REPO_MANIFEST_PARSE_FAILED,
        category: 'validation',
        title: 'Package manifest could not be read',
        clientDetail: 'The package.json file could not be opened',
        cause,
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new AppError({
        code: ERROR_CODES.REPO_MANIFEST_PARSE_FAILED,
        category: 'validation',
        title: 'Package manifest is not valid JSON',
        clientDetail: 'The package.json file contains invalid JSON',
        cause,
      });
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new AppError({
        code: ERROR_CODES.REPO_MANIFEST_PARSE_FAILED,
        category: 'validation',
        title: 'Package manifest has unexpected shape',
        clientDetail: 'package.json must be a JSON object',
      });
    }

    const obj = parsed as Record<string, unknown>;
    const deps = safeStringRecord(obj['dependencies']);
    const devDeps = safeStringRecord(obj['devDependencies']);
    const scripts = safeStringRecord(obj['scripts']);
    const workspaces = safeStringArray(obj['workspaces']);

    const hasTypeScript =
      (deps !== undefined && ('typescript' in deps || '@types/node' in deps)) ||
      (devDeps !== undefined && ('typescript' in devDeps || '@types/node' in devDeps));

    const relPath = repoRoot !== undefined ? relative(repoRoot, dir) : dir;

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    const name = safeString(obj['name']);
    const version = safeString(obj['version']);
    const description = safeString(obj['description']);
    return {
      path: dir,
      relativePath: relPath,
      ...(name !== undefined ? { name } : {}),
      ...(version !== undefined ? { version } : {}),
      ...(description !== undefined ? { description } : {}),
      private: obj['private'] === true,
      ...(workspaces !== undefined ? { workspaces } : {}),
      ...(deps !== undefined ? { dependencies: deps } : {}),
      ...(devDeps !== undefined ? { devDependencies: devDeps } : {}),
      ...(scripts !== undefined ? { scripts } : {}),
      hasTypeScript,
    };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.REPO_MANIFEST_PARSE_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw err;
  }
}
