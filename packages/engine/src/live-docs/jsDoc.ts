/**
 * JSDoc documentation extraction for Live Documentation.
 *
 * @remarks
 * This module extracts structured documentation from JSDoc/TSDoc comments
 * attached to TypeScript nodes. It normalizes tags, handles edge cases,
 * and produces a consistent SymbolDocumentation structure.
 *
 * @module
 */

import ts from "typescript";

import type {
  SymbolDocumentation,
  SymbolDocumentationExample,
  SymbolDocumentationException,
  SymbolDocumentationLink,
  SymbolDocumentationLinkKind
} from "./coreTypes";

/**
 * Extracts structured documentation from JSDoc comments on a TypeScript node.
 *
 * @param node - The TypeScript AST node to extract documentation from
 * @returns Structured documentation object, or undefined if no meaningful content
 *
 * @remarks
 * Supported JSDoc tags:
 * - `@param` - Parameter descriptions
 * - `@returns` / `@return` - Return value description
 * - `@template` - Type parameter descriptions
 * - `@throws` / `@exception` - Exception documentation
 * - `@see` / `@link` - Cross-references
 * - `@example` - Code examples (with optional language)
 * - `@remarks` - Additional remarks
 * - `@deprecated` - Deprecation notice
 *
 * Unknown tags are preserved in `rawFragments`.
 */
export function extractJsDocDocumentation(node: ts.Node): SymbolDocumentation | undefined {
  const docEntries = ts.getJSDocCommentsAndTags(node);
  if (!docEntries.length) {
    return undefined;
  }

  const documentation: SymbolDocumentation = {
    source: "tsdoc"
  };

  const parameterMap = new Map<string, string | undefined>();
  const typeParameterMap = new Map<string, string | undefined>();
  const examples: SymbolDocumentationExample[] = [];
  const links: SymbolDocumentationLink[] = [];
  const linkKeys = new Set<string>();
  const exceptions: SymbolDocumentationException[] = [];
  const rawFragments: string[] = [];

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

  const registerLink = (target: string, text?: string): void => {
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
    const normalizedText = text?.trim();
    const key = `${kind}|${normalizedTarget}|${normalizedText ?? ""}`;
    if (linkKeys.has(key)) {
      return;
    }
    linkKeys.add(key);
    links.push({
      kind,
      target: normalizedTarget,
      text: normalizedText && normalizedText !== normalizedTarget ? normalizedText : undefined
    });
  };

  const registerExample = (comment?: string): void => {
    if (!comment) {
      return;
    }
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }
    const fenceMatch = trimmed.match(/```(\w*)\s*([\s\S]*?)```/);
    if (fenceMatch) {
      const [, language, codeBlock] = fenceMatch;
      const description = trimmed.replace(fenceMatch[0], "").trim();
      examples.push({
        description: description || undefined,
        code: codeBlock.trimEnd(),
        language: language || undefined
      });
      return;
    }
    examples.push({ description: trimmed });
  };

  const handleGenericTag = (tagName: string, commentText?: string): void => {
    switch (tagName) {
      case "remarks": {
        documentation.remarks = appendBlock(documentation.remarks, commentText);
        return;
      }
      case "example": {
        registerExample(commentText);
        return;
      }
      case "see":
      case "link": {
        if (commentText) {
          registerLink(commentText, commentText);
        }
        return;
      }
      case "deprecated": {
        rawFragments.push(`@deprecated${commentText ? ` ${commentText.trim()}` : ""}`.trim());
        return;
      }
      default: {
        if (commentText?.trim()) {
          rawFragments.push(`@${tagName} ${commentText.trim()}`.trim());
        } else {
          rawFragments.push(`@${tagName}`);
        }
      }
    }
  };

  const handleTag = (tag: ts.JSDocTag): void => {
    if (ts.isJSDocParameterTag(tag)) {
      const name = tag.name.getText();
      const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment), name);
      parameterMap.set(name, commentText);
      return;
    }

    if (ts.isJSDocReturnTag(tag)) {
      const returnComment = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
      documentation.returns = appendBlock(documentation.returns, returnComment);
      return;
    }

    if (ts.isJSDocTemplateTag(tag)) {
      const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
      for (const typeParameter of tag.typeParameters) {
        typeParameterMap.set(typeParameter.getText(), commentText);
      }
      return;
    }

    if (ts.isJSDocThrowsTag(tag)) {
      const typeName = tag.typeExpression?.type.getText();
      const description = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
      exceptions.push({
        type: typeName,
        description
      });
      return;
    }

    if (ts.isJSDocSeeTag(tag)) {
      const nameText = tag.name ? tag.name.getText().trim() : undefined;
      const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));

      let targetValue = nameText ?? commentText ?? "";
      let labelValue = commentText ?? nameText ?? undefined;

      if (nameText && commentText) {
        const combined = `${nameText}${commentText}`.trim();
        if (/^[a-z]+$/i.test(nameText) && /^[:/]/.test(commentText)) {
          targetValue = combined;
          labelValue = combined;
        }
      }

      registerLink(targetValue, labelValue);
      return;
    }

    const tagName = tag.tagName.text.toLowerCase();
    const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
    handleGenericTag(tagName, commentText);
  };

  for (const entry of docEntries) {
    if (ts.isJSDoc(entry)) {
      const summaryText = coalesceJsDocComment(entry.comment);
      documentation.summary = appendBlock(documentation.summary, summaryText);
      if (entry.tags) {
        entry.tags.forEach(handleTag);
      }
      continue;
    }

    if (isJSDocTagNode(entry)) {
      handleTag(entry);
    }
  }

  if (parameterMap.size > 0) {
    documentation.parameters = Array.from(parameterMap.entries())
      .map(([name, description]) => ({ name, description: description?.trim() || undefined }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (typeParameterMap.size > 0) {
    documentation.typeParameters = Array.from(typeParameterMap.entries())
      .map(([name, description]) => ({ name, description: description?.trim() || undefined }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (examples.length > 0) {
    documentation.examples = examples;
  }

  if (links.length > 0) {
    documentation.links = links
      .slice()
      .sort((a, b) => {
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
  }

  if (exceptions.length > 0) {
    documentation.exceptions = exceptions
      .slice()
      .sort((a, b) => {
        const aKey = a.type ?? "";
        const bKey = b.type ?? "";
        const typeDiff = aKey.localeCompare(bKey);
        if (typeDiff !== 0) {
          return typeDiff;
        }
        return (a.description ?? "").localeCompare(b.description ?? "");
      });
  }

  if (rawFragments.length > 0) {
    documentation.rawFragments = Array.from(new Set(rawFragments)).sort((a, b) => a.localeCompare(b));
  }

  return hasDocumentationContent(documentation) ? documentation : undefined;
}

// ============================================================================
// Internal Helpers
// ============================================================================

function coalesceJsDocComment(
  comment: string | ts.NodeArray<ts.JSDocComment> | undefined
): string | undefined {
  if (!comment) {
    return undefined;
  }
  if (typeof comment === "string") {
    return comment.trim() || undefined;
  }

  const parts: string[] = [];
  for (const part of comment) {
    if (typeof part === "string") {
      parts.push(part);
      continue;
    }
    const node = part as ts.Node;
    if (isJSDocTextNode(node)) {
      parts.push(node.text);
      continue;
    }
    parts.push(node.getText());
  }

  const text = parts.join("").trim();
  return text || undefined;
}

function normalizeJsDocTagComment(comment: string | undefined, contextName?: string): string | undefined {
  if (!comment) {
    return undefined;
  }

  let trimmed = comment.trim();
  if (!trimmed) {
    return undefined;
  }

  const stripByPrefix = (candidate: string): void => {
    const patterns = [" - ", " — ", " – ", ":", " :", " —", " –"];
    for (const pattern of patterns) {
      const prefix = `${candidate}${pattern}`;
      if (trimmed.startsWith(prefix)) {
        trimmed = trimmed.slice(prefix.length).trim();
        return;
      }
    }
  };

  if (contextName) {
    stripByPrefix(contextName);
    if (contextName.includes(".")) {
      const simple = contextName.split(".").pop();
      if (simple && simple !== contextName) {
        stripByPrefix(simple);
      }
    }
  }

  if (/^[-–—]\s+/.test(trimmed)) {
    trimmed = trimmed.replace(/^[-–—]\s+/, "");
  }

  return trimmed || undefined;
}

function isJSDocTagNode(entry: ts.JSDoc | ts.JSDocTag): entry is ts.JSDocTag {
  return (entry as ts.JSDocTag).tagName !== undefined;
}

function isJSDocTextNode(node: ts.Node): node is ts.JSDocText {
  return node.kind === ts.SyntaxKind.JSDocText;
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
