# packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-svg-connections-test-ts
- Generated At: 2026-03-25T17:08:30.156Z

## Authored
### Purpose

Verifies the pure-function SVG geometry computations for bundled edge rendering: stroke width scaling, parametric edge exit points, quadratic Bézier curve paths, and midpoint calculation for badge placement.

### Notes

- 16 tests covering: logarithmic stroke width clamping (min 2px, max 10px), edge exit point computation for all four rect edges plus the degenerate center-coincident case, quadratic Bézier SVG path string format, perpendicular control point offset for curvature, midpoint averaging, and zero-distance degenerate paths.
- Tests exercise the `aggregateEdges` function from `edge-bundling.ts` as an integration cross-check, verifying that the bundled-edge pipeline from aggregation through SVG geometry produces correct end-to-end results.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:30.156Z","inputHash":"aa3394683a3d0eba"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [layoutUtils.ts](../layoutUtils.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [edge-bundling.ts](./edge-bundling.ts.mdmd.md), [svg-connections.ts](./svg-connections.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
