---
type: Strategy
title: ts-codegraph language strategy
description: TypeScript-first and evidence-gated language expansion strategy for ts-codegraph.
resource: apps/ts-codegraph/docs/features/language-strategy.md
tags: [ts-codegraph, language-strategy, typescript, go]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Language Strategy

## Objective

Keep the first implementation focused while leaving a clean path for later language expansion.

## First Language

TypeScript is first.

The first implementation should prove:

- repository and package discovery;
- TypeScript config discovery;
- public/exported symbol extraction;
- signatures;
- bounded JSDoc/comment evidence;
- SQLite fact persistence;
- source search;
- package overview generation;
- API reference generation.

## Not Now

Do not add Go, a third language, generic parser abstractions, or cross-language graph semantics in the first implementation.

The roadmap should not hardcode TypeScript as the permanent product identity, but it should avoid pretending the language abstraction is proven before TypeScript fixtures pass.

## Later Expansion

| Expansion | Entry condition |
| --- | --- |
| Go | A real Go target or high-quality fixture proves value and model fit. |
| Third language | TypeScript and Go evidence identify the next valuable language. |
| Cross-language search | Per-language fact models are stable enough to map into shared search concepts. |
| Cross-language graph | Relationship model proves value after docs and source search are useful. |

## Product-Local Boundary

Keep language extraction policy inside `ts-codegraph` until reuse is proven.

`ts-codegraph` may provide shared mechanisms such as traversal, repository inventory, SQLite primitives, diagnostics, and artifacts. It should not own the product-specific TypeScript fact schema, parser policy, generated-doc projection, or roadmap semantics.
