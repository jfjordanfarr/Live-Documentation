import { pathPoints } from "./wire-marks";

/**
 * A wire's reach for the pointer, by arithmetic (2026-11-22). A wire's band is twelve of the screen's pixels wide so that
 * a wire can be pointed at, and the wires stand above the cards, so a band that took the pointer took it from whatever
 * card stood beside its lane: zoomed out, a card's More lay under the band of a wire between two other files. A band now
 * takes no pointer. The wire under the pointer is found here, from the wire's own route walked as a line of points
 * ({@link pathPoints}, the walk the direction marks already use), and only where the pointer's target is the map's
 * ground (wire-answers.ts): everything of a card takes the pointer before a wire's reach does.
 */
export interface Reach {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** The route as a line of points: x and y in turn, in the picture's own units. */
  points: Float64Array;
}

/** A route's reach: its points and the box that holds them; null where the route walks to fewer than two points. */
export function reachOf(d: string): Reach | null {
  const walked = pathPoints(d);
  if (walked.length < 2) return null;
  const points = new Float64Array(walked.length * 2);
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  walked.forEach((point, index) => {
    points[index * 2] = point.x;
    points[index * 2 + 1] = point.y;
    left = Math.min(left, point.x);
    right = Math.max(right, point.x);
    top = Math.min(top, point.y);
    bottom = Math.max(bottom, point.y);
  });
  return { left, top, right, bottom, points };
}

/** The distance from a point to a route, to the nearest of its straight pieces. */
export function distanceTo(reach: Reach, x: number, y: number): number {
  const { points } = reach;
  let least = Infinity;
  for (let index = 2; index < points.length; index += 2) {
    const ax = points[index - 2], ay = points[index - 1], dx = points[index] - ax, dy = points[index + 1] - ay;
    const length = dx * dx + dy * dy;
    const along = length > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length)) : 0;
    const px = ax + along * dx - x, py = ay + along * dy - y;
    least = Math.min(least, px * px + py * py);
  }
  return Math.sqrt(least);
}

/**
 * The wire whose reach holds a point: of the wires within half their width of it, the nearest; of two as near, the later,
 * which is drawn over the earlier. Until 2026-11-22 the browser chose, and chose the later of any two whose bands held the
 * point, however near the other ran. `half` is asked only of a wire whose box, grown by `most`, holds the point.
 */
export function wireAt<T>(wires: Iterable<{ wire: T; reach: Reach | null }>, x: number, y: number, half: (wire: T) => number, most: number): T | null {
  let nearest: T | null = null, least = Infinity;
  for (const { wire, reach } of wires) {
    if (!reach || x < reach.left - most || x > reach.right + most || y < reach.top - most || y > reach.bottom + most) continue;
    const distance = distanceTo(reach, x, y);
    if (distance <= least && distance <= Math.min(most, half(wire))) { least = distance; nearest = wire; }
  }
  return nearest;
}
