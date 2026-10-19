import { createRedactor, redactValue } from '../internal/security/index.js';

import type { SanitizedEvidence } from './types.js';

/**
 * Evidence and text sanitization (step-04 §3, decision record §6).
 *
 * All JSDoc/comment evidence, every emitted signature/declaration text, and every
 * declared-type text pass through here before leaving the extractor. Sanitization
 * strips control characters, removes home-like absolute paths and secret-looking
 * values via `@codegraph/security`, and bounds the length. No parser library here.
 */

/** Max evidence text length (characters) before truncation. */
export const MAX_EVIDENCE_LENGTH = 2000;

/** Max signature/declaration/type text length before truncation. */
export const MAX_SIGNATURE_LENGTH = 1000;

// Control characters except tab and newline (kept), plus DEL.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Extra redaction rules layered on the `@codegraph/security` defaults: home-like
 * absolute paths (POSIX `/Users|/home|/root/…`, Windows `X:\Users\…`, `~/…`) and
 * `import("…")` module paths that a resolved type text can embed.
 */
const redactor = createRedactor([
  { pattern: /import\((?:"[^"]*"|'[^']*')\)\./g, replacement: '' },
  { pattern: /\/(?:Users|home)\/[^\s"'()]+/g, replacement: '[REDACTED_PATH]' },
  { pattern: /\/root\/[^\s"'()]+/g, replacement: '[REDACTED_PATH]' },
  { pattern: /[A-Za-z]:\\(?:Users|Documents)\\[^\s"'()]+/g, replacement: '[REDACTED_PATH]' },
  { pattern: /~\/[^\s"'()]+/g, replacement: '[REDACTED_PATH]' },
]);

function stripControl(text: string): string {
  return text.replace(CONTROL_CHARS, '');
}

/** Control-strip + redact free text; returns the redacted value and a flag. */
export function redactText(text: string): { readonly value: string; readonly redacted: boolean } {
  return redactValue(redactor, stripControl(text));
}

/**
 * Sanitize a signature/declaration/type fragment: control-strip, collapse
 * whitespace to single spaces, redact, and bound. Returns a plain string.
 */
export function sanitizeSignatureText(text: string, max: number = MAX_SIGNATURE_LENGTH): string {
  const collapsed = stripControl(text).replace(/\s+/g, ' ').trim();
  const { value } = redactValue(redactor, collapsed);
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/**
 * Sanitize JSDoc/comment evidence into bounded, redacted `SanitizedEvidence`.
 * Newlines are preserved (JSDoc structure); other control characters are stripped.
 */
export function sanitizeEvidenceText(text: string): SanitizedEvidence {
  const { value, redacted } = redactText(text);
  const trimmed = value.trim();
  const truncated = trimmed.length > MAX_EVIDENCE_LENGTH;
  const bounded = truncated ? trimmed.slice(0, MAX_EVIDENCE_LENGTH) : trimmed;
  return { text: bounded, sanitized: true, truncated, redacted };
}
