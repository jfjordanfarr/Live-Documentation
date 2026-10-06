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
import { cardMetrics, labelHeight, pinOffset, synthesizedHeight, textHeight, type CardMetrics, type CardView } from "./card-model";
import type { SceneMeasurer } from "../../packages/explorer/src/client/views/localView/branch-scene";
import { edgeKey, type BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";
import type { PinSet } from "../../packages/explorer/src/client/views/pin-state";
import { normalizeSymbolIdentifier } from "../../packages/explorer/src/client/views/symbolAnchors";

/** What the measurer needs to know of the page's state beyond the exploration: the pins, the subject and the collapse tuning. */
export interface MeasurerOptions {
  pins: PinSet;
  selected: string;
  /** The page's `collapseOnPin` tuning: whether a card not retained whole hides the rows no pin needs. */
  collapseOnPin: boolean;
}

/** Every card's view under an exploration, as `dressCards` would dress it. */
export function cardViews(capture: Capture, branches: BranchGraph, options: MeasurerOptions): Map<string, CardView> {
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of branches.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  for (const pin of options.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  const pinnedWhole = new Set(options.pins.entries.filter(pin => pin.symbol === "*").map(pin => pin.nodeId));
  const backReferences = new Map<string, number>();
  for (const edge of branches.subgraph.links) {
    if (!branches.back.has(edgeKey(edge))) continue;
    for (const id of new Set([edge.sourceId, edge.targetId])) backReferences.set(id, (backReferences.get(id) ?? 0) + 1);
  }
  const views = new Map<string, CardView>();
  for (const card of Object.values(capture.cards)) {
    const byName = new Map<string, RowCapture[]>();
    for (const row of card.rows) {
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
    const hidden = collapsed.length;
    const noteFont = card.notes[0]?.font ?? card.directory.font;
    const notes: Array<(width: number) => number> = [];
    if (hidden) notes.push(synthesizedHeight(capture, noteFont, `+${hidden} symbols`));
    const back = backReferences.get(card.id) ?? 0;
    if (back) notes.push(synthesizedHeight(capture, noteFont, `${back} ${back === 1 ? "reference reads" : "references read"} back`));
    // The connections outside the view are the graph's, the same under every configuration: the captured line serves.
    for (const note of card.notes) {
      if (/^\+\d+ symbols$/u.test(note.text) || /reads? back$/u.test(note.text)) continue;
      notes.push(width => textHeight(capture, note, width));
    }
    views.set(card.id, { rows: shown, hidden: collapsed, notes });
  }
  return views;
}

/** A measurer over the capture for one exploration. */
export function capturedMeasurer(capture: Capture, branches: BranchGraph, options: MeasurerOptions): SceneMeasurer & { metrics: Map<string, CardMetrics> } {
  const views = cardViews(capture, branches, options);
  const metrics = new Map<string, CardMetrics>();
  const cardOf = (id: string): CardCapture => {
    const card = capture.cards[id];
    if (!card) throw new Error(`The capture has no card ${JSON.stringify(id)}; the scope's exploration has changed since it was taken.`);
    return card;
  };
  return {
    metrics,
    widths(cardMaxWidth) {
      const widths = new Map<string, number>();
      for (const id of views.keys()) {
        const card = cardOf(id);
        widths.set(id, Math.max(Math.min(card.naturalWidth, cardMaxWidth ?? Infinity), card.minWidth));
      }
      return widths;
    },
    measure(cardWidths, labelWidths) {
      const heights = new Map<string, number>();
      metrics.clear();
      for (const [id, width] of cardWidths) {
        const found = cardMetrics(capture, cardOf(id), width, views.get(id)!);
        metrics.set(id, found);
        heights.set(id, Math.round(found.height));
      }
      const labelHeights = new Map<string, number>();
      for (const [key, width] of labelWidths) {
        // A box's key is its directory and a count; the label is the directory's.
        const directory = key.slice(0, key.indexOf("\0"));
        labelHeights.set(key, Math.round(labelHeight(capture, directory, width)));
      }
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
