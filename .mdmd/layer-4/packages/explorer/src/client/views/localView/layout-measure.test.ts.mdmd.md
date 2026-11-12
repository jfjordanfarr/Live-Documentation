# packages/explorer/src/client/views/localView/layout-measure.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/layout-measure.test.ts
- Generated At: 2026-11-12T17:14:37.805Z

## Authored
### Purpose
Unit tests for layout measurement pure functions. Validates clamp behavior, fit-transform calculations with various content/viewport aspect ratios, and scale constraint enforcement.

### Notes
Created during Dev Day 50 (12/19). Tests the mathematical aspects of `computeFitTransform()` without requiring DOM; DOM-dependent measurement is validated via integration tests.
- A picture that fits is kept whole when its focus stands at its edge, and the frame stays full when it does not (2026-10-08).
- `wholeTransform`, the 2D Fit (2026-11-12): a large picture is scaled into the padding and centred, its limiting axis touching the padding; a small one is centred at the reading scale and never magnified past it; and on five shapes the fit stands closer than `farthestScale`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)
- [`layout-measure.LayoutExtents`](./layout-measure.ts.mdmd.md#symbol-layoutextents)
- [`layout-measure.cardReadingTransform`](./layout-measure.ts.mdmd.md#symbol-cardreadingtransform)
- [`layout-measure.clamp`](./layout-measure.ts.mdmd.md#symbol-clamp)
- [`layout-measure.computeFitTransform`](./layout-measure.ts.mdmd.md#symbol-computefittransform)
- [`layout-measure.computePathFitTransform`](./layout-measure.ts.mdmd.md#symbol-computepathfittransform)
- [`layout-measure.focusTransform`](./layout-measure.ts.mdmd.md#symbol-focustransform)
- [`layout-measure.framePadding`](./layout-measure.ts.mdmd.md#symbol-framepadding)
- [`layout-measure.hiddenEdges`](./layout-measure.ts.mdmd.md#symbol-hiddenedges)
- [`layout-measure.settleTransform`](./layout-measure.ts.mdmd.md#symbol-settletransform)
- [`layout-measure.wholeTransform`](./layout-measure.ts.mdmd.md#symbol-wholetransform)
- [`zoom-limits.farthestScale`](./zoom-limits.ts.mdmd.md#symbol-farthestscale)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
