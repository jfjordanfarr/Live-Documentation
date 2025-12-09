import { promises as fs } from "node:fs";

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

interface PendingDocComment {
  lines: string[];
}

interface DocSection {
  heading?: string;
  lines: string[];
}

const DECLARATION_PATTERN = /^(\s*pub(?:\([^)]*\))?\s+(?:async\s+)?)(fn|struct|enum|trait|mod|const|type)\s+([A-Za-z_][A-Za-z0-9_]*)/;
const ATTRIBUTE_PATTERN = /^\s*#/;
const LINE_DOC_PATTERN = /^\s*\/\/\//;
const BLOCK_DOC_START_PATTERN = /^\s*\/\*\*/;
const IMPORT_PATTERN = /^\s*use\s+([^;]+);/gm;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g;
const URL_REGEX = /(https?:\/\/[^)\s]+)/g;

/**
 * Pattern to capture impl blocks:
 * - `impl Foo { ... }` - inherent impl
 * - `impl TraitName for StructName { ... }` - trait impl
 * Group 1: trait name (if present)
 * Group 2: struct/type name (after "for" or immediately after "impl")
 */
const IMPL_PATTERN = /^(\s*)impl(?:<[^>]*>)?\s+(?:([A-Za-z_][A-Za-z0-9_:]*(?:<[^>]*>)?)\s+for\s+)?([A-Za-z_][A-Za-z0-9_:]*(?:<[^>]*>)?)/;

export const rustAdapter: LanguageAdapter = {
  id: "rust-basic",
  extensions: [".rs"],
  async analyze({ absolutePath }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = extractDependencies(content);

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
  const lines = content.split(/\r?\n/);
  const symbols: PublicSymbolEntry[] = [];
  let pendingDoc: PendingDocComment | null = null;

  // Track struct/enum names to their symbol indices for adding trait impls
  const typeNameToIndex = new Map<string, number>();

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (LINE_DOC_PATTERN.test(rawLine)) {
      const lineContent = rawLine.replace(/^\s*\/\/\//, "");
      pendingDoc = pendingDoc ?? { lines: [] };
      pendingDoc.lines.push(lineContent.replace(/^\s?/, ""));
      continue;
    }

    if (BLOCK_DOC_START_PATTERN.test(trimmed)) {
      const { lines: docLines, nextIndex } = consumeBlockDoc(lines, index);
      pendingDoc = pendingDoc ?? { lines: [] };
      pendingDoc.lines.push(...docLines);
      index = nextIndex;
      continue;
    }

    if (!trimmed) {
      if (pendingDoc) {
        pendingDoc.lines.push("");
      }
      continue;
    }

    if (ATTRIBUTE_PATTERN.test(trimmed)) {
      continue;
    }

    const match = DECLARATION_PATTERN.exec(rawLine);
    if (match) {
      const doc = pendingDoc ? parseRustDocumentation(pendingDoc.lines) : undefined;
      const declarationType = match[2];
      const name = match[3];
      const kind = normalizeSymbolKind(declarationType);
      const char = match[0] ? rawLine.indexOf(match[0]) + 1 : 1;

      const symbolIndex = symbols.length;
      symbols.push({
        name,
        kind,
        location: {
          line: index + 1,
          character: char
        },
        documentation: doc ?? undefined
      } as PublicSymbolEntry);

      // Track structs and enums for impl block association
      if (kind === "struct" || kind === "enum") {
        typeNameToIndex.set(name, symbolIndex);
      }

      pendingDoc = null;
      continue;
    }

    // Check for impl blocks - both inherent and trait implementations
    const implMatch = IMPL_PATTERN.exec(rawLine);
    if (implMatch) {
      const traitName = implMatch[2];  // undefined for inherent impls
      const typeName = stripGenericParams(implMatch[3]);

      // If this is a trait impl (impl Trait for Type), add a typeReference
      if (traitName && typeNameToIndex.has(typeName)) {
        const symbolIndex = typeNameToIndex.get(typeName)!;
        const cleanTraitName = stripGenericParams(traitName);

        // Skip standard library traits that aren't interesting for linking
        if (!isStdTrait(cleanTraitName)) {
          const existingRefs = symbols[symbolIndex].typeReferences ?? [];
          symbols[symbolIndex].typeReferences = [
            ...existingRefs,
            { name: cleanTraitName, role: "implements" }
          ];
        }
      }

      pendingDoc = null;
      continue;
    }

    pendingDoc = null;
  }

  return symbols.sort((left, right) => {
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
}

/**
 * Strip generic parameters from a type name.
 * e.g., "HashMap<K, V>" → "HashMap"
 */
function stripGenericParams(typeName: string): string {
  const bracketIndex = typeName.indexOf("<");
  return bracketIndex >= 0 ? typeName.slice(0, bracketIndex) : typeName;
}

/**
 * Check if a trait is a standard library trait that's not interesting for linking.
 * These are ubiquitous and would create too much noise.
 */
function isStdTrait(traitName: string): boolean {
  const stdTraits = new Set([
    "Debug", "Display", "Clone", "Copy", "Default",
    "Eq", "PartialEq", "Ord", "PartialOrd", "Hash",
    "Send", "Sync", "Sized", "Drop",
    "From", "Into", "TryFrom", "TryInto",
    "Iterator", "IntoIterator",
    "Deref", "DerefMut", "AsRef", "AsMut",
    "Serialize", "Deserialize"  // serde traits are also very common
  ]);
  return stdTraits.has(traitName);
}

function consumeBlockDoc(lines: string[], startIndex: number): { lines: string[]; nextIndex: number } {
  const collected: string[] = [];
  let index = startIndex;
  const firstLine = lines[index];
  const remainder = firstLine.slice(firstLine.indexOf("/**") + 3);
  if (remainder.includes("*/")) {
    const inline = remainder.slice(0, remainder.indexOf("*/"));
    collected.push(stripBlockLine(inline));
    return {
      lines: collected,
      nextIndex: index
    };
  }

  collected.push(stripBlockLine(remainder));
  index += 1;

  while (index < lines.length) {
    const current = lines[index];
    if (current.includes("*/")) {
      const segment = current.slice(0, current.indexOf("*/"));
      collected.push(stripBlockLine(segment));
      break;
    }
    collected.push(stripBlockLine(current));
    index += 1;
  }

  return {
    lines: collected,
    nextIndex: index
  };
}

function stripBlockLine(line: string): string {
  return line.replace(/^\s*\*\s?/, "").replace(/\s+$/u, "");
}

function normalizeSymbolKind(kind: string): string {
  switch (kind) {
    case "fn":
      return "function";
    case "struct":
      return "struct";
    case "enum":
      return "enum";
    case "trait":
      return "trait";
    case "mod":
      return "module";
    case "const":
      return "const";
    case "type":
      return "type";
    default:
      return kind;
  }
}

function parseRustDocumentation(rawLines: string[]): SymbolDocumentation | undefined {
  const normalizedLines = trimTrailingEmpty(rawLines.map((line) => line.replace(/\s+$/u, "")));
  if (!normalizedLines.length) {
    return undefined;
  }

  const documentation: SymbolDocumentation = {
    source: "rustdoc"
  };

  const sections = splitIntoSections(normalizedLines);
  if (!sections.length) {
    return undefined;
  }

  const [intro, ...rest] = sections;
  const introParagraphs = toParagraphs(intro.lines);
  if (introParagraphs.length > 0) {
    documentation.summary = introParagraphs[0];
    if (introParagraphs.length > 1) {
      documentation.remarks = introParagraphs.slice(1).join("\n\n");
    }
  }

  for (const section of rest) {
    if (!section.heading) {
      continue;
    }
    const key = section.heading.toLowerCase();
    switch (key) {
      case "arguments":
      case "argument":
      case "args":
      case "parameters":
      case "params":
      case "inputs": {
        documentation.parameters = mergeParameters(documentation.parameters, parseParameterSection(section.lines));
        break;
      }
      case "returns":
      case "return": {
        const text = section.lines.join("\n").trim();
        if (text) {
          documentation.returns = documentation.returns
            ? `${documentation.returns}\n\n${text}`
            : text;
        }
        break;
      }
      case "errors":
      case "error":
      case "panics":
      case "panic": {
        documentation.exceptions = mergeExceptions(
          documentation.exceptions,
          parseExceptionSection(section.heading, section.lines)
        );
        break;
      }
      case "examples":
      case "example": {
        const { examples, remainder } = parseExamples(section.lines);
        documentation.examples = mergeExamples(documentation.examples, examples);
        if (remainder) {
          documentation.remarks = documentation.remarks
            ? `${documentation.remarks}\n\n${remainder}`
            : remainder;
        }
        break;
      }
      case "notes":
      case "note":
      case "warnings":
      case "warning":
      case "safety":
      case "tip":
      case "usage":
      case "details": {
        const text = section.lines.join("\n").trim();
        if (text) {
          const prefix = capitalize(section.heading);
          const fragment = `${prefix}:\n${text}`;
          documentation.remarks = documentation.remarks
            ? `${documentation.remarks}\n\n${fragment}`
            : fragment;
        }
        break;
      }
      case "see also":
      case "links":
      case "references":
      case "reference": {
        documentation.links = mergeLinks(documentation.links, extractLinks(section.lines.join("\n")));
        break;
      }
      default: {
        const text = section.lines.join("\n").trim();
        if (text) {
          documentation.rawFragments = [...(documentation.rawFragments ?? []), `# ${section.heading}\n${text}`];
        }
      }
    }
  }

  const combinedText = normalizedLines.join("\n");
  documentation.links = mergeLinks(documentation.links, extractLinks(combinedText));

  return hasDocumentationContent(documentation) ? documentation : undefined;
}

function splitIntoSections(lines: string[]): DocSection[] {
  const sections: DocSection[] = [];
  let currentHeading: string | undefined;
  let currentLines: string[] = [];

  const flush = (): void => {
    if (currentHeading !== undefined || currentLines.some((line) => line.trim())) {
      sections.push({
        heading: currentHeading,
        lines: trimTrailingEmpty(trimLeadingEmpty([...currentLines]))
      });
    }
    currentHeading = undefined;
    currentLines = [];
  };

  for (const line of lines) {
    const headingMatch = /^#{1,6}\s+(.*)$/.exec(line.trim());
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1].trim();
      continue;
    }
    currentLines.push(line);
  }

  flush();
  return sections;
}

function parseParameterSection(lines: string[]): SymbolDocumentationParameter[] {
  const entries: Array<{ name: string; description: string[] }> = [];
  let current: { name: string; description: string[] } | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) {
        current.description.push("");
      }
      continue;
    }

    const bulletMatch = /^[-*+]\s*(.*)$/.exec(trimmed);
    const content = bulletMatch ? bulletMatch[1].trim() : trimmed;
    const entryMatch = /^(?:`([^`]+)`|([A-Za-z0-9_]+))(?:\s*[:\-–]\s*(.*))?$/.exec(content);
    if (entryMatch) {
      if (current) {
        entries.push(current);
      }
      const name = entryMatch[1] ?? entryMatch[2] ?? content;
      const description = entryMatch[3] ? [entryMatch[3].trim()] : [];
      current = { name: name.trim(), description };
      continue;
    }

    if (current) {
      current.description.push(content);
    }
  }

  if (current) {
    entries.push(current);
  }

  return entries.map((entry) => ({
    name: entry.name,
    description: joinParagraphs(entry.description)
  }));
}

function parseExceptionSection(heading: string, lines: string[]): SymbolDocumentationException[] {
  const entries: Array<{ type: string; description: string[] }> = [];
  let current: { type: string; description: string[] } | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) {
        current.description.push("");
      }
      continue;
    }

    const bulletMatch = /^[-*+]\s*(.*)$/.exec(trimmed);
    const content = bulletMatch ? bulletMatch[1].trim() : trimmed;
    const entryMatch = /^(?:`([^`]+)`|([A-Za-z0-9_]+))(?:\s*[:\-–]\s*(.*))?$/.exec(content);
    if (entryMatch) {
      if (current) {
        entries.push(current);
      }
      const type = entryMatch[1] ?? entryMatch[2] ?? heading;
      const description = entryMatch[3] ? [entryMatch[3].trim()] : [];
      current = {
        type: type.trim(),
        description
      };
      continue;
    }

    if (current) {
      current.description.push(content);
    }
  }

  if (current) {
    entries.push(current);
  }

  if (!entries.length) {
    const text = lines.join("\n").trim();
    if (!text) {
      return [];
    }
    return [
      {
        type: capitalize(heading),
        description: text
      }
    ];
  }

  return entries.map((entry) => ({
    type: entry.type,
    description: joinParagraphs(entry.description)
  }));
}

function parseExamples(lines: string[]): { examples: SymbolDocumentationExample[]; remainder?: string } {
  const text = lines.join("\n");
  if (!text.trim()) {
    return { examples: [] };
  }

  const examples: SymbolDocumentationExample[] = [];
  const fenceRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let cursor = 0;

  while ((match = fenceRegex.exec(text)) !== null) {
    const before = text.slice(cursor, match.index).trim();
    const language = match[1]?.trim() || "rust";
    const code = match[2].replace(/\s+$/u, "");
    examples.push({
      description: before || undefined,
      code: code || undefined,
      language: code ? language : undefined
    });
    cursor = fenceRegex.lastIndex;
  }

  const tail = text.slice(cursor).trim();
  if (examples.length === 0) {
    return tail ? { examples: [{ description: tail }] } : { examples: [] };
  }

  return {
    examples,
    remainder: tail || undefined
  };
}

function extractLinks(text: string): SymbolDocumentationLink[] {
  const links: SymbolDocumentationLink[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
    const [, label, url] = match;
    const key = `href::${url}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    links.push({
      kind: "href",
      target: url,
      text: label.trim() || undefined
    });
  }

  while ((match = URL_REGEX.exec(text)) !== null) {
    const url = match[1];
    const key = `href::${url}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    links.push({
      kind: "href",
      target: url
    });
  }

  return links;
}

function extractDependencies(content: string): DependencyEntry[] {
  const imports = new Map<string, Set<string>>();
  let match: RegExpExecArray | null;

  while ((match = IMPORT_PATTERN.exec(content)) !== null) {
    let clause = match[1]?.trim();
    if (!clause) {
      continue;
    }

    clause = clause.replace(/\s+as\s+[^,]+/gi, "").trim();
    if (!clause) {
      continue;
    }

    const symbolSet = imports.get(clause) ?? new Set<string>();
    imports.set(clause, symbolSet);
  }

  IMPORT_PATTERN.lastIndex = 0;

  return Array.from(imports.entries())
    .map(([specifier, symbols]): DependencyEntry => ({
      specifier,
      symbols: Array.from(symbols.values()).sort(),
      kind: "import"
    }))
    .sort((left, right) => left.specifier.localeCompare(right.specifier));
}

function toParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (buffer.length > 0) {
        paragraphs.push(joinParagraphs(buffer));
        buffer = [];
      }
      continue;
    }
    buffer.push(line.trim());
  }

  if (buffer.length > 0) {
    paragraphs.push(joinParagraphs(buffer));
  }

  return paragraphs;
}

function joinParagraphs(lines: string[]): string {
  return lines
    .map((line) => line.replace(/\s+$/u, ""))
    .filter((line) => line.trim() !== "")
    .join("\n");
}

function trimLeadingEmpty(lines: string[]): string[] {
  const copy = [...lines];
  while (copy.length > 0 && !copy[0].trim()) {
    copy.shift();
  }
  return copy;
}

function trimTrailingEmpty(lines: string[]): string[] {
  const copy = [...lines];
  while (copy.length > 0 && !copy[copy.length - 1].trim()) {
    copy.pop();
  }
  return copy;
}

function mergeParameters(
  current: SymbolDocumentationParameter[] | undefined,
  additions: SymbolDocumentationParameter[]
): SymbolDocumentationParameter[] | undefined {
  if (!additions.length) {
    return current;
  }
  const existing = current ?? [];
  return [...existing, ...additions];
}

function mergeExceptions(
  current: SymbolDocumentationException[] | undefined,
  additions: SymbolDocumentationException[]
): SymbolDocumentationException[] | undefined {
  if (!additions.length) {
    return current;
  }
  const existing = current ?? [];
  return [...existing, ...additions];
}

function mergeExamples(
  current: SymbolDocumentationExample[] | undefined,
  additions: SymbolDocumentationExample[]
): SymbolDocumentationExample[] | undefined {
  if (!additions.length) {
    return current;
  }
  const existing = current ?? [];
  return [...existing, ...additions];
}

function mergeLinks(
  current: SymbolDocumentationLink[] | undefined,
  additions: SymbolDocumentationLink[]
): SymbolDocumentationLink[] | undefined {
  if (!additions.length) {
    return current;
  }
  const existing = current ?? [];
  const seen = new Set(existing.map((entry) => `${entry.kind}:${entry.target}`));
  const combined = [...existing];
  for (const entry of additions) {
    const key = `${entry.kind}:${entry.target}`;
    if (!seen.has(key)) {
      combined.push(entry);
      seen.add(key);
    }
  }
  return combined;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
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
