import { trace, context as otelContext, SpanStatusCode } from '@opentelemetry/api';
import { AppError, isAppError } from '@codegraph/errors';
import { getTracer, getMeter, injectTraceContext } from '@codegraph/telemetry';
import { createOutboundUrlPolicy, validateOutboundUrl } from '@codegraph/security';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/http-client-entities.js';
import { snapshotAndResolvePolicy, validateHttpClientPolicy, MAX_TIMEOUT_MS } from './policy.js';
import type { HttpClient, HttpClientPolicy, HttpClientRequest, HttpClientResult } from './types.js';

// --- Module-level telemetry ---

const httpTracer = getTracer('codegraph.http-client', '0.1.0');
const httpMeter = getMeter('codegraph.http-client', '0.1.0');
const requestCounter = httpMeter.createCounter('codegraph.http.request.count', {
  description: 'Number of HTTP requests by outcome',
});
const requestDurationHistogram = httpMeter.createHistogram('codegraph.http.request.duration', {
  unit: 'ms',
  description: 'HTTP request duration in milliseconds',
});

// HttpMethod allowlist enforced at runtime so callers cannot inject arbitrary strings.
const VALID_HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

// Limits for request header keys/values at the trust boundary.
const MAX_HEADER_NAME_LEN = 256;
const MAX_HEADER_VALUE_LEN = 8192;

// Credential headers that must not be forwarded to a different origin on redirect.
// Compared case-insensitively against outbound header keys.
const SENSITIVE_HEADER_NAMES = new Set(['authorization', 'cookie', 'proxy-authorization']);

// --- Public API ---

export { validateHttpClientPolicy };

export function createHttpClient(
  policy?: Partial<HttpClientPolicy>,
  _fetch?: typeof fetch,
): HttpClient {
  // Single-pass snapshot/validate/resolve — no second read from the caller object.
  // Accessor descriptors (getters/setters) on any policy field are rejected here.
  const resolved = snapshotAndResolvePolicy(policy);
  // Freeze the handle so callers cannot widen policy or swap the fetch implementation
  // after construction.
  return Object.freeze({
    _tag: 'HttpClient',
    _policy: resolved,
    _fetch: _fetch ?? globalThis.fetch,
  }) as HttpClient;
}

export async function requestJson<T = unknown>(
  client: HttpClient,
  request: HttpClientRequest,
): Promise<HttpClientResult<T | null>> {
  return executeRequest<T | null>(client, request, parseJsonBody as BodyParser<T | null>);
}

export async function requestText(
  client: HttpClient,
  request: HttpClientRequest,
): Promise<HttpClientResult<string>> {
  return executeRequest<string>(client, request, parseTextBody);
}

// --- Internal execution ---

type BodyParser<T> = (
  response: Response,
  maxBodyBytes: number,
  allowedContentTypes: readonly string[] | undefined,
  ok: boolean,
) => Promise<T>;

async function parseJsonBody(
  response: Response,
  maxBodyBytes: number,
  allowedContentTypes: readonly string[] | undefined,
  ok: boolean,
): Promise<unknown | null> {
  if (ok) {
    const ct = response.headers.get('content-type');
    checkContentType(ct, allowedContentTypes ?? ['application/json']);
  }
  if (!ok) return null;
  const text = await readBodyBounded(response, maxBodyBytes);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AppError({
      code: ERROR_CODES.HTTP_JSON_PARSE_FAILED,
      category: 'validation',
      title: 'HTTP response is not valid JSON',
      clientDetail: 'Response body could not be parsed as JSON',
    });
  }
}

async function parseTextBody(
  response: Response,
  maxBodyBytes: number,
  allowedContentTypes: readonly string[] | undefined,
  _ok: boolean,
): Promise<string> {
  if (allowedContentTypes !== undefined) {
    const ct = response.headers.get('content-type');
    checkContentType(ct, allowedContentTypes);
  }
  return readBodyBounded(response, maxBodyBytes);
}

function checkContentType(ct: string | null, allowed: readonly string[]): void {
  const base = ct !== null ? ct.split(';')[0]!.trim().toLowerCase() : '';
  const matched = allowed.some((a) => {
    const ab = a.split(';')[0]!.trim().toLowerCase();
    return base === ab;
  });
  if (!matched) {
    throw new AppError({
      code: ERROR_CODES.HTTP_UNSUPPORTED_CONTENT_TYPE,
      category: 'validation',
      title: 'HTTP response has unsupported content type',
      clientDetail: 'Response content type is not in the allowed list',
    });
  }
}

async function executeRequest<T>(
  client: HttpClient,
  request: HttpClientRequest,
  parseBody: BodyParser<T>,
): Promise<HttpClientResult<T>> {
  const policy = client._policy;
  const fetchFn = client._fetch;

  // ── Trust-boundary snapshot ──────────────────────────────────────────────
  // Read all request fields exactly once so mutating callers cannot affect
  // mid-flight behavior. All validation runs against these snapshots.
  const rawUrl = request.url;
  const rawMethod = request.method;
  const callerHeaders = request.headers;
  const body = request.body;
  const callerSignal = request.signal;

  // ── Request field validation (all pre-span) ───────────────────────────────
  // (1) HTTP method: validate against the explicit allowlist before the method
  //     value is used in any span attribute or metric label.
  const method = rawMethod ?? 'GET';
  if (rawMethod !== undefined && !VALID_HTTP_METHODS.has(rawMethod)) {
    throw new AppError({
      code: ERROR_CODES.HTTP_INVALID_REQUEST,
      category: 'validation',
      title: 'HTTP request method is not allowed',
      clientDetail: 'Request method must be one of: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
    });
  }

  // (2) Request headers: snapshot each header value exactly once into a
  //     detached null-prototype record, rejecting accessor descriptors
  //     (getters/setters), oversized strings, and control characters.
  //     The snapshot — not the caller object — is used for all downstream work.
  const snappedHeaders =
    callerHeaders !== undefined ? snapshotRequestHeaders(callerHeaders) : undefined;

  // (3) Request body: validate type then enforce maxBodyBytes.
  //     At the trust boundary, body could be any runtime value even though the
  //     TypeScript type says string | Uint8Array | undefined.  A plain object
  //     with a byteLength property would otherwise bypass the instanceof check
  //     and produce a nonsense size.  Reject before any span or fetch call so
  //     no raw body content ever reaches logs or error fields.
  if (body !== undefined) {
    if (typeof body !== 'string' && !(body instanceof Uint8Array)) {
      throw new AppError({
        code: ERROR_CODES.HTTP_INVALID_REQUEST,
        category: 'validation',
        title: 'HTTP request body type is invalid',
        clientDetail: 'Request body must be a string or Uint8Array',
      });
    }
    const bodyBytes =
      typeof body === 'string'
        ? new TextEncoder().encode(body).byteLength
        : body.byteLength;
    if (bodyBytes > policy.maxBodyBytes) {
      throw new AppError({
        code: ERROR_CODES.HTTP_MAX_BODY_EXCEEDED,
        category: 'validation',
        title: 'HTTP request body is too large',
        clientDetail: 'Request body exceeded the maximum allowed size (maxBodyBytes)',
      });
    }
  }

  // (4) URL SSRF check (pre-span, pre-network).
  const urlPolicy = createOutboundUrlPolicy({
    allowPrivate: policy.allowPrivate,
    ...(policy.allowedHosts !== undefined ? { allowedHosts: policy.allowedHosts as string[] } : {}),
    allowRedirects: policy.maxRedirects > 0,
  });

  const urlResult = validateOutboundUrl(urlPolicy, rawUrl);
  if (urlResult.decision !== 'allow' || urlResult.safeHost === undefined) {
    throw new AppError({
      code: ERROR_CODES.HTTP_URL_DENIED,
      category: 'authz',
      title: 'HTTP request URL is not allowed by policy',
      clientDetail: 'Request URL was denied by the HTTP client SSRF policy',
    });
  }
  const safeHost = urlResult.safeHost;

  // ── Span / metrics ────────────────────────────────────────────────────────
  // Only safe, validated, low-cardinality values reach span attributes.
  const startMs = Date.now();
  const span = httpTracer.startSpan('codegraph.http.request', {
    attributes: {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_METHOD]: method,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_TARGET_HOST]: safeHost,
    },
  });
  const spanCtx = trace.setSpan(otelContext.active(), span);

  let result: HttpClientResult<T> | undefined;
  let spanErrorCode: string | undefined;

  try {
    result = await otelContext.with(spanCtx, () =>
      executeWithRetry<T>(
        policy,
        fetchFn,
        rawUrl,
        method,
        snappedHeaders,
        body,
        callerSignal,
        urlPolicy,
        parseBody,
      ),
    );
  } catch (err) {
    spanErrorCode = isAppError(err) ? err.code : ERROR_CODES.HTTP_NETWORK_FAILURE;
    throw err;
  } finally {
    const durationMs = Date.now() - startMs;

    if (result !== undefined) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_STATUS_CODE, result.status);
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_RETRY_COUNT, result.attempts - 1);
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_REDIRECT_COUNT, result.redirectCount);
      span.setStatus({ code: SpanStatusCode.OK });
    } else if (spanErrorCode !== undefined) {
      span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_ERROR_CODE, spanErrorCode);
      span.setStatus({ code: SpanStatusCode.ERROR, message: spanErrorCode });
    }
    span.end();

    const metricAttrs: Record<string, string | number> = {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_METHOD]: method,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_TARGET_HOST]: safeHost,
    };
    if (result !== undefined) {
      metricAttrs[TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_STATUS_CODE] = result.status;
    } else if (spanErrorCode !== undefined) {
      metricAttrs[TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_ERROR_CODE] = spanErrorCode;
    }
    requestCounter.add(1, metricAttrs);
    requestDurationHistogram.record(durationMs, {
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_METHOD]: method,
      [TELEMETRY_ATTRIBUTES.CODEGRAPH_HTTP_TARGET_HOST]: safeHost,
    });
  }

  return result;
}

/**
 * Snapshot request headers into a detached null-prototype record.
 *
 * Each header property is read exactly once from its property descriptor.
 * Accessor descriptors (getters/setters) are rejected: they are a TOCTOU risk
 * because the getter may return different values on successive reads, or may
 * trigger side-effects or capture the return value after validation.
 *
 * Returns a plain frozen record that is safe to pass across retry attempts.
 */
function snapshotRequestHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
    throw new AppError({
      code: ERROR_CODES.HTTP_INVALID_REQUEST,
      category: 'validation',
      title: 'HTTP request headers are invalid',
      clientDetail: 'Request headers must be a plain record of strings',
    });
  }

  const obj = headers as object;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const snapshot: Record<string, string> = Object.create(null);

  for (const key of Object.keys(obj)) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc === undefined || desc.get !== undefined || desc.set !== undefined) {
      throw new AppError({
        code: ERROR_CODES.HTTP_INVALID_REQUEST,
        category: 'validation',
        title: 'HTTP request header contains accessor descriptor',
        clientDetail: 'Request headers must use plain data properties, not getters or setters',
      });
    }

    // Read from the descriptor, not from the object, to prevent double-read attacks.
    const v = desc.value as unknown;

    if (key.length === 0 || key.length > MAX_HEADER_NAME_LEN) {
      throw new AppError({
        code: ERROR_CODES.HTTP_INVALID_REQUEST,
        category: 'validation',
        title: 'HTTP request header name is invalid',
        clientDetail: 'Request header names must be non-empty strings up to 256 characters',
      });
    }
    if (/[\x00-\x1f\x7f]/.test(key)) {
      throw new AppError({
        code: ERROR_CODES.HTTP_INVALID_REQUEST,
        category: 'validation',
        title: 'HTTP request header name contains unsafe characters',
        clientDetail: 'Request header names must not contain control characters',
      });
    }
    if (typeof v !== 'string' || v.length > MAX_HEADER_VALUE_LEN) {
      throw new AppError({
        code: ERROR_CODES.HTTP_INVALID_REQUEST,
        category: 'validation',
        title: 'HTTP request header value is invalid',
        clientDetail: 'Request header values must be strings up to 8192 characters',
      });
    }
    if (/[\x00\r\n]/.test(v)) {
      throw new AppError({
        code: ERROR_CODES.HTTP_INVALID_REQUEST,
        category: 'validation',
        title: 'HTTP request header value contains unsafe characters',
        clientDetail: 'Request header values must not contain control characters',
      });
    }

    snapshot[key] = v;
  }

  return snapshot;
}

async function executeWithRetry<T>(
  policy: HttpClientPolicy,
  fetchFn: typeof fetch,
  rawUrl: string,
  method: string,
  snappedHeaders: Record<string, string> | undefined,
  body: string | Uint8Array | undefined,
  callerSignal: AbortSignal | undefined,
  urlPolicy: ReturnType<typeof createOutboundUrlPolicy>,
  parseBody: BodyParser<T>,
): Promise<HttpClientResult<T>> {
  const { maxAttempts, initialDelayMs, backoffFactor } = policy.retry;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (callerSignal?.aborted === true) {
      throw new AppError({
        code: ERROR_CODES.HTTP_CANCELLED,
        category: 'internal',
        title: 'HTTP request was cancelled',
        clientDetail: 'Request was cancelled by the caller',
      });
    }

    const timeoutSignal = AbortSignal.timeout(policy.timeoutMs);
    const combinedSignal =
      callerSignal !== undefined
        ? AbortSignal.any([callerSignal, timeoutSignal])
        : timeoutSignal;

    try {
      return await attemptRequest<T>(
        policy,
        fetchFn,
        rawUrl,
        method,
        snappedHeaders,
        body,
        combinedSignal,
        urlPolicy,
        parseBody,
        attempt,
      );
    } catch (err) {
      const isTimeout = isTimeoutAbort(err, timeoutSignal);
      const isCancel = isCancelAbort(err, callerSignal);

      if (isTimeout) {
        throw new AppError({
          code: ERROR_CODES.HTTP_TIMEOUT,
          category: 'internal',
          title: 'HTTP request timed out',
          clientDetail: 'Request exceeded the configured timeout',
        });
      }

      if (isCancel) {
        throw new AppError({
          code: ERROR_CODES.HTTP_CANCELLED,
          category: 'internal',
          title: 'HTTP request was cancelled',
          clientDetail: 'Request was cancelled by the caller',
        });
      }

      if (isAppError(err) && !isRetryableCode(err.code)) {
        throw err;
      }

      lastError = err;

      if (attempt < maxAttempts) {
        // Cap at MAX_TIMEOUT_MS so that large backoffFactor values (which can
        // produce Infinity or values > 2^31) never reach setTimeout directly.
        // Math.min(Infinity, MAX_TIMEOUT_MS) === MAX_TIMEOUT_MS, so no NaN/Inf
        // timer warnings are possible regardless of policy field values.
        const delayMs = Math.min(
          initialDelayMs * backoffFactor ** (attempt - 1),
          MAX_TIMEOUT_MS,
        );
        await sleep(delayMs, callerSignal);
      }
    }
  }

  // Do not include lastError as cause: raw network errors may carry enumerable
  // secret properties (URLs, tokens) that would leak through JSON.stringify.
  void lastError;
  throw new AppError({
    code: ERROR_CODES.HTTP_RETRY_EXHAUSTED,
    category: 'internal',
    title: 'HTTP request failed after all retry attempts',
    clientDetail: 'All retry attempts were exhausted',
  });
}

async function attemptRequest<T>(
  policy: HttpClientPolicy,
  fetchFn: typeof fetch,
  rawUrl: string,
  method: string,
  snappedHeaders: Record<string, string> | undefined,
  body: string | Uint8Array | undefined,
  combinedSignal: AbortSignal,
  urlPolicy: ReturnType<typeof createOutboundUrlPolicy>,
  parseBody: BodyParser<T>,
  attempt: number,
): Promise<HttpClientResult<T>> {
  // Build the full outbound header set for the initial request.
  // Authorization, Cookie, and Proxy-Authorization ARE forwarded on same-origin
  // hops, but stripped before any cross-origin redirect (see below).
  const fullHeaders: Record<string, string> = {};
  if (snappedHeaders !== undefined) {
    for (const [k, v] of Object.entries(snappedHeaders)) {
      fullHeaders[k] = v;
    }
  }

  // Inject W3C trace propagation headers (traceparent / tracestate).
  if (policy.traceHeaders) {
    const carrier = injectTraceContext();
    for (const [k, v] of Object.entries(carrier)) {
      fullHeaders[k] = v;
    }
  }

  // Track the initial origin for cross-origin redirect detection.
  const initialOrigin = originFromUrl(rawUrl);
  // Once credentials are stripped for a cross-origin hop they are not restored,
  // matching browser behavior for credential forwarding on redirect chains.
  let credentialsStripped = false;

  let currentUrl = rawUrl;
  let effectiveMethod = method;
  let effectiveBody: string | Uint8Array | undefined = body;
  let redirectCount = 0;

  for (;;) {
    // Strip credential headers when the current hop is cross-origin relative
    // to the initial request URL.  Once stripped they are never re-added.
    if (!credentialsStripped && originFromUrl(currentUrl) !== initialOrigin) {
      credentialsStripped = true;
    }

    const fetchHeaders: Record<string, string> = credentialsStripped
      ? Object.fromEntries(
          Object.entries(fullHeaders).filter(
            ([k]) => !SENSITIVE_HEADER_NAMES.has(k.toLowerCase()),
          ),
        )
      : fullHeaders;

    let response: Response;
    try {
      response = await fetchFn(currentUrl, {
        method: effectiveMethod,
        headers: fetchHeaders,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: effectiveBody as any,
        redirect: 'manual',
        signal: combinedSignal,
      });
    } catch (err) {
      if (combinedSignal.aborted) throw err;
      // Do not include the raw error as cause: it may carry enumerable fields
      // (e.g. secretUrl, token) that would leak through JSON.stringify.
      throw new AppError({
        code: ERROR_CODES.HTTP_NETWORK_FAILURE,
        category: 'internal',
        title: 'HTTP network error',
        clientDetail: 'A network error occurred during the request',
      });
    }

    if (response.status >= 300 && response.status < 400) {
      if (redirectCount >= policy.maxRedirects) {
        throw new AppError({
          code: ERROR_CODES.HTTP_MAX_REDIRECTS_EXCEEDED,
          category: 'validation',
          title: 'Too many HTTP redirects',
          clientDetail: 'Request exceeded the maximum number of allowed redirects',
        });
      }

      const location = response.headers.get('location');
      if (!location) {
        throw new AppError({
          code: ERROR_CODES.HTTP_NETWORK_FAILURE,
          category: 'internal',
          title: 'HTTP redirect missing Location header',
          clientDetail: 'A redirect response did not include a Location header',
        });
      }

      let redirectUrl: string;
      try {
        redirectUrl = new URL(location, currentUrl).href;
      } catch {
        throw new AppError({
          code: ERROR_CODES.HTTP_REDIRECT_DENIED,
          category: 'authz',
          title: 'HTTP redirect URL is invalid',
          clientDetail: 'Redirect location could not be resolved to a valid URL',
        });
      }

      const redirectCheck = validateOutboundUrl(urlPolicy, redirectUrl);
      if (redirectCheck.decision !== 'allow' || redirectCheck.safeHost === undefined) {
        throw new AppError({
          code: ERROR_CODES.HTTP_REDIRECT_DENIED,
          category: 'authz',
          title: 'HTTP redirect URL is not allowed by policy',
          clientDetail: 'Redirect target was denied by the HTTP client SSRF policy',
        });
      }

      // 301/302/303: downgrade non-safe methods to GET and drop body.
      if (
        (response.status === 301 || response.status === 302 || response.status === 303) &&
        effectiveMethod !== 'GET' &&
        effectiveMethod !== 'HEAD'
      ) {
        effectiveMethod = 'GET';
        effectiveBody = undefined;
      }

      currentUrl = redirectUrl;
      redirectCount++;
      continue;
    }

    const status = response.status;
    const ok = status >= 200 && status < 300;
    const parsedBody = await parseBody(response, policy.maxBodyBytes, policy.allowedContentTypes, ok);
    const finalSafeHost = safehostFromUrl(currentUrl);

    return {
      status,
      ok,
      body: parsedBody,
      safeHost: finalSafeHost,
      attempts: attempt,
      redirectCount,
    };
  }
}

// --- Body reading ---

async function readBodyBounded(response: Response, maxBytes: number): Promise<string> {
  const cl = response.headers.get('content-length');
  if (cl !== null) {
    const size = parseInt(cl, 10);
    if (!Number.isNaN(size) && size > maxBytes) {
      throw responseTooLargeError();
    }
  }

  const body = response.body;
  if (!body) return '';

  const reader = body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes) {
        reader.cancel().catch(() => {});
        throw responseTooLargeError();
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
    chunks.push(decoder.decode());
    return chunks.join('');
  } catch (err) {
    reader.cancel().catch(() => {});
    throw err;
  }
}

function responseTooLargeError(): AppError {
  return new AppError({
    code: ERROR_CODES.HTTP_MAX_BODY_EXCEEDED,
    category: 'validation',
    title: 'HTTP response body is too large',
    clientDetail: 'Response body exceeded the maximum allowed size (maxBodyBytes)',
  });
}

// --- Helpers ---

function safehostFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return 'unknown';
  }
}

/**
 * Returns the origin (scheme + host + port) of a URL string.
 * Returns '' on parse error — treated as cross-origin (fail-safe).
 */
function originFromUrl(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

function isTimeoutAbort(err: unknown, timeoutSignal: AbortSignal): boolean {
  if (!timeoutSignal.aborted) return false;
  if (err instanceof DOMException && err.name === 'TimeoutError') return true;
  if (err instanceof Error && err.name === 'TimeoutError') return true;
  return false;
}

function isCancelAbort(err: unknown, callerSignal: AbortSignal | undefined): boolean {
  if (!callerSignal?.aborted) return false;
  if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'TimeoutError')) return true;
  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) return true;
  return false;
}

function isRetryableCode(code: string): boolean {
  return code === ERROR_CODES.HTTP_NETWORK_FAILURE;
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(new DOMException('Sleep cancelled', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    if (signal !== undefined) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('Sleep cancelled', 'AbortError'));
        },
        { once: true },
      );
    }
  });
}
