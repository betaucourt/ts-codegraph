import { describe, expect, it } from 'vitest';

import { headingSlug, normalizeMarkdown, packageSlug, slugify } from '../../src/generate/helpers.js';

describe('generate helpers — pure string utilities', () => {
  it('slugify lowercases and collapses non-alphanumerics to single hyphens', () => {
    expect(slugify('Sources Used')).toBe('sources-used');
    expect(slugify('API')).toBe('api');
    expect(slugify('createWidget')).toBe('createwidget');
    expect(slugify('@fixture/load-tiny')).toBe('fixture-load-tiny');
  });

  it('headingSlug never returns empty', () => {
    expect(headingSlug('###')).toBe('section');
    expect(headingSlug('Objective')).toBe('objective');
  });

  it('packageSlug falls back to a stable default', () => {
    expect(packageSlug('@scope/pkg')).toBe('scope-pkg');
    expect(packageSlug('***')).toBe('package');
  });

  it('is a pure function: same input always yields the same slug', () => {
    expect(slugify('Repeatable Heading')).toBe(slugify('Repeatable Heading'));
  });

  it('normalizeMarkdown strips trailing whitespace, collapses blank lines, and ends with one newline', () => {
    const input = 'a  \n\n\n\nb   \n';
    expect(normalizeMarkdown(input)).toBe('a\n\nb\n');
    // idempotent
    expect(normalizeMarkdown(normalizeMarkdown(input))).toBe(normalizeMarkdown(input));
  });
});
