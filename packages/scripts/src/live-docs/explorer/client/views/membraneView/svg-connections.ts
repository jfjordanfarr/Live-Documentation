/**
 * SVG connection rendering for the Membrane Map.
 *
 * Handles drawing bundled edge paths between collapsed/expanded membranes.
 * Individual pin-level connections are drawn by focal-overlay.ts;
 * this module draws the higher-level membrane-to-membrane bundles.
 *
 * @module svg-connections
 */

import type { LayoutRect } from "../layoutUtils";
import type { BundledEdge } from "./edge-bundling";
import type { MembraneLayout } from "./types";

// ─── Pure Functions (testable) ─────────────────────────────────────

/**
 * Compute stroke width for a bundled edge based on connection count.
 * Logarithmic scaling, clamped between 2px and 10px.
 */
export function bundleStrokeWidth(count: number): number {
  return Math.min(2 + Math.log2(Math.max(count, 1)) * 1.5, 10);
}

/**
 * Find where a ray from the center of `rect` toward `(towardX, towardY)`
 * exits the rect border.
 *
 * Uses parametric line–rectangle intersection: cast a ray from center
 * in the direction of the target, pick the smallest positive t that
 * lands on the border.
 */
export function computeEdgeExitPoint(
  rect: LayoutRect,
  towardX: number,
  towardY: number,
): { x: number; y: number } {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;

  // Degenerate: target is at the center
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  // Find parametric t for each edge intersection
  let tMin = Infinity;

  if (dx !== 0) {
    // Left edge
    const tLeft = (rect.x - cx) / dx;
    if (tLeft > 0 && tLeft < tMin) {
      const py = cy + dy * tLeft;
      if (py >= rect.y && py <= rect.y + rect.height) tMin = tLeft;
    }
    // Right edge
    const tRight = (rect.x + rect.width - cx) / dx;
    if (tRight > 0 && tRight < tMin) {
      const py = cy + dy * tRight;
      if (py >= rect.y && py <= rect.y + rect.height) tMin = tRight;
    }
  }

  if (dy !== 0) {
    // Top edge
    const tTop = (rect.y - cy) / dy;
    if (tTop > 0 && tTop < tMin) {
      const px = cx + dx * tTop;
      if (px >= rect.x && px <= rect.x + rect.width) tMin = tTop;
    }
    // Bottom edge
    const tBottom = (rect.y + rect.height - cy) / dy;
    if (tBottom > 0 && tBottom < tMin) {
      const px = cx + dx * tBottom;
      if (px >= rect.x && px <= rect.x + rect.width) tMin = tBottom;
    }
  }

  return { x: cx + dx * tMin, y: cy + dy * tMin };
}

/**
 * Compute a quadratic Bézier SVG path between two points.
 * The control point is offset perpendicular to the source–target line,
 * giving a gentle arc.
 */
export function computeBundleCurvePath(
  source: { x: number; y: number },
  target: { x: number; y: number },
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return `M ${source.x} ${source.y} L ${source.x} ${source.y}`;

  // Perpendicular offset for curvature (20% of distance)
  const curvature = dist * 0.2;
  const nx = -dy / dist;
  const ny = dx / dist;

  const mx = (source.x + target.x) / 2;
  const my = (source.y + target.y) / 2;

  const cpx = mx + nx * curvature;
  const cpy = my + ny * curvature;

  return `M ${source.x} ${source.y} Q ${cpx} ${cpy} ${target.x} ${target.y}`;
}

/**
 * Compute the midpoint between source and target (for badge placement).
 */
export function computeBundleMidpoint(
  source: { x: number; y: number },
  target: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  };
}

// ─── DOM Rendering ─────────────────────────────────────────────────

/**
 * Render bundled edges as thick SVG paths with count badges.
 *
 * Creates an SVG overlay element positioned over the membrane container.
 * Each bundle gets a curved path (stroke-width ∝ count) and a text badge
 * showing the number of aggregated connections.
 *
 * @param bundles - Aggregated bundles from `aggregateEdges()`
 * @param layout - Current membrane layout (for node rect lookup)
 * @returns SVG overlay element, or null if no bundles to render
 */
export function renderBundledEdges(
  bundles: readonly BundledEdge[],
  layout: MembraneLayout,
): SVGSVGElement | null {
  if (bundles.length === 0) return null;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("membrane-bundle-svg");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "3";

  for (const bundle of bundles) {
    const sourceNode = layout.index.get(bundle.sourceMembrane);
    const targetNode = layout.index.get(bundle.targetMembrane);

    if (!sourceNode || !targetNode) continue;

    const sourceExit = computeEdgeExitPoint(
      sourceNode.rect,
      targetNode.rect.x + targetNode.rect.width / 2,
      targetNode.rect.y + targetNode.rect.height / 2,
    );
    const targetEntry = computeEdgeExitPoint(
      targetNode.rect,
      sourceNode.rect.x + sourceNode.rect.width / 2,
      sourceNode.rect.y + sourceNode.rect.height / 2,
    );

    const pathD = computeBundleCurvePath(sourceExit, targetEntry);
    const mid = computeBundleMidpoint(sourceExit, targetEntry);
    const strokeWidth = bundleStrokeWidth(bundle.count);

    // Draw the bundled edge path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(150, 150, 150, 0.4)");
    path.setAttribute("stroke-width", String(strokeWidth));
    path.setAttribute("stroke-linecap", "round");
    path.classList.add("membrane-bundle-edge");
    path.dataset.source = bundle.sourceMembrane;
    path.dataset.target = bundle.targetMembrane;
    path.dataset.count = String(bundle.count);
    svg.appendChild(path);

    // Count badge
    const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
    badge.setAttribute("x", String(mid.x));
    badge.setAttribute("y", String(mid.y));
    badge.setAttribute("text-anchor", "middle");
    badge.setAttribute("dominant-baseline", "central");
    badge.setAttribute("font-size", "11");
    badge.setAttribute("fill", "rgba(200, 200, 200, 0.8)");
    badge.classList.add("membrane-bundle-badge");
    badge.textContent = String(bundle.count);
    svg.appendChild(badge);
  }

  return svg;
}
