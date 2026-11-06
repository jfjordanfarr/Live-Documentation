/**
 * Wrappers in the 3D Local Map, the experiment behind the tuning's Group Wrappers (2026-11-05): a padded hull drawn over
 * many files the picture does not show, so that they read as one shape a click can pop open and the files then fill.
 * The owner proposed a mesh "which shrink-wraps the shape of the cluster it engulfs" on November 4 ([Turn 16 of the
 * November 3 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-16--november-4))
 * and asked to push it forward on November 5 ([Turn 10](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)).
 * Two things are wrapped: every disconnected group the picture shows only by its seed, its wrapper centred on the seed,
 * and, since experiment 2 of that day, the directory shells inside the groups it shows in part (`forceGraphShells.ts`),
 * each a body of its own. Both are drawn over a phantom packing of their files inside a body sized by their count, not
 * over a layout: experiment 1 laid every wrapped group out hidden, which cost a second and a half before this
 * repository's first picture, and the owner's correction of Turn 11 asked for wrappers inside the connected structure.
 *
 * A convex hull bridges the hollows between members: it is an outer envelope, not a concave shrink-wrap. It encloses
 * every member's sphere padded by `padding`, each sphere stood in for by a geodesic polyhedron whose inscribed sphere is
 * the padded sphere, so that the hull of the polyhedra holds the spheres whole.
 *
 * Pure-function module: no DOM, no GPU. The page draws and picks what these functions build.
 */

import { Vector3 } from "three";
import { ConvexHull } from "three/addons/math/ConvexHull.js";

import type { ForceGraphTuning } from "../types";
export { GROUP_WRAPPERS, type GroupWrappers } from "../types";
import type { Placed } from "./forceGraphLayout";

/** The seeds of the groups wrapped: those the scope shows only by their seed, of two files or more, in id order. */
export function wrappedSeeds(groups: ReadonlyMap<string, number>): string[] {
  return [...groups].filter(([, files]) => files >= 2).map(([seed]) => seed).sort();
}

/** One member of a wrapped body: where it stands relative to the body's centre, and its sphere's radius. */
export interface GroupMember extends Placed {
  id: string;
  radius: number;
}

/** A wrapped body's members, each relative to its centre: a group's seed, or a shell's own place. */
export interface GroupShape {
  seed: string;
  members: GroupMember[];
  /**
   * The spheres the hull is taken over, when not the members: a directory shell's subdirectories, each the ball that holds
   * its files, so that a shell of thousands is wrapped at the cost of its few subdirectories (the T3 sample's largest
   * shell, 13,095 files, took 114 ms to wrap over its files, measured 2026-11-05).
   */
  outline?: GroupMember[];
}

/** The space a wrapper keeps around each member's sphere: one and a half times the radius of a file with no symbols. */
export function wrapperPadding(tuning: Pick<ForceGraphTuning, "nodeSize">): number {
  return 1.5 * tuning.nodeSize;
}

/** A group's hull, relative to its seed: vertex positions and smooth normals, its triangles, and the radius from the seed that holds it. */
export interface WrapperHull {
  seed: string;
  positions: Float64Array;
  normals: Float64Array;
  triangles: Uint32Array;
  /** The largest distance from the seed to any vertex: a sphere about the seed this large holds the whole wrapper. */
  radius: number;
}

/**
 * The unit geodesic polyhedron a sphere is stood in for: an icosahedron with each face split in four, its 42 vertices on
 * the unit sphere, and the radius of its inscribed sphere, the nearest of its faces' planes to the centre.
 */
const GEODESIC = ((): { points: number[][]; inradius: number } => {
  const t = (1 + Math.sqrt(5)) / 2;
  const points = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]]
    .map(point => { const length = Math.hypot(point[0], point[1], point[2]); return point.map(value => value / length); });
  const faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const middle = new Map<string, number>();
  const mid = (a: number, b: number): number => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    let found = middle.get(key);
    if (found === undefined) {
      const sum = [0, 1, 2].map(k => points[a][k] + points[b][k]), length = Math.hypot(sum[0], sum[1], sum[2]);
      found = points.push(sum.map(value => value / length)) - 1;
      middle.set(key, found);
    }
    return found;
  };
  const split: number[][] = [];
  for (const [a, b, c] of faces) { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); split.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); }
  let inradius = Infinity;
  for (const [a, b, c] of split) {
    const [pa, pb, pc] = [points[a], points[b], points[c]];
    const u = [0, 1, 2].map(k => pb[k] - pa[k]), v = [0, 1, 2].map(k => pc[k] - pa[k]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], length = Math.hypot(n[0], n[1], n[2]);
    inradius = Math.min(inradius, Math.abs(n[0] * pa[0] + n[1] * pa[1] + n[2] * pa[2]) / length);
  }
  return { points, inradius };
})();

/** How many of a body's farthest-reaching members its hull is first taken over. */
const OUTER_MEMBERS = 64;

/**
 * The convex hull of a body's padded spheres, relative to its centre. Each vertex's normal is the area-weighted mean of
 * its triangles' outward normals, so that the hull shades as one smooth surface. Triangles wind outward.
 */
export function wrapperHull(shape: GroupShape, padding: number): WrapperHull {
  if (!(Number.isFinite(padding) && padding >= 0)) throw new Error("A wrapper's padding must be a finite, nonnegative length.");
  // Only the outer members shape the hull. Each member's polyhedron lies within a ball about the centre of its distance
  // plus its reach; the hull of the farthest-reaching members is taken, and while any member's ball might leave it, more
  // are added and the hull taken again, so that the hull is that of every member at the cost of those on its outside.
  const reaches = (shape.outline ?? shape.members).map(member => {
    const reach = (member.radius + padding) / GEODESIC.inradius;
    return { member, reach, extent: Math.hypot(member.x, member.y, member.z) + reach };
  }).sort((a, b) => b.extent - a.extent);
  let taken = Math.min(reaches.length, OUTER_MEMBERS), hull: ConvexHull;
  for (;;) {
    const points: Vector3[] = [];
    for (const { member, reach } of reaches.slice(0, taken)) {
      for (const [x, y, z] of GEODESIC.points) points.push(new Vector3(member.x + x * reach, member.y + y * reach, member.z + z * reach));
    }
    hull = new ConvexHull().setFromPoints(points);
    if (taken === reaches.length) break;
    // The nearest face plane to the centre: a ball about the centre no larger lies inside the hull.
    let inside = Infinity;
    for (const face of hull.faces) inside = Math.min(inside, face.normal.dot(face.midpoint));
    let more = taken;
    while (more < reaches.length && reaches[more].extent > inside) more++;
    if (more === taken) break;
    taken = Math.min(reaches.length, Math.max(more, 2 * taken));
  }
  const index = new Map<Vector3, number>();
  const corners: number[] = [];
  const triangles: number[] = [];
  const vertexOf = (point: Vector3): number => {
    let at = index.get(point);
    if (at === undefined) { at = corners.length / 3; index.set(point, at); corners.push(point.x, point.y, point.z); }
    return at;
  };
  for (const face of hull.faces) {
    const loop: number[] = [];
    let edge = face.edge;
    do { loop.push(vertexOf(edge.head().point)); edge = edge.next; } while (edge !== face.edge);
    for (let i = 1; i + 1 < loop.length; i++) triangles.push(loop[0], loop[i], loop[i + 1]);
  }
  const positions = Float64Array.from(corners);
  const normals = new Float64Array(positions.length);
  for (let i = 0; i < triangles.length; i += 3) {
    const a = 3 * triangles[i], b = 3 * triangles[i + 1], c = 3 * triangles[i + 2];
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    // The cross product's length is twice the triangle's area: summing it weights each triangle by its area.
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const at of [a, b, c]) { normals[at] += nx; normals[at + 1] += ny; normals[at + 2] += nz; }
  }
  let radius = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= length; normals[i + 1] /= length; normals[i + 2] /= length;
    radius = Math.max(radius, Math.hypot(positions[i], positions[i + 1], positions[i + 2]));
  }
  return { seed: shape.seed, positions, normals, triangles: Uint32Array.from(triangles), radius };
}

/** Where one group stands in the merged geometry. */
export interface WrapperRange {
  seed: string;
  /** The group's index, which every one of its vertices carries. */
  group: number;
  vertexStart: number;
  vertexCount: number;
  indexStart: number;
  indexCount: number;
  centre: Placed;
  radius: number;
}

/** Every wrapper in one geometry: world positions, normals, each vertex's group and its seed-relative position, and the triangles. */
export interface WrapperGeometry {
  positions: Float32Array;
  normals: Float32Array;
  /**
   * Each vertex's position relative to its seed in units of its hull's radius, within the unit sphere: for a material
   * whose pattern should travel with the group and span a small wrapper as it spans a large one.
   */
  local: Float32Array;
  groups: Float32Array;
  indices: Uint32Array;
  ranges: WrapperRange[];
}

/**
 * Merge the hulls of the groups wrapped into one geometry, each centred on its seed's live position: the wrappers are the
 * seeds `wrappedSeeds` names, each drawn when its hull and its seed's position are known, in the seeds' order. `scale`
 * grows a group's hull about its seed, as a pop does (one when absent).
 */
export function mergeWrappers(seeds: readonly string[], hullOf: (seed: string) => WrapperHull | undefined, centreOf: (seed: string) => Placed | undefined,
  scaleOf: (seed: string) => number = () => 1): WrapperGeometry {
  const drawn: Array<{ seed: string; hull: WrapperHull; centre: Placed; scale: number }> = [];
  let vertices = 0, indices = 0;
  for (const seed of seeds) {
    const hull = hullOf(seed), centre = centreOf(seed);
    if (!hull || !centre || ![centre.x, centre.y, centre.z].every(Number.isFinite)) continue;
    // The place is copied: a caller may hand the same object back for every seed.
    drawn.push({ seed, hull, centre: { x: centre.x, y: centre.y, z: centre.z }, scale: scaleOf(seed) });
    vertices += hull.positions.length / 3; indices += hull.triangles.length;
  }
  const geometry: WrapperGeometry = { positions: new Float32Array(3 * vertices), normals: new Float32Array(3 * vertices), local: new Float32Array(3 * vertices),
    groups: new Float32Array(vertices), indices: new Uint32Array(indices), ranges: [] };
  let vertex = 0, index = 0;
  drawn.forEach(({ seed, hull, centre, scale }, group) => {
    const count = hull.positions.length / 3;
    for (let i = 0; i < count; i++) {
      const from = 3 * i, to = 3 * (vertex + i);
      geometry.positions[to] = centre.x + hull.positions[from] * scale;
      geometry.positions[to + 1] = centre.y + hull.positions[from + 1] * scale;
      geometry.positions[to + 2] = centre.z + hull.positions[from + 2] * scale;
      const unit = hull.radius > 0 ? 1 / hull.radius : 0;
      geometry.local[to] = hull.positions[from] * unit; geometry.local[to + 1] = hull.positions[from + 1] * unit; geometry.local[to + 2] = hull.positions[from + 2] * unit;
      geometry.normals[to] = hull.normals[from]; geometry.normals[to + 1] = hull.normals[from + 1]; geometry.normals[to + 2] = hull.normals[from + 2];
      geometry.groups[vertex + i] = group;
    }
    for (let i = 0; i < hull.triangles.length; i++) geometry.indices[index + i] = vertex + hull.triangles[i];
    geometry.ranges.push({ seed, group, vertexStart: vertex, vertexCount: count, indexStart: index, indexCount: hull.triangles.length,
      centre, radius: hull.radius * scale });
    vertex += count; index += hull.triangles.length;
  });
  return geometry;
}

/**
 * The nearest wrapper a ray meets, and how far along the ray: each group's bounding sphere first, then its triangles,
 * either side, as the wrappers are drawn double-sided. `skip` leaves a group out, as one bursting open is.
 */
export function wrapperAt(geometry: WrapperGeometry, origin: Placed, direction: Placed, skip: (seed: string) => boolean = () => false): { seed: string; distance: number } | null {
  const { positions, indices } = geometry;
  const length = Math.hypot(direction.x, direction.y, direction.z);
  if (!(length > 0)) return null;
  const dx = direction.x / length, dy = direction.y / length, dz = direction.z / length;
  let best: { seed: string; distance: number } | null = null;
  for (const range of geometry.ranges) {
    if (skip(range.seed)) continue;
    // The bounding sphere: the ray's nearest approach to the seed must come within the hull's radius.
    const ox = range.centre.x - origin.x, oy = range.centre.y - origin.y, oz = range.centre.z - origin.z;
    const along = ox * dx + oy * dy + oz * dz;
    if (ox * ox + oy * oy + oz * oz - along * along > range.radius * range.radius) continue;
    if (along + range.radius < 0) continue;
    for (let i = range.indexStart; i < range.indexStart + range.indexCount; i += 3) {
      const a = 3 * indices[i], b = 3 * indices[i + 1], c = 3 * indices[i + 2];
      // Möller and Trumbore's ray-triangle intersection.
      const e1x = positions[b] - positions[a], e1y = positions[b + 1] - positions[a + 1], e1z = positions[b + 2] - positions[a + 2];
      const e2x = positions[c] - positions[a], e2y = positions[c + 1] - positions[a + 1], e2z = positions[c + 2] - positions[a + 2];
      const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < 1e-12) continue;
      const inverse = 1 / det;
      const tx = origin.x - positions[a], ty = origin.y - positions[a + 1], tz = origin.z - positions[a + 2];
      const u = (tx * px + ty * py + tz * pz) * inverse;
      if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
      const v = (dx * qx + dy * qy + dz * qz) * inverse;
      if (v < 0 || u + v > 1) continue;
      const distance = (e2x * qx + e2y * qy + e2z * qz) * inverse;
      if (distance > 0 && (!best || distance < best.distance)) best = { seed: range.seed, distance };
    }
  }
  return best;
}

/**
 * How far a wrapper has burst open `elapsed` milliseconds after its pop: from zero to one over `duration`, eased out, so
 * that it grows by a tenth and fades as the files fill it; at once under reduced motion.
 */
export function burstProgress(elapsed: number, duration: number, reducedMotion: boolean): number {
  if (reducedMotion || !(duration > 0)) return 1;
  const t = Math.max(0, Math.min(1, elapsed / duration));
  return 1 - Math.pow(1 - t, 2);
}

/** How long a wrapper takes to burst open, and how much it grows as it does. */
export const BURST = { duration: 250, growth: 0.1 } as const;
