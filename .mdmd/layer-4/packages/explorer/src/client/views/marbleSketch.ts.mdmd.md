# packages/explorer/src/client/views/marbleSketch.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/marbleSketch.ts
- Generated At: 2026-11-19T01:28:12.232Z

## Authored
### Purpose
Makes each file's marble sketch: eight numbers that sum up what its Live Doc lists, so that the 3D map can bend the file's marble veins by them, a little for a small change and wholly for a rewrite. It is a sketch, not a hash: a file that changes a little moves a little.

### Notes
- Written on 2026-11-18 for the Marble Pattern trial, after the owner's wish in [Turn 20 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-20): "Minor changes to files produce subtle shifts on the surface of these little marble planets. Massive changes to files completely changes their patterns." The idea was the root's, and a builder wrote it.
- Each fact is a feature with a fixed direction in eight dimensions, drawn from its text by an ordinary hash. The sketch is the weighted sum of these directions with each of its eight components wrapped through a sine, `0.5 · sin(sum / 4)` (`SKETCH_STRENGTH`, `SKETCH_TURN`). Until 2026-11-19 the sum was brought to unit length instead, which divided every change by the file's size so that no commit to a large file showed; with the wrap one fact more turns each wave by the same amount in any file, and a file of few facts has weak strengths, a nearly plain marble. TURN was chosen by eye from sheets at 2, 4 and 8. The features are the facts that a step of the history carries too: the count of public symbols, each its own feature, and each file used, weighted by the square root of its references. That way a marble at a step of the history matches today's wherever the file has not changed. The file's path is one more feature, of one symbol's weight.
- What uses a file is not one of its features: its own Live Doc does not list them, and the blue vein already counts them. Symbol names are left out for the same reason the history leaves them out, so a renamed symbol moves nothing; nor does a change inside a function's body.
- The shader that reads the sketch is `MARBLE_WAVES` in `forceGraphAppearance.ts`. The pictures that judged it are in [the marble-patterns evidence](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/marble-patterns/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SKETCH_DIMENSIONS` {#symbol-sketch_dimensions}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L35)

##### `SKETCH_DIMENSIONS` — Summary
The sketch's dimensions: the waves over the ball, one strength each.

#### `SKETCH_TURN` {#symbol-sketch_turn}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L42)

##### `SKETCH_TURN` — Summary
How much change of a component of the features' sum turns its wave's strength by a radian. Chosen by eye on
2026-11-19 from sheets at 2, 4 and 8 (the marble-patterns pictures of November 18): one fact is a shift found when
looked for, and a commit of thirty lines to a large file a shift seen at a glance.

#### `SKETCH_STRENGTH` {#symbol-sketch_strength}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L49)

##### `SKETCH_STRENGTH` — Summary
The strength of a wave at the crest of its sine. A large file's components are spread evenly round the circle, where
a sine's root mean square is 1/√2, so one half gives each strength a root mean square of 1/√8 and the eight together
a length of about one: the unit length the sketch had before the wrap, so that a Vein Bend means what it meant.

#### `SketchFeature` {#symbol-sketchfeature}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L52)

##### `SketchFeature` — Summary
One fact of a file, as text, and how much it counts.

#### `Sketch` {#symbol-sketch}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L55)

##### `Sketch` — Summary
A sketch: `SKETCH_DIMENSIONS` strengths, each within ±`SKETCH_STRENGTH`.

#### `featureDirection` {#symbol-featuredirection}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L85)
- Returns: [`Sketch`](#symbol-sketch)

##### `featureDirection` — Summary
A feature's fixed direction, a unit vector of `SKETCH_DIMENSIONS` numbers drawn from its text: normal numbers, so that
every direction is as likely as any other, the same on every load.

#### `OWN_PATH_WEIGHT` {#symbol-own_path_weight}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L104)

##### `OWN_PATH_WEIGHT` — Summary
The weight of the file's own path among its features: one symbol's.

#### `featureSum` {#symbol-featuresum}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L110)
- Parameters: `features`: `Iterable`

##### `featureSum` — Summary
The features' directions summed by weight, with the file's path among them, in the order of their texts so that the
order they are given in does not matter: the sum before the wrap.

#### `strengthsOf` {#symbol-strengthsof}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L123)

##### `strengthsOf` — Summary
A sum's strengths: each component wrapped through a sine, `turn` of it a radian.

#### `sketchOf` {#symbol-sketchof}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L126)

##### `sketchOf` — Summary
A file's sketch from its features and its path.

#### `fileFeatures` {#symbol-filefeatures}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L133)
- Returns: [`SketchFeature`](#symbol-sketchfeature)[]
- Parameters: `uses`: `ReadonlyMap`

##### `fileFeatures` — Summary
The features of a file from what its Live Doc lists that the history also carries: one for each of its public symbols,
named by the file and the symbol's place in the count, and one for each file it uses, weighted by the square root of
the references it makes to it (as if each reference were a feature of its own direction).

#### `sketchDistance` {#symbol-sketchdistance}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L141)

##### `sketchDistance` — Summary
The distance between two sketches, 0 for the same.

#### `marbleFeatureSums` {#symbol-marblefeaturesums}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L156)
- Returns: `ReadonlyMap`
- Parameters: `graph`: `SketchGraph`

##### `marbleFeatureSums` — Summary
Every file's features' sum in a scan's graph, today's or a moment of the history's, by id: its symbols by count (a
moment's files carry the count alone, today's the names, of which the count is taken), and the files it uses with the
references it makes to each, summed over the links between the two.

#### `marbleSketches` {#symbol-marblesketches}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/marbleSketch.ts#L177)
- Returns: `ReadonlyMap`
- Parameters: `graph`: `SketchGraph`

##### `marbleSketches` — Summary
Every file's sketch in a scan's graph, by id: its features' sum wrapped (`marbleFeatureSums`, `strengthsOf`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
