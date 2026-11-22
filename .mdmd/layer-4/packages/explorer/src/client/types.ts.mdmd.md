# `packages/explorer/src/client/types.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/types.ts`
- Generated At: 2026-11-22T03:37:59.570Z

## Authored
### Purpose

Shared vocabulary for Explorer state and controls: navigation, the Local Map's representation and layout, map subject, independently inspected evidence, retained exploration, filters, tuning and test coverage.

### Notes

- Navigation has three views (`map`, `sources`, `world`); the Local Map representation is a separate 2d/3d value, shared across navigation and persistence.
- `selectedNode` is the map subject; `inspection` is the explicitly open reader target or null. A target can be a file with an optional symbol, a directory, or a bundled document with an optional fragment. Pins, path destination and history commit remain distinct state. The separation supports the owner's [inspect-first choice](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-24) and its [resumed implementation](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2): reading evidence must not silently change retention or the subject used by a perspective switch.

- Created 2025-11-21 during the explorer client/server split.
- `BezierTuning` parameters govern connection line rendering in the 2D Local Map.
- `SymbolOrder` (2026-10-05) names how a card's symbol rows stand: `layout`, where their wires lead, which only the many-file layout can choose; `alphabetical`; or `appearance`, the Live Doc's order. It lives in `LocalMapTuning.symbolOrder` with `layout` as the default, the owner's choice of navigability of the whole over a fixed order of the few ([Turn 11](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-05/2026-10-05.1.record.md#turn-11)).
- `LocalMapTuning` gained the layout lab's levers on 2026-10-06, each at the value the picture was designed at: `rankingPull` (0), `rankingTie` ("fewest"), `orderSweeps` (4), `orderSeed` (null, the ranking's order), `itemGap` (24), `bandGap` (28), `membraneNeck` (60), `membranePadding` (12) and `cardMaxWidth` (null, as wide as the content asks). The page reads them so that the lab's finalists can be rendered and measured by the deck with the tuning seeded; the tuning panel does not yet show them. Later the same day the order step's restarts added `orderStarts` (4, the seeded starts tried beside the ranking's order and the previous picture's; `orderSeed` set tries that one start alone), and the prices a start's picture is judged by beyond its vertical wire length, in pixels of wire: `crossingCost` (80, per crossing of the order's own count), `heightCost` (5, per pixel of the picture's height) and `churnCost` (100, per pair of cards swapped against the previous picture); the first two were set where the lab's tabulation found the page's choice agreeing with the full weighted score on every deck scope, the third provisionally, until a tabulation has a previous picture ([Turn 12](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-12)). The laces' shape joined the same night as four dials beside `selfLoopTaper`: `laceReach` (18), `laceCurl` (12), `laceWidth` (2.5) and `laceInset` (0, how far past the card's edge a lace ends), so the owner can tune the self-references' look by eye in the tuning panel ([Turn 13](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-13)).
- `ClickBehaviorTuning` and `VisualTuning` interfaces were removed in [Dev Day 83](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/03/2026-03-27/2026-03-27.1.md). Today's `TuningConfig` groups Bézier, Local Map, force-graph and history controls separately.
- `moveMs` and `holdStill` (2026-10-07): how long the branch picture takes to move from one arrangement to the next, zero jumping, and which card a move holds still on screen, the last clicked or the last clicked or hovered.
- `searchStarts` and `searchPatience` (2026-10-07): how many further seeded starts the continuing search may try after the first paint, zero turning it off, and how many in a row may go unadopted before it settles.
- Later on 2026-10-07 ([Turn 18](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-18)): `orderStarts` fell from 4 to 2, since the search follows the first picture and the four scopes' tables showed seeds 2 to 4 bettering nothing before paint; `searchPatience` counts the starts since the best price found improved, churn aside, not since the last adoption; `churnCost` has a slider.
- `membraneDepth` (2026-10-07, later in the day): how many levels of directory below the retained files' common directory are membranes, null for every level; the layout lab's lever for pricing the membrane rule, read by the page so the lab can verify it there.
- `membraneEvenness` (1 by default) and `rowLevelness` (0) since 2026-10-07: what the placement charges for a step in a membrane's outline between neighbouring columns and for a difference between the tops of a membrane's k-th cards in neighbouring columns, in units of a one-reference wire's pixel; the owner's ask for a force against membrane unevenness, as levers of the layout lab.
- `ExplorerState.openDirectories` (2026-10-08): the directories opened in the Local Map, retained with the pins across perspectives and carried by the share link.
- `PathDestination` and `ExplorerState.destination` (2026-10-14, [Turn 6](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-6)): the end of a path asked through the search bar, a file with perhaps one symbol or a directory; the start is the newest pin.
- `SpatialLayout` and `ExplorerState.spatialLayout` (2026-10-14): how the 3D Local Map places its files, by their analyzed references (`connections`) or by their declared directories (`structure`), remembered like the perspective and carried by the share link; the two directory filters of that morning are gone.
- `ForceGraphTuning.gravity` and `chargeRange` (2026-10-17): the pull of every sphere toward the picture's centre in proportion to its distance, and how far a sphere's repulsion reaches, zero for unbounded; the restoring force the simulation lacked, the owner's "weak gravity" in place of held hubs ([Turns 3 and 5 of the October 17 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3)).
- `ForceGraphTuning.approximation` (2026-10-28): how far the 3D picture's repulsion may be approximated, the opening ratio of Barnes and Hut's octree sum in [`forceGraphPhysics.ts`](views/forceGraphPhysics.ts.mdmd.md), zero for the exact sum over every pair. The exact sum took 2.2 seconds an evaluation at the T3 bundle's 21,720 spheres on 2026-10-27; the owner decided on 2026-10-28 that an approximation may be the default with the exact sum kept as the oracle, and named the lever for what it adds, so that zero means none of it.
- `ForceGraphTuning.updateEnergy` (2026-10-18): how much a change to what is shown stirs the 3D picture, the lever of ticket C2 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), a number from zero to one because a reheat in D3 is one number, the alpha the simulation starts from: one is the full reheat the library makes of every change, a fraction a reheat to that alpha that cools to the same stillness sooner, zero placement alone with no tick. The owner asked for a few settings to choose among by eye rather than a choice made for them (2026-10-17, "let the user decide to taste after presenting a few options"), so the three the plan named are three values of the one lever and the slider holds everything between.

The history's levers (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and the view's half of its C14): `HistoryTuning` with the scrubber's axis (by step or by date), its granularity (automatic, every step, days, weeks, months, salient only) and the play rate in steps a second, under `TuningConfig.history`; and in the state the commit the 3D Local Map shows (`historyCommit`, null for today) and whether the step panel names authors (`showAuthors`), both carried by the address.
- `linkStrength` (2026-10-18) is the springs' strength as a multiple of D3's own rule, one over the smaller of a wire's two ends' link counts, so that one is the picture as it was and zero lets the wires go slack: the owner's ask after their first look at the gravity, "Can you just give me those sliders in the tuning panel and I can just tweak it until it's good to my eye?" ([Turn 7 of the October 17 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-7)).

- Since 2026-10-21 `updateEnergy` is the constant strength a change's motion eases at, a share of the forces, until the spheres are still: a lower one moves the picture more gently and for longer to much the same rest, and zero still places alone. `tether` joined it that day: how strongly each sphere is held to where it stood when the picture last began to move, the force that brings a large picture to rest and keeps a person's bearings through a change, the owner's to tune by eye ([Turn 5](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-5)).
- `showCitingDocs` and `ForceGraphTuning.citedByPull` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): the filter for the documents that cite a file, apart from the documents it cites, and the share of a reference's spring such a citation pulls with, zero to draw it without pull.
- Since 2026-11-05 `ForceGraphTuning.groupWrappers` (`GroupWrappers`, `GROUP_WRAPPERS`) is the [Group Wrappers experiment](../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)'s choice: off, the default, skin, cloud, or cloud with a rim on hover.

- `LocalMapTuning.cardText` ([2026-11-05](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-4)): how a card shows its authored text, `grow`, a description opening on a tap with the card growing around its held name, or `slot`, the same fixed slot for every symbol, `slotLines` text lines (two by default, [Turn 6](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-6)) cut with an ellipsis and the full text in the reader; the comparison the owner asked to see before choosing, read by the reading surface through the controller.

- `textResistance` (0.8) and `controlResistance` (1) ([Turn 9](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-9)): with fixed slots, how much names, and the node's buttons and anchor dots, resist the zoom, 0 following the map and 1 holding screen size; the same lever the 3D view has for spheres and wires.

`nameGrowth` joined `LocalMapTuning` on [Turn 11](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-11): how much larger than its held size a name may grow on screen into the room its description leaves below reading scale.

Since 2026-11-05 `ForceGraphTuning` carries `shellDepth`, the directory shells' depth under the scan root (1 to 6, default 2), and the Group Wrappers comments name the shells.

`directoryLayout` (2026-11-12) is the switch of the directory flow trial: the grid of 2026-10-07, the default, or an opened directory in flow order with a line for each pair of files. It is a trial for comparison, not a decision; [its evidence](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/directory-flow-trial/README.md) has the pictures.

`closedDirectory` and `CLOSED_DIRECTORY_LOOKS` hold the Closed Directory trial's choice (2026-11-13), the box first as the default ([Turn 7 of the November 13 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-7)).

Since 2026-11-15 ([November 15, Turn 1](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) Closed Directory defaults to the skin with cells and has no folded look, and two choices beside it, the skin's shape (`ClosedDirectoryShape`: tab, round, square) and its cells' colour (`ClosedCellColour`: kind, grey), are in the 2D map's tuning.

Files only is the default of Zoomed Out Fully since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars ([Turn 1 of that day's record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): `OVERVIEW_FILES` lists it first, and the first is what a link that says nothing means.

`DescriptionsZoomedOut` has four values since 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): "hidden", the default, first in `DESCRIPTIONS_ZOOMED_OUT`; "first-line", the trial of November 13 ([its pictures](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/Screenshots/descriptions-zoomed-out/README.md)); and "line-end" and "line-middle", where every described row keeps its description's first line three presses out and its name holds to one line, cut at its end or in its middle. They are alternatives for the owner to choose among ([the pictures](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/descriptions-kept/README.md)); Hidden stays the default until then.

`BeyondHops` and `BEYOND_HOPS` (2026-11-18) name the trial's two choices of what stands past the hops, Everything first as the default, and `ForceGraphTuning.beyondHops` holds the choice ([Turn 10 of the November 18 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-10)).

Since 2026-11-18 ([Turn 13 of the November 17 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-13)) `MARBLE_CHOICES` begins with on and `HIDDEN_FILES_LOOKS` with Cells under name ("under", "cells", "count"), each list's first value being its default, as the other trial choices' lists are; the owner made marbles the default and asked that the defaults reflect the cells' pictures, and the root chose which cell value.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ViewName` {#symbol-viewname}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L7)

##### `ViewName` — Summary
The three navigable Explorer views. Local Map has two representations.

#### `LocalMapPerspective` {#symbol-localmapperspective}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L10)

##### `LocalMapPerspective` — Summary
The remembered representation of the Local Map.

#### `SpatialLayout` {#symbol-spatiallayout}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L16)

##### `SpatialLayout` — Summary
How the 3D Local Map places its files: by their analyzed references, the emergent network of what the code does, or by
their declared directories, the emergent tree of what the file system says (the owner's distinction, 2026-10-14).

#### `ExplorerFilters` {#symbol-explorerfilters}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L19)

##### `ExplorerFilters` — Summary
Toggle flags for the Explorer filter panel.

#### `BezierTuning` {#symbol-beziertuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L32)

##### `BezierTuning` — Summary
Cubic-Bézier connection path tuning parameters.
Exposed in the Explorer tuning panel (2025-12-05, commit `9047949`).

#### `LocalMapTuning` {#symbol-localmaptuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L44)

##### `LocalMapTuning` — Summary
Tuning knobs specific to the two-dimensional Local Map.
Includes self-loop rendering and hover/pin collapse behaviour
added 2025-12-07 (commit `a99ac04`) and 2025-12-17 (commit `f373c45`).

#### `SymbolOrder` {#symbol-symbolorder}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L272)

##### `SymbolOrder` — Summary
How a card's symbol rows stand: where their wires lead, which the many-file
layout chooses and the single-file view cannot; alphabetically; or as the
Live Doc lists them, the order of appearance in the file.

#### `TuningConfig` {#symbol-tuningconfig}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L275)

##### `TuningConfig` — Summary
Aggregate tuning configuration threading through into every Explorer view.

#### `AppearanceTuning` {#symbol-appearancetuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L287)

##### `AppearanceTuning` — Summary
How the page is drawn, the viewer's own (2026-11-16): the palette, by name, and since 2026-11-17 whether files are
drawn as marbles. Saved, as every setting is, only when it differs from the default; not carried in a shared link.

#### `FrameChoice` {#symbol-framechoice}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L299)

##### `FrameChoice` — Summary
What frames the map (a trial, 2026-11-19, the owner's "That would be great!" to a page without its sidebar, judged in
the app): the sidebar, today's page, or Bare, where the views are a breadcrumb in the top bar, the legend and the
display filters one key opened from the bottom strip, and Tuning a sheet opened from the strip's tuning button. The
viewer's own, saved in the browser and never carried by a link.

#### `FRAME_CHOICES` {#symbol-frame_choices}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L302)

##### `FRAME_CHOICES` — Summary
Every frame, in the order the control offers them; the first, the sidebar, is the default.

#### `MarbleChoice` {#symbol-marblechoice}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L312)

##### `MarbleChoice` — Summary
Whether a file is drawn as a marble (a trial, 2026-11-17, the owner's "Do it do it do it do it!!!!" of the November 16
record, Turn 9): its kind's colour as glass with veins of the offering blue and the using green, as many as the files
that use it and that it uses, in the 3D map's spheres and the 2D map's closed directories' cells; or not. On was the
default on 2026-11-18 and 19 (the owner's "I think they are a worthy new default", the November 17 record, Turn 13);
Off is again since 2026-11-19, the owner's "for immediate understandability of the system, Marbes Off is superior":
one colour meaning across the 3D spheres and the 2D cells, and less fine detail in a view they found "Still quite noisy".

#### `MARBLE_CHOICES` {#symbol-marble_choices}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L315)

##### `MARBLE_CHOICES` — Summary
Every marble choice, in the order the control offers them; the first, off, is the default.

#### `HistoryGranularity` {#symbol-historygranularity}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L322)

##### `HistoryGranularity` — Summary
Which ticks the history's scrubber draws and the step key moves between: every step; one per day, week or month
(UTC), the period's last step; the salient steps alone; or an automatic choice by the number of steps, so that a
five-commit repository shows five ticks and a long history shows months (the view's half of the plan's C14, 2026-10-18).

#### `HISTORY_GRANULARITIES` {#symbol-history_granularities}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L325)

##### `HISTORY_GRANULARITIES` — Summary
Every granularity, in the order the control offers them.

#### `HistoryAxis` {#symbol-historyaxis}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L328)

##### `HistoryAxis` — Summary
How the scrubber lays its steps out: evenly by step, or by date, where a quiet stretch reads as a gap (scenario 14).

#### `ChangeEmphasis` {#symbol-changeemphasis}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L335)

##### `ChangeEmphasis` — Summary
How the files a step of the history changed are told apart in the 3D picture while the history is shown (the owner's
ask of 2026-10-31): the changed spheres glow, the unchanged ones dim, both, or neither. While the history plays, the
emphasis holds for the whole displayed commit, in playback and at rest; the next commit replaces the changed set.

#### `CHANGE_EMPHASES` {#symbol-change_emphases}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L338)

##### `CHANGE_EMPHASES` — Summary
Every emphasis, in the order the control offers them.

#### `HistoryTuning` {#symbol-historytuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L341)

##### `HistoryTuning` — Summary
The levers of the history's scrubber, the view's half of the granularity seam (2026-10-18), and the picture's emphasis on a step's changes (2026-10-31).

#### `GroupWrappers` {#symbol-groupwrappers}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L355)

##### `GroupWrappers` — Summary
How the 3D Local Map wraps the files it does not show (an experiment, 2026-11-05): not at all, the default; or, in a
translucent skin, a cloud, or a cloud that gains a smooth rim on hover or keyboard focus, a disconnected group it shows
only by its seed and, inside a group it shows in part, the hidden files of each directory as a shell.

#### `GROUP_WRAPPERS` {#symbol-group_wrappers}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L358)

##### `GROUP_WRAPPERS` — Summary
Every wrapper choice, in the order the control offers them.

#### `BeyondHops` {#symbol-beyondhops}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L367)

##### `BeyondHops` — Summary
What the 3D Local Map draws of the files beyond the hops shown, with Group Wrappers on in the Connections layout while
something is asked about (a trial, 2026-11-18): everything, today's picture and the default, every other file of a
group shown in part held in a shell and every unreached group's seed standing past the hops; or the next step, the
horizon, only the files one step past what stands in the picture, in shells or alone, and nothing farther until a step
brings it to the edge (`forceGraphShells.ts`).

#### `BEYOND_HOPS` {#symbol-beyond_hops}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L370)

##### `BEYOND_HOPS` — Summary
Every choice of what stands beyond the hops, the default first, in the order the control offers them.

#### `ScanGrowth` {#symbol-scangrowth}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L379)

##### `ScanGrowth` — Summary
Whether the 3D Local Map, opened with nothing asked about, plays a scan (a trial for the owner's eye, 2026-11-22: "let
users do some exploring in 2D/3D local map _while the scan is happening_"): off, the picture as it is and the
default; or the finished graph's files arriving one by one after a scan's waits, in path order, as a scan finishes
them, or in the order the history says they were first committed (`views/scanGrowth.ts`). Nothing is scanned: the
bundle's finished graph is fed in a scan's rhythm, so that the look can be judged before the engine is changed.

#### `SCAN_GROWTHS` {#symbol-scan_growths}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L382)

##### `SCAN_GROWTHS` — Summary
Every choice of the scan trial, the default first, in the order the control offers them.

#### `DragChoice` {#symbol-dragchoice}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L392)

##### `DragChoice` — Summary
What is tied to a sphere does while a hand drags that sphere in the 3D Local Map (a trial for the owner's hand,
2026-11-22: "the one place I would want that responsiveness back is when I'm clicking and dragging an item and
swinging the graph around with me"): it holds its ground, the default and the picture as it was, every sphere held
toward where it stood when the drag began, so that tied files come about half the hand's way; or it swings, the files
and shells tied to the held sphere let go of where they stood for as long as it is held, following by their ties, and
resting where they lie when it is let go.

#### `DRAGS` {#symbol-drags}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L395)

##### `DRAGS` — Summary
Every choice of the drag trial, the default first, in the order the control offers them.

#### `ScanPace` {#symbol-scanpace}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L398)

##### `ScanPace` — Summary
The rhythm the scan trial plays at: the one measured on this repository, or four times slower, as on a weak machine.

#### `SCAN_PACES` {#symbol-scan_paces}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L401)

##### `SCAN_PACES` — Summary
Every pace of the scan trial, the default first, in the order the control offers them.

#### `ZoomLooks` {#symbol-zoomlooks}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L404)

##### `ZoomLooks` — Summary
How a slot card changes as the 2D map zooms out: the card ladder's steps, or the three looks of the 2026-11-10 trial.

#### `ZOOM_LOOKS` {#symbol-zoom_looks}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L410)

##### `ZOOM_LOOKS` — Summary
Every Zoom Looks choice, in the order the control offers them, the default first: the three looks since 2026-11-13,
when the owner asked that what they judge be what the build shows without a switch; the ladder's steps one choice away.

#### `DirectoryLayout` {#symbol-directorylayout}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L413)

##### `DirectoryLayout` — Summary
How an opened directory stands in the 2D map: the flow order and pair lines first tried on 2026-11-12, or the grid.

#### `DIRECTORY_LAYOUTS` {#symbol-directory_layouts}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L420)

##### `DIRECTORY_LAYOUTS` — Summary
Every Opened Directory choice, in the order the control offers them, the default first: Flow since 2026-11-13, when
the owner had found it better "in basically every place I look" and asked that what they judge be what the build
shows without a switch; the grid one choice away.

#### `ClosedDirectoryLook` {#symbol-closeddirectorylook}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L423)

##### `ClosedDirectoryLook` — Summary
How a closed directory's box is drawn in the 2D map: a skin with cells, the plain box, or a stack.

#### `CLOSED_DIRECTORY_LOOKS` {#symbol-closed_directory_looks}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L426)

##### `CLOSED_DIRECTORY_LOOKS` — Summary
Every Closed Directory choice, in the order the control offers them; the first, the skin with cells, is the default.

#### `ClosedDirectoryShape` {#symbol-closeddirectoryshape}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L429)

##### `ClosedDirectoryShape` — Summary
The shape of a closed directory's skin with cells: a folder's silhouette, the capsule, or a card's corners.

#### `CLOSED_DIRECTORY_SHAPES` {#symbol-closed_directory_shapes}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L432)

##### `CLOSED_DIRECTORY_SHAPES` — Summary
Every shape, in the order the control offers them; the first is the default until the owner chooses.

#### `ClosedCellColour` {#symbol-closedcellcolour}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L435)

##### `ClosedCellColour` — Summary
What colours a skin's cells: each file's kind, as in the 3D map, or one grey.

#### `CLOSED_CELL_COLOURS` {#symbol-closed_cell_colours}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L438)

##### `CLOSED_CELL_COLOURS` — Summary
Every cell colouring, in the order the control offers them; the first is the default.

#### `HiddenFilesLook` {#symbol-hiddenfileslook}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L444)

##### `HiddenFilesLook` — Summary
What a drawn directory's handle says of what it does not draw: the count's words; a cell for each beside its name; or, at the
reading look, a cell for each under its name, in the strip's free height, and beside it from the connections look out.

#### `HIDDEN_FILES_LOOKS` {#symbol-hidden_files_looks}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L451)

##### `HIDDEN_FILES_LOOKS` — Summary
Every Hidden Files choice, in the order the control offers them; the first, Cells under name, is the default since
2026-11-18, when the owner asked that the defaults reflect the cells' pictures (the November 17 record, Turn 13) and
root chose which of the two cell values. The count was the default before.

#### `ArrivalFraming` {#symbol-arrivalframing}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L459)

##### `ArrivalFraming` — Summary
How the 2D camera meets a fresh subject: at reading size, at reading size and then on the neighbours, or on the
neighbours. The pull-back to the neighbours has two more forms beside it, trials of 2026-11-21 for the owner's eye on
its motion: "then-neighbours-after" holds the cards' look through the ease and changes it once at rest at the end;
"then-neighbours-before" changes it at rest before the ease begins (camera-intent.ts, `arrivalLookChange`).

#### `ArrivalWait` {#symbol-arrivalwait}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L462)

##### `ArrivalWait` — Summary
Whether an arrival's pull-back waits while the pointer rests on the subject's card: never, the default, or while pointed at.

#### `ARRIVAL_WAITS` {#symbol-arrival_waits}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L465)

##### `ARRIVAL_WAITS` — Summary
Every Arrival Waits choice, in the order the control offers them; the first, never, is the default.

#### `ARRIVALS` {#symbol-arrivals}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L468)

##### `ARRIVALS` — Summary
Every Arrival choice, in the order the control offers them; the first, reading size, is the default until the owner has seen the others.

#### `CameraFraming` {#symbol-cameraframing}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L475)

##### `CameraFraming` — Summary
Who frames the 2D camera: the person by hand, or the camera following the pins until the person takes it; "follows-files",
a matched alternative for the owner's eye (root's ruling, 2026-11-19), follows as far out as the overview look when every
target is a whole-file pin.

#### `FRAMINGS` {#symbol-framings}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L478)

##### `FRAMINGS` — Summary
Every Framing choice, in the order the control offers them; the first, by hand, is the default until the owner has seen the other.

#### `StepFraming` {#symbol-stepframing}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L485)

##### `StepFraming` — Summary
What the 2D camera frames after a step: the newcomer's start by the least pan, the newcomer whole, or the newcomer
with what its lines reach (a trial, 2026-11-21; a fourth value, the least pan with the cut counted at the edges, is to
follow).

#### `STEPS` {#symbol-steps}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L488)

##### `STEPS` — Summary
Every Step choice, in the order the control offers them; the first, the least pan, is the default until the owner has seen the others.

#### `CutCounted` {#symbol-cutcounted}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L491)

##### `CutCounted` — Summary
Whether the cut is said at the edges after a step: off, the default, or on (a trial, 2026-11-21).

#### `CUT_COUNTED` {#symbol-cut_counted}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L494)

##### `CUT_COUNTED` — Summary
Every Cut Counted choice, in the order the control offers them; the first, off, is the default until the owner has seen the other.

#### `WireAnswersChoice` {#symbol-wireanswerschoice}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L497)

##### `WireAnswersChoice` — Summary
Whether a 2D wire answers a rested pointer, a press and the keyboard's focus: off, the default, or on (a trial, 2026-11-21).

#### `WIRE_ANSWERS` {#symbol-wire_answers}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L500)

##### `WIRE_ANSWERS` — Summary
Every Wire Answers choice, in the order the control offers them; the first, off, is the default until the owner has seen the other.

#### `DirectionMarks` {#symbol-directionmarks}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L503)

##### `DirectionMarks` — Summary
The way a 2D wire's marks point: none drawn, along the owner's rule, or against it (a trial, 2026-11-21).

#### `DIRECTION_MARKS` {#symbol-direction_marks}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L506)

##### `DIRECTION_MARKS` — Summary
Every Direction Marks choice, in the order the control offers them; the first, none, is the default.

#### `OverviewFiles` {#symbol-overviewfiles}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L512)

##### `OverviewFiles` — Summary
What the 2D map's overview look draws: files only, as in Flow, or cards at their size. Files only was a trial of
2026-11-13 and is the default since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars.

#### `OVERVIEW_FILES` {#symbol-overview_files}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L515)

##### `OVERVIEW_FILES` — Summary
Every Zoomed Out Fully choice, in the order the control offers them, the default first.

#### `DescriptionsZoomedOut` {#symbol-descriptionszoomedout}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L524)

##### `DescriptionsZoomedOut` — Summary
What a described row keeps of its description in the connections look: nothing; its first line where its name leaves
room, taking one line (the 2026-11-13 trial); or its first line on every described row, the name held to one line
and cut with an ellipsis at its end, or in its middle at a seam, where it does not fit (2026-11-15, after the owner's
"the only reason it doesn't look quite as good ... is because the symbol name itself is willing to wrap onto a new
line").

#### `DESCRIPTIONS_ZOOMED_OUT` {#symbol-descriptions_zoomed_out}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L527)

##### `DESCRIPTIONS_ZOOMED_OUT` — Summary
Every Descriptions Zoomed Out choice, in the order the control offers them; the first, nothing kept, is the default.

#### `ForceGraphTuning` {#symbol-forcegraphtuning}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L530)

##### `ForceGraphTuning` — Summary
The 3D Local Map's packing and stable visual encodings, shared with the headless layout lab.

#### `PathDestination` {#symbol-pathdestination}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L653)

##### `PathDestination` — Summary
The end of a path a person asked for: a file, perhaps one symbol of it, or a directory. The path starts at the newest pin (2026-10-14).

#### `InspectionTarget` {#symbol-inspectiontarget}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L658)

##### `InspectionTarget` — Summary
The evidence explicitly open in the reader, independent of the Local Map subject and its pins.

#### `DiscoveryTarget` {#symbol-discoverytarget}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L665)

##### `DiscoveryTarget` — Summary
The latest discovery remains in the map after its evidence closes; a new discovery replaces it and Pin keeps it.

#### `ExplorerState` {#symbol-explorerstate}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L671)

##### `ExplorerState` — Summary
Root state object for the Explorer client, managed by
`persistence/local-storage.ts` and consumed by every view.

#### `TestCoverageMap` {#symbol-testcoveragemap}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/types.ts#L700)

##### `TestCoverageMap` — Summary
Map from implementation file path → covering test node(s).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`palette.PaletteName`](./palette.ts.mdmd.md#symbol-palettename) (type-only)
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
