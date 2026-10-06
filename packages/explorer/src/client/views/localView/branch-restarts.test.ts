import { describe, expect, it } from "vitest";

import { candidateStarts, churnOf, layoutStarts, previousStart, scoreOf, startName, startOrder } from "./branch-restarts";
import type { Scene } from "./branch-scene";
import type { BranchGraph } from "./branches";

const ranked = [["a", "b", "c"], ["d", "e"]];
/** A previous picture: c above a above b in the first column, e above d in the second. */
const tops = new Map([["c", 0], ["a", 100], ["b", 200], ["e", 0], ["d", 300]]);

/** A start laid out: what `layoutStarts` reads of a branch graph and a scene, and nothing else. */
const laid = (vertical: number, crossings: number, height: number, columns: string[][]): { branches: BranchGraph; scene: Scene } => ({
  branches: { columns: columns.map(column => column.map(id => ({ id }))), order: { crossings } } as unknown as BranchGraph,
  scene: { placement: { cost: vertical }, pictureHeight: height } as unknown as Scene
});

describe("the order step's starts", () => {
  it("tries the ranking's order, the previous picture's and the seeded shuffles, in that order", () => {
    expect(candidateStarts(3, null, null, ranked).map(startName)).toEqual(["ranked", "seed 1", "seed 2", "seed 3"]);
    expect(candidateStarts(2, null, tops, ranked).map(startName)).toEqual(["ranked", "previous", "seed 1", "seed 2"]);
    // A previous picture of other files is no start, and no seeds means the ranking's order alone.
    expect(candidateStarts(2, null, new Map([["z", 0]]), ranked).map(startName)).toEqual(["ranked", "seed 1", "seed 2"]);
    expect(candidateStarts(0, null, null, ranked).map(startName)).toEqual(["ranked"]);
  });

  it("tries a forced seed alone, so the lab can ask for one start by name", () => {
    expect(candidateStarts(4, 7, tops, ranked)).toEqual([{ kind: "seed", seed: 7 }]);
    expect(startOrder({ kind: "seed", seed: 7 })).toEqual({ seed: 7 });
    expect(startOrder({ kind: "ranked" })).toEqual({});
  });

  it("starts from the previous picture with its files in their old order and the files it did not show after", () => {
    const previous = previousStart([["a", "b", "c", "n"], ["d", "e"]], tops);
    expect(previous).toEqual([["c", "a", "b", "n"], ["e", "d"]]);
    expect(startOrder({ kind: "previous", columns: previous })).toEqual({ start: previous });
  });

  it("counts the pairs of cards in a column that stand the other way round from the previous picture, new cards aside", () => {
    expect(churnOf([["c", "a", "b"], ["e", "d"]], tops)).toBe(0);
    expect(churnOf([["a", "c", "b"], ["e", "d"]], tops)).toBe(1);
    expect(churnOf([["b", "a", "c", "n"], ["d", "e"]], tops)).toBe(4);
    expect(churnOf([["b", "a"]], null)).toBe(0);
  });

  it("prices a start by its vertical length and what its crossings, height and churn cost", () => {
    expect(scoreOf({ vertical: 1000, crossings: 10, height: 500, churn: 2 }, { crossing: 5, height: 0.1, churn: 25 })).toBe(1150);
    expect(scoreOf({ vertical: 1000, crossings: 10, height: 500, churn: 2 }, { crossing: 0, height: 0, churn: 0 })).toBe(1000);
  });

  it("keeps the cheapest start, the earlier of two at one price, and lays out every start once", () => {
    const table: Record<string, ReturnType<typeof laid>> = {
      ranked: laid(300, 4, 100, [["a", "b"]]),
      "seed 1": laid(200, 10, 100, [["b", "a"]]),
      "seed 2": laid(200, 10, 100, [["a", "b"]])
    };
    const asked: string[] = [];
    const layout = (start: { kind: string; seed?: number }): ReturnType<typeof laid> => { asked.push(startName(start as never)); return table[startName(start as never)]; };
    const starts = candidateStarts(2, null, null, [["a", "b"]]);
    const free = layoutStarts(starts, layout, { crossing: 0, height: 0, churn: 0 }, null);
    expect(asked).toEqual(["ranked", "seed 1", "seed 2"]);
    expect(startName(free.chosen.start)).toBe("seed 1");
    expect(free.outcomes.map(outcome => outcome.score)).toEqual([300, 200, 200]);
    // A crossing priced at twenty pixels turns the choice: 300 + 80 against 200 + 200.
    expect(startName(layoutStarts(starts, layout, { crossing: 20, height: 0, churn: 0 }, null).chosen.start)).toBe("ranked");
    expect(() => layoutStarts([], layout, { crossing: 0, height: 0, churn: 0 }, null)).toThrow(/at least one start/u);
  });

  it("prices the churn against the previous picture, so a start that swaps cards must earn it", () => {
    const previous = new Map([["a", 0], ["b", 100]]);
    const table: Record<string, ReturnType<typeof laid>> = {
      ranked: laid(300, 4, 100, [["a", "b"]]),
      previous: laid(250, 4, 100, [["a", "b"]]),
      "seed 1": laid(200, 10, 100, [["b", "a"]]),
      "seed 2": laid(220, 10, 100, [["a", "b"]])
    };
    const starts = candidateStarts(2, null, previous, [["a", "b"]]);
    const priced = layoutStarts(starts, start => table[startName(start)], { crossing: 0, height: 0, churn: 150 }, previous);
    expect(priced.outcomes.map(outcome => `${startName(outcome.start)} ${outcome.signals.churn} ${outcome.score}`)).toEqual(["ranked 0 300", "previous 0 250", "seed 1 1 350", "seed 2 0 220"]);
    expect(startName(priced.chosen.start)).toBe("seed 2");
    // Without the churn's price, the swap is the cheapest.
    expect(startName(layoutStarts(starts, start => table[startName(start)], { crossing: 0, height: 0, churn: 0 }, previous).chosen.start)).toBe("seed 1");
  });
});
