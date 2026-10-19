import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { AppError } from '../errors/index.js';
import { isPathInside } from '../security/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/source-files-entities.js';

const TRACER_NAME = 'codegraph.source-files';

/**
 * Computes the SHA-256 hex digest of the file at absPath.
 * `root` is required and enforced: paths outside root throw SOURCE_FILES_TRAVERSAL_DENIED.
 * Missing or non-string root throws SOURCE_FILES_ROOT_INVALID (prevents raw TypeError at runtime).
 */
export async function hashFileContent(absPath: string, root: string): Promise<string> {
  if (typeof root !== 'string' || !root) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_ROOT_INVALID,
      category: 'validation',
      title: 'Root path is required for hashFileContent',
      clientDetail: 'root must be a non-empty string',
    });
  }
  if (!isPathInside(root, absPath)) {
    throw new AppError({
      code: ERROR_CODES.SOURCE_FILES_TRAVERSAL_DENIED,
      category: 'authz',
      title: 'Path is outside the permitted root',
      clientDetail: 'The requested path is not within the configured scan root',
    });
  }

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.source_files.hash', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OPERATION]: 'hash' },
  });

  return new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(absPath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'success');
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      resolve(hash.digest('hex'));
    });
    stream.on('error', (cause) => {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_OUTCOME, 'error');
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_SOURCE_FILES_ERROR_CODE, ERROR_CODES.SOURCE_FILES_READ_FAILED);
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.end();
      reject(
        new AppError({
          code: ERROR_CODES.SOURCE_FILES_READ_FAILED,
          category: 'internal',
          title: 'File could not be read for hashing',
          clientDetail: 'The file could not be opened or read',
          cause,
        }),
      );
    });
  });
}
