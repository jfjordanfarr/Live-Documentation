import { expect, it } from "vitest";

import { spatialGraphOf } from "./forceGraphData";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../shared/types";

const node = (id: string): ExplorerNodePayload => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: `docs/${id}.md`,
  docRelativePath: `docs/${id}.md`, archetype: "implementation", publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [] });
const graph = (): ExplorerGraphPayload => ({ nodes: [node("a"), node("b")], links: [
  { source: "a", target: "b", kind: "dependency", referenceCount: 3 },
  { source: { id: "b" }, target: { id: "a" }, kind: "type-reference", referenceCount: 2 }
], stats: { nodes: 2, links: 2, missingDependencies: 0 } });

it("shares one counted relationship for parallel and reciprocal facts without mutating the input graph", () => {
  const input = graph(), before = JSON.stringify(input);
  const data = spatialGraphOf(input, () => true);
  expect(data.links).toEqual([{ source: "a", target: "b", kind: "dependency", count: 5 }]);
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
