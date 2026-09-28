/**
 * Pan-zoom controller functions for Local Map.
 *
 * These are pure functions that operate on the runtime object,
 * allowing the LocalViewController to delegate pan/zoom behavior
 * while keeping the logic testable and independently improvable.
 *
 * @module pan-zoom
 */

import type { LocalViewRuntime } from "./runtime";
import type { MapTransform } from "./types";

/**
 * Clamps a value to a range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Easing function for smooth animations.
 */
export function easeOutCubic(t: number): number {
  const p = t - 1;
  return p * p * p + 1;
}

/**
 * Applies the current map transform to the viewport.
 */
export function applyMapTransform(runtime: LocalViewRuntime): void {
  const viewport = runtime.container.parentElement;
  if (viewport) {
    viewport.style.transform = `translate(${runtime.mapTransform.x}px, ${runtime.mapTransform.y}px) scale(${runtime.mapTransform.k})`;
  }
}

/**
 * Zooms by a factor around the center of the viewport.
 */
export function zoomByFactor(
  runtime: LocalViewRuntime,
  factor: number,
  onTransformChange: () => void
): void {
  runtime.mapUserAdjusted = true;
  cancelInertia(runtime);
  const viewportRect = runtime.viewport.getBoundingClientRect();
  zoomAtPoint(
    runtime,
    viewportRect.width / 2,
    viewportRect.height / 2,
    Math.log(factor),
    onTransformChange
  );
}

/**
 * Zooms at a specific point in viewport coordinates.
 */
export function zoomAtPoint(
  runtime: LocalViewRuntime,
  offsetX: number,
  offsetY: number,
  delta: number,
  onTransformChange: () => void
): void {
  const scaleFactor = Math.exp(delta);
  const nextScale = clamp(runtime.mapTransform.k * scaleFactor, 0.4, 3);
  const localX = (offsetX - runtime.mapTransform.x) / runtime.mapTransform.k;
  const localY = (offsetY - runtime.mapTransform.y) / runtime.mapTransform.k;
  runtime.mapTransform = {
    x: offsetX - localX * nextScale,
    y: offsetY - localY * nextScale,
    k: nextScale
  };
  onTransformChange();
}

/**
 * Animates the map transform to a target value.
 */
export function animateMapTransform(
  runtime: LocalViewRuntime,
  target: MapTransform,
  onTransformChange: () => void,
  suppressUserState = false
): void {
  cancelAnimationFrame(runtime.mapAnimationFrame);
  const to = {
    x: target.x,
    y: target.y,
    k: clamp(target.k, 0.4, 3)
  };
  const from = { ...runtime.mapTransform };
  const duration = 350;
  const start = performance.now();

  const step = (now: number) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = easeOutCubic(progress);
    runtime.mapTransform = {
      x: from.x + (to.x - from.x) * eased,
      y: from.y + (to.y - from.y) * eased,
      k: from.k + (to.k - from.k) * eased
    };
    onTransformChange();
    if (progress < 1) {
      runtime.mapAnimationFrame = requestAnimationFrame(step);
    } else if (!suppressUserState) {
      runtime.mapUserAdjusted = true;
    }
  };

  runtime.mapAnimationFrame = requestAnimationFrame(step);
}

/**
 * Starts inertia-based panning after a drag release.
 */
export function startInertia(
  runtime: LocalViewRuntime,
  initialVx: number,
  initialVy: number,
  onTransformChange: () => void
): void {
  cancelInertia(runtime);
  runtime.mapUserAdjusted = true;
  let vx = initialVx;
  let vy = initialVy;
  const friction = 0.92;
  
  const step = () => {
    runtime.mapTransform = {
      x: runtime.mapTransform.x + vx,
      y: runtime.mapTransform.y + vy,
      k: runtime.mapTransform.k
    };
    onTransformChange();
    vx *= friction;
    vy *= friction;
    if (Math.abs(vx) < 0.06 && Math.abs(vy) < 0.06) {
      cancelInertia(runtime);
      return;
    }
    runtime.mapInertiaFrame = requestAnimationFrame(step);
  };
  
  runtime.mapInertiaFrame = requestAnimationFrame(step);
}

/**
 * Cancels any ongoing inertia animation.
 */
export function cancelInertia(runtime: LocalViewRuntime): void {
  if (runtime.mapInertiaFrame) {
    cancelAnimationFrame(runtime.mapInertiaFrame);
    runtime.mapInertiaFrame = 0;
  }
}

/**
 * Handles mouse move during drag.
 */
export function handleDragMove(
  runtime: LocalViewRuntime,
  clientX: number,
  clientY: number,
  onTransformChange: () => void
): void {
  const lastDragPosition = runtime.lastDragPosition;
  if (!runtime.isDragging || !lastDragPosition) {
    return;
  }
  
  const now = performance.now();
  const deltaX = clientX - lastDragPosition.x;
  const deltaY = clientY - lastDragPosition.y;
  
  runtime.mapTransform = {
    x: runtime.mapTransform.x + deltaX,
    y: runtime.mapTransform.y + deltaY,
    k: runtime.mapTransform.k
  };
  onTransformChange();
  
  const elapsed = Math.max(1, now - lastDragPosition.time);
  runtime.dragVelocity = {
    x: deltaX / elapsed,
    y: deltaY / elapsed
  };
  runtime.lastDragPosition = { x: clientX, y: clientY, time: now };
}

/**
 * Handles mouse up after drag, potentially starting inertia.
 */
export function handleDragEnd(
  runtime: LocalViewRuntime,
  viewport: HTMLElement,
  onTransformChange: () => void
): void {
  if (!runtime.isDragging) {
    return;
  }
  
  runtime.isDragging = false;
  viewport.style.cursor = "grab";
  document.body.classList.remove("dragging");
  
  const lastDragPosition = runtime.lastDragPosition;
  if (!lastDragPosition) {
    return;
  }
  
  const vx = runtime.dragVelocity.x * 16;
  const vy = runtime.dragVelocity.y * 16;
  if (Math.abs(vx) > 0.4 || Math.abs(vy) > 0.4) {
    startInertia(runtime, vx, vy, onTransformChange);
  }
}

/**
 * Handles wheel events for pan and zoom.
 */
export function handleWheel(
  runtime: LocalViewRuntime,
  event: WheelEvent,
  onTransformChange: () => void
): void {
  // Ctrl/Cmd + wheel = zoom
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    runtime.mapUserAdjusted = true;
    cancelInertia(runtime);
    const viewportRect = runtime.viewport.getBoundingClientRect();
    zoomAtPoint(
      runtime,
      event.clientX - viewportRect.left,
      event.clientY - viewportRect.top,
      -event.deltaY * 0.0015,
      onTransformChange
    );
    return;
  }

  // Normal wheel = pan
  event.preventDefault();
  runtime.mapUserAdjusted = true;
  cancelInertia(runtime);
  runtime.mapTransform = {
    x: runtime.mapTransform.x - event.deltaX,
    y: runtime.mapTransform.y - event.deltaY,
    k: runtime.mapTransform.k
  };
  onTransformChange();
}

/**
 * Starts a drag operation.
 */
export function startDrag(
  runtime: LocalViewRuntime,
  clientX: number,
  clientY: number,
  viewport: HTMLElement
): void {
  runtime.isDragging = true;
  runtime.mapUserAdjusted = true;
  cancelInertia(runtime);
  cancelAnimationFrame(runtime.mapAnimationFrame);
  runtime.lastDragPosition = { x: clientX, y: clientY, time: performance.now() };
  runtime.dragVelocity = { x: 0, y: 0 };
  viewport.style.cursor = "grabbing";
  document.body.classList.add("dragging");
}
