import { describe, expect, it } from 'vitest';

import { templatePackManifestSchema } from '../../src/contracts/template-pack.js';

const validManifest = {
  packName: 'package-overview',
  packVersion: '0.1.0',
  slotIds: ['objective', 'exports', 'diagnostics'],
  requiredFacts: ['project', 'pkg', 'exports'],
  optionalFacts: ['diagnostics', 'evidence'],
  templateFiles: [
    {
      templateId: 'package-overview',
      path: 'package-overview/template.md',
      outputPattern: 'packages/{packageSlug}/overview.md',
    },
  ],
};

describe('template pack manifest schema', () => {
  it('accepts a valid template pack manifest', () => {
    expect(templatePackManifestSchema.safeParse(validManifest).success).toBe(true);
  });

  it('rejects missing slot IDs', () => {
    const { slotIds: _slotIds, ...missingSlotIds } = validManifest;

    expect(templatePackManifestSchema.safeParse(missingSlotIds).success).toBe(false);
  });

  it('rejects duplicate slot IDs', () => {
    expect(
      templatePackManifestSchema.safeParse({
        ...validManifest,
        slotIds: ['objective', 'objective'],
      }).success,
    ).toBe(false);
  });

  it('rejects unknown fields', () => {
    expect(
      templatePackManifestSchema.safeParse({
        ...validManifest,
        extra: true,
      }).success,
    ).toBe(false);
  });
});
