/**
 * The step the picture stands at, and the move to another: forward by
 * applying the deltas up to the thumb's step, back by a seek from the nearest
 * keyframe, so that a drag never replays from the start and a jump across the
 * whole history costs what a step costs (the plan's C4). Each move returns the
 * renames from the step left to the step reached, files and directories, so
 * that the view can re-key its objects before it draws.
 *
 * The directories renamed whole across a move are derived by the same rule
 * each step's are, over the files' composed renames, so that a drag across a
 * rename whole reads the same whether it crosses the step in one frame or two.
 *
 * Pure in its reading: the sequence is never changed. The cursor's own state
 * is the step and its shape.
 *
 * @module cursor
 */

import { directoryRenames } from "@live-documentation/engine/live-docs/history/directories";
import type { HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { followChanges } from "@live-documentation/engine/live-docs/history/queries";
import { changeAt, seek } from "@live-documentation/engine/live-docs/history/sequence";
import { applyChange, type Shape, type ShapeChange } from "@live-documentation/engine/live-docs/history/shape";

import type { Renames } from "./rekey";

/** A cursor over a sequence: where it stands and the shape there. */
export class HistoryCursor {
  private current: number;
  private currentShape: Shape;

  constructor(
    private readonly sequence: HistorySequence,
    step: number = sequence.steps.length
  ) {
    this.current = step;
    this.currentShape = seek(sequence, step);
  }

  /** The step the cursor stands at. */
  get step(): number {
    return this.current;
  }

  /** The shape at the step. */
  get shape(): Shape {
    return this.currentShape;
  }

  /** The last step of the sequence. */
  get last(): number {
    return this.sequence.steps.length;
  }

  /**
   * Moves to the step and returns the renames from the step left to the step
   * reached: forward by the deltas between, back by a seek and the deltas
   * read the other way.
   */
  moveTo(step: number): Renames {
    if (!Number.isInteger(step) || step < 0 || step > this.last) {
      throw new RangeError(`the sequence has steps 0 to ${this.last}; the cursor cannot move to ${step}`);
    }
    if (step === this.current) return { files: new Map(), directories: new Map() };
    const from = this.current;
    const before = this.currentShape;
    if (step > from) {
      const changes: ShapeChange[] = [];
      let shape = before;
      for (let at = from + 1; at <= step; at += 1) {
        const change = changeAt(this.sequence, at);
        changes.push(change);
        shape = applyChange(shape, change);
      }
      this.current = step;
      this.currentShape = shape;
      return renamesOf(before, shape, changes, "forward");
    }
    const after = seek(this.sequence, step);
    const changes: ShapeChange[] = [];
    for (let at = step + 1; at <= from; at += 1) changes.push(changeAt(this.sequence, at));
    this.current = step;
    this.currentShape = after;
    return renamesOf(before, after, changes, "back");
  }
}

/**
 * The renames from one shape to another across the changes between them: forward, each file that stood before and
 * stands after by its moved path; back, the same chains read the other way. The directories are derived over the files.
 */
function renamesOf(from: Shape, to: Shape, changes: readonly ShapeChange[], way: "forward" | "back"): Renames {
  const standing = way === "forward" ? from : to;
  const followed = followChanges(changes, standing.files.keys());
  const pairs: Array<[string, string]> = [];
  for (const [current, origin] of followed.origins) {
    if (current === origin) continue;
    pairs.push(way === "forward" ? [origin, current] : [current, origin]);
  }
  pairs.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const directories = directoryRenames(from.files.keys(), to.files.keys(), pairs);
  return { files: new Map(pairs), directories: new Map(directories) };
}
