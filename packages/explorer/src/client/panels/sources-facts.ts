/**
 * What the Knowledge Sources panel says about a bundle, computed from the
 * graph index alone: the bundle's shape, the files most used and most using,
 * the entry points and what a walk from them reaches, and the public symbols
 * that nothing references or only tests reference. The entries and the walk
 * are the engine's, the same the CLI prints for `inspect --reachable`; the
 * symbol classes are the ones the dead code sweep of 2026-10-08 found
 * computable from the docs. What the docs cannot see (a use within a symbol's
 * own file) is said in the panel, not guessed here.
 *
 * Pure-function module: no DOM. The renderer draws what this returns.
 *
 * @module sources-facts
 */

import { entryWords, type Entry } from "@live-documentation/engine/live-docs/document";
import type { GraphFile, LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { reachability } from "@live-documentation/engine/live-docs/pathfind";

/** A name and how many of something it has. */
export interface Count {
  name: string;
  count: number;
}

/** The bundle's shape: where its docs are, how many files by kind, directory and extension, and when they were generated. */
export interface BundleShape {
  root: string;
  baseLayer: string;
  files: number;
  /** Resolved references between files: every edge whose target is another file of the graph. */
  references: number;
  byArchetype: Count[];
  /** Files by their first path segment; files at the scan root count under "" . */
  byDirectory: Count[];
  /** Files by extension, with the dot; a file without one counts under "". */
  byExtension: Count[];
  /** The earliest and latest `generatedAt` among the docs, when any carries one. */
  generatedFrom?: string;
  generatedTo?: string;
}

/** A file and the files that reference it. */
export interface FileUse {
  path: string;
  archetype: string;
  /** Files with a resolved edge to this one. */
  users: number;
  /** Distinct public symbols of this file that those edges name. */
  symbolsUsed: number;
  /** Public symbols this file offers. */
  symbols: number;
}

/** A file and the files it references. */
export interface FileUsing {
  path: string;
  archetype: string;
  uses: number;
}

/** A file named in a class of the walk, with its archetype for grouping. */
export interface FileByArchetype {
  path: string;
  archetype: string;
}

/** A file the walk starts from: an entry point of the docs, or a file the person asked about. */
export interface StartFile extends FileByArchetype {
  /** Why it is an entry, in words: the Entry lines', and `test` for a test, which a runner starts. */
  reasons: string[];
  /** The Entry lines themselves. */
  entries: Entry[];
  test: boolean;
  /** The sample root the file lies under, when it is a sample program's rather than the scanned system's. */
  sample?: string;
}

/** What a walk along dependencies reaches from the entry points, or from the files asked about. */
export interface Reach {
  /** `entries` when the starts are the docs' entry points; `asked` when the person chose them. */
  from: "entries" | "asked";
  starts: StartFile[];
  /** Every file a path from a start reaches, nearest first; the starts are not among them. */
  reached: { path: string; hops: number }[];
  /** The files no path from a start reaches, in path order. */
  unreachable: FileByArchetype[];
  /** The files only a path from a test reaches, in path order; empty when the starts were asked for. */
  testsOnly: FileByArchetype[];
}

/** A file's public symbols in one class. */
export interface SymbolsOfFile {
  path: string;
  archetype: string;
  symbols: { name: string; slug: string; kind: string }[];
}

/** Everything the panel shows that the graph alone can say. */
export interface SourcesFacts {
  shape: BundleShape;
  mostUsed: FileUse[];
  mostUsing: FileUsing[];
  /** The entry points and what they reach, or what the files asked about reach. */
  reach: Reach;
  /** Public symbols of non-test files that no edge from another file names, by file. A symbol its own file uses is among them: the docs carry no local uses. */
  symbolsUnreferenced: SymbolsOfFile[];
  /** Public symbols of non-test files named only by edges from test files, by file. */
  symbolsTestsOnly: SymbolsOfFile[];
}

/** What the facts are computed for. */
export interface SourcesFactsOptions {
  /** The files to walk from in place of the entry points: the person's choice. */
  from?: readonly string[];
  /** The configuration's sample roots, so that a sample program's entries are told from the system's. */
  sampleRoots?: readonly string[];
  /** Caps the most-used and most-using lists. */
  limit?: number;
}

const byCountThenName = (a: Count, b: Count): number => b.count - a.count || a.name.localeCompare(b.name);

function counts(files: GraphFile[], keyOf: (file: GraphFile) => string): Count[] {
  const map = new Map<string, number>();
  for (const file of files) {
    const key = keyOf(file);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort(byCountThenName);
}

const archetypeOf = (file: GraphFile): string => file.archetype ?? "implementation";
const directoryOf = (file: GraphFile): string => (file.codePath.includes("/") ? file.codePath.slice(0, file.codePath.indexOf("/")) : "");
const extensionOf = (file: GraphFile): string => {
  const base = file.codePath.slice(file.codePath.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot).toLowerCase() : "";
};

/**
 * The facts of a graph. The most-used and most-using lists are capped; the
 * other lists are whole, since a cut list hides exactly what a person came to
 * see.
 */
export function sourcesFacts(graph: LiveDocGraph, options: SourcesFactsOptions = {}): SourcesFacts {
  const limit = options.limit ?? 8;
  const files = Object.values(graph.files).sort((a, b) => a.codePath.localeCompare(b.codePath));

  // Which symbols of each file are named by edges from other files, and whether every such edge comes from a test.
  const namedBy = new Map<string, Map<string, { fromTests: boolean }>>();
  let references = 0;
  for (const file of files) {
    for (const edge of file.edges) {
      if (!edge.to || edge.to === file.codePath || !(edge.to in graph.files)) continue;
      references += 1;
      if (!edge.toSymbol) continue;
      let symbols = namedBy.get(edge.to);
      if (!symbols) {
        symbols = new Map();
        namedBy.set(edge.to, symbols);
      }
      const entry = symbols.get(edge.toSymbol);
      const fromTest = archetypeOf(file) === "test";
      if (!entry) symbols.set(edge.toSymbol, { fromTests: fromTest });
      else entry.fromTests = entry.fromTests && fromTest;
    }
  }

  const generated = files.map(file => file.generatedAt).filter((value): value is string => typeof value === "string").sort();
  const shape: BundleShape = {
    root: graph.root,
    baseLayer: graph.baseLayer,
    files: files.length,
    references,
    byArchetype: counts(files, archetypeOf),
    byDirectory: counts(files, directoryOf),
    byExtension: counts(files, extensionOf),
    ...(generated.length ? { generatedFrom: generated[0], generatedTo: generated[generated.length - 1] } : {})
  };

  const used: FileUse[] = files
    .filter(file => file.inbound.length > 0)
    .map(file => ({ path: file.codePath, archetype: archetypeOf(file), users: file.inbound.length, symbolsUsed: namedBy.get(file.codePath)?.size ?? 0, symbols: file.symbols.length }))
    .sort((a, b) => b.users - a.users || a.path.localeCompare(b.path));
  const using: FileUsing[] = files
    .filter(file => file.outbound.length > 0)
    .map(file => ({ path: file.codePath, archetype: archetypeOf(file), uses: file.outbound.length }))
    .sort((a, b) => b.uses - a.uses || a.path.localeCompare(b.path));

  const symbolsUnreferenced: SymbolsOfFile[] = [];
  const symbolsTestsOnly: SymbolsOfFile[] = [];
  for (const file of files) {
    const archetype = archetypeOf(file);
    if (archetype === "test" || file.symbols.length === 0) continue;
    const named = namedBy.get(file.codePath);
    const unnamed = file.symbols.filter(symbol => !symbol.slug || !named?.has(symbol.slug));
    const onlyTests = file.symbols.filter(symbol => symbol.slug && named?.get(symbol.slug)?.fromTests);
    const describe = (symbols: typeof file.symbols): SymbolsOfFile => ({ path: file.codePath, archetype, symbols: symbols.map(symbol => ({ name: symbol.name, slug: symbol.slug ?? "", kind: symbol.kind })) });
    if (unnamed.length) symbolsUnreferenced.push(describe(unnamed));
    if (onlyTests.length) symbolsTestsOnly.push(describe(onlyTests));
  }

  return {
    shape,
    mostUsed: used.slice(0, limit),
    mostUsing: using.slice(0, limit),
    reach: reachOf(graph, options.from, options.sampleRoots ?? []),
    symbolsUnreferenced,
    symbolsTestsOnly
  };
}

/** The sample root a path lies under, when any. */
function sampleOf(path: string, sampleRoots: readonly string[]): string | undefined {
  return sampleRoots.find(root => root === "." || path === root || path.startsWith(`${root}/`));
}

/** The engine's walk from the entry points, or from the files asked about, with each file's archetype for grouping. */
function reachOf(graph: LiveDocGraph, from: readonly string[] | undefined, sampleRoots: readonly string[]): Reach {
  const result = reachability(graph, from);
  const classed = (path: string): FileByArchetype => ({ path, archetype: archetypeOf(graph.files[path]) });
  return {
    from: result.from,
    starts: result.starts.map(start => {
      const sample = sampleOf(start.codePath, sampleRoots);
      return {
        ...classed(start.codePath),
        reasons: [...start.entries.map(entryWords), ...(start.test ? ["test"] : [])],
        entries: start.entries,
        test: start.test,
        ...(sample !== undefined ? { sample } : {})
      };
    }),
    reached: result.reached.map(file => ({ path: file.codePath, hops: file.hops })),
    unreachable: result.unreachable.map(classed),
    testsOnly: result.testsOnly.map(classed)
  };
}

/** How many symbols a list of files' classes holds in all. */
export const symbolCount = (classes: readonly SymbolsOfFile[]): number => classes.reduce((sum, entry) => sum + entry.symbols.length, 0);
