import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { extractPackageFacts, sanitizeEvidenceText } from '../../src/extractor/index.js';

const REDACTION_ROOT = resolve('test/fixtures/extractor/fixture-redaction');

function sourceFile(root: string, repoRelativePath: string) {
  return { repoRelativePath, absolutePath: resolve(root, repoRelativePath) };
}

async function extractRedaction() {
  return extractPackageFacts({
    packageName: 'fixture-redaction',
    tsConfigFilePath: resolve(REDACTION_ROOT, 'tsconfig.json'),
    sourceFiles: [sourceFile(REDACTION_ROOT, 'src/secrets.ts')],
  });
}

describe('extractor redaction — fixture-redaction', () => {
  it('leaks no absolute path, home path, secret, or raw source value', async () => {
    const serialized = JSON.stringify(await extractRedaction());
    expect(serialized).not.toContain('/Users/');
    expect(serialized).not.toContain('secret-project');
    expect(serialized).not.toContain('sk_live');
    expect(serialized).not.toContain('hunter2');
    expect(serialized).not.toContain('~/private');
  });

  it('redacts a literal path in an unannotated const type (exception 2)', async () => {
    const facts = await extractRedaction();
    const configPath = facts.declarations.find((d) => d.name === 'CONFIG_PATH');
    expect(configPath?.signatureText).toBe('export const CONFIG_PATH: "[REDACTED_PATH]"');
  });

  it('never emits a const initializer value (annotated const)', async () => {
    const facts = await extractRedaction();
    const homeNote = facts.declarations.find((d) => d.name === 'HOME_NOTE');
    expect(homeNote?.signatureText).toBe('export const HOME_NOTE: string');
  });

  it('marks redacted evidence and preserves benign text', () => {
    const evidence = sanitizeEvidenceText('token=abcdef123 and a normal sentence.');
    expect(evidence.sanitized).toBe(true);
    expect(evidence.redacted).toBe(true);
    expect(evidence.text).toContain('normal sentence');
    expect(evidence.text).not.toContain('abcdef123');
  });

  it('strips control characters from evidence', () => {
    const bell = String.fromCharCode(7);
    const evidence = sanitizeEvidenceText(`hel${bell}lo`);
    expect(evidence.text).toBe('hello');
  });

  it('bounds long evidence text to the maximum length', () => {
    const evidence = sanitizeEvidenceText('a'.repeat(5000));
    expect(evidence.truncated).toBe(true);
    expect(evidence.text.length).toBe(2000);
  });
});
