import { describe, expect, it } from "vitest";

import type { GraphEdge, GraphFile, LiveDocGraph } from "./graph";
import { components, enumerateTerminalPaths, fileGroups, getNeighbors, isEntry, pathTo, reachFrom, reachability, searchGraph, walk } from "./pathfind";

/** A graph from the files each file depends on, and the dependencies of each that resolved to no file. */
function graphOf(dependencies: Record<string, string[]>, unresolved: Record<string, string[]> = {}): LiveDocGraph {
  const files: Record<string, GraphFile> = {};
  const fileOf = (codePath: string): GraphFile => {
    files[codePath] ??= { codePath, docPath: `${codePath}.md`, archetype: "implementation", entries: [], edges: [], outbound: [], inbound: [], symbols: [] } as unknown as GraphFile;
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

describe("reachability", () => {
  // cli.ts (a command) depends on core.ts, which depends on util.ts; a test depends on core.ts and on a helper; a manifest
  // (tooling) stands alone; spare.ts depends on util.ts and nothing names it; orphan.ts and an unused image depend on
  // nothing; and nothing names a deploy script, whose kind no reader handles.
  const entries = graphOf({ "cli.ts": ["core.ts"], "core.ts": ["util.ts"], "core.test.ts": ["core.ts", "helper.ts"], "package.json": [], "spare.ts": ["util.ts"], "orphan.ts": [], "logo.png": [], "deploy.sh": [] });
  entries.files["cli.ts"].entries = [{ reason: "command", command: "run", declarer: { label: "package.json", link: "../package.json.md" } }];
  entries.files["core.test.ts"].archetype = "test";
  entries.files["package.json"].entries = [{ reason: "tooling" }];

  it("knows an entry by its lines or by the test archetype", () => {
    expect(isEntry(entries.files["cli.ts"])).toBe(true);
    expect(isEntry(entries.files["core.test.ts"])).toBe(true);
    expect(isEntry(entries.files["package.json"])).toBe(true);
    expect(isEntry(entries.files["core.ts"])).toBe(false);
  });

  it("walks from every entry, lists what is reached nearest first, what nothing reaches, what no reader handles, and what only a test reaches", () => {
    const result = reachability(entries);
    expect(result.from).toBe("entries");
    expect(result.starts).toEqual([
      { codePath: "cli.ts", entries: entries.files["cli.ts"].entries, test: false },
      { codePath: "core.test.ts", entries: [], test: true },
      { codePath: "package.json", entries: [{ reason: "tooling" }], test: false }
    ]);
    expect(result.reached).toEqual([{ codePath: "core.ts", hops: 1 }, { codePath: "helper.ts", hops: 1 }, { codePath: "util.ts", hops: 2 }]);
    expect(result.unreachable).toEqual(["logo.png", "orphan.ts", "spare.ts"]);
    expect(result.unread).toEqual(["deploy.sh"]);
    expect(result.testsOnly).toEqual(["helper.ts"]);
  });

  it("walks from the files asked for instead, in path order, with no test reading and no unknown file", () => {
    const result = reachability(entries, ["spare.ts", "missing.ts", "cli.ts", "spare.ts"]);
    expect(result.from).toBe("asked");
    expect(result.starts.map((start) => start.codePath)).toEqual(["cli.ts", "spare.ts"]);
    expect(result.reached).toEqual([{ codePath: "core.ts", hops: 1 }, { codePath: "util.ts", hops: 1 }]);
    expect(result.unreachable).toEqual(["core.test.ts", "helper.ts", "logo.png", "orphan.ts", "package.json"]);
    expect(result.unread).toEqual(["deploy.sh"]);
    expect(result.testsOnly).toEqual([]);
  });

  it("counts a file no reader handles as reached when a path leads to it, and as a start when it is an entry", () => {
    const wired = graphOf({ "main.ts": ["Estate.sln"], "ci.yml": [] });
    wired.files["main.ts"].entries = [{ reason: "program" }];
    wired.files["ci.yml"].entries = [{ reason: "declared" }];
    const result = reachability(wired);
    expect(result.starts.map((start) => start.codePath)).toEqual(["ci.yml", "main.ts"]);
    expect(result.reached).toEqual([{ codePath: "Estate.sln", hops: 1 }]);
    expect([result.unreachable, result.unread]).toEqual([[], []]);
  });

  it("holds the walk at the depth limit", () => {
    expect(reachability(entries, ["cli.ts"], 1).reached).toEqual([{ codePath: "core.ts", hops: 1 }]);
    expect(reachability(entries, ["cli.ts"], 1).unreachable).toContain("util.ts");
  });
});

describe("components", () => {
  // A chain m - n - o - p with q hanging off n, so n has three neighbours; an island x - y; two lone files, k and z.
  const links: Record<string, string[]> = { m: ["n"], n: ["o", "q"], o: ["p"], x: ["y"] };
  const ids = ["k", "m", "n", "o", "p", "q", "x", "y", "z"];
  const oneWay = (id: string): string[] => links[id] ?? [];

  it("partitions the files into groups, largest first, each with its most connected member as its seed, and a lone file as a group of one", () => {
    expect(components(ids, oneWay)).toEqual([
      { seed: "n", members: ["m", "n", "o", "p", "q"] },
      { seed: "x", members: ["x", "y"] },
      { seed: "k", members: ["k"] },
      { seed: "z", members: ["z"] }
    ]);
  });

  it("breaks a tie for the seed by id ascending, whichever member the walk meets first", () => {
    // In the chain e - d - c - b - a, the inner three tie at two neighbours; b is the least id among them.
    const chain: Record<string, string[]> = { e: ["d"], d: ["c"], c: ["b"], b: ["a"] };
    expect(components(["e", "d", "c", "b", "a"], (id) => chain[id] ?? [])).toEqual([{ seed: "b", members: ["a", "b", "c", "d", "e"] }]);
    // Two groups of one size are ordered by their seeds, not by where their members stand in the input.
    expect(components(["w", "v", "b", "a"], (id) => ({ w: ["v"], b: ["a"] })[id] ?? []).map((group) => group.seed)).toEqual(["a", "v"]);
  });

  it("joins a link's two ends whichever end names it, and gives the same answer for the ids in any order", () => {
    const reversed = (id: string): string[] => Object.entries(links).filter(([, targets]) => targets.includes(id)).map(([from]) => from);
    const expected = components(ids, oneWay);
    expect(components([...ids].reverse(), oneWay)).toEqual(expected);
    expect(components(ids, reversed)).toEqual(expected);
    expect(components([...ids].reverse(), (id) => [...oneWay(id), ...reversed(id)])).toEqual(expected);
  });

  it("ignores a neighbour outside the ids and a file named as its own neighbour", () => {
    expect(components(["a", "b"], (id) => (id === "a" ? ["a", "outside", "b"] : ["b"]))).toEqual([{ seed: "a", members: ["a", "b"] }]);
  });

  it("finds no group in no files", () => {
    expect(components([], oneWay)).toEqual([]);
  });

  it("groups a graph's files over their dependencies", () => {
    // a - b - c - d hang together, a's dependency on b and d's on c both counting; b and c tie at two neighbours, and b is the lesser id. e stands alone.
    expect(fileGroups(graph)).toEqual({ groups: [{ seed: "b", size: 4, members: ["a", "b", "c", "d"] }], alone: ["e"] });
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
