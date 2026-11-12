import { describe, expect, it } from "vitest";

import { placeMembers } from "./branches";
import { flowColumns, flowNeighbours, isPairLine, linksOf, pairLines, squareRows, wrapRanks, type FlowInput, type UndrawnLink } from "./directory-flow";
import { NODE_HUB } from "./wire-gathering";

/** A link of the graph: `uses` depends on `offers`. */
const link = (uses: string, offers: string, kind: UndrawnLink["kind"] = "dependency"): UndrawnLink => ({ sourceId: uses, targetId: offers, kind });

const directoryOf = (id: string): string => (id.includes("/") ? id.slice(0, id.lastIndexOf("/")) : "");

/** A flow over the given ranks, with each opened directory's boxes and line-less files by directory. */
const flow = (ranked: string[][], contents: Record<string, { boxes?: string[]; loose?: string[] }>, rows: number | null = null): FlowInput => ({
  ranked, opened: new Set(Object.keys(contents)), rows, directoryOf,
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

describe("the rows at which ranks stand about as wide as tall", () => {
  const ranks = (...sizes: number[]): string[][] => sizes.map((size, rank) => Array.from({ length: size }, (_, index) => `r${rank}/${index}`));

  it("is the least number of rows at which the wrapped ranks take no more columns than rows", () => {
    // One provider and nine users: three rows give four columns, four rows give four.
    expect(squareRows(ranks(1, 9))).toBe(4);
    expect(wrapRanks(ranks(1, 9), 4).map(column => column.length)).toEqual([1, 3, 3, 3]);
    // Two ranks before thirty leaves: seven rows give seven columns.
    expect(squareRows(ranks(2, 5, 30))).toBe(7);
    // This repository's Local Map directory on 2026-11-12: only its rank of twelve wraps.
    expect(squareRows(ranks(1, 3, 8, 12, 11, 7, 5, 9, 4))).toBe(11);
    expect(wrapRanks(ranks(1, 3, 8, 12, 11, 7, 5, 9, 4), 11).map(column => column.length)).toEqual([1, 3, 8, 6, 6, 11, 7, 5, 9, 4]);
  });

  it("wraps nothing where the ranks are already wider than tall, and holds one row for no rank", () => {
    expect(squareRows(ranks(1, 1, 1, 1, 1))).toBe(1);
    expect(squareRows(ranks(2, 2, 2, 2))).toBe(2);
    expect(wrapRanks(ranks(2, 2, 2, 2), squareRows(ranks(2, 2, 2, 2)))).toEqual(ranks(2, 2, 2, 2));
    expect(squareRows([])).toBe(1);
  });

  it("never asks for a cap under which a rank would lose a card", () => {
    for (const sizes of [[1, 9], [2, 5, 30], [40], [3, 3, 3], [1, 2, 3, 4, 5, 6, 7, 8]]) {
      const ranked = ranks(...sizes), rows = squareRows(ranked);
      const wrapped = wrapRanks(ranked, rows);
      expect(wrapped.flat()).toEqual(ranked.flat());
      for (const column of wrapped) expect(column.length).toBeLessThanOrEqual(rows);
    }
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

describe("the columns of a directory in flow order", () => {
  it("stands the files no line joins together after the directory's last column, read row by row", () => {
    // d: a is used by b and c, which e uses; five files join nothing. The tallest column holds two, the square root of five is three.
    const columns = flowColumns(flow([["d/a"], ["d/b", "d/c"], ["d/e"]], { d: { loose: ["d/p", "d/q", "d/r", "d/s", "d/t"] } }));
    expect(columns).toEqual([["d/a"], ["d/b", "d/c"], ["d/e"], ["d/p", "d/r", "d/t"], ["d/q", "d/s"]]);
  });

  it("stands the closed boxes at the head of the directory's columns, one to a column and again from the first", () => {
    const columns = flowColumns(flow([["d/a"], ["d/b", "d/c"]], { d: { boxes: ["d/x", "d/y", "d/z"], loose: ["d/p"] } }));
    // Three boxes across two columns: x and z head the first, y the second; the line-less file stands after the last.
    expect(columns).toEqual([["d/x", "d/z", "d/a"], ["d/y", "d/b", "d/c"], ["d/p"]]);
  });

  it("holds every item exactly once, whatever the cap", () => {
    const contents = { d: { boxes: ["d/x", "d/y"], loose: ["d/p", "d/q", "d/r", "d/s", "d/t", "d/u", "d/v"] } };
    const ranked = [["d/a"], ["d/b", "d/c", "d/e", "d/f", "d/g"], ["d/h"]];
    const all = [...ranked.flat(), ...contents.d.boxes, ...contents.d.loose].sort();
    for (const rows of [2, 3, 4, null]) {
      const columns = flowColumns(flow(ranked, contents, rows));
      expect(columns.flat().sort()).toEqual(all);
      const at = columnOf(columns);
      // The ranks keep their order through the wrap, and the line-less files stand right of every ranked file.
      expect(at.get("d/a")!).toBeLessThan(at.get("d/b")!);
      expect(Math.max(...ranked[1].map(id => at.get(id)!))).toBeLessThan(at.get("d/h")!);
      for (const file of contents.d.loose) expect(at.get(file)!).toBeGreaterThan(at.get("d/h")!);
      // No column of line-less files is taller than the directory's tallest column or the square root of their count.
      const tallest = Math.max(Math.ceil(Math.sqrt(contents.d.loose.length)), ...columns.slice(0, at.get("d/h")! + 1).map(column => column.length));
      for (const column of columns.slice(at.get("d/h")! + 1)) expect(column.length).toBeLessThanOrEqual(tallest);
    }
  });

  it("wraps a rank taller than the cap and still ends with the line-less files", () => {
    const columns = flowColumns(flow([["d/a"], ["d/b", "d/c", "d/e", "d/f", "d/g"]], { d: { loose: ["d/p", "d/q", "d/r"] } }, 2));
    expect(columns).toEqual([["d/a"], ["d/b", "d/c"], ["d/e", "d/f"], ["d/g"], ["d/p", "d/r"], ["d/q"]]);
  });

  it("stands a short flow's line-less files about as wide as tall, not in one row", () => {
    // Two files joined by one line, six boxes above them, eight files that join nothing: the scan root on 2026-11-12.
    const boxes = ["b1", "b2", "b3", "b4", "b5", "b6"], loose = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];
    const columns = flowColumns(flow([["a"], ["b"]], { "": { boxes, loose } }, 1));
    expect(columns.map(column => column.length)).toEqual([4, 4, 4, 4]);
    expect(columns[0]).toEqual(["b1", "b3", "b5", "a"]);
  });

  it("lays the deepest directory first, so that a directory's own line-less files stand after everything under it", () => {
    // d/in is opened inside d: its line-less file follows its own column; d's follow d/in's block.
    const columns = flowColumns(flow([["d/a"], ["d/in/b"]], { "d": { loose: ["d/p"] }, "d/in": { boxes: ["d/in/x"], loose: ["d/in/q"] } }));
    expect(columns).toEqual([["d/a"], ["d/in/x", "d/in/b"], ["d/in/q"], ["d/p"]]);
  });

  it("lays a directory with no file in the ranks as the grid lays it: a directory of subdirectories gains nothing", () => {
    const boxes = ["d/w", "d/x", "d/y", "d/z"], loose = ["d/p", "d/q", "d/r"];
    const items = (directory: string): string[] => (directory === "d" ? [...boxes, ...loose] : []);
    for (const rows of [2, null]) {
      expect(flowColumns(flow([], { d: { boxes, loose } }, rows))).toEqual(placeMembers([], new Set(["d"]), items, directoryOf));
      expect(flowColumns(flow([], { d: { boxes } }, rows))).toEqual(placeMembers([], new Set(["d"]), () => boxes, directoryOf));
    }
    // Beside a pinned neighbourhood elsewhere it starts, as the grid does, from the first column.
    expect(flowColumns(flow([["o/a"], ["o/b"]], { d: { boxes } })))
      .toEqual(placeMembers([["o/a"], ["o/b"]], new Set(["d"]), () => boxes, directoryOf));
  });
});
