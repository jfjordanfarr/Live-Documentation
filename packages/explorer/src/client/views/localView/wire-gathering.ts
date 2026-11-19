/**
 * The overview band's wires (2026-11-06, the far bands' second milestone, after the owner's "'Sixth' order which
 * collapses all symbols down to a single highly-split-out node-level connection"): at the farthest band of the card
 * ladder every pair of cards joined by at least one wire is joined by exactly one, which stands for all of them, from the
 * offering file's node-level hub to the using file's, its width saying how many. A pinned symbol keeps its own wires
 * there, from its row's dots, since a pin is the reader's own mark. Pure: wires in, gathered wires out.
 *
 * @module wire-gathering
 */

import type { LocalEdge } from "./types";

/**
 * The registry's name for a card's node-level hubs, `inbound:#hub` and `outbound:#hub`, by which the overview band's
 * gathered wires find them (2026-11-06) and which a pair line of an opened directory carries for its symbols at both
 * ends (the directory flow trial, 2026-11-12); no symbol is named so.
 */
export const NODE_HUB = "#hub";

/**
 * Where a card's node-level hubs stand on the nominal card the Flow shape is priced on, their centre below the outer
 * top of the card's box, in the map's own units (2026-11-19): at the middle of the file name's first line, where no
 * symbol row can be mistaken for a hub's end. The page reads each card's own line (the branch renderer's `standHubs`),
 * which is not a constant: a name of one line, the nominal card's, shares its line with the room the node's controls
 * keep (local.css), 24 tall, at whose foot the text sits, and a longer name's first line is the text's own. The number is
 * that middle as the page drew it for a card whose name is one line (App.config of the estate sample, 28.56, in this
 * container's fonts on 2026-11-19), on the layout's half-pixel grid; a browser case holds the page to it. Until then a
 * hub stood half way down its card, level with whichever row stood there, and the owner read a line's end as that row's.
 */
export const HUB_CENTRE = 28.5;

/** One wire standing for every wire from one file to another at the overview band. */
export interface GatheredWire {
  /** The pair's key, the offering file's id and the using file's, in that order. */
  key: string;
  /** The file that offers, where every member wire leaves (a wire's `targetId`). */
  providerId: string;
  /** The file that uses, where every member wire arrives (a wire's `sourceId`). */
  consumerId: string;
  /** The member wires, in the order they came. */
  members: readonly LocalEdge[];
  /** Whether its wires read against the columns, a cycle's return, which is drawn as laces at its ends. */
  back: boolean;
}

/** The least and greatest width of a gathered wire, in the map's own pixels: one wire's own width, and four times it. */
export const GATHERED_WIDTH = { least: 2.2, greatest: 8.8 } as const;

/**
 * Every pair of files joined by a wire, once each way: the wires from one file to another gathered under one, in the
 * order their first member came. A file's wires to itself join no pair of cards and are left out; a pinned symbol's own
 * self-references are drawn by {@link ownWires}.
 */
export function gatherWires(edges: readonly LocalEdge[], isBack: (edge: LocalEdge) => boolean): GatheredWire[] {
  const pairs = new Map<string, { providerId: string; consumerId: string; members: LocalEdge[] }>();
  for (const edge of edges) {
    if (edge.sourceId === edge.targetId) continue;
    const key = JSON.stringify([edge.targetId, edge.sourceId]);
    const pair = pairs.get(key) ?? pairs.set(key, { providerId: edge.targetId, consumerId: edge.sourceId, members: [] }).get(key)!;
    pair.members.push(edge);
  }
  return [...pairs].map(([key, pair]) => ({ key, ...pair, back: pair.members.every(isBack) }));
}

/**
 * The wires a pinned symbol keeps at the overview band: every wire with a pinned symbol at either end, by its symbols as
 * the rows carry them. A self-reference is kept only when both its ends are pinned, since only then are both its rows
 * drawn; any other wire has at least one end on a drawn row and the other on its file's hub at worst.
 */
export function ownWires(edges: readonly LocalEdge[], isPinned: (nodeId: string, symbol: string | undefined, end: "inbound" | "outbound") => boolean): LocalEdge[] {
  return edges.filter(edge => {
    const offers = isPinned(edge.targetId, edge.targetSymbol, "outbound"), uses = isPinned(edge.sourceId, edge.sourceSymbol, "inbound");
    return edge.sourceId === edge.targetId ? offers && uses : offers || uses;
  });
}

/** A gathered wire's width in the map's own pixels: one wire's for one, growing with the logarithm of its count to a ceiling. */
export function gatheredWidth(count: number): number {
  if (!(count > 1)) return GATHERED_WIDTH.least;
  return Math.min(GATHERED_WIDTH.greatest, GATHERED_WIDTH.least + 1.6 * Math.log(count));
}

/**
 * How many references a gathered wire carries: one for each member wire, and for a member that is itself a pair line of
 * an opened directory, already gathered from the graph's links, as many as it stands for.
 */
export function gatheredCount(wire: Pick<GatheredWire, "members">): number {
  return wire.members.reduce((sum, member) => sum + (member.gathered ?? 1), 0);
}

/** The accessible description of a gathered wire: its two files and its count, by the names the cards show. */
export function gatheredDescription(wire: GatheredWire, nameOf: (nodeId: string) => string): string {
  const count = gatheredCount(wire);
  return `${nameOf(wire.providerId)} offers ${nameOf(wire.consumerId)} ${count} ${count === 1 ? "reference" : "references"}`;
}

/**
 * The accessible description of one drawn connection, in the scan's own names (2026-11-19, first for a returning
 * connection's laces): a pair line of an opened directory as a gathered wire is described; a reference by its two ends,
 * a row's symbol named in its file as the row's own name says it ("Post in PaymentService.cs"), an end at a file's
 * Internals or hub by the file alone.
 */
export function wireDescription(edge: LocalEdge, nameOf: (nodeId: string) => string): string {
  // A pair line carries its count (isPairLine of directory-flow.ts, which imports this module).
  if (edge.gathered !== undefined) return gatheredDescription({ key: "", providerId: edge.targetId, consumerId: edge.sourceId, members: [edge], back: false }, nameOf);
  const end = (nodeId: string, symbol: string | undefined): string => (symbol && symbol !== NODE_HUB ? `${symbol} in ${nameOf(nodeId)}` : nameOf(nodeId));
  return `${end(edge.targetId, edge.targetSymbol)} offers ${end(edge.sourceId, edge.sourceSymbol)}`;
}

