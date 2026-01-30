import { promises as fs, statSync } from "node:fs";
import path from "node:path";

import { cSyntax } from "../../languages";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLink,
  SymbolDocumentationParameter
} from "../core";
import type { LanguageAdapter } from "./index";

interface PendingDocBlock {
  lines: string[];
}

const LINE_DOC_PATTERN = /^\s*\/\/(?:\/|!)/;
const BLOCK_DOC_START_PATTERN = /^\s*\/\*!?/;
const MACRO_PATTERN = /^(\s*)#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)(.*)$/;
const STRUCT_PATTERN = /^(\s*)(?:typedef\s+)?struct\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\{|;)/;
const ENUM_PATTERN = /^(\s*)(?:typedef\s+)?enum\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\{|;)/;
const TYPEDEF_PATTERN = /^(\s*)typedef\s+(.+?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*;/;
const FUNCTION_PATTERN =
  /^(\s*)(?:static\s+)?(?:inline\s+)?[A-Za-z_][A-Za-z0-9_\s*]*[*\s]+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*(?:;|\{)/;
const INCLUDE_PATTERN = /#\s*include\s+([<"])([^>"]+)[>"]/g;

export const cAdapter: LanguageAdapter = {
  id: "c-basic",
  extensions: [".c", ".h"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = await extractDependenciesWithSymbols(content, absolutePath, workspaceRoot);

    if (!symbols.length && !dependencies.length) {
      return {
        symbols: [],
        dependencies: []
      };
    }

    return {
      symbols,
      dependencies
    };
  }
};

function extractSymbols(content: string): PublicSymbolEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: PublicSymbolEntry[] = [];
  let pendingDoc: PendingDocBlock | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const trimmed = raw.trim();

    if (LINE_DOC_PATTERN.test(raw)) {
      pendingDoc = pendingDoc ?? { lines: [] };
      pendingDoc.lines.push(stripLineDoc(raw));
      continue;
    }

    if (BLOCK_DOC_START_PATTERN.test(trimmed)) {
      const { lines: blockLines, nextIndex } = consumeBlockDoc(lines, index);
      pendingDoc = pendingDoc ?? { lines: [] };
      pendingDoc.lines.push(...blockLines);
      index = nextIndex;
      continue;
    }

    if (!trimmed) {
      if (pendingDoc) {
        pendingDoc.lines.push("");
      }
      continue;
    }

    const macroMatch = raw.match(MACRO_PATTERN);
    if (macroMatch) {
      entries.push(createEntry(macroMatch[2], "const", index, macroMatch[1]?.length ?? 0, pendingDoc));
      pendingDoc = null;
      continue;
    }

    const structMatch = raw.match(STRUCT_PATTERN);
    if (structMatch) {
      entries.push(createEntry(structMatch[2], "struct", index, structMatch[1]?.length ?? 0, pendingDoc));
      pendingDoc = null;
      continue;
    }

    const enumMatch = raw.match(ENUM_PATTERN);
    if (enumMatch) {
      entries.push(createEntry(enumMatch[2], "enum", index, enumMatch[1]?.length ?? 0, pendingDoc));
      pendingDoc = null;
      continue;
    }

    const typedefMatch = raw.match(TYPEDEF_PATTERN);
    if (typedefMatch) {
      entries.push(createEntry(typedefMatch[3], "type", index, typedefMatch[1]?.length ?? 0, pendingDoc));
      pendingDoc = null;
      continue;
    }

    if (trimmed.startsWith("return ")) {
      pendingDoc = null;
      continue;
    }

    const functionMatch = raw.match(FUNCTION_PATTERN);
    if (functionMatch) {
      entries.push(createEntry(functionMatch[2], "function", index, functionMatch[1]?.length ?? 0, pendingDoc));
      pendingDoc = null;
      continue;
    }

    pendingDoc = null;
  }

  entries.sort((left, right) => {
    const lineDiff = (left.location?.line ?? 0) - (right.location?.line ?? 0);
    if (lineDiff !== 0) {
      return lineDiff;
    }
    const charDiff = (left.location?.character ?? 0) - (right.location?.character ?? 0);
    if (charDiff !== 0) {
      return charDiff;
    }
    return left.name.localeCompare(right.name);
  });

  return entries;
}

function createEntry(
  name: string,
  kind: PublicSymbolEntry["kind"],
  lineIndex: number,
  indent: number,
  pendingDoc: PendingDocBlock | null
): PublicSymbolEntry {
  return {
    name,
    kind,
    location: {
      line: lineIndex + 1,
      character: indent + 1
    },
    documentation: pendingDoc ? parseCDocumentation(pendingDoc.lines) : undefined
  } as PublicSymbolEntry;
}

function stripLineDoc(line: string): string {
  return line.replace(/^\s*\/\/(?:\/|!)\s?/, "").replace(/\s+$/u, "");
}

function consumeBlockDoc(lines: string[], startIndex: number): { lines: string[]; nextIndex: number } {
  const collected: string[] = [];
  let index = startIndex;
  let current = lines[index];
  const openerIndex = current.indexOf("/*");
  const initial = openerIndex >= 0 ? current.slice(openerIndex + 2) : current;

  if (initial.includes("*/")) {
    const inline = initial.slice(0, initial.indexOf("*/"));
    collected.push(stripBlockLine(inline));
    return { lines: collected, nextIndex: index };
  }

  collected.push(stripBlockLine(initial));
  index += 1;

  while (index < lines.length) {
    current = lines[index];
    if (current.includes("*/")) {
      const piece = current.slice(0, current.indexOf("*/"));
      collected.push(stripBlockLine(piece));
      break;
    }
    collected.push(stripBlockLine(current));
    index += 1;
  }

  return { lines: collected, nextIndex: index };
}

function stripBlockLine(line: string): string {
  return line.replace(/^\s*\*\s?/, "").replace(/\s+$/u, "");
}

/**
 * Enhanced dependency extraction that detects symbol-level usages.
 *
 * @remarks
 * This function not only extracts #include statements but also:
 * 1. Reads the included header files to discover their public symbols
 * 2. Scans the current file's body for usages of those symbols
 * 3. Populates the `symbols` array with actual usages
 *
 * This enables the Live Documentation system to generate symbol-level
 * dependency links (e.g., `logger.log_message` instead of just `logger.h`).
 */
async function extractDependenciesWithSymbols(
  content: string,
  absolutePath: string,
  workspaceRoot: string
): Promise<DependencyEntry[]> {
  const dependencies = new Map<string, DependencyEntry>();
  const directory = path.dirname(absolutePath);
  let match: RegExpExecArray | null;
  INCLUDE_PATTERN.lastIndex = 0;

  // First pass: collect all #include statements
  const includes: Array<{ specifier: string; resolvedPath?: string; absoluteHeaderPath?: string }> = [];

  while ((match = INCLUDE_PATTERN.exec(content)) !== null) {
    const isSystem = match[1] === "<";
    const specifier = match[2];
    const resolvedPath = isSystem ? undefined : resolveInclude(directory, workspaceRoot, specifier);
    const absoluteHeaderPath = resolvedPath ? path.resolve(workspaceRoot, resolvedPath) : undefined;
    includes.push({ specifier, resolvedPath, absoluteHeaderPath });
  }

  // Second pass: for resolved includes, extract symbols from header files
  const headerSymbolsMap = new Map<string, Set<string>>();

  for (const include of includes) {
    if (!include.absoluteHeaderPath) {
      continue;
    }

    try {
      const headerContent = await fs.readFile(include.absoluteHeaderPath, "utf8");
      const headerSymbols = extractSymbols(headerContent);
      const symbolNames = new Set(headerSymbols.map(symbol => symbol.name));
      headerSymbolsMap.set(include.resolvedPath!, symbolNames);
    } catch {
      // Header file not readable, continue without symbol info
    }
  }

  // Third pass: scan current file body for usages of header symbols
  const usedSymbols = await detectSymbolUsages(content, headerSymbolsMap);

  // Build final dependency entries with symbol information
  for (const include of includes) {
    const key = `${include.specifier}:${include.resolvedPath ?? "system"}`;
    if (!dependencies.has(key)) {
      const symbols = include.resolvedPath
        ? Array.from(usedSymbols.get(include.resolvedPath) ?? []).sort()
        : [];

      dependencies.set(key, {
        specifier: include.specifier,
        resolvedPath: include.resolvedPath,
        symbols,
        kind: "import"
      });
    }
  }

  return Array.from(dependencies.values()).sort((left, right) => left.specifier.localeCompare(right.specifier));
}

/**
 * Detects which symbols from included headers are actually used in the source.
 *
 * @param content - The source file content to scan
 * @param headerSymbolsMap - Map of header path to set of symbol names defined in that header
 * @returns Map of header path to set of symbol names used from that header
 */
async function detectSymbolUsages(
  content: string,
  headerSymbolsMap: Map<string, Set<string>>
): Promise<Map<string, Set<string>>> {
  const usedSymbols = new Map<string, Set<string>>();

  // Strip comments and string literals to avoid false positives (using shared syntax)
  const strippedContent = await cSyntax.stripCommentsAndStrings(content);

  for (const [headerPath, symbolNames] of headerSymbolsMap) {
    const used = new Set<string>();

    for (const symbolName of symbolNames) {
      // Skip include guards (typically FILENAME_H patterns)
      if (/^[A-Z_]+_H$/.test(symbolName)) {
        continue;
      }

      // Skip fundamental framework types from shared syntax
      if (cSyntax.isFrameworkType(symbolName)) {
        continue;
      }

      // Look for symbol usage patterns:
      // 1. Function calls: symbolName(
      // 2. Type references: struct symbolName, enum symbolName, symbolName varname
      // 3. Macro usages: symbolName (as identifier, not in #define)
      const usagePattern = new RegExp(
        `(?<!#\\s*define\\s+)\\b${escapeRegExp(symbolName)}\\b`,
        "g"
      );

      if (usagePattern.test(strippedContent)) {
        used.add(symbolName);
      }
    }

    if (used.size > 0) {
      usedSymbols.set(headerPath, used);
    }
  }

  return usedSymbols;
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveInclude(directory: string, workspaceRoot: string, specifier: string): string | undefined {
  const candidate = path.resolve(directory, specifier);
  const candidates = [candidate];
  if (!path.extname(specifier)) {
    candidates.push(`${candidate}.h`);
  }

  for (const entry of candidates) {
    try {
      const stat = statSync(entry);
      if (!stat.isFile()) {
        continue;
      }
      if (!entry.startsWith(workspaceRoot)) {
        continue;
      }
      return path.relative(workspaceRoot, entry).replace(/\\/g, "/");
    } catch {
      // ignore missing
    }
  }
  return undefined;
}

function parseCDocumentation(rawLines: string[]): SymbolDocumentation | undefined {
  const normalized = trimEmptyEdges(rawLines.map(line => line.replace(/\s+$/u, "")));
  if (!normalized.length) {
    return undefined;
  }

  const documentation: SymbolDocumentation = {
    source: "doxygen"
  };

  const tagPattern = /^[@\\](\w+)\s*(.*)$/;
  const plainLines: string[] = [];
  let summaryExplicit = false;
  let currentExample: { title?: string; buffer: string[] } | null = null;

  const flushExample = (): void => {
    if (!currentExample) {
      return;
    }
    const code = currentExample.buffer.join("\n").trimEnd();
    if (code) {
      documentation.examples = mergeExamples(documentation.examples, [
        {
          description: currentExample.title,
          code,
          language: "c"
        }
      ]);
    }
    currentExample = null;
  };

  for (const line of normalized) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentExample) {
        currentExample.buffer.push("");
      } else {
        plainLines.push("");
      }
      continue;
    }

    const tagMatch = tagPattern.exec(trimmed);
    tagPattern.lastIndex = 0;
    if (tagMatch) {
      flushExample();
      const tag = tagMatch[1].toLowerCase();
      const payload = tagMatch[2]?.trim() ?? "";
      switch (tag) {
        case "brief": {
          if (payload) {
            documentation.summary = documentation.summary
              ? `${documentation.summary}\n${payload}`
              : payload;
            summaryExplicit = true;
          }
          break;
        }
        case "details":
        case "remark":
        case "remarks": {
          if (payload) {
            documentation.remarks = documentation.remarks
              ? `${documentation.remarks}\n\n${payload}`
              : payload;
          }
          break;
        }
        case "param": {
          const parameter = parseParamTag(payload);
          if (parameter) {
            documentation.parameters = mergeParameters(documentation.parameters, [parameter]);
          }
          break;
        }
        case "return":
        case "returns": {
          if (payload) {
            documentation.returns = documentation.returns
              ? `${documentation.returns}\n\n${payload}`
              : payload;
          }
          break;
        }
        case "throws":
        case "throw":
        case "exception": {
          const exception = parseExceptionTag(payload);
          if (exception) {
            documentation.exceptions = mergeExceptions(documentation.exceptions, [exception]);
          }
          break;
        }
        case "note":
        case "warning":
        case "todo":
        case "deprecated":
        case "since": {
          if (payload) {
            const fragment = `${capitalize(tag)}: ${payload}`;
            documentation.remarks = documentation.remarks
              ? `${documentation.remarks}\n\n${fragment}`
              : fragment;
          }
          break;
        }
        case "see": {
          const link = parseLinkTag(payload);
          if (link) {
            documentation.links = mergeLinks(documentation.links, [link]);
          }
          break;
        }
        case "example":
        case "code": {
          currentExample = {
            title: payload || undefined,
            buffer: []
          };
          break;
        }
        case "endcode": {
          flushExample();
          break;
        }
        default: {
          plainLines.push(line);
        }
      }
      continue;
    }

    if (currentExample) {
      currentExample.buffer.push(line);
      continue;
    }

    plainLines.push(line);
  }

  flushExample();

  const paragraphs = toParagraphs(plainLines);
  if (!summaryExplicit && paragraphs.length) {
    documentation.summary = paragraphs.shift();
  }
  if (paragraphs.length) {
    const remainder = paragraphs.join("\n\n");
    documentation.remarks = documentation.remarks
      ? `${documentation.remarks}\n\n${remainder}`
      : remainder;
  }

  documentation.links = mergeLinks(documentation.links, extractLinks(normalized.join("\n")));

  return hasDocumentationContent(documentation) ? documentation : undefined;
}

function trimEmptyEdges(lines: string[]): string[] {
  let start = 0;
  while (start < lines.length && !lines[start].trim()) {
    start += 1;
  }
  let end = lines.length - 1;
  while (end >= start && !lines[end].trim()) {
    end -= 1;
  }
  return lines.slice(start, end + 1);
}

function toParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (buffer.length) {
        paragraphs.push(buffer.join(" ").trim());
        buffer = [];
      }
      continue;
    }
    buffer.push(line.trim());
  }

  if (buffer.length) {
    paragraphs.push(buffer.join(" ").trim());
  }

  return paragraphs;
}

function parseParamTag(payload: string): SymbolDocumentationParameter | undefined {
  if (!payload) {
    return undefined;
  }
  const working = payload.replace(/^\[[^\]]+\]\s*/, "");
  const parts = working.split(/\s+/);
  if (!parts.length) {
    return undefined;
  }
  const name = parts.shift() ?? "param";
  const description = parts.join(" ").trim();
  return {
    name,
    description: description || undefined
  };
}

function parseExceptionTag(payload: string): SymbolDocumentationException | undefined {
  if (!payload) {
    return undefined;
  }
  const parts = payload.split(/\s+/);
  if (!parts.length) {
    return undefined;
  }
  const type = parts.shift() ?? "Error";
  const description = parts.join(" ").trim();
  return {
    type,
    description: description || undefined
  };
}

function parseLinkTag(payload: string): SymbolDocumentationLink | undefined {
  if (!payload) {
    return undefined;
  }
  const segments = payload.split(/\s+/);
  if (!segments.length) {
    return undefined;
  }
  if (segments.length === 1) {
    return {
      kind: "href",
      target: segments[0]
    };
  }
  const target = segments.pop();
  if (!target) {
    return undefined;
  }
  return {
    kind: "href",
    target,
    text: segments.join(" ") || undefined
  };
}

function mergeParameters(
  current: SymbolDocumentationParameter[] | undefined,
  additions: SymbolDocumentationParameter[] | undefined
): SymbolDocumentationParameter[] | undefined {
  if (!additions?.length) {
    return current;
  }
  const existing = current ?? [];
  return [...existing, ...additions];
}

function mergeExceptions(
  current: SymbolDocumentationException[] | undefined,
  additions: SymbolDocumentationException[] | undefined
): SymbolDocumentationException[] | undefined {
  if (!additions?.length) {
    return current;
  }
  const existing = current ?? [];
  return [...existing, ...additions];
}

function mergeExamples(
  current: SymbolDocumentationExample[] | undefined,
  additions: SymbolDocumentationExample[] | undefined
): SymbolDocumentationExample[] | undefined {
  if (!additions?.length) {
    return current;
  }
  const existing = current ?? [];
  return [...existing, ...additions];
}

function mergeLinks(
  current: SymbolDocumentationLink[] | undefined,
  additions: SymbolDocumentationLink[] | undefined
): SymbolDocumentationLink[] | undefined {
  if (!additions?.length) {
    return current;
  }
  const existing = current ?? [];
  const seen = new Set(existing.map(link => `${link.kind}:${link.target}`));
  const combined = [...existing];
  for (const link of additions) {
    const key = `${link.kind}:${link.target}`;
    if (!seen.has(key)) {
      combined.push(link);
      seen.add(key);
    }
  }
  return combined;
}

function extractLinks(text: string): SymbolDocumentationLink[] {
  const links: SymbolDocumentationLink[] = [];
  let match: RegExpExecArray | null;
  const markdown = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  while ((match = markdown.exec(text)) !== null) {
    links.push({ kind: "href", target: match[2], text: match[1] });
  }
  const urlPattern = /(https?:\/\/[^)\s]+)/g;
  while ((match = urlPattern.exec(text)) !== null) {
    links.push({ kind: "href", target: match[1] });
  }
  return links;
}

function hasDocumentationContent(doc: SymbolDocumentation): boolean {
  return Boolean(
    doc.summary ||
      doc.remarks ||
      doc.returns ||
      (doc.parameters && doc.parameters.length) ||
      (doc.exceptions && doc.exceptions.length) ||
      (doc.examples && doc.examples.length) ||
      (doc.links && doc.links.length) ||
      (doc.rawFragments && doc.rawFragments.length)
  );
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}
