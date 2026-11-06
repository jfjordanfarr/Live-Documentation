import { expect, it } from "vitest";

import { spatialLegendRows } from "./spatial-legend";
import type { SpatialGraphData } from "../views/forceGraphData";

const node = (id: string, archetype: string): SpatialGraphData["nodes"][number] => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: "", docRelativePath: "",
  archetype, publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [], ...(archetype === "directory" ? { directoryPath: id } : {}) });
const link = (source: string, target: string, kind: SpatialGraphData["links"][number]["kind"]): SpatialGraphData["links"][number] =>
  ({ source, target, kind, count: 1, forward: 1, backward: 0 });

it("names the kinds drawn, the size rule, the wires' width, and nothing that is not on screen", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation"), node("a.test.ts", "test")], links: [link("a.ts", "a.test.ts", "dependency")] };
  expect(spatialLegendRows(graph, 1, { references: true, path: false, faded: false, frontier: false, rings: false }).map(row => [row.shape, row.label])).toEqual([
    ["node", "Implementation"], ["node", "Test"], ["size", "Size: public symbols"], ["width", "Width: references"]
  ]);
  // The structure layout draws references on demand: with none drawn, the key says nothing of them.
  expect(spatialLegendRows(graph, 1, { references: false, path: false, faded: false, frontier: false, rings: false }).map(row => row.shape)).toEqual(["node", "node", "size"]);
});

it("adds the path, the frontier, the rings, the fading, the folders' size rule and containment when they are drawn", () => {
  const graph: SpatialGraphData = { nodes: [node("src", "directory"), node("src/a.ts", "implementation")],
    links: [link("src", "src/a.ts", "containment"), link("src/a.ts", "src/b.ts", "dependency")] };
  const rows = spatialLegendRows(graph, 1, { references: true, path: true, faded: true, frontier: true, rings: true });
  expect(rows.map(row => row.label)).toEqual([
    "Implementation", "Directory", "Size: file symbols; folders uniform", "Width: references",
    "Path", "Dimmed: a hop beyond, or another group; click to see more", "Ring: more connected, not shown; click to see it", "Faded: not on the path or hovered", "Contains"
  ]);
  expect(spatialLegendRows({ ...graph, nodes: [] }, 0, { references: true, path: false, faded: false, frontier: false, rings: false }).map(row => row.shape)).toEqual(["width", "wire"]);
});

it("names a wrapped group, after the ring, only while a group is drawn wrapped (2026-11-05)", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation")], links: [] };
  const drawn = { references: true, path: false, faded: false, frontier: true, rings: true };
  expect(spatialLegendRows(graph, 1, drawn).map(row => row.shape)).not.toContain("wrapped");
  expect(spatialLegendRows(graph, 1, { ...drawn, wrapped: false }).map(row => row.shape)).not.toContain("wrapped");
  const rows = spatialLegendRows(graph, 1, { ...drawn, wrapped: true });
  expect(rows.map(row => row.shape)).toEqual(["node", "size", "frontier", "ring", "wrapped"]);
  expect(rows.at(-1)!.label).toBe("Wrapped group: its files, not shown; click to open it");
});

it("names a directory shell, after the wrapped group, only while a shell is drawn (2026-11-05)", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation")], links: [] };
  const drawn = { references: true, path: false, faded: false, frontier: true, rings: false, wrapped: true };
  expect(spatialLegendRows(graph, 1, drawn).map(row => row.shape)).not.toContain("shell");
  const rows = spatialLegendRows(graph, 1, { ...drawn, shells: true });
  expect(rows.map(row => row.shape)).toEqual(["node", "size", "frontier", "wrapped", "shell"]);
  expect(rows.at(-1)!.label).toBe("Shell: N files of a directory; click to open it");
});
