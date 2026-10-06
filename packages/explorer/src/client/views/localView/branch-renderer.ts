import type { Lane } from "./branch-order";
import { placeBranches, type PlacementBand, type PlacementWire, type StackEntry } from "./branch-placement";
import { LANE_PADDING, LANE_PITCH } from "./branch-routing";
import { buildBranches, edgeKey } from "./branches";
import { createNodeCard } from "./card-factory";
import type { LocalViewController } from "./controller";
import { membranePath } from "./membrane-outline";
import type { DirectoryBand } from "../membraneView/pin-layout";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/** The room between neighbouring cards and lanes of a column, in CSS pixels. */
const ITEM_GAP = 24;

/** The room between sibling membranes' segments in a column they share. */
const BAND_GAP = 28;

/** The least overlap of a membrane's segments in neighbouring columns: the corridor through the gutter that joins them. */
const MEMBRANE_NECK = 60;

const SVG_NS = "http://www.w3.org/2000/svg";

/** Where a wire runs through a slot of a lane: the slot's middle pixel, from its top. */
const SLOT_LINE = Math.floor(LANE_PITCH / 2);

/** The room between a membrane's outline and its members: the padding and the outline's stroke. */
const BAND_PADDING = 12;
const BAND_BORDER = 1;

/** One column's part of a box: its edges there. */
interface BoxSegment {
  column: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** A box of the picture: a directory's membrane, the root, a directory's loose files, or a lane, with its element when it has one. */
interface Box {
  key: string;
  /** The element that bounds the box, positioned at the segments' extent; its children are placed inside it. */
  element: HTMLElement | null;
  /** A drawn directory's outline, and its label. */
  shape: SVGPathElement | null;
  label: HTMLElement | null;
  /** The box this one lies in; null for the root. */
  parent: Box | null;
  /** The nearest box around this one with an element, whose padding box its elements are placed in; null for the layout root. */
  anchor: Box | null;
  directory: string;
  /** Padding plus border on each side, zero for a box drawn as nothing. */
  inset: number;
  insetTop: number;
  insetBottom: number;
  minColumn: number;
  maxColumn: number;
  row: number;
  items: string[];
  children: Box[];
  /** A lane's slots, top to bottom, one per bundle, which are its items; null for a directory's box. */
  slots: string[] | null;
  /** Set once placed: one segment per column, and the extent of them all. */
  segments: BoxSegment[];
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A card: an item the placement stands in a column. A lane is a box of slots instead. */
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
 * directory membranes the order chose, each membrane one segment per column
 * following its members and drawn as one outline, and each lane as tall as
 * the slots its wires spread. The elements keep the names the router, the
 * deck and the perspective transition read.
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
  const columns: StackEntry[][] = Array.from({ length: columnCount }, () => []);
  let boxCount = 0;
  const anchorOf = (box: Box): Box | null => (box.element ? box : box.anchor);
  // A lane is a box whose items are its slots, one per bundle; it stands in its column's stack by its edges.
  const laneBoxes = new Map<string, Box>();
  const laneBox = (lane: Lane, parent: Box): Box => {
    const element = laneElement(lane);
    (anchorOf(parent)?.element ?? root).append(element);
    const key = `lane\0${lane.key}`;
    const slots = lane.bundles.map((_, slot) => `${key}\0${slot}`);
    const box: Box = { key, element, shape: null, label: null, parent, anchor: anchorOf(parent), directory: parent.directory, inset: 0, insetTop: LANE_PADDING, insetBottom: LANE_PADDING,
      minColumn: lane.column, maxColumn: lane.column, row: lane.row ?? 0, items: slots, children: [], slots, segments: [], left: 0, top: 0, right: 0, bottom: 0 };
    laneBoxes.set(lane.key, box);
    columns[lane.column].push({ key, slots });
    return box;
  };
  const build = (band: DirectoryBand, parent: Box | null): Box => {
    // A band's loose-file bucket has its parent's path and no box of its own; the root is the picture itself, a box drawn as nothing.
    const isDirectory = band.directory !== parent?.directory;
    const isRoot = isDirectory && band.directory === "";
    const drawn = isDirectory && !isRoot;
    let element: HTMLElement | null = null;
    let shape: SVGPathElement | null = null;
    let label: HTMLElement | null = null;
    if (isDirectory) {
      element = document.createElement("section");
      element.className = `local-directory-band${isRoot ? " local-directory-root" : ""}`;
      element.dataset.directory = band.directory;
      if (drawn) {
        // The membrane's outline, beneath everything the element holds, and its label at its leftmost segment's top.
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.classList.add("local-membrane");
        svg.dataset.directory = band.directory;
        shape = document.createElementNS(SVG_NS, "path");
        shape.classList.add("local-membrane-shape");
        shape.dataset.directory = band.directory;
        svg.append(shape);
        label = document.createElement("div");
        label.className = "local-directory-label";
        label.textContent = band.directory;
        element.append(svg, label);
      }
      ((parent && anchorOf(parent)?.element) ?? root).append(element);
    }
    const inset = drawn ? BAND_PADDING + BAND_BORDER : 0;
    const box: Box = { key: `${band.directory}\0${boxCount++}`, element, shape, label, parent, anchor: parent ? anchorOf(parent) : null, directory: band.directory,
      inset, insetTop: 0, insetBottom: inset, minColumn: band.minColumn, maxColumn: band.maxColumn, row: band.bandRow,
      items: [], children: [], slots: null, segments: [], left: 0, top: 0, right: 0, bottom: 0 };
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
      if (top) box.children.push(laneBox(top, box));
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
        if (after) box.children.push(laneBox(after, box));
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
  // An element's children are placed relative to its top-left corner, which is its segments' extent.
  const origin = (anchor: Box | null): { left: number; top: number } => (anchor?.element ? { left: anchor.left, top: anchor.top } : { left: 0, top: 0 });
  const placeAcross = (box: Box, around: number): void => {
    box.segments = [];
    for (let column = box.minColumn; column <= box.maxColumn; column++) {
      box.segments.push({ column, left: lefts[column] + around, right: lefts[column] + widths[column] - around, top: 0, bottom: 0 });
    }
    box.left = box.segments[0].left;
    box.right = box.segments[box.segments.length - 1].right;
    if (box.element) Object.assign(box.element.style, { left: `${box.left - origin(box.anchor).left}px`, width: `${box.right - box.left}px` });
    // The label wraps within its segment, as it must before its height is measured.
    if (box.label) Object.assign(box.label.style, { left: `${box.inset}px`, width: `${Math.max(0, box.segments[0].right - box.segments[0].left - 2 * box.inset)}px` });
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
  for (const box of laneBoxes.values()) for (const slot of box.slots!) heights.set(slot, LANE_PITCH);
  const measureInsets = (box: Box): void => {
    if (!box.slots) {
      const label = box.element?.querySelector<HTMLElement>(":scope > .local-directory-label");
      box.insetTop = box.inset + (label ? label.offsetHeight : 0);
    }
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
      const slots = passage ? laneBoxes.get(passage.lane)?.slots : undefined;
      if (!passage || !slots) break;
      const slot = { item: slots[passage.index], offset: SLOT_LINE };
      addWire(previous, slot);
      previous = slot;
    }
    addWire(previous, { item: edge.sourceId, offset: consumer });
  }

  const toPlacementBand = (box: Box): PlacementBand => ({
    key: box.key, insetTop: box.insetTop, insetBottom: box.insetBottom, minColumn: box.minColumn, maxColumn: box.maxColumn, row: box.row,
    items: box.items, children: box.children.map(toPlacementBand)
  });
  const placement = placeBranches({ columns, heights, wires: [...wires.values()], bands: [toPlacementBand(rootBox)], gap: ITEM_GAP, bandGap: BAND_GAP, neck: MEMBRANE_NECK });
  root.dataset.placementCost = String(placement.cost);
  root.dataset.placementOptimal = String(placement.optimal);

  // Place down: every segment's edges and every item's top from the solution, each element relative to the one it
  // sits in; a drawn directory gets its outline, its label at its leftmost segment, and its segments as data.
  const placeDown = (box: Box): void => {
    const placed = placement.boxes.get(box.key)!;
    for (const segment of box.segments) {
      const edges = placed[segment.column - box.minColumn];
      segment.top = edges.top;
      segment.bottom = edges.bottom;
    }
    box.top = Math.min(...box.segments.map(segment => segment.top));
    box.bottom = Math.max(...box.segments.map(segment => segment.bottom));
    if (box.element) {
      Object.assign(box.element.style, { top: `${box.top - origin(box.anchor).top}px`, height: `${Math.max(0, box.bottom - box.top)}px` });
      if (!box.slots) box.element.dataset.segments = box.segments.map(segment => `${segment.column}:${segment.left}:${segment.top}:${segment.right}:${segment.bottom}`).join(";");
    }
    if (box.shape) {
      box.shape.setAttribute("d", membranePath(box.segments.map(segment => ({ left: segment.left - box.left, right: segment.right - box.left, top: segment.top - box.top, bottom: segment.bottom - box.top }))));
    }
    if (box.label) box.label.style.top = `${box.segments[0].top - box.top + box.inset}px`;
    for (const child of box.children) placeDown(child);
  };
  placeDown(rootBox);
  // Each lane says where its slots came to rest, from its top edge to the line of each, for the router to thread the wires through.
  for (const box of laneBoxes.values()) {
    box.element!.dataset.slots = box.slots!.map(slot => String((placement.top.get(slot) ?? 0) - box.top + SLOT_LINE)).join(",");
  }
  let pictureHeight = 0;
  for (const item of items.values()) {
    const top = placement.top.get(item.id) ?? 0;
    item.element.style.top = `${top - origin(anchorOf(item.box)).top}px`;
    pictureHeight = Math.max(pictureHeight, top + (heights.get(item.id) ?? 0));
  }
  for (const segments of placement.boxes.values()) for (const segment of segments) pictureHeight = Math.max(pictureHeight, segment.bottom);
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

/** The room a lane's bundles pass through; the placement sizes it, and the router reads its place and its slots back from the page. */
function laneElement(lane: Lane): HTMLElement {
  const element = document.createElement("div");
  element.className = "local-pass-through";
  element.dataset.lane = lane.key;
  return element;
}
