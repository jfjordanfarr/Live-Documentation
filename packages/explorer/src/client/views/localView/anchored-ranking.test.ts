import { describe, expect, it } from "vitest";

import { minimumConflictingAnchors, rankAnchoredColumns } from "./anchored-ranking";
import type { Constraint } from "./network-simplex";

/** Helper building indexed forward DAG constraints `provider -> consumer` with `delta = 1`. */
function buildGraph(ids: readonly string[], edges: readonly [string, string, number?][]): Constraint[] {
  const at = new Map(ids.map((id, i) => [id, i]));
  return edges.map(([provider, consumer, weight = 1]) => ({
    tail: at.get(provider)!,
    head: at.get(consumer)!,
    delta: 1,
    weight
  }));
}

/** Verifies every forward edge satisfies strict left-to-right ordering `col(provider) < col(consumer)`. */
function expectStrictlyForward(ids: readonly string[], pairs: readonly Constraint[], cols: readonly number[]): void {
  for (const edge of pairs) {
    expect(cols[edge.tail], `${ids[edge.tail]} (${cols[edge.tail]}) -> ${ids[edge.head]} (${cols[edge.head]})`).toBeLessThan(cols[edge.head]);
  }
}

/** Maps id -> column from parallel arrays. */
const mapCols = (ids: readonly string[], cols: readonly number[]): Record<string, number> =>
  Object.fromEntries(ids.map((id, i) => [id, cols[i]]));

describe("anchored Flow column ranking (Option C)", () => {
  it("returns null when no node has an anchor and empty array for empty input", () => {
    expect(rankAnchoredColumns([], [], new Map([["a", 0]]), 0, "fewest")).toEqual([]);
    expect(rankAnchoredColumns(["x", "y"], buildGraph(["x", "y"], [["x", "y"]]), new Map([["a", 0]]), 0, "fewest")).toBeNull();
  });

  it("fits an incoming card within reach without moving any anchored own card or inserting a column", () => {
    // Base own chain: a(0) -> b(1) -> c(2) -> d(3), plus own u(2) that uses a(0) (wt 1) and serves d(3) (wt 2).
    // Incoming card inc uses a(0) and serves u(2) with heavy weight (wt 5): unanchored simplex would pull u left to col 1,
    // but anchored Option C holds every own card in its exact column and fits inc cleanly in col 1.
    const ids = ["a", "b", "c", "d", "u", "inc"];
    const pairs = buildGraph(ids, [
      ["a", "b", 1], ["b", "c", 1], ["c", "d", 1],
      ["a", "u", 1], ["u", "d", 2],
      ["a", "inc", 5], ["inc", "u", 5]
    ]);
    const anchors = new Map([["a", 0], ["b", 1], ["c", 2], ["d", 3], ["u", 2]]);
    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    expect(mapCols(ids, cols)).toEqual({ a: 0, b: 1, inc: 1, c: 2, u: 2, d: 3 });
  });

  it("inserts the minimum column between adjacent own columns without splitting any own column", () => {
    // Own cols: [a0] -> [b1, b2] -> [c0]; incoming inc sits strictly between col 0 and col 1.
    const ids = ["a0", "b1", "b2", "c0", "inc"];
    const pairs = buildGraph(ids, [["a0", "b1"], ["a0", "b2"], ["b1", "c0"], ["a0", "inc"], ["inc", "b1"]]);
    const anchors = new Map([["a0", 0], ["b1", 1], ["b2", 1], ["c0", 2]]);
    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    // b1 and b2 stay grouped together in col 2, c0 shifts uniformly to col 3, inc occupies inserted col 1.
    expect(mapCols(ids, cols)).toEqual({ a0: 0, inc: 1, b1: 2, b2: 2, c0: 3 });
  });

  it("prepends left of column 0 and appends right of the last own column when needed", () => {
    const ids = ["a", "b", "pre", "post"];
    const pairs = buildGraph(ids, [["a", "b"], ["pre", "a"], ["b", "post"]]);
    const anchors = new Map([["a", 0], ["b", 1]]);
    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    expect(mapCols(ids, cols)).toEqual({ pre: 0, a: 1, b: 2, post: 3 });
  });

  it("inserts multiple columns for a multi-hop incoming chain between own columns", () => {
    // a(0) -> b(1) -> c(2), plus incoming chain a(0) -> x -> y -> b(1) requiring two inserted columns.
    const ids = ["a", "b", "c", "x", "y"];
    const pairs = buildGraph(ids, [["a", "b"], ["b", "c"], ["a", "x"], ["x", "y"], ["y", "b"]]);
    const anchors = new Map([["a", 0], ["b", 1], ["c", 2]]);
    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    expect(mapCols(ids, cols)).toEqual({ a: 0, x: 1, y: 2, b: 3, c: 4 });
  });

  it("detaches the exact minimum conflicting own set on a 1-vs-many real conflict", () => {
    // Base own: root(0) -> u1..u4(1) -> mid(2) -> tail(3), and lone(3) provides to incoming T, which provides to u1..u4(1).
    // Detaching {lone} moves 1 own card; detaching {u1..u4} would move 4. Exact Dilworth/König must detach only lone.
    const ids = ["root", "u1", "u2", "u3", "u4", "mid", "tail", "lone", "T"];
    const pairs = buildGraph(ids, [
      ["root", "u1"], ["root", "u2"], ["root", "u3"], ["root", "u4"],
      ["u1", "mid"], ["mid", "tail"],
      ["lone", "T"], ["T", "u1"], ["T", "u2"], ["T", "u3"], ["T", "u4"]
    ]);
    const anchors = new Map([
      ["root", 0], ["u1", 1], ["u2", 1], ["u3", 1], ["u4", 1], ["mid", 2], ["tail", 3], ["lone", 3]
    ]);
    const detached = minimumConflictingAnchors(ids, pairs, anchors);
    expect([...detached].map(i => ids[i])).toEqual(["lone"]);

    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    // All 7 non-conflicting own cards keep their exact grouping and strict relative order.
    const byId = mapCols(ids, cols);
    expect(new Set([byId.u1, byId.u2, byId.u3, byId.u4]).size).toBe(1);
    expect(byId.root).toBeLessThan(byId.u1);
    expect(byId.u1).toBeLessThan(byId.mid);
    expect(byId.mid).toBeLessThan(byId.tail);
    expect(byId.lone).toBeLessThan(byId.T);
    expect(byId.T).toBeLessThan(byId.u1);
  });

  it("handles same-column conflicts (ownA -> inc -> ownB with baseCol(ownA) === baseCol(ownB))", () => {
    const ids = ["r", "a", "b", "c", "inc"];
    const pairs = buildGraph(ids, [["r", "a"], ["r", "b"], ["r", "c"], ["a", "inc"], ["inc", "b"]]);
    const anchors = new Map([["r", 0], ["a", 1], ["b", 1], ["c", 1]]);
    const detached = minimumConflictingAnchors(ids, pairs, anchors);
    expect(detached.size).toBe(1);
    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    const byId = mapCols(ids, cols);
    expect(byId.a).toBeLessThan(byId.inc);
    expect(byId.inc).toBeLessThan(byId.b);
  });

  it("detects and resolves multi-hop conflicts through incoming-to-incoming edges and transitive conflict chains", () => {
    // Conflict chain of 3 anchored own nodes: x(4) -> i1 -> y(2) -> i2 -> z(0).
    // Every pair (x,y), (y,z), (x,z) conflicts, so a maximum antichain has size 1 and minimum detach has size 2.
    const ids = ["z", "m1", "y", "m3", "x", "i1", "i2"];
    const pairs = buildGraph(ids, [
      ["z", "m1"], ["m1", "m3"],
      ["x", "i1"], ["i1", "y"], ["y", "i2"], ["i2", "z"]
    ]);
    const anchors = new Map([["z", 0], ["m1", 1], ["y", 2], ["m3", 3], ["x", 4]]);
    const detached = minimumConflictingAnchors(ids, pairs, anchors);
    expect(detached.size).toBe(2);
    const cols = rankAnchoredColumns(ids, pairs, anchors, 0, "fewest")!;
    expectStrictlyForward(ids, pairs, cols);
    // m1 and m3 have no conflict and keep strict order.
    const byId = mapCols(ids, cols);
    expect(byId.m1).toBeLessThan(byId.m3);
  });

  it("places disconnected free nodes at the rightmost column and respects pull and tie rules for free nodes only", () => {
    const ids = ["a", "b", "c", "d", "lone", "midFree"];
    const pairs = buildGraph(ids, [
      ["a", "b"], ["b", "c"], ["c", "d"],
      ["a", "midFree"], ["midFree", "d"]
    ]);
    const anchors = new Map([["a", 0], ["b", 1], ["c", 2], ["d", 3]]);
    const leftTie = mapCols(ids, rankAnchoredColumns(ids, pairs, anchors, 0, "left")!);
    const rightTie = mapCols(ids, rankAnchoredColumns(ids, pairs, anchors, 0, "right")!);
    expect(leftTie).toEqual({ a: 0, b: 1, midFree: 1, c: 2, d: 3, lone: 3 });
    expect(rightTie).toEqual({ a: 0, b: 1, c: 2, midFree: 2, d: 3, lone: 3 });
    // Heavy pull draws a free leaf all the way to the rightmost column without moving anchored own nodes.
    const leafIds = ["a", "b", "c", "leaf"];
    const leafPairs = buildGraph(leafIds, [["a", "b"], ["b", "c"], ["a", "leaf"]]);
    const leafAnchors = new Map([["a", 0], ["b", 1], ["c", 2]]);
    expect(mapCols(leafIds, rankAnchoredColumns(leafIds, leafPairs, leafAnchors, 0, "fewest")!)).toEqual({ a: 0, b: 1, leaf: 1, c: 2 });
    expect(mapCols(leafIds, rankAnchoredColumns(leafIds, leafPairs, leafAnchors, 5, "fewest")!)).toEqual({ a: 0, b: 1, c: 2, leaf: 2 });
  });

  it("is deterministic regardless of input node and constraint ordering", () => {
    const baseIds = ["root", "u1", "u2", "u3", "mid", "tail", "lone", "T", "extra"];
    const baseEdges: [string, string, number?][] = [
      ["root", "u1"], ["root", "u2"], ["root", "u3"], ["u1", "mid"], ["mid", "tail"],
      ["lone", "T"], ["T", "u1"], ["T", "u2"], ["T", "u3"], ["root", "extra"], ["extra", "tail"]
    ];
    const anchors = new Map([["root", 0], ["u1", 1], ["u2", 1], ["u3", 1], ["mid", 2], ["tail", 3], ["lone", 3]]);
    const expected = mapCols(baseIds, rankAnchoredColumns(baseIds, buildGraph(baseIds, baseEdges), anchors, 0, "fewest")!);
    let seed = 17;
    const rand = (): number => (seed = (seed * 48271) % 2147483647) / 2147483647;
    const shuffle = <T,>(items: readonly T[]): T[] => items.map(x => [rand(), x] as const).sort(([a], [b]) => a - b).map(([, x]) => x);
    for (let trial = 0; trial < 8; trial++) {
      const shuffledIds = shuffle(baseIds);
      const shuffledPairs = buildGraph(shuffledIds, shuffle(baseEdges));
      const actual = mapCols(shuffledIds, rankAnchoredColumns(shuffledIds, shuffledPairs, anchors, 0, "fewest")!);
      expect(actual).toEqual(expected);
    }
  });
});
