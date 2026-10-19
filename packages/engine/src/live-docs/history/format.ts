/**
 * The format of `history.json`: a repository's history read under one lens,
 * as the history command writes it and the CLI and the Explorer read it.
 *
 * @remarks
 * The sequence is the shape of the graph over time: every file with its
 * archetype, its symbol count and whether it is an entry, and every directed
 * file-to-file edge with its count, at the first sampled change in full and
 * then as one delta per later change. Paths and archetypes are interned once,
 * and every tuple names them by their index. Every 256 steps a keyframe
 * repeats the snapshot whole, so that a seek is the nearest keyframe plus at
 * most 255 deltas. The docs of each change remain the truth of everything
 * else; the sequence carries no symbol, no edge kind and no authored word.
 *
 * Nothing here is ever committed: two clones' histories differ, so the
 * sequence lives beside the graph index under the docs root and is derived
 * again on demand.
 *
 * @module
 */

import type { LiveDocumentationConfig } from "../../config/liveDocumentationConfig";

/** The version of the sequence's format, written first in every `history.json`. */
export const HISTORY_FORMAT = "live-docs-history/1";

/** The version of the format of one change's summary in the cache. */
export const HISTORY_SUMMARY_FORMAT = "live-docs-history-summary/1";

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

/** A whole snapshot: every file and every edge, sorted by id. */
export interface SnapshotTuples {
  files: FileTuple[];
  edges: EdgeTuple[];
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
 * order: the renames first (a renamed file keeps its shape and its edges under
 * the new path), then the edges removed, the files dead and born, the files
 * resized, rekinded and re-marked, and the edges added and changed.
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
  /** Directories renamed whole, by path, derived from the file renames. */
  directoriesRenamed?: Array<[fromPath: string, toPath: string]>;
  /** Files whose content the version control saw change while their shape did not. */
  touched?: number[];
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
}

/** The lens: one generator and one configuration, applied to every change of the sequence. */
export interface HistoryLens {
  /** A hash of the generator and the configuration; the cache's folder is named by it. */
  key: string;
  generator: GeneratorIdentity;
  /** The normalized configuration the generator applied to every change. */
  configuration: LiveDocumentationConfig;
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

/** One change's shape as the cache keeps it: `<docsRoot>/history/<lens>/<change>.json`. */
export interface CommitSummary {
  format: typeof HISTORY_SUMMARY_FORMAT;
  /** The lens key the summary was made under. */
  lens: string;
  /** The change summarized. */
  commit: string;
  /** Every file, sorted by path: its path, archetype, symbol count and entry mark. */
  files: Array<[path: string, archetype: string, symbols: number, entry: 0 | 1]>;
  /** Every directed edge, sorted: its ends' paths and its count. */
  edges: Array<[from: string, to: string, count: number]>;
}
