# packages/scripts/src/live-docs/explorer/shared/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-index-ts
- Generated At: 2025-12-07T16:27:05.639Z

## Authored
### Purpose
Barrel export for the Explorer shared module. Re-exports types, Local Map builder, and Static Explorer data utilities used by both server and client.

### Notes
- Created 2025-12-07 as part of the Static Explorer implementation (LD-402)
- Groups core types, Local Map (headless JSON), and Static Explorer APIs
- Shared by server (HTTP endpoints) and client (browser rendering)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:05.639Z","inputHash":"5f230b8ab3559c63"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerDependencyReference` {#symbol-explorerdependencyreference}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerDetailPayload` {#symbol-explorerdetailpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerGraphPayload` {#symbol-explorergraphpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerGraphStats` {#symbol-explorergraphstats}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerLinkKind` {#symbol-explorerlinkkind}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerLinkPayload` {#symbol-explorerlinkpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerNodePayload` {#symbol-explorernodepayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerPublicSymbol` {#symbol-explorerpublicsymbol}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `ExplorerTypeReference` {#symbol-explorertypereference}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L7)

#### `BuildLocalMapOptions` {#symbol-buildlocalmapoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LOCAL_MAP_SCHEMA_VERSION` {#symbol-local_map_schema_version}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapColumn` {#symbol-localmapcolumn}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapData` {#symbol-localmapdata}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapEdge` {#symbol-localmapedge}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapMetadata` {#symbol-localmapmetadata}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapNode` {#symbol-localmapnode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapStats` {#symbol-localmapstats}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `LocalMapSymbolAnchor` {#symbol-localmapsymbolanchor}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `normalizeSymbolIdentifier` {#symbol-normalizesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L10)

#### `buildLocalMapData` {#symbol-buildlocalmapdata}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L11)

#### `buildTestCoverageMap` {#symbol-buildtestcoveragemap}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L11)

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L11)

#### `buildSymbolIndex` {#symbol-buildsymbolindex}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `STATIC_EXPLORER_SCHEMA_VERSION` {#symbol-static_explorer_schema_version}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `STATIC_EXPLORER_VERSION` {#symbol-static_explorer_version}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerBuildOptions` {#symbol-staticexplorerbuildoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerData` {#symbol-staticexplorerdata}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerProvenance` {#symbol-staticexplorerprovenance}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerSymbolEntry` {#symbol-staticexplorersymbolentry}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerSymbolIndex` {#symbol-staticexplorersymbolindex}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerTreemapLayout` {#symbol-staticexplorertreemaplayout}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerTreemapNode` {#symbol-staticexplorertreemapnode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `StaticExplorerViewerConfig` {#symbol-staticexplorerviewerconfig}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L14)

#### `buildLocalMapJson` {#symbol-buildlocalmapjson}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L15)

#### `buildStaticExplorer` {#symbol-buildstaticexplorer}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L15)

#### `BuildStaticExplorerOptions` {#symbol-buildstaticexploreroptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L15)

#### `BuildStaticExplorerResult` {#symbol-buildstaticexplorerresult}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/index.ts#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`localMapBuilder`](./localMapBuilder.ts.mdmd.md) (re-export)
- [`localMapData`](./localMapData.ts.mdmd.md) (re-export)
- [`staticBuilder`](./staticBuilder.ts.mdmd.md) (re-export)
- [`staticExplorerData`](./staticExplorerData.ts.mdmd.md) (re-export)
- [`types`](./types.ts.mdmd.md) (re-export)
<!-- LIVE-DOC:END Dependencies -->
