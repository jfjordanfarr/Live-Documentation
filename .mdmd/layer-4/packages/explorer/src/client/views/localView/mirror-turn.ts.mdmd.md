# `packages/explorer/src/client/views/localView/mirror-turn.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/mirror-turn.ts`
- Generated At: 2026-11-22T07:19:56.685Z

## Authored
### Purpose
Holds the arithmetic of the motion between a 2D picture as laid out and mirrored: where the upright axis stands and what each of the two pictures asks of the camera, the angle the picture's plane has turned through at each moment of the turn and of the slide, how far away the viewer stands, and how strongly everything but the held card is drawn as the plane stands edge-on.

### Notes
- Written 2026-11-22 for the owner's idea of the change: "rotating the right side into the forward z-direction away from the viewer and rotating the left side into the reverse z-direction toward the viewer (before continuing that rotation to the other side)". Pure functions; `mirror-motion.ts` is the page's half and the stylesheet draws from the one angle.
- `mirrorAxis` replaced a measurement: the first mirror pressed the button, measured where the held card had gone and moved the camera by the difference. The closed form says the camera of both pictures before anything moves, which a motion needs, and serves the cut as well.
- The angle runs 0 to 180 to mirror and 180 to 360 to come back, never back down, so that the right side goes away from the viewer in both directions, as the owner described it.
- `turnStrength` was added after the first strip of frames: without it the card swinging nearest the viewer covered the subject whole at the edge-on instant ([the strips' record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/mirror/README.md)).
- Kept apart from `reading-direction.ts`, which another builder was extending the same day.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MIRROR_TURN_MS` {#symbol-mirror_turn_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L19)

##### `MIRROR_TURN_MS` — Summary
How long the turn and the slide take, in milliseconds; the cut's fade is a third of it each way.

#### `MirrorAxis (interface)` {#symbol-mirroraxis-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L22)

##### `MirrorAxis (interface)` — Summary
The upright axis a picture is mirrored about, and the camera of each of its two pictures.

#### `mirrorAxis (function)` {#symbol-mirroraxis-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L37)
- Returns: [`MirrorAxis`](#symbol-mirroraxis-interface)

##### `mirrorAxis (function)` — Summary
The axis through `holdAt`, a place on the page that must not move (the held card's middle, or the view's), read
from the picture as it stands: `rootEdge` is the page's x of the layout's own edge, which a mirrored picture is
reflected about, and `camera` the camera now. Reflecting about the edge moves the held place by twice its distance
across, which the mirrored picture's camera gives back.

#### `turnAngle` {#symbol-turnangle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L50)

##### `turnAngle` — Summary
How far the picture's plane has turned, in degrees, at `progress` of the motion: 0 as laid out, 180 mirrored, and on
to 360 on the way back, so that the right side always goes away from the viewer and the left comes toward them. The
turn eases the angle. The slide eases each card's place across instead, a straight line from where it stands to its
mirrored place, which is the angle whose cosine is that share of the way.

#### `turnDistance` {#symbol-turndistance}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L61)

##### `turnDistance` — Summary
How far away the viewer stands from the turning plane, in the page's pixels: far enough that the card swinging
nearest, `reach` from the axis, passes well in front of them, and never nearer than twice the view's width, so that a
small picture is not distorted.

#### `turnStrength` {#symbol-turnstrength}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L71)

##### `turnStrength` — Summary
How strongly everything but the held card is drawn at `angle` of the turn, from 1 at rest to a faint 0.12 edge-on:
as the plane stands edge-on every card is on one line, the ones swinging toward the viewer in front of the one that
holds still, so they and the wires are faded for that moment and the held card alone keeps its strength. Seen
2026-11-22 without it: the nearest card, grown by its nearness, covered the subject whole at the edge-on instant.

#### `TurnKeyframe` {#symbol-turnkeyframe}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L76)

##### `TurnKeyframe` — Summary
One moment of the motion as the browser is given it: how far through, the plane's angle, and the others' strength.

#### `turnKeyframes` {#symbol-turnkeyframes}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/mirror-turn.ts#L83)
- Returns: [`TurnKeyframe`](#symbol-turnkeyframe)[]

##### `turnKeyframes` — Summary
The whole motion as keyframes, evenly spaced, the edge-on instant among them: the browser runs the turn from these
without script, moving in a straight line between each two, so the plane, every card turned back against it and the
fade stay together to the frame. Twenty steps follow the eased angle to within a third of a degree.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.MirrorTurn`](../../types.ts.mdmd.md#symbol-mirrorturn) (type-only)
- [`perspectiveGeometry.transitionEase`](../perspectiveGeometry.ts.mdmd.md#symbol-transitionease)
<!-- LIVE-DOC:END Dependencies -->
