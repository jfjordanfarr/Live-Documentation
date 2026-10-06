import { describe, expect, it } from "vitest";

import { parseCosts, trialCosts, type StartRow } from "./restarts";
import type { Signals } from "./signals";

const signals = (lengthPx: number, spots: number): Signals => ({
  wires: 1, lengthPx, meanPx: lengthPx, horizontalPx: lengthPx, verticalPx: 0,
  crossings: { points: spots, spots, farPoints: 0, pairs: 0, wiresCrossed: 0 },
  foreignSamples: 0, foreignWires: 0, samples: 0, laneSamples: 0, escapingWires: 0, escapingSamples: 0, passages: 0, threaded: 0, backward: 0,
  columns: 1, lanes: 0, pictureWidth: 100, pictureHeight: 100, placementCost: 0, optimal: true
});

const row = (name: string, vertical: number, crossings: number, lengthPx: number, spots: number): StartRow =>
  ({ name, cheap: { vertical, crossings, height: 1000, churn: 0 }, signals: signals(lengthPx, spots), ms: 1 });

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
