# packages/scripts/src/live-docs/explorer/client/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-types-ts
- Generated At: 2025-12-08T01:17:17.824Z

## Authored
### Purpose
Client-side type definitions for the Explorer UI. Defines view state, filters, bezier curve tuning parameters, and test coverage map types used across client modules.

### Notes
- Created 2025-11-21 during the explorer client/server split.
- `ViewName` union (`"circuit" | "map" | "graph"`) controls which visualization mode is active.
- `BezierTuning` parameters govern connection line rendering in the Local Map.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T01:17:17.824Z","inputHash":"f60508acb6b7881a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ViewName` {#symbol-viewname}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L6)

#### `ExplorerFilters` {#symbol-explorerfilters}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L8)

#### `BezierTuning` {#symbol-beziertuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L13)

#### `ClickBehaviorTuning` {#symbol-clickbehaviortuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L20)

#### `VisualTuning` {#symbol-visualtuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L25)

#### `LocalMapTuning` {#symbol-localmaptuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L30)

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L38)

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L45)

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L53)

#### `CircuitTransform` {#symbol-circuittransform}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L55)

#### `DragPosition` {#symbol-dragposition}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L61)

#### `DirectoryNode` {#symbol-directorynode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L67)

#### `ConnectionKind` {#symbol-connectionkind}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L74)
- Returns: [`ExplorerLinkKind`](../../../index.ts.mdmd.md#symbol-explorerlinkkind)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerLinkKind`](../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
