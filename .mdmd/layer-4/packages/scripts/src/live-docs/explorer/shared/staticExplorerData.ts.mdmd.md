# packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-staticexplorerdata-ts
- Generated At: 2025-12-09T01:54:26.964Z

## Authored
### Purpose
Schema definition for the Static Explorer JSON format, enabling zero-server distribution of the Live Documentation Explorer via GitHub Pages, Teams Cards, downloadable bundles, or any static hosting platform. Wraps `ExplorerGraphPayload` with provenance metadata, pre-computed symbol index, and viewer configuration hints.

### Notes
- Created 2025-12-07 during the Static Explorer feature (LD-406)
- `StaticExplorerProvenance` enables reproducibility: consumers can verify bundles match known commits and analyzer versions
- `StaticExplorerSymbolIndex` powers fast client-side fuzzy search, click-to-navigate from type references, and anchor resolution
- Viewer supports three loading modes: inline `<script>`, relative fetch, or remote URL (Teams Card scenario)
- `STATIC_EXPLORER_SCHEMA_VERSION` increments on breaking changes; viewers reject unknown schema versions

### File Structure

When distributed as files:
```
explorer/
  index.html          # Viewer HTML (can load from CDN or inline)
  explorer-data.json  # This schema
  assets/             # Optional: CSS, JS if not using CDN
```

### Embedding

The viewer supports three loading modes:
1. **Inline**: Data embedded as `<script id="explorer-data">` JSON
2. **Fetch**: Data loaded from `explorer-data.json` relative URL
3. **Remote**: Data loaded from configurable URL (Teams Card scenario)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:54:26.964Z","inputHash":"64974dc33e28bd3f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StaticExplorerProvenance` {#symbol-staticexplorerprovenance}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L52)

##### `StaticExplorerProvenance` — Summary
Provenance metadata for reproducibility and audit trails.

##### `StaticExplorerProvenance` — Remarks
Every static bundle includes provenance so consumers can:
- Verify the bundle matches a known commit
- Reproduce the analysis locally using the same analyzer version
- Trace discrepancies back to specific configurations

#### `StaticExplorerViewerConfig` {#symbol-staticexplorerviewerconfig}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L83)

##### `StaticExplorerViewerConfig` — Summary
Viewer configuration hints embedded in the bundle.

##### `StaticExplorerViewerConfig` — Remarks
Allows the static viewer to adapt to workspace-specific preferences
without requiring external configuration files.

#### `StaticExplorerSymbolEntry` {#symbol-staticexplorersymbolentry}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L110)

##### `StaticExplorerSymbolEntry` — Summary
An entry in the symbol index for fast client-side lookup.

#### `StaticExplorerSymbolIndex` {#symbol-staticexplorersymbolindex}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L136)

##### `StaticExplorerSymbolIndex` — Summary
Pre-computed symbol index for client-side search and navigation.

##### `StaticExplorerSymbolIndex` — Remarks
The index enables:
- Fast fuzzy search across all symbols without server roundtrips
- Click-to-navigate from type references in Local Map
- Anchor resolution for deep links

#### `StaticExplorerTreemapLayout` {#symbol-staticexplorertreemaplayout}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L158)

##### `StaticExplorerTreemapLayout` — Summary
Pre-computed treemap layout for Circuit Board view.

##### `StaticExplorerTreemapLayout` — Remarks
Optional optimization: if present, the client skips layout computation.
Useful for very large workspaces where client-side d3-treemap is slow.

#### `StaticExplorerTreemapNode` {#symbol-staticexplorertreemapnode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L170)

##### `StaticExplorerTreemapNode` — Summary
A node in the pre-computed treemap hierarchy.

#### `StaticExplorerData` {#symbol-staticexplorerdata}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L228)

##### `StaticExplorerData` — Summary
The complete Static Explorer data bundle.

##### `StaticExplorerData` — Remarks
This is the top-level schema for the JSON file emitted by
`npm run live-docs:visualize --static` or included in hosted showcase bundles.

**File Structure**

When distributed as files:
```
explorer/
  index.html          # Viewer HTML (can load from CDN or inline)
  explorer-data.json  # This schema
  assets/             # Optional: CSS, JS if not using CDN
```

**Embedding**

The viewer supports three loading modes:
1. **Inline**: Data embedded as `<script id="explorer-data">` JSON
2. **Fetch**: Data loaded from `explorer-data.json` relative URL
3. **Remote**: Data loaded from configurable URL (Teams Card scenario)

##### `StaticExplorerData` — Examples
```json
{
  "version": "1.0.0",
  "schemaVersion": 1,
  "provenance": { ... },
  "graph": { ... },
  "symbolIndex": { ... },
  "viewerConfig": { ... }
}
```

#### `StaticExplorerBuildOptions` {#symbol-staticexplorerbuildoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L287)

##### `StaticExplorerBuildOptions` — Summary
Options for building a static explorer bundle.

#### `buildSymbolIndex` {#symbol-buildsymbolindex}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L307)
- Returns: [`StaticExplorerSymbolIndex`](#symbol-staticexplorersymbolindex)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../../index.ts.mdmd.md#symbol-explorernodepayload)[]

##### `buildSymbolIndex` — Summary
Build a symbol index from graph nodes.

##### `buildSymbolIndex` — Parameters
- `nodes`: The graph nodes to index.

##### `buildSymbolIndex` — Returns
A complete symbol index ready for client-side search.

#### `STATIC_EXPLORER_SCHEMA_VERSION` {#symbol-static_explorer_schema_version}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L389)

##### `STATIC_EXPLORER_SCHEMA_VERSION` — Summary
Current schema version. Increment on breaking changes.

#### `STATIC_EXPLORER_VERSION` {#symbol-static_explorer_version}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts#L394)

##### `STATIC_EXPLORER_VERSION` — Summary
Current bundle format version.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](./types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](./types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
<!-- LIVE-DOC:END Dependencies -->
