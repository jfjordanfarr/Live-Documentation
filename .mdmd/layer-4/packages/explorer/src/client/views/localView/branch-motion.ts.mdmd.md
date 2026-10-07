# packages/explorer/src/client/views/localView/branch-motion.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-motion.ts
- Generated At: 2026-10-07T02:59:51.440Z

## Authored
### Purpose
The Local Map's picture between two arrangements: a scene flattened to a pose, every element by what it is, and the pose part way between two, so that the renderer can move the picture frame by frame rather than redraw it.

### Notes
- Pure, no DOM. A pose keys a card by its file, a membrane by its directory and a lane by its key (`boxKeyOf`), since those are the identities the renderer keeps elements by across renders; a directory's loose-file box has no element and takes its host's key. `tweenPose` gives the places of the next pose's elements only: a kept element on the straight line between its places, a new one at its place throughout, gone ones left to the renderer to fade out; a membrane's segments interpolate when it spans the same columns in both poses and snap to the new otherwise, an open edge. `easeInOutCubic` is the move's timing. Built for the animated re-layout the owner approved ([Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)), under their rule that the eye's thing stays put while the world moves around it (2026-10-02).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PosedBox` {#symbol-posedbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L22)

##### `PosedBox` — Summary
A membrane's section or a lane's spacer, where it stands.

#### `PosedItem` {#symbol-poseditem}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L39)

##### `PosedItem` — Summary
A card, where it stands.

#### `Pose` {#symbol-pose}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L49)

##### `Pose` — Summary
Every element of the picture at its place.

#### `boxKeyOf` {#symbol-boxkeyof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L57)
- Parameters: `box`: [`SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox)

##### `boxKeyOf` — Summary
A box's identity across renders: the root, a directory by its path, a lane by its key; a directory's loose files are their host.

#### `scenePose` {#symbol-scenepose}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L65)
- Returns: [`Pose`](#symbol-pose)
- Parameters: `scene`: [`Scene`](./branch-scene.ts.mdmd.md#symbol-scene)

##### `scenePose` — Summary
The scene's places, flattened by element.

#### `tweenPose` {#symbol-tweenpose}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L99)
- Returns: [`Pose`](#symbol-pose)
- Parameters: `from`: [`Pose`](#symbol-pose); `to`: [`Pose`](#symbol-pose)

##### `tweenPose` — Summary
The picture `t` of the way from one pose to the next, for every element of
the next: an element the previous pose also had moves along the straight
line between its two places, its membrane's segments with it when it spans
the same columns in both, else standing at once where it will be; an
element new to the picture stands at its place throughout. Elements only
the previous pose had are not in the result; the renderer fades them out.
With no previous pose, or at `t` of 1 or more, the next pose itself.

#### `easeInOutCubic` {#symbol-easeinoutcubic}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-motion.ts#L126)

##### `easeInOutCubic` — Summary
Slow out of the old place and slow into the new, so that nothing jerks at either end.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene)
- [`branch-scene.SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox)
- [`branch-scene.SceneSegment`](./branch-scene.ts.mdmd.md#symbol-scenesegment)
- [`branch-scene.hostOf`](./branch-scene.ts.mdmd.md#symbol-hostof)
<!-- LIVE-DOC:END Dependencies -->
