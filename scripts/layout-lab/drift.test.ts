import { describe, expect, it } from "vitest";

import { carryPositions, diagonalOf, extentOf, measureDrift, rangeOf, renderDriftReports, toggledArchetype } from "./drift";
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

  it("carries a sphere's place across a membership change and starts a new hub at its members' centroid, a born file beside its hub", () => {
    const tuning = getDefaultTuning().forceGraph;
    const hub = { ...node("directory:a"), directoryPath: "a", directoryFileCount: 2, containedSymbolCounts: [1, 1] };
    const links = [{ source: "directory:a", target: "a/one.ts", count: 1, kind: "containment" }, { source: "directory:a", target: "a/born.ts", count: 1, kind: "containment" }];
    const carried = carryPositions([node("a/one.ts"), hub, node("a/born.ts")], links, new Map([["a/one.ts", { x: 3, y: 4, z: 5 }]]), tuning, "structure");
    expect(carried[0]).toMatchObject({ x: 3, y: 4, z: 5 });
    expect(carried[1]).toMatchObject({ x: 3, y: 4, z: 5 });
    const born = carried[2];
    expect([born.x, born.y, born.z].every(Number.isFinite)).toBe(true);
    expect(Math.hypot(born.x! - 3, born.y! - 4, born.z! - 5)).toBeGreaterThan(8);
    expect(carryPositions([hub], [], new Map(), tuning, "structure")[0].x).toBeUndefined();
  });

  it("eases each change at the update energy: placement alone takes no tick and moves no unchanged sphere, a tenth eases more gently and so for longer, to much the same rest", () => {
    const tuning = { ...getDefaultTuning().forceGraph, gravity: 0.05, chargeRange: 0 };
    const full = measureDrift(graph, everything, tests, { ...tuning, updateEnergy: 1 }, "connections", 2, 20_000);
    const tenth = measureDrift(graph, everything, tests, { ...tuning, updateEnergy: 0.1 }, "connections", 2, 20_000);
    const placement = measureDrift(graph, everything, tests, { ...tuning, updateEnergy: 0 }, "connections", 2, 20_000);
    const settles = (report: typeof full): number[] => report.cycles.flatMap(cycle => [cycle.settleTicks.removed, cycle.settleTicks.restored]);
    // Measured 2026-10-21: every change still in 137 to 142 ticks at full strength and 371 to 474 at a tenth.
    expect(settles(full).every(ticks => ticks > 0 && ticks < 20_000)).toBe(true);
    expect(Math.min(...settles(tenth))).toBeGreaterThan(Math.max(...settles(full)));
    expect(settles(placement)).toEqual([0, 0, 0, 0]);
    expect(placement.cycles.every(cycle => cycle.meanMoveOfUnchanged === 0 && cycle.extent === placement.start.extent)).toBe(true);
    // The same forces eased more gently come to much the same rest: the unchanged spheres moved a mean of 4.5 and 5.0.
    expect(tenth.cycles[0].meanMoveOfUnchanged).toBeGreaterThan(0);
    expect(Math.abs(tenth.cycles[0].meanMoveOfUnchanged / full.cycles[0].meanMoveOfUnchanged - 1)).toBeLessThan(0.25);
    const table = renderDriftReports([full, tenth, placement], "toy");
    expect(table).toContain(`| connections | 1 | ${tuning.tether} | ${tuning.linkStrength} | 0.05 | unbounded | ${tuning.approximation} | 6 (2) |`);
    expect(table).toContain(`| ${rangeOf(settles(full))} |`);
    expect(table).toContain("| 0 |\n");
    expect(rangeOf([3, 1, 2])).toBe("1 to 3");
    expect(rangeOf([4, 4])).toBe("4");
  });

  it("maps the toggle option to the doc's archetype and refuses a word that would measure the control unawares", () => {
    expect(toggledArchetype("tests")).toBe("test");
    expect(toggledArchetype("assets")).toBe("asset");
    expect(toggledArchetype("none")).toBeNull();
    expect(() => toggledArchetype("test")).toThrow("--toggle must be");
  });

  it("measures the control, an easing with nothing toggled, as a cycle of zero toggled spheres", () => {
    const control = measureDrift(graph, everything, () => false, getDefaultTuning().forceGraph, "connections", 1, 50);
    expect(control.toggled).toBe(0);
    expect(control.cycles[0].meanMoveOfUnchanged).toBeGreaterThan(0);
  });

  it("finds the clusters drifting apart under the forces as they were, and held by gravity", () => {
    // The drift of 2026-10-17 was measured under the full reheat the page made of every change; the energy stays at one here.
    const tuning = { ...getDefaultTuning().forceGraph, updateEnergy: 1 };
    const lax = measureDrift(graph, everything, tests, { ...tuning, gravity: 0, chargeRange: 0 }, "connections", 5, 20_000);
    const held = measureDrift(graph, everything, tests, { ...tuning, gravity: 0.05, chargeRange: 0 }, "connections", 5, 20_000);
    expect(lax.toggled).toBe(2);
    expect(lax.total).toBe(6);
    const growth = (report: typeof lax): number => report.cycles[report.cycles.length - 1].extent / report.start.extent;
    // Without a restoring force every change lets the two clusters drift further apart (1.43 times over five cycles,
    // measured 2026-10-21); with one the picture returns (0.99).
    expect(growth(lax)).toBeGreaterThan(1.2);
    expect(growth(held)).toBeLessThan(1.1);
    expect(held.cycles.every(cycle => Number.isFinite(cycle.meanMoveOfUnchanged))).toBe(true);
    expect(() => measureDrift(graph, everything, tests, tuning, "connections", 0, 10)).toThrow("at least one cycle");
  });
});
