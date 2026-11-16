import { describe, expect, it } from "vitest";

import { comparePrices, fewestReturnsOrder, EXACT_LIMIT, exactOrder, greedyOrder, improvedOrder, priceOf, type CycleWeights } from "./cycle-order";

/** A seeded generator, so that every run draws the same cycles. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A cycle of n files: a ring, so that every file is in it, with each other pair joined with the given chance, by one
 * to four references each way.
 */
function generated(n: number, chance: number, next: () => number): number[][] {
  const weight = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let v = 0; v < n; v++) weight[v][(v + 1) % n] = 1 + Math.floor(next() * 4);
  for (let p = 0; p < n; p++) for (let c = 0; c < n; c++) if (p !== c && next() < chance) weight[p][c] += 1 + Math.floor(next() * 4);
  return weight;
}

function permutations(n: number): number[][] {
  if (n === 0) return [[]];
  return permutations(n - 1).flatMap(order => Array.from({ length: n }, (_, at) => [...order.slice(0, at), n - 1, ...order.slice(at)]));
}

/** Whether some single file moved to another place lowers the order's price. */
function lowerByOneMove(order: readonly number[], weight: CycleWeights, greedy: readonly number[]): boolean {
  const price = priceOf(order, weight, greedy);
  for (let from = 0; from < order.length; from++) for (let to = 0; to < order.length; to++) {
    if (from === to) continue;
    const moved = [...order];
    const [file] = moved.splice(from, 1);
    moved.splice(to, 0, file);
    if (comparePrices(priceOf(moved, weight, greedy), price) < 0) return true;
  }
  return false;
}

/** The references that read backward in an order, as provider and consumer: all the picture shows of the order. */
function returning(order: readonly number[], weight: CycleWeights): string[] {
  const place = new Map(order.map((v, i) => [v, i]));
  return weight.flatMap((row, p) => row.flatMap((w, c) => (w > 0 && place.get(c)! < place.get(p)! ? [`${p} to ${c}`] : [])));
}

describe("the order of a cycle's files", () => {
  it("prices an order by its returning references, then the pairs they return between, then the joined pairs it turns from the greedy order's", () => {
    // 0 uses 1 three times, 1 uses 0 once, and 2 uses 0.
    const weight = [[0, 1, 1], [3, 0, 0], [0, 0, 0]];
    const greedy = [0, 1, 2];
    expect(priceOf(greedy, weight, greedy)).toEqual({ backward: 3, pairs: 1, turned: 0 });
    expect(priceOf([1, 0, 2], weight, greedy)).toEqual({ backward: 1, pairs: 1, turned: 1 });
    expect(comparePrices({ backward: 1, pairs: 5, turned: 5 }, { backward: 2, pairs: 0, turned: 0 })).toBeLessThan(0);
    expect(comparePrices({ backward: 2, pairs: 1, turned: 5 }, { backward: 2, pairs: 2, turned: 0 })).toBeLessThan(0);
    expect(comparePrices({ backward: 2, pairs: 1, turned: 0 }, { backward: 2, pairs: 1, turned: 1 })).toBeLessThan(0);
    // Two files no reference joins turn nothing when they swap: the price reads only what the picture shows.
    expect(priceOf([1, 0, 2], [[0, 0, 1], [0, 0, 1], [0, 0, 0]], [0, 1, 2]).turned).toBe(0);
  });

  it("finds the cheapest order exactly, as trying every order does, on generated cycles", () => {
    const next = random(20261116);
    for (let trial = 0; trial < 120; trial++) {
      const n = 2 + (trial % 6);
      const weight = generated(n, [0.15, 0.4, 0.8][trial % 3], next);
      const greedy = greedyOrder(weight, false);
      const cheapest = permutations(n).map(order => priceOf(order, weight, greedy)).sort(comparePrices)[0];
      const found = exactOrder(weight, greedy);
      expect([...found].sort((a, b) => a - b), "every file once").toEqual(Array.from({ length: n }, (_, i) => i));
      expect(priceOf(found, weight, greedy), `trial ${trial}, ${JSON.stringify(weight)}`).toEqual(cheapest);
    }
  });

  it("keeps the greedy order's returns where that order is already the cheapest", () => {
    const next = random(7);
    let kept = 0;
    for (let trial = 0; trial < 200; trial++) {
      const weight = generated(2 + (trial % 5), 0.3, next);
      const greedy = greedyOrder(weight, false);
      const found = fewestReturnsOrder(weight);
      const greedyPrice = priceOf(greedy, weight, greedy), price = priceOf(found, weight, greedy);
      if (greedyPrice.backward === price.backward && greedyPrice.pairs === price.pairs) { expect(returning(found, weight)).toEqual(returning(greedy, weight)); kept++; }
    }
    expect(kept, "the generated cycles include many whose order is already a minimum").toBeGreaterThan(50);
  });

  it(`improves a cycle too large for the exact search, of more than ${EXACT_LIMIT} files, to an order no single move can lower`, () => {
    const next = random(3);
    for (const n of [EXACT_LIMIT + 1, 16, 25]) {
      const weight = generated(n, 0.12, next);
      const greedy = greedyOrder(weight, false);
      const found = fewestReturnsOrder(weight);
      expect([...found].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(lowerByOneMove(found, weight, greedy), `${n} files`).toBe(false);
      expect(comparePrices(priceOf(found, weight, greedy), priceOf(greedyOrder(weight, true), weight, greedy))).toBeLessThanOrEqual(0);
    }
    // A ring of twenty files, one reference each but for the lightest, which alone returns.
    const ring = Array.from({ length: 20 }, (_, p) => Array.from({ length: 20 }, (_, c) => (c === (p + 1) % 20 ? (p === 13 ? 1 : 2) : 0)));
    const order = fewestReturnsOrder(ring);
    expect(priceOf(order, ring, greedyOrder(ring, false)).backward).toBe(1);
    expect(order[0], "file 14, whose only provider is file 13, stands first").toBe(14);
  });

  it("ends the large cycle's path, run on small cycles, where no single move lowers the price and never below the exact order", () => {
    // The large cycle's path, run on small cycles that the exact search can check.
    const next = random(11);
    for (let trial = 0; trial < 60; trial++) {
      const weight = generated(3 + (trial % 6), 0.3, next);
      const greedy = greedyOrder(weight, false);
      const improved = improvedOrder(greedyOrder(weight, true), weight, greedy);
      expect(lowerByOneMove(improved, weight, greedy)).toBe(false);
      expect(comparePrices(priceOf(improved, weight, greedy), priceOf(exactOrder(weight, greedy), weight, greedy))).toBeGreaterThanOrEqual(0);
    }
  });
});
