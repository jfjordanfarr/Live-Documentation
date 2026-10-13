import { describe, expect, it } from "vitest";

import { rowItemsOf, type SceneBox } from "./branch-scene";
import { shapeSignalsOf } from "./branch-shape";
import type { BranchGraph } from "./branches";

/** A box with the geometry and ownership the shape measurement reads. */
const box = (kind: SceneBox["kind"], columns: [number, number], items: string[], edges: Array<[number, number]>): SceneBox =>
  ({ key: kind, kind, directory: "", parent: null, anchor: null, inset: 0, insetTop: 0, insetBottom: 0, row: 0,
    children: [], minColumn: columns[0], maxColumn: columns[1], items, slots: null, lane: null,
    left: 0, right: 0, top: Math.min(...edges.map(([top]) => top)), bottom: Math.max(...edges.map(([, bottom]) => bottom)),
    segments: edges.map(([top, bottom], i) => ({ column: columns[0] + i, left: 0, right: 0, top, bottom })) });

const branches = (columns: string[][]): Pick<BranchGraph, "columns"> =>
  ({ columns: columns.map(column => column.map(id => ({ id }))) } as Pick<BranchGraph, "columns">);

describe("the membranes' shape", () => {
  it("counts top and bottom steps separately from their magnitude, including tiny nonzero changes", () => {
    const boxes = [box("directory", [0, 3], [], [[0, 100], [20, 100], [20, 150], [20.25, 110]])];
    expect(shapeSignalsOf({ boxes, tops: new Map() }, branches([]))).toEqual({ unevenness: 110.25, steps: 4, unlevel: 0 });
    expect(shapeSignalsOf({ boxes: [box("directory", [0, 1], [], [[0, 100], [0, 100]])], tops: new Map() }, branches([])))
      .toEqual({ unevenness: 0, steps: 0, unlevel: 0 });
  });

  it("prices every drawn boundary, including nested membranes, with nothing from invisible containers or lanes", () => {
    const outer = box("directory", [0, 2], [], [[0, 300], [10, 310], [10, 350]]);
    const inner = box("directory", [0, 1], [], [[30, 200], [50, 220]]);
    outer.children = [inner];
    inner.parent = outer;
    const excluded = ["root", "files", "lane"].map(kind => box(kind as SceneBox["kind"], [0, 1], ["a", "b"], [[0, 100], [300, 500]]));
    const single = box("directory", [3, 3], [], [[5, 50]]);
    const tops = new Map([["a", 0], ["b", 900]]);
    expect(shapeSignalsOf({ boxes: [outer, inner, ...excluded, single], tops }, branches([["a"], ["b"]])))
      .toEqual({ unevenness: 100, steps: 5, unlevel: 0 });
  });

  it("pairs directly owned cards in column order, leaving descendants and unmatched cards out", () => {
    const columns = branches([["a1", "a2", "x"], ["b1", "b2"], ["c1"]]);
    const tops = new Map([["a1", 0], ["a2", 100], ["x", 200], ["b1", 10], ["b2", 130], ["c1", 10]]);
    const membrane = box("directory", [0, 2], ["b2", "a2", "c1", "a1", "b1"], [[0, 200], [0, 200], [0, 200]]);
    const parent = box("directory", [0, 2], [], [[0, 300], [0, 300], [0, 300]]);
    parent.children = [membrane];
    membrane.parent = parent;
    // a1 against b1 (10), a2 against b2 (30), b1 against c1 (0); no second partner for b2.
    expect(shapeSignalsOf({ boxes: [parent, membrane], tops }, columns)).toEqual({ unevenness: 0, steps: 0, unlevel: 40 });
  });

  it("does not pair across an empty column or within a single-column membrane", () => {
    const boxes = [box("directory", [0, 2], ["a", "c"], [[0, 400], [0, 400], [0, 400]]), box("directory", [0, 0], ["x", "y"], [[0, 400]])];
    const tops = new Map([["a", 0], ["c", 300], ["x", 0], ["y", 100]]);
    expect(shapeSignalsOf({ boxes, tops }, branches([["a", "x", "y"], [], ["c"]]))).toEqual({ unevenness: 0, steps: 0, unlevel: 0 });
  });

  it("prices a mixed directory's loose files once, with descendants owned by their own membrane and root files and lanes excluded", () => {
    const root = box("root", [0, 1], [], [[0, 1000], [0, 1200]]);
    const rootFiles = box("files", [0, 1], ["root-a", "root-b"], [[600, 700], [950, 1050]]);
    const membrane = box("directory", [0, 1], [], [[0, 500], [0, 500]]);
    membrane.directory = "dir";
    const loose = box("files", [0, 1], ["b", "a"], [[100, 200], [170, 270]]);
    loose.directory = "dir";
    const nested = box("directory", [0, 1], ["c", "d"], [[290, 450], [290, 450]]);
    nested.directory = "dir/sub";
    const lane = box("lane", [0, 0], ["slot"], [[220, 240]]);
    lane.directory = "dir";
    root.children = [rootFiles, membrane];
    membrane.children = [loose, nested, lane];
    for (const child of root.children) child.parent = root;
    for (const child of membrane.children) child.parent = membrane;
    const tops = new Map([["a", 100], ["b", 170], ["c", 300], ["d", 320], ["root-a", 600], ["root-b", 950], ["slot", 220]]);

    expect(rowItemsOf(membrane)).toEqual(["b", "a"]);
    expect(rowItemsOf(nested)).toEqual(["c", "d"]);
    for (const undrawn of [root, rootFiles, loose, lane]) expect(rowItemsOf(undrawn)).toEqual([]);
    // The direct files differ by 70 px, the subdirectory's files by 20 px. Neither pair is counted through an ancestor.
    expect(shapeSignalsOf({ boxes: [root, rootFiles, membrane, loose, nested, lane], tops }, branches([["a", "c", "root-a"], ["b", "d", "root-b"]])))
      .toEqual({ unevenness: 0, steps: 0, unlevel: 90 });
  });
});
