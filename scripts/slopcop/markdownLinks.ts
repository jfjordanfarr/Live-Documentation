import fs from "node:fs";
import path from "node:path";

import {
  computeLineStarts,
  extractReferenceDefinitions,
  parseLinkTarget,
  toLineAndColumn
} from "./markdownShared";

/** A broken link detected in a markdown file. */
export interface MarkdownLinkIssue {
  file: string;
  line: number;
  column: number;
  raw: string;
  target: string;
}

/** Configuration for scanning markdown files for broken local links. */
export interface MarkdownLinkAuditOptions {
  workspaceRoot: string;
  ignoreTargetPatterns?: RegExp[];
}

const INLINE_LINK = /(!?)\[[^\]]*\]\(([^)]+)\)/g;
const REFERENCE_LINK = /(!?)\[[^\]]*\]\[([^\]]*)\]/g;

const EXTERNAL_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Scans a markdown file for inline and reference-style links whose local
 * targets cannot be resolved on disk.
 *
 * External URLs, fragment-only links, and targets matching any
 * `ignoreTargetPatterns` are skipped.
 */
export function findBrokenMarkdownLinks(
  filePath: string,
  options: MarkdownLinkAuditOptions
): MarkdownLinkIssue[] {
  const content = fs.readFileSync(filePath, "utf8");
  const definitions = extractReferenceDefinitions(content);
  const lineStarts = computeLineStarts(content);
  const ignorePatterns = options.ignoreTargetPatterns ?? [];

  const issues: MarkdownLinkIssue[] = [];

  // Inline links and images
  for (const match of content.matchAll(INLINE_LINK)) {
    const raw = match[0];
    const target = parseLinkTarget(match[2]);
    if (!target) {
      continue;
    }

    if (isLocalPath(target)) {
      if (shouldIgnoreTarget(target, ignorePatterns)) {
        continue;
      }

      const resolved = resolveTarget(target, filePath, options.workspaceRoot);
      if (!resolved) {
        continue;
      }

      if (!fs.existsSync(resolved)) {
        issues.push(makeIssue(filePath, match.index ?? 0, raw, target, lineStarts));
      }
    }
  }

  // Reference style links and images
  for (const match of content.matchAll(REFERENCE_LINK)) {
    const referenceId = (match[2] || match[0].slice(1, match[0].indexOf("]"))).trim();
    if (referenceId.length === 0) {
      continue;
    }

    const def = definitions.get(referenceId.toLowerCase());
    if (!def) {
      if (shouldIgnoreTarget(referenceId, ignorePatterns)) {
        continue;
      }
      // Missing definition is effectively broken
      issues.push(makeIssue(filePath, match.index ?? 0, match[0], referenceId, lineStarts));
      continue;
    }

    const target = parseLinkTarget(def.url);
    if (!target || !isLocalPath(target)) {
      continue;
    }

    if (shouldIgnoreTarget(target, ignorePatterns)) {
      continue;
    }

    const resolved = resolveTarget(target, filePath, options.workspaceRoot);
    if (!resolved) {
      continue;
    }

    if (!fs.existsSync(resolved)) {
      issues.push(makeIssue(filePath, def.index, match[0], target, lineStarts));
    }
  }

  return issues;
}

function makeIssue(
  file: string,
  index: number,
  raw: string,
  target: string,
  lineStarts: number[]
): MarkdownLinkIssue {
  const position = toLineAndColumn(index, lineStarts);
  return {
    file,
    line: position.line,
    column: position.column,
    raw,
    target
  };
}

function isLocalPath(target: string): boolean {
  if (EXTERNAL_SCHEME.test(target)) {
    return false;
  }

  if (target.startsWith("#")) {
    return false;
  }

  return true;
}

function shouldIgnoreTarget(target: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(target));
}

function resolveTarget(target: string, filePath: string, workspaceRoot: string): string | undefined {
  const sanitized = stripFragmentAndQuery(target);
  if (!sanitized) {
    return undefined;
  }

  let decoded: string;
  try {
    decoded = decodeURI(sanitized);
  } catch {
    decoded = sanitized;
  }

  if (decoded.startsWith("/")) {
    return path.resolve(workspaceRoot, "." + decoded);
  }

  const directory = path.dirname(filePath);
  return path.resolve(directory, decoded);
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
