import ts from "typescript";

/**
 * Tracks whether an identifier is used in value position, type position, or both.
 *
 * Used by the import-pruning heuristic to determine whether a dependency
 * is a runtime (value) import or a type-only import.
 */
export interface IdentifierUsage {
  /** `true` if the identifier appears in a runtime/value expression context. */
  value: boolean;
  /** `true` if the identifier appears in a type annotation or declaration context. */
  type: boolean;
}

/**
 * Extracts the locally-bound names introduced by an import clause
 * (default import, named imports, or namespace import).
 *
 * @param importClause - The TypeScript AST import clause node.
 * @returns Array of local binding names.
 */
export function extractLocalImportNames(importClause: ts.ImportClause | undefined): string[] {
  if (!importClause) {
    return [];
  }

  const names: string[] = [];

  if (importClause.name) {
    names.push(importClause.name.text);
  }

  if (!importClause.namedBindings) {
    return names;
  }

  if (ts.isNamedImports(importClause.namedBindings)) {
    for (const element of importClause.namedBindings.elements) {
      names.push(element.name.text);
    }
  } else if (ts.isNamespaceImport(importClause.namedBindings)) {
    names.push(importClause.namedBindings.name.text);
  }

  return names;
}

/**
 * Walks a TypeScript source file AST and records whether each identifier
 * appears in value position, type position, or both.
 *
 * Declaration names and import/export binding names are excluded;
 * only usage-site occurrences are tracked.
 *
 * @param sourceFile - Parsed TypeScript source file.
 * @returns Map from identifier text to its usage record.
 */
export function collectIdentifierUsage(sourceFile: ts.SourceFile): Map<string, IdentifierUsage> {
  const usage = new Map<string, IdentifierUsage>();

  const register = (name: string, kind: keyof IdentifierUsage): void => {
    const entry = usage.get(name) ?? { value: false, type: false };
    entry[kind] = true;
    usage.set(name, entry);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) {
      if (isImportOrExportName(node) || isDeclarationName(node)) {
        // Skip declaration or binding names; we only care about usage occurrences.
        return;
      }

      if (isTypePosition(node)) {
        register(node.text, "type");
      } else {
        register(node.text, "value");
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return usage;
}

/**
 * Returns `true` if any of the given local names appear in a runtime (value)
 * position in the usage map.
 *
 * When `localNames` is empty, returns `true` as a conservative default
 * (the import *may* have side effects).
 */
export function hasRuntimeUsage(
  usage: Map<string, IdentifierUsage>,
  localNames: readonly string[]
): boolean {
  if (!localNames.length) {
    return true;
  }

  return localNames.some(name => usage.get(name)?.value === true);
}

/**
 * Returns `true` if any of the given local names appear in a type-only
 * position in the usage map.
 */
export function hasTypeUsage(
  usage: Map<string, IdentifierUsage>,
  localNames: readonly string[]
): boolean {
  if (!localNames.length) {
    return false;
  }

  return localNames.some(name => usage.get(name)?.type === true);
}

/**
 * Heuristic check for whether an import specifier points to a
 * type-definition file (`.d.ts`, `types.ts`, `*-types.ts`, etc.).
 *
 * Used to classify imports as type-only when no AST usage data is
 * available (e.g. unresolved or external modules).
 */
export function isLikelyTypeDefinitionSpecifier(specifier: string): boolean {
  const normalized = specifier
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("#")[0]
    .trim()
    .toLowerCase();

  if (!normalized) {
    return false;
  }

  const basename = normalized.includes("/")
    ? normalized.slice(normalized.lastIndexOf("/") + 1)
    : normalized;

  if (!basename) {
    return false;
  }

  if (basename.endsWith(".d.ts") || basename.endsWith(".d.mts") || basename.endsWith(".d.cts")) {
    return true;
  }

  const stem = basename.includes(".") ? basename.slice(0, basename.lastIndexOf(".")) : basename;
  return stem === "types" || stem.endsWith(".types") || stem.endsWith("-types");
}

function isImportOrExportName(identifier: ts.Identifier): boolean {
  const parent = identifier.parent;
  return (
    ts.isImportClause(parent) ||
    ts.isImportSpecifier(parent) ||
    ts.isNamespaceImport(parent) ||
    ts.isImportEqualsDeclaration(parent) ||
    ts.isExportSpecifier(parent)
  );
}

function isDeclarationName(identifier: ts.Identifier): boolean {
  const parent = identifier.parent;
  if (!parent) {
    return false;
  }

  if (ts.isBindingElement(parent) && parent.name === identifier) {
    return true;
  }

  if (
    (ts.isVariableDeclaration(parent) ||
      ts.isFunctionDeclaration(parent) ||
      ts.isClassDeclaration(parent) ||
      ts.isInterfaceDeclaration(parent) ||
      ts.isTypeAliasDeclaration(parent) ||
      ts.isEnumDeclaration(parent) ||
      ts.isModuleDeclaration(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isParameter(parent)) &&
    parent.name === identifier
  ) {
    return true;
  }

  return false;
}

function isTypePosition(node: ts.Identifier): boolean {
  let current: ts.Node = node;

  while (current.parent) {
    const parent = current.parent;

    if (ts.isQualifiedName(parent)) {
      current = parent;
      continue;
    }

    if (ts.isTypeNode(parent)) {
      return true;
    }

    if (
      ts.isTypeAliasDeclaration(parent) ||
      ts.isInterfaceDeclaration(parent) ||
      ts.isTypeLiteralNode(parent) ||
      ts.isTypePredicateNode(parent) ||
      ts.isMappedTypeNode(parent) ||
      ts.isTemplateLiteralTypeNode(parent) ||
      ts.isConditionalTypeNode(parent) ||
      ts.isIndexedAccessTypeNode(parent) ||
      ts.isTypeOperatorNode(parent) ||
      ts.isUnionTypeNode(parent) ||
      ts.isIntersectionTypeNode(parent) ||
      ts.isTupleTypeNode(parent) ||
      ts.isArrayTypeNode(parent) ||
      ts.isImportTypeNode(parent) ||
      ts.isTypeQueryNode(parent) ||
      ts.isParenthesizedTypeNode(parent)
    ) {
      return true;
    }

    if (ts.isHeritageClause(parent) || ts.isExpressionWithTypeArguments(parent)) {
      return true;
    }

    if (
      (ts.isParameter(parent) || ts.isPropertyDeclaration(parent) || ts.isVariableDeclaration(parent)) &&
      parent.type &&
      nodeWithin(current, parent.type)
    ) {
      return true;
    }

    if (ts.isPropertySignature(parent) || ts.isMethodSignature(parent)) {
      return true;
    }

    if (
      (ts.isTypeAssertionExpression(parent) || ts.isAsExpression(parent)) &&
      parent.type === current
    ) {
      return true;
    }

    if (ts.isJSDocTypeExpression(parent) || ts.isJSDocNameReference(parent)) {
      return true;
    }

    return false;
  }

  return false;
}

function nodeWithin(node: ts.Node, container: ts.Node): boolean {
  return node.pos >= container.pos && node.end <= container.end;
}
