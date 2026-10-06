import { describe, expect, it } from "vitest";

import { buildBranches, edgeKey, rankBranches } from "./branches";
import type { LocalEdge } from "./types";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { addPin, EMPTY_PIN_SET, removePin } from "../pin-state";

function node(id: string, archetype = "implementation"): ExplorerNodePayload {
  return { id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype, dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] };
}

const dependency = ([sourceId, targetId]: [string, string]): LocalEdge => ({ sourceId, targetId, direction: "outbound", kind: "dependency" });

describe("independent Local Map branches", () => {
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
    const graph = { nodes: files, links, stats: { nodes: 3, links: 2, missingDependencies: 0 } };
    const pins = addPin(EMPTY_PIN_SET, "a", "value");
    const result = buildBranches(files[0], graph, pins, () => true);
    expect([...result.relevantSymbols.get("b")!]).toEqual(["used"]);
    expect(result.subgraph.nodes.map(file => file.id)).toEqual(["a", "b"]);
    expect(result.hiddenConnections.get("b")).toBe(1);
  });

  const nodes = [node("base"), node("left"), node("right"), node("join"), node("outside"), node("catalog", "asset")];
  const links = [
    { source: "left", target: "base", targetSymbol: "symbol-value" },
    { source: "right", target: "base", targetSymbol: "symbol-value" },
    { source: "join", target: "left", targetSymbol: "symbol-value" },
    { source: "join", target: "right", targetSymbol: "symbol-value" },
    { source: "right", target: "left", targetSymbol: "symbol-other" },
    { source: "outside", target: "join", targetSymbol: "symbol-value" },
    { source: "catalog", target: "base" }
  ].map(link => ({ ...link, kind: "dependency" as const }));
  const graph: ExplorerGraphPayload = { nodes, links, stats: { nodes: nodes.length, links: links.length, missingDependencies: 0 } };

  it("retains two branches and their unrequested cross-connection, without exposing the entire graph", () => {
    let pins = addPin(EMPTY_PIN_SET, "base", "value");
    pins = addPin(pins, "left", "value");
    pins = addPin(pins, "right", "value");
    const result = buildBranches(nodes[0], graph, pins, n => n.archetype !== "asset");
    expect(result.subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "join", "left", "right"]);
    expect(result.subgraph.links).toHaveLength(5);
    expect(result.subgraph.links).toContainEqual(expect.objectContaining({ sourceId: "right", targetId: "left", targetSymbol: "symbol-other" }));
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
    expect(result.subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "catalog", "join", "outside"]);
    expect(removePin(pins, "catalog", "*").entries.map(p => p.nodeId)).toEqual(["outside"]);
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
