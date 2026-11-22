# `packages/explorer/src/client/views/localView/camera-intent.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/camera-intent.test.ts`
- Generated At: 2026-11-22T07:12:55.530Z

## Authored
### Purpose
Vitest cases for the camera's intent arithmetic: the neighbours' frame between reading scale and the connections look's floor, centred on the subject where the floor binds; the hold, the ease in and out and its straight path; and a step's least pan, a tall card entered at its top.

### Notes
Written with `camera-intent.ts` on 2026-11-19; the browser's half is `tests/e2e/camera-intent.spec.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-presets.LAYOUT_RANGES`](../../layout-presets.ts.mdmd.md#symbol-layout_ranges)
- [`local-storage.getDefaultTuning`](../../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.ARRIVAL_WAITS`](../../types.ts.mdmd.md#symbol-arrival_waits)
- [`camera-intent.ARRIVAL_EASE_MS`](./camera-intent.ts.mdmd.md#symbol-arrival_ease_ms)
- [`camera-intent.ARRIVAL_ENDING_INPUTS`](./camera-intent.ts.mdmd.md#symbol-arrival_ending_inputs)
- [`camera-intent.ARRIVAL_FLOOR_RATIO`](./camera-intent.ts.mdmd.md#symbol-arrival_floor_ratio)
- [`camera-intent.ARRIVAL_REST_S`](./camera-intent.ts.mdmd.md#symbol-arrival_rest_s)
- [`camera-intent.FRAMING_EASE_MAX_MS`](./camera-intent.ts.mdmd.md#symbol-framing_ease_max_ms)
- [`camera-intent.FRAMING_EASE_MIN_MS`](./camera-intent.ts.mdmd.md#symbol-framing_ease_min_ms)
- [`camera-intent.FramingTarget`](./camera-intent.ts.mdmd.md#symbol-framingtarget) (type-only)
- [`camera-intent.arrivalEndFrame`](./camera-intent.ts.mdmd.md#symbol-arrivalendframe)
- [`camera-intent.arrivalEndedBy`](./camera-intent.ts.mdmd.md#symbol-arrivalendedby)
- [`camera-intent.arrivalLookChange`](./camera-intent.ts.mdmd.md#symbol-arrivallookchange-function)
- [`camera-intent.arrivalPose`](./camera-intent.ts.mdmd.md#symbol-arrivalpose)
- [`camera-intent.arrivalReleased`](./camera-intent.ts.mdmd.md#symbol-arrivalreleased)
- [`camera-intent.arrivalRestStartsAgain`](./camera-intent.ts.mdmd.md#symbol-arrivalreststartsagain)
- [`camera-intent.cutByEdge`](./camera-intent.ts.mdmd.md#symbol-cutbyedge)
- [`camera-intent.cutPan`](./camera-intent.ts.mdmd.md#symbol-cutpan)
- [`camera-intent.easeInOutCubic`](./camera-intent.ts.mdmd.md#symbol-easeinoutcubic)
- [`camera-intent.framingEaseMs`](./camera-intent.ts.mdmd.md#symbol-framingeasems)
- [`camera-intent.framingTravel`](./camera-intent.ts.mdmd.md#symbol-framingtravel)
- [`camera-intent.holdAsked`](./camera-intent.ts.mdmd.md#symbol-holdasked)
- [`camera-intent.keepFrame`](./camera-intent.ts.mdmd.md#symbol-keepframe)
- [`camera-intent.pinsFrame`](./camera-intent.ts.mdmd.md#symbol-pinsframe)
- [`camera-intent.poseBetween`](./camera-intent.ts.mdmd.md#symbol-posebetween)
- [`camera-intent.revealPan`](./camera-intent.ts.mdmd.md#symbol-revealpan)
- [`camera-intent.sameCamera`](./camera-intent.ts.mdmd.md#symbol-samecamera)
- [`camera-intent.smoothZoom`](./camera-intent.ts.mdmd.md#symbol-smoothzoom)
- [`camera-intent.stepLinesFrame`](./camera-intent.ts.mdmd.md#symbol-steplinesframe)
- [`camera-intent.stepWholeFrame`](./camera-intent.ts.mdmd.md#symbol-stepwholeframe)
- [`camera-intent.unionOf`](./camera-intent.ts.mdmd.md#symbol-unionof)
- [`ladder-steps.STEP_RATIO`](./ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`ladder-steps.zoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-function)
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds) (type-only)
- [`layout-measure.framePadding`](./layout-measure.ts.mdmd.md#symbol-framepadding)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
