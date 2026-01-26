# packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-connections-ts
- Generated At: 2026-01-26T20:59:57.351Z

## Authored
### Purpose
SVG connection drawing for the Local Map. Draws Bézier splines between anchor points in the inbound/center/outbound columns.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 during localView modularisation.
- `drawConnections` iterates over edges and maps symbol keys to registered anchors.
- Uses the `BezierTuning` parameters from `ExplorerState` for curve aesthetics.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-26T20:59:57.351Z","inputHash":"a2a24ec1656225d6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MultiHopEntry` {#symbol-multihopentry}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts#L11)

##### `MultiHopEntry` — Summary
Represents a hop in the multi-hop visualization chain.
Each hop has a center node and its associated subgraph.

#### `ConnectionsContext` {#symbol-connectionscontext}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts#L20)

#### `drawConnections` {#symbol-drawconnections}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts#L66)
- Parameters: `context`: [`ConnectionsContext`](#symbol-connectionscontext)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents) (type-only)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pan-zoom.test.ts](./pan-zoom.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
