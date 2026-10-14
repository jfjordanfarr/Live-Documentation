# packages/explorer/src/client/views/forceGraphData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphData.ts
- Generated At: 2026-10-14T02:49:18.918Z

## Authored
### Purpose
Builds the counted file graph, optional directory membership and related-documentation overlay used by both the 3D renderer and the headless spatial report.

### Notes
Filtering happens before file-pair aggregation. The caller supplies the same selected/pinned-file exceptions in either environment. Authored documentation citations remain separate from source relationships; Live Doc aliases do not become duplicate overlay nodes. Returned nodes and links are fresh containers so the force engine can add positions without modifying canonical data.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Optional directory hubs come only from filtered source paths. Each file and non-root directory has one immediate-parent containment link; related documents do not create source directories. Containment is a separate relationship kind, never added to code-reference multiplicity. Directory counts describe visible source files across the subtree, and directory bodies have no invented public symbols. The [October 14 request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs) specified ordinary spatial nodes and hover hubs instead of enclosing volumes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialGraphNode` {#symbol-spatialgraphnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L7)
- Extends: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `SpatialGraphNode` — Summary
A source file, related document, or optional directory derived from source paths.

#### `SpatialLinkKind` {#symbol-spatiallinkkind}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L14)
- Returns: [`ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind)

##### `SpatialLinkKind` — Summary
Containment is distinct from a documented reference and never contributes to coupling counts.

#### `directoryNodeId` {#symbol-directorynodeid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L17)

##### `directoryNodeId` — Summary
Stable directory identity outside the source-file namespace.

#### `SpatialGraphData` {#symbol-spatialgraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L20)

##### `SpatialGraphData` — Summary
A filtered, counted spatial graph, before the simulation adds positions.

#### `spatialGraphOf` {#symbol-spatialgraphof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L26)
- Returns: [`SpatialGraphData`](#symbol-spatialgraphdata)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `spatialGraphOf` — Summary
Build the same file pairs and optional documentation overlay for the 3D page and headless command.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection)
- [`fileConnections`](./fileConnections.ts.mdmd.md#symbol-fileconnections)
- [`directory-bands.parentDirectory`](./localView/directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
