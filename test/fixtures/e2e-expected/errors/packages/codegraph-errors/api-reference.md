---
type: "API Reference"
title: "@codegraph/errors — API Reference"
description: "Generated api reference for @codegraph/errors from snapshot snapshot:v1:project:v1:7587815a6db86532:worktree:eb35fbb8196f49ba24df029faad6ec0236fc98b9d8d7243b7456506f3e1e9faf."
resource: "/packages/codegraph-errors/api-reference.md"
tags: ["ts-codegraph", "generated", "api-reference"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.api-reference@1"
source_snapshot: "snapshot:v1:project:v1:7587815a6db86532:worktree:eb35fbb8196f49ba24df029faad6ec0236fc98b9d8d7243b7456506f3e1e9faf"
template_id: "api-reference"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @codegraph/errors — API Reference

## Objective

Public API surface for `@codegraph/errors` in project `@codegraph/errors`.

## API

### Quick Navigation

| Symbol | Kind | Source Location |
| :--- | :---: | :--- |
| [APP_ERROR_CATEGORIES](#APP_ERROR_CATEGORIES) | `constant` | `src/core.ts:16` |
| [AppError](#AppError) | `class` | `src/core.ts:97` |
| [AppErrorAttributes](#AppErrorAttributes) | `interface` | `src/core.ts:51` |
| [AppErrorCategory](#AppErrorCategory) | `type-alias` | `src/core.ts:28` |
| [AppErrorCode](#AppErrorCode) | `type-alias` | `src/core.ts:14` |
| [AppErrorOptions](#AppErrorOptions) | `interface` | `src/core.ts:38` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/generated/error-entities.ts:6` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/generated/error-entities.ts:21` |
| [EntityId](#EntityId) | `type-alias` | `src/generated/error-entities.ts:18` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/generated/error-entities.ts:34` |
| [ErrorCodeMeta](#ErrorCodeMeta) | `interface` | `src/registry.ts:4` |
| [ErrorRegistry](#ErrorRegistry) | `class` | `src/registry.ts:14` |
| [FieldViolation](#FieldViolation) | `interface` | `src/core.ts:30` |
| [ProblemDetails](#ProblemDetails) | `interface` | `src/problem-details.ts:6` |
| [SafeError](#SafeError) | `interface` | `src/problem-details.ts:18` |
| [ToProblemDetailsOptions](#ToProblemDetailsOptions) | `interface` | `src/problem-details.ts:26` |
| [createAppError](#createAppError) | `function` | `src/core.ts:168` |
| [createErrorRegistry](#createErrorRegistry) | `function` | `src/registry.ts:41` |
| [getCliExitCodeForError](#getCliExitCodeForError) | `function` | `src/registry.ts:56` |
| [getHttpStatusForError](#getHttpStatusForError) | `function` | `src/registry.ts:50` |
| [isAppError](#isAppError) | `function` | `src/core.ts:164` |
| [isRetryableError](#isRetryableError) | `function` | `src/registry.ts:83` |
| [normalizeAppError](#normalizeAppError) | `function` | `src/core.ts:175` |
| [sanitizeBaseType](#sanitizeBaseType) | `function` | `src/sanitize.ts:81` |
| [sanitizeClientDetail](#sanitizeClientDetail) | `function` | `src/sanitize.ts:58` |
| [sanitizeCode](#sanitizeCode) | `function` | `src/sanitize.ts:31` |
| [sanitizeFieldViolations](#sanitizeFieldViolations) | `function` | `src/sanitize.ts:116` |
| [sanitizeHttpStatus](#sanitizeHttpStatus) | `function` | `src/sanitize.ts:39` |
| [sanitizeTitle](#sanitizeTitle) | `function` | `src/sanitize.ts:49` |
| [sanitizeTraceId](#sanitizeTraceId) | `function` | `src/sanitize.ts:69` |
| [toProblemDetails](#toProblemDetails) | `function` | `src/problem-details.ts:34` |
| [toSafeError](#toSafeError) | `function` | `src/problem-details.ts:81` |
| [withErrorCause](#withErrorCause) | `function` | `src/core.ts:187` |

---

### APP_ERROR_CATEGORIES

- **Kind**: `constant`
- **Source**: `src/core.ts:16`

```ts
export const APP_ERROR_CATEGORIES: readonly ["validation", "authn", "authz", "not_found", "conflict", "rate_limited", "upstream", "timeout", "unavailable", "internal"]
```

### AppError

- **Kind**: `class`
- **Source**: `src/core.ts:97`

```ts
export class AppError extends Error
```

### AppErrorAttributes

- **Kind**: `interface`
- **Source**: `src/core.ts:51`

```ts
export interface AppErrorAttributes { readonly code: AppErrorCode; readonly category: AppErrorCategory; readonly retryable: boolean; readonly httpStatus: number; }
```

### AppErrorCategory

- **Kind**: `type-alias`
- **Source**: `src/core.ts:28`

```ts
export type AppErrorCategory = (typeof APP_ERROR_CATEGORIES)[number];
```

### AppErrorCode

- **Kind**: `type-alias`
- **Source**: `src/core.ts:14`

```ts
export type AppErrorCode = string;
```

### AppErrorOptions

- **Kind**: `interface`
- **Source**: `src/core.ts:38`

```ts
export interface AppErrorOptions { code: AppErrorCode; category: AppErrorCategory; title: string; clientDetail?: string; retryable?: boolean; httpStatus?: number; fields?: readonly FieldViolation[]; cause?: unknown; }
```

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/generated/error-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_ERRORS: "codegraph.errors"; readonly CODEGRAPH_ERRORS_API_APP_ERROR: "codegraph.errors.api.app-error"; readonly CODEGRAPH_ERRORS_API_CLI_EXIT: "codegraph.errors.api.cli-exit"; readonly CODEGRAPH_ERRORS_API_NORMALIZATION: "codegraph.errors.api.normalization"; readonly CODEGRAPH_ERRORS_API_PROBLEM_DETAILS: "codegraph.errors.api.problem-details"; readonly CODEGRAPH_ERRORS_API_REGISTRY: "codegraph.errors.api.registry"; readonly CODEGRAPH_ERRORS_ERRORS_APP_ERRORS: "codegraph.errors.errors.app-errors"; readonly CODEGRAPH_ERRORS_GENERATED_ERROR_CODES: "codegraph.errors.generated.error-codes"; readonly CODEGRAPH_ERRORS_SECURITY_ERROR_SERIALIZATION_POLICY: "codegraph.errors.security.error-serialization-policy"; }
```

Entity IDs

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/generated/error-entities.ts:21`

```ts
export const ERROR_CODES: { readonly CONFLICT: "CONFLICT"; readonly FORBIDDEN: "FORBIDDEN"; readonly INTERNAL: "INTERNAL"; readonly NOT_FOUND: "NOT_FOUND"; readonly RATE_LIMITED: "RATE_LIMITED"; readonly TIMEOUT: "TIMEOUT"; readonly UNAUTHORIZED: "UNAUTHORIZED"; readonly UNAVAILABLE: "UNAVAILABLE"; readonly UPSTREAM_ERROR: "UPSTREAM_ERROR"; readonly VALIDATION: "VALIDATION"; }
```

Error codes

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/generated/error-entities.ts:18`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/generated/error-entities.ts:34`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCodeMeta

- **Kind**: `interface`
- **Source**: `src/registry.ts:4`

```ts
export interface ErrorCodeMeta { readonly category: AppErrorCategory; readonly title: string; readonly retryable: boolean; readonly clientSafe: boolean; }
```

### ErrorRegistry

- **Kind**: `class`
- **Source**: `src/registry.ts:14`

```ts
export class ErrorRegistry
```

### FieldViolation

- **Kind**: `interface`
- **Source**: `src/core.ts:30`

```ts
export interface FieldViolation { readonly field: string; readonly message: string; readonly code?: string; }
```

### ProblemDetails

- **Kind**: `interface`
- **Source**: `src/problem-details.ts:6`

```ts
export interface ProblemDetails { readonly type: string; readonly title: string; readonly status: number; readonly code: string; readonly detail?: string; readonly traceId?: string; readonly fields?: readonly FieldViolation[]; }
```

### SafeError

- **Kind**: `interface`
- **Source**: `src/problem-details.ts:18`

```ts
export interface SafeError { readonly code: string; readonly category: string; readonly title: string; readonly retryable: boolean; readonly httpStatus: number; }
```

### ToProblemDetailsOptions

- **Kind**: `interface`
- **Source**: `src/problem-details.ts:26`

```ts
export interface ToProblemDetailsOptions { readonly traceId?: string; readonly baseType?: string; }
```

### createAppError

- **Kind**: `function`
- **Source**: `src/core.ts:168`

```ts
export function createAppError(opts: AppErrorOptions): AppError
```

### createErrorRegistry

- **Kind**: `function`
- **Source**: `src/registry.ts:41`

```ts
export function createErrorRegistry( family: string, entries: Readonly<Record<string, ErrorCodeMeta>>, ): ErrorRegistry
```

### getCliExitCodeForError

- **Kind**: `function`
- **Source**: `src/registry.ts:56`

```ts
export function getCliExitCodeForError(error: AppError): number
```

### getHttpStatusForError

- **Kind**: `function`
- **Source**: `src/registry.ts:50`

```ts
export function getHttpStatusForError(error: AppError): number
```

### isAppError

- **Kind**: `function`
- **Source**: `src/core.ts:164`

```ts
export function isAppError(value: unknown): value is AppError
```

### isRetryableError

- **Kind**: `function`
- **Source**: `src/registry.ts:83`

```ts
export function isRetryableError(value: unknown): boolean
```

### normalizeAppError

- **Kind**: `function`
- **Source**: `src/core.ts:175`

```ts
export function normalizeAppError(value: unknown): AppError
```

### sanitizeBaseType

- **Kind**: `function`
- **Source**: `src/sanitize.ts:81`

```ts
export function sanitizeBaseType(baseType: string): string
```

### sanitizeClientDetail

- **Kind**: `function`
- **Source**: `src/sanitize.ts:58`

```ts
export function sanitizeClientDetail(detail: string): string | undefined
```

### sanitizeCode

- **Kind**: `function`
- **Source**: `src/sanitize.ts:31`

```ts
export function sanitizeCode(code: string): string
```

### sanitizeFieldViolations

- **Kind**: `function`
- **Source**: `src/sanitize.ts:116`

```ts
export function sanitizeFieldViolations( fields: readonly FieldViolation[], ): readonly FieldViolation[]
```

### sanitizeHttpStatus

- **Kind**: `function`
- **Source**: `src/sanitize.ts:39`

```ts
export function sanitizeHttpStatus(status: number, fallback: number): number
```

### sanitizeTitle

- **Kind**: `function`
- **Source**: `src/sanitize.ts:49`

```ts
export function sanitizeTitle(title: string, fallback: string = SAFE_TITLE_FALLBACK): string
```

### sanitizeTraceId

- **Kind**: `function`
- **Source**: `src/sanitize.ts:69`

```ts
export function sanitizeTraceId(traceId: string): string | undefined
```

### toProblemDetails

- **Kind**: `function`
- **Source**: `src/problem-details.ts:34`

```ts
export function toProblemDetails( error: AppError, opts?: ToProblemDetailsOptions, ): ProblemDetails
```

### toSafeError

- **Kind**: `function`
- **Source**: `src/problem-details.ts:81`

```ts
export function toSafeError(error: AppError): SafeError
```

### withErrorCause

- **Kind**: `function`
- **Source**: `src/core.ts:187`

```ts
export function withErrorCause(error: AppError, cause: unknown): AppError
```

## Sources Used

- `APP_ERROR_CATEGORIES` — `src/core.ts:16`
- `AppError` — `src/core.ts:97`
- `AppErrorAttributes` — `src/core.ts:51`
- `AppErrorCategory` — `src/core.ts:28`
- `AppErrorCode` — `src/core.ts:14`
- `AppErrorOptions` — `src/core.ts:38`
- `ENTITY_IDS` — `src/generated/error-entities.ts:6`
- `ERROR_CODES` — `src/generated/error-entities.ts:21`
- `EntityId` — `src/generated/error-entities.ts:18`
- `ErrorCode` — `src/generated/error-entities.ts:34`
- `ErrorCodeMeta` — `src/registry.ts:4`
- `ErrorRegistry` — `src/registry.ts:14`
- `FieldViolation` — `src/core.ts:30`
- `ProblemDetails` — `src/problem-details.ts:6`
- `SafeError` — `src/problem-details.ts:18`
- `ToProblemDetailsOptions` — `src/problem-details.ts:26`
- `createAppError` — `src/core.ts:168`
- `createErrorRegistry` — `src/registry.ts:41`
- `getCliExitCodeForError` — `src/registry.ts:56`
- `getHttpStatusForError` — `src/registry.ts:50`
- `isAppError` — `src/core.ts:164`
- `isRetryableError` — `src/registry.ts:83`
- `normalizeAppError` — `src/core.ts:175`
- `sanitizeBaseType` — `src/sanitize.ts:81`
- `sanitizeClientDetail` — `src/sanitize.ts:58`
- `sanitizeCode` — `src/sanitize.ts:31`
- `sanitizeFieldViolations` — `src/sanitize.ts:116`
- `sanitizeHttpStatus` — `src/sanitize.ts:39`
- `sanitizeTitle` — `src/sanitize.ts:49`
- `sanitizeTraceId` — `src/sanitize.ts:69`
- `toProblemDetails` — `src/problem-details.ts:34`
- `toSafeError` — `src/problem-details.ts:81`
- `withErrorCause` — `src/core.ts:187`
