---
type: "Package Overview"
title: "@fixture/gen-determinism — Package Overview"
description: "Generated package overview for @fixture/gen-determinism from snapshot snapshot:v1:project:v1:2ee6b371758bd145:worktree:74dbb6f072703e473ecc00ad04ba31b5a22c8629632435f2d12fb8fedee655e9."
resource: "/packages/fixture-gen-determinism/overview.md"
tags: ["ts-codegraph", "generated", "package-overview"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.package-overview@1"
source_snapshot: "snapshot:v1:project:v1:2ee6b371758bd145:worktree:74dbb6f072703e473ecc00ad04ba31b5a22c8629632435f2d12fb8fedee655e9"
template_id: "package-overview"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @fixture/gen-determinism — Package Overview

## Objective

`@fixture/gen-determinism` is a package in project `@fixture/gen-determinism`.

## Architecture & Surface Metrics

| Metric | Value | Provenance |
| :--- | :---: | :--- |
| **Exported Surface** | `2` files | Verified package entry points |
| **Public Symbols** | `4` declarations | Syntax-first AST extraction |
| **Dependencies** | `2` packages | `package.json` manifest |
| **Evidence Records** | `3` JSDoc blocks | AST comment provenance |

```mermaid
flowchart TD
    PKG["@fixture/gen-determinism"]
    subgraph DEPS["Dependencies (2)"]
        D_0["@fixture/dep-a (runtime)"]
        D_1["typescript (dev)"]
    end
    DEPS --> PKG
    subgraph EXPORTS["Exported Entry Points (2)"]
        E_0["src/index.ts"]
        E_1["src/math.ts"]
    end
    PKG --> EXPORTS
```

## Exports

- `src/index.ts`
- `src/math.ts`

## Dependencies

- `@fixture/dep-a` (`^1.0.0`) — runtime
- `typescript` (`^5.8.3`) — dev

## Sources Used

- Package manifest `package.json` at snapshot `snapshot:v1:project:v1:2ee6b371758bd145:worktree:74dbb6f072703e473ecc00ad04ba31b5a22c8629632435f2d12fb8fedee655e9`.
- `Counter` (class) — documentation evidence.
- `ZERO` (constant) — documentation evidence.
- `createCounter` (function) — documentation evidence.
