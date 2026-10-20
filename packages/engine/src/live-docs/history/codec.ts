/**
 * Between the sequence's file and its meaning: shapes and changes named by
 * path, as the derivation and the readers think of them, and the tuples of
 * `history.json`, which name every path and archetype by its index in a table
 * written once.
 *
 * @module
 */

import type { EdgeEnds, EdgeTuple, FileTuple, SnapshotTuples, StepDelta } from "./format";
import { edgeEnds, edgeKey, emptyChange, type FileShape, type Shape, type ShapeChange } from "./shape";

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

/** The tables a sequence's tuples are read against. */
export interface Tables {
  paths: readonly string[];
  archetypes: readonly string[];
}

/** The tables a sequence's tuples are written against, growing as new paths and archetypes are met. */
export interface Interners {
  paths: Interner;
  archetypes: Interner;
}

/** A shape as tuples sorted by id; a path new to the tables is added in path order. */
export function encodeShape(shape: Shape, interners: Interners): SnapshotTuples {
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
export function decodeShape(tuples: SnapshotTuples, tables: Tables): Shape {
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
export function encodeChange(change: ShapeChange, interners: Interners): StepDelta {
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

function encodeFile(path: string, file: FileShape, interners: Interners): FileTuple {
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
