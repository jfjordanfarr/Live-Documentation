# packages/explorer/src/client/views/localView/network-simplex.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/network-simplex.ts
- Generated At: 2026-10-22T16:47:56.087Z

## Authored
### Purpose

The exact solver behind the Local Map's placement: a linear program whose constraints are differences between nodes, λ(head) − λ(tail) ≥ δ, and whose objective is the weighted sum of those differences. It is the ranking problem of Gansner, Koutsofios, North and Vo ("A technique for drawing directed graphs", IEEE Transactions on Software Engineering, 1993), solved as they solve it, by the network simplex method, which Graphviz has run since.

### Notes

Current bookkeeping (2026-11-08) keeps every scratch array within one solver invocation. Weighted node balances are computed once from that invocation's immutable constraints. A pivot replaces only its leaving and entering tree edges in ascending edge-index adjacency and tree-edge lists; DFS still rebuilds the same postorder, using reusable parallel stacks. Cut values use the same postorder sums and edge-indexed scratch slots. Pivot limits, leaving/entering selection, tie order, the meaning of `searchFrom`, normalization and returned optimality are unchanged. There is no cross-solve cache or approximate placement. Since 2026-11-19 a pivot finds its leaving edge's lower end and postorder range once (`headSide`), where each test of a node's side of the cut found them again for the node and for the head: on this repository's five-file scope the solver was three quarters of the Local Map's continuing search and those tests a sixth of it. On 252 random systems of 5 to 700 nodes the results are the same to the last field and the solver takes 18 % less time ([the measurements](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/map-reds/README.md)).

Since 2026-11-19 an exchange no longer rebuilds the whole tree and sums every cut: it numbers again only the subtree of the entering edge's ends' lowest common ancestor and works out that subtree's sums and cut values in the same walk (`renumber`), as Gansner et al. and Graphviz do. The subtree holds the same nodes before and after, so its numbers start and end where they did, and nothing outside it changes; the numbers are the very ones a full rebuild gives. Every change made to the solver for speed is held to its oracle, the solver as it stood on 2026-11-19 before these changes, kept only in [the equivalence harness](network-simplex.equivalence.test.ts.mdmd.md): the same JSON on seeded random systems and on three real systems the page solved for this repository's five-file scope (`__fixtures__/network-simplex.systems.json`). On all 342 systems the page solved during that scope's 80-seed search, the same JSON, and 26 to 32 % less processor time.

Since 2026-11-19 the tight tree is grown from two heaps of the edges with one end in it (by tail and by head), ordered by the slack they would have with the tree unshifted and then by edge number, and the tree is shifted by one running number rather than node by node; before, every edge was read and every node of the tree counted and moved each time the tree grew. The least slack of either heap, ties to the lower edge number, is the edge the full reading chose, so the tree and positions are the same. With the incremental exchange: on all 342 real systems the same JSON, and 51 % less processor time than the oracle.

Since 2026-11-19 the entering edge is sought among the edges of the nodes below the leaving edge only, as Gansner et al. and Graphviz's `enter_edge` do: every edge across the cut has exactly one end there. The least slack, ties to the lower edge number, is what the reading of every edge in edge order chose. The head side is raised from the same range, the nodes below the edge when the head is below and every other node when it is not, as a node's side was always read. With the two steps before: on all 342 real systems the same JSON, and 56 % less processor time than the oracle.

- Pure, with no DOM and integer positions. The initial ranking is the longest path over the constraint graph, which must be acyclic, as a layered drawing's is; a cycle means the caller's column order and band rows disagree, and the solver says so rather than guess. A feasible spanning tree of tight edges is grown by shifting the tree to meet the nearest outside edge; then, while a tree edge has a negative cut value, the non-tree edge across its cut with the least slack enters and the head side shifts by that slack. Cut values are summed once from the rooted tree's postorder numbers and, since 2026-11-19, again after each exchange for the subtree it moved: an edge counts for its head and against its tail, and summed over a subtree the edges inside cancel, leaving those that cross its cut. The October 6 form used one pass over the edges and one over the tree per pivot, O(V+E). Since 2026-11-08 the immutable node balances are computed once per solve, leaving the per-pivot postorder/tree sums O(V). Until 2026-10-06 each tree edge's cut value was summed over every edge, O(V·E) a pivot, which was milliseconds on the first placed pictures and 19 seconds on the chain scope once directories became membranes of several segments; the one-pass form gives the same values, the same pivots and the same answers, in a tenth of a second ([Turn 6](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-6) of the October 6 session).
- Tested against enumeration on forty small random instances and on the shapes the placement uses: a chain at its separations, a wire whose two ends can meet, a card lowered to its partner, two wires that cannot both be straight, and determinism.
- Written on 2026-10-05 when the owner asked for the durable, correct, permanent implementation of the placement step ([Turn 13](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-05/2026-10-05.1.record.md#turn-13)): the exact optimum of the stated objective rather than a sweep that approximates it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Constraint` {#symbol-constraint}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/network-simplex.ts#L17)

##### `Constraint` — Summary
A difference constraint with its weight: λ(head) − λ(tail) ≥ δ, costing ω per unit of that difference.

#### `Ranking` {#symbol-ranking}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/network-simplex.ts#L27)

##### `Ranking` — Summary
The solution: a position for every node, the objective's value, and whether the search ended on an optimum.

#### `rankByNetworkSimplex` {#symbol-rankbynetworksimplex}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/network-simplex.ts#L38)
- Returns: [`Ranking`](#symbol-ranking)

##### `rankByNetworkSimplex` — Summary
Minimizes Σ ω·(λ(head) − λ(tail)) subject to λ(head) − λ(tail) ≥ δ for every
constraint, over `count` nodes numbered from zero, and returns positions
normalized so the least is zero. Nodes no constraint touches stay at zero.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
