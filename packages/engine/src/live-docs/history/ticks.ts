/**
 * The steps that touch what is pinned, split as the plan's C3 splits them:
 * the major ticks, where the graph's shape of a pinned file changed, and the
 * minor ticks, where the version control saw its content change and the graph
 * saw nothing.
 *
 * @remarks
 * In the owner's words of 2026-10-17, "the kind of quantum leap events are
 * major ticks and the update-only changes are minor ticks". A major tick is a
 * step in which a pinned file was born, died, was renamed, resized, rekinded
 * or re-marked as an entry, or an edge from or to it came, went or changed its
 * count; for a pinned directory, any file under it. A minor tick is a step
 * that is no major tick and in which a pinned file was touched. With nothing
 * pinned every step is a major tick.
 *
 * A pin names a path as it stands at one step, today's by default, and is
 * followed through the renames on either side of it, so that a file pinned
 * after its move is still found in the steps before it, under its old name.
 * A directory is followed through the directory renames that carry it.
 *
 * @module
 */

import type { HistorySequence } from "./format";
import { changeAt } from "./sequence";
import type { ShapeChange } from "./shape";

/** What is pinned: files and directories, by path. */
export interface Pins {
  files: readonly string[];
  directories: readonly string[];
}

/** The steps that touch what is pinned, in order. */
export interface Ticks {
  major: number[];
  minor: number[];
}

/**
 * The major and minor ticks of the pins over the sequence's steps.
 *
 * @param sequence - The sequence.
 * @param pins - What is pinned, by path at the step `at`.
 * @param at - The step the pins' paths are read at; the last step by default.
 */
export function ticksFor(sequence: HistorySequence, pins: Pins, at: number = sequence.steps.length): Ticks {
  const steps = sequence.steps.length;
  if (!Number.isInteger(at) || at < 0 || at > steps) {
    throw new RangeError(`the sequence has steps 0 to ${steps}; pins cannot be read at ${at}`);
  }
  if (pins.files.length === 0 && pins.directories.length === 0) {
    return { major: Array.from({ length: steps }, (_, index) => index + 1), minor: [] };
  }
  const changes: ShapeChange[] = [];
  for (let step = 1; step <= steps; step += 1) {
    changes[step] = changeAt(sequence, step);
  }

  // The pins as they stand after each step, followed through the renames on either side of `at`.
  const pinned: PinnedPaths[] = [];
  pinned[at] = { files: new Set(pins.files), directories: new Set(pins.directories) };
  for (let step = at; step >= 1; step -= 1) {
    pinned[step - 1] = followed(pinned[step], changes[step], "back");
  }
  for (let step = at + 1; step <= steps; step += 1) {
    pinned[step] = followed(pinned[step - 1], changes[step], "forward");
  }

  const ticks: Ticks = { major: [], minor: [] };
  for (let step = 1; step <= steps; step += 1) {
    const before = pinned[step - 1];
    const after = pinned[step];
    const change = changes[step];
    if (shapeTouches(change, (path) => holdsPath(before, path), (path) => holdsPath(after, path))) {
      ticks.major.push(step);
    } else if (change.touched.some((path) => holdsPath(after, path))) {
      ticks.minor.push(step);
    }
  }
  return ticks;
}

interface PinnedPaths {
  files: Set<string>;
  directories: Set<string>;
}

/** The pins across one step: forward from before it to after it, or back from after it to before it. */
function followed(pins: PinnedPaths, change: ShapeChange, way: "forward" | "back"): PinnedPaths {
  const fileRenames = new Map(change.renamed.map(([from, to]) => (way === "forward" ? [from, to] : [to, from])));
  const directoryRenames = change.directoriesRenamed.map(([from, to]) => (way === "forward" ? [from, to] : [to, from]));
  const directory = (path: string): string => {
    // The innermost renamed directory that holds the path carries it.
    let best: [string, string] | undefined;
    for (const [from, to] of directoryRenames) {
      if ((path === from || path.startsWith(`${from}/`)) && (!best || from.length > best[0].length)) {
        best = [from, to];
      }
    }
    return best ? `${best[1]}${path.slice(best[0].length)}` : path;
  };
  return {
    files: new Set([...pins.files].map((path) => fileRenames.get(path) ?? path)),
    directories: new Set([...pins.directories].map(directory))
  };
}

function holdsPath(pins: PinnedPaths, path: string): boolean {
  if (pins.files.has(path)) {
    return true;
  }
  for (const directory of pins.directories) {
    if (path.startsWith(`${directory}/`)) {
      return true;
    }
  }
  return false;
}

/**
 * Whether the step changed the shape of a pinned file. A change's paths are
 * read where they stand: a dead file's before the step, everything else's
 * after it; an edge removed names a dead end by its path before the step and
 * a surviving end by its path after.
 */
function shapeTouches(change: ShapeChange, heldBefore: (path: string) => boolean, heldAfter: (path: string) => boolean): boolean {
  const eitherEnd = ([from, to]: readonly [string, string, ...unknown[]], held: (path: string) => boolean): boolean => held(from) || held(to);
  return (
    change.born.some(([path]) => heldAfter(path)) ||
    change.dead.some(heldBefore) ||
    change.renamed.some(([from, to]) => heldBefore(from) || heldAfter(to)) ||
    change.resized.some(([path]) => heldAfter(path)) ||
    change.rekinded.some(([path]) => heldAfter(path)) ||
    change.entries.some(([path]) => heldAfter(path)) ||
    change.edgesAdded.some((edge) => eitherEnd(edge, heldAfter)) ||
    change.edgesChanged.some((edge) => eitherEnd(edge, heldAfter)) ||
    change.edgesRemoved.some((edge) => eitherEnd(edge, heldAfter) || eitherEnd(edge, heldBefore))
  );
}
