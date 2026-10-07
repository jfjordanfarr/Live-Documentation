# packages/explorer/src/client/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/types.ts
- Generated At: 2026-10-07T15:18:06.487Z

## Authored
### Purpose

Client-side type definitions for the Explorer UI. Defines view state, filters, bezier curve tuning parameters, and test coverage map types used across client modules.

### Notes

- Created 2025-11-21 during the explorer client/server split.
- `ViewName` union controls which visualization mode is active (now includes `"membrane"`).
- `BezierTuning` parameters govern connection line rendering in both Local Map and Membrane Map.
- `SymbolOrder` (2026-10-05) names how a card's symbol rows stand: `layout`, where their wires lead, which only the many-file layout can choose; `alphabetical`; or `appearance`, the Live Doc's order. It lives in `LocalMapTuning.symbolOrder` with `layout` as the default, the owner's choice of navigability of the whole over a fixed order of the few ([Turn 11](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-11)).
- `LocalMapTuning` gained the layout lab's levers on 2026-10-06, each at the value the picture was designed at: `rankingPull` (0), `rankingTie` ("fewest"), `orderSweeps` (4), `orderSeed` (null, the ranking's order), `itemGap` (24), `bandGap` (28), `membraneNeck` (60), `membranePadding` (12) and `cardMaxWidth` (null, as wide as the content asks). The page reads them so that the lab's finalists can be rendered and measured by the deck with the tuning seeded; the tuning panel does not yet show them. Later the same day the order step's restarts added `orderStarts` (4, the seeded starts tried beside the ranking's order and the previous picture's; `orderSeed` set tries that one start alone), and the prices a start's picture is judged by beyond its vertical wire length, in pixels of wire: `crossingCost` (80, per crossing of the order's own count), `heightCost` (5, per pixel of the picture's height) and `churnCost` (100, per pair of cards swapped against the previous picture); the first two were set where the lab's tabulation found the page's choice agreeing with the full weighted score on every deck scope, the third provisionally, until a tabulation has a previous picture ([Turn 12](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)). The laces' shape joined the same night as four dials beside `selfLoopTaper`: `laceReach` (18), `laceCurl` (12), `laceWidth` (2.5) and `laceInset` (0, how far past the card's edge a lace ends), so the owner can tune the self-references' look by eye in the tuning panel ([Turn 13](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)).
- `ClickBehaviorTuning` and `VisualTuning` interfaces removed in [Dev Day 83](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md); `TuningConfig` simplified to only `bezier` and `localMap` properties.
- `moveMs` and `holdStill` (2026-10-07): how long the branch picture takes to move from one arrangement to the next, zero jumping, and which card a move holds still on screen, the last clicked or the last clicked or hovered.
- `searchStarts` and `searchPatience` (2026-10-07): how many further seeded starts the continuing search may try after the first paint, zero turning it off, and how many in a row may go unadopted before it settles.
- Later on 2026-10-07 ([Turn 18](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-18)): `orderStarts` fell from 4 to 2, since the search follows the first picture and the four scopes' tables showed seeds 2 to 4 bettering nothing before paint; `searchPatience` counts the starts since the best price found improved, churn aside, not since the last adoption; `churnCost` has a slider.
- `membraneDepth` (2026-10-07, later in the day): how many levels of directory below the retained files' common directory are membranes, null for every level; the layout lab's lever for pricing the membrane rule, read by the page so the lab can verify it there.

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
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L123)

##### `SymbolOrder` — Summary
How a card's symbol rows stand: where their wires lead, which the many-file
layout chooses and the single-file view cannot; alphabetically; or as the
Live Doc lists them, the order of appearance in the file.

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L126)

##### `TuningConfig` — Summary
Aggregate tuning configuration threading through into every Explorer view.

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L135)

##### `ExplorerState` — Summary
Root state object for the Explorer client, managed by
`persistence/local-storage.ts` and consumed by every view.

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L146)

##### `TestCoverageMap` — Summary
Map from implementation file path → covering test node(s).

#### `CircuitTransform` {#symbol-circuittransform}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L149)

##### `CircuitTransform` — Summary
Pan/zoom transform for the Circuit Board (treemap) view.

#### `DirectoryNode` {#symbol-directorynode}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L159)

##### `DirectoryNode` — Summary
Tree node representing a directory in the workspace.
Built by the Circuit Board view to lay out the treemap hierarchy.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-state.PinSet`](./views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
