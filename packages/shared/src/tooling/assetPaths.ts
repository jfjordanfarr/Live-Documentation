import fs from "node:fs";
import path from "node:path";

/** A broken asset reference detected in an HTML or CSS file. */
export interface AssetReferenceIssue {
  file: string;
  line: number;
  column: number;
  raw: string;
  target: string;
  attribute?: string;
}

/** Configuration for scanning HTML/CSS files for broken asset references. */
export interface AssetAuditOptions {
  workspaceRoot: string;
  ignoreTargetPatterns?: RegExp[];
  assetRootDirectories?: string[];
}

const HTML_ATTRIBUTE =
  /\b(?<attr>srcset|src|href|data-src|data-href|poster|data-asset|asset-path)\s*=\s*(?:"(?<valueDouble>[^"]+)"|'(?<valueSingle>[^']+)')/gi;
const CSS_URL = /url\(\s*(?:"(?<dq>[^"()]+)"|'(?<sq>[^'()]+)'|(?<bare>[^"')\s][^\s)]*))\s*\)/gi;

const EXTERNAL_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const DATA_URI = /^data:/i;
const PROTOCOL_RELATIVE = /^\/\//;

/**
 * Scans an HTML or CSS file for references (`src`, `href`, `url()`, etc.)
 * whose targets cannot be resolved on disk.
 *
 * Supports absolute-from-root paths, relative paths, `srcset` attribute
 * parsing, and optional alternative `assetRootDirectories`.
 */
export function findBrokenAssetReferences(
  filePath: string,
  options: AssetAuditOptions
): AssetReferenceIssue[] {
  const content = fs.readFileSync(filePath, "utf8");
  const lineStarts = computeLineStarts(content);
  const ignorePatterns = options.ignoreTargetPatterns ?? [];
  const assetRoots = options.assetRootDirectories ?? [];

  const issues: AssetReferenceIssue[] = [];

  for (const match of content.matchAll(HTML_ATTRIBUTE)) {
    const groups = match.groups ?? {};
    const attribute = (groups.attr || "").toLowerCase();
    const rawTarget = groups.valueDouble || groups.valueSingle;
    if (!rawTarget) {
      continue;
    }

    const candidates = attribute === "srcset" ? rawTarget.split(/\s*,\s*/) : [rawTarget];
    for (const candidate of candidates) {
      const target = extractSrcsetTarget(candidate);
      if (!target || shouldSkipTarget(target, ignorePatterns)) {
        continue;
      }

      const resolved = resolveTargetCandidates(target, filePath, options.workspaceRoot, assetRoots);
      if (!resolved) {
        continue;
      }

      if (!candidateExists(resolved)) {
        issues.push(makeIssue(filePath, match.index ?? 0, match[0], target, attribute, lineStarts));
      }
    }
  }

  for (const match of content.matchAll(CSS_URL)) {
    const target = match.groups?.dq || match.groups?.sq || match.groups?.bare;
    if (!target || shouldSkipTarget(target, ignorePatterns)) {
      continue;
    }

    const resolved = resolveTargetCandidates(target, filePath, options.workspaceRoot, assetRoots);
    if (!resolved) {
      continue;
    }

    if (!candidateExists(resolved)) {
      issues.push(makeIssue(filePath, match.index ?? 0, match[0], target, "url", lineStarts));
    }
  }

  return issues;
}

function extractSrcsetTarget(entry: string): string | undefined {
  const trimmed = entry.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(0, spaceIndex);
}

function shouldSkipTarget(target: string, patterns: RegExp[]): boolean {
  if (EXTERNAL_SCHEME.test(target)) {
    return true;
  }
  if (PROTOCOL_RELATIVE.test(target)) {
    return true;
  }
  if (target.startsWith("#")) {
    return true;
  }
  if (DATA_URI.test(target)) {
    return true;
  }
  return patterns.some((pattern) => pattern.test(target));
}

function resolveTargetCandidates(
  target: string,
  filePath: string,
  workspaceRoot: string,
  assetRoots: string[]
): string[] | undefined {
  const sanitized = stripFragmentAndQuery(target);
  if (!sanitized) {
    return undefined;
  }

  let normalized = sanitized;
  try {
    normalized = decodeURI(sanitized);
  } catch {
    normalized = sanitized;
  }

  if (normalized.startsWith("/")) {
    const candidates = new Set<string>();
    candidates.add(path.resolve(workspaceRoot, "." + normalized));
    const relative = normalized.slice(1);
    for (const root of assetRoots) {
      const base = path.resolve(root);
      candidates.add(path.resolve(base, relative));
    }
    return Array.from(candidates);
  }

  const directory = path.dirname(filePath);
  return [path.resolve(directory, normalized)];
}

function stripFragmentAndQuery(target: string): string {
  let value = target;

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

function computeLineStarts(content: string): number[] {
  const starts = [0];
  for (let index = 0; index < content.length; index += 1) {
    if (content.charCodeAt(index) === 10) {
      starts.push(index + 1);
    }
  }
  return starts;
}

function makeIssue(
  file: string,
  index: number,
  raw: string,
  target: string,
  attribute: string,
  lineStarts: number[]
): AssetReferenceIssue {
  const position = getPosition(index, lineStarts);
  return {
    file,
    line: position.line,
    column: position.column,
    raw,
    target,
    attribute: attribute || undefined
  };
}

function candidateExists(candidates: string[]): boolean {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return true;
    }
  }
  return false;
}

function getPosition(index: number, lineStarts: number[]) {
  let low = 0;
  let high = lineStarts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const start = lineStarts[mid];
    const nextStart = mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Number.POSITIVE_INFINITY;

    if (index < start) {
      high = mid - 1;
    } else if (index >= nextStart) {
      low = mid + 1;
    } else {
      return {
        line: mid + 1,
        column: index - start + 1
      };
    }
  }

  return { line: 1, column: index + 1 };
}
