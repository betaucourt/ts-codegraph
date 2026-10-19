import { describe, expect, it } from 'vitest';

import {
  parseCheckEnvelope,
  parseGenerateEnvelope,
  parseLoadEnvelope,
  parseSearchEnvelope,
} from '../../src/contracts/envelopes.js';
import {
  validCheckEnvelope,
  validGenerateEnvelope,
  validLoadEnvelope,
  validSearchEnvelope,
} from './envelope-fixtures.js';

const cases = [
  {
    name: 'check',
    fixture: validCheckEnvelope,
    parse: parseCheckEnvelope,
    expectedCode: 'CHECK_ENVELOPE_INVALID',
    wrongCommand: 'load',
  },
  {
    name: 'load',
    fixture: validLoadEnvelope,
    parse: parseLoadEnvelope,
    expectedCode: 'LOAD_ENVELOPE_INVALID',
    wrongCommand: 'check',
  },
  {
    name: 'search',
    fixture: validSearchEnvelope,
    parse: parseSearchEnvelope,
    expectedCode: 'SEARCH_ENVELOPE_INVALID',
    wrongCommand: 'generate',
  },
  {
    name: 'generate',
    fixture: validGenerateEnvelope,
    parse: parseGenerateEnvelope,
    expectedCode: 'GENERATE_ENVELOPE_INVALID',
    wrongCommand: 'search',
  },
] as const;

describe('command envelope contracts', () => {
  for (const entry of cases) {
    it(`parses a valid ${entry.name} envelope`, () => {
      const result = entry.parse(entry.fixture);

      expect(result.success).toBe(true);
    });

    it(`maps a missing schemaVersion in ${entry.name} to a stable diagnostic`, () => {
      const mutated = structuredClone(entry.fixture) as Record<string, unknown>;
      delete mutated.schemaVersion;

      const result = entry.parse(mutated);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0]?.code).toBe(entry.expectedCode);
      }
    });

    it(`maps a wrong command in ${entry.name} to a stable diagnostic`, () => {
      const mutated = {
        ...structuredClone(entry.fixture),
        command: entry.wrongCommand,
      };

      const result = entry.parse(mutated);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.diagnostics[0]?.code).toBe(entry.expectedCode);
      }
    });

    it(`maps a malformed diagnostic in ${entry.name} to a stable diagnostic`, () => {
      const mutated = {
        ...structuredClone(entry.fixture),
        diagnostics: [
          {
            code: 'NOT_NAMESPACED',
            severity: 'error',
            message: 'bad',
          },
        ],
      };

      const result = entry.parse(mutated);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.diagnostics[0]?.code).toBe(entry.expectedCode);
      }
    });

    it(`does not echo raw invalid values in ${entry.name} validation diagnostics`, () => {
      const secret = 'password=super-secret-value';
      const mutated = {
        ...structuredClone(entry.fixture),
        schemaVersion: secret,
      };

      const result = entry.parse(mutated);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(JSON.stringify(result.diagnostics)).not.toContain(secret);
      }
    });
  }
});
