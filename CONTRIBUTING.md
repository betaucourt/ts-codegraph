# Contributing to ts-codegraph

Thank you for your interest in contributing to `ts-codegraph`! This guide explains our architecture, development workflow, and safety expectations.

---

## Architecture & Core Principles

`ts-codegraph` is designed for high-assurance TypeScript codebase intelligence and documentation generation:

1. **Syntax-First AST Extraction**: We extract declarations, signatures, and JSDoc blocks strictly from verified AST nodes using `ts-morph` and the TypeScript compiler API.
2. **Native SQLite FTS5 Storage**: Codebase facts are persisted and indexed in an embedded SQLite database using FTS5 for sub-millisecond symbol search.
3. **Zero-Hallucination Documentation**: Documentation is projected deterministically from verified database facts into Handlebars templates, never synthesized or hallucinated.
4. **Strict OKF Contract Compliance**: Generated documentation conforms to the Open Knowledge Format (OKF) specification with mandatory metadata frontmatter and evidence provenance sections (`## Objective`, `## Sources Used`).
5. **Multi-Rule Secret and Path Redaction**: Every emitted signature, diagnostic, and JSDoc block passes through redaction pipelines to ensure local paths (`/Users/...`, `/home/...`) and sensitive credentials never leak into generated output.

---

## Development Setup

### Prerequisites

- **Node.js**: `v22.0.0` or later (tested on Node 20.x and 22.x)
- **pnpm**: `11.17.0` or later

### Installation

```bash
# Clone the repository
git clone git@github.com:betaucourt/ts-codegraph.git
cd ts-codegraph

# Install dependencies with pnpm
pnpm install
```

---

## Testing & Verification

We enforce a strict test-driven development (TDD) cycle. All PRs must maintain 100% test passage and clean typechecking:

```bash
# Run type checking across source and test targets
npm run typecheck

# Run the full Vitest suite (208+ unit, contract, redaction, and e2e tests)
npm test

# Build production artifacts
npm run build
```

### Safety & Redaction Rules

If adding new fact extractors or template projections:
- Never expose unredacted absolute system paths.
- Ensure all emitted documents pass `validateGeneratedDoc` from `src/contracts/okf.ts`.
- If modifying Handlebars templates, regenerate expected fixtures via `test/e2e/helpers.ts` and verify byte-identical reproducibility.

---

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(scope)`: New features or capabilities
- `fix(scope)`: Bug fixes
- `docs(scope)`: Documentation changes
- `test(scope)`: Test additions or fixture updates
- `refactor(scope)`: Code refactoring without behavior changes
- `ci(scope)`: CI/CD configuration updates

---

## Submitting Changes

1. Create a feature branch: `git checkout -b feat/my-improvement`.
2. Implement your changes following existing patterns and test coverage.
3. Run `npm run typecheck`, `npm test`, and `npm run build` locally.
4. Open a Pull Request with a clear description of the problem solved.
