/**
 * What the Knowledge Sources panel says about a bundle, computed from the
 * graph index alone: the bundle's shape, the files most used and most using,
 * the files and public symbols that nothing references or only tests
 * reference. These are the classes the dead code sweep of 2026-10-08 found
 * computable from the docs; what the docs cannot see (an entry point a
 * manifest script names, a runner's glob, a template's link, a use within a
 * symbol's own file) is said in the panel, not guessed here.
 *
 * Pure-function module: no DOM. The renderer draws what this returns.
 *
 * @module sources-facts
 */

import type { GraphFile, LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

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

/** A file that nothing references, or that only test files reference. */
export interface UnreferencedFile {
  path: string;
  archetype: string;
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
  /** Files no other file has a resolved edge to, in path order. */
  unreferenced: UnreferencedFile[];
  /** Files that are not tests and whose every referencing file is a test. */
  testsOnly: UnreferencedFile[];
  /** Public symbols of non-test files that no edge from another file names, by file. A symbol its own file uses is among them: the docs carry no local uses. */
  symbolsUnreferenced: SymbolsOfFile[];
  /** Public symbols of non-test files named only by edges from test files, by file. */
  symbolsTestsOnly: SymbolsOfFile[];
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
 * The facts of a graph. `limit` caps the most-used and most-using lists; the
 * other lists are whole, since a cut list hides exactly what a person came to
 * see.
 */
export function sourcesFacts(graph: LiveDocGraph, limit = 8): SourcesFacts {
  const files = Object.values(graph.files).sort((a, b) => a.codePath.localeCompare(b.codePath));
  const isTest = (path: string): boolean => archetypeOf(graph.files[path]) === "test";

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

  const unreferenced: UnreferencedFile[] = [];
  const testsOnly: UnreferencedFile[] = [];
  const symbolsUnreferenced: SymbolsOfFile[] = [];
  const symbolsTestsOnly: SymbolsOfFile[] = [];
  for (const file of files) {
    const archetype = archetypeOf(file);
    if (file.inbound.length === 0) unreferenced.push({ path: file.codePath, archetype });
    else if (archetype !== "test" && file.inbound.every(isTest)) testsOnly.push({ path: file.codePath, archetype });
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
    unreferenced,
    testsOnly,
    symbolsUnreferenced,
    symbolsTestsOnly
  };
}

/** How many symbols a list of files' classes holds in all. */
export const symbolCount = (classes: readonly SymbolsOfFile[]): number => classes.reduce((sum, entry) => sum + entry.symbols.length, 0);
