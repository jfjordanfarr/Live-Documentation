import { describe, expect, it } from "vitest";

import { baselineConfig } from "./evaluate";
import { parseCosts, simulateSearch, summarizeSetting, trialCosts, type StartRow } from "./restarts";
import type { Signals } from "./signals";

const signals = (lengthPx: number, spots: number): Signals => ({
  wires: 1, lengthPx, meanPx: lengthPx, horizontalPx: lengthPx, verticalPx: 0,
  crossings: { points: spots, spots, farPoints: 0, pairs: 0, wiresCrossed: 0 },
  foreignSamples: 0, foreignWires: 0, samples: 0, laneSamples: 0, escapingWires: 0, escapingSamples: 0, passages: 0, threaded: 0, backward: 0,
  columns: 1, lanes: 0, pictureWidth: 100, pictureHeight: 100, placementCost: 0, optimal: true, fragments: 0
});

const row = (name: string, vertical: number, crossings: number, lengthPx: number, spots: number, columns: string[][] = [["a", "b", "c"]]): StartRow =>
  ({ name, seed: name === "ranked" ? null : Number(name.replace("seed ", "")), cheap: { vertical, crossings, height: 1000, churn: 0 }, signals: signals(lengthPx, spots), ms: 1,
    columns, tops: Object.fromEntries(columns.flat().map((id, i) => [id, i * 100])) });

describe("the restarts tabulated", () => {
  it("parses a grid of costs, every crossing cost with every height cost, the churn nothing", () => {
    expect(parseCosts("crossing=0,10;height=0,1")).toEqual([
      { crossing: 0, height: 0, churn: 0 }, { crossing: 0, height: 1, churn: 0 }, { crossing: 10, height: 0, churn: 0 }, { crossing: 10, height: 1, churn: 0 }
    ]);
    expect(parseCosts("crossing=5")).toEqual([{ crossing: 5, height: 0, churn: 0 }]);
    expect(parseCosts(undefined).length).toBe(20);
    expect(() => parseCosts("gravity=1")).toThrow(/No cost/u);
  });

  it("says which start the page keeps at each cost and which the full score prefers", () => {
    const rows = [row("ranked", 300, 4, 3000, 40), row("seed 1", 200, 10, 2000, 100), row("seed 2", 260, 5, 2600, 50)];
    const trials = trialCosts(rows, parseCosts("crossing=0,20,40"), { lengthPx: 1, spots: 1 });
    // By the full score the ranked start scores 2 by definition, seed 1 0.667 + 2.5, seed 2 0.867 + 1.25: the ranked start is preferred.
    expect(trials.map(trial => trial.best.name)).toEqual(["ranked", "ranked", "ranked"]);
    expect(trials.map(trial => trial.bestScore)).toEqual([2, 2, 2]);
    // At no cost the page keeps the shortest vertical; at twenty a crossing seed 2 (260 + 100) beats both; at forty the ranked start ties seed 2 and, earlier, wins.
    expect(trials.map(trial => trial.pick.name)).toEqual(["seed 1", "seed 2", "ranked"]);
    expect(trials.map(trial => trial.pick === trial.best)).toEqual([false, false, true]);
    expect(trials[0].pickScore).toBeCloseTo(2000 / 3000 + 100 / 40, 6);
    expect(() => trialCosts([], parseCosts("crossing=0"), { lengthPx: 1 })).toThrow(/No starts/u);
  });
});

describe("the search simulated", () => {
  // The ranked start and six seeds, vertical only (no crossings, the height constant): seed 1 is the first paint's pick
  // among the ranked start and seeds 1 to 2; seed 4 is cheaper by 300 but swaps two pairs; seed 6 is cheapest of all.
  const rows = [
    row("ranked", 5000, 0, 1, 0, [["a", "b", "c"]]),
    row("seed 1", 4000, 0, 1, 0, [["a", "b", "c"]]),
    row("seed 2", 4500, 0, 1, 0, [["a", "b", "c"]]),
    row("seed 3", 4100, 0, 1, 0, [["a", "b", "c"]]),
    row("seed 4", 3700, 0, 1, 0, [["c", "a", "b"]]),
    row("seed 5", 3900, 0, 1, 0, [["a", "b", "c"]]),
    row("seed 6", 3000, 0, 1, 0, [["a", "b", "c"]])
  ];
  const costs = { crossing: 0, height: 0, churn: 0 };

  it("paints the cheapest of the first starts, then adopts a seed only when its price with its churn beats the shown picture", () => {
    const [free, dear] = simulateSearch(rows, costs, [0, 200], 2, 10);
    expect(free.first.name).toBe("seed 1");
    // Churn free: seed 4 (3,700, two pairs against seed 1's order) and seed 6 are adopted; seeds 3 and 5 are not.
    expect(free.adoptions.map(a => [a.row.name, a.gain, a.pairs, a.tried])).toEqual([["seed 4", 300, 2, 2], ["seed 6", 700, 2, 4]]);
    expect(free).toMatchObject({ tried: 4, stopped: "capped", final: rows[6] });
    // At 200 px a pair seed 4 costs 400 of churn and no longer pays; seed 5, in the shown order, is a small gain with no churn, and seed 6 the large one.
    expect(dear.adoptions.map(a => [a.row.name, a.gain, a.pairs])).toEqual([["seed 5", 100, 0], ["seed 6", 900, 0]]);
    expect(dear.final.name).toBe("seed 6");
  });

  it("settles after the patience of starts that better nothing", () => {
    const [trial] = simulateSearch(rows, costs, [0], 4, 1);
    // The first paint is the best of ranked and seeds 1 to 4: seed 4. Seed 5 betters nothing, and with a patience of one the search settles there.
    expect(trial.first.name).toBe("seed 4");
    expect(trial).toMatchObject({ adoptions: [], tried: 1, stopped: "settled", final: rows[4] });
  });

  it("goes on past a better start refused for its churn, as the page does", () => {
    // From seed 1 with a patience of two at 200 a pair: seed 4 is refused (two pairs), but found; seed 5 betters nothing; seed 6 is adopted.
    const [trial] = simulateSearch(rows, costs, [200], 2, 2);
    expect(trial.adoptions.map(a => [a.row.name, a.gain, a.pairs, a.tried])).toEqual([["seed 5", 100, 0, 3], ["seed 6", 900, 0, 4]]);
    // Had the patience counted adoptions, seed 4's refusal would have been the second unadopted start and the search settled before seed 5.
    // A patience of one settles at seed 3, which betters nothing, after one start.
    const [impatient] = simulateSearch(rows, costs, [200], 2, 1);
    expect(impatient).toMatchObject({ adoptions: [], tried: 1, stopped: "settled" });
  });
});

describe("the wider space", () => {
  it("summarizes a setting: the page's price's pick, the full score's, and the search's end, scored against the given base", () => {
    const rows = [row("ranked", 300, 4, 3000, 40), row("seed 1", 200, 10, 2000, 100), row("seed 2", 260, 5, 2600, 50, [["b", "a", "c"]])];
    const setting = summarizeSetting(baselineConfig(), "baseline", rows, rows[0].signals, { lengthPx: 1, spots: 1 }, { crossing: 20, height: 0, churn: 0 }, 100, 0, 8);
    // At twenty a crossing seed 2 (260 + 100) is the page's cheapest; by the full score the ranked start (2) beats seed 1 (3.167) and seed 2 (2.117).
    expect(setting.cheapest.name).toBe("seed 2");
    expect(setting.cheapestScore).toBeCloseTo(2600 / 3000 + 50 / 40, 6);
    expect(setting.best.name).toBe("ranked");
    expect(setting.bestScore).toBe(2);
    expect(setting.rankedScore).toBe(2);
    // The search from the ranked start alone: seed 1 (400) is dearer than ranked (380); seed 2 (360 + 100 of churn for its one pair) is not adopted either.
    expect(setting.search.adoptions).toEqual([]);
    expect(setting.search.final.name).toBe("ranked");
    expect(setting.searchScore).toBe(2);
    expect(setting.msPerStart).toBe(1);
    // Scored against another base, the scores move with it.
    expect(summarizeSetting(baselineConfig(), "x", rows, rows[1].signals, { lengthPx: 1, spots: 1 }, { crossing: 20, height: 0, churn: 0 }, 100, 0, 8).rankedScore).toBeCloseTo(3000 / 2000 + 40 / 100, 6);
    expect(() => summarizeSetting(baselineConfig(), "x", [], rows[0].signals, { lengthPx: 1 }, { crossing: 0, height: 0, churn: 0 }, 0, 0, 1)).toThrow(/No starts/u);
  });
});

