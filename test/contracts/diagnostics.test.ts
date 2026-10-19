import { describe, expect, it } from 'vitest';

import {
  DIAGNOSTIC_CODE_REGISTRY,
  createDiagnosticCodeRegistry,
} from '../../src/contracts/diagnostics.js';

describe('diagnostic code registry', () => {
  it('contains only unique namespaced SCREAMING_SNAKE codes', () => {
    const unique = new Set(DIAGNOSTIC_CODE_REGISTRY);

    expect(unique.size).toBe(DIAGNOSTIC_CODE_REGISTRY.length);

    for (const code of DIAGNOSTIC_CODE_REGISTRY) {
      expect(code).toMatch(/^(CHECK|LOAD|SEARCH|GENERATE|OKF|SAFETY)_[A-Z0-9]+(?:_[A-Z0-9]+)*$/);
    }
  });

  it('rejects duplicate codes at registry creation time', () => {
    expect(() =>
      createDiagnosticCodeRegistry(['CHECK_DUPLICATE', 'CHECK_DUPLICATE'] as const),
    ).toThrow(/Duplicate diagnostic code/);
  });
});
