/**
 * Public extractor surface (step-04a). Re-exports only the entry function, the
 * pure helpers, and the plain `./types.js` shapes. This barrel — and the type
 * module it re-exports — carry no parser-library reference, so no parser type
 * crosses the boundary. The opacity test enforces this.
 */
export { extractPackageFacts } from './extract.js';
export { sanitizeEvidenceText } from './sanitize.js';
export { splitIdentifier } from './identifier.js';
export type {
  DeclarationFact,
  DeclarationKind,
  ExtractPackageFactsInput,
  ExtractorSourceFile,
  PackageFacts,
  SanitizedEvidence,
  SourceRange,
} from './types.js';
