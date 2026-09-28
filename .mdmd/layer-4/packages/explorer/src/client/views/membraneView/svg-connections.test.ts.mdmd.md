# packages/explorer/src/client/views/membraneView/svg-connections.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/membraneView/svg-connections.test.ts
- Generated At: 2026-09-27T23:21:29.188Z

## Authored
### Purpose

Verifies the pure-function SVG geometry computations for bundled edge rendering: stroke width scaling, parametric edge exit points, quadratic Bézier curve paths, and midpoint calculation for badge placement.

### Notes

- 16 tests covering: logarithmic stroke width clamping (min 2px, max 10px), edge exit point computation for all four rect edges plus the degenerate center-coincident case, quadratic Bézier SVG path string format, perpendicular control point offset for curvature, midpoint averaging, and zero-distance degenerate paths.
- Tests exercise the `aggregateEdges` function from `edge-bundling.ts` as an integration cross-check, verifying that the bundled-edge pipeline from aggregation through SVG geometry produces correct end-to-end results.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`svg-connections.bundleStrokeWidth`](./svg-connections.ts.mdmd.md#symbol-bundlestrokewidth)
- [`svg-connections.computeBundleCurvePath`](./svg-connections.ts.mdmd.md#symbol-computebundlecurvepath)
- [`svg-connections.computeBundleMidpoint`](./svg-connections.ts.mdmd.md#symbol-computebundlemidpoint)
- [`svg-connections.computeEdgeExitPoint`](./svg-connections.ts.mdmd.md#symbol-computeedgeexitpoint)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
