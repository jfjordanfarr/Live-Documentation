import { forceLink, forceSimulation } from "d3-force-3d";
import { describe, expect, it } from "vitest";

import { applyLayoutPreset } from "../layout-presets";
import { linkPulls, pullingLinkForce, simulateSpatialLayout, spatialLinkDistance, spatialNodeRadius, spatialNodeValue, type SpatialLink, type SpatialNode } from "./forceGraphLayout";
import { getDefaultTuning } from "../persistence/local-storage";

const node = (id: string, symbols: number): SpatialNode => ({ id, publicSymbols: Array.from({ length: symbols }, (_, index) => `symbol${index}`) });
const separation = (nodes: SpatialNode[]): number => Math.hypot(nodes[0].x! - nodes[1].x!, nodes[0].y! - nodes[1].y!, nodes[0].z! - nodes[1].z!);

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
