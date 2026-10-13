# packages/explorer/src/client/views/forceGraphData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphData.ts
- Generated At: 2026-10-13T19:38:16.133Z

## Authored
### Purpose
Builds the counted file graph and optional related-documentation overlay used by both the 3D renderer and the headless spatial report.

### Notes
Filtering happens before file-pair aggregation. The caller supplies the same selected/pinned-file exceptions in either environment. Authored documentation citations remain separate from source relationships; Live Doc aliases do not become duplicate overlay nodes. Returned nodes and links are fresh containers so the force engine can add positions without modifying canonical data.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialGraphData` {#symbol-spatialgraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L6)

##### `SpatialGraphData` — Summary
A filtered, counted spatial graph, before the simulation adds positions.

#### `spatialGraphOf` {#symbol-spatialgraphof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L12)
- Returns: [`SpatialGraphData`](#symbol-spatialgraphdata)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `spatialGraphOf` — Summary
Build the same file pairs and optional documentation overlay for the 3D page and headless command.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection)
- [`fileConnections`](./fileConnections.ts.mdmd.md#symbol-fileconnections)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
