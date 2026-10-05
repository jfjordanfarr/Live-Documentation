# packages/explorer/src/client/views/localView/branches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branches.ts
- Generated At: 2026-10-05T17:18:21.749Z

## Authored
### Purpose

Builds the Local Map’s independently disclosed graph and ranks its files from providers to consumers.

### Notes

Every edge between retained files remains present, including connections not directly requested by a pin. Relevant symbol sets separately identify which rows a compact neighbor must display; the same rows give each wire a height on its card for the ordering. Explicit pins survive category filters. Columns count backward from consumers so an independent provider need not skip an unrelated column merely because it has no dependencies of its own.

A cycle no longer shares a column. Its members stand in the provider-first order of Eades, Lin and Smyth, the references that read backward in that order are returned as `back`, and everything else ranks forward; the renderer draws a back reference as French Corset stubs with its route on hover, under the owner's words of 2026-10-05 that ugly design may produce ugly visualization and the picture must say what it hides. The ranking then hands its columns to `branch-order.ts`, which orders them and reserves the lanes.

The earlier linear hop-layout module originated in the [December 18, 2025 extraction](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-18.1.md). Its truncating path model and duplicate-card exploration renderer were retired in the [October 2, 2026 native-view pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-02.1.record.md#turn-11); explicit FROM/TO paths retain their own renderer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BranchGraph` {#symbol-branchgraph}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L10)

##### `BranchGraph` — Summary
A disclosed exploration, with every connection between its retained files.

#### `BranchRanking` {#symbol-branchranking}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L23)

##### `BranchRanking` — Summary
The ranking of retained files into columns, and the references the ranking reads backward.

#### `edgeKey` {#symbol-edgekey}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L29)
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `edgeKey` — Summary
One reference's identity: its two files, its two symbols and its kind.

#### `buildBranches` {#symbol-buildbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L38)
- Returns: [`BranchGraph`](#symbol-branchgraph)
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `graph`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `pins`: [`PinSet`](../pin-state.ts.mdmd.md#symbol-pinset); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `buildBranches` — Summary
Disclose the union of independent pins. Once both endpoints are present,
retain their relationship even when neither pin directly requested it.
Filters hide neighbors, but never the selected or explicitly pinned files.

#### `rankBranches` {#symbol-rankbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L130)
- Returns: [`BranchRanking`](#symbol-branchranking)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `links`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]

##### `rankBranches` — Summary
Rank providers before consumers, placing each as near its consumers as its
longest forward chain permits. A cycle is broken at the references that read
backward in a provider-first order of its members, so that every other
reference flows left to right; the broken ones are returned as `back`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-order.BranchOrder`](./branch-order.ts.mdmd.md#symbol-branchorder)
- [`branch-order.ForwardReference`](./branch-order.ts.mdmd.md#symbol-forwardreference)
- [`branch-order.orderBranches`](./branch-order.ts.mdmd.md#symbol-orderbranches)
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
