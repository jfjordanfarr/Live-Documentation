# packages/explorer/src/client/views/localView/network-simplex.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/network-simplex.ts
- Generated At: 2026-10-05T22:17:15.188Z

## Authored
### Purpose

The exact solver behind the Local Map's placement: a linear program whose constraints are differences between nodes, λ(head) − λ(tail) ≥ δ, and whose objective is the weighted sum of those differences. It is the ranking problem of Gansner, Koutsofios, North and Vo ("A technique for drawing directed graphs", IEEE Transactions on Software Engineering, 1993), solved as they solve it, by the network simplex method, which Graphviz has run since.

### Notes

- Pure, with no DOM and integer positions. The initial ranking is the longest path over the constraint graph, which must be acyclic, as a layered drawing's is; a cycle means the caller's column order and band rows disagree, and the solver says so rather than guess. A feasible spanning tree of tight edges is grown by shifting the tree to meet the nearest outside edge; then, while a tree edge has a negative cut value, the non-tree edge across its cut with the least slack enters and the head side shifts by that slack. Cut values are recomputed from the rooted tree's postorder numbers after every exchange, in O(V·E), which is a few milliseconds at the sizes a retained exploration reaches.
- Tested against enumeration on forty small random instances and on the shapes the placement uses: a chain at its separations, a wire whose two ends can meet, a card lowered to its partner, two wires that cannot both be straight, and determinism.
- Written on 2026-10-05 when the owner asked for the durable, correct, permanent implementation of the placement step ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-13)): the exact optimum of the stated objective rather than a sweep that approximates it.

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
