/**
 * Rustdoc: the `///` or `/** *\/` comment above a Rust item, turned into
 * structured documentation. The conventional `# Arguments`, `# Returns`,
 * `# Errors`, `# Panics` and `# Examples` sections are read into parameters,
 * returns, exceptions and examples; links in the text are collected.
 */
import type {
  SymbolDocumentation,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLink,
  SymbolDocumentationParameter
} from "../core";

interface DocSection {
  heading?: string;
  lines: string[];
}

const MARKDOWN_LINK_REGEX = /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g;
const URL_REGEX = /(https?:\/\/[^)\s]+)/g;

/** Parses the lines of a doc comment (`///` or `/** *\/`, markers removed) into structured documentation: summary, remarks, and the `# Arguments`, `# Returns`, `# Errors`, `# Panics` and `# Examples` sections rustdoc readers expect. */
export function parseRustDocumentation(rawLines: string[]): SymbolDocumentation | undefined {
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
