import { describe, expect, it } from "vitest";

import { buildBranches, rankBranches } from "./branches";
import type { LocalEdge } from "./types";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { addPin, EMPTY_PIN_SET, removePin } from "../pin-state";

function node(id: string, archetype = "implementation"): ExplorerNodePayload {
  return { id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype, dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] };
}

describe("independent Local Map branches", () => {
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
    const reduced = buildBranches(nodes[0], graph, removePin(pins, "left", "value"), n => n.archetype !== "asset");
    expect(reduced.subgraph.nodes.map(n => n.id).sort()).toEqual(["base", "join", "left", "right"]);
  });

  it("keeps explicit asset pins despite filtering and keeps disconnected pins independently removable", () => {
    const pins = addPin(addPin(EMPTY_PIN_SET, "catalog", "*"), "outside", "value");
    const result = buildBranches(nodes[0], graph, pins, n => n.archetype !== "asset");
    expect(result.subgraph.nodes.map(n => n.id)).toEqual(["base", "catalog", "outside", "join"]);
    expect(removePin(pins, "catalog", "*").entries.map(p => p.nodeId)).toEqual(["outside"]);
  });

  it("terminates cycles, ranks their consumers after them, and loses no self-reference", () => {
    const cyclic: LocalEdge[] = [["left", "right"], ["right", "left"], ["join", "right"], ["left", "left"]]
      .map(([sourceId, targetId]) => ({ sourceId, targetId, kind: "dependency", direction: "outbound" }));
    const columns = rankBranches(nodes.slice(1, 4), cyclic);
    expect(columns.map(c => c.map(n => n.id))).toEqual([["left", "right"], ["join"]]);
    expect(cyclic).toHaveLength(4);
  });
});
