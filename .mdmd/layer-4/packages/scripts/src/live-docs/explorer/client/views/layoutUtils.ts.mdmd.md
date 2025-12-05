# packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-layoututils-ts
- Generated At: 2025-12-05T04:16:17.373Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.373Z","inputHash":"9e4a4b476f4780c4"}]} -->
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
- Returns: `LayoutConstants`

#### `buildHierarchy` {#symbol-buildhierarchy}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L149)
- Returns: `DirectoryNode`
- Parameters: `nodes`: `ExplorerNodePayload`[]

#### `getDirectoryKey` {#symbol-getdirectorykey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L176)
- Parameters: `node`: `ExplorerNodePayload`

#### `measureDirectoryTree` {#symbol-measuredirectorytree}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L184)
- Returns: `DirectoryMeasure`
- Parameters: `root`: `DirectoryNode`

#### `computeDirectoryLayout` {#symbol-computedirectorylayout}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L226)
- Returns: `DirectoryLayoutResult`
- Parameters: `measure`: `DirectoryMeasure`

#### `findDominantDirectory` {#symbol-finddominantdirectory}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts#L543)
- Parameters: `graphData`: `ExplorerGraphPayload`; `nodes`: `ExplorerNodePayload`[]; `_unnamed_`: `ExplorerLinkPayload`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
