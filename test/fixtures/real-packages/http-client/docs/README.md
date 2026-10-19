# @codegraph/http-client

Safe outbound HTTP wrapper with timeout, retry/backoff, redirect policy, max body size, JSON/text parsing, SSRF protection, trace propagation, and telemetry.

## Installation

```bash
pnpm add @codegraph/http-client
```

## Quick start

```typescript
import { createHttpClient, requestJson } from '@codegraph/http-client';

const client = createHttpClient();

const result = await requestJson<{ id: number; name: string }>(client, {
  url: 'https://api.example.com/users/1',
});

if (result.ok) {
  console.log(result.body?.name);
}
```

## Policy defaults

| Field             | Default      | Description                              |
|-------------------|--------------|------------------------------------------|
| `allowPrivate`    | `false`      | Block requests to private/reserved IPs   |
| `timeoutMs`       | `10_000`     | Per-attempt timeout                      |
| `maxBodyBytes`    | `1_048_576`  | Max **request and response** body (1 MB) |
| `maxRedirects`    | `3`          | Maximum redirects to follow (`[0, 10]`)  |
| `traceHeaders`    | `true`       | Inject W3C traceparent/tracestate        |
| `retry.maxAttempts` | `3`        | Total attempts including first (`[1, 10]`) |
| `retry.initialDelayMs` | `100`  | First retry delay ms (`[0, 300000]`)     |
| `retry.backoffFactor`  | `2`    | Exponential backoff multiplier (>= 1)    |

## SSRF protection

All request and redirect URLs are validated against the policy before any network call. Private IP ranges, loopback, link-local, and cloud metadata endpoints are blocked by default.

```typescript
// Only allow requests to your own API
const client = createHttpClient({
  allowedHosts: ['api.example.com'],
});
```

## Redirect revalidation

Every redirect target URL is re-validated against the SSRF policy before following. An attacker cannot bypass SSRF protection via redirect.

## Authorization and Cookie headers

`Authorization`, `Cookie`, and `Proxy-Authorization` headers supplied in `request.headers` are **forwarded to the underlying fetch call** so authenticated requests work correctly. They are never included in:

- Span attributes or metric labels
- `AppError` messages, titles, or `clientDetail` strings
- Result envelopes (`HttpClientResult`)
- Logs

### Cross-origin redirect stripping

When a redirect changes origin (scheme + host + port), credential headers (`Authorization`, `Cookie`, `Proxy-Authorization`) are **stripped from the outbound request before following the redirect**. This matches browser behavior and prevents token leakage to unintended third parties.

- Same-origin redirect (e.g. `http://api.example.com/a` → `http://api.example.com/b`): all headers forwarded.
- Cross-origin redirect (e.g. `http://api.example.com` → `http://other.com`): credential headers removed; other headers forwarded.
- Once stripped in a redirect chain, credential headers are not re-added on any subsequent hop.

> v1 design decision: if you need to forbid auth headers entirely (e.g. for a public proxy that must never touch credentials), validate the header map before calling `requestJson` / `requestText`.

## Request body size enforcement

`maxBodyBytes` applies to **both request and response bodies**. If a `string` or `Uint8Array` body supplied in `request.body` exceeds `maxBodyBytes` (in bytes), the request is rejected with `HTTP_MAX_BODY_EXCEEDED` before fetch is called.

## Policy validation

`createHttpClient` validates the policy at construction time. Invalid policies throw `HTTP_INVALID_POLICY` synchronously before any fetch call.

Validated fields include:
- `allowPrivate` and `traceHeaders` — must be boolean
- `timeoutMs` — safe integer in `[MIN_TIMEOUT_MS=1, MAX_TIMEOUT_MS=300000]` milliseconds; 0, negative, fractional, NaN, Infinity, and values above 300 000 are rejected
- `maxBodyBytes` — positive safe integer (counts bytes; fractional values rejected)
- `maxRedirects` — safe integer in `[MIN_REDIRECTS=0, MAX_REDIRECTS=10]`; 0 disables redirect following; fractional, negative, and values above 10 are rejected
- `retry.maxAttempts` — safe integer in `[MIN_RETRY_ATTEMPTS=1, MAX_RETRY_ATTEMPTS=10]`; 0, negative, fractional, and values above 10 are rejected
- `retry.initialDelayMs` — non-negative safe integer, at most `MAX_TIMEOUT_MS` (300 000 ms)
- `retry.backoffFactor` — finite number >= 1; computed delay is capped at `MAX_TIMEOUT_MS` before scheduling to prevent timer-overflow platform warnings
- `allowedHosts` — arrays of plain hostnames (no scheme, port, path, wildcard, or credentials); must contain at least two dot-separated labels; each label must match `[a-zA-Z0-9-]` (no leading/trailing hyphens); last label must not be all-numeric. Examples: `"example.com"`, `"api.example.com"`. Rejected: `"com"`, `"localhost"`, `"*.example.com"`, `"example.com:8080"`.
- `allowedContentTypes` — array of non-empty strings (max 253 chars, no control characters)

## Error codes

All errors are `AppError` instances from `@codegraph/errors`. Check `e.code` against `HttpClientErrorCodes`:

| Code                           | When thrown                                            |
|-------------------------------|--------------------------------------------------------|
| `HTTP_INVALID_POLICY`         | Policy validation failed at `createHttpClient`         |
| `HTTP_INVALID_REQUEST`        | Invalid method, headers, or oversized request body     |
| `HTTP_URL_DENIED`             | Initial URL blocked by SSRF policy                     |
| `HTTP_TIMEOUT`                | Per-attempt timeout exceeded                           |
| `HTTP_CANCELLED`              | Caller-supplied AbortSignal aborted                    |
| `HTTP_REDIRECT_DENIED`        | Redirect target blocked by SSRF policy                 |
| `HTTP_MAX_REDIRECTS_EXCEEDED` | Redirect count exceeded `maxRedirects`                 |
| `HTTP_MAX_BODY_EXCEEDED`      | Request or response body exceeded `maxBodyBytes`       |
| `HTTP_UNSUPPORTED_CONTENT_TYPE` | Content-Type not in `allowedContentTypes`            |
| `HTTP_JSON_PARSE_FAILED`      | 2xx body is not valid JSON (`requestJson` only)        |
| `HTTP_RETRY_EXHAUSTED`        | All retry attempts failed with network errors          |
| `HTTP_NETWORK_FAILURE`        | Network error (DNS, connection refused, etc.)          |

All `AppError.clientDetail` strings are static literals. No URLs, headers, IP addresses, tokens, or raw network error messages appear in any error field.

## Telemetry

Automatically records an OTel span `codegraph.http.request` and metrics `codegraph.http.request.count` / `codegraph.http.request.duration`. Span attributes are safe (no URLs, no headers, no bodies):

- `codegraph.http.method`
- `codegraph.http.target_host` (scheme + hostname only)
- `codegraph.http.status_code`
- `codegraph.http.retry_count`
- `codegraph.http.redirect_count`
- `codegraph.http.error_code` (on failure)

## Testing

Inject a mock fetch for unit tests:

```typescript
import { createHttpClient, requestJson } from '@codegraph/http-client';

const mockFetch: typeof fetch = async () =>
  new Response('{"id":1}', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const client = createHttpClient({ allowPrivate: true }, mockFetch);
const result = await requestJson(client, { url: 'http://localhost/api' });
```
