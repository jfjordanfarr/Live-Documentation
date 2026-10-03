# packages/explorer/src/client/views/localView/branches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branches.ts
- Generated At: 2026-10-03T18:02:22.326Z

## Authored
### Purpose

Builds the Local Map’s independently disclosed graph and ranks its files from providers to consumers.

### Notes

Every edge between retained files remains present, including connections not directly requested by a pin. Relevant symbol sets separately identify which rows a compact neighbor must display. Cyclic components share a column; explicit pins survive category filters. Columns count backward from consumers so an independent provider need not skip an unrelated column merely because it has no dependencies of its own.

The earlier linear hop-layout module originated in the [December 18, 2025 extraction](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-18.1.md). Its truncating path model and duplicate-card exploration renderer were retired in the [October 2, 2026 native-view pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-02.1.record.md#turn-11); explicit FROM/TO paths retain their own renderer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BranchGraph` {#symbol-branchgraph}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L8)

##### `BranchGraph` — Summary
A disclosed exploration, with every connection between its retained files.

#### `buildBranches` {#symbol-buildbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L20)
- Returns: [`BranchGraph`](#symbol-branchgraph)
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `graph`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `pins`: [`PinSet`](../pin-state.ts.mdmd.md#symbol-pinset); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `buildBranches` — Summary
Disclose the union of independent pins. Once both endpoints are present,
retain their relationship even when neither pin directly requested it.
Filters hide neighbors, but never the selected or explicitly pinned files.

#### `rankBranches` {#symbol-rankbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L79)
- Returns: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]
- Parameters: `nodes`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `links`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]

##### `rankBranches` — Summary
Rank providers before consumers, placing each as near its consumers as
its longest downstream chain permits. Strongly connected components share
a column, so cycles terminate without dropping edges or duplicating files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`subgraph-builder.buildSelfLoopEdges`](./subgraph-builder.ts.mdmd.md#symbol-buildselfloopedges)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`pin-state.PinSet`](../pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.getVisibleConnections`](../pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
