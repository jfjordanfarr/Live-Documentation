# packages/explorer/src/client/views/perspectiveTransition.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveTransition.ts
- Generated At: 2026-10-03T18:25:55.106Z

## Authored
### Purpose
Draws temporary correspondences between native Local Map cards and the Force Graph’s projected file positions.

### Notes
Keeps the source picture while the destination initializes. Captures measured cards, sampled native SVG symbol curves and directory shells. Curves gather by file pair as cards fold into named points; only then do the points move to the native force projection. Directory shells disappear from the scan root inward, and return from the direct directories outward on the reverse journey. Geometry and phases live in the pure companion module. Copies are inert and carry no live control hooks; reduced-motion preferences bypass the animation. It computes no alternative graph layout and changes no saved pins or canonical relationships.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SceneFile` {#symbol-scenefile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L4)

##### `SceneFile` — Summary
Screen-space correspondence between native cards and native force positions.

#### `ForceScene` {#symbol-forcescene}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L14)

##### `ForceScene` — Summary
A frozen projection of the native force scene, without introducing another layout.

#### `LocalScene` {#symbol-localscene}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L47)

##### `LocalScene` — Summary
Native reading geometry, captured before the view is hidden or its camera changes.

#### `captureLocalScene` {#symbol-capturelocalscene}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L54)
- Returns: [`LocalScene`](#symbol-localscene)

##### `captureLocalScene` — Summary
Capture native cards, rendered symbol curves and directory shells before hiding their view.

#### `animatePerspective` {#symbol-animateperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L100)
- Parameters: `scene`: [`LocalScene`](#symbol-localscene); `graph`: [`ForceScene`](#symbol-forcescene); `viewport`: `DOMRect`

##### `animatePerspective` — Summary
Fold cards to named file tokens, then rearrange those tokens to the native
projection. Reverse the same sequence on approach. Canonical edges and pins
are not changed by this temporary, non-interactive drawing.

#### `holdPerspective` {#symbol-holdperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L224)

##### `holdPerspective` — Summary
Hold the source picture while the destination renderer produces its first frame.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`perspectiveGeometry.TransitionPoint`](./perspectiveGeometry.ts.mdmd.md#symbol-transitionpoint)
- [`perspectiveGeometry.directoryOpacity`](./perspectiveGeometry.ts.mdmd.md#symbol-directoryopacity)
- [`perspectiveGeometry.gatherWire`](./perspectiveGeometry.ts.mdmd.md#symbol-gatherwire)
- [`perspectiveGeometry.perspectivePhases`](./perspectiveGeometry.ts.mdmd.md#symbol-perspectivephases)
<!-- LIVE-DOC:END Dependencies -->
