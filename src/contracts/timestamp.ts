import { z } from 'zod/v4';

export const NORMALIZED_FIXTURE_TIMESTAMP = '2026-07-03T00:00:00+02:00';

export const normalizedTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/);

export type NormalizedTimestamp = z.infer<typeof normalizedTimestampSchema>;

export function assertNormalizedTimestamp(value: string): NormalizedTimestamp {
  return normalizedTimestampSchema.parse(value);
}

export function normalizedTimestampFromSnapshot(value: string): NormalizedTimestamp {
  return assertNormalizedTimestamp(value);
}

export function normalizedTimestampForFixture(
  value = NORMALIZED_FIXTURE_TIMESTAMP,
): NormalizedTimestamp {
  return assertNormalizedTimestamp(value);
}
