import { expect, it } from "vitest";

import type { ScopeRun } from "./scopes";
import { spatialReport } from "./spatial";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

const node = (id: string, archetype = "implementation", symbols = 0): ExplorerNodePayload => ({ id, name: id,
  codePath: id, codeRelativePath: id, docPath: `docs/${id}.md`, docRelativePath: `docs/${id}.md`, archetype,
  publicSymbols: Array.from({ length: symbols }, (_, i) => `symbol${i}`), dependencies: [], dependents: [], missingDependencies: [] });
const graph: ExplorerGraphPayload = { nodes: [node("a", "implementation", 7), node("b"), node("test", "test"), node("asset", "asset")], links: [
  { source: "a", target: "b", kind: "dependency", referenceCount: 3 },
  { source: "b", target: "a", kind: "type-reference" },
  { source: "test", target: "a", kind: "dependency" }, { source: "a", target: "asset", kind: "dependency" }
], stats: { nodes: 4, links: 4, references: 4, dependenciesOutsideScan: 0 } };
const run: ScopeRun = { bundle: "repository", base: "/", scopeName: "example", scope: ["a"], subject: "a" };

it("reports documented multiplicity, actual radius and the same preferred spacing as the page, with its filters", () => {
  const before = JSON.stringify(graph);
  const report = spatialReport(graph, run, getDefaultTuning().forceGraph, 100, { showTests: false, showAssets: false });
  expect(report.nodes.map(file => [file.id, file.radius])).toEqual([["a", 8], ["b", 4]]);
  expect(report.links).toHaveLength(1);
  expect(report.links[0]).toMatchObject({ source: "a", target: "b", references: 4, preferredDistance: 32 });
  expect(report.nodes.every(file => [file.x, file.y, file.z].every(Number.isFinite))).toBe(true);
  expect(JSON.stringify(graph)).toBe(before);
});

it("keeps explicitly retained tests/assets and can include the same documentation overlay", () => {
  const report = spatialReport(graph, { ...run, scope: ["test", "asset"] }, getDefaultTuning().forceGraph, 50,
    { showTests: false, showAssets: false, showRelatedDocs: true }, [{ sourceId: "a", targetPath: "README.md", direction: "cites" }]);
  expect(report.nodes.map(file => file.id)).toEqual(["a", "b", "test", "asset", "related:README.md"]);
  expect(report.links).toHaveLength(4);
  expect(() => spatialReport(graph, { ...run, scope: ["gone"] }, getDefaultTuning().forceGraph)).toThrow("no retained file");
});

it("reports the declared structure separately, with hubs sized by their members and references that pull nothing", () => {
  const tuning = getDefaultTuning().forceGraph;
  const filters = { showTests: false, showAssets: false };
  const tree = spatialReport(graph, run, tuning, 100, filters, [], "structure");
  const network = spatialReport(graph, run, tuning, 100, filters);
  expect(tree.layout).toBe("structure");
  expect(tree.nodes.filter(node => node.kind === "directory")).toEqual([
    expect.objectContaining({ id: "directory:", directory: "", files: 2, radius: 4 * Math.cbrt(8 + 1) })
  ]);
  expect(tree.links.filter(link => link.kind === "containment")).toHaveLength(2);
  expect(tree.links.filter(link => link.kind === "containment").every(link => link.references === null && link.pulls)).toBe(true);
  expect(tree.links.find(link => link.kind !== "containment")).toMatchObject({ references: 4, pulls: false });
  expect(network.nodes.every(node => node.kind !== "directory")).toBe(true);
  expect(network.links).toEqual([expect.objectContaining({ source: "a", target: "b", references: 4, pulls: true })]);
});
