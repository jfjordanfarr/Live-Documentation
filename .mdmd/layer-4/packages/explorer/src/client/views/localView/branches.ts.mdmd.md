# packages/explorer/src/client/views/localView/branches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branches.ts
- Generated At: 2026-10-06T23:02:44.774Z

## Authored
### Purpose

Builds the Local Map’s independently disclosed graph and ranks its files from providers to consumers.

### Notes

Every edge between retained files remains present, including connections not directly requested by a pin. Relevant symbol sets separately identify which rows a compact neighbor must display; the same rows give each wire a height on its card for the ordering. Explicit pins survive category filters. The columns are the exact minimum of the references' column spans, each pair of files weighing the references between them, found by the network simplex of `network-simplex.ts` as Gansner et al. rank a graph; a file that costs the same in several columns takes the one with the fewest cards, the rightmost among equals, every connected group of files ends at the last column, and so does a file no reference reaches. Until 2026-10-06 a column was longest-chain depth, every file as near its consumers as its longest forward chain allowed, which stood a leaf that used only the root at the far right, four lanes from it; the owner accepted the change of meaning ([Turn 7](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-7)). The ranking has two dials for the layout lab, carried in `RankingOptions`: a `pull` toward the last column, a column past every file toward which each is drawn by the pull's weight, so that zero is the span-minimal ranking and a weight above every pair's is the longest-chain ranking of before; and a `tie` rule for a file that costs the same in several columns: the fewest other cards (the default), the rightmost or the leftmost. `buildBranches` takes its dials as one `BranchOptions` object: the symbol order, the ranking's, and the order's sweeps and start. Since the restarts of 2026-10-06 the build is two steps a caller may take apart: `exploreBranches` discloses and ranks (an `Exploration`: the subgraph, the ranking, the hidden connections, the relevant symbols, and the order step's input but its start), and `orderExploration` orders it from one start (the ranking's order, a seed's shuffle, or a previous picture's columns), so that the renderer and the lab run the order step several times over one exploration; `buildBranches` runs both once.

A cycle no longer shares a column. Its members stand in the provider-first order of Eades, Lin and Smyth, the references that read backward in that order are returned as `back`, and everything else ranks forward; the renderer draws a back reference as French Corset laces with its route on hover, under the owner's words of 2026-10-05 that ugly design may produce ugly visualization and the picture must say what it hides. The ranking then hands its columns, each card's rows, the symbol order and each file's own references to `branch-order.ts`, which orders them and reserves the lanes; the own references break ties among rows whose wires lead alike. The symbol order is the owner's three strategies of 2026-10-05: the layout's own, where rows stand by their wires and only Internals keeps the foot of the card; alphabetical, which `compareSymbolNames` defines for every card; and the order of appearance, the Live Doc's.

The earlier linear hop-layout module originated in the [December 18, 2025 extraction](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-18.1.md). Its truncating path model and duplicate-card exploration renderer were retired in the [October 2, 2026 native-view pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-02.1.record.md#turn-11); explicit FROM/TO paths retain their own renderer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BranchGraph` {#symbol-branchgraph}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L12)

##### `BranchGraph` — Summary
A disclosed exploration, with every connection between its retained files.

#### `BranchRanking` {#symbol-branchranking}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L27)

##### `BranchRanking` — Summary
The ranking of retained files into columns, and the references the ranking reads backward.

#### `RankingOptions` {#symbol-rankingoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L33)

##### `RankingOptions` — Summary
The ranking's dials.

#### `OrderOptions` {#symbol-orderoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L45)

##### `OrderOptions` — Summary
Where the order step begins and how long it looks.

#### `BranchOptions` {#symbol-branchoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L55)

##### `BranchOptions` — Summary
The dials of the layout's first two steps.

#### `Exploration` {#symbol-exploration}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L66)

##### `Exploration` — Summary
A disclosed exploration before its order: the retained files and the references between them, ranked into columns,
with everything the order step takes but its start, so that the order step can be run from several starts.

#### `edgeKey` {#symbol-edgekey}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L76)
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `edgeKey` — Summary
One reference's identity: its two files, its two symbols and its kind.

#### `buildBranches` {#symbol-buildbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L92)
- Returns: [`BranchGraph`](#symbol-branchgraph)
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `graph`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `pins`: [`PinSet`](../pin-state.ts.mdmd.md#symbol-pinset); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `options`: [`BranchOptions`](#symbol-branchoptions)

##### `buildBranches` — Summary
Disclose the union of independent pins. Once both endpoints are present,
retain their relationship even when neither pin directly requested it.
Filters hide neighbors, but never the selected or explicitly pinned files.
The options set the layout's dials: the symbol order says how a card's rows
stand, by where their wires lead (the layout's choice), alphabetically, or as
the Live Doc lists them; the ranking's pull and tie rule and the order's
sweeps and start are the layout lab's levers. The exploration and its order
are two steps, `exploreBranches` and `orderExploration`, so that the order
step, the layout's one inexact step, can be run from several starts over
one exploration; this runs both once.

#### `exploreBranches` {#symbol-explorebranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L103)
- Returns: [`Exploration`](#symbol-exploration)
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `graph`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `pins`: [`PinSet`](../pin-state.ts.mdmd.md#symbol-pinset); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `exploreBranches` — Summary
The exploration's first two steps: the retained files and references disclosed, and the files ranked into columns.

#### `orderExploration` {#symbol-orderexploration}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L178)
- Returns: [`BranchGraph`](#symbol-branchgraph)
- Parameters: `exploration`: [`Exploration`](#symbol-exploration); `options`: [`OrderOptions`](#symbol-orderoptions)

##### `orderExploration` — Summary
The exploration's third step: its columns ordered from the given start, with the lanes and each card's rows the order chose.

#### `compareSymbolNames` {#symbol-comparesymbolnames}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L213)

##### `compareSymbolNames` — Summary
Alphabetical order of symbol names, case first set aside, then as the names compare.

#### `rankBranches` {#symbol-rankbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L229)
- Returns: [`BranchRanking`](#symbol-branchranking)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `links`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]; `options`: [`RankingOptions`](#symbol-rankingoptions)

##### `rankBranches` — Summary
Rank providers before consumers so that the references cross the fewest
columns in all: every forward reference costs the columns it spans, and the
columns are the exact minimum of that sum, found by the same network simplex
that places the cards (Gansner, Koutsofios, North and Vo, section 2). A file
that could stand in several columns at the same cost takes the one with the
fewest cards, the rightmost among equals; a file nothing retained uses
stands in the last column, and so does every file no reference reaches. A
cycle is broken at the references that read backward in a provider-first
order of its members, so that every other reference flows left to right;
the broken ones are returned as `back`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SymbolOrder`](../../types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`branch-order.BranchOrder`](./branch-order.ts.mdmd.md#symbol-branchorder)
- [`branch-order.ForwardReference`](./branch-order.ts.mdmd.md#symbol-forwardreference)
- [`branch-order.OrderInput`](./branch-order.ts.mdmd.md#symbol-orderinput)
- [`branch-order.orderBranches`](./branch-order.ts.mdmd.md#symbol-orderbranches)
- [`network-simplex.Constraint`](./network-simplex.ts.mdmd.md#symbol-constraint)
- [`network-simplex.rankByNetworkSimplex`](./network-simplex.ts.mdmd.md#symbol-rankbynetworksimplex)
- [`subgraph-builder.buildSelfLoopEdges`](./subgraph-builder.ts.mdmd.md#symbol-buildselfloopedges)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`pin-layout.parentDirectory`](../membraneView/pin-layout.ts.mdmd.md#symbol-parentdirectory)
- [`pin-state.PinSet`](../pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.getVisibleConnections`](../pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
