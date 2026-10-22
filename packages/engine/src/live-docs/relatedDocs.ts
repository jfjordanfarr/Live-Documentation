/**
 * A file's related documents, both ways: the documents a Live Doc's authored
 * words link to, its related documents since 2026-01-06, the Explorer's purple
 * Related Docs and, since 2026-10-20, a part of every step of the history; and
 * the documents whose own markdown links name the file or its doc, the `Cited
 * By` section the generator writes since 2026-10-22.
 *
 * @remarks
 * A related document is a markdown file, other than a Live Doc, inside the
 * workspace and not excluded by the configuration's bundle exclusions. Only
 * authored words link to one: the generated sections link to Live Docs alone
 * (measured over this repository on 2026-10-20, 876 such links, every one
 * authored). The graph carries each doc's authored block verbatim, so the
 * forward rule reads the graph, never the docs on disk; whether the document
 * stands is for the caller, who can see the tree. The reverse rule reads the
 * documents themselves, which the generator discovers and hands over as text,
 * so that the section it writes is what the Explorer and the CLI read back. In
 * either direction a link inside fenced or inline code is not a link. Kept
 * apart from `graph.ts`, which the browser client loads, so that the glob
 * matcher stays out of it.
 *
 * @module
 */

import { minimatch } from "minimatch";

import { linkTarget, resolveDocLink, type DocLocation } from "./graph";

/** A markdown link's target, in angle brackets or bare, with an optional title after it; the text before it is not read. */
const MARKDOWN_LINK = /\]\(\s*(?:<([^>\n]*)>|([^)\s]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/gu;

/** A line that opens or closes a fenced code block, indented by up to three spaces as CommonMark allows. */
const FENCE = /^ {0,3}(`{3,}|~{3,})/u;

/** An inline code span on one line; a link written inside one is not a link. */
const CODE_SPAN = /`[^`\n]*`/gu;

/** The suffixes of a markdown document, whose links are markdown links. */
const MARKDOWN_SUFFIXES = [".md", ".markdown"];

/**
 * The targets of every markdown link in a text, as written, in order, with
 * their fragments; a link inside fenced or inline code is not one.
 */
export function markdownLinkTargets(text: string): string[] {
  const targets: string[] = [];
  let fence: string | undefined;
  for (const line of text.split("\n")) {
    const opening = FENCE.exec(line);
    if (fence !== undefined) {
      if (opening && opening[1][0] === fence[0] && opening[1].length >= fence.length) {
        fence = undefined;
      }
      continue;
    }
    if (opening) {
      fence = opening[1];
      continue;
    }
    for (const match of line.replace(CODE_SPAN, "").matchAll(MARKDOWN_LINK)) {
      targets.push(match[1] ?? match[2]);
    }
  }
  return targets;
}

/** True for a markdown document by its suffix, whatever its case. */
export function isMarkdownDocument(relativePath: string): boolean {
  const lower = relativePath.toLowerCase();
  return MARKDOWN_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

/**
 * The workspace-relative paths of the documents a doc's authored words link
 * to, each once, sorted: what the file cites.
 *
 * @param file - The doc: where it stands, and its authored block.
 * @param location - Where the Live Docs are, so that a link to one is told from a link to a document.
 * @param exclude - Workspace-relative glob patterns of documents that are neither bundled nor linked (`bundleExclude`).
 */
export function relatedDocsOf(file: { docPath: string; authored: string }, location: DocLocation, exclude: readonly string[] = []): string[] {
  const documents = new Set<string>();
  for (const link of markdownLinkTargets(file.authored)) {
    if (!isMarkdownDocument(link.split("#", 2)[0])) {
      continue;
    }
    const resolved = resolveDocLink(file.docPath, decoded(link));
    // A Live Doc is a file of the graph, wired by its own edges, not a document beside it.
    if (resolved === undefined || resolved === file.docPath || linkTarget(file.docPath, link, location)) {
      continue;
    }
    if (excluded(resolved, exclude)) {
      continue;
    }
    documents.add(resolved);
  }
  return [...documents].sort(compare);
}

/** A document as the generator hands it over: its workspace-relative path, with forward slashes, and its text. */
export interface DocumentText {
  path: string;
  text: string;
}

/**
 * The documents that cite each file: for every documented file that a
 * document's markdown links name, by its own path or its doc's, the citing
 * documents' workspace-relative paths, each once, sorted, by the file's path.
 * A document that cites no file is in no entry, as a document no doc cites is
 * in no bundle: a document is related to the code by a link, one way or the
 * other, or not at all.
 *
 * @param documents - The workspace's markdown documents, as discovery finds them; another kind of document has no markdown links.
 * @param files - The workspace-relative paths of the documented files, the generator's file index.
 * @param location - Where the Live Docs are, so that a link to a doc names its file.
 * @param exclude - Workspace-relative glob patterns of documents that are neither bundled nor linked (`bundleExclude`).
 */
export function citingDocuments(documents: Iterable<DocumentText>, files: ReadonlySet<string>, location: DocLocation, exclude: readonly string[] = []): Map<string, string[]> {
  const cited = new Map<string, Set<string>>();
  for (const document of documents) {
    if (!isMarkdownDocument(document.path) || excluded(document.path, exclude)) {
      continue;
    }
    for (const link of markdownLinkTargets(document.text)) {
      const file = citedFile(document.path, decoded(link), files, location);
      if (file === undefined) {
        continue;
      }
      const citers = cited.get(file) ?? new Set<string>();
      citers.add(document.path);
      cited.set(file, citers);
    }
  }
  return new Map([...cited].sort(([a], [b]) => compare(a, b)).map(([file, citers]) => [file, [...citers].sort(compare)]));
}

/** The documented file a document's link names, by the file's own path or its doc's; undefined for anything else. */
function citedFile(documentPath: string, link: string, files: ReadonlySet<string>, location: DocLocation): string | undefined {
  const doc = linkTarget(documentPath, link, location);
  if (doc) {
    return files.has(doc.codePath) ? doc.codePath : undefined;
  }
  const resolved = resolveDocLink(documentPath, link);
  return resolved !== undefined && files.has(resolved) ? resolved : undefined;
}

function excluded(workspacePath: string, exclude: readonly string[]): boolean {
  return exclude.some((pattern) => minimatch(workspacePath, pattern, { dot: true }));
}

/** A link with its percent-encoding undone, as a browser reads it; a link that is not well-formed is read as written. */
function decoded(link: string): string {
  try {
    return decodeURIComponent(link);
  } catch {
    return link;
  }
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
