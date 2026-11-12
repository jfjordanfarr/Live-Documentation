# packages/explorer/src/client/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/types.ts
- Generated At: 2026-11-12T22:02:35.229Z

## Authored
### Purpose

Shared vocabulary for Explorer state and controls: navigation, the Local Map's representation and layout, map subject, independently inspected evidence, retained exploration, filters, tuning and test coverage.

### Notes

- Navigation has three views (`map`, `sources`, `world`); the Local Map representation is a separate 2d/3d value, shared across navigation and persistence.
- `selectedNode` is the map subject; `inspection` is the explicitly open reader target or null. A target can be a file with an optional symbol, a directory, or a bundled document with an optional fragment. Pins, path destination and history commit remain distinct state. The separation supports the owner's [inspect-first choice](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-24) and its [resumed implementation](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2): reading evidence must not silently change retention or the subject used by a perspective switch.

- Created 2025-11-21 during the explorer client/server split.
- `BezierTuning` parameters govern connection line rendering in the 2D Local Map.
- `SymbolOrder` (2026-10-05) names how a card's symbol rows stand: `layout`, where their wires lead, which only the many-file layout can choose; `alphabetical`; or `appearance`, the Live Doc's order. It lives in `LocalMapTuning.symbolOrder` with `layout` as the default, the owner's choice of navigability of the whole over a fixed order of the few ([Turn 11](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-11)).
- `LocalMapTuning` gained the layout lab's levers on 2026-10-06, each at the value the picture was designed at: `rankingPull` (0), `rankingTie` ("fewest"), `orderSweeps` (4), `orderSeed` (null, the ranking's order), `itemGap` (24), `bandGap` (28), `membraneNeck` (60), `membranePadding` (12) and `cardMaxWidth` (null, as wide as the content asks). The page reads them so that the lab's finalists can be rendered and measured by the deck with the tuning seeded; the tuning panel does not yet show them. Later the same day the order step's restarts added `orderStarts` (4, the seeded starts tried beside the ranking's order and the previous picture's; `orderSeed` set tries that one start alone), and the prices a start's picture is judged by beyond its vertical wire length, in pixels of wire: `crossingCost` (80, per crossing of the order's own count), `heightCost` (5, per pixel of the picture's height) and `churnCost` (100, per pair of cards swapped against the previous picture); the first two were set where the lab's tabulation found the page's choice agreeing with the full weighted score on every deck scope, the third provisionally, until a tabulation has a previous picture ([Turn 12](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)). The laces' shape joined the same night as four dials beside `selfLoopTaper`: `laceReach` (18), `laceCurl` (12), `laceWidth` (2.5) and `laceInset` (0, how far past the card's edge a lace ends), so the owner can tune the self-references' look by eye in the tuning panel ([Turn 13](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)).
- `ClickBehaviorTuning` and `VisualTuning` interfaces were removed in [Dev Day 83](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md). Today's `TuningConfig` groups Bézier, Local Map, force-graph and history controls separately.
- `moveMs` and `holdStill` (2026-10-07): how long the branch picture takes to move from one arrangement to the next, zero jumping, and which card a move holds still on screen, the last clicked or the last clicked or hovered.
- `searchStarts` and `searchPatience` (2026-10-07): how many further seeded starts the continuing search may try after the first paint, zero turning it off, and how many in a row may go unadopted before it settles.
- Later on 2026-10-07 ([Turn 18](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-18)): `orderStarts` fell from 4 to 2, since the search follows the first picture and the four scopes' tables showed seeds 2 to 4 bettering nothing before paint; `searchPatience` counts the starts since the best price found improved, churn aside, not since the last adoption; `churnCost` has a slider.
- `membraneDepth` (2026-10-07, later in the day): how many levels of directory below the retained files' common directory are membranes, null for every level; the layout lab's lever for pricing the membrane rule, read by the page so the lab can verify it there.
- `membraneEvenness` (1 by default) and `rowLevelness` (0) since 2026-10-07: what the placement charges for a step in a membrane's outline between neighbouring columns and for a difference between the tops of a membrane's k-th cards in neighbouring columns, in units of a one-reference wire's pixel; the owner's ask for a force against membrane unevenness, as levers of the layout lab.
- `ExplorerState.openDirectories` (2026-10-08): the directories opened in the Local Map, retained with the pins across perspectives and carried by the share link.
- `PathDestination` and `ExplorerState.destination` (2026-10-14, [Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)): the end of a path asked through the search bar, a file with perhaps one symbol or a directory; the start is the newest pin.
- `SpatialLayout` and `ExplorerState.spatialLayout` (2026-10-14): how the 3D Local Map places its files, by their analyzed references (`connections`) or by their declared directories (`structure`), remembered like the perspective and carried by the share link; the two directory filters of that morning are gone.
- `ForceGraphTuning.gravity` and `chargeRange` (2026-10-17): the pull of every sphere toward the picture's centre in proportion to its distance, and how far a sphere's repulsion reaches, zero for unbounded; the restoring force the simulation lacked, the owner's "weak gravity" in place of held hubs ([Turns 3 and 5 of the October 17 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)).
- `ForceGraphTuning.approximation` (2026-10-28): how far the 3D picture's repulsion may be approximated, the opening ratio of Barnes and Hut's octree sum in [`forceGraphPhysics.ts`](views/forceGraphPhysics.ts.mdmd.md), zero for the exact sum over every pair. The exact sum took 2.2 seconds an evaluation at the T3 bundle's 21,720 spheres on 2026-10-27; the owner decided on 2026-10-28 that an approximation may be the default with the exact sum kept as the oracle, and named the lever for what it adds, so that zero means none of it.
- `ForceGraphTuning.updateEnergy` (2026-10-18): how much a change to what is shown stirs the 3D picture, the lever of ticket C2 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), a number from zero to one because a reheat in D3 is one number, the alpha the simulation starts from: one is the full reheat the library makes of every change, a fraction a reheat to that alpha that cools to the same stillness sooner, zero placement alone with no tick. The owner asked for a few settings to choose among by eye rather than a choice made for them (2026-10-17, "let the user decide to taste after presenting a few options"), so the three the plan named are three values of the one lever and the slider holds everything between.

The history's levers (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and the view's half of its C14): `HistoryTuning` with the scrubber's axis (by step or by date), its granularity (automatic, every step, days, weeks, months, salient only) and the play rate in steps a second, under `TuningConfig.history`; and in the state the commit the 3D Local Map shows (`historyCommit`, null for today) and whether the step panel names authors (`showAuthors`), both carried by the address.
- `linkStrength` (2026-10-18) is the springs' strength as a multiple of D3's own rule, one over the smaller of a wire's two ends' link counts, so that one is the picture as it was and zero lets the wires go slack: the owner's ask after their first look at the gravity, "Can you just give me those sliders in the tuning panel and I can just tweak it until it's good to my eye?" ([Turn 7 of the October 17 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-7)).

- Since 2026-10-21 `updateEnergy` is the constant strength a change's motion eases at, a share of the forces, until the spheres are still: a lower one moves the picture more gently and for longer to much the same rest, and zero still places alone. `tether` joined it that day: how strongly each sphere is held to where it stood when the picture last began to move, the force that brings a large picture to rest and keeps a person's bearings through a change, the owner's to tune by eye ([Turn 5](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)).
- `showCitingDocs` and `ForceGraphTuning.citedByPull` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): the filter for the documents that cite a file, apart from the documents it cites, and the share of a reference's spring such a citation pulls with, zero to draw it without pull.
- Since 2026-11-05 `ForceGraphTuning.groupWrappers` (`GroupWrappers`, `GROUP_WRAPPERS`) is the [Group Wrappers experiment](../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)'s choice: off, the default, skin, cloud, or cloud with a rim on hover.

- `LocalMapTuning.cardText` ([2026-11-05](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4)): how a card shows its authored text, `grow`, a description opening on a tap with the card growing around its held name, or `slot`, the same fixed slot for every symbol, `slotLines` text lines (two by default, [Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6)) cut with an ellipsis and the full text in the reader; the comparison the owner asked to see before choosing, read by the reading surface through the controller.

- `textResistance` (0.8) and `controlResistance` (1) ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-9)): with fixed slots, how much names, and the node's buttons and anchor dots, resist the zoom, 0 following the map and 1 holding screen size; the same lever the 3D view has for spheres and wires.

`nameGrowth` joined `LocalMapTuning` on [Turn 11](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11): how much larger than its held size a name may grow on screen into the room its description leaves below reading scale.

Since 2026-11-05 `ForceGraphTuning` carries `shellDepth`, the directory shells' depth under the scan root (1 to 6, default 2), and the Group Wrappers comments name the shells.

`directoryLayout` (2026-11-12) is the switch of the directory flow trial: the grid of 2026-10-07, the default, or an opened directory in flow order with a line for each pair of files. It is a trial for comparison, not a decision; [its evidence](../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/directory-flow-trial/README.md) has the pictures.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ViewName` {#symbol-viewname}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L6)

##### `ViewName` — Summary
The three navigable Explorer views. Local Map has two representations.

#### `LocalMapPerspective` {#symbol-localmapperspective}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L9)

##### `LocalMapPerspective` — Summary
The remembered representation of the Local Map.

#### `SpatialLayout` {#symbol-spatiallayout}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L15)

##### `SpatialLayout` — Summary
How the 3D Local Map places its files: by their analyzed references, the emergent network of what the code does, or by
their declared directories, the emergent tree of what the file system says (the owner's distinction, 2026-10-14).

#### `ExplorerFilters` {#symbol-explorerfilters}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L18)

##### `ExplorerFilters` — Summary
Toggle flags for the Explorer filter panel.

#### `BezierTuning` {#symbol-beziertuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L31)

##### `BezierTuning` — Summary
Cubic-Bézier connection path tuning parameters.
Exposed in the Explorer tuning panel (2025-12-05, commit `9047949`).

#### `LocalMapTuning` {#symbol-localmaptuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L43)

##### `LocalMapTuning` — Summary
Tuning knobs specific to the two-dimensional Local Map.
Includes self-loop rendering and hover/pin collapse behaviour
added 2025-12-07 (commit `a99ac04`) and 2025-12-17 (commit `f373c45`).

#### `SymbolOrder` {#symbol-symbolorder}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L170)

##### `SymbolOrder` — Summary
How a card's symbol rows stand: where their wires lead, which the many-file
layout chooses and the single-file view cannot; alphabetically; or as the
Live Doc lists them, the order of appearance in the file.

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L173)

##### `TuningConfig` — Summary
Aggregate tuning configuration threading through into every Explorer view.

#### `HistoryGranularity` {#symbol-historygranularity}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L185)

##### `HistoryGranularity` — Summary
Which ticks the history's scrubber draws and the step key moves between: every step; one per day, week or month
(UTC), the period's last step; the salient steps alone; or an automatic choice by the number of steps, so that a
five-commit repository shows five ticks and a long history shows months (the view's half of the plan's C14, 2026-10-18).

#### `HISTORY_GRANULARITIES` {#symbol-history_granularities}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L188)

##### `HISTORY_GRANULARITIES` — Summary
Every granularity, in the order the control offers them.

#### `HistoryAxis` {#symbol-historyaxis}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L191)

##### `HistoryAxis` — Summary
How the scrubber lays its steps out: evenly by step, or by date, where a quiet stretch reads as a gap (scenario 14).

#### `ChangeEmphasis` {#symbol-changeemphasis}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L198)

##### `ChangeEmphasis` — Summary
How the files a step of the history changed are told apart in the 3D picture while the history is shown (the owner's
ask of 2026-10-31): the changed spheres glow, the unchanged ones dim, both, or neither. While the history plays, the
emphasis holds for the whole displayed commit, in playback and at rest; the next commit replaces the changed set.

#### `CHANGE_EMPHASES` {#symbol-change_emphases}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L201)

##### `CHANGE_EMPHASES` — Summary
Every emphasis, in the order the control offers them.

#### `HistoryTuning` {#symbol-historytuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L204)

##### `HistoryTuning` — Summary
The levers of the history's scrubber, the view's half of the granularity seam (2026-10-18), and the picture's emphasis on a step's changes (2026-10-31).

#### `GroupWrappers` {#symbol-groupwrappers}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L218)

##### `GroupWrappers` — Summary
How the 3D Local Map wraps the files it does not show (an experiment, 2026-11-05): not at all, the default; or, in a
translucent skin, a cloud, or a cloud that gains a smooth rim on hover or keyboard focus, a disconnected group it shows
only by its seed and, inside a group it shows in part, the hidden files of each directory as a shell.

#### `GROUP_WRAPPERS` {#symbol-group_wrappers}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L221)

##### `GROUP_WRAPPERS` — Summary
Every wrapper choice, in the order the control offers them.

#### `ZoomLooks` {#symbol-zoomlooks}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L224)

##### `ZoomLooks` — Summary
How a slot card changes as the 2D map zooms out: the card ladder's steps, or the three looks of the 2026-11-10 trial.

#### `ZOOM_LOOKS` {#symbol-zoom_looks}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L227)

##### `ZOOM_LOOKS` — Summary
Every Zoom Looks choice, in the order the control offers them.

#### `DirectoryLayout` {#symbol-directorylayout}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L230)

##### `DirectoryLayout` — Summary
How an opened directory stands in the 2D map: today's grid, or the flow order and pair lines of the 2026-11-12 trial.

#### `DIRECTORY_LAYOUTS` {#symbol-directory_layouts}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L233)

##### `DIRECTORY_LAYOUTS` — Summary
Every Opened Directory choice, in the order the control offers them; the first is the default.

#### `ForceGraphTuning` {#symbol-forcegraphtuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L236)

##### `ForceGraphTuning` — Summary
The 3D Local Map's packing and stable visual encodings, shared with the headless layout lab.

#### `PathDestination` {#symbol-pathdestination}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L340)

##### `PathDestination` — Summary
The end of a path a person asked for: a file, perhaps one symbol of it, or a directory. The path starts at the newest pin (2026-10-14).

#### `InspectionTarget` {#symbol-inspectiontarget}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L345)

##### `InspectionTarget` — Summary
The evidence explicitly open in the reader, independent of the Local Map subject and its pins.

#### `DiscoveryTarget` {#symbol-discoverytarget}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L352)

##### `DiscoveryTarget` — Summary
The latest discovery remains in the map after its evidence closes; a new discovery replaces it and Pin keeps it.

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L358)

##### `ExplorerState` — Summary
Root state object for the Explorer client, managed by
`persistence/local-storage.ts` and consumed by every view.

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L387)

##### `TestCoverageMap` — Summary
Map from implementation file path → covering test node(s).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`reading-state.ReadingChoice`](./reading-state.ts.mdmd.md#symbol-readingchoice) (type-only)
- [`pin-state.PinSet`](./views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
