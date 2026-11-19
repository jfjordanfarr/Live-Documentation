/**
 * The arithmetic of zooming and panning the history's track (2026-11-19, the owner: "Could I pinch or scroll the history
 * ticks area to expand or contract it, as one does for horizontal zoom in/out in FL Studio?"). A zoom is a new way to
 * move a state the scrubber already had, the range: the interval of steps the track shows whole. The wheel, a pinch and
 * the keys narrow or widen it about a step; a sideways wheel or two fingers dragged slide it. While a gesture runs the
 * view is kept in fractional steps, so that a trackpad's small deltas add up rather than each rounding to nothing; the
 * range the scrubber shows is the view rounded.
 *
 * Pure-function module: no DOM.
 *
 * @module zoom
 */

import type { HistoryRange } from "./navigation";

/** The narrowest range a zoom reaches, in steps between its ends: eight steps keep the ticks a few pixels apart and a day's commits in view together. */
export const LEAST_SPAN = 8;

/** A range in fractional steps, its first and its last. */
export type View = readonly [first: number, last: number];

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

/**
 * The view scaled by `factor` about `focus`, a step (fractional) that stays where it stands on the track: a factor
 * below one narrows, above one widens. The span is held between the least span (or the whole history, if shorter) and
 * the whole history, `last` being the history's last step; a range already narrower than the least, as the finder can
 * choose, is never widened by a narrowing, and a range of one step widens from one. The view is slid back inside the
 * history where the scale would carry it past an end.
 */
export function zoomView(view: View, focus: number, factor: number, last: number, least = LEAST_SPAN): View {
  if (last <= 0) return [0, 0];
  const [first, end] = view;
  const span = Math.max(0, end - first);
  const scale = Number.isFinite(factor) && factor > 0 ? factor : 1;
  const next = clamp(Math.max(span, scale > 1 ? 1 : 0) * scale, Math.min(least, last, span), last);
  const at = clamp(focus, first, end);
  const share = span > 0 ? (at - first) / span : 0.5;
  const start = clamp(at - share * next, 0, last - next);
  return [start, start + next];
}

/** The view slid by `by` steps, later for a positive amount, held inside the history. */
export function panView(view: View, by: number, last: number): View {
  const [first, end] = view;
  const span = end - first;
  const start = clamp(first + (Number.isFinite(by) ? by : 0), 0, Math.max(0, last - span));
  return [start, start + span];
}

/** The range a view shows, its ends rounded to steps; null where it shows the whole history. */
export function rangeOfView(view: View, last: number): HistoryRange | null {
  const first = clamp(Math.round(view[0]), 0, last);
  const end = clamp(Math.round(view[1]), first, last);
  return first <= 0 && end >= last ? null : [first, end];
}

/** The range slid by the least amount that holds the step, its span kept; the range itself where it holds it already. */
export function slideToHold(range: HistoryRange, step: number): HistoryRange {
  const [first, last] = range;
  if (step < first) return [step, step + (last - first)];
  if (step > last) return [step - (last - first), step];
  return range;
}

/**
 * The factor a wheel's turn scales the view by: an exponential of its vertical delta, so that a trackpad's run of small
 * deltas is smooth and a notched wheel's even notches take even steps, each about a fifth. A trackpad's pinch reaches
 * the page as a wheel with Ctrl held and small deltas, so it is read more strongly. Lines and pages are read as pixels.
 */
export function wheelFactor(deltaY: number, deltaMode: number, pinch: boolean): number {
  const pixels = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1);
  return Math.exp(pixels * (pinch ? 0.01 : 0.002));
}
