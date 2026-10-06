import { rankByNetworkSimplex, type Constraint } from "./network-simplex";

/**
 * Places the items of a retained Local Map exploration on the vertical axis:
 * the cards and lanes of every column, in the order the sweep chose, so that
 * the wires between pins are as short as the constraints allow, by the exact
 * method of Gansner, Koutsofios, North and Vo. The objective is the weighted
 * sum of the vertical distances between the two pins of every wire, a
 * bundle's shared run weighing its member count. The constraints are the
 * order within each column with a gap between neighbours, each directory's
 * membrane around its members with its label and padding, and sibling
 * directories that share a column standing in their rows there without
 * interleaving.
 *
 * A directory is a membrane: one segment per column it spans, each around
 * that column's members and the segments its subdirectories have there, at
 * its own height, so the shape follows its members from column to column
 * instead of boxing them all into one rectangle. Segments in neighbouring
 * columns overlap by at least the neck, and so stand at least that tall, so a
 * membrane is one connected shape and never crosses a sibling's. The label's
 * room is in the leftmost segment.
 *
 * A lane is a box around its slots, one per bundle, which stand in the order
 * the sweep chose, each at least its own height below the one above. A slot
 * is an item like a card, so the wires through it place it, and the lane's
 * edges follow its first and last slots at the lane's padding: a lane is as
 * tall as its wires ask and no taller, and its heavy slots do not decide
 * where its light ones go.
 *
 * Beneath the wires, every box is pulled tight around its members: a box's
 * height costs one unit against a wire's million, so no box is taller than
 * its members and the wires need, and the wires are never traded for it.
 *
 * Pure-function module: no DOM. Heights, offsets and gaps are CSS pixels of
 * the unscaled page, rounded to integers; the renderer measures them before
 * placing and reads the positions back as absolute tops.
 *
 * @module branch-placement
 */

/** A place on an item where a wire ends: the item and the distance from its top. */
export interface Pin {
  item: string;
  offset: number;
}

/** A wire between two pins, weighted by how many references it draws. */
export interface PlacementWire {
  from: Pin;
  to: Pin;
  weight: number;
}

/**
 * A directory's membrane: its members, its subdirectories, the room its label and padding take, and its place
 * among its siblings. It has one segment per column from `minColumn` to `maxColumn`.
 */
export interface PlacementBand {
  key: string;
  /** The room between the leftmost segment's top edge and its first member: label and padding; zero for a box drawn as nothing. */
  insetTop: number;
  /** The room between a member and the segment's edge everywhere else: below every segment and above all but the leftmost. */
  insetBottom: number;
  minColumn: number;
  maxColumn: number;
  /** The membrane's row among its siblings; where a sibling in a lower row shares a column, its segment there stands below. */
  row: number;
  /** The items directly in this membrane, each in one of its columns. */
  items: readonly string[];
  children: readonly PlacementBand[];
}

/** One column's part of a membrane: its edges there. */
export interface Segment {
  column: number;
  top: number;
  bottom: number;
}

/** A lane in a column's stack: a box of `bands`, whose items are the lane's slots and whose insets are its padding. */
export interface PlacementLane {
  /** The box's key, as `bands` names it. */
  key: string;
  /** The slots, top to bottom, one per bundle: items of the lane's pitch in height, each standing at least that far below the one above. */
  slots: readonly string[];
}

/** One thing in a column's stack: a card by its item id, or a lane. */
export type StackEntry = string | PlacementLane;

/** What the placement takes. */
export interface PlacementInput {
  /** The cards and lanes of each column, top to bottom. */
  columns: readonly (readonly StackEntry[])[];
  /** Every item's height, slots included. */
  heights: ReadonlyMap<string, number>;
  wires: readonly PlacementWire[];
  /** The top-level boxes. */
  bands: readonly PlacementBand[];
  /** The least room between neighbouring cards and lanes of a column. */
  gap: number;
  /** The least room between sibling membranes' segments in a column they share. */
  bandGap: number;
  /** The least overlap of one membrane's segments in neighbouring columns, so that it is one connected shape. */
  neck: number;
}

/** The placement: every item's top, every membrane's segments, and the objective. */
export interface Placement {
  top: Map<string, number>;
  /** Each membrane's segments, left to right, one per column it spans. */
  boxes: Map<string, Segment[]>;
  /** The weighted sum of the wires' vertical distances. */
  cost: number;
  optimal: boolean;
}

/** What a unit of a wire's vertical distance costs against a unit of a box's height. */
const WIRE_WEIGHT = 1_000_000;

/** The weighted sum of the wires' vertical distances at given tops; a wire whose pin is unplaced costs nothing. */
export function placementCost(wires: readonly PlacementWire[], top: ReadonlyMap<string, number>): number {
  let cost = 0;
  for (const wire of wires) {
    const a = top.get(wire.from.item), b = top.get(wire.to.item);
    if (a === undefined || b === undefined) continue;
    cost += wire.weight * Math.abs(a + wire.from.offset - (b + wire.to.offset));
  }
  return cost;
}

/** Places the items; see the module note. */
export function placeBranches(input: PlacementInput): Placement {
  const index = new Map<string, number>();
  let count = 0;
  const node = (key: string): number => index.get(key) ?? (index.set(key, count), count++);
  const constraints: Constraint[] = [];
  const itemNode = (id: string): number => node(`item\0${id}`);
  const height = (id: string): number => Math.round(input.heights.get(id) ?? 0);
  const segmentTop = (key: string, column: number): number => node(`top\0${key}\0${column}`);
  const segmentBottom = (key: string, column: number): number => node(`bottom\0${key}\0${column}`);

  // Every item's column, from the stacks: a card's directly, a slot's through its lane.
  const columnOf = new Map<string, number>();
  input.columns.forEach((column, index) => {
    for (const entry of column) {
      if (typeof entry === "string") columnOf.set(entry, index);
      else for (const slot of entry.slots) columnOf.set(slot, index);
    }
  });

  // A column's stack: each entry's top edge the gap below the edge above it; a card's edges are its top and its
  // top plus its height, a lane's the edges of its segment. Within a lane the slots stand in order, each touching the one above.
  const lanes: PlacementLane[] = [];
  input.columns.forEach((column, index) => {
    const edges = (entry: StackEntry): { top: number; bottom: number; height: number } =>
      typeof entry === "string" ? { top: itemNode(entry), bottom: itemNode(entry), height: height(entry) } : { top: segmentTop(entry.key, index), bottom: segmentBottom(entry.key, index), height: 0 };
    for (let i = 1; i < column.length; i++) {
      const above = edges(column[i - 1]), below = edges(column[i]);
      constraints.push({ tail: above.bottom, head: below.top, delta: above.height + Math.round(input.gap), weight: 0 });
    }
    for (const entry of column) {
      if (typeof entry === "string") continue;
      lanes.push(entry);
      for (let i = 1; i < entry.slots.length; i++) {
        constraints.push({ tail: itemNode(entry.slots[i - 1]), head: itemNode(entry.slots[i]), delta: height(entry.slots[i - 1]), weight: 0 });
      }
    }
  });

  const spans = new Map<string, PlacementBand>();
  const visit = (bands: readonly PlacementBand[]): void => {
    for (const band of bands) {
      spans.set(band.key, band);
      const insetTop = Math.round(band.insetTop), insetBottom = Math.round(band.insetBottom);
      // The room above a segment's members: the label's in the leftmost column, the padding's elsewhere.
      const above = (column: number): number => (column === band.minColumn ? insetTop : insetBottom);
      for (const item of band.items) {
        const column = columnOf.get(item);
        if (column === undefined || column < band.minColumn || column > band.maxColumn) {
          throw new Error(`The item ${JSON.stringify(item)} of ${JSON.stringify(band.key)} stands in no column of that membrane.`);
        }
        constraints.push({ tail: segmentTop(band.key, column), head: itemNode(item), delta: above(column), weight: 0 });
        constraints.push({ tail: itemNode(item), head: segmentBottom(band.key, column), delta: height(item) + insetBottom, weight: 0 });
      }
      for (const child of band.children) {
        if (child.minColumn < band.minColumn || child.maxColumn > band.maxColumn) {
          throw new Error(`The membrane ${JSON.stringify(child.key)} reaches outside ${JSON.stringify(band.key)}, which holds it.`);
        }
        for (let column = child.minColumn; column <= child.maxColumn; column++) {
          constraints.push({ tail: segmentTop(band.key, column), head: segmentTop(child.key, column), delta: above(column), weight: 0 });
          constraints.push({ tail: segmentBottom(child.key, column), head: segmentBottom(band.key, column), delta: insetBottom, weight: 0 });
        }
      }
      const neck = band.minColumn < band.maxColumn ? Math.round(input.neck) : 0;
      for (let column = band.minColumn; column <= band.maxColumn; column++) {
        // Each segment as tight as its members allow, and no shorter than the neck it must share: its height costs, far beneath any wire.
        constraints.push({ tail: segmentTop(band.key, column), head: segmentBottom(band.key, column), delta: neck, weight: 1 });
        // Neighbouring segments overlap by the neck, so the membrane is one shape.
        if (column > band.minColumn) {
          constraints.push({ tail: segmentTop(band.key, column - 1), head: segmentBottom(band.key, column), delta: neck, weight: 0 });
          constraints.push({ tail: segmentTop(band.key, column), head: segmentBottom(band.key, column - 1), delta: neck, weight: 0 });
        }
      }
      visit(band.children);
    }
    // Siblings stand in their rows in every column they share, one segment wholly above the other.
    for (const upper of bands) {
      for (const lower of bands) {
        if (upper === lower || upper.row >= lower.row) continue;
        for (let column = Math.max(upper.minColumn, lower.minColumn); column <= Math.min(upper.maxColumn, lower.maxColumn); column++) {
          constraints.push({ tail: segmentBottom(upper.key, column), head: segmentTop(lower.key, column), delta: Math.round(input.bandGap), weight: 0 });
        }
      }
    }
  };
  visit(input.bands);
  for (const lane of lanes) {
    const span = spans.get(lane.key);
    const column = columnOf.get(lane.slots[0] ?? "");
    if (!span || column === undefined || span.minColumn !== column || span.maxColumn !== column) {
      throw new Error(`The lane ${JSON.stringify(lane.key)} stands in a column but is no single-column box of the bands there, so its edges would float free of its slots.`);
    }
  }

  // A wire costs its vertical distance: an auxiliary node both pins stay above, each by its offset, so the
  // cheapest place for it is the lower pin and the cost is the distance to the other (Gansner et al., section 4.2).
  for (const wire of input.wires) {
    if (!input.heights.has(wire.from.item) || !input.heights.has(wire.to.item)) continue;
    const aux = node(`wire\0${constraints.length}`);
    constraints.push({ tail: aux, head: itemNode(wire.from.item), delta: -Math.round(wire.from.offset), weight: wire.weight * WIRE_WEIGHT });
    constraints.push({ tail: aux, head: itemNode(wire.to.item), delta: -Math.round(wire.to.offset), weight: wire.weight * WIRE_WEIGHT });
  }
  for (const id of input.heights.keys()) itemNode(id);

  const ranking = rankByNetworkSimplex(count, constraints);
  const top = new Map<string, number>();
  for (const id of input.heights.keys()) top.set(id, ranking.position[itemNode(id)]);
  const boxes = new Map<string, Segment[]>();
  const collect = (bands: readonly PlacementBand[]): void => {
    for (const band of bands) {
      const segments: Segment[] = [];
      for (let column = band.minColumn; column <= band.maxColumn; column++) {
        segments.push({ column, top: ranking.position[segmentTop(band.key, column)], bottom: ranking.position[segmentBottom(band.key, column)] });
      }
      boxes.set(band.key, segments);
      collect(band.children);
    }
  };
  collect(input.bands);
  // The picture starts at zero: the least top of any item or segment.
  let least = Infinity;
  for (const value of top.values()) least = Math.min(least, value);
  for (const segments of boxes.values()) for (const segment of segments) least = Math.min(least, segment.top);
  if (Number.isFinite(least) && least !== 0) {
    for (const [id, value] of top) top.set(id, value - least);
    for (const segments of boxes.values()) for (const segment of segments) { segment.top -= least; segment.bottom -= least; }
  }
  return { top, boxes, cost: placementCost(input.wires, top), optimal: ranking.optimal };
}
