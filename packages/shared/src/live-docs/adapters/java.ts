import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import * as path from "node:path";

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

// Captures: [1] docblock, [2] access, [3] kind, [4] name, [5] extends clause, [6] implements clause
// Uses non-greedy +? and lookahead to opening paren (records) or brace (classes) to separate clauses
const TYPE_DECLARATION_PATTERN = /((?:\s*\/\*\*[\s\S]*?\*\/\s*)?)(public|protected)\s+(?:(?:abstract|final|sealed|static)\s+)*(class|interface|enum|record)\s+([A-Za-z_][A-Za-z0-9_$]*)(?:<[^>]+>)?(?:\s+extends\s+([A-Za-z0-9_$.,<>\s]+?))?(?:\s+implements\s+([A-Za-z0-9_$.,<>\s]+?))?(?=\s*[({])/g;
const MEMBER_DECLARATION_PATTERN = /((?:\s*\/\*\*[\s\S]*?\*\/\s*)?)(public|protected)\s+(?:static\s+|final\s+|abstract\s+|default\s+|synchronized\s+|strictfp\s+)*(?:([^\s(]+)\s+)?([A-Za-z_][A-Za-z0-9_$]*)\s*\(/g;
const IMPORT_PATTERN = /^\s*import\s+([^;]+);/gm;
const PACKAGE_PATTERN = /^\s*package\s+([A-Za-z_][A-Za-z0-9_$.]*)\s*;/m;
const BUILT_IN_PACKAGE_PREFIX = "java.";

/**
 * Extracts the package declaration from Java source content.
 * @returns The package name (e.g., "com.example.app") or undefined if none found
 */
function extractPackage(content: string): string | undefined {
  const match = PACKAGE_PATTERN.exec(content);
  return match?.[1]?.trim();
}

/**
 * Computes the source root directory by subtracting the package path from the file path.
 *
 * Given:
 *   - absolutePath: /project/src/com/example/app/App.java
 *   - packageName: com.example.app
 *
 * Returns: /project/src
 *
 * This enables resolving other imports like `com.example.data.Reader` to
 * `/project/src/com/example/data/Reader.java`
 */
function computeSourceRoot(absolutePath: string, packageName: string | undefined): string | undefined {
  if (!packageName) {
    // No package declaration — file is in the default package
    // Source root is the directory containing the file
    return path.dirname(absolutePath);
  }

  // Convert package name to path segments: com.example.app → com/example/app
  const packagePath = packageName.replace(/\./g, path.sep);

  // The file path should end with /{packagePath}/{ClassName}.java
  // We need to find where the package path starts in the file path
  const normalizedAbsPath = path.normalize(absolutePath);
  const dirPath = path.dirname(normalizedAbsPath);

  // Check if the directory ends with the package path
  if (dirPath.endsWith(packagePath)) {
    return dirPath.slice(0, dirPath.length - packagePath.length - 1); // -1 for trailing separator
  }

  // Fallback: could not determine source root
  return undefined;
}

/**
 * Resolves a Java import specifier to a workspace-relative file path.
 *
 * Given:
 *   - specifier: com.example.data.Reader
 *   - sourceRoot: /project/src
 *   - workspaceRoot: /project
 *
 * Returns: src/com/example/data/Reader.java (workspace-relative, if file exists)
 */
function resolveJavaImport(
  specifier: string,
  sourceRoot: string | undefined,
  workspaceRoot: string
): string | undefined {
  if (!sourceRoot) {
    return undefined;
  }

  // Handle wildcard imports (com.example.data.*) — cannot resolve to a specific file
  if (specifier.endsWith(".*")) {
    return undefined;
  }

  // Convert fully-qualified name to path: com.example.data.Reader → com/example/data/Reader.java
  const relativePath = specifier.replace(/\./g, path.sep) + ".java";
  const absolutePath = path.join(sourceRoot, relativePath);

  // Verify the file exists
  if (existsSync(absolutePath)) {
    // Return workspace-relative path (forward slashes for consistency)
    return path.relative(workspaceRoot, absolutePath).replace(/\\/g, "/");
  }

  return undefined;
}

export const javaAdapter: LanguageAdapter = {
  id: "java-basic",
  extensions: [".java"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);

    // Compute source root from package declaration
    const packageName = extractPackage(content);
    const sourceRoot = computeSourceRoot(absolutePath, packageName);

    const dependencies = extractDependencies(content, sourceRoot, workspaceRoot);

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
  const results: PublicSymbolEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = TYPE_DECLARATION_PATTERN.exec(content)) !== null) {
    const declarationIndex = match.index + (match[1] ? match[1].length : 0);
    const { line, character } = computePosition(content, declarationIndex);
    const documentation = parseJavaDoc(match[1]);
    const kind = match[3];
    const extendsClause = match[5]?.trim();
    const implementsClause = match[6]?.trim();

    // Extract type references from inheritance
    const typeReferences: TypeReference[] = [];
    if (extendsClause) {
      // For interfaces, extends can have multiple types; for classes, just one
      const types = extendsClause.split(",").map(t => t.trim().split("<")[0].trim()).filter(Boolean);
      for (const typeName of types) {
        typeReferences.push({
          name: typeName,
          role: "extends"
        });
      }
    }
    if (implementsClause) {
      const types = implementsClause.split(",").map(t => t.trim().split("<")[0].trim()).filter(Boolean);
      for (const typeName of types) {
        typeReferences.push({
          name: typeName,
          role: "implements"
        });
      }
    }

    results.push({
      name: match[4],
      kind,
      location: {
        line,
        character
      },
      documentation: documentation ?? undefined,
      typeReferences: typeReferences.length > 0 ? typeReferences : undefined
    } as PublicSymbolEntry);
  }

  TYPE_DECLARATION_PATTERN.lastIndex = 0;

  while ((match = MEMBER_DECLARATION_PATTERN.exec(content)) !== null) {
    const returnType = match[3] ? match[3].trim() : "";
    if (returnType === "class" || returnType === "interface" || returnType === "enum" || returnType === "record") {
      continue;
    }

    const declarationIndex = match.index + (match[1] ? match[1].length : 0);
    const { line, character } = computePosition(content, declarationIndex);
    const documentation = parseJavaDoc(match[1]);

    const kind = returnType ? "method" : "constructor";

    results.push({
      name: match[4],
      kind,
      location: {
        line,
        character
      },
      documentation: documentation ?? undefined
    } as PublicSymbolEntry);
  }

  MEMBER_DECLARATION_PATTERN.lastIndex = 0;

  results.sort((a, b) => {
    const lineDiff = (a.location?.line ?? 0) - (b.location?.line ?? 0);
    if (lineDiff !== 0) {
      return lineDiff;
    }
    const charDiff = (a.location?.character ?? 0) - (b.location?.character ?? 0);
    if (charDiff !== 0) {
      return charDiff;
    }
    return a.name.localeCompare(b.name);
  });

  return results;
}

function extractDependencies(
  content: string,
  sourceRoot: string | undefined,
  workspaceRoot: string
): DependencyEntry[] {
  const imports = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = IMPORT_PATTERN.exec(content)) !== null) {
    let specifier = match[1]?.trim();
    if (!specifier) {
      continue;
    }

    if (specifier.startsWith("static ")) {
      specifier = specifier.slice(7).trim();
    }

    if (specifier.startsWith(BUILT_IN_PACKAGE_PREFIX)) {
      continue;
    }

    imports.add(specifier);
  }

  IMPORT_PATTERN.lastIndex = 0;

  return Array.from(imports)
    .sort((a, b) => a.localeCompare(b))
    .map((specifier) => ({
      specifier,
      resolvedPath: resolveJavaImport(specifier, sourceRoot, workspaceRoot),
      symbols: extractImportedSymbols(specifier),
      kind: "import"
    })) as DependencyEntry[];
}

/**
 * Extracts the imported symbol name(s) from a Java import specifier.
 *
 * @remarks
 * Java imports can be:
 * - Single class: `com.example.data.Reader` → `['Reader']`
 * - Static member: `com.example.Utils.helper` → `['helper']`
 * - Wildcard: `com.example.data.*` → `[]` (cannot determine specific symbols)
 *
 * @param specifier - The fully-qualified import specifier
 * @returns Array of symbol names imported
 */
function extractImportedSymbols(specifier: string): string[] {
  // Wildcard imports don't specify which symbols are used
  if (specifier.endsWith(".*")) {
    return [];
  }

  // Extract the last segment (class name or static member)
  const lastDot = specifier.lastIndexOf(".");
  if (lastDot === -1) {
    return [specifier]; // No package, just the class name
  }

  const symbolName = specifier.slice(lastDot + 1);
  return symbolName ? [symbolName] : [];
}

function computePosition(content: string, index: number): { line: number; character: number } {
  let line = 1;
  let lastLineStart = 0;
  for (let i = 0; i < index; i += 1) {
    if (content[i] === "\n") {
      line += 1;
      lastLineStart = i + 1;
    }
  }

  return {
    line,
    character: index - lastLineStart + 1
  };
}

function parseJavaDoc(raw?: string): SymbolDocumentation | undefined {
  if (!raw || !raw.includes("/**")) {
    return undefined;
  }

  const commentBlock = extractNearestJavaDoc(raw);
  if (!commentBlock) {
    return undefined;
  }

  const lines = commentBlock
    .replace(/^\/\*\*/u, "")
    .replace(/\*\/$/u, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/u, "").replace(/\s+$/u, ""));

  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const tagStartIndex = lines.findIndex((line) => line.trim().startsWith("@"));
  const textLines = tagStartIndex >= 0 ? lines.slice(0, tagStartIndex) : lines.slice();
  const tagLines = tagStartIndex >= 0 ? lines.slice(tagStartIndex) : [];

  const documentation: SymbolDocumentation = {
    source: "javadoc"
  };

  const textBlock = normalizeInlineTags(textLines.join("\n")).trim();
  if (textBlock) {
    const paragraphs = textBlock.split(/\n\s*\n/);
    documentation.summary = paragraphs[0]?.trim() || undefined;
    if (paragraphs.length > 1) {
      const remainder = paragraphs.slice(1).join("\n\n").trim();
      if (remainder) {
        documentation.remarks = remainder;
      }
    }
  }

  parseJavaDocTags(tagLines, documentation);

  return hasDocumentationContent(documentation) ? documentation : undefined;
}

function extractNearestJavaDoc(raw: string): string | undefined {
  const commentEnd = raw.lastIndexOf("*/");
  if (commentEnd === -1) {
    return undefined;
  }

  const trailing = raw.slice(commentEnd + 2);
  if (trailing.trim().length > 0) {
    return undefined;
  }

  const commentStart = raw.lastIndexOf("/**", commentEnd);
  if (commentStart === -1) {
    return undefined;
  }

  return raw.slice(commentStart, commentEnd + 2);
}

function parseJavaDocTags(lines: string[], documentation: SymbolDocumentation): void {
  if (!lines.length) {
    return;
  }

  let currentTag: string | undefined;
  let currentTarget: string | undefined;
  let buffer: string[] = [];

  const flush = (): void => {
    if (!currentTag) {
      return;
    }
    const text = normalizeInlineTags(buffer.join(" ").replace(/\s+/gu, " ").trim());
    applyJavaDocTag(documentation, currentTag, currentTarget, text);
    currentTag = undefined;
    currentTarget = undefined;
    buffer = [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("@")) {
      flush();
      const match = /^@(\w+)(?:\s+([^\s]+))?(?:\s+(.*))?$/u.exec(trimmed);
      if (!match) {
        currentTag = trimmed.slice(1);
        buffer = [];
        continue;
      }
      const normalizedTag = match[1].toLowerCase();
      let target: string | undefined = match[2];
      let remainder: string | undefined = match[3];
      if (!javaDocTagSupportsTarget(normalizedTag)) {
        const combined = [target, remainder].filter(Boolean).join(" ").trim();
        target = undefined;
        remainder = combined || undefined;
      }
      currentTag = match[1];
      currentTarget = target;
      const remainderText = remainder?.trim();
      buffer = remainderText ? [remainderText] : [];
      continue;
    }

    if (currentTag) {
      buffer.push(trimmed);
    }
  }

  flush();
}

function javaDocTagSupportsTarget(tag: string): boolean {
  switch (tag) {
    case "param":
    case "throws":
    case "exception":
    case "see":
      return true;
    default:
      return false;
  }
}

function applyJavaDocTag(
  documentation: SymbolDocumentation,
  tag: string,
  target: string | undefined,
  text: string
): void {
  const appendBlock = (current: string | undefined, addition?: string): string | undefined => {
    if (!addition) {
      return current;
    }
    const trimmed = addition.trim();
    if (!trimmed) {
      return current;
    }
    if (!current) {
      return trimmed;
    }
    return `${current}\n\n${trimmed}`;
  };

  switch (tag.toLowerCase()) {
    case "param": {
      if (!target) {
        return;
      }
      const normalizedTarget = target.trim();
      if (!normalizedTarget) {
        return;
      }
      if (normalizedTarget.startsWith("<") && normalizedTarget.endsWith(">")) {
        const typeParameters = documentation.typeParameters ?? [];
        typeParameters.push({
          name: normalizedTarget.slice(1, -1),
          description: text || undefined
        });
        documentation.typeParameters = typeParameters;
        return;
      }
      const parameters = documentation.parameters ?? [];
      parameters.push({
        name: normalizedTarget,
        description: text || undefined
      } as SymbolDocumentationParameter);
      documentation.parameters = parameters;
      return;
    }
    case "return": {
      documentation.returns = appendBlock(documentation.returns, text);
      return;
    }
    case "value": {
      documentation.value = appendBlock(documentation.value, text);
      return;
    }
    case "throws":
    case "exception": {
      const exceptions = documentation.exceptions ?? [];
      exceptions.push({
        type: target,
        description: text || undefined
      } as SymbolDocumentationException);
      documentation.exceptions = exceptions;
      return;
    }
    case "see": {
      if (!target && !text) {
        return;
      }
      registerJavaDocLink(documentation, target, text);
      return;
    }
    case "example": {
      const examples = documentation.examples ?? [];
      examples.push({
        description: text || undefined
      } as SymbolDocumentationExample);
      documentation.examples = examples;
      return;
    }
    case "deprecated":
    case "since":
    case "implnote":
    case "implspec":
    case "implremark": {
      const fragments = documentation.rawFragments ?? [];
      fragments.push(`@${tag}${text ? ` ${text}` : ""}`.trim());
      documentation.rawFragments = fragments;
      return;
    }
    default: {
      const fragments = documentation.rawFragments ?? [];
      fragments.push(`@${tag}${text ? ` ${text}` : ""}`.trim());
      documentation.rawFragments = fragments;
    }
  }
}

function registerJavaDocLink(
  documentation: SymbolDocumentation,
  target: string | undefined,
  text: string | undefined
): void {
  const entries = documentation.links ?? [];
  const linkTarget = target ?? text;
  if (!linkTarget) {
    return;
  }
  const normalizedTarget = linkTarget.trim();
  if (!normalizedTarget) {
    return;
  }
  const label = text && text !== linkTarget ? text.trim() : undefined;
  const kind: SymbolDocumentationLinkKind = /:\/\//u.test(normalizedTarget) ? "href" : "cref";
  const key = `${kind}|${normalizedTarget}|${label ?? ""}`;
  const existingKeys = new Set(entries.map((link) => `${link.kind}|${link.target}|${link.text ?? ""}`));
  if (existingKeys.has(key)) {
    return;
  }
  entries.push({
    kind,
    target: normalizedTarget,
    text: label
  } as SymbolDocumentationLink);
  documentation.links = entries;
}

function normalizeInlineTags(value: string): string {
  const normalized = value
    .replace(/\{@code\s+([^}]+)\}/gu, (_match: string, code: string) => `\`${code.trim()}\``)
    .replace(/\{@literal\s+([^}]+)\}/gu, (_match: string, literal: string) => literal.trim())
    .replace(/\{@link\s+([^\s}]+)(?:\s+([^}]+))?\}/gu, (_match: string, target: string, label?: string) => {
      const normalizedTarget = target.trim();
      if (/^https?:\/\//iu.test(normalizedTarget)) {
        const linkText = label ? label.trim() : normalizedTarget;
        return `[${linkText}](${normalizedTarget})`;
      }
      const linkText = label ? label.trim() : undefined;
      return linkText ? `${linkText} (${normalizedTarget})` : `\`${normalizedTarget}\``;
    })
    .replace(/<\/?p\s*>/giu, (match) => (match.startsWith("</") ? "\n\n" : "\n\n"))
    .replace(/<br\s*\/?\s*>/giu, "\n");

  return normalized
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trimEnd();
}

function hasDocumentationContent(doc: SymbolDocumentation): boolean {
  return Boolean(
    doc.summary ||
      doc.remarks ||
      doc.returns ||
      doc.value ||
      (doc.parameters && doc.parameters.length > 0) ||
      (doc.typeParameters && doc.typeParameters.length > 0) ||
      (doc.exceptions && doc.exceptions.length > 0) ||
      (doc.examples && doc.examples.length > 0) ||
      (doc.links && doc.links.length > 0) ||
      (doc.rawFragments && doc.rawFragments.length > 0)
  );
}
