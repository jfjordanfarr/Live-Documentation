/**
 * The World Map's camera.
 *
 * @remarks
 * An orthographic projection of a board seen from an azimuth and an elevation,
 * so that nothing changes size as the camera turns, and a pan-and-zoom applied
 * to the projected picture. Pure functions over numbers; the renderer applies
 * them to SVG. The board plane is z = 0 and z grows upward, off the board.
 */

/** Where the camera looks from: an azimuth about the pivot and an elevation above the board, in radians. */
export interface Camera {
  theta: number;
  phi: number;
}

/** The board point the camera turns about. */
export interface Pivot {
  x: number;
  y: number;
}

/** Pan and zoom applied to the projected picture, in screen pixels. */
export interface Screen {
  x: number;
  y: number;
  k: number;
}

/** The drawing surface's size in CSS pixels. */
export interface Viewport {
  width: number;
  height: number;
}

/** A point in the board's space: x and y on the plane, z above it. */
export type Point3 = [number, number, number];
/** A point on the board plane, or on the screen, in whichever units the caller says. */
export type Point2 = [number, number];

/** The elevation the board is seen at when nothing has moved it. */
export const REST_ELEVATION = Math.PI / 6;
/** The lowest the camera may go; below it the board is a line. */
export const MIN_ELEVATION = (8 * Math.PI) / 180;
/** Straight down: the board is a plain two-dimensional canvas. */
export const TOP_DOWN = Math.PI / 2;

const K = Math.SQRT1_2;

/** A board point turned about the pivot by the camera's azimuth. */
export function rotate(camera: Camera, pivot: Pivot, x: number, y: number): Point2 {
  const c = Math.cos(camera.theta);
  const s = Math.sin(camera.theta);
  const dx = x - pivot.x;
  const dy = y - pivot.y;
  return [pivot.x + dx * c - dy * s, pivot.y + dx * s + dy * c];
}

/** The inverse of {@link rotate}. */
export function unrotate(camera: Camera, pivot: Pivot, xr: number, yr: number): Point2 {
  const c = Math.cos(camera.theta);
  const s = Math.sin(camera.theta);
  const dx = xr - pivot.x;
  const dy = yr - pivot.y;
  return [pivot.x + dx * c + dy * s, pivot.y - dx * s + dy * c];
}

/** A board point, at height z, on the picture plane. */
export function project(camera: Camera, pivot: Pivot, x: number, y: number, z = 0): Point2 {
  const [xr, yr] = rotate(camera, pivot, x, y);
  return [(xr - yr) * K, (xr + yr) * K * Math.sin(camera.phi) - z * Math.cos(camera.phi)];
}

/** How near the camera a board point is; larger is nearer, so a larger depth draws later. */
export function depthOf(camera: Camera, pivot: Pivot, x: number, y: number, z = 0): number {
  const [xr, yr] = rotate(camera, pivot, x, y);
  return (xr + yr) * K * Math.cos(camera.phi) + z * Math.sin(camera.phi);
}

/** A picture-plane point back onto the board plane. */
export function unproject(camera: Camera, pivot: Pivot, px: number, py: number): Point2 {
  const u = px / K;
  const v = py / (K * Math.max(0.12, Math.sin(camera.phi)));
  return unrotate(camera, pivot, (u + v) / 2, (v - u) / 2);
}

/** A picture-plane point on the screen. */
export function toScreen(screen: Screen, point: Point2): Point2 {
  return [point[0] * screen.k + screen.x, point[1] * screen.k + screen.y];
}

/** A screen point on the picture plane. */
export function fromScreen(screen: Screen, sx: number, sy: number): Point2 {
  return [(sx - screen.x) / screen.k, (sy - screen.y) / screen.k];
}

/** The pan and zoom that shows every given board point with a margin, room for labels above and shadows below. */
export function fitScreen(camera: Camera, pivot: Pivot, corners: Point2[], viewport: Viewport, margin = 50, above = 70, below = 40): Screen {
  const points = corners.map(([x, y]) => project(camera, pivot, x, y, 0));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys) - above;
  const maxY = Math.max(...ys) + below;
  const k = Math.min((viewport.width - 2 * margin) / Math.max(1, maxX - minX), (viewport.height - 2 * margin) / Math.max(1, maxY - minY));
  return { k, x: viewport.width / 2 - (k * (minX + maxX)) / 2, y: viewport.height / 2 - (k * (minY + maxY)) / 2 };
}

/** The pan and zoom after zooming by a factor about a screen point, within limits. */
export function zoomAt(screen: Screen, factor: number, px: number, py: number, min = 0.2, max = 12): Screen {
  const k = Math.max(min, Math.min(max, screen.k * factor));
  const f = k / screen.k;
  return { k, x: px - (px - screen.x) * f, y: py - (py - screen.y) * f };
}

/** Whether the camera looks straight down. */
export function isTopDown(camera: Camera): boolean {
  return Math.abs(camera.phi - TOP_DOWN) < 0.02;
}

/** Whether the viewer sees a wall with this outward normal on the board plane. */
export function facing(camera: Camera, normal: Point2): number {
  const c = Math.cos(camera.theta);
  const s = Math.sin(camera.theta);
  return normal[0] * c - normal[1] * s + (normal[0] * s + normal[1] * c);
}

/** How light a face with this normal is, from a light that sits off the front-left of the board: 0 dark to 1 light. */
export function shade(camera: Camera, normal: Point3): number {
  if (normal[2] > 0.5) {
    return 1;
  }
  if (normal[2] < -0.5) {
    return 0.15;
  }
  const c = Math.cos(camera.theta);
  const s = Math.sin(camera.theta);
  const nx = normal[0] * c - normal[1] * s;
  const ny = normal[0] * s + normal[1] * c;
  return 0.5 + 0.3 * (nx * -0.8 + ny * 0.6);
}

/** A box on the board: its top-left corner, its footprint, the height it floats at and its own height. */
export interface Box {
  x: number;
  y: number;
  w: number;
  d: number;
  z0: number;
  h: number;
}

/** One face of a solid: its corners, its outward normal and its depth. */
export interface Face {
  points: Point3[];
  normal: Point3;
  depth: number;
}

/** The six faces of a box, sorted far to near, so that drawing them in order paints the visible ones last. */
export function cuboidFaces(camera: Camera, pivot: Pivot, box: Box): Face[] {
  const { x, y, w, d, z0 } = box;
  const X = x + w;
  const Y = y + d;
  const top = z0 + box.h;
  const faces: Face[] = [
    { points: [[x, y, z0], [X, y, z0], [X, Y, z0], [x, Y, z0]], normal: [0, 0, -1], depth: 0 },
    { points: [[x, y, z0], [X, y, z0], [X, y, top], [x, y, top]], normal: [0, -1, 0], depth: 0 },
    { points: [[X, y, z0], [X, Y, z0], [X, Y, top], [X, y, top]], normal: [1, 0, 0], depth: 0 },
    { points: [[X, Y, z0], [x, Y, z0], [x, Y, top], [X, Y, top]], normal: [0, 1, 0], depth: 0 },
    { points: [[x, Y, z0], [x, y, z0], [x, y, top], [x, Y, top]], normal: [-1, 0, 0], depth: 0 },
    { points: [[x, y, top], [X, y, top], [X, Y, top], [x, Y, top]], normal: [0, 0, 1], depth: 0 }
  ];
  for (const face of faces) {
    const center = face.points.reduce<Point3>((sum, p) => [sum[0] + p[0] / 4, sum[1] + p[1] / 4, sum[2] + p[2] / 4], [0, 0, 0]);
    face.depth = depthOf(camera, pivot, center[0], center[1], center[2]);
  }
  return faces.sort((a, b) => a.depth - b.depth);
}

/** The points of a circle on the board at a height, for a drum. */
export function ring(cx: number, cy: number, r: number, z: number, count = 40): Point3[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), z];
  });
}

/** A cubic Bezier through four points at a parameter. */
export function bezierAt(curve: [Point3, Point3, Point3, Point3], t: number): Point3 {
  const u = 1 - t;
  return [0, 1, 2].map((i) => u * u * u * curve[0][i] + 3 * u * u * t * curve[1][i] + 3 * u * t * t * curve[2][i] + t * t * t * curve[3][i]) as Point3;
}

/** Whether a point lies inside a polygon, by ray casting. */
export function pointInPolygon(polygon: Point2[], point: Point2): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** A smooth step from 0 to 1. */
export function smooth(t: number): number {
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
}
