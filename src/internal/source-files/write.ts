import { mkdir, writeFile, rename, unlink, stat } from 'node:fs/promises';
import { join, dirname, normalize, isAbsolute } from 'node:path';
import { randomBytes } from 'node:crypto';
import { AppError } from '../errors/index.js';
import { isPathInside } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/source-files-entities.js';
import type { AtomicWriteEntry, AtomicWritePlan } from './types.js';

const TRACER_NAME = 'codegraph.source-files';

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function validateEntry(root: string, entry: AtomicWriteEntry): void {
  const { relativePath } = entry;
  if (!relativePath || isAbsolute(relativePath) || hasControlChars(relativePath)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
      category: 'validation',
      title: 'Write plan entry has an invalid path',
      clientDetail: 'Entry paths must be non-empty relative paths without control characters',
    });
  }
  const resolved = join(root, relativePath);
  if (!isPathInside(root, resolved)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
      category: 'validation',
      title: 'Write plan entry escapes the output root',
      clientDetail: 'Entry paths must resolve within the output root directory',
    });
  }
}

function validateNoDuplicates(entries: readonly AtomicWriteEntry[]): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    // normalize resolves dir/../same.txt → same.txt so logically identical destinations
    // are caught even when expressed differently (e.g. 'sub/../out.txt' === 'out.txt').
    const normalized = normalize(entry.relativePath).replace(/\\/g, '/');
    if (seen.has(normalized)) {
      throw new AppError({
        code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
        category: 'validation',
        title: 'Write plan contains duplicate destination paths',
        clientDetail: 'Each entry in a write plan must have a unique relative path',
      });
    }
    seen.add(normalized);
  }
}

export function createAtomicWritePlan(
  root: string,
  entries: readonly AtomicWriteEntry[],
): AtomicWritePlan {
  if (!root || !isAbsolute(root) || hasControlChars(root)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
      category: 'validation',
      title: 'Write plan root is invalid',
      clientDetail: 'Root must be a non-empty absolute path without control characters',
    });
  }
  validateNoDuplicates(entries);
  for (const entry of entries) {
    validateEntry(root, entry);
  }
  return { root, entries, validated: true };
}

export function validateWritePlan(plan: AtomicWritePlan): void {
  if (!plan.validated) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
      category: 'validation',
      title: 'Write plan has not been validated',
      clientDetail: 'Use createAtomicWritePlan to produce a validated write plan',
    });
  }
  if (!plan.root || !isAbsolute(plan.root)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
      category: 'validation',
      title: 'Write plan root is invalid',
      clientDetail: 'Root must be a non-empty absolute path',
    });
  }
  validateNoDuplicates(plan.entries);
  for (const entry of plan.entries) {
    validateEntry(plan.root, entry);
  }
}

// Preflight: detect destinations that are directories (rename into a dir fails differently per OS).
async function preflightDestinations(plan: AtomicWritePlan): Promise<void> {
  for (const entry of plan.entries) {
    const destPath = join(plan.root, entry.relativePath);
    try {
      const s = await stat(destPath);
      if (s.isDirectory()) {
        throw new AppError({
          code: ERROR_CODES.SOURCE_FILES_WRITE_PLAN_INVALID,
          category: 'validation',
          title: 'Write plan destination conflicts with an existing directory',
          clientDetail: 'A destination path in the write plan is occupied by a directory',
        });
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      // ENOENT — destination does not exist, which is fine
    }
  }
}

export async function commitWritePlan(plan: AtomicWritePlan): Promise<void> {
  validateWritePlan(plan);

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.source_files.write', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OPERATION]: 'write' },
  });

  const tmpSuffix = randomBytes(6).toString('hex');

  // staged[i] = { tmpPath, destPath }
  const staged: Array<{ tmpPath: string; destPath: string }> = [];
  // committed = final paths that have been successfully renamed from temp
  const committed: string[] = [];

  const rollback = async (): Promise<void> => {
    // Delete temp files that were written but not yet renamed (indices committed.length..staged.length-1)
    for (const { tmpPath } of staged.slice(committed.length)) {
      await unlink(tmpPath).catch(() => {});
    }
    // Unlink final files that were already renamed (committed), restoring prior state
    for (const finalPath of committed) {
      await unlink(finalPath).catch(() => {});
    }
  };

  try {
    // Preflight: reject destinations that are existing directories
    await preflightDestinations(plan);

    // Phase 1: write all temp files
    for (const entry of plan.entries) {
      const destPath = join(plan.root, entry.relativePath);
      const tmpPath = `${destPath}.tmp${tmpSuffix}`;
      await mkdir(dirname(destPath), { recursive: true });
      await writeFile(tmpPath, entry.content, { encoding: entry.encoding ?? 'utf8' });
      staged.push({ tmpPath, destPath });
    }

    // Phase 2: atomically rename each temp file to its final destination
    for (const { tmpPath, destPath } of staged) {
      await rename(tmpPath, destPath);
      committed.push(destPath);
    }

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  } catch (cause) {
    await rollback();
    if (cause instanceof AppError) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_ERROR_CODE, cause.code);
      span.setStatus({ code: SpanStatusCode.ERROR, message: cause.code });
      span.end();
      throw cause;
    }
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'error');
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_ERROR_CODE, ERROR_CODES.SOURCE_FILES_WRITE_FAILED);
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_WRITE_FAILED,
      category: 'internal',
      title: 'Write operation failed',
      clientDetail: 'The write plan could not be committed',
      cause,
    });
  }
}
