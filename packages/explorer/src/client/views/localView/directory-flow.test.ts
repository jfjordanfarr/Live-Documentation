import { describe, expect, it } from "vitest";

import { placeMembers } from "./branches";
import { flowColumns, flowNeighbours, isPairLine, linksOf, NARROW_SHAPE, NOMINAL_BOX, NOMINAL_CARD, NOMINAL_LABEL, nominalMeasurer, pairLines, searchFlowShape, wrapChoices, wrapRanks, type FlowInput, type FlowShape, type UndrawnLink } from "./directory-flow";
import { NODE_HUB } from "./wire-gathering";

/** A link of the graph: `uses` depends on `offers`. */
const link = (uses: string, offers: string, kind: UndrawnLink["kind"] = "dependency"): UndrawnLink => ({ sourceId: uses, targetId: offers, kind });

const directoryOf = (id: string): string => (id.includes("/") ? id.slice(0, id.lastIndexOf("/")) : "");

/** A flow over the given ranks, with each opened directory's boxes and line-less files by directory. */
const flow = (ranked: string[][], contents: Record<string, { boxes?: string[]; loose?: string[] }>): FlowInput => ({
  ranked, opened: new Set(Object.keys(contents)), directoryOf,
  boxesOf: directory => contents[directory]?.boxes ?? [],
  looseOf: directory => contents[directory]?.loose ?? []
});

/** The column each id stands in. */
const columnOf = (columns: readonly (readonly string[])[]): Map<string, number> =>
  new Map(columns.flatMap((column, index) => column.map(id => [id, index] as const)));

describe("pair lines of an opened directory", () => {
  const undrawn = [link("d/b", "d/a"), link("d/b", "d/a"), link("d/c", "d/a"), link("d/a", "d/b", "extends"), link("d/c", "d/c"), link("d/b", "d/a")];

  it("draws one line for each pair each way, between the two files' hubs, counting the links it stands for", () => {
    const lines = pairLines(undrawn);
    expect(lines.map(line => [line.targetId, line.sourceId, line.gathered])).toEqual([["d/a", "d/b", 3], ["d/a", "d/c", 1], ["d/b", "d/a", 1]]);
    for (const line of lines) {
      expect(line.sourceSymbol).toBe(NODE_HUB);
      expect(line.targetSymbol).toBe(NODE_HUB);
      expect(isPairLine(line)).toBe(true);
    }
    // A pair's line takes the kind of its first link.
    expect(lines.map(line => line.kind)).toEqual(["dependency", "dependency", "extends"]);
  });

  it("drops no link between two cards and counts none twice; a file's link to itself joins no pair", () => {
    const between = undrawn.filter(each => each.sourceId !== each.targetId);
    expect(pairLines(undrawn).reduce((sum, line) => sum + linksOf(line), 0)).toBe(between.length);
    expect(pairLines([link("d/c", "d/c")])).toEqual([]);
    expect(pairLines([])).toEqual([]);
  });

  it("counts a reference between two symbols as one link and says it is no pair line", () => {
    const reference = { sourceId: "d/b", targetId: "d/a", sourceSymbol: "x", targetSymbol: "y", kind: "dependency" as const, direction: "inbound" as const };
    expect(isPairLine(reference)).toBe(false);
    expect(linksOf(reference)).toBe(1);
  });
});

describe("the cards a hovered card keeps lit", () => {
  const lines = pairLines([link("d/b", "d/a"), link("d/c", "d/a"), link("d/e", "d/c"), link("d/a", "d/e")]);
  const cards = new Set(["d/a", "d/b", "d/c", "d/e", "d/lone"]);

  it("is the card and the card at the far end of each of its lines, whichever way the line reads", () => {
    expect(flowNeighbours(lines, cards, "d/a")).toEqual(new Set(["d/a", "d/b", "d/c", "d/e"]));
    expect(flowNeighbours(lines, cards, "d/b")).toEqual(new Set(["d/b", "d/a"]));
    expect(flowNeighbours(lines, cards, "d/c")).toEqual(new Set(["d/c", "d/a", "d/e"]));
  });

  it("is the card alone when no line touches it, and nothing when the card is not in the picture", () => {
    expect(flowNeighbours(lines, cards, "d/lone")).toEqual(new Set(["d/lone"]));
    expect(flowNeighbours(lines, cards, "d/gone")).toBeNull();
  });
});

describe("wrapping a tall rank", () => {
  const ranked = [["a1", "a2"], ["b1", "b2", "b3", "b4", "b5", "b6", "b7"], ["c1"]];

  it("leaves a rank that fits alone and wraps a taller one into as few columns as hold it, as even as they can be", () => {
    expect(wrapRanks(ranked, 3)).toEqual([["a1", "a2"], ["b1", "b2", "b3"], ["b4", "b5", "b6"], ["b7"], ["c1"]]);
    expect(wrapRanks(ranked, 4)).toEqual([["a1", "a2"], ["b1", "b2", "b3", "b4"], ["b5", "b6", "b7"], ["c1"]]);
    expect(wrapRanks([["a", "b", "c", "d"]], 3)).toEqual([["a", "b"], ["c", "d"]]);
    expect(wrapRanks(ranked, 7)).toEqual(ranked);
  });

  it("wraps nothing when no cap is given", () => {
    expect(wrapRanks(ranked, null)).toEqual(ranked);
  });

  it("keeps every card once and every rank in its order, so no file stands left of a file it offers to", () => {
    for (const rows of [1, 2, 3, 5, null]) {
      const wrapped = wrapRanks(ranked, rows);
      expect(wrapped.flat()).toEqual(ranked.flat());
      const at = columnOf(wrapped);
      // Every card of a rank stands left of every card of the rank after it.
      for (let rank = 0; rank + 1 < ranked.length; rank++) {
        for (const left of ranked[rank]) for (const right of ranked[rank + 1]) expect(at.get(left)!).toBeLessThan(at.get(right)!);
      }
      if (rows !== null) for (const column of wrapped) expect(column.length).toBeLessThanOrEqual(rows);
    }
  });
});

/** A shape with the given choices, the rest narrowest. */
const shaped = (choices: { rows?: number | null; boxRows?: Record<string, number>; looseColumns?: Record<string, number> }): FlowShape => ({
  rows: choices.rows ?? null, boxRows: new Map(Object.entries(choices.boxRows ?? {})), looseColumns: new Map(Object.entries(choices.looseColumns ?? {}))
});

describe("the rows at which the ranks wrap differently", () => {
  const ranks = (...sizes: number[]): string[][] => sizes.map((size, rank) => Array.from({ length: size }, (_, index) => `r${rank}/${index}`));

  it("are the caps, from the tallest rank's down, at which the wrapped ranks take more columns than at the cap before", () => {
    // One provider and nine users: eight rows give three columns, four give four, two give six, one gives ten.
    expect(wrapChoices(ranks(1, 9))).toEqual([8, 4, 2, 1]);
    expect(wrapChoices(ranks(1, 9)).map(rows => wrapRanks(ranks(1, 9), rows).length)).toEqual([3, 4, 6, 10]);
    expect(wrapChoices(ranks(2, 2, 2))).toEqual([1]);
  });

  it("are none where no rank holds two cards, or there is no rank", () => {
    expect(wrapChoices(ranks(1, 1, 1))).toEqual([]);
    expect(wrapChoices([])).toEqual([]);
  });
});

describe("the columns of a directory in flow order", () => {
  it("in the narrowest shape, stands the files no line joins in one column after the directory's last, and more columns when the shape asks", () => {
    // d: a is used by b and c, which e uses; five files join nothing.
    const input = flow([["d/a"], ["d/b", "d/c"], ["d/e"]], { d: { loose: ["d/p", "d/q", "d/r", "d/s", "d/t"] } });
    expect(flowColumns(input)).toEqual([["d/a"], ["d/b", "d/c"], ["d/e"], ["d/p", "d/q", "d/r", "d/s", "d/t"]]);
    expect(flowColumns(input, shaped({ looseColumns: { d: 2 } }))).toEqual([["d/a"], ["d/b", "d/c"], ["d/e"], ["d/p", "d/r", "d/t"], ["d/q", "d/s"]]);
    // No more columns than files.
    expect(flowColumns(input, shaped({ looseColumns: { d: 9 } })).slice(3)).toEqual([["d/p"], ["d/q"], ["d/r"], ["d/s"], ["d/t"]]);
  });

  it("stands the closed boxes at the head of the directory's columns, within its files' columns or in the rows the shape asks", () => {
    const input = flow([["d/a"], ["d/b", "d/c"]], { d: { boxes: ["d/x", "d/y", "d/z"], loose: ["d/p"] } });
    // Narrowest: three boxes across the files' two columns, x and z heading the first; the line-less file after the last.
    expect(flowColumns(input)).toEqual([["d/x", "d/z", "d/a"], ["d/y", "d/b", "d/c"], ["d/p"]]);
    // One row: z stands in a column of its own past the files, and the line-less file stands under it.
    expect(flowColumns(input, shaped({ boxRows: { d: 1 } }))).toEqual([["d/x", "d/a"], ["d/y", "d/b", "d/c"], ["d/z", "d/p"]]);
    // A shape asking for more rows than the files' columns need is the narrowest.
    expect(flowColumns(input, shaped({ boxRows: { d: 5 } }))).toEqual(flowColumns(input));
  });

  it("holds every item exactly once and keeps the order of use, whatever the shape", () => {
    const contents = { d: { boxes: ["d/x", "d/y", "d/w"], loose: ["d/p", "d/q", "d/r", "d/s", "d/t", "d/u", "d/v"] } };
    const ranked = [["d/a"], ["d/b", "d/c", "d/e", "d/f", "d/g"], ["d/h"]];
    const all = [...ranked.flat(), ...contents.d.boxes, ...contents.d.loose].sort();
    for (const rows of [1, 2, 3, 4, null]) for (const boxRows of [1, 2, 3]) for (const looseColumns of [1, 2, 4, 7]) {
      const columns = flowColumns(flow(ranked, contents), shaped({ rows, boxRows: { d: boxRows }, looseColumns: { d: looseColumns } }));
      expect(columns.flat().sort()).toEqual(all);
      const at = columnOf(columns);
      // The ranks keep their order through the wrap, and the line-less files stand right of every ranked file.
      expect(at.get("d/a")!).toBeLessThan(at.get("d/b")!);
      expect(Math.max(...ranked[1].map(id => at.get(id)!))).toBeLessThan(at.get("d/h")!);
      for (const file of contents.d.loose) expect(at.get(file)!).toBeGreaterThan(at.get("d/h")!);
      // Every box heads its column.
      for (const box of contents.d.boxes) {
        const column = columns[at.get(box)!];
        expect(column.slice(0, column.indexOf(box)).every(id => contents.d.boxes.includes(id)), box).toBe(true);
      }
    }
  });

  it("wraps a rank taller than the shape's rows and still ends with the line-less files", () => {
    const columns = flowColumns(flow([["d/a"], ["d/b", "d/c", "d/e", "d/f", "d/g"]], { d: { loose: ["d/p", "d/q", "d/r"] } }), shaped({ rows: 2, looseColumns: { d: 2 } }));
    expect(columns).toEqual([["d/a"], ["d/b", "d/c"], ["d/e", "d/f"], ["d/g"], ["d/p", "d/r"], ["d/q"]]);
  });

  it("can stand a short flow's line-less files about as wide as tall, when that is the shape asked for", () => {
    // Two files joined by one line, six boxes above them, eight files that join nothing: the scan root on 2026-11-12.
    const boxes = ["b1", "b2", "b3", "b4", "b5", "b6"], loose = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];
    const columns = flowColumns(flow([["a"], ["b"]], { "": { boxes, loose } }), shaped({ rows: 1, looseColumns: { "": 2 } }));
    expect(columns.map(column => column.length)).toEqual([4, 4, 4, 4]);
    expect(columns[0]).toEqual(["b1", "b3", "b5", "a"]);
  });

  it("wraps only the opened directories' own files: a pinned neighbour keeps its rank unwrapped, in a column of its own at the left", () => {
    // d's rank of four users, with two cards a pin brought from elsewhere, o/x and o/y.
    const input = flow([["d/a"], ["o/x", "d/b", "d/c", "o/y", "d/e", "d/f"]], { d: {} });
    expect(flowColumns(input, shaped({ rows: 2 }))).toEqual([["d/a"], ["o/x", "o/y"], ["d/b", "d/c"], ["d/e", "d/f"]]);
    // A rank whose own files fit the cap stands as it did, one column, its other cards in it.
    expect(flowColumns(input, shaped({ rows: 4 }))).toEqual([["d/a"], ["o/x", "d/b", "d/c", "o/y", "d/e", "d/f"]]);
    // A rank of outside cards alone never wraps.
    expect(flowColumns(flow([["o/x", "o/y", "o/z"]], { d: {} }), shaped({ rows: 1 }))).toEqual([["o/x", "o/y", "o/z"]]);
  });

  it("lays the deepest directory first, so that a directory's own line-less files stand after everything under it", () => {
    // d/in is opened inside d: its line-less file follows its own column; d's follow d/in's block.
    const columns = flowColumns(flow([["d/a"], ["d/in/b"]], { "d": { loose: ["d/p"] }, "d/in": { boxes: ["d/in/x"], loose: ["d/in/q"] } }));
    expect(columns).toEqual([["d/a"], ["d/in/x", "d/in/b"], ["d/in/q"], ["d/p"]]);
  });

  it("under ancestors: 'local', keeps each folder's span local to its own direct ranked files and does not fling ancestor loose files past a deep child", () => {
    // Root "" has direct ranked files in cols 0..1 plus loose files and boxes; child "a/b" has a 4-col chain (cols 0..3)
    // and intermediate ancestor "a" has zero direct ranked files.
    const ranked = [["r0", "a/b/c0"], ["r1", "a/b/c1"], ["a/b/c2"], ["a/b/c3"]];
    const contents = {
      "": { boxes: ["docs", "tests"], loose: ["eslint", "pkg"] },
      "a": { boxes: ["a/other"] },
      "a/b": { boxes: ["a/b/sub"], loose: ["a/b/lone"] }
    };
    const whole = flowColumns(flow(ranked, contents));
    const local = flowColumns({ ...flow(ranked, contents), ancestors: "local" });
    const wholeAt = columnOf(whole), localAt = columnOf(local);
    // In whole-tree, "" loose files are flung past a/b/lone (col 5); in local, "" loose files stand right after r1 (col 2)!
    expect(wholeAt.get("eslint")!).toBeGreaterThan(wholeAt.get("a/b/c3")!);
    expect(localAt.get("eslint")!).toBe(2);
    expect(localAt.get("pkg")!).toBe(2);
    // Every item appears once and all ranked left-to-right order holds across shapes.
    const all = [...ranked.flat(), "docs", "tests", "eslint", "pkg", "a/other", "a/b/sub", "a/b/lone"].sort();
    for (const shape of [NARROW_SHAPE, shaped({ rows: 1, boxRows: { "": 1, "a/b": 1 }, looseColumns: { "": 2 } })]) {
      const cols = flowColumns({ ...flow(ranked, contents), ancestors: "local" }, shape);
      expect(cols.flat().sort()).toEqual(all);
      const at = columnOf(cols);
      expect(at.get("r0")!).toBeLessThan(at.get("r1")!);
      expect(at.get("a/b/c0")!).toBeLessThan(at.get("a/b/c1")!);
      expect(at.get("a/b/c1")!).toBeLessThan(at.get("a/b/c2")!);
      expect(at.get("a/b/c2")!).toBeLessThan(at.get("a/b/c3")!);
    }
    // An ancestor with ZERO direct ranked files stays in its compact grid anchored at 0 instead of entering flowing.
    const deepOnly = flow([["a/b/c0"], ["a/b/c1"], ["a/b/c2"]], { "": { boxes: ["docs", "tests"], loose: ["readme", "pkg"] }, "a/b": { loose: ["a/b/lone"] } });
    const deepLocal = flowColumns({ ...deepOnly, ancestors: "local" });
    const deepAt = columnOf(deepLocal);
    // 4 items in "" form a 2-column grid anchored at col 0 (cols 0..1), NOT flung past col 3.
    for (const item of ["docs", "tests", "readme", "pkg"]) expect(deepAt.get(item)!).toBeLessThanOrEqual(1);
    expect(deepAt.get("a/b/lone")!).toBe(3);
  });

  it("lays a directory with no file in the ranks as the grid lays it, in every shape: a directory of subdirectories gains nothing", () => {
    const boxes = ["d/w", "d/x", "d/y", "d/z"], loose = ["d/p", "d/q", "d/r"];
    const items = (directory: string): string[] => (directory === "d" ? [...boxes, ...loose] : []);
    for (const shape of [NARROW_SHAPE, shaped({ rows: 2, boxRows: { d: 1 }, looseColumns: { d: 3 } })]) {
      expect(flowColumns(flow([], { d: { boxes, loose } }), shape)).toEqual(placeMembers([], new Set(["d"]), items, directoryOf));
      expect(flowColumns(flow([], { d: { boxes } }), shape)).toEqual(placeMembers([], new Set(["d"]), () => boxes, directoryOf));
    }
    // Beside a pinned neighbourhood elsewhere it starts, as the grid does, from the first column.
    expect(flowColumns(flow([["o/a"], ["o/b"]], { d: { boxes } })))
      .toEqual(placeMembers([["o/a"], ["o/b"]], new Set(["d"]), () => boxes, directoryOf));
  });
});

describe("the nominal model the shape is chosen on", () => {
  it("gives every file card one size and every closed box another, a label one height and a line's end the card's middle", () => {
    const measurer = nominalMeasurer(["d/a", "d/b", "d/box"], id => id === "d/box");
    expect(measurer.widths(null)).toEqual(new Map([["d/a", NOMINAL_CARD.width], ["d/b", NOMINAL_CARD.width], ["d/box", NOMINAL_BOX.width]]));
    expect(measurer.widths(200).get("d/a")).toBe(Math.min(200, NOMINAL_CARD.width));
    const measured = measurer.measure(new Map([["d/a", 300], ["d/box", 300]]), new Map([["d label", 300]]));
    expect(measured.heights).toEqual(new Map([["d/a", NOMINAL_CARD.height], ["d/box", NOMINAL_BOX.height]]));
    expect(measured.labelHeights).toEqual(new Map([["d label", NOMINAL_LABEL]]));
    expect(measured.pin("d/a", "inbound", "#hub")).toBe(NOMINAL_CARD.height / 2);
    expect(measured.pin("d/box", "outbound", "#hub")).toBeNull();
  });
});

describe("the shape the price chooses", () => {
  // The root's example of 2026-11-13, `scripts`: one file used by three, and five closed boxes.
  const input = flow([["s/steps"], ["s/verify", "s/steps.test", "s/safe"]], { s: { boxes: ["s/b1", "s/b2", "s/b3", "s/b4", "s/b5"] } });
  /** A price of the columns alone: so much a column, so much a card of the tallest column. */
  const priceOf = (column: number, card: number) => (shape: FlowShape): number => {
    const columns = flowColumns(input, shape);
    return column * columns.length + card * Math.max(...columns.map(each => each.length));
  };
  const record = (shape: FlowShape) => ({ rows: shape.rows, boxRows: Object.fromEntries(shape.boxRows), looseColumns: Object.fromEntries(shape.looseColumns) });

  it("keeps the narrowest shape when width costs more than the height it would save", () => {
    const found = searchFlowShape(input, priceOf(10, 1));
    expect(found.shape).toBe(NARROW_SHAPE);
    expect(found.price).toBe(25);
    // It priced the narrowest shape, the first wrap and the first wider band of boxes, and stopped at each.
    expect(found.priced.map(each => [record(each.shape), each.price])).toEqual([
      [record(NARROW_SHAPE), 25], [record(shaped({ rows: 2 })), 34], [record(shaped({ boxRows: { s: 2 } })), 35]
    ]);
  });

  it("widens while each step is strictly cheaper: the wrap first, then the directory's boxes", () => {
    const found = searchFlowShape(input, priceOf(1, 10));
    // No wrap 2 + 50; two rows 3 + 40; one row 4 + 30; then the boxes in one row across five columns, 5 + 20.
    expect(found.priced.map(each => each.price)).toEqual([52, 43, 34, 25]);
    expect(record(found.shape)).toEqual(record(shaped({ rows: 1, boxRows: { s: 1 } })));
    expect(flowColumns(input, found.shape)).toEqual([["s/b1", "s/steps"], ["s/b2", "s/verify"], ["s/b3", "s/steps.test"], ["s/b4", "s/safe"], ["s/b5"]]);
  });

  it("keeps the narrower shape at a tie, so a choice the price does not ask for is never made", () => {
    const found = searchFlowShape(input, priceOf(1, 1));
    expect(found.shape).toBe(NARROW_SHAPE);
    expect(found.priced.map(each => each.price)).toEqual([7, 7, 8]);
  });

  it("walks the line-less files' columns from one toward one row, and only shapes that differ", () => {
    const loose = flow([["d/a"], ["d/b"]], { d: { loose: ["d/p", "d/q", "d/r", "d/s", "d/t"] } });
    const asked: number[] = [];
    searchFlowShape(loose, shape => { asked.push(shape.looseColumns.get("d") ?? 1); return -asked.length; });
    // Five files: one column, then two (rows of three), three (rows of two), five (one row); four rows also gives two columns.
    expect(asked).toEqual([1, 2, 3, 5]);
  });
});

