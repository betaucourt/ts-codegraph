---
type: Feature Spec
title: ts-codegraph search command
description: Live feature specification for source and generated-document search in ts-codegraph.
resource: apps/ts-codegraph/docs/features/search.md
tags: [ts-codegraph, feature, search, sqlite, fts]
timestamp: 2026-07-03T00:00:00+02:00
---

# ts-codegraph Search Command

## Purpose

`search` retrieves loaded facts without reparsing source.

The first search feature proves that the fact store is useful before documentation surfaces become richer.

## Likely Shape

```bash
ts-codegraph search --project ./repo "AppError" --json
```

## First Search Scope

- Packages.
- Source files by safe repo-relative label.
- Public/exported TypeScript symbols.
- Exports.
- Diagnostics.
- Search documents derived from loaded facts.

## Next Search Scope

- Generated OKF documents.
- Generated sections.
- Citation links.
- Generated-document diagnostics.

Generated-document search should not block the first release unless it falls out naturally from stable manifest metadata.

## Reads

- SQLite fact store.
- Search tables or FTS virtual tables.

## Writes

Nothing durable in the first implementation.

## Refuses

- Source reparsing.
- Filesystem scans.
- LLM calls.
- Raw source snippets.
- Generated Markdown file search as the primary search mechanism.

## Returns

`search` returns a `ts-codegraph.search@1` JSON envelope.

Results should include:

- stable result ID;
- target kind;
- safe label;
- package or file context;
- rank;
- match reasons;
- snapshot ID;
- source or citation references when available.

## Search Policy

Now assumes SQLite FTS5 or an equivalent local search mechanism.

Approximate matching in Now means normalized token, prefix, and identifier-aware matching. Trigram tokenization is an assumption test, not the default.

## Acceptance Gates

| Gate | Required proof |
| --- | --- |
| Source search | Fixture queries return expected stable IDs and match reasons. |
| No reparse | Command does not read TypeScript source to answer queries. |
| Empty result | Empty-result queries return valid JSON and no false success claim. |
| Safe context | Results do not expose raw snippets or unsafe absolute paths. |
| Ranking baseline | Package and symbol queries return obvious matches before fuzzy expansion. |

## Kill Or Defer

If standard FTS5 cannot find obvious symbol or package matches, evaluate trigram before expanding search scope.

If generated-section IDs or anchor policy are unstable, defer generated-document search.
