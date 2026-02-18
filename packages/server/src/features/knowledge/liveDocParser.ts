import { pathToFileURL } from "node:url";

import { RelationshipHint } from "@live-documentation/shared/inference/fallbackInference";

import { LinkHintContext, resolveReferencePath } from "./linkHintExtractor";

/** Structured metadata extracted from a `.mdmd.md` document. */
export interface MdmdDocumentDetails {
  layer?: string;
  identifier?: string;
  identifiers: string[];
  codePaths: string[];
  exports: string[];
  sectionSymbols: string[];
}

/** A symbol referenced in backticks within a markdown document. */
export interface DocumentSymbolReferenceMetadata {
  symbol: string;
  context?: string;
}

const SYMBOL_REFERENCE_PATTERN = /`([^`]+)`/g;

/**
 * Extracts MDMD document details from markdown content.
 */
export function extractMdmdDocumentDetails(content: string): MdmdDocumentDetails {
  const metadata = parseMdmdMetadata(content);
  const sectionSymbols = collectSectionSymbols(content, resolveSectionSymbolTargets(metadata.layer));

  return {
    layer: metadata.layer,
    identifier: metadata.identifiers[0],
    identifiers: metadata.identifiers,
    codePaths: metadata.codePaths,
    exports: metadata.exports,
    sectionSymbols
  };
}

/**
 * Creates relationship hints from MDMD metadata code paths.
 */
export async function createMdmdMetadataHints(
  details: MdmdDocumentDetails,
  context: LinkHintContext
): Promise<RelationshipHint[]> {
  if (!details.codePaths.length) {
    return [];
  }

  const hints: RelationshipHint[] = [];
  for (const reference of details.codePaths) {
    const resolved = await resolveReferencePath(reference, context);
    if (!resolved) {
      continue;
    }

    const targetUri = pathToFileURL(resolved).toString();
    hints.push({
      sourceUri: context.sourceUri,
      targetUri,
      kind: "documents",
      confidence: 0.9,
      rationale: "metadata code path"
    });
  }

  return hints;
}

/**
 * Extracts symbol references from document content.
 */
export function extractDocumentSymbolReferences(
  content: string,
  mdmdDetails?: MdmdDocumentDetails
): DocumentSymbolReferenceMetadata[] {
  const references = new Map<string, DocumentSymbolReferenceMetadata>();

  const register = (symbol: string, context: string): void => {
    const trimmed = symbol.trim();
    if (!trimmed || !looksLikeSymbolIdentifier(trimmed)) {
      return;
    }
    references.set(trimmed, {
      symbol: trimmed,
      context
    });
  };

  if (mdmdDetails) {
    for (const symbol of mdmdDetails.sectionSymbols) {
      register(symbol, "section-heading");
    }

    for (const symbol of mdmdDetails.exports) {
      register(symbol, "metadata-export");
    }

    for (const symbol of mdmdDetails.identifiers) {
      register(symbol, "metadata-identifier");
    }
  }

  let match: RegExpExecArray | null;
  while ((match = SYMBOL_REFERENCE_PATTERN.exec(content)) !== null) {
    const snippet = (match[1] ?? "").trim();
    if (!snippet) {
      continue;
    }

    if (!shouldRegisterInlineCode(snippet, mdmdDetails)) {
      continue;
    }

    register(snippet, "inline-code");
  }

  return Array.from(references.values());
}

/**
 * Parses MDMD metadata section from markdown content.
 */
export function parseMdmdMetadata(content: string): {
  layer?: string;
  identifiers: string[];
  codePaths: string[];
  exports: string[];
} {
  const lines = content.split(/\r?\n/);
  const headingPattern = /^(#{1,6})\s+(.*)$/;
  const bulletPattern = /^\s*-\s*(.+)$/;
  const linkTargetPattern = /\(([^)]+)\)/g;
  const linkTextPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  let inMetadata = false;
  let metadataLevel = 0;
  const codePaths = new Set<string>();
  const exports = new Set<string>();
  let layer: string | undefined;
  const identifiers = new Set<string>();

  for (const line of lines) {
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim().toLowerCase();

      if (!inMetadata && title === "metadata") {
        inMetadata = true;
        metadataLevel = level;
        continue;
      }

      if (inMetadata && level <= metadataLevel) {
        break;
      }

      continue;
    }

    if (!inMetadata) {
      continue;
    }

    const bulletMatch = line.match(bulletPattern);
    if (!bulletMatch) {
      continue;
    }

    const entry = bulletMatch[1].trim();
    const separatorIndex = entry.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const rawKey = entry.slice(0, separatorIndex).trim();
    const key = normalizeMetadataKey(rawKey);
    const value = entry.slice(separatorIndex + 1).trim();
    if (!value) {
      continue;
    }

    switch (key) {
      case "layer":
        layer = value;
        break;
      case "capability id":
      case "capability ids":
      case "requirement id":
      case "requirement ids":
      case "component id":
      case "component ids":
      case "implementation id":
      case "implementation ids": {
        const fragments = splitMetadataList(value, linkTextPattern);
        for (const fragment of fragments) {
          const token = extractSymbolToken(fragment);
          if (token && isPotentialMdmdSymbol(token)) {
            identifiers.add(token);
          }
        }
        break;
      }
      case "exports": {
        for (const fragment of splitMetadataList(value, linkTextPattern)) {
          const cleaned = fragment.replace(/`/g, "").trim();
          if (!cleaned) {
            continue;
          }
          const token = extractSymbolToken(cleaned);
          if (token) {
            exports.add(token);
          }
        }
        break;
      }
      case "code path":
      case "code paths":
      case "codepath": {
        let hasLinks = false;
        let linkMatch: RegExpExecArray | null;
        while ((linkMatch = linkTargetPattern.exec(value)) !== null) {
          const reference = (linkMatch[1] ?? "").trim();
          if (reference) {
            codePaths.add(reference);
            hasLinks = true;
          }
        }
        if (!hasLinks) {
          codePaths.add(value);
        }
        linkTargetPattern.lastIndex = 0;
        break;
      }
      default:
        break;
    }
  }

  return {
    layer,
    identifiers: Array.from(identifiers),
    codePaths: Array.from(codePaths),
    exports: Array.from(exports)
  };
}

/**
 * Collects symbol names from specific section headings.
 */
export function collectSectionSymbols(content: string, sectionTitles: string[]): string[] {
  const lines = content.split(/\r?\n/);
  const headingPattern = /^(#{1,6})\s+(.*)$/;
  const targets = new Set(sectionTitles.map((entry) => entry.trim().toLowerCase()));
  const collected = new Set<string>();

  let inSection = false;
  let sectionLevel = 0;

  for (const line of lines) {
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const normalized = title.toLowerCase();

      if (targets.has(normalized)) {
        inSection = true;
        sectionLevel = level;
        continue;
      }

      if (inSection && level <= sectionLevel) {
        inSection = false;
      }

      if (inSection && level > sectionLevel) {
        const candidate = extractSymbolToken(title);
        if (candidate && isPotentialMdmdSymbol(candidate)) {
          collected.add(candidate);
        }
      }

      continue;
    }
  }

  return Array.from(collected);
}

/**
 * Returns the section titles to search for symbols based on the document layer.
 */
export function resolveSectionSymbolTargets(layer?: string): string[] {
  const targets = new Set<string>(["Public Symbols", "Exported Symbols"]);

  switch (layer) {
    case "1":
      targets.add("Capabilities");
      break;
    case "2":
      targets.add("Requirements");
      targets.add("Linked Components");
      targets.add("Linked Implementations");
      break;
    case "3":
      targets.add("Components");
      targets.add("Linked Implementations");
      break;
    case "4":
      targets.add("Linked Components");
      break;
    default:
      targets.add("Capabilities");
      targets.add("Requirements");
      targets.add("Components");
      targets.add("Linked Components");
      targets.add("Linked Implementations");
      break;
  }

  return Array.from(targets);
}

/**
 * Returns true if the candidate looks like a valid symbol identifier.
 */
export function looksLikeSymbolIdentifier(candidate: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(candidate);
}

/**
 * Returns true if the candidate could be an MDMD symbol (identifier or prefixed ID).
 */
export function isPotentialMdmdSymbol(candidate: string): boolean {
  if (!candidate) {
    return false;
  }

  if (looksLikeSymbolIdentifier(candidate)) {
    return true;
  }

  return /^[A-Z]{2,}[A-Z0-9_-]*-[A-Za-z0-9_-]+$/.test(candidate);
}

/**
 * Extracts the symbol token from a heading title.
 */
export function extractSymbolToken(title: string): string {
  const sanitized = stripSymbolWrappers(stripSymbolAnchor(title));
  const separators = [" – ", " — ", " - ", " —", " –", ":", "—", "–"];
  for (const separator of separators) {
    const index = sanitized.indexOf(separator);
    if (index !== -1) {
      return stripSymbolWrappers(sanitized.slice(0, index));
    }
  }
  const trimmed = sanitized.trim();
  const whitespaceIndex = trimmed.indexOf(" ");
  if (whitespaceIndex !== -1) {
    return stripSymbolWrappers(trimmed.slice(0, whitespaceIndex));
  }
  return stripSymbolWrappers(trimmed);
}

/**
 * Strips anchor markers like {#anchor} from a heading.
 */
export function stripSymbolAnchor(value: string): string {
  return value.replace(/\s*\{#[^}]+\}\s*$/, "").trim();
}

/**
 * Strips markdown formatting wrappers (backticks, bold, italic) from a value.
 */
export function stripSymbolWrappers(value: string): string {
  let candidate = value.trim();
  if (!candidate) {
    return candidate;
  }

  const wrappers: Array<[string, string]> = [
    ["`", "`"],
    ["**", "**"],
    ["_", "_"],
    ["*", "*"]
  ];

  let mutated = true;
  while (mutated && candidate.length > 0) {
    mutated = false;
    for (const [start, end] of wrappers) {
      if (
        candidate.startsWith(start) &&
        candidate.endsWith(end) &&
        candidate.length >= start.length + end.length
      ) {
        candidate = candidate.slice(start.length, candidate.length - end.length).trim();
        mutated = true;
      }
    }
  }

  return candidate;
}

/**
 * Normalizes a metadata key to lowercase with single spaces.
 */
export function normalizeMetadataKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits a metadata list value, handling markdown links.
 */
export function splitMetadataList(value: string, linkPattern: RegExp): string[] {
  let normalized = value;
  linkPattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(value)) !== null) {
    const replacement = (match[1] ?? "").trim();
    normalized = normalized.replace(match[0], replacement);
  }
  linkPattern.lastIndex = 0;
  normalized = normalized.replace(/`/g, "");

  return normalized
    .split(/[,;]/)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 0);
}

/**
 * Determines if an inline code snippet should be registered as a symbol reference.
 */
export function shouldRegisterInlineCode(symbol: string, details?: MdmdDocumentDetails): boolean {
  if (!symbol) {
    return false;
  }

  if (details) {
    if (
      details.exports.includes(symbol) ||
      details.sectionSymbols.includes(symbol) ||
      details.identifiers.includes(symbol)
    ) {
      return true;
    }
  }

  if (symbol.includes("-") && isPotentialMdmdSymbol(symbol)) {
    return true;
  }

  return false;
}
