import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { getVisibleConnections, type PinSet } from "../pin-state";
import { buildSelfLoopEdges } from "./subgraph-builder";
import type { LocalEdge, LocalSubgraph } from "./types";

/** A disclosed exploration, with every connection between its retained files. */
export interface BranchGraph {
  subgraph: LocalSubgraph;
  columns: ExplorerNodePayload[][];
  hiddenConnections: Map<string, number>;
}

/**
 * Disclose the union of independent pins. Once both endpoints are present,
 * retain their relationship even when neither pin directly requested it.
 * Filters hide neighbors, but never the selected or explicitly pinned files.
 */
export function buildBranches(
  center: ExplorerNodePayload,
  graph: ExplorerGraphPayload,
  pins: PinSet,
  include: (node: ExplorerNodePayload) => boolean
): BranchGraph {
  const id = (endpoint: string | { id: string }): string => typeof endpoint === "string" ? endpoint : endpoint.id;
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const retained = new Set([center.id, ...pins.entries.map(pin => pin.nodeId)]);
  for (const { link } of getVisibleConnections(pins, graph.links)) {
    for (const endpoint of [id(link.source), id(link.target)]) {
      const node = byId.get(endpoint);
      if (node && include(node)) retained.add(endpoint);
    }
  }
  const nodes = [...retained].flatMap(key => byId.get(key) ?? []);
  const links: LocalEdge[] = [];
  const hiddenConnections = new Map<string, number>();
  for (const link of graph.links) {
    const sourceId = id(link.source), targetId = id(link.target);
    if (retained.has(sourceId) && retained.has(targetId)) {
      links.push({ sourceId, targetId, sourceSymbol: link.sourceSymbol, targetSymbol: link.targetSymbol,
        kind: link.kind, direction: sourceId === center.id ? "outbound" : "inbound" });
    } else {
      for (const endpoint of new Set([sourceId, targetId])) {
        if (retained.has(endpoint)) hiddenConnections.set(endpoint, (hiddenConnections.get(endpoint) ?? 0) + 1);
      }
    }
  }
  const keys = new Set(links.map(edgeKey));
  for (const node of nodes) for (const edge of buildSelfLoopEdges(node)) {
    if (!keys.has(edgeKey(edge))) { links.push(edge); keys.add(edgeKey(edge)); }
  }
  return {
    subgraph: { center, nodes, links, inboundIds: new Set(), outboundIds: new Set() },
    columns: rankBranches(nodes, links),
    hiddenConnections
  };
}

function edgeKey(edge: LocalEdge): string {
  return JSON.stringify([edge.sourceId, edge.targetId, edge.sourceSymbol, edge.targetSymbol, edge.kind]);
}

/**
 * Rank providers before consumers. Strongly connected components share a
 * column, so cycles terminate without dropping edges or duplicating files.
 */
export function rankBranches(nodes: ExplorerNodePayload[], links: LocalEdge[]): ExplorerNodePayload[][] {
  const successors = new Map(nodes.map(node => [node.id, new Set<string>()]));
  for (const edge of links) {
    if (successors.has(edge.sourceId)) successors.get(edge.targetId)?.add(edge.sourceId);
  }
  const index = new Map<string, number>(), low = new Map<string, number>();
  const stack: string[] = [], onStack = new Set<string>(), components: string[][] = [];
  const visit = (id: string): void => {
    index.set(id, index.size); low.set(id, index.get(id)!); stack.push(id); onStack.add(id);
    for (const next of successors.get(id) ?? []) {
      if (!index.has(next)) { visit(next); low.set(id, Math.min(low.get(id)!, low.get(next)!)); }
      else if (onStack.has(next)) low.set(id, Math.min(low.get(id)!, index.get(next)!));
    }
    if (low.get(id) === index.get(id)) {
      const component: string[] = [];
      let member: string;
      do { member = stack.pop()!; onStack.delete(member); component.push(member); } while (member !== id);
      components.push(component);
    }
  };
  for (const id of [...successors.keys()].sort()) if (!index.has(id)) visit(id);
  const componentOf = new Map(components.flatMap((members, i) => members.map(id => [id, i] as const)));
  const providers = components.map(() => new Set<number>());
  for (const edge of links) {
    const from = componentOf.get(edge.targetId), to = componentOf.get(edge.sourceId);
    if (from !== undefined && to !== undefined && from !== to) providers[to].add(from);
  }
  const ranks = new Map<number, number>();
  const rank = (component: number): number => {
    if (!ranks.has(component)) ranks.set(component, Math.max(0, ...[...providers[component]].map(p => rank(p) + 1)));
    return ranks.get(component)!;
  };
  const columns: ExplorerNodePayload[][] = [];
  for (const node of nodes) (columns[rank(componentOf.get(node.id)!)] ??= []).push(node);
  for (const column of columns) column.sort((a, b) => a.codeRelativePath.localeCompare(b.codeRelativePath));
  return columns;
}
