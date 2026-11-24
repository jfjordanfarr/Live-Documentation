# `packages/explorer/src/client/views/localView/anchored-ranking.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/anchored-ranking.ts`
- Generated At: 2026-11-24T02:21:12.852Z

## Authored
### Purpose

Holds an opened directory's unpinned Flow columns steady when a pin brings outside files into the 2D Local Map (Option C), detaching only the exact minimum-cardinality subset of conflicting own cards where a forward path prevents keeping all own anchors simultaneously. Called by `branches.ts` (`rankBranches`) when `RankingOptions.anchors` is provided.

### Notes

Current: added on 2026-11-24 following the owner's decision on Option C ("Let's roll with it", [November 24 record, Turn 4](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-24/2026-11-24.1.record.md#turn-4)) after calling Flow's pin reshuffle "too much surprise" and measuring 102/249 reshuffling pins in [the Flow pins probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/flow-pins/README.md). Uses Dilworth/König bipartite matching (`minimumConflictingAnchors`) on the strict partial order of forward-DAG inversions (`u` reaches `v` with `baseCol(u) >= baseCol(v)`) to detach the fewest own nodes needed for acyclicity, then contracts remaining own columns onto an ordered spine solved by `rankByNetworkSimplex`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `minimumConflictingAnchors` {#symbol-minimumconflictinganchors}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/anchored-ranking.ts#L43)
- Parameters: `anchors`: `ReadonlyMap`

##### `minimumConflictingAnchors` — Summary
Finds the exact minimum-size subset of anchored own node indices to detach so that no directed path in the forward
DAG runs from a remaining anchored own node at column `a` to another at column `b <= a`.

Because reachability in a DAG combined with `baseCol(u) >= baseCol(v)` is irreflexive and transitive, the conflicting
pairs form a strict partial order `(P, <)`. Detaching the fewest nodes so no comparable pair remains is equivalent to
finding a maximum antichain of `(P, <)`, solved exactly in polynomial time by maximum bipartite matching on the split
graph `(P_L, P_R)` and König's minimum vertex cover theorem.

#### `rankAnchoredColumns` {#symbol-rankanchoredcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/anchored-ranking.ts#L166)
- Parameters: `anchors`: `ReadonlyMap`

##### `rankAnchoredColumns` — Summary
Ranks `ids` into non-empty integer columns `0..M-1` while holding non-conflicting anchored nodes to their base column
grouping and strict relative order. Returns `null` when no node in `ids` has an anchor (caller falls back to
unanchored ranking).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`network-simplex.Constraint`](./network-simplex.ts.mdmd.md#symbol-constraint) (type-only)
- [`network-simplex.rankByNetworkSimplex`](./network-simplex.ts.mdmd.md#symbol-rankbynetworksimplex)
<!-- LIVE-DOC:END Dependencies -->
