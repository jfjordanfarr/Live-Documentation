# packages/explorer/src/client/views/localView/zoom-limits.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/zoom-limits.ts
- Generated At: 2026-11-06T20:08:42.629Z

## Authored
### Purpose

The 2D Local Map's farthest zoom as a pure function of the map's content, the frame and the calibrated reading scale: the card ladder's last step, where the drawing stops changing, or four fifths of the scale that frames the whole map where that is farther; null before the map is measured, so that the camera is not trapped before the first layout. Also the closest zoom and the guard kept until the map is measured. The controller writes the result on the runtime, where every zoom (wheel, pinch, button, animation) reads it.

### Notes

Written in the far bands' second milestone (2026-11-06), after the owner's "Limits limits limits. Clamps clamps clamps" ([November 6, Turn 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)) and the root's finding that a fixed farthest zoom of 0.05 let every map shrink to a frozen postage stamp long after the whole of it was in view. The limit is the least of the last step's scale and four fifths of the whole map's fit, so that it falls continuously as the map grows, rather than jumping where the map just fits at the last step. The fit is the one `layout-measure.ts` computes for a picture framed whole, its own padding and share included, with its bounds opened, and it caps itself at 1 and never falls below 0.05 times its share; the closest zoom stays at three.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WHOLE_MAP_MARGIN` {#symbol-whole_map_margin}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/zoom-limits.ts#L14)

##### `WHOLE_MAP_MARGIN` — Summary
The share of the whole map's fit the farthest zoom keeps, so that the map stands in the frame with a margin.

#### `CLOSEST_SCALE` {#symbol-closest_scale}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/zoom-limits.ts#L17)

##### `CLOSEST_SCALE` — Summary
The closest zoom, unchanged: three times the map's own size.

#### `UNMEASURED_FLOOR` {#symbol-unmeasured_floor}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/zoom-limits.ts#L20)

##### `UNMEASURED_FLOOR` — Summary
A guard for a camera whose map has not been measured yet: no limit but that the scale stays positive.

#### `Extent` {#symbol-extent}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/zoom-limits.ts#L23)

##### `Extent` — Summary
A box's size, the map's content's or the frame's, in pixels.

#### `farthestScale` {#symbol-farthestscale}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/zoom-limits.ts#L36)
- Parameters: `content`: [`Extent`](#symbol-extent); `frame`: [`Extent`](#symbol-extent)

##### `farthestScale` — Summary
The farthest scale the camera may take, from the map's content in its own units, the frame on screen and the reading
scale the arrival calibrated: the least of the ladder's last step (the reading scale times STEP_RATIO to the power of
-LAST_STEP) and four fifths of the scale at which the map's fit shows the whole map, so that a map larger than the frame
at the last step can still be seen whole, with a margin, and one smaller stops where its drawing stops changing. Null
while the content or the frame is not yet measured, or the reading scale not known, so that the camera is not trapped
before the first layout; the caller then keeps {@link UNMEASURED_FLOOR}.

#### `atScale` {#symbol-atscale}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/zoom-limits.ts#L46)

##### `atScale` — Summary
Whether a scale stands at a limit, within the rounding a camera's arithmetic leaves.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ladder-steps.LAST_STEP`](./ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.STEP_RATIO`](./ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`layout-measure.computeFitTransform`](./layout-measure.ts.mdmd.md#symbol-computefittransform)
<!-- LIVE-DOC:END Dependencies -->
