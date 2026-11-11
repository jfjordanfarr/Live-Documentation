# packages/explorer/src/client/views/perspectiveBodies.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/perspectiveBodies.test.ts
- Generated At: 2026-11-09T00:01:55.460Z

## Authored
### Purpose
Protects finite, faithful projection of submitted container geometry with analytical camera cases and explicit draw-state expectations.

### Notes
Current regression tests, created with the November 8 frozen-carrier repair. A box under a 90-degree camera supplies independently calculable projected bounds. Crossing near/far planes, a center on the camera plane, wholly clipped and nonfinite geometry, and offscreen sides exercise projection failures that ordinary resting pictures miss. Interior cases preserve only supplied marks, their colors, alpha, veil and nesting, and verify that later input mutation cannot change a frozen projection. Buffer tests separately compare capture to actual uploaded matrices and geometry; browser checks compare carried outlines and colored marks with those uploads.

The native compatibility cases compare the carried clipped polygons against independent Three ray intersections of the actual twelve-segment FrontSide sphere. A near-cut hole, far cap, completely clipped front and eye-inside case preserve native geometry rather than substituting an analytic sphere.
Since 2026-11-11 a case checks that the step of the history's light on a skin and on a bubble within it survives the projection, and that a body drawn unlit carries none ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`perspectiveBodies.FrozenSpatialBody`](./perspectiveBodies.ts.mdmd.md#symbol-frozenspatialbody)
- [`perspectiveBodies.SceneBody`](./perspectiveBodies.ts.mdmd.md#symbol-scenebody)
- [`perspectiveBodies.projectSpatialBodies`](./perspectiveBodies.ts.mdmd.md#symbol-projectspatialbodies)
- `three` - `BoxGeometry`, `Matrix4`, `Mesh`, `MeshBasicMaterial`, `PerspectiveCamera`, `Raycaster`, `SphereGeometry`, `Vector2`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
