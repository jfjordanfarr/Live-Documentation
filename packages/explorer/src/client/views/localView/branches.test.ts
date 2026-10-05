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
