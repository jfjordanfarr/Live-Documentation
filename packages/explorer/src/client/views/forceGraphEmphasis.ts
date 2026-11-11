/**
 * How a step of the history tells its changed files apart in the 3D picture (the owner's ask of 2026-10-31: "it should
 * be obvious what is actually changing as a commit is walked by during history playback"). A changed sphere glows, its
 * colour white for the entire displayed commit; an unchanged one can dim by the tuning's mode. There is no clock in
 * this calculation: the next commit replaces the changed set. Fading the dimming had made unaffected nodes brighten
 * throughout each interval, which the owner identified during live playback on 2026-11-01. Changed wires can become
 * more visible for the same complete interval. Playback speed never changes the strength of the emphasis.
 *
 * Since 2026-11-11 the step reaches inside the wrappers too, by one rule: a change is shown at the innermost thing the
 * picture draws for it. The owner, playing the history over the Structure layout's bubbles: "I don't see any of the
 * nodes deep inside the bubbles lighting up when they were affected by a commit" (Turn 6 of the November 10 record). A
 * changed file drawn as a dot within a skin is coloured as a changed sphere is, by `emphasizedSphere`, so that spheres
 * and dots cannot drift apart; a change not drawn as a dot, inside a veiled bubble or a veiled body, or a file the step
 * deleted, lights the innermost bubble drawn that holds it, or the skin itself where none does; and where the mode
 * dims, a bubble or a skin holding no change dims with the unchanged dots (`bodyChanges`, `emphasizedUnits`,
 * `emphasizedSkin`).
 *
 * Pure-function module: no DOM.
 */

import type { ChangeEmphasis } from "../types";
import { parentDirectory } from "./localView/directory-bands";

/** How much of its alpha an unchanged sphere or wire loses at full strength. */
const DIM_LOSS = 0.8;
/** The alpha a changed wire reaches at full strength. */
const WIRE_GLOW = 0.85;

/** Whether the mode glows the changed. */
export const glows = (mode: ChangeEmphasis): boolean => mode === "glow" || mode === "both";
/** Whether the mode dims the unchanged. */
export const dims = (mode: ChangeEmphasis): boolean => mode === "dim" || mode === "both";

/** A `#rrggbb` colour's channels. */
function channelsOf(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`A sphere's colour is #rrggbb, not ${JSON.stringify(hex)}.`);
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

/**
 * A sphere's colour for the displayed commit: changed spheres white and whole where the mode glows; unchanged ones
 * dimmed where the mode dims. The result remains constant until the changed set, mode or deliberate attention changes.
 */
export function emphasizedSphere(hex: string, alpha: number, changed: boolean, mode: ChangeEmphasis): string {
  const [r, g, b] = channelsOf(hex);
  if (changed && glows(mode)) return "rgba(255, 255, 255, 1.000)";
  if (!changed && dims(mode)) return `rgba(${r}, ${g}, ${b}, ${(alpha * (1 - DIM_LOSS)).toFixed(3)})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/** A white reference wire's alpha under the emphasis: a changed wire's raised toward the glow, an unchanged one's reduced, where the mode says so. */
export function emphasizedWireAlpha(alpha: number, changed: boolean, mode: ChangeEmphasis): number {
  if (changed && glows(mode)) return WIRE_GLOW;
  if (!changed && dims(mode)) return alpha * (1 - DIM_LOSS);
  return alpha;
}

/** The key of an undirected pair of files, the same whichever end is named first. */
export const pairKey = (a: string, b: string): string => (a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`);

/**
 * A unit a body's skin shows within it, as the emphasis reads it: a file's dot or an inner bubble, by its id (a file's
 * path, a bubble's directory), the bubble it stands in, and, at depth -1, the one veiled bubble that fills a body none of
 * whose files are drawn (`veiledUnits`).
 */
export interface ShownUnit {
  id: string;
  kind: "file" | "directory";
  parent?: string;
  depth?: number;
}

/** Where a body shows the step of the history displayed. */
export interface BodyChanges {
  /** The units the step lights: a changed file's dot, or the innermost drawn bubble of a change not drawn as a dot. */
  lit: ReadonlySet<string>;
  /** The bubbles holding a change of the step, lit or not, which keep their alpha where the mode dims. */
  holding: ReadonlySet<string>;
  /** Whether the skin itself is the innermost thing drawn for a change: no bubble drawn within it holds the change. */
  skin: boolean;
  /** Whether the body holds any change of the step, so that its skin keeps its alpha where the mode dims. */
  holds: boolean;
}

/**
 * Where a body shows the step: at the innermost thing the picture draws for each change. A changed file drawn as a dot
 * is that dot; one not drawn, inside a veiled bubble or a veiled body, is that bubble; a file the step deleted, gone from
 * the picture, is the innermost drawn bubble of the directory it stood in; and a change no bubble drawn holds, or that a
 * look drawing nothing within the skin hides, is the skin. Every bubble around a change holds it. `units` are what the
 * skin draws within it (none under a look that veils them); `members` the files the body holds, by path; `seed` the
 * body's own node, which for a wrapped group is a file drawn as a sphere of its own and never a unit, so that its change
 * lights nothing within the skin, though the body holds it; `changed` the
 * step's changed files; `deleted` the step's deleted files that the picture gives this body (`deletionHomes`). The work
 * is bounded by the units and the changes, never by the files a veiled body holds.
 */
export function bodyChanges(units: readonly ShownUnit[], members: ReadonlySet<string>, seed: string, changed: Iterable<string>, deleted: Iterable<string>): BodyChanges {
  const dots = new Map<string, ShownUnit>(), bubbles = new Map<string, ShownUnit>();
  let veil: ShownUnit | undefined;
  for (const unit of units) {
    if (unit.kind === "file") dots.set(unit.id, unit);
    else if (unit.depth === -1) veil = unit;
    else bubbles.set(unit.id, unit);
  }
  const lit = new Set<string>(), holding = new Set<string>();
  let skin = false, holds = false;
  /** A bubble and every bubble around it hold a change. */
  const hold = (bubble: string | undefined): void => {
    for (let at = bubble; at !== undefined && !holding.has(at); at = bubbles.get(at)?.parent) holding.add(at);
  };
  /** The innermost bubble drawn that holds a directory: the deepest whose directory is it or above it, else the body's veil. */
  const bubbleHolding = (directory: string): string | undefined => {
    for (let at = directory; ; at = parentDirectory(at)) {
      if (bubbles.has(at)) return at;
      if (at === "") return veil?.id;
    }
  };
  const showIn = (directory: string): void => {
    holds = true;
    const bubble = bubbleHolding(directory);
    if (bubble === undefined) skin = true;
    else { lit.add(bubble); hold(bubble); }
  };
  for (const file of changed) {
    // A wrapped group's seed is drawn as a sphere of its own, which carries its change; the body holds it, and lights nothing for it.
    if (file === seed) { holds ||= members.has(file); continue; }
    if (!members.has(file)) continue;
    const dot = dots.get(file);
    if (dot) { holds = true; lit.add(file); hold(dot.parent); }
    else showIn(parentDirectory(file));
  }
  for (const file of deleted) showIn(parentDirectory(file));
  return { lit, holding, skin, holds };
}

/**
 * The body each of a step's deleted files is shown in: the body drawn for the deepest directory, among those the picture
 * draws something for, that holds the file's directory. `homes` maps each such directory to its body's id, or to null
 * where the picture draws it as a hub's sphere, which lights by its own emphasis, so that no body outside it claims the
 * file. A file no directory drawn holds is shown in none. By body, each body's files in the order given.
 */
export function deletionHomes(deleted: Iterable<string>, homes: ReadonlyMap<string, string | null>): Map<string, string[]> {
  const shown = new Map<string, string[]>();
  for (const file of deleted) {
    for (let at = parentDirectory(file); ; at = parentDirectory(at)) {
      const home = homes.get(at);
      if (home !== undefined) {
        if (home !== null) (shown.get(home) ?? shown.set(home, []).get(home)!).push(file);
        break;
      }
      if (at === "") break;
    }
  }
  return shown;
}

/**
 * A body's units as the step colours them: a file's dot as `emphasizedSphere` colours a sphere at full strength, from
 * its kind's `#rrggbb` colour; a bubble lit where the mode glows and it is lit, and, where the mode dims, at the dimmed
 * share of its alpha unless it holds a change. Nothing is enlarged: the irrelevant fades rather than the relevant grows.
 */
export function emphasizedUnits<U extends ShownUnit & { color?: string; lit?: boolean; alpha?: number }>(units: readonly U[], changes: BodyChanges, mode: ChangeEmphasis): U[] {
  return units.map(unit => unit.kind === "file"
    ? { ...unit, color: emphasizedSphere(unit.color ?? "#ffffff", 1, changes.lit.has(unit.id), mode) }
    : { ...unit, lit: glows(mode) && changes.lit.has(unit.id), alpha: dims(mode) && !changes.holding.has(unit.id) ? 1 - DIM_LOSS : 1 });
}

/** How a body's own skin carries the step: lit where the mode glows and the skin shows a change; dimmed where the mode dims and it holds none. */
export function emphasizedSkin(changes: BodyChanges, mode: ChangeEmphasis): { lit: boolean; alpha: number } {
  return { lit: glows(mode) && changes.skin, alpha: dims(mode) && !changes.holds ? 1 - DIM_LOSS : 1 };
}
