import { describe, expect, it } from "vitest";

import { featureDirection, featureSum, fileFeatures, marbleSketches, OWN_PATH_WEIGHT, SKETCH_DIMENSIONS, SKETCH_STRENGTH, SKETCH_TURN, sketchDistance, sketchOf, strengthsOf, type SketchFeature } from "./marbleSketch";

const length = (sketch: readonly number[]): number => Math.hypot(...sketch);

/** A seeded run of numbers, so that the many random cases below are the same on every run. */
function numbers(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 0x100000000; };
}

/** `count` random features of unit weight, the case's own. */
const randomFeatures = (random: () => number, count: number, label: string): SketchFeature[] =>
  Array.from({ length: count }, (_, i) => ({ text: `${label}-${i}-${Math.floor(random() * 1e9)}`, weight: 1 }));

/** The mean over many random files of the distance a change makes. */
function meanMove(seed: number, cases: number, change: (random: () => number, c: number) => [string, SketchFeature[], SketchFeature[]]): number {
  const random = numbers(seed);
  let total = 0;
  for (let c = 0; c < cases; c++) {
    const [id, before, after] = change(random, c);
    total += sketchDistance(sketchOf(id, before), sketchOf(id, after));
  }
  return total / cases;
}

describe("a file's marble sketch", () => {
  it("gives every feature a fixed direction of unit length, the same on every call", () => {
    const direction = featureDirection("uses\u0000packages/explorer/src/client/palette.ts");
    expect(direction).toHaveLength(SKETCH_DIMENSIONS);
    expect(length(direction)).toBeCloseTo(1, 12);
    expect(featureDirection("uses\u0000packages/explorer/src/client/palette.ts")).toEqual(direction);
    expect(sketchDistance(direction, featureDirection("uses\u0000packages/explorer/src/client/types.ts"))).toBeGreaterThan(0.1);
  });

  it("wraps each component of the features' sum through a sine, and so is bounded however much the file holds", () => {
    expect(strengthsOf([0, SKETCH_TURN * Math.PI / 2, -SKETCH_TURN * Math.PI / 2, SKETCH_TURN * Math.PI, 1, 2, 3, 4]))
      .toEqual([0, SKETCH_STRENGTH, -SKETCH_STRENGTH, SKETCH_STRENGTH * Math.sin(Math.PI), ...[1, 2, 3, 4].map(v => SKETCH_STRENGTH * Math.sin(v / SKETCH_TURN))]);
    const random = numbers(7);
    for (const count of [0, 1, 40, 5000]) {
      const sketch = sketchOf(`f${count}.ts`, randomFeatures(random, count, `b${count}`));
      expect(sketch).toHaveLength(SKETCH_DIMENSIONS);
      for (const strength of sketch) expect(Math.abs(strength)).toBeLessThanOrEqual(SKETCH_STRENGTH);
    }
  });

  it("is the same for the same facts on every load and in any order", () => {
    const features = fileFeatures("a.ts", 12, new Map([["b.ts", 3], ["c.ts", 1], ["d.ts", 2]]));
    const sketch = sketchOf("a.ts", features);
    expect(sketchOf("a.ts", fileFeatures("a.ts", 12, new Map([["b.ts", 3], ["c.ts", 1], ["d.ts", 2]])))).toEqual(sketch);
    const shuffled = [...features].reverse();
    shuffled.push(shuffled.shift()!);
    expect(sketchOf("a.ts", shuffled)).toEqual(sketch);
    expect(OWN_PATH_WEIGHT).toBe(1);
  });

  it("moves by about as much for one feature more in a file of five features, of fifty or of five hundred", () => {
    // A unit length divided a change by the file's size: the same change in a file a hundred times larger moved its
    // sketch a tenth as far. Without it the move is the same whatever the size, within a factor the sine's slope makes.
    const moves = [5, 50, 500].map(size => meanMove(11 + size, 300, (random, c) => {
      const before = randomFeatures(random, size, `s${size}-${c}`);
      return [`f${c}.ts`, before, [...before, { text: `added-${size}-${c}`, weight: 1 }]];
    }));
    expect(Math.max(...moves) / Math.min(...moves)).toBeLessThan(1.5);
    // About 0.35 of the sum's change per component, a turn of 0.35 / SKETCH_TURN radians, at the sine's slope.
    for (const move of moves) { expect(move).toBeGreaterThan(0.05); expect(move).toBeLessThan(0.2); }
  });

  it("moves further the more features change, and saturates where the file has become another", () => {
    const changes = [0, 1, 4, 16, 64, 200, 400];
    const moves = changes.map(changed => meanMove(20261119, 80, (random, c) => {
      const before = randomFeatures(random, 400, `m${c}`);
      return [`f${c}.ts`, before, before.map((feature, i) => (i < changed ? { ...feature, text: `${feature.text}-new` } : feature))];
    }));
    expect(moves[0]).toBe(0);
    for (let i = 1; i < moves.length; i++) expect(moves[i]).toBeGreaterThan(moves[i - 1]);
    // Two unrelated large files lie apart by about √(8 · SKETCH_STRENGTH²) = √2; half the file changed is nearly there.
    expect(moves[moves.length - 1]).toBeGreaterThan(1.25);
    expect(moves[moves.length - 1]).toBeLessThan(1.6);
    expect(moves[moves.length - 1] - moves[moves.length - 2]).toBeLessThan(0.15);
    expect(moves[2] - moves[1]).toBeGreaterThan(0.08);
  });

  it("gives a file of few facts weak strengths, a nearly plain marble, and one of many full ones", () => {
    const random = numbers(3);
    const mean = (count: number): number => {
      let total = 0;
      for (let c = 0; c < 200; c++) total += length(sketchOf(`w${c}.ts`, randomFeatures(random, count, `w${count}-${c}`)));
      return total / 200;
    };
    const [none, few, many] = [mean(0), mean(4), mean(500)];
    expect(none).toBeLessThan(0.2);
    expect(few).toBeLessThan(0.4);
    // A large file's eight strengths spread round the sine: about the unit length the sketch had before the wrap.
    expect(many).toBeGreaterThan(0.9);
    expect(many).toBeLessThan(1.1);
    // A file of no features is its path alone, wrapped.
    expect(sketchOf("empty.ts", [])).toEqual(strengthsOf(featureDirection("file\u0000empty.ts")));
  });

  it("differs for two files that list the same facts, by their paths", () => {
    const uses = new Map([["shared.ts", 2]]);
    expect(sketchDistance(sketchOf("a.ts", fileFeatures("a.ts", 0, uses)), sketchOf("b.ts", fileFeatures("b.ts", 0, uses)))).toBeGreaterThan(0.02);
  });

  it("moves a little for one symbol added among forty, more for five", () => {
    const uses = new Map([["b.ts", 4], ["c.ts", 1], ["d.ts", 2]]);
    const base = sketchOf("a.ts", fileFeatures("a.ts", 40, uses));
    const one = sketchDistance(base, sketchOf("a.ts", fileFeatures("a.ts", 41, uses)));
    const five = sketchDistance(base, sketchOf("a.ts", fileFeatures("a.ts", 45, uses)));
    expect(one).toBeGreaterThan(0);
    expect(one).toBeLessThan(0.25);
    expect(five).toBeGreaterThan(one);
  });

  it("is the same for a file today and at a step of the history that holds the same facts", () => {
    // Today: the symbols named, a link per kind and symbols with its references.
    const today = {
      nodes: [{ id: "a.ts", publicSymbols: ["x", "y", "z"] }, { id: "b.ts", publicSymbols: ["q"] }],
      links: [
        { source: "a.ts", target: "b.ts", kind: "dependency", referenceCount: 2 },
        { source: "a.ts", target: "b.ts", kind: "type-reference", referenceCount: 1 },
        { source: { id: "b.ts" }, target: { id: "b.ts" }, kind: "dependency" }
      ]
    };
    // A step of the history: the count alone, one link for the pair with the references summed.
    const step = {
      nodes: [{ id: "a.ts", publicSymbols: [], symbolCount: 3 }, { id: "b.ts", publicSymbols: [], symbolCount: 1 }],
      links: [{ source: "a.ts", target: "b.ts", kind: "dependency", referenceCount: 3 }]
    };
    const now = marbleSketches(today), then = marbleSketches(step);
    expect(now.get("a.ts")).toEqual(then.get("a.ts"));
    expect(now.get("b.ts")).toEqual(then.get("b.ts"));
    expect(marbleSketches(today)).toBe(now);
    // What uses a file is not its feature: b.ts is as if nothing used it.
    expect(now.get("b.ts")).toEqual(sketchOf("b.ts", fileFeatures("b.ts", 1, new Map())));
    expect(now.get("a.ts")).toEqual(strengthsOf(featureSum("a.ts", fileFeatures("a.ts", 3, new Map([["b.ts", 3]])))));
  });
});
