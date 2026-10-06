import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import type { SymbolOrder } from "../../types";
import { parentDirectory } from "../membraneView/pin-layout";
import { getVisibleConnections, type PinSet } from "../pin-state";
import { normalizeSymbolIdentifier } from "../symbolAnchors";
import { orderBranches, type BranchOrder, type ForwardReference } from "./branch-order";
import { rankByNetworkSimplex, type Constraint } from "./network-simplex";
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

/** The ranking's dials. */
export interface RankingOptions {
  /**
   * How strongly every file is pulled toward the last column, against the cost of the spans: zero ranks by the fewest
   * column spans alone; a weight above every pair's stands each file as far right as its consumers allow, which is the
   * longest-chain ranking the Local Map had before 2026-10-06.
   */
  pull?: number;
  /** Which column a file takes when several cost the same: the one with the fewest other cards (the rightmost among equals), the rightmost, or the leftmost. */
  tie?: "fewest" | "right" | "left";
}

/** The dials of the layout's first two steps. */
export interface BranchOptions {
  /** How a card's rows stand; the layout's own order when omitted. */
  symbolOrder?: SymbolOrder;
  ranking?: RankingOptions;
  order?: {
    /** How many left-and-right sweeps the ordering tries; four when omitted. */
    sweeps?: number;
    /** A seed for a shuffled starting order of each column; the ranking's order when omitted. */
    seed?: number;
  };
}

/** One reference's identity: its two files, its two symbols and its kind. */
export function edgeKey(edge: LocalEdge): string {
  return JSON.stringify([edge.sourceId, edge.targetId, edge.sourceSymbol, edge.targetSymbol, edge.kind]);
}

/**
 * Disclose the union of independent pins. Once both endpoints are present,
 * retain their relationship even when neither pin directly requested it.
 * Filters hide neighbors, but never the selected or explicitly pinned files.
 * The options set the layout's dials: the symbol order says how a card's rows
 * stand, by where their wires lead (the layout's choice), alphabetically, or as
 * the Live Doc lists them; the ranking's pull and tie rule and the order's
 * sweeps and seed are the layout lab's levers.
 */
export function buildBranches(
  center: ExplorerNodePayload,
  graph: ExplorerGraphPayload,
  pins: PinSet,
  include: (node: ExplorerNodePayload) => boolean,
  options: BranchOptions = {}
): BranchGraph {
  const symbolOrder = options.symbolOrder ?? "layout";
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
  const ranking = rankBranches(nodes, links, options.ranking);
  const rows = visibleRows(nodes, center.id, relevantSymbols, symbolOrder);
  const row = (symbol: string | undefined): string => normalizeSymbolIdentifier(symbol) ?? "__internals__";
  const forward: ForwardReference[] = links
    .filter(edge => edge.sourceId !== edge.targetId && !ranking.back.has(edgeKey(edge)))
    .map(edge => ({ key: edgeKey(edge), provider: edge.targetId, consumer: edge.sourceId,
      pin: `${edge.targetId}\0${row(edge.targetSymbol)}`, providerRow: row(edge.targetSymbol), consumerRow: row(edge.sourceSymbol) }));
  // A file's own references, which the ordering uses to break ties among its rows.
  const internal = new Map<string, [string, string][]>();
  for (const edge of links) {
    if (edge.sourceId !== edge.targetId) continue;
    (internal.get(edge.sourceId) ?? internal.set(edge.sourceId, []).get(edge.sourceId)!).push([row(edge.targetSymbol), row(edge.sourceSymbol)]);
  }
  const order = orderBranches({
    columns: ranking.columns.map(column => column.map(node => node.id)),
    directoryOf: nodeId => parentDirectory(byId.get(nodeId)?.codeRelativePath ?? nodeId),
    rows,
    // Only the layout order moves rows, and Internals keeps the foot of the card.
    movable: symbolOrder === "layout" ? name => name !== "__internals__" : undefined,
    edges: forward,
    internal,
    sweeps: options.order?.sweeps,
    seed: options.order?.seed
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
 * Rank providers before consumers so that the references cross the fewest
 * columns in all: every forward reference costs the columns it spans, and the
 * columns are the exact minimum of that sum, found by the same network simplex
 * that places the cards (Gansner, Koutsofios, North and Vo, section 2). A file
 * that could stand in several columns at the same cost takes the one with the
 * fewest cards, the rightmost among equals; a file nothing retained uses
 * stands in the last column, and so does every file no reference reaches. A
 * cycle is broken at the references that read backward in a provider-first
 * order of its members, so that every other reference flows left to right;
 * the broken ones are returned as `back`.
 */
export function rankBranches(nodes: ExplorerNodePayload[], links: LocalEdge[], options: RankingOptions = {}): BranchRanking {
  const pull = Math.max(0, options.pull ?? 0);
  const tie = options.tie ?? "fewest";
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
  // The columns: each forward reference, weighted by the references between its two files, costs the columns it
  // spans, and the solver finds the least total. Every file is a node; a reference is a constraint of at least one column.
  const at = new Map(ids.map((id, i) => [id, i]));
  const weights = new Map<string, number>();
  for (const edge of edges) {
    if (back.has(edgeKey(edge))) continue;
    const pair = `${edge.targetId}\0${edge.sourceId}`;
    weights.set(pair, (weights.get(pair) ?? 0) + 1);
  }
  const pairs: Constraint[] = [...weights].sort(([x], [y]) => x.localeCompare(y)).map(([pair, weight]) => {
    const [provider, consumer] = pair.split("\0");
    return { tail: at.get(provider)!, head: at.get(consumer)!, delta: 1, weight };
  });
  // The pull: a column past every file, toward which each file is drawn by the pull's weight, so that a file stands
  // further right than the spans alone would have it wherever the pull outweighs the spans it lengthens.
  const sink = ids.length;
  const pulls: Constraint[] = pull > 0 ? ids.map((_, v) => ({ tail: v, head: sink, delta: 0, weight: pull })) : [];
  const column = rankByNetworkSimplex(ids.length + (pull > 0 ? 1 : 0), [...pairs, ...pulls]).position.slice(0, ids.length);
  // Files no reference joins stand apart from one another, so each connected group ends at the last column, as a
  // file nothing uses does: the picture's right edge is where the chains end.
  const group = ids.map((_, i) => i);
  const find = (v: number): number => (group[v] === v ? v : (group[v] = find(group[v])));
  for (const edge of pairs) group[find(edge.tail)] = find(edge.head);
  const last = Math.max(0, ...column);
  const groupLast = new Map<number, number>();
  for (let v = 0; v < ids.length; v++) groupLast.set(find(v), Math.max(groupLast.get(find(v)) ?? 0, column[v]));
  for (let v = 0; v < ids.length; v++) column[v] += last - groupLast.get(find(v))!;
  // A file whose references weigh the same on both sides costs the same in any column between its providers and its
  // consumers (the pull counted on the consumers' side); by the tie rule it takes the column with the fewest other
  // cards, the rightmost among equals, so no stack grows for nothing, or the rightmost or leftmost outright.
  const cards = new Map<number, number>();
  for (const value of column) cards.set(value, (cards.get(value) ?? 0) + 1);
  for (let v = 0; v < ids.length; v++) {
    let inbound = 0, outbound = pull, low = 0, high = last;
    for (const edge of pairs) {
      if (edge.head === v) { inbound += edge.weight; low = Math.max(low, column[edge.tail] + 1); }
      if (edge.tail === v) { outbound += edge.weight; high = Math.min(high, column[edge.head] - 1); }
    }
    if (!inbound || inbound !== outbound) continue;
    let best = column[v];
    const others = (value: number): number => (cards.get(value) ?? 0) - (value === column[v] ? 1 : 0);
    if (tie === "right") best = high;
    else if (tie === "left") best = low;
    else for (let value = low; value <= high; value++) if (others(value) <= others(best)) best = value;
    cards.set(column[v], cards.get(column[v])! - 1);
    cards.set(best, (cards.get(best) ?? 0) + 1);
    column[v] = best;
  }
  const used = [...new Set(column)].sort((a, b) => a - b);
  const columns: ExplorerNodePayload[][] = used.map(() => []);
  nodes.forEach((node, i) => columns[used.indexOf(column[i])].push(node));
  for (const list of columns) list.sort((a, b) => a.codeRelativePath.localeCompare(b.codeRelativePath));
  return { columns, back };
}
