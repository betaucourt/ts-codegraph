import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  extractPackageFacts,
  type DeclarationFact,
  type PackageFacts,
} from '../../src/extractor/index.js';

const TINY_ROOT = resolve('test/fixtures/extractor/fixture-ts-tiny');

function sourceFile(root: string, repoRelativePath: string) {
  return { repoRelativePath, absolutePath: resolve(root, repoRelativePath) };
}

async function extractTiny(): Promise<PackageFacts> {
  return extractPackageFacts({
    packageName: 'fixture-ts-tiny',
    tsConfigFilePath: resolve(TINY_ROOT, 'tsconfig.json'),
    sourceFiles: [sourceFile(TINY_ROOT, 'src/widget.ts'), sourceFile(TINY_ROOT, 'src/index.ts')],
  });
}

function byName(facts: PackageFacts): Map<string, DeclarationFact> {
  return new Map(facts.declarations.map((declaration) => [declaration.name, declaration]));
}

describe('extractPackageFacts — fixture-ts-tiny matrix', () => {
  it('extracts exactly the seven exported declarations with the right kinds', async () => {
    const facts = await extractTiny();
    expect(facts.declarations).toHaveLength(7);
    expect(facts.diagnostics).toHaveLength(0);

    const kinds = facts.declarations.map((d) => d.kind).sort();
    expect(kinds).toEqual(['class', 'constant', 'constant', 'function', 'interface', 'interface', 'type-alias']);

    const names = new Set(facts.declarations.map((d) => d.name));
    expect(names).toEqual(
      new Set(['Widget', 'WidgetOptions', 'WidgetKind', 'WIDGET_KINDS', 'createWidget', 'Registry', 'widgetRegistry']),
    );
  });

  it('does not include the internal (non-exported) makeRegistry function', async () => {
    const facts = await extractTiny();
    expect(byName(facts).has('makeRegistry')).toBe(false);
  });

  it('captures signature text without bodies', async () => {
    const facts = await extractTiny();
    const declarations = byName(facts);

    expect(declarations.get('Widget')?.signatureText).toBe('export class Widget');
    expect(declarations.get('createWidget')?.signatureText).toBe(
      'export async function createWidget<T>(options: WidgetOptions): Promise<Widget>',
    );

    // No method/function body text leaks anywhere.
    const serialized = JSON.stringify(facts);
    expect(serialized).not.toContain('SECRET_BODY_MARKER');
    expect(serialized).not.toContain('SECRET_FUNCTION_BODY');
  });

  it('resolves the barrel re-export via TypeChecker exception 1', async () => {
    const facts = await extractTiny();
    const declarations = byName(facts);

    // Widget and createWidget are exported directly from widget.ts and re-exported
    // from the index.ts barrel, so both export paths are present and sorted.
    expect(declarations.get('Widget')?.exportPaths).toEqual(['src/index.ts', 'src/widget.ts']);
    expect(declarations.get('createWidget')?.exportPaths).toEqual(['src/index.ts', 'src/widget.ts']);
    // A non-re-exported declaration keeps only its own module.
    expect(declarations.get('WidgetOptions')?.exportPaths).toEqual(['src/widget.ts']);
  });

  it('resolves an unannotated export const type via TypeChecker exception 2', async () => {
    const facts = await extractTiny();
    const widgetRegistry = byName(facts).get('widgetRegistry');
    expect(widgetRegistry?.signatureText).toBe('export const widgetRegistry: Registry');
    expect(widgetRegistry?.modifiers).toContain('const');
  });

  it('captures sanitized JSDoc evidence', async () => {
    const facts = await extractTiny();
    const widget = byName(facts).get('Widget');
    expect(widget?.evidence?.sanitized).toBe(true);
    expect(widget?.evidence?.text).toContain('A configurable widget.');
    // WidgetKind has JSDoc; Registry too.
    expect(byName(facts).get('WidgetKind')?.evidence?.text).toContain('supported widget kinds');
  });

  it('reports 1-based source ranges with repo-relative paths', async () => {
    const facts = await extractTiny();
    const widget = byName(facts).get('Widget');
    expect(widget?.sourceRange.path).toBe('src/widget.ts');
    expect(widget?.sourceRange.startLine).toBeGreaterThan(0);
    expect(widget?.sourceRange.endLine).toBeGreaterThanOrEqual(widget?.sourceRange.startLine ?? 0);
  });
});

describe('extractPackageFacts — determinism', () => {
  it('produces byte-identical output across two runs', async () => {
    const first = await extractTiny();
    const second = await extractTiny();
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('returns declarations in a stable sorted order', async () => {
    const facts = await extractTiny();
    const keyOf = (d: DeclarationFact): string =>
      [d.exportPaths.join('|'), d.kind, d.name, String(d.sourceRange.startLine).padStart(8, '0')].join(' ');
    // Code-unit re-sort (not localeCompare) so this does not tautologically track
    // the implementation and stays environment-independent.
    const sortedKeys = facts.declarations
      .map(keyOf)
      .slice()
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    expect(facts.declarations.map(keyOf)).toEqual(sortedKeys);
  });
});
