import { forceLink, forceSimulation } from "d3-force-3d";
import { describe, expect, it } from "vitest";

import { applyLayoutPreset } from "../layout-presets";
import { easeSpatialLayout, linkPulls, motionForce, placeNewSpheres, QUIET_TICKS, seededDirection, spatialFieldOf, spatialLinkDistance, spatialNodeRadius, spatialNodeValue, springStrength, symbolCountOf, type PlaceableNode, type SpatialLink, type SpatialNode } from "./forceGraphLayout";
import { diagonalOf } from "./forceGraphPhysics";
import { getDefaultTuning } from "../persistence/local-storage";
import type { ForceGraphTuning } from "../types";

const node = (id: string, symbols: number): SpatialNode => ({ id, publicSymbols: Array.from({ length: symbols }, (_, index) => `symbol${index}`) });
const separation = (nodes: SpatialNode[]): number => Math.hypot(nodes[0].x! - nodes[1].x!, nodes[0].y! - nodes[1].y!, nodes[0].z! - nodes[1].z!);
const distance = (a: { x?: number; y?: number; z?: number }, b: { x?: number; y?: number; z?: number }): number => Math.hypot(a.x! - b.x!, a.y! - b.y!, a.z! - b.z!);
const placesOf = (nodes: readonly SpatialNode[]): number[][] => nodes.map(file => [file.x!, file.y!, file.z!]);
const sizeOf = (nodes: readonly SpatialNode[]): number => diagonalOf(Float64Array.from(placesOf(nodes).flat()));

/** Two clusters that never reference each other, a test file in each. */
const files = ["a/one", "a/two", "a/one.test", "b/three", "b/four", "b/three.test"].map(id => node(id, 1));
const links: SpatialLink[] = [
  { source: "a/one", target: "a/two", count: 1 }, { source: "a/one.test", target: "a/one", count: 1 },
  { source: "b/three", target: "b/four", count: 1 }, { source: "b/three.test", target: "b/three", count: 1 }
];
const isTest = (file: SpatialNode): boolean => file.id.endsWith(".test");
const untested = links.filter(link => !String(link.source).endsWith(".test"));

describe("spatial layout grammar", () => {
  it("maps exposed symbols to volume, with visible zero-symbol files and stable sizes between packing presets", () => {
    const relaxed = getDefaultTuning();
    const compact = applyLayoutPreset(relaxed, "compact");
    expect(spatialNodeRadius(node("zero", 0), relaxed.forceGraph)).toBe(4);
    expect(spatialNodeRadius(node("seven", 7), relaxed.forceGraph)).toBe(8);
    expect(spatialNodeRadius(node("many", 63), relaxed.forceGraph)).toBe(16);
    expect(spatialNodeRadius(node("many", 63), compact.forceGraph)).toBe(16);
  });

  it("gives a directory hub the volume of its members, so that size is exposed surface at every scale", () => {
    const tuning = getDefaultTuning().forceGraph;
    const hub: SpatialNode = { id: "directory:a", publicSymbols: [], containedSymbolCounts: [0, 7, 63] };
    expect(spatialNodeValue(hub, tuning)).toBe(1 + 8 + 64);
    expect(spatialNodeValue(hub, tuning)).toBe([0, 7, 63].reduce((sum, count) => sum + spatialNodeValue(node("file", count), tuning), 0));
    expect(spatialNodeRadius(hub, tuning)).toBeCloseTo(4 * Math.cbrt(73));
    expect(spatialNodeValue(hub, { ...tuning, symbolScale: 0 })).toBe(3);
    expect(spatialNodeValue({ ...hub, containedSymbolCounts: [] }, tuning)).toBe(1);
  });

  it("sizes a sphere whose count cannot be read as one with no symbols, so that a bad history file cannot stop the motion", () => {
    // The no-network spec feeds the page a history whose count is markup; the field refuses a radius that is not a number.
    const tuning = getDefaultTuning().forceGraph;
    for (const bad of [Number.NaN, -3, Number.POSITIVE_INFINITY, "<b>3</b>" as unknown as number]) {
      expect(symbolCountOf({ publicSymbols: ["a"], symbolCount: bad })).toBe(0);
      expect(spatialNodeRadius({ id: "x", publicSymbols: [], symbolCount: bad }, tuning)).toBe(tuning.nodeSize);
    }
    expect(symbolCountOf({ publicSymbols: ["a", "b"] })).toBe(2);
    expect(symbolCountOf({ publicSymbols: [], symbolCount: 5 })).toBe(5);
  });

  it("uses a diminishing surface gap and incorporates both endpoint radii", () => {
    const tuning = getDefaultTuning().forceGraph;
    const source = node("a", 0), target = node("b", 7);
    const distance = (count: number) => spatialLinkDistance({ source, target, count }, tuning);
    expect(distance(1)).toBe(12 + tuning.linkGap);
    expect(distance(2)).toBe(12 + tuning.linkGap / 2);
    expect(distance(4)).toBe(12 + tuning.linkGap / 3);
    expect(distance(2) - distance(4)).toBeLessThan(distance(1) - distance(2));
    expect(spatialLinkDistance({ source, target, count: 50 }, { ...tuning, coupling: 0 })).toBe(distance(1));
    expect(spatialLinkDistance({ source, target, count: 500 }, { ...tuning, linkGap: 8, coupling: 3, collisionGap: 20 })).toBe(32);
  });

  it("pulls by the links that pull in a layout alone, and still ends every link on its two spheres", () => {
    const containment: SpatialLink[] = [
      { source: "directory:", target: "a", count: 1, kind: "containment" },
      { source: "directory:", target: "b", count: 1, kind: "containment" }
    ];
    const reference: SpatialLink = { source: "a", target: "b", count: 50, kind: "dependency" };
    const all = [...containment, reference];
    expect(all.map(link => linkPulls(link, "structure"))).toEqual([true, true, false]);
    expect(all.map(link => linkPulls(link, "connections"))).toEqual([false, false, true]);
    const tuning = getDefaultTuning().forceGraph;
    const nodes: SpatialNode[] = [{ id: "directory:", publicSymbols: [], containedSymbolCounts: [3, 7] }, node("a", 3), node("b", 7)];
    const declared = easeSpatialLayout(nodes, all, tuning, "structure");
    // A reference drawn on demand in the structure layout moves nothing...
    expect(declared.nodes).toEqual(easeSpatialLayout(nodes, containment, tuning, "structure").nodes);
    // ...and runs between its two spheres, since three-forcegraph draws no line whose ends are still ids (2026-10-16).
    expect(declared.links.every(link => typeof link.source !== "string" && typeof link.target !== "string")).toBe(true);
    const analyzed = easeSpatialLayout(nodes, all, tuning, "connections");
    expect(separation(analyzed.nodes.slice(1))).toBeLessThan(separation(declared.nodes.slice(1)));
    expect(nodes.every(file => file.x === undefined)).toBe(true);
  });

  it("keeps today's defaults compact and preserves the October 21 gravity-off counterexample", () => {
    // A type toggle twenty times over. Test today's defaults independently from the dated counterexample: the October
    // 24 spring and tether changes alter how far an unconfined picture grows in twenty cycles, not gravity's role.
    const extent = (nodes: readonly SpatialNode[]): number => {
      const centroid = { x: 0, y: 0, z: 0 };
      for (const point of nodes) { centroid.x += point.x! / nodes.length; centroid.y += point.y! / nodes.length; centroid.z += point.z! / nodes.length; }
      return Math.sqrt(nodes.reduce((sum, point) => sum + (point.x! - centroid.x) ** 2 + (point.y! - centroid.y) ** 2 + (point.z! - centroid.z) ** 2, 0) / nodes.length);
    };
    /** The extent after each of twenty toggle cycles, over the first picture's. */
    const growth = (forces: ForceGraphTuning): number[] => {
      let placed = easeSpatialLayout(files, links, forces, "connections").nodes;
      const start = extent(placed);
      const series: number[] = [];
      for (let cycle = 1; cycle <= 20; cycle++) {
        const reduced = easeSpatialLayout(placed.filter(file => !isTest(file)), untested, forces, "connections", { start: "hold" }).nodes;
        placed = easeSpatialLayout([...reduced, ...placed.filter(isTest)], links, forces, "connections", { start: "hold" }).nodes;
        series.push(extent(placed) / start);
      }
      return series;
    };
    const tuning = getDefaultTuning().forceGraph;
    const shipped = growth(tuning);
    expect(shipped[19]).toBeLessThan(1.1);
    expect(Math.abs(shipped[19] / shipped[9] - 1)).toBeLessThan(0.05);
    // The original paired control, measured October 21: with gravity the extent remains about .97 of its start;
    // without it the tenth/twentieth cycles are 1.75/2.26, still growing. Keep its forces and thresholds together, the
    // exact repulsion it was measured with included.
    const historical = { ...tuning, linkGap: 60, charge: 60, collisionGap: 5, coupling: 1, nodeSize: 4, symbolScale: 1,
      gravity: .01, chargeRange: 0, approximation: 0, linkStrength: .25, updateEnergy: 1, tether: .01, citedByPull: 1 };
    const held = growth(historical);
    expect(held[19]).toBeLessThan(1.1);
    expect(Math.abs(held[19] / held[9] - 1)).toBeLessThan(0.05);
    const lax = growth({ ...historical, gravity: 0 });
    expect(lax[19]).toBeGreaterThan(2);
    expect(lax[19] / lax[9]).toBeGreaterThan(1.2);
  });

  it("actually settles more strongly coupled pairs closer, and Compact tighter, using the shared engine", () => {
    const relaxed = getDefaultTuning().forceGraph;
    const compact = applyLayoutPreset(getDefaultTuning(), "compact").forceGraph;
    const nodes = [node("a", 3), node("b", 7)];
    const run = (count: number, tuning = relaxed) => easeSpatialLayout(nodes, [{ source: "a", target: "b", count }], tuning, "connections");
    expect(separation(run(8).nodes)).toBeLessThan(separation(run(1).nodes));
    expect(separation(run(8, compact).nodes)).toBeLessThan(separation(run(8).nodes));
    expect(run(8)).toEqual(run(8));
    expect(nodes.every(file => file.x === undefined)).toBe(true);
  });

  it("keeps unequal-size spheres apart even from coincident positions and high coupling", () => {
    const tuning = { ...getDefaultTuning().forceGraph, linkGap: 8, coupling: 3 };
    const nodes = [node("a", 0), node("b", 63)].map(file => ({ ...file, x: 0, y: 0, z: 0 }));
    const result = easeSpatialLayout(nodes, [{ source: "a", target: "b", count: 500 }], tuning, "connections");
    const clearance = spatialNodeRadius(nodes[0], tuning) + spatialNodeRadius(nodes[1], tuning) + tuning.collisionGap;
    expect(result.still).toBe(true);
    expect(separation(result.nodes)).toBeGreaterThanOrEqual(clearance - 0.01);
    expect(result.nodes.every(file => [file.x, file.y, file.z].every(Number.isFinite))).toBe(true);
    expect(() => easeSpatialLayout(nodes, [], tuning, "connections", { maxTicks: -1 })).toThrow("nonnegative integer");
  });

  it("rejects non-finite supplied positions and velocities instead of reseeding them or reporting stillness", () => {
    const tuning = getDefaultTuning().forceGraph;
    for (const invalid of [{ x: NaN }, { z: Infinity }, { vx: NaN }, { fx: Infinity }]) {
      expect(() => easeSpatialLayout([{ ...node("broken", 1), ...invalid }], [], tuning, "connections")).toThrow("finite coordinates and velocities");
    }
  });
});

describe("the update energy, the constant strength of a change's motion (ticket C2)", () => {
  it("seeds a born sphere's direction by its id, the same everywhere and of unit length", () => {
    const direction = seededDirection("packages/engine/src/live-docs/graph.ts");
    expect(Math.hypot(direction.x, direction.y, direction.z)).toBeCloseTo(1, 12);
    expect(seededDirection("packages/engine/src/live-docs/graph.ts")).toEqual(direction);
    expect(seededDirection("packages/engine/src/live-docs/document.ts")).not.toEqual(direction);
  });

  it("starts a new sphere beside what holds it: a hub at its placed members' centroid, a file at its hub's rest length, a chain one after another, and nothing it cannot place", () => {
    const tuning = getDefaultTuning().forceGraph;
    const hub = (path: string, counts: number[]): PlaceableNode => ({ id: `directory:${path}`, publicSymbols: [], containedSymbolCounts: counts, directoryPath: path, codeRelativePath: path });
    const file = (path: string, symbols: number, at?: { x: number; y: number; z: number }): PlaceableNode => ({ ...node(path, symbols), codeRelativePath: path, ...at });
    const nodes: PlaceableNode[] = [
      { ...hub("", [1, 1, 1, 1]), x: 0, y: 0, z: 0 },
      hub("a", [1, 1]),
      file("a/one.ts", 1, { x: 100, y: 0, z: 0 }), file("a/two.ts", 1, { x: 100, y: 20, z: 0 }),
      file("a/born.ts", 1),
      hub("b", [1]), file("b/new.ts", 1),
      file("alone.ts", 1)
    ];
    const containment = (parent: string, child: string): SpatialLink<PlaceableNode> => ({ source: parent, target: child, count: 1, kind: "containment" });
    const links = [containment("directory:", "directory:a"), containment("directory:a", "a/one.ts"), containment("directory:a", "a/two.ts"), containment("directory:a", "a/born.ts"),
      containment("directory:", "directory:b"), containment("directory:b", "b/new.ts"), containment("directory:", "alone.ts")];
    const starts = placeNewSpheres(nodes, links, tuning, "structure");
    // The hub of a: the centroid of its two placed files.
    expect(starts.get("directory:a")).toEqual({ x: 100, y: 10, z: 0 });
    // The born file: beside its hub, at the containment spring's rest length, in its seeded direction.
    const born = starts.get("a/born.ts")!;
    const rest = spatialLinkDistance({ source: nodes[1], target: nodes[4], count: 1 }, tuning);
    expect(distance(born, starts.get("directory:a")!)).toBeCloseTo(rest, 9);
    const direction = seededDirection("a/born.ts");
    expect(born).toEqual({ x: 100 + rest * direction.x, y: 10 + rest * direction.y, z: rest * direction.z });
    // A new directory with a new file: the hub beside the root, the file beside the hub.
    expect(distance(starts.get("directory:b")!, { x: 0, y: 0, z: 0 })).toBeCloseTo(spatialLinkDistance({ source: nodes[0], target: nodes[5], count: 1 }, tuning), 9);
    expect(distance(starts.get("b/new.ts")!, starts.get("directory:b")!)).toBeCloseTo(spatialLinkDistance({ source: nodes[5], target: nodes[6], count: 1 }, tuning), 9);
    // A file of the root hangs from the root.
    expect(distance(starts.get("alone.ts")!, { x: 0, y: 0, z: 0 })).toBeCloseTo(spatialLinkDistance({ source: nodes[0], target: nodes[7], count: 1 }, tuning), 9);
    expect([...starts.keys()].sort()).toEqual(["a/born.ts", "alone.ts", "b/new.ts", "directory:a", "directory:b"]);
    // Nothing placed is moved, and the nodes themselves are untouched.
    expect(nodes[2]).toMatchObject({ x: 100, y: 0, z: 0 });
    expect(nodes[4].x).toBeUndefined();
    // In the connections layout a born file starts beside the files it references; one wired to nothing placed is left to D3.
    const network = [file("x.ts", 1, { x: 0, y: 0, z: 0 }), file("y.ts", 1, { x: 60, y: 0, z: 0 }), file("z.ts", 1), file("island.ts", 1), file("w.ts", 1)];
    const references: SpatialLink<PlaceableNode>[] = [{ source: "z.ts", target: "x.ts", count: 1, kind: "dependency" }, { source: "y.ts", target: "z.ts", count: 3, kind: "dependency" }, { source: "island.ts", target: "w.ts", count: 1, kind: "dependency" }];
    const beside = placeNewSpheres(network, references, tuning, "connections");
    const reach = (spatialLinkDistance({ source: network[2], target: network[0], count: 1 }, tuning) + spatialLinkDistance({ source: network[2], target: network[1], count: 3 }, tuning)) / 2;
    expect(distance(beside.get("z.ts")!, { x: 30, y: 0, z: 0 })).toBeCloseTo(reach, 9);
    expect([...beside.keys()]).toEqual(["z.ts"]);
    // Containment pulls nothing in the connections layout, so no file is placed by it there; a hub's centroid needs no link.
    expect([...placeNewSpheres(nodes, links, tuning, "connections").keys()]).toEqual(["directory:a"]);
  });

  it("eases a change headlessly as the page does: held where it stands, more gently and for longer at a lower strength, and not at all at zero", () => {
    const tuning = getDefaultTuning().forceGraph;
    const settled = easeSpatialLayout(files, links, tuning, "connections").nodes;
    const reduced = easeSpatialLayout(settled.filter(file => !isTest(file)), untested, tuning, "connections", { start: "hold" }).nodes;
    // The test files come back where they stood; the others carry their reduced places.
    const restored = [...reduced, ...settled.filter(isTest)];
    const given = JSON.stringify(placesOf(restored));
    const ease = (strength: number, maxTicks?: number) => easeSpatialLayout(restored, links, tuning, "connections", { start: "hold", strength, maxTicks });
    const full = ease(1), tenth = ease(0.1), none = ease(0);
    expect(full.still).toBe(true);
    expect(tenth.still).toBe(true);
    expect(tenth.ticks).toBeGreaterThan(full.ticks);
    expect(none).toMatchObject({ ticks: 0, still: false });
    expect(placesOf(none.nodes)).toEqual(placesOf(restored));
    // The first tick of a motion from rest moves in proportion to the strength.
    const firstMove = (strength: number): number => Math.max(...ease(strength, 1).nodes.map((file, i) => distance(file, restored[i])));
    expect(firstMove(1)).toBeGreaterThan(0);
    expect(firstMove(0.1)).toBeCloseTo(firstMove(1) / 10, 9);
    expect(JSON.stringify(placesOf(restored))).toBe(given);
  });

  it("keeps the spheres a change leaves alone nearer where they stood with the tether than without it", () => {
    const tuning = getDefaultTuning().forceGraph;
    const moveOfUnchanged = (forces: ForceGraphTuning): number => {
      const settled = easeSpatialLayout(files, links, forces, "connections").nodes;
      const reduced = easeSpatialLayout(settled.filter(file => !isTest(file)), untested, forces, "connections", { start: "hold" }).nodes;
      return reduced.reduce((sum, file) => sum + distance(file, settled.find(other => other.id === file.id)!), 0) / reduced.length;
    };
    // Measured 2026-10-21: a mean of 17.8 units held by the shipped tether, 32.1 without it.
    expect(moveOfUnchanged(tuning)).toBeLessThan(0.75 * moveOfUnchanged({ ...tuning, tether: 0 }));
  });
});

describe("the springs' strength, the lever on the pull between connected neighbours (2026-10-18)", () => {
  /** The spring's pull on one of a pair 200 units apart, at the given lever, with every other force away. */
  const pull = (linkStrength: number): number => {
    const pair: SpatialNode[] = [node("a", 1), node("b", 1)];
    const tuning = { ...getDefaultTuning().forceGraph, charge: 0, gravity: 0, tether: 0, linkStrength };
    const force = new Float64Array(6);
    spatialFieldOf(pair, [{ source: "a", target: "b", count: 1 }], tuning, "connections").forces(Float64Array.from([-100, 0, 0, 100, 0, 0]), force);
    return force[0];
  };

  it("pulls a pair as the library's rule does at one, half as hard at a half, and not at all at zero", () => {
    expect(pull(1)).toBeGreaterThan(0);
    expect(pull(0.5)).toBeCloseTo(pull(1) / 2, 9);
    expect(pull(2)).toBeCloseTo(pull(1) * 2, 9);
    expect(pull(0)).toBe(0);
  });

  it("keeps D3's rule inside the lever: a wire between two files of two wires each pulls half as hard as a lone pair's", () => {
    const strength = springStrength<SpatialNode, SpatialLink>(1);
    const a = node("a", 1), b = node("b", 1), c = node("c", 1), d = node("d", 1);
    const square: SpatialLink[] = [{ source: a, target: b, count: 1 }, { source: b, target: c, count: 1 }, { source: c, target: d, count: 1 }, { source: d, target: a, count: 1 }];
    expect(strength(square[0], 0, square)).toBe(0.5);
    const pair: SpatialLink[] = [{ source: a, target: b, count: 1 }];
    expect(strength(pair[0], 0, pair)).toBe(1);
    // A hub of three leaves: each wire is as strong as a lone pair's, since the leaf's one wire sets the rule.
    const hub = node("hub", 1);
    const star: SpatialLink[] = [{ source: hub, target: a, count: 1 }, { source: hub, target: b, count: 1 }, { source: hub, target: c, count: 1 }];
    expect(strength(star[1], 1, star)).toBe(1);
    expect(springStrength<SpatialNode, SpatialLink>(0.25)(square[2], 2, square)).toBe(0.125);
  });
});

describe("the easing: one motion through a conservative field, until the spheres are still (2026-10-21)", () => {
  const tuning = getDefaultTuning().forceGraph;

  it("comes to rest headlessly, the same way every time, and stays put when eased again from there", () => {
    const first = easeSpatialLayout(files, links, tuning, "connections");
    expect(first.still).toBe(true);
    expect(first.ticks).toBeGreaterThan(QUIET_TICKS);
    expect(easeSpatialLayout(files, links, tuning, "connections")).toEqual(first);
    // Held where it stands, a still picture is let only a little further toward the field's own rest.
    const again = easeSpatialLayout(first.nodes, links, tuning, "connections", { start: "hold" });
    expect(again.still).toBe(true);
    expect(Math.max(...again.nodes.map((file, i) => distance(file, first.nodes[i])))).toBeLessThan(0.01 * sizeOf(first.nodes));
    expect(files.every(file => file.x === undefined)).toBe(true);
  });

  it("unfolds a first picture from the library's seed and holds it once it calms, where held from the seed it would stay a fraction of its size", () => {
    const unfolded = easeSpatialLayout(files, links, tuning, "connections");
    const held = easeSpatialLayout(files, links, tuning, "connections", { start: "hold" });
    expect(unfolded.still && held.still).toBe(true);
    // Measured 2026-10-21 on this toy: held from the seed, 0.75 of the unfolded size and 981 ticks against 155. On this
    // repository the seed is a ball a hundredth of the picture's size, and a picture held there stays far too small.
    expect(sizeOf(held.nodes)).toBeLessThan(0.85 * sizeOf(unfolded.nodes));
    expect(held.ticks).toBeGreaterThan(unfolded.ticks);
    // Without the tether the forces alone shape it, and the unfolded picture is their own size within a percent.
    const free = easeSpatialLayout(files, links, { ...tuning, tether: 0 }, "connections");
    expect(Math.abs(sizeOf(unfolded.nodes) / sizeOf(free.nodes) - 1)).toBeLessThan(0.05);
  });

  it("ticks nothing at zero strength, and stops at the bound it is given", () => {
    const placed = easeSpatialLayout(files, links, tuning, "connections").nodes;
    const none = easeSpatialLayout(placed, links, tuning, "connections", { strength: 0 });
    expect(none.ticks).toBe(0);
    expect(placesOf(none.nodes)).toEqual(placesOf(placed));
    const bounded = easeSpatialLayout(files, links, tuning, "connections", { maxTicks: 5 });
    expect(bounded).toMatchObject({ ticks: 5, still: false });
  });

  it("carries each sphere's velocity and anchor through a rebuilt field, so that the motion goes on as if nothing were rebuilt", () => {
    const settled = easeSpatialLayout(files, links, tuning, "connections").nodes;
    const run = (rebuildAt: number | null): number[][] => {
      const nodes = settled.map(file => ({ ...file }));
      nodes[0].x! += 60;
      const simulation = forceSimulation(nodes, 3).stop().force("link", forceLink<SpatialNode, SpatialLink>(links.map(link => ({ ...link }))).id(file => file.id).strength(0));
      const motion = motionForce<SpatialNode>({ tuning: () => tuning, layout: () => "connections", links: () => links, strength: () => 1 });
      motion.wake("hold");
      simulation.force("motion", motion);
      for (let tick = 0; tick < 200; tick++) { if (tick === rebuildAt) motion.invalidate(); simulation.tick(); }
      return placesOf(nodes);
    };
    expect(run(40)).toEqual(run(null));
  });

  it("holds a sphere a hand has fixed, falls still once and wakes again", () => {
    const nodes = easeSpatialLayout(files, links, tuning, "connections").nodes.map(file => ({ ...file }));
    const held = nodes[0], partner = nodes[1];
    const partnerFrom = { ...partner }, apart = distance(held, partner);
    held.fx = held.x! + 80; held.fy = held.y; held.fz = held.z;
    const simulation = forceSimulation(nodes, 3).stop().force("link", forceLink<SpatialNode, SpatialLink>(links.map(link => ({ ...link }))).id(file => file.id).strength(0));
    let stillCalls = 0;
    const motion = motionForce<SpatialNode>({ tuning: () => tuning, layout: () => "connections", links: () => links, strength: () => 1, onStill: () => { stillCalls++; } });
    motion.wake("hold");
    simulation.force("motion", motion);
    for (let tick = 0; tick < 400; tick++) simulation.tick();
    expect([held.x, held.y, held.z]).toEqual([held.fx, held.fy, held.fz]);
    // A held sphere is a hand at work: the picture never counts as still while it holds one.
    expect(motion.still).toBe(false);
    expect(stillCalls).toBe(0);
    // Its spring partner keeps the spring's length to the hand, swinging after it as far as that asks and no further, since
    // the tether holds it to where it stood; without the tether its whole cluster slides after the hand over two thousand
    // ticks (measured 2026-10-21: the partner moved 18 units with the tether, by the fiftieth tick, and 77 without).
    expect(Math.abs(distance(held, partner) - apart)).toBeLessThan(0.1 * apart);
    expect(distance(partner, partnerFrom)).toBeGreaterThan(10);
    delete held.fx; delete held.fy; delete held.fz;
    motion.wake("hold");
    while (!motion.still) simulation.tick();
    expect(stillCalls).toBe(1);
    motion.wake();
    expect(motion.still).toBe(false);
  });
});

describe("the reveal of a picture", () => {
  const crowd = Array.from({ length: 24 }, (_, index) => node(`n${index}`, 1));
  const ring: SpatialLink[] = crowd.map((file, index) => ({ source: file.id, target: crowd[(index + 1) % crowd.length].id, count: 1 }));
  const tuning = getDefaultTuning().forceGraph;

  it("is the plain easing when the whole picture is the first piece", () => {
    const whole = easeSpatialLayout(crowd, ring, tuning, "connections", { maxTicks: 400 });
    const revealed = easeSpatialLayout(crowd, ring, tuning, "connections", { maxTicks: 400, reveal: { first: 24 } });
    expect(placesOf(revealed.nodes)).toEqual(placesOf(whole.nodes));
    expect(revealed.ticks).toBe(whole.ticks);
  });

  it("enters the rest a share at a tick after the first piece's hidden ticks, places every sphere and comes to rest", () => {
    const result = easeSpatialLayout(crowd, ring, tuning, "connections", { maxTicks: 4000, reveal: { attention: new Set(["n5"]), first: 4, share: 0.5, least: 1, warmup: 3 } });
    expect(result.still).toBe(true);
    expect(result.nodes.every(file => Number.isFinite(file.x) && Number.isFinite(file.y) && Number.isFinite(file.z))).toBe(true);
    // Pieces of 4, 6, 9, 14, 21 and 24 spheres: five entries after the third tick, then the easing to stillness.
    expect(result.ticks).toBeGreaterThan(3 + 5 + QUIET_TICKS);
    expect(result.nodes.map(file => file.id)).toEqual(crowd.map(file => file.id));
  });

  it("counts stillness afresh when stirred and finds the same rest again", () => {
    const pair = [node("a", 1), node("b", 1)].map(file => ({ ...file }));
    const spring: SpatialLink[] = [{ source: "a", target: "b", count: 1 }];
    const simulation = forceSimulation(pair, 3).stop().force("link", forceLink<SpatialNode, SpatialLink>(spring).id(file => file.id).strength(0));
    const motion = motionForce<SpatialNode>({ tuning: () => tuning, layout: () => "connections", links: () => spring, strength: () => 1 });
    motion.wake("unfold");
    simulation.force("motion", motion);
    let ticks = 0;
    while (!motion.still && ticks < 4000) { simulation.tick(); ticks++; }
    expect(motion.still).toBe(true);
    const rest = placesOf(pair);
    motion.stir();
    expect(motion.still).toBe(false);
    for (let i = 0; i < QUIET_TICKS - 1; i++) simulation.tick();
    expect(motion.still).toBe(false);
    simulation.tick();
    expect(motion.still).toBe(true);
    expect(Math.max(...placesOf(pair).flat().map((value, i) => Math.abs(value - rest.flat()[i])))).toBeLessThan(1e-3 * sizeOf(pair));
  });
});
