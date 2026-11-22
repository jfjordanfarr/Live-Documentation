/**
 * The way down from the World Map, as facts: which files of a thing carry its wires to the other things of the board,
 * which files stand at a wire's two ends, and which of them one picture is asked to hold.
 *
 * @remarks
 * A trial of 2026-11-22 (Tuning's Way Down at Carries The Question). The board's join already names, for every wire it
 * found in the docs, the file-level edges behind it, each from a file of the thing that calls or stands on to a file of
 * the thing that serves; nothing here reads anything else. A declared wire has no such edges and gives no file. Pure;
 * the controller hands what this returns to the page, which pins it in the Local Map.
 */

import type { WorldModel, WorldRoad } from "./model";

/**
 * How many cards one way down's picture is asked to hold: the files it pins and every file a line joins to one of them,
 * which the Local Map draws beside it. Two dozen is about what a 1,280 by 800 window holds at the farthest scale where
 * every name still reads. Counted by files alone, six pinned, this repository's `engine` opened as a picture of
 * hundreds of cards, one of its six files being joined to seventy-eight others (looked at 2026-11-22). What does not
 * fit is counted, never silently left out.
 */
export const WAY_DOWN_CARDS = 24;

/** The files a way down asks the Local Map to pin, and how many more carry the same wires and are not pinned. */
export interface WayDownFiles {
  files: string[];
  /** Every file that carries the wires, the pinned ones included. */
  total: number;
}

/**
 * The wires a thing's way down carries, of those the docs can show at the grain of files: its calls, the wires drawn in
 * the air from door to door, which are what a request travels by; and only where it has none, the wires by which it
 * stands on another thing's code or another stands on its own, so that a library is not opened empty-handed. Carrying
 * both at once, the estate's hub opened with seven files of the shared contracts beside the two files a payment passes
 * through (looked at 2026-11-22; the picture is kept with the trial's evidence).
 */
function wiresOf(model: Pick<WorldModel, "roads">, thing: string): WorldRoad[] {
  const touching = model.roads.filter((road) => (road.from === thing) !== (road.to === thing) && road.lines.length > 0);
  const calls = touching.filter((road) => road.kind === "call");
  return calls.length > 0 ? calls : touching;
}

/** One wire's files on a thing's own side, the file that carries most of the wire's edges first, then by name. */
function ownFiles(road: WorldRoad, thing: string): string[] {
  const edges = new Map<string, number>();
  for (const line of road.lines) {
    const file = road.from === thing ? line.from : line.to;
    edges.set(file, (edges.get(file) ?? 0) + 1);
  }
  return [...edges].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([file]) => file);
}

/**
 * Every file of a thing that carries one of its wires to another thing of the board: the files that serve what another
 * thing calls, and the files that call another thing's door; or, for a thing no call touches, the files others stand
 * on and the files that stand on others'. In the order a picture should take them when it cannot take all: one file
 * for each wire before a second for any, and within a wire the file that carries most of its edges first; so that
 * every neighbouring thing is reached before any is reached twice.
 */
export function wireFilesOf(model: Pick<WorldModel, "roads">, thing: string): string[] {
  const queues = wiresOf(model, thing).map((road) => ownFiles(road, thing));
  const taken = new Set<string>();
  for (let turn = 0; queues.some((queue) => turn < queue.length); turn++) {
    for (const queue of queues) {
      if (turn < queue.length) {
        taken.add(queue[turn]);
      }
    }
  }
  return [...taken];
}

/**
 * The files at a wire's two ends, pair by pair as its edges stand in the docs: the file that calls, then the file that
 * serves it, each once.
 */
export function wireEndsOf(road: Pick<WorldRoad, "lines">): string[] {
  return [...new Set(road.lines.flatMap((line) => [line.from, line.to]))];
}

/**
 * What one way down pins of the files that carry it, and the count of them all. The files are taken in their order
 * while the cards they bring, themselves and the files `neighbours` joins to them, stay within the budget; a file that
 * would overrun it is passed over for the next that fits, so that one much-used file does not take the whole picture
 * from the rest. The first `least` are pinned whatever they bring: a wire's first two, the file that calls and the file
 * that serves. Where no file fits at all, the first is pinned alone, so that a way down never arrives with nothing.
 */
export function heldFiles(files: readonly string[], neighbours: (file: string) => Iterable<string>, least = 0, budget = WAY_DOWN_CARDS): WayDownFiles {
  const cards = new Set<string>();
  const held: string[] = [];
  files.forEach((file, index) => {
    const brought = [...new Set([file, ...neighbours(file)])].filter((card) => !cards.has(card));
    if (index >= least && cards.size + brought.length > budget) {
      return;
    }
    held.push(file);
    for (const card of brought) {
      cards.add(card);
    }
  });
  return { files: held.length > 0 ? held : files.slice(0, 1), total: files.length };
}
