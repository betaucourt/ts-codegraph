import { splitIdentifier } from '../extractor/identifier.js';

/**
 * Query normalization for `ts-codegraph search` (step-05 §3).
 *
 * User input is reduced to pure lowercase alphanumeric tokens via the Row-3
 * identifier splitter, which strips **every** non-`[a-z0-9]` character. The FTS5
 * MATCH expression is then built only from those tokens (each wrapped as an FTS5
 * string literal, the last one made a prefix term), so raw user input can never
 * inject MATCH syntax — there are no metacharacters or boolean keywords left to
 * escape. No `fs`/`path` here.
 */

export interface NormalizedQuery {
  /** Trimmed raw query (for the envelope's `query` field). */
  readonly raw: string;
  /** Trimmed, lowercased query (for exact/prefix label comparison). */
  readonly lowered: string;
  /** Ordered, unique lowercase alphanumeric tokens. */
  readonly tokens: readonly string[];
  /** Safe FTS5 MATCH expression, or `''` when there are no tokens. */
  readonly ftsMatch: string;
}

function buildFtsMatch(tokens: readonly string[]): string {
  if (tokens.length === 0) {
    return '';
  }
  // Tokens are pure [a-z0-9] (splitIdentifier). Wrap each as an FTS5 string
  // literal — defensive even though no metacharacters can be present — and make
  // the last token a prefix term for partial-typing recall.
  return tokens
    .map((token, index) => (index === tokens.length - 1 ? `"${token}"*` : `"${token}"`))
    .join(' ');
}

export function normalizeQuery(raw: string): NormalizedQuery {
  const trimmed = raw.trim();
  const tokens = splitIdentifier(trimmed);
  return {
    raw: trimmed,
    lowered: trimmed.toLowerCase(),
    tokens,
    ftsMatch: buildFtsMatch(tokens),
  };
}
