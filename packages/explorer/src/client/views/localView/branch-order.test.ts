import { describe, expect, it } from "vitest";

import { crossingsOf, orderBranches, walkColumns, type ForwardReference, type OrderInput } from "./branch-order";

const edge = (provider: string, consumer: string, providerRow = 0.5, consumerRow = 0.5): ForwardReference =>
  ({ key: `${provider}>${consumer}@${providerRow}:${consumerRow}`, provider, consumer, providerRow, consumerRow });

const flat = (): string => "";

/** A deterministic pseudo-random graph: the same seed gives the same wires every run. */
function seeded(seed: number, columns: number, perColumn: number, wires: number): OrderInput {
  let state = seed;
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const files = Array.from({ length: columns }, (_, c) => Array.from({ length: perColumn }, (_, i) => `c${c}f${String.fromCharCode(97 + i)}`));
  const edges: ForwardReference[] = [];
  while (edges.length < wires) {
    const a = Math.floor(next() * (columns - 1));
    const b = a + 1 + Math.floor(next() * (columns - a - 1));
    const provider = files[a][Math.floor(next() * perColumn)], consumer = files[b][Math.floor(next() * perColumn)];
    if (!edges.some(e => e.provider === provider && e.consumer === consumer)) edges.push(edge(provider, consumer, next(), next()));
  }
  return { columns: files, directoryOf: id => id.endsWith("a") || id.endsWith("b") ? "top" : "rest", edges };
}

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
    expect(lane.edges).toEqual([edge("p", "c").key]);
    expect(order.crossings).toBe(0);
  });

  it("returns bands that walk to exactly the columns it returns, so the page and the lanes agree", () => {
    for (const seed of [2, 8, 19, 77, 101]) {
      const input = seeded(seed, 5, 5, 20);
      const order = orderBranches(input);
      expect(walkColumns(order.bands, input.columns.length)).toEqual(order.columns);
      for (const lane of order.lanes.values()) {
        if (lane.after !== null) expect(order.columns[lane.column]).toContain(lane.after);
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
