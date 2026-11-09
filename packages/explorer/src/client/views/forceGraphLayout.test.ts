import { forceLink, forceSimulation } from "d3-force-3d";
import { describe, expect, it } from "vitest";

import { applyLayoutPreset } from "../layout-presets";
import { COLLISION_STIFFNESS, easeSpatialLayout, linkPulls, motionForce, placeNewSpheres, QUIET_TICKS, seededDirection, shellMass, SHELL_SOFTNESS, spatialFieldOf, spatialLinkDistance, spatialNodeRadius, spatialNodeValue, springStrength, symbolCountOf, type PlaceableNode, type SpatialLink, type SpatialNode } from "./forceGraphLayout";
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

  it("keeps every directory junction the same size across depth, symbol counts and packing presets", () => {
    const tuning = getDefaultTuning().forceGraph;
    for (const directoryPath of ["", "src", "src/deep/nested"]) {
      const hub: SpatialNode = { id: `directory:${directoryPath}`, directoryPath, publicSymbols: [], symbolCount: 10000 };
      expect(spatialNodeValue(hub, tuning)).toBe(4);
      expect(spatialNodeRadius(hub, tuning)).toBeCloseTo(4 * Math.cbrt(4));
      expect(spatialNodeRadius(hub, { ...tuning, symbolScale: 0 })).toBe(spatialNodeRadius(hub, tuning));
      expect(spatialNodeRadius(hub, applyLayoutPreset(getDefaultTuning(), "compact").forceGraph)).toBe(spatialNodeRadius(hub, tuning));
    }
    expect(spatialNodeRadius(node("file", 63), tuning)).toBe(16);
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
    // A structure spoke that carries its hub's packing keeps that length (2026-11-08); a length that is no length does not count.
    expect(spatialLinkDistance({ source, target, count: 1, rest: 432.5 }, tuning)).toBe(432.5);
    expect(spatialLinkDistance({ source, target, count: 1, rest: 0 }, tuning)).toBe(distance(1));
    expect(spatialLinkDistance({ source, target, count: 1, rest: Number.NaN }, tuning)).toBe(distance(1));
  });

  it("builds a spoke's spring at the rest length it carries, and every other link as before", () => {
    const tuning = getDefaultTuning().forceGraph;
    const nodes = [{ ...node("directory:", 0), directoryPath: "" }, node("a.ts", 3), node("b.ts", 1)];
    const links: SpatialLink<SpatialNode>[] = [{ source: "directory:", target: "a.ts", count: 1, kind: "containment", rest: 250 }, { source: "directory:", target: "b.ts", count: 1, kind: "containment" }];
    const field = spatialFieldOf(nodes, links, tuning, "structure");
    const plain = spatialFieldOf(nodes, links.map(({ rest, ...link }) => { void rest; return link; }), tuning, "structure");
    expect(field.springs.map(spring => spring.rest)).toEqual([250, plain.springs[1].rest]);
    expect(field.springs[1]).toEqual(plain.springs[1]);
  });

  it("bears a child of the structure layout where its hub's packing holds it, once its hub is placed, and the rest as before", () => {
    const tuning = getDefaultTuning().forceGraph;
    const nodes: PlaceableNode[] = [{ ...node("directory:", 0), directoryPath: "", x: 10, y: 20, z: 30 }, { ...node("directory:a", 0), directoryPath: "a" },
      { ...node("a/x.ts", 1), codeRelativePath: "a/x.ts" }, { ...node("b.ts", 2), codeRelativePath: "b.ts" }];
    const links: SpatialLink<PlaceableNode>[] = [{ source: "directory:", target: "directory:a", count: 1, kind: "containment" },
      { source: "directory:a", target: "a/x.ts", count: 1, kind: "containment" }, { source: "directory:", target: "b.ts", count: 1, kind: "containment" }];
    const spokes = new Map([["directory:a", { hub: "directory:", at: { x: 100, y: 0, z: 0 } }], ["a/x.ts", { hub: "directory:a", at: { x: 0, y: -7, z: 0 } }]]);
    const starts = placeNewSpheres(nodes, links, tuning, "structure", id => spokes.get(id));
    // The bubble's hub where the root's packing holds it, and its file beside it where its own packing does.
    expect(starts.get("directory:a")).toEqual({ x: 110, y: 20, z: 30 });
    expect(starts.get("a/x.ts")).toEqual({ x: 110, y: 13, z: 30 });
    // A child the packing does not name is born as before.
    expect(starts.get("b.ts")).toEqual(placeNewSpheres(nodes, links, tuning, "structure").get("b.ts"));
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
    const nodes: SpatialNode[] = [{ id: "directory:", directoryPath: "", publicSymbols: [] }, node("a", 3), node("b", 7)];
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
      // The first picture whole as one piece: the measure is of the forces over the cycles, not of the reveal.
      let placed = easeSpatialLayout(files, links, forces, "connections", { reveal: { asked: new Set(files.map(file => file.id)) } }).nodes;
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
      gravity: .01, componentSeparation: 0, chargeRange: 0, approximation: 0, linkStrength: .25, updateEnergy: 1, tether: .01, citedByPull: 1 };
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

  it("starts a new sphere beside what holds it: a hub at its placed members' centroid, a file at its hub's rest length, a chain one after another, and a partnerless sphere on the outside", () => {
    const tuning = getDefaultTuning().forceGraph;
    const hub = (path: string): PlaceableNode => ({ id: `directory:${path}`, publicSymbols: [], directoryPath: path, codeRelativePath: path });
    const file = (path: string, symbols: number, at?: { x: number; y: number; z: number }): PlaceableNode => ({ ...node(path, symbols), codeRelativePath: path, ...at });
    const nodes: PlaceableNode[] = [
      { ...hub(""), x: 0, y: 0, z: 0 },
      hub("a"),
      file("a/one.ts", 1, { x: 100, y: 0, z: 0 }), file("a/two.ts", 1, { x: 100, y: 20, z: 0 }),
      file("a/born.ts", 1),
      hub("b"), file("b/new.ts", 1),
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
    // In the connections layout a born file starts beside the files it references; an island wired to nothing placed is
    // born on the outside of the mass (2026-11-02): its most connected sphere a spring's length beyond the farthest
    // placed sphere that has a placed partner, in its seeded direction, and its members beside it.
    const network = [file("x.ts", 1, { x: 0, y: 0, z: 0 }), file("y.ts", 1, { x: 60, y: 0, z: 0 }), file("z.ts", 1), file("island.ts", 1), file("w.ts", 1), file("far.ts", 1, { x: -500, y: 0, z: 0 })];
    const references: SpatialLink<PlaceableNode>[] = [{ source: "z.ts", target: "x.ts", count: 1, kind: "dependency" }, { source: "y.ts", target: "z.ts", count: 3, kind: "dependency" }, { source: "island.ts", target: "w.ts", count: 1, kind: "dependency" }];
    const beside = placeNewSpheres(network, references, tuning, "connections");
    const reach = (spatialLinkDistance({ source: network[2], target: network[0], count: 1 }, tuning) + spatialLinkDistance({ source: network[2], target: network[1], count: 3 }, tuning)) / 2;
    expect(distance(beside.get("z.ts")!, { x: 30, y: 0, z: 0 })).toBeCloseTo(reach, 9);
    // far.ts stands 500 units out but has no partner, so the mass it does not belong to ends at y.ts, 60 units out.
    const seed = beside.get("island.ts")!, outward = seededDirection("island.ts"), shell = 60 + tuning.linkGap + 2 * spatialNodeRadius(network[3], tuning);
    expect(seed).toEqual({ x: shell * outward.x, y: shell * outward.y, z: shell * outward.z });
    expect(distance(beside.get("w.ts")!, seed)).toBeCloseTo(spatialLinkDistance({ source: network[3], target: network[4], count: 1 }, tuning), 9);
    expect([...beside.keys()]).toEqual(["z.ts", "island.ts", "w.ts"]);
    // Containment pulls nothing in the connections layout, so nothing is placed by it there: the hub's centroid needs no
    // link, and the rest, partnerless, is born on the outside of a mass that has no partnered sphere, a spring's length
    // from the origin.
    const unpulled = placeNewSpheres(nodes, links, tuning, "connections");
    expect([...unpulled.keys()].sort()).toEqual(["a/born.ts", "alone.ts", "b/new.ts", "directory:a", "directory:b"]);
    expect(distance(unpulled.get("alone.ts")!, { x: 0, y: 0, z: 0 })).toBeCloseTo(tuning.linkGap + 2 * spatialNodeRadius(nodes[7], tuning), 9);
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

describe("a sphere's clearance, the room a wrapped group's seed keeps (2026-11-05)", () => {
  it("is its own radius unless more is asked, and a larger clearance pushes apart a pair that would otherwise rest touching", () => {
    const pair: SpatialNode[] = [node("a", 1), node("b", 1)];
    const tuning = { ...getDefaultTuning().forceGraph, charge: 0, gravity: 0, tether: 0 };
    const own = spatialFieldOf(pair, [], tuning, "connections");
    expect(Array.from(spatialFieldOf(pair, [], tuning, "connections", () => undefined).radii)).toEqual(Array.from(own.radii));
    expect(Array.from(spatialFieldOf(pair, [], tuning, "connections", () => 1).radii), "a smaller clearance keeps the sphere's own").toEqual(Array.from(own.radii));
    const roomy = spatialFieldOf(pair, [], tuning, "connections", item => item.id === "a" ? 80 : undefined);
    expect(roomy.radii[0]).toBe(80);
    expect(roomy.radii[1]).toBe(own.radii[1]);
    const at = Float64Array.from([-20, 0, 0, 20, 0, 0]);
    const plain = new Float64Array(6), wrapped = new Float64Array(6);
    own.forces(at, plain); roomy.forces(at, wrapped);
    expect(plain[0]).toBe(0);
    expect(wrapped[0], "the wrapped seed is pushed away from its neighbour").toBeLessThan(0);
  });
});

describe("a directory shell in the field (2026-11-06)", () => {
  const tuning = { ...getDefaultTuning().forceGraph, charge: 0, gravity: 0, tether: 0 };
  const shell = (id: string, files: number): SpatialNode => ({ id, publicSymbols: [], shellFiles: files });

  it("is soft: a sphere closer than their clearance is pushed back by its share of the collision, its stiffness less, and a picture without shells is the field it was", () => {
    const files: SpatialNode[] = [node("a", 1), node("b", 1)];
    const plain = spatialFieldOf(files, [], tuning, "connections");
    expect(plain.softness, "no shell, no softness").toBeUndefined();
    const radius = spatialNodeRadius(shell("shell:s", 20), tuning);
    const soft = spatialFieldOf([shell("shell:s", 20), node("b", 1)], [], tuning, "connections");
    expect(Array.from(soft.softness!)).toEqual([SHELL_SOFTNESS, 1]);
    // Two files and a file against the shell, each pair one unit inside its clearance.
    const gap = tuning.collisionGap, r = spatialNodeRadius(node("b", 1), tuning);
    const between = (field: typeof plain, apart: number) => { const out = new Float64Array(6); const reading = field.forces(Float64Array.from([0, 0, 0, apart, 0, 0]), out); return { push: out[3], stiffness: reading.stiffness }; };
    const hard = between(plain, 2 * r + gap - 1), gentle = between(soft, radius + r + gap - 1);
    expect(hard.push).toBeCloseTo(COLLISION_STIFFNESS, 9);
    expect(gentle.push).toBeCloseTo(COLLISION_STIFFNESS * SHELL_SOFTNESS, 9);
    expect(gentle.stiffness).toBeLessThan(hard.stiffness);
  });

  it("weighs the cube root of the files it holds, a file one, and a picture without shells weighs nothing extra (third round)", () => {
    expect(spatialFieldOf([node("a", 1), node("b", 1)], [], tuning, "connections").mass, "no shell, no weights").toBeUndefined();
    const field = spatialFieldOf([shell("shell:s", 64), node("b", 1), shell("shell:t", 1)], [], tuning, "connections");
    expect(Array.from(field.mass!)).toEqual([4, 1, 1]);
    expect(shellMass(1000)).toBeCloseTo(10, 12);
  });

  it("is born outside the placed mass, on the side of the files it is wired to, clear of the farthest sphere that way", () => {
    const mass: Array<SpatialNode & PlaceableNode> = [-60, -30, 0, 30, 60].map((x, i) => ({ ...node(`m${i}`, 0), x, y: 0, z: 0 }));
    const born = shell("shell:s", 30);
    const links: SpatialLink[] = [{ source: "m3", target: "shell:s", count: 4 }, { source: "m4", target: "shell:s", count: 1 }];
    const start = placeNewSpheres([...mass, born], links, tuning, "connections").get("shell:s")!;
    // The mass's centroid is the origin, its wired files to the right: the shell stands on the x axis beyond the farthest file.
    expect(start.y).toBeCloseTo(0, 9); expect(start.z).toBeCloseTo(0, 9);
    expect(start.x).toBeCloseTo(60 + spatialNodeRadius(mass[4], tuning) + tuning.collisionGap + spatialNodeRadius(born, tuning), 9);
    // A file in its place is born beside what it is wired to, as before.
    const file = { ...node("f", 0) };
    const beside = placeNewSpheres([...mass, file], links.map(link => ({ ...link, target: "f" })), tuning, "connections").get("f")!;
    expect(distance(beside, { x: 45, y: 0, z: 0 })).toBeLessThan(80);
  });

  it("is born round the files with the shells of its piece, clear of each, not each beyond the last in a line (third round)", () => {
    // A ball of files, and twelve shells wired to the same two files and each to the one before, as sibling packages are.
    const files: Array<SpatialNode & PlaceableNode> = Array.from({ length: 30 }, (_, i) => {
      const h = 1 - 2 * (i + 0.5) / 30, ring = Math.sqrt(1 - h * h), turn = i * 2.39996;
      return { ...node(`f${i}`, 0), x: 60 * ring * Math.cos(turn), y: 60 * h, z: 60 * ring * Math.sin(turn) };
    });
    const shells = Array.from({ length: 12 }, (_, i) => shell(`shell:s${String(i).padStart(2, "0")}`, 10 + 15 * i));
    const links: SpatialLink[] = shells.flatMap((born, i) => [{ source: "f0", target: born.id, count: 2 }, { source: "f7", target: born.id, count: 1 },
      ...(i ? [{ source: shells[i - 1].id, target: born.id, count: 1 }] : [])]);
    const starts = placeNewSpheres([...files, ...shells], links, tuning, "connections");
    const at = shells.map(born => ({ ...starts.get(born.id)!, radius: spatialNodeRadius(born, tuning) }));
    for (let i = 0; i < at.length; i++) {
      for (const file of files) expect(distance(at[i], file), `${shells[i].id} outside ${file.id}`).toBeGreaterThanOrEqual(at[i].radius + spatialNodeRadius(file, tuning) + tuning.collisionGap - 1e-9);
      for (let j = i + 1; j < at.length; j++) expect(distance(at[i], at[j]), `${shells[i].id} clear of ${shells[j].id}`).toBeGreaterThanOrEqual(at[i].radius + at[j].radius + tuning.collisionGap - 1e-9);
    }
    // Round the files rather than strung out: the shells reach less than a fifth as far as their diameters laid end to end
    // (each born beyond the last, they reached past them all, 1,348 units against 1,225).
    const reach = Math.max(...at.map(place => Math.hypot(place.x, place.y, place.z) + place.radius)), diameters = at.reduce((sum, place) => sum + 2 * place.radius, 0);
    expect(reach).toBeLessThan(diameters / 5);
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

  it("lets a single isolated file settle using its physical extent, even though its centers-only diagonal is zero", () => {
    const result = easeSpatialLayout([node("isolated", 0)], [], tuning, "connections", { maxTicks: 1500 });
    expect(result.still).toBe(true);
    expect(result.nodes).toHaveLength(1);
    expect(Math.hypot(result.nodes[0].x!, result.nodes[0].y!, result.nodes[0].z!)).toBeLessThan(tuning.nodeSize);
  });

  it("reports a picture change only when a paced call moves positions", () => {
    const nodes: SpatialNode[] = Array.from({ length: 512 }, (_, index) => ({
      ...node(`paced-${index}`, index % 4), x: (index % 16) * 30, y: Math.floor(index / 16) * 30, z: index % 7
    }));
    const simulation = forceSimulation(nodes, 3).stop();
    const motion = motionForce<SpatialNode>({
      tuning: () => tuning, layout: () => "connections", links: () => [], strength: () => 1, budget: () => .001
    });
    simulation.force("motion", motion);
    let changed = 0, unchanged = 0;
    for (let call = 0; call < 32; call++) {
      const before = placesOf(nodes), revision = motion.revision;
      simulation.tick();
      const moved = nodes.some((node, i) => node.x !== before[i][0] || node.y !== before[i][1] || node.z !== before[i][2]);
      expect(motion.revision - revision).toBe(moved ? 1 : 0);
      if (moved) changed++; else unchanged++;
    }
    expect(changed).toBeGreaterThan(0);
    expect(unchanged).toBeGreaterThan(0); // Force evaluation alone must not cause a redraw of the same positions.
  });

  it("comes to rest headlessly, the same way every time, and stays put when eased again from there", () => {
    // The whole toy as one piece: the physics is measured, not the reveal, which has its own tests below.
    const whole = { reveal: { asked: new Set(files.map(file => file.id)) } };
    const first = easeSpatialLayout(files, links, tuning, "connections", whole);
    expect(first.still).toBe(true);
    expect(first.ticks).toBeGreaterThan(QUIET_TICKS);
    expect(easeSpatialLayout(files, links, tuning, "connections", whole)).toEqual(first);
    // Held where it stands, a still picture is let only a little further toward the field's own rest.
    const again = easeSpatialLayout(first.nodes, links, tuning, "connections", { start: "hold" });
    expect(again.still).toBe(true);
    expect(Math.max(...again.nodes.map((file, i) => distance(file, first.nodes[i])))).toBeLessThan(0.01 * sizeOf(first.nodes));
    expect(files.every(file => file.x === undefined)).toBe(true);
  });

  // The whole toy as one piece, so that the easing is measured and not the reveal.
  const whole = { reveal: { asked: new Set(files.map(file => file.id)) } };

  it("unfolds a first picture freely to the forces' own size, where a picture held from its seed stays near the seed", () => {
    const unfolded = easeSpatialLayout(files, links, tuning, "connections", whole);
    const held = easeSpatialLayout(files, links, tuning, "connections", { ...whole, start: "hold" });
    expect(unfolded.still && held.still).toBe(true);
    // The seed is where the spheres are born (2026-11-02: the first on the outside of an empty mass, the rest beside
    // their partners), and a picture held there is kept near it by the tether, while the unfolded one is let go to
    // the forces' own size: without the tether the forces alone shape it, within a few percent of the unfolded.
    const seed = placeNewSpheres(files, links.map(link => ({ ...link })), tuning, "connections");
    const seeded = files.map(file => ({ ...file, ...seed.get(file.id)! }));
    expect(seeded.every(file => Number.isFinite(file.x))).toBe(true);
    expect(Math.abs(sizeOf(held.nodes) / sizeOf(seeded) - 1)).toBeLessThan(0.25);
    const free = easeSpatialLayout(files, links, { ...tuning, tether: 0 }, "connections", whole);
    expect(Math.abs(sizeOf(unfolded.nodes) / sizeOf(free.nodes) - 1)).toBeLessThan(0.05);
    expect(sizeOf(held.nodes)).not.toBeCloseTo(sizeOf(unfolded.nodes), 0);
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
    const nodes = easeSpatialLayout(files, links, tuning, "connections", whole).nodes.map(file => ({ ...file }));
    const held = nodes[0], partner = nodes[1];
    const partnerFrom = { ...partner }, apart = distance(held, partner);
    // Stretch the actual spring by half its length. An arbitrary +X drag can instead swing around the partner and
    // barely stretch it after a different layout, so it cannot establish whether the partner follows the hand.
    held.fx = held.x! + (held.x! - partner.x!) / 2;
    held.fy = held.y! + (held.y! - partner.y!) / 2;
    held.fz = held.z! + (held.z! - partner.z!) / 2;
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
    // The partner must actually follow the outward stretch and keep the pair's distance close to its settled length.
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

  it("eases a picture asked about whole as one piece, the same at any pace, since nothing is left to enter", () => {
    const asked = new Set(crowd.map(file => file.id));
    const quick = easeSpatialLayout(crowd, ring, { ...tuning, revealFrames: 1 }, "connections", { maxTicks: 400, reveal: { asked } });
    const slow = easeSpatialLayout(crowd, ring, { ...tuning, revealFrames: 240 }, "connections", { maxTicks: 400, reveal: { asked } });
    expect(placesOf(slow.nodes)).toEqual(placesOf(quick.nodes));
    expect(slow.ticks).toBe(quick.ticks);
    expect(slow.nodes.length).toBe(24);
  });

  it("enters the rest a share of the whole at a tick after the first piece's hidden ticks, places every sphere and comes to rest", () => {
    // The ring is twelve hops across: twelve hops around n5 show it whole, and six frames enter four spheres a tick.
    const result = easeSpatialLayout(crowd, ring, { ...tuning, hops: 12, revealFrames: 6 }, "connections", { maxTicks: 4000, reveal: { asked: new Set(["n5"]), warmup: 3 } });
    expect(result.still).toBe(true);
    expect(result.nodes.every(file => Number.isFinite(file.x) && Number.isFinite(file.y) && Number.isFinite(file.z))).toBe(true);
    // Pieces of 1, 5, 9, 13, 17, 21 and 24 spheres: six entries after the third tick, then the easing to stillness.
    expect(result.ticks).toBeGreaterThan(3 + 6 + QUIET_TICKS);
    expect(result.nodes.map(file => file.id)).toEqual(crowd.map(file => file.id));
  });

  it("shows the tuning's hops around what was asked about, the archipelago when nothing in the picture was, and the whole when asked for as members", () => {
    const around = easeSpatialLayout(crowd, ring, tuning, "connections", { maxTicks: 400, reveal: { asked: new Set(["n5"]) } });
    expect(around.nodes.map(file => file.id)).toEqual(["n4", "n5", "n6"]);
    expect(around.links.length, "the wires among the spheres shown at the one-hop default").toBe(2);
    // The ring is one group: its seed alone, nothing grown (2026-11-02); every sphere has two neighbours, ties by id.
    const start = easeSpatialLayout(crowd, ring, tuning, "connections", { maxTicks: 400, reveal: { asked: new Set(["elsewhere"]) } });
    expect(start.nodes.map(file => file.id)).toEqual(["n0"]);
    const whole = easeSpatialLayout(crowd, ring, tuning, "connections", { maxTicks: 400, reveal: { asked: new Set(), members: new Set(crowd.map(file => file.id)) } });
    expect(whole.nodes.length).toBe(24);
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
