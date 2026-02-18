import * as path from "node:path";
import ts from "typescript";

import { DEFAULT_CODE_EXTENSIONS, inferScriptKind } from "./languageInference";

/** Discriminant for the kind of TypeScript/JavaScript exported symbol. */
export type ExportedSymbolKind =
  | "class"
  | "function"
  | "variable"
  | "enum"
  | "interface"
  | "type"
  | "namespace"
  | "default"
  | "unknown";

/** Metadata for a single exported symbol (name, kind, default/type-only flags). */
export interface ExportedSymbolMetadata {
  name: string;
  kind: ExportedSymbolKind;
  isDefault?: boolean;
  isTypeOnly?: boolean;
}

/**
 * Extracts exported symbol metadata from a TypeScript/JavaScript file.
 */
export function extractExportedSymbols(filePath: string, content: string): ExportedSymbolMetadata[] {
  const extension = path.extname(filePath).toLowerCase();
  if (!DEFAULT_CODE_EXTENSIONS.has(extension)) {
    return [];
  }

  if (extension === ".cs") {
    return [];
  }

  const scriptKind = inferScriptKind(extension);
  if (scriptKind === ts.ScriptKind.Unknown) {
    return [];
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);
  const collected = new Map<string, ExportedSymbolMetadata>();

  const record = (entry: ExportedSymbolMetadata): void => {
    if (!entry.name) {
      return;
    }
    collected.set(entry.name, entry);
  };

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      const name = resolveExportAssignmentName(statement);
      if (name) {
        record({
          name,
          kind: "default",
          isDefault: true
        });
      }
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const specifier of statement.exportClause.elements) {
          const name = specifier.name.text;
          record({
            name,
            kind: specifier.isTypeOnly ? "type" : "unknown",
            isTypeOnly: specifier.isTypeOnly
          });
        }
        continue;
      }

      if (statement.exportClause && ts.isNamespaceExport(statement.exportClause)) {
        const name = statement.exportClause.name.text;
        record({
          name,
          kind: "namespace"
        });
        continue;
      }

      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      record({
        name,
        kind: "function",
        isDefault: name === "default"
      });
      continue;
    }

    if (ts.isClassDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      record({
        name,
        kind: "class",
        isDefault: name === "default"
      });
      continue;
    }

    if (ts.isInterfaceDeclaration(statement)) {
      const name = statement.name.text;
      record({
        name,
        kind: "interface"
      });
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      const name = statement.name.text;
      record({
        name,
        kind: "type"
      });
      continue;
    }

    if (ts.isEnumDeclaration(statement)) {
      const name = statement.name.text;
      record({
        name,
        kind: "enum"
      });
      continue;
    }

    if (ts.isModuleDeclaration(statement)) {
      const name = statement.name.getText(sourceFile);
      if (name) {
        record({
          name,
          kind: "namespace"
        });
      }
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const kind = inferVariableKind(statement);
      const names = collectBindingNames(statement.declarationList);
      for (const name of names) {
        record({
          name,
          kind
        });
      }
      continue;
    }
  }

  return Array.from(collected.values());
}

function resolveExportAssignmentName(statement: ts.ExportAssignment): string | undefined {
  if (ts.isIdentifier(statement.expression)) {
    return statement.expression.text;
  }

  if (ts.isPropertyAccessExpression(statement.expression)) {
    return statement.expression.getText();
  }

  return "default";
}

function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function hasDefaultModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
}

function inferVariableKind(statement: ts.VariableStatement): ExportedSymbolKind {
  const flags = ts.getCombinedNodeFlags(statement.declarationList);
  if (flags & ts.NodeFlags.Const) return "variable";
  if (flags & ts.NodeFlags.Let) return "variable";
  return "variable";
}

function collectBindingNames(list: ts.VariableDeclarationList): string[] {
  const names: string[] = [];
  for (const declaration of list.declarations) {
    collectNamesFromBinding(declaration.name, names);
  }
  return names;
}

function collectNamesFromBinding(binding: ts.BindingName, output: string[]): void {
  if (ts.isIdentifier(binding)) {
    output.push(binding.text);
    return;
  }

  if (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) {
    for (const element of binding.elements) {
      if (ts.isBindingElement(element)) {
        collectNamesFromBinding(element.name, output);
      }
    }
  }
}
