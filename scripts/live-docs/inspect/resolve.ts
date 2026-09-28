/**
 * What the inspect CLI accepts: a code path, a doc path, or either with a
 * `#Symbol` suffix, resolved against the graph.
 *
 * @module
 */

import path from "node:path";

import type { LiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { symbolName } from "@live-documentation/engine/live-docs/document";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { symbolMatchesAnchor, type SymbolReference } from "@live-documentation/engine/live-docs/pathfind";
import { normalizeWorkspacePath } from "@live-documentation/engine/tooling/pathUtils";

/**
 * Resolves an artifact identifier (code path, doc path, or relative path) to a
 * canonical code path in the graph.
 *
 * @param input - The user-provided identifier
 * @param workspaceRoot - Absolute path to workspace root
 * @param config - Live Documentation configuration
 * @param graph - The Live Doc graph
 * @returns The resolved code path, or undefined if not found
 */
export function resolveArtifactIdentifier(
  input: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  graph: LiveDocGraph
): string | undefined {
  const normalizedInput = normalizeInputIdentifier(input, workspaceRoot);
  const candidates = [normalizedInput, stripLiveDocDecorations(normalizedInput, config)];
  for (const candidate of candidates) {
    if (graph.files[candidate]) {
      return candidate;
    }
    const byDocPath = Object.values(graph.files).find((file) => file.docPath === candidate);
    if (byDocPath) {
      return byDocPath.codePath;
    }
  }
  return undefined;
}

/**
 * Normalizes a user-provided identifier to a workspace-relative path.
 *
 * @param input - The raw user input
 * @param workspaceRoot - Absolute path to workspace root
 * @returns Normalized workspace-relative path
 */
export function normalizeInputIdentifier(input: string, workspaceRoot: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  const withoutQuotes = trimmed.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  const normalizedSeparators = withoutQuotes.replace(/\\/g, "/");

  const candidate = path.isAbsolute(normalizedSeparators)
    ? path.relative(workspaceRoot, normalizedSeparators)
    : normalizedSeparators;

  const normalized = normalizeWorkspacePath(candidate);
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

/**
 * Strips Live Doc path decorations (root, baseLayer, extension) from a path
 * to recover the original code path.
 *
 * @param value - The potentially decorated path
 * @param config - Live Documentation configuration
 * @returns The stripped path
 */
export function stripLiveDocDecorations(value: string, config: LiveDocumentationConfig): string {
  let candidate = value;

  const docRoot = normalizeWorkspacePath(config.root);
  const docBase = normalizeWorkspacePath(path.join(config.root, config.baseLayer));
  const baseOnly = normalizeWorkspacePath(config.baseLayer);

  if (candidate.startsWith(`${docBase}/`)) {
    candidate = candidate.slice(docBase.length + 1);
  }

  if (candidate.startsWith(`${docRoot}/`)) {
    candidate = candidate.slice(docRoot.length + 1);
  }

  if (candidate.startsWith(`${baseOnly}/`)) {
    candidate = candidate.slice(baseOnly.length + 1);
  }

  if (candidate.endsWith(config.extension)) {
    candidate = candidate.slice(0, -config.extension.length);
  }

  return candidate;
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
  return parseSymbolReference(input).symbol !== undefined;
}

/**
 * Resolves a symbol reference to a validated SymbolReference.
 * Returns undefined if the code path cannot be resolved.
 *
 * Note: Even if the symbol doesn't exist in the file's symbols, the reference is still
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

/**
 * Resolves an anchor slug to the name of the symbol that carries it in the
 * file's doc: by its slug first, then by name.
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

  const file = graph.files[codePath];
  if (!file) {
    return anchor;
  }

  const bySlug = file.symbols.find((symbol) => symbol.slug === anchor);
  if (bySlug) {
    return symbolName(bySlug);
  }
  const byName = file.symbols.map(symbolName).find((name) => symbolMatchesAnchor(name, anchor));
  return byName ?? anchor;
}
