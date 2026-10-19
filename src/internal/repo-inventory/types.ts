export type PackageManagerName = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
export type WorkspaceKind = 'pnpm' | 'yarn' | 'npm' | 'none';

export interface PackageInventory {
  readonly path: string;
  readonly relativePath: string;
  readonly name?: string;
  readonly version?: string;
  readonly description?: string;
  readonly private?: boolean;
  readonly workspaces?: readonly string[];
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly devDependencies?: Readonly<Record<string, string>>;
  readonly scripts?: Readonly<Record<string, string>>;
  readonly hasTypeScript: boolean;
}

export interface PackageManagerInfo {
  readonly name: PackageManagerName;
  readonly lockfilePresent: boolean;
  readonly workspacesSupported: boolean;
}

export interface GitSummary {
  readonly branch?: string;
  readonly commitHash?: string;
  readonly isDirty: boolean;
  readonly untrackedCount: number;
  readonly modifiedCount: number;
  readonly stagedCount: number;
  readonly available: boolean;
}

export interface WorkspaceInventory {
  readonly root: string;
  readonly kind: WorkspaceKind;
  readonly packages: readonly PackageInventory[];
}

export interface RepoInventory {
  readonly root: string;
  readonly gitSummary: GitSummary;
  readonly packageManager: PackageManagerInfo;
  readonly workspace: WorkspaceInventory;
  readonly tsconfigPaths: readonly string[];
  readonly packageCount: number;
}

export interface DiscoverRepositoryOptions {
  readonly maxPackages?: number;
  readonly maxTsconfigFiles?: number;
  readonly skipGit?: boolean;
  readonly extraIgnorePatterns?: readonly string[];
}

export interface DiscoverWorkspaceOptions {
  readonly maxPackages?: number;
  readonly extraIgnorePatterns?: readonly string[];
}

export interface FindTsconfigOptions {
  readonly maxFiles?: number;
}

export interface GitSummaryOptions {
  readonly maxDirtyFiles?: number;
}
