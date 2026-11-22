/**
 * Runs the motion between a 2D picture as laid out and mirrored on the page: the turn, the slide or the cut that
 * Tuning's Mirror Turn chooses (a trial of 2026-11-22). The arithmetic is `mirror-turn.ts`; this is its DOM half.
 *
 * The turn and the slide are written once, as animations the browser runs with no script between frames: the content
 * root and the wires' layer turn about the upright axis through what holds still, each card and each directory's line
 * turns back by the same angle about its own middle so that it faces the viewer throughout, and at the edge-on instant
 * the pins change sides. What the turn needs of the boxes is written on the boxes, and no rule of the stylesheet hangs
 * on the motion. The real cards and the real wires move: nothing is copied, and no wire is measured or rewritten until
 * the motion ends.
 * The move between 2D and 3D (`perspectiveTransition.ts`) could not serve: it is a copy of the picture folded to file
 * tokens and moved between two drawings on a canvas, with no turning plane in it, and its copies alone take longer to
 * make than this motion lasts; its easing is the one thing shared.
 *
 * @module
 */

import type { MirrorTurn } from "../../types";
import { MIRROR_TURN_MS, turnDistance, turnKeyframes, type MirrorAxis } from "./mirror-turn";

/** The attribute on the map's layer while the picture turns or slides, holding which: for a reader of the page, not for the stylesheet. */
export const TURNING_ATTRIBUTE = "data-turning";

/** What a motion needs of the map, and what it gives back. */
export interface MirrorMotionOptions {
  form: MirrorTurn;
  toMirrored: boolean;
  /** The view, which holds the viewer's distance from the turning plane. */
  view: HTMLElement;
  /** The map's layer, which carries the camera's transform and the angle. */
  layer: HTMLElement;
  /** The wires' layer. */
  overlay: HTMLElement;
  /** The card that holds still, when there is one: it alone keeps its strength as the others cross it. */
  held: HTMLElement | null;
  /** The page's x of what holds still: the upright axis. */
  holdAt: number;
  axis: MirrorAxis;
  /** The layout's own edge, in the layer's units from the layer's own edge. */
  rootEdgeInLayer: number;
  /** How far the picture reaches from the axis on the page, to its farther side. */
  reach: number;
  /** Puts the camera's x there and draws it: the turn is drawn from the picture as laid out. */
  cameraAcross: (x: number) => void;
  /** The pins change sides, once, at the edge-on instant. */
  exchange: () => void;
  /** The picture comes to rest in its new state: called exactly once, however the motion ends. */
  settle: () => void;
  /** The motion holds nothing more: called before `settle` when it is ended, so that what the rest starts is kept. */
  done: () => void;
}

/** A motion under way. */
export interface MirrorMotion {
  /** The state the motion is going to. */
  readonly toMirrored: boolean;
  /** Whether the wires must be left as drawn: while the plane turns, a measurement of the page is not the layout's. */
  readonly holdsWires: boolean;
  /** Ends the motion at once where it was going. */
  end(): void;
}

/** Starts the motion; the picture is in its new state when `settle` has been called. */
export function runMirrorMotion(options: MirrorMotionOptions): MirrorMotion {
  return options.form === "cut" ? cut(options) : turn(options, options.form);
}

/** Everything on the map that fades while the picture changes: every place but the held card's, and the wires. */
const OTHERS = ".local-placed :is(.local-column, .local-directory-label, .local-pass-through)";

/**
 * The cut: everything but the held card fades out, the picture changes while they are unseen, and they fade in.
 * Nothing travels, and the held card, which a mirror does not move, never leaves (the root, 2026-11-22: the first cut
 * faded the whole layer and "blanks the whole map for two frames, the held card with it").
 */
function cut({ layer, overlay, held, settle, done, toMirrored }: MirrorMotionOptions): MirrorMotion {
  let settled = false, running: Animation[] = [];
  const heldPlace = held?.closest<HTMLElement>(".local-column") ?? null;
  const fade = (from: number, to: number, fill: FillMode, then: () => void): void => {
    // The directories' outlines change sides too and fade with the rest (the outline's own drawing, not the directory,
    // which holds the held card): seen in the first strip of this cut, they stood through the fade and then jumped.
    const faded = [...layer.querySelectorAll<Element>(`${OTHERS}, .local-placed .local-directory-band > .local-membrane`)].filter(place => place !== heldPlace);
    running = [overlay, ...faded].map(element => element.animate([{ opacity: from }, { opacity: to }], { duration: MIRROR_TURN_MS / 3, easing: "ease-in-out", fill }));
    running[0].onfinish = then;
  };
  const stop = (): void => {
    for (const animation of running) { animation.onfinish = null; animation.cancel(); }
    running = [];
  };
  const finish = (): void => {
    if (settled) return;
    settled = true;
    settle();
  };
  // Held at nothing until the picture has changed under them, so that no frame shows the change itself.
  fade(1, 0, "forwards", () => { stop(); finish(); fade(0, 1, "none", () => { stop(); done(); }); });
  return {
    holdsWires: false,
    toMirrored,
    end() {
      stop();
      // Let go of before the picture rests: the rest may start the next motion, which must not be let go of in its place.
      done();
      finish();
    }
  };
}

/**
 * The turn and the slide: the whole motion written once, as animations the browser runs with no script between
 * frames, and the pins exchanged as the plane stands edge-on. The first form wrote one angle on the layer each frame
 * for the stylesheet to turn every card back from, and on 84 cards drew six frames in the motion's 620 ms
 * (2026-11-22; the measurements are in the strips' record).
 */
function turn(options: MirrorMotionOptions, form: Exclude<MirrorTurn, "cut">): MirrorMotion {
  const { view, layer, overlay, axis, toMirrored } = options;
  let over = false;
  const motion = { holdsWires: true, toMirrored, end };
  // Drawn from the picture as laid out, whichever way it goes: at 180 degrees about this axis it is the mirrored one.
  options.cameraAcross(axis.laidOutX);
  // The attribute names the motion for whoever reads the page; no rule of the stylesheet hangs on it. What the turn
  // needs of the boxes is written on those boxes themselves: a rule under an attribute of the layer restyled every row
  // of every card when the attribute came and when it went, twice the cost of the whole motion (measured 2026-11-22).
  layer.setAttribute(TURNING_ATTRIBUTE, form);
  const picture = layer.querySelector<HTMLElement>(".local-layout");
  // Every box between the view and a card keeps the third dimension, or a card's turning back against the plane would
  // be flattened into its directory's plane; the resting reflection, a scale, gives way to the turning.
  const deep = [layer, layer.querySelector<HTMLElement>(":scope > .dom-layer"), picture, ...layer.querySelectorAll<HTMLElement>(".local-placed .local-directory-band")]
    .filter((box): box is HTMLElement => box !== null);
  for (const box of deep) box.style.transformStyle = "preserve-3d";
  const wiresOrigin = overlay.style.transformOrigin;
  overlay.style.transformOrigin = `${options.rootEdgeInLayer + axis.across}px 0`;
  overlay.style.scale = "none";
  if (picture) Object.assign(picture.style, { transformOrigin: `${axis.across}px 0`, scale: "none" });
  // The slide is flat: no viewer's distance, so nothing grows or shrinks as it crosses.
  view.style.perspective = form === "turn" ? `${turnDistance(options.reach, view.clientWidth)}px` : "none";
  view.style.perspectiveOrigin = `${options.holdAt - view.getBoundingClientRect().left}px 50%`;
  const frames = turnKeyframes(form, toMirrored);
  const timing: KeyframeAnimationOptions = { duration: MIRROR_TURN_MS, easing: "linear", fill: "both" };
  // The plane turns; what a person reads turns back against it by the same angle and fades as the plane stands
  // edge-on; the held card turns back and keeps its strength; a lane, which holds no words, only fades.
  const plane = frames.map(({ offset, angle }) => ({ offset, rotate: `y ${angle}deg` }));
  const wires = frames.map(({ offset, angle, strength }) => ({ offset, rotate: `y ${angle}deg`, opacity: strength }));
  // A card's own resting reflection is set aside in its keyframes, for as long as they run.
  const facing = frames.map(({ offset, angle, strength }) => ({ offset, rotate: `y ${-angle}deg`, scale: "1 1", opacity: strength }));
  const holding = frames.map(({ offset, angle }) => ({ offset, rotate: `y ${-angle}deg`, scale: "1 1" }));
  const fading = frames.map(({ offset, strength }) => ({ offset, opacity: strength }));
  const heldPlace = options.held?.closest<HTMLElement>(".local-column") ?? null;
  const running: Animation[] = [];
  if (picture) running.push(picture.animate(plane, timing));
  running.push(overlay.animate(wires, timing));
  for (const place of layer.querySelectorAll<HTMLElement>(OTHERS)) {
    running.push(place.animate(place === heldPlace ? holding : place.classList.contains("local-pass-through") ? fading : facing, timing));
  }
  const exchanging = window.setTimeout(() => options.exchange(), MIRROR_TURN_MS / 2);
  running[0].onfinish = end;
  function end(): void {
    if (over) return;
    over = true;
    window.clearTimeout(exchanging);
    for (const animation of running) { animation.onfinish = null; animation.cancel(); }
    motion.holdsWires = false;
    layer.removeAttribute(TURNING_ATTRIBUTE);
    for (const box of deep) box.style.transformStyle = "";
    if (picture) Object.assign(picture.style, { transformOrigin: "", scale: "" });
    overlay.style.scale = "";
    overlay.style.transformOrigin = wiresOrigin;
    view.style.perspective = "";
    view.style.perspectiveOrigin = "";
    // Let go of before the picture rests: the rest may start the next motion, which must not be let go of in its place.
    options.done();
    options.settle();
  }
  return motion;
}
