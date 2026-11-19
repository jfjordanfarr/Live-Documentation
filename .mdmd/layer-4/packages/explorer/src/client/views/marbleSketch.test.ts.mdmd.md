# packages/explorer/src/client/views/marbleSketch.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/marbleSketch.test.ts
- Generated At: 2026-11-19T00:59:27.927Z

## Authored
### Purpose
Holds the marble sketch to what makes it useful: the same contents give the same sketch on every load, the order of features does not matter, and the sketch moves further the more of a file differs.

### Notes
- Written on 2026-11-18 with `marbleSketch.ts`, for the Marble Pattern trial. The test for nearness runs over 300 seeded random files of forty features, not one example, and requires the mean distance to rise with the share of features changed. That share runs from one feature in forty (about 0.22) to all of them (about 1.39, near the √2 between two unrelated files).
- It also holds that a file today and the same file at a step of the history get equal sketches when both list the same facts: today's graph names symbols and splits a pair's references over several links, while the history's graph gives only the count and one link with the references summed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`marbleSketch.OWN_PATH_WEIGHT`](./marbleSketch.ts.mdmd.md#symbol-own_path_weight)
- [`marbleSketch.SKETCH_DIMENSIONS`](./marbleSketch.ts.mdmd.md#symbol-sketch_dimensions)
- [`marbleSketch.SketchFeature`](./marbleSketch.ts.mdmd.md#symbol-sketchfeature)
- [`marbleSketch.featureDirection`](./marbleSketch.ts.mdmd.md#symbol-featuredirection)
- [`marbleSketch.fileFeatures`](./marbleSketch.ts.mdmd.md#symbol-filefeatures)
- [`marbleSketch.marbleSketches`](./marbleSketch.ts.mdmd.md#symbol-marblesketches)
- [`marbleSketch.sketchDistance`](./marbleSketch.ts.mdmd.md#symbol-sketchdistance)
- [`marbleSketch.sketchOf`](./marbleSketch.ts.mdmd.md#symbol-sketchof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
