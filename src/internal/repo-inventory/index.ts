export type {
  PackageManagerName,
  WorkspaceKind,
  PackageInventory,
  PackageManagerInfo,
  GitSummary,
  WorkspaceInventory,
  RepoInventory,
  DiscoverRepositoryOptions,
  DiscoverWorkspaceOptions,
  FindTsconfigOptions,
  GitSummaryOptions,
} from './types.js';

export { discoverRepository } from './repo.js';
export { discoverWorkspace } from './workspace.js';
export { readPackageManifest } from './manifest.js';
export { detectPackageManager } from './package-manager.js';
export { findTsconfigFiles } from './tsconfig.js';
export { summarizeGitState } from './git.js';
export { safePositiveInt } from './utils.js';

export {
  ERROR_CODES,
  ENTITY_IDS,
  TELEMETRY_ATTRIBUTES,
} from './generated/repo-inventory-entities.js';
export type {
  ErrorCode as RepoInventoryErrorCode,
  EntityId,
  AttributeName,
} from './generated/repo-inventory-entities.js';
