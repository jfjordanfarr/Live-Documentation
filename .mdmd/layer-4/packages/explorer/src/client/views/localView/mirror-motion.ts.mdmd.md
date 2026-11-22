# `packages/explorer/src/client/views/localView/mirror-motion.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/mirror-motion.ts`
- Generated At: 2026-11-22T05:48:58.410Z

## Authored
### Purpose
Runs the motion Tuning's Mirror Turn chooses when the 2D picture is mirrored or put back: the turn or the slide, by writing one angle on the map's layer each frame for the stylesheet to draw from and exchanging the pins as the plane stands edge-on, or the cut, a fade out and in; and brings the picture to rest exactly once however the motion ends.

### Notes
- Written 2026-11-22. The real cards and wires move: nothing is copied, and no wire is measured or rewritten until the picture rests, since while the plane turns a measurement of the page is not the layout's (the controller's `drawConnections` waits on `holdsWires`).
- The move between 2D and 3D (`views/perspectiveTransition.ts`) was read first and could not serve: it copies the picture, folds the copies to file tokens and moves them between two drawings on a canvas, with no turning plane in it, and making its copies alone takes longer than this motion lasts. Its easing, `transitionEase`, is what is shared.
- A second press ends the motion under way at once where it was going (`end`), so the picture is never left between its two states; `tests/e2e/local-map-mirror.spec.ts` holds it.
- Its cost is not acceptable on a heavy picture as built: five or six frames in a 620 ms motion on 84 cards and 218 wires at full speed, measured headless ([the strips' record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/mirror/README.md)). What makes it dear was not taken apart.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TURNING_ATTRIBUTE` {#symbol-turning_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L21)

##### `TURNING_ATTRIBUTE` — Summary
The attribute on the map's layer while the picture turns or slides, holding which; the stylesheet draws from it.

#### `HELD_ATTRIBUTE` {#symbol-held_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L24)

##### `HELD_ATTRIBUTE` — Summary
The attribute on the place of the card that holds still while the picture turns.

#### `MirrorMotionOptions` {#symbol-mirrormotionoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L27)

##### `MirrorMotionOptions` — Summary
What a motion needs of the map, and what it gives back.

#### `MirrorMotion` {#symbol-mirrormotion}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L56)

##### `MirrorMotion` — Summary
A motion under way.

#### `runMirrorMotion` {#symbol-runmirrormotion}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L66)
- Returns: [`MirrorMotion`](#symbol-mirrormotion)
- Parameters: `options`: [`MirrorMotionOptions`](#symbol-mirrormotionoptions)

##### `runMirrorMotion` — Summary
Starts the motion; the picture is in its new state when `settle` has been called.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.MirrorTurn`](../../types.ts.mdmd.md#symbol-mirrorturn) (type-only)
- [`mirror-turn.MIRROR_TURN_MS`](./mirror-turn.ts.mdmd.md#symbol-mirror_turn_ms)
- [`mirror-turn.MirrorAxis`](./mirror-turn.ts.mdmd.md#symbol-mirroraxis-interface)
- [`mirror-turn.turnAngle`](./mirror-turn.ts.mdmd.md#symbol-turnangle)
- [`mirror-turn.turnDistance`](./mirror-turn.ts.mdmd.md#symbol-turndistance)
- [`mirror-turn.turnStrength`](./mirror-turn.ts.mdmd.md#symbol-turnstrength)
<!-- LIVE-DOC:END Dependencies -->
