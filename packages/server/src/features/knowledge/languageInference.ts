import * as path from "node:path";
import ts from "typescript";

import { ArtifactSeed } from "@live-documentation/shared";

export const DEFAULT_CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cts",
  ".mts",
  ".cs",
  ".c",
  ".h"
]);

export const DEFAULT_DOC_EXTENSIONS = new Set([".md", ".mdx", ".markdown", ".txt", ".yaml", ".yml"]);

export const MODULE_RESOLUTION_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json"
];

/**
 * Infers the programming language from a code file's extension.
 */
export function inferLanguage(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".ts":
    case ".tsx":
    case ".mts":
    case ".cts":
      return "typescript";
    case ".js":
    case ".jsx":
    case ".mjs":
      return "javascript";
    case ".cs":
      return "csharp";
    case ".c":
    case ".h":
      return "c";
    default:
      return undefined;
  }
}

/**
 * Infers the document language from a documentation file's extension.
 */
export function inferDocLanguage(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".md":
    case ".mdx":
    case ".markdown":
      return "markdown";
    case ".yml":
    case ".yaml":
      return "yaml";
    case ".txt":
      return "text";
    default:
      return undefined;
  }
}

/**
 * Infers the TypeScript ScriptKind from a file extension.
 */
export function inferScriptKind(extension: string): ts.ScriptKind {
  switch (extension) {
    case ".ts":
    case ".mts":
    case ".cts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".mjs":
    case ".js":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.Unknown;
  }
}

/**
 * Returns true if a path looks like it belongs to a documentation folder.
 */
export function looksLikeDocsPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.includes("/docs/") ||
    normalized.includes("/specs/") ||
    normalized.includes("/templates/") ||
    normalized.includes("/config/") ||
    normalized.includes("/.mdmd/") ||
    normalized.includes("/.live-documentation/") ||
    normalized.endsWith("readme.md")
  );
}

/**
 * Infers the artifact layer from MDMD metadata or file path conventions.
 */
export function inferDocumentLayer(
  metadataLayer: string | undefined,
  filePath: string
): ArtifactSeed["layer"] {
  if (metadataLayer) {
    const normalized = metadataLayer.trim().toLowerCase();
    if (normalized === "1" || normalized === "layer 1" || normalized === "vision") {
      return "vision";
    }
    if (normalized === "2" || normalized === "layer 2" || normalized === "requirements") {
      return "requirements";
    }
    if (normalized === "3" || normalized === "layer 3" || normalized === "architecture") {
      return "architecture";
    }
    if (normalized === "4" || normalized === "layer 4" || normalized === "implementation") {
      return "implementation";
    }
  }

  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();
  if (normalizedPath.includes("/.mdmd/layer-1/")) {
    return "vision";
  }
  if (normalizedPath.includes("/.mdmd/layer-2/")) {
    return "requirements";
  }
  if (normalizedPath.includes("/.mdmd/layer-3/")) {
    return "architecture";
  }
  if (normalizedPath.includes("/.mdmd/layer-4/")) {
    return "implementation";
  }
  if (normalizedPath.includes("/.live-documentation/system/")) {
    return "architecture";
  }
  if (normalizedPath.includes("/.live-documentation/source/")) {
    return "implementation";
  }
  return "requirements";
}
