/**
 * The exact solver behind the Local Map's placement: a linear program whose
 * constraints are differences, λ(head) − λ(tail) ≥ δ for every edge, and
 * whose objective is the weighted sum of those differences, Σ ω·(λ(head) −
 * λ(tail)). This is the ranking problem of Gansner, Koutsofios, North and Vo
 * ("A technique for drawing directed graphs", 1993), which they solve with the
 * network simplex method and which Graphviz has run since; placing nodes on a
 * line with separation constraints is the same problem on an auxiliary graph.
 *
 * Pure-function module: no DOM. Every λ is an integer; the constraint graph
 * must be acyclic for the initial ranking, as a layered drawing's is.
 *
 * @module network-simplex
 */

/** A difference constraint with its weight: λ(head) − λ(tail) ≥ δ, costing ω per unit of that difference. */
export interface Constraint {
  tail: number;
  head: number;
  /** The least the difference may be; may be negative. */
  delta: number;
  /** What a unit of the difference costs; zero for a pure constraint. */
  weight: number;
}

/** The solution: a position for every node, the objective's value, and whether the search ended on an optimum. */
export interface Ranking {
  position: number[];
  cost: number;
  optimal: boolean;
}

/**
 * Minimizes Σ ω·(λ(head) − λ(tail)) subject to λ(head) − λ(tail) ≥ δ for every
 * constraint, over `count` nodes numbered from zero, and returns positions
 * normalized so the least is zero. Nodes no constraint touches stay at zero.
 */
export function rankByNetworkSimplex(count: number, constraints: readonly Constraint[]): Ranking {
  const edges = constraints.filter(edge => edge.tail !== edge.head);
  const position = initialPositions(count, edges);
  const inTree = new Array<boolean>(edges.length).fill(false);
  feasibleTree(count, edges, position, inTree);

  const tree = new TreeIndex(count, edges, inTree);
  let optimal = false;
  const limit = Math.max(50, edges.length * 8);
  let searchFrom = 0;
  for (let iteration = 0; iteration < limit; iteration++) {
    tree.rebuild();
    const cut = tree.cutValues();
    const leaving = tree.leavingEdge(cut, searchFrom);
    if (leaving < 0) { optimal = true; break; }
    searchFrom = leaving + 1;
    const entering = tree.enteringEdge(leaving, position);
    if (entering < 0) { optimal = true; break; }
    const shift = slack(edges[entering], position);
    // Raising the leaving edge's head side by the entering edge's slack makes the entering edge tight and lowers the cost.
    for (let v = 0; v < count; v++) if (tree.onHeadSide(leaving, v)) position[v] += shift;
    inTree[leaving] = false;
    inTree[entering] = true;
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
class TreeIndex {
  private parentEdge: number[] = [];
  private low: number[] = [];
  private lim: number[] = [];
  private treeEdges: number[] = [];

  constructor(private readonly count: number, private readonly edges: readonly Constraint[], private readonly inTree: boolean[]) {}

  rebuild(): void {
    const adjacency = Array.from({ length: this.count }, () => [] as number[]);
    this.treeEdges = [];
    this.edges.forEach((edge, index) => {
      if (!this.inTree[index]) return;
      this.treeEdges.push(index);
      adjacency[edge.tail].push(index);
      adjacency[edge.head].push(index);
    });
    this.parentEdge = new Array<number>(this.count).fill(-1);
    this.low = new Array<number>(this.count).fill(0);
    this.lim = new Array<number>(this.count).fill(0);
    let next = 1;
    const visited = new Array<boolean>(this.count).fill(false);
    const visit = (root: number): void => {
      // Iterative postorder: lim is the postorder number, low the least in the subtree.
      const stack: Array<{ node: number; from: number; index: number }> = [{ node: root, from: -1, index: 0 }];
      visited[root] = true;
      this.low[root] = next;
      while (stack.length) {
        const frame = stack[stack.length - 1];
        const list = adjacency[frame.node];
        if (frame.index < list.length) {
          const edgeIndex = list[frame.index++];
          if (edgeIndex === frame.from) continue;
          const edge = this.edges[edgeIndex];
          const child = edge.tail === frame.node ? edge.head : edge.tail;
          if (visited[child]) continue;
          visited[child] = true;
          this.parentEdge[child] = edgeIndex;
          this.low[child] = next;
          stack.push({ node: child, from: edgeIndex, index: 0 });
        } else {
          this.lim[frame.node] = next++;
          stack.pop();
        }
      }
    };
    for (let v = 0; v < this.count; v++) if (!visited[v]) visit(v);
  }

  /** Whether `node` lies in the subtree below the tree edge `index`, the side away from the root. */
  private below(index: number, node: number): boolean {
    const edge = this.edges[index];
    const child = this.parentEdge[edge.head] === index ? edge.head : edge.tail;
    return this.low[child] <= this.lim[node] && this.lim[node] <= this.lim[child];
  }

  /** Whether `node` is on the head's side of the cut the tree edge `index` makes. */
  onHeadSide(index: number, node: number): boolean {
    const edge = this.edges[index];
    return this.below(index, node) === this.below(index, edge.head);
  }

  /** For each tree edge, the weight of edges crossing its cut the same way less those crossing the other way. */
  cutValues(): Map<number, number> {
    const cut = new Map<number, number>();
    for (const index of this.treeEdges) {
      let value = 0;
      this.edges.forEach(edge => {
        const tailOnHead = this.onHeadSide(index, edge.tail);
        const headOnHead = this.onHeadSide(index, edge.head);
        if (tailOnHead === headOnHead) return;
        value += headOnHead ? edge.weight : -edge.weight;
      });
      cut.set(index, value);
    }
    return cut;
  }

  /** A tree edge whose cut value is negative, searched from `from` round the list so that no edge is favoured. */
  leavingEdge(cut: ReadonlyMap<number, number>, from: number): number {
    const order = this.treeEdges;
    for (let i = 0; i < order.length; i++) {
      const index = order[(from + i) % order.length];
      if ((cut.get(index) ?? 0) < 0) return index;
    }
    return -1;
  }

  /** The non-tree edge from the head side to the tail side of the leaving edge's cut with the least slack. */
  enteringEdge(leaving: number, position: readonly number[]): number {
    let best = -1, bestSlack = Infinity;
    this.edges.forEach((edge, index) => {
      if (this.inTree[index]) return;
      if (!this.onHeadSide(leaving, edge.tail) || this.onHeadSide(leaving, edge.head)) return;
      const s = slack(edge, position);
      if (s < bestSlack) { bestSlack = s; best = index; }
    });
    return best;
  }
}
