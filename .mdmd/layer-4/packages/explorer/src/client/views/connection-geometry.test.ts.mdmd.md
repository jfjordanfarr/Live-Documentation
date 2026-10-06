# packages/explorer/src/client/views/connection-geometry.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/connection-geometry.test.ts
- Generated At: 2026-10-06T15:18:09.525Z

## Authored
### Purpose

Unit tests for connection-geometry.ts covering Bézier path generation, self-loop stubs, gradient definitions, and rect/point primitives.

### Notes

- Created 2025-12-18 (Dev Day 49) alongside connection-geometry.ts extraction.
- Tests edge cases: zero horizontal gap, negative coordinates, coincident points.
- Validates SVG path string format (`M ... C ...`) for Bézier curves.
- Ensures self-loop stubs produce valid arc paths even for symbols in the same node.
- Part of the 153-test pure-function module validation suite.
- Promoted from `localView/connection-geometry.test.ts` to `views/connection-geometry.test.ts` during Step 0 of the Membrane Map implementation (Dev Day 81).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`connection-geometry.BezierTuningParams`](./connection-geometry.ts.mdmd.md#symbol-beziertuningparams)
- [`connection-geometry.DEFAULT_BEZIER_TUNING`](./connection-geometry.ts.mdmd.md#symbol-default_bezier_tuning)
- [`connection-geometry.DEFAULT_SELF_LOOP_PARAMS`](./connection-geometry.ts.mdmd.md#symbol-default_self_loop_params)
- [`connection-geometry.LACE_PITCH`](./connection-geometry.ts.mdmd.md#symbol-lace_pitch)
- [`connection-geometry.PathResult`](./connection-geometry.ts.mdmd.md#symbol-pathresult)
- [`connection-geometry.Point`](./connection-geometry.ts.mdmd.md#symbol-point)
- [`connection-geometry.Rect`](./connection-geometry.ts.mdmd.md#symbol-rect)
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
