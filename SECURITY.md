# Security Policy

## Supported Versions

We provide security updates for the active release line:

| Version | Supported          |
| :------ | :----------------- |
| `0.1.x` | :white_check_mark: |
| `< 0.1` | :x:                |

---

## Security Architecture

`ts-codegraph` is engineered with safety as a primary design constraint:

- **Path Redaction**: Strips user home directories (`/Users/...`, `/home/...`) and system mount points from all emitted AST signatures, symbol locations, diagnostics, and JSON envelopes.
- **Credential Scrubbing**: Regex filters detect and redact credential-like tokens, API keys, password strings, and basic auth URLs from source code comments and JSDoc blocks before database ingestion.
- **Parameterized SQL**: All SQLite database interactions use parameterized queries via the managed SQLite runtime to prevent SQL injection.
- **Strict Template Sandbox**: Handlebars templates execute in an isolated environment with disabled prototype access and hardened block helpers.

---

## Reporting a Vulnerability

If you discover a security vulnerability in `ts-codegraph`, please **do NOT** open a public issue.

Instead, please report it privately:

1. Open a **GitHub Security Advisory** directly on the repository: [New Security Advisory](https://github.com/betaucourt/ts-codegraph/security/advisories/new)
2. Or contact the maintainer via email: `betaucourt@users.noreply.github.com`

### Our Commitment

- We will acknowledge receipt of your vulnerability report within **48 hours**.
- We will provide a detailed timeline for investigation and triage.
- Once a fix is verified, a patched release will be issued promptly with appropriate attribution.
