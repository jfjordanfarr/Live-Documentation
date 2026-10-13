import { rowItemsOf, type Scene } from "./branch-scene";
import type { BranchGraph } from "./branches";

/**
 * The shape measurements shared by the Local Map's layout competition and its headless lab. Every drawn membrane
 * contributes its own top and bottom steps, including boundaries inside other membranes. Row alignment reads only
 * directly owned cards, so descendants do not add the same row distance again through their ancestors.
 *
 * Pure-function module: no DOM.
 * @module branch-shape
 */

/** The shape of the drawn membranes and their directly owned rows, shared by the page's competition and the layout lab. */
export interface ShapeSignals {
  /** Absolute top and bottom changes between adjacent segments, summed in pixels over every drawn membrane. */
  unevenness: number;
  /** The number of nonzero top and bottom changes, regardless of their size. A rectangle has none. */
  steps: number;
  /** Distance between the k-th directly owned card tops in adjacent columns, summed in pixels. */
  unlevel: number;
}

/**
 * Measures every drawn boundary, including nested ones; invisible roots, loose-file buckets and lanes have no shape
 * price. Rows pair cards in their column order only within their own membrane, with no partner across an empty column.
 */
export function shapeSignalsOf(scene: Pick<Scene, "boxes" | "tops">, branches: Pick<BranchGraph, "columns">): ShapeSignals {
  const place = new Map<string, { column: number; index: number }>();
  branches.columns.forEach((column, c) => column.forEach((node, i) => place.set(node.id, { column: c, index: i })));
  let unevenness = 0, steps = 0, unlevel = 0;
  for (const box of scene.boxes) {
    if (box.kind !== "directory") continue;
    for (let i = 1; i < box.segments.length; i++) {
      const top = Math.abs(box.segments[i].top - box.segments[i - 1].top);
      const bottom = Math.abs(box.segments[i].bottom - box.segments[i - 1].bottom);
      unevenness += top + bottom;
      steps += Number(top !== 0) + Number(bottom !== 0);
    }
    const byColumn = new Map<number, string[]>();
    for (const item of rowItemsOf(box)) {
      const at = place.get(item);
      if (!at) continue;
      if (!byColumn.has(at.column)) byColumn.set(at.column, []);
      byColumn.get(at.column)!.push(item);
    }
    for (const list of byColumn.values()) list.sort((a, b) => place.get(a)!.index - place.get(b)!.index);
    for (let column = box.minColumn + 1; column <= box.maxColumn; column++) {
      const left = byColumn.get(column - 1) ?? [], right = byColumn.get(column) ?? [];
      for (let k = 0; k < Math.min(left.length, right.length); k++) unlevel += Math.abs((scene.tops.get(left[k]) ?? 0) - (scene.tops.get(right[k]) ?? 0));
    }
  }
  return { unevenness, steps, unlevel };
}
