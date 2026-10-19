export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface HttpClientRetryPolicy {
  /** Maximum number of total attempts (including the first). Default: 3. */
  readonly maxAttempts: number;
  /** Delay before the first retry in milliseconds. Default: 100. */
  readonly initialDelayMs: number;
  /** Multiplier applied to delay on each subsequent retry. Default: 2. */
  readonly backoffFactor: number;
}

export interface HttpClientPolicy {
  /**
   * Allowlist of hostnames. If set, requests to unlisted hosts are denied.
   * Subdomains are allowed (e.g. "example.com" permits "api.example.com").
   */
  readonly allowedHosts?: readonly string[];
  /** Allow requests to private/reserved IP ranges. Default: false. */
  readonly allowPrivate: boolean;
  /** Per-attempt timeout in milliseconds. Default: 10 000. */
  readonly timeoutMs: number;
  /** Maximum response body size in bytes. Default: 1 048 576 (1 MB). */
  readonly maxBodyBytes: number;
  /** Maximum number of redirects to follow. Default: 3. */
  readonly maxRedirects: number;
  /** Retry configuration. */
  readonly retry: HttpClientRetryPolicy;
  /**
   * If set, responses with a content type not in this list are rejected with
   * HTTP_UNSUPPORTED_CONTENT_TYPE. Content-type comparison ignores parameters
   * (charset, boundary, etc.).
   */
  readonly allowedContentTypes?: readonly string[];
  /** Inject W3C traceparent/tracestate headers into requests. Default: true. */
  readonly traceHeaders: boolean;
}

export interface HttpClientRequest {
  /** Absolute URL. Must not include credentials (user:pass). */
  readonly url: string;
  /** HTTP method. Default: GET. */
  readonly method?: HttpMethod;
  /** Additional request headers. Authorization and Cookie are stripped before logging. */
  readonly headers?: Readonly<Record<string, string>>;
  /** Optional request body (for POST/PUT/PATCH). */
  readonly body?: string | Uint8Array;
  /** Caller-supplied cancellation signal. */
  readonly signal?: AbortSignal;
}

/**
 * Result envelope for a completed HTTP request.
 * Never contains full URLs, raw headers, request/response bodies, or credentials.
 */
export interface HttpClientResult<T = unknown> {
  /** HTTP status code (e.g. 200, 404). */
  readonly status: number;
  /** True when status is 2xx. */
  readonly ok: boolean;
  /** Parsed response body. Null for non-2xx in requestJson. */
  readonly body: T;
  /** Safe scheme://hostname label suitable for telemetry and logging. */
  readonly safeHost: string;
  /** Total number of fetch attempts made, including retries. */
  readonly attempts: number;
  /** Number of redirects followed. */
  readonly redirectCount: number;
}

/** Opaque HTTP client handle. Construct via createHttpClient. */
export interface HttpClient {
  readonly _tag: 'HttpClient';
  /** @internal */
  readonly _policy: HttpClientPolicy;
  /** @internal — injectable fetch for testing */
  readonly _fetch: typeof fetch;
}
