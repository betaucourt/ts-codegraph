import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SRC_ROOT = resolve('src');

/** Only tab (0x09), newline (0x0a), and carriage return (0x0d) are allowed C0. */
const ALLOWED_CONTROL = new Set([0x09, 0x0a, 0x0d]);

function collectTsFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectTsFiles(full, acc);
    } else if (entry.endsWith('.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('source hygiene — no control bytes in src (F1)', () => {
  it('every src/**/*.ts is valid text with no NUL or disallowed control byte', () => {
    const offenders: string[] = [];
    for (const file of collectTsFiles(SRC_ROOT)) {
      const buffer = readFileSync(file);
      for (let index = 0; index < buffer.length; index += 1) {
        const byte = buffer[index] ?? 0;
        if ((byte < 0x20 && !ALLOWED_CONTROL.has(byte)) || byte === 0x7f) {
          offenders.push(`${file}: byte ${index} = 0x${byte.toString(16).padStart(2, '0')}`);
          break;
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
