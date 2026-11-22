/**
 * Which way a 2D picture reads, and the one mapping between the layout's own across and the page's.
 *
 * The layout is computed once, in its own terms: across, from where it starts (what offers) to where it ends (what
 * uses). A picture that reads the other way round is the same layout reflected about one upright axis, drawn by the
 * stylesheet; only a measurement taken from the page and written back into the layout (a wire's ends, the wires'
 * overlay) has to cross that reflection, and it crosses it here. Nothing here names left or right as a meaning: the
 * page's left and right come in, the layout's start and end go out.
 *
 * @module
 */

import type { MapReads } from "../../types";

/** The attribute on the map's layer that says which way its picture reads; the stylesheet draws the reflection from it. */
export const READS_ATTRIBUTE = "data-reads";

/** Whether the picture is the layout reflected: what uses stands first from the left. */
export function isMirrored(reads: MapReads | undefined): boolean {
  return reads === "usesFirst";
}

/** Says on the map's layer which way its picture reads: the attribute while mirrored, none for the picture as laid out. */
export function writeReads(layer: Element, reads: MapReads | undefined): void {
  if (isMirrored(reads)) layer.setAttribute(READS_ATTRIBUTE, "usesFirst");
  else layer.removeAttribute(READS_ATTRIBUTE);
}

/** A span across the page, in the page's pixels. */
export interface PageSpan { left: number; right: number }

/** A span across the layout, in the layout's own units from its origin: start before end, whichever way it is drawn. */
export interface LayoutSpan { start: number; end: number }

/**
 * A measured box's span in the layout's own units. `origin` is where the layout's across begins on the page, `axis`
 * the upright line a mirrored picture is reflected about, and `scale` the camera's. Unmirrored, across runs rightwards
 * from the origin; mirrored, the page shows the reflection of the layout about the axis, so a point's place in the
 * layout is the reflection of where it was measured.
 */
export function spanInLayout(box: PageSpan, origin: number, axis: number, scale: number, mirrored: boolean): LayoutSpan {
  const k = scale || 1;
  if (!mirrored) return { start: (box.left - origin) / k, end: (box.right - origin) / k };
  return { start: (2 * axis - box.right - origin) / k, end: (2 * axis - box.left - origin) / k };
}

/** A layout span as the page shows it, in layout units from the same origin: the inverse of {@link spanInLayout} at scale 1. */
export function shownSpan(span: LayoutSpan, axis: number, mirrored: boolean): { left: number; right: number } {
  return mirrored ? { left: 2 * axis - span.end, right: 2 * axis - span.start } : { left: span.start, right: span.end };
}
