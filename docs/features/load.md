---
type: Feature Spec
title: ts-codegraph load command
description: Live feature specification for the ts-codegraph load command and durable TypeScript fact store.
resource: apps/ts-codegraph/docs/features/load.md
tags: [ts-codegraph, feature, load, sqlite, typescript]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Load Command

## Purpose

`load` discovers, parses, and persists repository facts.

It owns the durable source-fact boundary. `search` and `generate docs` depend on facts written by `load`.

## Likely Shape

```bash
ts-codegraph load --project ./repo --json
```

## Reads

- Target repository.
- Git snapshot or deterministic dirty worktree hash inputs.
- Package manifests and workspace metadata.
- TypeScript configs.
- Included TypeScript source files through safe traversal.
- Previous dataset metadata.

## Writes

- Product-local SQLite dataset.
- Migrations.
- Load run.
- Snapshot.
- Package facts.
- Source file facts and content hashes.
- Export and public symbol facts.
- Signature facts.
- Bounded JSDoc/comment evidence.
- Diagnostics.
- Search documents derived from loaded facts.

## Minimum Fact Model

| Fact | Purpose | Now decision |
| --- | --- | --- |
| Project | Dataset scope. | Stable product-local ID with no raw machine path in public output. |
| Snapshot | Repeatability and generation provenance. | Git commit or deterministic dirty-worktree hash policy. |
| Load run | Execution record and diagnostics. | Separate from snapshot. |
| Package | Overview and search scope. | Derived from manifests, no registry calls in Now. |
| Source file | Evidence scope. | Repo-relative path plus content hash; no full source text by default. |
| Export | Overview and API surface. | Include export path and linked symbols where resolvable. |
| Symbol | API reference and search target. | Public/exported declarations only in Now. |
| Signature | API reference. | Store declaration/signature text, not bodies. |
| Comment evidence | Optional generated prose and citations. | Sanitize and bound; missing text does not invent prose. |
| Diagnostic | Safe missing or unsupported evidence. | Stable codes and safe detail. |
| Search document | Search surface. | Derived from facts, not raw source. |

## Refuses

- Documentation rendering by default.
- Graph/Mermaid generation.
- LLM or network enrichment.
- Full source storage by default.
- Registry lookups in Now.
- Raw compiler output in public JSON.
- `ts-morph` objects outside the product-local extractor boundary.

## Returns

`load` returns a `ts-codegraph.load@1` JSON envelope.

The result should include:

- `projectId`;
- `snapshotId`;
- `loadRunId`;
- counts;
- changed/skipped summary;
- safe diagnostics;
- search index status;
- generated-doc readiness hints.

## Acceptance Gates

| Gate | Required proof |
| --- | --- |
| Migration baseline | First schema migration creates all required Now tables on a clean dataset. |
| Transaction integrity | Failed `load` leaves no current partial snapshot or partial search state. |
| Stable IDs | Repeated load of the same snapshot yields the same public IDs. |
| Minimal extractor | Tiny fixture and one real internal package load public/exported TypeScript symbols. |
| Safety | No raw home paths, secrets, raw stacks, raw SQL, raw command output, or arbitrary source snippets. |
| Performance baseline | Measure tiny fixture and one real internal package before setting a hard threshold. |

## Kill Or Defer

If stable exported-symbol facts cannot be extracted from two real packages after focused redesign, stop before building `search` or `generate` on unstable facts.
