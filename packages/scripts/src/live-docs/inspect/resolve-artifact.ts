/**
 * Artifact identifier resolution utilities.
 * 
 * Handles resolving user-provided paths (code paths, doc paths, relative paths)
 * to canonical code path identifiers in the Live Doc graph.
 * 
 * @module inspect/resolve-artifact
 */

import path from "node:path";

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";
import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

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

  if (graph.nodes.has(normalizedInput)) {
    return normalizedInput;
  }

  if (graph.docToCode.has(normalizedInput)) {
    return graph.docToCode.get(normalizedInput);
  }

  const stripped = stripLiveDocDecorations(normalizedInput, config);
  if (graph.nodes.has(stripped)) {
    return stripped;
  }

  if (graph.docToCode.has(stripped)) {
    return graph.docToCode.get(stripped);
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
