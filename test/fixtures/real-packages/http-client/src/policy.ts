import { AppError } from '@codegraph/errors';
import { ERROR_CODES } from './generated/http-client-entities.js';
import type { HttpClientPolicy, HttpClientRetryPolicy } from './types.js';

// Maximum length for strings in allowedHosts / allowedContentTypes.
// 253 = maximum total hostname length per RFC 1035; 63 = max per label.
const MAX_ALLOWED_STRING_LEN = 253;

// Valid DNS label: starts/ends with alphanumeric, may contain hyphens in the middle.
// Handles single-char labels (the `(...)?` part is optional).
const LABEL_RE = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;

/**
 * Minimum value accepted for `timeoutMs` and `retry.initialDelayMs`.
 * 1 ms is the smallest meaningful timer resolution.
 */
export const MIN_TIMEOUT_MS = 1;

/**
 * Maximum value accepted for `timeoutMs` and `retry.initialDelayMs`.
 * 300 000 ms (5 minutes) is the highest value that AbortSignal.timeout() will
 * reliably schedule without platform timer-overflow warnings (safe well inside
 * the 32-bit signed-integer ceiling of ~2 147 483 647 ms used by most runtimes).
 */
export const MAX_TIMEOUT_MS = 300_000;

/** Minimum accepted value for `retry.maxAttempts` (at least one attempt). */
export const MIN_RETRY_ATTEMPTS = 1;

/** Maximum accepted value for `retry.maxAttempts`. */
export const MAX_RETRY_ATTEMPTS = 10;

/** Minimum accepted value for `maxRedirects` (zero disables redirect following). */
export const MIN_REDIRECTS = 0;

/** Maximum accepted value for `maxRedirects`. */
export const MAX_REDIRECTS = 10;

const DEFAULT_RETRY: Readonly<HttpClientRetryPolicy> = Object.freeze({
  maxAttempts: 3,
  initialDelayMs: 100,
  backoffFactor: 2,
});

export const DEFAULT_POLICY: Readonly<HttpClientPolicy> = Object.freeze({
  allowPrivate: false,
  timeoutMs: 10_000,
  maxBodyBytes: 1_048_576,
  maxRedirects: 3,
  retry: DEFAULT_RETRY,
  traceHeaders: true,
});

// ── Descriptor-safe field reader ──────────────────────────────────────────────

/**
 * Read a single own property from `obj` using `Object.getOwnPropertyDescriptor`.
 * Throws `HTTP_INVALID_POLICY` if the property is an accessor (getter/setter) —
 * accessors are a TOCTOU risk because the getter may return different values on
 * successive reads, bypassing validate-then-use assumptions.
 *
 * Returns `undefined` when the property is absent (i.e. the caller should fall
 * back to a default).
 */
function readOwnField(obj: object, key: string, context: string): unknown {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  if (desc === undefined) return undefined;
  if (desc.get !== undefined || desc.set !== undefined) {
    policyError(`Policy '${context}' must be a plain data property, not a getter or setter`);
  }
  return desc.value as unknown;
}

// ── Single-pass snapshot / validate / resolve ─────────────────────────────────

/**
 * Snapshot, validate, and resolve a caller-supplied policy object in a single pass.
 *
 * Every field is read exactly once from its property descriptor so that accessor
 * descriptors (getters/setters) are detected and rejected before any value is used
 * in validation or in the resolved policy.  The same snapped values are both
 * validated and written into the returned frozen policy — there is no second read
 * from the caller object.
 *
 * Passing `undefined` (no policy argument) returns a fully-defaults frozen policy.
 */
export function snapshotAndResolvePolicy(raw: unknown): HttpClientPolicy {
  if (raw === undefined) {
    return Object.freeze({
      allowPrivate: DEFAULT_POLICY.allowPrivate,
      timeoutMs: DEFAULT_POLICY.timeoutMs,
      maxBodyBytes: DEFAULT_POLICY.maxBodyBytes,
      maxRedirects: DEFAULT_POLICY.maxRedirects,
      retry: Object.freeze({
        maxAttempts: DEFAULT_RETRY.maxAttempts,
        initialDelayMs: DEFAULT_RETRY.initialDelayMs,
        backoffFactor: DEFAULT_RETRY.backoffFactor,
      }) as HttpClientRetryPolicy,
      traceHeaders: DEFAULT_POLICY.traceHeaders,
    }) as HttpClientPolicy;
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    policyError('Policy must be a non-null object');
  }

  const obj = raw as object;

  // ── Snapshot top-level fields (one descriptor read each) ──────────────────
  const allowPrivate = readOwnField(obj, 'allowPrivate', 'allowPrivate');
  const traceHeaders = readOwnField(obj, 'traceHeaders', 'traceHeaders');
  const timeoutMs = readOwnField(obj, 'timeoutMs', 'timeoutMs');
  const maxBodyBytes = readOwnField(obj, 'maxBodyBytes', 'maxBodyBytes');
  const maxRedirects = readOwnField(obj, 'maxRedirects', 'maxRedirects');
  const retryRaw = readOwnField(obj, 'retry', 'retry');
  const allowedHostsRaw = readOwnField(obj, 'allowedHosts', 'allowedHosts');
  const allowedContentTypesRaw = readOwnField(obj, 'allowedContentTypes', 'allowedContentTypes');

  // ── Validate from the snapped values ──────────────────────────────────────
  if (allowPrivate !== undefined && typeof allowPrivate !== 'boolean') {
    policyError('Policy allowPrivate must be a boolean');
  }
  if (traceHeaders !== undefined && typeof traceHeaders !== 'boolean') {
    policyError('Policy traceHeaders must be a boolean');
  }
  if (timeoutMs !== undefined) {
    if (
      typeof timeoutMs !== 'number' ||
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < MIN_TIMEOUT_MS ||
      timeoutMs > MAX_TIMEOUT_MS
    ) {
      policyError(
        `Policy timeoutMs must be a safe integer between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS} milliseconds`,
      );
    }
  }
  if (maxBodyBytes !== undefined) {
    if (
      typeof maxBodyBytes !== 'number' ||
      !Number.isSafeInteger(maxBodyBytes) ||
      maxBodyBytes < 1
    ) {
      policyError('Policy maxBodyBytes must be a positive safe integer');
    }
  }
  if (maxRedirects !== undefined) {
    if (
      typeof maxRedirects !== 'number' ||
      !Number.isSafeInteger(maxRedirects) ||
      maxRedirects < MIN_REDIRECTS ||
      maxRedirects > MAX_REDIRECTS
    ) {
      policyError(
        `Policy maxRedirects must be a safe integer between ${MIN_REDIRECTS} and ${MAX_REDIRECTS}`,
      );
    }
  }

  // ── Retry sub-object: snapshot then validate ───────────────────────────────
  let resolvedRetry: Readonly<HttpClientRetryPolicy>;
  if (retryRaw !== undefined) {
    if (!retryRaw || typeof retryRaw !== 'object' || Array.isArray(retryRaw)) {
      policyError('Policy retry must be a non-null object');
    }
    const retryObj = retryRaw as object;
    const maxAttempts = readOwnField(retryObj, 'maxAttempts', 'retry.maxAttempts');
    const initialDelayMs = readOwnField(retryObj, 'initialDelayMs', 'retry.initialDelayMs');
    const backoffFactor = readOwnField(retryObj, 'backoffFactor', 'retry.backoffFactor');

    if (maxAttempts !== undefined) {
      if (
        typeof maxAttempts !== 'number' ||
        !Number.isSafeInteger(maxAttempts) ||
        maxAttempts < MIN_RETRY_ATTEMPTS ||
        maxAttempts > MAX_RETRY_ATTEMPTS
      ) {
        policyError(
          `Policy retry.maxAttempts must be a safe integer between ${MIN_RETRY_ATTEMPTS} and ${MAX_RETRY_ATTEMPTS}`,
        );
      }
    }
    if (initialDelayMs !== undefined) {
      if (
        typeof initialDelayMs !== 'number' ||
        !Number.isSafeInteger(initialDelayMs) ||
        initialDelayMs < 0 ||
        initialDelayMs > MAX_TIMEOUT_MS
      ) {
        policyError(
          `Policy retry.initialDelayMs must be a non-negative safe integer up to ${MAX_TIMEOUT_MS} milliseconds`,
        );
      }
    }
    if (backoffFactor !== undefined) {
      if (typeof backoffFactor !== 'number' || !Number.isFinite(backoffFactor) || backoffFactor < 1) {
        policyError('Policy retry.backoffFactor must be a finite number >= 1');
      }
    }

    // Build from the same snapped values — no second read from the caller object.
    resolvedRetry = Object.freeze({
      maxAttempts: (maxAttempts as number | undefined) ?? DEFAULT_RETRY.maxAttempts,
      initialDelayMs: (initialDelayMs as number | undefined) ?? DEFAULT_RETRY.initialDelayMs,
      backoffFactor: (backoffFactor as number | undefined) ?? DEFAULT_RETRY.backoffFactor,
    }) as HttpClientRetryPolicy;
  } else {
    resolvedRetry = Object.freeze({
      maxAttempts: DEFAULT_RETRY.maxAttempts,
      initialDelayMs: DEFAULT_RETRY.initialDelayMs,
      backoffFactor: DEFAULT_RETRY.backoffFactor,
    }) as HttpClientRetryPolicy;
  }

  // ── allowedHosts: snapshot each element via descriptor ─────────────────────
  let resolvedHosts: readonly string[] | undefined;
  if (allowedHostsRaw !== undefined) {
    if (!Array.isArray(allowedHostsRaw)) {
      policyError('Policy allowedHosts must be an array of strings');
    }
    const arr = allowedHostsRaw as unknown[];
    const hosts: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      const elemDesc = Object.getOwnPropertyDescriptor(arr, i);
      if (elemDesc === undefined || elemDesc.get !== undefined || elemDesc.set !== undefined) {
        policyError(
          'Policy allowedHosts array must not contain getter or setter elements',
        );
      }
      const item = elemDesc.value as unknown;
      if (typeof item !== 'string') {
        policyError('Policy allowedHosts items must be strings');
      }
      if (item.length === 0) {
        policyError('Policy allowedHosts items must not be empty');
      }
      if (item.length > MAX_ALLOWED_STRING_LEN) {
        policyError(
          `Policy allowedHosts items must not exceed ${MAX_ALLOWED_STRING_LEN} characters`,
        );
      }
      if (/[\x00-\x1f\x7f]/.test(item)) {
        policyError('Policy allowedHosts items must not contain control characters');
      }
      validateAllowedHostSyntax(item);
      hosts.push(item);
    }
    resolvedHosts = Object.freeze(hosts);
  }

  // ── allowedContentTypes: snapshot each element via descriptor ──────────────
  let resolvedContentTypes: readonly string[] | undefined;
  if (allowedContentTypesRaw !== undefined) {
    if (!Array.isArray(allowedContentTypesRaw)) {
      policyError('Policy allowedContentTypes must be an array of strings');
    }
    const arr = allowedContentTypesRaw as unknown[];
    const types: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      const elemDesc = Object.getOwnPropertyDescriptor(arr, i);
      if (elemDesc === undefined || elemDesc.get !== undefined || elemDesc.set !== undefined) {
        policyError(
          'Policy allowedContentTypes array must not contain getter or setter elements',
        );
      }
      const item = elemDesc.value as unknown;
      if (typeof item !== 'string') {
        policyError('Policy allowedContentTypes items must be strings');
      }
      if (item.length === 0) {
        policyError('Policy allowedContentTypes items must not be empty');
      }
      if (item.length > MAX_ALLOWED_STRING_LEN) {
        policyError(
          `Policy allowedContentTypes items must not exceed ${MAX_ALLOWED_STRING_LEN} characters`,
        );
      }
      if (/[\x00-\x1f\x7f]/.test(item)) {
        policyError('Policy allowedContentTypes items must not contain control characters');
      }
      types.push(item);
    }
    resolvedContentTypes = Object.freeze(types);
  }

  // ── Assemble from snapped values; never re-read caller object ─────────────
  const policyObj: {
    allowPrivate: boolean;
    timeoutMs: number;
    maxBodyBytes: number;
    maxRedirects: number;
    retry: Readonly<HttpClientRetryPolicy>;
    traceHeaders: boolean;
    allowedHosts?: readonly string[];
    allowedContentTypes?: readonly string[];
  } = {
    allowPrivate: (allowPrivate as boolean | undefined) ?? DEFAULT_POLICY.allowPrivate,
    timeoutMs: (timeoutMs as number | undefined) ?? DEFAULT_POLICY.timeoutMs,
    maxBodyBytes: (maxBodyBytes as number | undefined) ?? DEFAULT_POLICY.maxBodyBytes,
    maxRedirects: (maxRedirects as number | undefined) ?? DEFAULT_POLICY.maxRedirects,
    retry: resolvedRetry,
    traceHeaders: (traceHeaders as boolean | undefined) ?? DEFAULT_POLICY.traceHeaders,
  };

  if (resolvedHosts !== undefined) {
    policyObj.allowedHosts = resolvedHosts;
  }
  if (resolvedContentTypes !== undefined) {
    policyObj.allowedContentTypes = resolvedContentTypes;
  }

  return Object.freeze(policyObj) as HttpClientPolicy;
}

/**
 * Public standalone policy validator.  Throws `HTTP_INVALID_POLICY` if `raw`
 * is not a valid policy object.  Uses the same descriptor-based snapshot logic
 * as `createHttpClient` internally.
 */
export function validateHttpClientPolicy(raw: unknown): void {
  // Explicitly reject undefined — the standalone validator expects a concrete object.
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    policyError('Policy must be a non-null object');
  }
  snapshotAndResolvePolicy(raw);
}

/**
 * Strict allowedHosts hostname syntax validation.
 *
 * Rejects:
 *  - Schemes ("http://example.com"), ports ("example.com:8080"), paths ("/"), queries, fragments
 *  - Credentials ("user@example.com")
 *  - Wildcards ("*.example.com")
 *  - Single-label names that would act as TLD catch-alls ("com", "net")
 *  - Empty labels, leading/trailing dots, double dots
 *  - Invalid label characters (non-alphanumeric, non-hyphen; hyphens not at start/end)
 *  - IPv4-like entries (all-numeric last label)
 *
 * Allows: "example.com", "api.example.com", "my-service.example.co.uk"
 */
function validateAllowedHostSyntax(host: string): void {
  // Reject scheme, port, path, query, fragment, credentials, and wildcards.
  if (/[:/\\?#@*]/.test(host)) {
    policyError(
      'Policy allowedHosts items must be plain hostnames without scheme, port, path, query, credentials, or wildcards',
    );
  }
  // Reject leading/trailing dots and empty labels (consecutive dots).
  if (host.startsWith('.') || host.endsWith('.') || host.includes('..')) {
    policyError(
      'Policy allowedHosts items must not have empty labels, leading dots, or trailing dots',
    );
  }
  const labels = host.split('.');
  // Require at least 2 labels — prevents catch-all single-label TLD entries like "com".
  if (labels.length < 2) {
    policyError(
      'Policy allowedHosts items must contain at least two dot-separated labels (e.g. "example.com"), not single-label names like "com" or "localhost"',
    );
  }
  for (const label of labels) {
    if (!LABEL_RE.test(label)) {
      policyError(
        'Policy allowedHosts items contain an invalid label; each segment must start and end with a letter or digit and may contain hyphens',
      );
    }
  }
  // Reject IPv4-like entries: if the last label is all digits, the entry resembles an IP address.
  const lastLabel = labels[labels.length - 1]!;
  if (/^\d+$/.test(lastLabel)) {
    policyError(
      'Policy allowedHosts items must not be IP addresses; use allowPrivate to permit private network access',
    );
  }
}

function policyError(clientDetail: string): never {
  throw new AppError({
    code: ERROR_CODES.HTTP_INVALID_POLICY,
    category: 'validation',
    title: 'HTTP client policy is invalid',
    clientDetail,
  });
}
