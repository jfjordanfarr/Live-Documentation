/**
 * The 2D Local Map's farthest zoom (2026-11-06, the far bands' second milestone, after the owner's "Limits limits limits.
 * Clamps clamps clamps"): zooming out stops at the card ladder's last step, where the drawing stops changing, or, where
 * the whole map with a margin is not yet in view at that scale, at the scale that shows it. The fixed floor of 0.05 it
 * replaces let every map shrink to a postage stamp long after the whole of it was in view.
 *
 * @module zoom-limits
 */

import { LAST_STEP, STEP_RATIO } from "./ladder-steps";
import { computeFitTransform } from "./layout-measure";

/** The share of the whole map's fit the farthest zoom keeps, so that the map stands in the frame with a margin. */
export const WHOLE_MAP_MARGIN = 0.8;

/** The closest zoom, unchanged: three times the map's own size. */
export const CLOSEST_SCALE = 3;

/** A guard for a camera whose map has not been measured yet: no limit but that the scale stays positive. */
export const UNMEASURED_FLOOR = 1e-3;

/** A box's size, the map's content's or the frame's, in pixels. */
export interface Extent {
  width: number;
  height: number;
}

/**
 * The farthest scale the camera may take, from the map's content in its own units, the frame on screen and the reading
 * scale the arrival calibrated: the least of the ladder's last step (the reading scale times STEP_RATIO to the power of
 * -LAST_STEP) and four fifths of the scale at which the map's fit shows the whole map, so that a map larger than the frame
 * at the last step can still be seen whole, with a margin, and one smaller stops where its drawing stops changing. Null
 * while the content or the frame is not yet measured, or the reading scale not known, so that the camera is not trapped
 * before the first layout; the caller then keeps {@link UNMEASURED_FLOOR}.
 */
export function farthestScale(content: Extent | null, frame: Extent | null, readingScale: number): number | null {
  if (!content || !frame || !(content.width > 0) || !(content.height > 0) || !(frame.width > 0) || !(frame.height > 0)) return null;
  if (!(readingScale > 0) || !Number.isFinite(readingScale)) return null;
  const lastStep = readingScale * STEP_RATIO ** -LAST_STEP;
  const bounds = { left: 0, top: 0, right: content.width, bottom: content.height, width: content.width, height: content.height };
  const whole = computeFitTransform({ content: bounds, focus: null }, frame, { minScale: 0, maxScale: Number.POSITIVE_INFINITY }).k;
  return Math.min(lastStep, CLOSEST_SCALE, WHOLE_MAP_MARGIN * whole);
}

/** Whether a scale stands at a limit, within the rounding a camera's arithmetic leaves. */
export function atScale(scale: number, limit: number): boolean {
  return Math.abs(scale - limit) <= limit * 1e-6;
}
