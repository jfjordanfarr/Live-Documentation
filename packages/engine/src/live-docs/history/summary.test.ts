import { describe, expect, it } from "vitest";

import type { GraphEdge, GraphFile, LiveDocGraph } from "../graph";
import { shapeOfSummary, summarizeGraph } from "./summary";

function file(codePath: string, archetype: string | undefined, symbols: number, entry: boolean, edges: Array<Partial<GraphEdge>>): GraphFile {
  return {
    codePath,
    docPath: `.mdmd/layer-4/${codePath}.mdmd.md`,
    layer: 4,
    archetype,
    entries: entry ? [{ reason: "declared" }] : [],
    authored: "",
    symbols: Array.from({ length: symbols }, (_, index) => ({ name: `s${index}`, kind: "function", flags: [], sections: [], references: [] })),
    dependencies: [],
    edges: edges.map((edge) => ({ kind: "import", label: "x", ...edge })),
    outbound: [],
    inbound: []
  };
}

function graph(...files: GraphFile[]): LiveDocGraph {
  return { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md", files: Object.fromEntries(files.map((entry) => [entry.codePath, entry])) };
}

describe("summarizeGraph", () => {
  it("counts each file's references by the file they land on, leaving out its references to itself and to nothing", () => {
    const summary = summarizeGraph(
      graph(
        file("b.ts", "implementation", 0, false, []),
        file("a.ts", "implementation", 2, true, [{ to: "b.ts" }, { to: "b.ts", kind: "returns" }, { to: "a.ts" }, { label: "node:fs" }, { to: "c.ts" }]),
        file("c.ts", "test", 1, false, [{ to: "a.ts" }])
      ),
      "lens",
      "abc"
    );
    expect(summary).toEqual({
      format: "live-docs-history-summary/2",
      lens: "lens",
      commit: "abc",
      files: [
        ["a.ts", "implementation", 2, 1],
        ["b.ts", "implementation", 0, 0],
        ["c.ts", "test", 1, 0]
      ],
      edges: [
        ["a.ts", "b.ts", 2],
        ["a.ts", "c.ts", 1],
        ["c.ts", "a.ts", 1]
      ],
      docLinks: []
    });
    const shape = shapeOfSummary(summary);
    expect(shape.files.get("a.ts")).toEqual({ archetype: "implementation", symbols: 2, entry: true });
    expect(shape.edges.size).toBe(3);
  });

  it("records the documents each file's authored words link to, each once, sorted, and only for files of the graph", () => {
    const summary = summarizeGraph(
      graph(file("a.ts", "implementation", 0, false, []), file("b.ts", "implementation", 0, false, [])),
      "lens",
      "abc",
      new Map([["b.ts", ["docs/z.md", "docs/a.md", "docs/z.md"]], ["gone.ts", ["docs/a.md"]]])
    );
    expect(summary.docLinks).toEqual([["b.ts", "docs/a.md"], ["b.ts", "docs/z.md"]]);
    expect([...shapeOfSummary(summary).docLinks].sort()).toEqual(["b.ts\u0000docs/a.md", "b.ts\u0000docs/z.md"]);
  });

  it("refuses a doc without an archetype, which only a generator bug writes", () => {
    expect(() => summarizeGraph(graph(file("a.ts", undefined, 0, false, [])), "lens", "abc")).toThrow("carries no archetype");
  });
});
