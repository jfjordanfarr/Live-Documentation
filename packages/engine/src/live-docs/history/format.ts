/**
 * The format of `history.json`: a repository's history read under one lens,
 * as the history command writes it and the CLI and the Explorer read it.
 *
 * @remarks
 * The sequence is the shape of the graph over time: every file with its
 * archetype, its symbol count and whether it is an entry, every directed
 * file-to-file edge with its count, and every link from a file's authored
 * words to a document that stood then, at the first sampled change in full
 * and then as one delta per later change. Paths and archetypes are interned
 * once, and every tuple names them by their index. Every 256 steps a keyframe
 * repeats the snapshot whole, so that a seek is the nearest keyframe plus at
 * most 255 deltas. Version 2 (2026-10-20) added where each file's authored
 * words pointed, when the lens began to keep each change's authored words
 * instead of discarding them.
 *
 * Version 3 (2026-11-19) adds the second rung beside the shape, so that a
 * moment can be drawn in 2D as fully as today (the owner, 2026-11-18: "all
 * three rungs ... we should"): every file's public symbols in the doc's order
 * with their kinds, flags and type references, its dependency lines, entries,
 * re-exported anchors and citing documents, each reference and line with the
 * file and symbol it resolved to, and its words by the id of their text in
 * the words store beside the sequence (the third rung). Names of symbols,
 * kinds, labels and the rest are interned once in a third table. A step
 * carries the symbols gone, changed, born and reordered by their anchors,
 * and a file's lines whole where they changed; a keyframe repeats the rows
 * whole. A consumer that reads only the shape reads it as before.
 *
 * Nothing here is ever committed: two clones' histories differ, so the
 * sequence lives beside the graph index under the docs root and is derived
 * again on demand.
 *
 * @module
 */

import type { LiveDocumentationConfig } from "../../config/liveDocumentationConfig";
import type { WordsHead } from "./words";

/** The version of the sequence's format, written first in every `history.json`. */
export const HISTORY_FORMAT = "live-docs-history/3";

/** The folder under the docs root that holds the cache and the sequence. */
export const HISTORY_DIRECTORY = "history";

/** The name of the sequence's file, under {@link HISTORY_DIRECTORY}. */
export const HISTORY_FILE = "history.json";

/** How many steps lie between two keyframes: a seek replays at most one fewer. */
export const KEYFRAME_INTERVAL = 256;

/** One file in a snapshot: its path's id, its archetype's id, its symbol count, and 1 when its doc carries an Entry line. */
export type FileTuple = [pathId: number, archetypeId: number, symbols: number, entry: 0 | 1];

/** One directed edge in a snapshot: the files' path ids and how many of the source's references land on the target. */
export type EdgeTuple = [fromId: number, toId: number, count: number];

/** The two ends of a directed edge, by path id. */
export type EdgeEnds = [fromId: number, toId: number];

/** A whole shape: every file, every edge and every doc link, sorted by id. */
export interface ShapeTuples {
  files: FileTuple[];
  edges: EdgeTuple[];
  /** Each link from a file's authored words to a document that stood then: the file's path id and the document's. */
  docLinks: EdgeEnds[];
}

/**
 * A type reference of a symbol: its role's name id, its type's name id, then, each left out from the end when it is
 * its default, its parameter's name id (-1 for none), its marks (1 an array, 2 a promise), and the path id and anchor
 * name id it resolved to (-1 for none).
 */
export type ReferenceTuple = [roleId: number, typeId: number, parameterId?: number, marks?: number, toPathId?: number, toSlugId?: number];

/**
 * A symbol row: its heading's, anchor's and kind's name ids, then, each left out from the end when empty, its flags'
 * name ids, its type references, and the id of its description's text (-1 for none).
 */
export type SymbolTuple = [nameId: number, slugId: number, kindId: number, flagIds?: number[], references?: ReferenceTuple[], textId?: number];

/**
 * A dependency line: its label's name id and kind (0 an import, 1 a re-export), then, each left out from the end when
 * it is its default, its marks (1 type-only), its basis's name id, the path id and anchor name id it resolved to (-1
 * for none), and the name ids of the symbols an external dependency gives.
 */
export type DependencyTuple = [labelId: number, kind: 0 | 1, marks?: number, basisId?: number, toPathId?: number, toSlugId?: number, symbolIds?: number[]];

/** An entry line: its reason's name id, then its symbol's and command's name ids and its declarer's path id (-1 for none), left out from the end when none. */
export type EntryTuple = [reasonId: number, symbolId?: number, commandId?: number, declarerPathId?: number];

/** A re-exported anchor: its name id, then its anchor's name id, its origin's path id, its origin's label's name id (-1 for none) and its flags' name ids, left out from the end when none. */
export type ReExportTuple = [nameId: number, slugId?: number, fromPathId?: number, fromLabelId?: number, flagIds?: number[]];

/** The authored words of a file in a tuple: the id of their text, {@link NO_WORDS} or {@link UNREAD_WORDS}. */
export const NO_WORDS = -1;
/** A doc stood whose form today's reader cannot read the authored words of. */
export const UNREAD_WORDS = -2;

/**
 * A file's rows: its path id, then, each left out from the end when it is its default, its authored words (a text id,
 * {@link NO_WORDS} or {@link UNREAD_WORDS}), its symbols in the doc's order, its dependency lines, its entries, its
 * re-exported anchors and the path ids of the documents that cite it.
 */
export type FileRowsTuple = [pathId: number, authored?: number, symbols?: SymbolTuple[], dependencies?: DependencyTuple[], entries?: EntryTuple[], reExports?: ReExportTuple[], citedBy?: number[]];

/** A whole snapshot: its shape and, since format 3, every file's rows, sorted by path id. */
export interface SnapshotTuples extends ShapeTuples {
  rows: FileRowsTuple[];
}

/** One change of the version control, as the sequence names it. */
export interface CommitInfo {
  /** The change's id: for git, the full commit hash. */
  id: string;
  /** The ids of its parents; the first is the mainline's previous change. */
  parents: string[];
  /** When the change entered the mainline, as an ISO 8601 date with its offset. */
  date: string;
  /** The author's name as the version control records it; absent when the sequence carries no authors. */
  author?: string;
  /** The first line of the change's message. */
  subject: string;
}

/**
 * What one step changed, by id; an empty list is left out. Applied in this
 * order: the renames first (a renamed file keeps its shape, its edges and its
 * doc links under the new path), then the edges and doc links removed, the
 * files dead and born, the files resized, rekinded and re-marked, and the
 * edges added and changed and the doc links added.
 */
export interface StepDelta {
  /** Files that appear, with their shape. */
  born?: FileTuple[];
  /** Files that disappear. */
  dead?: number[];
  /** Files the version control says were renamed, from the old path's id to the new one's. */
  renamed?: Array<[fromId: number, toId: number]>;
  /** Files whose symbol count changed, with the new count. */
  resized?: Array<[pathId: number, symbols: number]>;
  /** Files whose archetype changed, with the new archetype's id. */
  rekinded?: Array<[pathId: number, archetypeId: number]>;
  /** Files that gained or lost their Entry lines. */
  entries?: Array<[pathId: number, entry: 0 | 1]>;
  /** Edges that appear, with their count. */
  edgesAdded?: EdgeTuple[];
  /** Edges that disappear, named after the step's renames. */
  edgesRemoved?: EdgeEnds[];
  /** Edges whose count changed, with the new count. */
  edgesChanged?: EdgeTuple[];
  /** Links from a file's authored words to a document that appear, the file named after the step's renames. */
  docLinksAdded?: EdgeEnds[];
  /** Doc links that disappear, a dead file's included, named after the step's renames. */
  docLinksRemoved?: EdgeEnds[];
  /** Directories renamed whole, by path, derived from the file renames. */
  directoriesRenamed?: Array<[fromPath: string, toPath: string]>;
  /** Files whose content the version control saw change while their shape did not. */
  touched?: number[];
  /**
   * The rows' change, since format 3, applied after the shape's in this order and named after its renames: symbols
   * gone, by their file's path id and their anchor's name id.
   */
  symbolsGone?: Array<[pathId: number, slugId: number]>;
  /** Symbols whose row changed, by their anchor before the step; a renamed symbol's new row carries its new anchor. */
  symbolsChanged?: Array<[pathId: number, slugId: number, symbol: SymbolTuple]>;
  /** Symbols that appear, each with its place in its file's rows after the step, inserted in this order. */
  symbolsBorn?: Array<[pathId: number, index: number, symbol: SymbolTuple]>;
  /** A file's anchors in their new order, where the symbols that stayed changed places. */
  symbolsOrdered?: Array<[pathId: number, slugIds: number[]]>;
  /** A file's entries, whole, where they changed. */
  entryLines?: Array<[pathId: number, entries: EntryTuple[]]>;
  /** A file's dependency lines where they changed, as an edit: the places of the lines removed, before the step, and the lines added at their places after it. */
  dependencyLines?: Array<[pathId: number, removed: number[], added: Array<[index: number, line: DependencyTuple]>]>;
  /** A file's re-exported anchors, whole, where they changed. */
  reExports?: Array<[pathId: number, entries: ReExportTuple[]]>;
  /** A file's citing documents' path ids, whole, where they changed. */
  citedBy?: Array<[pathId: number, documentIds: number[]]>;
  /** A file's authored words, where they changed: a text id, {@link NO_WORDS} or {@link UNREAD_WORDS}. */
  authored?: Array<[pathId: number, words: number]>;
}

/** One sampled change after the base: the change and what it did to the shape. */
export interface HistoryStep {
  commit: CommitInfo;
  delta: StepDelta;
}

/** A snapshot repeated whole after a step, so that a seek need not replay from the base. */
export interface Keyframe extends SnapshotTuples {
  /** The step after which this is the snapshot; a multiple of {@link KEYFRAME_INTERVAL}. */
  step: number;
}

/** Which generator made the summaries: its package version, committed tool inputs, the commit it runs from and any uncommitted change to those inputs. */
export interface GeneratorIdentity {
  /** The generator package's version. */
  version: string;
  /**
   * A hash of this tool's code and dependency lock as committed: the tree ids of `packages/engine` and
   * `packages/generator`, and the entry for this tool repository's `package-lock.json` when present. A commit
   * touching none of them keeps the cache; null outside this tool's checkout.
   */
  code: string | null;
  /** The commit of this repository the generator runs from, for the reader; it does not key the lens. Null when it does not run from a checkout. */
  commit: string | null;
  /** A hash of uncommitted code changes or working lock bytes differing from the committed tool lock, or null when neither changed. */
  modified: string | null;
  /**
   * The version of Unicode the runtime reads text by (`process.versions.unicode`), which decides the case of letters
   * and the classes of characters a summary's anchors depend on; null when the runtime does not say. Absent from a
   * lens made before 2026-11-19.
   */
  unicode?: string | null;
}

/** The lens: one generator and one configuration, applied to every change of the sequence. */
export interface HistoryLens {
  /** A hash of the generator and the configuration; the cache's folder is named by it. */
  key: string;
  generator: GeneratorIdentity;
  /** The normalized configuration the generator applied to every change. */
  configuration: LiveDocumentationConfig;
  /** Present where the repository matches names without regard to case, which the key holds (`lensOf`). */
  ignoresCase?: true;
  /**
   * Present where a worker that summarized a change took the next one of its run (`--keep-workers`), which the key holds
   * (`lensOf`) and the pool reads; absent, every change was summarized by a process of its own.
   */
  keepWorkers?: true;
}

/** Which changes of the mainline were regenerated. */
export interface Sampling {
  /**
   * `every-commit`; `every-nth`, every n-th change; `daily` and `weekly`, the
   * last change of each day or week (UTC); `tags`, every change a tag points
   * at. Every rule keeps the first change of its window and the last, so that
   * a sequence spans what it samples.
   */
  rule: "every-commit" | "every-nth" | "daily" | "weekly" | "tags";
  /** For `every-nth`, the n. */
  n?: number;
  /** Only changes on or after this date were sampled, as given. */
  since?: string;
}

/** Where the sequence was read from. */
export interface HistorySource {
  /** The version control the history was read from. */
  system: "git";
  /** The repository's root as the person gave it. */
  root: string;
  /** The branch whose first parents are the mainline; `HEAD` when the checkout is detached. */
  branch: string;
  /** The head change the mainline ends at. */
  head: string;
  /** Whether the clone holds only part of the history. */
  shallow: boolean;
  /** The oldest change of the mainline the clone holds: the repository's first commit, or a shallow clone's graft, whose parents it lacks. */
  knowledgeBegins: string;
  sampling: Sampling;
  /** Whether the steps carry their authors' names. */
  authors: boolean;
}

/** The part of a sequence an export carries, when it carries less than the whole. */
export type HistoryWindow = { rule: "since"; since: string } | { rule: "last"; count: number };

/** The sequence: `history.json`. */
export interface HistorySequence {
  format: typeof HISTORY_FORMAT;
  lens: HistoryLens;
  source: HistorySource;
  /** Present when this is a window of a longer sequence, re-based so that its base is its first change. */
  window?: HistoryWindow;
  /** Every path the sequence names, once; a tuple names a path by its index here. */
  paths: string[];
  /** Every archetype the sequence names, once. */
  archetypes: string[];
  /** Every other name the rows use once: symbols' headings, anchors, kinds and flags, roles, types, labels and the rest. */
  names: string[];
  /** The words store beside the sequence, whose texts the rows name by id; absent when none was written beside it. */
  words?: WordsHead;
  /** Step 0: the first sampled change and its snapshot in full. */
  base: SnapshotTuples & { commit: CommitInfo };
  /** Step 1 onwards: one per later sampled change, oldest first. */
  steps: HistoryStep[];
  keyframes: Keyframe[];
}

/** What a sequence says of itself without its body, which the bundle's data carries beside the history file's name. */
export interface HistoryHead {
  format: typeof HISTORY_FORMAT;
  lens: HistoryLens;
  source: HistorySource;
  window?: HistoryWindow;
  /** How many changes the sequence holds, its base included. */
  commits: number;
  /** The base's change, where the sequence's knowledge begins. */
  first: CommitInfo;
  /** The last step's change. */
  last: CommitInfo;
}
