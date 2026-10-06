# packages/explorer/src/client/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/types.ts
- Generated At: 2026-10-06T19:32:24.868Z

## Authored
### Purpose

Client-side type definitions for the Explorer UI. Defines view state, filters, bezier curve tuning parameters, and test coverage map types used across client modules.

### Notes

- Created 2025-11-21 during the explorer client/server split.
- `ViewName` union controls which visualization mode is active (now includes `"membrane"`).
- `BezierTuning` parameters govern connection line rendering in both Local Map and Membrane Map.
- `SymbolOrder` (2026-10-05) names how a card's symbol rows stand: `layout`, where their wires lead, which only the many-file layout can choose; `alphabetical`; or `appearance`, the Live Doc's order. It lives in `LocalMapTuning.symbolOrder` with `layout` as the default, the owner's choice of navigability of the whole over a fixed order of the few ([Turn 11](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-11)).
- `LocalMapTuning` gained the layout lab's levers on 2026-10-06, each at the value the picture was designed at: `rankingPull` (0), `rankingTie` ("fewest"), `orderSweeps` (4), `orderSeed` (null, the ranking's order), `itemGap` (24), `bandGap` (28), `membraneNeck` (60), `membranePadding` (12) and `cardMaxWidth` (null, as wide as the content asks). The page reads them so that the lab's finalists can be rendered and measured by the deck with the tuning seeded; the tuning panel does not yet show them.
- `ClickBehaviorTuning` and `VisualTuning` interfaces removed in [Dev Day 83](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md); `TuningConfig` simplified to only `bezier` and `localMap` properties.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ViewName` {#symbol-viewname}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L14)

##### `ViewName` — Summary
Names of the four main Explorer views.

- `"circuit"` — treemap / circuit-board overview
- `"map"` — 3-column Local Map (inbound → node → outbound)
- `"graph"` — force-directed D3 graph
- `"sources"` — knowledge-sources health list

Created 2025-11-22 with the initial Explorer scaffold.

#### `ExplorerFilters` {#symbol-explorerfilters}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L17)

##### `ExplorerFilters` — Summary
Toggle flags for the Explorer filter panel.

#### `BezierTuning` {#symbol-beziertuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L27)

##### `BezierTuning` — Summary
Cubic-Bézier connection path tuning parameters.
Exposed in the Explorer tuning panel (2025-12-05, commit `9047949`).

#### `LocalMapTuning` {#symbol-localmaptuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L39)

##### `LocalMapTuning` — Summary
Tuning knobs specific to the Local Map (3-column) view.
Includes self-loop rendering and hover/pin collapse behaviour
added 2025-12-07 (commit `a99ac04`) and 2025-12-17 (commit `f373c45`).

#### `SymbolOrder` {#symbol-symbolorder}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L84)

##### `SymbolOrder` — Summary
How a card's symbol rows stand: where their wires lead, which the many-file
layout chooses and the single-file view cannot; alphabetically; or as the
Live Doc lists them, the order of appearance in the file.

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L87)

##### `TuningConfig` — Summary
Aggregate tuning configuration threading through into every Explorer view.

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L96)

##### `ExplorerState` — Summary
Root state object for the Explorer client, managed by
`persistence/local-storage.ts` and consumed by every view.

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L107)

##### `TestCoverageMap` — Summary
Map from implementation file path → covering test node(s).

#### `CircuitTransform` {#symbol-circuittransform}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L110)

##### `CircuitTransform` — Summary
Pan/zoom transform for the Circuit Board (treemap) view.

#### `DirectoryNode` {#symbol-directorynode}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L120)

##### `DirectoryNode` — Summary
Tree node representing a directory in the workspace.
Built by the Circuit Board view to lay out the treemap hierarchy.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-state.PinSet`](./views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
