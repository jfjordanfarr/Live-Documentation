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
  const bindingOf = typeBindings(sourceFile);

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
            isReExport: true,
            ...(exportedName === "default" ? { isDefault: true } : {}),
            location: getNodeLocation(specifier.name, sourceFile)
          });
        }
      } else if (exportClause && ts.isNamespaceExport(exportClause)) {
        record({
          name: exportClause.name.text,
          kind: "namespace",
          isTypeOnly: statement.isTypeOnly,
          isReExport: true,
          location: getNodeLocation(exportClause.name, sourceFile)
        });
      }
      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromFunction(statement, bindingOf));
      record({
        name,
        kind: "function",
        isDefault: hasDefaultModifier(statement),
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name ?? statement, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isClassDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromClass(statement, bindingOf));
      record({
        name,
        kind: "class",
        isDefault: hasDefaultModifier(statement),
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name ?? statement, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isInterfaceDeclaration(statement)) {
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromInterface(statement, bindingOf));
      record({
        name: statement.name.text,
        kind: "interface",
        ...(hasDefaultModifier(statement) ? { isDefault: true } : {}),
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromTypeAlias(statement, bindingOf));
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
        const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromVariable(declaration, bindingOf));
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

type TypeBindingResolver = (node: ts.Node, name: string) => TypeReference["binding"];

/** Read import identities once; lexical type parameters shadow them at each individual reference. */
function typeBindings(sourceFile: ts.SourceFile): TypeBindingResolver {
  const imports = new Map<string, { specifier: string; exportedName: string }>();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.importClause) continue;
    const specifier = statement.moduleSpecifier.text, clause = statement.importClause;
    if (clause.name) imports.set(clause.name.text, { specifier, exportedName: "default" });
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) imports.set(bindings.name.text, { specifier, exportedName: "*" });
    else if (bindings && ts.isNamedImports(bindings)) for (const entry of bindings.elements) {
      imports.set(entry.name.text, { specifier, exportedName: entry.propertyName?.text ?? entry.name.text });
    }
  }
  return (node, name) => {
    const [root, ...tail] = name.split(".");
    let child = node;
    for (let scope: ts.Node | undefined = node; scope; child = scope, scope = scope.parent) {
      const parameters = (scope as ts.Node & { typeParameters?: readonly ts.TypeParameterDeclaration[] }).typeParameters;
      if (parameters?.some(parameter => parameter.name.text === root)
        || ts.isMappedTypeNode(scope) && scope.typeParameter.name.text === root) return { kind: "bound" };
      // An inferred name is bound in the true branch of its conditional, not in the false branch.
      if (ts.isConditionalTypeNode(scope) && child === scope.trueType) {
        let inferred = false;
        const visit = (part: ts.Node): void => {
          if (ts.isConditionalTypeNode(part)) return; // Its inference belongs to its own true branch.
          if (ts.isInferTypeNode(part) && part.typeParameter.name.text === root) inferred = true;
          if (!inferred) ts.forEachChild(part, visit);
        };
        visit(scope.extendsType);
        if (inferred) return { kind: "bound" };
      }
    }
    const imported = imports.get(root);
    if (!imported) return undefined;
    const exportedName = imported.exportedName === "*" ? tail.join(".") || "*" : [imported.exportedName, ...tail].join(".");
    return { kind: "import", specifier: imported.specifier, exportedName };
  };
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
  bindingOf: TypeBindingResolver,
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
        ...extractTypeReferencesFromTypeNode(member, role, bindingOf, {
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
        ...extractTypeReferencesFromTypeNode(member, role, bindingOf, {
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
      ...extractTypeReferencesFromTypeNode(typeNode.elementType, role, bindingOf, {
        ...options,
        isArrayElement: true
      })
    );
    return references;
  }

  // Handle parenthesized types: (Widget | Error)
  if (ts.isParenthesizedTypeNode(typeNode)) {
    references.push(...extractTypeReferencesFromTypeNode(typeNode.type, role, bindingOf, options));
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

    const binding = bindingOf(typeNode, name);
    // A known binding takes precedence over names usually supplied by the language.
    if (binding || !PRIMITIVE_TYPE_NAMES.has(name)) {
      // Special handling for Promise<T> - extract the resolution type
      if (!binding && name === "Promise" && typeNode.typeArguments && typeNode.typeArguments.length > 0) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeNode.typeArguments[0], role, bindingOf, {
            ...options,
            isPromiseResolution: true
          })
        );
      } else {
        references.push({
          name,
          role,
          ...(binding ? { binding } : {}),
          ...options
        });
      }
    }

    // Process type arguments for generics: Map<K, V>, Array<T>, etc.
    if (typeNode.typeArguments) {
      typeNode.typeArguments.forEach((typeArg, index) => {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", bindingOf, {
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
        ...extractTypeReferencesFromTypeNode(elementNode, "type-argument", bindingOf, {
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
          ...extractTypeReferencesFromTypeNode(param.type, "parameter", bindingOf, {
            parameterName: paramName
          })
        );
      }
    }
    // Extract return type
    if (typeNode.type) {
      references.push(...extractTypeReferencesFromTypeNode(typeNode.type, "return", bindingOf));
    }
    return references;
  }

  // Handle type literals: { prop: Widget }
  if (ts.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member) && member.type) {
        references.push(...extractTypeReferencesFromTypeNode(member.type, "property", bindingOf));
      }
    }
    return references;
  }

  // Handle conditional types: T extends Widget ? A : B
  if (ts.isConditionalTypeNode(typeNode)) {
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.checkType, "generic-constraint", bindingOf)
    );
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.extendsType, "generic-constraint", bindingOf)
    );
    references.push(...extractTypeReferencesFromTypeNode(typeNode.trueType, role, bindingOf));
    references.push(...extractTypeReferencesFromTypeNode(typeNode.falseType, role, bindingOf));
    return references;
  }

  // Handle indexed access types: Widget["property"]
  if (ts.isIndexedAccessTypeNode(typeNode)) {
    references.push(...extractTypeReferencesFromTypeNode(typeNode.objectType, role, bindingOf));
    return references;
  }

  // Handle mapped types: { [K in keyof Widget]: ... }
  if (ts.isMappedTypeNode(typeNode)) {
    if (typeNode.type) {
      references.push(...extractTypeReferencesFromTypeNode(typeNode.type, "property", bindingOf));
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
  declaration: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction,
  bindingOf: TypeBindingResolver
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract type parameters constraints: <T extends Widget>
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint", bindingOf)
        );
      }
    }
  }

  // Extract parameter types
  for (const param of declaration.parameters) {
    if (param.type) {
      const paramName = ts.isIdentifier(param.name) ? param.name.text : undefined;
      references.push(
        ...extractTypeReferencesFromTypeNode(param.type, "parameter", bindingOf, {
          parameterName: paramName
        })
      );
    }
  }

  // Extract return type
  if (declaration.type) {
    references.push(...extractTypeReferencesFromTypeNode(declaration.type, "return", bindingOf));
  }

  return references;
}

/**
 * Extracts type references from a class declaration's heritage clauses and members.
 *
 * @param declaration - The class declaration to analyze.
 * @returns An array of type references from extends, implements, and properties.
 */
function collectTypeReferencesFromClass(declaration: ts.ClassDeclaration, bindingOf: TypeBindingResolver): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract heritage clauses: extends BaseClass, implements Interface
  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      const role: TypeReference["role"] =
        clause.token === ts.SyntaxKind.ExtendsKeyword ? "extends" : "implements";

      for (const type of clause.types) {
        const typeName = type.expression;
        if (ts.isIdentifier(typeName)) {
          const binding = bindingOf(typeName, typeName.text);
          if (binding || !PRIMITIVE_TYPE_NAMES.has(typeName.text)) {
            references.push({ name: typeName.text, role, ...(binding ? { binding } : {}) });
          }
        } else if (ts.isPropertyAccessExpression(typeName)) {
          const fullName = typeName.getText();
          const binding = bindingOf(typeName, fullName);
          references.push({ name: fullName, role, ...(binding ? { binding } : {}) });
        }

        // Extract type arguments: extends Base<Widget>
        if (type.typeArguments) {
          type.typeArguments.forEach((typeArg, index) => {
            references.push(
              ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", bindingOf, {
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
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint", bindingOf)
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
  declaration: ts.InterfaceDeclaration,
  bindingOf: TypeBindingResolver
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract heritage clauses: extends OtherInterface
  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      for (const type of clause.types) {
        const typeName = type.expression;
        if (ts.isIdentifier(typeName)) {
          const binding = bindingOf(typeName, typeName.text);
          if (binding || !PRIMITIVE_TYPE_NAMES.has(typeName.text)) {
            references.push({ name: typeName.text, role: "extends", ...(binding ? { binding } : {}) });
          }
        } else if (ts.isPropertyAccessExpression(typeName)) {
          const fullName = typeName.getText();
          const binding = bindingOf(typeName, fullName);
          references.push({ name: fullName, role: "extends", ...(binding ? { binding } : {}) });
        }

        // Extract type arguments
        if (type.typeArguments) {
          type.typeArguments.forEach((typeArg, index) => {
            references.push(
              ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", bindingOf, {
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
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint", bindingOf)
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
  declaration: ts.TypeAliasDeclaration,
  bindingOf: TypeBindingResolver
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint", bindingOf)
        );
      }
    }
  }

  // Extract references from the aliased type
  references.push(...extractTypeReferencesFromTypeNode(declaration.type, "return", bindingOf));

  return references;
}

/**
 * Extracts type references from a variable declaration.
 *
 * @param declaration - The variable declaration to analyze.
 * @returns An array of type references from the variable's type annotation.
 */
function collectTypeReferencesFromVariable(
  declaration: ts.VariableDeclaration,
  bindingOf: TypeBindingResolver
): TypeReference[] {
  if (declaration.type) {
    return extractTypeReferencesFromTypeNode(declaration.type, "return", bindingOf);
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
    const binding = ref.binding?.kind === "import" ? [ref.binding.kind, ref.binding.specifier, ref.binding.exportedName] : ref.binding?.kind;
    const key = JSON.stringify([ref.name, ref.role, ref.parameterName ?? "", binding ?? null]);
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
