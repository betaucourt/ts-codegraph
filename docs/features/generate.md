---
type: Feature Spec
title: ts-codegraph generate docs command
description: Live feature specification for deterministic template-generated OKF Markdown in ts-codegraph.
resource: apps/ts-codegraph/docs/features/generate.md
tags: [ts-codegraph, feature, generate, templates, okf]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Generate Docs Command

## Purpose

`generate docs` renders deterministic OKF Markdown from loaded facts and approved templates.

This replaces the old graph-first `generate` direction. Graph and Mermaid output are deferred.

## Likely Shape

```bash
ts-codegraph generate docs --project ./repo --template package-overview --output ./docs/generated --json
ts-codegraph generate docs --project ./repo --template api-reference --output ./docs/generated --json
ts-codegraph generate docs --project ./repo --template all --output ./docs/generated --json
```

## Reads

- Current loaded dataset.
- Selected snapshot.
- Template pack manifest.
- Product-local projection code.
- Local OKF validation rules.

## Writes

- OKF Markdown files to explicit output path.
- Artifact manifest.
- Generated document metadata.
- Generation diagnostics.
- Content hashes.

## Refuses

- Source parsing.
- LLM prose generation.
- Graph/Mermaid-first output.
- User-supplied arbitrary template paths in the first implementation.
- Invented claims.
- Unsafe absolute paths, raw stacks, raw SQL, credential-bearing URLs, secrets, or arbitrary source snippets.

## Returns

`generate` returns a `ts-codegraph.generate@1` JSON envelope.

The result should include:

- generated docs;
- skipped docs;
- diagnostics;
- manifest path;
- content hashes;
- template version;
- dataset schema version;
- determinism inputs.

## First Templates

| Template | Purpose | Now decision |
| --- | --- | --- |
| `package-overview` | Package identity, exports, dependencies, diagnostics, and evidence. | First milestone. |
| `api-reference` | Public/exported TypeScript declarations, signatures, optional JSDoc/comment text, and citations. | First milestone. |

## Next And Later Templates

| Template or renderer | Horizon | Entry condition |
| --- | --- | --- |
| Developer guide | Next | Examples, tests, or JSDoc `@example` facts are extractable on two real packages. |
| Security model | Later | Explicit security annotations or reliable source evidence exists. |
| Telemetry reference | Later | Instrumentation calls and attributes can be detected safely. |
| Graph/Mermaid renderer | Later | A real relationship navigation gap remains after docs and search exist. |
| LLM enrichment | Later | Deterministic docs, citations, and missing-evidence diagnostics are stable. |

## Acceptance Gates

| Gate | Required proof |
| --- | --- |
| OKF validation | Generated docs have required frontmatter, allowed extensions, safe body, and evidence sections when claims are sourced. |
| Determinism | Same snapshot, schema, template version, and normalized timestamp produce byte-identical Markdown. |
| No invented claims | Text maps to template boilerplate, extracted facts, sanitized comments/JSDoc, citations, or diagnostics. |
| Explicit output | Repo-local writes require explicit `--output`. |
| Missing evidence | Optional sections disappear; required gaps diagnose or skip docs. |
| Manifest | Generated docs link to snapshot, template version, content hash, and source facts. |

## Kill Or Defer

If package overview or API reference output is mostly empty or diagnostic on real internal packages, keep generation blocked and revisit the fact model.

If ordinary exported declarations cannot be identified with stable IDs, block API reference generation and fix `load`.
