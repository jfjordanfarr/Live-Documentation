# packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-localmapbuilder-ts
- Generated At: 2025-12-07T16:27:05.650Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:05.650Z","inputHash":"2d73e311ba24300d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts#L28)

##### `TestCoverageMap` — Summary
Test coverage map: node ID → array of test file IDs that cover it.

#### `buildLocalMapData` {#symbol-buildlocalmapdata}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts#L38)
- Returns: [`LocalMapData`](./localMapData.ts.mdmd.md#symbol-localmapdata)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../../../index.ts.mdmd.md#symbol-explorergraphpayload); `testCoverage`: [`TestCoverageMap`](../client/types.ts.mdmd.md#symbol-testcoveragemap); `options`: [`BuildLocalMapOptions`](./localMapData.ts.mdmd.md#symbol-buildlocalmapoptions)

##### `buildLocalMapData` — Summary
Build a LocalMapData object for the given focus node.

##### `buildLocalMapData` — Parameters
- `graphData`: The full explorer graph.
- `options`: Build options including the focus node ID.
- `testCoverage`: Map of node IDs to covering test IDs.

##### `buildLocalMapData` — Returns
Complete LocalMapData ready for rendering or serialization.

#### `buildTestCoverageMap` {#symbol-buildtestcoveragemap}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts#L387)
- Returns: [`TestCoverageMap`](../client/types.ts.mdmd.md#symbol-testcoveragemap)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../../../index.ts.mdmd.md#symbol-explorergraphpayload); `_unnamed_`: [`ExplorerLinkPayload`](../../../index.ts.mdmd.md#symbol-explorerlinkpayload)

##### `buildTestCoverageMap` — Summary
Build test coverage map from the graph.
This mirrors the client-side `buildTestCoverageMap` function.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`localMapData.BuildLocalMapOptions`](./localMapData.ts.mdmd.md#symbol-buildlocalmapoptions)
- [`localMapData.LOCAL_MAP_SCHEMA_VERSION`](./localMapData.ts.mdmd.md#symbol-local_map_schema_version)
- [`localMapData.LocalMapColumn`](./localMapData.ts.mdmd.md#symbol-localmapcolumn)
- [`localMapData.LocalMapData`](./localMapData.ts.mdmd.md#symbol-localmapdata)
- [`localMapData.LocalMapEdge`](./localMapData.ts.mdmd.md#symbol-localmapedge)
- [`localMapData.LocalMapNode`](./localMapData.ts.mdmd.md#symbol-localmapnode)
- [`localMapData.LocalMapStats`](./localMapData.ts.mdmd.md#symbol-localmapstats)
- [`localMapData.LocalMapSymbolAnchor`](./localMapData.ts.mdmd.md#symbol-localmapsymbolanchor)
- [`localMapData.buildNormalizedAnchorKey`](./localMapData.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`localMapData.normalizeSymbolIdentifier`](./localMapData.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](./types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](./types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
