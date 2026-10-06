import { describe, expect, it } from "vitest";

import { placeBranches, placementCost, type PlacementBand, type PlacementInput, type PlacementLane, type PlacementWire, type StackEntry } from "./branch-placement";

const heights = (pairs: Array<[string, number]>): Map<string, number> => new Map(pairs);

const band = (key: string, items: string[], columns: [number, number], row = 0, children: PlacementBand[] = [], inset: [number, number] = [30, 12]): PlacementBand =>
  ({ key, insetTop: inset[0], insetBottom: inset[1], minColumn: columns[0], maxColumn: columns[1], row, items, children });

const wire = (from: [string, number], to: [string, number], weight = 1): PlacementWire => ({ from: { item: from[0], offset: from[1] }, to: { item: to[0], offset: to[1] }, weight });

/** The lane's slot height and padding as the renderer gives them, and the slot's middle pixel, where its wire runs. */
const PITCH = 7, PADDING = 6, LINE = Math.floor(PITCH / 2);

/** A lane of `count` slots in one column, as the stack entry and as the band around its slots. */
const lane = (key: string, column: number, count: number, row = 0): { entry: PlacementLane; band: PlacementBand; slots: string[]; heights: Array<[string, number]> } => {
  const slots = Array.from({ length: count }, (_, i) => `${key}/${i}`);
  return { entry: { key, slots }, band: band(key, slots, [column, column], row, [], [PADDING, PADDING]), slots, heights: slots.map(slot => [slot, PITCH] as [string, number]) };
};

/** Every item inside its box with the insets, every column in order with the gap, slots in order at their pitch, and sibling boxes that share a column apart. */
function expectWellFormed(input: PlacementInput, placement: ReturnType<typeof placeBranches>): void {
  const edges = (entry: StackEntry): { top: number; bottom: number } =>
    typeof entry === "string"
      ? { top: placement.top.get(entry)!, bottom: placement.top.get(entry)! + input.heights.get(entry)! }
      : placement.boxes.get(entry.key)!;
  for (const column of input.columns) {
    for (let i = 1; i < column.length; i++) {
      expect(edges(column[i]).top).toBeGreaterThanOrEqual(edges(column[i - 1]).bottom + input.gap);
    }
    for (const entry of column) {
      if (typeof entry === "string") continue;
      for (let i = 1; i < entry.slots.length; i++) {
        expect(placement.top.get(entry.slots[i])!).toBeGreaterThanOrEqual(placement.top.get(entry.slots[i - 1])! + input.heights.get(entry.slots[i - 1])!);
      }
    }
  }
  const visit = (bands: readonly PlacementBand[]): void => {
    for (const b of bands) {
      const box = placement.boxes.get(b.key)!;
      for (const item of b.items) {
        expect(placement.top.get(item)!).toBeGreaterThanOrEqual(box.top + b.insetTop);
        expect(placement.top.get(item)! + input.heights.get(item)!).toBeLessThanOrEqual(box.bottom - b.insetBottom);
      }
      for (const child of b.children) {
        const inner = placement.boxes.get(child.key)!;
        expect(inner.top).toBeGreaterThanOrEqual(box.top + b.insetTop);
        expect(inner.bottom).toBeLessThanOrEqual(box.bottom - b.insetBottom);
      }
      for (const other of bands) {
        if (other === b || b.row >= other.row || b.maxColumn < other.minColumn || other.maxColumn < b.minColumn) continue;
        expect(placement.boxes.get(other.key)!.top).toBeGreaterThanOrEqual(box.bottom + input.bandGap);
      }
      visit(b.children);
    }
  };
  visit(input.bands);
}

describe("placing the retained files", () => {
  it("stacks a column at its gaps when nothing pulls, and starts the picture at zero", () => {
    const input: PlacementInput = { columns: [["a", "b", "c"]], heights: heights([["a", 100], ["b", 50], ["c", 80]]), wires: [], bands: [band("root", ["a", "b", "c"], [0, 0], 0, [], [0, 0])], gap: 24, bandGap: 28 };
    const placement = placeBranches(input);
    expect([placement.top.get("a"), placement.top.get("b"), placement.top.get("c")]).toEqual([0, 124, 198]);
    expect(placement.boxes.get("root")).toEqual({ top: 0, bottom: 278 });
    expectWellFormed(input, placement);
  });

  it("lowers a card to the partner its wire meets: the owner's graph.ts moves down to document.ts's rows", () => {
    // document (tall, left) has pins at 40 and 300; graph (right) has one pin at 20 wired to document's pin at 300.
    const input: PlacementInput = {
      columns: [["document"], ["graph"]],
      heights: heights([["document", 400], ["graph", 120]]),
      wires: [wire(["document", 300], ["graph", 20])],
      bands: [band("root", ["document", "graph"], [0, 1], 0, [], [0, 0])],
      gap: 24, bandGap: 28
    };
    const placement = placeBranches(input);
    expect(placement.top.get("graph")! + 20).toBe(placement.top.get("document")! + 300);
    expect(placement.cost).toBe(0);
    expect(placement.optimal).toBe(true);
  });

  it("weighs a bundle's shared run by its members, so the many pull harder than the one", () => {
    // Card p is wired once to q (pin 50 to pin 10, so q wants to stand at 40) and by a bundle of five to r (pin 100 to
    // pin 10, so r wants 90); q stands above r with its height and the gap between, 84, so both cannot have their way.
    const input: PlacementInput = {
      columns: [["p"], ["q", "r"]],
      heights: heights([["p", 200], ["q", 60], ["r", 60]]),
      wires: [wire(["p", 50], ["q", 10], 1), wire(["p", 100], ["r", 10], 5)],
      bands: [band("root", ["p", "q", "r"], [0, 1], 0, [], [0, 0])],
      gap: 24, bandGap: 28
    };
    const placement = placeBranches(input);
    // The bundle wins: r aligns exactly, and q stands as close to its pin as r allows, 34 short of it.
    expect(placement.top.get("r")! + 10).toBe(placement.top.get("p")! + 100);
    expect(placement.top.get("q")! + 60 + 24).toBe(placement.top.get("r")!);
    expect(placement.cost).toBe(34);
    expectWellFormed(input, placement);
  });

  it("keeps a directory's box around its members and a sibling below it in every shared column", () => {
    // Portal (cols 0..2, row 0) holds Models (col 0) and Services (col 1); Gateway (col 0, row 1) stands below Portal.
    const models = band("portal/models", ["m1", "m2"], [0, 0]);
    const services = band("portal/services", ["s"], [1, 1]);
    const portal = band("portal", [], [0, 1], 0, [models, services]);
    const gateway = band("gateway", ["g"], [0, 0], 1);
    const input: PlacementInput = {
      columns: [["m1", "m2", "g"], ["s"]],
      heights: heights([["m1", 100], ["m2", 100], ["s", 150], ["g", 100]]),
      // g's wire pulls it up toward s; the band rows keep it below the whole of Portal.
      wires: [wire(["g", 10], ["s", 10], 3), wire(["m1", 10], ["s", 10], 1)],
      bands: [portal, gateway],
      gap: 24, bandGap: 28
    };
    const placement = placeBranches(input);
    expectWellFormed(input, placement);
    const portalBox = placement.boxes.get("portal")!;
    expect(placement.top.get("g")!).toBeGreaterThanOrEqual(portalBox.bottom + 28 + 30);
    expect(portalBox.bottom).toBeGreaterThanOrEqual(placement.top.get("s")! + 150 + 12 + 12);
  });

  it("draws every box tight around its members, with its label's room above and its padding below", () => {
    const inner = band("a/b", ["x"], [0, 0], 0, [], [30, 12]);
    const outer = band("a", [], [0, 1], 0, [inner, band("a/c", ["y"], [1, 1], 0, [], [30, 12])], [30, 12]);
    const input: PlacementInput = { columns: [["x"], ["y"]], heights: heights([["x", 100], ["y", 40]]), wires: [wire(["x", 90], ["y", 10])], bands: [outer], gap: 24, bandGap: 28 };
    const placement = placeBranches(input);
    expectWellFormed(input, placement);
    expect(placement.boxes.get("a/b")).toEqual({ top: placement.top.get("x")! - 30, bottom: placement.top.get("x")! + 100 + 12 });
    const c = placement.boxes.get("a/c")!, a = placement.boxes.get("a")!;
    expect(c).toEqual({ top: placement.top.get("y")! - 30, bottom: placement.top.get("y")! + 40 + 12 });
    expect(a.top).toBe(Math.min(placement.boxes.get("a/b")!.top, c.top) - 30);
    expect(a.bottom).toBe(Math.max(placement.boxes.get("a/b")!.bottom, c.bottom) + 12);
    // And the wire is still straight: the boxes cost nothing against it.
    expect(placement.cost).toBe(0);
  });

  it("stands a lane in its column's stack like a card: the gap to its neighbours, and its slots at their pitch inside its padding", () => {
    const l = lane("lane", 0, 2);
    const input: PlacementInput = {
      columns: [["a", l.entry, "b"]],
      heights: heights([["a", 100], ["b", 50], ...l.heights]),
      wires: [],
      bands: [band("root", ["a", "b"], [0, 0], 0, [l.band], [0, 0])],
      gap: 24, bandGap: 28
    };
    const placement = placeBranches(input);
    expectWellFormed(input, placement);
    // Nothing pulls, so the lane is its slots at pitch inside its padding: 6 + 7 + 7 + 6 = 26 tall, as a rigid lane was.
    expect(placement.boxes.get("lane")).toEqual({ top: 124, bottom: 150 });
    expect([placement.top.get("lane/0"), placement.top.get("lane/1")]).toEqual([130, 137]);
    expect(placement.top.get("b")).toBe(174);
  });

  it("spreads a lane's slots to the wires through them, and the lane grows exactly as far as they ask", () => {
    // Card p's pins at 20 and 280 each send a wire through a slot of the lane to a card on the far side, q and r. A
    // rigid lane would hold the two slots 7 px apart and one wire or the other would bend; free slots let both run level.
    const l = lane("lane", 1, 2);
    const input: PlacementInput = {
      columns: [["p"], [l.entry], ["q", "r"]],
      heights: heights([["p", 300], ["q", 60], ["r", 60], ...l.heights]),
      wires: [
        wire(["p", 20], ["lane/0", LINE]), wire(["lane/0", LINE], ["q", 10]),
        wire(["p", 280], ["lane/1", LINE]), wire(["lane/1", LINE], ["r", 10])
      ],
      bands: [band("root", ["p", "q", "r"], [0, 2], 0, [l.band], [0, 0])],
      gap: 24, bandGap: 28
    };
    const placement = placeBranches(input);
    expectWellFormed(input, placement);
    expect(placement.cost).toBe(0);
    expect(placement.optimal).toBe(true);
    const p = placement.top.get("p")!;
    expect(placement.top.get("lane/0")! + LINE).toBe(p + 20);
    expect(placement.top.get("lane/1")! + LINE).toBe(p + 280);
    expect(placement.boxes.get("lane")).toEqual({ top: placement.top.get("lane/0")! - PADDING, bottom: placement.top.get("lane/1")! + PITCH + PADDING });
    expect(placement.top.get("q")! + 10).toBe(p + 20);
    expect(placement.top.get("r")! + 10).toBe(p + 280);
  });

  it("keeps a lane's slots in their order and at their pitch when their wires pull them past each other", () => {
    // The first slot's wire leaves p's pin at 100 and the second's at 20, so the wires want the slots the other way
    // round; the far ends are left out so that only the pins pull. The slots stay in order, touching, and the two
    // wires between them bend by the 80 px between the pins plus the 7 px slot they cannot close.
    const l = lane("lane", 1, 2);
    const input: PlacementInput = {
      columns: [["p"], [l.entry]],
      heights: heights([["p", 200], ...l.heights]),
      wires: [wire(["p", 100], ["lane/0", LINE]), wire(["p", 20], ["lane/1", LINE])],
      bands: [band("root", ["p"], [0, 1], 0, [l.band], [0, 0])],
      gap: 24, bandGap: 28
    };
    const placement = placeBranches(input);
    expectWellFormed(input, placement);
    expect(placement.top.get("lane/1")! - placement.top.get("lane/0")!).toBe(PITCH);
    expect(placement.cost).toBe(80 + PITCH);
    expect(placement.optimal).toBe(true);
  });

  it("refuses a lane that is no box of the bands, since its edges would float free of its slots", () => {
    const l = lane("lane", 0, 1);
    const input: PlacementInput = { columns: [["a", l.entry]], heights: heights([["a", 10], ...l.heights]), wires: [], bands: [band("root", ["a"], [0, 0], 0, [], [0, 0])], gap: 24, bandGap: 28 };
    expect(() => placeBranches(input)).toThrow(/no box of the bands/u);
  });

  it("never costs more than the stacked start, and places the same way every time", () => {
    let state = 5;
    const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
    const cards = [["a", "b", "c"], ["d", "e", "f", "g"], ["h", "i"]];
    const l = lane("lane", 1, 3);
    const columns: StackEntry[][] = [cards[0], ["d", "e", l.entry, "f", "g"], cards[2]];
    const h = heights([...cards.flat().map(id => [id, 60 + Math.floor(next() * 200)] as [string, number]), ...l.heights]);
    const wires: PlacementWire[] = [];
    for (let i = 0; i < 12; i++) {
      const c = Math.floor(next() * 2);
      const from = cards[c][Math.floor(next() * cards[c].length)], to = cards[c + 1][Math.floor(next() * cards[c + 1].length)];
      wires.push(wire([from, Math.floor(next() * h.get(from)!)], [to, Math.floor(next() * h.get(to)!)], 1 + Math.floor(next() * 3)));
    }
    // Three wires from the first column thread the lane's slots to the third.
    for (const slot of l.slots) {
      const from = cards[0][Math.floor(next() * 3)], to = cards[2][Math.floor(next() * 2)];
      wires.push(wire([from, Math.floor(next() * h.get(from)!)], [slot, LINE]), wire([slot, LINE], [to, Math.floor(next() * h.get(to)!)]));
    }
    const input: PlacementInput = { columns, heights: h, wires, bands: [band("root", cards.flat(), [0, 2], 0, [l.band], [0, 0])], gap: 24, bandGap: 28 };
    const placement = placeBranches(input);
    expectWellFormed(input, placement);
    const stacked = new Map<string, number>();
    for (const column of columns) {
      let y = 0;
      for (const entry of column) {
        if (typeof entry === "string") { stacked.set(entry, y); y += h.get(entry)! + 24; continue; }
        y += PADDING;
        for (const slot of entry.slots) { stacked.set(slot, y); y += PITCH; }
        y += PADDING + 24;
      }
    }
    expect(placement.cost).toBeLessThan(placementCost(wires, stacked));
    expect(placeBranches(input)).toEqual(placement);
  });
});
