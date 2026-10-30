/**
 * Layout measurement functions for Local Map.
 *
 * These are pure functions that measure and compute layout extents,
 * allowing the LocalViewController to delegate layout measurement
 * while keeping the logic testable and independently improvable.
 *
 * @module layout-measure
 */

import type { MapTransform } from "./types";

/**
 * Represents bounding box dimensions.
 */
export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Represents layout extent measurements.
 */
export interface LayoutExtents {
  content: Bounds;
  focus: Bounds | null;
}

/**
 * Clamps a value to a range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Measures the combined bounds of multiple elements.
 */
export function measureElementsBounds(
  elements: Iterable<HTMLElement>,
  containerRect: DOMRect
): Bounds | null {
  let minLeft = Number.POSITIVE_INFINITY;
  let minTop = Number.POSITIVE_INFINITY;
  let maxRight = Number.NEGATIVE_INFINITY;
  let maxBottom = Number.NEGATIVE_INFINITY;
  let hasElement = false;

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (!Number.isFinite(rect.left) || !Number.isFinite(rect.top)) {
      continue;
    }
    hasElement = true;
    minLeft = Math.min(minLeft, rect.left);
    minTop = Math.min(minTop, rect.top);
    maxRight = Math.max(maxRight, rect.right);
    maxBottom = Math.max(maxBottom, rect.bottom);
  }

  if (!hasElement) {
    return null;
  }

  const width = Math.max(maxRight - minLeft, 1);
  const height = Math.max(maxBottom - minTop, 1);
  const left = minLeft - containerRect.left;
  const top = minTop - containerRect.top;

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height
  };
}

/**
 * Measures the bounds of a single element.
 */
export function measureElementBounds(
  element: HTMLElement | null,
  containerRect: DOMRect
): Bounds | null {
  if (!element) {
    return null;
  }
  return measureElementsBounds([element], containerRect);
}

/**
 * Executes a callback with transform temporarily reset to "none",
 * then restores the original transform.
 */
export function withTransformReset<T>(
  container: HTMLElement,
  callback: (containerRect: DOMRect) => T
): T {
  const viewport = container.parentElement;
  const previousViewportTransform = viewport?.style.transform ?? "";
  if (viewport) {
    viewport.style.transform = "none";
  }
  try {
    const containerRect = container.getBoundingClientRect();
    return callback(containerRect);
  } finally {
    if (viewport) {
      viewport.style.transform = previousViewportTransform;
    }
  }
}

/**
 * Computes layout extents for the content and focus element.
 */
export function computeLayoutExtents(
  container: HTMLElement,
  contentRoot: HTMLElement | null
): LayoutExtents | null {
  if (!contentRoot) {
    return null;
  }

  return withTransformReset(container, containerRect => {
    // The picture is its cards, closed directories, lanes, the membranes and their labels: a membrane reaches past its
    // members by its padding and its label stands above them, so a frame measured from the cards alone cut both (the
    // October 23 review's finding 2; measured 2026-10-30). Offsets are from the host's own edge, which is where the
    // layer's transform puts the origin, so nothing is subtracted from them: the host's padding was, once, and every
    // fit landed 12 px right and down.
    const trackedElements = contentRoot.querySelectorAll<HTMLElement>(
      ".layout-node, .layout-box, .node-card, .local-pass-through, .local-directory-closed, .local-directory-band, .local-directory-label"
    );
    const content = measureElementsBounds(trackedElements, containerRect);
    if (!content) {
      return null;
    }

    // The subject's card is the focus; with no subject the picture has none and is framed whole (2026-10-30; before,
    // the first card in the page's order stood in, which centred a directory's first file instead of the directory).
    const focus = measureElementBounds(contentRoot.querySelector<HTMLElement>(".node-card.local-focus"), containerRect);

    return { content, focus };
  });
}

/**
 * Computes the target transform to fit content within the viewport.
 */
export function computeFitTransform(
  extents: LayoutExtents,
  viewportRect: Frame,
  options?: { minScale?: number; maxScale?: number }
): MapTransform {
  const { minScale = 0.6, maxScale = 1.45 } = options ?? {};
  const { content, focus } = extents;

  const contentWidth = Math.max(content.width, 1);
  const contentHeight = Math.max(content.height, 1);

  const { horizontal: horizontalPadding, vertical: verticalPadding } = framePadding(viewportRect);

  const focusBounds = focus ?? content;
  const focusLeftDistance = Math.max(0, focusBounds.left - content.left);
  const focusRightDistance = Math.max(0, content.right - focusBounds.right);
  const focusTopDistance = Math.max(0, focusBounds.top - content.top);
  const focusBottomDistance = Math.max(0, content.bottom - focusBounds.bottom);

  const horizontalBuffer = Math.max(viewportRect.width * 0.1, 160);
  const verticalBuffer = Math.max(viewportRect.height * 0.16, 140);

  const effectiveWidth = Math.max(
    1,
    Math.min(
      contentWidth,
      focusBounds.width +
        Math.min(focusLeftDistance, horizontalBuffer) +
        Math.min(focusRightDistance, horizontalBuffer)
    )
  );
  const effectiveHeight = Math.max(
    1,
    Math.min(
      contentHeight,
      focusBounds.height +
        Math.min(focusTopDistance, verticalBuffer) +
        Math.min(focusBottomDistance, verticalBuffer)
    )
  );

  const availableScaleX = Math.max(
    (viewportRect.width - horizontalPadding * 2) / effectiveWidth,
    0.05
  );
  const availableScaleY = Math.max(
    (viewportRect.height - verticalPadding * 2) / effectiveHeight,
    0.05
  );
  const autoScale = Math.min(availableScaleX, availableScaleY);
  const scale = clamp(Math.min(autoScale * 0.96, 1), minScale, maxScale);

  const focusCenterX = focusBounds.left + focusBounds.width / 2;
  const focusCenterY = focusBounds.top + focusBounds.height / 2;

  // With a focus, the camera centres on it and keeps the picture visible; without one, the picture is framed whole:
  // centred when it fits, and when it does not, started at its near edge like a page, since nothing in it is more
  // important than the rest and a reader starts at the top left (the owner's choice, 2026-10-30; before, the frame
  // was centred on the picture's middle and cut both edges). What lies beyond the frame is said by the edge signs.
  const targetX = focus
    ? keepVisible(viewportRect.width / 2 - focusCenterX * scale, horizontalPadding - content.left * scale, viewportRect.width - horizontalPadding - content.right * scale)
    : frameWhole(viewportRect.width / 2 - focusCenterX * scale, horizontalPadding - content.left * scale, viewportRect.width - horizontalPadding - content.right * scale, horizontalPadding);
  const targetY = focus
    ? keepVisible(viewportRect.height / 2 - focusCenterY * scale, verticalPadding - content.top * scale, viewportRect.height - verticalPadding - content.bottom * scale)
    : frameWhole(viewportRect.height / 2 - focusCenterY * scale, verticalPadding - content.top * scale, viewportRect.height - verticalPadding - content.bottom * scale, verticalPadding);

  return { x: targetX, y: targetY, k: scale };
}

/** The size of the frame a fit is computed for; a DOMRect is one. */
export interface Frame {
  width: number;
  height: number;
}

/** The room a fit leaves between the picture and the frame's edges: two percent of the width, two and a half of the height, 8 to 72 px. */
export function framePadding(frame: Frame): { horizontal: number; vertical: number } {
  return { horizontal: clamp(frame.width * 0.02, 8, 72), vertical: clamp(frame.height * 0.025, 8, 72) };
}

/**
 * The camera's offset along one axis for a picture framed whole: the centred offset when the picture fits between the
 * paddings, and still when it exceeds the frame by less than two paddings, since nicking both edges by less than a
 * padding reads better than a gap at one and a cut of three paddings at the other (the repository's root overview is
 * 7 px wider than a 1,179 px frame); beyond that, the offset at which the picture's near edge stands at the padding,
 * so that a picture taller than the frame begins at the top and one wider begins at the left, like a page.
 */
function frameWhole(centred: number, lowest: number, highest: number, padding: number): number {
  if (lowest <= highest) return centred;
  // `lowest - highest` is the picture's overflow of the frame plus two paddings.
  return lowest - highest <= 4 * padding ? centred : lowest;
}

/**
 * The camera after the subject has been held where another view left it (a return from 3D, 2026-10-30): the same
 * scale, moved the least that brings the picture into the frame, by the rule of {@link keepVisible} on each axis;
 * a picture already inside it does not move.
 */
export function settleTransform(content: Bounds, current: MapTransform, frame: Frame): MapTransform {
  const { horizontal, vertical } = framePadding(frame);
  const k = current.k;
  return {
    x: keepVisible(current.x, horizontal - content.left * k, frame.width - horizontal - content.right * k),
    y: keepVisible(current.y, vertical - content.top * k, frame.height - vertical - content.bottom * k),
    k
  };
}

/** Which edges of the frame the picture continues past, by more than `tolerance` px, at the camera given. */
export function hiddenEdges(content: Bounds, transform: MapTransform, frame: Frame, tolerance = 4): { above: boolean; below: boolean; left: boolean; right: boolean } {
  const { x, y, k } = transform;
  return {
    above: y + content.top * k < -tolerance,
    below: y + content.bottom * k > frame.height + tolerance,
    left: x + content.left * k < -tolerance,
    right: x + content.right * k > frame.width + tolerance
  };
}

/**
 * The camera's offset along one axis, centred on the focus but keeping the
 * content visible: when the content fits the frame it is shifted no further
 * than the padding allows on either side, so that centring on a card at the
 * edge of a picture that would fit does not cut the picture (a directory
 * entered with no file in focus, 2026-10-08); when it does not fit, the frame
 * stays full, with no gap at either side. `lowest` is the offset at which the
 * content's near edge touches the padding, `highest` the one at which its far
 * edge does; they stand the other way round when the content does not fit.
 */
function keepVisible(centred: number, lowest: number, highest: number): number {
  return lowest <= highest ? clamp(centred, lowest, highest) : clamp(centred, highest, lowest);
}

/**
 * The camera for a drawn path: reading size, level with the frame's middle,
 * centred when the whole path fits and otherwise with its first file at the
 * left edge. A path is read from its first file, so what the frame cannot hold
 * lies to the right, one pan away, and never the start.
 */
export function computePathFitTransform(content: Bounds, frame: Frame): MapTransform {
  const scale = 1;
  const horizontalPadding = framePadding(frame).horizontal;
  const fits = content.width * scale + horizontalPadding * 2 <= frame.width;
  const x = fits
    ? frame.width / 2 - (content.left + content.width / 2) * scale
    : horizontalPadding - content.left * scale;
  const y = frame.height / 2 - (content.top + content.height / 2) * scale;
  return { x, y, k: scale };
}

/**
 * Sets container/overlay dimensions based on content extents.
 */
export function applyContainerDimensions(
  container: HTMLElement,
  overlay: HTMLElement,
  content: Bounds
): void {
  const normalizedWidth = Math.max(Math.ceil(content.right), Math.ceil(content.width));
  const normalizedHeight = Math.max(Math.ceil(content.bottom), Math.ceil(content.height));

  container.style.width = `${normalizedWidth}px`;
  container.style.height = `${normalizedHeight}px`;
  container.style.minWidth = `${normalizedWidth}px`;
  container.style.minHeight = `${normalizedHeight}px`;
  
  overlay.style.width = `${normalizedWidth}px`;
  overlay.style.height = `${normalizedHeight}px`;
  overlay.style.minWidth = `${normalizedWidth}px`;
  overlay.style.minHeight = `${normalizedHeight}px`;
}
