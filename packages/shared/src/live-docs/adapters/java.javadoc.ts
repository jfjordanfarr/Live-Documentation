/**
 * Javadoc: the block comment above a Java declaration, turned into structured
 * documentation. `@param`, `@return`, `@throws`, `@see`, `@example` and the
 * inline `{@code}`, `{@link}` and `{@literal}` tags are understood; other tags
 * are kept as raw fragments.
 */
import type {
  SymbolDocumentation,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLink,
  SymbolDocumentationLinkKind,
  SymbolDocumentationParameter
} from "../core";

/** Parses one Javadoc block comment, `/** ... *\/`, into structured documentation; anything else yields nothing. */
export function parseJavaDoc(comment: string): SymbolDocumentation | undefined {
  if (!comment.startsWith("/**")) {
    return undefined;
  }

  const lines = comment
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
