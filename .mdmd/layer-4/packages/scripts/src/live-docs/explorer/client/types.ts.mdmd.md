# packages/scripts/src/live-docs/explorer/client/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-types-ts
- Generated At: 2026-03-29T21:52:09.019Z

## Authored
### Purpose

Client-side type definitions for the Explorer UI. Defines view state, filters, bezier curve tuning parameters, and test coverage map types used across client modules.

### Notes

- Created 2025-11-21 during the explorer client/server split.
- `ViewName` union controls which visualization mode is active (now includes `"membrane"`).
- `BezierTuning` parameters govern connection line rendering in both Local Map and Membrane Map.
- `ClickBehaviorTuning` and `VisualTuning` interfaces removed in [Dev Day 83](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md); `TuningConfig` simplified to only `bezier` and `localMap` properties.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-29T21:52:09.019Z","inputHash":"d4f15ec9ba8a5cc5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ViewName` {#symbol-viewname}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L13)

##### `ViewName` — Summary
Names of the four main Explorer views.

- `"circuit"` — treemap / circuit-board overview
- `"map"` — 3-column Local Map (inbound → node → outbound)
- `"graph"` — force-directed D3 graph
- `"sources"` — knowledge-sources health list

Created 2025-11-22 with the initial Explorer scaffold.

#### `ExplorerFilters` {#symbol-explorerfilters}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L16)

##### `ExplorerFilters` — Summary
Toggle flags for the Explorer filter panel.

#### `BezierTuning` {#symbol-beziertuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L26)

##### `BezierTuning` — Summary
Cubic-Bézier connection path tuning parameters.
Exposed in the Explorer tuning panel (2025-12-05, commit `9047949`).

#### `LocalMapTuning` {#symbol-localmaptuning}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L38)

##### `LocalMapTuning` — Summary
Tuning knobs specific to the Local Map (3-column) view.
Includes self-loop rendering and hover/pin collapse behaviour
added 2025-12-07 (commit `a99ac04`) and 2025-12-17 (commit `f373c45`).

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L51)

##### `TuningConfig` — Summary
Aggregate tuning configuration threading through into every Explorer view.

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L60)

##### `ExplorerState` — Summary
Root state object for the Explorer client, managed by
`persistence/local-storage.ts` and consumed by every view.

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L69)

##### `TestCoverageMap` — Summary
Map from implementation file path → covering test node(s).

#### `CircuitTransform` {#symbol-circuittransform}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L72)

##### `CircuitTransform` — Summary
Pan/zoom transform for the Circuit Board (treemap) view.

#### `DirectoryNode` {#symbol-directorynode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/types.ts#L82)

##### `DirectoryNode` — Summary
Tree node representing a directory in the workspace.
Built by the Circuit Board view to lay out the treemap hierarchy.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [compressed-url-state.test.ts](./persistence/compressed-url-state.test.ts.mdmd.md)
- [aggregation.test.ts](./views/circuitView/aggregation.test.ts.mdmd.md)
- [layout-measure.test.ts](./views/localView/layout-measure.test.ts.mdmd.md)
- [pan-zoom.test.ts](./views/localView/pan-zoom.test.ts.mdmd.md)
- [subgraph-builder.test.ts](./views/localView/subgraph-builder.test.ts.mdmd.md)
- [symbol-highlight.test.ts](./views/localView/symbol-highlight.test.ts.mdmd.md)
- [detail-levels.test.ts](./views/membraneView/detail-levels.test.ts.mdmd.md)
- [edge-bundling.test.ts](./views/membraneView/edge-bundling.test.ts.mdmd.md)
- [hierarchy.test.ts](./views/membraneView/hierarchy.test.ts.mdmd.md)
- [layout.test.ts](./views/membraneView/layout.test.ts.mdmd.md)
- [pin-state.test.ts](./views/membraneView/pin-state.test.ts.mdmd.md)
- [svg-connections.test.ts](./views/membraneView/svg-connections.test.ts.mdmd.md)
- [squarify.test.ts](./views/squarify.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
