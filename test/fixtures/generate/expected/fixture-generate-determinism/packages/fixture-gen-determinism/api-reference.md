---
type: "API Reference"
title: "@fixture/gen-determinism — API Reference"
description: "Generated api reference for @fixture/gen-determinism from snapshot snapshot:v1:project:v1:2ee6b371758bd145:worktree:74dbb6f072703e473ecc00ad04ba31b5a22c8629632435f2d12fb8fedee655e9."
resource: "/packages/fixture-gen-determinism/api-reference.md"
tags: ["ts-codegraph", "generated", "api-reference"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.api-reference@1"
source_snapshot: "snapshot:v1:project:v1:2ee6b371758bd145:worktree:74dbb6f072703e473ecc00ad04ba31b5a22c8629632435f2d12fb8fedee655e9"
template_id: "api-reference"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# @fixture/gen-determinism — API Reference

## Objective

Public API surface for `@fixture/gen-determinism` in project `@fixture/gen-determinism`.

## API

### Quick Navigation

| Symbol | Kind | Source Location |
| :--- | :---: | :--- |
| [Counter](#Counter) | `class` | `src/index.ts:2` |
| [Op](#Op) | `type-alias` | `src/math.ts:4` |
| [ZERO](#ZERO) | `constant` | `src/math.ts:2` |
| [createCounter](#createCounter) | `function` | `src/index.ts:9` |

---

### Counter

- **Kind**: `class`
- **Source**: `src/index.ts:2`

```ts
export class Counter
```

A counter that only moves forward.

### Op

- **Kind**: `type-alias`
- **Source**: `src/math.ts:4`

```ts
export type Op = 'add' | 'sub';
```

### ZERO

- **Kind**: `constant`
- **Source**: `src/math.ts:2`

```ts
export const ZERO: 0
```

The identity element for addition.

### createCounter

- **Kind**: `function`
- **Source**: `src/index.ts:9`

```ts
export function createCounter(): Counter
```

Create a counter starting at zero.

## Sources Used

- `Counter` — `src/index.ts:2`
- `Op` — `src/math.ts:4`
- `ZERO` — `src/math.ts:2`
- `createCounter` — `src/index.ts:9`
