/**
 * Runs the motion between a 2D picture as laid out and mirrored on the page: the turn, the slide or the cut that
 * Tuning's Mirror Turn chooses (a trial of 2026-11-22). The arithmetic is `mirror-turn.ts`; this is its DOM half.
 *
 * The turn and the slide are drawn by the stylesheet from one angle written on the map's layer each frame
 * (`--mirror-turn`, the rules under `data-turning` in `styles/local.css`): the content root and the wires' layer turn
 * about the upright axis through what holds still, each card and each directory's line turns back by the same angle
 * about its own middle so that it faces the viewer throughout, and at the edge-on instant the pins change sides. The
 * real cards and the real wires move: nothing is copied, and no wire is measured or rewritten until the motion ends.
 * The move between 2D and 3D (`perspectiveTransition.ts`) could not serve: it is a copy of the picture folded to file
 * tokens and moved between two drawings on a canvas, with no turning plane in it, and its copies alone take longer to
 * make than this motion lasts; its easing is the one thing shared.
 *
 * @module
 */

import type { MirrorTurn } from "../../types";
import { MIRROR_TURN_MS, turnAngle, turnDistance, turnStrength, type MirrorAxis } from "./mirror-turn";

/** The attribute on the map's layer while the picture turns or slides, holding which; the stylesheet draws from it. */
export const TURNING_ATTRIBUTE = "data-turning";

/** The attribute on the place of the card that holds still while the picture turns. */
export const HELD_ATTRIBUTE = "data-mirror-held";

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

/** The cut: the picture fades out, changes while unseen, and fades in. Nothing travels. */
function cut({ layer, settle, done, toMirrored }: MirrorMotionOptions): MirrorMotion {
  let settled = false, running: Animation | null = null;
  const finish = (): void => {
    if (settled) return;
    settled = true;
    settle();
  };
  const fade = (from: number, to: number, then: () => void): void => {
    running = layer.animate([{ opacity: from }, { opacity: to }], { duration: MIRROR_TURN_MS / 3, easing: "ease-in-out" });
    running.onfinish = then;
  };
  fade(1, 0, () => { finish(); fade(0, 1, () => { running = null; done(); }); });
  return {
    holdsWires: false,
    toMirrored,
    end() {
      if (running) { running.onfinish = null; running.cancel(); running = null; }
      // Let go of before the picture rests: the rest may start the next motion, which must not be let go of in its place.
      done();
      finish();
    }
  };
}

/** The turn and the slide: one angle on the layer each frame, the pins exchanged as the plane stands edge-on. */
function turn(options: MirrorMotionOptions, form: Exclude<MirrorTurn, "cut">): MirrorMotion {
  const { view, layer, overlay, axis, toMirrored } = options;
  let frame = 0, exchanged = false, over = false;
  const motion = { holdsWires: true, toMirrored, end };
  // Drawn from the picture as laid out, whichever way it goes: at 180 degrees about this axis it is the mirrored one.
  options.cameraAcross(axis.laidOutX);
  layer.setAttribute(TURNING_ATTRIBUTE, form);
  layer.style.setProperty("--mirror-axis", `${axis.across}px`);
  const draw = (progress: number): void => {
    const angle = turnAngle(progress, form, toMirrored);
    layer.style.setProperty("--mirror-turn", `${angle}deg`);
    layer.style.setProperty("--mirror-fade", turnStrength(angle).toFixed(3));
  };
  draw(0);
  const heldPlace = options.held?.closest<HTMLElement>(".local-column") ?? null;
  heldPlace?.setAttribute(HELD_ATTRIBUTE, "");
  const wiresOrigin = overlay.style.transformOrigin;
  overlay.style.transformOrigin = `${options.rootEdgeInLayer + axis.across}px 0`;
  // The slide is flat: no viewer's distance, so nothing grows or shrinks as it crosses.
  view.style.perspective = form === "turn" ? `${turnDistance(options.reach, view.clientWidth)}px` : "none";
  view.style.perspectiveOrigin = `${options.holdAt - view.getBoundingClientRect().left}px 50%`;
  const started = performance.now();
  const step = (now: number): void => {
    const progress = Math.min(1, (now - started) / MIRROR_TURN_MS);
    if (!exchanged && progress >= 0.5) { exchanged = true; options.exchange(); }
    draw(progress);
    if (progress < 1) frame = requestAnimationFrame(step);
    else end();
  };
  frame = requestAnimationFrame(step);
  function end(): void {
    if (over) return;
    over = true;
    cancelAnimationFrame(frame);
    motion.holdsWires = false;
    layer.removeAttribute(TURNING_ATTRIBUTE);
    layer.style.removeProperty("--mirror-axis");
    layer.style.removeProperty("--mirror-turn");
    layer.style.removeProperty("--mirror-fade");
    heldPlace?.removeAttribute(HELD_ATTRIBUTE);
    overlay.style.transformOrigin = wiresOrigin;
    view.style.perspective = "";
    view.style.perspectiveOrigin = "";
    // Let go of before the picture rests: the rest may start the next motion, which must not be let go of in its place.
    options.done();
    options.settle();
  }
  return motion;
}
