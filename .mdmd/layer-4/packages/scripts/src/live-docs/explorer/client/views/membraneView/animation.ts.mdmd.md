# packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-animation-ts
- Generated At: 2026-03-26T19:43:20.931Z

## Authored
### Purpose

FLIP animation utilities for the Membrane Map, enabling smooth visual continuity when the DOM is rebuilt during browse-to-pin-active transitions and selection changes.

### Notes

- Created in [Dev Day 82](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-26.1.md) to extract animation logic from the Membrane Map index module into a dedicated, importable module.
- Exports three functions: `capturePositions` snapshots all `data-id`-bearing elements; `animateTransition` performs the FLIP (First-Last-Invert-Play) dance with CSS transforms, returning a `Promise<void>` that resolves when the animation completes; `animateLineDrawIn` applies stroke-dashoffset animation to SVG path elements.
- Positions are normalised to unscaled container-local coordinates so FLIP deltas remain valid across zoom/pan changes.
- The Promise-based `animateTransition` API is architecturally significant: callers (index.ts) defer SVG connection drawing until the Promise resolves, ensuring anchor positions are at their final locations before measurement.
- Fade-in handling: elements present only in the new DOM (no matching `data-id` in old snapshot) receive an opacity fade-in instead of a positional FLIP.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-26T19:43:20.931Z","inputHash":"c7ec7dad925f1941"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PositionSnapshot` {#symbol-positionsnapshot}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts#L20)

##### `PositionSnapshot` — Summary
Captured position snapshot for a single element.

#### `PositionMap` {#symbol-positionmap}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts#L28)
- Returns: `ReadonlyMap`

##### `PositionMap` — Summary
Map of element data-id → position snapshot.

#### `capturePositions` {#symbol-capturepositions}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts#L53)
- Returns: [`PositionMap`](#symbol-positionmap)

##### `capturePositions` — Summary
Snapshot the bounding rects of all elements with `data-id` attributes
within the given container. Positions are normalised to **unscaled**
container-local coordinates so FLIP deltas remain valid even when the
container's CSS transform (zoom/pan) changes between capture and
playback.

##### `capturePositions` — Parameters
- `container`: The membrane container element
- `scale`: Current zoom scale factor (transform.k)

#### `animateTransition` {#symbol-animatetransition}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts#L89)
- Parameters: `oldPositions`: [`PositionMap`](#symbol-positionmap)

##### `animateTransition` — Summary
Apply FLIP animation: move elements from their old positions to
their new positions with a smooth CSS transition.

Call this immediately after the new DOM has been appended to the
container (before the browser paints — i.e., synchronously after
DOM insertion, before any rAF).

Elements present in both old and new snapshots are FLIP-animated.
Elements only in the new DOM fade in.

##### `animateTransition` — Parameters
- `container`: The membrane container element
- `oldPositions`: Snapshot from {@link capturePositions}
- `scale`: Current (post-render) zoom scale factor (transform.k)

#### `animateLineDrawIn` {#symbol-animatelinedrawin}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/animation.ts#L216)
- Parameters: `path`: `SVGPathElement`

##### `animateLineDrawIn` — Summary
Apply a "line draw" animation to an SVG path element.

Uses stroke-dasharray / stroke-dashoffset to animate the path
being drawn from start to end. The path should already be in the
DOM with its `d` attribute set.

##### `animateLineDrawIn` — Parameters
- `durationMs`: Animation duration in milliseconds (default 350)
- `path`: The SVG path element to animate
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pin-state.test.ts](./pin-state.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
