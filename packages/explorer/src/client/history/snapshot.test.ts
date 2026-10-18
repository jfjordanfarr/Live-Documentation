import { describe, expect, it } from "vitest";

import { edgeKey, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import { snapshotGraphOf } from "./snapshot";
import { getDefaultTuning } from "../persistence/local-storage";
import { spatialGraphOf } from "../views/forceGraphData";
import { spatialNodeValue } from "../views/forceGraphLayout";

const shape: Shape = {
  files: new Map([
    ["src/b.ts", { archetype: "implementation", symbols: 3, entry: false }],
    ["src/a.ts", { archetype: "implementation", symbols: 1, entry: true }],
    ["tests/a.test.ts", { archetype: "test", symbols: 0, entry: false }]
  ]),
  edges: new Map([
    [edgeKey("src/a.ts", "src/b.ts"), 2],
    [edgeKey("tests/a.test.ts", "src/a.ts"), 1],
    [edgeKey("src/b.ts", "src/a.ts"), 1]
  ])
};

describe("snapshotGraphOf", () => {
  it("names a node per file, in path order, with its archetype, its symbol count and no names, and a link per directed edge with its count", () => {
    const graph = snapshotGraphOf(shape);
    expect(graph.nodes.map((node) => [node.id, node.name, node.archetype, node.symbolCount, node.publicSymbols.length, node.dependents])).toEqual([
      ["src/a.ts", "a.ts", "implementation", 1, 0, ["src/b.ts", "tests/a.test.ts"]],
      ["src/b.ts", "b.ts", "implementation", 3, 0, ["src/a.ts"]],
      ["tests/a.test.ts", "a.test.ts", "test", 0, 0, []]
    ]);
    expect(graph.links).toEqual([
      { source: "src/a.ts", target: "src/b.ts", kind: "dependency", referenceCount: 2 },
      { source: "src/b.ts", target: "src/a.ts", kind: "dependency", referenceCount: 1 },
      { source: "tests/a.test.ts", target: "src/a.ts", kind: "dependency", referenceCount: 1 }
    ]);
    expect(graph.stats).toEqual({ nodes: 3, links: 3, referencesOutsideScan: 0 });
  });

  it("is sized by the count where the 3D layout reads a file's symbols, and its hubs sum the counts", () => {
    const tuning = getDefaultTuning().forceGraph;
    const spatial = spatialGraphOf(snapshotGraphOf(shape), () => true, [], "structure");
    const b = spatial.nodes.find((node) => node.id === "src/b.ts")!;
    expect(spatialNodeValue(b, tuning)).toBe(Math.pow(1 + 3, tuning.symbolScale));
    const src = spatial.nodes.find((node) => node.id === "directory:src")!;
    expect([...(src.containedSymbolCounts ?? [])].sort()).toEqual([1, 3]);
    // The reciprocal edges merge into one counted pair, as today's references do.
    expect(spatial.links.find((link) => link.kind !== "containment" && link.source === "src/a.ts" && link.target === "src/b.ts")?.count).toBe(3);
  });
});
