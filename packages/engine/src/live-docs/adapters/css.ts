/**
 * CSS language adapter for Live Documentation.
 *
 * @remarks
 * Extracts dependencies from CSS files by parsing:
 * - `@import` rules for nested CSS dependencies
 * - `url()` references for fonts, images, and other assets
 * - `@font-face src` declarations
 *
 * This enables CSS assets to show connectivity to their font, image,
 * and nested stylesheet dependencies in the Live Documentation Explorer.
 *
 * @module
 */

import { compareText } from "../../tooling/compareText";
import path from "../../tooling/enginePath";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText } from "../../tooling/sourceText";
import { type ListedFiles, pathKind } from "../../tooling/workspaceProbes";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import type { LanguageAdapter } from "./index";
import { inSpaces } from "./spaces";

// ============================================================================
// Patterns
// ============================================================================

/**
 * Matches CSS `@import` rules.
 *
 * @remarks
 * Handles both `@import url("...")` and `@import "..."` syntax.
 */
const CSS_IMPORT_PATTERN = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?[^;]*;/gi;

/**
 * Matches CSS `url()` references.
 *
 * @remarks
 * Handles double quotes, single quotes, and bare (unquoted) URLs.
 */
const CSS_URL_PATTERN = /url\(\s*(?:"([^"()]+)"|'([^'()]+)'|([^"'()\s][^\s)]*?))\s*\)/gi;

/**
 * The style sheet with every comment written over in spaces, its line breaks kept, so that positions keep: a comment
 * is `/*` to the first `*\/` after it (CSS Syntax, "Consume comments"), and none starts inside a string, which runs to
 * its closing quote past any escaped character or to the line's end, nor inside an unquoted `url(…)`, which runs to its
 * `)`. Outside a string a backslash escapes the character after it ("Consume an escaped code point"), so `.a\"b` opens
 * no string. `//` is no comment in CSS. A comment left open runs to the end. The guard of 2026-11-21
 * (`commentGuard.test.ts`): until then a commented-out `@import` or `url()` was read as real.
 */
export function withoutCssComments(text: string): string {
  let result = "";
  let at = 0;
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (char === "/" && text[index + 1] === "*") {
      const close = text.indexOf("*/", index + 2);
      const until = close === -1 ? text.length : close + 2;
      result += text.slice(at, index) + inSpaces(text.slice(index, until));
      at = index = until;
    } else if (char === "\\") {
      index += 2;
    } else if (char === "\"" || char === "'") {
      index += 1;
      while (index < text.length && text[index] !== char && text[index] !== "\n") index += text[index] === "\\" ? 2 : 1;
      index += 1;
    } else if (UNQUOTED_URL.test(text.slice(index, index + 256)) && !/[\w-]/u.test(text[index - 1] ?? "")) {
      const close = text.indexOf(")", index);
      index = close === -1 ? text.length : close + 1;
    } else {
      index += 1;
    }
  }
  return result + text.slice(at);
}

/** The opening of a `url(` function whose address is not quoted, in any case. */
const UNQUOTED_URL = /^url\(\s*[^\s"')]/iu;

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

function fileExistsSync(filePath: string, files: ListedFiles | undefined): boolean {
  return pathKind(filePath, files) === "file";
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
 * When a CSS file references `/images/background.png`, the leading `/` refers to the
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
  workspaceRoot: string,
  files: ListedFiles | undefined
): string | undefined {
  const normalizedWorkspaceRoot = path.resolve(workspaceRoot);
  let current = path.resolve(sourceDir);

  // Walk up from sourceDir to workspaceRoot
  while (current.length >= normalizedWorkspaceRoot.length) {
    // Check the ancestor directly
    const directCandidate = path.join(current, relativePath);
    if (fileExistsSync(directCandidate, files)) {
      return current;
    }

    // Check common document root folders within this ancestor
    for (const docRoot of COMMON_DOC_ROOTS) {
      const docRootCandidate = path.join(current, docRoot, relativePath);
      if (fileExistsSync(docRootCandidate, files)) {
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
 * Resolves a resource path relative to the CSS file or workspace root.
 *
 * @remarks
 * For server-root-relative paths (starting with `/`), this function first tries
 * the workspace root, then searches upward from the source file to find an
 * ancestor directory that serves as the effective document root.
 *
 * @param rawPath - The raw path from the CSS reference
 * @param sourceDir - Directory containing the CSS file
 * @param workspaceRoot - Workspace root for absolute paths
 *
 * @returns Workspace-relative path if the file exists, otherwise the normalized specifier
 */
function resolveResourcePath(
  rawPath: string,
  sourceDir: string,
  workspaceRoot: string,
  files: ListedFiles | undefined
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
    if (!fileExistsSync(candidate, files)) {
      const docRoot = findDocumentRoot(sourceDir, relativePath, workspaceRoot, files);
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
  const exists = fileExistsSync(candidate, files);
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
 * Extracts all resource dependencies from CSS content.
 */
function extractCssDependencies(params: {
  content: string;
  absolutePath: string;
  workspaceRoot: string;
  files: ListedFiles | undefined;
}): DependencyEntry[] {
  const { content, absolutePath, workspaceRoot, files } = params;
  const sourceDir = path.dirname(absolutePath);
  const dependencies: DependencyEntry[] = [];
  const seen = new Set<string>();

  // Helper to add a dependency if not already seen
  const addDependency = (rawPath: string) => {
    if (shouldSkipUrl(rawPath)) {
      return;
    }

    const { specifier, resolvedPath } = resolveResourcePath(rawPath, sourceDir, workspaceRoot, files);

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

  let match: RegExpExecArray | null;

  // Extract @import rules
  CSS_IMPORT_PATTERN.lastIndex = 0;
  while ((match = CSS_IMPORT_PATTERN.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath) {
      addDependency(importPath);
    }
  }

  // Extract url() references
  CSS_URL_PATTERN.lastIndex = 0;
  while ((match = CSS_URL_PATTERN.exec(content)) !== null) {
    // Capture groups: [1] = double-quoted, [2] = single-quoted, [3] = bare
    const urlPath = match[1] ?? match[2] ?? match[3];
    if (urlPath) {
      addDependency(urlPath);
    }
  }

  // Sort dependencies by specifier for consistent output
  dependencies.sort((a, b) => compareText(a.specifier, b.specifier));

  return dependencies;
}

// ============================================================================
// Adapter Export
// ============================================================================

/** Language adapter for CSS (`.css`). Extracts `@import` and `url()` dependencies, none inside a comment ({@link withoutCssComments}). */
export const cssAdapter: LanguageAdapter = {
  id: "css",
  extensions: [".css"],

  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const content = await readSourceText(absolutePath, fileIndex);

    const dependencies = extractCssDependencies({
      content: withoutCssComments(content),
      absolutePath,
      workspaceRoot,
      files: fileIndex
    });

    return {
      symbols: [], // CSS files don't export symbols in the programmatic sense
      dependencies
    };
  }
};
