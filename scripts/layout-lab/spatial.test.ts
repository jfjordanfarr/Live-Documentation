import { describe, expect, it } from "vitest";

import type { ScopeRun } from "./scopes";
import { spatialReport } from "./spatial";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { easeSpatialLayout } from "../../packages/explorer/src/client/views/forceGraphLayout";
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
  const report = spatialReport(graph, run, getDefaultTuning().forceGraph, 400, { showTests: false, showAssets: false });
  expect(report.nodes.map(file => [file.id, file.radius])).toEqual([["a", 8], ["b", 4]]);
  expect(report.links).toHaveLength(1);
  expect(report.links[0]).toMatchObject({ source: "a", target: "b", references: 4, preferredDistance: 32 });
  expect(report.nodes.every(file => [file.x, file.y, file.z].every(Number.isFinite))).toBe(true);
  expect(JSON.stringify(graph)).toBe(before);
});

it("keeps explicitly retained tests/assets and can include the same documentation overlay", () => {
  // Two hops reach the retained files' provider and then that provider's documentation.
  const report = spatialReport(graph, { ...run, scope: ["test", "asset"] }, { ...getDefaultTuning().forceGraph, hops: 2 }, 400,
    { showTests: false, showAssets: false, showRelatedDocs: true }, [{ sourceId: "a", targetPath: "README.md", direction: "cites" }]);
  expect(report.nodes.map(file => file.id)).toEqual(["a", "b", "test", "asset", "related:README.md"]);
  expect(report.links).toHaveLength(4);
  expect(() => spatialReport(graph, { ...run, scope: ["gone"] }, getDefaultTuning().forceGraph)).toThrow("no retained file");
});

it("reports the declared structure separately, with uniform hubs and references that pull nothing", () => {
  // The bare-junction fixture needs both root files to exercise containment and their non-pulling reference.
  const tuning = { ...getDefaultTuning().forceGraph, groupWrappers: "off" as const, hops: 2 };
  const filters = { showTests: false, showAssets: false };
  const tree = spatialReport(graph, run, tuning, 400, filters, [], "structure");
  const network = spatialReport(graph, run, tuning, 400, filters);
  expect(tree.layout).toBe("structure");
  expect(tree.nodes.filter(node => node.kind === "directory")).toEqual([
    expect.objectContaining({ id: "directory:", directory: "", files: 2, radius: 4 * Math.cbrt(4) })
  ]);
  expect(tree.links.filter(link => link.kind === "containment")).toHaveLength(2);
  expect(tree.links.filter(link => link.kind === "containment").every(link => link.references === null && link.pulls)).toBe(true);
  expect(tree.links.find(link => link.kind !== "containment")).toMatchObject({ references: 4, pulls: false });
  expect(network.nodes.every(node => node.kind !== "directory")).toBe(true);
  expect(network.links).toEqual([expect.objectContaining({ source: "a", target: "b", references: 4, pulls: true })]);
});

describe("the spatial report's correspondence to the page", () => {
  const node = (id: string): ExplorerNodePayload => ({ id, name: id, codePath: id, codeRelativePath: id,
    docPath: `docs/${id}.md`, docRelativePath: `docs/${id}.md`, archetype: "implementation", publicSymbols: ["run"],
    dependencies: [], dependents: [], missingDependencies: [] });
  const graph: ExplorerGraphPayload = {
    nodes: ["a", "b", "c", "d", "e", "isolated"].map(node),
    links: [["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"]].map(([source, target]) => ({ source, target, kind: "dependency" })),
    stats: { nodes: 6, links: 4, references: 4, dependenciesOutsideScan: 0 }
  };
  const run: ScopeRun = { bundle: "repository", base: "/", scopeName: "chain", subject: "a", scope: ["a"] };


  it("takes hops from the pins themselves, without silently adding another hop through their retained neighbors", () => {
    const tuning = getDefaultTuning().forceGraph;
    // The isolated file is a group the hops do not reach: it stands in the picture by its seed, past the last hop (2026-11-02), never as a hop.
    const one = spatialReport(graph, run, { ...tuning, hops: 1 }, 500);
    expect(one.nodes.map(node => node.id)).toEqual(["a", "b", "isolated"]);
    const two = spatialReport(graph, run, { ...tuning, hops: 2 }, 500);
    expect(two.nodes.map(node => node.id)).toEqual(["a", "b", "c", "isolated"]);
  });

  it("reveals a whole root as directory members, keeping disconnected files without turning all members into direct pins", () => {
    const tuning = getDefaultTuning().forceGraph;
    const report = spatialReport(graph, run, tuning, 500, { showTests: true, showAssets: true }, [], "connections", true);
    const data = spatialGraphOf(graph, () => true, [], "connections");
    const expected = easeSpatialLayout(data.nodes, data.links, tuning, "connections", { maxTicks: 500,
      reveal: { asked: new Set(), members: new Set(data.nodes.map(node => node.id)) } });
    expect(report.nodes.map(node => node.id)).toEqual(graph.nodes.map(node => node.id));
    expect(report.nodes.map(node => [node.x, node.y, node.z])).toEqual(expected.nodes.map(node => [node.x, node.y, node.z]));
    expect(report.still).toBe(true);
  });
});
