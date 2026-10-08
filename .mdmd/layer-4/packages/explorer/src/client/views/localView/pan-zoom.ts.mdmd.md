# packages/explorer/src/client/views/localView/pan-zoom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/pan-zoom.ts
- Generated At: 2026-10-08T16:03:28.857Z

## Authored
### Purpose

Pure functions for pan/zoom/inertia behavior in the Local Map. Handles mouse drag, wheel zoom, zoom-at-point calculations, and smooth animated transitions with easing curves.

### Notes

- Extracted from controller.ts during Dev Day 50 (12/19) as part of Phase 4 tech-debt reduction. All functions take runtime state as input and callback for state updates, enabling testability without DOM dependencies.
- `animateMapTransform` keeps its target on the runtime (`mapAnimationTarget`) and reads it each frame, so that the controller can shift the camera while an animation runs, when the toolbar above the map grows, without the animation overwriting the shift ([Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)).
- `applyMapTransform`, which nothing called (the controller applies the transform itself), was deleted on 2026-10-08 in [the dead code sweep](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L17)

##### `clamp` — Summary
Clamps a value to a range.

#### `easeOutCubic` {#symbol-easeoutcubic}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L24)

##### `easeOutCubic` — Summary
Easing function for smooth animations.

#### `zoomByFactor` {#symbol-zoombyfactor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L32)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `zoomByFactor` — Summary
Zooms by a factor around the center of the viewport.

#### `zoomAtPoint` {#symbol-zoomatpoint}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L52)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `zoomAtPoint` — Summary
Zooms at a specific point in viewport coordinates.

#### `animateMapTransform` {#symbol-animatemaptransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L74)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime); `target`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)

##### `animateMapTransform` — Summary
Animates the map transform to a target value.

#### `startInertia` {#symbol-startinertia}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L118)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `startInertia` — Summary
Starts inertia-based panning after a drag release.

#### `cancelInertia` {#symbol-cancelinertia}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L152)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `cancelInertia` — Summary
Cancels any ongoing inertia animation.

#### `handleDragMove` {#symbol-handledragmove}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L162)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `handleDragMove` — Summary
Handles mouse move during drag.

#### `handleDragEnd` {#symbol-handledragend}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L195)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `handleDragEnd` — Summary
Handles mouse up after drag, potentially starting inertia.

#### `handleWheel` {#symbol-handlewheel}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L223)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime); `event`: `WheelEvent`

##### `handleWheel` — Summary
Handles wheel events for pan and zoom.

#### `startDrag` {#symbol-startdrag}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/pan-zoom.ts#L263)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `startDrag` — Summary
Starts a drag operation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->
