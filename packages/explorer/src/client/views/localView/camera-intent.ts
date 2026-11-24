/**
 * The 2D camera follows the intent a gesture declares (2026-11-19). A fresh subject (a link, a search choice, the first
 * open) is an arrival, framed by Tuning's Arrival: at reading size and then, once the picture has settled and its rest
 * has passed, eased back to the neighbours, the default since 2026-11-22 in the form that changes the cards' look at rest
 * after the ease, and waiting on the person's pointer and focus ({@link arrivalReleased}); at reading size, as before
 * that day; or on the neighbours at once. A step from inside the
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
import type { ArrivalFraming, ArrivalWait } from "../../types";
import { farthestRatioOf, STEP_RATIO } from "./ladder-steps";
import { clamp, framePadding, type Bounds, type Frame } from "./layout-measure";
import type { MapTransform } from "./types";

/**
 * The default of Tuning's Arrival Rest: how long, in seconds, an arrival that pulls back stays on the subject at reading
 * size, at the least, once the picture has settled (the owner, 2026-11-22: "ensure a minimum of N seconds of reading view
 * size time, then permit immediate zoom-out when pointer exits node"). It was 0.9 s, fixed, from 2026-11-19, and the
 * probe of 2026-11-21 found a reader "pulled off" the words at that. The rest is not the time to read the card, which the
 * pointer or the focus on the card gives for as long as it stays: it is the time to see what stands there and to bring a
 * pointer to it. Counted from what a person does in it: about a quarter of a second to take in a new picture, the file's
 * name and the first words under it read at some four words a second (silent reading of English runs near 240 words a
 * minute), and a hand's move to a large card in the middle of the view, about half a second. That is near a second and a
 * half, and half a second more would begin to read as the page having stopped.
 */
export const ARRIVAL_REST_S = 1.5;
/** How long the ease from reading size to the neighbours takes. */
export const ARRIVAL_EASE_MS = 700;

/**
 * Whether an arrival's rest at reading size is over and its pull-back may begin (Tuning's Arrival Waits): `rested` is how
 * long the picture has stood settled, `rest` the least it stays (both in milliseconds), and `attended` whether a pointer
 * brought to the subject's card stands on it or the keyboard's focus is inside it. Under "attended" the pull-back begins
 * at the first moment the rest has passed and the card is not attended: at once when the pointer or the focus leaves a
 * card it stayed on past the rest, and at the rest's end where neither was ever there. Under "never" and "pointed" it
 * begins when the rest has passed; "pointed" starts the rest again while pointed at ({@link arrivalRestStartsAgain}).
 */
export function arrivalReleased(waits: ArrivalWait, rested: number, rest: number, attended: boolean): boolean {
  return rested >= rest && !(waits === "attended" && attended);
}

/** Whether the rest's clock starts again this frame: under "pointed", while the pointer stands on the subject's card. */
export function arrivalRestStartsAgain(waits: ArrivalWait, pointed: boolean): boolean {
  return waits === "pointed" && pointed;
}
/**
 * Where an arrival's pull-back changes the cards' look (trials of 2026-11-21, after the owner's "the stutter of
 * performance as the stylesheet breakpoints were hit was jarring", the November 18 record's Turn 37): "crossing", where
 * the zoom crosses the look's edge, as since 2026-11-19, which restyles the whole map in the middle of the motion; "after",
 * the look held through the ease and changed once at rest at its end; "before", changed at rest at reading size, after the
 * hold and before the ease, which then runs in the look it ends in. Null for an arrival that does not pull back.
 */
export type ArrivalLookChange = "crossing" | "after" | "before";

/** Where the pull-back of an Arrival choice changes the look; null where the choice does not pull back. */
export function arrivalLookChange(arrival: ArrivalFraming): ArrivalLookChange | null {
  return arrival === "then-neighbours" ? "crossing" : arrival === "then-neighbours-after" ? "after" : arrival === "then-neighbours-before" ? "before" : null;
}

/**
 * How long a look changed before the ease stands still before the camera moves: past the end of the look's cross-fade,
 * which the controller takes off 200 ms after the change and which restyles the cards again (`morphLook`), and a few
 * frames more, so that the change's restyle and its fade's end both fall while nothing moves. At 200 ms the fade's end
 * fell on the ease's first frames (measured 2026-11-21: a frame of 1,017 ms restyling 2,366 elements on two slowed cores).
 */
export const ARRIVAL_LOOK_LEAD_MS = 350;

/** How long a newcomer's outline is drawn emphasised, fading to its usual look. */
export const STEP_MARK_MS = 1000;

/**
 * The farthest an arrival frames the neighbours, as a ratio of reading scale: the connections look's last press, the
 * farthest zoom at which every card's names still read (ladder-steps.ts). Farther, the overview look strips a card to its
 * file's name alone.
 */
export const ARRIVAL_FLOOR_RATIO = farthestRatioOf("connections");

/**
 * The floor of Framing's "Follows Pins, Out To Files" (a matched alternative for the owner's eye, 2026-11-19): the
 * overview look's last press (presses 7 to 10, ladder-steps.ts), where a file's name is a card's only text. Used only when
 * every target is a whole-file pin, since past the connections look a pinned symbol's row is silenced.
 */
export const FILES_FLOOR_RATIO = STEP_RATIO ** -10;

/**
 * Where an arrival comes to rest when it frames the neighbours: what Fit frames (the whole picture, centred inside the
 * frame's padding), but never closer than reading scale and never farther than {@link ARRIVAL_FLOOR_RATIO} of it. Along
 * each axis independently, when the picture fits inside the frame at that scale (including inside the padding margin
 * when `k` is clamped up to `floor`) it is centred in the frame so both edges stay inside `[0, frame.width]` /
 * `[0, frame.height]` with symmetric margin rather than shoving one edge off-screen to preserve full padding on the
 * opposite side; when it overflows the frame, the subject is centred and clamped against the picture's bounds so no
 * dead void opens past one edge while cutting neighbours on the opposite edge. Content and subject are in the picture's
 * own units, the frame in the screen's; the result depends on nothing else, so that two screens of one size land on one
 * frame.
 *
 * The frame holds what was asked ({@link holdAsked}; the root's rule of 2026-11-22, after a sweep of the browser suite on
 * the pull-back as the default found a tall file's name above the view and a symbol chosen in the search outside it):
 * `asked` is the subject's name, always, and the row asked for where one was, least particular first. Where the
 * neighbourhood cannot be shown with what was asked still in the frame, what was asked wins, and the neighbourhood is
 * what fits round it: a subject taller than the frame is entered at its top, as a step enters a tall card.
 */
export function arrivalEndFrame(content: Bounds, subject: Bounds, frame: Frame, readingScale: number, asked: readonly Bounds[] = []): MapTransform {
  const { horizontal, vertical } = framePadding(frame);
  const roomW = frame.width - 2 * horizontal, roomH = frame.height - 2 * vertical;
  const whole = Math.min(roomW / Math.max(1, content.width), roomH / Math.max(1, content.height));
  const floor = readingScale * ARRIVAL_FLOOR_RATIO;
  const k = clamp(whole, floor, readingScale);
  const x = content.width * k <= frame.width + 1e-6
    ? frame.width / 2 - (content.left + content.width / 2) * k
    : clamp(frame.width / 2 - (subject.left + subject.width / 2) * k, frame.width - horizontal - content.right * k, horizontal - content.left * k);
  const y = content.height * k <= frame.height + 1e-6
    ? frame.height / 2 - (content.top + content.height / 2) * k
    : clamp(frame.height / 2 - (subject.top + subject.height / 2) * k, frame.height - vertical - content.bottom * k, vertical - content.top * k);
  return holdAsked({ x, y, k }, asked, frame);
}

/**
 * The camera moved by the least pan, its scale kept, that brings what was asked inside the frame's padding: all of it
 * where it fits together, and where it does not, the more particular of it, the things asked dropped from the first (a
 * row asked for is kept before the name of the file it is in). What is already inside moves nothing. In the picture's
 * units.
 *
 * Why the row and not the name, where a card is too tall for both (the root's ruling of 2026-11-22 on the builder's
 * choice): the row is what was asked for, and the file is still said on the page without its card's name in the frame,
 * by the search bar and by the context line under the sidebar.
 */
export function holdAsked(camera: MapTransform, asked: readonly Bounds[], frame: Frame): MapTransform {
  if (!asked.length) return camera;
  const room = roomOf(frame);
  let held = asked;
  while (held.length > 1 && fitIn(unionOf(held)!, room) < camera.k * (1 - 1e-9)) held = held.slice(1);
  const pan = revealPan(unionOf(held)!, camera, frame);
  return pan.x === 0 && pan.y === 0 ? camera : { x: camera.x + pan.x, y: camera.y + pan.y, k: camera.k };
}

/** The arrival's moment: resting at reading size, easing back, or done. */
export type ArrivalPhase = "hold" | "ease" | "done";

/**
 * The camera of an arrival that eases back to the neighbours, `elapsed` milliseconds after its rest at reading size
 * (`start`) was over ({@link arrivalReleased}; negative while it rests): eased in and out to `end` over
 * {@link ARRIVAL_EASE_MS}. The scale is eased in its logarithm, so that the zoom reads as even; the point under the
 * frame's middle travels in a straight line between the two frames' middles.
 */
export function arrivalPose(start: MapTransform, end: MapTransform, elapsed: number, frame: Frame): { phase: ArrivalPhase; transform: MapTransform } {
  if (elapsed < 0) return { phase: "hold", transform: start };
  const t = clamp(elapsed / ARRIVAL_EASE_MS, 0, 1);
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
  /**
   * What is held of it while it is not the newest of several targets framed together, where that is less than the whole:
   * a card's name line (the unpinned subject's, an older whole-file pin's), so that the newest is read and the older keep
   * their names for the person's bearings (root's ruling on the owner's "bias towards most recent items", 2026-11-19).
   */
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
  const room = roomOf(frame);
  for (let first = 0; first < targets.length; first++) {
    const held = targets.slice(first), left = targets.slice(0, first).map(target => target.key);
    const box = heldBox(held, room, floor);
    const fit = fitIn(box, room);
    if (held.length === 1) {
      const k = held[0].card ? ceiling : clamp(fit, floor, ceiling);
      return { transform: place(box, k, frame), held: [held[0].key], left };
    }
    if (fit >= floor * (1 - 1e-9)) return { transform: place(box, Math.min(fit, ceiling), frame), held: held.map(target => target.key), left };
  }
  return null;
}

/**
 * The following camera's re-frame when the person changed nothing (root's ruling of 2026-11-19): the layout moved a held
 * target (the continuing search, a card grown by reading, an opening). It never zooms in and never drops a target it can
 * keep: from the camera as it stands it zooms out only as far as the held targets need, never past the floor, and pans
 * the least that shows them; where even the floor cannot hold them all it keeps the newest alone and says the rest are
 * left out. `held` is what the last frame held, oldest first.
 */
export function keepFrame<K>(held: readonly FramingTarget<K>[], camera: MapTransform, frame: Frame, floor: number): PinsFraming<K> | null {
  if (!held.length) return null;
  const room = roomOf(frame);
  let kept = held, box = heldBox(held, room, floor);
  if (held.length > 1 && fitIn(box, room) < floor * (1 - 1e-9)) {
    kept = held.slice(-1);
    box = heldBox(kept, room, floor);
  }
  const k = Math.min(camera.k, Math.max(fitIn(box, room), floor));
  // Zoomed about the frame's middle, then the least pan that brings the box in.
  const middle = { x: frame.width / 2, y: frame.height / 2 };
  const scaled = { x: middle.x - (middle.x - camera.x) * k / camera.k, y: middle.y - (middle.y - camera.y) * k / camera.k, k };
  const pan = revealPan(box, scaled, frame);
  return { transform: { x: scaled.x + pan.x, y: scaled.y + pan.y, k }, held: kept.map(target => target.key),
    left: held.slice(0, held.length - kept.length).map(target => target.key) };
}

/** The room inside the frame's padding, with the padding. */
function roomOf(frame: Frame): { width: number; height: number; horizontal: number; vertical: number } {
  const { horizontal, vertical } = framePadding(frame);
  return { width: frame.width - 2 * horizontal, height: frame.height - 2 * vertical, horizontal, vertical };
}

/** The largest scale at which a box fits the room. */
function fitIn(box: Bounds, room: { width: number; height: number }): number {
  return Math.min(room.width / Math.max(1, box.width), room.height / Math.max(1, box.height));
}

/**
 * The box a set of targets needs, oldest first: each older target by its brief where it has one, and the newest whole,
 * though no taller than the floor can show, so that a card taller than the view is entered at its top.
 */
function heldBox<K>(held: readonly FramingTarget<K>[], room: { width: number; height: number }, floor: number): Bounds {
  const newest = held[held.length - 1].bounds;
  const tallest = room.height / floor;
  const top = newest.height > tallest ? { ...newest, bottom: newest.top + tallest, height: tallest } : newest;
  return unionOf([...held.slice(0, -1).map(target => target.brief ?? target.bounds), held.length > 1 ? top : newest])!;
}

/** Centred along an axis where the box fits the room at k, else its start at the padding, as a page is entered. */
function place(box: Bounds, k: number, frame: Frame): MapTransform {
  const room = roomOf(frame);
  return {
    x: box.width * k > room.width + 0.5 ? room.horizontal - box.left * k : frame.width / 2 - (box.left + box.width / 2) * k,
    y: box.height * k > room.height + 0.5 ? room.vertical - box.top * k : frame.height / 2 - (box.top + box.height / 2) * k,
    k
  };
}

/** The shortest a re-frame of the following camera eases. */
export const FRAMING_EASE_MIN_MS = 300;
/** The longest a re-frame of the following camera eases. */
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

/**
 * How far a re-frame travels, in frames' diagonals on screen at the lesser of its two scales: past about one, a flat pan
 * crosses a view of empty map, and the following camera takes the smooth zoom's path instead.
 */
export function framingTravel(start: MapTransform, end: MapTransform, frame: Frame): number {
  const middle = { x: frame.width / 2, y: frame.height / 2 };
  const from = { x: (middle.x - start.x) / start.k, y: (middle.y - start.y) / start.k };
  const to = { x: (middle.x - end.x) / end.k, y: (middle.y - end.y) / end.k };
  return Math.hypot(to.x - from.x, to.y - from.y) * Math.min(start.k, end.k) / Math.max(1, Math.hypot(frame.width, frame.height));
}

/**
 * The smooth zoom's path between two cameras (van Wijk and Nuij, "Smooth and efficient zooming and panning", 2003; the
 * form of d3's `interpolateZoom`, rho = sqrt 2): the camera pulls back, travels and closes in, so that a long move is seen
 * as a short one from farther away. Never farther than `floor`; the returned `duration` grows with the path's length, from
 * {@link FRAMING_EASE_MIN_MS} to twice {@link FRAMING_EASE_MAX_MS}.
 */
export function smoothZoom(start: MapTransform, end: MapTransform, frame: Frame, floor: number): { pose: (t: number) => MapTransform; duration: number } {
  const rho = Math.SQRT2, rho2 = 2, rho4 = 4;
  const view = (camera: MapTransform) => ({ x: (frame.width / 2 - camera.x) / camera.k, y: (frame.height / 2 - camera.y) / camera.k, w: frame.width / camera.k });
  const a = view(start), b = view(end);
  const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
  let at: (t: number) => { x: number; y: number; w: number }, S: number;
  if (d2 < 1e-12) {
    S = Math.log(b.w / a.w) / rho;
    at = t => ({ x: a.x + t * dx, y: a.y + t * dy, w: a.w * Math.exp(rho * t * S) });
  } else {
    const d1 = Math.sqrt(d2);
    const b0 = (b.w * b.w - a.w * a.w + rho4 * d2) / (2 * a.w * rho2 * d1), b1 = (b.w * b.w - a.w * a.w - rho4 * d2) / (2 * b.w * rho2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    at = t => {
      const s1 = t * S, u = a.w / (rho2 * d1) * (Math.cosh(r0) * Math.tanh(rho * s1 + r0) - Math.sinh(r0));
      return { x: a.x + u * dx, y: a.y + u * dy, w: a.w * Math.cosh(r0) / Math.cosh(rho * s1 + r0) };
    };
  }
  const pose = (t: number): MapTransform => {
    if (t >= 1) return { ...end };
    const { x, y, w } = at(t);
    const k = Math.max(floor, frame.width / w);
    return { x: frame.width / 2 - x * k, y: frame.height / 2 - y * k, k };
  };
  const duration = clamp(Math.abs(S) * 1000 * rho / Math.SQRT2 * 0.6, FRAMING_EASE_MIN_MS, 2 * FRAMING_EASE_MAX_MS);
  return { pose, duration };
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

/** The keys that only move the keyboard's focus, or are held with one that does: no act on the picture. */
const FOCUS_MOVING_KEYS: ReadonlySet<string> = new Set(["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Shift", "Control", "Alt", "Meta"]);

/**
 * Whether one of {@link ARRIVAL_ENDING_INPUTS} ends an arrival where it stands. Every one does, but for a key that only
 * moves the focus while the arrival waits on attention ("attended"): there the focus is what holds the picture and what
 * lets it go, as the pointer is, so the key that carries it into the subject's card or out of it is not an act on the
 * picture (the owner, 2026-11-22, of gamepads: "their focus element is quantized rather than continuous"). Enter, Space,
 * Escape and every other key act, and end it.
 */
export function arrivalEndedBy(type: string, key: string | undefined, waits: ArrivalWait): boolean {
  return !(type === "keydown" && waits === "attended" && key !== undefined && FOCUS_MOVING_KEYS.has(key));
}

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

/**
 * The farthest a step's ease goes, as a ratio of reading scale (Tuning's Step, 2026-11-21): for now the arrival's floor,
 * the connections look's farthest press. Whether a step, which the person did not ask to change scale, should stop nearer
 * (two thirds of reading scale was tried beside it) is the owner's to decide by eye.
 */
export const STEP_FLOOR_RATIO = ARRIVAL_FLOOR_RATIO;

/**
 * Tuning → 2D Layout → Step "Whole" (a trial, root's brief of 2026-11-21): after a step, the whole newcomer (the opened
 * directory's box, or the new card) inside the frame's padding. Where it fits at the camera's scale, the scale is kept and
 * the least pan brings it in (*object constancy*: what was pressed keeps its size); where it does not, the camera eases out
 * just far enough to hold it, never in, and only where some scale at or above `floor` holds it whole: an ease costs the
 * person their place and their reading size, and is worth it only when it delivers the whole (the root's ruling on the
 * first pictures, 2026-11-21, where a folder eased out to the floor still did not show). Null where the floor cannot hold
 * it: the step then does what Least Pan does. Scaled about the frame's middle, then the least pan, as the following
 * camera's re-frame is. In the picture's units.
 */
export function stepWholeFrame(newcomer: Bounds, camera: MapTransform, frame: Frame, floor: number): MapTransform | null {
  const fit = fitIn(newcomer, roomOf(frame));
  if (fit < floor * (1 - 1e-9)) return null;
  const k = Math.min(camera.k, fit);
  const middle = { x: frame.width / 2, y: frame.height / 2 };
  const scaled = { x: middle.x - (middle.x - camera.x) * k / camera.k, y: middle.y - (middle.y - camera.y) * k / camera.k, k };
  const pan = revealPan(newcomer, scaled, frame);
  return { x: scaled.x + pan.x, y: scaled.y + pan.y, k };
}

/**
 * Tuning → 2D Layout → Step "With Its Lines" (a trial, 2026-11-21): after a step, the frame Fit would give the newcomer
 * and the cards its lines reach (`reach`, which holds the newcomer): centred, at the largest scale that holds it, never
 * closer than `ceiling` (reading scale), where some scale at or above `floor` holds it; else Whole's frame of the newcomer
 * alone; else null, and the step does what Least Pan does.
 */
export function stepLinesFrame(reach: Bounds, newcomer: Bounds, camera: MapTransform, frame: Frame, ceiling: number, floor: number): MapTransform | null {
  const whole = fitIn(reach, roomOf(frame));
  if (whole >= floor * (1 - 1e-9)) return place(reach, Math.min(whole, ceiling), frame);
  return stepWholeFrame(newcomer, camera, frame, floor);
}

/** An edge of the view. */
export type ViewEdge = "left" | "right" | "top" | "bottom";

/** Every edge, in the order the signs are drawn and read: left, right, top, bottom. */
export const VIEW_EDGES: readonly ViewEdge[] = ["left", "right", "top", "bottom"];

/**
 * Tuning → 2D Layout → Cut Counted (a trial, 2026-11-21): of the newcomer's cards (in the picture's units), those not
 * wholly in view at the camera given, each at the one edge it reaches farthest past on screen, so that the counts sum to
 * the cards that are cut (the root's ruling: counted at every edge it went past, a folder up and to the right of the view
 * said 31, 27 and 4 for 32 cards, and a person adds the numbers). An edge past which nothing goes is absent.
 */
export function cutByEdge<K>(cards: readonly { key: K; bounds: Bounds }[], camera: MapTransform, frame: Frame): Partial<Record<ViewEdge, K[]>> {
  const cut: Partial<Record<ViewEdge, K[]>> = {};
  for (const { key, bounds } of cards) {
    // How far the card reaches past each edge on screen; the horizontal edges come first, so that a card as far past two
    // edges is counted at the left or right, the edges a person reads a row of the map across.
    const past: [ViewEdge, number][] = [
      ["left", -(camera.x + bounds.left * camera.k)], ["right", camera.x + bounds.right * camera.k - frame.width],
      ["top", -(camera.y + bounds.top * camera.k)], ["bottom", camera.y + bounds.bottom * camera.k - frame.height]
    ];
    let farthest: [ViewEdge, number] | null = null;
    for (const entry of past) if (entry[1] > 0.5 && (!farthest || entry[1] > farthest[1])) farthest = entry;
    if (farthest) (cut[farthest[0]] ??= []).push(key);
  }
  return cut;
}

/**
 * Where a sign at an edge takes the camera when pressed: the least pan, the scale kept, that brings the nearest of the
 * cards cut there wholly inside the frame's padding (a card taller or wider than the room entered at its start), the
 * nearest being the one that reaches least far past that edge, then the one nearest the frame's middle across it. One
 * card at a time, so that a press always lands on one of them whole and the next press goes on to the next; a pan along
 * the edge's axis alone to all of them at once was tried first (2026-11-21) and, where they lay up and to the right of
 * the view, landed on other cards with none of them whole.
 */
export function cutPan(cards: readonly Bounds[], edge: ViewEdge, camera: MapTransform, frame: Frame): MapTransform {
  if (!cards.length) return camera;
  const onScreen = (card: Bounds) => ({ left: camera.x + card.left * camera.k, right: camera.x + card.right * camera.k,
    top: camera.y + card.top * camera.k, bottom: camera.y + card.bottom * camera.k });
  const past = (card: Bounds): number => {
    const drawn = onScreen(card);
    return edge === "left" ? -drawn.left : edge === "right" ? drawn.right - frame.width : edge === "top" ? -drawn.top : drawn.bottom - frame.height;
  };
  const across = (card: Bounds): number => {
    const drawn = onScreen(card);
    return edge === "left" || edge === "right" ? Math.abs((drawn.top + drawn.bottom) / 2 - frame.height / 2) : Math.abs((drawn.left + drawn.right) / 2 - frame.width / 2);
  };
  const nearest = [...cards].sort((a, b) => past(a) - past(b) || across(a) - across(b))[0];
  const pan = revealPan(nearest, camera, frame);
  return { x: camera.x + pan.x, y: camera.y + pan.y, k: camera.k };
}

/** Every box given as one, in the same units; null for none. */
export function unionOf(boxes: readonly Bounds[]): Bounds | null {
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map(box => box.left)), top = Math.min(...boxes.map(box => box.top));
  const right = Math.max(...boxes.map(box => box.right)), bottom = Math.max(...boxes.map(box => box.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}
