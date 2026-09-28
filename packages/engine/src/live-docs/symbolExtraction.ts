/**
 * TypeScript AST symbol extraction for Live Documentation.
 *
 * @remarks
 * This module extracts exported symbols from TypeScript source files,
 * including their type references for cross-Live-Doc linking.
 *
 * @module
 */

import ts from "typescript";

import type { PublicSymbolEntry, TypeReference } from "./coreTypes";
import {
  hasExportModifier,
  hasDefaultModifier,
  getNodeLocation,
  resolveExportAssignmentName
} from "./coreUtils";
import { extractJsDocDocumentation } from "./jsDoc";

// ============================================================================
// Script Kind Inference
// ============================================================================

/**
 * Infers the TypeScript ScriptKind from a file extension.
 *
 * @param extension - File extension including the dot (e.g., ".ts", ".tsx")
 * @returns The appropriate ScriptKind for parsing
 */
export function inferScriptKind(extension: string): ts.ScriptKind {
  switch (extension) {
    case ".ts":
    case ".mts":
    case ".cts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".js":
    case ".mjs":
    case ".cjs":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.Unknown;
  }
}

// ============================================================================
// Symbol Extraction
// ============================================================================

/**
 * Scans a TypeScript source file for exported declarations and captures their metadata.
 *
 * @param sourceFile - Parsed TypeScript source file produced by the compiler host.
 *
 * @returns A location-sorted list of exported symbols suitable for Live Doc rendering.
 */
export function collectExportedSymbols(sourceFile: ts.SourceFile): PublicSymbolEntry[] {
  const collected: PublicSymbolEntry[] = [];

  const record = (entry: PublicSymbolEntry): void => {
    if (!entry.name) return;
    collected.push(entry);
  };

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      const name = resolveExportAssignmentName(statement.expression);
      if (!name) continue;
      record({
        name,
        kind: "default",
        isDefault: true,
        location: getNodeLocation(statement, sourceFile)
      });
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      const exportClause = statement.exportClause;
      if (exportClause && ts.isNamedExports(exportClause)) {
        for (const specifier of exportClause.elements) {
          const exportedName = specifier.name.text;
          const declarationKind = specifier.isTypeOnly ? "type" : "unknown";
          record({
            name: exportedName,
            kind: declarationKind,
            isTypeOnly: specifier.isTypeOnly,
            location: getNodeLocation(specifier.name, sourceFile)
          });
        }
      }
      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromFunction(statement));
      record({
        name,
        kind: "function",
        isDefault: name === "default",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name ?? statement, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isClassDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromClass(statement));
      record({
        name,
        kind: "class",
        isDefault: name === "default",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name ?? statement, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isInterfaceDeclaration(statement)) {
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromInterface(statement));
      record({
        name: statement.name.text,
        kind: "interface",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromTypeAlias(statement));
      record({
        name: statement.name.text,
        kind: "type",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isEnumDeclaration(statement)) {
      record({
        name: statement.name.text,
        kind: "enum",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile)
      });
      continue;
    }

    if (ts.isModuleDeclaration(statement)) {
      record({
        name: statement.name.getText(sourceFile),
        kind: "namespace",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile)
      });
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const kind = inferVariableKind(statement);
      for (const declaration of statement.declarationList.declarations) {
        const names = collectBindingNames(declaration.name);
        const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromVariable(declaration));
        for (const name of names) {
          record({
            name,
            kind,
            documentation: extractJsDocDocumentation(statement),
            location: getNodeLocation(declaration.name, sourceFile),
            typeReferences: typeRefs.length > 0 ? typeRefs : undefined
          });
        }
      }
      continue;
    }
  }

  return collected;
}

// ============================================================================
// Variable & Binding Helpers
// ============================================================================

function inferVariableKind(statement: ts.VariableStatement): string {
  const flags = ts.getCombinedNodeFlags(statement.declarationList);
  if (flags & ts.NodeFlags.Const) return "const";
  if (flags & ts.NodeFlags.Let) return "let";
  return "var";
}

function collectBindingNames(binding: ts.BindingName): string[] {
  const names: string[] = [];
  if (ts.isIdentifier(binding)) {
    names.push(binding.text);
    return names;
  }

  if (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) {
    for (const element of binding.elements) {
      if (ts.isBindingElement(element)) {
        names.push(...collectBindingNames(element.name));
      }
    }
  }

  return names;
}

// ============================================================================
// Type Reference Extraction
// ============================================================================

/**
 * Primitive and built-in type names that should not generate Live Doc links.
 *
 * @remarks
 * These types are either JavaScript/TypeScript primitives or globally available
 * types that are not defined in user code. Linking to them would not provide
 * useful navigation in the Live Documentation system.
 */
const PRIMITIVE_TYPE_NAMES = new Set([
  // JavaScript primitives
  "string",
  "number",
  "boolean",
  "symbol",
  "bigint",
  "undefined",
  "null",
  "void",
  "never",
  "unknown",
  "any",
  "object",
  // Common built-in types
  "Object",
  "String",
  "Number",
  "Boolean",
  "Symbol",
  "BigInt",
  "Function",
  "Array",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Date",
  "RegExp",
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "EvalError",
  "URIError",
  "JSON",
  "Math",
  "Intl",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
  // TypeScript utility types
  "Partial",
  "Required",
  "Readonly",
  "Record",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "Parameters",
  "ConstructorParameters",
  "ReturnType",
  "InstanceType",
  "ThisParameterType",
  "OmitThisParameter",
  "ThisType",
  "Awaited",
  "Uppercase",
  "Lowercase",
  "Capitalize",
  "Uncapitalize",
  // Node.js globals
  "Buffer",
  "Console",
  "NodeJS",
  // DOM types (commonly used but external)
  "HTMLElement",
  "Element",
  "Document",
  "Window",
  "Event",
  "EventTarget",
  "Node"
]);

/**
 * Extracts type references from a TypeScript AST node representing a type.
 *
 * @remarks
 * This function recursively traverses type nodes to extract all referenced type names,
 * handling unions, intersections, arrays, generics, and qualified names. Primitive types
 * are filtered out since they cannot be linked to Live Documentation.
 *
 * @param typeNode - The TypeScript type node to analyze.
 * @param role - The semantic role of this type in the parent symbol's signature.
 * @param options - Additional context for the extraction.
 *
 * @returns An array of type references found in the type node.
 *
 * @see TypeReference
 * @see collectTypeReferencesFromDeclaration
 */
function extractTypeReferencesFromTypeNode(
  typeNode: ts.TypeNode | undefined,
  role: TypeReference["role"],
  options?: {
    parameterName?: string;
    argumentIndex?: number;
    isUnionMember?: boolean;
    isIntersectionMember?: boolean;
    isArrayElement?: boolean;
    isPromiseResolution?: boolean;
  }
): TypeReference[] {
  if (!typeNode) {
    return [];
  }

  const references: TypeReference[] = [];

  // Handle union types: Widget | Error | null
  if (ts.isUnionTypeNode(typeNode)) {
    for (const member of typeNode.types) {
      references.push(
        ...extractTypeReferencesFromTypeNode(member, role, {
          ...options,
          isUnionMember: true
        })
      );
    }
    return references;
  }

  // Handle intersection types: Widget & Serializable
  if (ts.isIntersectionTypeNode(typeNode)) {
    for (const member of typeNode.types) {
      references.push(
        ...extractTypeReferencesFromTypeNode(member, role, {
          ...options,
          isIntersectionMember: true
        })
      );
    }
    return references;
  }

  // Handle array types: Widget[]
  if (ts.isArrayTypeNode(typeNode)) {
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.elementType, role, {
        ...options,
        isArrayElement: true
      })
    );
    return references;
  }

  // Handle parenthesized types: (Widget | Error)
  if (ts.isParenthesizedTypeNode(typeNode)) {
    references.push(...extractTypeReferencesFromTypeNode(typeNode.type, role, options));
    return references;
  }

  // Handle type references: Widget, Promise<Widget>, Map<string, Widget>
  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName;
    let name: string;

    if (ts.isIdentifier(typeName)) {
      name = typeName.text;
    } else if (ts.isQualifiedName(typeName)) {
      // Handle qualified names like Namespace.Type
      name = getQualifiedNameText(typeName);
    } else {
      return references;
    }

    // Skip primitive types
    if (!PRIMITIVE_TYPE_NAMES.has(name)) {
      // Special handling for Promise<T> - extract the resolution type
      if (name === "Promise" && typeNode.typeArguments && typeNode.typeArguments.length > 0) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeNode.typeArguments[0], role, {
            ...options,
            isPromiseResolution: true
          })
        );
      } else {
        references.push({
          name,
          role,
          ...options
        });
      }
    }

    // Process type arguments for generics: Map<K, V>, Array<T>, etc.
    if (typeNode.typeArguments) {
      typeNode.typeArguments.forEach((typeArg, index) => {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", {
            argumentIndex: index
          })
        );
      });
    }

    return references;
  }

  // Handle tuple types: [Widget, Error]
  if (ts.isTupleTypeNode(typeNode)) {
    typeNode.elements.forEach((element, index) => {
      const elementNode = ts.isNamedTupleMember(element) ? element.type : element;
      references.push(
        ...extractTypeReferencesFromTypeNode(elementNode, "type-argument", {
          argumentIndex: index
        })
      );
    });
    return references;
  }

  // Handle function types: (widget: Widget) => Result
  if (ts.isFunctionTypeNode(typeNode)) {
    // Extract parameter types
    for (const param of typeNode.parameters) {
      if (param.type) {
        const paramName = ts.isIdentifier(param.name) ? param.name.text : undefined;
        references.push(
          ...extractTypeReferencesFromTypeNode(param.type, "parameter", {
            parameterName: paramName
          })
        );
      }
    }
    // Extract return type
    if (typeNode.type) {
      references.push(...extractTypeReferencesFromTypeNode(typeNode.type, "return"));
    }
    return references;
  }

  // Handle type literals: { prop: Widget }
  if (ts.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member) && member.type) {
        references.push(...extractTypeReferencesFromTypeNode(member.type, "property"));
      }
    }
    return references;
  }

  // Handle conditional types: T extends Widget ? A : B
  if (ts.isConditionalTypeNode(typeNode)) {
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.checkType, "generic-constraint")
    );
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.extendsType, "generic-constraint")
    );
    references.push(...extractTypeReferencesFromTypeNode(typeNode.trueType, role));
    references.push(...extractTypeReferencesFromTypeNode(typeNode.falseType, role));
    return references;
  }

  // Handle indexed access types: Widget["property"]
  if (ts.isIndexedAccessTypeNode(typeNode)) {
    references.push(...extractTypeReferencesFromTypeNode(typeNode.objectType, role));
    return references;
  }

  // Handle mapped types: { [K in keyof Widget]: ... }
  if (ts.isMappedTypeNode(typeNode)) {
    if (typeNode.type) {
      references.push(...extractTypeReferencesFromTypeNode(typeNode.type, "property"));
    }
    return references;
  }

  return references;
}

/**
 * Gets the full text representation of a qualified name (e.g., "Namespace.Type").
 */
function getQualifiedNameText(qualifiedName: ts.QualifiedName): string {
  const parts: string[] = [];
  let current: ts.EntityName = qualifiedName;

  while (ts.isQualifiedName(current)) {
    parts.unshift(current.right.text);
    current = current.left;
  }

  if (ts.isIdentifier(current)) {
    parts.unshift(current.text);
  }

  return parts.join(".");
}

/**
 * Extracts type references from a function declaration's signature.
 *
 * @param declaration - The function declaration to analyze.
 * @returns An array of type references from parameters and return type.
 */
function collectTypeReferencesFromFunction(
  declaration: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract type parameters constraints: <T extends Widget>
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  // Extract parameter types
  for (const param of declaration.parameters) {
    if (param.type) {
      const paramName = ts.isIdentifier(param.name) ? param.name.text : undefined;
      references.push(
        ...extractTypeReferencesFromTypeNode(param.type, "parameter", {
          parameterName: paramName
        })
      );
    }
  }

  // Extract return type
  if (declaration.type) {
    references.push(...extractTypeReferencesFromTypeNode(declaration.type, "return"));
  }

  return references;
}

/**
 * Extracts type references from a class declaration's heritage clauses and members.
 *
 * @param declaration - The class declaration to analyze.
 * @returns An array of type references from extends, implements, and properties.
 */
function collectTypeReferencesFromClass(declaration: ts.ClassDeclaration): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract heritage clauses: extends BaseClass, implements Interface
  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      const role: TypeReference["role"] =
        clause.token === ts.SyntaxKind.ExtendsKeyword ? "extends" : "implements";

      for (const type of clause.types) {
        const typeName = type.expression;
        if (ts.isIdentifier(typeName)) {
          if (!PRIMITIVE_TYPE_NAMES.has(typeName.text)) {
            references.push({ name: typeName.text, role });
          }
        } else if (ts.isPropertyAccessExpression(typeName)) {
          const fullName = typeName.getText();
          references.push({ name: fullName, role });
        }

        // Extract type arguments: extends Base<Widget>
        if (type.typeArguments) {
          type.typeArguments.forEach((typeArg, index) => {
            references.push(
              ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", {
                argumentIndex: index
              })
            );
          });
        }
      }
    }
  }

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  return references;
}

/**
 * Extracts type references from an interface declaration's heritage and members.
 *
 * @param declaration - The interface declaration to analyze.
 * @returns An array of type references from extends clauses.
 */
function collectTypeReferencesFromInterface(
  declaration: ts.InterfaceDeclaration
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract heritage clauses: extends OtherInterface
  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      for (const type of clause.types) {
        const typeName = type.expression;
        if (ts.isIdentifier(typeName)) {
          if (!PRIMITIVE_TYPE_NAMES.has(typeName.text)) {
            references.push({ name: typeName.text, role: "extends" });
          }
        } else if (ts.isPropertyAccessExpression(typeName)) {
          const fullName = typeName.getText();
          references.push({ name: fullName, role: "extends" });
        }

        // Extract type arguments
        if (type.typeArguments) {
          type.typeArguments.forEach((typeArg, index) => {
            references.push(
              ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", {
                argumentIndex: index
              })
            );
          });
        }
      }
    }
  }

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  return references;
}

/**
 * Extracts type references from a type alias declaration.
 *
 * @param declaration - The type alias declaration to analyze.
 * @returns An array of type references from the aliased type.
 */
function collectTypeReferencesFromTypeAlias(
  declaration: ts.TypeAliasDeclaration
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  // Extract references from the aliased type
  references.push(...extractTypeReferencesFromTypeNode(declaration.type, "return"));

  return references;
}

/**
 * Extracts type references from a variable declaration.
 *
 * @param declaration - The variable declaration to analyze.
 * @returns An array of type references from the variable's type annotation.
 */
function collectTypeReferencesFromVariable(
  declaration: ts.VariableDeclaration
): TypeReference[] {
  if (declaration.type) {
    return extractTypeReferencesFromTypeNode(declaration.type, "return");
  }
  return [];
}

/**
 * Deduplicates type references by name and role, preserving metadata flags.
 *
 * @param references - The array of type references to deduplicate.
 * @returns A deduplicated array of type references.
 */
function deduplicateTypeReferences(references: TypeReference[]): TypeReference[] {
  const seen = new Map<string, TypeReference>();

  for (const ref of references) {
    const key = `${ref.name}::${ref.role}::${ref.parameterName ?? ""}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, { ...ref });
    } else {
      // Merge flags
      if (ref.isUnionMember) existing.isUnionMember = true;
      if (ref.isIntersectionMember) existing.isIntersectionMember = true;
      if (ref.isArrayElement) existing.isArrayElement = true;
      if (ref.isPromiseResolution) existing.isPromiseResolution = true;
    }
  }

  return Array.from(seen.values());
}
