/**
 * The history's second rung: each file's symbol rows and lines at one change,
 * by path, and what a step does to them.
 *
 * @remarks
 * The first rung, `shape.ts`, is what the 3D map draws at a moment: files,
 * their counts and the wires between them. The second is what a 2D card
 * draws: each public symbol in the doc's order with its kind, flags and type
 * references, each dependency line, entry, re-exported anchor and citing
 * document, and the words of the day by the id of their text (the third
 * rung's store holds the texts themselves). The links between rows, from a
 * symbol or a file to a symbol or a file, are not kept apart: they are the
 * references and dependency lines that resolved, read by {@link linksOf}, so
 * that each fact is held once (the owner, 2026-11-18: "all three rungs").
 *
 * A step's change of rows is named by path and by each symbol's anchor in its
 * file, and is applied after the same step's change of shape, whose renames,
 * deaths and births it follows: a renamed file keeps its rows, and every
 * reference to it is renamed with it, so a rename costs nothing beyond its
 * shape's line (the probe of 2026-11-18 measured the largest step fall from
 * 41.5 KB to 8.5 KB for this alone). A symbol is believed renamed only on
 * sound evidence: in one file at one step, a symbol gone and one born of the
 * same kind whose descriptions are the same text, not empty, and the pair the
 * only such pair either has. The functions here are pure and never change
 * the rows they are given.
 *
 * @module
 */

import type { EdgeKind } from "../graph";
import type { ShapeChange } from "./shape";
import type { CommitSummary, DependencyRow, EntryRow, ReExportRow, RowReference } from "./summary";

/** One public symbol of a file at a change: a row of its card. */
export interface RowSymbol {
  /** The heading as the doc writes it, as `Widget (interface)`. */
  name: string;
  /** The heading's anchor: the symbol's identity within its file. */
  slug: string;
  kind: string;
  /** `default`, `type-only`. */
  flags: string[];
  /** Its type references in the doc's order. */
  references: RowReference[];
  /** The id of its description's text, when it has one. */
  text?: number;
}

/**
 * What is known of a file's authored words at a change: the id of their text; `unread`, when a doc stood whose form
 * today's reader cannot read the words of; or `none`, when no doc of the file stood where the lens reads it.
 */
export type AuthoredWords = number | "unread" | "none";

/** A file's rows and lines at a change. */
export interface FileRows {
  entries: EntryRow[];
  /** In the doc's order. */
  symbols: RowSymbol[];
  /** In the doc's order. */
  dependencies: DependencyRow[];
  reExports: ReExportRow[];
  /** The documents outside the Live Docs that cite the file, by path. */
  citedBy: string[];
  authored: AuthoredWords;
}

/** Every file's rows at a change, by its workspace-relative path. */
export type Rows = Map<string, FileRows>;

/** What one step does to the rows, by path and anchor; applied after the step's {@link ShapeChange}, in this order. */
export interface RowsChange {
  /** Symbols that leave their file, by its path and their anchor. */
  symbolsGone: Array<[path: string, slug: string]>;
  /** Symbols whose row changed, by their anchor before the step: a rename's new row carries its new anchor. */
  symbolsChanged: Array<[path: string, slug: string, symbol: RowSymbol]>;
  /** Symbols that appear, each with its place in its file's rows after the step; inserted in that order. */
  symbolsBorn: Array<[path: string, index: number, symbol: RowSymbol]>;
  /** A file's anchors in their new order, where the symbols that stayed changed places. */
  symbolsOrdered: Array<[path: string, slugs: string[]]>;
  /** A file's entries, whole, where they changed. */
  entryLines: Array<[path: string, entries: EntryRow[]]>;
  /** A file's dependency lines, whole, where they changed. */
  dependencyLines: Array<[path: string, dependencies: DependencyRow[]]>;
  /** A file's re-exported anchors, whole, where they changed. */
  reExports: Array<[path: string, reExports: ReExportRow[]]>;
  /** A file's citing documents, whole, where they changed. */
  citedBy: Array<[path: string, citedBy: string[]]>;
  /** A file's authored words, where they changed. */
  authored: Array<[path: string, authored: AuthoredWords]>;
}

/** A change of rows that changes nothing, to be filled in. */
export function emptyRowsChange(): RowsChange {
  return { symbolsGone: [], symbolsChanged: [], symbolsBorn: [], symbolsOrdered: [], entryLines: [], dependencyLines: [], reExports: [], citedBy: [], authored: [] };
}

/** The rows of a file that has none yet. */
export function emptyFileRows(): FileRows {
  return { entries: [], symbols: [], dependencies: [], reExports: [], citedBy: [], authored: "none" };
}

/** The rows a summary records, each text named by the id `textId` gives its hash. */
export function rowsOfSummary(summary: CommitSummary, textId: (hash: string) => number): Rows {
  const rows: Rows = new Map();
  for (const file of summary.files) {
    rows.set(file.path, {
      entries: file.entries.map((entry) => ({ ...entry })),
      symbols: file.symbols.map((symbol) => ({
        name: symbol.name,
        slug: symbol.slug,
        kind: symbol.kind,
        flags: [...(symbol.flags ?? [])],
        references: (symbol.references ?? []).map((reference) => ({ ...reference })),
        ...(symbol.text !== undefined ? { text: textId(symbol.text) } : {})
      })),
      dependencies: file.dependencies.map((line) => ({ ...line, ...(line.symbols ? { symbols: [...line.symbols] } : {}) })),
      reExports: (file.reExports ?? []).map((entry) => ({ ...entry, ...(entry.flags ? { flags: [...entry.flags] } : {}) })),
      citedBy: [...(file.citedBy ?? [])],
      authored: file.authored !== undefined ? textId(file.authored) : file.unread ? "unread" : "none"
    });
  }
  return rows;
}

/**
 * The rows with each renamed file moved to its new path, and every reference, line and re-export that named it renamed
 * with it. A file's rows that name no renamed file are the same object as before: rows are shared between moments and
 * never changed in place.
 */
export function renameRows(rows: Rows, renamed: ReadonlyArray<readonly [string, string]>): Rows {
  if (renamed.length === 0) {
    return new Map(rows);
  }
  const newPath = new Map(renamed.map(([from, to]) => [from, to]));
  const names = (path: string | undefined): boolean => path !== undefined && newPath.has(path);
  const next: Rows = new Map();
  for (const [path, file] of rows) {
    const touched =
      file.entries.some((entry) => names(entry.declarer)) ||
      file.dependencies.some((line) => names(line.to)) ||
      file.reExports.some((entry) => names(entry.from)) ||
      file.symbols.some((symbol) => symbol.references.some((reference) => names(reference.to)));
    next.set(newPath.get(path) ?? path, touched ? renamedFile(file, newPath) : file);
  }
  return next;
}

function renamedFile(file: FileRows, newPath: ReadonlyMap<string, string>): FileRows {
  const moved = <T extends object, K extends keyof T>(value: T, key: K): T => {
    const path = value[key] as unknown as string | undefined;
    const to = path === undefined ? undefined : newPath.get(path);
    return to === undefined ? value : { ...value, [key]: to };
  };
  return {
    ...file,
    entries: file.entries.map((entry) => moved(entry, "declarer")),
    symbols: file.symbols.map((symbol) => (symbol.references.some((reference) => reference.to !== undefined && newPath.has(reference.to)) ? { ...symbol, references: symbol.references.map((reference) => moved(reference, "to")) } : symbol)),
    dependencies: file.dependencies.map((line) => moved(line, "to")),
    reExports: file.reExports.map((entry) => moved(entry, "from"))
  };
}

/**
 * The change of rows from one change to the next, given the step's change of shape, whose renames it follows and
 * whose births and deaths it relies on. Applying the two to `before` gives `after` exactly.
 */
export function deriveRowsChange(before: Rows, after: Rows, change: ShapeChange): RowsChange {
  const rows = emptyRowsChange();
  const moved = renameRows(before, change.renamed);
  for (const [path, next] of after) {
    const previous = moved.get(path) ?? emptyFileRows();
    deriveSymbols(path, previous.symbols, next.symbols, rows);
    if (!same(previous.entries, next.entries)) rows.entryLines.push([path, next.entries]);
    if (!same(previous.dependencies, next.dependencies)) rows.dependencyLines.push([path, next.dependencies]);
    if (!same(previous.reExports, next.reExports)) rows.reExports.push([path, next.reExports]);
    if (!same(previous.citedBy, next.citedBy)) rows.citedBy.push([path, next.citedBy]);
    if (previous.authored !== next.authored) rows.authored.push([path, next.authored]);
  }
  return rows;
}

function deriveSymbols(path: string, previous: readonly RowSymbol[], next: readonly RowSymbol[], rows: RowsChange): void {
  const nextSlugs = new Set(next.map((symbol) => symbol.slug));
  const previousSlugs = new Set(previous.map((symbol) => symbol.slug));
  const gone = previous.filter((symbol) => !nextSlugs.has(symbol.slug));
  const born = next.filter((symbol) => !previousSlugs.has(symbol.slug));
  const renamedTo = symbolRenames(gone, born);
  const renamedFrom = new Map([...renamedTo].map(([from, to]) => [to, from]));
  // Each symbol that stays, by its anchor before the step and after it.
  const later = (slug: string): string | undefined => (nextSlugs.has(slug) ? slug : renamedTo.get(slug));
  const earlier = new Map(previous.map((symbol) => [symbol.slug, symbol]));
  for (const symbol of gone) {
    if (!renamedTo.has(symbol.slug)) rows.symbolsGone.push([path, symbol.slug]);
  }
  next.forEach((symbol, index) => {
    const from = previousSlugs.has(symbol.slug) ? symbol.slug : renamedFrom.get(symbol.slug);
    if (from === undefined) {
      rows.symbolsBorn.push([path, index, symbol]);
    } else if (!same(earlier.get(from), symbol)) {
      rows.symbolsChanged.push([path, from, symbol]);
    }
  });
  const stayedBefore = previous.map((symbol) => later(symbol.slug)).filter((slug): slug is string => slug !== undefined);
  const stayedAfter = next.map((symbol) => symbol.slug).filter((slug) => previousSlugs.has(slug) || renamedFrom.has(slug));
  if (!same(stayedBefore, stayedAfter)) {
    rows.symbolsOrdered.push([path, next.map((symbol) => symbol.slug)]);
  }
}

/**
 * The symbols renamed in one file at one step, from the anchor gone to the anchor born: a pair of the same kind whose
 * descriptions are one text, not none, each the only such partner of the other.
 */
function symbolRenames(gone: readonly RowSymbol[], born: readonly RowSymbol[]): Map<string, string> {
  const key = (symbol: RowSymbol): string | undefined => (symbol.text === undefined ? undefined : `${symbol.kind}\u0000${symbol.text}`);
  const group = (symbols: readonly RowSymbol[]): Map<string, RowSymbol[]> => {
    const groups = new Map<string, RowSymbol[]>();
    for (const symbol of symbols) {
      const at = key(symbol);
      if (at !== undefined) groups.set(at, [...(groups.get(at) ?? []), symbol]);
    }
    return groups;
  };
  const goneBy = group(gone);
  const bornBy = group(born);
  const renames = new Map<string, string>();
  for (const [at, from] of goneBy) {
    const to = bornBy.get(at);
    if (from.length === 1 && to?.length === 1) renames.set(from[0].slug, to[0].slug);
  }
  return renames;
}

/**
 * The rows after a step: the step's change of shape and change of rows applied, in the format's order. The rows given
 * are not changed; a file the step leaves alone is the same object after it.
 */
export function applyRowsChange(rows: Rows, change: ShapeChange, rowsChange: RowsChange): Rows {
  const next = renameRows(rows, change.renamed);
  for (const path of change.dead) next.delete(path);
  const own = new Set<string>();
  for (const [path] of change.born) {
    next.set(path, emptyFileRows());
    own.add(path);
  }
  // A file is copied the first time the step changes it, so that the rows before the step stay as they were.
  const file = (path: string): FileRows => {
    const found = next.get(path);
    if (!found) throw new Error(`a step changes the rows of ${path}, which the rows do not hold`);
    if (own.has(path)) return found;
    const copy = { ...found, symbols: [...found.symbols] };
    next.set(path, copy);
    own.add(path);
    return copy;
  };
  const indexOf = (path: string, slug: string): number => {
    const index = file(path).symbols.findIndex((symbol) => symbol.slug === slug);
    if (index < 0) throw new Error(`a step changes the symbol ${slug} of ${path}, which its rows do not hold`);
    return index;
  };
  for (const [path, slug] of rowsChange.symbolsGone) {
    file(path).symbols.splice(indexOf(path, slug), 1);
  }
  for (const [path, slug, symbol] of rowsChange.symbolsChanged) {
    file(path).symbols[indexOf(path, slug)] = copySymbol(symbol);
  }
  for (const [path, index, symbol] of rowsChange.symbolsBorn) {
    file(path).symbols.splice(index, 0, copySymbol(symbol));
  }
  for (const [path, slugs] of rowsChange.symbolsOrdered) {
    const bySlug = new Map(file(path).symbols.map((symbol) => [symbol.slug, symbol]));
    if (slugs.length !== bySlug.size || slugs.some((slug) => !bySlug.has(slug))) {
      throw new Error(`a step orders the symbols of ${path} as ${slugs.join(", ")}, which are not the symbols its rows hold`);
    }
    file(path).symbols = slugs.map((slug) => bySlug.get(slug)!);
  }
  for (const [path, entries] of rowsChange.entryLines) file(path).entries = entries.map((entry) => ({ ...entry }));
  for (const [path, lines] of rowsChange.dependencyLines) file(path).dependencies = lines.map((line) => ({ ...line }));
  for (const [path, entries] of rowsChange.reExports) file(path).reExports = entries.map((entry) => ({ ...entry }));
  for (const [path, documents] of rowsChange.citedBy) file(path).citedBy = [...documents];
  for (const [path, authored] of rowsChange.authored) file(path).authored = authored;
  return next;
}

function copySymbol(symbol: RowSymbol): RowSymbol {
  return { ...symbol, flags: [...symbol.flags], references: symbol.references.map((reference) => ({ ...reference })) };
}

/** Where two rows differ, in words, at most `limit` of them; empty when they are the same rows. */
export function rowsDifferences(expected: Rows, actual: Rows, limit = 5): string[] {
  const differences: string[] = [];
  const say = (line: string): void => {
    if (differences.length < limit) differences.push(line);
  };
  for (const [path, file] of expected) {
    const other = actual.get(path);
    if (!other) {
      say(`the rows of ${path} are missing`);
      continue;
    }
    const slugs = file.symbols.map((symbol) => symbol.slug);
    const otherSlugs = other.symbols.map((symbol) => symbol.slug);
    if (!same(slugs, otherSlugs)) {
      say(`${path} lists the symbols ${otherSlugs.join(", ") || "none"} where ${slugs.join(", ") || "none"} were expected`);
    } else {
      file.symbols.forEach((symbol, index) => {
        if (!same(symbol, other.symbols[index])) say(`the symbol ${symbol.slug} of ${path} is ${JSON.stringify(other.symbols[index])} where ${JSON.stringify(symbol)} was expected`);
      });
    }
    for (const field of ["entries", "dependencies", "reExports", "citedBy", "authored"] as const) {
      if (!same(file[field], other[field])) say(`the ${field} of ${path} are ${JSON.stringify(other[field])} where ${JSON.stringify(file[field])} were expected`);
    }
  }
  for (const path of actual.keys()) {
    if (!expected.has(path)) say(`the rows of ${path} are present and were not expected`);
  }
  return differences;
}

/** One link between rows: from a symbol of a file, or from the file's dependency lines, to a file or a symbol of it. */
export interface RowLink {
  from: string;
  /** The anchor of the symbol whose type reference makes the link; absent for a dependency line. */
  fromSymbol?: string;
  to: string;
  /** The anchor of the symbol the link names on its target, when it names one. */
  toSymbol?: string;
  kind: EdgeKind;
  /** How many references or lines make it. */
  count: number;
}

/**
 * Every link between two different files the rows make, by its ends and kind with how many references or lines make
 * it, sorted; only the links of the files `from` names when given. The links of one file to itself are no links.
 */
export function linksOf(rows: Rows, from?: ReadonlySet<string>): RowLink[] {
  const counted = new Map<string, RowLink>();
  const add = (link: Omit<RowLink, "count">): void => {
    if (link.to === link.from) return;
    // No path, anchor or kind holds the NUL character.
    const key = [link.from, link.fromSymbol ?? "", link.to, link.toSymbol ?? "", link.kind].join("\u0000");
    const existing = counted.get(key);
    if (existing) existing.count += 1;
    else counted.set(key, { ...link, count: 1 });
  };
  for (const [path, file] of rows) {
    if (from !== undefined && !from.has(path)) continue;
    for (const line of file.dependencies) {
      if (line.to !== undefined) add({ from: path, to: line.to, ...(line.toSymbol !== undefined ? { toSymbol: line.toSymbol } : {}), kind: line.kind });
    }
    for (const symbol of file.symbols) {
      for (const reference of symbol.references) {
        if (reference.to !== undefined) add({ from: path, fromSymbol: symbol.slug, to: reference.to, ...(reference.toSymbol !== undefined ? { toSymbol: reference.toSymbol } : {}), kind: reference.role });
      }
    }
  }
  return [...counted.values()].sort(compareLinks);
}

/** Links in a stable order: by their source, its symbol, their target, its symbol, and their kind. */
export function compareLinks(a: RowLink, b: RowLink): number {
  return (
    compare(a.from, b.from) ||
    compare(a.fromSymbol ?? "", b.fromSymbol ?? "") ||
    compare(a.to, b.to) ||
    compare(a.toSymbol ?? "", b.toSymbol ?? "") ||
    compare(a.kind, b.kind)
  );
}

/**
 * Where the rows and a shape of the same change disagree about what both carry, in words, at most `limit`: the files,
 * each file's symbol count and entry mark, and each wire's count, which is the number of the source's lines and
 * references that resolved to the target. The shape and the rows are written as two streams of deltas; this holds
 * them to each other at every step.
 */
export function rowsAgainstShape(rows: Rows, shape: { files: ReadonlyMap<string, { symbols: number; entry: boolean }>; edges: ReadonlyMap<string, number> }, limit = 5): string[] {
  const differences: string[] = [];
  const say = (line: string): void => {
    if (differences.length < limit) differences.push(line);
  };
  for (const [path, file] of shape.files) {
    const own = rows.get(path);
    if (!own) say(`${path} has a shape and no rows`);
    else if (own.symbols.length !== file.symbols || (own.entries.length > 0) !== file.entry) say(`${path} has ${own.symbols.length} rows and ${own.entries.length} entries where its shape counts ${file.symbols} symbols${file.entry ? ", an entry" : ""}`);
  }
  for (const path of rows.keys()) {
    if (!shape.files.has(path)) say(`${path} has rows and no shape`);
  }
  // A wire counts every line and reference of its source that resolved to its target, as `linksOf` makes its links.
  const wires = new Map<string, number>();
  const count = (from: string, to: string | undefined): void => {
    if (to === undefined || to === from) return;
    const key = `${from}\u0000${to}`;
    wires.set(key, (wires.get(key) ?? 0) + 1);
  };
  for (const [path, file] of rows) {
    for (const line of file.dependencies) count(path, line.to);
    for (const symbol of file.symbols) for (const reference of symbol.references) count(path, reference.to);
  }
  for (const [key, count] of shape.edges) {
    if (wires.get(key) !== count) say(`the wire ${key.replace("\u0000", " -> ")} counts ${count} in the shape and ${wires.get(key) ?? 0} in the rows`);
  }
  for (const key of wires.keys()) {
    if (!shape.edges.has(key)) say(`the rows wire ${key.replace("\u0000", " -> ")}, which the shape does not`);
  }
  return differences;
}

/** Whether two values of the rows are the same, field by field, a field set to undefined the same as one left out. */
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => same(value, b[index]));
  }
  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  for (const key in x) {
    if (x[key] !== undefined && !same(x[key], y[key])) return false;
  }
  for (const key in y) {
    if (y[key] !== undefined && x[key] === undefined) return false;
  }
  return true;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
