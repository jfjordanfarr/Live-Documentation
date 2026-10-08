# packages/explorer/src/client/views/layoutUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/layoutUtils.ts
- Generated At: 2026-10-08T16:03:28.303Z

## Authored
### Purpose
Shared layout utilities for the Circuit and Local Map views. Builds hierarchical folder trees from flat node lists and computes treemap-style rectangle layouts.

### Notes
- Created 2025-11-21 during the explorer modularisation; significantly enhanced 2025-11-24 with treemap layout algorithms.
- `buildHierarchy` groups nodes by directory path.
- `computeTreemapLayout` uses a squarified treemap algorithm to pack folders efficiently.
- `findDominantDirectory`, written for the Circuit Board's first viewport and never called, was deleted on 2026-10-08 in [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROOT_KEY` {#symbol-root_key}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L5)

##### `ROOT_KEY` — Summary
Sentinel key representing the virtual root directory in the layout tree.

#### `LayoutRect` {#symbol-layoutrect}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L27)

##### `LayoutRect` — Summary
Axis-aligned bounding rectangle used for layout placement.

#### `NodeLayoutPlan` {#symbol-nodelayoutplan}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L35)

##### `NodeLayoutPlan` — Summary
A single node positioned within a file area grid, with its computed scale factor.

#### `FileAreaLayoutPlan` {#symbol-filearealayoutplan}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L42)

##### `FileAreaLayoutPlan` — Summary
Layout geometry for the file-node grid within a directory.

#### `DirectoryLayoutPlan` {#symbol-directorylayoutplan}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L57)

##### `DirectoryLayoutPlan` — Summary
Recursive layout plan for a single directory in the Circuit Board treemap.

Collapsed single-child directories are folded into their parent, tracked
via {@link collapsedAncestors} so the breadcrumb display name remains
accurate (e.g. `"packages > shared > src"`).

#### `DirectoryLayoutResult` {#symbol-directorylayoutresult}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L71)

##### `DirectoryLayoutResult` — Summary
Top-level output of the directory layout algorithm — a root plan plus overall dimensions.

#### `LayoutConstants (interface)` {#symbol-layoutconstants-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L92)

##### `LayoutConstants (interface)` — Summary
Exposed layout tuning constants for consumers that need to align calculations with the treemap grid.

#### `layoutConstants (const)` {#symbol-layoutconstants-const}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L149)
- Returns: [`LayoutConstants`](#symbol-layoutconstants-interface)

##### `layoutConstants (const)` — Summary
Singleton instance of the layout constants used by the Circuit Board view.

#### `buildHierarchy` {#symbol-buildhierarchy}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L164)
- Returns: [`DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]

##### `buildHierarchy` — Summary
Builds a directory tree from a flat list of explorer nodes, grouping
them by their source-relative path (`node.id`). Nodes without a
directory prefix land at the root.

#### `getDirectoryKey` {#symbol-getdirectorykey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L192)
- Parameters: `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `getDirectoryKey` — Summary
Returns the directory key for a node by stripping the filename from `node.id`.

#### `measureDirectoryTree` {#symbol-measuredirectorytree}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L206)
- Returns: `DirectoryMeasure`
- Parameters: `root`: [`DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode)

##### `measureDirectoryTree` — Summary
Recursively measures a directory tree, computing bounding-box dimensions
for each node using a flow-layout algorithm that targets a 4:3 aspect ratio.

Empty directories are pruned during measurement.

#### `computeDirectoryLayout` {#symbol-computedirectorylayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/layoutUtils.ts#L254)
- Returns: [`DirectoryLayoutResult`](#symbol-directorylayoutresult)
- Parameters: `measure`: `DirectoryMeasure`

##### `computeDirectoryLayout` — Summary
Converts a measured directory tree into absolute layout coordinates.

Single-child directories are collapsed into their parent, placing the
root plan at the origin. Returns the total canvas width and height.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
