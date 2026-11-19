# packages/explorer/src/client/views/marbleSketch.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/marbleSketch.ts
- Generated At: 2026-11-19T00:59:27.932Z

## Authored
### Purpose
Makes each file's marble sketch: eight numbers that sum up what its Live Doc lists, so that the 3D map can bend the file's marble veins by them, a little for a small change and wholly for a rewrite. It is a sketch, not a hash: a file that changes a little moves a little.

### Notes
- Written on 2026-11-18 for the Marble Pattern trial, after the owner's wish in [Turn 20 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-20): "Minor changes to files produce subtle shifts on the surface of these little marble planets. Massive changes to files completely changes their patterns." The idea was the root's, and a builder wrote it.
- Each fact is a feature with a fixed direction in eight dimensions, drawn from its text by an ordinary hash. The sketch is the weighted sum of these directions, brought to unit length. The features are the facts that a step of the history carries too: the count of public symbols, each its own feature, and each file used, weighted by the square root of its references. That way a marble at a step of the history matches today's wherever the file has not changed. The file's path is one more feature, of one symbol's weight.
- What uses a file is not one of its features: its own Live Doc does not list them, and the blue vein already counts them. Symbol names are left out for the same reason the history leaves them out, so a renamed symbol moves nothing; nor does a change inside a function's body.
- The shader that reads the sketch is `MARBLE_WAVES` in `forceGraphAppearance.ts`. The pictures that judged it are in [the marble-patterns evidence](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/marble-patterns/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SKETCH_DIMENSIONS` {#symbol-sketch_dimensions}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L25)

##### `SKETCH_DIMENSIONS` — Summary
The sketch's dimensions: the waves over the ball, one strength each.

#### `SketchFeature` {#symbol-sketchfeature}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L28)

##### `SketchFeature` — Summary
One fact of a file, as text, and how much it counts.

#### `Sketch` {#symbol-sketch}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L31)

##### `Sketch` — Summary
A sketch: `SKETCH_DIMENSIONS` numbers whose squares sum to one.

#### `featureDirection` {#symbol-featuredirection}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L61)
- Returns: [`Sketch`](#symbol-sketch)

##### `featureDirection` — Summary
A feature's fixed direction, a unit vector of `SKETCH_DIMENSIONS` numbers drawn from its text: normal numbers, so that
every direction is as likely as any other, the same on every load.

#### `OWN_PATH_WEIGHT` {#symbol-own_path_weight}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L80)

##### `OWN_PATH_WEIGHT` — Summary
The weight of the file's own path among its features: one symbol's.

#### `sketchOf` {#symbol-sketchof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L86)
- Returns: [`Sketch`](#symbol-sketch)
- Parameters: `features`: `Iterable`

##### `sketchOf` — Summary
A file's sketch from its features and its path: their directions summed by weight, in the order of their texts so that
the order they are given in does not matter, and brought to unit length. A file of no features is its path's direction.

#### `fileFeatures` {#symbol-filefeatures}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L105)
- Returns: [`SketchFeature`](#symbol-sketchfeature)[]
- Parameters: `uses`: `ReadonlyMap`

##### `fileFeatures` — Summary
The features of a file from what its Live Doc lists that the history also carries: one for each of its public symbols,
named by the file and the symbol's place in the count, and one for each file it uses, weighted by the square root of
the references it makes to it (as if each reference were a feature of its own direction).

#### `sketchDistance` {#symbol-sketchdistance}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L113)

##### `sketchDistance` — Summary
The distance between two sketches, 0 for the same and 2 for opposite.

#### `marbleSketches` {#symbol-marblesketches}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L127)
- Returns: `ReadonlyMap`
- Parameters: `graph`: `SketchGraph`

##### `marbleSketches` — Summary
Every file's sketch in a scan's graph, today's or a moment of the history's, by id: its symbols by count (a moment's
files carry the count alone, today's the names, of which the count is taken), and the files it uses with the
references it makes to each, summed over the links between the two.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
