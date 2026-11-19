/**
 * Between the sequence's file and its meaning: shapes and changes named by
 * path, as the derivation and the readers think of them, and the tuples of
 * `history.json`, which name every path and archetype by its index in a table
 * written once.
 *
 * @module
 */

import {
  NO_WORDS,
  UNREAD_WORDS,
  type DependencyTuple,
  type EdgeEnds,
  type EdgeTuple,
  type EntryTuple,
  type FileRowsTuple,
  type FileTuple,
  type ReExportTuple,
  type ReferenceTuple,
  type ShapeTuples,
  type StepDelta,
  type SymbolTuple
} from "./format";
import { emptyFileRows, emptyRowsChange, type AuthoredWords, type FileRows, type Rows, type RowsChange, type RowSymbol } from "./rows";
import { edgeEnds, edgeKey, emptyChange, type FileShape, type Shape, type ShapeChange } from "./shape";
import type { DependencyRow, EntryRow, ReExportRow, ReferenceRole, RowReference } from "./summary";

/** A table of strings, each written once, each named by its index. */
export class Interner {
  /** The strings in the order they were first met; a string's id is its index here. */
  readonly values: string[];
  private readonly ids = new Map<string, number>();

  /** A table that begins with `values`, in their order. */
  constructor(values: readonly string[] = []) {
    this.values = [];
    for (const value of values) {
      this.id(value);
    }
  }

  /** The string's id, added to the table when it is new. */
  id(value: string): number {
    let id = this.ids.get(value);
    if (id === undefined) {
      id = this.values.length;
      this.values.push(value);
      this.ids.set(value, id);
    }
    return id;
  }
}

/** The tables a sequence's shape tuples are read against. */
export interface Tables {
  paths: readonly string[];
  archetypes: readonly string[];
}

/** The tables a sequence's rows are read against: the shape's, and the names of format 3. */
export interface RowTables extends Tables {
  names: readonly string[];
}

/** The tables a sequence's shape tuples are written against, growing as new paths and archetypes are met. */
export interface ShapeInterners {
  paths: Interner;
  archetypes: Interner;
}

/** The tables all of a sequence's tuples are written against, the names of format 3 with the shape's. */
export interface Interners extends ShapeInterners {
  names: Interner;
}

/** Empty tables to write a sequence against. */
export function newInterners(): Interners {
  return { paths: new Interner(), archetypes: new Interner(), names: new Interner() };
}

/** A shape as tuples sorted by id; a path new to the tables is added in path order. */
export function encodeShape(shape: Shape, interners: ShapeInterners): ShapeTuples {
  const files = [...shape.files.keys()].sort(compare).map((path) => encodeFile(path, shape.files.get(path)!, interners));
  const edges = [...shape.edges.entries()].map(([key, count]): EdgeTuple => {
    const [from, to] = edgeEnds(key);
    return [interners.paths.id(from), interners.paths.id(to), count];
  });
  const docLinks = [...shape.docLinks].map((key): EdgeEnds => {
    const [from, doc] = edgeEnds(key);
    return [interners.paths.id(from), interners.paths.id(doc)];
  });
  files.sort((a, b) => a[0] - b[0]);
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  docLinks.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return { files, edges, docLinks };
}

/** The shape a snapshot's tuples describe. */
export function decodeShape(tuples: ShapeTuples, tables: Tables): Shape {
  const files = new Map<string, FileShape>();
  for (const tuple of tuples.files) {
    files.set(tables.paths[tuple[0]], decodeFile(tuple, tables));
  }
  const edges = new Map<string, number>();
  for (const [from, to, count] of tuples.edges) {
    edges.set(edgeKey(tables.paths[from], tables.paths[to]), count);
  }
  const docLinks = new Set<string>();
  for (const [from, doc] of tuples.docLinks) {
    docLinks.add(edgeKey(tables.paths[from], tables.paths[doc]));
  }
  return { files, edges, docLinks };
}

/** A change as a step's delta, its empty lists left out. */
export function encodeChange(change: ShapeChange, interners: ShapeInterners): StepDelta {
  const path = (value: string): number => interners.paths.id(value);
  const delta: StepDelta = {};
  setIfAny(delta, "renamed", change.renamed.map(([from, to]): [number, number] => [path(from), path(to)]));
  setIfAny(delta, "dead", change.dead.map(path));
  setIfAny(delta, "born", change.born.map(([at, file]) => encodeFile(at, file, interners)));
  setIfAny(delta, "resized", change.resized.map(([at, symbols]): [number, number] => [path(at), symbols]));
  setIfAny(delta, "rekinded", change.rekinded.map(([at, archetype]): [number, number] => [path(at), interners.archetypes.id(archetype)]));
  setIfAny(delta, "entries", change.entries.map(([at, entry]): [number, 0 | 1] => [path(at), entry ? 1 : 0]));
  setIfAny(delta, "edgesAdded", change.edgesAdded.map(([from, to, count]): EdgeTuple => [path(from), path(to), count]));
  setIfAny(delta, "edgesRemoved", change.edgesRemoved.map(([from, to]): [number, number] => [path(from), path(to)]));
  setIfAny(delta, "edgesChanged", change.edgesChanged.map(([from, to, count]): EdgeTuple => [path(from), path(to), count]));
  setIfAny(delta, "docLinksAdded", change.docLinksAdded.map(([from, doc]): EdgeEnds => [path(from), path(doc)]));
  setIfAny(delta, "docLinksRemoved", change.docLinksRemoved.map(([from, doc]): EdgeEnds => [path(from), path(doc)]));
  setIfAny(delta, "directoriesRenamed", change.directoriesRenamed.map(([from, to]): [string, string] => [from, to]));
  setIfAny(delta, "touched", change.touched.map(path));
  return delta;
}

/** The change a step's delta describes, every list present. */
export function decodeChange(delta: StepDelta, tables: Tables): ShapeChange {
  const path = (id: number): string => tables.paths[id];
  const change = emptyChange();
  change.renamed = (delta.renamed ?? []).map(([from, to]) => [path(from), path(to)]);
  change.dead = (delta.dead ?? []).map(path);
  change.born = (delta.born ?? []).map((tuple) => [path(tuple[0]), decodeFile(tuple, tables)]);
  change.resized = (delta.resized ?? []).map(([at, symbols]) => [path(at), symbols]);
  change.rekinded = (delta.rekinded ?? []).map(([at, archetype]) => [path(at), tables.archetypes[archetype]]);
  change.entries = (delta.entries ?? []).map(([at, entry]) => [path(at), entry === 1]);
  change.edgesAdded = (delta.edgesAdded ?? []).map(([from, to, count]) => [path(from), path(to), count]);
  change.edgesRemoved = (delta.edgesRemoved ?? []).map(([from, to]) => [path(from), path(to)]);
  change.edgesChanged = (delta.edgesChanged ?? []).map(([from, to, count]) => [path(from), path(to), count]);
  change.docLinksAdded = (delta.docLinksAdded ?? []).map(([from, doc]) => [path(from), path(doc)]);
  change.docLinksRemoved = (delta.docLinksRemoved ?? []).map(([from, doc]) => [path(from), path(doc)]);
  change.directoriesRenamed = (delta.directoriesRenamed ?? []).map(([from, to]) => [from, to]);
  change.touched = (delta.touched ?? []).map(path);
  return change;
}

/** Every file's rows as tuples, sorted by path id; a path or name new to the tables is added as it is met, in path order. */
export function encodeRows(rows: Rows, interners: Interners): FileRowsTuple[] {
  const tuples = [...rows.keys()].sort(compare).map((path) => encodeFileRows(path, rows.get(path)!, interners));
  return tuples.sort((a, b) => a[0] - b[0]);
}

/** The rows a snapshot's row tuples describe. */
export function decodeRows(tuples: readonly FileRowsTuple[], tables: RowTables): Rows {
  const rows: Rows = new Map();
  for (const tuple of tuples) {
    rows.set(tables.paths[tuple[0]], decodeFileRows(tuple, tables));
  }
  return rows;
}

/** A change of rows as the rows' part of a step's delta, its empty lists left out. */
export function encodeRowsChange(change: RowsChange, interners: Interners): StepDelta {
  const path = (value: string): number => interners.paths.id(value);
  const name = (value: string): number => interners.names.id(value);
  const delta: StepDelta = {};
  setIfAny(delta, "symbolsGone", change.symbolsGone.map(([at, slug]): [number, number] => [path(at), name(slug)]));
  setIfAny(delta, "symbolsChanged", change.symbolsChanged.map(([at, slug, symbol]): [number, number, SymbolTuple] => [path(at), name(slug), encodeSymbol(symbol, interners)]));
  setIfAny(delta, "symbolsBorn", change.symbolsBorn.map(([at, index, symbol]): [number, number, SymbolTuple] => [path(at), index, encodeSymbol(symbol, interners)]));
  setIfAny(delta, "symbolsOrdered", change.symbolsOrdered.map(([at, slugs]): [number, number[]] => [path(at), slugs.map(name)]));
  setIfAny(delta, "entryLines", change.entryLines.map(([at, entries]): [number, EntryTuple[]] => [path(at), entries.map((entry) => encodeEntry(entry, interners))]));
  setIfAny(
    delta,
    "dependencyLines",
    change.dependencyLines.map(([at, removed, added]): [number, number[], Array<[number, DependencyTuple]>] => [path(at), removed, added.map(([index, line]): [number, DependencyTuple] => [index, encodeDependency(line, interners)])])
  );
  setIfAny(delta, "reExports", change.reExports.map(([at, entries]): [number, ReExportTuple[]] => [path(at), entries.map((entry) => encodeReExport(entry, interners))]));
  setIfAny(delta, "citedBy", change.citedBy.map(([at, documents]): [number, number[]] => [path(at), documents.map(path)]));
  setIfAny(delta, "authored", change.authored.map(([at, words]): [number, number] => [path(at), encodeWords(words)]));
  return delta;
}

/** The change of rows a step's delta describes, every list present. */
export function decodeRowsChange(delta: StepDelta, tables: RowTables): RowsChange {
  const path = (id: number): string => tables.paths[id];
  const name = (id: number): string => tables.names[id];
  const change = emptyRowsChange();
  change.symbolsGone = (delta.symbolsGone ?? []).map(([at, slug]) => [path(at), name(slug)]);
  change.symbolsChanged = (delta.symbolsChanged ?? []).map(([at, slug, symbol]) => [path(at), name(slug), decodeSymbol(symbol, tables)]);
  change.symbolsBorn = (delta.symbolsBorn ?? []).map(([at, index, symbol]) => [path(at), index, decodeSymbol(symbol, tables)]);
  change.symbolsOrdered = (delta.symbolsOrdered ?? []).map(([at, slugs]) => [path(at), slugs.map(name)]);
  change.entryLines = (delta.entryLines ?? []).map(([at, entries]) => [path(at), entries.map((entry) => decodeEntry(entry, tables))]);
  change.dependencyLines = (delta.dependencyLines ?? []).map(([at, removed, added]) => [path(at), [...removed], added.map(([index, line]): [number, DependencyRow] => [index, decodeDependency(line, tables)])]);
  change.reExports = (delta.reExports ?? []).map(([at, entries]) => [path(at), entries.map((entry) => decodeReExport(entry, tables))]);
  change.citedBy = (delta.citedBy ?? []).map(([at, documents]) => [path(at), documents.map(path)]);
  change.authored = (delta.authored ?? []).map(([at, words]) => [path(at), decodeWords(words)]);
  return change;
}

function encodeFileRows(path: string, file: FileRows, interners: Interners): FileRowsTuple {
  return trimmed<FileRowsTuple>(
    [
      interners.paths.id(path),
      encodeWords(file.authored),
      file.symbols.map((symbol) => encodeSymbol(symbol, interners)),
      file.dependencies.map((line) => encodeDependency(line, interners)),
      file.entries.map((entry) => encodeEntry(entry, interners)),
      file.reExports.map((entry) => encodeReExport(entry, interners)),
      file.citedBy.map((document) => interners.paths.id(document))
    ],
    [NO_WORDS, [], [], [], [], []]
  );
}

function decodeFileRows(tuple: FileRowsTuple, tables: RowTables): FileRows {
  const [, authored = NO_WORDS, symbols = [], dependencies = [], entries = [], reExports = [], citedBy = []] = tuple;
  return {
    ...emptyFileRows(),
    authored: decodeWords(authored),
    symbols: symbols.map((symbol) => decodeSymbol(symbol, tables)),
    dependencies: dependencies.map((line) => decodeDependency(line, tables)),
    entries: entries.map((entry) => decodeEntry(entry, tables)),
    reExports: reExports.map((entry) => decodeReExport(entry, tables)),
    citedBy: citedBy.map((id) => tables.paths[id])
  };
}

function encodeWords(words: AuthoredWords): number {
  return words === "none" ? NO_WORDS : words === "unread" ? UNREAD_WORDS : words;
}

function decodeWords(words: number): AuthoredWords {
  return words === NO_WORDS ? "none" : words === UNREAD_WORDS ? "unread" : words;
}

function encodeSymbol(symbol: RowSymbol, interners: Interners): SymbolTuple {
  const name = (value: string): number => interners.names.id(value);
  return trimmed<SymbolTuple>(
    [name(symbol.name), name(symbol.slug), name(symbol.kind), symbol.flags.map(name), symbol.references.map((reference) => encodeReference(reference, interners)), symbol.text ?? -1],
    [[], [], -1]
  );
}

function decodeSymbol(tuple: SymbolTuple, tables: RowTables): RowSymbol {
  const [nameId, slugId, kindId, flags = [], references = [], text = -1] = tuple;
  return {
    name: tables.names[nameId],
    slug: tables.names[slugId],
    kind: tables.names[kindId],
    flags: flags.map((id) => tables.names[id]),
    references: references.map((reference) => decodeReference(reference, tables)),
    ...(text >= 0 ? { text } : {})
  };
}

const ARRAY_MARK = 1;
const PROMISE_MARK = 2;
const TYPE_ONLY_MARK = 1;

function encodeReference(reference: RowReference, interners: Interners): ReferenceTuple {
  const name = (value: string): number => interners.names.id(value);
  const marks = (reference.array ? ARRAY_MARK : 0) | (reference.promise ? PROMISE_MARK : 0);
  return trimmed<ReferenceTuple>(
    [
      name(reference.role),
      name(reference.type),
      reference.parameter !== undefined ? name(reference.parameter) : -1,
      marks,
      reference.to !== undefined ? interners.paths.id(reference.to) : -1,
      reference.toSymbol !== undefined ? name(reference.toSymbol) : -1
    ],
    [-1, 0, -1, -1]
  );
}

function decodeReference(tuple: ReferenceTuple, tables: RowTables): RowReference {
  const [roleId, typeId, parameterId = -1, marks = 0, toPathId = -1, toSlugId = -1] = tuple;
  return {
    role: tables.names[roleId] as ReferenceRole,
    ...(parameterId >= 0 ? { parameter: tables.names[parameterId] } : {}),
    type: tables.names[typeId],
    ...(marks & ARRAY_MARK ? { array: true as const } : {}),
    ...(marks & PROMISE_MARK ? { promise: true as const } : {}),
    ...(toPathId >= 0 ? { to: tables.paths[toPathId] } : {}),
    ...(toSlugId >= 0 ? { toSymbol: tables.names[toSlugId] } : {})
  };
}

function encodeDependency(line: DependencyRow, interners: Interners): DependencyTuple {
  const name = (value: string): number => interners.names.id(value);
  return trimmed<DependencyTuple>(
    [
      name(line.label),
      line.kind === "re-export" ? 1 : 0,
      line.typeOnly ? TYPE_ONLY_MARK : 0,
      line.basis !== undefined ? name(line.basis) : -1,
      line.to !== undefined ? interners.paths.id(line.to) : -1,
      line.toSymbol !== undefined ? name(line.toSymbol) : -1,
      (line.symbols ?? []).map(name)
    ],
    [0, -1, -1, -1, []]
  );
}

function decodeDependency(tuple: DependencyTuple, tables: RowTables): DependencyRow {
  const [labelId, kind, marks = 0, basisId = -1, toPathId = -1, toSlugId = -1, symbols = []] = tuple;
  return {
    label: tables.names[labelId],
    kind: kind === 1 ? "re-export" : "import",
    ...(marks & TYPE_ONLY_MARK ? { typeOnly: true as const } : {}),
    ...(basisId >= 0 ? { basis: tables.names[basisId] as DependencyRow["basis"] } : {}),
    ...(symbols.length > 0 ? { symbols: symbols.map((id) => tables.names[id]) } : {}),
    ...(toPathId >= 0 ? { to: tables.paths[toPathId] } : {}),
    ...(toSlugId >= 0 ? { toSymbol: tables.names[toSlugId] } : {})
  };
}

function encodeEntry(entry: EntryRow, interners: Interners): EntryTuple {
  const name = (value: string | undefined): number => (value === undefined ? -1 : interners.names.id(value));
  return trimmed<EntryTuple>([name(entry.reason), name(entry.symbol), name(entry.command), entry.declarer !== undefined ? interners.paths.id(entry.declarer) : -1], [-1, -1, -1]);
}

function decodeEntry(tuple: EntryTuple, tables: RowTables): EntryRow {
  const [reasonId, symbolId = -1, commandId = -1, declarerId = -1] = tuple;
  return {
    reason: tables.names[reasonId],
    ...(symbolId >= 0 ? { symbol: tables.names[symbolId] } : {}),
    ...(commandId >= 0 ? { command: tables.names[commandId] } : {}),
    ...(declarerId >= 0 ? { declarer: tables.paths[declarerId] } : {})
  };
}

function encodeReExport(entry: ReExportRow, interners: Interners): ReExportTuple {
  const name = (value: string | undefined): number => (value === undefined ? -1 : interners.names.id(value));
  return trimmed<ReExportTuple>(
    [name(entry.name), name(entry.slug), entry.from !== undefined ? interners.paths.id(entry.from) : -1, name(entry.fromLabel), (entry.flags ?? []).map((flag) => interners.names.id(flag))],
    [-1, -1, -1, []]
  );
}

function decodeReExport(tuple: ReExportTuple, tables: RowTables): ReExportRow {
  const [nameId, slugId = -1, fromId = -1, fromLabelId = -1, flags = []] = tuple;
  return {
    name: tables.names[nameId],
    ...(slugId >= 0 ? { slug: tables.names[slugId] } : {}),
    ...(fromId >= 0 ? { from: tables.paths[fromId] } : {}),
    ...(fromLabelId >= 0 ? { fromLabel: tables.names[fromLabelId] } : {}),
    ...(flags.length > 0 ? { flags: flags.map((id) => tables.names[id]) } : {})
  };
}

/**
 * A tuple with every element at its end that equals its default left out: `defaults` gives the defaults of the
 * optional elements, the last of the tuple's elements last.
 */
function trimmed<T extends unknown[]>(tuple: unknown[], defaults: readonly unknown[]): T {
  let length = tuple.length;
  const firstOptional = tuple.length - defaults.length;
  while (length > firstOptional && isDefault(tuple[length - 1], defaults[length - 1 - firstOptional])) {
    length -= 1;
  }
  return tuple.slice(0, length) as T;
}

function isDefault(value: unknown, fallback: unknown): boolean {
  return Array.isArray(value) ? Array.isArray(fallback) && value.length === 0 : value === fallback;
}

function encodeFile(path: string, file: FileShape, interners: ShapeInterners): FileTuple {
  return [interners.paths.id(path), interners.archetypes.id(file.archetype), file.symbols, file.entry ? 1 : 0];
}

function decodeFile(tuple: FileTuple, tables: Tables): FileShape {
  return { archetype: tables.archetypes[tuple[1]], symbols: tuple[2], entry: tuple[3] === 1 };
}

function setIfAny<K extends keyof StepDelta>(delta: StepDelta, key: K, values: NonNullable<StepDelta[K]>): void {
  if (values.length > 0) {
    delta[key] = values;
  }
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
