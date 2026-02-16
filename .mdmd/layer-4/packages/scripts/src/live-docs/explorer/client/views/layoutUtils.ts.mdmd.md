# packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-layoututils-ts
- Generated At: 2026-02-16T18:46:22.346Z

## Authored
### Purpose
Shared layout utilities for the Circuit and Local Map views. Builds hierarchical folder trees from flat node lists and computes treemap-style rectangle layouts.

### Notes
- Created 2025-11-21 during the explorer modularisation; significantly enhanced 2025-11-24 with treemap layout algorithms.
- `buildHierarchy` groups nodes by directory path.
- `computeTreemapLayout` uses a squarified treemap algorithm to pack folders efficiently.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:22.346Z","inputHash":"3d622b048facdc33"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROOT_KEY` {#symbol-root_key}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L9)

##### `ROOT_KEY` — Summary
Sentinel key representing the virtual root directory in the layout tree.

#### `LayoutRect` {#symbol-layoutrect}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L31)

##### `LayoutRect` — Summary
Axis-aligned bounding rectangle used for layout placement.

#### `NodeLayoutPlan` {#symbol-nodelayoutplan}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L39)

##### `NodeLayoutPlan` — Summary
A single node positioned within a file area grid, with its computed scale factor.

#### `FileAreaLayoutPlan` {#symbol-filearealayoutplan}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L46)

##### `FileAreaLayoutPlan` — Summary
Layout geometry for the file-node grid within a directory.

#### `DirectoryLayoutPlan` {#symbol-directorylayoutplan}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L61)

##### `DirectoryLayoutPlan` — Summary
Recursive layout plan for a single directory in the Circuit Board treemap.

Collapsed single-child directories are folded into their parent, tracked
via {@link collapsedAncestors} so the breadcrumb display name remains
accurate (e.g. `"packages > shared > src"`).

#### `DirectoryLayoutResult` {#symbol-directorylayoutresult}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L75)

##### `DirectoryLayoutResult` — Summary
Top-level output of the directory layout algorithm — a root plan plus overall dimensions.

#### `LayoutConstants (interface)` {#symbol-layoutconstants-interface}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L96)

##### `LayoutConstants (interface)` — Summary
Exposed layout tuning constants for consumers that need to align calculations with the treemap grid.

#### `layoutConstants (const)` {#symbol-layoutconstants-const}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L153)
- Returns: [`LayoutConstants`](#symbol-layoutconstants-interface)

##### `layoutConstants (const)` — Summary
Singleton instance of the layout constants used by the Circuit Board view.

#### `buildHierarchy` {#symbol-buildhierarchy}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L168)
- Returns: [`DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]

##### `buildHierarchy` — Summary
Builds a directory tree from a flat list of explorer nodes, grouping
them by their `docRelativePath` segments. Nodes without a directory
prefix land at the root.

#### `getDirectoryKey` {#symbol-getdirectorykey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L196)
- Parameters: `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `getDirectoryKey` — Summary
Returns the directory key for a node by stripping the filename from `docRelativePath`.

#### `measureDirectoryTree` {#symbol-measuredirectorytree}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L210)
- Returns: `DirectoryMeasure`
- Parameters: `root`: [`DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode)

##### `measureDirectoryTree` — Summary
Recursively measures a directory tree, computing bounding-box dimensions
for each node using a flow-layout algorithm that targets a 4:3 aspect ratio.

Empty directories are pruned during measurement.

#### `computeDirectoryLayout` {#symbol-computedirectorylayout}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L258)
- Returns: [`DirectoryLayoutResult`](#symbol-directorylayoutresult)
- Parameters: `measure`: `DirectoryMeasure`

##### `computeDirectoryLayout` — Summary
Converts a measured directory tree into absolute layout coordinates.

Single-child directories are collapsed into their parent, placing the
root plan at the origin. Returns the total canvas width and height.

#### `findDominantDirectory` {#symbol-finddominantdirectory}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L582)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `nodes`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `_unnamed_`: [`ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)

##### `findDominantDirectory` — Summary
Identifies the directory with the highest aggregate link-degree score
among a set of nodes.

Used by the Circuit Board view to determine the initial viewport
position — centering on the most-connected directory cluster.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
