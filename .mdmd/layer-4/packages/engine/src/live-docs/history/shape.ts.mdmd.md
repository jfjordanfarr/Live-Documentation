# packages/engine/src/live-docs/history/shape.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/shape.ts
- Generated At: 2026-11-19T06:20:28.604Z

## Authored
### Purpose
A commit's shape by path, each file's archetype, symbol count and entry mark and each directed edge's count, and a step's change applied to it in the format's order; with the differences between two shapes in words, for the builder's replay check.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The derivation and the readers think in paths and the file holds ids; [codec.ts](./codec.ts.mdmd.md) turns one into the other, so that the logic of a step is written once, in the form a reader checks by eye.
- An edge's key joins its two paths with the NUL character, which no path holds.
- `applyChange` never changes the shape it is given, and refuses a step that resizes, rekinds or re-marks a file the shape does not hold.
- `shapeOfSummary` moved here from `summary.ts` on 2026-11-19, when the summary began to keep each file's rows ([Turn 37 of November 18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)): the symbol count is the rows' length and an edge's count the dependency lines and type references that resolved to its target, as `summarizeGraph` had counted the graph's edges, so the summary holds each fact once. Reading a summary is the sequence's work, not the summarizing process's, so the lens leaves it out of its key.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)) a shape also holds `docLinks`, each link from a file's authored words to a document that stood at the change, keyed like an edge by the file and the document's path; a change names the links added and removed, a renamed file's links move with it and a dead file's leave in `docLinksRemoved`, as its edges do. A document is not a file of the shape.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FileShape` {#symbol-fileshape}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L18)

##### `FileShape` — Summary
What the sequence knows of one file at one change.

#### `Shape` {#symbol-shape}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L27)

##### `Shape` — Summary
The shape of the graph at one change.

#### `ShapeChange` {#symbol-shapechange}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L40)

##### `ShapeChange` — Summary
What one step does to a shape, by path; see `StepDelta` for the order it is applied in.

#### `emptyChange` {#symbol-emptychange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L57)
- Returns: [`ShapeChange`](#symbol-shapechange)

##### `emptyChange` — Summary
A change that changes nothing, to be filled in.

#### `edgeKey` {#symbol-edgekey}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L79)

##### `edgeKey` — Summary
The key of the directed edge from one file to another in {@link Shape.edges}.

#### `edgeEnds` {#symbol-edgeends}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L84)

##### `edgeEnds` — Summary
The two ends of an edge's key.

#### `shapeOfSummary` {#symbol-shapeofsummary}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L94)
- Returns: [`Shape`](#symbol-shape)
- Parameters: `summary`: [`CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary)

##### `shapeOfSummary` — Summary
The shape a summary records: each file's symbol count and entry mark, and each directed edge between two different
files counted as the summary's rows make it, one per dependency line and one per type reference that resolved to the
target (what `summarizeGraph` counted from the graph's edges until the summary kept the rows themselves).

#### `renameShape` {#symbol-renameshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L122)
- Returns: [`Shape`](#symbol-shape)
- Parameters: `shape`: [`Shape`](#symbol-shape); `renamed`: `ReadonlyArray`

##### `renameShape` — Summary
The shape with each renamed file moved to its new path, its shape, its edges and its doc links with it.

#### `applyChange` {#symbol-applychange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L146)
- Returns: [`Shape`](#symbol-shape)
- Parameters: `shape`: [`Shape`](#symbol-shape); `change`: [`ShapeChange`](#symbol-shapechange)

##### `applyChange` — Summary
The shape after a step: the given shape with the change applied in the format's order.

#### `shapeDifferences` {#symbol-shapedifferences}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/shape.ts#L189)
- Parameters: `expected`: [`Shape`](#symbol-shape); `actual`: [`Shape`](#symbol-shape)

##### `shapeDifferences` — Summary
Where two shapes differ, in words, at most `limit` of them; empty when they
are the same shape.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`summary.CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
