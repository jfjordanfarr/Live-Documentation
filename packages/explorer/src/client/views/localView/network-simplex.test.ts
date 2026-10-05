import { describe, expect, it } from "vitest";

import { rankByNetworkSimplex, type Constraint } from "./network-simplex";

/** The optimum by enumeration: every assignment of the nodes to the range, the least cost among the feasible ones. */
function bruteForce(count: number, constraints: readonly Constraint[], range: number): number {
  let best = Infinity;
  const position = new Array<number>(count).fill(0);
  const visit = (node: number): void => {
    if (node === count) {
      if (constraints.every(c => position[c.head] - position[c.tail] >= c.delta)) {
        best = Math.min(best, constraints.reduce((sum, c) => sum + c.weight * (position[c.head] - position[c.tail]), 0));
      }
      return;
    }
    for (let value = 0; value < range; value++) { position[node] = value; visit(node + 1); }
  };
  visit(0);
  return best;
}

const feasible = (constraints: readonly Constraint[], position: readonly number[]): boolean =>
  constraints.every(c => position[c.head] - position[c.tail] >= c.delta);

/** A pseudo-random acyclic instance: constraint edges go from lower to higher node numbers. */
function seeded(seed: number, count: number, edges: number): Constraint[] {
  let state = seed;
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const constraints: Constraint[] = [];
  for (let i = 0; i < edges; i++) {
    const tail = Math.floor(next() * (count - 1));
    const head = tail + 1 + Math.floor(next() * (count - tail - 1));
    constraints.push({ tail, head, delta: Math.floor(next() * 4) - 1, weight: Math.floor(next() * 3) });
  }
  return constraints;
}

describe("network simplex", () => {
  it("places a chain at its separations", () => {
    const { position, cost, optimal } = rankByNetworkSimplex(3, [{ tail: 0, head: 1, delta: 2, weight: 1 }, { tail: 1, head: 2, delta: 3, weight: 1 }]);
    expect(position).toEqual([0, 2, 5]);
    expect(cost).toBe(5);
    expect(optimal).toBe(true);
  });

  it("aligns a wire across a gap it may close: an auxiliary node pulls both ends together", () => {
    // Nodes 0 and 1 are free; node 2 is the wire's auxiliary node, which both must stay above; the cost is |λ0 − λ1|.
    const { position } = rankByNetworkSimplex(3, [
      { tail: 2, head: 0, delta: 0, weight: 1 },
      { tail: 2, head: 1, delta: 0, weight: 1 }
    ]);
    expect(position[0]).toBe(position[1]);
  });

  it("finds the optimum that enumeration finds, on many small instances", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const count = 4 + (seed % 2);
      const constraints = seeded(seed, count, 6);
      const ranking = rankByNetworkSimplex(count, constraints);
      expect(feasible(constraints, ranking.position), `seed ${seed} feasible`).toBe(true);
      expect(ranking.optimal, `seed ${seed} optimal`).toBe(true);
      expect(ranking.cost, `seed ${seed} cost`).toBe(bruteForce(count, constraints, 12));
    }
  });

  it("moves a card down to the partner its only wire meets, and splits the difference between two it cannot both meet", () => {
    // Items 0 (height 2) and 1 stand in one column, 1 below 0 with a gap of 1. Item 2 stands in the next column.
    const column: Constraint = { tail: 0, head: 1, delta: 3, weight: 0 };
    // One wire, from item 1's pin at offset 1 to item 2's pin at offset 0, through the auxiliary node 3: item 2 aligns exactly.
    const one = rankByNetworkSimplex(4, [column, { tail: 3, head: 1, delta: -1, weight: 1 }, { tail: 3, head: 2, delta: 0, weight: 1 }]);
    expect(one.position[2]).toBe(one.position[1] + 1);
    expect(one.position[2]).toBeGreaterThan(one.position[0]);
    // A second wire from item 0's pin at offset 0 to item 2's pin at offset 1 asks for a place 5 above the first: the sum of the
    // two displacements cannot be less than the distance between the two places, and the solver reaches exactly that.
    const two = rankByNetworkSimplex(5, [column,
      { tail: 3, head: 1, delta: -1, weight: 1 }, { tail: 3, head: 2, delta: 0, weight: 1 },
      { tail: 4, head: 0, delta: 0, weight: 1 }, { tail: 4, head: 2, delta: -1, weight: 1 }
    ]);
    const displacement = Math.abs(two.position[1] + 1 - two.position[2]) + Math.abs(two.position[0] - (two.position[2] + 1));
    expect(displacement).toBe(5);
    expect(two.optimal).toBe(true);
  });

  it("keeps every constraint on a larger instance and never costs more than the longest-path start", () => {
    for (const seed of [3, 11, 29]) {
      const constraints = seeded(seed, 40, 90);
      const ranking = rankByNetworkSimplex(40, constraints);
      expect(feasible(constraints, ranking.position)).toBe(true);
      expect(ranking.optimal).toBe(true);
      const start = rankByNetworkSimplex(40, constraints.map(c => ({ ...c, weight: 0 })));
      const startCost = constraints.reduce((sum, c) => sum + c.weight * (start.position[c.head] - start.position[c.tail]), 0);
      expect(ranking.cost).toBeLessThanOrEqual(startCost);
    }
  });

  it("is the same answer every time", () => {
    const constraints = seeded(7, 12, 20);
    expect(rankByNetworkSimplex(12, constraints)).toEqual(rankByNetworkSimplex(12, constraints));
  });
});
