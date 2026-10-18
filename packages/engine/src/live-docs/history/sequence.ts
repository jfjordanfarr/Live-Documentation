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
 * @module
 */

import { decodeChange, decodeShape, encodeChange, encodeShape, Interner, type Interners, type Tables } from "./codec";
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
import { applyChange, shapeDifferences, type Shape, type ShapeChange } from "./shape";
import type { VersionChanges } from "./versionControl";

/** What a sequence says of itself before its body. */
export interface SequenceHead {
  lens: HistoryLens;
  source: HistorySource;
  window?: HistoryWindow;
}

/** Writes a sequence from its base and one change per step. */
export class SequenceWriter {
  private readonly interners: Interners = { paths: new Interner(), archetypes: new Interner() };
  private readonly base: SnapshotTuples & { commit: CommitInfo };
  private readonly steps: HistoryStep[] = [];
  private readonly keyframes: Keyframe[] = [];
  private current: Shape;

  /** A sequence that begins at `commit`, whose shape is `shape`. */
  constructor(
    private readonly head: SequenceHead,
    commit: CommitInfo,
    shape: Shape
  ) {
    this.base = { commit, ...encodeShape(shape, this.interners) };
    this.current = decodeShape(this.base, this.tables());
  }

  /**
   * Adds the next step, and returns the shape after it as the written delta
   * replays it, read back through the tables as a reader would.
   */
  append(commit: CommitInfo, change: ShapeChange): Shape {
    const delta = encodeChange(change, this.interners);
    this.steps.push({ commit, delta });
    this.current = applyChange(this.current, decodeChange(delta, this.tables()));
    if (this.steps.length % KEYFRAME_INTERVAL === 0) {
      this.keyframes.push({ step: this.steps.length, ...encodeShape(this.current, this.interners) });
    }
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
      base: this.base,
      steps: this.steps,
      keyframes: this.keyframes
    };
  }

  private tables(): Tables {
    return { paths: this.interners.paths.values, archetypes: this.interners.archetypes.values };
  }
}

/** Builds a sequence from the shapes of the sampled changes, oldest first, and what the version control says between them. */
export class SequenceBuilder {
  private readonly writer: SequenceWriter;
  private previous: Shape;

  /** A sequence whose base is the first sampled change. */
  constructor(head: SequenceHead, commit: CommitInfo, shape: Shape) {
    this.writer = new SequenceWriter(head, commit, shape);
    this.previous = shape;
  }

  /**
   * Adds the next sampled change: derives its change from the previous shape,
   * writes it, and checks that its replay gives `shape`.
   *
   * @returns The change written.
   */
  add(commit: CommitInfo, shape: Shape, version: VersionChanges): ShapeChange {
    const change = deriveChange(this.previous, shape, version);
    const replayed = this.writer.append(commit, change);
    const differences = shapeDifferences(shape, replayed);
    if (differences.length > 0) {
      throw new Error(`replaying the step to ${commit.id} does not give its shape: ${differences.join("; ")}`);
    }
    this.previous = shape;
    return change;
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

/**
 * What the step did, by path; step 0, the base, did nothing. The change is
 * decoded once per sequence and the same object returned after, so a caller
 * reads it and never changes it.
 */
export function changeAt(sequence: HistorySequence, step: number): ShapeChange {
  checkStep(sequence, step);
  let changes = decodedChanges.get(sequence);
  if (!changes) {
    changes = [];
    decodedChanges.set(sequence, changes);
  }
  let change = changes[step];
  if (!change) {
    change = step === 0 ? decodeChange({}, sequence) : decodeChange(sequence.steps[step - 1].delta, sequence);
    changes[step] = change;
  }
  return change;
}

/** The shape at a step: the nearest keyframe at or before it, or the base, and the deltas after it. */
export function seek(sequence: HistorySequence, step: number): Shape {
  checkStep(sequence, step);
  let start: SnapshotTuples = sequence.base;
  let at = 0;
  for (const keyframe of sequence.keyframes) {
    if (keyframe.step <= step && keyframe.step > at) {
      start = keyframe;
      at = keyframe.step;
    }
  }
  let shape = decodeShape(start, sequence);
  for (; at < step; at += 1) {
    shape = applyChange(shape, decodeChange(sequence.steps[at].delta, sequence));
  }
  return shape;
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
