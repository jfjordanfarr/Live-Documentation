/**
 * The World Map's geometry: how big a piece is, where the board's edges are,
 * where a door sits on a wall, how a wire hangs between two doors, and where a
 * thing goes when nobody has placed it. Pure functions; the renderer draws
 * what they return.
 */

import { depthOf, facing, project, ring, type Box, type Camera, type Pivot, type Point2, type Point3 } from "./projection";

/** One board unit, the unit of a board's Layout lines, in board pixels. */
export const UNIT = 60;
/** How high above the board a piece floats. */
export const FLOAT = 46;
/** How much higher a piece floats while it is dragged. */
export const LIFT = 30;
/** The snapping grid, in board pixels. */
export const GRID = 50;

/** The shape words the legend may use; the tool ships a solid for each. */
export type Shape = "cube" | "tile" | "drum" | "figure" | "sheet" | "cloud";

/** A solid: a block with a footprint and a height, or a round tank with a radius. */
export interface Solid {
  form: "block" | "tank";
  w: number;
  d: number;
  h: number;
  r: number;
}

/** The solid drawn for a shape word. */
export function solidFor(shape: Shape): Solid {
  switch (shape) {
    case "tile":
      return { form: "block", w: 84, d: 84, h: 8, r: 0 };
    case "drum":
      return { form: "tank", w: 80, d: 80, h: 56, r: 40 };
    case "figure":
      return { form: "block", w: 34, d: 34, h: 104, r: 0 };
    case "sheet":
      return { form: "block", w: 84, d: 12, h: 72, r: 0 };
    case "cloud":
      return { form: "tank", w: 104, d: 104, h: 16, r: 52 };
    case "cube":
    default:
      return { form: "block", w: 84, d: 84, h: 84, r: 0 };
  }
}

/** A piece placed on the board, in board pixels. */
export interface Placed extends Box {
  name: string;
  shape: Shape;
  form: "block" | "tank";
  cx: number;
  cy: number;
  r: number;
}

/** A piece's box around its centre, floating, and lifted a little more while dragged. */
export function placePiece(name: string, shape: Shape, center: Point2, lifted = false): Placed {
  const solid = solidFor(shape);
  const z0 = FLOAT + (lifted ? LIFT : 0);
  return { name, shape, form: solid.form, cx: center[0], cy: center[1], r: solid.r, x: center[0] - solid.w / 2, y: center[1] - solid.d / 2, w: solid.w, d: solid.d, h: solid.h, z0 };
}

/** A rectangle on the board. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  d: number;
}

/** The rectangle around some rectangles, with padding; nothing when there are none. */
export function rectAround(rects: Rect[], pad: number): Rect | undefined {
  if (rects.length === 0) {
    return undefined;
  }
  const x0 = Math.min(...rects.map((rect) => rect.x)) - pad;
  const y0 = Math.min(...rects.map((rect) => rect.y)) - pad;
  const x1 = Math.max(...rects.map((rect) => rect.x + rect.w)) + pad;
  const y1 = Math.max(...rects.map((rect) => rect.y + rect.d)) + pad;
  return { x: x0, y: y0, w: x1 - x0, d: y1 - y0 };
}

/** The corners of a rectangle, clockwise from the top left. */
export function corners(rect: Rect): Point2[] {
  return [[rect.x, rect.y], [rect.x + rect.w, rect.y], [rect.x + rect.w, rect.y + rect.d], [rect.x, rect.y + rect.d]];
}

/** Whether a board point lies in a rectangle. */
export function inRect(rect: Rect, point: Point2): boolean {
  return point[0] >= rect.x && point[0] <= rect.x + rect.w && point[1] >= rect.y && point[1] <= rect.y + rect.d;
}

/** A board point in board units, as pixels on the plane. */
export function unitsToPixels(units: Point2): Point2 {
  return [units[0] * UNIT, units[1] * UNIT];
}

/** A point on the plane in pixels, as board units rounded to hundredths, which is how the Layout section writes them. */
export function pixelsToUnits(pixels: Point2): Point2 {
  return [Math.round((pixels[0] / UNIT) * 100) / 100, Math.round((pixels[1] / UNIT) * 100) / 100];
}

/** A run of things to place together: the members of one region, or the things in none. */
export interface PlacementGroup {
  names: string[];
}

/**
 * Positions, in board units, for things nobody has placed: each group on its
 * own rows below whatever is placed already, three units apart, with a spare
 * row between groups, so that a region's members sit together.
 */
export function autoPlace(groups: PlacementGroup[], placed: Iterable<Point2>, columns = 4, step = 3): Map<string, Point2> {
  const taken = [...placed];
  const startX = taken.length ? Math.min(...taken.map((p) => p[0])) : 1;
  let row = taken.length ? Math.max(...taken.map((p) => p[1])) + step + 1 : 1;
  const positions = new Map<string, Point2>();
  for (const group of groups) {
    if (group.names.length === 0) {
      continue;
    }
    group.names.forEach((name, index) => {
      positions.set(name, [startX + (index % columns) * step, row + Math.floor(index / columns) * step]);
    });
    row += Math.ceil(group.names.length / columns) * step + 1;
  }
  return positions;
}

/** A wall of a block, by its outward direction on the board. */
export type Wall = "N" | "E" | "S" | "W";
/** Each wall's outward direction on the board plane. */
export const NORMALS: Record<Wall, Point2> = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] };

/** The wall that faces a counterpart best, among the walls the viewer can see. */
export function wallOf(camera: Camera, placed: Placed, toward: Point2): Wall {
  const dx = toward[0] - placed.cx;
  const dy = toward[1] - placed.cy;
  const length = Math.hypot(dx, dy) || 1;
  const seenFromAbove = Math.cos(camera.phi) < 0.08;
  const ranked = (Object.entries(NORMALS) as Array<[Wall, Point2]>)
    .map(([wall, normal]) => ({ wall, score: (normal[0] * dx + normal[1] * dy) / length, seen: seenFromAbove || facing(camera, normal) > 0.05 }))
    .sort((a, b) => b.score - a.score);
  return (ranked.find((entry) => entry.seen) ?? ranked[0]).wall;
}

/** Where a door sits: a point at mid-height on the board, and the direction a wire leaves it. */
export interface Anchor {
  p: Point3;
  out: Point2;
}

/** The point on a wall, at a fraction along it, where a door sits; on a drum, a point on the visible half of the rim facing the counterpart. */
export function wallPoint(camera: Camera, placed: Placed, wall: Wall, toward: Point2, t: number): Anchor {
  const z = placed.z0 + placed.h / 2;
  if (placed.form === "tank") {
    let angle = Math.atan2(toward[1] - placed.cy, toward[0] - placed.cx) + camera.theta;
    const low = -Math.PI / 4 + 0.15;
    const high = (3 * Math.PI) / 4 - 0.15;
    angle = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (Math.cos(camera.phi) >= 0.08 && (angle < low || angle > high)) {
      angle = Math.abs(angle - low) < Math.abs(angle - high) || angle < -Math.PI / 2 ? low : high;
    }
    const a = angle - camera.theta + (t - 0.5) * 0.7;
    return { p: [placed.cx + placed.r * Math.cos(a), placed.cy + placed.r * Math.sin(a), z], out: [Math.cos(a), Math.sin(a)] };
  }
  switch (wall) {
    case "E":
      return { p: [placed.x + placed.w, placed.y + placed.d * t, z], out: [1, 0] };
    case "W":
      return { p: [placed.x, placed.y + placed.d * t, z], out: [-1, 0] };
    case "S":
      return { p: [placed.x + placed.w * t, placed.y + placed.d, z], out: [0, 1] };
    case "N":
    default:
      return { p: [placed.x + placed.w * t, placed.y, z], out: [0, -1] };
  }
}

/** A wire between two doors: a cable in the air that hangs a little. */
export function roadCurve(from: Anchor, to: Anchor): [Point3, Point3, Point3, Point3] {
  const distance = Math.hypot(to.p[0] - from.p[0], to.p[1] - from.p[1]);
  const reach = clamp(distance * 0.4, 30, 170);
  const sag = clamp(distance * 0.07, 6, 26);
  return [from.p, [from.p[0] + from.out[0] * reach, from.p[1] + from.out[1] * reach, from.p[2] - sag], [to.p[0] + to.out[0] * reach, to.p[1] + to.out[1] * reach, to.p[2] - sag], to.p];
}

/**
 * Pushes each seed away from every obstacle and from the seeds placed before
 * it, within bounds, so that tokens on the board sit clear of the pieces and
 * of each other.
 */
export function spreadTokens(seeds: Point2[], obstacles: Point2[], clearSeed: number, clearObstacle: number, bounds: Rect): Point2[] {
  const placed: Point2[] = [];
  for (const seed of seeds) {
    let [cx, cy] = seed;
    for (let round = 0; round < 40; round += 1) {
      let moved = false;
      for (const [x, y] of placed) {
        const distance = Math.hypot(x - cx, y - cy);
        if (distance < clearSeed) {
          const angle = distance < 1 ? Math.PI / 2 : Math.atan2(cy - y, cx - x);
          cx += Math.cos(angle) * (clearSeed - distance + 4);
          cy += Math.sin(angle) * (clearSeed - distance + 4);
          moved = true;
        }
      }
      for (const [x, y] of obstacles) {
        const distance = Math.hypot(x - cx, y - cy);
        if (distance < clearObstacle) {
          const angle = distance < 1 ? Math.PI / 2 : Math.atan2(cy - y, cx - x);
          cx += Math.cos(angle) * (clearObstacle - distance + 4);
          cy += Math.sin(angle) * (clearObstacle - distance + 4);
          moved = true;
        }
      }
      cx = clamp(cx, bounds.x + 60, bounds.x + bounds.w - 60);
      cy = clamp(cy, bounds.y + 60, bounds.y + bounds.d - 60);
      if (!moved) {
        break;
      }
    }
    placed.push([cx, cy]);
  }
  return placed;
}

/** The order to draw pieces in: far ones first. */
export function drawOrder(camera: Camera, pivot: Pivot, pieces: Placed[]): Placed[] {
  return [...pieces].sort((a, b) => depthOf(camera, pivot, a.cx, a.cy) - depthOf(camera, pivot, b.cx, b.cy));
}

/**
 * A piece's outline on the picture plane: the convex hull of its corners, or of
 * a drum's two rims as they are drawn. Everything the piece's faces paint lies
 * inside it, so a label kept off it is kept off the piece.
 */
export function silhouette(camera: Camera, pivot: Pivot, placed: Placed, count = 40): Point2[] {
  const points: Point2[] = [];
  for (const z of [placed.z0, placed.z0 + placed.h]) {
    if (placed.form === "tank") {
      for (const p of ring(placed.cx, placed.cy, placed.r, z, count)) {
        points.push(project(camera, pivot, p[0], p[1], p[2]));
      }
    } else {
      for (const [x, y] of corners({ x: placed.x, y: placed.y, w: placed.w, d: placed.d })) {
        points.push(project(camera, pivot, x, y, z));
      }
    }
  }
  return convexHull(points);
}

/**
 * Where a piece's label stands, on the picture plane: over the piece's middle,
 * at the top of its outline. The label is drawn above this point, so however
 * wide its words are and however the camera turns, it never crosses its own
 * piece. Before 2026-11-12 labels stood on the middle of the lid, and a piece's
 * own edges struck through its words.
 */
export function labelAnchor(camera: Camera, pivot: Pivot, placed: Placed): Point2 {
  const top = Math.min(...silhouette(camera, pivot, placed).map((p) => p[1]));
  return [project(camera, pivot, placed.cx, placed.cy, 0)[0], top];
}

/**
 * A move a label may make from where it rests: pixels up or down, a fraction of its own width sideways, and whether it
 * stands below its piece instead of above it.
 */
export interface LabelMove {
  rise: number;
  shift: number;
  below?: boolean;
}

/**
 * The moves a label may make, every rise with every shift, fewest steps first, where a line of text up or down and a
 * quarter of the label's width aside each count as one step; moves as far as each other keep the order they were given.
 */
export function labelMoves(rises: number[], shifts: number[], line = 14): LabelMove[] {
  const steps = (move: LabelMove): number => (move.rise / line) ** 2 + (move.shift / 0.25) ** 2;
  return rises.flatMap((rise) => shifts.map((shift) => ({ rise, shift }))).sort((a, b) => steps(a) - steps(b));
}

/** A box on the screen, in pixels. */
export interface ScreenBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The part of a convex polygon inside a box (Sutherland and Hodgman's clipping), empty when they do not meet. */
export function clipToBox(polygon: Point2[], box: ScreenBox): Point2[] {
  const sides: Array<[(p: Point2) => boolean, (a: Point2, b: Point2) => Point2]> = [
    [(p) => p[0] >= box.left, (a, b) => along(a, b, (box.left - a[0]) / (b[0] - a[0]))],
    [(p) => p[0] <= box.right, (a, b) => along(a, b, (box.right - a[0]) / (b[0] - a[0]))],
    [(p) => p[1] >= box.top, (a, b) => along(a, b, (box.top - a[1]) / (b[1] - a[1]))],
    [(p) => p[1] <= box.bottom, (a, b) => along(a, b, (box.bottom - a[1]) / (b[1] - a[1]))]
  ];
  let clipped = polygon;
  for (const [inside, cut] of sides) {
    const next: Point2[] = [];
    clipped.forEach((p, i) => {
      const q = clipped[(i + 1) % clipped.length];
      if (inside(p)) {
        next.push(p);
        if (!inside(q)) {
          next.push(cut(p, q));
        }
      } else if (inside(q)) {
        next.push(cut(p, q));
      }
    });
    clipped = next;
    if (clipped.length < 3) {
      return [];
    }
  }
  return clipped;
}

/** How much of a box a convex polygon covers, in square pixels. */
export function coveredArea(box: ScreenBox, polygon: Point2[]): number {
  if (box.right <= box.left || box.bottom <= box.top || polygon.length < 3) {
    return 0;
  }
  const clipped = clipToBox(polygon, box);
  return Math.abs(clipped.reduce((sum, p, i) => {
    const q = clipped[(i + 1) % clipped.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0)) / 2;
}

/**
 * How far a convex polygon reaches left and right within a band of the screen, or nothing when it does not reach the
 * band: where a label beside it must start to stand clear of it.
 */
export function spanWithin(polygon: Point2[], top: number, bottom: number): [number, number] | undefined {
  const clipped = clipToBox(polygon, { left: Number.NEGATIVE_INFINITY, right: Number.POSITIVE_INFINITY, top, bottom });
  return clipped.length ? [Math.min(...clipped.map((p) => p[0])), Math.max(...clipped.map((p) => p[0]))] : undefined;
}

/** Something a panel had better not cover, and what covering it costs. */
export interface Avoid {
  box: ScreenBox;
  weight: number;
}

/**
 * Where a panel about something stands, on the screen: beside it rather than on
 * it. It tries the right of the subject, then the left, below and above, level
 * with the subject's top or left edge, then the same four sides level with its
 * bottom or right edge, each held inside the room it has, and takes the first
 * that covers the subject least, then what it is asked to avoid least. Before
 * 2026-11-12 the pinned panel stood at the pointer, on the piece it explained.
 */
export function panelBeside(subject: ScreenBox, size: { width: number; height: number }, room: ScreenBox, avoid: Avoid[] = [], gap = 14): { left: number; top: number } {
  const hold = (left: number, top: number): { left: number; top: number } => ({
    left: Math.max(room.left, Math.min(room.right - size.width, left)),
    top: Math.max(room.top, Math.min(room.bottom - size.height, top))
  });
  const candidates = [
    hold(subject.right + gap, subject.top),
    hold(subject.left - gap - size.width, subject.top),
    hold(subject.left, subject.bottom + gap),
    hold(subject.left, subject.top - gap - size.height),
    hold(subject.right + gap, subject.bottom - size.height),
    hold(subject.left - gap - size.width, subject.bottom - size.height),
    hold(subject.right - size.width, subject.bottom + gap),
    hold(subject.right - size.width, subject.top - gap - size.height)
  ];
  let best = { at: candidates[0], own: Number.POSITIVE_INFINITY, others: Number.POSITIVE_INFINITY };
  for (const at of candidates) {
    const box = { left: at.left, top: at.top, right: at.left + size.width, bottom: at.top + size.height };
    const own = overlap(box, subject);
    const others = avoid.reduce((sum, item) => sum + item.weight * overlap(box, item.box), 0);
    if (own < best.own || (own === best.own && others < best.others)) {
      best = { at, own, others };
    }
  }
  return best.at;
}

/** The area two boxes share. */
function overlap(a: ScreenBox, b: ScreenBox): number {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
}

/** The point a fraction of the way from one point to another. */
function along(a: Point2, b: Point2, t: number): Point2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** The convex hull of some points (Andrew's monotone chain). */
function convexHull(points: Point2[]): Point2[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) {
    return sorted;
  }
  const cross = (o: Point2, a: Point2, b: Point2): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Point2[]): Point2[] => {
    const chain: Point2[] = [];
    for (const p of list) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0) {
        chain.pop();
      }
      chain.push(p);
    }
    chain.pop();
    return chain;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

/** The value held within the bounds. */
export function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}
