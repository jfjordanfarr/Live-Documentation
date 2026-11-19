# packages/explorer/src/client/views/localView/camera-intent.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/camera-intent.ts
- Generated At: 2026-11-19T01:56:29.030Z

## Authored
### Purpose
The 2D camera's arithmetic and timing for the intent a gesture declares: where an arrival that frames the neighbours comes to rest, the hold and ease that take it there and the inputs that end them, and the least pan that brings a step's newcomer into view. Pure, so that the frame is a function of the picture and the view alone; the controller measures the page and moves the camera.

### Notes
Written on 2026-11-19 for the camera-intent round, from two requests of the owner's: on the hidden-file cells, "I might wish the camera followed the newly-opened one though, as I quickly lose it" (November 18), and, after blind testers all had to move the view before they could say what uses a file, "perhaps that's a reasonable best-of-both-worlds default? The user simply will not know that the deepest level of detail exists unless we show it to them" (November 19). A pre-timed zoom-out had been proposed on November 4 and not selected; the owner proposed it themself this time, and it is a Tuning choice, not the default, until the owner has seen it.

The floor of the neighbours' frame is the connections look's last press (`farthestRatioOf` in `ladder-steps.ts`), the farthest zoom at which every card's names still read; the timings are the three named constants here. A card larger than the view is entered at its top rather than shown by its name row at the view's far edge, a choice made in the building after the first pictures. The evidence is in [the camera-intent pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/camera-intent/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ARRIVAL_HOLD_MS` {#symbol-arrival_hold_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L16)

##### `ARRIVAL_HOLD_MS` — Summary
How long the arrival rests on the subject at reading size, once the picture has settled, before it eases back.

#### `ARRIVAL_EASE_MS` {#symbol-arrival_ease_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L18)

##### `ARRIVAL_EASE_MS` — Summary
How long the ease from reading size to the neighbours takes.

#### `STEP_MARK_MS` {#symbol-step_mark_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L20)

##### `STEP_MARK_MS` — Summary
How long a newcomer's outline is drawn emphasised, fading to its usual look.

#### `ARRIVAL_FLOOR_RATIO` {#symbol-arrival_floor_ratio}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L27)

##### `ARRIVAL_FLOOR_RATIO` — Summary
The farthest an arrival frames the neighbours, as a ratio of reading scale: the connections look's last press, the
farthest zoom at which every card's names still read (ladder-steps.ts). Farther, the overview look strips a card to its
file's name alone.

#### `arrivalEndFrame` {#symbol-arrivalendframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L36)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `content`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `subject`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `arrivalEndFrame` — Summary
Where an arrival comes to rest when it frames the neighbours: what Fit frames (the whole picture, centred inside the
frame's padding), but never closer than reading scale and never farther than {@link ARRIVAL_FLOOR_RATIO} of it; where
that floor stops it short of the whole picture, the subject is centred at the floor and the far neighbours are cut.
Content and subject are in the picture's own units, the frame in the screen's; the result depends on nothing else, so
that two screens of one size land on one frame.

#### `ArrivalPhase` {#symbol-arrivalphase}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L46)

##### `ArrivalPhase` — Summary
The arrival's moment: resting at reading size, easing back, or done.

#### `arrivalPose` {#symbol-arrivalpose}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L54)
- Parameters: `start`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `end`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `arrivalPose` — Summary
The camera of an arrival that eases back to the neighbours, `elapsed` milliseconds after the picture settled at
reading size (`start`): still for {@link ARRIVAL_HOLD_MS}, then eased in and out to `end` over {@link ARRIVAL_EASE_MS}.
The scale is eased in its logarithm, so that the zoom reads as even; the point under the frame's middle travels in a
straight line between the two frames' middles.

#### `easeInOutCubic` {#symbol-easeinoutcubic}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L69)

##### `easeInOutCubic` — Summary
Ease in and out, cubic.

#### `ARRIVAL_ENDING_INPUTS` {#symbol-arrival_ending_inputs}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L77)

##### `ARRIVAL_ENDING_INPUTS` — Summary
The input of a person's on the map that ends an arrival where it stands: their hand outranks the camera. A pointer
pressed, a wheel turned, a key pressed or a touch begun; a pointer that only passes over the map does not.

#### `revealPan` {#symbol-revealpan}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L86)
- Parameters: `newcomer`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `revealPan` — Summary
The least pan, in the screen's pixels, that brings a newcomer wholly inside the frame's padding at the camera given.
Where the newcomer is larger than the room along an axis, its start is brought to the room's start along it, as a
page is entered at its top left: a card taller than the view is entered at its name row with as much of it below as
the view holds, and an opened directory at its label. A newcomer already inside does not move the camera. The
newcomer is in the picture's own units.

#### `unionOf` {#symbol-unionof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L100)
- Returns: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)

##### `unionOf` — Summary
Every box given as one, in the same units; null for none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ladder-steps.farthestRatioOf`](./ladder-steps.ts.mdmd.md#symbol-farthestratioof)
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)
- [`layout-measure.Frame`](./layout-measure.ts.mdmd.md#symbol-frame)
- [`layout-measure.clamp`](./layout-measure.ts.mdmd.md#symbol-clamp)
- [`layout-measure.framePadding`](./layout-measure.ts.mdmd.md#symbol-framepadding)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
