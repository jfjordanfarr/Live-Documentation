# packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-connections-ts
- Generated At: 2025-12-06T13:36:26.699Z

## Authored
### Purpose
SVG connection drawing for the Local Map. Draws Bézier splines between anchor points in the inbound/center/outbound columns.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 during localView modularisation.
- `drawConnections` iterates over edges and maps symbol keys to registered anchors.
- Uses the `BezierTuning` parameters from `ExplorerState` for curve aesthetics.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T13:36:26.699Z","inputHash":"bc28cba469963f31"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConnectionsContext` {#symbol-connectionscontext}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts#L5)

#### `drawConnections` {#symbol-drawconnections}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts#L26)
- Parameters: `context`: `ConnectionsContext`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents) (type-only)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
<!-- LIVE-DOC:END Dependencies -->
