/**
 * What one step of the history changed, as the step panel says it (the plan's
 * C4): the commit, then the files born, dead, renamed and resized, the
 * directories renamed whole, the wires that came, went and changed their
 * count, and the files whose content changed while their shape did not. Each
 * file is read where it stands today, through every rename since, so that the
 * panel can pin it where it still exists and say "gone since" where it does
 * not, with its archetype and its symbol count at the step, since the docs of
 * that day are not in the bundle.
 *
 * Pure-function module: no DOM. The engine's sequence is the only source.
 *
 * @module step-summary
 */

import type { CommitInfo, HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { changeAt, commitAt, seek } from "@live-documentation/engine/live-docs/history/sequence";
import { edgeKey, type FileShape, type Shape } from "@live-documentation/engine/live-docs/history/shape";
import { followPath } from "@live-documentation/engine/live-docs/history/ticks";

/** Where a file of the step stands today: under a path the bundle holds, or gone, since a commit when the sequence saw it die. */
export type FileToday = { kind: "today"; path: string } | { kind: "gone"; since: CommitInfo | null };

/** A file as the panel names it: its path at the step, its shape there, and where it stands today. */
export interface SummaryFile {
  path: string;
  name: string;
  archetype: string;
  symbols: number;
  today: FileToday;
}

/** A directed wire between two files, by their paths at the step. */
export interface SummaryEdge {
  from: string;
  to: string;
  count: number;
}

/** The step, in the panel's order. */
export interface StepSummary {
  step: number;
  commit: CommitInfo;
  /** Whether this is the sequence's base, the beginning of what is known, which changed nothing. */
  base: boolean;
  /** The shape's size at the step. */
  files: number;
  edges: number;
  born: SummaryFile[];
  dead: SummaryFile[];
  renamed: Array<{ from: string; file: SummaryFile }>;
  directoriesRenamed: Array<{ from: string; to: string }>;
  resized: Array<{ file: SummaryFile; before: number; after: number }>;
  edgesAdded: SummaryEdge[];
  edgesRemoved: SummaryEdge[];
  edgesChanged: Array<SummaryEdge & { before: number }>;
  touched: SummaryFile[];
}

/** How many things the step changed, the wires counted with the files. */
export const changeCount = (summary: StepSummary): number =>
  summary.born.length + summary.dead.length + summary.renamed.length + summary.resized.length + summary.edgesAdded.length + summary.edgesRemoved.length + summary.edgesChanged.length + summary.touched.length;

/**
 * The summary of a step, given the shape at that step (so that the caller's
 * cursor is not seeked again) and whether a path stands in today's bundle.
 */
export function stepSummary(sequence: HistorySequence, step: number, shape: Shape, todayHas: (path: string) => boolean): StepSummary {
  const last = sequence.steps.length;
  const commit = commitAt(sequence, step);
  const change = changeAt(sequence, step);
  const fate = (path: string, at: number): FileToday => {
    const followed = followPath(sequence, path, at, last);
    if (followed.path === null) return { kind: "gone", since: commitAt(sequence, followed.step) };
    return todayHas(followed.path) ? { kind: "today", path: followed.path } : { kind: "gone", since: null };
  };
  const file = (path: string, shapeOf: FileShape | undefined, at: number): SummaryFile => ({
    path,
    name: path.slice(path.lastIndexOf("/") + 1),
    archetype: shapeOf?.archetype ?? "",
    symbols: shapeOf?.symbols ?? 0,
    today: fate(path, at)
  });
  const needsBefore = change.dead.length > 0 || change.edgesChanged.length > 0 || change.resized.length > 0;
  const before = step > 0 && needsBefore ? seek(sequence, step - 1) : undefined;
  const edge = ([from, to, count]: readonly [string, string, number]): SummaryEdge => ({ from, to, count });
  return {
    step,
    commit,
    base: step === 0,
    files: shape.files.size,
    edges: shape.edges.size,
    born: change.born.map(([path, shapeOf]) => file(path, shapeOf, step)),
    dead: change.dead.map((path) => file(path, before?.files.get(path), step - 1)),
    renamed: change.renamed.map(([from, to]) => ({ from, file: file(to, shape.files.get(to), step) })),
    directoriesRenamed: change.directoriesRenamed.map(([from, to]) => ({ from, to })),
    resized: change.resized.map(([path, after]) => ({ file: file(path, shape.files.get(path), step), before: resizedFrom(before, change.renamed, path), after })),
    edgesAdded: change.edgesAdded.map(edge),
    edgesRemoved: change.edgesRemoved.map(([from, to]) => ({ from, to, count: 0 })),
    edgesChanged: change.edgesChanged.map(([from, to, count]) => ({ from, to, count, before: before?.edges.get(edgeKey(renamedBack(change.renamed, from), renamedBack(change.renamed, to))) ?? 0 })),
    touched: change.touched.map((path) => file(path, shape.files.get(path), step))
  };
}

/** A resized file's count before the step, read under its path before the step's renames. */
function resizedFrom(before: Shape | undefined, renamed: ReadonlyArray<readonly [string, string]>, path: string): number {
  return before?.files.get(renamedBack(renamed, path))?.symbols ?? 0;
}

/** A path as it stood before the step's renames. */
function renamedBack(renamed: ReadonlyArray<readonly [string, string]>, path: string): string {
  return renamed.find(([, to]) => to === path)?.[0] ?? path;
}
