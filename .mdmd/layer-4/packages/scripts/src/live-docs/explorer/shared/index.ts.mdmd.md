# packages/scripts/src/live-docs/explorer/shared/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-index-ts
- Generated At: 2026-02-03T21:55:37.063Z

## Authored
### Purpose
Barrel export for the Explorer shared module. Re-exports types, Local Map builder, and Static Explorer data utilities used by both server and client.

### Notes
- Created 2025-12-07 as part of the Static Explorer implementation (LD-402)
- Groups core types, Local Map (headless JSON), and Static Explorer APIs
- Shared by server (HTTP endpoints) and client (browser rendering)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.063Z","inputHash":"143f1b742a3768b1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`localMapBuilder`](./localMapBuilder.ts.mdmd.md) (re-export)
- [`localMapData`](./localMapData.ts.mdmd.md) (re-export)
- [`staticBuilder`](./staticBuilder.ts.mdmd.md) (re-export)
- [`staticExplorerData`](./staticExplorerData.ts.mdmd.md) (re-export)
- [`types`](./types.ts.mdmd.md) (re-export)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Re-Exported Symbol Anchors -->
### Re-Exported Symbol Anchors
#### `buildLocalMapData` {#symbol-buildlocalmapdata}
- Re-exported from [`localMapBuilder`](./localMapBuilder.ts.mdmd.md#symbol-buildlocalmapdata)

#### `buildLocalMapJson` {#symbol-buildlocalmapjson}
- Re-exported from [`staticBuilder`](./staticBuilder.ts.mdmd.md#symbol-buildlocalmapjson)

#### `BuildLocalMapOptions` {#symbol-buildlocalmapoptions}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-buildlocalmapoptions)

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-buildnormalizedanchorkey)

#### `buildStaticExplorer` {#symbol-buildstaticexplorer}
- Re-exported from [`staticBuilder`](./staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)

#### `BuildStaticExplorerOptions` {#symbol-buildstaticexploreroptions}
- Re-exported from [`staticBuilder`](./staticBuilder.ts.mdmd.md#symbol-buildstaticexploreroptions)

#### `BuildStaticExplorerResult` {#symbol-buildstaticexplorerresult}
- Re-exported from [`staticBuilder`](./staticBuilder.ts.mdmd.md#symbol-buildstaticexplorerresult)

#### `buildSymbolIndex` {#symbol-buildsymbolindex}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-buildsymbolindex)

#### `buildTestCoverageMap` {#symbol-buildtestcoveragemap}
- Re-exported from [`localMapBuilder`](./localMapBuilder.ts.mdmd.md#symbol-buildtestcoveragemap)

#### `BundledMarkdownTreeNode` {#symbol-bundledmarkdowntreenode}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

#### `ExplorerDependencyReference` {#symbol-explorerdependencyreference}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorerdependencyreference)

#### `ExplorerDetailPayload` {#symbol-explorerdetailpayload}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorerdetailpayload)

#### `ExplorerGraphPayload` {#symbol-explorergraphpayload}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorergraphpayload)

#### `ExplorerGraphStats` {#symbol-explorergraphstats}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorergraphstats)

#### `ExplorerLinkKind` {#symbol-explorerlinkkind}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorerlinkkind)

#### `ExplorerLinkPayload` {#symbol-explorerlinkpayload}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorerlinkpayload)

#### `ExplorerNodePayload` {#symbol-explorernodepayload}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorernodepayload)

#### `ExplorerPublicSymbol` {#symbol-explorerpublicsymbol}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorerpublicsymbol)

#### `ExplorerTypeReference` {#symbol-explorertypereference}
- Re-exported from [`types`](./types.ts.mdmd.md#symbol-explorertypereference)

#### `LOCAL_MAP_SCHEMA_VERSION` {#symbol-local_map_schema_version}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-local_map_schema_version)

#### `LocalMapColumn` {#symbol-localmapcolumn}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapcolumn)

#### `LocalMapData` {#symbol-localmapdata}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapdata)

#### `LocalMapEdge` {#symbol-localmapedge}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapedge)

#### `LocalMapMetadata` {#symbol-localmapmetadata}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapmetadata)

#### `LocalMapNode` {#symbol-localmapnode}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapnode)

#### `LocalMapStats` {#symbol-localmapstats}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapstats)

#### `LocalMapSymbolAnchor` {#symbol-localmapsymbolanchor}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-localmapsymbolanchor)

#### `normalizeSymbolIdentifier` {#symbol-normalizesymbolidentifier}
- Re-exported from [`localMapData`](./localMapData.ts.mdmd.md#symbol-normalizesymbolidentifier)

#### `RelatedDocLink` {#symbol-relateddoclink}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-relateddoclink)

#### `STATIC_EXPLORER_SCHEMA_VERSION` {#symbol-static_explorer_schema_version}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-static_explorer_schema_version)

#### `STATIC_EXPLORER_VERSION` {#symbol-static_explorer_version}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-static_explorer_version)

#### `StaticExplorerBuildOptions` {#symbol-staticexplorerbuildoptions}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerbuildoptions)

#### `StaticExplorerData` {#symbol-staticexplorerdata}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata)

#### `StaticExplorerProvenance` {#symbol-staticexplorerprovenance}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerprovenance)

#### `StaticExplorerSymbolEntry` {#symbol-staticexplorersymbolentry}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorersymbolentry)

#### `StaticExplorerSymbolIndex` {#symbol-staticexplorersymbolindex}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorersymbolindex)

#### `StaticExplorerTreemapLayout` {#symbol-staticexplorertreemaplayout}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorertreemaplayout)

#### `StaticExplorerTreemapNode` {#symbol-staticexplorertreemapnode}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorertreemapnode)

#### `StaticExplorerViewerConfig` {#symbol-staticexplorerviewerconfig}
- Re-exported from [`staticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerviewerconfig)

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Re-exported from [`localMapBuilder`](./localMapBuilder.ts.mdmd.md#symbol-testcoveragemap)
<!-- LIVE-DOC:END Re-Exported Symbol Anchors -->
