/**
 * How a step of the history tells its changed files apart in the 3D picture (the owner's ask of 2026-10-31: "it should
 * be obvious what is actually changing as a commit is walked by during history playback"). A changed sphere glows, its
 * colour white for the entire displayed commit; an unchanged one can dim by the tuning's mode. There is no clock in
 * this calculation: the next commit replaces the changed set. Fading the dimming had made unaffected nodes brighten
 * throughout each interval, which the owner identified during live playback on 2026-11-01. Changed wires can become
 * more visible for the same complete interval. Playback speed never changes the strength of the emphasis.
 *
 * Pure-function module: no DOM.
 */

import type { ChangeEmphasis } from "../types";

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
