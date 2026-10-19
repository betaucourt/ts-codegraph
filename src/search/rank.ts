/**
 * Deterministic ranking for `ts-codegraph search` (step-05 §3).
 *
 * Ranking version `exact-prefix-token-v1`. A result's `rank` value is its tier
 * weight; the **total** result order is:
 *
 *   1. tier: exact (3) > prefix (2) > token/FTS (1)         — the primary signal
 *   2. within the FTS tier only, bm25 ascending             — SQLite relevance
 *   3. kind order: package < file < symbol < export < diagnostic
 *   4. stable public id ascending (code-unit)               — final tie-break
 *
 * Because ids are unique, step 4 makes the order total: no two results can swap.
 * The same dataset + query therefore always yields a byte-identical result array.
 * Pure functions only — no I/O, no clock.
 */

export type SearchKind = 'package' | 'file' | 'symbol' | 'export' | 'diagnostic';
export type SearchTier = 'exact' | 'prefix' | 'fts';

/** Kind order for the tie-break. */
export const KIND_ORDER: readonly SearchKind[] = ['package', 'file', 'symbol', 'export', 'diagnostic'];

/** Tier → rank value (also the primary sort key). */
export const TIER_RANK: Readonly<Record<SearchTier, number>> = { exact: 3, prefix: 2, fts: 1 };

export function kindOrder(kind: SearchKind): number {
  const index = KIND_ORDER.indexOf(kind);
  return index === -1 ? KIND_ORDER.length : index;
}

export function rankValue(tier: SearchTier): number {
  return TIER_RANK[tier];
}

export interface RankableCandidate {
  readonly id: string;
  readonly kind: SearchKind;
  readonly tier: SearchTier;
  /** SQLite bm25 score for FTS-tier candidates (lower is more relevant). */
  readonly bm25: number;
}

export function compareCandidates(a: RankableCandidate, b: RankableCandidate): number {
  // 1. tier weight, descending.
  const tierDelta = TIER_RANK[b.tier] - TIER_RANK[a.tier];
  if (tierDelta !== 0) {
    return tierDelta;
  }
  // 2. bm25 ascending, but only within the FTS tier.
  if (a.tier === 'fts' && b.tier === 'fts' && a.bm25 !== b.bm25) {
    return a.bm25 - b.bm25;
  }
  // 3. kind order ascending.
  const kindDelta = kindOrder(a.kind) - kindOrder(b.kind);
  if (kindDelta !== 0) {
    return kindDelta;
  }
  // 4. stable id ascending (code-unit).
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
