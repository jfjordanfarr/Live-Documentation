import { describe, expect, it } from "vitest";

import { carryPositions, diagonalOf, extentOf, measureDrift, toggledArchetype } from "./drift";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

const node = (id: string, archetype = "implementation", symbols = 1): ExplorerNodePayload => ({ id, name: id.split("/").pop()!,
  codePath: id, codeRelativePath: id, docPath: `docs/${id}.md`, docRelativePath: `docs/${id}.md`, archetype,
  publicSymbols: Array.from({ length: symbols }, (_, i) => `s${i}`), dependencies: [], dependents: [], missingDependencies: [] });

/** Two clusters that never reference each other, each with a test file of its own: the shape that drifts. */
const graph: ExplorerGraphPayload = {
  nodes: [node("a/one.ts"), node("a/two.ts"), node("a/one.test.ts", "test"), node("b/three.ts"), node("b/four.ts"), node("b/three.test.ts", "test")],
  links: [
    { source: "a/one.ts", target: "a/two.ts", kind: "dependency" }, { source: "a/one.test.ts", target: "a/one.ts", kind: "dependency" },
    { source: "b/three.ts", target: "b/four.ts", kind: "dependency" }, { source: "b/three.test.ts", target: "b/three.ts", kind: "dependency" }
  ],
  stats: { nodes: 6, links: 4, referencesOutsideScan: 0 }
};
const everything = (): boolean => true;
const tests = (file: ExplorerNodePayload): boolean => file.archetype === "test";

describe("the drift measure", () => {
  it("measures spread by the root-mean-square distance from the centroid and by the box's diagonal", () => {
    const square = [{ x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 }];
    expect(extentOf(square)).toBeCloseTo(Math.SQRT2);
    expect(diagonalOf(square)).toBeCloseTo(Math.hypot(2, 2));
    expect(extentOf([])).toBe(0);
  });

  it("carries a sphere's place across a membership change and starts a new hub at its members' centroid", () => {
    const hub = { ...node("directory:a"), directoryPath: "a", directoryFileCount: 1, containedSymbolCounts: [1] };
    const carried = carryPositions([node("a/one.ts"), hub], new Map([["a/one.ts", { x: 3, y: 4, z: 5 }]]));
    expect(carried[0]).toMatchObject({ x: 3, y: 4, z: 5 });
    expect(carried[1]).toMatchObject({ x: 3, y: 4, z: 5 });
    expect(carryPositions([hub], new Map())[0].x).toBeUndefined();
  });

  it("maps the toggle option to the doc's archetype and refuses a word that would measure the control unawares", () => {
    expect(toggledArchetype("tests")).toBe("test");
    expect(toggledArchetype("assets")).toBe("asset");
    expect(toggledArchetype("none")).toBeNull();
    expect(() => toggledArchetype("test")).toThrow("--toggle must be");
  });

  it("measures the control, a reheat with nothing toggled, as a cycle of zero toggled spheres", () => {
    const control = measureDrift(graph, everything, () => false, getDefaultTuning().forceGraph, "connections", 1, 50);
    expect(control.toggled).toBe(0);
    expect(control.cycles[0].meanMoveOfUnchanged).toBeGreaterThan(0);
  });

  it("finds the clusters drifting apart under the forces as they were, and held by gravity", () => {
    const tuning = getDefaultTuning().forceGraph;
    const lax = measureDrift(graph, everything, tests, { ...tuning, gravity: 0, chargeRange: 0 }, "connections", 5, 300);
    const held = measureDrift(graph, everything, tests, { ...tuning, gravity: 0.05, chargeRange: 0 }, "connections", 5, 300);
    expect(lax.toggled).toBe(2);
    expect(lax.total).toBe(6);
    const growth = (report: typeof lax): number => report.cycles[report.cycles.length - 1].extent / report.start.extent;
    // Without a restoring force every reheat pushes the two clusters further apart; with one the picture returns.
    expect(growth(lax)).toBeGreaterThan(1.2);
    expect(growth(held)).toBeLessThan(1.1);
    expect(held.cycles.every(cycle => Number.isFinite(cycle.meanMoveOfUnchanged))).toBe(true);
    expect(() => measureDrift(graph, everything, tests, tuning, "connections", 0, 10)).toThrow("at least one cycle");
  });
});
