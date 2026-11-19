import { describe, expect, it } from "vitest";

import { featureDirection, fileFeatures, marbleSketches, OWN_PATH_WEIGHT, SKETCH_DIMENSIONS, sketchDistance, sketchOf, type SketchFeature } from "./marbleSketch";

const unit = (sketch: readonly number[]): number => Math.hypot(...sketch);

/** A seeded run of numbers, so that the many random cases below are the same on every run. */
function numbers(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 0x100000000; };
}

describe("a file's marble sketch", () => {
  it("gives every feature a fixed direction of unit length, the same on every call", () => {
    const direction = featureDirection("uses\u0000packages/explorer/src/client/palette.ts");
    expect(direction).toHaveLength(SKETCH_DIMENSIONS);
    expect(unit(direction)).toBeCloseTo(1, 12);
    expect(featureDirection("uses\u0000packages/explorer/src/client/palette.ts")).toEqual(direction);
    expect(sketchDistance(direction, featureDirection("uses\u0000packages/explorer/src/client/types.ts"))).toBeGreaterThan(0.1);
  });

  it("is the same for the same contents on every load, and of unit length", () => {
    const features = fileFeatures("a.ts", 12, new Map([["b.ts", 3], ["c.ts", 1]]));
    const sketch = sketchOf("a.ts", features);
    expect(sketch).toHaveLength(SKETCH_DIMENSIONS);
    expect(unit(sketch)).toBeCloseTo(1, 12);
    expect(sketchOf("a.ts", fileFeatures("a.ts", 12, new Map([["b.ts", 3], ["c.ts", 1]])))).toEqual(sketch);
  });

  it("does not depend on the order of the features", () => {
    const features = fileFeatures("a.ts", 7, new Map([["b.ts", 2], ["c.ts", 5], ["d.ts", 1]]));
    const shuffled = [...features].reverse();
    shuffled.push(shuffled.shift()!);
    expect(sketchOf("a.ts", shuffled)).toEqual(sketchOf("a.ts", features));
  });

  it("makes a file of no features its path's direction, and one of one feature lean toward that feature", () => {
    const empty = sketchOf("empty.ts", []);
    expect(unit(empty)).toBeCloseTo(1, 12);
    expect(empty).toEqual(featureDirection("file\u0000empty.ts"));
    expect(sketchOf("empty.ts", fileFeatures("empty.ts", 0, new Map()))).toEqual(empty);
    const one: SketchFeature = { text: "uses\u0000b.ts", weight: 1 };
    const sketch = sketchOf("one.ts", [one]);
    expect(unit(sketch)).toBeCloseTo(1, 12);
    // Equal weights: the sketch lies halfway between the feature and the path, nearer each than they are to each other.
    const between = sketchDistance(featureDirection(one.text), featureDirection("file\u0000one.ts"));
    expect(sketchDistance(sketch, featureDirection(one.text))).toBeLessThan(between);
    expect(sketchDistance(sketch, featureDirection("file\u0000one.ts"))).toBeLessThan(between);
    expect(OWN_PATH_WEIGHT).toBe(1);
  });

  it("differs for two files that list the same facts, by their paths", () => {
    const uses = new Map([["shared.ts", 2]]);
    expect(sketchDistance(sketchOf("a.ts", fileFeatures("a.ts", 0, uses)), sketchOf("b.ts", fileFeatures("b.ts", 0, uses)))).toBeGreaterThan(0.05);
  });

  it("moves further the larger the share of a file's features that differs, over many random files", () => {
    const random = numbers(20261118);
    const shares = [0, 0.025, 0.1, 0.25, 0.5, 0.75, 1];
    const total = shares.map(() => 0);
    const cases = 300, size = 40;
    for (let c = 0; c < cases; c++) {
      const id = `file-${c}.ts`;
      const features = Array.from({ length: size }, (_, i) => ({ text: `f${c}-${i}-${Math.floor(random() * 1e9)}`, weight: 0.5 + random() }));
      const before = sketchOf(id, features);
      shares.forEach((share, s) => {
        const changed = Math.round(share * size);
        const after = features.map((feature, i) => (i < changed ? { text: `${feature.text}-new`, weight: feature.weight } : feature));
        total[s] += sketchDistance(before, sketchOf(id, after));
      });
    }
    const mean = total.map(sum => sum / cases);
    expect(mean[0]).toBe(0);
    for (let s = 1; s < mean.length; s++) expect(mean[s]).toBeGreaterThan(mean[s - 1]);
    // One feature among forty is a small move; a rewrite moves about as far as two unrelated files lie apart (√2).
    expect(mean[1]).toBeLessThan(0.25);
    expect(mean[mean.length - 1]).toBeGreaterThan(1.2);
  });

  it("moves a little for one symbol added among forty, more for five, and most for a file of new wires", () => {
    const uses = new Map([["b.ts", 4], ["c.ts", 1], ["d.ts", 2]]);
    const base = sketchOf("a.ts", fileFeatures("a.ts", 40, uses));
    const one = sketchDistance(base, sketchOf("a.ts", fileFeatures("a.ts", 41, uses)));
    const five = sketchDistance(base, sketchOf("a.ts", fileFeatures("a.ts", 45, uses)));
    const more = sketchDistance(base, sketchOf("a.ts", fileFeatures("a.ts", 40, new Map([...uses, ["e.ts", 1]]))));
    expect(one).toBeGreaterThan(0);
    expect(one).toBeLessThan(0.25);
    expect(five).toBeGreaterThan(one);
    expect(more).toBeGreaterThan(0);
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
  });
});
