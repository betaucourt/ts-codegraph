import type { GitSummary } from '../../src/internal/repo-inventory/index.js';

export const NO_GIT_SUMMARY: GitSummary = {
  available: false,
  isDirty: false,
  untrackedCount: 0,
  modifiedCount: 0,
  stagedCount: 0,
};
