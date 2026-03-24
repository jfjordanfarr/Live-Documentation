import type { MembraneLayout } from "./types";
import type { LayoutRect } from "../layoutUtils";

/**
 * The rendering detail level assigned to each node in the membrane layout.
 *
 * - **Full**: Expanded card with all symbols/pins visible (focal node)
 * - **Summary**: Compact card showing name + key metrics (direct neighbors)
 * - **Badge**: Collapsed to a small badge with aggregate count (distant nodes)
 * - **Hidden**: Off-screen or culled — not rendered at all
 */
export const enum DetailLevel {
  Full = "full",
  Summary = "summary",
  Badge = "badge",
  Hidden = "hidden",
}

/**
 * Focal node specification for detail-level resolution.
 *
 * - No focal: Browse mode — everything is Badge.
 * - Single focal: Explore mode — focal is Full, neighbors are Summary.
 * - Dual focal: Compare mode — both are Full, union of neighbors are Summary.
 */
export interface FocalSpec {
  /** Primary focal node id. */
  readonly focal?: string;
  /** Secondary focal node id (compare mode). */
  readonly secondary?: string;
}

/**
 * Returns true if rectangle `a` overlaps with rectangle `b`.
 */
function rectsOverlap(a: LayoutRect, b: LayoutRect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Resolves the detail level for every node in a membrane layout.
 *
 * @param layout - The membrane layout tree with flat index
 * @param edges - Array of [sourceId, targetId] connection pairs
 * @param focalSpec - Which node(s) are focal (if any)
 * @param cullingViewport - Optional viewport for culling off-screen nodes.
 *   Defaults to the layout's own viewport.
 * @returns A Map from node id to DetailLevel
 */
export function resolveDetailLevels(
  layout: MembraneLayout,
  edges: ReadonlyArray<readonly [string, string]>,
  focalSpec: FocalSpec,
  cullingViewport?: LayoutRect
): Map<string, DetailLevel> {
  const vp = cullingViewport ?? layout.viewport;
  const levels = new Map<string, DetailLevel>();

  // Collect focal node ids
  const focalIds = new Set<string>();
  if (focalSpec.focal) focalIds.add(focalSpec.focal);
  if (focalSpec.secondary) focalIds.add(focalSpec.secondary);

  // Collect neighbor ids (nodes connected to any focal node)
  const neighborIds = new Set<string>();
  if (focalIds.size > 0) {
    for (const [source, target] of edges) {
      if (focalIds.has(source)) neighborIds.add(target);
      if (focalIds.has(target)) neighborIds.add(source);
    }
    // A focal node is not also a neighbor
    for (const id of focalIds) neighborIds.delete(id);
  }

  // Assign levels
  for (const [id, node] of layout.index) {
    // Viewport culling: if the node's rect doesn't overlap the culling viewport, hide it
    if (!rectsOverlap(node.rect, vp)) {
      levels.set(id, DetailLevel.Hidden);
      continue;
    }

    if (focalIds.has(id)) {
      levels.set(id, DetailLevel.Full);
    } else if (neighborIds.has(id)) {
      levels.set(id, DetailLevel.Summary);
    } else {
      levels.set(id, DetailLevel.Badge);
    }
  }

  return levels;
}
