import type { Lane } from "./branch-order";
import { placeBranches, type Placement, type PlacementBand, type PlacementWire, type StackEntry } from "./branch-placement";
import { LANE_PADDING, LANE_PITCH } from "./branch-routing";
import { edgeKey, type BranchGraph } from "./branches";
import type { DirectoryBand } from "../membraneView/pin-layout";

/**
 * The Local Map's many-file scene as geometry: from the ranked and ordered
 * exploration to every card's, lane's and membrane's place, with nothing of
 * the page in it. `planBranches` turns the order's bands and lanes into a
 * tree of boxes with the cards and slots each column stacks; `layoutScene`
 * takes a measurer that knows how wide each card wants to be and how tall it
 * is at a width, places the columns across and the exact placement down,
 * and returns every edge and top. The renderer builds elements for the plan,
 * measures them, and applies the layout; the layout lab feeds the same plan
 * a measurer made from a capture of the page, so both draw one picture.
 *
 * Pure-function module: no DOM. Widths, heights and gaps are CSS pixels of
 * the unscaled page.
 *
 * @module branch-scene
 */

/** The dials of the scene's geometry, each with the value the picture was designed at. */
export interface SceneTuning {
  /** The room between columns. */
  columnGap: number;
  /** The room between neighbouring cards and lanes of a column. */
  itemGap: number;
  /** The room between sibling membranes' segments in a column they share. */
  bandGap: number;
  /** The least overlap of a membrane's segments in neighbouring columns: the corridor through the gutter that joins them. */
  neck: number;
  /** The room between a membrane's outline and its members, which is also how far its corners are rounded. */
  bandPadding: number;
  /** A card may be no wider than this; null for as wide as its content asks. */
  cardMaxWidth: number | null;
  /** What a pixel of step between a membrane's neighbouring segments costs, in units of a one-reference wire's pixel (2026-10-07). */
  evenness: number;
  /** What a pixel between the tops of the k-th cards of a membrane's neighbouring columns costs, in the same units (2026-10-07). */
  levelness: number;
}

/** The values the picture was designed at. */
export const DEFAULT_SCENE_TUNING: SceneTuning = { columnGap: 100, itemGap: 24, bandGap: 28, neck: 60, bandPadding: 12, cardMaxWidth: null, evenness: 1, levelness: 0 };

/** The outline's stroke, outside the padding. */
export const BAND_BORDER = 1;

/** Where a wire runs through a slot of a lane: the slot's middle pixel, from its top. */
export const SLOT_LINE = Math.floor(LANE_PITCH / 2);

/** One column's part of a box: its edges there. */
export interface SceneSegment {
  column: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * What a box is: the root is the picture itself, drawn as nothing; a directory
 * is a membrane with an outline and a label; a directory's loose files share
 * its parent's element; a lane is the room a column's threaded wires pass.
 */
export type SceneBoxKind = "root" | "directory" | "files" | "lane";

/** A box of the picture, with its place once laid out. */
export interface SceneBox {
  key: string;
  kind: SceneBoxKind;
  directory: string;
  parent: SceneBox | null;
  /** The nearest box around this one with an element of its own, inside which its elements are placed; null for the root. */
  anchor: SceneBox | null;
  /** Padding plus border on each side; zero for a box drawn as nothing. */
  inset: number;
  /** The room between the leftmost segment's top and the first member: the inset and the label; set by the layout. */
  insetTop: number;
  insetBottom: number;
  minColumn: number;
  maxColumn: number;
  row: number;
  /** The cards directly in this box, or a lane's slots. */
  items: string[];
  children: SceneBox[];
  /** A lane's slots, top to bottom, one per bundle; null for a directory's box. */
  slots: string[] | null;
  lane: Lane | null;
  /** Set by the layout: one segment per column, and the extent of them all. */
  segments: SceneSegment[];
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A card: an item the placement stands in a column. */
export interface SceneItem {
  id: string;
  column: number;
  box: SceneBox;
  /** The sum of the insets of the boxes around it: how far its left edge stands inside its column. */
  inset: number;
}

/** The tree of boxes and the stacks of each column, before any measuring. */
export interface ScenePlan {
  root: SceneBox;
  /** Every box, in the order it was made: parents before children, siblings in their rows. */
  boxes: SceneBox[];
  /** The lanes' boxes by the lane's key. */
  lanes: Map<string, SceneBox>;
  items: Map<string, SceneItem>;
  /** The cards and lanes of each column, top to bottom. */
  columns: StackEntry[][];
  columnCount: number;
}

/** What the layout asks of the page, or of a capture of it. */
export interface SceneMeasurer {
  /** Each card's width as its content asks, no wider than the cap. */
  widths(cardMaxWidth: number | null): ReadonlyMap<string, number>;
  /** Each card's height and pins at the width it is given, and each drawn directory's label height at its width, by the box's key. */
  measure(cardWidths: ReadonlyMap<string, number>, labelWidths: ReadonlyMap<string, number>): SceneMeasurement;
}

/** What the measurer found: each card's height, where each pin sits, and each drawn directory's label height. */
export interface SceneMeasurement {
  heights: ReadonlyMap<string, number>;
  /** A pin's distance from its card's top, or null when the card has no pin for it. */
  pin(id: string, direction: "inbound" | "outbound", symbol: string | undefined): number | null;
  labelHeights: ReadonlyMap<string, number>;
}

/** The laid-out scene. */
export interface Scene extends ScenePlan {
  widths: number[];
  lefts: number[];
  pictureWidth: number;
  pictureHeight: number;
  /** Every item's height, slots included. */
  heights: Map<string, number>;
  wires: PlacementWire[];
  placement: Placement;
  /** Every card's top. */
  tops: Map<string, number>;
  /** Each lane's slot lines, from its top edge, by the lane's key. */
  slotLines: Map<string, number[]>;
}

/**
 * The tree of boxes the order's bands and lanes make, and the stacks of each
 * column: a band's children in their rows, with the lanes the directory holds
 * among them by row; then its own files, with the lanes that follow them.
 */
export function planBranches(branches: BranchGraph, bandPadding: number = DEFAULT_SCENE_TUNING.bandPadding): ScenePlan {
  const { order } = branches;
  const columnCount = branches.columns.length;
  const stackLanes = new Map<string, Lane>();
  const rowLanes = new Map<string, Lane[]>();
  for (const lane of order.lanes.values()) {
    if (lane.row === null) stackLanes.set(`${lane.host}\0${lane.column}\0${lane.after ?? ""}`, lane);
    else (rowLanes.get(lane.host) ?? rowLanes.set(lane.host, []).get(lane.host)!).push(lane);
  }
  const boxes: SceneBox[] = [];
  const lanes = new Map<string, SceneBox>();
  const items = new Map<string, SceneItem>();
  const columns: StackEntry[][] = Array.from({ length: columnCount }, () => []);
  let boxCount = 0;
  const make = (partial: Omit<SceneBox, "anchor" | "insetTop" | "insetBottom" | "segments" | "left" | "top" | "right" | "bottom"> & { insetTop?: number; insetBottom?: number }): SceneBox => {
    const box: SceneBox = {
      ...partial, anchor: partial.parent ? hostOf(partial.parent) : null, insetTop: partial.insetTop ?? 0, insetBottom: partial.insetBottom ?? partial.inset,
      segments: [], left: 0, top: 0, right: 0, bottom: 0
    };
    boxes.push(box);
    return box;
  };
  const laneBox = (lane: Lane, parent: SceneBox): SceneBox => {
    const key = `lane\0${lane.key}`;
    const slots = lane.bundles.map((_, slot) => `${key}\0${slot}`);
    const box = make({ key, kind: "lane", directory: parent.directory, parent, inset: 0, insetTop: LANE_PADDING, insetBottom: LANE_PADDING,
      minColumn: lane.column, maxColumn: lane.column, row: lane.row ?? 0, items: slots, children: [], slots, lane });
    lanes.set(lane.key, box);
    columns[lane.column].push({ key, slots });
    return box;
  };
  const build = (band: DirectoryBand, parent: SceneBox | null): SceneBox => {
    // A band's loose-file bucket has its parent's path and no box of its own; the root is the picture itself, a box drawn as nothing.
    const isDirectory = band.directory !== parent?.directory;
    const kind: SceneBoxKind = !isDirectory ? "files" : band.directory === "" ? "root" : "directory";
    const inset = kind === "directory" ? bandPadding + BAND_BORDER : 0;
    const box = make({ key: `${band.directory}\0${boxCount++}`, kind, directory: band.directory, parent, inset,
      minColumn: band.minColumn, maxColumn: band.maxColumn, row: band.bandRow, items: [], children: [], slots: null, lane: null });
    const rows: Array<{ row: number; child?: DirectoryBand; lane?: Lane }> = band.children.map(child => ({ row: child.bandRow, child }));
    if (band.children.length) for (const lane of rowLanes.get(band.directory) ?? []) rows.push({ row: lane.row ?? 0, lane });
    for (const entry of rows.sort((x, y) => x.row - y.row)) box.children.push(entry.child ? build(entry.child, box) : laneBox(entry.lane!, box));
    for (const [column, ids] of band.nodesByColumn) {
      const top = stackLanes.get(`${band.directory}\0${column}\0`);
      if (top) box.children.push(laneBox(top, box));
      for (const id of ids) {
        items.set(id, { id, column, box, inset: ancestorsInset(box) });
        box.items.push(id);
        columns[column].push(id);
        const after = stackLanes.get(`${band.directory}\0${column}\0${id}`);
        if (after) box.children.push(laneBox(after, box));
      }
    }
    return box;
  };
  const scanRoot: DirectoryBand = { directory: "", minColumn: 0, maxColumn: columnCount - 1, bandRow: 0, nodesByColumn: new Map(),
    allNodeIds: branches.subgraph.nodes.map(node => node.id), children: order.bands };
  const root = build(scanRoot, null);
  return { root, boxes, lanes, items, columns, columnCount };
}

/** The box whose element holds a box's elements: itself, unless it is a directory's loose files, which share their parent's. */
export const hostOf = (box: SceneBox): SceneBox => (box.kind === "files" ? hostOf(box.parent!) : box);

/** The sum of the insets of a box and the boxes around it: how far inside its column an item of it stands. */
function ancestorsInset(box: SceneBox): number {
  let total = 0;
  for (let current: SceneBox | null = box; current; current = current.parent) total += current.inset;
  return total;
}

/**
 * Lays the plan out. Across: each column as wide as its widest card with
 * that card's insets, the columns a gap apart, every box's segments inside
 * its column by the insets around it. Then the measurer gives every card's
 * height and pins at its column's width and every label's height at its
 * segment's width. Down: the exact placement of `branch-placement.ts`, with
 * a wire per reference through the slots its passages name.
 */
export function layoutScene(plan: ScenePlan, branches: BranchGraph, measurer: SceneMeasurer, tuning: SceneTuning): Scene {
  const { root, items, lanes, columns, columnCount } = plan;
  const natural = measurer.widths(tuning.cardMaxWidth);
  const widths = new Array<number>(columnCount).fill(0);
  for (const item of items.values()) widths[item.column] = Math.max(widths[item.column], (natural.get(item.id) ?? 0) + 2 * item.inset);
  const lefts: number[] = [];
  let x = 0;
  for (let column = 0; column < columnCount; column++) { lefts.push(x); x += widths[column] + tuning.columnGap; }
  const pictureWidth = Math.max(0, x - tuning.columnGap);
  const placeAcross = (box: SceneBox, around: number): void => {
    box.segments = [];
    for (let column = box.minColumn; column <= box.maxColumn; column++) {
      box.segments.push({ column, left: lefts[column] + around, right: lefts[column] + widths[column] - around, top: 0, bottom: 0 });
    }
    box.left = box.segments[0].left;
    box.right = box.segments[box.segments.length - 1].right;
    for (const child of box.children) placeAcross(child, around + box.inset);
  };
  placeAcross(root, 0);

  const cardWidths = new Map<string, number>();
  for (const item of items.values()) cardWidths.set(item.id, widths[item.column] - 2 * item.inset);
  const labelWidths = new Map<string, number>();
  for (const box of plan.boxes) {
    if (box.kind === "directory") labelWidths.set(box.key, Math.max(0, box.segments[0].right - box.segments[0].left - 2 * box.inset));
  }
  const measured = measurer.measure(cardWidths, labelWidths);
  const heights = new Map<string, number>();
  for (const item of items.values()) heights.set(item.id, measured.heights.get(item.id) ?? 0);
  for (const box of lanes.values()) for (const slot of box.slots!) heights.set(slot, LANE_PITCH);
  for (const box of plan.boxes) {
    if (box.kind !== "lane") box.insetTop = box.inset + (measured.labelHeights.get(box.key) ?? 0);
  }

  // A wire per reference, through the slot of each lane it passes; wires between the same pins add up.
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
    const provider = measured.pin(edge.targetId, "outbound", edge.targetSymbol);
    const consumer = measured.pin(edge.sourceId, "inbound", edge.sourceSymbol);
    if (provider === null || consumer === null) continue;
    const a = columnOf.get(edge.targetId), b = columnOf.get(edge.sourceId);
    if (a === undefined || b === undefined) continue;
    let previous = { item: edge.targetId, offset: provider };
    for (let column = a + 1; column < b; column++) {
      const passage = branches.order.passages.get(`${edgeKey(edge)}\0${column}`);
      const slots = passage ? lanes.get(passage.lane)?.slots : undefined;
      if (!passage || !slots) break;
      const slot = { item: slots[passage.index], offset: SLOT_LINE };
      addWire(previous, slot);
      previous = slot;
    }
    addWire(previous, { item: edge.sourceId, offset: consumer });
  }

  const toPlacementBand = (box: SceneBox): PlacementBand => ({
    key: box.key, insetTop: box.insetTop, insetBottom: box.insetBottom, minColumn: box.minColumn, maxColumn: box.maxColumn, row: box.row,
    shaped: box.kind === "directory", items: box.items, children: box.children.map(toPlacementBand)
  });
  const placement = placeBranches({
    columns, heights, wires: [...wires.values()], bands: [toPlacementBand(root)],
    gap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.neck, evenness: tuning.evenness, levelness: tuning.levelness
  });

  const placeDown = (box: SceneBox): void => {
    const placed = placement.boxes.get(box.key)!;
    for (const segment of box.segments) {
      const edges = placed[segment.column - box.minColumn];
      segment.top = edges.top;
      segment.bottom = edges.bottom;
    }
    box.top = Math.min(...box.segments.map(segment => segment.top));
    box.bottom = Math.max(...box.segments.map(segment => segment.bottom));
    for (const child of box.children) placeDown(child);
  };
  placeDown(root);
  const slotLines = new Map<string, number[]>();
  for (const [key, box] of lanes) slotLines.set(key, box.slots!.map(slot => (placement.top.get(slot) ?? 0) - box.top + SLOT_LINE));
  const tops = new Map<string, number>();
  let pictureHeight = 0;
  for (const item of items.values()) {
    const top = placement.top.get(item.id) ?? 0;
    tops.set(item.id, top);
    pictureHeight = Math.max(pictureHeight, top + (heights.get(item.id) ?? 0));
  }
  for (const segments of placement.boxes.values()) for (const segment of segments) pictureHeight = Math.max(pictureHeight, segment.bottom);
  return { ...plan, widths, lefts, pictureWidth, pictureHeight, heights, wires: [...wires.values()], placement, tops, slotLines };
}
