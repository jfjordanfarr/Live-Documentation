import { describe, expect, it } from "vitest";

import { applyLayoutPreset } from "../layout-presets";
import { simulateSpatialLayout, spatialLinkDistance, spatialNodeRadius, type SpatialNode } from "./forceGraphLayout";
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
