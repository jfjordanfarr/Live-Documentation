/**
 * JSON configuration file adapter for Live Documentation.
 *
 * @remarks
 * Extracts dependencies from JSON files by detecting string values that
 * reference other workspace files. Uses a file index to resolve references
 * precisely without filesystem crawling.
 *
 * Supported patterns:
 * - Relative paths: `"./src/utils.ts"`, `"../config/settings.json"`
 * - Workspace-relative paths: `"packages/shared/src/index.ts"`
 * - Bare filenames: `"expected.json"` (resolved relative to JSON file's directory)
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Patterns that indicate a string is NOT a file path reference.
 */
const SKIP_PATTERNS = [
  /^https?:\/\//i,           // URLs
  /^git\+/i,                 // Git URLs
  /^file:\/\//i,             // File URLs (could support later)
  /^[a-z]+:\/\//i,           // Other schemes
  /^\^[\d.]/,                // Version ranges (^1.0.0)
  /^~[\d.]/,                 // Version ranges (~1.0.0)
  /^>=?[\d.]/,               // Version ranges (>=1.0.0)
  /^<=?[\d.]/,               // Version ranges (<=1.0.0)
  /^\d+\.\d+/,               // Plain versions (1.0.0)
  /^@[a-z0-9-]+\/[a-z0-9-]+$/i, // Scoped npm packages (@scope/name)
  /\*\*/,                    // Glob patterns with **
  /\*/,                      // Glob patterns with *
  /^\s*$/,                   // Empty/whitespace
  /^#/,                      // Fragment references
];

/**
 * Determines whether a string value looks like it could be a file path.
 */
function looksLikeFilePath(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  // Skip values matching known non-path patterns
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(value)) {
      return false;
    }
  }

  // Must contain path-like characters or be a plausible filename
  const hasPathSeparator = value.includes("/") || value.includes("\\");
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(value);
  const startsWithDot = value.startsWith("./") || value.startsWith("../");

  return hasPathSeparator || hasExtension || startsWithDot;
}

// ============================================================================
// String Value Extraction
// ============================================================================

/**
 * Recursively extracts all string values from a JSON structure.
 */
function extractStringValues(obj: unknown, values: Set<string>): void {
  if (typeof obj === "string") {
    values.add(obj);
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractStringValues(item, values);
    }
    return;
  }

  if (obj !== null && typeof obj === "object") {
    for (const value of Object.values(obj)) {
      extractStringValues(value, values);
    }
  }
}

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Attempts to resolve a path-like string to a workspace file.
 *
 * @param candidate - The string value that might be a path reference.
 * @param jsonDir - Directory containing the JSON file (for relative resolution).
 * @param workspaceRoot - Workspace root directory.
 * @param fileIndex - Set of known workspace-relative file paths.
 *
 * @returns The resolved workspace-relative path, or undefined if not found.
 */
function resolveToWorkspaceFile(
  candidate: string,
  jsonDir: string,
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex
): string | undefined {
  // Normalize the candidate path
  const normalized = candidate.replace(/\\/g, "/");

  // Strategy 1: Direct match against file index (workspace-relative paths)
  if (fileIndex.has(normalized)) {
    return normalized;
  }

  // Strategy 2: Resolve relative to the JSON file's directory
  // (for paths starting with ./ or ../, or bare filenames)
  if (normalized.startsWith("./") || normalized.startsWith("../") || !normalized.includes("/")) {
    const absoluteResolved = path.resolve(jsonDir, normalized);
    const workspaceRelative = normalizeWorkspacePath(
      path.relative(workspaceRoot, absoluteResolved)
    );

    if (fileIndex.has(workspaceRelative)) {
      return workspaceRelative;
    }
  }

  // Strategy 3: Try as workspace-root-relative (without leading ./)
  const rootRelative = normalizeWorkspacePath(normalized);
  if (fileIndex.has(rootRelative)) {
    return rootRelative;
  }

  // Strategy 4: Try resolving as JSON-dir-relative even for paths with /
  // (handles cases like "typescript/basic/expected.json" in fixtures.manifest.json)
  {
    const absoluteResolved = path.resolve(jsonDir, normalized);
    const workspaceRelative = normalizeWorkspacePath(
      path.relative(workspaceRoot, absoluteResolved)
    );

    if (fileIndex.has(workspaceRelative)) {
      return workspaceRelative;
    }
  }

  return undefined;
}

// ============================================================================
// JSON Adapter
// ============================================================================

/** Language adapter for JSON and JSONC files. Extracts top-level keys as public symbols and detects file-path references in string values. */
export const jsonAdapter: LanguageAdapter = {
  id: "json-config",
  extensions: [".json"],

  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    // JSON adapter requires the file index to resolve references
    if (!fileIndex || fileIndex.size === 0) {
      return {
        symbols: [],
        dependencies: []
      };
    }

    let content: string;
    try {
      content = await fs.readFile(absolutePath, "utf8");
    } catch {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Invalid JSON - skip silently
      return {
        symbols: [],
        dependencies: []
      };
    }

    const jsonDir = path.dirname(absolutePath);
    const stringValues = new Set<string>();
    extractStringValues(parsed, stringValues);

    const dependencies: DependencyEntry[] = [];
    const seenTargets = new Set<string>();

    for (const candidate of stringValues) {
      if (!looksLikeFilePath(candidate)) {
        continue;
      }

      const resolved = resolveToWorkspaceFile(candidate, jsonDir, workspaceRoot, fileIndex);
      if (resolved && !seenTargets.has(resolved)) {
        seenTargets.add(resolved);
        dependencies.push({
          specifier: candidate,
          resolvedPath: resolved,
          kind: "import", // JSON references are conceptually similar to imports
          symbols: []
        });
      }
    }

    // Sort dependencies by resolved path for deterministic output
    dependencies.sort((a, b) => (a.resolvedPath ?? "").localeCompare(b.resolvedPath ?? ""));

    return {
      symbols: [], // JSON files don't export symbols in the traditional sense
      dependencies
    };
  }
};
