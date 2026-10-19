import { describe, expect, it } from 'vitest';

import { FIXTURE_NAMES, fixtureRegistry } from '../../src/contracts/fixtures.js';

describe('fixture name registry', () => {
  it('registers every kickoff fixture name', () => {
    expect(FIXTURE_NAMES).toEqual([
      'fixture-ts-tiny',
      'fixture-preflight-invalid',
      'fixture-redaction',
      'fixture-search',
      'fixture-generate-missing-evidence',
      'fixture-generate-determinism',
      'fixture-codegraph-errors',
      'fixture-codegraph-http-client',
    ]);
  });

  it('records the two real ts-codegraph fixture packages', () => {
    expect(fixtureRegistry['fixture-codegraph-errors'].packageName).toBe('@codegraph/errors');
    expect(fixtureRegistry['fixture-codegraph-http-client'].packageName).toBe(
      '@codegraph/http-client',
    );
  });
});
