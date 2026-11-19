/**
 * The 2D camera follows the intent a gesture declares (2026-11-19). A fresh subject (a link, a search choice, the first
 * open) is an arrival, framed by Tuning's Arrival: at reading size, as before; at reading size and then, once the picture
 * has settled and a moment has passed, eased back to the neighbours; or on the neighbours at once. A step from inside the
 * map (a cell pressed to pin its file, a directory's skin opened, a neighbour pinned from a card) is a climb: the camera
 * keeps its scale and moves only as far as brings the newcomer into view. This module holds the arithmetic and the
 * timing; the controller measures the page and moves the camera.
 *
 * Beside that, a trial for the owner's eye (Tuning → 2D Layout → Framing, Follows Pins; the owner's Turn 37 of the
 * November 18 record): the camera follows the pinned set, newest first, until the person takes it by hand, and Fit
 * gives the following back. Its frame ({@link pinsFrame}) and its ease ({@link framingEaseMs}) are here.
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
  return { phase: "ease", transform: poseBetween(start, end, easeInOutCubic(t), frame) };
}

/**
 * The camera a fraction `eased` of the way from `start` to `end`: the scale in its logarithm, so that a zoom reads as
 * even, and the picture's point under the frame's middle along a straight line between the two frames' middles.
 */
export function poseBetween(start: MapTransform, end: MapTransform, eased: number, frame: Frame): MapTransform {
  const k = start.k * (end.k / start.k) ** eased;
  const middle = { x: frame.width / 2, y: frame.height / 2 };
  const from = { x: (middle.x - start.x) / start.k, y: (middle.y - start.y) / start.k };
  const to = { x: (middle.x - end.x) / end.k, y: (middle.y - end.y) / end.k };
  const at = { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
  return { x: middle.x - at.x * k, y: middle.y - at.y * k, k };
}

/**
 * One thing the camera frames when it follows the pins (Tuning → 2D Layout → Framing, Follows Pins; 2026-11-19): a
 * whole-file pin's card, a pinned symbol's row with its card's name line, so that a row is never framed without saying
 * whose it is, or the subject's card when nothing is pinned. In the picture's own units. A `card` alone is read as an
 * arrival reads it, at reading scale and entered at its top where it is taller than the room.
 */
export interface FramingTarget<K = string> {
  key: K;
  bounds: Bounds;
  card?: boolean;
  /** What is held of it while other targets are framed with it, where that is less than the whole: the unpinned subject's name line. */
  brief?: Bounds;
}

/** Where following the pins puts the camera, and which targets that frame holds and which it leaves out, oldest first. */
export interface PinsFraming<K = string> {
  transform: MapTransform;
  held: K[];
  left: K[];
}

/**
 * The frame that follows the pins, as a map application's tracking mode follows its blue dot. The targets come oldest
 * first. The frame is the smallest box that holds them, padded as Fit pads, at the largest scale that holds it, never
 * closer than `ceiling` (reading scale: text is never enlarged past it) and never farther than `floor`. Where the targets
 * do not fit at the floor, the oldest are left out one at a time until the rest fit; the newest is always held. One
 * target alone is the owner's "one pin": a card at the ceiling, entered at its top or left where it is larger than the
 * room, as an arrival frames it; any other target at the largest scale between floor and ceiling that holds it, entered
 * at its start where even the floor cannot. Null for no targets. Depends on its inputs alone.
 */
export function pinsFrame<K>(targets: readonly FramingTarget<K>[], frame: Frame, ceiling: number, floor: number): PinsFraming<K> | null {
  if (!targets.length) return null;
  const { horizontal, vertical } = framePadding(frame);
  const room = { width: frame.width - 2 * horizontal, height: frame.height - 2 * vertical };
  const fitOf = (box: Bounds): number => Math.min(room.width / Math.max(1, box.width), room.height / Math.max(1, box.height));
  // Centred along an axis where the box fits the room at k, else its start at the padding, as a page is entered.
  const place = (box: Bounds, k: number): MapTransform => ({
    x: box.width * k > room.width + 0.5 ? horizontal - box.left * k : frame.width / 2 - (box.left + box.width / 2) * k,
    y: box.height * k > room.height + 0.5 ? vertical - box.top * k : frame.height / 2 - (box.top + box.height / 2) * k,
    k
  });
  for (let first = 0; first < targets.length; first++) {
    const held = targets.slice(first), left = targets.slice(0, first).map(target => target.key);
    const box = unionOf(held.map(target => held.length > 1 ? target.brief ?? target.bounds : target.bounds))!;
    const fit = fitOf(box);
    if (held.length === 1) {
      const k = held[0].card ? ceiling : clamp(fit, floor, ceiling);
      return { transform: place(box, k), held: [held[0].key], left };
    }
    if (fit >= floor * (1 - 1e-9)) return { transform: place(box, Math.min(fit, ceiling)), held: held.map(target => target.key), left };
  }
  return null;
}

/** The shortest and longest a re-frame of the following camera eases. */
export const FRAMING_EASE_MIN_MS = 300;
export const FRAMING_EASE_MAX_MS = 900;

/**
 * How long a re-frame eases, growing with how far the camera goes: a quarter of a second for each doubling of scale, and
 * two fifths of a second for each frame's diagonal the frame's middle travels on screen at the lesser of the two scales,
 * from {@link FRAMING_EASE_MIN_MS} to {@link FRAMING_EASE_MAX_MS}. A short pull back is short; a long ride is not
 * made longer than the eye will follow.
 */
export function framingEaseMs(start: MapTransform, end: MapTransform, frame: Frame): number {
  const zoom = Math.abs(Math.log2(end.k / start.k));
  const middle = { x: frame.width / 2, y: frame.height / 2 };
  const from = { x: (middle.x - start.x) / start.k, y: (middle.y - start.y) / start.k };
  const to = { x: (middle.x - end.x) / end.k, y: (middle.y - end.y) / end.k };
  const travel = Math.hypot(to.x - from.x, to.y - from.y) * Math.min(start.k, end.k) / Math.max(1, Math.hypot(frame.width, frame.height));
  return clamp(FRAMING_EASE_MIN_MS + 250 * zoom + 400 * travel, FRAMING_EASE_MIN_MS, FRAMING_EASE_MAX_MS);
}

/** Whether two cameras differ by less than the eye sees: half a pixel of pan and a thousandth of scale. */
export function sameCamera(a: MapTransform, b: MapTransform): boolean {
  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.k / b.k - 1) < 1e-3;
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
