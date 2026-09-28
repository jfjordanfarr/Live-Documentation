/**
 * The World Map's geometry: how big a piece is, where the board's edges are,
 * where a door sits on a wall, how a wire hangs between two doors, and where a
 * thing goes when nobody has placed it. Pure functions; the renderer draws
 * what they return.
 */

import { depthOf, facing, type Box, type Camera, type Pivot, type Point2, type Point3 } from "./projection";

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
export const SHAPE_WORDS: ReadonlySet<string> = new Set(["cube", "tile", "drum", "figure", "sheet", "cloud"]);

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

export function unitsToPixels(units: Point2): Point2 {
  return [units[0] * UNIT, units[1] * UNIT];
}

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

export function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}
