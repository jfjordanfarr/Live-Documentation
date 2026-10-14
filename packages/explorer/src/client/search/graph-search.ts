/**
 * The one search of the Explorer: directories, files and symbols found by a few typed words, grouped the way the
 * declared structure reads, directory, then file, then symbol. Pure: the bar renders what this returns.
 */

import type { ExplorerNodePayload } from "../../shared/types";
import type { Reach } from "../pathfind";

/** The three kinds of thing a search can find, each of which a pin can hold. */
export type SearchHit =
  | { kind: "directory"; directory: string }
  | { kind: "file"; node: ExplorerNodePayload }
  | { kind: "symbol"; node: ExplorerNodePayload; symbol: string };

/** One file in a group: the file, and the symbols of it the words matched, capped unless the file is expanded. */
export interface SearchFile {
  node: ExplorerNodePayload;
  /** Whether the file's own name or path matched, rather than only a symbol in it. */
  matched: boolean;
  symbols: string[];
  /** Matched symbols beyond the cap, not listed; zero when the file is expanded or has few. */
  moreSymbols: number;
}

/** A directory and the files found in it, directly or below. */
export interface SearchGroup {
  directory: string;
  /** Whether the directory's own name matched, so that the directory itself is offered. */
  matched: boolean;
  files: SearchFile[];
}

/** What a search found: the groups within the limits, and how many files the words matched before them. */
export interface SearchResult {
  groups: SearchGroup[];
  /** The files matched, counted before the file limit, so that a fold can say how many are not listed. */
  files: number;
}

/** What a field searches: the index offered, the words on an offered row, and the files kept apart under a fold. */
export interface SearchScope {
  index: SearchIndex;
  /** Words on an offered file or directory in place of the file's kind, such as how far a path to it runs. */
  badge?: (hit: SearchHit) => string | undefined;
  /** Files that exist but are not offered, folded under a count so that a typed name is never silently absent. */
  apart?: {
    index: SearchIndex;
    /** The fold's words for a count; `more` when offered rows stand above it. */
    fold: (count: number, more: boolean) => string;
    /** The words on every row under the fold. */
    badge: string;
  };
}

/** A row the keyboard walks: a thing to choose, or the fold that reveals a file's remaining symbols. */
export type SearchRow = SearchHit | { kind: "more"; node: ExplorerNodePayload; count: number };

/** What a search is run over: the files, and every directory above them, computed once. */
export interface SearchIndex {
  nodes: readonly ExplorerNodePayload[];
  directories: readonly string[];
}

export interface SearchOptions {
  /** Files whose matched symbols are listed in full. */
  expanded?: ReadonlySet<string>;
  /** The most files offered; the best scores win. */
  fileLimit?: number;
  /** The most directories offered by their own name. */
  directoryLimit?: number;
  /** Matched symbols listed under a file that is not expanded. */
  symbolCap?: number;
}

const FILE_LIMIT = 12;
const DIRECTORY_LIMIT = 6;
const SYMBOL_CAP = 5;

/** Every directory above the files, the scan root as "", deepest last within a branch. */
export function directoriesOf(nodes: readonly ExplorerNodePayload[]): string[] {
  const seen = new Set<string>([""]);
  for (const node of nodes) {
    const parts = node.id.split("/");
    for (let depth = 1; depth < parts.length; depth++) seen.add(parts.slice(0, depth).join("/"));
  }
  return [...seen].sort();
}

/** The index a bar searches, built once from the bundle's files. */
export function searchIndexOf(nodes: readonly ExplorerNodePayload[]): SearchIndex {
  return { nodes, directories: directoriesOf(nodes) };
}

/** The directory a file stands in. */
export function directoryOf(id: string): string {
  const slash = id.lastIndexOf("/");
  return slash < 0 ? "" : id.slice(0, slash);
}

/** The words of a query, lowercased; an empty query has none. */
export function termsOf(query: string): string[] {
  return query.toLowerCase().split(/\s+/u).filter(Boolean);
}

/** How well a name answers the words: exact, then prefix, then anywhere. Zero when a word is absent. */
function nameScore(name: string, terms: readonly string[]): number {
  let score = 0;
  for (const term of terms) {
    if (name === term) score += 100;
    else if (name.startsWith(term)) score += 50;
    else if (name.includes(term)) score += 25;
  }
  return score;
}

/**
 * The files and directories the words find, grouped by directory. A file scores by its name first, its path and its
 * symbols after, as the Explorer's searches always have; a directory by its last segment.
 */
export function searchGraph(query: string, index: SearchIndex, options: SearchOptions = {}): SearchResult {
  const terms = termsOf(query);
  if (terms.length === 0) return { groups: [], files: 0 };
  const fileLimit = options.fileLimit ?? FILE_LIMIT;
  const directoryLimit = options.directoryLimit ?? DIRECTORY_LIMIT;
  const symbolCap = options.symbolCap ?? SYMBOL_CAP;
  const expanded = options.expanded ?? new Set<string>();

  const matchedFiles = index.nodes
    .map(node => {
      const name = (node.name || "").toLowerCase();
      const path = (node.codeRelativePath || node.id || "").toLowerCase();
      const symbols = (node.publicSymbols ?? []).filter(symbol => {
        const lower = symbol.toLowerCase();
        return terms.some(term => lower.includes(term));
      });
      let score = nameScore(name, terms);
      const matched = score > 0 || terms.some(term => path.includes(term));
      for (const term of terms) {
        if (path.includes(term)) score += 10;
        if (symbols.some(symbol => symbol.toLowerCase().includes(term))) score += 15;
      }
      return { node, score, matched, symbols };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id));
  const files = matchedFiles.slice(0, fileLimit);

  const directories = index.directories
    .map(directory => ({ directory, score: nameScore((directory.split("/").pop() ?? "").toLowerCase(), terms) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.directory.localeCompare(b.directory))
    .slice(0, directoryLimit)
    .map(entry => entry.directory);

  const groups = new Map<string, SearchGroup>();
  const groupOf = (directory: string): SearchGroup => {
    let group = groups.get(directory);
    if (!group) {
      group = { directory, matched: false, files: [] };
      groups.set(directory, group);
    }
    return group;
  };
  for (const directory of directories) groupOf(directory).matched = true;
  for (const entry of files) {
    const open = expanded.has(entry.node.id);
    const listed = open ? entry.symbols : entry.symbols.slice(0, symbolCap);
    groupOf(directoryOf(entry.node.id)).files.push({
      node: entry.node,
      matched: entry.matched,
      symbols: listed,
      moreSymbols: entry.symbols.length - listed.length
    });
  }
  return { groups: [...groups.values()].sort((a, b) => a.directory.localeCompare(b.directory)), files: matchedFiles.length };
}

/** The rows of the groups in reading order: a matched directory, each file, its symbols, then the fold if any. */
export function searchRows(groups: readonly SearchGroup[]): SearchRow[] {
  const rows: SearchRow[] = [];
  for (const group of groups) {
    if (group.matched) rows.push({ kind: "directory", directory: group.directory });
    for (const file of group.files) {
      rows.push({ kind: "file", node: file.node });
      for (const symbol of file.symbols) rows.push({ kind: "symbol", node: file.node, symbol });
      if (file.moreSymbols > 0) rows.push({ kind: "more", node: file.node, count: file.moreSymbols });
    }
  }
  return rows;
}

/** The words a destination row carries: the files a path to it would show, and whether it runs the other way. */
export function reachWords(reach: Reach, id: string): string {
  const forward = reach.forward.get(id);
  return forward !== undefined ? `${forward} files` : `${reach.reverse.get(id)} files, the other way`;
}

/**
 * The destination's scope from the reach of the newest pin: the connected files offered with their distance, a
 * directory by its nearest file (one the map can draw to before one the other way), and the rest kept apart under
 * a fold.
 */
export function destinationScope(index: SearchIndex, reach: Reach): SearchScope {
  const connected = (id: string): boolean => reach.forward.has(id) || reach.reverse.has(id);
  const offered = searchIndexOf(index.nodes.filter(node => connected(node.id)));
  // A directory with a connected file inside is offered; apart, by name, are only the directories with none
  const reached = new Set(offered.directories);
  const unconnected = index.nodes.filter(node => !connected(node.id));
  const apart: SearchIndex = { nodes: unconnected, directories: directoriesOf(unconnected).filter(directory => !reached.has(directory)) };
  const rank = (id: string): number => reach.forward.get(id) ?? 1_000_000 + (reach.reverse.get(id) ?? 0);
  const nearest = (directory: string): string | undefined => {
    let best: string | undefined;
    for (const node of offered.nodes) {
      if (directory !== "" && !node.id.startsWith(`${directory}/`)) continue;
      if (best === undefined || rank(node.id) < rank(best)) best = node.id;
    }
    return best === undefined ? undefined : reachWords(reach, best);
  };
  return {
    index: offered,
    badge: hit => hit.kind === "file" ? reachWords(reach, hit.node.id) : hit.kind === "directory" ? nearest(hit.directory) : undefined,
    apart: {
      index: apart,
      fold: (count, more) => `${count}${more ? " more" : ""} ${count === 1 ? "file matches" : "files match"}, but no path connects ${count === 1 ? "it" : "them"}`,
      badge: "no path"
    }
  };
}
