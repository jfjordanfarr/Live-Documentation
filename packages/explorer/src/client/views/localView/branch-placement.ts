import { rankByNetworkSimplex, type Constraint } from "./network-simplex";

/**
 * Places the items of a retained Local Map exploration on the vertical axis:
 * the cards and lanes of every column, in the order the sweep chose, so that
 * the wires between pins are as short as the constraints allow, by the exact
 * method of Gansner, Koutsofios, North and Vo. The objective is the weighted
 * sum of the vertical distances between the two pins of every wire, a
 * bundle's shared run weighing its member count. The constraints are the
 * order within each column with a gap between neighbours, each directory's
 * box around its members with its label and padding, and sibling directories
 * that share columns standing in their rows without interleaving.
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

/** A directory's box: its members, its subdirectories, the room its label and padding take, and its place among its siblings. */
export interface PlacementBand {
  key: string;
  /** The room between the box's top edge and its first member: label and padding; zero for a box drawn as nothing. */
  insetTop: number;
  /** The room between the last member and the box's bottom edge. */
  insetBottom: number;
  minColumn: number;
  maxColumn: number;
  /** The box's row among its siblings; a sibling in a lower row that shares a column stands below. */
  row: number;
  /** The items directly in this box. */
  items: readonly string[];
  children: readonly PlacementBand[];
}

/** What the placement takes. */
export interface PlacementInput {
  /** The items of each column, top to bottom. */
  columns: readonly (readonly string[])[];
  /** Every item's height. */
  heights: ReadonlyMap<string, number>;
  wires: readonly PlacementWire[];
  /** The top-level boxes. */
  bands: readonly PlacementBand[];
  /** The least room between neighbouring items of a column. */
  gap: number;
  /** The least room between sibling boxes that share a column. */
  bandGap: number;
}

/** The placement: every item's top, every box's edges, and the objective. */
export interface Placement {
  top: Map<string, number>;
  boxes: Map<string, { top: number; bottom: number }>;
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

  for (const column of input.columns) {
    for (let i = 1; i < column.length; i++) {
      constraints.push({ tail: itemNode(column[i - 1]), head: itemNode(column[i]), delta: height(column[i - 1]) + Math.round(input.gap), weight: 0 });
    }
  }

  const visit = (bands: readonly PlacementBand[], parent: PlacementBand | null): void => {
    for (const band of bands) {
      const top = node(`top\0${band.key}`), bottom = node(`bottom\0${band.key}`);
      const insetTop = Math.round(band.insetTop), insetBottom = Math.round(band.insetBottom);
      for (const item of band.items) {
        constraints.push({ tail: top, head: itemNode(item), delta: insetTop, weight: 0 });
        constraints.push({ tail: itemNode(item), head: bottom, delta: height(item) + insetBottom, weight: 0 });
      }
      for (const child of band.children) {
        constraints.push({ tail: top, head: node(`top\0${child.key}`), delta: insetTop, weight: 0 });
        constraints.push({ tail: node(`bottom\0${child.key}`), head: bottom, delta: insetBottom, weight: 0 });
      }
      // The box as tight as its members allow: its height costs, far beneath any wire.
      constraints.push({ tail: top, head: bottom, delta: 0, weight: 1 });
      visit(band.children, band);
    }
    // Siblings that share a column stand in their rows, one box wholly above the other.
    for (const upper of bands) {
      for (const lower of bands) {
        if (upper === lower || upper.row >= lower.row) continue;
        if (upper.maxColumn < lower.minColumn || lower.maxColumn < upper.minColumn) continue;
        constraints.push({ tail: node(`bottom\0${upper.key}`), head: node(`top\0${lower.key}`), delta: Math.round(input.bandGap), weight: 0 });
      }
    }
    void parent;
  };
  visit(input.bands, null);

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
  const boxes = new Map<string, { top: number; bottom: number }>();
  const collect = (bands: readonly PlacementBand[]): void => {
    for (const band of bands) {
      boxes.set(band.key, { top: ranking.position[node(`top\0${band.key}`)], bottom: ranking.position[node(`bottom\0${band.key}`)] });
      collect(band.children);
    }
  };
  collect(input.bands);
  // The picture starts at zero: the least top of any item or box.
  let least = Infinity;
  for (const value of top.values()) least = Math.min(least, value);
  for (const box of boxes.values()) least = Math.min(least, box.top);
  if (Number.isFinite(least) && least !== 0) {
    for (const [id, value] of top) top.set(id, value - least);
    for (const [key, box] of boxes) boxes.set(key, { top: box.top - least, bottom: box.bottom - least });
  }
  return { top, boxes, cost: placementCost(input.wires, top), optimal: ranking.optimal };
}
