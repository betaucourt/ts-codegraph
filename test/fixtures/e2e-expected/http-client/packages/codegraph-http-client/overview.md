---
type: "Package Overview"
title: "@codegraph/http-client — Package Overview"
description: "Generated package overview for @codegraph/http-client from snapshot snapshot:v1:project:v1:f9954c252c535953:worktree:4b437bdb10ad7d1cd6adbf417b756baa35d9c72236d4badc3ae2dee8a85684d2."
resource: "/packages/codegraph-http-client/overview.md"
tags: ["ts-codegraph", "generated", "package-overview"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.package-overview@1"
source_snapshot: "snapshot:v1:project:v1:f9954c252c535953:worktree:4b437bdb10ad7d1cd6adbf417b756baa35d9c72236d4badc3ae2dee8a85684d2"
template_id: "package-overview"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @codegraph/http-client — Package Overview

## Objective

`@codegraph/http-client` is a package in project `@codegraph/http-client`. Safe outbound HTTP wrapper with timeout, retry/backoff, redirect policy, max body, JSON/text parsing, SSRF protection, trace propagation, and telemetry

## Architecture & Surface Metrics

| Metric | Value | Provenance |
| :--- | :---: | :--- |
| **Exported Surface** | `5` files | Verified package entry points |
| **Public Symbols** | `28` declarations | Syntax-first AST extraction |
| **Dependencies** | `11` packages | `package.json` manifest |
| **Evidence Records** | `15` JSDoc blocks | AST comment provenance |

```mermaid
flowchart TD
    PKG["@codegraph/http-client"]
    subgraph DEPS["Dependencies (11)"]
        D_0["@codegraph/build (dev)"]
        D_1["@codegraph/errors (runtime)"]
        D_2["@codegraph/security (runtime)"]
        D_3["@codegraph/telemetry (runtime)"]
        D_4["@codegraph/testing (dev)"]
        D_5["@codegraph/weazel (dev)"]
        D_6["@opentelemetry/api (runtime)"]
        D_7["@types/node (dev)"]
        D_8["tsx (dev)"]
        D_9["typescript (dev)"]
        D_10["vitest (dev)"]
    end
    DEPS --> PKG
    subgraph EXPORTS["Exported Entry Points (5)"]
        E_0["src/client.ts"]
        E_1["src/generated/http-client-entities.ts"]
        E_2["src/index.ts"]
        E_3["src/policy.ts"]
        E_4["src/types.ts"]
    end
    PKG --> EXPORTS
```

## Exports

- `src/client.ts`
- `src/generated/http-client-entities.ts`
- `src/index.ts`
- `src/policy.ts`
- `src/types.ts`

## Dependencies

- `@codegraph/build` (`workspace:*`) — dev
- `@codegraph/errors` (`workspace:*`) — runtime
- `@codegraph/security` (`workspace:*`) — runtime
- `@codegraph/telemetry` (`workspace:*`) — runtime
- `@codegraph/testing` (`workspace:*`) — dev
- `@codegraph/weazel` (`workspace:*`) — dev
- `@opentelemetry/api` (`^1.9.1`) — runtime
- `@types/node` (`^22.15.21`) — dev
- `tsx` (`^4.19.4`) — dev
- `typescript` (`^5.8.3`) — dev
- `vitest` (`^3.2.3`) — dev

## Sources Used

- Package manifest `package.json` at snapshot `snapshot:v1:project:v1:f9954c252c535953:worktree:4b437bdb10ad7d1cd6adbf417b756baa35d9c72236d4badc3ae2dee8a85684d2`.
- `ENTITY_IDS` (constant) — documentation evidence.
- `ERROR_CODES` (constant) — documentation evidence.
- `HttpClient` (interface) — documentation evidence.
- `HttpClientResult` (interface) — documentation evidence.
- `MAX_REDIRECTS` (constant) — documentation evidence.
- `MAX_RETRY_ATTEMPTS` (constant) — documentation evidence.
- `MAX_TIMEOUT_MS` (constant) — documentation evidence.
- `MIN_REDIRECTS` (constant) — documentation evidence.
- `MIN_RETRY_ATTEMPTS` (constant) — documentation evidence.
- `MIN_TIMEOUT_MS` (constant) — documentation evidence.
- `TELEMETRY_ATTRIBUTES` (constant) — documentation evidence.
- `TELEMETRY_METRICS` (constant) — documentation evidence.
- `TELEMETRY_SPANS` (constant) — documentation evidence.
- `snapshotAndResolvePolicy` (function) — documentation evidence.
- `validateHttpClientPolicy` (function) — documentation evidence.
