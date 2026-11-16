/**
 * The scene's measurer made from a capture: answers the layout's questions
 * about every card's width and height, every pin and every label, by the
 * card model, so a layout runs with no page at all. Each card shows what the
 * page would show it under the exploration being laid out: its rows in the
 * order the layout chose, the rows no pin needs hidden as the page hides
 * them, and the notes under it regenerated from the exploration.
 *
 * @module layout-lab/measurer
 */
import type { Capture, CardCapture, RowCapture } from "./capture";
import { cardMetrics, pinOffset, synthesizedHeight, textHeight, type CardMetrics, type CardView } from "./card-model";
import type { SymbolOrder } from "../../packages/explorer/src/client/types";
import type { SceneMeasurer } from "../../packages/explorer/src/client/views/localView/branch-scene";
import { compareSymbolNames, edgeKey, type BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";
import { HANDLE_STRIP } from "../../packages/explorer/src/client/views/localView/directory-handle";
import { connectionCount, returningConnections } from "../../packages/explorer/src/client/views/localView/returning-connections";
import type { LocalEdge } from "../../packages/explorer/src/client/views/localView/types";
import { countOf } from "../../packages/explorer/src/client/views/localView/word-seams";
import type { PinSet } from "../../packages/explorer/src/client/views/pin-state";
import { normalizeSymbolIdentifier } from "../../packages/explorer/src/client/views/symbolAnchors";

/** What the measurer needs to know of the page's state beyond the exploration: the pins, the subject and the collapse tuning. */
export interface MeasurerOptions {
  pins: PinSet;
  selected: string;
  /** The page's `collapseOnPin` tuning: whether a card not retained whole hides the rows no pin needs. */
  collapseOnPin: boolean;
  symbolOrder: SymbolOrder;
}

/** Every card's view under an exploration, as `dressCards` would dress it. */
export function cardViews(capture: Capture, branches: BranchGraph, options: MeasurerOptions): Map<string, CardView> {
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of branches.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  for (const pin of options.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  const pinnedWhole = new Set(options.pins.entries.filter(pin => pin.symbol === "*").map(pin => pin.nodeId));
  // Every card's rows are disclosed or hidden before any card counts its returns, as `dressCards` does since 2026-11-15:
  // a card's foot counts the returning references the picture draws at it, both rows shown, by the page's own function.
  const dressed: Array<{ card: CardCapture; registration: RowCapture[]; shown: RowCapture[]; hidden: number }> = [];
  /** Each card's rows by name, with whether the page would show them: a reference's end is drawn at a row shown. */
  const rowShown = new Map<string, Map<string, boolean>>();
  const views = new Map<string, CardView>();
  const nodes = new Map(branches.subgraph.nodes.map(node => [node.id, node]));
  for (const card of Object.values(capture.cards)) {
    const raw = new Map<string, RowCapture[]>();
    for (const row of card.rows) (raw.get(row.symbol) ?? raw.set(row.symbol, []).get(row.symbol)!).push(row);
    const symbols = [...(nodes.get(card.id)?.publicSymbols ?? [])];
    if (options.symbolOrder === "alphabetical") symbols.sort(compareSymbolNames);
    const registration: RowCapture[] = [];
    for (const symbol of symbols) {
      const row = raw.get(symbol)?.shift();
      if (row) registration.push(row);
    }
    for (const rows of raw.values()) registration.push(...rows);
    const byName = new Map<string, RowCapture[]>();
    for (const row of registration) {
      const name = normalizeSymbolIdentifier(row.symbol) ?? "__internals__";
      (byName.get(name) ?? byName.set(name, []).get(name)!).push(row);
    }
    const ordered: RowCapture[] = [];
    for (const name of branches.rows.get(card.id) ?? []) {
      const row = byName.get(name)?.shift();
      if (row) ordered.push(row);
    }
    for (const rows of byName.values()) ordered.push(...rows);
    const internals = ordered.filter(row => row.symbol === "__internals__");
    const rows = [...ordered.filter(row => row.symbol !== "__internals__"), ...internals];
    const all = pinnedWhole.has(card.id) || card.id === options.selected;
    const visible = (row: RowCapture): boolean => all || !options.collapseOnPin || connected.has(key(card.id, row.symbol));
    const shown = rows.filter(visible);
    const collapsed = rows.filter(row => !visible(row));
    // The page's reveal counts the public symbols it folded, never the Internals row (2026-10-16).
    const hidden = collapsed.filter(row => row.symbol !== "__internals__").length;
    dressed.push({ card, registration, shown, hidden });
    rowShown.set(card.id, new Map(rows.map(row => [normalizeSymbolIdentifier(row.symbol) ?? "__internals__", visible(row)] as const)));
  }
  // A reference's end stands on its own row. One with no row of its own, no symbol or one the card does not list, stands
  // where the page's anchors fall back (`getAnchor` of runtime.ts): the offering end on the card's outbound hub, which no
  // disclosure hides, the using end on the Internals row's dot, which the disclosure hides with the row (2026-11-16).
  const endShown = (id: string, symbol: string | undefined, side: "offers" | "uses"): boolean => {
    const own = symbol === undefined ? undefined : rowShown.get(id)?.get(normalizeSymbolIdentifier(symbol) ?? "__internals__");
    return own ?? (side === "offers" || (rowShown.get(id)?.get("__internals__") ?? true));
  };
  const returning = returningConnections(branches.subgraph.links, edge => branches.back.has(edgeKey(edge)),
    (edge: LocalEdge) => endShown(edge.targetId, edge.targetSymbol, "offers") && endShown(edge.sourceId, edge.sourceSymbol, "uses"));
  for (const { card, registration, shown, hidden } of dressed) {
    const noteFont = card.notes[0]?.font ?? card.directory.font;
    const notes: Array<(width: number) => number> = [];
    // The notes are worded as the page words them (`countOf`, a count and its unit joined by a no-break space since
    // 2026-10-30), so that the regenerated note wraps as the page's does and the captured one is known for what it is.
    if (hidden) notes.push(synthesizedHeight(capture, noteFont, `+${countOf(hidden, "symbol")}`));
    const back = connectionCount(returning.byFile.get(card.id) ?? []);
    if (back) notes.push(synthesizedHeight(capture, noteFont, `${countOf(back, "connection returns", "connections return")} in a cycle`));
    // The connections outside the view are the graph's, the same under every configuration: the captured line serves.
    for (const note of card.notes) {
      if (/^\+\d+\u00a0symbols?$/u.test(note.text) || /reads? back$|returns? in a cycle$/u.test(note.text)) continue;
      notes.push(width => textHeight(capture, note, width));
    }
    views.set(card.id, { rows: shown, registration, notes });
  }
  return views;
}

/** A measurer over the capture for one exploration. */
export function capturedMeasurer(capture: Capture, branches: BranchGraph, options: MeasurerOptions): SceneMeasurer & { metrics: Map<string, CardMetrics> } {
  const views = cardViews(capture, branches, options);
  const metrics = new Map<string, CardMetrics>();
  const readingWidths = new Map<string, number>();
  let widthCap = Infinity;
  const cardOf = (id: string): CardCapture => {
    const card = capture.cards[id];
    if (!card) throw new Error(`The capture has no card ${JSON.stringify(id)}; the scope's exploration has changed since it was taken.`);
    return card;
  };
  return {
    metrics,
    widths(cardMaxWidth) {
      widthCap = cardMaxWidth ?? Infinity;
      const widths = new Map<string, number>();
      for (const id of views.keys()) {
        const card = cardOf(id);
        if (card.readingWidth) {
          const width = Math.max(200, Math.min(card.readingWidth, cardMaxWidth ?? Infinity));
          readingWidths.set(id, width);
          widths.set(id, width);
        } else widths.set(id, Math.max(Math.min(card.naturalWidth, cardMaxWidth ?? Infinity), card.minWidth));
      }
      return widths;
    },
    measure(cardWidths, labelWidths) {
      const heights = new Map<string, number>();
      metrics.clear();
      for (const [id, width] of cardWidths) {
        const card = cardOf(id), readingWidth = readingWidths.get(id);
        const found = cardMetrics(capture, readingWidth ? { ...card, maxWidth: readingWidth } : card,
          Math.min(width, widthCap), views.get(id)!);
        metrics.set(id, found);
        heights.set(id, Math.round(found.height));
      }
      const labelHeights = new Map<string, number>();
      // A drawn directory's label is the strip the layout keeps for its handle, the page's own constant (2026-11-15).
      for (const key of labelWidths.keys()) labelHeights.set(key, HANDLE_STRIP);
            return {
        heights,
        pin: (id, direction, symbol) => {
          const found = metrics.get(id);
          const offset = found ? pinOffset(found, direction, symbol) : null;
          return offset === null ? null : Math.round(offset + 1e-3);
        },
        labelHeights
      };
    }
  };
}
