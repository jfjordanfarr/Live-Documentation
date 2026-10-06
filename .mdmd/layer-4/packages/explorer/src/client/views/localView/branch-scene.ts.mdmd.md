# packages/explorer/src/client/views/localView/branch-scene.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-scene.ts
- Generated At: 2026-10-06T19:32:25.200Z

## Authored
### Purpose

The Local Map's many-file scene as pure geometry: from the ranked and ordered exploration to every card's, lane's and membrane's place, with nothing of the page in it, so that the renderer and the layout lab draw one picture from one model.

### Notes

Two steps. `planBranches` turns the order's bands and lanes into a tree of boxes (the root drawn as nothing, each directory a membrane, a directory's loose files sharing their parent's element, each lane a box of slots) with the cards and slots each column stacks, in the order the renderer makes elements: parents before children, siblings in their rows, a column's top lane before its files and each file's following lane after it. `layoutScene` takes a measurer and the tuning: the measurer answers how wide each card wants to be under the card cap, and then, at the widths the columns give, how tall each card is, where its pins are and how tall each drawn directory's label is at its segment's width; the layout places the columns across (each as wide as its widest card with that card's insets, the columns a gap apart, every box's segments inside its column by the insets around it), builds a wire per reference through the slots its passages name, calls the exact placement of `branch-placement.ts` down, and returns every segment, top, slot line and the picture's size. The renderer of `branch-renderer.ts` is one measurer, the page itself; the layout lab's measurer is a capture of the page composed by a card model, so a sweep of the layout's levers runs in node at a solve a tenth of a second. Extracted on 2026-10-06 from the renderer, which had held this logic between its DOM calls, as the first milestone of the layout lab the owner asked for ([Turn 7](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-7) and [Turn 10](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-10), "if it splits now, hope and plan for reunification later"): the page's placement measures through the scene are the ones the old renderer gave, to the unit, on every deck scope. The tuning's values are the ones the picture was designed at (`DEFAULT_SCENE_TUNING`); the renderer takes them from the Local Map's tuning so that the lab's finalists can be rendered.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SceneTuning` {#symbol-scenetuning}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L25)

##### `SceneTuning` — Summary
The dials of the scene's geometry, each with the value the picture was designed at.

#### `DEFAULT_SCENE_TUNING` {#symbol-default_scene_tuning}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L41)
- Returns: [`SceneTuning`](#symbol-scenetuning)

##### `DEFAULT_SCENE_TUNING` — Summary
The values the picture was designed at.

#### `BAND_BORDER` {#symbol-band_border}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L44)

##### `BAND_BORDER` — Summary
The outline's stroke, outside the padding.

#### `SLOT_LINE` {#symbol-slot_line}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L47)

##### `SLOT_LINE` — Summary
Where a wire runs through a slot of a lane: the slot's middle pixel, from its top.

#### `SceneSegment` {#symbol-scenesegment}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L50)

##### `SceneSegment` — Summary
One column's part of a box: its edges there.

#### `SceneBoxKind` {#symbol-sceneboxkind}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L63)

##### `SceneBoxKind` — Summary
What a box is: the root is the picture itself, drawn as nothing; a directory
is a membrane with an outline and a label; a directory's loose files share
its parent's element; a lane is the room a column's threaded wires pass.

#### `SceneBox` {#symbol-scenebox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L66)

##### `SceneBox` — Summary
A box of the picture, with its place once laid out.

#### `SceneItem` {#symbol-sceneitem}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L96)

##### `SceneItem` — Summary
A card: an item the placement stands in a column.

#### `ScenePlan` {#symbol-sceneplan}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L105)

##### `ScenePlan` — Summary
The tree of boxes and the stacks of each column, before any measuring.

#### `SceneMeasurer` {#symbol-scenemeasurer}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L118)

##### `SceneMeasurer` — Summary
What the layout asks of the page, or of a capture of it.

#### `SceneMeasurement` {#symbol-scenemeasurement}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L125)

#### `Scene` {#symbol-scene}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L133)
- Extends: [`ScenePlan`](#symbol-sceneplan)

##### `Scene` — Summary
The laid-out scene.

#### `planBranches` {#symbol-planbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L153)
- Returns: [`ScenePlan`](#symbol-sceneplan)
- Parameters: `branches`: [`BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph)

##### `planBranches` — Summary
The tree of boxes the order's bands and lanes make, and the stacks of each
column: a band's children in their rows, with the lanes the directory holds
among them by row; then its own files, with the lanes that follow them.

#### `hostOf` {#symbol-hostof}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L214)

##### `hostOf` — Summary
The box whose element holds a box's elements: itself, unless it is a directory's loose files, which share their parent's.

#### `layoutScene` {#symbol-layoutscene}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-scene.ts#L231)
- Returns: [`Scene`](#symbol-scene)
- Parameters: `plan`: [`ScenePlan`](#symbol-sceneplan); `branches`: [`BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph); `measurer`: [`SceneMeasurer`](#symbol-scenemeasurer); `tuning`: [`SceneTuning`](#symbol-scenetuning)

##### `layoutScene` — Summary
Lays the plan out. Across: each column as wide as its widest card with
that card's insets, the columns a gap apart, every box's segments inside
its column by the insets around it. Then the measurer gives every card's
height and pins at its column's width and every label's height at its
segment's width. Down: the exact placement of `branch-placement.ts`, with
a wire per reference through the slots its passages name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-order.Lane`](./branch-order.ts.mdmd.md#symbol-lane) (type-only)
- [`branch-placement.Placement`](./branch-placement.ts.mdmd.md#symbol-placement)
- [`branch-placement.PlacementBand`](./branch-placement.ts.mdmd.md#symbol-placementband)
- [`branch-placement.PlacementWire`](./branch-placement.ts.mdmd.md#symbol-placementwire)
- [`branch-placement.StackEntry`](./branch-placement.ts.mdmd.md#symbol-stackentry)
- [`branch-placement.placeBranches`](./branch-placement.ts.mdmd.md#symbol-placebranches)
- [`branch-routing.LANE_PADDING`](./branch-routing.ts.mdmd.md#symbol-lane_padding)
- [`branch-routing.LANE_PITCH`](./branch-routing.ts.mdmd.md#symbol-lane_pitch)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband) (type-only)
<!-- LIVE-DOC:END Dependencies -->
