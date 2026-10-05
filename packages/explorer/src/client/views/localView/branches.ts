import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import type { SymbolOrder } from "../../types";
import { parentDirectory } from "../membraneView/pin-layout";
import { getVisibleConnections, type PinSet } from "../pin-state";
import { normalizeSymbolIdentifier } from "../symbolAnchors";
import { orderBranches, type BranchOrder, type ForwardReference } from "./branch-order";
import { buildSelfLoopEdges } from "./subgraph-builder";
import type { LocalEdge, LocalSubgraph } from "./types";

/** A disclosed exploration, with every connection between its retained files. */
export interface BranchGraph {
  subgraph: LocalSubgraph;
  /** The files of each column, left to right, each column top to bottom in the chosen order. */
  columns: ExplorerNodePayload[][];
  hiddenConnections: Map<string, number>;
  relevantSymbols: Map<string, Set<string>>;
  /** The keys of the references that read against the columns: each cycle's feedback, drawn as stubs. */
  back: Set<string>;
  /** The rows each card shows, top to bottom, in the chosen symbol order; Internals last. */
  rows: Map<string, string[]>;
  /** The bands, lanes and crossings of the chosen order. */
  order: BranchOrder;
}

/** The ranking of retained files into columns, and the references the ranking reads backward. */
export interface BranchRanking {
  columns: ExplorerNodePayload[][];
  back: Set<string>;
}

/** One reference's identity: its two files, its two symbols and its kind. */
export function edgeKey(edge: LocalEdge): string {
  return JSON.stringify([edge.sourceId, edge.targetId, edge.sourceSymbol, edge.targetSymbol, edge.kind]);
}

/**
 * Disclose the union of independent pins. Once both endpoints are present,
 * retain their relationship even when neither pin directly requested it.
 * Filters hide neighbors, but never the selected or explicitly pinned files.
 * The symbol order says how a card's rows stand: by where their wires lead
 * (the layout's choice), alphabetically, or as the Live Doc lists them.
 */
export function buildBranches(
  center: ExplorerNodePayload,
  graph: ExplorerGraphPayload,
  pins: PinSet,
  include: (node: ExplorerNodePayload) => boolean,
  symbolOrder: SymbolOrder = "layout"
): BranchGraph {
  const id = (endpoint: string | { id: string }): string => typeof endpoint === "string" ? endpoint : endpoint.id;
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const retained = new Set([center.id, ...pins.entries.map(pin => pin.nodeId)]);
  const relevantSymbols = new Map<string, Set<string>>();
  const remember = (nodeId: string, symbol?: string): void => {
    const rows = relevantSymbols.get(nodeId) ?? new Set<string>();
    rows.add(symbol === "*" ? "*" : normalizeSymbolIdentifier(symbol) ?? "__internals__");
    relevantSymbols.set(nodeId, rows);
  };
  for (const pin of pins.entries) remember(pin.nodeId, pin.symbol);
  for (const { link } of getVisibleConnections(pins, graph.links)) {
    remember(id(link.source), link.sourceSymbol);
    remember(id(link.target), link.targetSymbol);
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
  const ranking = rankBranches(nodes, links);
  const rows = visibleRows(nodes, center.id, relevantSymbols, symbolOrder);
  const row = (symbol: string | undefined): string => normalizeSymbolIdentifier(symbol) ?? "__internals__";
  const forward: ForwardReference[] = links
    .filter(edge => edge.sourceId !== edge.targetId && !ranking.back.has(edgeKey(edge)))
    .map(edge => ({ key: edgeKey(edge), provider: edge.targetId, consumer: edge.sourceId,
      pin: `${edge.targetId}\0${row(edge.targetSymbol)}`, providerRow: row(edge.targetSymbol), consumerRow: row(edge.sourceSymbol) }));
  const order = orderBranches({
    columns: ranking.columns.map(column => column.map(node => node.id)),
    directoryOf: nodeId => parentDirectory(byId.get(nodeId)?.codeRelativePath ?? nodeId),
    rows,
    // Only the layout order moves rows, and Internals keeps the foot of the card.
    movable: symbolOrder === "layout" ? name => name !== "__internals__" : undefined,
    edges: forward
  });
  return {
    subgraph: { center, nodes, links, inboundIds: new Set(), outboundIds: new Set() },
    columns: order.columns.map(ids => ids.flatMap(nodeId => byId.get(nodeId) ?? [])),
    hiddenConnections,
    relevantSymbols,
    back: ranking.back,
    rows: order.rows,
    order
  };
}

/**
 * The rows each card will show, top to bottom, by their normalized names: every
 * row of a file retained whole or in focus, otherwise the rows some pin needs,
 * with Internals last; alphabetical when that order is chosen, otherwise as
 * the Live Doc lists them, which the layout order then moves by the wires.
 */
function visibleRows(nodes: readonly ExplorerNodePayload[], centerId: string, relevant: ReadonlyMap<string, ReadonlySet<string>>, symbolOrder: SymbolOrder): Map<string, string[]> {
  const rows = new Map<string, string[]>();
  for (const node of nodes) {
    const needed = relevant.get(node.id);
    const all = node.id === centerId || needed?.has("*");
    const names = node.publicSymbols.map(symbol => normalizeSymbolIdentifier(symbol) ?? symbol);
    const shown = all ? names : names.filter(name => needed?.has(name));
    if (symbolOrder === "alphabetical") shown.sort(compareSymbolNames);
    if (all || needed?.has("__internals__")) shown.push("__internals__");
    rows.set(node.id, shown);
  }
  return rows;
}

/** Alphabetical order of symbol names, case first set aside, then as the names compare. */
export function compareSymbolNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" }) || a.localeCompare(b);
}

/**
 * Rank providers before consumers, placing each as near its consumers as its
 * longest forward chain permits. A cycle is broken at the references that read
 * backward in a provider-first order of its members, so that every other
 * reference flows left to right; the broken ones are returned as `back`.
 */
export function rankBranches(nodes: ExplorerNodePayload[], links: LocalEdge[]): BranchRanking {
  const ids = nodes.map(node => node.id);
  const present = new Set(ids);
  const edges = links.filter(edge => edge.sourceId !== edge.targetId && present.has(edge.sourceId) && present.has(edge.targetId));
  // A link runs from the file that depends (its source) to the file it depends on (its target); the picture reads provider to consumer.
  const successors = new Map(ids.map(id => [id, new Set<string>()]));
  for (const edge of edges) successors.get(edge.targetId)!.add(edge.sourceId);
  const index = new Map<string, number>(), low = new Map<string, number>();
  const stack: string[] = [], onStack = new Set<string>(), components: string[][] = [];
  const visit = (id: string): void => {
    index.set(id, index.size); low.set(id, index.get(id)!); stack.push(id); onStack.add(id);
    for (const next of successors.get(id)!) {
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
  for (const id of [...ids].sort()) if (!index.has(id)) visit(id);
  const componentOf = new Map(components.flatMap((members, i) => members.map(id => [id, i] as const)));
  // Within a cycle, members stand provider-first, by Eades, Lin and Smyth's order: a file nothing in the cycle
  // serves goes to the front, one that serves nothing in it goes to the back, and otherwise the one that
  // serves the most more than it uses; what is left after each choice is looked at again.
  const rank = new Map<string, number>();
  for (const members of components) {
    const remaining = new Set(members);
    const serves = (id: string): number => [...successors.get(id)!].filter(consumer => remaining.has(consumer)).length;
    const uses = (id: string): number => [...remaining].filter(other => successors.get(other)!.has(id)).length;
    const front: string[] = [], back: string[] = [];
    while (remaining.size) {
      const sorted = [...remaining].sort();
      const sink = sorted.find(id => serves(id) === 0);
      if (sink) { back.unshift(sink); remaining.delete(sink); continue; }
      const source = sorted.find(id => uses(id) === 0);
      if (source) { front.push(source); remaining.delete(source); continue; }
      const choice = sorted.reduce((best, id) => serves(id) - uses(id) > serves(best) - uses(best) ? id : best);
      front.push(choice);
      remaining.delete(choice);
    }
    [...front, ...back].forEach((id, i) => rank.set(id, i));
  }
  const back = new Set<string>();
  const forward = new Map(ids.map(id => [id, new Set<string>()]));
  for (const edge of edges) {
    const provider = edge.targetId, consumer = edge.sourceId;
    if (componentOf.get(provider) === componentOf.get(consumer) && rank.get(provider)! > rank.get(consumer)!) back.add(edgeKey(edge));
    else forward.get(provider)!.add(consumer);
  }
  const distance = new Map<string, number>();
  const distanceToSink = (id: string): number => {
    if (!distance.has(id)) {
      distance.set(id, 0);
      distance.set(id, Math.max(0, ...[...forward.get(id)!].map(consumer => distanceToSink(consumer) + 1)));
    }
    return distance.get(id)!;
  };
  const lastColumn = Math.max(0, ...ids.map(distanceToSink));
  const columns: ExplorerNodePayload[][] = [];
  for (const node of nodes) (columns[lastColumn - distanceToSink(node.id)] ??= []).push(node);
  for (const column of columns) column.sort((a, b) => a.codeRelativePath.localeCompare(b.codeRelativePath));
  return { columns, back };
}
