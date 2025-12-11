import { promises as fs } from "node:fs";

import { extractDependencies } from "./csharp.dependencies";
import { buildDocumentationFromLines } from "./csharp.xmldoc";
import type {
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  TypeReference
} from "../core";
import type { LanguageAdapter } from "./index";

interface CSharpTypeMatch {
  kind: string;
  name: string;
  line: number;
  documentation?: SymbolDocumentation;
  typeReferences?: TypeReference[];
}

// Kept for reference; TYPE_WITH_INHERITANCE_PATTERN supersedes it
const _TYPE_DECLARATION_PATTERN = /^\s*(?:\b(?:public|internal|protected|private|abstract|sealed|static|partial|readonly|unsafe|ref|file|new)\s+)*(class|struct|interface|record|enum)(?:\s+(?:class|struct))?\s+([A-Za-z_][A-Za-z0-9_]*)/gm;
// Extended pattern to capture inheritance clause: class Name<T> : Base, IInterface where T : constraint
const TYPE_WITH_INHERITANCE_PATTERN = /^\s*(?:\b(?:public|internal|protected|private|abstract|sealed|static|partial|readonly|unsafe|ref|file|new)\s+)*(class|struct|interface|record|enum)(?:\s+(?:class|struct))?\s+([A-Za-z_][A-Za-z0-9_]*)(?:<[^>]+>)?\s*(?::\s*([^{\n]+))?/gm;
const MEMBER_MODIFIER_FRAGMENT = "(?:static|virtual|override|sealed|abstract|async|readonly|unsafe|extern|partial|new)";
const FIELD_MODIFIER_FRAGMENT = "(?:static|readonly|const|volatile|new)";
const ACCESS_MODIFIER_FRAGMENT = "(?:public|protected|internal|protected\\s+internal|internal\\s+protected|private\\s+protected)";

const METHOD_DECLARATION_PATTERN = new RegExp(
  `^\\s*(?:${ACCESS_MODIFIER_FRAGMENT})\\s+(?:${MEMBER_MODIFIER_FRAGMENT}\\s+)*[\\w<>\\[\\],?.]+\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*\\(`
);
const CONSTRUCTOR_DECLARATION_PATTERN = new RegExp(
  `^\\s*(?:${ACCESS_MODIFIER_FRAGMENT})\\s+(?:${MEMBER_MODIFIER_FRAGMENT}\\s+)*([A-Za-z_][A-Za-z0-9_]*)\\s*\\((?!.*=>)`
);
const EVENT_DECLARATION_PATTERN = new RegExp(
  `^\\s*(?:${ACCESS_MODIFIER_FRAGMENT})\\s+(?:${MEMBER_MODIFIER_FRAGMENT}\\s+)*event\\s+[\\w<>\\[\\],?.]+\\s+([A-Za-z_][A-Za-z0-9_]*)`
);
const PROPERTY_DECLARATION_PATTERN = new RegExp(
  `^\\s*(?:${ACCESS_MODIFIER_FRAGMENT})\\s+(?:${MEMBER_MODIFIER_FRAGMENT}\\s+)*[\\w<>\\[\\],?.]+\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(?:=>|\\{\\s*(?:get|set))`
);
const FIELD_DECLARATION_PATTERN = new RegExp(
  `^\\s*(?:${ACCESS_MODIFIER_FRAGMENT})\\s+(?:${FIELD_MODIFIER_FRAGMENT}\\s+)*[\\w<>\\[\\],?.]+\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(?:=|;)`
);

export const csharpAdapter: LanguageAdapter = {
  id: "csharp-basic",
  extensions: [".cs"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = await extractDependencies({
      content,
      absolutePath,
      workspaceRoot,
      extractSymbolsFn: extractSymbols
    });

    if (symbols.length === 0 && dependencies.length === 0) {
      return {
        symbols: [],
        dependencies: []
      } as SourceAnalysisResult;
    }

    return {
      symbols,
      dependencies
    } as SourceAnalysisResult;
  }
};

function extractSymbols(content: string): PublicSymbolEntry[] {
  const matches: CSharpTypeMatch[] = [];
  let match: RegExpExecArray | null;

  // Use the extended pattern that captures inheritance clauses
  while ((match = TYPE_WITH_INHERITANCE_PATTERN.exec(content)) !== null) {
    const kind = match[1];
    const name = match[2];
    const inheritanceClause = match[3]?.trim();
    if (!kind || !name) {
      continue;
    }

    const line = computeLineNumber(content, match.index);
    const documentation = extractDocumentation(content, match.index);
    const typeReferences = extractTypeReferencesFromInheritance(kind, inheritanceClause);
    matches.push({ kind, name, line, documentation, typeReferences });
  }

  TYPE_WITH_INHERITANCE_PATTERN.lastIndex = 0;

  const symbols = matches
    .sort((a, b) => a.line - b.line || a.name.localeCompare(b.name))
    .map((entry) => ({
      name: entry.name,
      kind: entry.kind,
      location: {
        line: entry.line,
        character: 1
      },
      documentation: entry.documentation ?? undefined,
      typeReferences: entry.typeReferences && entry.typeReferences.length > 0 ? entry.typeReferences : undefined
    })) as PublicSymbolEntry[];

  const memberSymbols = extractMemberSymbols(content);
  const combined = [...symbols, ...memberSymbols];

  combined.sort((a, b) => {
    const lineDiff = (a.location?.line ?? Number.MAX_SAFE_INTEGER) - (b.location?.line ?? Number.MAX_SAFE_INTEGER);
    if (lineDiff !== 0) {
      return lineDiff;
    }
    const charDiff = (a.location?.character ?? Number.MAX_SAFE_INTEGER) - (b.location?.character ?? Number.MAX_SAFE_INTEGER);
    if (charDiff !== 0) {
      return charDiff;
    }
    return a.name.localeCompare(b.name);
  });

  return combined;
}

/**
 * Extracts type references from a C# inheritance clause.
 * Handles patterns like:
 * - `class Foo : Bar` → extends Bar
 * - `class Foo : Bar, IInterface` → extends Bar, implements IInterface
 * - `interface IFoo : IBar, IBaz` → extends IBar, IBaz
 * - `class Foo : Base where T : constraint` → extends Base (strips where clause)
 *
 * @param typeKind - The kind of type declaration (class, struct, interface, record, enum)
 * @param inheritanceClause - The text after the colon (e.g., "Base, IFoo, IBar where T : constraint")
 * @returns Array of type references with appropriate roles
 */
function extractTypeReferencesFromInheritance(
  typeKind: string,
  inheritanceClause: string | undefined
): TypeReference[] {
  if (!inheritanceClause) {
    return [];
  }

  // Strip "where" constraints (e.g., "where T : IDisposable")
  const withoutWhere = inheritanceClause.split(/\s+where\s+/)[0]?.trim() ?? "";
  if (!withoutWhere) {
    return [];
  }

  // Split by comma to get individual base types
  const baseTypes = withoutWhere
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  const references: TypeReference[] = [];
  const isInterface = typeKind === "interface";

  for (let i = 0; i < baseTypes.length; i++) {
    const typeName = baseTypes[i];
    // Strip generic parameters for the name (e.g., "List<T>" → "List")
    const cleanName = typeName.replace(/<[^>]+>/g, "").trim();
    if (!cleanName) {
      continue;
    }

    // Skip common system types that aren't worth linking
    if (isSystemType(cleanName)) {
      continue;
    }

    // For interfaces: all base types are "extends" (interfaces extend other interfaces)
    // For classes: first non-interface is "extends", interfaces are "implements"
    // Heuristic: interfaces start with "I" followed by uppercase letter
    const looksLikeInterface = /^I[A-Z]/.test(cleanName);

    let role: TypeReference["role"];
    if (isInterface) {
      role = "extends";
    } else if (i === 0 && !looksLikeInterface) {
      // First type and doesn't look like interface → base class
      role = "extends";
    } else {
      // Interface implementation
      role = "implements";
    }

    references.push({ name: cleanName, role });
  }

  return references;
}

/**
 * Checks if a type name is a common system/framework type that shouldn't be linked.
 */
function isSystemType(typeName: string): boolean {
  const systemTypes = new Set([
    "object", "Object",
    "string", "String",
    "int", "Int32", "Int64", "long", "short", "Int16",
    "float", "Single", "double", "Double", "decimal", "Decimal",
    "bool", "Boolean",
    "byte", "Byte", "sbyte", "SByte",
    "char", "Char",
    "void", "Void",
    "dynamic",
    "ValueType", "Enum", "Array", "Delegate", "MulticastDelegate",
    // Common system interfaces
    "IDisposable", "IEnumerable", "IEnumerator", "IComparable", "IEquatable",
    "ICloneable", "IFormattable", "IConvertible", "IAsyncDisposable"
  ]);
  return systemTypes.has(typeName);
}

function computeLineNumber(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content[i] === "\n") {
      line += 1;
    }
  }
  return line;
}

function extractDocumentation(content: string, startIndex: number): SymbolDocumentation | undefined {
  let cursor = startIndex;
  const docLines: string[] = [];
  let seenComment = false;

  while (cursor > 0) {
    const prevNewline = content.lastIndexOf("\n", cursor - 1);
    const lineStart = prevNewline + 1;
    const line = content.slice(lineStart, cursor).replace(/\r$/, "");

    if (/^\s*$/.test(line)) {
      if (seenComment) {
        break;
      }
      cursor = prevNewline >= 0 ? prevNewline : 0;
      continue;
    }

    if (/^\s*\/\/\//.test(line)) {
      docLines.unshift(line);
      seenComment = true;
      cursor = prevNewline >= 0 ? prevNewline : 0;
      continue;
    }

    break;
  }

  return buildDocumentationFromLines(docLines);
}

function extractMemberSymbols(content: string): PublicSymbolEntry[] {
  const lines = content.split(/\r?\n/);
  const results: PublicSymbolEntry[] = [];
  let docBuffer: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (/^\s*\/\/\//.test(trimmed)) {
      docBuffer.push(rawLine);
      continue;
    }

    if (!trimmed) {
      if (docBuffer.length > 0) {
        continue;
      }
      continue;
    }

    if (docBuffer.length > 0 && /^\s*\[/.test(trimmed)) {
      continue;
    }

    let documentation: SymbolDocumentation | undefined;
    if (docBuffer.length > 0) {
      documentation = buildDocumentationFromLines(docBuffer);
      docBuffer = [];
    }

    let match: RegExpExecArray | null;

    match = EVENT_DECLARATION_PATTERN.exec(rawLine);
    if (match) {
      results.push(createMemberEntry({
        kind: "event",
        name: match[1],
        line: index + 1,
        columnLine: rawLine,
        documentation
      }));
      continue;
    }

    match = CONSTRUCTOR_DECLARATION_PATTERN.exec(rawLine);
    if (match) {
      results.push(createMemberEntry({
        kind: "constructor",
        name: match[1],
        line: index + 1,
        columnLine: rawLine,
        documentation
      }));
      continue;
    }

    match = METHOD_DECLARATION_PATTERN.exec(rawLine);
    if (match) {
      results.push(createMemberEntry({
        kind: "method",
        name: match[1],
        line: index + 1,
        columnLine: rawLine,
        documentation
      }));
      continue;
    }

    if (rawLine.includes("(")) {
      continue;
    }

    match = PROPERTY_DECLARATION_PATTERN.exec(rawLine);
    if (match) {
      results.push(createMemberEntry({
        kind: "property",
        name: match[1],
        line: index + 1,
        columnLine: rawLine,
        documentation
      }));
      continue;
    }

    if (rawLine.includes("=>") || rawLine.includes("{")) {
      continue;
    }

    match = FIELD_DECLARATION_PATTERN.exec(rawLine);
    if (match) {
      results.push(createMemberEntry({
        kind: "field",
        name: match[1],
        line: index + 1,
        columnLine: rawLine,
        documentation
      }));
    }
  }

  return results;
}

function createMemberEntry(args: {
  kind: string;
  name: string;
  line: number;
  columnLine: string;
  documentation?: SymbolDocumentation;
}): PublicSymbolEntry {
  const column = args.columnLine.indexOf(args.name);
  return {
    name: args.name,
    kind: args.kind,
    location: {
      line: args.line,
      character: column >= 0 ? column + 1 : 1
    },
    documentation: args.documentation
  } as PublicSymbolEntry;
}
