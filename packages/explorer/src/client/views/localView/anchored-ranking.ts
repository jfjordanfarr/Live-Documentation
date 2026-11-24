/**
 * Anchored column ranking for opened directories in Flow (Option C, 2026-11-24).
 *
 * When a person pins a file inside an opened directory at Flow, the incoming files from outside the directory join the
 * picture with pair lines. Ranking every card from scratch reshuffled the directory's own columns on 102 of 249
 * single-file pins (measured 2026-11-23), even though 196 fit inside existing columns and 27 only needed a column
 * inserted.
 *
 * This module holds the opened directories' unpinned own columns steady wherever the forward DAG allows:
 * - Every forward reference across all ranked files strictly runs left to right (`col(provider) < col(consumer)`).
 * - Non-conflicting own files keep their base column grouping (`baseCol(a) === baseCol(b) => col(a) === col(b)`) and
 *   strict relative column order (`baseCol(a) < baseCol(b) => col(a) < col(b)`).
 * - Incoming cards (and newly joined or retained loose own files) fit into existing columns between their providers and
 *   consumers where room exists, or insert the fewest columns needed between neighbouring base columns (or at either
 *   end) without splitting any own column.
 * - Real conflicts — where a directed forward path runs from an own file at column `a` to an own file at column `b <= a`,
 *   making the anchored constraint graph cyclic — are resolved by detaching the exact minimum-cardinality subset of
 *   conflicting own files (minimum vertex cover of the conflict poset via Dilworth/König bipartite matching) and letting
 *   network simplex place the detached own files and incoming files at minimum total column span while all remaining
 *   own files stay locked to their base columns.
 *
 * Pure-function module: no DOM.
 *
 * @module views/localView/anchored-ranking
 */

import { rankByNetworkSimplex, type Constraint } from "./network-simplex";

/** Base scale applied to real wire weights so unit spine weights stay strictly secondary and exact in IEEE-754 floats. */
const MIN_EDGE_WEIGHT_SCALE = 1024;
/** Small positive spine weight keeping adjacent own-column anchors adjacent unless a directed path inserts a column. */
const SPINE_WEIGHT = 1;

/**
 * Finds the exact minimum-size subset of anchored own node indices to detach so that no directed path in the forward
 * DAG runs from a remaining anchored own node at column `a` to another at column `b <= a`.
 *
 * Because reachability in a DAG combined with `baseCol(u) >= baseCol(v)` is irreflexive and transitive, the conflicting
 * pairs form a strict partial order `(P, <)`. Detaching the fewest nodes so no comparable pair remains is equivalent to
 * finding a maximum antichain of `(P, <)`, solved exactly in polynomial time by maximum bipartite matching on the split
 * graph `(P_L, P_R)` and König's minimum vertex cover theorem.
 */
export function minimumConflictingAnchors(
  ids: readonly string[],
  pairs: readonly Constraint[],
  anchors: ReadonlyMap<string, number>
): Set<number> {
  const ownIndices: number[] = [];
  const baseCol = new Map<number, number>();
  for (let i = 0; i < ids.length; i++) {
    const col = anchors.get(ids[i]);
    if (col !== undefined) {
      ownIndices.push(i);
      baseCol.set(i, col);
    }
  }
  if (ownIndices.length <= 1) return new Set();

  // Build forward adjacency from provider (tail) to consumer (head).
  const out = Array.from({ length: ids.length }, () => [] as number[]);
  for (const edge of pairs) out[edge.tail].push(edge.head);

  // Reachability in the forward DAG from each own node to find every conflict pair (u ->* v with baseCol(u) >= baseCol(v)).
  const conflictAdj = new Map<number, number[]>();
  const active = new Set<number>();
  const seen = new Int32Array(ids.length);
  const queue: number[] = [];
  let stamp = 0;
  for (const u of ownIndices) {
    stamp++;
    queue.length = 0;
    const uCol = baseCol.get(u)!;
    for (const next of out[u]) {
      if (seen[next] !== stamp) {
        seen[next] = stamp;
        queue.push(next);
      }
    }
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      const cCol = baseCol.get(current);
      if (cCol !== undefined && uCol >= cCol) {
        active.add(u);
        active.add(current);
        let list = conflictAdj.get(u);
        if (!list) conflictAdj.set(u, list = []);
        list.push(current);
      }
      for (const next of out[current]) {
        if (seen[next] !== stamp) {
          seen[next] = stamp;
          queue.push(next);
        }
      }
    }
  }
  if (!active.size) return new Set();

  // Deterministic ordering by node id so the minimum detach set is independent of input node/edge ordering.
  const participants = [...active].sort((a, b) => ids[a].localeCompare(ids[b]));
  const n = participants.length;
  const rankOf = new Map(participants.map((nodeIdx, pos) => [nodeIdx, pos]));
  const adj: number[][] = participants.map(nodeIdx =>
    (conflictAdj.get(nodeIdx) ?? []).map(target => rankOf.get(target)!).sort((a, b) => a - b)
  );

  // Maximum bipartite matching (Kuhn's augmenting paths) on the poset's split graph (P_L, P_R).
  const matchL = new Int32Array(n).fill(-1);
  const matchR = new Int32Array(n).fill(-1);
  const visited = new Int32Array(n);
  let visitStamp = 0;
  const augment = (u: number): boolean => {
    for (const v of adj[u]) {
      if (visited[v] === visitStamp) continue;
      visited[v] = visitStamp;
      if (matchR[v] < 0 || augment(matchR[v])) {
        matchL[u] = v;
        matchR[v] = u;
        return true;
      }
    }
    return false;
  };
  for (let u = 0; u < n; u++) {
    visitStamp++;
    augment(u);
  }

  // König minimum vertex cover: alternating reachability from unmatched left vertices.
  const reachL = new Uint8Array(n);
  const reachR = new Uint8Array(n);
  const bfs: number[] = [];
  for (let u = 0; u < n; u++) {
    if (matchL[u] < 0) {
      reachL[u] = 1;
      bfs.push(u);
    }
  }
  for (let head = 0; head < bfs.length; head++) {
    const u = bfs[head];
    for (const v of adj[u]) {
      if (matchL[u] !== v && !reachR[v]) {
        reachR[v] = 1;
        const paired = matchR[v];
        if (paired >= 0 && !reachL[paired]) {
          reachL[paired] = 1;
          bfs.push(paired);
        }
      }
    }
  }

  // A node stays anchored iff u_L is in reachL and u_R is not in reachR; otherwise it is in the minimum detach set.
  const detached = new Set<number>();
  for (let i = 0; i < n; i++) {
    if (!reachL[i] || reachR[i]) detached.add(participants[i]);
  }
  return detached;
}

/**
 * Ranks `ids` into non-empty integer columns `0..M-1` while holding non-conflicting anchored nodes to their base column
 * grouping and strict relative order. Returns `null` when no node in `ids` has an anchor (caller falls back to
 * unanchored ranking).
 */
export function rankAnchoredColumns(
  ids: readonly string[],
  pairs: readonly Constraint[],
  anchors: ReadonlyMap<string, number>,
  pull: number,
  tie: "fewest" | "right" | "left"
): number[] | null {
  const count = ids.length;
  if (count === 0) return [];
  const detached = minimumConflictingAnchors(ids, pairs, anchors);

  const anchored = new Set<number>();
  const activeColsSet = new Set<number>();
  for (let i = 0; i < count; i++) {
    const col = anchors.get(ids[i]);
    if (col !== undefined && !detached.has(i)) {
      anchored.add(i);
      activeColsSet.add(col);
    }
  }
  if (!anchored.size) return null;

  const activeCols = [...activeColsSet].sort((a, b) => a - b);
  const colToAnchor = new Map(activeCols.map((col, idx) => [col, idx]));
  const anchorCount = activeCols.length;

  // Free nodes (incoming files, newly joined/retained loose own files, and detached conflicting own files), sorted by id.
  const freeIndices: number[] = [];
  for (let i = 0; i < count; i++) if (!anchored.has(i)) freeIndices.push(i);
  freeIndices.sort((a, b) => ids[a].localeCompare(ids[b]));

  const vertexOf = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    if (anchored.has(i)) vertexOf[i] = colToAnchor.get(anchors.get(ids[i])!)!;
  }
  freeIndices.forEach((nodeIdx, pos) => { vertexOf[nodeIdx] = anchorCount + pos; });

  const contractedCount = anchorCount + freeIndices.length;
  const edgeWeights = new Map<string, { tail: number; head: number; weight: number }>();
  const addConstraint = (tail: number, head: number, weight: number): void => {
    const key = `${tail}\0${head}`;
    const existing = edgeWeights.get(key);
    if (existing) existing.weight += weight;
    else edgeWeights.set(key, { tail, head, weight });
  };

  let edgeWeightScale = MIN_EDGE_WEIGHT_SCALE;
  while (edgeWeightScale <= anchorCount * 2) edgeWeightScale *= 2;

  // Spine constraints keep consecutive active own columns strictly ordered and adjacent unless forced apart.
  for (let c = 0; c + 1 < anchorCount; c++) {
    addConstraint(c, c + 1, SPINE_WEIGHT);
  }
  for (const edge of pairs) {
    addConstraint(vertexOf[edge.tail], vertexOf[edge.head], edge.weight * edgeWeightScale);
  }

  const constraints: Constraint[] = [...edgeWeights.values()]
    .sort((a, b) => a.tail - b.tail || a.head - b.head)
    .map(({ tail, head, weight }) => ({ tail, head, delta: 1, weight }));

  // When pull > 0, pull free nodes toward a shared sink past every vertex without distorting the anchored own spine.
  const sink = contractedCount;
  if (pull > 0) {
    for (let v = 0; v < anchorCount; v++) constraints.push({ tail: v, head: sink, delta: 0, weight: 0 });
    for (let v = anchorCount; v < contractedCount; v++) constraints.push({ tail: v, head: sink, delta: 0, weight: pull * edgeWeightScale });
  }

  const solved = rankByNetworkSimplex(contractedCount + (pull > 0 ? 1 : 0), constraints).position;
  const column = Array.from({ length: count }, (_, i) => solved[vertexOf[i]]);

  // Shift any connected component made solely of free nodes so it ends at the rightmost column, matching rankColumns.
  const parent = Array.from({ length: count }, (_, i) => i);
  const find = (v: number): number => (parent[v] === v ? v : (parent[v] = find(parent[v])));
  for (const edge of pairs) parent[find(edge.tail)] = find(edge.head);
  const hasAnchor = new Set<number>();
  for (const i of anchored) hasAnchor.add(find(i));
  const last = Math.max(0, ...column);
  const groupLast = new Map<number, number>();
  for (let v = 0; v < count; v++) groupLast.set(find(v), Math.max(groupLast.get(find(v)) ?? 0, column[v]));
  for (let v = 0; v < count; v++) {
    const root = find(v);
    if (!hasAnchor.has(root)) column[v] += last - groupLast.get(root)!;
  }

  // Tie-break free nodes whose inbound and outbound weights balance, holding anchored own nodes fixed.
  const cards = new Map<number, number>();
  for (const value of column) cards.set(value, (cards.get(value) ?? 0) + 1);
  for (const v of freeIndices) {
    let inbound = 0, outbound = pull, low = 0, high = last;
    for (const edge of pairs) {
      if (edge.head === v) { inbound += edge.weight; low = Math.max(low, column[edge.tail] + 1); }
      if (edge.tail === v) { outbound += edge.weight; high = Math.min(high, column[edge.head] - 1); }
    }
    if (!inbound || inbound !== outbound) continue;
    let best = column[v];
    const others = (value: number): number => (cards.get(value) ?? 0) - (value === column[v] ? 1 : 0);
    if (tie === "right") best = high;
    else if (tie === "left") best = low;
    else for (let value = low; value <= high; value++) if (others(value) <= others(best)) best = value;
    cards.set(column[v], cards.get(column[v])! - 1);
    cards.set(best, (cards.get(best) ?? 0) + 1);
    column[v] = best;
  }

  const used = [...new Set(column)].sort((a, b) => a - b);
  return column.map(value => used.indexOf(value));
}
