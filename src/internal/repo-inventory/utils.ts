/** Clamp a caller-supplied limit to a positive integer within [0, hardMax].
 * Returns defaultVal when the value is undefined, NaN, Infinity, or negative.
 */
export function safePositiveInt(
  value: number | undefined,
  defaultVal: number,
  hardMax: number = 100_000,
): number {
  if (value === undefined) return defaultVal;
  if (!Number.isFinite(value) || Number.isNaN(value) || value < 0) return defaultVal;
  return Math.min(Math.floor(value), hardMax);
}
