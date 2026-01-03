# packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-runtime-ts
- Generated At: 2026-01-03T20:41:39.250Z

## Authored
### Purpose
Runtime state management for the Local Map. Maintains the anchor registry, drag positions, and references to core DOM elements.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 during the localView modularisation.
- `AnchorRegistry` maps composite keys (column:nodeId) to bounding rectangles.
- `LocalViewRuntime` bundles the registry, DOM refs, and drag state.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-03T20:41:39.250Z","inputHash":"f336bf8b6eb5a3c5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorRegistry` {#symbol-anchorregistry}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L4)

#### `buildRegistryKey` {#symbol-buildregistrykey}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L11)
- Parameters: `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `buildRegistryKey` — Summary
Builds the composite registry key for anchor storage.
Format: `{columnRole}:{nodeId}` to disambiguate nodes appearing in multiple columns.
For multi-hop, use buildRegistryKeyWithHop instead.

#### `buildRegistryKeyWithHop` {#symbol-buildregistrykeywithhop}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L20)
- Parameters: `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `buildRegistryKeyWithHop` — Summary
Builds a hop-aware registry key for multi-hop anchor storage.
Format: `{columnRole}:{hopIndex}:{nodeId}` to disambiguate the same node
appearing in multiple columns across different hops.

#### `DragPosition` {#symbol-dragposition}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L24)

#### `LocalViewRuntime` {#symbol-localviewruntime}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L30)

#### `createRuntime` {#symbol-createruntime}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L51)
- Returns: [`LocalViewRuntime`](#symbol-localviewruntime)
- Parameters: `viewport`: `HTMLDivElement`; `container`: `HTMLDivElement`; `overlay`: `HTMLDivElement`

#### `registerAnchor` {#symbol-registeranchor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L77)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

#### `registerAnchorWithHop` {#symbol-registeranchorwithhop}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L100)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `registerAnchorWithHop` — Summary
Registers an anchor with hop-aware key for multi-hop visualization.

#### `getAnchor` {#symbol-getanchor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L121)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

#### `getAnchorWithHop` {#symbol-getanchorwithhop}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L157)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `getAnchorWithHop` — Summary
Gets an anchor using hop-aware lookup for multi-hop visualization.

#### `clearAnchorRegistry` {#symbol-clearanchorregistry}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L191)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`connections.MultiHopEntry`](./connections.ts.mdmd.md#symbol-multihopentry) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pan-zoom.test.ts](./pan-zoom.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
