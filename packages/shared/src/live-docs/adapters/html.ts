/**
 * HTML language adapter for Live Documentation.
 *
 * @remarks
 * Extracts dependencies from HTML files by parsing standard HTML elements
 * that reference external resources: `<link>`, `<script>`, `<img>`, `<source>`,
 * `<video>`, `<audio>`, etc.
 *
 * This enables HTML assets to show connectivity to their CSS, JS, image,
 * font, and media dependencies in the Live Documentation Explorer.
 *
 * @module
 */

import { promises as fs, statSync } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import type { LanguageAdapter } from "./index";

// ============================================================================
// Patterns
// ============================================================================

/**
 * Matches HTML attributes that reference external resources.
 *
 * @remarks
 * Captures: src, href, srcset, data-src, data-href, poster
 * Handles both double and single quoted values.
 */
const HTML_RESOURCE_ATTR =
  /\b(?<attr>srcset|src|href|data-src|data-href|poster)\s*=\s*(?:"(?<dq>[^"]+)"|'(?<sq>[^']+)')/gi;

// ============================================================================
// URL Filtering
// ============================================================================

const EXTERNAL_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const DATA_URI = /^data:/i;
const PROTOCOL_RELATIVE = /^\/\//;

/**
 * Determines whether a URL should be skipped (external, data URI, etc.).
 */
function shouldSkipUrl(url: string): boolean {
  if (!url || url.trim().length === 0) {
    return true;
  }
  if (EXTERNAL_SCHEME.test(url) && !url.startsWith("file:")) {
    return true;
  }
  if (PROTOCOL_RELATIVE.test(url)) {
    return true;
  }
  if (DATA_URI.test(url)) {
    return true;
  }
  if (url.startsWith("#")) {
    return true;
  }
  return false;
}

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Strips query string and fragment from a URL path.
 */
function stripQueryAndFragment(url: string): string {
  let value = url;
  const hashIndex = value.indexOf("#");
  if (hashIndex !== -1) {
    value = value.slice(0, hashIndex);
  }
  const queryIndex = value.indexOf("?");
  if (queryIndex !== -1) {
    value = value.slice(0, queryIndex);
  }
  return value;
}

function fileExistsSync(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Common web document root folder names.
 *
 * @remarks
 * Web projects often serve static assets from a dedicated folder (e.g., `public/`,
 * `wwwroot/`, `static/`). When resolving server-root-relative paths, we check
 * these folders at each ancestor level in addition to the ancestor itself.
 */
const COMMON_DOC_ROOTS = ["public", "wwwroot", "static", "dist", "assets", "web", "client"];

/**
 * Finds the effective document root for server-root-relative paths.
 *
 * @remarks
 * When an HTML file references `/styles/site.css`, the leading `/` refers to the
 * web server's document root, not necessarily the workspace root. This function
 * searches upward from the source file's directory to find an ancestor directory
 * (or a common static folder within an ancestor) that contains the referenced path.
 *
 * For example, if `styles/site.css` references `/images/bg.png` and the file is at
 * `workspace/public/images/bg.png`:
 * - Checks: `styles/images/bg.png` — no
 * - Checks: `styles/public/images/bg.png` — no
 * - Checks: `workspace/images/bg.png` — no
 * - Checks: `workspace/public/images/bg.png` — ✓
 *
 * @param sourceDir - Directory containing the source file
 * @param relativePath - The path without the leading `/` (e.g., "images/bg.png")
 * @param workspaceRoot - Workspace root (stop point for upward search)
 *
 * @returns The document root path if found, otherwise undefined
 */
function findDocumentRoot(
  sourceDir: string,
  relativePath: string,
  workspaceRoot: string
): string | undefined {
  const normalizedWorkspaceRoot = path.resolve(workspaceRoot);
  let current = path.resolve(sourceDir);

  // Walk up from sourceDir to workspaceRoot
  while (current.length >= normalizedWorkspaceRoot.length) {
    // Check the ancestor directly
    const directCandidate = path.join(current, relativePath);
    if (fileExistsSync(directCandidate)) {
      return current;
    }

    // Check common document root folders within this ancestor
    for (const docRoot of COMMON_DOC_ROOTS) {
      const docRootCandidate = path.join(current, docRoot, relativePath);
      if (fileExistsSync(docRootCandidate)) {
        return path.join(current, docRoot);
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // Reached filesystem root
      break;
    }
    current = parent;
  }

  return undefined;
}

/**
 * Resolves a resource path relative to the HTML file or workspace root.
 *
 * @remarks
 * For server-root-relative paths (starting with `/`), this function first tries
 * the workspace root, then searches upward from the source file to find an
 * ancestor directory that serves as the effective document root.
 *
 * @param rawPath - The raw path from the HTML attribute
 * @param sourceDir - Directory containing the HTML file
 * @param workspaceRoot - Workspace root for absolute paths
 *
 * @returns Workspace-relative path if the file exists, otherwise the normalized specifier
 */
function resolveResourcePath(
  rawPath: string,
  sourceDir: string,
  workspaceRoot: string
): { specifier: string; resolvedPath: string | undefined } {
  const cleaned = stripQueryAndFragment(rawPath.trim());
  const normalised = cleaned.replace(/\\/g, "/");

  let candidate: string;
  let specifier: string;

  if (normalised.startsWith("/")) {
    // Server-root-relative path — try workspace root first
    const relativePath = normalised.slice(1);
    specifier = relativePath;
    candidate = path.join(workspaceRoot, relativePath);

    // If not found at workspace root, search for document root
    if (!fileExistsSync(candidate)) {
      const docRoot = findDocumentRoot(sourceDir, relativePath, workspaceRoot);
      if (docRoot) {
        candidate = path.join(docRoot, relativePath);
      }
    }
  } else {
    // Relative path from source file
    candidate = path.join(sourceDir, normalised);
    specifier = normalised;
  }

  // Check if file exists
  const exists = fileExistsSync(candidate);
  const resolvedPath = exists
    ? normalizeWorkspacePath(path.relative(workspaceRoot, candidate))
    : undefined;

  return {
    specifier: resolvedPath ?? specifier,
    resolvedPath
  };
}

// ============================================================================
// Dependency Extraction
// ============================================================================

/**
 * Extracts srcset entries (handles "url 1x, url 2x" format).
 */
function parseSrcset(srcset: string): string[] {
  return srcset
    .split(",")
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter((url) => url && url.length > 0);
}

/**
 * Extracts all resource dependencies from HTML content.
 */
function extractHtmlDependencies(params: {
  content: string;
  absolutePath: string;
  workspaceRoot: string;
}): DependencyEntry[] {
  const { content, absolutePath, workspaceRoot } = params;
  const sourceDir = path.dirname(absolutePath);
  const dependencies: DependencyEntry[] = [];
  const seen = new Set<string>();

  // Helper to add a dependency if not already seen
  const addDependency = (rawPath: string, _kind: "stylesheet" | "script" | "asset") => {
    if (shouldSkipUrl(rawPath)) {
      return;
    }

    const { specifier, resolvedPath } = resolveResourcePath(rawPath, sourceDir, workspaceRoot);

    // Use resolved path for deduplication if available, otherwise specifier
    const key = resolvedPath ?? specifier;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    dependencies.push({
      specifier,
      resolvedPath,
      symbols: [],
      kind: "import"
    });
  };

  // Extract all resource attributes
  let match: RegExpExecArray | null;

  // Reset regex state
  HTML_RESOURCE_ATTR.lastIndex = 0;

  while ((match = HTML_RESOURCE_ATTR.exec(content)) !== null) {
    const attr = match.groups?.attr?.toLowerCase();
    const value = match.groups?.dq ?? match.groups?.sq;

    if (!value) {
      continue;
    }

    if (attr === "srcset") {
      // Handle srcset with multiple URLs
      for (const url of parseSrcset(value)) {
        addDependency(url, "asset");
      }
    } else {
      addDependency(value, "asset");
    }
  }

  // Sort dependencies by specifier for consistent output
  dependencies.sort((a, b) => a.specifier.localeCompare(b.specifier));

  return dependencies;
}

// ============================================================================
// Adapter Export
// ============================================================================

export const htmlAdapter: LanguageAdapter = {
  id: "html",
  extensions: [".html", ".htm"],

  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");

    const dependencies = extractHtmlDependencies({
      content,
      absolutePath,
      workspaceRoot
    });

    return {
      symbols: [], // HTML files don't export symbols in the programmatic sense
      dependencies
    };
  }
};
