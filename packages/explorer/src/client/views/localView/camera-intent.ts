/**
 * The 2D camera follows the intent a gesture declares (2026-11-19). A fresh subject (a link, a search choice, the first
 * open) is an arrival, framed by Tuning's Arrival: at reading size, as before; at reading size and then, once the picture
 * has settled and a moment has passed, eased back to the neighbours; or on the neighbours at once. A step from inside the
 * map (a cell pressed to pin its file, a directory's skin opened, a neighbour pinned from a card) is a climb: the camera
 * keeps its scale and moves only as far as brings the newcomer into view. This module holds the arithmetic and the
 * timing; the controller measures the page and moves the camera.
 *
 * @module camera-intent
 */
import { farthestRatioOf } from "./ladder-steps";
import { clamp, framePadding, type Bounds, type Frame } from "./layout-measure";
import type { MapTransform } from "./types";

/** How long the arrival rests on the subject at reading size, once the picture has settled, before it eases back. */
export const ARRIVAL_HOLD_MS = 900;
/** How long the ease from reading size to the neighbours takes. */
export const ARRIVAL_EASE_MS = 700;
/** How long a newcomer's outline is drawn emphasised, fading to its usual look. */
export const STEP_MARK_MS = 1000;

/**
 * The farthest an arrival frames the neighbours, as a ratio of reading scale: the connections look's last press, the
 * farthest zoom at which every card's names still read (ladder-steps.ts). Farther, the overview look strips a card to its
 * file's name alone.
 */
export const ARRIVAL_FLOOR_RATIO = farthestRatioOf("connections");

/**
 * Where an arrival comes to rest when it frames the neighbours: what Fit frames (the whole picture, centred inside the
 * frame's padding), but never closer than reading scale and never farther than {@link ARRIVAL_FLOOR_RATIO} of it; where
 * that floor stops it short of the whole picture, the subject is centred at the floor and the far neighbours are cut.
 * Content and subject are in the picture's own units, the frame in the screen's; the result depends on nothing else, so
 * that two screens of one size land on one frame.
 */
export function arrivalEndFrame(content: Bounds, subject: Bounds, frame: Frame, readingScale: number): MapTransform {
  const { horizontal, vertical } = framePadding(frame);
  const whole = Math.min((frame.width - 2 * horizontal) / Math.max(1, content.width), (frame.height - 2 * vertical) / Math.max(1, content.height));
  const floor = readingScale * ARRIVAL_FLOOR_RATIO;
  const k = clamp(whole, floor, readingScale);
  const centre = whole >= floor ? content : subject;
  return { x: frame.width / 2 - (centre.left + centre.width / 2) * k, y: frame.height / 2 - (centre.top + centre.height / 2) * k, k };
}

/** The arrival's moment: resting at reading size, easing back, or done. */
export type ArrivalPhase = "hold" | "ease" | "done";

/**
 * The camera of an arrival that eases back to the neighbours, `elapsed` milliseconds after the picture settled at
 * reading size (`start`): still for {@link ARRIVAL_HOLD_MS}, then eased in and out to `end` over {@link ARRIVAL_EASE_MS}.
 * The scale is eased in its logarithm, so that the zoom reads as even; the point under the frame's middle travels in a
 * straight line between the two frames' middles.
 */
export function arrivalPose(start: MapTransform, end: MapTransform, elapsed: number, frame: Frame): { phase: ArrivalPhase; transform: MapTransform } {
  if (elapsed < ARRIVAL_HOLD_MS) return { phase: "hold", transform: start };
  const t = clamp((elapsed - ARRIVAL_HOLD_MS) / ARRIVAL_EASE_MS, 0, 1);
  if (t >= 1) return { phase: "done", transform: end };
  const eased = easeInOutCubic(t);
  const k = start.k * (end.k / start.k) ** eased;
  // The picture's point at the frame's middle, at each end, and between them.
  const middle = { x: frame.width / 2, y: frame.height / 2 };
  const from = { x: (middle.x - start.x) / start.k, y: (middle.y - start.y) / start.k };
  const to = { x: (middle.x - end.x) / end.k, y: (middle.y - end.y) / end.k };
  const at = { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
  return { phase: "ease", transform: { x: middle.x - at.x * k, y: middle.y - at.y * k, k } };
}

/** Ease in and out, cubic. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * The input of a person's on the map that ends an arrival where it stands: their hand outranks the camera. A pointer
 * pressed, a wheel turned, a key pressed or a touch begun; a pointer that only passes over the map does not.
 */
export const ARRIVAL_ENDING_INPUTS = ["pointerdown", "wheel", "keydown", "touchstart"] as const;

/**
 * The least pan, in the screen's pixels, that brings a newcomer wholly inside the frame's padding at the camera given.
 * Where the newcomer is larger than the room along an axis, its start is brought to the room's start along it, as a
 * page is entered at its top left: a card taller than the view is entered at its name row with as much of it below as
 * the view holds, and an opened directory at its label. A newcomer already inside does not move the camera. The
 * newcomer is in the picture's own units.
 */
export function revealPan(newcomer: Bounds, camera: MapTransform, frame: Frame): { x: number; y: number } {
  const { horizontal, vertical } = framePadding(frame);
  const axis = (start: number, end: number, origin: number, min: number, max: number): number => {
    const from = origin + start * camera.k, to = origin + end * camera.k;
    if (to - from > max - min) return min - from;
    return from < min ? min - from : to > max ? max - to : 0;
  };
  return {
    x: axis(newcomer.left, newcomer.right, camera.x, horizontal, frame.width - horizontal),
    y: axis(newcomer.top, newcomer.bottom, camera.y, vertical, frame.height - vertical)
  };
}

/** Every box given as one, in the same units; null for none. */
export function unionOf(boxes: readonly Bounds[]): Bounds | null {
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map(box => box.left)), top = Math.min(...boxes.map(box => box.top));
  const right = Math.max(...boxes.map(box => box.right)), bottom = Math.max(...boxes.map(box => box.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}
