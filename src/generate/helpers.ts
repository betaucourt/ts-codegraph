/**
 * Pure string helpers for generation (step-06b). No clock, I/O, or state — every
 * function is a deterministic map from its arguments to a string. Unit-tested in
 * test/generate/helpers.test.ts.
 */

/** GitHub-style heading slug: lowercase, non-alphanumeric runs to single hyphens. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** A non-empty heading slug (falls back to `section` for degenerate headings). */
export function headingSlug(heading: string): string {
  const slug = slugify(heading);
  return slug.length > 0 ? slug : 'section';
}

/** A filesystem-safe package slug for concept paths (falls back to `package`). */
export function packageSlug(packageName: string): string {
  const slug = slugify(packageName);
  return slug.length > 0 ? slug : 'package';
}

/**
 * Deterministic normalization of rendered Markdown: strips trailing whitespace per
 * line, collapses runs of blank lines to a single blank line, trims leading/trailing
 * blank lines, and ends with exactly one newline. Pure and idempotent.
 */
export function normalizeMarkdown(body: string): string {
  const stripped = body
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n');
  const collapsed = stripped.replace(/\n{3,}/g, '\n\n');
  return `${collapsed.replace(/^\n+/, '').replace(/\n+$/, '')}\n`;
}
