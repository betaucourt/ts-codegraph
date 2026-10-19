import { resolve as resolvePath } from 'node:path';

import {
  Node,
  Project,
  SyntaxKind,
  type ClassDeclaration,
  type FunctionDeclaration,
  type InterfaceDeclaration,
  type JSDoc,
  type SourceFile,
  type TypeAliasDeclaration,
  type VariableDeclaration,
  type VariableStatement,
} from 'ts-morph';

import type { Diagnostic } from '../contracts/index.js';
import { sanitizeEvidenceText, sanitizeSignatureText } from './sanitize.js';
import {
  declaredTypeTextForUnannotatedExport,
  resolveExplicitReexport,
} from './type-checker.js';
import type {
  DeclarationFact,
  DeclarationKind,
  ExtractPackageFactsInput,
  PackageFacts,
  SanitizedEvidence,
  SourceRange,
} from './types.js';

/**
 * The opaque, syntax-first `ts-morph` extractor (step-04 §3, decision record §6).
 *
 * `extractPackageFacts` returns only plain `./types.js` shapes — no `ts-morph`
 * object crosses the boundary. It reads exported declarations (class, function,
 * interface, type alias, constant), captures declaration/signature text (never
 * bodies or initializer values), sanitized JSDoc evidence, safe source ranges, and
 * export paths (including barrel re-exports resolved via the two documented
 * TypeChecker exceptions). Output is explicitly sorted for determinism.
 */

interface MutableFact {
  readonly kind: DeclarationKind;
  readonly name: string;
  readonly exportPaths: Set<string>;
  readonly modifiers: string[];
  readonly signatureText: string;
  readonly evidence: SanitizedEvidence | undefined;
  readonly sourceRange: SourceRange;
}

/**
 * Locale-independent code-unit string comparison. Every canonical ordering uses
 * this (not `localeCompare`, whose result depends on host locale/ICU) so the
 * extractor's output order is byte-stable across environments.
 */
function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort(compareCodeUnits);
}

function evidenceFromJsDocs(jsDocs: readonly JSDoc[]): SanitizedEvidence | undefined {
  const text = jsDocs
    .map((doc) => doc.getInnerText())
    .join('\n\n')
    .trim();
  return text.length > 0 ? sanitizeEvidenceText(text) : undefined;
}

function functionSignatureText(fn: FunctionDeclaration): string {
  const body = fn.getBody();
  const end = body ? body.getStart() : fn.getEnd();
  return sanitizeSignatureText(fn.getSourceFile().getFullText().slice(fn.getStart(), end));
}

function classSignatureText(cls: ClassDeclaration): string {
  const brace = cls.getFirstChildByKind(SyntaxKind.OpenBraceToken);
  const end = brace ? brace.getStart() : cls.getEnd();
  return sanitizeSignatureText(cls.getSourceFile().getFullText().slice(cls.getStart(), end));
}

function classModifiers(cls: ClassDeclaration): string[] {
  const modifiers: string[] = [];
  if (cls.isExported()) modifiers.push('export');
  if (cls.isDefaultExport()) modifiers.push('default');
  if (cls.hasDeclareKeyword()) modifiers.push('declare');
  if (cls.isAbstract()) modifiers.push('abstract');
  return modifiers;
}

function functionModifiers(fn: FunctionDeclaration): string[] {
  const modifiers: string[] = [];
  if (fn.isExported()) modifiers.push('export');
  if (fn.isDefaultExport()) modifiers.push('default');
  if (fn.hasDeclareKeyword()) modifiers.push('declare');
  if (fn.isAsync()) modifiers.push('async');
  return modifiers;
}

function typeLikeModifiers(node: InterfaceDeclaration | TypeAliasDeclaration): string[] {
  const modifiers: string[] = [];
  if (node.isExported()) modifiers.push('export');
  if (node.hasDeclareKeyword()) modifiers.push('declare');
  return modifiers;
}

function variableModifiers(statement: VariableStatement): string[] {
  const modifiers: string[] = [statement.getDeclarationKind()];
  if (statement.isExported()) modifiers.push('export');
  if (statement.hasDeclareKeyword()) modifiers.push('declare');
  return modifiers;
}

/**
 * Build the signature text for a constant: `export const NAME: TYPE` — the
 * declared type only, never the initializer value. An unannotated const gets its
 * type via TypeChecker exception 2 (which may push a diagnostic).
 */
function variableSignatureText(
  statement: VariableStatement,
  declaration: VariableDeclaration,
  diagnostics: Diagnostic[],
): string {
  const declarationKind = statement.getDeclarationKind();
  const exported = statement.isExported() ? 'export ' : '';
  const typeNode = declaration.getTypeNode();

  let typeText: string;
  if (typeNode !== undefined) {
    typeText = typeNode.getText();
  } else {
    const resolved = declaredTypeTextForUnannotatedExport(declaration);
    if (resolved.diagnostic !== undefined) {
      diagnostics.push(resolved.diagnostic);
    }
    typeText = resolved.text ?? 'unknown';
  }

  return sanitizeSignatureText(`${exported}${declarationKind} ${declaration.getName()}: ${typeText}`);
}

function makeRange(node: Node, repoPath: string): SourceRange {
  return {
    path: repoPath,
    startLine: node.getStartLineNumber(),
    endLine: node.getEndLineNumber(),
  };
}

class Extractor {
  readonly #repoByAbsolutePath: Map<string, string>;
  readonly #facts = new Map<string, MutableFact>();
  readonly #diagnostics: Diagnostic[] = [];

  constructor(repoByAbsolutePath: Map<string, string>) {
    this.#repoByAbsolutePath = repoByAbsolutePath;
  }

  get diagnostics(): Diagnostic[] {
    return this.#diagnostics;
  }

  #repoPathOf(node: Node): string | undefined {
    return this.#repoByAbsolutePath.get(resolvePath(node.getSourceFile().getFilePath()));
  }

  #register(kind: DeclarationKind, name: string, repoPath: string, fact: () => MutableFact): MutableFact {
    const key = `${repoPath}\u0000${kind}\u0000${name}`;
    const existing = this.#facts.get(key);
    if (existing !== undefined) {
      return existing;
    }
    const created = fact();
    this.#facts.set(key, created);
    return created;
  }

  /** Build (or reuse) the fact for a supported declaration node. */
  buildFact(node: Node): MutableFact | undefined {
    const repoPath = this.#repoPathOf(node);
    if (repoPath === undefined) {
      return undefined;
    }

    if (Node.isClassDeclaration(node)) {
      const name = node.getName();
      if (name === undefined) return undefined;
      return this.#register('class', name, repoPath, () => ({
        kind: 'class',
        name,
        exportPaths: new Set([repoPath]),
        modifiers: classModifiers(node),
        signatureText: classSignatureText(node),
        evidence: evidenceFromJsDocs(node.getJsDocs()),
        sourceRange: makeRange(node, repoPath),
      }));
    }

    if (Node.isFunctionDeclaration(node)) {
      const name = node.getName();
      if (name === undefined) return undefined;
      return this.#register('function', name, repoPath, () => ({
        kind: 'function',
        name,
        exportPaths: new Set([repoPath]),
        modifiers: functionModifiers(node),
        signatureText: functionSignatureText(node),
        evidence: evidenceFromJsDocs(node.getJsDocs()),
        sourceRange: makeRange(node, repoPath),
      }));
    }

    if (Node.isInterfaceDeclaration(node)) {
      const name = node.getName();
      return this.#register('interface', name, repoPath, () => ({
        kind: 'interface',
        name,
        exportPaths: new Set([repoPath]),
        modifiers: typeLikeModifiers(node),
        signatureText: sanitizeSignatureText(node.getText()),
        evidence: evidenceFromJsDocs(node.getJsDocs()),
        sourceRange: makeRange(node, repoPath),
      }));
    }

    if (Node.isTypeAliasDeclaration(node)) {
      const name = node.getName();
      return this.#register('type-alias', name, repoPath, () => ({
        kind: 'type-alias',
        name,
        exportPaths: new Set([repoPath]),
        modifiers: typeLikeModifiers(node),
        signatureText: sanitizeSignatureText(node.getText()),
        evidence: evidenceFromJsDocs(node.getJsDocs()),
        sourceRange: makeRange(node, repoPath),
      }));
    }

    if (Node.isVariableDeclaration(node)) {
      const statement = node.getVariableStatement();
      if (statement === undefined) return undefined;
      const name = node.getName();
      return this.#register('constant', name, repoPath, () => ({
        kind: 'constant',
        name,
        exportPaths: new Set([repoPath]),
        modifiers: variableModifiers(statement),
        signatureText: variableSignatureText(statement, node, this.#diagnostics),
        evidence: evidenceFromJsDocs(statement.getJsDocs()),
        sourceRange: makeRange(node, repoPath),
      }));
    }

    return undefined;
  }

  /** Pass A — directly exported declarations in a file. */
  collectDirectExports(sourceFile: SourceFile): void {
    for (const cls of sourceFile.getClasses()) {
      if (cls.isExported()) this.buildFact(cls);
    }
    for (const fn of sourceFile.getFunctions()) {
      if (fn.isExported()) this.buildFact(fn);
    }
    for (const iface of sourceFile.getInterfaces()) {
      if (iface.isExported()) this.buildFact(iface);
    }
    for (const alias of sourceFile.getTypeAliases()) {
      if (alias.isExported()) this.buildFact(alias);
    }
    for (const statement of sourceFile.getVariableStatements()) {
      if (!statement.isExported()) continue;
      for (const declaration of statement.getDeclarations()) {
        this.buildFact(declaration);
      }
    }
  }

  /** Pass B — barrel/explicit re-exports resolved via TypeChecker exception 1. */
  collectReexports(sourceFile: SourceFile): void {
    const barrelPath = this.#repoPathOf(sourceFile);
    if (barrelPath === undefined) {
      return;
    }
    for (const exportDeclaration of sourceFile.getExportDeclarations()) {
      if (exportDeclaration.getModuleSpecifierValue() === undefined) {
        continue;
      }
      for (const specifier of exportDeclaration.getNamedExports()) {
        const resolution = resolveExplicitReexport(specifier);
        if (resolution.diagnostic !== undefined) {
          this.#diagnostics.push(resolution.diagnostic);
          continue;
        }
        for (const target of resolution.declarations) {
          const fact = this.buildFact(target);
          if (fact !== undefined) {
            fact.exportPaths.add(barrelPath);
          }
        }
      }
    }
  }

  finalize(): MutableFact[] {
    return [...this.#facts.values()];
  }
}

function toDeclarationFact(fact: MutableFact): DeclarationFact {
  return {
    kind: fact.kind,
    name: fact.name,
    exportPaths: sortedUnique(fact.exportPaths),
    modifiers: sortedUnique(fact.modifiers),
    signatureText: fact.signatureText,
    ...(fact.evidence !== undefined ? { evidence: fact.evidence } : {}),
    sourceRange: fact.sourceRange,
  };
}

function declarationSortKey(fact: DeclarationFact): string {
  return [
    fact.exportPaths.join('|'),
    fact.kind,
    fact.name,
    String(fact.sourceRange.startLine).padStart(8, '0'),
  ].join('\u0000');
}

function diagnosticSortKey(diagnostic: Diagnostic): string {
  return `${diagnostic.code}\u0000${diagnostic.severity}\u0000${diagnostic.message}`;
}

/**
 * Extract plain-serializable package facts from a set of TypeScript source files.
 * Never throws for a malformed export: unresolved exceptions degrade to
 * diagnostics. Output declarations and diagnostics are explicitly sorted.
 */
export async function extractPackageFacts(input: ExtractPackageFactsInput): Promise<PackageFacts> {
  const repoByAbsolutePath = new Map<string, string>();
  for (const file of input.sourceFiles) {
    repoByAbsolutePath.set(resolvePath(file.absolutePath), file.repoRelativePath);
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    ...(input.tsConfigFilePath !== undefined ? { tsConfigFilePath: input.tsConfigFilePath } : {}),
  });

  const sourceFiles: SourceFile[] = [];
  for (const file of input.sourceFiles) {
    sourceFiles.push(project.addSourceFileAtPath(file.absolutePath));
  }

  const extractor = new Extractor(repoByAbsolutePath);
  for (const sourceFile of sourceFiles) {
    extractor.collectDirectExports(sourceFile);
  }
  for (const sourceFile of sourceFiles) {
    extractor.collectReexports(sourceFile);
  }

  const declarations = extractor
    .finalize()
    .map(toDeclarationFact)
    .sort((a, b) => compareCodeUnits(declarationSortKey(a), declarationSortKey(b)));

  const diagnostics = [...extractor.diagnostics].sort((a, b) =>
    compareCodeUnits(diagnosticSortKey(a), diagnosticSortKey(b)),
  );

  return { packageName: input.packageName, declarations, diagnostics };
}
