import type { LayoutRect } from "../layoutUtils";

/**
 * An item to be laid out with the squarified treemap algorithm.
 * The `weight` determines the relative area of the tile.
 */
export interface SquarifyItem {
  /** Unique identifier for this item (directory path). */
  readonly id: string;
  /** Visual weight determining proportional area. Must be > 0. */
  readonly weight: number;
}

/**
 * A positioned tile output from the squarified treemap algorithm.
 */
export interface SquarifyTile {
  /** The item this tile represents. */
  readonly item: SquarifyItem;
  /** The computed rectangle in absolute coordinates. */
  readonly rect: LayoutRect;
}

/**
 * Computes a squarified treemap layout for the given items within a viewport.
 *
 * This is an implementation of Bruls, Huizing, and van Wijk's
 * "Squarified Treemaps" algorithm (2000), which produces tiles with
 * aspect ratios as close to 1:1 as possible — visually far superior
 * to naive slice-and-dice layouts.
 *
 * @param items - Items to lay out, each with a weight > 0
 * @param viewport - The bounding rectangle to fill
 * @returns Positioned tiles, one per item
 */
export function computeSquarifiedLayout(
  items: ReadonlyArray<SquarifyItem>,
  viewport: LayoutRect
): SquarifyTile[] {
  if (items.length === 0) {
    return [];
  }

  // Filter out zero-weight items and sort descending by weight
  const sorted = items
    .filter(item => item.weight > 0)
    .slice()
    .sort((a, b) => b.weight - a.weight);

  if (sorted.length === 0) {
    return [];
  }

  const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0);
  const totalArea = viewport.width * viewport.height;

  // Assign areas proportional to weight
  const areas: number[] = sorted.map(item => (item.weight / totalWeight) * totalArea);

  const tiles: SquarifyTile[] = [];
  squarify(sorted, areas, { ...viewport }, tiles);
  return tiles;
}

/**
 * Recursive squarified layout. Lays out items one row/column at a time,
 * choosing the arrangement that minimizes the worst aspect ratio in the row.
 */
function squarify(
  items: SquarifyItem[],
  areas: number[],
  remaining: LayoutRect,
  output: SquarifyTile[]
): void {
  if (items.length === 0 || remaining.width <= 0 || remaining.height <= 0) {
    return;
  }

  if (items.length === 1) {
    output.push({ item: items[0], rect: { ...remaining } });
    return;
  }

  // Lay out along the shorter side
  const shorter = Math.min(remaining.width, remaining.height);

  // Greedily add items to the current row while improving the worst aspect ratio
  let currentRow: number[] = [areas[0]];
  let currentRowItems: SquarifyItem[] = [items[0]];
  let bestWorst = worstAspectRatio(currentRow, shorter);

  let i = 1;
  while (i < items.length) {
    const candidateRow = [...currentRow, areas[i]];
    const candidateWorst = worstAspectRatio(candidateRow, shorter);

    if (candidateWorst <= bestWorst) {
      currentRow = candidateRow;
      currentRowItems = [...currentRowItems, items[i]];
      bestWorst = candidateWorst;
      i++;
    } else {
      break;
    }
  }

  // Lay out the current row
  const rowArea = currentRow.reduce((sum, a) => sum + a, 0);
  const isHorizontal = remaining.width >= remaining.height;

  if (isHorizontal) {
    // Row is a vertical strip on the left
    const rowWidth = remaining.width > 0 ? rowArea / remaining.height : 0;
    let y = remaining.y;

    for (let j = 0; j < currentRow.length; j++) {
      const h = rowWidth > 0 ? currentRow[j] / rowWidth : 0;
      output.push({
        item: currentRowItems[j],
        rect: { x: remaining.x, y, width: rowWidth, height: h }
      });
      y += h;
    }

    // Recurse on the remaining space
    const nextRemaining: LayoutRect = {
      x: remaining.x + rowWidth,
      y: remaining.y,
      width: remaining.width - rowWidth,
      height: remaining.height
    };
    squarify(items.slice(i), areas.slice(i), nextRemaining, output);
  } else {
    // Row is a horizontal strip on top
    const rowHeight = remaining.height > 0 ? rowArea / remaining.width : 0;
    let x = remaining.x;

    for (let j = 0; j < currentRow.length; j++) {
      const w = rowHeight > 0 ? currentRow[j] / rowHeight : 0;
      output.push({
        item: currentRowItems[j],
        rect: { x, y: remaining.y, width: w, height: rowHeight }
      });
      x += w;
    }

    // Recurse on the remaining space
    const nextRemaining: LayoutRect = {
      x: remaining.x,
      y: remaining.y + rowHeight,
      width: remaining.width,
      height: remaining.height - rowHeight
    };
    squarify(items.slice(i), areas.slice(i), nextRemaining, output);
  }
}

/**
 * Computes the worst (highest) aspect ratio in a row of tiles.
 *
 * Given a row of areas laid out along a side of length `shorter`,
 * finds the maximum aspect ratio. Lower is better (1.0 = perfect square).
 */
function worstAspectRatio(row: number[], shorter: number): number {
  if (row.length === 0 || shorter <= 0) {
    return Infinity;
  }
  const totalArea = row.reduce((sum, a) => sum + a, 0);
  const sideLength = totalArea / shorter;

  let worst = 0;
  for (const area of row) {
    const otherSide = sideLength > 0 ? area / sideLength : 0;
    const aspect = otherSide > 0 ? Math.max(shorter / otherSide, otherSide / shorter) : Infinity;
    worst = Math.max(worst, aspect);
  }
  return worst;
}
