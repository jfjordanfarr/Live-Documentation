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
 * Represents anchor Y-position guides for column alignment.
 */
export interface CenterAlignmentGuides {
  /** Map of anchorKey → vertical center Y position */
  anchors: Map<string, number>;
  /** Map of nodeId → card center Y position */
  cardCenters: Map<string, number>;
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
    // Query for layout elements
    const trackedElements = contentRoot.querySelectorAll<HTMLElement>(
      ".layout-node, .layout-box, .node-card, .local-pass-through, .local-directory-closed"
    );
    const contentBounds = measureElementsBounds(trackedElements, containerRect);
    if (!contentBounds) {
      return null;
    }

    // Find the focus element
    const focusElement =
      contentRoot.querySelector<HTMLElement>(".node-card.local-focus") ??
      contentRoot.querySelector<HTMLElement>(".local-column.center .node-card") ??
      contentRoot.querySelector<HTMLElement>(".node-card");
    const focusBounds = measureElementBounds(focusElement, containerRect);

    // Get container padding
    const computedStyle = getComputedStyle(container);
    const paddingLeft = Number.parseFloat(computedStyle.paddingLeft || "0") || 0;
    const paddingTop = Number.parseFloat(computedStyle.paddingTop || "0") || 0;

    const adjustBounds = (bounds: Bounds | null): Bounds | null => {
      if (!bounds) {
        return null;
      }
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const left = Math.max(bounds.left - paddingLeft, 0);
      const top = Math.max(bounds.top - paddingTop, 0);
      const right = left + width;
      const bottom = top + height;
      return { left, top, right, bottom, width, height };
    };

    const content = adjustBounds(contentBounds);
    const focus = adjustBounds(focusBounds);

    return { content: content ?? contentBounds, focus };
  });
}

/**
 * Computes the target transform to fit content within the viewport.
 */
export function computeFitTransform(
  extents: LayoutExtents,
  viewportRect: DOMRect,
  options?: { minScale?: number; maxScale?: number }
): MapTransform {
  const { minScale = 0.6, maxScale = 1.45 } = options ?? {};
  const { content, focus } = extents;

  const contentWidth = Math.max(content.width, 1);
  const contentHeight = Math.max(content.height, 1);

  const horizontalPadding = clamp(viewportRect.width * 0.02, 8, 72);
  const verticalPadding = clamp(viewportRect.height * 0.025, 8, 72);

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

  const targetX = keepVisible(viewportRect.width / 2 - focusCenterX * scale, horizontalPadding - content.left * scale, viewportRect.width - horizontalPadding - content.right * scale);
  const targetY = keepVisible(viewportRect.height / 2 - focusCenterY * scale, verticalPadding - content.top * scale, viewportRect.height - verticalPadding - content.bottom * scale);

  return { x: targetX, y: targetY, k: scale };
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
export function computePathFitTransform(content: Bounds, frame: DOMRect): MapTransform {
  const scale = 1;
  const horizontalPadding = clamp(frame.width * 0.02, 8, 72);
  const fits = content.width * scale + horizontalPadding * 2 <= frame.width;
  const x = fits
    ? frame.width / 2 - (content.left + content.width / 2) * scale
    : horizontalPadding - content.left * scale;
  const y = frame.height / 2 - (content.top + content.height / 2) * scale;
  return { x, y, k: scale };
}

/**
 * Builds an anchor guide key for column alignment lookups.
 */
export function buildAnchorGuideKey(
  nodeId: string,
  direction: "inbound" | "outbound",
  symbol: string | undefined | null
): string {
  const normalizedSymbol = symbol && symbol.length > 0 ? symbol : "*";
  return `${nodeId}:${direction}:${normalizedSymbol}`;
}

/**
 * Collects center alignment guides from a column element.
 */
export function collectCenterAlignmentGuides(
  column: HTMLElement,
  containerRect: DOMRect,
  normalizeSymbol: (symbol: string) => string | null
): CenterAlignmentGuides {
  const anchors = new Map<string, number>();
  const cardCenters = new Map<string, number>();

  column.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
    const nodeId = card.dataset.id;
    if (!nodeId) {
      return;
    }
    const rect = card.getBoundingClientRect();
    const centerY = (rect.top + rect.bottom) / 2 - containerRect.top;
    cardCenters.set(nodeId, centerY);
  });

  column.querySelectorAll<HTMLElement>(".symbol-anchor").forEach(anchor => {
    const nodeCard = anchor.closest<HTMLElement>(".node-card");
    if (!nodeCard) {
      return;
    }
    const nodeId = nodeCard.dataset.id;
    if (!nodeId) {
      return;
    }
    const direction = anchor.classList.contains("outbound") ? "outbound" : "inbound";
    const symbol = anchor.dataset.symbol ?? "*";
    const rect = anchor.getBoundingClientRect();
    const centerY = (rect.top + rect.bottom) / 2 - containerRect.top;
    
    anchors.set(buildAnchorGuideKey(nodeId, direction, symbol), centerY);
    
    if (symbol !== "*") {
      const normalizedSymbol = normalizeSymbol(symbol);
      if (normalizedSymbol) {
        anchors.set(buildAnchorGuideKey(nodeId, direction, normalizedSymbol), centerY);
      }
      const wildcardKey = buildAnchorGuideKey(nodeId, direction, "*");
      if (!anchors.has(wildcardKey)) {
        anchors.set(wildcardKey, centerY);
      }
    }
  });

  return { anchors, cardCenters };
}

/**
 * Looks up a center anchor position from guides, with fallback.
 */
export function lookupCenterAnchorPosition(
  guides: CenterAlignmentGuides,
  nodeId: string,
  direction: "inbound" | "outbound",
  symbol: string | undefined | null,
  normalizeSymbol: (symbol: string) => string | null
): number | null {
  const attempts: string[] = [];
  
  if (symbol && symbol.length > 0) {
    attempts.push(buildAnchorGuideKey(nodeId, direction, symbol));
    const normalizedSymbol = normalizeSymbol(symbol);
    if (normalizedSymbol && normalizedSymbol !== symbol) {
      attempts.push(buildAnchorGuideKey(nodeId, direction, normalizedSymbol));
    }
  }
  attempts.push(buildAnchorGuideKey(nodeId, direction, "*"));
  
  for (const attempt of attempts) {
    const match = guides.anchors.get(attempt);
    if (match !== undefined) {
      return match;
    }
  }
  
  const fallback = guides.cardCenters.get(nodeId);
  return fallback !== undefined ? fallback : null;
}

/**
 * Applies vertical centering to columns within a layout root.
 */
export function applyColumnVerticalCentering(
  layoutRoot: HTMLElement,
  container: HTMLElement
): void {
  const columns = Array.from(layoutRoot.querySelectorAll<HTMLElement>(".local-column"));
  if (columns.length === 0) {
    return;
  }

  // Reset margins first
  columns.forEach(column => {
    column.style.marginTop = "0px";
    column.style.marginBottom = "0px";
  });

  withTransformReset(container, () => {
    let maxHeight = 0;
    const columnHeights = new Map<HTMLElement, number>();
    
    columns.forEach(column => {
      const rect = column.getBoundingClientRect();
      const height = rect.height;
      columnHeights.set(column, height);
      if (Number.isFinite(height)) {
        maxHeight = Math.max(maxHeight, height);
      }
    });

    if (maxHeight <= 0) {
      return null;
    }

    layoutRoot.style.minHeight = `${maxHeight}px`;

    columns.forEach(column => {
      const height = columnHeights.get(column) ?? 0;
      const offset = Math.max((maxHeight - height) / 2, 0);
      column.style.marginTop = `${offset}px`;
      column.style.marginBottom = `${offset}px`;
    });

    return null;
  });
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
