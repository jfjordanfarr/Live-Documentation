# packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-runtime-ts
- Generated At: 2025-12-07T21:41:17.156Z

## Authored
### Purpose
Runtime state management for the Local Map. Maintains the anchor registry, drag positions, and references to core DOM elements.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 during the localView modularisation.
- `AnchorRegistry` maps composite keys (column:nodeId) to bounding rectangles.
- `LocalViewRuntime` bundles the registry, DOM refs, and drag state.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:17.156Z","inputHash":"d1c0d4f0fa7411f1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorRegistry` {#symbol-anchorregistry}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L3)

#### `buildRegistryKey` {#symbol-buildregistrykey}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L9)
- Parameters: `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `buildRegistryKey` — Summary
Builds the composite registry key for anchor storage.
Format: `{columnRole}:{nodeId}` to disambiguate nodes appearing in multiple columns.

#### `DragPosition` {#symbol-dragposition}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L13)

#### `LocalViewRuntime` {#symbol-localviewruntime}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L19)

#### `createRuntime` {#symbol-createruntime}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L38)
- Returns: [`LocalViewRuntime`](#symbol-localviewruntime)
- Parameters: `viewport`: `HTMLDivElement`; `container`: `HTMLDivElement`; `overlay`: `HTMLDivElement`

#### `registerAnchor` {#symbol-registeranchor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L63)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

#### `getAnchor` {#symbol-getanchor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L83)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

#### `clearAnchorRegistry` {#symbol-clearanchorregistry}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L116)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->
