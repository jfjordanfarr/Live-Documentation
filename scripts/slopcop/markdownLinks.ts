import fs from "node:fs";
import path from "node:path";

import { linkPath, readMarkdownLinks } from "@live-documentation/engine/tooling/markdownLinks";

import { computeLineStarts, toLineAndColumn } from "./markdownShared";

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

const EXTERNAL_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Scans a markdown file for links and images, inline or by reference, whose
 * local targets cannot be resolved on disk, and for references whose label
 * no definition names. Links are read by CommonMark's rule, as the engine and
 * the Explorer read them, so anything inside a fenced code block or an inline
 * code span is an example rather than a link.
 *
 * External URLs, autolinks, fragment-only links, and targets matching any
 * `ignoreTargetPatterns` are skipped.
 */
export function findBrokenMarkdownLinks(
  filePath: string,
  options: MarkdownLinkAuditOptions
): MarkdownLinkIssue[] {
  const content = fs.readFileSync(filePath, "utf8");
  const reading = readMarkdownLinks(content);
  const lineStarts = computeLineStarts(content);
  const ignorePatterns = options.ignoreTargetPatterns ?? [];
  const issues: MarkdownLinkIssue[] = [];

  for (const link of reading.links) {
    const target = link.destination;
    if (link.kind === "autolink" || !isLocalPath(target) || shouldIgnoreTarget(target, ignorePatterns)) {
      continue;
    }

    const resolved = resolveTarget(target, filePath, options.workspaceRoot);
    if (resolved && !fs.existsSync(resolved)) {
      issues.push(makeIssue(filePath, link.start, content.slice(link.start, link.end), target, lineStarts));
    }
  }

  // A reference whose label no definition names is text to a markdown viewer, a link its author meant.
  for (const reference of reading.unresolved) {
    if (!shouldIgnoreTarget(reference.label, ignorePatterns)) {
      issues.push(makeIssue(filePath, reference.start, content.slice(reference.start, reference.end), reference.label, lineStarts));
    }
  }

  return issues.sort((a, b) => a.line - b.line || a.column - b.column);
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
  return target !== "" && !EXTERNAL_SCHEME.test(target) && !target.startsWith("#");
}

function shouldIgnoreTarget(target: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(target));
}

/**
 * The file a local link names on disk: its path read as a browser reads it, before its query and fragment and
 * percent-decoded, from the workspace root when it begins with `/` and from the file's folder otherwise.
 */
function resolveTarget(target: string, filePath: string, workspaceRoot: string): string | undefined {
  const decoded = linkPath(target).path;
  if (!decoded) {
    return undefined;
  }

  if (decoded.startsWith("/")) {
    return path.resolve(workspaceRoot, "." + decoded);
  }

  return path.resolve(path.dirname(filePath), decoded);
}
