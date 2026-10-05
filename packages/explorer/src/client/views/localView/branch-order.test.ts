import { describe, expect, it } from "vitest";

import { crossingsOf, orderBranches, walkColumns, type ForwardReference, type Lane, type OrderInput } from "./branch-order";

/** Every card in these tests shows three rows, top to bottom, unless a test says otherwise. */
const ROWS = ["r0", "r1", "r2"] as const;

const rowsOf = (files: readonly string[], rows: readonly string[] = ROWS): Map<string, string[]> => new Map(files.map(file => [file, [...rows]]));

const edge = (provider: string, consumer: string, providerRow = "r1", consumerRow = "r1"): ForwardReference =>
  ({ key: `${provider}>${consumer}@${providerRow}:${consumerRow}`, provider, consumer, pin: `${provider}@${providerRow}`, providerRow, consumerRow });

const flat = (): string => "";

const directoryOf = (id: string): string => (id.includes("/") ? id.slice(0, id.lastIndexOf("/")) : "");

const input = (columns: string[][], edges: ForwardReference[], directories: (id: string) => string = flat, rows?: Map<string, string[]>): OrderInput =>
  ({ columns, directoryOf: directories, rows: rows ?? rowsOf(columns.flat()), edges });

/** A deterministic pseudo-random graph: the same seed gives the same wires every run. Three rows per file, so pins bundle. */
function seeded(seed: number, columns: number, perColumn: number, wires: number, directories: (id: string) => string = id => id.endsWith("a") || id.endsWith("b") ? "top" : "rest"): OrderInput {
  let state = seed;
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const files = Array.from({ length: columns }, (_, c) => Array.from({ length: perColumn }, (_, i) => `c${c}f${String.fromCharCode(97 + i)}`));
  const edges: ForwardReference[] = [];
  while (edges.length < wires) {
    const a = Math.floor(next() * (columns - 1));
    const b = a + 1 + Math.floor(next() * (columns - a - 1));
    const provider = files[a][Math.floor(next() * perColumn)], consumer = files[b][Math.floor(next() * perColumn)];
    const providerRow = ROWS[Math.floor(next() * 3)], consumerRow = ROWS[Math.floor(next() * 3)];
    if (!edges.some(e => e.provider === provider && e.consumer === consumer && e.providerRow === providerRow && e.consumerRow === consumerRow)) edges.push(edge(provider, consumer, providerRow, consumerRow));
  }
  return input(files, edges, directories);
}

/** Every wire of every bundle in every lane, with the lane. */
const passing = (lanes: Iterable<Lane>): Array<{ lane: Lane; edge: string }> =>
  [...lanes].flatMap(lane => lane.bundles.flatMap(bundle => bundle.edges.map(edge => ({ lane, edge }))));

describe("ordering the retained files", () => {
  it("removes a crossing that the alphabetical order creates", () => {
    const given = input([["p1", "p2"], ["c1", "c2"]], [edge("p1", "c2"), edge("p2", "c1")]);
    expect(crossingsOf(given.columns, given.rows, given.edges)).toBe(1);
    const order = orderBranches(given);
    expect(order.crossings).toBe(0);
    expect(crossingsOf(order.columns, order.rows, given.edges)).toBe(0);
    expect(order.columns.map(column => [...column].sort())).toEqual([["p1", "p2"], ["c1", "c2"]]);
  });

  it("never leaves more crossings than the order it started from, and keeps every file in its column", () => {
    for (const seed of [1, 7, 42, 2026]) {
      const given = seeded(seed, 4, 6, 18);
      const start = orderBranches({ ...given, sweeps: 0 });
      const order = orderBranches(given);
      expect(order.crossings).toBeLessThanOrEqual(start.crossings);
      order.columns.forEach((column, c) => expect([...column].sort()).toEqual([...given.columns[c]].sort()));
    }
  });

  it("reduces the crossings a scope with no skipped columns starts with, on the instrument's own count", () => {
    let improved = 0;
    for (const seed of [5, 9, 13, 21, 34]) {
      const given = seeded(seed, 2, 7, 12);
      const before = crossingsOf(given.columns, given.rows, given.edges);
      const order = orderBranches(given);
      const after = crossingsOf(order.columns, order.rows, given.edges);
      expect(after).toBeLessThanOrEqual(before);
      expect(order.crossings).toBe(after);
      if (after < before) improved++;
    }
    expect(improved).toBeGreaterThan(0);
  });

  it("keeps the files of one directory together in a column, whatever the wires ask", () => {
    const given = seeded(3, 3, 6, 14);
    const order = orderBranches(given);
    for (const column of order.columns) {
      const directories = column.map(given.directoryOf);
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
    const order = orderBranches(input([["p", "q"], ["x", "y"], ["c", "d"]], [edge("q", "x"), edge("x", "d"), edge("p", "c")]));
    const passage = order.passages.get(`${edge("p", "c").key}\u00001`);
    expect(passage).toBeDefined();
    const lane = order.lanes.get(passage!.lane)!;
    expect(lane.column).toBe(1);
    // p stands above q, so the wire from p runs above x, which q feeds: in the gap above the first file.
    expect(lane.after).toBeNull();
    expect(lane.row).toBeNull();
    expect(lane.bundles).toEqual([{ pin: "p@r1", edges: [edge("p", "c").key] }]);
    expect(order.crossings).toBe(0);
  });

  it("bundles the wires of one pin through the columns they pass together, each leaving before its consumer's column", () => {
    const order = orderBranches(input(
      [["p"], ["x"], ["y", "c1"], ["c2", "c3"]],
      [edge("p", "x"), edge("p", "c1"), edge("p", "c2"), edge("p", "c3"), edge("x", "y", "r0"), edge("y", "c2", "r0")]
    ));
    const at = (key: string, column: number): { lane: string; index: number } | undefined => order.passages.get(`${key}\u0000${column}`);
    // Through column 1, the three wires that go past x share one slot of one lane.
    const first = at(edge("p", "c1").key, 1)!;
    expect(first).toBeDefined();
    expect(at(edge("p", "c2").key, 1)).toEqual(first);
    expect(at(edge("p", "c3").key, 1)).toEqual(first);
    expect(order.lanes.get(first.lane)!.bundles).toEqual([{ pin: "p@r1", edges: [edge("p", "c1").key, edge("p", "c2").key, edge("p", "c3").key] }]);
    // The wire to c1 leaves there; the two to column 3 go on together.
    expect(at(edge("p", "c1").key, 2)).toBeUndefined();
    const second = at(edge("p", "c2").key, 2)!;
    expect(second).toBeDefined();
    expect(at(edge("p", "c3").key, 2)).toEqual(second);
    expect(order.lanes.get(second.lane)!.bundles).toEqual([{ pin: "p@r1", edges: [edge("p", "c2").key, edge("p", "c3").key] }]);
    // Adjacent wires take no lane, and the lane of column 2 holds one slot, not two.
    expect(at(edge("p", "x").key, 1)).toBeUndefined();
    expect([...order.lanes.values()].filter(lane => lane.column === 2)).toHaveLength(1);
  });

  it("keeps two pins of one file apart in a lane and counts their slots", () => {
    const order = orderBranches(input([["p"], ["x"], ["c"]], [edge("p", "c", "r0", "r0"), edge("p", "c", "r2", "r2")]));
    const lanes = [...order.lanes.values()];
    expect(lanes).toHaveLength(1);
    expect(lanes[0].bundles.map(bundle => bundle.pin)).toEqual(["p@r0", "p@r2"]);
    expect(order.passages.get(`${edge("p", "c", "r0", "r0").key}\u00001`)!.index).toBe(0);
    expect(order.passages.get(`${edge("p", "c", "r2", "r2").key}\u00001`)!.index).toBe(1);
  });

  it("puts a lane in no directory that holds neither end of its wires", () => {
    // Only b/x stands in the middle column: the wire from a/p to c/c runs beside b, at the root, not inside it.
    const sideways = orderBranches(input([["a/p"], ["b/x"], ["c/c"]], [edge("a/p", "c/c")], directoryOf));
    expect([...sideways.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "", after: null, row: expect.any(Number) })]);
    expect(sideways.bands.map(band => band.directory).sort()).toEqual(["a", "b", "c"]);
    // A directory spanning the middle column with no file there keeps its own wire inside its box: the lane is the column's only occupant.
    const hull = orderBranches(input([["a/p"], ["b/x"], ["a/c"]], [edge("a/p", "a/c")], directoryOf));
    expect([...hull.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "a", after: null, row: null })]);
    expect(hull.bands.find(band => band.directory === "a")!.nodesByColumn.get(1)).toEqual([]);
    // Within one directory the lane joins its stack of files.
    const inside = orderBranches(input([["a/p"], ["a/x"], ["a/c"]], [edge("a/p", "a/c")], directoryOf));
    expect([...inside.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "a", row: null })]);
    // The estate's shape: Portal/Models to Portal/Controllers past Portal/Services runs inside Portal, beside Services.
    const portal = orderBranches(input(
      [["portal/models/p"], ["portal/services/x"], ["portal/controllers/c"]],
      [edge("portal/models/p", "portal/controllers/c"), edge("portal/models/p", "portal/services/x"), edge("portal/services/x", "portal/controllers/c")],
      directoryOf
    ));
    expect([...portal.lanes.values()]).toEqual([expect.objectContaining({ column: 1, host: "portal", after: null, row: expect.any(Number) })]);
    expect(portal.bands.map(band => band.directory)).toEqual(["portal"]);
    // And the same holds for every lane of a seeded scope with nested directories.
    for (const seed of [4, 16, 64]) {
      const given = seeded(seed, 5, 4, 24, id => (id.endsWith("a") ? "top/one" : id.endsWith("b") ? "top/two" : id.endsWith("c") ? "rest" : ""));
      const order = orderBranches(given);
      for (const { lane, edge: key } of passing(order.lanes.values())) {
        const wire = given.edges.find(e => e.key === key)!;
        const under = (file: string): boolean => lane.host === "" || given.directoryOf(file) === lane.host || given.directoryOf(file).startsWith(`${lane.host}/`);
        expect(under(wire.provider) || under(wire.consumer), `${lane.key} holds ${key} but neither end is under ${lane.host}`).toBe(true);
      }
    }
  });

  it("returns bands that walk to exactly the columns it returns, so the page and the lanes agree", () => {
    for (const seed of [2, 8, 19, 77, 101]) {
      const given = seeded(seed, 5, 5, 20);
      const order = orderBranches(given);
      expect(walkColumns(order.bands, given.columns.length)).toEqual(order.columns);
      for (const lane of order.lanes.values()) {
        if (lane.after !== null) expect(order.columns[lane.column]).toContain(lane.after);
        expect(lane.bundles.length).toBeGreaterThan(0);
      }
      // Every wire that skips columns has a passage through each one, and none through its own ends' columns.
      const columnOf = new Map(given.columns.flatMap((files, c) => files.map(id => [id, c] as const)));
      for (const wire of given.edges) {
        const a = columnOf.get(wire.provider)!, b = columnOf.get(wire.consumer)!;
        for (let column = 0; column < given.columns.length; column++) {
          expect(order.passages.has(`${wire.key}\u0000${column}`), `${wire.key} at column ${column}`).toBe(column > a && column < b);
        }
      }
    }
  });

  it("is the same order every time for the same input", () => {
    const given = seeded(11, 4, 5, 16);
    const first = orderBranches(given), second = orderBranches(given);
    expect(second.columns).toEqual(first.columns);
    expect([...second.lanes]).toEqual([...first.lanes]);
    expect(second.crossings).toBe(first.crossings);
    const movable = { ...given, movable: () => true };
    expect(orderBranches(movable).rows).toEqual(orderBranches(movable).rows);
  });
});

describe("ordering the rows of a card", () => {
  it("keeps every row as given unless told which may move", () => {
    const given = input([["p"], ["a", "b"]], [edge("p", "b", "r0"), edge("p", "a", "r2")]);
    expect(orderBranches(given).rows).toEqual(rowsOf(["p", "a", "b"]));
  });

  it("stands a row whose wires lead above another's wires above it, with unwired rows after them", () => {
    // p's top row feeds c's bottom row and p's bottom row feeds c's top: a crossing no column order can remove.
    const given = input([["p"], ["c"]], [edge("p", "c", "r0", "r2"), edge("p", "c", "r2", "r0")]);
    expect(orderBranches(given).crossings).toBe(1);
    const order = orderBranches({ ...given, movable: () => true });
    expect(order.crossings).toBe(0);
    // p is settled first against c as given, so p turns over and the unwired r1 follows; c then settles against the new p and keeps r0 above r2.
    expect(order.rows.get("p")).toEqual(["r2", "r0", "r1"]);
    expect(order.rows.get("c")).toEqual(["r0", "r2", "r1"]);
  });

  it("keeps a row that may not move in its place, as Internals keeps the foot of a card", () => {
    // p's x feeds c's bottom row and its y feeds c's top; Internals feeds the middle and may not move.
    const rows = new Map([["p", ["x", "y", "__internals__"]], ["c", ["u", "v", "w"]]]);
    const given = input([["p"], ["c"]], [edge("p", "c", "x", "w"), edge("p", "c", "y", "u"), edge("p", "c", "__internals__", "v")], flat, rows);
    const order = orderBranches({ ...given, movable: name => name !== "__internals__" });
    expect(order.rows.get("p")).toEqual(["y", "x", "__internals__"]);
  });

  it("returns every card's rows as a permutation, and never crosses more than the given rows", () => {
    for (const seed of [6, 23, 48, 99]) {
      const given = seeded(seed, 4, 5, 22);
      const fixed = orderBranches(given);
      const moved = orderBranches({ ...given, movable: () => true });
      expect(moved.crossings).toBeLessThanOrEqual(fixed.crossings);
      for (const [id, rows] of given.rows) expect([...moved.rows.get(id)!].sort()).toEqual([...rows].sort());
    }
  });

});
