import { expect, it } from "vitest";

import { spatialNodeStyles } from "../views/forceGraphAppearance";
import type { SpatialGraphData } from "../views/forceGraphData";
import { spatialLegendRows, type SpatialLegendRow } from "./spatial-legend";

const node = (id: string, archetype: string): SpatialGraphData["nodes"][number] => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: "", docRelativePath: "",
  archetype, publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [], ...(archetype === "directory" ? { directoryPath: id } : {}) });
const link = (source: string, target: string, kind: SpatialGraphData["links"][number]["kind"]): SpatialGraphData["links"][number] =>
  ({ source, target, kind, count: 1, forward: 1, backward: 0 });
/** Each row as its shape and the words drawn beside its samples. */
const words = (rows: SpatialLegendRow[]): string[][] => rows.map(row => [row.shape, ...row.marks.map(mark => mark.label)]);
const shapes = (rows: SpatialLegendRow[]): string[] => rows.map(row => row.shape);

it("names the kinds drawn in one row, the size rule, the wires' width, and nothing that is not on screen", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation"), node("a.test.ts", "test")], links: [link("a.ts", "a.test.ts", "dependency")] };
  expect(words(spatialLegendRows(graph, 1, { references: true, path: false, frontier: false, rings: false }))).toEqual([
    ["node", "Implementation", "Test"], ["size", "Symbols"], ["width", "References"]
  ]);
  // The structure layout draws references on demand: with none drawn, the key says nothing of them.
  expect(shapes(spatialLegendRows(graph, 1, { references: false, path: false, frontier: false, rings: false }))).toEqual(["node", "size"]);
});

it("adds the path, the frontier, the rings, the folders' size rule and containment when they are drawn", () => {
  const graph: SpatialGraphData = { nodes: [node("src", "directory"), node("src/a.ts", "implementation")],
    links: [link("src", "src/a.ts", "containment"), link("src/a.ts", "src/b.ts", "dependency")] };
  const rows = spatialLegendRows(graph, 1, { references: true, path: true, frontier: true, rings: true });
  expect(words(rows)).toEqual([
    ["node", "Implementation", "Directory"], ["size", "Symbols"], ["width", "References"],
    ["path", "Path"], ["frontier", "Beyond"], ["ring", "More connected"], ["wire", "Contains"]
  ]);
  // The folders' size rule is the size row's sentence, and said only while a folder is drawn.
  expect(rows[1].description).toBe("Size: the number of public symbols a file offers. Folders are all one size.");
  expect(spatialLegendRows({ ...graph, nodes: [graph.nodes[1]] }, 1, { references: true, path: false, frontier: false, rings: false })[1].description)
    .toBe("Size: the number of public symbols a file offers.");
  expect(shapes(spatialLegendRows({ ...graph, nodes: [] }, 0, { references: true, path: false, frontier: false, rings: false }))).toEqual(["width", "wire"]);
});

it("names a wrapped group, after the ring, only while a group is drawn wrapped (2026-11-05)", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation")], links: [] };
  const drawn = { references: true, path: false, frontier: true, rings: true };
  expect(shapes(spatialLegendRows(graph, 1, drawn))).not.toContain("wrapped");
  expect(shapes(spatialLegendRows(graph, 1, { ...drawn, wrapped: false }))).not.toContain("wrapped");
  const rows = spatialLegendRows(graph, 1, { ...drawn, wrapped: true });
  expect(shapes(rows)).toEqual(["node", "size", "frontier", "ring", "wrapped"]);
  expect(words(rows).at(-1)).toEqual(["wrapped", "Wrapped group"]);
});

it("names a directory shell, after the wrapped group, only while a shell is drawn (2026-11-05)", () => {
  const graph: SpatialGraphData = { nodes: [node("a.ts", "implementation")], links: [] };
  const drawn = { references: true, path: false, frontier: true, rings: false, wrapped: true };
  expect(shapes(spatialLegendRows(graph, 1, drawn))).not.toContain("shell");
  const rows = spatialLegendRows(graph, 1, { ...drawn, shells: true });
  expect(shapes(rows)).toEqual(["node", "size", "frontier", "wrapped", "shell"]);
  expect(words(rows).at(-1)).toEqual(["shell", "Directory shell"]);
});

it("draws at most two words beside a sample and keeps every row's sentence for its tooltip (2026-11-16)", () => {
  // Every row the key can build: every kind the map colours and one it does not know, every kind of link, everything drawn.
  const kinds = ["implementation", "test", "asset", "related-doc", "directory", "other", "unheard-of"];
  const nodes = kinds.map(kind => node(`${kind}.x`, kind));
  const links = (["dependency", "containment", "related-doc", "cited-by"] as const).map(kind => link(nodes[0].id, nodes[1].id, kind));
  const everything = { references: true, path: true, frontier: true, rings: true, wrapped: true, shells: true };
  const fullest = spatialLegendRows({ nodes, links }, 1, everything);
  expect(shapes(fullest)).toEqual(["node", "size", "width", "path", "frontier", "ring", "wrapped", "shell", "wire", "arrow", "arrow"]);
  // The size row's other sentence, where no folder is drawn.
  const rows = [...fullest, ...spatialLegendRows({ nodes: nodes.filter(each => each.archetype !== "directory"), links }, 1, everything)];
  const count = (label: string): number => label.trim().split(/\s+/u).length;
  for (const row of rows) {
    // The kinds' row is the one row of several samples: each kind's dot with its one word.
    if (row.shape === "node") for (const mark of row.marks) expect(count(mark.label), `"${mark.label}"`).toBe(1);
    else expect(row.marks.map(mark => mark.label).reduce((sum, label) => sum + count(label), 0), JSON.stringify(row.marks)).toBeLessThanOrEqual(2);
    for (const mark of row.marks) expect(mark.label, "no colon-led explanation, no instruction, no sentence").toMatch(/^[\p{L}-]+( [\p{L}-]+)?$/u);
    expect(row.description, `the ${row.shape} row's sentence`).toMatch(/^\p{Lu}.{20,}\.$/u);
  }
  expect(fullest[0].marks.map(mark => mark.label)).toEqual(Object.values(spatialNodeStyles()).map(style => style.label));
  expect(new Set(rows.map(row => row.description)).size, "each row has its own sentence").toBe(fullest.length + 1);
});

it("names the kinds of the files a skin draws within it, as cells, beside the spheres' (2026-11-16)", () => {
  // On the tidepool sample's Structure the bags were full of tests and assets, and the kinds' row named neither.
  const graph: SpatialGraphData = { nodes: [node("src/pool.ts", "implementation")], links: [] };
  const drawn = { references: false, path: false, frontier: false, rings: false, shells: true };
  expect(words(spatialLegendRows(graph, 1, { ...drawn, inside: ["test", "asset", "test"] }))[0]).toEqual(["node", "Implementation", "Test", "Asset"]);
  expect(words(spatialLegendRows(graph, 1, drawn))[0]).toEqual(["node", "Implementation"]);
  // A picture of skins alone still keys its files' kinds.
  expect(words(spatialLegendRows({ nodes: [], links: [] }, 1, { ...drawn, inside: ["asset"] }))[0]).toEqual(["node", "Asset"]);
});
