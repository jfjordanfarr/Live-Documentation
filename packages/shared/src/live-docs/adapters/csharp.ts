import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLink,
  SymbolDocumentationLinkKind,
  SymbolDocumentationParameter,
  TypeReference
} from "../core";
import type { LanguageAdapter } from "./index";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";

interface CSharpTypeMatch {
  kind: string;
  name: string;
  line: number;
  documentation?: SymbolDocumentation;
  typeReferences?: TypeReference[];
}

const USING_DIRECTIVE_PATTERN = /^\s*using\s+(?:static\s+)?([^=;]+);/gm;
// Kept for reference; TYPE_WITH_INHERITANCE_PATTERN supersedes it
const _TYPE_DECLARATION_PATTERN = /^\s*(?:\b(?:public|internal|protected|private|abstract|sealed|static|partial|readonly|unsafe|ref|file|new)\s+)*(class|struct|interface|record|enum)(?:\s+(?:class|struct))?\s+([A-Za-z_][A-Za-z0-9_]*)/gm;
// Extended pattern to capture inheritance clause: class Name<T> : Base, IInterface where T : constraint
const TYPE_WITH_INHERITANCE_PATTERN = /^\s*(?:\b(?:public|internal|protected|private|abstract|sealed|static|partial|readonly|unsafe|ref|file|new)\s+)*(class|struct|interface|record|enum)(?:\s+(?:class|struct))?\s+([A-Za-z_][A-Za-z0-9_]*)(?:<[^>]+>)?\s*(?::\s*([^{\n]+))?/gm;
const BUILT_IN_NAMESPACE_PREFIX = "System";
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
const APP_SETTINGS_PATTERN = /ConfigurationManager\.AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
const CONFIGURATION_INDEXER_PATTERN = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*"([^"]+)"\s*\]/g;
const TYPE_GET_TYPE_PATTERN = /Type\.GetType\s*\(\s*"([^"]+)"\s*\)/g;
const TYPE_NAME_LITERAL_PATTERN = /"([A-Z][A-Za-z0-9_]*(?:\.[A-Z][A-Za-z0-9_]*)+)"/g;
const HANGFIRE_GENERIC_CALL_PATTERN = /\b(?:BackgroundJob|IBackgroundJobClient|RecurringJob|IRecurringJobManager)\s*\.\s*(?:Enqueue|Schedule|AddOrUpdate)\s*<\s*([^>\s]+)\s*>/g;
const HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*(Enqueue|Schedule|AddOrUpdate)\s*<\s*([^>\s]+)\s*>/g;

export const csharpAdapter: LanguageAdapter = {
  id: "csharp-basic",
  extensions: [".cs"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = await extractDependencies({
      content,
      absolutePath,
      workspaceRoot
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

async function extractDependencies(params: {
  content: string;
  absolutePath: string;
  workspaceRoot: string;
}): Promise<DependencyEntry[]> {
  const { content, absolutePath, workspaceRoot } = params;
  const namespaces = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = USING_DIRECTIVE_PATTERN.exec(content)) !== null) {
    const directive = match[1]?.trim();
    if (!directive || directive.includes("=")) {
      continue;
    }

    const normalized = directive.replace(/\s+/g, "");
    if (!normalized) {
      continue;
    }

    if (
      normalized === BUILT_IN_NAMESPACE_PREFIX ||
      normalized.startsWith(`${BUILT_IN_NAMESPACE_PREFIX}.`)
    ) {
      continue;
    }

    namespaces.add(normalized);
  }

  USING_DIRECTIVE_PATTERN.lastIndex = 0;

  const dependencies = Array.from(namespaces)
    .sort((a, b) => a.localeCompare(b))
    .map((specifier) => ({
      specifier,
      resolvedPath: undefined,
      symbols: [],
      kind: "import"
    })) as DependencyEntry[];

  const appSettingsMatches = collectConfigKeys(APP_SETTINGS_PATTERN, content);
  if (appSettingsMatches.size > 0) {
    const configPath = await locateNearestFile(absolutePath, workspaceRoot, ["Web.config", "web.config", "App.config", "app.config"]);
    if (configPath) {
      dependencies.push({
        specifier: configPath,
        resolvedPath: configPath,
        symbols: Array.from(appSettingsMatches).sort(),
        kind: "import"
      });
    }
  }

  const configurationKeys = collectConfigurationIndexerKeys(content);
  if (configurationKeys.size > 0) {
    const appsettingsPath = await locateNearestFile(absolutePath, workspaceRoot, [
      "appsettings.json",
      "appsettings.Development.json",
      "appsettings.Production.json"
    ]);
    if (appsettingsPath) {
      dependencies.push({
        specifier: appsettingsPath,
        resolvedPath: appsettingsPath,
        symbols: Array.from(configurationKeys).sort(),
        kind: "import"
      });
    }
  }

  const reflectionTypes = collectConfigKeys(TYPE_GET_TYPE_PATTERN, content);
  const literalTypeNames = collectTypeNameLiterals(content);
  const combinedTypeNames = new Set<string>([...reflectionTypes, ...literalTypeNames]);
  if (combinedTypeNames.size > 0) {
    const resolvedTypes = await resolveReflectionTargets(Array.from(combinedTypeNames), workspaceRoot);
    for (const resolved of resolvedTypes) {
      dependencies.push(resolved);
    }
  }

  const hangfireTargets = collectHangfireTargets(content);
  if (hangfireTargets.size > 0) {
    const resolved = await resolveReflectionTargets(Array.from(hangfireTargets), workspaceRoot);
    dependencies.push(...resolved);
  }

  return dependencies;
}

function collectConfigKeys(pattern: RegExp, content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const value = match[1]?.trim();
    if (value) {
      results.add(value);
    }
  }

  pattern.lastIndex = 0;
  return results;
}

function collectConfigurationIndexerKeys(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = CONFIGURATION_INDEXER_PATTERN.exec(content)) !== null) {
    const identifier = match[1]?.trim();
    const key = match[2]?.trim();
    if (!key) {
      continue;
    }

    if (identifier && /config/i.test(identifier)) {
      results.add(key);
    }
  }

  CONFIGURATION_INDEXER_PATTERN.lastIndex = 0;
  return results;
}

function collectTypeNameLiterals(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = TYPE_NAME_LITERAL_PATTERN.exec(content)) !== null) {
    const literal = match[1]?.trim();
    if (!literal) {
      continue;
    }

    const segments = literal.split(".");
    if (segments.length < 2) {
      continue;
    }

    if (!segments.every((segment) => /^[A-Z]/.test(segment))) {
      continue;
    }

    const preceding = content[match.index - 1];
    if (preceding && /[A-Za-z0-9_]/.test(preceding)) {
      continue;
    }

    results.add(literal);
  }

  TYPE_NAME_LITERAL_PATTERN.lastIndex = 0;
  return results;
}

function collectHangfireTargets(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = HANGFIRE_GENERIC_CALL_PATTERN.exec(content)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }
    const candidate = raw.replace(/\s+/g, "");
    if (candidate.includes("(")) {
      continue;
    }
    results.add(candidate);
  }

  HANGFIRE_GENERIC_CALL_PATTERN.lastIndex = 0;

  const recurringManagers = collectTypeIdentifiers(content, "IRecurringJobManager");
  const backgroundClients = collectTypeIdentifiers(content, "IBackgroundJobClient");
  const aliasCandidates = new Set<string>([...recurringManagers, ...backgroundClients]);

  while ((match = HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN.exec(content)) !== null) {
    const alias = match[1]?.trim();
    const method = match[2]?.trim();
    const raw = match[3]?.trim();
    if (!alias || !raw) {
      continue;
    }

    if (!aliasCandidates.has(alias)) {
      continue;
    }

    if (method === "AddOrUpdate" && !recurringManagers.has(alias)) {
      continue;
    }

    const candidate = raw.replace(/\s+/g, "");
    if (candidate.includes("(")) {
      continue;
    }

    results.add(candidate);
  }

  HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN.lastIndex = 0;
  return results;
}

function collectTypeIdentifiers(content: string, typeName: string): Set<string> {
  const results = new Set<string>();
  const pattern = new RegExp(`\\b${typeName}\\s+([A-Za-z_][A-Za-z0-9_]*)`, "g");
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const identifier = match[1]?.trim();
    if (identifier) {
      results.add(identifier);
    }
  }

  pattern.lastIndex = 0;
  return results;
}

async function locateNearestFile(
  sourcePath: string,
  workspaceRoot: string,
  candidates: string[]
): Promise<string | undefined> {
  const workspaceResolved = path.resolve(workspaceRoot);
  let current = path.resolve(path.dirname(sourcePath));

  while (true) {
    for (const candidate of candidates) {
      const absoluteCandidate = path.join(current, candidate);
      if (await fileExists(absoluteCandidate)) {
        return normalizeWorkspacePath(path.relative(workspaceRoot, absoluteCandidate));
      }
    }

    if (current === workspaceResolved) {
      break;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return undefined;
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function resolveReflectionTargets(
  typeNames: string[],
  workspaceRoot: string
): Promise<DependencyEntry[]> {
  const results: DependencyEntry[] = [];

  for (const typeName of typeNames) {
    const resolved = await resolveReflectionTarget(typeName, workspaceRoot);
    if (resolved) {
      results.push(resolved);
    }
  }

  return results;
}

async function resolveReflectionTarget(
  typeName: string,
  workspaceRoot: string
): Promise<DependencyEntry | undefined> {
  const segments = typeName.split(".").filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  const simpleName = segments[segments.length - 1];
  const namespacePrefix = segments.slice(0, -1).join(".");

  const pattern = `**/${simpleName}.cs`;
  const matches = await glob(pattern, {
    cwd: workspaceRoot,
    absolute: true,
    nodir: true,
    windowsPathsNoEscape: true
  });

  for (const candidate of matches) {
    const content = await readFileSafe(candidate);
    if (!content) {
      continue;
    }

    if (namespacePrefix && !content.includes(`namespace ${namespacePrefix}`)) {
      continue;
    }

    const relative = normalizeWorkspacePath(path.relative(workspaceRoot, candidate));
    let symbolTargets: Record<string, string> | undefined;

    const symbolEntries = extractSymbols(content);
    const targetSymbol = symbolEntries.find((entry) => entry.name === simpleName && entry.kind);
    if (targetSymbol?.kind) {
      const normalizedKind = targetSymbol.kind.toLowerCase();
      symbolTargets = {
        [typeName]: `${targetSymbol.name} (${normalizedKind})`
      };
    }

    return {
      specifier: relative,
      resolvedPath: relative,
      symbols: [typeName],
      kind: "import",
      symbolTargets
    };
  }

  return undefined;
}

async function readFileSafe(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
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

function buildDocumentationFromLines(docLines: string[]): SymbolDocumentation | undefined {
  if (docLines.length === 0) {
    return undefined;
  }

  const rawBlock = docLines.map(stripDocCommentMarker).join("\n");
  if (!rawBlock.trim()) {
    return undefined;
  }

  const documentation: SymbolDocumentation = {
    source: "csharp-xml"
  };

  const summary = extractSingleTagText(rawBlock, "summary");
  if (summary) {
    documentation.summary = summary;
  }

  const remarks = extractSingleTagText(rawBlock, "remarks");
  if (remarks) {
    documentation.remarks = remarks;
  }

  const returnsText = extractSingleTagText(rawBlock, "returns");
  if (returnsText) {
    documentation.returns = returnsText;
  }

  const valueText = extractSingleTagText(rawBlock, "value");
  if (valueText) {
    documentation.value = valueText;
  }

  const parameters = extractParameterTags(rawBlock, "param");
  if (parameters.length > 0) {
    documentation.parameters = parameters;
  }

  const typeParameters = extractParameterTags(rawBlock, "typeparam");
  if (typeParameters.length > 0) {
    documentation.typeParameters = typeParameters;
  }

  const exceptions = extractExceptionTags(rawBlock);
  if (exceptions.length > 0) {
    documentation.exceptions = exceptions;
  }

  const examples = extractExampleTags(rawBlock);
  if (examples.length > 0) {
    documentation.examples = examples;
  }

  const links = extractLinkTags(rawBlock);
  if (links.length > 0) {
    documentation.links = links;
  }

  const rawFragments = extractRawDocFragments(rawBlock);
  if (rawFragments.length > 0) {
    documentation.rawFragments = rawFragments;
  }

  const unsupportedTags = detectUnsupportedTags(rawBlock);
  if (unsupportedTags.length > 0) {
    documentation.unsupportedTags = unsupportedTags;
  }

  return hasStructuredContent(documentation) ? documentation : undefined;
}

function stripDocCommentMarker(line: string): string {
  return line.replace(/^\s*\/\/\/\s?/, "");
}

function extractSingleTagText(block: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "gi");
  const match = regex.exec(block);
  if (!match) {
    return undefined;
  }
  regex.lastIndex = 0;
  const normalized = normalizeXmlText(match[1]);
  return normalized || undefined;
}

function extractParameterTags(block: string, tagName: string): SymbolDocumentationParameter[] {
  const regex = new RegExp(`<${tagName}\\s+name="([^"]+)"[^>]*>([\\s\\S]*?)</${tagName}>`, "gi");
  const results: SymbolDocumentationParameter[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    const name = match[1];
    const raw = match[2];
    const description = normalizeXmlText(raw);
    results.push({
      name,
      description: description || undefined
    });
  }
  regex.lastIndex = 0;
  return results;
}

function extractExceptionTags(block: string): SymbolDocumentationException[] {
  const regex = /<exception\s+cref="([^"]+)"[^>]*>([\s\S]*?)<\/exception>/gi;
  const results: SymbolDocumentationException[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    const type = match[1];
    const description = normalizeXmlText(match[2]);
    results.push({
      type,
      description: description || undefined
    });
  }
  regex.lastIndex = 0;
  results.sort((a, b) => {
    const typeDiff = (a.type ?? "").localeCompare(b.type ?? "");
    if (typeDiff !== 0) {
      return typeDiff;
    }
    return (a.description ?? "").localeCompare(b.description ?? "");
  });
  return results;
}

function extractExampleTags(block: string): SymbolDocumentationExample[] {
  const regex = /<example>([\s\S]*?)<\/example>/gi;
  const examples: SymbolDocumentationExample[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    const content = match[1];
    const codeMatch = content.match(/<code(?:\s+lang="([^"]+)")?>([\s\S]*?)<\/code>/i);
    let descriptionFragment = content;
    let language: string | undefined;
    let code: string | undefined;
    if (codeMatch) {
      language = codeMatch[1] ? decodeXmlEntities(codeMatch[1]) : undefined;
      code = decodeXmlEntities(codeMatch[2]).trimEnd();
      descriptionFragment = content.replace(codeMatch[0], "");
    }
    const description = normalizeXmlText(descriptionFragment);
    if ((description && description.length > 0) || (code && code.length > 0)) {
      examples.push({
        description: description || undefined,
        code,
        language
      });
    }
  }
  regex.lastIndex = 0;
  return examples;
}

function extractLinkTags(block: string): SymbolDocumentationLink[] {
  const links: SymbolDocumentationLink[] = [];
  const seen = new Set<string>();

  const register = (target: string | undefined, text: string | undefined): void => {
    if (!target) {
      return;
    }
    const normalizedTarget = target.trim();
    if (!normalizedTarget) {
      return;
    }
    const kind: SymbolDocumentationLinkKind = /^https?:\/\//i.test(normalizedTarget)
      ? "href"
      : "cref";
    const resolvedTarget = kind === "cref" ? normalizeCrefTarget(normalizedTarget) : normalizedTarget;
    const normalizedText = text?.trim();
    const key = `${kind}|${resolvedTarget}|${normalizedText ?? ""}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    links.push({
      kind,
      target: resolvedTarget,
      text: normalizedText && normalizedText !== resolvedTarget ? normalizedText : undefined
    });
  };

  const tagRegex = /<(see|seealso)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(block)) !== null) {
    const attrs = parseXmlAttributes(match[2] ?? "");
    const body = match[3] ? normalizeXmlText(match[3]) : "";
    const targetCandidate = attrs.href ?? attrs.cref ?? body;
    register(targetCandidate, body || undefined);
  }

  links.sort((a, b) => {
    const targetDiff = a.target.localeCompare(b.target);
    if (targetDiff !== 0) {
      return targetDiff;
    }
    const kindDiff = a.kind.localeCompare(b.kind);
    if (kindDiff !== 0) {
      return kindDiff;
    }
    return (a.text ?? "").localeCompare(b.text ?? "");
  });

  return links;
}

function extractRawDocFragments(block: string): string[] {
  const fragments = new Set<string>();
  const inheritDocRegex = /<inheritdoc[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = inheritDocRegex.exec(block)) !== null) {
    fragments.add(match[0].replace(/\s+/g, " ").trim());
  }
  inheritDocRegex.lastIndex = 0;

  const includeRegex = /<include[^>]*>/gi;
  while ((match = includeRegex.exec(block)) !== null) {
    fragments.add(match[0].replace(/\s+/g, " ").trim());
  }
  includeRegex.lastIndex = 0;

  return Array.from(fragments).sort((a, b) => a.localeCompare(b));
}

const RECOGNIZED_DOC_TAGS = new Set<string>([
  "summary",
  "remarks",
  "param",
  "typeparam",
  "returns",
  "value",
  "exception",
  "example",
  "see",
  "seealso",
  "paramref",
  "typeparamref",
  "langword",
  "para",
  "list",
  "item",
  "description",
  "term",
  "code",
  "c",
  "br",
  "inheritdoc",
  "include"
]);

function detectUnsupportedTags(block: string): string[] {
  const unsupported = new Set<string>();
  const regex = /<\/?\s*([a-zA-Z0-9!-]+)(?=[\s>/])/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    const tagName = match[1].toLowerCase();
    if (tagName.startsWith("!--")) {
      continue;
    }
    if (!RECOGNIZED_DOC_TAGS.has(tagName)) {
      unsupported.add(tagName);
    }
  }
  regex.lastIndex = 0;
  return Array.from(unsupported).sort((a, b) => a.localeCompare(b));
}

function parseXmlAttributes(fragment: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w+)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(fragment)) !== null) {
    attributes[match[1].toLowerCase()] = decodeXmlEntities(match[2]);
  }
  return attributes;
}

function normalizeXmlText(value: string): string {
  if (!value) {
    return "";
  }

  let working = value.replace(/\r\n/g, "\n");

  working = working
    .replace(/<para\s*\/>/gi, "\n\n")
    .replace(/<para>/gi, "\n\n")
    .replace(/<\/para>/gi, "\n\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<list[^>]*type="bullet"[^>]*>/gi, "\n")
    .replace(/<list[^>]*type="number"[^>]*>/gi, "\n")
    .replace(/<list[^>]*>/gi, "\n")
    .replace(/<\/list>/gi, "\n")
    .replace(/<item>/gi, "\n- ")
    .replace(/<\/item>/gi, "")
    .replace(/<description>/gi, ": ")
    .replace(/<\/description>/gi, "")
    .replace(/<term>/gi, "")
    .replace(/<\/term>/gi, "");

  working = working
    .replace(/<see\s+cref="([^"]+)"[^>]*>([\s\S]*?)<\/see>/gi, (_match: string, cref: string, text?: string) => {
      return renderCrefText(cref, text);
    })
    .replace(/<see\s+cref="([^"]+)"[^>]*\/>/gi, (_match: string, cref: string) => {
      return renderCrefText(cref);
    })
    .replace(/<see\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/see>/gi, (_match: string, href: string, text?: string) => {
      const inner = text?.trim();
      return inner && inner.length > 0 ? `${inner} (${href})` : href;
    })
    .replace(/<see\s+href="([^"]+)"[^>]*\/>/gi, "$1")
    .replace(/<see\s+langword="([^"]+)"[^>]*\/>/gi, "`$1`")
    .replace(/<paramref\s+name="([^"]+)"[^>]*\/>/gi, "`$1`")
    .replace(/<typeparamref\s+name="([^"]+)"[^>]*\/>/gi, "`$1`")
    .replace(/<c>([\s\S]*?)<\/c>/gi, (_match: string, inlineCode: string) => `\`${inlineCode.trim()}\``)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match: string, codeBlock: string) => {
      const trimmed = decodeXmlEntities(codeBlock).trimEnd();
      return `\n\n\`\`\`\n${trimmed}\n\`\`\`\n\n`;
    });

  working = working.replace(/<\/?[^>]+>/g, "");

  working = decodeXmlEntities(working);

  working = working
    .split("\n")
    .map((line) => line.replace(/\s+$/u, ""))
    .join("\n");

  working = working.replace(/\n{3,}/g, "\n\n");

  return working.trim();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeCrefTarget(value: string): string {
  if (!value) {
    return value;
  }

  let normalized = value.trim();
  if (!normalized) {
    return normalized;
  }

  normalized = normalized.replace(/^[A-Z]:/, "");
  normalized = normalized.replace(/#ctor/g, ".ctor");
  normalized = normalized.replace(/\{([^}]+)\}/g, "<$1>");

  return normalized;
}

function renderCrefText(cref: string, inner?: string): string {
  const normalizedTarget = normalizeCrefTarget(cref);
  const normalizedInner = inner?.trim();
  if (normalizedInner && normalizedInner.length > 0 && normalizedInner !== normalizedTarget) {
    return normalizedInner;
  }
  return `\`${normalizedTarget}\``;
}

function hasStructuredContent(doc: SymbolDocumentation): boolean {
  return Boolean(
    doc.summary ||
      doc.remarks ||
      doc.returns ||
      doc.value ||
      doc.parameters?.length ||
      doc.typeParameters?.length ||
      doc.exceptions?.length ||
      doc.examples?.length ||
      doc.links?.length ||
      doc.rawFragments?.length ||
      doc.unsupportedTags?.length
  );
}
