import { AppError } from '../errors/index.js';
import { getTracer, getMeter, SpanStatusCode } from '../telemetry/index.js';
import type { Meter } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/process-runner-entities.js';
import {
  executableLabel,
  snapshotAndValidateProcessRunnerPolicy,
  snapshotAndValidateProcessCommand,
} from './policy.js';
import type { ProcessRunnerPolicySnapshot, ProcessCommandSnapshot } from './policy.js';
import { spawnProcess } from './spawn.js';
import type { ProcessCommand, ProcessResult, ProcessRunner, ProcessRunnerPolicy } from './types.js';

const TRACER_NAME = 'codegraph.process-runner';
const METER_NAME = 'codegraph.process-runner';
const SPAN_RUN = 'codegraph.process_runner.run';

const METRIC_DURATION_MS = 'codegraph.process_runner.duration_ms';
const METRIC_TIMEOUT_COUNT = 'codegraph.process_runner.timeout_count';
const METRIC_CANCELLATION_COUNT = 'codegraph.process_runner.cancellation_count';
const METRIC_EXIT_CODE_COUNT = 'codegraph.process_runner.exit_code_count';
const METRIC_INVALID_JSON_COUNT = 'codegraph.process_runner.invalid_json_count';

function getProcessMeter(): Meter {
  return getMeter(METER_NAME);
}

function timeoutCategory(timeout: number | undefined, timedOut: boolean): string {
  if (timedOut) return 'timed_out';
  if (timeout === undefined) return 'none';
  if (timeout <= 5_000) return 'short';
  if (timeout <= 30_000) return 'medium';
  return 'long';
}

function exitCodeCategory(exitCode: number, timedOut: boolean, cancelled: boolean): string {
  if (timedOut) return 'timed_out';
  if (cancelled) return 'cancelled';
  if (exitCode === 0) return 'success';
  return 'non_zero';
}

async function executeWithTelemetry(
  commandSnap: ProcessCommandSnapshot,
  policySnap: ProcessRunnerPolicySnapshot,
): Promise<ProcessResult> {
  const label = executableLabel(commandSnap.executable);
  const timeout = commandSnap.timeout ?? policySnap.defaultTimeoutMs;
  const meter = getProcessMeter();

  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan(SPAN_RUN, {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_EXECUTABLE_LABEL]: label,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_POLICY_NAME]: policySnap.name,
    },
  });

  let result: ProcessResult;
  try {
    result = await spawnProcess(commandSnap, policySnap);
  } catch (err) {
    const appErr = err instanceof AppError ? err : new AppError({
      code: ERROR_CODES.PROCESS_SPAWN_FAILED,
      category: 'internal',
      title: 'Process could not be started',
      clientDetail: 'The subprocess could not be spawned',
      cause: err,
    });
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_ERROR_CODE, appErr.code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_EXIT_CODE_CATEGORY, 'spawn_failed');
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_TIMEOUT_CATEGORY, timeoutCategory(timeout, false));
    span.setStatus({ code: SpanStatusCode.ERROR, message: appErr.code });
    span.end();
    throw appErr;
  }

  const toCat = timeoutCategory(timeout, result.timedOut);
  const exitCat = exitCodeCategory(result.exitCode, result.timedOut, result.cancelled);
  const commonAttrs = {
    [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_EXECUTABLE_LABEL]: label,
    [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_POLICY_NAME]: policySnap.name,
  };

  span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_TIMEOUT_CATEGORY, toCat);
  span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_EXIT_CODE_CATEGORY, exitCat);

  meter.createHistogram(METRIC_DURATION_MS, { unit: 'ms' }).record(result.durationMs, commonAttrs);

  if (result.timedOut) {
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_ERROR_CODE, ERROR_CODES.PROCESS_TIMEOUT);
    span.setStatus({ code: SpanStatusCode.ERROR, message: ERROR_CODES.PROCESS_TIMEOUT });
    span.end();
    meter.createCounter(METRIC_TIMEOUT_COUNT).add(1, commonAttrs);

    if (policySnap.failOnNonZeroExit !== false) {
      throw new AppError({
        code: ERROR_CODES.PROCESS_TIMEOUT,
        category: 'timeout',
        title: 'Process exceeded the configured time limit',
        clientDetail: 'The process was killed because it exceeded the timeout',
      });
    }
    return result;
  }

  if (result.cancelled) {
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_ERROR_CODE, ERROR_CODES.PROCESS_CANCELLED);
    span.setStatus({ code: SpanStatusCode.ERROR, message: ERROR_CODES.PROCESS_CANCELLED });
    span.end();
    meter.createCounter(METRIC_CANCELLATION_COUNT).add(1, commonAttrs);
    return result;
  }

  meter.createCounter(METRIC_EXIT_CODE_COUNT).add(1, {
    ...commonAttrs,
    [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_EXIT_CODE_CATEGORY]: exitCat,
  });

  if (result.exitCode !== 0) {
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_ERROR_CODE, ERROR_CODES.PROCESS_NON_ZERO_EXIT);
    if (policySnap.failOnNonZeroExit !== false) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: ERROR_CODES.PROCESS_NON_ZERO_EXIT });
      span.end();
      throw new AppError({
        code: ERROR_CODES.PROCESS_NON_ZERO_EXIT,
        category: 'internal',
        title: 'Process exited with a non-zero exit code',
        clientDetail: 'The subprocess returned a non-zero exit code',
      });
    }
    span.setStatus({ code: SpanStatusCode.ERROR, message: ERROR_CODES.PROCESS_NON_ZERO_EXIT });
    span.end();
    return result;
  }

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
  return result;
}

export async function runProcess(
  command: ProcessCommand,
  policy: ProcessRunnerPolicy,
): Promise<ProcessResult> {
  const policySnap = snapshotAndValidateProcessRunnerPolicy(policy);
  const commandSnap = snapshotAndValidateProcessCommand(command, policySnap);
  return executeWithTelemetry(commandSnap, policySnap);
}

export async function runProcessJson<T>(
  command: ProcessCommand,
  policy: ProcessRunnerPolicy,
): Promise<T> {
  const policySnap = snapshotAndValidateProcessRunnerPolicy(policy);
  const commandSnap = snapshotAndValidateProcessCommand(command, policySnap);
  const result = await executeWithTelemetry(commandSnap, policySnap);
  try {
    return JSON.parse(result.stdout) as T;
  } catch (cause) {
    const meter = getProcessMeter();
    meter.createCounter(METRIC_INVALID_JSON_COUNT).add(1, {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_POLICY_NAME]: policySnap.name,
    });
    const tracer = getTracer(TRACER_NAME);
    const jsonSpan = tracer.startSpan('codegraph.process_runner.json_parse');
    jsonSpan.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_ERROR_CODE, ERROR_CODES.PROCESS_INVALID_JSON);
    jsonSpan.setStatus({ code: SpanStatusCode.ERROR, message: ERROR_CODES.PROCESS_INVALID_JSON });
    jsonSpan.end();

    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_JSON,
      category: 'validation',
      title: 'Process output could not be parsed as JSON',
      clientDetail: 'The subprocess did not produce valid JSON output',
      cause,
    });
  }
}

export function createProcessRunner(policy: ProcessRunnerPolicy): ProcessRunner {
  // Snapshot policy eagerly — all subsequent runner.run/runJson calls use the frozen snapshot,
  // so post-creation mutation of the original policy object cannot affect behavior.
  const policySnap = snapshotAndValidateProcessRunnerPolicy(policy);
  return {
    run(command: ProcessCommand): Promise<ProcessResult> {
      const commandSnap = snapshotAndValidateProcessCommand(command, policySnap);
      return executeWithTelemetry(commandSnap, policySnap);
    },
    runJson<T>(command: ProcessCommand): Promise<T> {
      const commandSnap = snapshotAndValidateProcessCommand(command, policySnap);
      return executeWithTelemetryJson<T>(commandSnap, policySnap);
    },
  };
}

// Separated JSON variant so the generic type param is inferred correctly per call.
async function executeWithTelemetryJson<T>(
  commandSnap: ProcessCommandSnapshot,
  policySnap: ProcessRunnerPolicySnapshot,
): Promise<T> {
  const result = await executeWithTelemetry(commandSnap, policySnap);
  try {
    return JSON.parse(result.stdout) as T;
  } catch (cause) {
    const meter = getProcessMeter();
    meter.createCounter(METRIC_INVALID_JSON_COUNT).add(1, {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_POLICY_NAME]: policySnap.name,
    });
    const tracer = getTracer(TRACER_NAME);
    const jsonSpan = tracer.startSpan('codegraph.process_runner.json_parse');
    jsonSpan.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_PROCESS_RUNNER_ERROR_CODE, ERROR_CODES.PROCESS_INVALID_JSON);
    jsonSpan.setStatus({ code: SpanStatusCode.ERROR, message: ERROR_CODES.PROCESS_INVALID_JSON });
    jsonSpan.end();

    throw new AppError({
      code: ERROR_CODES.PROCESS_INVALID_JSON,
      category: 'validation',
      title: 'Process output could not be parsed as JSON',
      clientDetail: 'The subprocess did not produce valid JSON output',
      cause,
    });
  }
}
