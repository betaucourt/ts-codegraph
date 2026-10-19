import type { Diagnostic } from '../contracts/index.js';

/**
 * Public, plain-serializable extractor types (step-04 §3, decision record §6).
 *
 * This module is the extractor's public type surface and **must never reference
 * the parser library**. `extractPackageFacts` returns only these shapes, so no
 * parser object crosses the boundary. The opacity test asserts this file (and the
 * public barrel) carry no parser-library reference.
 */

/** The five Now exported-declaration kinds. */
export type DeclarationKind = 'class' | 'function' | 'interface' | 'type-alias' | 'constant';

/** A safe source location: repo-relative POSIX path plus 1-based line range. */
export interface SourceRange {
  readonly path: string;
  readonly startLine: number;
  readonly endLine: number;
}

/** Sanitized, bounded evidence text (never raw source). */
export interface SanitizedEvidence {
  readonly text: string;
  /** Always `true`: this text passed through `sanitizeEvidenceText`. */
  readonly sanitized: true;
  /** `true` when the text was longer than the bound and was cut. */
  readonly truncated: boolean;
  /** `true` when redaction changed the text (a secret or path was removed). */
  readonly redacted: boolean;
}

/** One exported declaration's extracted facts. Bodies are never included. */
export interface DeclarationFact {
  readonly kind: DeclarationKind;
  readonly name: string;
  /** Repo-relative module paths that export this declaration (sorted). */
  readonly exportPaths: readonly string[];
  /** Syntactic modifiers present on the declaration (sorted). */
  readonly modifiers: readonly string[];
  /** Declaration/signature text only — never a body or an initializer value. */
  readonly signatureText: string;
  /** Sanitized JSDoc/comment evidence, when present. */
  readonly evidence?: SanitizedEvidence;
  readonly sourceRange: SourceRange;
}

/** A source file the extractor should parse. */
export interface ExtractorSourceFile {
  /** Normalized repo-relative POSIX path (used in output ranges). */
  readonly repoRelativePath: string;
  /** Absolute path on disk (used by the parser to read the file). */
  readonly absolutePath: string;
}

/** Input to `extractPackageFacts`. */
export interface ExtractPackageFactsInput {
  readonly packageName: string;
  readonly sourceFiles: readonly ExtractorSourceFile[];
  /** Absolute path to a tsconfig whose compiler options should be used. */
  readonly tsConfigFilePath?: string;
}

/** The extractor's plain-serializable result. */
export interface PackageFacts {
  readonly packageName: string;
  readonly declarations: readonly DeclarationFact[];
  readonly diagnostics: readonly Diagnostic[];
}
