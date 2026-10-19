---
type: Reference
title: ts-codegraph output contracts
description: JSON, diagnostic, stable ID, safety, and OKF output contracts for ts-codegraph commands.
resource: apps/ts-codegraph/docs/features/output-contracts.md
tags: [ts-codegraph, outputs, json, diagnostics, okf]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Output Contracts

## Objective

Define the first output contracts shared by `check`, `load`, `search`, and `generate docs`.

Stable machine-readable output is required before rich human output.

## JSON Envelope

Every command should use a shared JSON envelope in JSON mode:

```json
{
  "command": "check",
  "schemaVersion": "ts-codegraph.check@1",
  "ok": true,
  "data": {},
  "diagnostics": [],
  "warnings": [],
  "meta": {
    "toolVersion": "0.0.0",
    "datasetSchemaVersion": "ts-codegraph.dataset@1",
    "timestamp": "2026-07-03T00:00:00+02:00"
  }
}
```

## Envelope Rules

- JSON stdout contains only JSON in JSON mode.
- `schemaVersion` identifies the command contract.
- Fixture timestamps and tool versions are normalized.
- Diagnostics use stable codes and safe detail.
- JSON Schema Draft 2020-12 or an equivalent runtime schema mechanism should validate command envelopes.
- The concrete runtime validation mechanism is a Now implementation decision.

## Diagnostics

Diagnostics should include:

- stable `code`;
- `severity`;
- short message;
- safe source reference when available;
- safe detail;
- suggested next action when useful.

Diagnostics must not include:

- raw home paths;
- secrets;
- raw stack traces;
- raw SQL;
- raw command output;
- credential-bearing URLs;
- arbitrary source snippets.

## Stable IDs

Public IDs are deterministic strings with:

- type prefix;
- version;
- scope;
- normalized hash inputs.

SQLite row IDs are internal only.

Snapshot-scoped IDs are acceptable for Now. Cross-snapshot canonical IDs are Next or Later.

## Generated OKF Markdown

Generated Markdown must include local OKF frontmatter:

```yaml
---
type: Package Overview
title: Human readable title
description: One sentence summary.
resource: /packages/package-slug/overview.md
tags: [ts-codegraph, generated]
timestamp: 2026-07-03T00:00:00+02:00
generated_by: ts-codegraph generate
schema_version: ts-codegraph.package-overview@1
source_snapshot: snapshot-id
template_id: package-overview
template_version: template-version
dataset_schema_version: ts-codegraph.dataset@1
---
```

## Acceptance Gates

| Gate | Required proof |
| --- | --- |
| Command schemas | Each command has a stable schema version, envelope, diagnostics, fixture output, and clean stdout. |
| OKF validation | Generated docs parse and satisfy local OKF frontmatter and body rules. |
| Safety | Unsafe paths, secrets, raw stacks, SQL, command output, credential URLs, and arbitrary snippets are absent. |
| Stable IDs | Repeated load of the same snapshot yields the same public IDs. |
| No invented claims | Generated content is fixed template text, extracted facts, sanitized comments/JSDoc, citations, or diagnostics. |
