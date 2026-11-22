/**
 * The motion between a 2D picture as laid out and the same picture mirrored (Tuning's Mirror Turn, a trial of
 * 2026-11-22): where the upright axis stands, what each of the two pictures asks of the camera, and the angle the
 * picture's plane has turned through at each moment.
 *
 * A mirror image is what a flat drawing looks like from behind, so the honest picture of the change is the drawing's
 * plane turned half way round about an upright axis: the owner's idea, "rotating the right side into the forward
 * z-direction away from the viewer and rotating the left side into the reverse z-direction toward the viewer (before
 * continuing that rotation to the other side)". The stylesheet draws it from one angle on the map's layer; nothing is
 * copied and no wire is rewritten while it runs. Pure functions: no DOM.
 *
 * @module
 */

import type { MirrorTurn } from "../../types";
import { transitionEase } from "../perspectiveGeometry";

/** How long the turn and the slide take, in milliseconds; the cut's fade is a third of it each way. */
export const MIRROR_TURN_MS = 620;

/** The upright axis a picture is mirrored about, and the camera of each of its two pictures. */
export interface MirrorAxis {
  /** How far across the layout the axis stands from the layout's own edge, in the layout's units. */
  across: number;
  /** The camera's x for the picture as laid out. */
  laidOutX: number;
  /** The camera's x for the mirrored picture, which the stylesheet reflects about the layout's edge and not this axis. */
  mirroredX: number;
}

/**
 * The axis through `holdAt`, a place on the page that must not move (the held card's middle, or the view's), read
 * from the picture as it stands: `rootEdge` is the page's x of the layout's own edge, which a mirrored picture is
 * reflected about, and `camera` the camera now. Reflecting about the edge moves the held place by twice its distance
 * across, which the mirrored picture's camera gives back.
 */
export function mirrorAxis(holdAt: number, rootEdge: number, camera: { x: number; k: number }, mirrored: boolean): MirrorAxis {
  const k = camera.k || 1;
  const across = (mirrored ? rootEdge - holdAt : holdAt - rootEdge) / k;
  const laidOutX = mirrored ? camera.x - 2 * across * k : camera.x;
  return { across, laidOutX, mirroredX: laidOutX + 2 * across * k };
}

/**
 * How far the picture's plane has turned, in degrees, at `progress` of the motion: 0 as laid out, 180 mirrored, and on
 * to 360 on the way back, so that the right side always goes away from the viewer and the left comes toward them. The
 * turn eases the angle. The slide eases each card's place across instead, a straight line from where it stands to its
 * mirrored place, which is the angle whose cosine is that share of the way.
 */
export function turnAngle(progress: number, form: Exclude<MirrorTurn, "cut">, toMirrored: boolean): number {
  const eased = transitionEase(progress);
  const angle = form === "turn" ? 180 * eased : Math.acos(1 - 2 * eased) * 180 / Math.PI;
  return (toMirrored ? 0 : 180) + angle;
}

/**
 * How far away the viewer stands from the turning plane, in the page's pixels: far enough that the card swinging
 * nearest, `reach` from the axis, passes well in front of them, and never nearer than twice the view's width, so that a
 * small picture is not distorted.
 */
export function turnDistance(reach: number, viewWidth: number): number {
  return Math.max(2 * viewWidth, 2.5 * Math.max(0, reach));
}

/**
 * How strongly everything but the held card is drawn at `angle` of the turn, from 1 at rest to a faint 0.12 edge-on:
 * as the plane stands edge-on every card is on one line, the ones swinging toward the viewer in front of the one that
 * holds still, so they and the wires are faded for that moment and the held card alone keeps its strength. Seen
 * 2026-11-22 without it: the nearest card, grown by its nearness, covered the subject whole at the edge-on instant.
 */
export function turnStrength(angle: number): number {
  return 0.12 + 0.88 * Math.abs(Math.cos(angle * Math.PI / 180));
}

/** One moment of the motion as the browser is given it: how far through, the plane's angle, and the others' strength. */
export interface TurnKeyframe { offset: number; angle: number; strength: number }

/**
 * The whole motion as keyframes, evenly spaced, the edge-on instant among them: the browser runs the turn from these
 * without script, moving in a straight line between each two, so the plane, every card turned back against it and the
 * fade stay together to the frame. Twenty steps follow the eased angle to within a third of a degree.
 */
export function turnKeyframes(form: Exclude<MirrorTurn, "cut">, toMirrored: boolean, steps = 20): TurnKeyframe[] {
  const count = Math.max(2, 2 * Math.round(steps / 2));
  return Array.from({ length: count + 1 }, (_, index) => {
    const offset = index / count, angle = turnAngle(offset, form, toMirrored);
    return { offset, angle, strength: turnStrength(angle) };
  });
}
