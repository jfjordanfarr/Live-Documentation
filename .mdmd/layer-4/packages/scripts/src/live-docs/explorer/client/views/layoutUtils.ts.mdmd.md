# packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-layoututils-ts
- Generated At: 2025-12-19T04:50:47.341Z

## Authored
### Purpose
Shared layout utilities for the Circuit and Local Map views. Builds hierarchical folder trees from flat node lists and computes treemap-style rectangle layouts.

### Notes
- Created 2025-11-21 during the explorer modularisation; significantly enhanced 2025-11-24 with treemap layout algorithms.
- `buildHierarchy` groups nodes by directory path.
- `computeTreemapLayout` uses a squarified treemap algorithm to pack folders efficiently.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T04:50:47.341Z","inputHash":"9e4a4b476f4780c4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROOT_KEY` {#symbol-root_key}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L8)

#### `LayoutRect` {#symbol-layoutrect}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L29)

#### `NodeLayoutPlan` {#symbol-nodelayoutplan}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L36)

#### `FileAreaLayoutPlan` {#symbol-filearealayoutplan}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L42)

#### `DirectoryLayoutPlan` {#symbol-directorylayoutplan}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L50)

#### `DirectoryLayoutResult` {#symbol-directorylayoutresult}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L63)

#### `LayoutConstants (interface)` {#symbol-layoutconstants-interface}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L83)

#### `layoutConstants (const)` {#symbol-layoutconstants-const}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L139)
- Returns: [`LayoutConstants`](#symbol-layoutconstants-interface)

#### `buildHierarchy` {#symbol-buildhierarchy}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L149)
- Returns: [`DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]

#### `getDirectoryKey` {#symbol-getdirectorykey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L176)
- Parameters: `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

#### `measureDirectoryTree` {#symbol-measuredirectorytree}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L184)
- Returns: `DirectoryMeasure`
- Parameters: `root`: [`DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode)

#### `computeDirectoryLayout` {#symbol-computedirectorylayout}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L226)
- Returns: [`DirectoryLayoutResult`](#symbol-directorylayoutresult)
- Parameters: `measure`: `DirectoryMeasure`

#### `findDominantDirectory` {#symbol-finddominantdirectory}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L543)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `nodes`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `_unnamed_`: [`ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
