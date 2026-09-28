/**
 * FLIP animation utilities for the Membrane Map.
 *
 * Captures element positions before a full DOM teardown, then after
 * the new DOM is built, animates elements from their old positions
 * to their new positions using CSS transforms + transitions.
 *
 * FLIP = First, Last, Invert, Play
 *   First:  record old positions  (capturePositions)
 *   Last:   new DOM is in place   (after render)
 *   Invert: offset elements back to old positions via transform
 *   Play:   remove the offset; CSS transition interpolates smoothly
 *
 * @module animation
 */

// ─── Types ─────────────────────────────────────────────────────────

/** Captured position snapshot for a single element. */
export interface PositionSnapshot {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Map of element data-id → position snapshot. */
export type PositionMap = ReadonlyMap<string, PositionSnapshot>;

// ─── Constants ─────────────────────────────────────────────────────

/** Duration of FLIP position animations (ms). */
const FLIP_DURATION_MS = 580;

/** Duration of fade-in for newly appearing elements (ms). */
const FADE_IN_DURATION_MS = 500;

/** CSS class applied during FLIP animation. Disables pointer events. */
const ANIMATING_CLASS = "membrane-animating";

// ─── Position Capture ──────────────────────────────────────────────

/**
 * Snapshot the bounding rects of all elements with `data-id` attributes
 * within the given container. Positions are normalised to **unscaled**
 * container-local coordinates so FLIP deltas remain valid even when the
 * container's CSS transform (zoom/pan) changes between capture and
 * playback.
 *
 * @param container - The membrane container element
 * @param scale - Current zoom scale factor (transform.k)
 */
export function capturePositions(container: HTMLElement, scale: number): PositionMap {
  const map = new Map<string, PositionSnapshot>();
  const containerRect = container.getBoundingClientRect();
  const s = scale || 1;
  const elements = container.querySelectorAll<HTMLElement>("[data-id]");

  for (const el of elements) {
    const id = el.dataset.id;
    if (!id) continue;
    const rect = el.getBoundingClientRect();
    map.set(id, {
      left: (rect.left - containerRect.left) / s,
      top: (rect.top - containerRect.top) / s,
      width: rect.width / s,
      height: rect.height / s,
    });
  }

  return map;
}

/**
 * Apply FLIP animation: move elements from their old positions to
 * their new positions with a smooth CSS transition.
 *
 * Call this immediately after the new DOM has been appended to the
 * container (before the browser paints — i.e., synchronously after
 * DOM insertion, before any rAF).
 *
 * Elements present in both old and new snapshots are FLIP-animated.
 * Elements only in the new DOM fade in.
 *
 * @param container - The membrane container element
 * @param oldPositions - Snapshot from {@link capturePositions}
 * @param scale - Current (post-render) zoom scale factor (transform.k)
 */
export function animateTransition(
  container: HTMLElement,
  oldPositions: PositionMap,
  scale: number,
): Promise<void> {
  if (oldPositions.size === 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
  const containerRect = container.getBoundingClientRect();
  const s = scale || 1;
  const newElements = container.querySelectorAll<HTMLElement>("[data-id]");

  // Prevent pointer events during animation
  container.classList.add(ANIMATING_CLASS);

  interface FlipTarget {
    el: HTMLElement;
    dx: number;
    dy: number;
    sx: number;   // scaleX  (oldWidth / newWidth)
    sy: number;   // scaleY  (oldHeight / newHeight)
  }

  const flipTargets: FlipTarget[] = [];
  const fadeTargets: HTMLElement[] = [];

  for (const el of newElements) {
    const id = el.dataset.id;
    if (!id) continue;

    const oldPos = oldPositions.get(id);
    const newRect = el.getBoundingClientRect();
    // Normalise to unscaled container-local coordinates
    const newLeft = (newRect.left - containerRect.left) / s;
    const newTop = (newRect.top - containerRect.top) / s;
    const newW = newRect.width / s;
    const newH = newRect.height / s;

    if (oldPos) {
      // Element existed before — FLIP animate
      const dx = oldPos.left - newLeft;
      const dy = oldPos.top - newTop;

      // Scale factors: if the element changed size, animate via scaleX/scaleY.
      // Guard against zero-sized elements.
      const sx = newW > 1 ? oldPos.width / newW : 1;
      const sy = newH > 1 ? oldPos.height / newH : 1;

      const hasMoved = Math.abs(dx) > 2 || Math.abs(dy) > 2;
      const hasResized = Math.abs(sx - 1) > 0.02 || Math.abs(sy - 1) > 0.02;

      if (hasMoved || hasResized) {
        flipTargets.push({ el, dx, dy, sx, sy });
      }
    } else {
      // New element — fade in
      fadeTargets.push(el);
    }
  }

  // INVERT: position elements at their old locations (and old sizes via scale).
  // Use inline transition:none to prevent the browser from animating
  // the initial offset (we only want to animate the REMOVAL).
  // transform-origin must be 0 0 so the scale aligns with our
  // top-left-relative position measurements.
  for (const { el, dx, dy, sx, sy } of flipTargets) {
    el.style.transition = "none";
    el.style.transformOrigin = "0 0";
    el.style.transform = `translate(${dx}px, ${dy}px) scaleX(${sx}) scaleY(${sy})`;
  }

  // Set up fade-in elements (start invisible)
  for (const el of fadeTargets) {
    el.style.transition = "none";
    el.style.opacity = "0";
  }

  // PLAY: let the browser compute the "inverted" layout, then
  // remove the transforms so CSS transitions animate to final position.
  // Using double-rAF to guarantee the browser has painted the inverted state.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // FLIP: enable transition then remove transforms → animate to natural position
      for (const { el } of flipTargets) {
        el.style.transition = `transform ${FLIP_DURATION_MS}ms ease-out`;
        el.style.transform = "";
      }

      // Fade in new elements
      for (const el of fadeTargets) {
        el.style.transition = `opacity ${FADE_IN_DURATION_MS}ms ease-in`;
        el.style.opacity = "";
      }

      // Clean up after transitions complete
      const cleanup = () => {
        container.classList.remove(ANIMATING_CLASS);
        for (const { el } of flipTargets) {
          el.style.transition = "";
          el.style.transform = "";
          el.style.transformOrigin = "";
        }
        for (const el of fadeTargets) {
          el.style.transition = "";
        }
        resolve();
      };

      // Use the longest animation duration for cleanup timing
      setTimeout(cleanup, Math.max(FLIP_DURATION_MS, FADE_IN_DURATION_MS) + 50);
    });
  });
  }); // end Promise
}

// ─── SVG Line-Draw Animation ───────────────────────────────────────

/**
 * Apply a "line draw" animation to an SVG path element.
 *
 * Uses stroke-dasharray / stroke-dashoffset to animate the path
 * being drawn from start to end. The path should already be in the
 * DOM with its `d` attribute set.
 *
 * @param path - The SVG path element to animate
 * @param durationMs - Animation duration in milliseconds (default 350)
 */
export function animateLineDrawIn(
  path: SVGPathElement,
  durationMs = 350,
): void {
  const length = path.getTotalLength();
  if (length === 0) return;

  // Start: full dash gap (invisible)
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);

  // Trigger reflow so the browser registers the initial state
  void path.getBoundingClientRect();

  // Animate: transition dashoffset to 0 (fully drawn)
  path.style.transition = `stroke-dashoffset ${durationMs}ms ease-out`;
  path.style.strokeDashoffset = "0";

  // Clean up dash properties after animation completes
  setTimeout(() => {
    path.style.strokeDasharray = "";
    path.style.strokeDashoffset = "";
    path.style.transition = "";
  }, durationMs + 50);
}
