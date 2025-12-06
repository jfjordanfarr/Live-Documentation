# packages/scripts/src/live-docs/explorer/client/views/localView/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-types-ts
- Generated At: 2025-12-06T13:36:26.744Z

## Authored
### Purpose
Type definitions for the Local Map view. Centralises interfaces for view options, subgraph structures, anchor registries, and column roles.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 when `localView.ts` was split into a modular directory.
- `LocalSubgraph` describes the 3-column layout (inbound, center, outbound nodes).
- `CenterAlignmentGuides` tracks vertical positions for connection line rendering.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T13:36:26.744Z","inputHash":"6cef6d915b850be7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L9)

#### `LocalViewApi` {#symbol-localviewapi}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L21)

#### `LocalEdge` {#symbol-localedge}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L30)

#### `LocalSubgraph` {#symbol-localsubgraph}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L39)

#### `CenterAlignmentGuides` {#symbol-centeralignmentguides}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L47)

#### `Bounds` {#symbol-bounds}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L52)

#### `LayoutExtents` {#symbol-layoutextents}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L61)

#### `MapTransform` {#symbol-maptransform}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L66)

#### `ColumnRole` {#symbol-columnrole}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L81)

##### `ColumnRole` — Summary
Column role for anchor registration disambiguation.
Uses semantic names (upstream/downstream) instead of spatial (left/right)
to future-proof for multi-hop graph expansion.

- `upstream`: Dependencies column (data flows FROM these nodes)
- `center`: Focus/selected node column
- `downstream`: Dependents column (data flows TO these nodes)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
