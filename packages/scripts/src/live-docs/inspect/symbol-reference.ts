/**
 * Symbol reference parsing and resolution utilities.
 * 
 * Handles the parsing of symbol references (e.g., "file.ts#SymbolName") and
 * provides anchor normalization for matching symbols to Live Doc anchors.
 * 
 * @module inspect/symbol-reference
 */

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";
import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";

import { resolveArtifactIdentifier } from "./resolve-artifact";
import type { SymbolReference } from "./types";

/**
 * Converts a symbol name (e.g., "GraphStore") to an anchor slug (e.g., "symbol-graphstore").
 * This matches the format used in Live Doc markdown links.
 */
export function symbolToAnchor(symbol: string): string {
  return `symbol-${symbol.toLowerCase()}`;
}

/**
 * Converts an anchor slug (e.g., "symbol-graphstore") back to a normalized form for comparison.
 * Returns the lowercase version without the prefix.
 */
export function normalizeAnchor(anchor: string): string {
  const prefix = "symbol-";
  if (anchor.startsWith(prefix)) {
    return anchor.slice(prefix.length).toLowerCase();
  }
  return anchor.toLowerCase();
}

/**
 * Checks if a symbol name matches an anchor slug.
 * Handles the symbol-prefix format used in Live Doc anchors.
 */
export function symbolMatchesAnchor(symbol: string, anchor: string): boolean {
  // Direct match (e.g., both are symbol names)
  if (symbol === anchor) {
    return true;
  }
  // Compare normalized forms
  return symbol.toLowerCase() === normalizeAnchor(anchor);
}

/**
 * Attempts to resolve an anchor slug to a proper symbol name by looking up
 * the target node's publicSymbols array.
 * Returns the matched symbol name or the original anchor if no match found.
 */
export function resolveAnchorToSymbolName(
  anchor: string | undefined,
  codePath: string,
  graph: LiveDocGraph
): string | undefined {
  if (!anchor) {
    return undefined;
  }
  
  const node = graph.nodes.get(codePath);
  if (!node) {
    return anchor;
  }
  
  // Try to find a matching symbol in publicSymbols
  for (const symbol of node.publicSymbols) {
    if (symbolMatchesAnchor(symbol, anchor)) {
      return symbol;
    }
  }
  
  // No match found, return as-is (might be a valid symbol name already)
  return anchor;
}

/**
 * Parses an input string that may contain a symbol reference.
 * Supported formats:
 * - `path/to/file.ts` → { path: "path/to/file.ts", symbol: undefined }
 * - `path/to/file.ts#SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" }
 * - `path/to/file.ts:SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" } (Windows-safe alt)
 */
export function parseSymbolReference(input: string): { path: string; symbol?: string } {
  // Try hash separator first (preferred, markdown-compatible)
  const hashIndex = input.indexOf("#");
  if (hashIndex !== -1) {
    return {
      path: input.slice(0, hashIndex),
      symbol: input.slice(hashIndex + 1) || undefined
    };
  }

  // Fallback: colon separator, but only after the last path separator and not part of a Windows drive
  // e.g., "C:/path/file.ts:Symbol" should parse as file="C:/path/file.ts", symbol="Symbol"
  const lastSlash = Math.max(input.lastIndexOf("/"), input.lastIndexOf("\\"));
  const colonAfterPath = input.indexOf(":", lastSlash + 1);
  
  // Skip if it looks like a Windows drive letter (e.g., "C:")
  if (colonAfterPath !== -1 && colonAfterPath !== 1) {
    return {
      path: input.slice(0, colonAfterPath),
      symbol: input.slice(colonAfterPath + 1) || undefined
    };
  }

  return { path: input, symbol: undefined };
}

/**
 * Checks if an input string contains a symbol reference.
 */
export function hasSymbolReference(input: string): boolean {
  const { symbol } = parseSymbolReference(input);
  return symbol !== undefined;
}

/**
 * Resolves a symbol reference to a validated SymbolReference.
 * Returns undefined if the code path cannot be resolved.
 * 
 * Note: Even if the symbol doesn't exist in publicSymbols, the reference is still
 * returned to allow partial matches during path search.
 */
export function resolveSymbolReference(
  input: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  graph: LiveDocGraph
): SymbolReference | undefined {
  const { path: rawPath, symbol } = parseSymbolReference(input);
  
  const codePath = resolveArtifactIdentifier(rawPath, workspaceRoot, config, graph);
  if (!codePath) {
    return undefined;
  }

  return { codePath, symbol };
}
