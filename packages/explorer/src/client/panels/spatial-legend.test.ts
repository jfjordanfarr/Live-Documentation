import { expect, it } from "vitest";

import { spatialLegendRows } from "./spatial-legend";
import type { SpatialGraphData } from "../views/forceGraphData";

const node = (id: string, archetype: string): SpatialGraphData["nodes"][number] => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: "", docRelativePath: "",
  archetype, publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [], ...(archetype === "directory" ? { directoryPath: id } : {}) });
const link = (source: string, target: string, kind: SpatialGraphData["links"][number]["kind"]): SpatialGraphData["links"][number] =>
  ({ source, target, kind, count: 1, forward: 1, backward: 0 });

it("names the kinds drawn, the size rule, the wires' width, and nothing that is not on screen", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation"), node("a.test.ts", "test")], links: [link("a.ts", "a.test.ts", "dependency")] };
  expect(spatialLegendRows(graph, 1, { references: true, path: false, faded: false, frontier: false }).map(row => [row.shape, row.label])).toEqual([
    ["node", "Implementation"], ["node", "Test"], ["size", "Size: public symbols"], ["width", "Width: references"]
  ]);
  // The structure layout draws references on demand: with none drawn, the key says nothing of them.
  expect(spatialLegendRows(graph, 1, { references: false, path: false, faded: false, frontier: false }).map(row => row.shape)).toEqual(["node", "node", "size"]);
});

it("adds the path, the frontier, the fading, the folders' size rule and containment when they are drawn", () => {
  const graph: SpatialGraphData = { nodes: [node("src", "directory"), node("src/a.ts", "implementation")],
    links: [link("src", "src/a.ts", "containment"), link("src/a.ts", "src/b.ts", "dependency")] };
  const rows = spatialLegendRows(graph, 1, { references: true, path: true, faded: true, frontier: true });
  expect(rows.map(row => row.label)).toEqual([
    "Implementation", "Directory", "Size: file symbols; folders uniform", "Width: references",
    "Path", "Dimmed: a hop beyond; click to see more", "Faded: not on the path or hovered", "Contains"
  ]);
  expect(spatialLegendRows({ ...graph, nodes: [] }, 0, { references: true, path: false, faded: false, frontier: false }).map(row => row.shape)).toEqual(["width", "wire"]);
});
