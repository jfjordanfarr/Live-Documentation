# packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-staticbuilder-ts
- Generated At: 2025-12-07T21:41:17.258Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:17.258Z","inputHash":"12b550d2b6c79947"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BuildStaticExplorerOptions` {#symbol-buildstaticexploreroptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L53)

#### `BuildStaticExplorerResult` {#symbol-buildstaticexplorerresult}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L79)

#### `buildStaticExplorer` {#symbol-buildstaticexplorer}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L106)
- Parameters: `options`: [`BuildStaticExplorerOptions`](#symbol-buildstaticexploreroptions)

##### `buildStaticExplorer` — Summary
Build a complete static explorer bundle.

#### `buildLocalMapJson` {#symbol-buildlocalmapjson}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L257)

##### `buildLocalMapJson` — Summary
Build a single Local Map JSON for a focus node.
This is the headless API that LLMs and scripts can consume.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises` - `fs`
- [`localMapBuilder.buildLocalMapData`](./localMapBuilder.ts.mdmd.md#symbol-buildlocalmapdata)
- [`localMapBuilder.buildTestCoverageMap`](./localMapBuilder.ts.mdmd.md#symbol-buildtestcoveragemap)
- [`localMapData.LocalMapData`](./localMapData.ts.mdmd.md#symbol-localmapdata) (type-only)
- [`staticExplorerData.STATIC_EXPLORER_SCHEMA_VERSION`](./staticExplorerData.ts.mdmd.md#symbol-static_explorer_schema_version)
- [`staticExplorerData.STATIC_EXPLORER_VERSION`](./staticExplorerData.ts.mdmd.md#symbol-static_explorer_version)
- [`staticExplorerData.StaticExplorerBuildOptions`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerbuildoptions)
- [`staticExplorerData.StaticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata)
- [`staticExplorerData.StaticExplorerProvenance`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerprovenance)
- [`staticExplorerData.buildSymbolIndex`](./staticExplorerData.ts.mdmd.md#symbol-buildsymbolindex)
- [`types.ExplorerLinkPayload`](./types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- `path` - `path`
<!-- LIVE-DOC:END Dependencies -->
