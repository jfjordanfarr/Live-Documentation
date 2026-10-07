import { describe, expect, it } from "vitest";

import { fragmentsOf, unevennessOf, unlevelOf } from "./signals";
import type { SceneBox } from "../../packages/explorer/src/client/views/localView/branch-scene";

const file = (path: string): { codeRelativePath: string } => ({ codeRelativePath: path });

describe("the directories' fragments", () => {
  it("counts the runs beyond the first that each directory's cards form in a column", () => {
    // Directories together: nothing. x split around a y: one. Two directories each split: two. Across columns: summed.
    expect(fragmentsOf([[file("a/x/1"), file("a/x/2"), file("a/y/3")]])).toBe(0);
    expect(fragmentsOf([[file("a/x/1"), file("a/y/3"), file("a/x/2")]])).toBe(1);
    expect(fragmentsOf([[file("a/x/1"), file("a/y/3"), file("a/x/2"), file("a/y/4")]])).toBe(2);
    expect(fragmentsOf([[file("a/x/1"), file("a/y/3"), file("a/x/2")], [file("b/1"), file("c/2"), file("b/3")]])).toBe(2);
    expect(fragmentsOf([])).toBe(0);
    // Files at the root share the "" directory.
    expect(fragmentsOf([[file("1"), file("a/2"), file("3")]])).toBe(1);
  });
});

/** A box with only what the two shape signals read: its kind, its columns, its items and its segments' edges. */
const box = (kind: SceneBox["kind"], columns: [number, number], items: string[], edges: Array<[number, number]>): SceneBox =>
  ({ kind, minColumn: columns[0], maxColumn: columns[1], items, segments: edges.map(([top, bottom], i) => ({ column: columns[0] + i, left: 0, right: 0, top, bottom })) } as unknown as SceneBox);

describe("the membranes' shape", () => {
  it("sums the steps of every membrane's outline, top and bottom, and reads nothing from the root, a lane or a one-column membrane", () => {
    expect(unevennessOf([box("directory", [0, 2], [], [[0, 100], [20, 100], [20, 150]])])).toBe(20 + 50);
    expect(unevennessOf([box("directory", [0, 1], [], [[0, 100], [0, 100]])])).toBe(0);
    expect(unevennessOf([box("root", [0, 2], [], [[0, 100], [20, 100], [20, 150]]), box("lane", [1, 1], [], [[0, 7]]), box("directory", [3, 3], [], [[5, 50]])])).toBe(0);
  });

  it("pairs the k-th cards of neighbouring columns within a membrane, in the columns' order, and sums how far their tops stand apart", () => {
    const columns = [[{ id: "a1" }, { id: "a2" }, { id: "x" }], [{ id: "b1" }, { id: "b2" }], [{ id: "c1" }]];
    const tops = new Map([["a1", 0], ["a2", 100], ["x", 200], ["b1", 10], ["b2", 130], ["c1", 10]]);
    const membrane = box("directory", [0, 2], ["a1", "a2", "b1", "b2", "c1"], [[0, 1], [0, 1], [0, 1]]);
    // a1 against b1 (10), a2 against b2 (30), b1 against c1 (0); x is another membrane's and b2 has no partner in the third column.
    expect(unlevelOf([membrane], columns, tops)).toBe(40);
    expect(unlevelOf([box("root", [0, 2], ["a1", "b1"], [[0, 1], [0, 1], [0, 1]])], columns, tops)).toBe(0);
    expect(unlevelOf([box("directory", [0, 0], ["a1", "a2"], [[0, 1]])], columns, tops)).toBe(0);
  });
});

