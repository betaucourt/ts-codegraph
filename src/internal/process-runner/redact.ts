import type { ProcessResult } from './types.js';

/**
 * Returns a diagnostic-safe copy of the result with stdout and stderr replaced
 * by byte-count summaries using UTF-8 byte length (not character count).
 * Never log or emit telemetry with the raw result.
 */
export function redactProcessResult(result: ProcessResult): ProcessResult {
  const stdoutBytes = Buffer.byteLength(result.stdout, 'utf8');
  const stderrBytes = Buffer.byteLength(result.stderr, 'utf8');
  return {
    ...result,
    stdout: `[stdout: ${stdoutBytes} bytes${result.truncatedStdout ? ', truncated' : ''}]`,
    stderr: `[stderr: ${stderrBytes} bytes${result.truncatedStderr ? ', truncated' : ''}]`,
  };
}
