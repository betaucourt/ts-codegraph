export type SourceFileKind = 'text' | 'binary' | 'unknown';

export interface SourceFileEntry {
  readonly relativePath: string;
  readonly kind: SourceFileKind;
  readonly sizeBytes: number;
}

export interface SourceScanResult {
  readonly files: readonly SourceFileEntry[];
  readonly truncated: boolean;
}

export interface BoundedReadResult {
  readonly content: string;
  readonly truncated: boolean;
  readonly sizeBytes: number;
}

export interface SourceFilePolicy {
  readonly maxFileSizeBytes?: number;
  readonly maxFileCount?: number;
  readonly allowSymlinks?: boolean;
  readonly gitignore?: boolean;
  readonly defaultIgnores?: boolean;
  readonly extraIgnorePatterns?: readonly string[];
  /** Filter to files whose extension (including leading dot) is in this list. */
  readonly includeExtensions?: readonly string[];
  readonly maxReadBytes?: number;
}

export interface ReadOptions {
  /** Root boundary — the path must reside inside this root or SOURCE_FILES_TRAVERSAL_DENIED is thrown. */
  readonly root: string;
  readonly maxBytes?: number;
}

export interface AtomicWriteEntry {
  readonly relativePath: string;
  readonly content: string;
  readonly encoding?: BufferEncoding;
}

export interface AtomicWritePlan {
  readonly root: string;
  readonly entries: readonly AtomicWriteEntry[];
  readonly validated: boolean;
}

export interface SourceExplorer {
  readonly root: string;
  /** Always scans the explorer's own root. No override is accepted. */
  scan(): Promise<SourceScanResult>;
  read(absPath: string, opts?: { maxBytes?: number }): Promise<BoundedReadResult>;
  detect(absPath: string): Promise<SourceFileKind>;
  hash(absPath: string): Promise<string>;
}
