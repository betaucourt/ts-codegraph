---
type: Reference
title: ts-codegraph template generation
description: Deterministic template projection and OKF Markdown generation rules for ts-codegraph.
resource: apps/ts-codegraph/docs/features/template-generation.md
tags: [ts-codegraph, templates, generation, okf, evidence]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Template Generation

## Objective

Define how `ts-codegraph generate docs` turns loaded facts into deterministic OKF Markdown.

Templates consume plain validated data. They do not receive parser objects, database handles, filesystem access, or LLM output.

## Projection Keys

| Projection key | Now status |
| --- | --- |
| `project` | Include. |
| `repository` | Include safe snapshot and repo labels. |
| `pkg` | Include package identity, manifest path, exports, dependencies. |
| `exports` | Include explicit export paths and exported symbols. |
| `symbols` | Include exported classes, functions, interfaces, types, constants, signatures, optional JSDoc/comment text. |
| `diagnostics` | Include missing evidence and unsafe/skipped sections. |
| `evidence` | Include source fact IDs, safe source refs, and citation links. |
| `meta` | Include tool version, schema versions, template version, normalized timestamp. |
| `patterns` | Defer. |
| `calls` | Defer. |
| `switchMaps` | Defer. |
| `relationships` | Defer. |
| `security` | Defer. |
| `telemetry` | Defer. |
| `generatedDocs` | Defer to generated-document search unless needed for manifest links. |

## Template Engine Policy

Handlebars is a plausible first candidate because the archived templates use Handlebars-like blocks and helpers.

The product contract is not "Handlebars". The product contract is deterministic rendering over a runtime-validated, plain, serializable DTO with pure helpers.

## Missing Evidence Policy

Every generated statement must be one of:

- fixed template text;
- extracted metadata;
- extracted and sanitized JSDoc/comment text;
- deterministic projection from explicit facts;
- cited external information;
- diagnostic text.

Optional missing evidence removes the optional section. Required missing evidence diagnoses or skips the document.

## Determinism Rules

- Same source snapshot, dataset schema, template version, and normalized timestamp produce byte-identical Markdown.
- Template helpers are pure functions over the projection DTO.
- Template pack manifests declare required and optional facts.
- Runtime DTO validation passes before the template engine runs.
- Generated output is validated before it is written.

## Open Implementation Questions

| Question | Decision rule |
| --- | --- |
| Which runtime validation mechanism enforces DTOs? | Choose the smallest mechanism that validates command envelopes, template manifests, and projection DTOs with useful diagnostics. |
| What stable anchor rules should generated sections use? | Decide before generated-document search. |
| Should manifests live in artifacts, SQLite, or both? | Now writes a machine-readable manifest and minimal SQLite metadata; refine after generated-document search design. |
