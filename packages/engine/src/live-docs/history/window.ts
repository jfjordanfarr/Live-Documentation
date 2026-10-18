/**
 * The part of a sequence an export carries: all of it, the changes since a
 * date, or the last so many, by the exporter's choice, since some histories
 * are liable to "make certain sizes of things absolutely explode" (the owner,
 * 2026-10-17).
 *
 * @remarks
 * A window is re-based: its first change becomes its base, a full snapshot,
 * and its tables are written afresh, so that it names only the paths it uses
 * and stands on its own. Its head keeps the source's and the lens's words and
 * says which window it is; its base says where its knowledge begins.
 *
 * @module
 */

import type { HistorySequence, HistoryWindow } from "./format";
import { changeAt, commitAt, commitCount, seek, SequenceWriter } from "./sequence";

/** Which part of a sequence to carry. */
export type HistorySelection = { rule: "all" } | HistoryWindow;

/** The window of the sequence the selection names, re-based on its first change. */
export function windowOf(sequence: HistorySequence, selection: HistorySelection): HistorySequence {
  if (selection.rule === "all") {
    return sequence;
  }
  const first = firstStep(sequence, selection);
  const writer = new SequenceWriter({ lens: sequence.lens, source: sequence.source, window: selection }, commitAt(sequence, first), seek(sequence, first));
  for (let step = first + 1; step <= sequence.steps.length; step += 1) {
    writer.append(commitAt(sequence, step), changeAt(sequence, step));
  }
  return writer.finish();
}

/** The step a window begins at. */
function firstStep(sequence: HistorySequence, window: HistoryWindow): number {
  if (window.rule === "last") {
    if (!Number.isInteger(window.count) || window.count < 1) {
      throw new Error(`a window of the last changes needs a count of one or more, not ${window.count}`);
    }
    return Math.max(0, commitCount(sequence) - window.count);
  }
  const since = Date.parse(window.since);
  if (Number.isNaN(since)) {
    throw new Error(`${window.since} is not a date`);
  }
  for (let step = 0; step <= sequence.steps.length; step += 1) {
    if (Date.parse(commitAt(sequence, step).date) >= since) {
      return step;
    }
  }
  throw new Error(`no change of the history is on or after ${window.since}; the last is of ${commitAt(sequence, sequence.steps.length).date}`);
}
