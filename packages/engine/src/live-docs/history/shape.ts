/**
 * The shape of the graph at one change, by path, and what a step does to it.
 *
 * @remarks
 * A shape is what the sequence knows of a change: every file with its
 * archetype, its symbol count and its entry mark, every directed edge
 * between two files with its count, and every link from a file's authored
 * words to a document that stood at the change (since 2026-10-20). A change of shape is one step's delta
 * named by path rather than by id; the codec turns one into the other. The
 * functions here are pure and never change a shape they are given.
 *
 * @module
 */

/** What the sequence knows of one file at one change. */
export interface FileShape {
  archetype: string;
  /** How many public symbols its doc lists. */
  symbols: number;
  /** Whether its doc carries an Entry line. */
  entry: boolean;
}

/** The shape of the graph at one change. */
export interface Shape {
  /** Every file, by its workspace-relative path. */
  files: Map<string, FileShape>;
  /** Every directed edge, by {@link edgeKey}, with how many of its source's references land on its target. */
  edges: Map<string, number>;
  /**
   * Every link from a file's authored words to a document that stood at the change, by {@link edgeKey} of the file
   * and the document's path. A document is not a file of the shape: a link names it by path alone.
   */
  docLinks: Set<string>;
}

/** What one step does to a shape, by path; see `StepDelta` for the order it is applied in. */
export interface ShapeChange {
  born: Array<[path: string, file: FileShape]>;
  dead: string[];
  renamed: Array<[from: string, to: string]>;
  resized: Array<[path: string, symbols: number]>;
  rekinded: Array<[path: string, archetype: string]>;
  entries: Array<[path: string, entry: boolean]>;
  edgesAdded: Array<[from: string, to: string, count: number]>;
  edgesRemoved: Array<[from: string, to: string]>;
  edgesChanged: Array<[from: string, to: string, count: number]>;
  docLinksAdded: Array<[from: string, doc: string]>;
  docLinksRemoved: Array<[from: string, doc: string]>;
  directoriesRenamed: Array<[from: string, to: string]>;
  touched: string[];
}

/** A change that changes nothing, to be filled in. */
export function emptyChange(): ShapeChange {
  return {
    born: [],
    dead: [],
    renamed: [],
    resized: [],
    rekinded: [],
    entries: [],
    edgesAdded: [],
    edgesRemoved: [],
    edgesChanged: [],
    docLinksAdded: [],
    docLinksRemoved: [],
    directoriesRenamed: [],
    touched: []
  };
}

// A path never holds the NUL character, so it can join the two ends of an edge into one key.
const EDGE_SEPARATOR = "\u0000";

/** The key of the directed edge from one file to another in {@link Shape.edges}. */
export function edgeKey(from: string, to: string): string {
  return `${from}${EDGE_SEPARATOR}${to}`;
}

/** The two ends of an edge's key. */
export function edgeEnds(key: string): [from: string, to: string] {
  const separator = key.indexOf(EDGE_SEPARATOR);
  return [key.slice(0, separator), key.slice(separator + 1)];
}

/** The shape with each renamed file moved to its new path, its shape, its edges and its doc links with it. */
export function renameShape(shape: Shape, renamed: ReadonlyArray<readonly [string, string]>): Shape {
  if (renamed.length === 0) {
    return { files: new Map(shape.files), edges: new Map(shape.edges), docLinks: new Set(shape.docLinks) };
  }
  const newPath = new Map(renamed.map(([from, to]) => [from, to]));
  const moved = (path: string): string => newPath.get(path) ?? path;
  const files = new Map<string, FileShape>();
  for (const [path, file] of shape.files) {
    files.set(moved(path), file);
  }
  const edges = new Map<string, number>();
  for (const [key, count] of shape.edges) {
    const [from, to] = edgeEnds(key);
    edges.set(edgeKey(moved(from), moved(to)), count);
  }
  const docLinks = new Set<string>();
  for (const key of shape.docLinks) {
    const [from, doc] = edgeEnds(key);
    docLinks.add(edgeKey(moved(from), doc));
  }
  return { files, edges, docLinks };
}

/** The shape after a step: the given shape with the change applied in the format's order. */
export function applyChange(shape: Shape, change: ShapeChange): Shape {
  const { files, edges, docLinks } = renameShape(shape, change.renamed);
  for (const [from, to] of change.edgesRemoved) {
    edges.delete(edgeKey(from, to));
  }
  for (const [from, doc] of change.docLinksRemoved) {
    docLinks.delete(edgeKey(from, doc));
  }
  for (const path of change.dead) {
    files.delete(path);
  }
  for (const [path, file] of change.born) {
    files.set(path, { ...file });
  }
  const update = (path: string, edit: Partial<FileShape>): void => {
    const file = files.get(path);
    if (!file) {
      throw new Error(`a step changes ${path}, which the shape does not hold`);
    }
    files.set(path, { ...file, ...edit });
  };
  for (const [path, symbols] of change.resized) {
    update(path, { symbols });
  }
  for (const [path, archetype] of change.rekinded) {
    update(path, { archetype });
  }
  for (const [path, entry] of change.entries) {
    update(path, { entry });
  }
  for (const [from, to, count] of [...change.edgesAdded, ...change.edgesChanged]) {
    edges.set(edgeKey(from, to), count);
  }
  for (const [from, doc] of change.docLinksAdded) {
    docLinks.add(edgeKey(from, doc));
  }
  return { files, edges, docLinks };
}

/**
 * Where two shapes differ, in words, at most `limit` of them; empty when they
 * are the same shape.
 */
export function shapeDifferences(expected: Shape, actual: Shape, limit = 5): string[] {
  const differences: string[] = [];
  const say = (line: string): void => {
    if (differences.length < limit) {
      differences.push(line);
    }
  };
  for (const [path, file] of expected.files) {
    const other = actual.files.get(path);
    if (!other) {
      say(`${path} is missing`);
    } else if (other.archetype !== file.archetype || other.symbols !== file.symbols || other.entry !== file.entry) {
      say(`${path} is ${describe(other)} where ${describe(file)} was expected`);
    }
  }
  for (const path of actual.files.keys()) {
    if (!expected.files.has(path)) {
      say(`${path} is present and was not expected`);
    }
  }
  for (const [key, count] of expected.edges) {
    const other = actual.edges.get(key);
    if (other !== count) {
      say(`the edge ${edgeEnds(key).join(" -> ")} counts ${other ?? "nothing"} where ${count} was expected`);
    }
  }
  for (const key of actual.edges.keys()) {
    if (!expected.edges.has(key)) {
      say(`the edge ${edgeEnds(key).join(" -> ")} is present and was not expected`);
    }
  }
  for (const key of expected.docLinks) {
    if (!actual.docLinks.has(key)) {
      say(`the doc link ${edgeEnds(key).join(" -> ")} is missing`);
    }
  }
  for (const key of actual.docLinks) {
    if (!expected.docLinks.has(key)) {
      say(`the doc link ${edgeEnds(key).join(" -> ")} is present and was not expected`);
    }
  }
  return differences;
}

function describe(file: FileShape): string {
  return `${file.archetype} with ${file.symbols} symbols${file.entry ? ", an entry" : ""}`;
}
