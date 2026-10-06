import { describe, expect, it } from "vitest";

import { baselineConfig, LEVERS } from "./evaluate";
import { differences } from "./report";
import type { Signals } from "./signals";
import { configurations, oneAtATime, paretoFront, parseGrid, parseWeights, scoreOf } from "./sweep";

const signals = (lengthPx: number, spots: number, extra: Partial<Signals> = {}): Signals => ({
  wires: 1, lengthPx, meanPx: lengthPx, horizontalPx: lengthPx, verticalPx: 0,
  crossings: { points: spots, spots, farPoints: 0, pairs: 0, wiresCrossed: 0 },
  foreignSamples: 0, foreignWires: 0, samples: 0, laneSamples: 0, escapingWires: 0, escapingSamples: 0, passages: 0, threaded: 0, backward: 0,
  columns: 1, lanes: 0, pictureWidth: 100, pictureHeight: 100, placementCost: 0, optimal: true, ...extra
});

describe("the lab's sweep", () => {
  it("parses a grid of lists, ranges and none", () => {
    const grid = parseGrid("rankingPull=0,0.5,2; orderSeed=none,1..3;rankingTie=fewest,left");
    expect(grid).toEqual([
      { lever: "rankingPull", values: [0, 0.5, 2] },
      { lever: "orderSeed", values: [null, 1, 2, 3] },
      { lever: "rankingTie", values: ["fewest", "left"] }
    ]);
    expect(() => parseGrid("gravity=1")).toThrow(/No lever/u);
  });

  it("varies one lever at a time from the baseline, skipping the baseline's own value", () => {
    const baseline = baselineConfig();
    const singles = oneAtATime(baseline, parseGrid("rankingPull=0,1;cardMaxWidth=none,400"));
    expect(singles.map(s => `${s.lever}=${String(s.value)}`)).toEqual(["rankingPull=1", "cardMaxWidth=400"]);
    expect(singles[1].config).toEqual({ ...baseline, cardMaxWidth: 400 });
  });

  it("walks a small grid whole and samples a large one by its seed, the baseline first and nothing twice", () => {
    const baseline = baselineConfig();
    const small = configurations(baseline, parseGrid("rankingPull=0,1;itemGap=24,32"), 100, 1);
    expect(small).toHaveLength(4);
    expect(small[0]).toEqual(baseline);
    expect(new Set(small.map(c => JSON.stringify(c))).size).toBe(4);
    const grid = parseGrid("rankingPull=0,1,2,5;orderSeed=none,1,2,3,4,5,6,7;itemGap=16,24,32;columnGap=60,100,140");
    const sampled = configurations(baseline, grid, 20, 7);
    expect(sampled).toHaveLength(21);
    expect(sampled[0]).toEqual(baseline);
    expect(new Set(sampled.map(c => JSON.stringify(c))).size).toBe(21);
    expect(configurations(baseline, grid, 20, 7)).toEqual(sampled);
    expect(configurations(baseline, grid, 20, 8)).not.toEqual(sampled);
    for (const config of sampled) expect(Object.keys(config).sort()).toEqual([...LEVERS].sort());
  });

  it("scores a configuration against the baseline by the weights, and names the levers it moved", () => {
    const base = signals(1000, 10);
    const weights = parseWeights("lengthPx=1,spots=0.5");
    expect(scoreOf(base, base, weights)).toBeCloseTo(1.5);
    expect(scoreOf(signals(500, 20), base, weights)).toBeCloseTo(0.5 + 1);
    // A signal the baseline has none of counts double when it appears.
    expect(scoreOf(signals(1000, 10, { backward: 2 }), base, { backward: 1 })).toBe(2);
    const baseline = baselineConfig();
    expect(differences(baseline, baseline)).toBe("baseline");
    expect(differences({ ...baseline, rankingPull: 2, cardMaxWidth: 320 }, baseline)).toBe("rankingPull=2 cardMaxWidth=320");
  });

  it("keeps on the front only the rows no other beats on both length and crossings", () => {
    const rows = [{ signals: signals(1000, 10) }, { signals: signals(900, 12) }, { signals: signals(950, 11) }, { signals: signals(800, 20) }];
    expect(paretoFront(rows).map(row => row.signals.lengthPx)).toEqual([800, 900, 950, 1000]);
    const dominated = [{ signals: signals(1000, 10) }, { signals: signals(900, 9) }];
    expect(paretoFront(dominated).map(row => row.signals.lengthPx)).toEqual([900]);
  });
});
