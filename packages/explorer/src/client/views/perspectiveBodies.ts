import { Matrix4, Vector4, type Camera } from "three";

import { projectSphereSurface } from "./containedSphere";
import type { TransitionPoint } from "./perspectiveGeometry";

/** A copied mesh and transform from the last submitted spatial picture. */
export interface FrozenBodyMesh {
  positions: Float32Array;
  indices: Uint32Array;
  matrix: readonly number[];
}

/** One actually submitted interior instance; hidden contents are never reconstructed. */
export interface FrozenBodyUnit extends FrozenBodyMesh {
  /** Parameters of an analytic GPU primitive; its submitted quad corners are not its surface. */
  primitive?: { kind: "sphere"; radius: number };
  /** Native front-sided surfaces must not acquire a filled clipped cap in the carrier. */
  frontSide?: boolean;
  id: string;
  kind: "file" | "directory" | "body";
  color: string;
  alpha: number;
  veiled: boolean;
  order: number;
  depth?: number;
  parent?: string;
}

/** A submitted skin and only the interior marks its drawn budget allowed. */
export interface FrozenSpatialBody extends FrozenBodyMesh {
  id: string;
  kind: "skin" | "balloon";
  look: "skin" | "cloud" | "cloud-rim";
  hovered: boolean;
  center: { x: number; y: number; z: number };
  alpha: number;
  order: number;
  units: FrozenBodyUnit[];
}

/** A frozen projection in CSS pixels, each outline relative to the body's projected center. */
export interface SceneBody {
  kind: FrozenSpatialBody["kind"];
  look: FrozenSpatialBody["look"];
  hovered: boolean;
  x: number;
  y: number;
  boundary: TransitionPoint[];
  alpha: number;
  order: number;
  units: Array<Pick<FrozenBodyUnit, "id" | "kind" | "color" | "alpha" | "veiled" | "order" | "depth" | "parent"> & { boundary: TransitionPoint[]; polygons?: TransitionPoint[][] }>;
}

type ClipPoint = [number, number, number, number];

/** The convex silhouette of already projected geometry; this places no graph object. */
function outline(points: TransitionPoint[]): TransitionPoint[] {
  const sorted = points.sort((a, b) => a.x - b.x || a.y - b.y)
    .filter((point, index, all) => !index || point.x !== all[index - 1].x || point.y !== all[index - 1].y);
  if (sorted.length < 3) return [];
  const cross = (a: TransitionPoint, b: TransitionPoint, c: TransitionPoint): number =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const half = (input: TransitionPoint[]): TransitionPoint[] => {
    const result: TransitionPoint[] = [];
    for (const point of input) {
      while (result.length > 1 && cross(result[result.length - 2], result[result.length - 1], point) <= 0) result.pop();
      result.push(point);
    }
    return result;
  };
  return [...half(sorted).slice(0, -1), ...half([...sorted].reverse()).slice(0, -1)];
}

/** Clip the actual triangles before dividing by w, including a skin that crosses the camera's near plane. Side clipping is left to the moving canvas. */
function projectMesh(mesh: FrozenBodyMesh, camera: Matrix4, width: number, height: number, frontSide = false): {
  boundary: TransitionPoint[]; polygons?: TransitionPoint[][];
} {
  const transform = camera.clone().multiply(new Matrix4().fromArray(mesh.matrix));
  const point = new Vector4();
  const clips: ClipPoint[] = [];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    point.set(mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2], 1).applyMatrix4(transform);
    clips.push([point.x, point.y, point.z, point.w]);
  }
  if (clips.some(vertex => !vertex.every(Number.isFinite))) return { boundary: [] };
  const distance = (vertex: ClipPoint, plane: number): number => vertex[3] + (plane % 2 ? -1 : 1) * vertex[Math.floor(plane / 2)];
  const pixels = (polygon: ClipPoint[]): TransitionPoint[] => polygon.filter(vertex => vertex[3] > 0).map(vertex => ({
    x: (vertex[0] / vertex[3] + 1) * width / 2, y: (1 - vertex[1] / vertex[3]) * height / 2
  })).filter(vertex => Number.isFinite(vertex.x) && Number.isFinite(vertex.y));
  const inside = clips.every(vertex => distance(vertex, 4) >= 0 && distance(vertex, 5) >= 0);
  // An uncut convex native sphere has its ordinary silhouette; only cut surfaces need their actual front polygons.
  if (inside) return { boundary: outline(pixels(clips)) };
  const projected: TransitionPoint[] = [], polygons: TransitionPoint[][] = [];
  for (let i = 0; i < mesh.indices.length; i += 3) {
    let polygon = [clips[mesh.indices[i]], clips[mesh.indices[i + 1]], clips[mesh.indices[i + 2]]];
    if (polygon.some(vertex => !vertex)) continue;
    for (const plane of [4, 5]) {
      if (!polygon.length) break;
      const clipped: ClipPoint[] = [];
      for (let edge = 0; edge < polygon.length; edge++) {
        const a = polygon[edge], b = polygon[(edge + 1) % polygon.length];
        const da = distance(a, plane), db = distance(b, plane);
        if (da >= 0) clipped.push(a);
        if ((da < 0) !== (db < 0)) {
          const t = da / (da - db);
          clipped.push(a.map((value, axis) => value + t * (b[axis] - value)) as ClipPoint);
        }
      }
      polygon = clipped;
    }
    const surface = pixels(polygon);
    if (frontSide) {
      // Canvas y is reversed: the uploaded counterclockwise front face has negative signed screen area.
      const area = surface.reduce((sum, a, index) => { const b = surface[(index + 1) % surface.length]; return sum + a.x * b.y - b.x * a.y; }, 0);
      if (area >= 0) continue;
      polygons.push(surface);
    }
    projected.push(...surface);
  }
  return { boundary: outline(projected), ...(frontSide ? { polygons } : {}) };
}

/** Project submitted geometry once; animation only translates the frozen outlines. */
export function projectSpatialBodies(bodies: readonly FrozenSpatialBody[], camera: Camera, width: number, height: number): Map<string, SceneBody> {
  const projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const result = new Map<string, SceneBody>();
  for (const body of bodies) {
    const boundary = projectMesh(body, projection, width, height).boundary;
    if (!boundary.length) continue;
    const center = new Vector4(body.center.x, body.center.y, body.center.z, 1).applyMatrix4(projection);
    const x = center.w > 0 && Number.isFinite(center.x / center.w) ? (center.x / center.w + 1) * width / 2
      : (Math.min(...boundary.map(point => point.x)) + Math.max(...boundary.map(point => point.x))) / 2;
    const y = center.w > 0 && Number.isFinite(center.y / center.w) ? (1 - center.y / center.w) * height / 2
      : (Math.min(...boundary.map(point => point.y)) + Math.max(...boundary.map(point => point.y))) / 2;
    const relative = (points: TransitionPoint[]): TransitionPoint[] => points.map(point => ({ x: point.x - x, y: point.y - y }));
    result.set(body.id, { x, y, kind: body.kind, look: body.look, hovered: body.hovered, boundary: relative(boundary), alpha: body.alpha, order: body.order,
      units: body.units.flatMap(unit => {
        const surface = unit.primitive?.kind === "sphere" ? projectSphereSurface(unit.matrix, unit.primitive.radius, camera, width, height)
          : projectMesh(unit, projection, width, height, unit.frontSide);
        const projected = unit.primitive ? outline(surface.boundary) : surface.boundary;
        if (!projected.length) return [];
        return [{ id: unit.id, kind: unit.kind, color: unit.color, alpha: unit.alpha, veiled: unit.veiled, order: unit.order,
          depth: unit.depth, parent: unit.parent, boundary: relative(projected), ...(surface?.polygons ? { polygons: surface.polygons.map(relative) } : {}) }];
      }) });
  }
  return result;
}
