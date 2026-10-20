/**
 * The documents a Live Doc's authored words link to: its related documents, the
 * Explorer's purple Related Docs and, since 2026-10-20, a part of every step of
 * the history.
 *
 * @remarks
 * A related document is a markdown file, other than a Live Doc, that a link in
 * the doc's authored block names, inside the workspace and not excluded by the
 * configuration's bundle exclusions. Only authored words link to one: the
 * generated sections link to Live Docs alone (measured over this repository on
 * 2026-10-20, 876 such links, every one authored). The graph carries each
 * doc's authored block verbatim, so the rule reads the graph, never the docs
 * on disk; whether the document stands is for the caller, who can see the
 * tree. Kept apart from `graph.ts`, which the browser client loads, so that
 * the glob matcher stays out of it.
 *
 * @module
 */

import { minimatch } from "minimatch";

import { linkTarget, resolveDocLink, type DocLocation } from "./graph";

/** A markdown link whose target ends in `.md`, with an optional fragment, as the Explorer's bundle has always read them. */
const MARKDOWN_LINK = /\[([^\]]*)\]\(([^)]+\.md(?:#[^)]*)?)\)/giu;

/**
 * The workspace-relative paths of the documents a doc's authored words link
 * to, each once, sorted.
 *
 * @param file - The doc: where it stands, and its authored block.
 * @param location - Where the Live Docs are, so that a link to one is told from a link to a document.
 * @param exclude - Workspace-relative glob patterns of documents that are neither bundled nor linked (`bundleExclude`).
 */
export function relatedDocsOf(file: { docPath: string; authored: string }, location: DocLocation, exclude: readonly string[] = []): string[] {
  const documents = new Set<string>();
  for (const match of file.authored.matchAll(MARKDOWN_LINK)) {
    const link = match[2];
    const resolved = resolveDocLink(file.docPath, link);
    // A Live Doc is a file of the graph, wired by its own edges, not a document beside it.
    if (resolved === undefined || resolved === file.docPath || linkTarget(file.docPath, link, location)) {
      continue;
    }
    if (exclude.some((pattern) => minimatch(resolved, pattern, { dot: true }))) {
      continue;
    }
    documents.add(resolved);
  }
  return [...documents].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
