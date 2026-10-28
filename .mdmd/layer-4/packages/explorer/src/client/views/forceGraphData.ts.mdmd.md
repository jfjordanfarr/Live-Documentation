# packages/explorer/src/client/views/forceGraphData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphData.ts
- Generated At: 2026-10-28T17:02:16.275Z

## Authored
### Purpose
Builds the spatial graph both the 3D renderer and the headless spatial report share: the counted file pairs, the related-documentation overlay and, in the structure layout, the declared tree of directory hubs.

### Notes
Filtering happens before file-pair aggregation. The caller supplies the same selected/pinned-file exceptions in either environment. Authored documentation citations remain separate from source relationships; Live Doc aliases do not become duplicate overlay nodes. Returned nodes and links are fresh containers so the force engine can add positions without modifying canonical data.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

In the structure layout (2026-10-14) every filtered file and related document hangs from its directory's hub and every hub from its parent's, up to the scan root, by one containment link each; a hub holding nothing but one child hub collapses into it, named by the chain, as the 2D bands collapse such chains, and the scan root stands whatever it holds. A hub carries the public-symbol counts of everything below it, so that its volume can be the sum of its members' volumes, and counts its visible source files for its label; it has no invented public symbols. Containment is a separate relationship kind, never added to code-reference multiplicity; the reference pairs stay in the data in either layout so that the renderer can draw them on demand, and the layout decides which kind pulls. Hubs were first built inside the connectivity layout for [the October 14 request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs), as ordinary spatial nodes and hover hubs rather than enclosing volumes; they produced an influence there but not the organizing effect the owner predicted, and the separate layout is [their choice of the same day](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4).

A hub's members' counts are read by `symbolCountOf` (2026-10-18, the plan's C4), so that a hub of a past step is the sum of its members' volumes as today's is.
The names the spheres' labels show, `labelNamesOf` (2026-10-28), live here rather than in the renderer because [the T3 diagnosis of 2026-10-27](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-27.1.SUMMARIZED.md#turn-6) found the renderer's own loop, which asked every file about every other for each name and each path ending, taking seventeen seconds over the T3 bundle's 21,720 files before any picture ([the probe record](../../../../../../../AI-Agent-Workspace/Probes/2026-10-27/t3-code/3d-startup.md)). The names and every path ending are counted once, and the same labels come in a tenth of a second; the test compares the two over a crowd of repeated names.
A document's citation of a file (2026-10-22, [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)) is a link of its own kind, `cited-by`, drawn from the document to the file, where a file's citation of a document (`related-doc`) runs from the file; the two are counted apart even between one pair, since `fileConnections` would fold them into one undirected pair as it folds references, so the document links are counted here by kind and orientation and added after it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialGraphNode` {#symbol-spatialgraphnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L9)
- Extends: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `SpatialGraphNode` — Summary
A source file, a related document or, in the structure layout, a directory hub derived from their paths.

#### `SpatialLinkKind` {#symbol-spatiallinkkind}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L21)
- Returns: [`ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind)

##### `SpatialLinkKind` — Summary
Containment is distinct from a documented reference and never contributes to coupling counts; a document's citation
of a file (`cited-by`) is told from a file's citation of a document (`related-doc`).

#### `directoryNodeId` {#symbol-directorynodeid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L24)

##### `directoryNodeId` — Summary
Stable directory identity outside the source-file namespace.

#### `SpatialGraphData` {#symbol-spatialgraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L27)

##### `SpatialGraphData` — Summary
A filtered, counted spatial graph, before the simulation adds positions.

#### `spatialGraphOf` {#symbol-spatialgraphof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L42)
- Returns: [`SpatialGraphData`](#symbol-spatialgraphdata)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `spatialGraphOf` — Summary
Build the spatial graph the 3D page and the headless command share: the filtered files with their counted reference
pairs and, with the documentation overlay, the related documents. A document a file cites is drawn from the file to
the document (`related-doc`); a document that cites the file is drawn from the document to the file (`cited-by`,
2026-10-22), so that the line's direction is the citation's, and the two are counted apart even between one pair. In
the structure layout (2026-10-14) every file and document also hangs from its directory's hub and every hub from its
parent's, up to the scan root, by one containment link each; the reference pairs stay in the data so that they can be
drawn on demand, and which links pull is the layout's to say. A hub that holds nothing but one child hub collapses
into it, as the 2D bands collapse such chains; the scan root stands whatever it holds.

#### `LabelledNode` {#symbol-labellednode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L146)

##### `LabelledNode` — Summary
What a sphere's label reads of its node: a hub's directory, a file's name and path.

#### `labelNamesOf` {#symbol-labelnamesof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphData.ts#L154)

##### `labelNamesOf` — Summary
The name each sphere's label shows, by node id: a directory hub its path, the scan root "Scan root"; a file its name,
or, when another node in the picture has that name, the shortest ending of its path that no other node's path ends
with, up to its whole path. The names and every path ending are counted once, so that naming the T3 bundle's 21,720
files costs a tenth of a second where asking every file about every other cost seventeen (measured 2026-10-27).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection)
- [`fileConnections`](./fileConnections.ts.mdmd.md#symbol-fileconnections)
- [`forceGraphLayout.symbolCountOf`](./forceGraphLayout.ts.mdmd.md#symbol-symbolcountof)
- [`directory-bands.parentDirectory`](./localView/directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
