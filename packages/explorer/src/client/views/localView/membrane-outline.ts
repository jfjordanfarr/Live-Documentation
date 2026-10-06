/**
 * The outline of a directory's membrane in the Local Map: one rectangle per
 * column it spans, each at its own height, joined across each gutter by the
 * part of the gutter where the two neighbouring rectangles overlap, so that
 * the shape is one rectilinear polygon that follows its members from column
 * to column, its corners rounded when drawn. The segments arrive left to
 * right, each overlapping the next vertically, as the placement guarantees
 * with its neck.
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

/**
 * The outline as a closed SVG path, every corner rounded by `radius`, convex
 * and concave alike, as a quadratic curve with the corner as its control
 * point. A corner between short edges is rounded by half the shorter edge
 * instead, so neighbouring curves never overlap; a radius of zero draws the
 * corners sharp.
 */
export function membranePath(segments: readonly OutlineSegment[], radius = 0): string {
  const points = membraneOutline(segments);
  if (!points.length) return "";
  if (radius <= 0 || points.length < 3) return `${points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ")} Z`;
  const count = points.length;
  const at = (index: number): OutlinePoint => points[(index + count) % count];
  // For each corner, the points where its curve begins and ends, along the edges before and after it.
  const corners = points.map((corner, index) => {
    const before = at(index - 1), after = at(index + 1);
    const inLength = Math.hypot(corner.x - before.x, corner.y - before.y);
    const outLength = Math.hypot(after.x - corner.x, after.y - corner.y);
    const r = Math.min(radius, inLength / 2, outLength / 2);
    const start = { x: corner.x - (corner.x - before.x) / inLength * r, y: corner.y - (corner.y - before.y) / inLength * r };
    const end = { x: corner.x + (after.x - corner.x) / outLength * r, y: corner.y + (after.y - corner.y) / outLength * r };
    return { corner, start, end };
  });
  const n = (value: number): number => Math.round(value * 100) / 100;
  const commands = [`M ${n(corners[0].end.x)} ${n(corners[0].end.y)}`];
  for (let i = 1; i <= count; i++) {
    const { corner, start, end } = corners[i % count];
    commands.push(`L ${n(start.x)} ${n(start.y)}`, `Q ${n(corner.x)} ${n(corner.y)} ${n(end.x)} ${n(end.y)}`);
  }
  commands.push("Z");
  return commands.join(" ");
}
