import { describe, expect, it } from "vitest";

import { LEAF_SIZE, SphereOctree } from "./forceGraphOctree";

/** A generator of numbers in [0, 1) from a seed, the same on every machine. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
}

/** A cloud of spheres: uniform in a cube, with a few standing exactly at another's place. */
function cloud(count: number, seed: number, side = 400): { positions: Float64Array; radii: Float64Array } {
  const next = seeded(seed);
  const positions = Float64Array.from({ length: 3 * count }, () => (next() - 0.5) * side);
  const radii = Float64Array.from({ length: count }, () => 4 * Math.cbrt(1 + Math.floor(next() * 60)));
  for (let k = 1; k <= Math.min(5, count - 1); k++) positions.copyWithin(3 * (count - k), 0, 3);
  return { positions, radii };
}

/** Check every structural promise of a built tree against its spheres. */
function expectSound(tree: SphereOctree, positions: Float64Array): void {
  const n = tree.count;
  expect([...tree.order].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
  if (!n) { expect(tree.cellCount).toBe(0); return; }
  expect(tree.cellCount).toBeLessThan(Math.max(2, 2 * n));
  expect([tree.start[0], tree.end[0], tree.next[0]]).toEqual([0, n, tree.cellCount]);
  for (let c = 0; c < tree.cellCount; c++) {
    const from = tree.start[c], to = tree.end[c];
    expect(to).toBeGreaterThan(from);
    const bodies = Array.from(tree.order.subarray(from, to));
    const axis = (k: number): number[] => bodies.map(body => positions[3 * body + k]);
    expect([tree.lowX[c], tree.lowY[c], tree.lowZ[c]]).toEqual([0, 1, 2].map(k => Math.min(...axis(k))));
    expect([tree.highX[c], tree.highY[c], tree.highZ[c]]).toEqual([0, 1, 2].map(k => Math.max(...axis(k))));
    expect(tree.width[c]).toBe(Math.max(tree.highX[c] - tree.lowX[c], tree.highY[c] - tree.lowY[c], tree.highZ[c] - tree.lowZ[c]));
    expect(tree.largest[c]).toBe(Math.max(...bodies.map(body => tree.radii[body])));
    const centre = [tree.centreX[c], tree.centreY[c], tree.centreZ[c]];
    if (tree.width[c] === 0) expect(centre).toEqual([tree.lowX[c], tree.lowY[c], tree.lowZ[c]]);
    else [0, 1, 2].forEach(k => expect(centre[k]).toBeCloseTo(axis(k).reduce((sum, value) => sum + value, 0) / bodies.length, 9));
    if (tree.next[c] === c + 1) {
      // A leaf is small, or its spheres stand at one point.
      expect(to - from <= tree.leafSize || tree.width[c] === 0).toBe(true);
      continue;
    }
    // A split cell's children follow it, each after the last one's subtree, and share its run in order between them.
    const children: number[] = [];
    for (let child = c + 1; child < tree.next[c]; child = tree.next[child]) children.push(child);
    expect(children.length).toBeGreaterThanOrEqual(2);
    expect(tree.next[children[children.length - 1]]).toBe(tree.next[c]);
    expect(tree.start[children[0]]).toBe(from);
    children.forEach((child, k) => { if (k) expect(tree.start[child]).toBe(tree.end[children[k - 1]]); });
    expect(tree.end[children[children.length - 1]]).toBe(to);
  }
}

/** The spheres within reach of sphere i, as the field reckons a pair: the brute-force answer `touching` must give. */
function touchingByHand(positions: Float64Array, radii: Float64Array, i: number, gap: number): number[] {
  const found: number[] = [];
  for (let j = 0; j < radii.length; j++) {
    const dx = positions[3 * i] - positions[3 * j], dy = positions[3 * i + 1] - positions[3 * j + 1], dz = positions[3 * i + 2] - positions[3 * j + 2];
    const clearance = radii[i] + radii[j] + gap;
    if (dx * dx + dy * dy + dz * dz <= clearance * clearance) found.push(j);
  }
  return found;
}

const touchingOf = (tree: SphereOctree, positions: Float64Array, i: number, gap: number): number[] => {
  const found = new Int32Array(tree.count);
  const count = tree.touching(positions[3 * i], positions[3 * i + 1], positions[3 * i + 2], tree.radii[i], gap, found);
  return Array.from(found.subarray(0, count)).sort((a, b) => a - b);
};

describe("the octree over the 3D picture's spheres", () => {
  it("holds every sphere once, in cells nested depth first, each with its spheres' box, centre, width and largest radius", () => {
    for (const leafSize of [1, 3, LEAF_SIZE]) {
      const { positions, radii } = cloud(700, leafSize);
      const tree = new SphereOctree(radii, leafSize);
      tree.build(positions);
      expectSound(tree, positions);
      // Built again over moved spheres, the same buffers hold the new tree.
      const moved = positions.map((value, k) => value + 30 * Math.sin(k));
      tree.build(moved);
      expectSound(tree, moved);
    }
  });

  it("finds every sphere a sphere could touch, and no other, as the field reckons a pair", () => {
    const { positions, radii } = cloud(600, 9, 250);
    // One sphere far larger than the rest, the shape that made a search by the largest radius slow at the T3 seed.
    radii[17] = 70;
    const tree = new SphereOctree(radii);
    tree.build(positions);
    for (const gap of [0, 2, 5]) {
      for (let i = 0; i < radii.length; i += 7) expect(touchingOf(tree, positions, i, gap)).toEqual(touchingByHand(positions, radii, i, gap));
      expect(touchingOf(tree, positions, 17, gap)).toEqual(touchingByHand(positions, radii, 17, gap));
    }
  });

  it("keeps its cells while the outermost sphere moves within the same grid, so that a picture coming to rest keeps its tree", () => {
    // A cloud within a hundred units of the origin and one sphere far out, alone in its cell beyond the grid's plane at
    // 128, moved forty units further: a grid about the spheres' own bounds would move every plane twenty units with it.
    const { positions: cloudPlaces, radii } = cloud(500, 4, 200);
    const positions = Float64Array.from([...cloudPlaces, 200, 10, 10]), all = Float64Array.from([...radii, 4]);
    const tree = new SphereOctree(all);
    tree.build(positions);
    const before = { order: Array.from(tree.order), start: Array.from(tree.start.subarray(0, tree.cellCount)), next: Array.from(tree.next.subarray(0, tree.cellCount)) };
    const moved = Float64Array.from(positions);
    moved[3 * 500] = 240;
    tree.build(moved);
    expectSound(tree, moved);
    expect({ order: Array.from(tree.order), start: Array.from(tree.start.subarray(0, tree.cellCount)), next: Array.from(tree.next.subarray(0, tree.cellCount)) }).toEqual(before);
  });

  it("does not split spheres that stand at one point, alone or inside a larger cloud", () => {
    const together = new SphereOctree(new Float64Array(40).fill(4));
    const point = Float64Array.from({ length: 120 }, (_, k) => [0.1, -7, 1e5][k % 3]);
    together.build(point);
    expectSound(together, point);
    expect(together.cellCount).toBe(1);
    expect([together.width[0], together.centreX[0], together.centreY[0], together.centreZ[0]]).toEqual([0, 0.1, -7, 1e5]);
    const { positions, radii } = cloud(400, 5);
    const crowd = [3, 50, 51, 52, 399];
    for (const body of crowd) positions.set([12.5, -3.25, 40], 3 * body);
    const tree = new SphereOctree(radii);
    tree.build(positions);
    expectSound(tree, positions);
    const leafOf = (body: number): number => {
      const at = tree.order.indexOf(body);
      for (let c = 0; c < tree.cellCount; c++) if (tree.next[c] === c + 1 && tree.start[c] <= at && at < tree.end[c]) return c;
      return -1;
    };
    expect(new Set(crowd.map(leafOf)).size).toBe(1);
    expect(touchingOf(tree, positions, 50, 0)).toEqual(touchingByHand(positions, radii, 50, 0));
  });

  it("splits spheres along a line, and holds one sphere and none", () => {
    const line = new SphereOctree(new Float64Array(300).fill(2), 2);
    const along = Float64Array.from({ length: 900 }, (_, k) => k % 3 === 0 ? (k / 3) * 1.5 - 200 : k % 3 === 1 ? 7 : -3);
    line.build(along);
    expectSound(line, along);
    for (let i = 0; i < 300; i += 13) expect(touchingOf(line, along, i, 1)).toEqual(touchingByHand(along, line.radii, i, 1));
    const one = new SphereOctree(Float64Array.from([3]));
    one.build(Float64Array.from([5, 6, 7]));
    expectSound(one, Float64Array.from([5, 6, 7]));
    expect(one.cellCount).toBe(1);
    const none = new SphereOctree(new Float64Array(0));
    none.build(new Float64Array(0));
    expect(none.cellCount).toBe(0);
  });

  it("refuses what it cannot hold", () => {
    expect(() => new SphereOctree(Float64Array.from([1, NaN]))).toThrow("radii");
    expect(() => new SphereOctree(Float64Array.from([1]), 0)).toThrow("at least one");
    const tree = new SphereOctree(Float64Array.from([1, 1]));
    expect(() => tree.build(new Float64Array(3))).toThrow("three numbers");
    expect(() => tree.build(Float64Array.from([0, 0, 0, Infinity, 0, 0]))).toThrow("finite positions");
  });
});
