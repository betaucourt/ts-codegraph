---
type: Feature Spec
title: ts-codegraph check command
description: Live feature specification for the ts-codegraph check preflight command.
resource: apps/ts-codegraph/docs/features/check.md
tags: [ts-codegraph, feature, check, preflight]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Check Command

## Purpose

`check` validates that `load` and the selected documentation strategy should run for a target repository.

It is a strict preflight command. It does not mutate the dataset, parse the full repository, or render documentation.

## Likely Shape

```bash
ts-codegraph check --project ./repo --template-pack package-overview --json
```

`--template-pack` must name an installed pack; the shipped packs are
`package-overview` and `api-reference` (see [generate](./generate.md)).

## Reads

- Target path metadata.
- Git, repository, package, and workspace metadata.
- TypeScript config presence.
- Source traversal policy and limits.
- App data or configured dataset readiness.
- Template pack manifest presence and parseability.
- Output path strategy when supplied.

## Writes

Nothing durable.

`check` must not create a dataset, generated docs, manifests, cache files, or output directories.

## Refuses

- Full TypeScript parsing.
- Source fact persistence.
- Documentation rendering.
- Network calls.
- LLM calls.
- Broad `doctor` behavior.
- Unsafe absolute path echoing.

## Returns

`check` returns a `ts-codegraph.check@1` JSON envelope in JSON mode.

The result should include:

- per-gate `pass`, `warn`, or `fail`;
- stable diagnostic codes;
- redacted or safe path display;
- `willWrite: false`;
- template readiness results;
- likely next command guidance.

## Acceptance Gates

| Gate | Required proof |
| --- | --- |
| No mutation | Filesystem inspection or fixture diff proves no files are created or modified. |
| Stable diagnostics | Valid and invalid fixtures produce expected diagnostic codes. |
| Template pack check | Missing or invalid template pack fails before `load`. |
| Safe output | No raw home paths, secrets, raw stacks, raw SQL, raw command output, or credential-bearing URLs. |
| JSON mode | stdout contains only valid JSON when `--json` is used. |

## Kill Or Defer

If `check` needs full TypeScript parsing to be useful, keep deep checks out of Now and narrow the preflight promise.
