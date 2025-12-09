import { promises as fs } from "node:fs";

import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  SymbolDocumentationExample,
  SymbolDocumentationLink,
  TypeReference
} from "../core";
import type { LanguageAdapter } from "./index";

interface DependencyBucket {
  specifier: string;
  symbols: Set<string>;
}

// Captures: [1] indent, [2] keyword, [3] name, [4] base classes (optional)
const TOP_LEVEL_PATTERN = /^([ \t]*)(async\s+def|def|class)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]+)\))?/;
const DECORATOR_PATTERN = /^\s*@/;
const REST_FIELD_PATTERN = /^:([a-zA-Z_]+)(?:\s+([^:]+))?:\s*(.*)$/;
const SECTION_HEADER_PATTERN = /^([A-Za-z][A-Za-z0-9 -]*):\s*$/;
const NUMPY_SECTION_UNDERLINE = /^[=~`-]{3,}$/;

/**
 * Language adapter that extracts public symbols and docstring metadata from Python modules.
 *
 * @remarks
 * The adapter recognises reStructuredText, Google, and NumPy-style docstring conventions
 * to populate Live Doc summaries, parameter tables, and inline examples without relying
 * on Python runtime introspection.
 */
export const pythonAdapter: LanguageAdapter = {
  id: "python-basic",
  extensions: [".py"],
  async analyze({ absolutePath }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = extractDependencies(content);

    if (symbols.length === 0 && dependencies.length === 0) {
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
  const results: PublicSymbolEntry[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (DECORATOR_PATTERN.test(line)) {
      continue;
    }

    const match = TOP_LEVEL_PATTERN.exec(line);
    TOP_LEVEL_PATTERN.lastIndex = 0;
    if (!match) {
      continue;
    }

    const indent = match[1] ?? "";
    if (indent.trim().length > 0) {
      continue;
    }

    const keyword = match[2];
    const name = match[3];
    const baseClasses = match[4];
    const kind = keyword.includes("class") ? "class" : "function";
    const docstring = extractDocstring(lines, index);
    const documentation = docstring ? parseDocstring(docstring) : undefined;

    // Extract type references from base classes for class definitions
    let typeReferences: TypeReference[] | undefined;
    if (kind === "class" && baseClasses) {
      const bases = baseClasses
        .split(",")
        .map(b => b.trim())
        .filter(b => b && !b.includes("=")) // Exclude keyword args like metaclass=
        .map(b => b.split("[")[0].trim()); // Strip generic params like List[int]
      
      if (bases.length > 0) {
        typeReferences = bases.map(baseName => ({
          name: baseName,
          role: "extends" as const
        }));
      }
    }

    results.push({
      name,
      kind,
      location: {
        line: index + 1,
        character: indent.length + 1
      },
      documentation,
      typeReferences
    } as PublicSymbolEntry);
  }

  results.sort((left, right) => {
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

  return results;
}

function extractDocstring(lines: string[], definitionIndex: number): string | undefined {
  let cursor = definitionIndex + 1;
  while (cursor < lines.length) {
    const raw = lines[cursor];
    if (!raw.trim()) {
      cursor += 1;
      continue;
    }

    const trimmed = raw.trim();
    const quote = detectTripleQuote(trimmed);
    if (!quote) {
      return undefined;
    }

    const closingIndex = trimmed.indexOf(quote, quote.length);
    if (closingIndex >= 0) {
      const inner = trimmed.slice(quote.length, closingIndex);
      const normalizedInline = normalizeDocstring(inner);
      return normalizedInline || undefined;
    }

    const accumulator: string[] = [];
    accumulator.push(trimmed.slice(quote.length));
    cursor += 1;
    while (cursor < lines.length) {
      const candidate = lines[cursor];
      const closePos = candidate.indexOf(quote);
      if (closePos >= 0) {
        accumulator.push(candidate.slice(0, closePos));
        break;
      }
      accumulator.push(candidate);
      cursor += 1;
    }

    const normalized = normalizeDocstring(accumulator.join("\n"));
    return normalized || undefined;
  }

  return undefined;
}

function detectTripleQuote(candidate: string): string | undefined {
  if (candidate.startsWith('"""')) {
    return '"""';
  }
  if (candidate.startsWith("'''")) {
    return "'''";
  }
  return undefined;
}

function normalizeDocstring(raw: string): string {
  const replaced = raw.replace(/\r\n/g, "\n");
  const segments = replaced.split("\n");

  let start = 0;
  while (start < segments.length && !segments[start].trim()) {
    start += 1;
  }

  let end = segments.length - 1;
  while (end >= start && !segments[end].trim()) {
    end -= 1;
  }

  const sliced = segments.slice(start, end + 1);
  if (!sliced.length) {
    return "";
  }

  let minIndent = Infinity;
  for (const line of sliced.slice(1)) {
    if (!line.trim()) {
      continue;
    }
    const leading = line.match(/^\s+/);
    if (!leading) {
      minIndent = 0;
      break;
    }
    minIndent = Math.min(minIndent, leading[0].length);
  }

  if (!Number.isFinite(minIndent)) {
    minIndent = 0;
  }

  if (minIndent > 0) {
    for (let index = 1; index < sliced.length; index += 1) {
      const line = sliced[index];
      if (!line.trim()) {
        continue;
      }
      sliced[index] = line.slice(minIndent);
    }
  }

  return sliced.join("\n");
}

function parseDocstring(docstring: string): SymbolDocumentation {
  const normalized = docstring.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const { summary, remainder } = extractDocstringSummary(lines);

  const documentation: SymbolDocumentation = {
    source: "docstring",
    summary: summary || undefined
  };

  const mutable: MutableDocstringState = {
    remarks: [],
    parameters: new Map(),
    exceptions: new Map(),
    returnLines: [],
    returnType: [],
    yieldLines: [],
    links: [],
    examples: [],
    raw: []
  };

  let remaining = remainder;

  if (remainder.some((line) => REST_FIELD_PATTERN.test(line.trim()))) {
    remaining = parseRestFields(remaining, mutable);
  }

  if (detectNumpySections(remaining)) {
    remaining = parseNumpySections(remaining, mutable);
  }

  if (detectGoogleSections(remaining)) {
    remaining = parseGoogleSections(remaining, mutable);
  }

  const leftover = remaining.join("\n").trim();
  if (leftover) {
    mutable.remarks.push(leftover);
  }

  if (mutable.remarks.length > 0) {
    documentation.remarks = joinParagraphs(mutable.remarks);
  }

  const parameters = Array.from(mutable.parameters.entries()).map(([name, entry]) => {
    const text = joinParagraphs(entry.description);
    const typeSuffix = entry.type ? ` (type: ${entry.type.trim()})` : "";
    const description = text ? `${text}${typeSuffix}`.trim() : undefined;
    return {
      name,
      description: description ?? (entry.type ? `Type: ${entry.type.trim()}` : undefined)
    };
  });
  if (parameters.length > 0) {
    documentation.parameters = parameters;
  }

  const exceptions = Array.from(mutable.exceptions.entries()).map(([name, parts]) => ({
    type: name,
    description: joinParagraphs(parts)
  }));
  if (exceptions.length > 0) {
    documentation.exceptions = exceptions;
  }

  const returns = joinParagraphs(mutable.returnLines);
  const returnType = joinParagraphs(mutable.returnType);
  if (returns || returnType) {
    const combined = [returns, returnType ? `Type: ${returnType}` : undefined]
      .filter(Boolean)
      .join("\n\n");
    documentation.returns = combined || undefined;
  }

  const yields = joinParagraphs(mutable.yieldLines);
  if (yields) {
    documentation.value = yields;
  }

  const links: SymbolDocumentationLink[] = mutable.links
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((target): SymbolDocumentationLink => ({
      kind: /^https?:\/\//i.test(target) ? "href" : "unknown",
      target
    }));
  if (links.length > 0) {
    documentation.links = links;
  }

  const examples = mutable.examples
    .map((block) => normalizeExample(block))
    .filter((example): example is NonNullable<typeof example> => Boolean(example));
  if (examples.length > 0) {
    documentation.examples = examples;
  }

  return documentation;
}

function extractDocstringSummary(lines: string[]): { summary?: string; remainder: string[] } {
  const working = [...lines];
  let index = 0;
  const summaryLines: string[] = [];

  while (index < working.length) {
    const current = working[index];
    if (!current.trim()) {
      if (summaryLines.length > 0) {
        index += 1;
        break;
      }
      index += 1;
      continue;
    }
    summaryLines.push(current.trim());
    index += 1;
    if (current.trim().endsWith(".")) {
      break;
    }
  }

  while (index < working.length && !working[index].trim()) {
    index += 1;
  }

  const summary = summaryLines.length > 0 ? summaryLines.join(" ") : undefined;
  return {
    summary,
    remainder: working.slice(index)
  };
}

function parseRestFields(lines: string[], mutable: MutableDocstringState): string[] {
  const remaining: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const trimmed = raw.trim();
    const match = REST_FIELD_PATTERN.exec(trimmed);
    if (!match) {
      remaining.push(raw);
      index += 1;
      continue;
    }

    const [, tag, namePart, payload] = match;
    const detailLines = collectIndentedBlock(lines, index + 1);
    index += 1 + detailLines.consumed;

    const descriptionPieces: string[] = [];
    if (payload) {
      descriptionPieces.push(payload.trim());
    }
    if (detailLines.lines.length > 0) {
      descriptionPieces.push(detailLines.lines.join("\n"));
    }

    const description = joinParagraphs(descriptionPieces);
    const target = namePart?.trim();

    switch (tag.toLowerCase()) {
      case "param":
      case "keyword":
      case "arg":
      case "argument": {
        if (!target) {
          break;
        }
        const entry = ensureParameter(mutable, target);
        if (description) {
          entry.description.push(description);
        }
        break;
      }
      case "type":
      case "kwtype": {
        if (!target) {
          break;
        }
        const entry = ensureParameter(mutable, target);
        if (description) {
          entry.type = description;
        }
        break;
      }
      case "returns":
      case "return": {
        if (description) {
          mutable.returnLines.push(description);
        }
        break;
      }
      case "rtype": {
        if (description) {
          mutable.returnType.push(description);
        }
        break;
      }
      case "yields":
      case "yield": {
        if (description) {
          mutable.yieldLines.push(description);
        }
        break;
      }
      case "raises":
      case "raise":
      case "except": {
        if (!target) {
          break;
        }
        const targets = target.split(/[,|]/).map((value) => value.trim()).filter(Boolean);
        const text = description || undefined;
        for (const exception of targets) {
          const bucket = ensureException(mutable.exceptions, exception);
          if (text) {
            bucket.push(text);
          }
        }
        break;
      }
      case "deprecated":
      case "versionadded":
      case "versionchanged":
      case "since":
      case "note":
      case "warning":
      case "attention":
      case "todo":
      case "summary":
      case "description": {
        if (description) {
          mutable.remarks.push(`${capitalize(tag)}: ${description}`);
        }
        break;
      }
      case "seealso":
      case "see": {
        if (description) {
          mutable.links.push(description);
        }
        break;
      }
      case "example":
      case "examples": {
        if (description) {
          mutable.examples.push(description);
        }
        break;
      }
      default: {
        const chunk = [trimmed, ...detailLines.lines];
        mutable.raw.push(chunk);
      }
    }
  }

  return remaining;
}

function detectGoogleSections(lines: string[]): boolean {
  return lines.some((line) => SECTION_HEADER_PATTERN.test(line.trim()));
}

function detectNumpySections(lines: string[]): boolean {
  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = lines[index].trim();
    const underline = lines[index + 1].trim();
    if (header && NUMPY_SECTION_UNDERLINE.test(underline)) {
      return true;
    }
  }
  return false;
}

function parseGoogleSections(lines: string[], mutable: MutableDocstringState): string[] {
  const remaining: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const match = SECTION_HEADER_PATTERN.exec(line.trim());
    if (!match) {
      remaining.push(line);
      index += 1;
      continue;
    }

    const [, rawTitle] = match;
    const title = rawTitle.trim().toLowerCase();
    const block = collectGoogleBlock(lines, index + 1);
    index = block.nextIndex;

    switch (title) {
      case "args":
      case "arguments":
      case "parameters":
      case "params":
      case "keyword args":
      case "keyword arguments":
      case "kwargs":
      case "other parameters": {
        parseGoogleParameters(block.lines, mutable);
        break;
      }
      case "returns":
      case "return": {
        parseGoogleReturns(block.lines, mutable.returnLines, mutable.returnType);
        break;
      }
      case "yields":
      case "yield": {
        parseGoogleReturns(block.lines, mutable.yieldLines, []);
        break;
      }
      case "raises":
      case "exceptions":
      case "warns":
      case "warnings": {
        parseGoogleExceptions(block.lines, mutable.exceptions, title);
        break;
      }
      case "examples":
      case "example": {
        const text = block.lines.join("\n").trim();
        if (text) {
          mutable.examples.push(text);
        }
        break;
      }
      case "notes":
      case "see also":
      case "references":
      case "seealso":
      case "note":
      case "summary":
      case "details":
      case "deprecation":
      case "deprecated":
      case "warn": {
        const text = block.lines.join("\n").trim();
        if (text) {
          mutable.remarks.push(capitalize(rawTitle) + ":\n" + text);
        }
        break;
      }
      default: {
        if (block.lines.length > 0) {
          mutable.raw.push([line, ...block.lines]);
        }
      }
    }
  }

  return remaining;
}

function parseNumpySections(lines: string[], mutable: MutableDocstringState): string[] {
  const remaining: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const header = lines[index].trim();
    const underline = lines[index + 1]?.trim();
    if (!header || !underline || !NUMPY_SECTION_UNDERLINE.test(underline)) {
      remaining.push(lines[index]);
      index += 1;
      continue;
    }

    const block = collectNumpyBlock(lines, index + 2);
    index = block.nextIndex;
    const normalizedHeader = header.toLowerCase();

    switch (normalizedHeader) {
      case "parameters":
      case "other parameters":
      case "attributes":
      case "methods": {
        parseNumpyParameters(block.lines, mutable);
        break;
      }
      case "returns":
      case "return":
      case "receives": {
        parseNumpyReturns(block.lines, mutable.returnLines, mutable.returnType);
        break;
      }
      case "yields": {
        parseNumpyReturns(block.lines, mutable.yieldLines, []);
        break;
      }
      case "raises":
      case "warns":
      case "warnings": {
        parseNumpyExceptions(block.lines, mutable.exceptions);
        break;
      }
      case "examples":
      case "example": {
        const example = block.lines.join("\n").trim();
        if (example) {
          mutable.examples.push(example);
        }
        break;
      }
      case "notes":
      case "see also":
      case "references": {
        const note = block.lines.join("\n").trim();
        if (note) {
          mutable.remarks.push(capitalize(header) + ":\n" + note);
        }
        break;
      }
      default: {
        if (block.lines.length > 0) {
          mutable.raw.push([header, underline, ...block.lines]);
        }
      }
    }
  }

  return remaining;
}

function collectIndentedBlock(lines: string[], start: number): { lines: string[]; consumed: number } {
  const collected: string[] = [];
  let consumed = 0;

  for (let index = start; index < lines.length; index += 1) {
    const candidate = lines[index];
    if (!candidate.trim()) {
      collected.push("");
      consumed += 1;
      continue;
    }
    if (!/^\s+/.test(candidate)) {
      break;
    }
    collected.push(candidate.trim());
    consumed += 1;
  }

  return { lines: collected, consumed };
}

function collectGoogleBlock(lines: string[], start: number): { lines: string[]; nextIndex: number } {
  const collected: string[] = [];
  let index = start;

  while (index < lines.length) {
    const candidate = lines[index];
    if (!candidate.trim()) {
      collected.push("");
      index += 1;
      continue;
    }
    if (SECTION_HEADER_PATTERN.test(candidate.trim())) {
      break;
    }
    if (!/^\s+/.test(candidate)) {
      break;
    }
    collected.push(candidate);
    index += 1;
  }

  return { lines: collected, nextIndex: index };
}

function collectNumpyBlock(lines: string[], start: number): { lines: string[]; nextIndex: number } {
  const collected: string[] = [];
  let index = start;

  while (index < lines.length) {
    const candidate = lines[index];
    if (!candidate.trim()) {
      collected.push("");
      index += 1;
      continue;
    }
    const next = lines[index + 1]?.trim();
    if (next && NUMPY_SECTION_UNDERLINE.test(next)) {
      break;
    }
    if (SECTION_HEADER_PATTERN.test(candidate.trim())) {
      break;
    }
    collected.push(candidate);
    index += 1;
  }

  return { lines: collected, nextIndex: index };
}

function parseGoogleParameters(lines: string[], mutable: MutableDocstringState): void {
  const entries = parseIndentedEntries(lines);
  for (const entry of entries) {
    const bucket = ensureParameter(mutable, entry.name);
    if (entry.description) {
      bucket.description.push(entry.description);
    }
    if (entry.type) {
      bucket.type = entry.type;
    }
  }
}

function parseGoogleReturns(lines: string[], target: string[], typeTarget: string[]): void {
  const content = parseIndentedEntries(lines);
  for (const entry of content) {
    if (entry.description) {
      target.push(entry.description);
    }
    const typeValue = entry.type ?? entry.name;
    if (typeValue) {
      typeTarget.push(typeValue);
    }
  }
}

function parseGoogleExceptions(
  lines: string[],
  bucket: Map<string, string[]>,
  title: string
): void {
  const content = parseIndentedEntries(lines);
  for (const entry of content) {
    const name = entry.name || capitalize(title);
    const target = ensureException(bucket, name);
    if (entry.description) {
      target.push(entry.description);
    }
  }
}

function parseNumpyParameters(lines: string[], mutable: MutableDocstringState): void {
  const entries = parseNumpyEntries(lines);
  for (const entry of entries) {
    const bucket = ensureParameter(mutable, entry.name);
    if (entry.description) {
      bucket.description.push(entry.description);
    }
    if (entry.type) {
      bucket.type = entry.type;
    }
  }
}

function parseNumpyReturns(lines: string[], target: string[], typeTarget: string[]): void {
  const entries = parseNumpyEntries(lines);
  for (const entry of entries) {
    if (entry.description) {
      target.push(entry.description);
    }
    const typeValue = entry.type ?? entry.name;
    if (typeValue) {
      typeTarget.push(typeValue);
    }
  }
}

function parseNumpyExceptions(lines: string[], exceptions: Map<string, string[]>): void {
  const entries = parseNumpyEntries(lines);
  for (const entry of entries) {
    const name = entry.name || "Exception";
    const bucket = ensureException(exceptions, name);
    if (entry.description) {
      bucket.push(entry.description);
    }
  }
}

function parseIndentedEntries(lines: string[]): Array<{ name: string; type?: string; description?: string }> {
  const entries: Array<{ name: string; type?: string; description?: string }> = [];
  if (lines.length === 0) {
    return entries;
  }

  const indent = detectMinimumIndent(lines);
  let current: { name: string; type?: string; descriptionLines: string[] } | undefined;

  for (const rawLine of lines) {
    if (!rawLine.trim()) {
      if (current) {
        current.descriptionLines.push("");
      }
      continue;
    }

    if (!rawLine.startsWith(" ".repeat(indent))) {
      continue;
    }

    const content = rawLine.slice(indent);
    const entryMatch = /^(\*\*?\w[\w*]*|[\w.]+)(?:\s*\(([^)]+)\))?\s*:\s*(.*)$/.exec(content);
    if (entryMatch) {
      if (current) {
        entries.push({
          name: current.name,
          type: current.type,
          description: joinParagraphs(current.descriptionLines)
        });
      }
      const [, name, type, desc] = entryMatch;
      current = {
        name,
        type: type?.trim(),
        descriptionLines: desc ? [desc.trim()] : []
      };
      continue;
    }

    if (current) {
      current.descriptionLines.push(content.trim());
    }
  }

  if (current) {
    entries.push({
      name: current.name,
      type: current.type,
      description: joinParagraphs(current.descriptionLines)
    });
  }

  return entries;
}

function parseNumpyEntries(lines: string[]): Array<{ name: string; type?: string; description?: string }> {
  const entries: Array<{ name: string; type?: string; description?: string }> = [];
  let current: { name: string; type?: string; descriptionLines: string[] } | undefined;

  for (const raw of lines) {
    if (!raw.trim()) {
      if (current) {
        current.descriptionLines.push("");
      }
      continue;
    }

    if (/^\s/.test(raw)) {
      const content = raw.trim();
      if (current) {
        current.descriptionLines.push(content);
      }
      continue;
    }

    const match = /^([^\s:][^:]*)\s*(?::\s*(.*))?$/.exec(raw.trim());
    if (match) {
      if (current) {
        entries.push({
          name: current.name,
          type: current.type,
          description: joinParagraphs(current.descriptionLines)
        });
      }
      const [, nameRaw, type] = match;
      current = {
        name: nameRaw.trim(),
        type: type?.trim(),
        descriptionLines: []
      };
      continue;
    }

    if (current) {
      current.descriptionLines.push(raw.trim());
    }
  }

  if (current) {
    entries.push({
      name: current.name,
      type: current.type,
      description: joinParagraphs(current.descriptionLines)
    });
  }

  return entries;
}

function normalizeExample(block: string): SymbolDocumentationExample | undefined {
  const trimmed = block.trim();
  if (!trimmed) {
    return undefined;
  }

  const lines = trimmed.split("\n");
  const descriptionLines: string[] = [];
  const codeLines: string[] = [];
  let inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith(">>>")) {
      inCode = true;
      codeLines.push(line.trim());
      continue;
    }
    if (inCode) {
      if (!line.trim()) {
        codeLines.push("");
      } else {
        codeLines.push(line.trim());
      }
    } else {
      descriptionLines.push(line.trim());
    }
  }

  const description = joinParagraphs(descriptionLines.filter(Boolean));
  const code = codeLines.join("\n").trim();

  if (!description && !code) {
    return undefined;
  }

  return {
    description: description || undefined,
    code: code || undefined,
    language: code ? "python" : undefined
  };
}

function joinParagraphs(chunks: string[]): string {
  return chunks
    .map((chunk) => chunk.replace(/\s+$/u, ""))
    .filter((chunk) => chunk.trim() !== "")
    .join("\n\n");
}

function detectMinimumIndent(lines: string[]): number {
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    const match = line.match(/^\s+/);
    if (!match) {
      continue;
    }
    minIndent = Math.min(minIndent, match[0].length);
  }
  if (!Number.isFinite(minIndent)) {
    return 0;
  }
  return minIndent;
}

function ensureParameter(
  mutable: MutableDocstringState,
  name: string
): { description: string[]; type?: string } {
  const existing = mutable.parameters.get(name);
  if (existing) {
    return existing;
  }
  const bucket = { description: [] as string[], type: undefined as string | undefined };
  mutable.parameters.set(name, bucket);
  return bucket;
}

function ensureException(
  bucket: Map<string, string[]>,
  name: string
): string[] {
  const existing = bucket.get(name);
  if (existing) {
    return existing;
  }
  const created: string[] = [];
  bucket.set(name, created);
  return created;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface MutableDocstringState {
  remarks: string[];
  parameters: Map<string, { description: string[]; type?: string }>;
  exceptions: Map<string, string[]>;
  returnLines: string[];
  returnType: string[];
  yieldLines: string[];
  links: string[];
  examples: string[];
  raw: string[][];
}

function extractDependencies(content: string): DependencyEntry[] {
  const lines = content.split(/\r?\n/);
  const dependencies = new Map<string, DependencyBucket>();

  const register = (specifier: string, symbol?: string): void => {
    const normalized = specifier.trim();
    if (!normalized) {
      return;
    }
    const existing = dependencies.get(normalized);
    const bucket: DependencyBucket = existing ?? {
      specifier: normalized,
      symbols: new Set<string>()
    };
    if (symbol && symbol.trim()) {
      bucket.symbols.add(symbol.trim());
    }
    dependencies.set(normalized, bucket);
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed.startsWith("import ")) {
      const remainder = trimmed.slice("import ".length);
      const modules = remainder.split(",").map((segment) => segment.split(/\s+as\s+/)[0]?.trim());
      for (const moduleName of modules) {
        if (!moduleName) {
          continue;
        }
        register(moduleName);
      }
      continue;
    }

    if (trimmed.startsWith("from ")) {
      const fromMatch = /^from\s+([.\w]+)\s+import\s+(.+)$/.exec(trimmed);
      if (!fromMatch) {
        continue;
      }

      const moduleSegment = fromMatch[1];
      const importSegment = fromMatch[2];
      const rawNames = importSegment
        .split(",")
        .map((segment) => segment.split(/\s+as\s+/)[0]?.trim());
      const names = rawNames.filter((candidate): candidate is string => Boolean(candidate && candidate.trim()));

      for (const name of names) {
        const combined = buildCombinedModule(moduleSegment, name);
        if (combined) {
          register(combined.module, combined.symbol);
        }
      }

      const base = normalizeModuleSegment(moduleSegment);
      if (base) {
        register(base);
      }
    }
  }

  return Array.from(dependencies.values())
    .map<DependencyEntry>((bucket) => ({
      specifier: bucket.specifier,
      resolvedPath: undefined,
      symbols: Array.from(bucket.symbols.values()).sort(),
      kind: "import"
    }))
    .sort((left, right) => left.specifier.localeCompare(right.specifier));
}

function buildCombinedModule(moduleSegment: string, member: string): { module: string; symbol: string } | undefined {
  const base = normalizeModuleSegment(moduleSegment);
  if (!base) {
    return undefined;
  }

  if (!member) {
    return { module: base, symbol: member };
  }

  if (member === "*") {
    return { module: base, symbol: "*" };
  }

  return {
    module: `${base}.${member}`.replace(/[.]+/g, "."),
    symbol: member
  };
}

function normalizeModuleSegment(segment: string): string | undefined {
  if (!segment) {
    return undefined;
  }

  const trimmed = segment.trim();
  if (!trimmed) {
    return undefined;
  }

  const relativePrefix = trimmed.match(/^([.]+)(.*)$/);
  if (!relativePrefix) {
    return trimmed.replace(/[.]+/g, ".").replace(/[.]$/, "");
  }

  const [, dots, remainder] = relativePrefix;
  const levels = dots.length;
  const remainderParts = remainder.split(".").filter(Boolean);
  const parents = Array.from({ length: levels }, () => "parent");
  return parents.concat(remainderParts).join(".");
}