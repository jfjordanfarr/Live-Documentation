# packages/explorer/src/client/views/forceGraphData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphData.ts
- Generated At: 2026-10-14T16:02:17.789Z

## Authored
### Purpose
Builds the spatial graph both the 3D renderer and the headless spatial report share: the counted file pairs, the related-documentation overlay and, in the structure layout, the declared tree of directory hubs.

### Notes
Filtering happens before file-pair aggregation. The caller supplies the same selected/pinned-file exceptions in either environment. Authored documentation citations remain separate from source relationships; Live Doc aliases do not become duplicate overlay nodes. Returned nodes and links are fresh containers so the force engine can add positions without modifying canonical data.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

In the structure layout (2026-10-14) every filtered file and related document hangs from its directory's hub and every hub from its parent's, up to the scan root, by one containment link each; a hub holding nothing but one child hub collapses into it, named by the chain, as the 2D bands collapse such chains, and the scan root stands whatever it holds. A hub carries the public-symbol counts of everything below it, so that its volume can be the sum of its members' volumes, and counts its visible source files for its label; it has no invented public symbols. Containment is a separate relationship kind, never added to code-reference multiplicity; the reference pairs stay in the data in either layout so that the renderer can draw them on demand, and the layout decides which kind pulls. Hubs were first built inside the connectivity layout for [the October 14 request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs), as ordinary spatial nodes and hover hubs rather than enclosing volumes; they produced an influence there but not the organizing effect the owner predicted, and the separate layout is [their choice of the same day](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialGraphNode` {#symbol-spatialgraphnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L8)
- Extends: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `SpatialGraphNode` — Summary
A source file, a related document or, in the structure layout, a directory hub derived from their paths.

#### `SpatialLinkKind` {#symbol-spatiallinkkind}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L17)
- Returns: [`ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind)

##### `SpatialLinkKind` — Summary
Containment is distinct from a documented reference and never contributes to coupling counts.

#### `directoryNodeId` {#symbol-directorynodeid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L20)

##### `directoryNodeId` — Summary
Stable directory identity outside the source-file namespace.

#### `SpatialGraphData` {#symbol-spatialgraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L23)

##### `SpatialGraphData` — Summary
A filtered, counted spatial graph, before the simulation adds positions.

#### `spatialGraphOf` {#symbol-spatialgraphof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L36)
- Returns: [`SpatialGraphData`](#symbol-spatialgraphdata)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `spatialGraphOf` — Summary
Build the spatial graph the 3D page and the headless command share: the filtered files with their counted reference
pairs and, with the documentation overlay, the related documents. In the structure layout (2026-10-14) every file and
document also hangs from its directory's hub and every hub from its parent's, up to the scan root, by one containment
link each; the reference pairs stay in the data so that they can be drawn on demand, and which links pull is the
layout's to say. A hub that holds nothing but one child hub collapses into it, as the 2D bands collapse such chains;
the scan root stands whatever it holds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection)
- [`fileConnections`](./fileConnections.ts.mdmd.md#symbol-fileconnections)
- [`directory-bands.parentDirectory`](./localView/directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
