import { forceLink, forceManyBody, forceSimulation } from "d3-force-3d";
import { describe, expect, it } from "vitest";

import { applyLayoutPreset } from "../layout-presets";
import { configureSpatialForces, LIBRARY_ALPHA_DECAY, linkPulls, placeNewSpheres, pullingLinkForce, scaledForce, seededDirection, SETTLED_ALPHA, settleSpatialUpdate, settleTicksOf, simulateSpatialLayout, spatialLinkDistance, spatialNodeRadius, spatialNodeValue, springStrength, updateSchedule, type PlaceableNode, type SpatialLink, type SpatialNode } from "./forceGraphLayout";
import { getDefaultTuning } from "../persistence/local-storage";

const node = (id: string, symbols: number): SpatialNode => ({ id, publicSymbols: Array.from({ length: symbols }, (_, index) => `symbol${index}`) });
const separation = (nodes: SpatialNode[]): number => Math.hypot(nodes[0].x! - nodes[1].x!, nodes[0].y! - nodes[1].y!, nodes[0].z! - nodes[1].z!);
const distance = (a: { x?: number; y?: number; z?: number }, b: { x?: number; y?: number; z?: number }): number => Math.hypot(a.x! - b.x!, a.y! - b.y!, a.z! - b.z!);

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

  it("gives the link force only the links that pull in a layout, so that the others neither pull nor count", () => {
    const containment: SpatialLink[] = [
      { source: "directory:", target: "a", count: 1, kind: "containment" },
      { source: "directory:", target: "b", count: 1, kind: "containment" }
    ];
    const reference: SpatialLink = { source: "a", target: "b", count: 50, kind: "dependency" };
    const links = [...containment, reference];
    expect(links.map(link => linkPulls(link, "structure"))).toEqual([true, true, false]);
    expect(links.map(link => linkPulls(link, "connections"))).toEqual([false, false, true]);
    const inner = forceLink<SpatialNode, SpatialLink>();
    const tree = pullingLinkForce(inner, "structure");
    tree.links(links);
    expect(inner.links()).toEqual(containment);
    expect(tree.links()).toEqual(links);
    const network = pullingLinkForce(tree, "connections");
    expect(inner.links()).toEqual([reference]);
    expect(network.links()).toEqual(links);
    const tuning = getDefaultTuning().forceGraph;
    const nodes: SpatialNode[] = [{ id: "directory:", publicSymbols: [], containedSymbolCounts: [3, 7] }, node("a", 3), node("b", 7)];
    const declared = simulateSpatialLayout(nodes, links, tuning, 300, "structure");
    expect(declared.nodes).toEqual(simulateSpatialLayout(nodes, containment, tuning, 300, "structure").nodes);
    expect(declared.links.every(link => typeof link.source !== "string" && typeof link.target !== "string")).toBe(true);
    const analyzed = simulateSpatialLayout(nodes, links, tuning, 300, "connections");
    expect(separation(analyzed.nodes.slice(1))).toBeLessThan(separation(declared.nodes.slice(1)));
    expect(nodes.every(file => file.x === undefined)).toBe(true);
  });

  it("resolves the endpoints of the links that do not pull, in the order the browser's engine sets nodes and links", () => {
    // three-forcegraph sets the simulation's nodes and then the link force's links, and draws no line whose endpoints
    // are still ids; a reference drawn on demand in the structure layout must end on its two spheres (2026-10-16).
    const nodes: SpatialNode[] = [{ id: "directory:", publicSymbols: [], containedSymbolCounts: [3, 7] }, node("a", 3), node("b", 7)];
    const links: SpatialLink[] = [
      { source: "directory:", target: "a", count: 1, kind: "containment" },
      { source: "directory:", target: "b", count: 1, kind: "containment" },
      { source: "a", target: "b", count: 2, kind: "dependency" }
    ];
    const tree = pullingLinkForce(forceLink<SpatialNode, SpatialLink>(), "structure");
    const simulation = forceSimulation<SpatialNode>([], 3).stop().force("link", tree);
    simulation.nodes(nodes);
    tree.id(file => file.id).links(links);
    const [, a, b] = nodes;
    expect(links[2].source).toBe(a);
    expect(links[2].target).toBe(b);
    expect(links.every(link => typeof link.source === "object" && typeof link.target === "object")).toBe(true);
    simulation.tick(10);
    expect([a, b].every(file => [file.x, file.y, file.z].every(Number.isFinite))).toBe(true);
    // A layout change wraps the wrapper and sets it again; every link stays resolved.
    const network = pullingLinkForce(tree, "connections");
    simulation.force("link", network);
    expect(network.links().every(link => typeof link.source === "object" && typeof link.target === "object")).toBe(true);
    // An id the nodes do not hold fails as D3 fails for the links it holds.
    expect(() => tree.links([{ source: "a", target: "gone", count: 1, kind: "dependency" }])).toThrow("node not found: gone");
  });

  it("has a compact equilibrium under the shipped tuning: a cluster toggled out and back in leaves the picture's extent where it began", () => {
    // Two clusters that never reference each other, each with one test file. Before 2026-10-17 nothing drew them
    // together and every reheat pushed them apart; the owner saw "the microgalaxies drift further apart" under repeated
    // type toggles. With gravity the extent after five toggle cycles stays within a tenth of the settled start. This
    // toy is harsher than the real bundles: the lab measured it at 3.17 times without gravity and 1.18 at 0.02, where
    // this repository's bundle gave 2.55 and 1.07; the shipped 0.05 held every measured shape within 7 percent.
    const tuning = getDefaultTuning().forceGraph;
    const files = ["a/one", "a/two", "a/one.test", "b/three", "b/four", "b/three.test"].map(id => node(id, 1));
    const links: SpatialLink[] = [
      { source: "a/one", target: "a/two", count: 1 }, { source: "a/one.test", target: "a/one", count: 1 },
      { source: "b/three", target: "b/four", count: 1 }, { source: "b/three.test", target: "b/three", count: 1 }
    ];
    const isTest = (file: SpatialNode): boolean => file.id.endsWith(".test");
    const extent = (nodes: readonly SpatialNode[]): number => {
      const centre = { x: 0, y: 0, z: 0 };
      for (const point of nodes) { centre.x += point.x! / nodes.length; centre.y += point.y! / nodes.length; centre.z += point.z! / nodes.length; }
      return Math.sqrt(nodes.reduce((sum, point) => sum + (point.x! - centre.x) ** 2 + (point.y! - centre.y) ** 2 + (point.z! - centre.z) ** 2, 0) / nodes.length);
    };
    let placed = simulateSpatialLayout(files, links, tuning, 300).nodes;
    const start = extent(placed);
    for (let cycle = 0; cycle < 5; cycle++) {
      // The toggled files leave with their links and come back where they stood, as the page's node cache keeps them.
      const kept = placed.filter(file => !isTest(file));
      const reduced = simulateSpatialLayout(kept, links.filter(link => !isTest(files.find(f => f.id === link.source)!) && !isTest(files.find(f => f.id === link.target)!)), tuning, 300).nodes;
      const restored = [...reduced, ...placed.filter(isTest)];
      placed = simulateSpatialLayout(restored, links, tuning, 300).nodes;
    }
    expect(extent(placed) / start).toBeLessThan(1.1);
    expect(extent(placed) / start).toBeGreaterThan(0.9);
  });

  it("actually settles more strongly coupled pairs closer, and Compact tighter, using the shared engine", () => {
    const relaxed = getDefaultTuning().forceGraph;
    const compact = applyLayoutPreset(getDefaultTuning(), "compact").forceGraph;
    const nodes = [node("a", 3), node("b", 7)];
    const run = (count: number, tuning = relaxed) => simulateSpatialLayout(nodes, [{ source: "a", target: "b", count }], tuning, 400);
    expect(separation(run(8).nodes)).toBeLessThan(separation(run(1).nodes));
    expect(separation(run(8, compact).nodes)).toBeLessThan(separation(run(8).nodes));
    expect(run(8)).toEqual(run(8));
    expect(nodes.every(file => file.x === undefined)).toBe(true);
  });

  it("keeps unequal-size spheres apart even from coincident positions and high coupling", () => {
    const tuning = { ...getDefaultTuning().forceGraph, linkGap: 8, coupling: 3 };
    const nodes = [node("a", 0), node("b", 63)].map(file => ({ ...file, x: 0, y: 0, z: 0 }));
    const result = simulateSpatialLayout(nodes, [{ source: "a", target: "b", count: 500 }], tuning, 400);
    const clearance = spatialNodeRadius(nodes[0], tuning) + spatialNodeRadius(nodes[1], tuning) + tuning.collisionGap;
    expect(separation(result.nodes)).toBeGreaterThanOrEqual(clearance - 0.01);
    expect(result.nodes.every(file => [file.x, file.y, file.z].every(Number.isFinite))).toBe(true);
    expect(() => simulateSpatialLayout(nodes, [], tuning, -1)).toThrow("nonnegative integer");
  });
});

describe("the update energy, the lever of a membership change (ticket C2)", () => {
  it("schedules a change as D3 schedules a reheat: all of alpha at one, a reheat to the fraction that stops at the same stillness, nothing at or below it", () => {
    expect(updateSchedule(1)).toEqual({ share: 1, alphaMin: SETTLED_ALPHA, ticks: true });
    expect(updateSchedule(0.1)).toEqual({ share: 0.1, alphaMin: 0.01, ticks: true });
    expect(updateSchedule(0.001)).toEqual({ share: 0, alphaMin: SETTLED_ALPHA, ticks: false });
    expect(updateSchedule(0)).toEqual({ share: 0, alphaMin: SETTLED_ALPHA, ticks: false });
    for (const bad of [1.5, -0.1, Number.NaN]) expect(() => updateSchedule(bad)).toThrow("between 0 and 1");
  });

  it("counts the ticks to settle as the library counts them: three hundred for the full reheat, fewer for a fraction, none for placement", () => {
    expect(settleTicksOf(1)).toBe(300);
    expect(settleTicksOf(0.1)).toBe(200);
    expect(settleTicksOf(0.01)).toBe(100);
    expect(settleTicksOf(0.3)).toBeLessThan(settleTicksOf(1));
    expect(settleTicksOf(0.3)).toBeGreaterThan(settleTicksOf(0.1));
    expect(settleTicksOf(0)).toBe(0);
    // A faster cooling settles sooner: at the probe's doubled decay of 2026-10-16, 0.9544 to the 149th is the first power below the stillness.
    expect(settleTicksOf(1, 0.0456)).toBe(149);
  });

  it("gives a force a share of alpha and forwards its accessors, never scaling twice", () => {
    const run = (share: number): number => {
      const nodes = [{ ...node("a", 1), x: -10, y: 0, z: 0 }, { ...node("b", 1), x: 10, y: 0, z: 0 }];
      let seen = share;
      const force = scaledForce(forceManyBody<SpatialNode>(), () => seen);
      expect(force.strength(-30)).toBe(force);
      expect(force.strength()(nodes[0], 0, nodes)).toBe(-30);
      // Wrapping the wrapper wraps the force beneath: the share read is the outer one alone.
      const again = scaledForce(force, () => share);
      seen = 1_000;
      forceSimulation(nodes, 3).stop().force("charge", again).tick(1);
      return separation(nodes) - 20;
    };
    const full = run(1), half = run(0.5), none = run(0);
    expect(full).toBeGreaterThan(0);
    expect(half).toBeCloseTo(full / 2, 6);
    expect(none).toBe(0);
    const pull = (share?: number): number => {
      const pair = [{ ...node("a", 1), x: -100, y: 0, z: 0 }, { ...node("b", 1), x: 100, y: 0, z: 0 }];
      const spring = pullingLinkForce(forceLink<SpatialNode, SpatialLink>().id(file => file.id), "connections", share === undefined ? undefined : () => share);
      forceSimulation(pair, 3).stop().force("link", spring.links([{ source: "a", target: "b", count: 1 }])).tick(1);
      return 200 - separation(pair);
    };
    expect(pull()).toBeGreaterThan(0);
    expect(pull(0.5)).toBeCloseTo(pull() / 2, 6);
  });

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

  it("feeds a change headlessly as the page does: full energy ticks three hundred, a tenth two hundred and stirs the unchanged spheres less, placement ticks nothing and moves nothing", () => {
    const tuning = { ...getDefaultTuning().forceGraph, updateEnergy: 1 };
    const files = ["a/one", "a/two", "a/one.test", "b/three", "b/four", "b/three.test"].map(id => node(id, 1));
    const links: SpatialLink[] = [
      { source: "a/one", target: "a/two", count: 1 }, { source: "a/one.test", target: "a/one", count: 1 },
      { source: "b/three", target: "b/four", count: 1 }, { source: "b/three.test", target: "b/three", count: 1 }
    ];
    const settled = simulateSpatialLayout(files, links, tuning, 300).nodes;
    const isTest = (file: SpatialNode): boolean => file.id.endsWith(".test");
    const reduced = simulateSpatialLayout(settled.filter(file => !isTest(file)), links.filter(link => !String(link.source).endsWith(".test")), tuning, 300).nodes;
    // The test files come back where they stood; the others carry their reduced places.
    const restored = [...reduced, ...settled.filter(isTest)];
    const moveOfUnchanged = (after: SpatialNode[]): number => after.filter(file => !isTest(file)).reduce((sum, file) => sum + distance(file, reduced.find(other => other.id === file.id)!), 0) / reduced.length;
    const given = JSON.stringify(restored.map(file => [file.x, file.y, file.z]));
    const full = settleSpatialUpdate(restored, links, tuning, "connections", 1);
    const tenth = settleSpatialUpdate(restored, links, tuning, "connections", 0.1);
    const none = settleSpatialUpdate(restored, links, tuning, "connections", 0);
    expect(full.ticks).toBe(300);
    expect(tenth.ticks).toBe(200);
    expect(none.ticks).toBe(0);
    expect(moveOfUnchanged(full.nodes)).toBeGreaterThan(0);
    // On this toy two of six spheres return, so the library's centring and the collision, which ignore alpha, carry much
    // of the move; the share's own effect is measured below with those forces out of the way, and in the lab's reports.
    expect(moveOfUnchanged(tenth.nodes)).toBeLessThan(moveOfUnchanged(full.nodes));
    expect(none.nodes.map(file => [file.x, file.y, file.z])).toEqual(restored.map(file => [file.x, file.y, file.z]));
    expect(JSON.stringify(restored.map(file => [file.x, file.y, file.z]))).toBe(given);
    // The default energy is what the page feeds when none is named.
    expect(settleSpatialUpdate(restored, links, { ...tuning, updateEnergy: 0.1 }, "connections").ticks).toBe(200);
    // The same share through the browser's force access: a simulation at a tenth moves less in the same ticks.
    const moved = (share: number): number => {
      const nodes = restored.map(file => ({ ...file }));
      const edges = links.map(link => ({ ...link }));
      const simulation = forceSimulation(nodes, 3).stop().alphaDecay(LIBRARY_ALPHA_DECAY)
        .force("link", forceLink<SpatialNode, SpatialLink>(edges).id(file => file.id)).force("charge", forceManyBody<SpatialNode>());
      configureSpatialForces({ get: name => simulation.force(name), set: (name, force) => { simulation.force(name, force); } }, tuning, "connections", () => share);
      simulation.tick(20);
      return moveOfUnchanged(nodes);
    };
    expect(moved(0.1)).toBeLessThan(moved(1) / 2);
  });
});

describe("the springs' strength, the lever on the pull between connected neighbours (2026-10-18)", () => {
  /** How far one tick of the springs alone draws a pair together from 200 units apart, at the given lever. */
  const pull = (linkStrength: number): number => {
    const pair: SpatialNode[] = [{ ...node("a", 1), x: -100, y: 0, z: 0 }, { ...node("b", 1), x: 100, y: 0, z: 0 }];
    const tuning = { ...getDefaultTuning().forceGraph, charge: 0, gravity: 0, linkStrength };
    const simulation = forceSimulation(pair, 3).stop()
      .force("link", forceLink<SpatialNode, SpatialLink>([{ source: "a", target: "b", count: 1 }]).id(file => file.id))
      .force("charge", forceManyBody<SpatialNode>());
    configureSpatialForces({ get: name => simulation.force(name), set: (name, force) => { simulation.force(name, force); } }, tuning, "connections");
    simulation.tick(1);
    return 200 - separation(pair);
  };

  it("pulls a pair as the library's rule does at one, half as hard at a half, and not at all at zero", () => {
    expect(pull(1)).toBeGreaterThan(0);
    expect(pull(0.5)).toBeCloseTo(pull(1) / 2, 6);
    expect(pull(2)).toBeCloseTo(pull(1) * 2, 6);
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

