import { describe, expect, it } from 'vitest';

import { splitIdentifier } from '../../src/extractor/identifier.js';

describe('splitIdentifier', () => {
  it('splits camelCase', () => {
    expect(splitIdentifier('createWidget')).toEqual(['create', 'widget']);
  });

  it('splits PascalCase', () => {
    expect(splitIdentifier('WidgetOptions')).toEqual(['widget', 'options']);
  });

  it('splits snake_case', () => {
    expect(splitIdentifier('snake_case_name')).toEqual(['snake', 'case', 'name']);
  });

  it('splits kebab-case', () => {
    expect(splitIdentifier('http-client-error')).toEqual(['http', 'client', 'error']);
  });

  it('splits a @scoped/name package specifier', () => {
    expect(splitIdentifier('@codegraph/http-client')).toEqual(['codegraph', 'http', 'client']);
  });

  it('splits acronyms and digit boundaries', () => {
    expect(splitIdentifier('getHTTPResponseCode2')).toEqual(['get', 'http', 'response', 'code', '2']);
  });

  it('splits a trailing digit run', () => {
    expect(splitIdentifier('answer42')).toEqual(['answer', '42']);
  });

  it('splits digits embedded between letters', () => {
    expect(splitIdentifier('x2y')).toEqual(['x', '2', 'y']);
  });

  it('removes duplicate tokens while preserving order', () => {
    expect(splitIdentifier('WidgetWidget')).toEqual(['widget']);
    expect(splitIdentifier('user_userId')).toEqual(['user', 'id']);
  });

  it('returns an empty array for a separator-only identifier', () => {
    expect(splitIdentifier('___')).toEqual([]);
    expect(splitIdentifier('')).toEqual([]);
  });
});
