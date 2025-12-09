# packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-localmapbuilder-ts
- Generated At: 2025-12-07T20:49:32.809Z

## Authored
### Purpose
Headless computation layer for the Local Map view. Takes a full `ExplorerGraphPayload` and a focus node ID, then computes the 3-column subgraph (upstream dependencies → center artifact → downstream dependents) as a pure `LocalMapData` object. This enables both server-side JSON API responses and static export pre-computation without any DOM or rendering logic.

### Notes
- Created 2025-12-07 during the Static Explorer feature (LD-406) to separate data computation from visual rendering
- `buildLocalMapData()` is the primary entry point; powers `/local-map?nodeId=` API endpoint and static bundle pre-computation
- `buildSelfLoopEdges()` creates intra-file type reference edges for the "French Corset" wraparound bezier visualization
- `buildTestCoverageMap()` mirrors client-side logic to determine which test files cover which implementation files
- Symbol anchors are pre-computed so static renderers can route connection lines without querying the DOM

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T20:49:32.809Z","inputHash":"ff3f881c023751f9"}]} -->
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
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts#L445)
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
