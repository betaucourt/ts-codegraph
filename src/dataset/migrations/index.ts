import type { SqliteMigration } from '../../internal/sqlite/index.js';

import { initMigration } from './001-init.js';

/**
 * The ordered migration set for `ts-codegraph.dataset@1`. Exactly one numbered
 * migration in Now; the product-local runner applies it once and treats re-runs
 * as a no-op (step-02 §3).
 */
export const DATASET_MIGRATIONS: readonly SqliteMigration[] = [initMigration];

export { initMigration } from './001-init.js';
