# packages/explorer/src/client/views/localView/pan-zoom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/pan-zoom.ts
- Generated At: 2026-11-06T20:08:41.749Z

## Authored
### Purpose

Pure functions for pan/zoom/inertia behavior in the Local Map. Handles mouse drag, wheel zoom, zoom-at-point calculations, and smooth animated transitions with easing curves.

### Notes

Wheel, button and animated zoom share a 0.05–3 camera range. Zoom never requests a perspective change; this preserves the zoom-out the [owner wanted during exploration](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3).

- Extracted from controller.ts during Dev Day 50 (12/19) as part of Phase 4 tech-debt reduction. All functions take runtime state as input and callback for state updates, enabling testability without DOM dependencies.
- `animateMapTransform` keeps its target on the runtime (`mapAnimationTarget`) and reads it each frame, so that the controller can shift the camera while an animation runs, when the toolbar above the map grows, without the animation overwriting the shift ([Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)).
- `applyMapTransform`, which nothing called (the controller applies the transform itself), was deleted on 2026-10-08 in [the dead code sweep](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md).

Since 2026-11-06 (the breakpoint pass, [Turns 17 to 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)) `startDrag` clears the animation's destination with its frame: left standing after a drag took the camera, it said that the camera was still on its way, which held the layout's search, sent the next wheel zoom from that destination, and would have kept the camera's motion (`data-camera`) from ending.

Since the far bands' second milestone (2026-11-06) the farthest zoom is the runtime's `zoomFloor`, which the controller derives from the map (`zoom-limits.ts`): the ladder's last step, or four fifths of the scale that frames the whole map where that is farther. The fixed 0.05 is gone; until the map is measured only a guard keeps the scale positive. The closest zoom stays at three.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L25)

##### `clamp` — Summary
Clamps a value to a range.

#### `easeOutCubic` {#symbol-easeoutcubic}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L32)

##### `easeOutCubic` — Summary
Easing function for smooth animations.

#### `zoomByFactor` {#symbol-zoombyfactor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L40)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `zoomByFactor` — Summary
Zooms by a factor around the center of the viewport.

#### `zoomAtPoint` {#symbol-zoomatpoint}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L60)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `zoomAtPoint` — Summary
Zooms at a specific point in viewport coordinates.

#### `animateMapTransform` {#symbol-animatemaptransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L82)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime); `target`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)

##### `animateMapTransform` — Summary
Animates the map transform to a target value.

#### `startInertia` {#symbol-startinertia}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L126)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `startInertia` — Summary
Starts inertia-based panning after a drag release.

#### `cancelInertia` {#symbol-cancelinertia}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L160)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `cancelInertia` — Summary
Cancels any ongoing inertia animation.

#### `handleDragMove` {#symbol-handledragmove}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L170)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `handleDragMove` — Summary
Handles mouse move during drag.

#### `handleDragEnd` {#symbol-handledragend}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L203)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `handleDragEnd` — Summary
Handles mouse up after drag, potentially starting inertia.

#### `handleWheel` {#symbol-handlewheel}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L231)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime); `event`: `WheelEvent`

##### `handleWheel` — Summary
Handles wheel events for pan and zoom.

#### `startDrag` {#symbol-startdrag}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L271)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `startDrag` — Summary
Starts a drag operation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
- [`zoom-limits.CLOSEST_SCALE`](./zoom-limits.ts.mdmd.md#symbol-closest_scale)
- [`zoom-limits.UNMEASURED_FLOOR`](./zoom-limits.ts.mdmd.md#symbol-unmeasured_floor)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
