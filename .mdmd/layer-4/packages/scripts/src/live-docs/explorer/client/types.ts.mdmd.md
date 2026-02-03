# packages/scripts/src/live-docs/explorer/client/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-types-ts
- Generated At: 2026-02-03T21:55:36.131Z

## Authored
### Purpose
Client-side type definitions for the Explorer UI. Defines view state, filters, bezier curve tuning parameters, and test coverage map types used across client modules.

### Notes
- Created 2025-11-21 during the explorer client/server split.
- `ViewName` union (`"circuit" | "map" | "graph"`) controls which visualization mode is active.
- `BezierTuning` parameters govern connection line rendering in the Local Map.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.131Z","inputHash":"adaa21794362bb52"}]} -->
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
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L14)

#### `ClickBehaviorTuning` {#symbol-clickbehaviortuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L21)

#### `VisualTuning` {#symbol-visualtuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L26)

#### `LocalMapTuning` {#symbol-localmaptuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L31)

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L43)

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L50)

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L58)

#### `CircuitTransform` {#symbol-circuittransform}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L60)

#### `DragPosition` {#symbol-dragposition}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L66)

#### `DirectoryNode` {#symbol-directorynode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L72)

#### `ConnectionKind` {#symbol-connectionkind}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L79)
- Returns: [`ExplorerLinkKind`](../shared/types.ts.mdmd.md#symbol-explorerlinkkind)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerLinkKind`](../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [layout-measure.test.ts](./views/localView/layout-measure.test.ts.mdmd.md)
- [pan-zoom.test.ts](./views/localView/pan-zoom.test.ts.mdmd.md)
- [subgraph-builder.test.ts](./views/localView/subgraph-builder.test.ts.mdmd.md)
- [symbol-highlight.test.ts](./views/localView/symbol-highlight.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
