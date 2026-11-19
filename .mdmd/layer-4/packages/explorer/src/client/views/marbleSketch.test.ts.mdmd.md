# packages/explorer/src/client/views/marbleSketch.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/marbleSketch.test.ts
- Generated At: 2026-11-19T01:28:12.227Z

## Authored
### Purpose
Holds the marble sketch to what makes it useful: the same facts give the same sketch on every load and in any order; the strengths are bounded; one feature more moves the sketch by about as much in a file of five features as of five hundred; the sketch moves further the more features change, and saturates; and a file of few facts has weak strengths.

### Notes
- Written on 2026-11-18 with `marbleSketch.ts`, for the Marble Pattern trial, and rewritten on 2026-11-19 when the wrap took the place of the unit length. The cases run over hundreds of seeded random files, not one example. The size case is the one the unit length failed: there, one feature more in a file a hundred times larger moved the sketch a tenth as far; it now holds the three sizes within a factor of 1.5. Over 400 features the mean move rises from about 0.12 for one changed to about 1.39 for all, near the √2 between two unrelated files.
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
- [`marbleSketch.SKETCH_STRENGTH`](./marbleSketch.ts.mdmd.md#symbol-sketch_strength)
- [`marbleSketch.SKETCH_TURN`](./marbleSketch.ts.mdmd.md#symbol-sketch_turn)
- [`marbleSketch.SketchFeature`](./marbleSketch.ts.mdmd.md#symbol-sketchfeature)
- [`marbleSketch.featureDirection`](./marbleSketch.ts.mdmd.md#symbol-featuredirection)
- [`marbleSketch.featureSum`](./marbleSketch.ts.mdmd.md#symbol-featuresum)
- [`marbleSketch.fileFeatures`](./marbleSketch.ts.mdmd.md#symbol-filefeatures)
- [`marbleSketch.marbleSketches`](./marbleSketch.ts.mdmd.md#symbol-marblesketches)
- [`marbleSketch.sketchDistance`](./marbleSketch.ts.mdmd.md#symbol-sketchdistance)
- [`marbleSketch.sketchOf`](./marbleSketch.ts.mdmd.md#symbol-sketchof)
- [`marbleSketch.strengthsOf`](./marbleSketch.ts.mdmd.md#symbol-strengthsof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
