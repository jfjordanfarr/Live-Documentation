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
 * Matches HTML attributes that reference external resources.
 *
 * @remarks
 * Captures: src, href, srcset, data-src, data-href, poster
 * Handles both double and single quoted values.
 */
const HTML_RESOURCE_ATTR =
  /\b(?<attr>srcset|src|href|data-src|data-href|poster)\s*=\s*(?:"(?<dq>[^"]+)"|'(?<sq>[^']+)')/gi;

// ============================================================================
// Comments
// ============================================================================

/** The elements whose content HTML reads as text, in which `<!--` opens no comment: raw text and escapable raw text. */
const TEXT_ELEMENTS: ReadonlySet<string> = new Set(["script", "style", "textarea", "title"]);

/** A start tag's opening and its name. */
const START_TAG = /^<([A-Za-z][^\s/>]*)/u;

/** The first end of a comment after `from`, `-->` or `--!>` (WHATWG HTML, "comment end bang state"), as the index just past it; the text's end when there is none. */
function commentEnd(text: string, from: number): number {
  const ends = [text.indexOf("-->", from), text.indexOf("--!>", from)].filter((at) => at !== -1);
  if (ends.length === 0) return text.length;
  const at = Math.min(...ends);
  return at + (text.startsWith("-->", at) ? 3 : 4);
}

/**
 * The markup with what HTML makes no element of written over in spaces ({@link inSpaces}), so that positions keep:
 * each comment, as HTML parses one, from `<!--` to the first `-->` or `--!>` after it, or at once when it is `<!-->`
 * or `<!--->`, so that the content a downlevel-revealed conditional comment (`<!--[if !IE]><!--> … <!--<![endif]-->`)
 * leaves outside every comment is kept, and a comment left open runs to the end; and the text of each `<script>`,
 * `<style>`, `<textarea>` and `<title>`, which HTML reads as text to that element's end tag, so that an `id=`, `src=`
 * or `href=` a script's code or comment writes is no element's (mojoPortal's ckeditor samples write `// Replace the
 * <textarea id="editor"> …`; a script's own references are the DOM heuristic's, read from its syntax tree). `<!--`
 * opens a comment only where a tag may start: never inside a tag's quoted attribute value. No browser runs a script,
 * loads a style sheet or makes an element that a comment holds, so the readers of markup read none (the comment guard
 * of 2026-11-21, `commentGuard.test.ts`). A `<noscript>`'s text, raw to a browser that runs scripts, is read as markup.
 */
export function withoutHtmlComments(text: string): string {
  let result = "";
  let at = 0;
  let index = 0;
  for (;;) {
    const open = text.indexOf("<", index);
    if (open === -1) return result + text.slice(at);
    if (text.startsWith("<!--", open)) {
      const rest = text.slice(open + 4, open + 6);
      const until = rest.startsWith(">") ? open + 5 : rest === "->" ? open + 6 : commentEnd(text, open + 4);
      result += text.slice(at, open) + inSpaces(text.slice(open, until));
      at = index = until;
      continue;
    }
    const tag = START_TAG.exec(text.slice(open, open + 64));
    if (!tag) {
      index = open + 1;
      continue;
    }
    index = endOfTag(text, open + 1);
    const name = tag[1].toLowerCase();
    // A tag closed by `/>` holds no text, as ASP.NET's page parser reads `<title />` in a page's head (DNN's
    // `Default.aspx`); a browser reading such a tag in an `.html` file would take the rest for its text, which no page
    // measured writes.
    if (TEXT_ELEMENTS.has(name) && text[index - 2] !== "/") {
      const end = new RegExp(`</${name}[\\s/>]`, "giu");
      end.lastIndex = index;
      const until = end.exec(text)?.index ?? text.length;
      result += text.slice(at, index) + inSpaces(text.slice(index, until));
      at = index = until;
    }
  }
}

/**
 * The index just past a tag whose name starts at `start`, its quoted attribute values passed over, a quote opening a
 * value only where one may start, after `=`; the text's end when it never closes.
 */
function endOfTag(text: string, start: number): number {
  let quote: string | undefined;
  let afterEquals = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = undefined;
    } else if ((char === "\"" || char === "'") && afterEquals) {
      quote = char;
      afterEquals = false;
    } else if (char === ">") {
      return index + 1;
    } else if (char === "=") {
      afterEquals = true;
    } else if (!/\s/u.test(char)) {
      afterEquals = false;
    }
  }
  return text.length;
}

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
  workspaceRoot: string,
  files: ListedFiles | undefined
): { specifier: string; resolvedPath: string | undefined } {
  const cleaned = stripQueryAndFragment(rawPath.trim());
  const normalised = cleaned.replace(/\\/g, "/");

  let candidate: string;

  if (normalised.startsWith("/")) {
    // Server-root-relative path — try workspace root first
    const relativePath = normalised.slice(1);
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
  }

  // Check if file exists
  const exists = fileExistsSync(candidate, files);
  const resolvedPath = exists
    ? normalizeWorkspacePath(path.relative(workspaceRoot, candidate))
    : undefined;

  return {
    // A filesystem lookup removes the leading slash, but an unresolved URL
    // must retain it: `/` is a valid reference, and `/missing` differs from
    // `missing`. A query-only reference has no pathname to normalize.
    specifier: resolvedPath ?? (normalised || rawPath.trim()),
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
  files: ListedFiles | undefined;
}): DependencyEntry[] {
  const { content, absolutePath, workspaceRoot, files } = params;
  const sourceDir = path.dirname(absolutePath);
  const dependencies: DependencyEntry[] = [];
  const seen = new Set<string>();

  // Helper to add a dependency if not already seen
  const addDependency = (rawPath: string, _kind: "stylesheet" | "script" | "asset") => {
    const url = rawPath.trim();
    if (shouldSkipUrl(url)) {
      return;
    }

    const { specifier, resolvedPath } = resolveResourcePath(url, sourceDir, workspaceRoot, files);

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
  dependencies.sort((a, b) => compareText(a.specifier, b.specifier));

  return dependencies;
}

// ============================================================================
// Symbol Extraction (id attributes)
// ============================================================================

/**
 * Matches `id` attributes in HTML elements.
 *
 * @remarks
 * Element `id` attributes are the public API of an HTML file — client code
 * references them via `getElementById()`. Extracting them as public symbols
 * enables Live Documentation to track which source files depend on which
 * DOM elements, completing the HTML→TS dependency graph.
 */
const HTML_ID_ATTR = /\bid\s*=\s*(?:"(?<dq>[^"]+)"|'(?<sq>[^']+)')/gi;

/**
 * Every element id in a markup file, sorted and unique. Shared with the ASP.NET
 * markup adapter so that a script's `getElementById` link lands on a symbol the
 * target doc actually publishes, whatever the markup dialect.
 */
export function extractElementIds(content: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  HTML_ID_ATTR.lastIndex = 0;
  while ((match = HTML_ID_ATTR.exec(content)) !== null) {
    const id = match.groups?.dq ?? match.groups?.sq;
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  ids.sort((a, b) => compareText(a, b));
  return ids;
}

// ============================================================================
// Adapter Export
// ============================================================================

/** Language adapter for HTML (`.html`, `.htm`). Extracts resource attributes such as `<script src>`, `<link href>` and `<img src>` as dependencies. Extracts element `id` attributes as public symbols. Neither is read inside an HTML comment ({@link withoutHtmlComments}). */
export const htmlAdapter: LanguageAdapter = {
  id: "html",
  extensions: [".html", ".htm"],

  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const content = withoutHtmlComments(await readSourceText(absolutePath, fileIndex));

    const dependencies = extractHtmlDependencies({
      content,
      absolutePath,
      workspaceRoot,
      files: fileIndex
    });

    const ids = extractElementIds(content);

    return {
      symbols: ids.map(id => ({ name: id, kind: "variable", exportType: "named" })),
      dependencies
    };
  }
};
