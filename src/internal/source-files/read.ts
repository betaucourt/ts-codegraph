import { open } from 'node:fs/promises';
import { AppError } from '../errors/index.js';
import { isPathInside } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/source-files-entities.js';
import { MAX_READ_BYTES } from './scan.js';
import type { BoundedReadResult, ReadOptions, SourceFileKind } from './types.js';

const BINARY_DETECTION_BYTES = 8192;
const DEFAULT_MAX_READ_BYTES = 1_048_576; // 1 MB
const TRACER_NAME = 'codegraph.source-files';

// Detect binary by scanning for null bytes in the first chunk.
function hasBinaryBytes(buf: Buffer, len: number): boolean {
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0x00) return true;
  }
  return false;
}

// Root boundary is always enforced. There is no unsafe-by-default path.
function assertInsideRoot(root: string, absPath: string): void {
  if (!isPathInside(root, absPath)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_TRAVERSAL_DENIED,
      category: 'authz',
      title: 'Path is outside the permitted root',
      clientDetail: 'The requested path is not within the configured scan root',
    });
  }
}

/**
 * Detects whether the file at absPath is text, binary, or unknown.
 * `root` is required and enforced: paths outside root throw SOURCE_FILES_TRAVERSAL_DENIED.
 * Missing or non-string root throws SOURCE_FILES_ROOT_INVALID (prevents raw TypeError at runtime).
 */
export async function detectFileKind(
  absPath: string,
  root: string,
): Promise<SourceFileKind> {
  if (typeof root !== 'string' || !root) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Root path is required for detectFileKind',
      clientDetail: 'root must be a non-empty string',
    });
  }
  assertInsideRoot(root, absPath);

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.source_files.detect', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OPERATION]: 'detect' },
  });

  let fh;
  try {
    fh = await open(absPath, 'r');
    const buf = Buffer.allocUnsafe(BINARY_DETECTION_BYTES);
    const { bytesRead } = await fh.read(buf, 0, BINARY_DETECTION_BYTES, 0);
    const kind: SourceFileKind = hasBinaryBytes(buf, bytesRead) ? 'binary' : 'text';
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_FILE_KIND, kind);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    return kind;
  } catch (cause) {
    if (cause instanceof AppError) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_ERROR_CODE, cause.code);
      span.setStatus({ code: SpanStatusCode.ERROR, message: cause.code });
      span.end();
      throw cause;
    }
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
    return 'unknown';
  } finally {
    await fh?.close().catch(() => {});
  }
}

/**
 * Reads up to opts.maxBytes bytes from absPath as text.
 * opts.root is required and enforced: paths outside root throw SOURCE_FILES_TRAVERSAL_DENIED.
 * Missing opts or non-string root throws SOURCE_FILES_ROOT_INVALID (prevents raw TypeError at runtime).
 */
export async function readBoundedTextFile(
  absPath: string,
  opts: ReadOptions,
): Promise<BoundedReadResult> {
  if (opts === undefined || opts === null || typeof opts !== 'object' || Array.isArray(opts)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Root path is required for readBoundedTextFile',
      clientDetail: 'opts.root must be a non-empty string',
    });
  }
  // Reject accessor descriptors on opts fields — a getter on opts.maxBytes could return
  // a valid value during validation and Infinity during Buffer.allocUnsafe.
  for (const key of Object.getOwnPropertyNames(opts)) {
    const desc = Object.getOwnPropertyDescriptor(opts, key);
    if (desc && ('get' in desc || 'set' in desc)) {
      throw new AppError({
        code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
        category: 'validation',
        title: 'readBoundedTextFile opts has an accessor descriptor',
        clientDetail: 'opts fields must be plain data values, not getters or setters',
      });
    }
  }
  // Read each field from own data properties only. Bracket notation traverses the prototype
  // chain and would silently accept inherited values; getOwnPropertyDescriptor does not.
  const rawRoot = Object.getOwnPropertyDescriptor(opts, 'root')?.value;
  const rawMaxBytes = Object.getOwnPropertyDescriptor(opts, 'maxBytes')?.value;

  if (typeof rawRoot !== 'string' || !rawRoot) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Root path is required for readBoundedTextFile',
      clientDetail: 'opts.root must be a non-empty string',
    });
  }
  if (rawMaxBytes !== undefined) {
    if (
      typeof rawMaxBytes !== 'number' ||
      !Number.isSafeInteger(rawMaxBytes as number) ||
      (rawMaxBytes as number) < 1 ||
      (rawMaxBytes as number) > MAX_READ_BYTES
    ) {
      throw new AppError({
        code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
        category: 'validation',
        title: 'readBoundedTextFile opts.maxBytes is invalid',
        clientDetail: 'opts.maxBytes must be a positive safe integer within the allowed range',
      });
    }
  }
  assertInsideRoot(rawRoot, absPath);

  const maxBytes = (rawMaxBytes as number | undefined) ?? DEFAULT_MAX_READ_BYTES;
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.source_files.read', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OPERATION]: 'read' },
  });

  let fh;
  try {
    fh = await open(absPath, 'r');

    // Check for binary content first
    const detectBuf = Buffer.allocUnsafe(Math.min(BINARY_DETECTION_BYTES, maxBytes));
    const { bytesRead: detectRead } = await fh.read(detectBuf, 0, detectBuf.length, 0);
    if (hasBinaryBytes(detectBuf, detectRead)) {
      throw new AppError({
        code: ERROR_CODES.SOURCE_FILES_BINARY_FILE,
        category: 'validation',
        title: 'File is binary and cannot be read as text',
        clientDetail: 'Use detectFileKind to check the file type before reading',
      });
    }

    // Read up to maxBytes
    const readBuf = Buffer.allocUnsafe(maxBytes);
    const { bytesRead } = await fh.read(readBuf, 0, maxBytes, 0);

    // Check if there's more data
    let truncated = false;
    if (bytesRead === maxBytes) {
      const checkBuf = Buffer.allocUnsafe(1);
      const { bytesRead: extra } = await fh.read(checkBuf, 0, 1, maxBytes);
      truncated = extra > 0;
    }

    const fileStat = await fh.stat();
    const content = readBuf.subarray(0, bytesRead).toString('utf8');

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    return { content, truncated, sizeBytes: fileStat.size };
  } catch (cause) {
    if (cause instanceof AppError) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_ERROR_CODE, cause.code);
      span.setStatus({ code: SpanStatusCode.ERROR, message: cause.code });
      span.end();
      throw cause;
    }
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_READ_FAILED,
      category: 'internal',
      title: 'File could not be read',
      clientDetail: 'The file could not be opened or read',
      cause,
    });
  } finally {
    await fh?.close().catch(() => {});
  }
}
