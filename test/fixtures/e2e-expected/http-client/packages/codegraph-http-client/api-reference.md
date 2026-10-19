---
type: "API Reference"
title: "@codegraph/http-client — API Reference"
description: "Generated api reference for @codegraph/http-client from snapshot snapshot:v1:project:v1:f9954c252c535953:worktree:4b437bdb10ad7d1cd6adbf417b756baa35d9c72236d4badc3ae2dee8a85684d2."
resource: "/packages/codegraph-http-client/api-reference.md"
tags: ["ts-codegraph", "generated", "api-reference"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.api-reference@1"
source_snapshot: "snapshot:v1:project:v1:f9954c252c535953:worktree:4b437bdb10ad7d1cd6adbf417b756baa35d9c72236d4badc3ae2dee8a85684d2"
template_id: "api-reference"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @codegraph/http-client — API Reference

## Objective

Public API surface for `@codegraph/http-client` in project `@codegraph/http-client`.

## API

### Quick Navigation

| Symbol | Kind | Source Location |
| :--- | :---: | :--- |
| [AttributeName](#AttributeName) | `type-alias` | `src/generated/http-client-entities.ts:36` |
| [DEFAULT_POLICY](#DEFAULT_POLICY) | `constant` | `src/policy.ts:45` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/generated/http-client-entities.ts:6` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/generated/http-client-entities.ts:47` |
| [EntityId](#EntityId) | `type-alias` | `src/generated/http-client-entities.ts:17` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/generated/http-client-entities.ts:62` |
| [HttpClient](#HttpClient) | `interface` | `src/types.ts:71` |
| [HttpClientPolicy](#HttpClientPolicy) | `interface` | `src/types.ts:12` |
| [HttpClientRequest](#HttpClientRequest) | `interface` | `src/types.ts:38` |
| [HttpClientResult](#HttpClientResult) | `interface` | `src/types.ts:55` |
| [HttpClientRetryPolicy](#HttpClientRetryPolicy) | `interface` | `src/types.ts:3` |
| [HttpMethod](#HttpMethod) | `type-alias` | `src/types.ts:1` |
| [MAX_REDIRECTS](#MAX_REDIRECTS) | `constant` | `src/policy.ts:37` |
| [MAX_RETRY_ATTEMPTS](#MAX_RETRY_ATTEMPTS) | `constant` | `src/policy.ts:31` |
| [MAX_TIMEOUT_MS](#MAX_TIMEOUT_MS) | `constant` | `src/policy.ts:25` |
| [MIN_REDIRECTS](#MIN_REDIRECTS) | `constant` | `src/policy.ts:34` |
| [MIN_RETRY_ATTEMPTS](#MIN_RETRY_ATTEMPTS) | `constant` | `src/policy.ts:28` |
| [MIN_TIMEOUT_MS](#MIN_TIMEOUT_MS) | `constant` | `src/policy.ts:17` |
| [MetricName](#MetricName) | `type-alias` | `src/generated/http-client-entities.ts:44` |
| [SpanName](#SpanName) | `type-alias` | `src/generated/http-client-entities.ts:24` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/generated/http-client-entities.ts:27` |
| [TELEMETRY_METRICS](#TELEMETRY_METRICS) | `constant` | `src/generated/http-client-entities.ts:39` |
| [TELEMETRY_SPANS](#TELEMETRY_SPANS) | `constant` | `src/generated/http-client-entities.ts:20` |
| [createHttpClient](#createHttpClient) | `function` | `src/client.ts:36` |
| [requestJson](#requestJson) | `function` | `src/client.ts:52` |
| [requestText](#requestText) | `function` | `src/client.ts:59` |
| [snapshotAndResolvePolicy](#snapshotAndResolvePolicy) | `function` | `src/policy.ts:87` |
| [validateHttpClientPolicy](#validateHttpClientPolicy) | `function` | `src/policy.ts:320` |

---

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/generated/http-client-entities.ts:36`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### DEFAULT_POLICY

- **Kind**: `constant`
- **Source**: `src/policy.ts:45`

```ts
export const DEFAULT_POLICY: Readonly<HttpClientPolicy>
```

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/generated/http-client-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_HTTP_CLIENT: "codegraph.http-client"; readonly CODEGRAPH_HTTP_CLIENT_API_HTTP_CLIENT: "codegraph.http-client.api.http-client"; readonly CODEGRAPH_HTTP_CLIENT_API_HTTP_REQUEST: "codegraph.http-client.api.http-request"; readonly CODEGRAPH_HTTP_CLIENT_API_HTTP_RESULT: "codegraph.http-client.api.http-result"; readonly CODEGRAPH_HTTP_CLIENT_ERRORS_HTTP_CLIENT_ERRORS: "codegraph.http-client.errors.http-client-errors"; readonly CODEGRAPH_HTTP_CLIENT_GENERATED_HTTP_CLIENT_TYPES: "codegraph.http-client.generated.http-client-types"; readonly CODEGRAPH_HTTP_CLIENT_SECURITY_HTTP_CLIENT_POLICY: "codegraph.http-client.security.http-client-policy"; readonly CODEGRAPH_HTTP_CLIENT_TELEMETRY_HTTP_CLIENT_TELEMETRY: "codegraph.http-client.telemetry.http-client-telemetry"; }
```

Entity IDs

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/generated/http-client-entities.ts:47`

```ts
export const ERROR_CODES: { readonly HTTP_CANCELLED: "HTTP_CANCELLED"; readonly HTTP_INVALID_POLICY: "HTTP_INVALID_POLICY"; readonly HTTP_INVALID_REQUEST: "HTTP_INVALID_REQUEST"; readonly HTTP_JSON_PARSE_FAILED: "HTTP_JSON_PARSE_FAILED"; readonly HTTP_MAX_BODY_EXCEEDED: "HTTP_MAX_BODY_EXCEEDED"; readonly HTTP_MAX_REDIRECTS_EXCEEDED: "HTTP_MAX_REDIRECTS_EXCEEDED"; readonly HTTP_NETWORK_FAILURE: "HTTP_NETWORK_FAILURE"; readonly HTTP_REDIRECT_DENIED: "HTTP_REDIRECT_DENIED"; readonly HTTP_RETRY_EXHAUSTED: "HTTP_RETRY_EXHAUSTED"; readonly HTTP_TIMEOUT: "HTTP_TIMEOUT"; readonly HTTP_UNSUPPORTED_CONTENT_TYPE: "HTTP_UNSUPPORTED_CONTENT_TYPE"; readonly HTTP_URL_DENIED: "HTTP_URL_DENIED"; }
```

Error codes

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/generated/http-client-entities.ts:17`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/generated/http-client-entities.ts:62`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### HttpClient

- **Kind**: `interface`
- **Source**: `src/types.ts:71`

```ts
export interface HttpClient { readonly _tag: 'HttpClient'; /** @internal */ readonly _policy: HttpClientPolicy; /** @internal — injectable fetch for testing */ readonly _fetch: typeof fetch; }
```

Opaque HTTP client handle. Construct via createHttpClient.

### HttpClientPolicy

- **Kind**: `interface`
- **Source**: `src/types.ts:12`

```ts
export interface HttpClientPolicy { /** * Allowlist of hostnames. If set, requests to unlisted hosts are denied. * Subdomains are allowed (e.g. "example.com" permits "api.example.com"). */ readonly allowedHosts?: readonly string[]; /** Allow requests to private/reserved IP ranges. Default: false. */ readonly allowPrivate: boolean; /** Per-attempt timeout in milliseconds. Default: 10 000. */ readonly timeoutMs: number; /** Maximum response body size in bytes. Default: 1 048 576 (1 MB). */ readonly maxBodyBytes: number; /** Maximum number of redirects to follow. Default: 3. */ readonly maxRedirects: number; /** Retry configuration. */ readonly retry: HttpClientRetryPolicy; /** * If set, responses with a content type not in this list are rejected with * HTTP_UNSUPPORTED_CONTENT_TYPE. Content-type comparison ignores parameters * (charset, boundary, etc.). */ readonly allowedContentTypes?: readonly string[]; /** Inject W3C traceparent/tracestate headers into requests. Default: true. */ read…
```

### HttpClientRequest

- **Kind**: `interface`
- **Source**: `src/types.ts:38`

```ts
export interface HttpClientRequest { /** Absolute URL. Must not include credentials (user:pass). */ readonly url: string; /** HTTP method. Default: GET. */ readonly method?: HttpMethod; /** Additional request headers. Authorization and Cookie are stripped before logging. */ readonly headers?: Readonly<Record<string, string>>; /** Optional request body (for POST/PUT/PATCH). */ readonly body?: string | Uint8Array; /** Caller-supplied cancellation signal. */ readonly signal?: AbortSignal; }
```

### HttpClientResult

- **Kind**: `interface`
- **Source**: `src/types.ts:55`

```ts
export interface HttpClientResult<T = unknown> { /** HTTP status code (e.g. 200, 404). */ readonly status: number; /** True when status is 2xx. */ readonly ok: boolean; /** Parsed response body. Null for non-2xx in requestJson. */ readonly body: T; /** Safe scheme://hostname label suitable for telemetry and logging. */ readonly safeHost: string; /** Total number of fetch attempts made, including retries. */ readonly attempts: number; /** Number of redirects followed. */ readonly redirectCount: number; }
```

Result envelope for a completed HTTP request.
Never contains full URLs, raw headers, request/response bodies, or credentials.

### HttpClientRetryPolicy

- **Kind**: `interface`
- **Source**: `src/types.ts:3`

```ts
export interface HttpClientRetryPolicy { /** Maximum number of total attempts (including the first). Default: 3. */ readonly maxAttempts: number; /** Delay before the first retry in milliseconds. Default: 100. */ readonly initialDelayMs: number; /** Multiplier applied to delay on each subsequent retry. Default: 2. */ readonly backoffFactor: number; }
```

### HttpMethod

- **Kind**: `type-alias`
- **Source**: `src/types.ts:1`

```ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
```

### MAX_REDIRECTS

- **Kind**: `constant`
- **Source**: `src/policy.ts:37`

```ts
export const MAX_REDIRECTS: 10
```

Maximum accepted value for `maxRedirects`.

### MAX_RETRY_ATTEMPTS

- **Kind**: `constant`
- **Source**: `src/policy.ts:31`

```ts
export const MAX_RETRY_ATTEMPTS: 10
```

Maximum accepted value for `retry.maxAttempts`.

### MAX_TIMEOUT_MS

- **Kind**: `constant`
- **Source**: `src/policy.ts:25`

```ts
export const MAX_TIMEOUT_MS: 300000
```

Maximum value accepted for `timeoutMs` and `retry.initialDelayMs`.
300 000 ms (5 minutes) is the highest value that AbortSignal.timeout() will
reliably schedule without platform timer-overflow warnings (safe well inside
the 32-bit signed-integer ceiling of ~2 147 483 647 ms used by most runtimes).

### MIN_REDIRECTS

- **Kind**: `constant`
- **Source**: `src/policy.ts:34`

```ts
export const MIN_REDIRECTS: 0
```

Minimum accepted value for `maxRedirects` (zero disables redirect following).

### MIN_RETRY_ATTEMPTS

- **Kind**: `constant`
- **Source**: `src/policy.ts:28`

```ts
export const MIN_RETRY_ATTEMPTS: 1
```

Minimum accepted value for `retry.maxAttempts` (at least one attempt).

### MIN_TIMEOUT_MS

- **Kind**: `constant`
- **Source**: `src/policy.ts:17`

```ts
export const MIN_TIMEOUT_MS: 1
```

Minimum value accepted for `timeoutMs` and `retry.initialDelayMs`.
1 ms is the smallest meaningful timer resolution.

### MetricName

- **Kind**: `type-alias`
- **Source**: `src/generated/http-client-entities.ts:44`

```ts
export type MetricName = (typeof TELEMETRY_METRICS)[keyof typeof TELEMETRY_METRICS];
```

### SpanName

- **Kind**: `type-alias`
- **Source**: `src/generated/http-client-entities.ts:24`

```ts
export type SpanName = (typeof TELEMETRY_SPANS)[keyof typeof TELEMETRY_SPANS];
```

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/generated/http-client-entities.ts:27`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_HTTP_ERROR_CODE: "codegraph.http.error_code"; readonly CODEGRAPH_HTTP_METHOD: "codegraph.http.method"; readonly CODEGRAPH_HTTP_REDIRECT_COUNT: "codegraph.http.redirect_count"; readonly CODEGRAPH_HTTP_RETRY_COUNT: "codegraph.http.retry_count"; readonly CODEGRAPH_HTTP_STATUS_CODE: "codegraph.http.status_code"; readonly CODEGRAPH_HTTP_TARGET_HOST: "codegraph.http.target_host"; }
```

Telemetry attributes

### TELEMETRY_METRICS

- **Kind**: `constant`
- **Source**: `src/generated/http-client-entities.ts:39`

```ts
export const TELEMETRY_METRICS: { readonly CODEGRAPH_HTTP_REQUEST_COUNT: "codegraph.http.request.count"; readonly CODEGRAPH_HTTP_REQUEST_DURATION: "codegraph.http.request.duration"; }
```

Telemetry metrics

### TELEMETRY_SPANS

- **Kind**: `constant`
- **Source**: `src/generated/http-client-entities.ts:20`

```ts
export const TELEMETRY_SPANS: { readonly CODEGRAPH_HTTP_REQUEST: "codegraph.http.request"; }
```

Telemetry spans

### createHttpClient

- **Kind**: `function`
- **Source**: `src/client.ts:36`

```ts
export function createHttpClient( policy?: Partial<HttpClientPolicy>, _fetch?: typeof fetch, ): HttpClient
```

### requestJson

- **Kind**: `function`
- **Source**: `src/client.ts:52`

```ts
export async function requestJson<T = unknown>( client: HttpClient, request: HttpClientRequest, ): Promise<HttpClientResult<T | null>>
```

### requestText

- **Kind**: `function`
- **Source**: `src/client.ts:59`

```ts
export async function requestText( client: HttpClient, request: HttpClientRequest, ): Promise<HttpClientResult<string>>
```

### snapshotAndResolvePolicy

- **Kind**: `function`
- **Source**: `src/policy.ts:87`

```ts
export function snapshotAndResolvePolicy(raw: unknown): HttpClientPolicy
```

Snapshot, validate, and resolve a caller-supplied policy object in a single pass.

Every field is read exactly once from its property descriptor so that accessor
descriptors (getters/setters) are detected and rejected before any value is used
in validation or in the resolved policy.  The same snapped values are both
validated and written into the returned frozen policy — there is no second read
from the caller object.

Passing `undefined` (no policy argument) returns a fully-defaults frozen policy.

### validateHttpClientPolicy

- **Kind**: `function`
- **Source**: `src/policy.ts:320`

```ts
export function validateHttpClientPolicy(raw: unknown): void
```

Public standalone policy validator.  Throws `HTTP_INVALID_POLICY` if `raw`
is not a valid policy object.  Uses the same descriptor-based snapshot logic
as `createHttpClient` internally.

## Sources Used

- `AttributeName` — `src/generated/http-client-entities.ts:36`
- `DEFAULT_POLICY` — `src/policy.ts:45`
- `ENTITY_IDS` — `src/generated/http-client-entities.ts:6`
- `ERROR_CODES` — `src/generated/http-client-entities.ts:47`
- `EntityId` — `src/generated/http-client-entities.ts:17`
- `ErrorCode` — `src/generated/http-client-entities.ts:62`
- `HttpClient` — `src/types.ts:71`
- `HttpClientPolicy` — `src/types.ts:12`
- `HttpClientRequest` — `src/types.ts:38`
- `HttpClientResult` — `src/types.ts:55`
- `HttpClientRetryPolicy` — `src/types.ts:3`
- `HttpMethod` — `src/types.ts:1`
- `MAX_REDIRECTS` — `src/policy.ts:37`
- `MAX_RETRY_ATTEMPTS` — `src/policy.ts:31`
- `MAX_TIMEOUT_MS` — `src/policy.ts:25`
- `MIN_REDIRECTS` — `src/policy.ts:34`
- `MIN_RETRY_ATTEMPTS` — `src/policy.ts:28`
- `MIN_TIMEOUT_MS` — `src/policy.ts:17`
- `MetricName` — `src/generated/http-client-entities.ts:44`
- `SpanName` — `src/generated/http-client-entities.ts:24`
- `TELEMETRY_ATTRIBUTES` — `src/generated/http-client-entities.ts:27`
- `TELEMETRY_METRICS` — `src/generated/http-client-entities.ts:39`
- `TELEMETRY_SPANS` — `src/generated/http-client-entities.ts:20`
- `createHttpClient` — `src/client.ts:36`
- `requestJson` — `src/client.ts:52`
- `requestText` — `src/client.ts:59`
- `snapshotAndResolvePolicy` — `src/policy.ts:87`
- `validateHttpClientPolicy` — `src/policy.ts:320`
