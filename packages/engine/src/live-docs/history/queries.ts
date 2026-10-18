/**
 * The questions a sequence answers headlessly, as the plan's C9 asks them of
 * `inspect --at` and `inspect --between`: which step a change is, what a file
 * was at a change, the graph of a change for the pathfinder, and what changed
 * between two changes.
 *
 * @remarks
 * Every answer is from the shape alone: files, their archetypes, symbol
 * counts and entry marks, and the edges between them with their counts. The
 * symbols themselves, the kinds of the edges and every authored word were in
 * the docs of that change, which the sequence does not carry.
 *
 * @module
 */

import type { DocLocation, GraphFile, LiveDocGraph } from "../graph";
import type { CommitInfo, HistorySequence } from "./format";
import { changeAt, commitAt, seek } from "./sequence";
import { edgeEnds, edgeKey, type FileShape, type Shape } from "./shape";

/** The steps whose change id begins with `reference`, ignoring case; more than one when the reference is ambiguous. */
export function stepsMatching(sequence: HistorySequence, reference: string): number[] {
  const prefix = reference.trim().toLowerCase();
  if (prefix.length === 0) {
    return [];
  }
  const steps: number[] = [];
  for (let step = 0; step <= sequence.steps.length; step += 1) {
    if (commitAt(sequence, step).id.toLowerCase().startsWith(prefix)) {
      steps.push(step);
    }
  }
  return steps;
}

/**
 * The graph a shape describes, for the pathfinder: every file with its
 * archetype and its edges' ends, and nothing of its doc. Each file's
 * `docPath` is where its doc stood at that change; `symbols`, `entries`,
 * `dependencies` and `edges` are empty, since the shape does not carry them,
 * and a file's entry mark is read with {@link entryMarked}.
 */
export function graphOfShape(shape: Shape, location: DocLocation): LiveDocGraph {
  const files: Record<string, GraphFile> = {};
  const docsFolder = [location.root, location.baseLayer].map((segment) => segment.replace(/^(?:\.\/)+|\/+$/gu, "")).join("/");
  for (const path of [...shape.files.keys()].sort(compare)) {
    files[path] = {
      codePath: path,
      docPath: `${docsFolder}/${path}${location.extension}`,
      layer: 4,
      archetype: shape.files.get(path)!.archetype,
      entries: [],
      authored: "",
      symbols: [],
      dependencies: [],
      edges: [],
      outbound: [],
      inbound: []
    };
  }
  for (const key of shape.edges.keys()) {
    const [from, to] = edgeEnds(key);
    files[from].outbound.push(to);
    files[to].inbound.push(from);
  }
  for (const file of Object.values(files)) {
    file.outbound.sort(compare);
    file.inbound.sort(compare);
  }
  return { root: location.root, baseLayer: location.baseLayer, extension: location.extension, files };
}

/**
 * Whether a file of a graph made by {@link graphOfShape} is an entry, as the
 * pathfinder's walk from the entries asks: its doc carried an Entry line at
 * that change, or it is a test, which a runner starts.
 */
export function entryMarked(shape: Shape): (file: GraphFile) => boolean {
  return (file) => shape.files.get(file.codePath)?.entry === true || file.archetype === "test";
}

/** A file's neighbour at a change, with the edge's count. */
export interface Neighbour {
  codePath: string;
  count: number;
}

/** What a file was at a change. */
export interface FileAtChange {
  codePath: string;
  /** Whether the file existed then; the rest is present only when it did. */
  exists: boolean;
  archetype?: string;
  symbols?: number;
  entry?: boolean;
  /** The files it had edges to, with their counts. */
  outbound?: Neighbour[];
  /** The files that had edges to it, with their counts. */
  inbound?: Neighbour[];
}

/** What a file was in a shape: whether it existed, its shape, and its neighbours either way. */
export function fileOfShape(shape: Shape, codePath: string): FileAtChange {
  const file: FileShape | undefined = shape.files.get(codePath);
  if (!file) {
    return { codePath, exists: false };
  }
  const outbound: Neighbour[] = [];
  const inbound: Neighbour[] = [];
  for (const [key, count] of shape.edges) {
    const [from, to] = edgeEnds(key);
    if (from === codePath) {
      outbound.push({ codePath: to, count });
    }
    if (to === codePath) {
      inbound.push({ codePath: from, count });
    }
  }
  outbound.sort((a, b) => compare(a.codePath, b.codePath));
  inbound.sort((a, b) => compare(a.codePath, b.codePath));
  return { codePath, exists: true, archetype: file.archetype, symbols: file.symbols, entry: file.entry, outbound, inbound };
}

/** What changed from one change of a sequence to a later one, every list sorted. */
export interface ChangesBetween {
  from: CommitInfo;
  to: CommitInfo;
  /** Files at the later change that did not descend from a file at the earlier one. */
  born: string[];
  /** Files at the earlier change with no descendant at the later one, by their earlier paths. */
  dead: string[];
  /** Files that stand at the later change under another path, through every rename between. */
  renamed: Array<{ from: string; to: string }>;
  /** Files whose symbol count differs, by their later paths. */
  resized: Array<{ codePath: string; before: number; after: number }>;
  /** Edges at the later change that were not at the earlier one, followed through the renames, by their later paths. */
  edgesAdded: Array<{ from: string; to: string }>;
  /** Edges at the earlier change that are not at the later one, by their earlier paths. */
  edgesRemoved: Array<{ from: string; to: string }>;
}

/**
 * What changed from step `from` to the later step `to`, a file followed
 * through every rename between, so that a file renamed twice is one rename
 * and a file born and dead between them is neither.
 */
export function changesBetween(sequence: HistorySequence, from: number, to: number): ChangesBetween {
  if (to < from) {
    throw new RangeError(`step ${to} comes before step ${from}; give the earlier change first`);
  }
  const before = seek(sequence, from);
  // The earlier path of every file now standing that stood at `from`; a file born since has none.
  const origin = new Map<string, string>([...before.files.keys()].map((path) => [path, path]));
  const dead: string[] = [];
  const bornSince = new Set<string>();
  for (let step = from + 1; step <= to; step += 1) {
    const change = changeAt(sequence, step);
    const renamedOrigins = change.renamed.map(([old, current]): [string, string | undefined] => [current, origin.get(old)]);
    for (const [old, current] of change.renamed) {
      origin.delete(old);
      if (bornSince.delete(old)) {
        bornSince.add(current);
      }
    }
    for (const [current, earlier] of renamedOrigins) {
      if (earlier !== undefined) {
        origin.set(current, earlier);
      }
    }
    for (const path of change.dead) {
      const earlier = origin.get(path);
      if (earlier !== undefined) {
        dead.push(earlier);
        origin.delete(path);
      }
      bornSince.delete(path);
    }
    for (const [path] of change.born) {
      bornSince.add(path);
    }
  }

  const after = seek(sequence, to);
  const later = new Map<string, string>([...origin].map(([current, earlier]) => [earlier, current]));
  const renamed: ChangesBetween["renamed"] = [];
  const resized: ChangesBetween["resized"] = [];
  for (const [current, earlier] of origin) {
    if (current !== earlier) {
      renamed.push({ from: earlier, to: current });
    }
    const symbolsBefore = before.files.get(earlier)!.symbols;
    const symbolsAfter = after.files.get(current)!.symbols;
    if (symbolsBefore !== symbolsAfter) {
      resized.push({ codePath: current, before: symbolsBefore, after: symbolsAfter });
    }
  }

  const edgesRemoved: ChangesBetween["edgesRemoved"] = [];
  const followed = new Set<string>();
  for (const key of before.edges.keys()) {
    const [source, target] = edgeEnds(key);
    const laterSource = later.get(source);
    const laterTarget = later.get(target);
    if (laterSource !== undefined && laterTarget !== undefined && after.edges.has(edgeKey(laterSource, laterTarget))) {
      followed.add(edgeKey(laterSource, laterTarget));
    } else {
      edgesRemoved.push({ from: source, to: target });
    }
  }
  const edgesAdded = [...after.edges.keys()].filter((key) => !followed.has(key)).map((key) => {
    const [source, target] = edgeEnds(key);
    return { from: source, to: target };
  });

  const byPair = (a: { from: string; to: string }, b: { from: string; to: string }): number => compare(a.from, b.from) || compare(a.to, b.to);
  return {
    from: commitAt(sequence, from),
    to: commitAt(sequence, to),
    born: [...bornSince].sort(compare),
    dead: dead.sort(compare),
    renamed: renamed.sort(byPair),
    resized: resized.sort((a, b) => compare(a.codePath, b.codePath)),
    edgesAdded: edgesAdded.sort(byPair),
    edgesRemoved: edgesRemoved.sort(byPair)
  };
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
