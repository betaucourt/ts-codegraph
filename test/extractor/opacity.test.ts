import { readFileSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

const EXTRACTOR_DIR = resolve('src/extractor');

/** Files under src/extractor allowed to touch ts-morph / the TypeChecker. */
const TS_MORPH_FILES = new Set(['extract.ts', 'type-checker.ts']);
/** The public type surface — must never reference ts-morph. */
const PUBLIC_MODULES = new Set(['index.ts', 'types.ts', 'sanitize.ts', 'identifier.ts']);

function extractorSources(): { name: string; text: string }[] {
  return readdirSync(EXTRACTOR_DIR)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => ({ name, text: readFileSync(resolve(EXTRACTOR_DIR, name), 'utf8') }));
}

describe('extractor boundary — source confinement', () => {
  it('imports ts-morph only in the two internal boundary files', () => {
    for (const { name, text } of extractorSources()) {
      const importsTsMorph = /from ['"]ts-morph['"]/.test(text);
      if (TS_MORPH_FILES.has(name)) {
        continue;
      }
      expect(importsTsMorph, `${name} must not import ts-morph`).toBe(false);
    }
  });

  it('keeps every TypeChecker call inside type-checker.ts (exactly two exceptions)', () => {
    const checkerPatterns = [
      /getTypeChecker/,
      /getLocalTargetDeclarations/,
      /getAliasedSymbol/,
      /\.getSymbol\(/,
      /\bgetType\(/,
    ];
    for (const { name, text } of extractorSources()) {
      if (name === 'type-checker.ts') {
        continue;
      }
      for (const pattern of checkerPatterns) {
        expect(pattern.test(text), `${name} must not use ${pattern} outside type-checker.ts`).toBe(false);
      }
    }

    // The two documented exception functions exist and are the only checker entry points.
    const checkerSource = readFileSync(resolve(EXTRACTOR_DIR, 'type-checker.ts'), 'utf8');
    expect(checkerSource).toContain('export function resolveExplicitReexport');
    expect(checkerSource).toContain('export function declaredTypeTextForUnannotatedExport');
  });
});

describe('extractor boundary — emitted declarations carry no ts-morph', () => {
  it('no public extractor .d.ts references ts-morph', () => {
    const configPath = resolve('tsconfig.json');
    const parsedJson = ts.parseConfigFileTextToJson(configPath, readFileSync(configPath, 'utf8'));
    const parsed = ts.parseJsonConfigFileContent(parsedJson.config, ts.sys, process.cwd());

    const options: ts.CompilerOptions = {
      ...parsed.options,
      declaration: true,
      emitDeclarationOnly: true,
      noEmit: false,
      // Strip doc comments so a comment that merely mentions the string does not
      // count as a type reference; only real declarations remain.
      removeComments: true,
      outDir: resolve('.opacity-dts'),
    };

    const program = ts.createProgram([resolve(EXTRACTOR_DIR, 'index.ts')], options);
    const emitted = new Map<string, string>();
    program.emit(
      undefined,
      (fileName, data) => {
        emitted.set(fileName, data);
      },
      undefined,
      true,
    );

    const extractorDts = [...emitted.entries()].filter(
      ([fileName]) => fileName.includes('extractor') && fileName.endsWith('.d.ts'),
    );

    // Guard: the emit actually produced the public declaration files.
    const emittedBaseNames = new Set(extractorDts.map(([fileName]) => basename(fileName)));
    expect(emittedBaseNames.has('index.d.ts')).toBe(true);
    expect(emittedBaseNames.has('types.d.ts')).toBe(true);

    for (const [fileName, data] of extractorDts) {
      const base = basename(fileName).replace(/\.d\.ts$/, '.ts');
      if (PUBLIC_MODULES.has(base)) {
        expect(data.includes('ts-morph'), `${basename(fileName)} leaks ts-morph`).toBe(false);
        expect(/import\(".*ts-morph.*"\)/.test(data), `${basename(fileName)} leaks ts-morph import`).toBe(false);
      }
    }
  });
});
