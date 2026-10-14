import { expect, it } from "vitest";

import { directoryNodeId, spatialGraphOf } from "./forceGraphData";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../shared/types";

const node = (id: string, symbols = 0): ExplorerNodePayload => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: `docs/${id}.md`,
  docRelativePath: `docs/${id}.md`, archetype: "implementation", publicSymbols: Array.from({ length: symbols }, (_, index) => `s${index}`),
  dependencies: [], dependents: [], missingDependencies: [] });
const graph = (): ExplorerGraphPayload => ({ nodes: [node("a"), node("b")], links: [
  { source: "a", target: "b", kind: "dependency", referenceCount: 3 },
  { source: { id: "b" }, target: { id: "a" }, kind: "type-reference", referenceCount: 2 }
], stats: { nodes: 2, links: 2, missingDependencies: 0 } });

it("shares one counted relationship for parallel and reciprocal facts without mutating the input graph", () => {
  const input = graph(), before = JSON.stringify(input);
  const data = spatialGraphOf(input, () => true);
  expect(data.links).toEqual([{ source: "a", target: "b", kind: "dependency", count: 5 }]);
  expect(data.nodes.every(file => file.directoryPath === undefined)).toBe(true);
  data.nodes[0].name = "changed copy";
  expect(JSON.stringify(input)).toBe(before);
});

it("includes authored documentation links while excluding Live Doc aliases, hidden code sources and dangling sources", () => {
  const data = spatialGraphOf(graph(), file => file.id === "a", [
    { sourceId: "a", targetPath: "README.md" }, { sourceId: "a", targetPath: "README.md" },
    { sourceId: "related:README.md", targetPath: "design.md" },
    { sourceId: "a", targetPath: "docs/a.md" }, { sourceId: "a", targetPath: "docs\\a.md" },
    { sourceId: "related:docs/a.md", targetPath: "excluded.md" },
    { sourceId: "b", targetPath: "hidden.md" }, { sourceId: "missing", targetPath: "dangling.md" }
  ]);
  expect(data.nodes.map(file => file.id)).toEqual(["a", "related:README.md", "related:design.md"]);
  expect(data.nodes[1]).toMatchObject({ archetype: "related-doc", publicSymbols: [], docPath: "README.md" });
  expect(data.links).toEqual([
    { source: "a", target: "related:README.md", kind: "related-doc", count: 2 },
    { source: "related:README.md", target: "related:design.md", kind: "related-doc", count: 1 }
  ]);
});

it("in the structure layout, hangs everything drawn from its directory and every directory from its parent, and collapses a hub that holds only one child", () => {
  const input: ExplorerGraphPayload = {
    nodes: [node("a/one.ts", 2), node("a/nested/two.ts", 5), node("ab/hidden.ts", 9), node("root.ts"), node("deep/chain/leaf.ts", 1)],
    links: [{ source: "a/one.ts", target: "a/nested/two.ts", kind: "dependency", referenceCount: 7 }],
    stats: { nodes: 5, links: 1, missingDependencies: 0 }
  };
  const before = JSON.stringify(input);
  const include = (file: ExplorerNodePayload): boolean => !file.id.startsWith("ab/");
  const docs = [{ sourceId: "a/one.ts", targetPath: "docs/readme.md" }];
  const data = spatialGraphOf(input, include, docs, "structure");
  const hub = (path: string) => data.nodes.find(file => file.id === directoryNodeId(path));
  expect(data.nodes.filter(file => file.directoryPath !== undefined).map(file => file.directoryPath).sort()).toEqual(["", "a", "a/nested", "deep/chain", "docs"]);
  expect(hub("deep")).toBeUndefined();
  expect(hub("deep/chain")).toMatchObject({ name: "deep/chain", directoryFileCount: 1, containedSymbolCounts: [1] });
  expect(hub("")).toMatchObject({ name: "Scan root", directoryFileCount: 4 });
  // The document hangs from its own directory and counts as a member of volume one; a chain's survivor keeps the chain's members.
  expect([...hub("")!.containedSymbolCounts!].sort()).toEqual([0, 0, 1, 2, 5]);
  expect([...hub("a")!.containedSymbolCounts!].sort()).toEqual([2, 5]);
  expect(hub("docs")).toMatchObject({ directoryFileCount: 0, containedSymbolCounts: [0] });
  // The references stay in the data, counted as in the connections layout; containment is one tree over everything drawn.
  expect(data.links.filter(link => link.kind !== "containment")).toEqual(spatialGraphOf(input, include, docs).links);
  const membership = data.links.filter(link => link.kind === "containment");
  expect(membership).toHaveLength(data.nodes.length - 1);
  expect(new Set(membership.map(link => link.target)).size).toBe(membership.length);
  expect(membership).toContainEqual({ source: directoryNodeId(""), target: directoryNodeId("deep/chain"), kind: "containment", count: 1 });
  expect(membership).toContainEqual({ source: directoryNodeId("a"), target: directoryNodeId("a/nested"), kind: "containment", count: 1 });
  expect(membership).toContainEqual({ source: directoryNodeId("docs"), target: "related:docs/readme.md", kind: "containment", count: 1 });
  expect(membership).not.toContainEqual(expect.objectContaining({ source: directoryNodeId(""), target: "a/nested/two.ts" }));
  expect(JSON.stringify(input)).toBe(before);
  expect(spatialGraphOf(input, () => false, [], "structure")).toEqual({ nodes: [], links: [] });
  expect(spatialGraphOf(input, include).nodes.every(file => file.directoryPath === undefined)).toBe(true);
});

it("keeps a scan root that holds only one directory, so that the tree always has its root", () => {
  const input: ExplorerGraphPayload = {
    nodes: [node("src/a.ts"), node("src/b.ts")], links: [], stats: { nodes: 2, links: 0, missingDependencies: 0 }
  };
  const data = spatialGraphOf(input, () => true, [], "structure");
  expect(data.nodes.map(file => file.id)).toEqual(["src/a.ts", "src/b.ts", directoryNodeId("src"), directoryNodeId("")]);
  expect(data.links).toEqual([
    { source: directoryNodeId("src"), target: "src/a.ts", kind: "containment", count: 1 },
    { source: directoryNodeId("src"), target: "src/b.ts", kind: "containment", count: 1 },
    { source: directoryNodeId(""), target: directoryNodeId("src"), kind: "containment", count: 1 }
  ]);
});
