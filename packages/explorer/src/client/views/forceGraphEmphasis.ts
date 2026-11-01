/**
 * How a step of the history tells its changed files apart in the 3D picture (the owner's ask of 2026-10-31: "it should
 * be obvious what is actually changing as a commit is walked by during history playback"). A changed sphere glows, its
 * colour lifted toward white at full strength; an unchanged one dims; the tuning's emphasis says which, both or neither.
 * While the history plays the emphasis fades over the step's time, so that it is gone as the next step's arrives; at
 * rest it holds, so that a person who stops can see what the step changed. A wire a step added or changed glows with
 * the files. Whether a glow or a dimming reads better is "a matter of taste, and worth trying many permutations", so
 * the modes are a lever.
 *
 * Pure-function module: no DOM.
 */

import type { ChangeEmphasis } from "../types";

/** How far toward white a changed sphere's colour is lifted at full strength. */
const GLOW_LIFT = 0.7;
/** How much of its alpha an unchanged sphere or wire loses at full strength. */
const DIM_LOSS = 0.8;
/** The alpha a changed wire reaches at full strength. */
const WIRE_GLOW = 0.85;

/** Whether the mode glows the changed. */
export const glows = (mode: ChangeEmphasis): boolean => mode === "glow" || mode === "both";
/** Whether the mode dims the unchanged. */
export const dims = (mode: ChangeEmphasis): boolean => mode === "dim" || mode === "both";

/**
 * The strength of the emphasis at `now`: one while the history rests; while it plays, falling from one at the step's
 * arrival to nothing at the next step's, `interval` later. Nothing before the arrival.
 */
export function emphasisStrength(playing: boolean, arrivedAt: number, now: number, interval: number): number {
  if (!playing) return 1;
  if (!(interval > 0) || now <= arrivedAt) return 1;
  return Math.max(0, 1 - (now - arrivedAt) / interval);
}

/** A `#rrggbb` colour's channels. */
function channelsOf(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`A sphere's colour is #rrggbb, not ${JSON.stringify(hex)}.`);
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

/**
 * A sphere's colour under the emphasis, as `rgba()`: a changed sphere's lifted toward white by the strength and drawn
 * whole, an unchanged one's alpha reduced by the strength, where the mode says so; otherwise the colour at its alpha.
 */
export function emphasizedSphere(hex: string, alpha: number, changed: boolean, mode: ChangeEmphasis, strength: number): string {
  const [r, g, b] = channelsOf(hex);
  const s = Math.max(0, Math.min(1, strength));
  if (changed && glows(mode) && s > 0) {
    const lift = (channel: number): number => Math.round(channel + (255 - channel) * GLOW_LIFT * s);
    return `rgba(${lift(r)}, ${lift(g)}, ${lift(b)}, ${(alpha + (1 - alpha) * s).toFixed(3)})`;
  }
  if (!changed && dims(mode) && s > 0) return `rgba(${r}, ${g}, ${b}, ${(alpha * (1 - DIM_LOSS * s)).toFixed(3)})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/** A white reference wire's alpha under the emphasis: a changed wire's raised toward the glow, an unchanged one's reduced, where the mode says so. */
export function emphasizedWireAlpha(alpha: number, changed: boolean, mode: ChangeEmphasis, strength: number): number {
  const s = Math.max(0, Math.min(1, strength));
  if (changed && glows(mode)) return alpha + (WIRE_GLOW - alpha) * s;
  if (!changed && dims(mode)) return alpha * (1 - DIM_LOSS * s);
  return alpha;
}

/** The key of an undirected pair of files, the same whichever end is named first. */
export const pairKey = (a: string, b: string): string => (a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`);
