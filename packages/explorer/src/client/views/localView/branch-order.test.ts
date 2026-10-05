import { describe, expect, it } from "vitest";

import { crossingsOf, orderBranches, walkColumns, type ForwardReference, type Lane, type OrderInput } from "./branch-order";

const edge = (provider: string, consumer: string, providerRow = 0.5, consumerRow = 0.5): ForwardReference =>
  ({ key: `${provider}>${consumer}@${providerRow}:${consumerRow}`, provider, consumer, pin: `${provider}@${providerRow}`, providerRow, consumerRow });

const flat = (): string => "";

const directoryOf = (id: string): string => (id.includes("/") ? id.slice(0, id.lastIndexOf("/")) : "");

/** A deterministic pseudo-random graph: the same seed gives the same wires every run. Three pin rows per file, so pins bundle. */
function seeded(seed: number, columns: number, perColumn: number, wires: number, directories: (id: string) => string = id => id.endsWith("a") || id.endsWith("b") ? "top" : "rest"): OrderInput {
  let state = seed;
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const files = Array.from({ length: columns }, (_, c) => Array.from({ length: perColumn }, (_, i) => `c${c}f${String.fromCharCode(97 + i)}`));
  const edges: ForwardReference[] = [];
  while (edges.length < wires) {
    const a = Math.floor(next() * (columns - 1));
    const b = a + 1 + Math.floor(next() * (columns - a - 1));
    const provider = files[a][Math.floor(next() * perColumn)], consumer = files[b][Math.floor(next() * perColumn)];
    const providerRow = [1 / 6, 1 / 2, 5 / 6][Math.floor(next() * 3)];
    if (!edges.some(e => e.provider === provider && e.consumer === consumer)) edges.push(edge(provider, consumer, providerRow, next()));
  }
  return { columns: files, directoryOf: directories, edges };
}

/** Every wire of every bundle in every lane, with the lane. */
const passing = (lanes: Iterable<Lane>): Array<{ lane: Lane; edge: string }> =>
  [...lanes].flatMap(lane => lane.bundles.flatMap(bundle => bundle.edges.map(edge => ({ lane, edge }))));

describe("ordering the retained files", () => {
  it("removes a crossing that the alphabetical order creates", () => {
    const input: OrderInput = { columns: [["p1", "p2"], ["c1", "c2"]], directoryOf: flat, edges: [edge("p1", "c2"), edge("p2", "c1")] };
    expect(crossingsOf(input.columns, input.edges)).toBe(1);
    const order = orderBranches(input);
    expect(order.crossings).toBe(0);
    expect(crossingsOf(order.columns, input.edges)).toBe(0);
    expect(order.columns.map(column => [...column].sort())).toEqual([["p1", "p2"], ["c1", "c2"]]);
  });

  it("never leaves more crossings than the order it started from, and keeps every file in its column", () => {
    for (const seed of [1, 7, 42, 2026]) {
      const input = seeded(seed, 4, 6, 18);
      const start = orderBranches({ ...input, sweeps: 0 });
      const order = orderBranches(input);
      expect(order.crossings).toBeLessThanOrEqual(start.crossings);
      order.columns.forEach((column, c) => expect([...column].sort()).toEqual([...input.columns[c]].sort()));
    }
  });

  it("reduces the crossings a scope with no skipped columns starts with, on the instrument's own count", () => {
    let improved = 0;
    for (const seed of [5, 9, 13, 21, 34]) {
      const input = seeded(seed, 2, 7, 12);
      const before = crossingsOf(input.columns, input.edges);
      const order = orderBranches(input);
      const after = crossingsOf(order.columns, input.edges);
      expect(after).toBeLessThanOrEqual(before);
      expect(order.crossings).toBe(after);
      if (after < before) improved++;
    }
    expect(improved).toBeGreaterThan(0);
  });

  it("keeps the files of one directory together in a column, whatever the wires ask", () => {
    const input = seeded(3, 3, 6, 14);
    const order = orderBranches(input);
    for (const column of order.columns) {
      const directories = column.map(input.directoryOf);
      const seen = new Set<string>();
      let previous = "";
      for (const directory of directories) {
        if (directory !== previous) {
          expect(seen.has(directory), `${directory} appears twice in ${column.join(", ")}`).toBe(false);
          seen.add(directory);
          previous = directory;
        }
      }
    }
  });

  it("gives a wire that skips a column a lane beside the files it runs between", () => {
    const input: OrderInput = {
      columns: [["p", "q"], ["x", "y"], ["c", "d"]],
      directoryOf: flat,
      edges: [edge("q", "x"), edge("x", "d"), edge("p", "c")]
    };
    const order = orderBranches(input);
    const passage = order.passages.get(`${edge("p", "c").key}\u00001`);
    expect(passage).toBeDefined();
    const lane = order.lanes.get(passage!.lane)!;
    expect(lane.column).toBe(1);
    // p stands above q, so the wire from p runs above x, which q feeds: in the gap above the first file.
    expect(lane.after).toBeNull();
    expect(lane.row).toBeNull();
    expect(lane.bundles).toEqual([{ pin: "p@0.5", edges: [edge("p", "c").key] }]);
    expect(order.crossings).toBe(0);
  });

  it("bundles the wires of one pin through the columns they pass together, each leaving before its consumer's column", () => {
    const input: OrderInput = {
      columns: [["p"], ["x"], ["y", "c1"], ["c2", "c3"]],
      directoryOf: flat,
      edges: [edge("p", "x"), edge("p", "c1"), edge("p", "c2"), edge("p", "c3"), edge("x", "y", 0.25), edge("y", "c2", 0.25)]
    };
    const order = orderBranches(input);
    const at = (key: string, column: number): { lane: string; index: number } | undefined => order.passages.get(`${key}\u0000${column}`);
    // Through column 1, the three wires that go past x share one slot of one lane.
    const first = at(edge("p", "c1").key, 1)!;
    expect(first).toBeDefined();
    expect(at(edge("p", "c2").key, 1)).toEqual(first);
    expect(at(edge("p", "c3").key, 1)).toEqual(first);
    expect(order.lanes.get(first.lane)!.bundles).toEqual([{ pin: "p@0.5", edges: [edge("p", "c1").key, edge("p", "c2").key, edge("p", "c3").key] }]);
    // The wire to c1 leaves there; the two to column 3 go on together.
    expect(at(edge("p", "c1").key, 2)).toBeUndefined();
    const second = at(edge("p", "c2").key, 2)!;
    expect(second).toBeDefined();
    expect(at(edge("p", "c3").key, 2)).toEqual(second);
    expect(order.lanes.get(second.lane)!.bundles).toEqual([{ pin: "p@0.5", edges: [edge("p", "c2").key, edge("p", "c3").key] }]);
    // Adjacent wires take no lane, and the lane of column 2 holds one slot, not two.
    expect(at(edge("p", "x").key, 1)).toBeUndefined();
    expect([...order.lanes.values()].filter(lane => lane.column === 2)).toHaveLength(1);
  });

  it("keeps two pins of one file apart in a lane and counts their slots", () => {
    const input: OrderInput = {
      columns: [["p"], ["x"], ["c"]],
      directoryOf: flat,
      edges: [edge("p", "c", 0.25, 0.25), edge("p", "c", 0.75, 0.75)]
    };
    const order = orderBranches(input);
    const lanes = [...order.lanes.values()];
    expect(lanes).toHaveLength(1);
    expect(lanes[0].bundles.map(bundle => bundle.pin)).toEqual(["p@0.25", "p@0.75"]);
    expect(order.passages.get(`${edge("p", "c", 0.25, 0.25).key}\u00001`)!.index).toBe(0);
    expect(order.passages.get(`${edge("p", "c", 0.75, 0.75).key}\u00001`)!.index).toBe(1);
  });

  it("puts a lane in no directory that holds neither end of its wires", () => {
    // Only b/x stands in the middle column: the wire from a/p to c/c runs beside b, at the root, not inside it.
    const sideways = orderBranches({ columns: [["a/p"], ["b/x"], ["c/c"]], directoryOf, edges: [edge("a/p", "c/c")] });
    expect([...sideways.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "", after: null, row: expect.any(Number) })]);
    expect(sideways.bands.map(band => band.directory).sort()).toEqual(["a", "b", "c"]);
    // A directory spanning the middle column with no file there keeps its own wire inside its box: the lane is the column's only occupant.
    const hull = orderBranches({ columns: [["a/p"], ["b/x"], ["a/c"]], directoryOf, edges: [edge("a/p", "a/c")] });
    expect([...hull.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "a", after: null, row: null })]);
    expect(hull.bands.find(band => band.directory === "a")!.nodesByColumn.get(1)).toEqual([]);
    // Within one directory the lane joins its stack of files.
    const inside = orderBranches({ columns: [["a/p"], ["a/x"], ["a/c"]], directoryOf, edges: [edge("a/p", "a/c")] });
    expect([...inside.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "a", row: null })]);
    // The estate's shape: Portal/Models to Portal/Controllers past Portal/Services runs inside Portal, beside Services.
    const portal = orderBranches({
      columns: [["portal/models/p"], ["portal/services/x"], ["portal/controllers/c"]],
      directoryOf,
      edges: [edge("portal/models/p", "portal/controllers/c"), edge("portal/models/p", "portal/services/x"), edge("portal/services/x", "portal/controllers/c")]
    });
    expect([...portal.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "portal", after: null, row: expect.any(Number) })]);
    expect(portal.bands.map(band => band.directory)).toEqual(["portal"]);
    // And the same holds for every lane of a seeded scope with nested directories.
    for (const seed of [4, 16, 64]) {
      const input = seeded(seed, 5, 4, 24, id => (id.endsWith("a") ? "top/one" : id.endsWith("b") ? "top/two" : id.endsWith("c") ? "rest" : ""));
      const order = orderBranches(input);
      for (const { lane, edge: key } of passing(order.lanes.values())) {
        const wire = input.edges.find(e => e.key === key)!;
        const under = (file: string): boolean => lane.host === "" || input.directoryOf(file) === lane.host || input.directoryOf(file).startsWith(`${lane.host}/`);
        expect(under(wire.provider) || under(wire.consumer), `${lane.key} holds ${key} but neither end is under ${lane.host}`).toBe(true);
      }
    }
  });

  it("returns bands that walk to exactly the columns it returns, so the page and the lanes agree", () => {
    for (const seed of [2, 8, 19, 77, 101]) {
      const input = seeded(seed, 5, 5, 20);
      const order = orderBranches(input);
      expect(walkColumns(order.bands, input.columns.length)).toEqual(order.columns);
      for (const lane of order.lanes.values()) {
        if (lane.after !== null) expect(order.columns[lane.column]).toContain(lane.after);
        expect(lane.bundles.length).toBeGreaterThan(0);
      }
      // Every wire that skips columns has a passage through each one, and none through its own ends' columns.
      const columnOf = new Map(input.columns.flatMap((files, c) => files.map(id => [id, c] as const)));
      for (const wire of input.edges) {
        const a = columnOf.get(wire.provider)!, b = columnOf.get(wire.consumer)!;
        for (let column = 0; column < input.columns.length; column++) {
          expect(order.passages.has(`${wire.key}\u0000${column}`), `${wire.key} at column ${column}`).toBe(column > a && column < b);
        }
      }
    }
  });

  it("is the same order every time for the same input", () => {
    const input = seeded(11, 4, 5, 16);
    const first = orderBranches(input), second = orderBranches(input);
    expect(second.columns).toEqual(first.columns);
    expect([...second.lanes]).toEqual([...first.lanes]);
    expect(second.crossings).toBe(first.crossings);
  });
});
