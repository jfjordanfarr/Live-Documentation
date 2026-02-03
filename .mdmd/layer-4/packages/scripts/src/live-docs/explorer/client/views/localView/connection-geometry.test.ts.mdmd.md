# packages/scripts/src/live-docs/explorer/client/views/localView/connection-geometry.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/connection-geometry.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-localview-connection-geometry-test-ts
- Generated At: 2026-02-03T21:55:36.275Z

## Authored
### Purpose
Unit tests for connection-geometry.ts covering Bézier path generation, self-loop stubs, gradient definitions, and rect/point primitives.

### Notes
- Created 2025-12-18 (Dev Day 49) alongside connection-geometry.ts extraction
- Tests edge cases: zero horizontal gap, negative coordinates, coincident points
- Validates SVG path string format (`M ... C ...`) for Bézier curves
- Ensures self-loop stubs produce valid arc paths even for symbols in the same node
- Part of the 153-test pure-function module validation suite

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.275Z","inputHash":"018ee33a1bc9be75"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`connection-geometry.BezierTuningParams`](./connection-geometry.ts.mdmd.md#symbol-beziertuningparams)
- [`connection-geometry.DEFAULT_BEZIER_TUNING`](./connection-geometry.ts.mdmd.md#symbol-default_bezier_tuning)
- [`connection-geometry.DEFAULT_SELF_LOOP_PARAMS`](./connection-geometry.ts.mdmd.md#symbol-default_self_loop_params)
- [`connection-geometry.GradientDef`](./connection-geometry.ts.mdmd.md#symbol-gradientdef)
- [`connection-geometry.PathResult`](./connection-geometry.ts.mdmd.md#symbol-pathresult)
- [`connection-geometry.Point`](./connection-geometry.ts.mdmd.md#symbol-point)
- [`connection-geometry.Rect`](./connection-geometry.ts.mdmd.md#symbol-rect)
- [`connection-geometry.SelfLoopParams`](./connection-geometry.ts.mdmd.md#symbol-selfloopparams)
- [`connection-geometry.SelfLoopStubResult`](./connection-geometry.ts.mdmd.md#symbol-selfloopstubresult)
- [`connection-geometry.boundingBoxFromPoints`](./connection-geometry.ts.mdmd.md#symbol-boundingboxfrompoints)
- [`connection-geometry.computeBezierPath`](./connection-geometry.ts.mdmd.md#symbol-computebezierpath)
- [`connection-geometry.computeSelfLoopStubs`](./connection-geometry.ts.mdmd.md#symbol-computeselfloopstubs)
- [`connection-geometry.computeStubLength`](./connection-geometry.ts.mdmd.md#symbol-computestublength)
- [`connection-geometry.createConnectionGradient`](./connection-geometry.ts.mdmd.md#symbol-createconnectiongradient)
- [`connection-geometry.distance`](./connection-geometry.ts.mdmd.md#symbol-distance)
- [`connection-geometry.expandRect`](./connection-geometry.ts.mdmd.md#symbol-expandrect)
- [`connection-geometry.mergeRects`](./connection-geometry.ts.mdmd.md#symbol-mergerects)
- [`connection-geometry.offsetToPinEdge`](./connection-geometry.ts.mdmd.md#symbol-offsettopinedge)
- [`connection-geometry.rectCenter`](./connection-geometry.ts.mdmd.md#symbol-rectcenter)
- [`connection-geometry.rectSize`](./connection-geometry.ts.mdmd.md#symbol-rectsize)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client/views/localView: [connection-geometry.ts](./connection-geometry.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
