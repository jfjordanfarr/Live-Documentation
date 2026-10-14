import { describe, expect, it } from "vitest";

import type { GraphEdge, GraphFile, LiveDocGraph } from "./graph";
import { enumerateTerminalPaths, getNeighbors, pathTo, reachFrom, searchGraph, walk } from "./pathfind";

/** A graph from the files each file depends on, and the dependencies of each that resolved to no file. */
function graphOf(dependencies: Record<string, string[]>, unresolved: Record<string, string[]> = {}): LiveDocGraph {
  const files: Record<string, GraphFile> = {};
  const fileOf = (codePath: string): GraphFile => {
    files[codePath] ??= { codePath, docPath: `${codePath}.md`, edges: [], outbound: [], inbound: [], symbols: [] } as unknown as GraphFile;
    return files[codePath];
  };
  for (const [from, targets] of Object.entries(dependencies)) {
    const file = fileOf(from);
    for (const to of targets) {
      fileOf(to).inbound.push(from);
      file.edges.push({ kind: "import", label: to, to } as GraphEdge);
      file.outbound.push(to);
    }
  }
  for (const [from, labels] of Object.entries(unresolved)) {
    for (const label of labels) {
      fileOf(from).edges.push({ kind: "import", label } as GraphEdge);
    }
  }
  return { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md", files } as LiveDocGraph;
}

// a depends on b, b on c; d depends on c too; e stands alone.
const graph = graphOf({ a: ["b"], b: ["c"], d: ["c"], e: [] }, { c: ["fs"] });
const outbound = (id: string): readonly string[] => getNeighbors(graph, id, "outbound");
const inbound = (id: string): readonly string[] => getNeighbors(graph, id, "inbound");

describe("walk", () => {
  it("reaches every file by the fewest hops, remembers how, and stops where nothing new lies beyond", () => {
    const found = walk(["a"], outbound);
    expect([...found.hops]).toEqual([["a", 0], ["b", 1], ["c", 2]]);
    expect([...found.parents]).toEqual([["b", "a"], ["c", "b"]]);
    expect(found.reached).toBeUndefined();
    expect(found.stops).toEqual([{ id: "c", reason: "terminal" }]);
    expect(pathTo(found, "c")).toEqual(["a", "b", "c"]);
  });

  it("ends at the first target met, a start among the targets at once", () => {
    const found = walk(["a"], outbound, Infinity, new Set(["c"]));
    expect(found.reached).toBe("c");
    expect(pathTo(found, found.reached!)).toEqual(["a", "b", "c"]);
    const self = walk(["a"], outbound, Infinity, new Set(["a"]));
    expect(self.reached).toBe("a");
    expect(pathTo(self, "a")).toEqual(["a"]);
  });

  it("walks from every start at depth 0 and does not expand a file at the depth limit", () => {
    const found = walk(["a", "d"], outbound, 1);
    expect([...found.hops]).toEqual([["a", 0], ["d", 0], ["b", 1], ["c", 1]]);
    expect(found.parents.get("c")).toBe("d");
    expect(found.stops).toEqual([{ id: "b", reason: "max-depth" }, { id: "c", reason: "max-depth" }]);
  });

  it("walks the other way along dependents", () => {
    expect([...walk(["c"], inbound).hops]).toEqual([["c", 0], ["b", 1], ["d", 1], ["a", 2]]);
  });
});

describe("reachFrom", () => {
  it("lists what a path reaches with its hops, never the starts themselves", () => {
    expect([...reachFrom(["c"], inbound)]).toEqual([["b", 1], ["d", 1], ["a", 2]]);
    expect([...reachFrom(["a", "b"], outbound)]).toEqual([["c", 1]]);
    expect(reachFrom(["e"], outbound).size).toBe(0);
    expect([...reachFrom(["c"], inbound, 1)]).toEqual([["b", 1], ["d", 1]]);
  });
});

describe("searchGraph", () => {
  it("finds the shortest path and the files it visited", () => {
    const result = searchGraph(graph, "a", "c", "outbound", 10);
    expect(result.path).toEqual(["a", "b", "c"]);
    expect([...result.visited]).toEqual(["a", "b", "c"]);
    expect(result.frontier).toEqual([]);
    expect(searchGraph(graph, "a", "a", "outbound", 10).path).toEqual(["a"]);
  });

  it("reports the frontier when there is no path: the stops, then an outbound search's unresolved dependencies", () => {
    const result = searchGraph(graph, "a", "d", "outbound", 10);
    expect(result.path).toBeUndefined();
    expect(result.frontier).toEqual([
      { node: "c", docPath: "c.md", reason: "terminal" },
      { node: "c", docPath: "c.md", reason: "missing-doc", missingDependency: "fs" }
    ]);
    expect(searchGraph(graph, "c", "e", "inbound", 10).frontier.map((entry) => entry.reason)).toEqual(["terminal", "terminal"]);
  });

  it("marks the files held at the depth limit", () => {
    const result = searchGraph(graph, "a", "c", "outbound", 1);
    expect(result.path).toBeUndefined();
    expect(result.frontier).toEqual([{ node: "b", docPath: "b.md", reason: "max-depth" }]);
  });
});

describe("enumerateTerminalPaths", () => {
  it("lists every path away from a file to where it ends", () => {
    expect(enumerateTerminalPaths(graph, "c", "inbound", 10).map((entry) => entry.nodes)).toEqual([["c", "d"], ["c", "b", "a"]]);
    expect(enumerateTerminalPaths(graph, "a", "outbound", 1)).toEqual([{ nodes: ["a", "b"] }]);
  });
});
