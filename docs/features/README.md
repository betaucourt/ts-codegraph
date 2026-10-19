---
type: Feature Index
title: ts-codegraph feature overview
description: Live feature overview for the ts-codegraph check, load, search, and template-oriented generate commands.
resource: apps/ts-codegraph/docs/features/README.md
tags: [ts-codegraph, features, commands, okf]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Feature Overview

## Objective

Describe the live product feature surface after the roadmap thinking process.

`ts-codegraph` should make documentation trustworthy by construction:

```text
check validates readiness.
load writes durable facts.
search retrieves loaded facts.
generate docs renders OKF Markdown from loaded facts.
```

## First Useful Workflow

1. A developer runs `ts-codegraph check --project ./repo --template-pack default --json`.
2. A developer runs `ts-codegraph load --project ./repo --json`.
3. A developer runs `ts-codegraph search --project ./repo "AppError" --json`.
4. A developer runs `ts-codegraph generate docs --project ./repo --template all --output ./docs/generated --json`.
5. Generated Markdown is byte-stable for the same snapshot, template version, schema version, and normalized timestamp policy.

## Now Feature Bets

| Bet | Feature area | First proof |
| --- | --- | --- |
| Contract and OKF validator | JSON envelopes, diagnostics, generated Markdown validation. | Fixture JSON and Markdown pass schema, OKF, and safety checks. |
| Check preflight | `check` command. | Valid and invalid fixtures prove no mutation and stable diagnostics. |
| Minimal TypeScript fact load | `load` command and fact store. | Tiny fixture and one real internal package load with stable facts. |
| Source search over loaded facts | `search` command. | Queries return stable IDs and match reasons. |
| Package overview generation | `generate docs --template package-overview`. | Byte-stable OKF package overview with evidence or diagnostics. |
| API reference generation | `generate docs --template api-reference`. | Byte-stable OKF API reference for exported TypeScript declarations. |

## Removed Or Deferred

| Surface | Decision |
| --- | --- |
| `resumee` | Removed. Summary behavior is absorbed by `check`, `load` JSON, `search`, generated docs, or later proven reports. |
| Graph/Mermaid generation | Deferred until source search and generated docs reveal a relationship navigation gap. |
| LLM-generated documentation | Deferred until deterministic docs, citations, and missing-evidence behavior are stable. |
| Developer guide template | Next, only after examples, tests, or JSDoc `@example` evidence exists. |
| Security and telemetry templates | Later, evidence-gated. |
| Go and another language | Later, after TypeScript foundations are stable. |

## Feature Invariants

- `load` is the only command that creates or updates source facts.
- `generate docs` reads loaded facts; it does not parse source directly.
- `search` reads the dataset; it does not scan files, reparse source, or call AI.
- Generated docs must be OKF Markdown with required local frontmatter.
- Missing evidence omits optional sections or emits diagnostics.
- No generated text may invent claims.
- Product-specific parser, fact schema, template projection, ranking, and generated-doc logic stay local to `ts-codegraph`.
