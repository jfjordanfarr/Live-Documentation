import { describe, expect, it } from "vitest";

import { parseLiveDoc, renderLiveDoc, type LiveDoc } from "@live-documentation/engine/live-docs/document";
import { deriveLiveDocGraph } from "@live-documentation/engine/live-docs/graph";


import { buildBranches, commonDirectory, directoryIndex, edgeKey, exploreBranches, isClosedDirectory, membraneDirectory, orderExploration, placeMembers, rankBranches } from "./branches";
import type { LocalEdge } from "./types";
import { explorerGraphOf } from "../../../shared/graph";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { addPin, EMPTY_PIN_SET, removePin, getVisibleConnections } from "../pin-state";

function node(id: string, archetype = "implementation"): ExplorerNodePayload {
  return { id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype, dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] };
}

const dependency = ([sourceId, targetId]: [string, string]): LocalEdge => ({ sourceId, targetId, direction: "outbound", kind: "dependency" });

describe("independent Local Map branches", () => {
  it("keeps an unpinned reading card without acquiring its neighborhood, and leaves an explicit path's scope intact", () => {
    const files = [node("src/caller"), node("src/provider"), node("src/private-neighbor")];
    const graph: ExplorerGraphPayload = {
      nodes: files,
      links: [
        { source: files[0].id, target: files[1].id, kind: "dependency" },
        { source: files[1].id, target: files[2].id, kind: "dependency" }
      ],
      stats: { nodes: 3, links: 2, references: 2, dependenciesOutsideScan: 0 }
    };
    const reading = [{ nodeId: files[1].id, open: true }];
    const readingOnly = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { reading });
    expect(readingOnly.subgraph.nodes.map(file => file.id)).toEqual([files[1].id]);
    expect(readingOnly.subgraph.links).toEqual([]);
    expect(readingOnly.hiddenConnections.get(files[1].id)).toBe(2);
    expect(readingOnly.order.rows.get(files[1].id)).toEqual(["value", "__internals__"]);
    expect(readingOnly.relevantSymbols.has(files[1].id)).toBe(false);
    const oneRow = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, {
      reading: [{ nodeId: files[1].id, symbol: "value", open: true }]
    });
    expect(oneRow.order.rows.get(files[1].id)).toEqual(["value"]);
    const pins = addPin(EMPTY_PIN_SET, files[0].id, "*");
    const alongside = exploreBranches(null, graph, pins, () => true, { reading });
    expect(alongside.subgraph.nodes.map(file => file.id)).toEqual([files[0].id, files[1].id]);
    expect(alongside.subgraph.links).toHaveLength(1);
    expect(pins.entries).toEqual([{ nodeId: files[0].id, symbol: "*" }]);
    const path = exploreBranches(null, graph, pins, () => true, {
      reading: [{ nodeId: files[2].id, open: true }], path: { nodeIds: [files[1].id, files[0].id] }
    });
    expect(path.subgraph.nodes.map(file => file.id)).toEqual([files[1].id, files[0].id]);
  });
  it("opens a file's filtered neighborhood through the common layout without storing pins", () => {
    const files = ["lib/provider", "app/start", "app/user", "other/remote", "tests/check"].map(id => node(id));
    const wires = [
      { source: files[1].id, target: files[0].id, sourceSymbol: "value", targetSymbol: "value", kind: "import" as const },
      { source: files[2].id, target: files[1].id, kind: "dependency" as const },
      { source: files[0].id, target: files[1].id, kind: "dependency" as const },
      { source: files[3].id, target: files[2].id, kind: "dependency" as const },
      { source: files[4].id, target: files[1].id, kind: "dependency" as const }
    ];
    const graph = { nodes: files, links: wires, stats: { nodes: 5, links: 5, references: 5, dependenciesOutsideScan: 0 } };
    const pins = { entries: [] };
    const result = exploreBranches(files[1], graph, pins, file => !file.id.startsWith("tests/"));
    expect(result.subgraph.nodes.map(file => file.id).sort()).toEqual(["app/start", "app/user", "lib/provider"]);
    expect(result.subgraph.links).toHaveLength(3);
    expect(result.subgraph.links).toContainEqual(expect.objectContaining({ kind: "import", sourceSymbol: "value", targetSymbol: "value" }));
    expect(result.directories.has("app")).toBe(true);
    expect(result.directories.has("lib")).toBe(true);
    expect(result.hiddenConnections.get("app/user")).toBe(1);
    expect(result.ranking.back.size).toBe(1);
    expect(pins.entries).toEqual([]);
    const isolated = exploreBranches(files[1], { ...graph, links: [] }, pins, () => false);
    expect(isolated.subgraph.nodes).toEqual([files[1]]);
    expect(isolated.subgraph.links).toEqual([]);
  });

  it("lays out only a path's forward adjacent hops while preserving endpoint symbols and unrelated pins", () => {
    const files = ["api/model", "service/handler", "ui/view", "outside/file"].map(id => node(id));
    const links = [
      { source: files[1].id, target: files[0].id, targetSymbol: "value", kind: "dependency" as const },
      { source: files[2].id, target: files[1].id, targetSymbol: "value", kind: "dependency" as const },
      { source: files[0].id, target: files[1].id, kind: "dependency" as const },
      { source: files[2].id, target: files[0].id, kind: "dependency" as const },
      { source: files[3].id, target: files[2].id, kind: "dependency" as const }
    ];
    const graph = { nodes: files, links, stats: { nodes: 4, links: 5, references: 5, dependenciesOutsideScan: 0 } };
    const pins = addPin(EMPTY_PIN_SET, files[3].id, "*");
    files[2].publicSymbols.push("unrelated");
    const result = exploreBranches(files[2], graph, pins, () => false, {
      path: { nodeIds: files.slice(0, 3).map(file => file.id), fromSymbol: "value", toSymbol: "value" },
      openDirectories: new Set(["outside"])
    });
    expect(result.subgraph.nodes).toEqual(files.slice(0, 3));
    expect(result.subgraph.links).toHaveLength(2);
    expect(result.subgraph.links.every(edge => edge.direction === "inbound")).toBe(true);
    expect(result.ranking.columns.map(column => column.map(file => file.id))).toEqual(files.slice(0, 3).map(file => [file.id]));
    expect(result.ranking.back.size).toBe(0);
    expect([...result.directories.keys()].sort()).toEqual(["api", "service", "ui"]);
    expect(result.relevantSymbols.get(files[2].id)).toEqual(new Set(["__internals__", "value"]));
    expect(result.order.rows.get(files[2].id)).toEqual(["value", "__internals__"]);
    expect(pins.entries).toEqual([{ nodeId: files[3].id, symbol: "*" }]);
  });

  it("places an independent provider beside its consumer instead of skipping an unrelated column", () => {
    const files = ["markdown", "symbols", "config", "check"].map(id => node(id));
    const edges: LocalEdge[] = ([["symbols", "markdown"], ["check", "symbols"], ["check", "config"]] as Array<[string, string]>).map(dependency);
    const ranking = rankBranches(files, edges);
    expect(ranking.columns.map(column => column.map(file => file.id))).toEqual([["markdown"], ["config", "symbols"], ["check"]]);
    expect(ranking.back.size).toBe(0);
  });

  it("keeps only externally needed rows relevant after a neighboring file's pins are released", () => {
    const files = [node("a"), node("b"), node("c")];
    const links = [
      { source: "a", target: "b", sourceSymbol: "value", targetSymbol: "used", kind: "dependency" as const },
      { source: "b", target: "c", sourceSymbol: "unrelated", targetSymbol: "value", kind: "dependency" as const }
    ];
    const graph = { nodes: files, links, stats: { nodes: 3, links: 2, references: 2, dependenciesOutsideScan: 0 } };
    const pins = addPin(EMPTY_PIN_SET, "a", "value");
    const result = buildBranches(files[0], graph, pins, () => true);
    expect([...result.relevantSymbols.get("b")!]).toEqual(["used"]);
    expect(result.subgraph.nodes.map(file => file.id)).toEqual(["a", "b"]);
    expect(result.hiddenConnections.get("b")).toBe(1);
  });

  it("explores once and orders from any start, as building in one go does", () => {
    const files = ["p", "q", "r", "s"].map(id => node(id));
    const wires = ([["q", "p"], ["r", "p"], ["s", "q"], ["s", "r"]] as Array<[string, string]>)
      .map(([source, target]) => ({ source, target, sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const }));
    const small: ExplorerGraphPayload = { nodes: files, links: wires, stats: { nodes: 4, links: 4, references: 4, dependenciesOutsideScan: 0 } };
    const pins = files.reduce((set, file) => addPin(set, file.id, "*"), EMPTY_PIN_SET);
    const exploration = exploreBranches(files[0], small, pins, () => true);
    expect(exploration.ranking.columns.map(column => column.map(file => file.id))).toEqual([["p"], ["q", "r"], ["s"]]);
    const ids = (graphed: ReturnType<typeof buildBranches>): string[][] => graphed.columns.map(column => column.map(file => file.id));
    for (const seed of [undefined, 1, 2]) {
      const once = buildBranches(files[0], small, pins, () => true, { order: { seed } });
      const again = orderExploration(exploration, { seed });
      expect(ids(again)).toEqual(ids(once));
      expect(again.order.crossings).toBe(once.order.crossings);
      expect([...again.rows]).toEqual([...once.rows]);
    }
    // A start of the previous picture's making: the second column the other way round, kept with no sweeps.
    const started = orderExploration(exploration, { sweeps: 0, start: [["p"], ["r", "q"], ["s"]] });
    expect(ids(started)).toEqual([["p"], ["r", "q"], ["s"]]);
  });

  const nodes = [node("base"), node("left"), node("right"), node("join"), node("outside"), node("catalog", "asset")];
  const links = [
    { source: "left", target: "base", targetSymbol: "value" },
    { source: "right", target: "base", targetSymbol: "value" },
    { source: "join", target: "left", targetSymbol: "value" },
    { source: "join", target: "right", targetSymbol: "value" },
    { source: "right", target: "left", targetSymbol: "other" },
    { source: "outside", target: "join", targetSymbol: "value" },
    { source: "catalog", target: "base" }
  ].map(link => ({ ...link, kind: "dependency" as const }));
  const graph: ExplorerGraphPayload = { nodes, links, stats: { nodes: nodes.length, links: links.length, references: links.length, dependenciesOutsideScan: 0 } };

  it("retains two branches and their unrequested cross-connection, without exposing the entire graph", () => {
    let pins = addPin(EMPTY_PIN_SET, "base", "value");
    pins = addPin(pins, "left", "value");
    pins = addPin(pins, "right", "value");
    const result = buildBranches(nodes[0], graph, pins, n => n.archetype !== "asset");
    expect(result.subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "join", "left", "right"]);
    expect(result.subgraph.links).toHaveLength(5);
    expect(result.subgraph.links).toContainEqual(expect.objectContaining({ sourceId: "right", targetId: "left", targetSymbol: "other" }));
    expect(result.hiddenConnections.get("join")).toBe(1);
    expect(result.hiddenConnections.get("base")).toBe(1);
    expect(result.columns.map(c => c.map(n => n.id))).toEqual([["base"], ["left"], ["right"], ["join"]]);
    expect(result.back.size).toBe(0);
    expect(result.order.crossings).toBe(0);
    const reduced = buildBranches(nodes[0], graph, removePin(pins, "left", "value"), n => n.archetype !== "asset");
    expect(reduced.subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "join", "left", "right"]);
  });

  it("keeps explicit asset pins despite filtering and keeps disconnected pins independently removable", () => {
    const pins = addPin(addPin(EMPTY_PIN_SET, "catalog", "*"), "outside", "value");
    const result = buildBranches(nodes[0], graph, pins, n => n.archetype !== "asset");
    // base, the center, holds no pin, so its own rows stay disclosed beside the pins: left and right are its dependents
    expect(result.subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "catalog", "join", "left", "outside", "right"]);
    expect(removePin(pins, "catalog", "*").entries.map(p => p.nodeId)).toEqual(["outside"]);
  });

  it("keeps the center's own rows disclosed while it holds no pin, and only its pins once it does", () => {
    // outside#value pinned, base the center without a pin: pinning elsewhere expands the picture, base's dependents stay
    const elsewhere = addPin(EMPTY_PIN_SET, "outside", "value");
    expect(buildBranches(nodes[0], graph, elsewhere, () => true).subgraph.nodes.map(n => n.id).sort())
      .toEqual(["base", "catalog", "join", "left", "outside", "right"]);
    // base narrowed to a symbol nothing references: left and right, which use base's value, go; catalog stays, since
    // its reference to base names no symbol and so counts for any pin on base
    const narrowed = addPin(elsewhere, "base", "other");
    expect(buildBranches(nodes[0], graph, narrowed, () => true).subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "catalog", "join", "outside"]);
  });

  it("breaks a cycle at one reference, ranks the rest forward, and loses no self-reference", () => {
    const cyclic: LocalEdge[] = ([["left", "right"], ["right", "left"], ["join", "right"], ["left", "left"]] as Array<[string, string]>).map(dependency);
    const ranking = rankBranches(nodes.slice(1, 4), cyclic);
    expect(ranking.columns.map(c => c.map(n => n.id))).toEqual([["left"], ["right"], ["join"]]);
    expect([...ranking.back]).toEqual([edgeKey(cyclic[0])]);
    const columnOf = new Map(ranking.columns.flatMap((column, i) => column.map(n => [n.id, i] as const)));
    for (const edge of cyclic) {
      if (edge.sourceId === edge.targetId || ranking.back.has(edgeKey(edge))) continue;
      expect(columnOf.get(edge.targetId)!, `${edge.targetId} offers to ${edge.sourceId}`).toBeLessThan(columnOf.get(edge.sourceId)!);
    }
    expect(cyclic).toHaveLength(4);
  });

  const columnsOf = (ranking: { columns: ExplorerNodePayload[][] }): string[][] => ranking.columns.map(column => column.map(file => file.id));
  const reference = (sourceId: string, targetId: string, targetSymbol?: string): LocalEdge => ({ sourceId, targetId, targetSymbol, direction: "outbound", kind: "dependency" });
  // base, m1, m2, m3, end: a chain of five, one file to a column.
  const chain = [reference("m1", "base"), reference("m2", "m1"), reference("m3", "m2"), reference("end", "m3")];

  it("ranks by the fewest column spans: a file that uses only the root and serves nothing stands beside the root", () => {
    // The longest-chain rule stood leaf in the last column, four columns from base, since nothing it serves held it back.
    const files = ["base", "m1", "m2", "m3", "end", "leaf"].map(id => node(id));
    const ranking = rankBranches(files, [...chain, reference("leaf", "base")]);
    expect(columnsOf(ranking)).toEqual([["base"], ["leaf", "m1"], ["m2"], ["m3"], ["end"]]);
    expect(ranking.back.size).toBe(0);
  });

  it("weighs a pair by its references, and gives a file that costs the same anywhere the column with the fewest cards, the rightmost among equals", () => {
    // two uses base through two symbols and end uses it once: its cost grows with every column it stands from base, so it stands beside base.
    // one uses base once and end uses it once: any column between costs the same; column 1 holds m1 and two, columns 2 and 3 one card each.
    const files = ["base", "m1", "m2", "m3", "end", "two", "one"].map(id => node(id));
    const edges = [...chain, reference("two", "base", "x"), reference("two", "base", "y"), reference("end", "two"), reference("one", "base"), reference("end", "one")];
    const ranking = rankBranches(files, edges);
    expect(columnsOf(ranking)).toEqual([["base"], ["m1", "two"], ["m2"], ["m3", "one"], ["end"]]);
  });

  it("pulls every file toward the last column by the pull's weight, up to the longest-chain ranking", () => {
    const files = ["base", "m1", "m2", "m3", "end", "leaf"].map(id => node(id));
    const edges = [...chain, reference("leaf", "base")];
    // A pull lighter than the one reference leaf has leaves the spans in charge; a heavier one stands leaf at the far right, as before 2026-10-06.
    expect(columnsOf(rankBranches(files, edges, { pull: 0.5 }))).toEqual([["base"], ["leaf", "m1"], ["m2"], ["m3"], ["end"]]);
    expect(columnsOf(rankBranches(files, edges, { pull: 2 }))).toEqual([["base"], ["m1"], ["m2"], ["m3"], ["end", "leaf"]]);
  });

  it("settles a tie by the rule asked: the fewest cards, the rightmost, or the leftmost column", () => {
    const files = ["base", "m1", "m2", "m3", "end", "two", "one"].map(id => node(id));
    const edges = [...chain, reference("two", "base", "x"), reference("two", "base", "y"), reference("end", "two"), reference("one", "base"), reference("end", "one")];
    expect(columnsOf(rankBranches(files, edges, { tie: "right" }))).toEqual([["base"], ["m1", "two"], ["m2"], ["m3", "one"], ["end"]]);
    expect(columnsOf(rankBranches(files, edges, { tie: "left" }))).toEqual([["base"], ["m1", "one", "two"], ["m2"], ["m3"], ["end"]]);
  });

  it("ends every unconnected group at the last column, where a file nothing uses stands", () => {
    const files = ["base", "mid", "end", "p", "q", "alone"].map(id => node(id));
    const ranking = rankBranches(files, [reference("mid", "base"), reference("end", "mid"), reference("q", "p")]);
    expect(columnsOf(ranking)).toEqual([["base"], ["mid", "p"], ["alone", "end", "q"]]);
  });

  it("breaks a longer cycle at the fewest references the provider-first order allows", () => {
    // a uses b uses c uses a, and d uses c: one reference must read backward, the other three flow.
    const files = ["a", "b", "c", "d"].map(id => node(id));
    const edges: LocalEdge[] = ([["a", "b"], ["b", "c"], ["c", "a"], ["d", "c"]] as Array<[string, string]>).map(dependency);
    const ranking = rankBranches(files, edges);
    expect(ranking.back.size).toBe(1);
    expect(ranking.columns.flat()).toHaveLength(4);
    const columnOf = new Map(ranking.columns.flatMap((column, i) => column.map(n => [n.id, i] as const)));
    for (const edge of edges) {
      if (ranking.back.has(edgeKey(edge))) continue;
      expect(columnOf.get(edge.targetId)!, `${edge.targetId} offers to ${edge.sourceId}`).toBeLessThan(columnOf.get(edge.sourceId)!);
    }
  });
});

describe("the membrane depth", () => {
  it("finds the directory every file shares, and cuts each file's directory to the levels below it", () => {
    expect(commonDirectory(["a/x", "a/x", "a/y", "a/y/z"])).toBe("a");
    expect(commonDirectory(["a/x", "b/x"])).toBe("");
    expect(commonDirectory(["a/x/y", "a/x/y"])).toBe("a/x/y");
    expect(commonDirectory([])).toBe("");
    expect(membraneDirectory("a/y/z", "a", null)).toBe("a/y/z");
    expect(membraneDirectory("a/y/z", "a", 0)).toBe("a");
    expect(membraneDirectory("a/y/z", "a", 1)).toBe("a/y");
    expect(membraneDirectory("a/y/z", "a", 5)).toBe("a/y/z");
    expect(membraneDirectory("a", "a", 2)).toBe("a");
    expect(membraneDirectory("b/x", "", 1)).toBe("b");
    expect(membraneDirectory("b/x", "", 0)).toBe("");
    // A directory not under the root, which cannot happen for a retained file, keeps the root.
    expect(membraneDirectory("c/d", "a", 1)).toBe("a");
  });

  it("gives the order step the directories of the chosen depth, every file in one at zero", () => {
    const files = ["a/x/f1", "a/x/f2", "a/y/g1", "a/y/z/h1"].map(id => node(id));
    const wires = ([["a/x/f2", "a/x/f1"], ["a/y/g1", "a/x/f1"], ["a/y/z/h1", "a/y/g1"]] as Array<[string, string]>)
      .map(([source, target]) => ({ source, target, sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const }));
    const graph: ExplorerGraphPayload = { nodes: files, links: wires, stats: { nodes: 4, links: 3, references: 3, dependenciesOutsideScan: 0 } };
    const pins = files.reduce((set, file) => addPin(set, file.id, "*"), EMPTY_PIN_SET);
    const directories = (depth: number | null): string[] => files.map(file => exploreBranches(files[0], graph, pins, () => true, { membraneDepth: depth }).order.directoryOf(file.id));
    expect(directories(null)).toEqual(["a/x", "a/x", "a/y", "a/y/z"]);
    expect(directories(1)).toEqual(["a/x", "a/x", "a/y", "a/y"]);
    expect(directories(0)).toEqual(["a", "a", "a", "a"]);
  });
});

describe("directories opening in the Local Map (2026-10-08)", () => {
  // A tree: a/x.ts and a/y.ts, a/sub/s.ts and a/sub/deep/d.ts, b/z.ts and b/w.ts; z uses x; y uses x.
  const tree = ["a/x.ts", "a/y.ts", "a/sub/s.ts", "a/sub/deep/d.ts", "b/z.ts", "b/w.ts"].map(id => node(id));
  const treeLinks = [
    { source: "b/z.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const },
    { source: "a/y.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const }
  ];
  const graph: ExplorerGraphPayload = { nodes: tree, links: treeLinks, stats: { nodes: 6, links: 2, references: 2, dependenciesOutsideScan: 0 } };
  const byId = new Map(tree.map(file => [file.id, file]));

  it("indexes every directory's own files and immediate subdirectories", () => {
    const index = directoryIndex(tree);
    expect(index.get("")!.subdirectories).toEqual(["a", "b"]);
    expect(index.get("a")).toEqual({ files: ["a/x.ts", "a/y.ts"], subdirectories: ["a/sub"] });
    expect(index.get("a/sub")).toEqual({ files: ["a/sub/s.ts"], subdirectories: ["a/sub/deep"] });
  });

  it("joins an opened directory's files as compact unwired members and its closed subdirectories as boxes, and counts what a membrane hides", () => {
    // z pinned whole retains x, its provider; y, which uses x, is not party: x is retained, not pinned.
    const pins = addPin(EMPTY_PIN_SET, "b/z.ts", "*");
    const plain = exploreBranches(byId.get("b/z.ts")!, graph, pins, () => true);
    expect(plain.subgraph.nodes.map(file => file.id).sort()).toEqual(["a/x.ts", "b/z.ts"]);
    expect(plain.directories.get("a")).toEqual({ state: "encasing", hiddenFiles: 1, hiddenDirectories: 1 });
    expect(plain.directories.get("b")).toEqual({ state: "encasing", hiddenFiles: 1, hiddenDirectories: 0 });

    const opened = exploreBranches(byId.get("b/z.ts")!, graph, pins, () => true, { openDirectories: new Set(["a"]) });
    expect(opened.subgraph.nodes.map(file => file.id).sort()).toEqual(["a/sub", "a/x.ts", "a/y.ts", "b/z.ts"]);
    expect([...opened.members]).toEqual(["a/y.ts"]);
    expect(opened.closed.get("a/sub")).toEqual({ path: "a/sub", name: "sub", files: 2, directories: 1 });
    const box = opened.subgraph.nodes.find(file => file.id === "a/sub")!;
    expect(isClosedDirectory(box)).toBe(true);
    expect(opened.order.rows.get("a/sub")).toEqual([]);
    // The member's reference to x is not drawn: it is a hidden connection of the member, and y shows no row.
    expect(opened.subgraph.links.filter(edge => edge.sourceId === "a/y.ts")).toEqual([]);
    expect(opened.hiddenConnections.get("a/y.ts")).toBe(1);
    expect(opened.order.rows.get("a/y.ts")).toEqual([]);
    expect(opened.directories.get("a")).toEqual({ state: "open", hiddenFiles: 0, hiddenDirectories: 0 });
    // The party's columns stand as ranked, x before z; a's two unwired items fill two columns from x's.
    expect(opened.ranking.columns.map(column => column.map(file => file.id))).toEqual([["a/x.ts", "a/sub"], ["b/z.ts", "a/y.ts"]]);
    expect(opened.order.directoryOf("a/sub")).toBe("a");
  });

  it("opens a subdirectory in place: its box becomes a membrane with its files compact and its own subdirectories closed", () => {
    const pins = addPin(EMPTY_PIN_SET, "b/z.ts", "*");
    const twice = exploreBranches(byId.get("b/z.ts")!, graph, pins, () => true, { openDirectories: new Set(["a", "a/sub"]) });
    expect(twice.subgraph.nodes.map(file => file.id).sort()).toEqual(["a/sub/deep", "a/sub/s.ts", "a/x.ts", "a/y.ts", "b/z.ts"]);
    expect(twice.closed.has("a/sub")).toBe(false);
    expect(twice.directories.get("a/sub")).toEqual({ state: "open", hiddenFiles: 0, hiddenDirectories: 0 });
    expect(twice.directories.get("a")).toEqual({ state: "open", hiddenFiles: 0, hiddenDirectories: 0 });
  });

  it("enters a directory with nothing pinned and no file in focus: a grid about as wide as tall, no wire", () => {
    const entry = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { openDirectories: new Set(["a"]) });
    expect(entry.subgraph.center).toBeNull();
    expect(entry.subgraph.links).toEqual([]);
    expect(entry.ranking.columns.map(column => column.map(file => file.id))).toEqual([["a/sub", "a/y.ts"], ["a/x.ts"]]);
    const ordered = orderExploration(entry);
    expect(ordered.columns.flat().map(file => file.id).sort()).toEqual(["a/sub", "a/x.ts", "a/y.ts"]);
    expect(ordered.order.bands.map(band => band.directory)).toEqual(["a"]);
  });

  describe("under the directory flow trial (2026-11-12)", () => {
    const ids = (columns: readonly (readonly ExplorerNodePayload[])[]): string[][] => columns.map(column => column.map(file => file.id));
    /** The links a card's lines stand for. */
    const drawnAt = (links: readonly LocalEdge[], card: string): number =>
      links.filter(edge => edge.sourceId === card || edge.targetId === card).reduce((sum, edge) => sum + (edge.gathered ?? 0), 0);

    it("joins each pair of cards by one line between their hubs, stands a file left of its users, and counts only what is not drawn", () => {
      const grid = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { openDirectories: new Set(["a"]) });
      const flow = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { openDirectories: new Set(["a"]), directoryFlow: { wrap: false } });
      // The same cards, still compact: no row is opened by a line.
      expect(flow.subgraph.nodes.map(file => file.id).sort()).toEqual(grid.subgraph.nodes.map(file => file.id).sort());
      expect([...flow.members].sort()).toEqual(["a/x.ts", "a/y.ts"]);
      expect(flow.order.rows.get("a/x.ts")).toEqual([]);
      expect(flow.order.rows.get("a/y.ts")).toEqual([]);
      expect(flow.relevantSymbols.size).toBe(0);
      // y uses x: one line, from x's hub to y's.
      expect(flow.subgraph.links).toEqual([
        { sourceId: "a/y.ts", targetId: "a/x.ts", sourceSymbol: "#hub", targetSymbol: "#hub", kind: "dependency", direction: "inbound", gathered: 1 }
      ]);
      // x stands left of y; the closed box heads the directory's first column and is told to keep it.
      expect(ids(flow.ranking.columns)).toEqual([["a/sub", "a/x.ts"], ["a/y.ts"]]);
      expect(flow.order.leading).toEqual(new Set(["a/sub"]));
      const ordered = orderExploration(flow);
      expect(ids(ordered.columns)).toEqual([["a/sub", "a/x.ts"], ["a/y.ts"]]);
      expect(ordered.back.size).toBe(0);
      // A card's count and its lines add up to the grid's count: y's one connection is drawn, x keeps z's, off screen.
      for (const card of ["a/x.ts", "a/y.ts"]) {
        expect((flow.hiddenConnections.get(card) ?? 0) + drawnAt(flow.subgraph.links, card), card).toBe(grid.hiddenConnections.get(card));
      }
      expect(flow.hiddenConnections.has("a/y.ts")).toBe(false);
      expect(flow.hiddenConnections.get("a/x.ts")).toBe(1);
    });

    it("joins a compact file to a retained one by a line, beside the retained files' wires between symbols", () => {
      // z pinned whole retains x, its provider, and their wire joins symbols; y, compact in the opened a, uses x.
      const pins = addPin(EMPTY_PIN_SET, "b/z.ts", "*");
      const flow = exploreBranches(byId.get("b/z.ts")!, graph, pins, () => true, { openDirectories: new Set(["a"]), directoryFlow: { wrap: false } });
      expect(flow.subgraph.links.filter(edge => edge.gathered === undefined && edge.sourceId !== edge.targetId))
        .toEqual([expect.objectContaining({ sourceId: "b/z.ts", targetId: "a/x.ts", sourceSymbol: "value", targetSymbol: "value" })]);
      expect(flow.subgraph.links.filter(edge => edge.gathered !== undefined))
        .toEqual([expect.objectContaining({ sourceId: "a/y.ts", targetId: "a/x.ts", gathered: 1 })]);
      expect(ids(flow.ranking.columns)).toEqual([["a/sub", "a/x.ts"], ["a/y.ts", "b/z.ts"]]);
      expect(flow.hiddenConnections.has("a/y.ts")).toBe(false);
    });

    it("stands the files no line joins after the directory's last column", () => {
      // b holds z, which uses a file not on screen, and w, which uses nothing: neither is joined, so b is the grid's b.
      const b = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { openDirectories: new Set(["b"]), directoryFlow: { wrap: false } });
      expect(b.subgraph.links).toEqual([]);
      expect(ids(b.ranking.columns)).toEqual(ids(exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { openDirectories: new Set(["b"]) }).ranking.columns));
      // With a and b both open, z's use of x is drawn across the two directories, and w stands after b's last column.
      const both = exploreBranches(null, graph, EMPTY_PIN_SET, () => true, { openDirectories: new Set(["a", "b"]), directoryFlow: { wrap: false } });
      expect(both.subgraph.links.map(edge => [edge.targetId, edge.sourceId, edge.gathered]).sort()).toEqual([["a/x.ts", "a/y.ts", 1], ["a/x.ts", "b/z.ts", 1]]);
      expect(ids(both.ranking.columns)).toEqual([["a/sub", "a/x.ts"], ["a/y.ts", "b/z.ts"], ["b/w.ts"]]);
      expect(both.hiddenConnections.size).toBe(0);
    });

    it("changes nothing where no directory is open: a pinned neighbourhood stands as it did", () => {
      const pins = addPin(EMPTY_PIN_SET, "b/z.ts", "*");
      const plain = exploreBranches(byId.get("b/z.ts")!, graph, pins, () => true);
      const trial = exploreBranches(byId.get("b/z.ts")!, graph, pins, () => true, { directoryFlow: { wrap: true } });
      expect(trial.subgraph).toEqual(plain.subgraph);
      expect(ids(trial.ranking.columns)).toEqual(ids(plain.ranking.columns));
      expect(trial.hiddenConnections).toEqual(plain.hiddenConnections);
      expect(trial.order.leading).toBeUndefined();
    });
  });

  it("lays an opened directory's items from its party's first column, as wide as its span or the square root of their count, appending columns", () => {
    const directoryOf = (id: string): string => id.slice(0, id.lastIndexOf("/"));
    const items = (directory: string): string[] => directory === "p" ? ["p/1", "p/2", "p/3", "p/4", "p/5"] : directory === "p/q" ? ["p/q/1", "p/q/2"] : [];
    // p's party stands in columns 1 and 2: five items over a width of three, from column 1, so column 3 is appended.
    expect(placeMembers([["o/a"], ["p/a"], ["p/b"]], new Set(["p"]), items, directoryOf)).toEqual([["o/a"], ["p/a", "p/1", "p/4"], ["p/b", "p/2", "p/5"], ["p/3"]]);
    // p/q has no party: its items start where p's do, and p's own start where its party does.
    expect(placeMembers([["o/a"], ["p/a"]], new Set(["p", "p/q"]), items, directoryOf)).toEqual([["o/a"], ["p/a", "p/1", "p/4", "p/q/1"], ["p/2", "p/5", "p/q/2"], ["p/3"]]);
    // Nothing pinned: from the first column.
    expect(placeMembers([], new Set(["p/q"]), items, directoryOf)).toEqual([["p/q/1"], ["p/q/2"]]);
  });
});

describe("a symbol pin's partners in its own file (2026-11-03)", () => {
  // lib/shapes: Shape extends Point, draw takes a Shape, Colour stands alone. Each is a reference within the file,
  // unresolved because it names no other doc, so it is a self-loop, not a link. app/paint's brush calls draw.
  const shapes: ExplorerNodePayload = { ...node("lib/shapes"), publicSymbols: ["Point", "Shape", "draw", "Colour"], publicSymbolsExtended: [
    { name: "Point" },
    { name: "Shape", typeReferences: [{ typeName: "Point", role: "extends", isResolved: false }] },
    { name: "draw", typeReferences: [{ typeName: "Shape", role: "parameter", parameterName: "shape", isResolved: false }] },
    { name: "Colour" }
  ] };
  const paint: ExplorerNodePayload = { ...node("app/paint"), publicSymbols: ["brush"] };
  const links = [{ source: "app/paint", target: "lib/shapes", sourceSymbol: "brush", targetSymbol: "draw", kind: "dependency" as const }];
  const graph: ExplorerGraphPayload = { nodes: [shapes, paint], links, stats: { nodes: 2, links: 1, references: 1, dependenciesOutsideScan: 0 } };
  // The rows the shapes card shows, sorted, with no file in focus, so that only the one pin decides them.
  const rows = (nodeId: string, symbol: string): string[] =>
    [...buildBranches(null, graph, addPin(EMPTY_PIN_SET, nodeId, symbol), () => true).rows.get("lib/shapes")!].sort();

  it("discloses, one hop either way, what the pinned symbol uses in its file and what there uses it", () => {
    const result = buildBranches(null, graph, addPin(EMPTY_PIN_SET, "lib/shapes", "Shape"), () => true);
    expect(result.relevantSymbols.get("lib/shapes")).toEqual(new Set(["Shape", "Point", "draw"]));
    expect([...result.rows.get("lib/shapes")!].sort(), "Colour stays folded").toEqual(["Point", "Shape", "draw"]);
    // Both self-references join rows the card shows, so both laces are drawn.
    expect(result.subgraph.links).toContainEqual(expect.objectContaining({ sourceId: "lib/shapes", targetId: "lib/shapes", sourceSymbol: "Shape", targetSymbol: "Point" }));
    expect(result.subgraph.links).toContainEqual(expect.objectContaining({ sourceId: "lib/shapes", targetId: "lib/shapes", sourceSymbol: "draw", targetSymbol: "Shape" }));
  });

  it("pinning the user discloses what it uses, pinning the used discloses its user, and neither goes a second hop", () => {
    expect(rows("lib/shapes", "draw"), "draw's Shape, not Shape's Point").toEqual(["Shape", "draw"]);
    expect(rows("lib/shapes", "Point"), "Point's user Shape, not Shape's user draw").toEqual(["Point", "Shape"]);
  });

  it("discloses nothing of a file's own from a row that a link between files lands on", () => {
    // brush pinned: its link discloses shapes' draw, and draw's own Shape stays folded, as draw's links elsewhere would.
    expect(rows("app/paint", "brush")).toEqual(["draw"]);
  });

  it("names the partners of the subject's own symbol pin, so that its card shows them connected rather than muted", () => {
    // The subject shows every row; once it holds a pin of its own, the rows that pin needs are the ones not muted.
    const subject = exploreBranches(shapes, graph, addPin(EMPTY_PIN_SET, "lib/shapes", "draw"), () => true);
    expect(subject.relevantSymbols.get("lib/shapes")).toEqual(new Set(["draw", "Shape"]));
    expect([...subject.order.rows.get("lib/shapes")!].sort()).toEqual(["Colour", "Point", "Shape", "__internals__", "draw"]);
  });
});

describe("documented symbol identities through projection and disclosure", () => {
  it("keeps kinds, overloads and exact local anchors distinct in pins and one-hop rows", () => {
    const location = { root: "docs", baseLayer: "source", extension: ".md" };
    const symbol = (name: string, slug: string, references: LiveDoc["symbols"][number]["references"] = []) =>
      ({ name, slug, kind: "function", flags: [], sections: [], references });
    const doc = (codePath: string, symbols: LiveDoc["symbols"], dependencies: LiveDoc["dependencies"] = []) => ({
      docPath: `docs/source/${codePath}.md`,
      doc: parseLiveDoc(renderLiveDoc({ codePath, layer: 4, archetype: "implementation", entries: [], authored: "### Purpose\nTest.", symbols, dependencies }))
    });
    const projected = explorerGraphOf(deriveLiveDocGraph([
      doc("walk.ts", [
        symbol("Neighbours", "symbol-neighbours"),
        symbol("Walk (interface)", "an-explicit-interface-anchor"),
        symbol("walk (function)", "symbol-walk-function", [
          { role: "Returns", types: [{ name: "Walk", link: "#an-explicit-interface-anchor" }] },
          { role: "Parameters", parameters: [{ name: "next", types: [{ name: "Neighbours", link: "#symbol-neighbours" }] }] }
        ]),
        symbol("read (method overload 1)", "symbol-read-method-overload-1"),
        symbol("read (method overload 2)", "symbol-read-method-overload-2")
      ]),
      doc("consumer.ts", [], [
        { label: "walk", link: "./walk.ts.md#symbol-walk-function", qualifiers: [] },
        { label: "read", link: "./walk.ts.md#symbol-read-method-overload-2", qualifiers: [] }
      ])
    ], location));
    const node = projected.nodes.find(n => n.id === "walk.ts")!;
    expect(node.publicSymbols).toEqual(["Neighbours", "Walk (interface)", "walk (function)", "read (method overload 1)", "read (method overload 2)"]);
    expect(projected.links.map(link => link.targetSymbol)).toEqual(["walk (function)", "read (method overload 2)"]);
    const pins = (symbol: string) => ({ entries: [{ nodeId: "walk.ts", symbol }] });
    expect(getVisibleConnections(pins("Walk (interface)"), projected.links)).toEqual([]);
    expect(getVisibleConnections(pins("walk (function)"), projected.links)).toHaveLength(1);
    expect(getVisibleConnections(pins("read (method overload 1)"), projected.links)).toEqual([]);
    expect(getVisibleConnections(pins("read (method overload 2)"), projected.links)).toHaveLength(1);
    const neighbours = buildBranches(node, projected, pins("Neighbours"), () => true);
    expect([...neighbours.relevantSymbols.get(node.id)!].sort()).toEqual(["Neighbours", "walk (function)"].sort());
    const walk = buildBranches(node, projected, pins("walk (function)"), () => true);
    expect([...walk.relevantSymbols.get(node.id)!].sort()).toEqual(["Neighbours", "Walk (interface)", "walk (function)"].sort());
    expect(walk.subgraph.links).toContainEqual(expect.objectContaining({sourceSymbol:"walk (function)",targetSymbol:"Walk (interface)"}));
  });
});
