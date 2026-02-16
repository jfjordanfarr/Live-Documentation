import { promises as fs, statSync } from "node:fs";
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

interface PendingDocBlock {
  lines: string[];
}

/**
 * Extended class/module pattern that captures inheritance.
 * Group 1: leading whitespace
 * Group 2: "class" or "module"
 * Group 3: name (including namespacing like Foo::Bar)
 * Group 4: parent class if present (e.g., "< ParentClass")
 */
const CLASS_OR_MODULE_PATTERN = /^(\s*)(class|module)\s+([A-Za-z_][A-Za-z0-9_:]*)(?:\s*<\s*([A-Za-z_][A-Za-z0-9_:]*))?/;
const METHOD_PATTERN = /^(\s*)def\s+(self\.)?([A-Za-z_][A-Za-z0-9_!?=]*)/;
const ATTR_PATTERN = /^(\s*)attr_(reader|writer|accessor)\s+(.+)/;
const REQUIRE_PATTERN = /^(\s*)require(_relative)?\s+(["'])([^"']+)(["'])/;
const INCLUDE_PATTERN = /^(\s*)(include|extend|prepend)\s+([A-Za-z_][A-Za-z0-9_:]*)/;
const CONSTANT_PATTERN = /^(\s*)([A-Z][A-Za-z0-9_:]*)\s*=\s*(?:Struct\.new|module|class)/;
const LINE_COMMENT_PATTERN = /^\s*#/;
const BLOCK_COMMENT_BEGIN = /^\s*=begin\b/i;
const BLOCK_COMMENT_END = /^\s*=end\b/i;
const DIRECTIVE_PATTERN = /^#\s*(?:frozen_string_literal|rubocop)/i;

/** Language adapter for Ruby (`.rb`, `.rake`, `Gemfile`, `Rakefile`). Extracts classes, modules, methods, and `require`/`require_relative` dependencies. */
export const rubyAdapter: LanguageAdapter = {
  id: "ruby-basic",
  extensions: [".rb"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = extractDependencies(content, absolutePath, workspaceRoot);

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

  // Track class/module scope for associating mixins with their enclosing type
  const scopeStack: { name: string; indent: number; typeReferences: TypeReference[]; entryIndex: number }[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const trimmed = raw.trim();

    if (DIRECTIVE_PATTERN.test(trimmed)) {
      continue;
    }

    if (LINE_COMMENT_PATTERN.test(raw)) {
      pendingDoc = pendingDoc ?? { lines: [] };
      pendingDoc.lines.push(normalizeLineComment(raw));
      continue;
    }

    if (BLOCK_COMMENT_BEGIN.test(trimmed)) {
      const { lines: blockLines, nextIndex } = consumeBlockComment(lines, index);
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

    // Pop scopes that have ended (based on indentation)
    const currentIndent = raw.length - raw.trimStart().length;
    while (scopeStack.length > 0 && currentIndent <= scopeStack[scopeStack.length - 1].indent) {
      const popped = scopeStack.pop()!;
      // Finalize typeReferences on the class/module entry
      if (popped.typeReferences.length > 0) {
        entries[popped.entryIndex].typeReferences = popped.typeReferences;
      }
    }

    // Check for include/extend/prepend within a class/module
    const mixinMatch = INCLUDE_PATTERN.exec(raw);
    if (mixinMatch && scopeStack.length > 0) {
      const currentScope = scopeStack[scopeStack.length - 1];
      // mixinMatch[2] is the type (include/extend/prepend) - all mapped to "implements"
      const mixinName = mixinMatch[3];

      // Map Ruby mixin types to TypeReference roles:
      // - include: like "implements" (adds instance methods)
      // - extend: adds class methods (also like "implements")
      // - prepend: like "implements" but higher priority
      currentScope.typeReferences.push({
        name: mixinName,
        role: "implements"
      });
      pendingDoc = null;
      continue;
    }

    const classOrModuleMatch = CLASS_OR_MODULE_PATTERN.exec(raw);
    if (classOrModuleMatch) {
      const kind = classOrModuleMatch[2] === "class" ? "class" : "module";
      const name = classOrModuleMatch[3];
      const parentClass = classOrModuleMatch[4];

      const typeReferences: TypeReference[] = [];
      if (parentClass) {
        typeReferences.push({
          name: parentClass,
          role: "extends"
        });
      }

      const entryIndex = entries.length;
      entries.push({
        name,
        kind,
        location: {
          line: index + 1,
          character: (classOrModuleMatch[1]?.length ?? 0) + 1
        },
        documentation: pendingDoc ? parseRubyDocumentation(pendingDoc.lines) : undefined,
        typeReferences: typeReferences.length > 0 ? typeReferences : undefined
      });

      // Push this class/module onto the scope stack to collect its mixins
      scopeStack.push({
        name,
        indent: currentIndent,
        typeReferences,
        entryIndex
      });

      pendingDoc = null;
      continue;
    }

    const methodMatch = METHOD_PATTERN.exec(raw);
    if (methodMatch) {
      const prefix = methodMatch[2] ?? "";
      const name = prefix ? `${prefix}${methodMatch[3]}` : methodMatch[3];
      entries.push({
        name,
        kind: "method",
        location: {
          line: index + 1,
          character: (methodMatch[1]?.length ?? 0) + 1
        },
        documentation: pendingDoc ? parseRubyDocumentation(pendingDoc.lines) : undefined
      });
      pendingDoc = null;
      continue;
    }

    const attrMatch = ATTR_PATTERN.exec(raw);
    if (attrMatch) {
      const symbols = parseAttrSymbols(attrMatch[3]);
      for (const symbol of symbols) {
        entries.push({
          name: symbol,
          kind: "property",
          location: {
            line: index + 1,
            character: (attrMatch[1]?.length ?? 0) + 1
          },
          documentation: pendingDoc ? parseRubyDocumentation(pendingDoc.lines) : undefined
        });
      }
      pendingDoc = null;
      continue;
    }

    const constantMatch = CONSTANT_PATTERN.exec(raw);
    if (constantMatch) {
      entries.push({
        name: constantMatch[2],
        kind: "const",
        location: {
          line: index + 1,
          character: (constantMatch[1]?.length ?? 0) + 1
        },
        documentation: pendingDoc ? parseRubyDocumentation(pendingDoc.lines) : undefined
      });
      pendingDoc = null;
      continue;
    }

    pendingDoc = null;
  }

  // Finalize any remaining open scopes
  while (scopeStack.length > 0) {
    const popped = scopeStack.pop()!;
    if (popped.typeReferences.length > 0) {
      entries[popped.entryIndex].typeReferences = popped.typeReferences;
    }
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

function extractDependencies(content: string, absolutePath: string, workspaceRoot: string): DependencyEntry[] {
  const dependencies = new Map<string, DependencyEntry>();
  const lines = content.split(/\r?\n/);
  const directory = path.dirname(absolutePath);

  for (const raw of lines) {
    const requireMatch = REQUIRE_PATTERN.exec(raw);
    REQUIRE_PATTERN.lastIndex = 0;
    if (requireMatch) {
      const [, , relativeKeyword, , specifier] = requireMatch;
      const normalized = specifier;
      const key = `require:${relativeKeyword ? "relative" : "absolute"}:${normalized}`;
      if (!dependencies.has(key)) {
        dependencies.set(key, {
          specifier: normalized,
          resolvedPath: resolveRequirePath(directory, workspaceRoot, normalized, Boolean(relativeKeyword)),
          symbols: [],
          kind: "import"
        });
      }
      continue;
    }

    const includeMatch = INCLUDE_PATTERN.exec(raw);
    INCLUDE_PATTERN.lastIndex = 0;
    if (includeMatch) {
      const mixin = includeMatch[3];
      const key = `mixin:${mixin}`;
      if (!dependencies.has(key)) {
        dependencies.set(key, {
          specifier: mixin,
          resolvedPath: undefined,
          symbols: [],
          kind: "import"
        });
      }
    }
  }

  return Array.from(dependencies.values()).sort((left, right) => left.specifier.localeCompare(right.specifier));
}

function consumeBlockComment(lines: string[], startIndex: number): { lines: string[]; nextIndex: number } {
  const collected: string[] = [];
  let index = startIndex;
  const first = lines[index];
  const start = first.replace(/^\s*=begin\b\s*/i, "");
  if (start) {
    collected.push(start.trimEnd());
  }
  index += 1;
  while (index < lines.length) {
    const current = lines[index];
    if (BLOCK_COMMENT_END.test(current)) {
      const before = current.replace(/\s*=end\b.*/i, "");
      if (before.trim()) {
        collected.push(before.trimEnd());
      }
      break;
    }
    collected.push(current);
    index += 1;
  }
  return {
    lines: collected,
    nextIndex: index
  };
}

function normalizeLineComment(line: string): string {
  return line.replace(/^\s*#\s?/, "").replace(/\s+$/u, "");
}

function parseAttrSymbols(value: string): string[] {
  return value
    .split(",")
    .map(segment => segment.trim())
    .filter(Boolean)
    .map(segment => segment.replace(/^:/, ""))
    .map(symbol => symbol.replace(/\s+.*$/, ""));
}

function resolveRequirePath(directory: string, workspaceRoot: string, specifier: string, isRelative: boolean): string | undefined {
  if (!isRelative) {
    return undefined;
  }

  const baseCandidate = path.resolve(directory, specifier);
  const candidates = [baseCandidate, `${baseCandidate}.rb`, path.join(baseCandidate, "init.rb")];

  for (const candidate of candidates) {
    if (!candidate.startsWith(workspaceRoot)) {
      continue;
    }

    if (!isFile(candidate)) {
      continue;
    }

    return path.relative(workspaceRoot, candidate).replace(/\\/g, "/");
  }

  return undefined;
}

function isFile(candidate: string): boolean {
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function parseRubyDocumentation(rawLines: string[]): SymbolDocumentation | undefined {
  const normalized = trimEmptyEdges(rawLines.map(line => line.replace(/\s+$/u, "")));
  if (!normalized.length) {
    return undefined;
  }

  const documentation: SymbolDocumentation = {
    source: "yard"
  };

  const plainLines: string[] = [];
  const tagPattern = /^@(\w+)\s*(.*)$/;
  let currentExample: { title?: string; buffer: string[] } | null = null;

  const flushExample = (): void => {
    if (!currentExample) {
      return;
    }
    const code = currentExample.buffer.join("\n").trimEnd();
    documentation.examples = mergeExamples(documentation.examples, [
      {
        description: currentExample.title || undefined,
        code: code || undefined,
        language: code ? "ruby" : undefined
      }
    ]);
    currentExample = null;
  };

  for (let index = 0; index < normalized.length; index += 1) {
    const line = normalized[index];
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
        case "param": {
          const parameter = parseParamTag(payload);
          if (parameter) {
            documentation.parameters = mergeParameters(documentation.parameters, [parameter]);
          }
          break;
        }
        case "return":
        case "returns": {
          const text = payload || undefined;
          if (text) {
            documentation.returns = documentation.returns ? `${documentation.returns}\n\n${text}` : text;
          }
          break;
        }
        case "raise":
        case "exception": {
          const exception = parseExceptionTag(payload);
          if (exception) {
            documentation.exceptions = mergeExceptions(documentation.exceptions, [exception]);
          }
          break;
        }
        case "example": {
          currentExample = {
            title: payload || undefined,
            buffer: []
          };
          break;
        }
        case "see": {
          const link = parseLinkTag(payload);
          if (link) {
            documentation.links = mergeLinks(documentation.links, [link]);
          }
          break;
        }
        case "deprecated":
        case "note":
        case "todo":
        case "since": {
          const fragment = `${capitalize(tag)}: ${payload}`;
          documentation.remarks = documentation.remarks
            ? `${documentation.remarks}\n\n${fragment}`
            : fragment;
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

  const sections = splitSections(plainLines);
  if (sections.length) {
    const [intro, ...rest] = sections;
    const paragraphs = toParagraphs(intro.lines);
    if (paragraphs.length) {
      documentation.summary = paragraphs[0];
      if (paragraphs.length > 1) {
        documentation.remarks = documentation.remarks
          ? `${documentation.remarks}\n\n${paragraphs.slice(1).join("\n\n")}`
          : paragraphs.slice(1).join("\n\n");
      }
    }

    for (const section of rest) {
      const heading = section.heading?.toLowerCase();
      if (!heading) {
        continue;
      }
      const text = section.lines.join("\n").trim();
      if (!text) {
        continue;
      }
      if (["parameters", "parameter", "arguments", "args"].includes(heading)) {
        documentation.parameters = mergeParameters(
          documentation.parameters,
          parseParameterList(section.lines)
        );
        continue;
      }
      if (["returns", "return"].includes(heading)) {
        documentation.returns = documentation.returns ? `${documentation.returns}\n\n${text}` : text;
        continue;
      }
      if (["raises", "raise", "exceptions", "exception"].includes(heading)) {
        documentation.exceptions = mergeExceptions(
          documentation.exceptions,
          parseBulletList(section.lines).map(entry => ({ type: entry.name, description: entry.description }))
        );
        continue;
      }
      if (["examples", "example"].includes(heading)) {
        documentation.examples = mergeExamples(
          documentation.examples,
          [
            {
              description: undefined,
              code: text,
              language: "ruby"
            }
          ]
        );
        continue;
      }
      documentation.rawFragments = [...(documentation.rawFragments ?? []), `# ${section.heading}\n${text}`];
    }
  }

  documentation.links = mergeLinks(documentation.links, extractLinks(normalized.join("\n")));

  return hasDocContent(documentation) ? documentation : undefined;
}

function splitSections(lines: string[]): Array<{ heading?: string; lines: string[] }> {
  const sections: Array<{ heading?: string; lines: string[] }> = [];
  let current: { heading?: string; lines: string[] } = { heading: undefined, lines: [] };

  const flush = (): void => {
    if (current.lines.some(line => line.trim())) {
      sections.push({
        heading: current.heading,
        lines: trimEmptyEdges([...current.lines])
      });
    }
    current = { heading: undefined, lines: [] };
  };

  for (const line of lines) {
    const headingMatch = /^#+\s+(.*)$/.exec(line.trim());
    if (headingMatch) {
      flush();
      current.heading = headingMatch[1].trim();
      continue;
    }
    current.lines.push(line);
  }

  flush();
  return sections;
}

function parseParamTag(payload: string): SymbolDocumentationParameter | undefined {
  if (!payload) {
    return undefined;
  }
  const parts = payload.split(/\s+/);
  if (!parts.length) {
    return undefined;
  }
  const name = parts.shift() ?? "param";
  let description = parts.join(" ").trim();
  description = description.replace(/^\[[^\]]+\]\s*/, "");
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
  const type = parts.shift() ?? "Error";
  const description = parts.join(" ");
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
    const target = segments[0];
    return {
      kind: inferLinkKind(target),
      target
    };
  }
  const target = segments.pop();
  if (!target) {
    return undefined;
  }
  return {
    kind: inferLinkKind(target),
    target,
    text: segments.join(" ") || undefined
  };
}

function inferLinkKind(target: string): SymbolDocumentationLinkKind {
  const normalized = target.trim();
  if (!normalized) {
    return "unknown";
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(normalized)) {
    return "href";
  }

  if (normalized.startsWith("#") || normalized.startsWith("./") || normalized.startsWith("../") || normalized.startsWith("/")) {
    return "href";
  }

  return "cref";
}

function parseParameterList(lines: string[]): SymbolDocumentationParameter[] {
  return parseBulletList(lines).map(entry => ({
    name: entry.name,
    description: entry.description
  }));
}

function parseBulletList(
  lines: string[]
): Array<{ name: string; description: string }> {
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
    const nameMatch = /^(?:`([^`]+)`|([A-Za-z0-9_]+))(?:\s*-\s*(.*))?$/.exec(content);
    if (nameMatch) {
      if (current) {
        entries.push(current);
      }
      const name = nameMatch[1] ?? nameMatch[2] ?? content;
      const description = nameMatch[3] ? [nameMatch[3]] : [];
      current = { name, description };
      continue;
    }

    if (current) {
      current.description.push(content);
    }
  }

  if (current) {
    entries.push(current);
  }

  return entries.map(entry => ({
    name: entry.name,
    description: entry.description.join("\n").trim()
  }));
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
  const markdownLink = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = markdownLink.exec(text)) !== null) {
    links.push({
      kind: "href",
      target: match[2],
      text: match[1]
    });
  }
  const urlPattern = /(https?:\/\/[^)\s]+)/g;
  while ((match = urlPattern.exec(text)) !== null) {
    links.push({
      kind: "href",
      target: match[1]
    });
  }
  return links;
}

function hasDocContent(doc: SymbolDocumentation): boolean {
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
