---
type: "Package Overview"
title: "@fixture/load-tiny — Package Overview"
description: "Generated package overview for @fixture/load-tiny from snapshot snapshot:v1:project:v1:8423430b9f07e8ae:worktree:cfaa933199bac7c768498f2dee4dcdeda453ff22c1ad7100fc78ad0d5bd30e23."
resource: "/packages/fixture-load-tiny/overview.md"
tags: ["ts-codegraph", "generated", "package-overview"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.package-overview@1"
source_snapshot: "snapshot:v1:project:v1:8423430b9f07e8ae:worktree:cfaa933199bac7c768498f2dee4dcdeda453ff22c1ad7100fc78ad0d5bd30e23"
template_id: "package-overview"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @fixture/load-tiny — Package Overview

## Objective

`@fixture/load-tiny` is a package in project `@fixture/load-tiny`.

## Architecture & Surface Metrics

| Metric | Value | Provenance |
| :--- | :---: | :--- |
| **Exported Surface** | `2` files | Verified package entry points |
| **Public Symbols** | `4` declarations | Syntax-first AST extraction |
| **Dependencies** | `2` packages | `package.json` manifest |
| **Evidence Records** | `3` JSDoc blocks | AST comment provenance |

```mermaid
flowchart TD
    PKG["@fixture/load-tiny"]
    subgraph DEPS["Dependencies (2)"]
        D_0["@fixture/dep-a (runtime)"]
        D_1["typescript (dev)"]
    end
    DEPS --> PKG
    subgraph EXPORTS["Exported Entry Points (2)"]
        E_0["src/index.ts"]
        E_1["src/util.ts"]
    end
    PKG --> EXPORTS
```

## Exports

- `src/index.ts`
- `src/util.ts`

## Dependencies

- `@fixture/dep-a` (`^1.0.0`) — runtime
- `typescript` (`^5.8.3`) — dev

## Sources Used

- Package manifest `package.json` at snapshot `snapshot:v1:project:v1:8423430b9f07e8ae:worktree:cfaa933199bac7c768498f2dee4dcdeda453ff22c1ad7100fc78ad0d5bd30e23`.
- `UTIL_VERSION` (constant) — documentation evidence.
- `Widget` (class) — documentation evidence.
- `createWidget` (function) — documentation evidence.
