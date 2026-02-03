# packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-staticbuilder-ts
- Generated At: 2026-02-03T21:55:37.142Z

## Authored
### Purpose
Core builder module for creating fully static Live Documentation Explorer bundles. Produces a self-contained `dist/explorer/` package with HTML viewer, graph JSON, symbol index, and pre-computed Local Maps that can be deployed to GitHub Pages or embedded in documentation portals without a running server.

### Notes
- Created 2025-12-07 as part of the Static Explorer feature (LD-406)
- Exposes two public APIs: `buildStaticExplorer()` for full bundles and `buildLocalMapJson()` for headless single-node queries
- Uses lazy imports to avoid circular dependencies with server modules
- Transforms the server HTML template into a static viewer that loads `explorer-data.json`
- Pre-computed Local Maps enable offline symbol-level navigation for configured focus nodes

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.142Z","inputHash":"06b9473eb58ef195"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BuildStaticExplorerOptions` {#symbol-buildstaticexploreroptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L56)

#### `BuildStaticExplorerResult` {#symbol-buildstaticexplorerresult}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L85)

#### `buildStaticExplorer` {#symbol-buildstaticexplorer}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L112)
- Parameters: `options`: [`BuildStaticExplorerOptions`](#symbol-buildstaticexploreroptions)

##### `buildStaticExplorer` — Summary
Build a complete static explorer bundle.

#### `buildLocalMapJson` {#symbol-buildlocalmapjson}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts#L281)

##### `buildLocalMapJson` — Summary
Build a single Local Map JSON for a focus node.
This is the headless API that LLMs and scripts can consume.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- [`bundledMarkdownScanner.scanAndBundleMarkdown`](./bundledMarkdownScanner.ts.mdmd.md#symbol-scanandbundlemarkdown)
- [`localMapBuilder.buildLocalMapData`](./localMapBuilder.ts.mdmd.md#symbol-buildlocalmapdata)
- [`localMapBuilder.buildTestCoverageMap`](./localMapBuilder.ts.mdmd.md#symbol-buildtestcoveragemap)
- [`LocalMapData`](./localMapData.ts.mdmd.md#symbol-localmapdata) (type-only)
- [`staticExplorerData.STATIC_EXPLORER_SCHEMA_VERSION`](./staticExplorerData.ts.mdmd.md#symbol-static_explorer_schema_version)
- [`staticExplorerData.STATIC_EXPLORER_VERSION`](./staticExplorerData.ts.mdmd.md#symbol-static_explorer_version)
- [`staticExplorerData.StaticExplorerBuildOptions`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerbuildoptions)
- [`StaticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata)
- [`staticExplorerData.StaticExplorerProvenance`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerprovenance)
- [`staticExplorerData.buildSymbolIndex`](./staticExplorerData.ts.mdmd.md#symbol-buildsymbolindex)
- [`types.ExplorerLinkPayload`](./types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->
