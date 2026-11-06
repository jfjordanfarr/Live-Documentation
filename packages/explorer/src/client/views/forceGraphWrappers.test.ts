import { describe, expect, it } from "vitest";

import { linkPulls, spatialNodeRadius, type SpatialLink } from "./forceGraphLayout";
import { spatialScope, startHops, startOf, type StartableNode } from "./forceGraphScope";
import { bodyShape } from "./forceGraphShells";
import { burstProgress, mergeWrappers, wrappedSeeds, wrapperAt, wrapperHull, wrapperPadding, type GroupShape, type WrapperHull } from "./forceGraphWrappers";
import { getDefaultTuning } from "../persistence/local-storage";

const tuning = getDefaultTuning().forceGraph;
const file = (id: string, symbols = 0): StartableNode => ({ id, publicSymbols: Array.from({ length: symbols }, (_, i) => `s${i}`), codeRelativePath: id });
const link = (source: string, target: string, count = 1): SpatialLink => ({ source, target, count, kind: "dependency" });

/** Three groups of several files, a pair, and two lone files: an archipelago with every kind of island. */
function archipelago(): { nodes: StartableNode[]; links: SpatialLink[] } {
  const nodes = ["a/hub.ts", "a/one.ts", "a/two.ts", "a/three.ts", "a/four.ts", "b/x.ts", "b/y.ts", "b/z.ts", "c/p.ts", "c/q.ts", "lone.ts", "other.ts"]
    .map((id, i) => file(id, i % 4));
  const links = [link("a/hub.ts", "a/one.ts", 3), link("a/hub.ts", "a/two.ts"), link("a/hub.ts", "a/three.ts", 2), link("a/three.ts", "a/four.ts"),
    link("b/x.ts", "b/y.ts"), link("b/y.ts", "b/z.ts"), link("c/p.ts", "c/q.ts")];
  return { nodes, links };
}

const pulls = (value: { kind?: string }): boolean => linkPulls(value, "connections");

/** The signed distance of a point beyond each of the hull's triangle planes, the largest of them; within the hull it is at most zero. */
function farthestBeyond(hull: WrapperHull, x: number, y: number, z: number): number {
  let worst = -Infinity;
  const p = hull.positions;
  for (let i = 0; i < hull.triangles.length; i += 3) {
    const a = 3 * hull.triangles[i], b = 3 * hull.triangles[i + 1], c = 3 * hull.triangles[i + 2];
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, length = Math.hypot(nx, ny, nz);
    if (length < 1e-9) continue;
    worst = Math.max(worst, (nx * (x - p[a]) + ny * (y - p[a + 1]) + nz * (z - p[a + 2])) / length);
  }
  return worst;
}

describe("which groups are wrapped", () => {
  it("is every group the scope shows only by its seed, of two files or more, at the archipelago and beside a pin", () => {
    const { nodes, links } = archipelago();
    const start = spatialScope(nodes, links, startOf(nodes, links, "connections", pulls), startHops("connections", tuning.hops), pulls);
    expect(wrappedSeeds(start.groups)).toEqual([...start.groups].filter(([, files]) => files >= 2).map(([seed]) => seed).sort());
    expect(wrappedSeeds(start.groups)).toEqual(["a/hub.ts", "b/y.ts", "c/p.ts"]);
    // The scope names each group's files with its count: what a wrapper is drawn around.
    expect([...start.groupFiles.keys()].sort()).toEqual([...start.groups.keys()].sort());
    for (const [seed, files] of start.groupFiles) expect(files.length, seed).toBe(start.groups.get(seed));
    expect(start.groupFiles.get("a/hub.ts")).toEqual(["a/four.ts", "a/hub.ts", "a/one.ts", "a/three.ts", "a/two.ts"]);
    // Pinned, a group grown by its hops is no longer wrapped; the groups the hops do not reach stay wrapped, a lone file never is.
    const pinned = spatialScope(nodes, links, new Set(["a/hub.ts"]), tuning.hops, pulls);
    expect(wrappedSeeds(pinned.groups)).toEqual(["b/y.ts", "c/p.ts"]);
    expect(pinned.groups.get("lone.ts")).toBe(1);
  });
});

describe("a group's hull", () => {
  const { nodes } = archipelago();
  const padding = wrapperPadding(tuning);
  // A group's wrapper is drawn over the phantom packing of its files about its seed (2026-11-05), no longer a hidden layout.
  const shape = bodyShape("a/hub.ts", nodes.filter(node => node.id.startsWith("a/")), tuning, padding, "a/hub.ts");
  const hull = wrapperHull(shape, padding);

  it("encloses every member's sphere with its padding", () => {
    for (const member of shape.members) {
      // A sphere lies within a convex hull when its centre is at least its radius inside every face's plane.
      expect(farthestBeyond(hull, member.x, member.y, member.z) + member.radius + padding, member.id).toBeLessThanOrEqual(1e-6);
    }
  });

  it("is a closed convex surface of at most 2V − 4 triangles, wound outward, with unit normals pointing out", () => {
    const vertices = hull.positions.length / 3, triangles = hull.triangles.length / 3;
    expect(vertices).toBeGreaterThanOrEqual(4);
    expect(triangles).toBeLessThanOrEqual(2 * vertices - 4);
    // A closed triangulated sphere has every edge in two triangles, once each way.
    const edges = new Map<string, number>();
    for (let i = 0; i < hull.triangles.length; i += 3) for (let k = 0; k < 3; k++) {
      const key = `${hull.triangles[i + k]}>${hull.triangles[i + (k + 1) % 3]}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
    for (const [key, count] of edges) { const [a, b] = key.split(">"); expect(count, key).toBe(1); expect(edges.get(`${b}>${a}`), key).toBe(1); }
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < hull.positions.length; i += 3) { cx += hull.positions[i]; cy += hull.positions[i + 1]; cz += hull.positions[i + 2]; }
    cx /= vertices; cy /= vertices; cz /= vertices;
    for (let i = 0; i < hull.positions.length; i += 3) {
      expect(Math.hypot(hull.normals[i], hull.normals[i + 1], hull.normals[i + 2])).toBeCloseTo(1, 9);
      expect(hull.normals[i] * (hull.positions[i] - cx) + hull.normals[i + 1] * (hull.positions[i + 1] - cy) + hull.normals[i + 2] * (hull.positions[i + 2] - cz)).toBeGreaterThan(0);
    }
    // The radius about the seed holds every vertex, and no more than the farthest.
    expect(Math.max(...Array.from({ length: vertices }, (_, i) => Math.hypot(hull.positions[3 * i], hull.positions[3 * i + 1], hull.positions[3 * i + 2])))).toBe(hull.radius);
  });

  it("is the same for the same shape", () => {
    expect(wrapperHull(shape, padding)).toEqual(hull);
  });

  it("is the hull of every member, though it is first taken over the outer ones alone", () => {
    // A body of 300 members, more than the first take: every member's padded sphere lies within the hull built.
    const many = Array.from({ length: 300 }, (_, i) => file(`m/${String(i).padStart(3, "0")}.ts`, i % 9));
    const body = bodyShape("m", many, tuning, padding);
    const wrapped = wrapperHull(body, padding);
    for (const member of body.members) expect(farthestBeyond(wrapped, member.x, member.y, member.z) + member.radius + padding, member.id).toBeLessThanOrEqual(1e-6);
    // A shape whose outer members leave room inside still holds a member that reaches past the first take's hull.
    const lopsided: GroupShape = { seed: "o", members: [...Array.from({ length: 70 }, (_, i) => ({ id: `r${i}`, x: 40 * Math.cos(i), y: 40 * Math.sin(i), z: (i % 7) - 3, radius: 4 })),
      { id: "far", x: 0, y: 0, z: 30, radius: 2 }] };
    const held = wrapperHull(lopsided, 2);
    expect(farthestBeyond(held, 0, 0, 30) + 2 + 2).toBeLessThanOrEqual(1e-6);
  });

  it("wraps a lone pair, and a single sphere, whole", () => {
    const pair: GroupShape = { seed: "p", members: [{ id: "p", x: 0, y: 0, z: 0, radius: 4 }, { id: "q", x: 30, y: 0, z: 0, radius: 6 }] };
    const wrapped = wrapperHull(pair, 2);
    expect(farthestBeyond(wrapped, 0, 0, 0) + 6).toBeLessThanOrEqual(1e-6);
    expect(farthestBeyond(wrapped, 30, 0, 0) + 8).toBeLessThanOrEqual(1e-6);
    expect(wrapped.triangles.length / 3).toBeLessThanOrEqual(2 * wrapped.positions.length / 3 - 4);
    expect(() => wrapperHull(pair, -1)).toThrow(/padding/);
  });
});

describe("the merged wrappers", () => {
  const { nodes, links } = archipelago();
  const padding = wrapperPadding(tuning);
  const start = spatialScope(nodes, links, startOf(nodes, links, "connections", pulls), startHops("connections", tuning.hops), pulls);
  const seeds = wrappedSeeds(start.groups);
  const groupOf = (seed: string): StartableNode[] => nodes.filter(node => node.id.split("/")[0] === seed.split("/")[0]);
  const hulls = new Map(seeds.map(seed => [seed, wrapperHull(bodyShape(seed, groupOf(seed), tuning, padding, seed), padding)]));
  const centres = new Map(seeds.map((seed, i) => [seed, { x: 400 * i, y: -50 * i, z: 10 }]));
  const geometry = mergeWrappers(seeds, seed => hulls.get(seed), seed => centres.get(seed));

  it("holds one group per wrapped seed, each vertex carrying its group, each hull centred on its seed's live position", () => {
    expect(geometry.ranges.map(range => range.seed)).toEqual(seeds);
    for (const range of geometry.ranges) {
      const hull = hulls.get(range.seed)!, centre = centres.get(range.seed)!;
      expect(range.vertexCount).toBe(hull.positions.length / 3);
      for (let v = range.vertexStart; v < range.vertexStart + range.vertexCount; v++) {
        expect(geometry.groups[v]).toBe(range.group);
        const from = 3 * (v - range.vertexStart);
        expect(geometry.positions[3 * v]).toBeCloseTo(centre.x + hull.positions[from], 3);
        expect(geometry.positions[3 * v + 2]).toBeCloseTo(centre.z + hull.positions[from + 2], 3);
        expect(geometry.local[3 * v]).toBeCloseTo(hull.positions[from] / hull.radius, 5);
        expect(Math.hypot(geometry.local[3 * v], geometry.local[3 * v + 1], geometry.local[3 * v + 2])).toBeLessThanOrEqual(1 + 1e-6);
      }
      for (let i = range.indexStart; i < range.indexStart + range.indexCount; i++) {
        expect(geometry.indices[i]).toBeGreaterThanOrEqual(range.vertexStart);
        expect(geometry.indices[i]).toBeLessThan(range.vertexStart + range.vertexCount);
      }
    }
    const triangles = geometry.indices.length / 3, vertices = geometry.positions.length / 3;
    expect(triangles).toBeLessThanOrEqual(2 * vertices - 4 * seeds.length);
  });

  it("is the same for the same groups and positions, and leaves out a seed with no hull or no position yet", () => {
    expect(mergeWrappers(seeds, seed => hulls.get(seed), seed => centres.get(seed))).toEqual(geometry);
    const partial = mergeWrappers(seeds, seed => seed === seeds[0] ? undefined : hulls.get(seed), seed => seed === seeds[2] ? { x: NaN, y: 0, z: 0 } : centres.get(seed));
    expect(partial.ranges.map(range => range.seed)).toEqual([seeds[1]]);
    expect(partial.ranges[0].group).toBe(0);
  });

  it("grows a bursting hull about its seed", () => {
    const grown = mergeWrappers(seeds, seed => hulls.get(seed), seed => centres.get(seed), seed => seed === seeds[1] ? 1.1 : 1);
    expect(grown.ranges[1].radius).toBeCloseTo(hulls.get(seeds[1])!.radius * 1.1, 6);
    const v = grown.ranges[1].vertexStart, centre = centres.get(seeds[1])!;
    expect(grown.positions[3 * v] - centre.x).toBeCloseTo(1.1 * (geometry.positions[3 * v] - centre.x), 2);
  });

  it("is picked where a ray meets it, nearest first, and missed beside it", () => {
    const [first, second] = geometry.ranges;
    // Looking down the x axis from far off: the first wrapper is met before the second, which lies beyond it on no common line.
    const ray = { x: first.centre.x - 2000, y: first.centre.y, z: first.centre.z };
    const hit = wrapperAt(geometry, ray, { x: 1, y: 0, z: 0 });
    expect(hit?.seed).toBe(first.seed);
    expect(hit!.distance).toBeGreaterThan(2000 - first.radius);
    expect(hit!.distance).toBeLessThan(2000);
    expect(wrapperAt(geometry, ray, { x: 1, y: 0, z: 0 }, seed => seed === first.seed)?.seed).not.toBe(first.seed);
    expect(wrapperAt(geometry, { x: second.centre.x, y: second.centre.y + 5000, z: second.centre.z }, { x: 0, y: -1, z: 0 })?.seed).toBe(second.seed);
    expect(wrapperAt(geometry, { x: 0, y: 99999, z: 0 }, { x: 1, y: 0, z: 0 })).toBeNull();
    // From inside a wrapper the ray meets its far side.
    expect(wrapperAt(geometry, first.centre, { x: 0, y: 0, z: 1 })?.seed).toBe(first.seed);
  });
});

describe("a burst", () => {
  it("runs from nothing to whole over its duration, and is whole at once under reduced motion", () => {
    expect(burstProgress(0, 250, false)).toBe(0);
    expect(burstProgress(125, 250, false)).toBeGreaterThan(0.5);
    expect(burstProgress(250, 250, false)).toBe(1);
    expect(burstProgress(900, 250, false)).toBe(1);
    expect(burstProgress(0, 250, true)).toBe(1);
  });
});

it("pads by the size of a file with no symbols", () => {
  expect(wrapperPadding(tuning)).toBe(1.5 * spatialNodeRadius(file("x"), { ...tuning, symbolScale: 0 }));
});
