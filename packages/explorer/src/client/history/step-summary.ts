/**
 * What one step of the history changed, as the step panel says it (the plan's
 * C4): the commit, then the files born, dead, renamed and resized, the
 * directories renamed whole, the wires that came, went and changed their
 * count, the documents their authored words came to link and ceased to, and
 * the files whose content changed while their shape did not. Each
 * file is read where it stands today, through every rename since, so that the
 * panel can pin it where it still exists and say "gone since" where it does
 * not, with its archetype and its symbol count at the step, since the docs of
 * that day are not in the bundle. The compact panel counts what the step
 * changed in one line (`stepCounts`, `countWords`; 2026-11-11), the whole
 * standing in the dialog it opens.
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
  /** The moment containing this file: the preceding step for a deletion. */
  at: number;
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

/** A link from a file's authored words to a document, the file as the panel names it. */
export interface SummaryDocLink {
  file: SummaryFile;
  doc: string;
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
  docLinksAdded: SummaryDocLink[];
  docLinksRemoved: SummaryDocLink[];
  touched: SummaryFile[];
}

/** How many things the step changed, the wires counted with the files. */
export const changeCount = (summary: StepSummary): number =>
  summary.born.length + summary.dead.length + summary.renamed.length + summary.resized.length + summary.edgesAdded.length + summary.edgesRemoved.length + summary.edgesChanged.length
  + summary.docLinksAdded.length + summary.docLinksRemoved.length + summary.touched.length;

/** What the compact step panel counts (2026-11-11): the files the step changed, each once, its wires, its document links and its whole-directory renames. */
export interface StepCounts {
  files: number;
  wires: number;
  documentLinks: number;
  directoriesRenamed: number;
}

/**
 * The step's changes counted for the compact panel. A file is counted once however many groups name it, a file both
 * renamed and resized for instance, by its path at the step; a deleted file's path does not stand at the step (the
 * engine's `deriveChange`), so it never meets another's.
 */
export function stepCounts(summary: StepSummary): StepCounts {
  const files = new Set([...summary.born, ...summary.dead, ...summary.renamed.map(rename => rename.file), ...summary.resized.map(resized => resized.file), ...summary.touched].map(file => file.path));
  return {
    files: files.size,
    wires: summary.edgesAdded.length + summary.edgesRemoved.length + summary.edgesChanged.length,
    documentLinks: summary.docLinksAdded.length + summary.docLinksRemoved.length,
    directoriesRenamed: summary.directoriesRenamed.length
  };
}

const counted = (count: number, one: string, many: string): string => `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;

/** The counts in one line, the nonzero ones only, as "Changed: 45 files, 36 wires, 3 document links"; empty when nothing is counted. */
export function countWords(counts: StepCounts): string {
  const parts = [
    counts.files ? counted(counts.files, "file", "files") : "",
    counts.wires ? counted(counts.wires, "wire", "wires") : "",
    counts.documentLinks ? counted(counts.documentLinks, "document link", "document links") : "",
    counts.directoriesRenamed ? counted(counts.directoriesRenamed, "directory renamed whole", "directories renamed whole") : ""
  ].filter(Boolean);
  return parts.length ? `Changed: ${parts.join(", ")}` : "";
}

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
    at,
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
    docLinksAdded: change.docLinksAdded.map(([from, doc]) => ({ file: file(from, shape.files.get(from), step), doc })),
    // A dead file's links went with it, and the file is named as it stood before the step.
    docLinksRemoved: change.docLinksRemoved.map(([from, doc]) => ({ file: change.dead.includes(from) ? file(from, before?.files.get(from), step - 1) : file(from, shape.files.get(from), step), doc })),
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
