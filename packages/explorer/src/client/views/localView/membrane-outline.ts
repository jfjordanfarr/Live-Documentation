/**
 * The outline of a directory's membrane in the Local Map: one rectangle per
 * column it spans, each at its own height, joined across each gutter by the
 * part of the gutter where the two neighbouring rectangles overlap, so that
 * the shape is one rectilinear polygon that follows its members from column
 * to column. The segments arrive left to right, each overlapping the next
 * vertically, as the placement guarantees with its neck.
 *
 * Pure-function module: no DOM. Coordinates are whatever the caller's are.
 *
 * @module membrane-outline
 */

/** One column's rectangle of a membrane. */
export interface OutlineSegment {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** A corner of the outline. */
export interface OutlinePoint {
  x: number;
  y: number;
}

/**
 * The outline's corners in drawing order, clockwise from the top-left of the
 * leftmost segment: along the tops left to right, stepping at each gutter to
 * the higher of the two tops, down the right edge of the last segment, back
 * along the bottoms stepping to the lower of the two bottoms, and up the left
 * edge of the first. Corners that repeat a point are dropped. Empty input
 * gives no points.
 */
export function membraneOutline(segments: readonly OutlineSegment[]): OutlinePoint[] {
  if (!segments.length) return [];
  const points: OutlinePoint[] = [];
  const add = (x: number, y: number): void => {
    const last = points[points.length - 1];
    if (!last || last.x !== x || last.y !== y) points.push({ x, y });
  };
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    add(segment.left, segment.top);
    add(segment.right, segment.top);
    const next = segments[i + 1];
    if (next) {
      // The gutter's corridor runs between the higher top and the lower bottom of the two.
      const corridorTop = Math.max(segment.top, next.top);
      add(segment.right, corridorTop);
      add(next.left, corridorTop);
    }
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    add(segment.right, segment.bottom);
    add(segment.left, segment.bottom);
    const previous = segments[i - 1];
    if (previous) {
      const corridorBottom = Math.min(segment.bottom, previous.bottom);
      add(segment.left, corridorBottom);
      add(previous.right, corridorBottom);
    }
  }
  // The trace returns to its start; the start is not repeated.
  const first = points[0], last = points[points.length - 1];
  if (points.length > 1 && first.x === last.x && first.y === last.y) points.pop();
  return points;
}

/** The outline as an SVG path, closed. */
export function membranePath(segments: readonly OutlineSegment[]): string {
  const points = membraneOutline(segments);
  if (!points.length) return "";
  return `${points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ")} Z`;
}
