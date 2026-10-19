export type {
  SourceFileKind,
  SourceFileEntry,
  SourceScanResult,
  BoundedReadResult,
  ReadOptions,
  SourceFilePolicy,
  AtomicWriteEntry,
  AtomicWritePlan,
  SourceExplorer,
} from './types.js';

export {
  scanSourceFiles,
  createSourceExplorer,
  validateSourceFilePolicy,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_COUNT,
  MAX_READ_BYTES,
} from './scan.js';

export { readBoundedTextFile, detectFileKind } from './read.js';

export { hashFileContent } from './hash.js';

export {
  createAtomicWritePlan,
  validateWritePlan,
  commitWritePlan,
} from './write.js';

export {
  ERROR_CODES,
  ENTITY_IDS,
  TELEMETRY_ATTRIBUTES,
} from './generated/source-files-entities.js';
export type {
  ErrorCode as SourceFilesErrorCode,
  EntityId,
  AttributeName,
} from './generated/source-files-entities.js';
