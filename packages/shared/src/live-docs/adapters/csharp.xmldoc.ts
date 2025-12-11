/**
 * C# XML documentation parsing module.
 *
 * Parses XML documentation comments (/// style) commonly found in C# code into
 * structured SymbolDocumentation objects. Handles all standard XML doc tags
 * including <summary>, <param>, <returns>, <exception>, <example>, <see>, etc.
 *
 * @module csharp.xmldoc
 */

import type {
  SymbolDocumentation,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLink,
  SymbolDocumentationLinkKind,
  SymbolDocumentationParameter
} from "../core";

/**
 * Set of recognized C# XML documentation tags.
 * Used to detect unsupported tags that may appear in documentation.
 */
export const RECOGNIZED_DOC_TAGS = new Set<string>([
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

/**
 * Builds a SymbolDocumentation object from raw XML doc comment lines.
 *
 * @param docLines - Array of raw comment lines (including /// markers)
 * @returns Parsed documentation object, or undefined if no content
 */
export function buildDocumentationFromLines(docLines: string[]): SymbolDocumentation | undefined {
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

/**
 * Strips the XML doc comment marker (///) from a line.
 *
 * @param line - Raw source line
 * @returns Line without the /// prefix
 */
export function stripDocCommentMarker(line: string): string {
  return line.replace(/^\s*\/\/\/\s?/, "");
}

/**
 * Extracts text content from a single XML tag occurrence.
 *
 * @param block - Raw XML doc block
 * @param tagName - Name of the tag to extract (e.g., "summary")
 * @returns Normalized text content, or undefined if not found
 */
export function extractSingleTagText(block: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "gi");
  const match = regex.exec(block);
  if (!match) {
    return undefined;
  }
  regex.lastIndex = 0;
  const normalized = normalizeXmlText(match[1]);
  return normalized || undefined;
}

/**
 * Extracts parameter or typeparam documentation tags.
 *
 * @param block - Raw XML doc block
 * @param tagName - Either "param" or "typeparam"
 * @returns Array of parsed parameter documentation
 */
export function extractParameterTags(block: string, tagName: string): SymbolDocumentationParameter[] {
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

/**
 * Extracts exception documentation tags.
 *
 * @param block - Raw XML doc block
 * @returns Array of parsed exception documentation, sorted by type
 */
export function extractExceptionTags(block: string): SymbolDocumentationException[] {
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

/**
 * Extracts example documentation tags.
 *
 * @param block - Raw XML doc block
 * @returns Array of parsed examples with optional code blocks
 */
export function extractExampleTags(block: string): SymbolDocumentationExample[] {
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

/**
 * Extracts <see> and <seealso> link tags.
 *
 * @param block - Raw XML doc block
 * @returns Array of deduplicated, sorted links
 */
export function extractLinkTags(block: string): SymbolDocumentationLink[] {
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

/**
 * Extracts raw documentation fragments like <inheritdoc> and <include>.
 *
 * @param block - Raw XML doc block
 * @returns Array of raw tag strings
 */
export function extractRawDocFragments(block: string): string[] {
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

/**
 * Detects XML tags that are not in the recognized set.
 *
 * @param block - Raw XML doc block
 * @returns Array of unrecognized tag names
 */
export function detectUnsupportedTags(block: string): string[] {
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

/**
 * Parses XML attributes from a tag fragment.
 *
 * @param fragment - Raw attribute string (e.g., 'cref="Foo" name="bar"')
 * @returns Object mapping attribute names to values
 */
export function parseXmlAttributes(fragment: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w+)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(fragment)) !== null) {
    attributes[match[1].toLowerCase()] = decodeXmlEntities(match[2]);
  }
  return attributes;
}

/**
 * Normalizes XML documentation text into readable plain text.
 * Converts inline tags, handles code blocks, and cleans up whitespace.
 *
 * @param value - Raw XML content
 * @returns Cleaned, normalized text
 */
export function normalizeXmlText(value: string): string {
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

/**
 * Decodes common XML entities to their character equivalents.
 *
 * @param value - String with XML entities
 * @returns Decoded string
 */
export function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Normalizes a cref target by stripping prefixes and converting syntax.
 *
 * @param value - Raw cref value (e.g., "T:MyNamespace.MyClass")
 * @returns Normalized reference (e.g., "MyNamespace.MyClass")
 */
export function normalizeCrefTarget(value: string): string {
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

/**
 * Renders a cref target as display text, optionally with custom inner text.
 *
 * @param cref - The cref target
 * @param inner - Optional custom display text
 * @returns Formatted reference text
 */
export function renderCrefText(cref: string, inner?: string): string {
  const normalizedTarget = normalizeCrefTarget(cref);
  const normalizedInner = inner?.trim();
  if (normalizedInner && normalizedInner.length > 0 && normalizedInner !== normalizedTarget) {
    return normalizedInner;
  }
  return `\`${normalizedTarget}\``;
}

/**
 * Checks if a documentation object has any structured content.
 *
 * @param doc - Documentation object to check
 * @returns True if any documentation fields are populated
 */
export function hasStructuredContent(doc: SymbolDocumentation): boolean {
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
