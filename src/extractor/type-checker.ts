import type { ExportSpecifier, Node, VariableDeclaration } from 'ts-morph';

import { createDiagnostic, DiagnosticCodes, type Diagnostic } from '../contracts/index.js';

/**
 * The **only** two TypeChecker exceptions allowed in Now (decision record §8).
 *
 * The extractor is syntax-first; every semantic/TypeChecker call — anything that
 * resolves symbols or computes types (`getLocalTargetDeclarations`, `getType`,
 * `getSymbol`, `getTypeChecker`, …) — lives in this file and nowhere else. Both
 * functions return plain data or `ts-morph` nodes for internal use only (no
 * `ts-morph` type is ever re-exported from the extractor barrel), and both degrade
 * to a safe `Diagnostic` on failure rather than throwing raw. Adding a third
 * exception requires a decision-record update with a fixture.
 *
 * The `ts-morph` types in these signatures are internal: `type-checker.ts` is not
 * re-exported by `src/extractor/index.ts`, so no `ts-morph` type crosses the
 * public boundary.
 */

/** Result of resolving an explicit re-export specifier. */
export interface ReexportResolution {
  /** The target declaration nodes (internal `ts-morph` nodes). */
  readonly declarations: readonly Node[];
  readonly diagnostic?: Diagnostic;
}

/**
 * Exception 1 — explicit re-export resolution. Resolves `export { X } from './y'`
 * (including barrel entry points) to the declaration(s) it targets so exports can
 * link to symbols. Uses the checker via `getLocalTargetDeclarations`. Failure
 * degrades to a `LOAD_REEXPORT_UNRESOLVED` diagnostic.
 */
export function resolveExplicitReexport(specifier: ExportSpecifier): ReexportResolution {
  try {
    return { declarations: specifier.getLocalTargetDeclarations() };
  } catch {
    return {
      declarations: [],
      diagnostic: createDiagnostic({
        code: DiagnosticCodes.LOAD_REEXPORT_UNRESOLVED,
        severity: 'warning',
        message: 'Could not resolve an explicit re-export to its declaration.',
      }),
    };
  }
}

/** Result of resolving the declared type of an unannotated export. */
export interface DeclaredTypeResolution {
  /** Declared-type text (unsanitized; the caller sanitizes before output). */
  readonly text?: string;
  readonly diagnostic?: Diagnostic;
}

/**
 * Exception 2 — declared-type text for an unannotated exported declaration.
 * Obtains the declared-type text for an exported `const` with no written
 * annotation (for example `export const x = createThing()`), where the API
 * reference would otherwise have no signature. Uses the checker via `getType`.
 * Failure degrades to a `LOAD_UNANNOTATED_TYPE_UNRESOLVED` diagnostic. The
 * returned text is unsanitized — it can embed `import("…")` module paths — so the
 * caller must run it through `sanitizeSignatureText` before emitting it.
 */
export function declaredTypeTextForUnannotatedExport(
  declaration: VariableDeclaration,
): DeclaredTypeResolution {
  try {
    return { text: declaration.getType().getText(declaration) };
  } catch {
    return {
      diagnostic: createDiagnostic({
        code: DiagnosticCodes.LOAD_UNANNOTATED_TYPE_UNRESOLVED,
        severity: 'warning',
        message: 'Could not resolve the declared type of an unannotated export.',
      }),
    };
  }
}
