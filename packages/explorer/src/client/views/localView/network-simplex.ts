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
  tree.rebuild();
  const cut = tree.cutValues();
  for (let iteration = 0; iteration < limit; iteration++) {
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

/**
 * A spanning tree of tight edges, grown by shifting the tree to meet the nearest outside edge until every node is in it.
 * The nearest outside edge is the one of least slack among the edges with one end in the tree, the lowest-numbered of
 * those that tie. Since 2026-11-19 it is found from two heaps rather than by reading every edge each time the tree grows,
 * and the tree is shifted by one number rather than node by node: a node in the tree stands at its place when it joined,
 * less the shift then, plus the shift now, so an outside edge whose tail is in the tree has a slack of a fixed number
 * less the shift, and one whose head is in the tree a fixed number plus it. Each heap orders its edges by that number and
 * then by edge number, so the least slack of either heap, ties to the lower edge number, is the edge the full reading
 * chose; an edge whose other end has joined since is dropped when it comes to the top. Every node joins once, every
 * edge enters a heap once, and the result is the same tree and the same positions.
 */
function feasibleTree(count: number, edges: readonly Constraint[], position: number[], inTree: boolean[]): void {
  if (count === 0) return;
  const inSet = new Array<boolean>(count).fill(false);
  const base = new Array<number>(count).fill(0);
  const incident = Array.from({ length: count }, () => [] as number[]);
  edges.forEach((edge, index) => { incident[edge.tail].push(index); incident[edge.head].push(index); });
  // The shift of every node in the tree since the tree began; a node in the tree stands at `base + shift`.
  let shift = 0, size = 0, firstOutside = 0;
  const at = (node: number): number => inSet[node] ? base[node] + shift : position[node];
  const tailIn = new EdgeHeap(), headIn = new EdgeHeap();
  const join = (node: number): void => {
    inSet[node] = true;
    base[node] = position[node] - shift;
    size++;
    for (const index of incident[node]) {
      const edge = edges[index];
      if (edge.tail === node && !inSet[edge.head]) tailIn.push(position[edge.head] - base[node] - edge.delta, index);
      else if (edge.head === node && !inSet[edge.tail]) headIn.push(base[node] - position[edge.tail] - edge.delta, index);
    }
  };
  const grow = (start: number): void => {
    const queue = [start];
    join(start);
    for (let next = 0; next < queue.length; next++) {
      const v = queue[next];
      for (const index of incident[v]) {
        const edge = edges[index];
        const other = edge.tail === v ? edge.head : edge.tail;
        if (!inSet[other] && at(edge.head) - at(edge.tail) - edge.delta === 0) { join(other); inTree[index] = true; queue.push(other); }
      }
    }
  };
  const crossing = (index: number): boolean => inSet[edges[index].tail] !== inSet[edges[index].head];
  grow(0);
  while (size < count) {
    while (tailIn.size && !crossing(tailIn.topIndex())) tailIn.pop();
    while (headIn.size && !crossing(headIn.topIndex())) headIn.pop();
    if (!tailIn.size && !headIn.size) {
      // A node no constraint reaches: it joins at its own position.
      while (inSet[firstOutside]) firstOutside++;
      grow(firstOutside);
      continue;
    }
    const tailSlack = tailIn.size ? tailIn.topKey() - shift : Infinity, headSlack = headIn.size ? headIn.topKey() + shift : Infinity;
    const fromTail = tailSlack < headSlack || (tailSlack === headSlack && tailIn.topIndex() < headIn.topIndex());
    const best = fromTail ? tailIn.topIndex() : headIn.topIndex();
    const edge = edges[best];
    // The tree moves toward the edge by its slack: up when the edge leaves the tree from its tail, down when from its head.
    shift += fromTail ? tailSlack : -headSlack;
    inTree[best] = true;
    grow(fromTail ? edge.head : edge.tail);
  }
  for (let v = 0; v < count; v++) position[v] = base[v] + shift;
}

/** A binary heap of edges by a key and then by edge number, the least first. */
class EdgeHeap {
  private readonly keys: number[] = [];
  private readonly indices: number[] = [];
  get size(): number { return this.keys.length; }
  topKey(): number { return this.keys[0]; }
  topIndex(): number { return this.indices[0]; }
  private less(a: number, b: number): boolean {
    return this.keys[a] < this.keys[b] || (this.keys[a] === this.keys[b] && this.indices[a] < this.indices[b]);
  }
  private swap(a: number, b: number): void {
    [this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]];
    [this.indices[a], this.indices[b]] = [this.indices[b], this.indices[a]];
  }
  push(key: number, index: number): void {
    this.keys.push(key);
    this.indices.push(index);
    let at = this.keys.length - 1;
    while (at > 0) {
      const up = (at - 1) >> 1;
      if (!this.less(at, up)) break;
      this.swap(at, up);
      at = up;
    }
  }
  pop(): void {
    const last = this.keys.length - 1;
    this.swap(0, last);
    this.keys.pop();
    this.indices.pop();
    let at = 0;
    for (;;) {
      const left = 2 * at + 1, right = left + 1;
      let least = at;
      if (left < this.keys.length && this.less(left, least)) least = left;
      if (right < this.keys.length && this.less(right, least)) least = right;
      if (least === at) break;
      this.swap(at, least);
      at = least;
    }
  }
}

/** The spanning tree rooted at node zero, with postorder numbers that tell whether a node lies below a tree edge. */
class TreeIndex {
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

  /**
   * Exchange the leaving tree edge for the entering one, keeping the ascending edge order that a full rebuild produced,
   * and bring the tree's numbers and cut values up to date where the exchange moved the tree: under the lowest common
   * ancestor of the entering edge's ends, which the leaving edge lies under too (`renumber`).
   */
  exchange(leaving: number, entering: number): void {
    const removed = this.edges[leaving], added = this.edges[entering];
    // In the tree before the exchange, climb from the entering edge's tail until the subtree holds its head as well.
    let top = added.tail;
    const headNumber = this.lim[added.head];
    while (!(this.low[top] <= headNumber && headNumber <= this.lim[top])) {
      const up = this.edges[this.parentEdge[top]];
      top = up.tail === top ? up.head : up.tail;
    }
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
    this.renumber(top);
  }

  /**
   * Number again the subtree of `top`, after an exchange under it, and work out again its nodes' sums and its tree
   * edges' cut values, as a full rebuild and `cutValues` would (Gansner et al.'s incremental update, as Graphviz makes
   * it). The subtree holds the same nodes before and after, so its numbers start where they started and end where they
   * ended; nothing outside it is reached, since its one tree edge outward is `top`'s own, which the walk does not take;
   * and nothing outside it changes: the order its ancestors visit their children in is theirs, and every other tree
   * edge splits the nodes as it did. So the numbers are the very ones a full rebuild gives, and the cut values the same.
   * Until 2026-11-19 every pivot rebuilt the whole tree and summed every cut, a third of the solver's time on this
   * repository's five-file scope.
   */
  private renumber(top: number): void {
    const first = this.low[top], last = this.lim[top];
    for (let number = first; number <= last; number++) this.visited[this.byPostorder[number - 1]] = false;
    let next = first, depth = 0;
    this.stackNode[0] = top;
    this.stackFrom[0] = this.parentEdge[top];
    this.stackNext[0] = 0;
    this.visited[top] = true;
    this.low[top] = next;
    this.subtree[top] = this.flow[top];
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
        this.subtree[child] = this.flow[child];
        depth++;
        this.stackNode[depth] = child;
        this.stackFrom[depth] = edgeIndex;
        this.stackNext[depth] = 0;
      } else {
        this.lim[node] = next;
        this.byPostorder[next - 1] = node;
        next++;
        if (depth > 0) {
          const index = this.parentEdge[node];
          this.subtree[this.stackNode[depth - 1]] += this.subtree[node];
          this.cut[index] = this.edges[index].head === node ? this.subtree[node] : -this.subtree[node];
        }
        depth--;
      }
    }
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
