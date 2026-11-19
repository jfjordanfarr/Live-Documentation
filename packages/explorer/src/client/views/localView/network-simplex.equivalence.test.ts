import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { rankByNetworkSimplex, type Constraint, type Ranking } from "./network-simplex";

/**
 * The placement solver against the solver as it stood on 2026-11-19 (`01b32fb0`), kept here and only here as the oracle:
 * every change made to the solver for speed must leave every result the same, positions, cost and optimality, as JSON,
 * since the Local Map's search compares the pictures those positions make and a different optimum where two are equal
 * would be a different picture. Checked on seeded random systems, some with every weight and separation small so that
 * ties abound, and on real systems the page solved for this repository's five-file scope during its continuing search
 * (`__fixtures__/network-simplex.systems.json`, recorded from the page's own solver on 2026-11-19).
 */

/** A seeded acyclic system: each constraint runs from a lower to a higher number in a shuffled order of the nodes. */
function seededSystem(seed: number, count: number, edges: number, spread: { delta: number; weight: number }): Constraint[] {
  let state = seed;
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index--) {
    const other = Math.floor(next() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  const constraints: Constraint[] = [];
  for (let index = 0; index < edges; index++) {
    let a = Math.floor(next() * count), b = Math.floor(next() * count);
    if (a === b) continue;
    if (a > b) [a, b] = [b, a];
    constraints.push({ tail: order[a], head: order[b], delta: Math.floor(next() * spread.delta) - Math.floor(spread.delta / 4), weight: Math.floor(next() * spread.weight) });
  }
  return constraints;
}

/** The real systems: `[count, [tail, head, delta, weight, …]]` each. */
function realSystems(): Array<{ count: number; constraints: Constraint[] }> {
  const file = path.join(__dirname, "__fixtures__", "network-simplex.systems.json");
  const recorded = JSON.parse(readFileSync(file, "utf8")) as Array<[number, number[]]>;
  return recorded.map(([count, flat]) => {
    const constraints: Constraint[] = [];
    for (let index = 0; index < flat.length; index += 4) constraints.push({ tail: flat[index], head: flat[index + 1], delta: flat[index + 2], weight: flat[index + 3] });
    return { count, constraints };
  });
}

describe("the placement solver against its oracle", () => {
  it("solves seeded random systems exactly as the oracle does", () => {
    let systems = 0;
    for (const [count, edges] of [[2, 1], [5, 6], [12, 20], [40, 90], [120, 300], [300, 900]] as const) {
      for (const spread of [{ delta: 3, weight: 2 }, { delta: 40, weight: 9 }]) {
        for (let seed = 1; seed <= (count > 100 ? 4 : 25); seed++) {
          // Some nodes no constraint touches, so that the solver's forest has more than one tree.
          const constraints = seededSystem(seed * 7919 + count, count + 3, edges, spread);
          expect(JSON.stringify(rankByNetworkSimplex(count + 3, constraints)), `${count} nodes, ${edges} constraints, seed ${seed}`)
            .toBe(JSON.stringify(oracleRank(count + 3, constraints)));
          systems++;
        }
      }
    }
    expect(systems).toBeGreaterThan(200);
  });

  it("solves the real systems of this repository's five-file scope exactly as the oracle does", () => {
    const systems = realSystems();
    expect(systems.length).toBeGreaterThan(0);
    for (const [index, { count, constraints }] of systems.entries()) {
      expect(JSON.stringify(rankByNetworkSimplex(count, constraints)), `real system ${index}: ${count} nodes, ${constraints.length} constraints`)
        .toBe(JSON.stringify(oracleRank(count, constraints)));
    }
  });
});

// ─── The oracle: the solver of 2026-11-19, `01b32fb0`, unchanged but for its names ───────────────────────────────

/**
 * Minimizes Σ ω·(λ(head) − λ(tail)) subject to λ(head) − λ(tail) ≥ δ for every
 * constraint, over `count` nodes numbered from zero, and returns positions
 * normalized so the least is zero. Nodes no constraint touches stay at zero.
 */
function oracleRank(count: number, constraints: readonly Constraint[]): Ranking {
  const edges = constraints.filter(edge => edge.tail !== edge.head);
  const position = initialPositions(count, edges);
  const inTree = new Array<boolean>(edges.length).fill(false);
  feasibleTree(count, edges, position, inTree);

  const tree = new OracleTree(count, edges, inTree);
  let optimal = false;
  const limit = Math.max(50, edges.length * 8);
  let searchFrom = 0;
  for (let iteration = 0; iteration < limit; iteration++) {
    tree.rebuild();
    const cut = tree.cutValues();
    const leaving = tree.leavingEdge(cut, searchFrom);
    if (leaving < 0) { optimal = true; break; }
    searchFrom = leaving + 1;
    const onHeadSide = tree.headSide(leaving);
    const entering = tree.enteringEdge(onHeadSide, position);
    if (entering < 0) { optimal = true; break; }
    const shift = slack(edges[entering], position);
    // Raising the leaving edge's head side by the entering edge's slack makes the entering edge tight and lowers the cost.
    for (let v = 0; v < count; v++) if (onHeadSide(v)) position[v] += shift;
    tree.exchange(leaving, entering);
  }
  const least = Math.min(...position);
  for (let v = 0; v < count; v++) position[v] -= least;
  return { position, cost: costOf(edges, position), optimal };
}

const slack = (edge: Constraint, position: readonly number[]): number => position[edge.head] - position[edge.tail] - edge.delta;

const costOf = (edges: readonly Constraint[], position: readonly number[]): number =>
  edges.reduce((sum, edge) => sum + edge.weight * (position[edge.head] - position[edge.tail]), 0);

/** The longest-path positions: each node as low as every constraint into it allows, which is feasible when the graph is acyclic. */
function initialPositions(count: number, edges: readonly Constraint[]): number[] {
  const indegree = new Array<number>(count).fill(0);
  const out = Array.from({ length: count }, () => [] as number[]);
  edges.forEach((edge, index) => { indegree[edge.head]++; out[edge.tail].push(index); });
  const position = new Array<number>(count).fill(0);
  const ready: number[] = [];
  for (let v = 0; v < count; v++) if (indegree[v] === 0) ready.push(v);
  let seen = 0;
  while (ready.length) {
    const v = ready.shift()!;
    seen++;
    for (const index of out[v]) {
      const edge = edges[index];
      position[edge.head] = Math.max(position[edge.head], position[v] + edge.delta);
      if (--indegree[edge.head] === 0) ready.push(edge.head);
    }
  }
  if (seen < count) throw new Error("The placement's constraints form a cycle; the column order and the band rows disagree.");
  return position;
}

/** A spanning tree of tight edges, grown by shifting the tree to meet the nearest outside edge until every node is in it. */
function feasibleTree(count: number, edges: readonly Constraint[], position: number[], inTree: boolean[]): void {
  if (count === 0) return;
  const inSet = new Array<boolean>(count).fill(false);
  const incident = Array.from({ length: count }, () => [] as number[]);
  edges.forEach((edge, index) => { incident[edge.tail].push(index); incident[edge.head].push(index); });
  const grow = (start: number): void => {
    const queue = [start];
    inSet[start] = true;
    while (queue.length) {
      const v = queue.shift()!;
      for (const index of incident[v]) {
        const edge = edges[index];
        const other = edge.tail === v ? edge.head : edge.tail;
        if (!inSet[other] && slack(edge, position) === 0) { inSet[other] = true; inTree[index] = true; queue.push(other); }
      }
    }
  };
  grow(0);
  for (;;) {
    let size = 0;
    for (let v = 0; v < count; v++) if (inSet[v]) size++;
    if (size === count) break;
    let best = -1, bestSlack = Infinity;
    edges.forEach((edge, index) => {
      if (inSet[edge.tail] === inSet[edge.head]) return;
      const s = slack(edge, position);
      if (s < bestSlack) { bestSlack = s; best = index; }
    });
    if (best < 0) {
      // A node no constraint reaches: it joins at its own position.
      const loose = inSet.indexOf(false);
      grow(loose);
      continue;
    }
    const edge = edges[best];
    const delta = inSet[edge.tail] ? bestSlack : -bestSlack;
    for (let v = 0; v < count; v++) if (inSet[v]) position[v] += delta;
    inTree[best] = true;
    grow(inSet[edge.tail] ? edge.head : edge.tail);
  }
}

/** The spanning tree rooted at node zero, with postorder numbers that tell whether a node lies below a tree edge. */
class OracleTree {
  private readonly parentEdge: number[];
  private readonly low: number[];
  private readonly lim: number[];
  private readonly treeEdges: number[] = [];
  private readonly adjacency: number[][];
  private readonly visited: boolean[];
  private readonly stackNode: number[];
  private readonly stackFrom: number[];
  private readonly stackNext: number[];
  private readonly byPostorder: number[];
  /** Node balances depend only on this solve's immutable edges and weights, never on its tree. */
  private readonly flow: number[];
  private readonly subtree: number[];
  private readonly cut: number[];

  constructor(private readonly count: number, private readonly edges: readonly Constraint[], private readonly inTree: boolean[]) {
    this.adjacency = Array.from({ length: count }, () => [] as number[]);
    this.parentEdge = new Array<number>(count).fill(-1);
    this.low = new Array<number>(count).fill(0);
    this.lim = new Array<number>(count).fill(0);
    this.visited = new Array<boolean>(count).fill(false);
    this.stackNode = new Array<number>(count).fill(0);
    this.stackFrom = new Array<number>(count).fill(0);
    this.stackNext = new Array<number>(count).fill(0);
    this.byPostorder = new Array<number>(count).fill(0);
    this.flow = new Array<number>(count).fill(0);
    this.subtree = new Array<number>(count).fill(0);
    this.cut = new Array<number>(edges.length).fill(0);
    edges.forEach((edge, index) => {
      this.flow[edge.head] += edge.weight;
      this.flow[edge.tail] -= edge.weight;
      if (!inTree[index]) return;
      this.treeEdges.push(index);
      this.adjacency[edge.tail].push(index);
      this.adjacency[edge.head].push(index);
    });
  }

  /** Exchange just the two tree edges, keeping the ascending edge order that a full rebuild produced. */
  exchange(leaving: number, entering: number): void {
    const removed = this.edges[leaving], added = this.edges[entering];
    for (const list of [this.treeEdges, this.adjacency[removed.tail], this.adjacency[removed.head]]) {
      list.splice(list.indexOf(leaving), 1);
    }
    for (const list of [this.treeEdges, this.adjacency[added.tail], this.adjacency[added.head]]) {
      let low = 0, high = list.length;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (list[middle] < entering) low = middle + 1;
        else high = middle;
      }
      list.splice(low, 0, entering);
    }
    this.inTree[leaving] = false;
    this.inTree[entering] = true;
  }

  rebuild(): void {
    this.parentEdge.fill(-1);
    this.low.fill(0);
    this.lim.fill(0);
    this.visited.fill(false);
    let next = 1;
    for (let root = 0; root < this.count; root++) {
      if (this.visited[root]) continue;
      // The same iterative DFS, with reusable parallel stacks instead of one new object per visited node.
      let depth = 0;
      this.stackNode[depth] = root;
      this.stackFrom[depth] = -1;
      this.stackNext[depth] = 0;
      this.visited[root] = true;
      this.low[root] = next;
      while (depth >= 0) {
        const node = this.stackNode[depth], list = this.adjacency[node];
        if (this.stackNext[depth] < list.length) {
          const edgeIndex = list[this.stackNext[depth]++];
          if (edgeIndex === this.stackFrom[depth]) continue;
          const edge = this.edges[edgeIndex];
          const child = edge.tail === node ? edge.head : edge.tail;
          if (this.visited[child]) continue;
          this.visited[child] = true;
          this.parentEdge[child] = edgeIndex;
          this.low[child] = next;
          depth++;
          this.stackNode[depth] = child;
          this.stackFrom[depth] = edgeIndex;
          this.stackNext[depth] = 0;
        } else {
          this.lim[node] = next;
          this.byPostorder[next - 1] = node;
          next++;
          depth--;
        }
      }
    }
  }

  /**
   * Whether a node is on the head's side of the cut the tree edge `index` makes, one test a node. The edge's lower end
   * (its child) and that end's postorder range are found once a pivot: a node lies below the edge when its number falls
   * in the range, and the head lies below exactly when the head is the child, since the other end is the child's parent.
   * Until 2026-11-19 each test found the child again, twice, for the node and for the head: on this repository's
   * five-file scope the cut tests took a sixth of the Local Map's continuing search.
   */
  headSide(index: number): (node: number) => boolean {
    const edge = this.edges[index];
    const child = this.parentEdge[edge.head] === index ? edge.head : edge.tail;
    const headBelow = child === edge.head, low = this.low[child], high = this.lim[child], lim = this.lim;
    return node => (low <= lim[node] && lim[node] <= high) === headBelow;
  }

  /** Sum this solve's node balances in the current DFS postorder; each tree edge keeps its own indexed cut slot. */
  cutValues(): readonly number[] {
    for (let v = 0; v < this.count; v++) this.subtree[v] = this.flow[v];
    for (const v of this.byPostorder) {
      const index = this.parentEdge[v];
      if (index < 0) continue;
      const edge = this.edges[index];
      this.subtree[edge.tail === v ? edge.head : edge.tail] += this.subtree[v];
    }
    for (const index of this.treeEdges) {
      const edge = this.edges[index];
      const child = this.parentEdge[edge.head] === index ? edge.head : edge.tail;
      // The subtree's sum counts an edge into it toward the child; the cut value counts toward the tree edge's head.
      this.cut[index] = child === edge.head ? this.subtree[child] : -this.subtree[child];
    }
    return this.cut;
  }

  /** A tree edge whose cut value is negative, searched from `from` round the list so that no edge is favoured. */
  leavingEdge(cut: readonly number[], from: number): number {
    const order = this.treeEdges;
    for (let i = 0; i < order.length; i++) {
      const index = order[(from + i) % order.length];
      if ((cut[index] ?? 0) < 0) return index;
    }
    return -1;
  }

  /** The non-tree edge from the head side to the tail side of the leaving edge's cut with the least slack. */
  enteringEdge(onHeadSide: (node: number) => boolean, position: readonly number[]): number {
    let best = -1, bestSlack = Infinity;
    this.edges.forEach((edge, index) => {
      if (this.inTree[index]) return;
      if (!onHeadSide(edge.tail) || onHeadSide(edge.head)) return;
      const s = slack(edge, position);
      if (s < bestSlack) { bestSlack = s; best = index; }
    });
    return best;
  }
}
