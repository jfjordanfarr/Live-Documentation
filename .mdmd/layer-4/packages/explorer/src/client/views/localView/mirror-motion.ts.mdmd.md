# `packages/explorer/src/client/views/localView/mirror-motion.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/mirror-motion.ts`
- Generated At: 2026-11-22T14:56:32.893Z

## Authored
### Purpose
Runs the motion Tuning's Mirror Turn chooses when the 2D picture is mirrored or put back: the cut, the default, in which everything but the held card fades out and in around the change; or the turn or the slide, written once as animations on the boxes that move, with the pins exchanged as the plane stands edge-on; and brings the picture to rest exactly once however the motion ends.

### Notes
- Written 2026-11-22. The real cards and wires move: nothing is copied, and no wire is measured or rewritten until the picture rests, since while the plane turns a measurement of the page is not the layout's (the controller's `drawConnections` waits on `holdsWires`).
- The move between 2D and 3D (`views/perspectiveTransition.ts`) was read first and could not serve: it copies the picture, folds the copies to file tokens and moves them between two drawings on a canvas, with no turning plane in it, and making its copies alone takes longer than this motion lasts. Its easing, `transitionEase`, is what is shared.
- The turn has had three forms in one day, each measured on 84 to 86 cards ([the strips' record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/mirror/README.md)). First an angle written on the map's layer each frame, as a custom property the stylesheet turned every card back from: an inherited property restyles every row of every card, and three quarters of the motion went there. Then animations, started under an attribute of the layer that the stylesheet's rules hung on: the attribute's coming and going restyled the same rows. Now animations with what the turn needs (the third dimension kept, the resting reflection set aside) written on the boxes themselves, and no rule of the stylesheet for it: the page's own work in the motion is the cut's.
- The cut first faded the whole layer, the held card with it; the root saw it blank the map for two frames. It now fades every place but the held card's, the wires and the directories' outlines, and the held card, which a mirror does not move, never leaves.
- A second press ends the motion under way at once where it was going (`end`), and the motion lets go of itself before the picture rests, since the rest may start the next motion; `tests/e2e/local-map-mirror.spec.ts` holds it.
- Still dear on a graphics card with depth: the turn stalled for 0.4 to 0.8 s once in each of two runs there while the slide did not. Holding each card's drawing at one size while it turns was not tried.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TURNING_ATTRIBUTE` {#symbol-turning_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L22)

##### `TURNING_ATTRIBUTE` — Summary
The attribute on the map's layer while the picture turns or slides, holding which: for a reader of the page, not for the stylesheet.

#### `MirrorMotionOptions` {#symbol-mirrormotionoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L25)

##### `MirrorMotionOptions` — Summary
What a motion needs of the map, and what it gives back.

#### `MirrorMotion` {#symbol-mirrormotion}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L54)

##### `MirrorMotion` — Summary
A motion under way.

#### `runMirrorMotion` {#symbol-runmirrormotion}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-motion.ts#L64)
- Returns: [`MirrorMotion`](#symbol-mirrormotion)
- Parameters: `options`: [`MirrorMotionOptions`](#symbol-mirrormotionoptions)

##### `runMirrorMotion` — Summary
Starts the motion; the picture is in its new state when `settle` has been called.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.MirrorTurn`](../../types.ts.mdmd.md#symbol-mirrorturn) (type-only)
- [`mirror-turn.MIRROR_TURN_MS`](./mirror-turn.ts.mdmd.md#symbol-mirror_turn_ms)
- [`mirror-turn.MirrorAxis`](./mirror-turn.ts.mdmd.md#symbol-mirroraxis-interface) (type-only)
- [`mirror-turn.turnDistance`](./mirror-turn.ts.mdmd.md#symbol-turndistance)
- [`mirror-turn.turnKeyframes`](./mirror-turn.ts.mdmd.md#symbol-turnkeyframes)
<!-- LIVE-DOC:END Dependencies -->
