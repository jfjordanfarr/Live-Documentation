# packages/engine/src/live-docs/history/codec.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/codec.ts
- Generated At: 2026-10-18T00:39:18.685Z

## Authored
### Purpose
Between the sequence's file and its meaning: an interner for paths and archetypes, each written once and named by its index, and the encoding of shapes and changes into the tuples of `history.json` and back.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). Interning is what keeps a sequence small: in [the probe](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md) the path table was 99.6 KB of 272,627 bytes, where full snapshots as JSON would have been about 250 MB.
- A shape's new paths are interned in path order, so a base's ids follow its paths; an empty list is left out of a delta, and decoding puts it back.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Interner` {#symbol-interner}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L14)

##### `Interner` — Summary
A table of strings, each written once, each named by its index.

#### `Tables` {#symbol-tables}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L40)

##### `Tables` — Summary
The tables a sequence's tuples are read against.

#### `Interners` {#symbol-interners}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L46)

##### `Interners` — Summary
The tables a sequence's tuples are written against, growing as new paths and archetypes are met.

#### `encodeShape` {#symbol-encodeshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L52)
- Returns: [`SnapshotTuples`](./format.ts.mdmd.md#symbol-snapshottuples)
- Parameters: `shape`: [`Shape`](./shape.ts.mdmd.md#symbol-shape); `interners`: [`Interners`](#symbol-interners)

##### `encodeShape` — Summary
A shape as tuples sorted by id; a path new to the tables is added in path order.

#### `decodeShape` {#symbol-decodeshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L64)
- Returns: [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- Parameters: `tuples`: [`SnapshotTuples`](./format.ts.mdmd.md#symbol-snapshottuples); `tables`: [`Tables`](#symbol-tables)

##### `decodeShape` — Summary
The shape a snapshot's tuples describe.

#### `encodeChange` {#symbol-encodechange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L77)
- Returns: [`StepDelta`](./format.ts.mdmd.md#symbol-stepdelta)
- Parameters: `change`: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange); `interners`: [`Interners`](#symbol-interners)

##### `encodeChange` — Summary
A change as a step's delta, its empty lists left out.

#### `decodeChange` {#symbol-decodechange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L95)
- Returns: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- Parameters: `delta`: [`StepDelta`](./format.ts.mdmd.md#symbol-stepdelta); `tables`: [`Tables`](#symbol-tables)

##### `decodeChange` — Summary
The change a step's delta describes, every list present.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.EdgeTuple`](./format.ts.mdmd.md#symbol-edgetuple) (type-only)
- [`format.FileTuple`](./format.ts.mdmd.md#symbol-filetuple) (type-only)
- [`format.SnapshotTuples`](./format.ts.mdmd.md#symbol-snapshottuples) (type-only)
- [`format.StepDelta`](./format.ts.mdmd.md#symbol-stepdelta) (type-only)
- [`shape.FileShape`](./shape.ts.mdmd.md#symbol-fileshape)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- [`shape.edgeEnds`](./shape.ts.mdmd.md#symbol-edgeends)
- [`shape.edgeKey`](./shape.ts.mdmd.md#symbol-edgekey)
- [`shape.emptyChange`](./shape.ts.mdmd.md#symbol-emptychange)
<!-- LIVE-DOC:END Dependencies -->
