import { expect, it } from "vitest";

import { spatialLegendRows } from "./spatial-legend";
import type { SpatialGraphData } from "../views/forceGraphData";

const node = (id: string, archetype: string): SpatialGraphData["nodes"][number] => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: "", docRelativePath: "",
  archetype, publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [], ...(archetype === "directory" ? { directoryPath: id } : {}) });
const link = (source: string, target: string, kind: SpatialGraphData["links"][number]["kind"]): SpatialGraphData["links"][number] =>
  ({ source, target, kind, count: 1, forward: 1, backward: 0 });

it("names the kinds drawn, the size rule, the wires' directions and width, and nothing that is not on screen", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation"), node("a.test.ts", "test")], links: [link("a.ts", "a.test.ts", "dependency")] };
  expect(spatialLegendRows(graph, 1, { references: true, path: false, faded: false }).map(row => [row.shape, row.label])).toEqual([
    ["node", "Implementation"], ["node", "Test"], ["size", "Size: public symbols"],
    ["flow", "From what offers to what uses"], ["width", "Width: references"]
  ]);
  // The structure layout draws references on demand: with none drawn, the key says nothing of them.
  expect(spatialLegendRows(graph, 1, { references: false, path: false, faded: false }).map(row => row.shape)).toEqual(["node", "node", "size"]);
});

it("adds the path, the fading, the folders' size rule and containment when they are drawn", () => {
  const graph: SpatialGraphData = { nodes: [node("src", "directory"), node("src/a.ts", "implementation")],
    links: [link("src", "src/a.ts", "containment"), link("src/a.ts", "src/b.ts", "dependency")] };
  const rows = spatialLegendRows(graph, 1, { references: true, path: true, faded: true });
  expect(rows.map(row => row.label)).toEqual([
    "Implementation", "Directory", "Size: public symbols; a folder sums its files", "From what offers to what uses", "Width: references",
    "Path", "Faded: not pinned, on the path or hovered", "Contains"
  ]);
  expect(spatialLegendRows({ ...graph, nodes: [] }, 0, { references: true, path: false, faded: false }).map(row => row.shape)).toEqual(["flow", "width", "wire"]);
});
