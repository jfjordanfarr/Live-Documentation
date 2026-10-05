import type { Lane } from "./branch-order";
import { placeBranches, type PlacementBand, type PlacementWire } from "./branch-placement";
import { LANE_PADDING, LANE_PITCH } from "./branch-routing";
import { buildBranches, edgeKey } from "./branches";
import { createNodeCard } from "./card-factory";
import type { LocalViewController } from "./controller";
import type { DirectoryBand } from "../membraneView/pin-layout";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/** The room between neighbouring cards and lanes of a column, in CSS pixels. */
const ITEM_GAP = 24;

/** The room between sibling directory boxes that share a column. */
const BAND_GAP = 28;

/** A directory box's padding and border, as `local.css` draws them. */
const BAND_PADDING = 12;
const BAND_BORDER = 1;

/** A box of the picture: a directory, the root, or a directory's loose files, with its element when it has one. */
interface Box {
  key: string;
  element: HTMLElement | null;
  /** The box this one lies in; null for the root. */
  parent: Box | null;
  /** The nearest box around this one with an element, whose padding box its elements are placed in; null for the layout root. */
  anchor: Box | null;
  directory: string;
  /** Padding plus border on each side, zero for a box drawn as nothing. */
  inset: number;
  insetTop: number;
  minColumn: number;
  maxColumn: number;
  row: number;
  items: string[];
  children: Box[];
  /** Set once placed. */
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A card or a lane: an item the placement stands in a column. */
interface Item {
  id: string;
  element: HTMLElement;
  column: number;
  box: Box;
  /** The sum of the insets of the boxes around it: how far its left edge stands inside its column. */
  inset: number;
}

/**
 * Render the independently retained branches with the Local Map's cards,
 * symbol pins and interface colours, placed on the vertical axis by the
 * exact placement of `branch-placement.ts`: the cards and lanes of every
 * column stand where the wires between pins are shortest, inside the
 * directory boxes the order chose. The elements keep the names the router,
 * the deck and the perspective transition read.
 */
export function renderBranches(controller: LocalViewController, root: HTMLElement): void {
  const { state, graphData } = controller.options;
  const branches = buildBranches(state.selectedNode!, graphData, controller.pins, node => controller.shouldIncludeNode(node), state.tuning.localMap.symbolOrder);
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  root.classList.add("branch-mode", "local-placed");
  root.style.gridTemplateColumns = "";
  root.style.alignItems = "";
  const { order } = branches;
  const columnCount = branches.columns.length;
  const byId = new Map(branches.subgraph.nodes.map(node => [node.id, node]));

  // The lanes by where they go: in a directory's stack of files, after a file or above the first; in a directory of directories, in a row.
  const stackLanes = new Map<string, Lane>();
  const rowLanes = new Map<string, Lane[]>();
  for (const lane of order.lanes.values()) {
    if (lane.row === null) stackLanes.set(`${lane.host}\0${lane.column}\0${lane.after ?? ""}`, lane);
    else (rowLanes.get(lane.host) ?? rowLanes.set(lane.host, []).get(lane.host)!).push(lane);
  }

  const items = new Map<string, Item>();
  const columns: string[][] = Array.from({ length: columnCount }, () => []);
  let boxCount = 0;
  const anchorOf = (box: Box): Box | null => (box.element ? box : box.anchor);
  const laneBox = (lane: Lane, parent: Box): Box => {
    const element = laneElement(lane);
    (anchorOf(parent)?.element ?? root).append(element);
    const box: Box = { key: `lane\0${boxCount++}`, element: null, parent, anchor: anchorOf(parent), directory: parent.directory, inset: 0, insetTop: 0,
      minColumn: lane.column, maxColumn: lane.column, row: lane.row ?? 0, items: [lane.key], children: [], left: 0, top: 0, right: 0, bottom: 0 };
    items.set(lane.key, { id: lane.key, element, column: lane.column, box, inset: ancestorsInset(box) });
    columns[lane.column].push(lane.key);
    return box;
  };
  const build = (band: DirectoryBand, parent: Box | null): Box => {
    // A band's loose-file bucket has its parent's path and no box of its own; the root is the picture itself, a box drawn as nothing.
    const isDirectory = band.directory !== parent?.directory;
    const isRoot = isDirectory && band.directory === "";
    const drawn = isDirectory && !isRoot;
    let element: HTMLElement | null = null;
    if (isDirectory) {
      element = document.createElement("section");
      element.className = `local-directory-band${isRoot ? " local-directory-root" : ""}`;
      element.dataset.directory = band.directory;
      if (drawn) {
        const label = document.createElement("div");
        label.className = "local-directory-label";
        label.textContent = band.directory;
        element.append(label);
      }
      ((parent && anchorOf(parent)?.element) ?? root).append(element);
    }
    const box: Box = { key: `${band.directory}\0${boxCount++}`, element, parent, anchor: parent ? anchorOf(parent) : null, directory: band.directory,
      inset: drawn ? BAND_PADDING + BAND_BORDER : 0, insetTop: 0, minColumn: band.minColumn, maxColumn: band.maxColumn, row: band.bandRow,
      items: [], children: [], left: 0, top: 0, right: 0, bottom: 0 };
    const hostElement = anchorOf(box)?.element ?? root;
    // Children first, in their rows, the lanes this directory holds among them by row; then this box's own files and their lanes.
    const rows: Array<{ row: number; child?: DirectoryBand; lane?: Lane }> = band.children.map(child => ({ row: child.bandRow, child }));
    if (band.children.length) for (const lane of rowLanes.get(band.directory) ?? []) rows.push({ row: lane.row ?? 0, lane });
    for (const entry of rows.sort((x, y) => x.row - y.row)) box.children.push(entry.child ? build(entry.child, box) : laneBox(entry.lane!, box));
    for (const [column, ids] of band.nodesByColumn) {
      const push = (id: string, item: HTMLElement): void => {
        const inset = ancestorsInset(box);
        items.set(id, { id, element: item, column, box, inset });
        box.items.push(id);
        columns[column].push(id);
      };
      const top = stackLanes.get(`${band.directory}\0${column}\0`);
      if (top) { const element = laneElement(top); hostElement.append(element); push(top.key, element); }
      for (const id of ids) {
        const node = byId.get(id);
        if (!node) continue;
        // Each card keeps its column wrapper: the page's hover rules, the router and the deck find a card through it.
        const wrapper = document.createElement("div");
        wrapper.className = "local-column center";
        wrapper.dataset.direction = "center";
        wrapper.dataset.position = "center";
        wrapper.style.width = "max-content";
        const card = createNodeCard(controller, node, "center");
        card.classList.add("focus-node");
        wrapper.append(card);
        hostElement.append(wrapper);
        push(id, wrapper);
        const after = stackLanes.get(`${band.directory}\0${column}\0${id}`);
        if (after) { const element = laneElement(after); hostElement.append(element); push(after.key, element); }
      }
    }
    return box;
  };
  const scanRoot: DirectoryBand = { directory: "", minColumn: 0, maxColumn: columnCount - 1, bandRow: 0, nodesByColumn: new Map(),
    allNodeIds: branches.subgraph.nodes.map(node => node.id), children: order.bands };
  const rootBox = build(scanRoot, null);

  dressCards(controller, root, branches);

  // Measure in two passes. First every card at its own width, which gives the columns' widths and so every box's
  // and item's horizontal place; those are applied, since a card's rows of test names wrap at its column's width
  // where its own did not, and a box's label wraps to nothing in a box not yet given a width. Then every item's
  // height, every label's height and every pin's height on its card.
  const scale = controller.runtime.mapTransform.k || 1;
  const widths = new Array<number>(columnCount).fill(0);
  for (const item of items.values()) widths[item.column] = Math.max(widths[item.column], item.element.offsetWidth + 2 * item.inset);
  const columnGap = state.tuning.localMap.columnGap;
  const lefts: number[] = [];
  let x = 0;
  for (let column = 0; column < columnCount; column++) { lefts.push(x); x += widths[column] + columnGap; }
  const pictureWidth = Math.max(0, x - columnGap);
  const origin = (anchor: Box | null): { left: number; top: number } => {
    if (!anchor?.element) return { left: 0, top: 0 };
    const border = anchor.inset ? BAND_BORDER : 0;
    return { left: anchor.left + border, top: anchor.top + border };
  };
  const placeAcross = (box: Box, around: number): void => {
    box.left = lefts[box.minColumn] + around;
    box.right = lefts[box.maxColumn] + widths[box.maxColumn] - around;
    if (box.element) Object.assign(box.element.style, { left: `${box.left - origin(box.anchor).left}px`, width: `${box.right - box.left}px` });
    for (const child of box.children) placeAcross(child, around + box.inset);
  };
  placeAcross(rootBox, 0);
  for (const item of items.values()) {
    const left = lefts[item.column] + item.inset;
    Object.assign(item.element.style, { left: `${left - origin(anchorOf(item.box)).left}px`, width: `${widths[item.column] - 2 * item.inset}px` });
  }
  Object.assign(root.style, { width: `${pictureWidth}px` });
  const heights = new Map<string, number>();
  for (const item of items.values()) heights.set(item.id, item.element.offsetHeight);
  const measureInsets = (box: Box): void => {
    const label = box.element?.querySelector<HTMLElement>(":scope > .local-directory-label");
    box.insetTop = box.inset + (label ? label.offsetHeight : 0);
    for (const child of box.children) measureInsets(child);
  };
  measureInsets(rootBox);

  const pinOffset = (nodeId: string, direction: "inbound" | "outbound", symbol?: string): number | null => {
    const anchor = controller.getAnchor(nodeId, "center", direction, symbol);
    const card = items.get(nodeId)?.element;
    if (!anchor || !card) return null;
    const rect = anchor.getBoundingClientRect(), cardRect = card.getBoundingClientRect();
    if (!rect.width && !rect.height) return null;
    return Math.round((rect.top - cardRect.top + rect.height / 2) / scale);
  };
  const columnOf = new Map(branches.columns.flatMap((nodes, column) => nodes.map(node => [node.id, column] as const)));
  const wires = new Map<string, PlacementWire>();
  const addWire = (from: { item: string; offset: number }, to: { item: string; offset: number }): void => {
    const key = `${from.item}\0${from.offset}\0${to.item}\0${to.offset}`;
    const wire = wires.get(key);
    if (wire) wire.weight += 1;
    else wires.set(key, { from, to, weight: 1 });
  };
  for (const edge of branches.subgraph.links) {
    if (edge.sourceId === edge.targetId || branches.back.has(edgeKey(edge))) continue;
    const provider = pinOffset(edge.targetId, "outbound", edge.targetSymbol);
    const consumer = pinOffset(edge.sourceId, "inbound", edge.sourceSymbol);
    if (provider === null || consumer === null) continue;
    const a = columnOf.get(edge.targetId), b = columnOf.get(edge.sourceId);
    if (a === undefined || b === undefined) continue;
    let previous = { item: edge.targetId, offset: provider };
    for (let column = a + 1; column < b; column++) {
      const passage = order.passages.get(`${edgeKey(edge)}\0${column}`);
      if (!passage) break;
      const slot = { item: passage.lane, offset: LANE_PADDING + passage.index * LANE_PITCH + LANE_PITCH / 2 };
      addWire(previous, slot);
      previous = slot;
    }
    addWire(previous, { item: edge.sourceId, offset: consumer });
  }

  const toPlacementBand = (box: Box): PlacementBand => ({
    key: box.key, insetTop: box.insetTop, insetBottom: box.inset, minColumn: box.minColumn, maxColumn: box.maxColumn, row: box.row,
    items: box.items, children: box.children.map(toPlacementBand)
  });
  const placement = placeBranches({ columns, heights, wires: [...wires.values()], bands: [toPlacementBand(rootBox)], gap: ITEM_GAP, bandGap: BAND_GAP });
  root.dataset.placementCost = String(placement.cost);
  root.dataset.placementOptimal = String(placement.optimal);

  // Place down: every box's edges and every item's top from the solution, each relative to the padding box of the
  // element it sits in, which is the box's edge inside its border.
  const placeDown = (box: Box): void => {
    const edges = placement.boxes.get(box.key)!;
    box.top = edges.top;
    box.bottom = edges.bottom;
    if (box.element) Object.assign(box.element.style, { top: `${box.top - origin(box.anchor).top}px`, height: `${Math.max(0, box.bottom - box.top)}px` });
    for (const child of box.children) placeDown(child);
  };
  placeDown(rootBox);
  let pictureHeight = 0;
  for (const item of items.values()) {
    const top = placement.top.get(item.id) ?? 0;
    item.element.style.top = `${top - origin(anchorOf(item.box)).top}px`;
    pictureHeight = Math.max(pictureHeight, top + (heights.get(item.id) ?? 0));
  }
  for (const box of placement.boxes.values()) pictureHeight = Math.max(pictureHeight, box.bottom);
  root.style.height = `${pictureHeight}px`;
}

/** The sum of the insets of a box and the boxes around it: how far inside its column an item of it stands. */
function ancestorsInset(box: Box): number {
  let total = 0;
  for (let current: Box | null = box; current; current = current.parent) total += current.inset;
  return total;
}

/**
 * The cards' rows in the chosen order, their hidden rows counted, and their
 * notes on references read back and connections outside the view.
 */
function dressCards(controller: LocalViewController, root: HTMLElement, branches: ReturnType<typeof buildBranches>): void {
  const { state } = controller.options;
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of branches.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  for (const pin of controller.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  const backReferences = new Map<string, number>();
  for (const edge of branches.subgraph.links) {
    if (!branches.back.has(edgeKey(edge))) continue;
    for (const id of new Set([edge.sourceId, edge.targetId])) backReferences.set(id, (backReferences.get(id) ?? 0) + 1);
  }
  root.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
    const id = card.dataset.id!;
    // The card's rows stand in the chosen order; rows the order does not name keep their place after them, Internals last.
    // Two symbols may share a normalized name (LinkTarget and linkTarget), so a name may claim one row per mention.
    const rowOrder = branches.rows.get(id);
    if (rowOrder) {
      const byName = new Map<string, HTMLElement[]>();
      card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
        const name = normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__";
        (byName.get(name) ?? byName.set(name, []).get(name)!).push(row);
      });
      for (const name of rowOrder) {
        const row = byName.get(name)?.shift();
        if (row) row.parentElement?.append(row);
      }
      for (const rows of byName.values()) for (const row of rows) row.parentElement?.append(row);
      const internals = card.querySelector<HTMLElement>(".symbol-row.internals-row");
      if (internals) internals.parentElement?.append(internals);
    }
    const all = controller.isPinned(id, "*") || controller.expandedCards.has(id) || id === state.selectedNode?.id;
    let hidden = 0;
    card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const collapse = !all && state.tuning.localMap.collapseOnPin && !connected.has(key(id, row.dataset.symbol));
      row.classList.toggle("branch-symbol-hidden", collapse);
      row.classList.toggle("branch-symbol-muted", !controller.isPinned(id, "*") && !connected.has(key(id, row.dataset.symbol)));
      if (collapse) hidden++;
    });
    if (hidden) {
      const reveal = document.createElement("button");
      reveal.className = "local-disclosure";
      reveal.textContent = `+${hidden} symbols`;
      reveal.title = "Show the other symbols in this file";
      reveal.addEventListener("click", event => {
        event.stopPropagation(); controller.expandedCards.add(id); controller.render();
      });
      card.append(reveal);
    }
    const back = backReferences.get(id) ?? 0;
    if (back) {
      const note = document.createElement("span");
      note.className = "local-disclosure local-back-references";
      note.textContent = `${back} ${back === 1 ? "reference reads" : "references read"} back`;
      note.title = "Against the reading direction, part of a cycle: drawn as stubs at its pins. Hover a symbol to trace it.";
      card.append(note);
    }
    const outside = branches.hiddenConnections.get(id) ?? 0;
    if (outside) {
      const filePinned = controller.isPinned(id, "*");
      const reveal = document.createElement(filePinned ? "span" : "button");
      reveal.className = "local-disclosure";
      reveal.textContent = `${outside} ${outside === 1 ? "connection" : "connections"} ${filePinned ? "hidden by filters" : "outside this view"}`;
      if (!filePinned) {
        reveal.title = "Pin this file to reveal its connections; display filters still apply";
        reveal.addEventListener("click", event => { event.stopPropagation(); controller.togglePinnedSymbol(id, "*"); });
      }
      card.append(reveal);
    }
  });
}

/** The room a lane's bundles take, one slot each; the router reads its position back from the page. */
function laneElement(lane: Lane): HTMLElement {
  const element = document.createElement("div");
  element.className = "local-pass-through";
  element.dataset.lane = lane.key;
  element.style.height = `${LANE_PADDING * 2 + lane.bundles.length * LANE_PITCH}px`;
  return element;
}
