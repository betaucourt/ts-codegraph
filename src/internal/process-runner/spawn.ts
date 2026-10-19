import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { AppError } from '../errors/index.js';
import { ERROR_CODES } from './generated/process-runner-entities.js';
import { buildProcessEnv } from './policy.js';
import type { ProcessCommandSnapshot, ProcessRunnerPolicySnapshot } from './policy.js';
import type { ProcessResult } from './types.js';

const DEFAULT_MAX_OUTPUT_BYTES = 1_048_576; // 1 MB per stream
// Grace period after SIGTERM before sending SIGKILL.
const SIGKILL_GRACE_MS = 2_000;

// On POSIX systems, spawn with detached:true so the child becomes the leader of a
// new process group. Killing -pid then kills the child AND all its descendants.
// On Windows, detached:true creates a new console window so we fall back to
// child.kill() which only targets the immediate child.
const POSIX = process.platform !== 'win32';

/**
 * Returns the largest byte count n such that:
 *   n <= maxBytes  AND  buf[0..n) is valid UTF-8 (no incomplete sequence at the end).
 *
 * Handles both:
 * - Per-chunk truncation: buf.length > maxBytes → clamp and find boundary
 * - Cross-chunk partial tail: buf.length <= maxBytes but ends mid-sequence
 */
function utf8ValidBoundary(buf: Buffer, maxBytes: number): number {
  const limit = Math.min(buf.length, maxBytes);
  if (limit === 0) return 0;

  // Find the start of the last character at position limit-1 by walking back
  // over any continuation bytes (10xxxxxx = 0x80..0xBF).
  let charStart = limit - 1;
  while (charStart > 0 && ((buf[charStart] as number) & 0xc0) === 0x80) {
    charStart--;
  }

  const b = buf[charStart] as number;
  if (b < 0x80) {
    // ASCII single-byte character — always complete within any limit
    return limit;
  }

  // Multi-byte start byte: determine expected sequence length
  const seqLen =
    (b & 0xf8) === 0xf0 ? 4 :
    (b & 0xf0) === 0xe0 ? 3 :
    (b & 0xe0) === 0xc0 ? 2 : 1;

  if (charStart + seqLen <= limit) {
    // The full sequence is present within the limit — no truncation needed
    return limit;
  }

  // The sequence starting at charStart is incomplete — exclude it entirely
  return charStart;
}

export async function spawnProcess(
  commandSnap: ProcessCommandSnapshot,
  policySnap: ProcessRunnerPolicySnapshot,
): Promise<ProcessResult> {
  const startMs = Date.now();
  const maxBytes = policySnap.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  const timeout = commandSnap.timeout ?? policySnap.defaultTimeoutMs;
  const env = buildProcessEnv(commandSnap.env, policySnap.allowedEnvKeys);

  let timedOut = false;
  let cancelled = false;
  let settled = false;

  // Buffer-based output accumulation with byte-accurate limits.
  const stdoutChunks: Buffer[] = [];
  let stdoutBytes = 0;
  const stderrChunks: Buffer[] = [];
  let stderrBytes = 0;
  const truncatedStdoutRef = { value: false };
  const truncatedStderrRef = { value: false };

  function accumulateChunk(
    chunk: Buffer | string,
    chunks: Buffer[],
    bytesRef: { value: number; },
    truncatedRef: { value: boolean },
  ): void {
    if (truncatedRef.value) return;
    const buf: Buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8');
    const remaining = maxBytes - bytesRef.value;
    if (buf.length > remaining) {
      const safeEnd = utf8ValidBoundary(buf, remaining);
      if (safeEnd > 0) chunks.push(buf.subarray(0, safeEnd));
      bytesRef.value += safeEnd;
      truncatedRef.value = true;
    } else {
      chunks.push(buf);
      bytesRef.value += buf.length;
    }
  }

  const stdoutBytesRef = { value: 0 };
  const stderrBytesRef = { value: 0 };

  return new Promise<ProcessResult>((resolve, reject) => {
    let child: ChildProcess;
    try {
      // Use detached:true on POSIX so the child leads its own process group.
      // This allows `process.kill(-child.pid, signal)` to reach all descendants.
      child = spawn(commandSnap.executable, commandSnap.args ? [...commandSnap.args] : [], {
        shell: false,
        cwd: commandSnap.cwd,
        env,
        detached: POSIX,
        stdio: commandSnap.stdin !== undefined ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
      });
    } catch (cause) {
      reject(
        new AppError({
          code: ERROR_CODES.PROCESS_SPAWN_FAILED,
          category: 'internal',
          title: 'Process could not be started',
          clientDetail: 'The subprocess could not be spawned',
          cause,
        }),
      );
      return;
    }

    let sigkillTimer: ReturnType<typeof setTimeout> | undefined;

    function killGroup(signal: 'SIGTERM' | 'SIGKILL'): void {
      if (POSIX && child.pid !== undefined) {
        try { process.kill(-child.pid, signal); } catch { try { child.kill(signal); } catch {} }
      } else {
        try { child.kill(signal); } catch {}
      }
    }

    function killProcess(reason: 'timeout' | 'cancelled'): void {
      if (reason === 'timeout') timedOut = true;
      else cancelled = true;

      killGroup('SIGTERM');

      // Grace period: escalate to SIGKILL if process survives SIGTERM
      sigkillTimer = setTimeout(() => {
        if (!settled) killGroup('SIGKILL');
      }, SIGKILL_GRACE_MS);
    }

    const timeoutId =
      timeout !== undefined
        ? setTimeout(() => killProcess('timeout'), timeout)
        : undefined;

    let externalAbortHandler: (() => void) | undefined;
    if (commandSnap.signal) {
      externalAbortHandler = () => killProcess('cancelled');
      commandSnap.signal.addEventListener('abort', externalAbortHandler, { once: true });
    }

    function cleanup(): void {
      settled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (sigkillTimer !== undefined) clearTimeout(sigkillTimer);
      if (commandSnap.signal && externalAbortHandler) {
        commandSnap.signal.removeEventListener('abort', externalAbortHandler);
      }
    }

    child.stdout?.on('data', (chunk: Buffer | string) => {
      accumulateChunk(chunk, stdoutChunks, stdoutBytesRef, truncatedStdoutRef);
    });

    child.stderr?.on('data', (chunk: Buffer | string) => {
      accumulateChunk(chunk, stderrChunks, stderrBytesRef, truncatedStderrRef);
    });

    if (commandSnap.stdin !== undefined && child.stdin) {
      child.stdin.write(commandSnap.stdin);
      child.stdin.end();
    }

    child.on('error', (err: NodeJS.ErrnoException) => {
      if (timedOut || cancelled) return; // kill triggered — let 'close' resolve
      cleanup();
      reject(
        new AppError({
          code: ERROR_CODES.PROCESS_SPAWN_FAILED,
          category: 'internal',
          title: 'Process execution failed',
          clientDetail: 'The subprocess encountered an error during execution',
          cause: err,
        }),
      );
    });

    child.on('close', (code) => {
      cleanup();
      const durationMs = Date.now() - startMs;
      const exitCode = code ?? -1;

      // Apply a final UTF-8 boundary check on the concatenated buffer.
      // This catches cross-chunk partial sequences where an incomplete leading byte
      // arrived in one chunk and its continuation bytes in the next, causing the
      // accumulated buffer to end with a partial sequence even though each chunk
      // individually passed the per-chunk accumulateChunk boundary check.
      const rawStdout = Buffer.concat(stdoutChunks);
      const rawStderr = Buffer.concat(stderrChunks);
      const stdoutBound = utf8ValidBoundary(rawStdout, rawStdout.length);
      const stderrBound = utf8ValidBoundary(rawStderr, rawStderr.length);

      const stdout = rawStdout.subarray(0, stdoutBound).toString('utf8');
      const stderr = rawStderr.subarray(0, stderrBound).toString('utf8');
      const truncatedStdout = truncatedStdoutRef.value || stdoutBound < rawStdout.length;
      const truncatedStderr = truncatedStderrRef.value || stderrBound < rawStderr.length;

      resolve({
        exitCode,
        stdout,
        stderr,
        truncatedStdout,
        truncatedStderr,
        timedOut,
        cancelled,
        durationMs,
      });
    });
  });
}
