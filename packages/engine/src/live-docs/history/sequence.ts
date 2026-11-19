/**
 * Writing a sequence step by step, and reading a step of one back.
 *
 * @remarks
 * The writer encodes each step's change against the sequence's tables and
 * repeats the snapshot whole every {@link KEYFRAME_INTERVAL} steps. The
 * builder derives each change from the next change's shape and the version
 * control's word, and replays what it wrote: a step whose replay does not give
 * the shape it was derived from stops the build, so that a sequence on disk
 * always reproduces every summary it was made from. Only the last shape is
 * held, never the whole history, so a long history builds in the memory of
 * one snapshot. A seek starts from the nearest keyframe at or before the step
 * and applies at most `KEYFRAME_INTERVAL - 1` deltas.
 *
 * Since format 3 (2026-11-19) a moment is a shape and the rows of every file
 * (`rows.ts`), written as two streams in one delta, each replayed and held to
 * what it was derived from, and the two held to each other: the files, the
 * symbol counts, the entry marks and the wires' counts the shape carries must
 * be those the rows make, at every step.
 *
 * @module
 */

import { decodeChange, decodeRows, decodeRowsChange, decodeShape, encodeChange, encodeRows, encodeRowsChange, encodeShape, newInterners, type Interners, type RowTables } from "./codec";
import { deriveChange } from "./derive";
import {
  HISTORY_FORMAT,
  KEYFRAME_INTERVAL,
  type CommitInfo,
  type HistoryHead,
  type HistoryLens,
  type HistorySequence,
  type HistorySource,
  type HistoryStep,
  type HistoryWindow,
  type Keyframe,
  type SnapshotTuples
} from "./format";
import { applyRowsChange, deriveRowsChange, emptyRowsChange, rowsAgainstShape, rowsDifferences, type FileRows, type Rows, type RowsChange } from "./rows";
import { applyChange, shapeDifferences, type Shape, type ShapeChange } from "./shape";
import type { VersionChanges } from "./versionControl";

/** What a sequence says of itself before its body. */
export interface SequenceHead {
  lens: HistoryLens;
  source: HistorySource;
  window?: HistoryWindow;
}

/** Everything a sequence knows of one change: its shape, the first rung, and its rows, the second. */
export interface Moment {
  shape: Shape;
  /** Every file's rows, by path; a file of the shape without rows here is one whose rows the sequence does not carry. */
  rows: Rows;
}

/** Writes a sequence from its base and one change per step. */
export class SequenceWriter {
  private readonly interners: Interners = newInterners();
  private readonly base: SnapshotTuples & { commit: CommitInfo };
  private readonly steps: HistoryStep[] = [];
  private readonly keyframes: Keyframe[] = [];
  private current: Moment;

  /**
   * A sequence that begins at `commit`, whose shape is `shape` and whose rows are `rows`; without rows, the sequence
   * carries the shape alone, as a sequence made by a caller that reads no summaries does.
   */
  constructor(
    private readonly head: SequenceHead,
    commit: CommitInfo,
    shape: Shape,
    rows: Rows = new Map()
  ) {
    this.base = { commit, ...this.snapshot({ shape, rows }) };
    this.current = { shape: decodeShape(this.base, this.tables()), rows: decodeRows(this.base.rows, this.tables()) };
  }

  /**
   * Adds the next step, and returns the shape after it as the written delta
   * replays it, read back through the tables as a reader would; {@link moment}
   * has its rows.
   */
  append(commit: CommitInfo, change: ShapeChange, rowsChange: RowsChange = emptyRowsChange()): Shape {
    const delta = { ...encodeChange(change, this.interners), ...encodeRowsChange(rowsChange, this.interners) };
    this.steps.push({ commit, delta });
    const replayed = decodeChange(delta, this.tables());
    this.current = { shape: applyChange(this.current.shape, replayed), rows: applyRowsChange(this.current.rows, replayed, decodeRowsChange(delta, this.tables())) };
    if (this.steps.length % KEYFRAME_INTERVAL === 0) {
      this.keyframes.push({ step: this.steps.length, ...this.snapshot(this.current) });
    }
    return this.current.shape;
  }

  /** The moment after the last step as its written delta replays it. */
  moment(): Moment {
    return this.current;
  }

  /** The sequence written so far. */
  finish(): HistorySequence {
    return {
      format: HISTORY_FORMAT,
      lens: this.head.lens,
      source: this.head.source,
      ...(this.head.window ? { window: this.head.window } : {}),
      paths: [...this.interners.paths.values],
      archetypes: [...this.interners.archetypes.values],
      names: [...this.interners.names.values],
      base: this.base,
      steps: this.steps,
      keyframes: this.keyframes
    };
  }

  private snapshot(moment: Moment): SnapshotTuples {
    return { ...encodeShape(moment.shape, this.interners), rows: encodeRows(moment.rows, this.interners) };
  }

  private tables(): RowTables {
    return { paths: this.interners.paths.values, archetypes: this.interners.archetypes.values, names: this.interners.names.values };
  }
}

/**
 * Builds a sequence from the shapes of the sampled changes, oldest first, and what the version control says between
 * them, and from their rows when it is given them: given rows at its base, it must be given them at every step.
 */
export class SequenceBuilder {
  private readonly writer: SequenceWriter;
  private previous: Moment;
  private readonly carriesRows: boolean;

  /** A sequence whose base is the first sampled change. */
  constructor(head: SequenceHead, commit: CommitInfo, shape: Shape, rows?: Rows) {
    this.writer = new SequenceWriter(head, commit, shape, rows);
    this.carriesRows = rows !== undefined;
    this.previous = { shape, rows: rows ?? new Map<string, FileRows>() };
    const disagreements = this.carriesRows ? rowsAgainstShape(this.previous.rows, shape) : [];
    if (disagreements.length > 0) {
      throw new Error(`the rows of ${commit.id} disagree with its shape: ${disagreements.join("; ")}`);
    }
  }

  /**
   * Adds the next sampled change: derives its change from the previous one,
   * writes it, and checks that its replay gives `shape` and `rows`, and that the
   * replayed rows agree with the replayed shape.
   *
   * @returns The change of shape written; {@link lastRowsChange} is its change of rows.
   */
  add(commit: CommitInfo, shape: Shape, version: VersionChanges, rows?: Rows): ShapeChange {
    if ((rows !== undefined) !== this.carriesRows) {
      throw new Error(`the step to ${commit.id} ${rows ? "gives rows to a sequence begun without them" : "gives no rows to a sequence that carries them"}`);
    }
    const change = deriveChange(this.previous.shape, shape, version);
    const rowsChange = rows ? deriveRowsChange(this.previous.rows, rows, change) : emptyRowsChange();
    this.writer.append(commit, change, rowsChange);
    const replayed = this.writer.moment();
    const differences = [...shapeDifferences(shape, replayed.shape), ...(rows ? [...rowsDifferences(rows, replayed.rows), ...rowsAgainstShape(replayed.rows, replayed.shape)] : [])];
    if (differences.length > 0) {
      throw new Error(`replaying the step to ${commit.id} does not give its moment: ${differences.slice(0, 5).join("; ")}`);
    }
    this.previous = { shape, rows: rows ?? new Map<string, FileRows>() };
    this.rowsChange = rowsChange;
    return change;
  }

  private rowsChange: RowsChange = emptyRowsChange();

  /** The change of rows the last step wrote. */
  lastRowsChange(): RowsChange {
    return this.rowsChange;
  }

  /** The sequence. */
  finish(): HistorySequence {
    return this.writer.finish();
  }
}

/** How many changes a sequence holds, its base included. */
export function commitCount(sequence: HistorySequence): number {
  return sequence.steps.length + 1;
}

/** The change at a step: the base's at step 0. */
export function commitAt(sequence: HistorySequence, step: number): CommitInfo {
  checkStep(sequence, step);
  return step === 0 ? sequence.base.commit : sequence.steps[step - 1].commit;
}

// The changes of a sequence decoded once and kept beside it, since every reader (the ticks, the following of a pin,
// a cursor's move) walks them again and again and a page scrubbing through a history asks many times a second.
const decodedChanges = new WeakMap<HistorySequence, ShapeChange[]>();
const decodedRowsChanges = new WeakMap<HistorySequence, RowsChange[]>();

/**
 * What the step did, by path; step 0, the base, did nothing. The change is
 * decoded once per sequence and the same object returned after, so a caller
 * reads it and never changes it.
 */
export function changeAt(sequence: HistorySequence, step: number): ShapeChange {
  checkStep(sequence, step);
  return decodedOnce(decodedChanges, sequence, step, (delta) => decodeChange(delta, sequence));
}

/** What the step did to the rows, by path and anchor; decoded once per sequence, as {@link changeAt} is. */
export function rowsChangeAt(sequence: HistorySequence, step: number): RowsChange {
  checkStep(sequence, step);
  return decodedOnce(decodedRowsChanges, sequence, step, (delta) => decodeRowsChange(delta, sequence));
}

function decodedOnce<T>(cache: WeakMap<HistorySequence, T[]>, sequence: HistorySequence, step: number, decode: (delta: HistoryStep["delta"]) => T): T {
  let decoded = cache.get(sequence);
  if (!decoded) {
    decoded = [];
    cache.set(sequence, decoded);
  }
  let value = decoded[step];
  if (value === undefined) {
    value = decode(step === 0 ? {} : sequence.steps[step - 1].delta);
    decoded[step] = value;
  }
  return value;
}

/** The nearest keyframe at or before a step, or the base, and the step it stands at. */
function nearestSnapshot(sequence: HistorySequence, step: number): { start: SnapshotTuples; at: number } {
  let start: SnapshotTuples = sequence.base;
  let at = 0;
  for (const keyframe of sequence.keyframes) {
    if (keyframe.step <= step && keyframe.step > at) {
      start = keyframe;
      at = keyframe.step;
    }
  }
  return { start, at };
}

/** The shape at a step: the nearest keyframe at or before it, or the base, and the deltas after it. */
export function seek(sequence: HistorySequence, step: number): Shape {
  checkStep(sequence, step);
  const { start, at } = nearestSnapshot(sequence, step);
  let shape = decodeShape(start, sequence);
  for (let next = at + 1; next <= step; next += 1) {
    shape = applyChange(shape, changeAt(sequence, next));
  }
  return shape;
}

/** The shape and the rows at a step, from the nearest keyframe at or before it, or the base, and the deltas after it. */
export function momentAt(sequence: HistorySequence, step: number): Moment {
  checkStep(sequence, step);
  const { start, at } = nearestSnapshot(sequence, step);
  let shape = decodeShape(start, sequence);
  let rows = decodeRows(start.rows, sequence);
  for (let next = at + 1; next <= step; next += 1) {
    const change = changeAt(sequence, next);
    shape = applyChange(shape, change);
    rows = applyRowsChange(rows, change, rowsChangeAt(sequence, next));
  }
  return { shape, rows };
}

/** What the sequence says of itself without its body. */
export function headOf(sequence: HistorySequence): HistoryHead {
  return {
    format: sequence.format,
    lens: sequence.lens,
    source: sequence.source,
    ...(sequence.window ? { window: sequence.window } : {}),
    commits: commitCount(sequence),
    first: sequence.base.commit,
    last: commitAt(sequence, sequence.steps.length)
  };
}

function checkStep(sequence: HistorySequence, step: number): void {
  if (!Number.isInteger(step) || step < 0 || step > sequence.steps.length) {
    throw new RangeError(`the sequence has steps 0 to ${sequence.steps.length}; ${step} is not one of them`);
  }
}
