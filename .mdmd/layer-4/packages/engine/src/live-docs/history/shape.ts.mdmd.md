# packages/engine/src/live-docs/history/shape.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/shape.ts
- Generated At: 2026-10-22T16:47:53.368Z

## Authored
### Purpose
A commit's shape by path, each file's archetype, symbol count and entry mark and each directed edge's count, and a step's change applied to it in the format's order; with the differences between two shapes in words, for the builder's replay check.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The derivation and the readers think in paths and the file holds ids; [codec.ts](./codec.ts.mdmd.md) turns one into the other, so that the logic of a step is written once, in the form a reader checks by eye.
- An edge's key joins its two paths with the NUL character, which no path holds.
- `applyChange` never changes the shape it is given, and refuses a step that resizes, rekinds or re-marks a file the shape does not hold.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) a shape also holds `docLinks`, each link from a file's authored words to a document that stood at the change, keyed like an edge by the file and the document's path; a change names the links added and removed, a renamed file's links move with it and a dead file's leave in `docLinksRemoved`, as its edges do. A document is not a file of the shape.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FileShape` {#symbol-fileshape}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L16)

##### `FileShape` — Summary
What the sequence knows of one file at one change.

#### `Shape` {#symbol-shape}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L25)

##### `Shape` — Summary
The shape of the graph at one change.

#### `ShapeChange` {#symbol-shapechange}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L38)

##### `ShapeChange` — Summary
What one step does to a shape, by path; see `StepDelta` for the order it is applied in.

#### `emptyChange` {#symbol-emptychange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L55)
- Returns: [`ShapeChange`](#symbol-shapechange)

##### `emptyChange` — Summary
A change that changes nothing, to be filled in.

#### `edgeKey` {#symbol-edgekey}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L77)

##### `edgeKey` — Summary
The key of the directed edge from one file to another in {@link Shape.edges}.

#### `edgeEnds` {#symbol-edgeends}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L82)

##### `edgeEnds` — Summary
The two ends of an edge's key.

#### `renameShape` {#symbol-renameshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L88)
- Returns: [`Shape`](#symbol-shape)
- Parameters: `shape`: [`Shape`](#symbol-shape); `renamed`: `ReadonlyArray`

##### `renameShape` — Summary
The shape with each renamed file moved to its new path, its shape, its edges and its doc links with it.

#### `applyChange` {#symbol-applychange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L112)
- Returns: [`Shape`](#symbol-shape)
- Parameters: `shape`: [`Shape`](#symbol-shape); `change`: [`ShapeChange`](#symbol-shapechange)

##### `applyChange` — Summary
The shape after a step: the given shape with the change applied in the format's order.

#### `shapeDifferences` {#symbol-shapedifferences}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L155)
- Parameters: `expected`: [`Shape`](#symbol-shape); `actual`: [`Shape`](#symbol-shape)

##### `shapeDifferences` — Summary
Where two shapes differ, in words, at most `limit` of them; empty when they
are the same shape.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
