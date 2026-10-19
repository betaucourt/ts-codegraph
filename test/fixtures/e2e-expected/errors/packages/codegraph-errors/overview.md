---
type: "Package Overview"
title: "@codegraph/errors — Package Overview"
description: "Generated package overview for @codegraph/errors from snapshot snapshot:v1:project:v1:7587815a6db86532:worktree:eb35fbb8196f49ba24df029faad6ec0236fc98b9d8d7243b7456506f3e1e9faf."
resource: "/packages/codegraph-errors/overview.md"
tags: ["ts-codegraph", "generated", "package-overview"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.package-overview@1"
source_snapshot: "snapshot:v1:project:v1:7587815a6db86532:worktree:eb35fbb8196f49ba24df029faad6ec0236fc98b9d8d7243b7456506f3e1e9faf"
template_id: "package-overview"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @codegraph/errors — Package Overview

## Objective

`@codegraph/errors` is a package in project `@codegraph/errors`. Shared runtime error model for the CodeGraph/pay2 portfolio

## Architecture & Surface Metrics

| Metric | Value | Provenance |
| :--- | :---: | :--- |
| **Exported Surface** | `6` files | Verified package entry points |
| **Public Symbols** | `33` declarations | Syntax-first AST extraction |
| **Dependencies** | `7` packages | `package.json` manifest |
| **Evidence Records** | `2` JSDoc blocks | AST comment provenance |

```mermaid
flowchart TD
    PKG["@codegraph/errors"]
    subgraph DEPS["Dependencies (7)"]
        D_0["@codegraph/build (dev)"]
        D_1["@codegraph/testing (dev)"]
        D_2["@codegraph/weazel (dev)"]
        D_3["@types/node (dev)"]
        D_4["tsx (dev)"]
        D_5["typescript (dev)"]
        D_6["vitest (dev)"]
    end
    DEPS --> PKG
    subgraph EXPORTS["Exported Entry Points (6)"]
        E_0["src/core.ts"]
        E_1["src/generated/error-entities.ts"]
        E_2["src/index.ts"]
        E_3["src/problem-details.ts"]
        E_4["src/registry.ts"]
        E_5["src/sanitize.ts"]
    end
    PKG --> EXPORTS
```

## Exports

- `src/core.ts`
- `src/generated/error-entities.ts`
- `src/index.ts`
- `src/problem-details.ts`
- `src/registry.ts`
- `src/sanitize.ts`

## Dependencies

- `@codegraph/build` (`workspace:*`) — dev
- `@codegraph/testing` (`workspace:*`) — dev
- `@codegraph/weazel` (`workspace:*`) — dev
- `@types/node` (`^22.15.21`) — dev
- `tsx` (`^4.19.4`) — dev
- `typescript` (`^5.8.3`) — dev
- `vitest` (`^3.2.3`) — dev

## Sources Used

- Package manifest `package.json` at snapshot `snapshot:v1:project:v1:7587815a6db86532:worktree:eb35fbb8196f49ba24df029faad6ec0236fc98b9d8d7243b7456506f3e1e9faf`.
- `ENTITY_IDS` (constant) — documentation evidence.
- `ERROR_CODES` (constant) — documentation evidence.
