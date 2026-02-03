# packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-pan-zoom-ts
- Generated At: 2026-02-03T21:55:36.605Z

## Authored
### Purpose
Pure functions for pan/zoom/inertia behavior in the Local Map. Handles mouse drag, wheel zoom, zoom-at-point calculations, and smooth animated transitions with easing curves.

### Notes
Extracted from controller.ts during Dev Day 50 (12/19) as part of Phase 4 tech-debt reduction. All functions take runtime state as input and callback for state updates, enabling testability without DOM dependencies.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.605Z","inputHash":"147a1dd8d917f52c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L17)

##### `clamp` — Summary
Clamps a value to a range.

#### `easeOutCubic` {#symbol-easeoutcubic}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L24)

##### `easeOutCubic` — Summary
Easing function for smooth animations.

#### `applyMapTransform` {#symbol-applymaptransform}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L32)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `applyMapTransform` — Summary
Applies the current map transform to the viewport.

#### `zoomByFactor` {#symbol-zoombyfactor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L42)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `zoomByFactor` — Summary
Zooms by a factor around the center of the viewport.

#### `zoomAtPoint` {#symbol-zoomatpoint}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L62)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `zoomAtPoint` — Summary
Zooms at a specific point in viewport coordinates.

#### `animateMapTransform` {#symbol-animatemaptransform}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L84)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime); `target`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)

##### `animateMapTransform` — Summary
Animates the map transform to a target value.

#### `startInertia` {#symbol-startinertia}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L122)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `startInertia` — Summary
Starts inertia-based panning after a drag release.

#### `cancelInertia` {#symbol-cancelinertia}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L156)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `cancelInertia` — Summary
Cancels any ongoing inertia animation.

#### `handleDragMove` {#symbol-handledragmove}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L166)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `handleDragMove` — Summary
Handles mouse move during drag.

#### `handleDragEnd` {#symbol-handledragend}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L199)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `handleDragEnd` — Summary
Handles mouse up after drag, potentially starting inertia.

#### `handleWheel` {#symbol-handlewheel}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L227)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime); `event`: `WheelEvent`

##### `handleWheel` — Summary
Handles wheel events for pan and zoom.

#### `startDrag` {#symbol-startdrag}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts#L263)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `startDrag` — Summary
Starts a drag operation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pan-zoom.test.ts](./pan-zoom.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
