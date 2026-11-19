# packages/engine/src/live-docs/history/codec.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/codec.ts
- Generated At: 2026-11-19T06:20:28.484Z

## Authored
### Purpose
Between the sequence's file and its meaning: an interner for paths and archetypes, each written once and named by its index, and the encoding of shapes and changes into the tuples of `history.json` and back.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). Interning is what keeps a sequence small: in [the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md) the path table was 99.6 KB of 272,627 bytes, where full snapshots as JSON would have been about 250 MB.
- A shape's new paths are interned in path order, so a base's ids follow its paths; an empty list is left out of a delta, and decoding puts it back.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)) the codec carries doc links in snapshots and steps; a document's path is interned in the same table as the files', where a step first names it.
- Since 2026-11-19 ([Turn 37 of November 18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)) it carries the rows of format 3 (`rows.ts`): every name the rows use, a heading, an anchor, a kind, a role, a type, a label, interned once in a third table; each tuple's elements left out from its end where they are their defaults; a symbol named in a step by its file's path id and its anchor's name id, so a step decodes on its own. The shape's encoders take only the shape's tables (`ShapeInterners`), so that their callers need not know the names. Decoding the rows is stateless, like decoding the shape: `rowsChangeAt` decodes any step without a replay.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Interner` {#symbol-interner}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L30)

##### `Interner` — Summary
A table of strings, each written once, each named by its index.

#### `Tables` {#symbol-tables}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L56)

##### `Tables` — Summary
The tables a sequence's shape tuples are read against.

#### `RowTables` {#symbol-rowtables}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L62)
- Extends: [`Tables`](#symbol-tables)

##### `RowTables` — Summary
The tables a sequence's rows are read against: the shape's, and the names of format 3.

#### `ShapeInterners` {#symbol-shapeinterners}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L67)

##### `ShapeInterners` — Summary
The tables a sequence's shape tuples are written against, growing as new paths and archetypes are met.

#### `Interners` {#symbol-interners}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L73)
- Extends: [`ShapeInterners`](#symbol-shapeinterners)

##### `Interners` — Summary
The tables all of a sequence's tuples are written against, the names of format 3 with the shape's.

#### `newInterners` {#symbol-newinterners}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L78)
- Returns: [`Interners`](#symbol-interners)

##### `newInterners` — Summary
Empty tables to write a sequence against.

#### `encodeShape` {#symbol-encodeshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L83)
- Returns: [`ShapeTuples`](./format.ts.mdmd.md#symbol-shapetuples)
- Parameters: `shape`: [`Shape`](./shape.ts.mdmd.md#symbol-shape); `interners`: [`ShapeInterners`](#symbol-shapeinterners)

##### `encodeShape` — Summary
A shape as tuples sorted by id; a path new to the tables is added in path order.

#### `decodeShape` {#symbol-decodeshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L100)
- Returns: [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- Parameters: `tuples`: [`ShapeTuples`](./format.ts.mdmd.md#symbol-shapetuples); `tables`: [`Tables`](#symbol-tables)

##### `decodeShape` — Summary
The shape a snapshot's tuples describe.

#### `encodeChange` {#symbol-encodechange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L117)
- Returns: [`StepDelta`](./format.ts.mdmd.md#symbol-stepdelta)
- Parameters: `change`: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange); `interners`: [`ShapeInterners`](#symbol-shapeinterners)

##### `encodeChange` — Summary
A change as a step's delta, its empty lists left out.

#### `decodeChange` {#symbol-decodechange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L137)
- Returns: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- Parameters: `delta`: [`StepDelta`](./format.ts.mdmd.md#symbol-stepdelta); `tables`: [`Tables`](#symbol-tables)

##### `decodeChange` — Summary
The change a step's delta describes, every list present.

#### `encodeRows` {#symbol-encoderows}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L157)
- Returns: [`FileRowsTuple`](./format.ts.mdmd.md#symbol-filerowstuple)[]
- Parameters: `rows`: [`Rows`](./rows.ts.mdmd.md#symbol-rows); `interners`: [`Interners`](#symbol-interners)

##### `encodeRows` — Summary
Every file's rows as tuples, sorted by path id; a path or name new to the tables is added as it is met, in path order.

#### `decodeRows` {#symbol-decoderows}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L163)
- Returns: [`Rows`](./rows.ts.mdmd.md#symbol-rows)
- Parameters: `tables`: [`RowTables`](#symbol-rowtables)

##### `decodeRows` — Summary
The rows a snapshot's row tuples describe.

#### `encodeRowsChange` {#symbol-encoderowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L172)
- Returns: [`StepDelta`](./format.ts.mdmd.md#symbol-stepdelta)
- Parameters: `change`: [`RowsChange`](./rows.ts.mdmd.md#symbol-rowschange); `interners`: [`Interners`](#symbol-interners)

##### `encodeRowsChange` — Summary
A change of rows as the rows' part of a step's delta, its empty lists left out.

#### `decodeRowsChange` {#symbol-decoderowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/codec.ts#L189)
- Returns: [`RowsChange`](./rows.ts.mdmd.md#symbol-rowschange)
- Parameters: `delta`: [`StepDelta`](./format.ts.mdmd.md#symbol-stepdelta); `tables`: [`RowTables`](#symbol-rowtables)

##### `decodeRowsChange` — Summary
The change of rows a step's delta describes, every list present.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.DependencyTuple`](./format.ts.mdmd.md#symbol-dependencytuple)
- [`format.EdgeEnds`](./format.ts.mdmd.md#symbol-edgeends)
- [`format.EdgeTuple`](./format.ts.mdmd.md#symbol-edgetuple)
- [`format.EntryTuple`](./format.ts.mdmd.md#symbol-entrytuple)
- [`format.FileRowsTuple`](./format.ts.mdmd.md#symbol-filerowstuple)
- [`format.FileTuple`](./format.ts.mdmd.md#symbol-filetuple)
- [`format.NO_WORDS`](./format.ts.mdmd.md#symbol-no_words)
- [`format.ReExportTuple`](./format.ts.mdmd.md#symbol-reexporttuple)
- [`format.ReferenceTuple`](./format.ts.mdmd.md#symbol-referencetuple)
- [`format.ShapeTuples`](./format.ts.mdmd.md#symbol-shapetuples)
- [`format.StepDelta`](./format.ts.mdmd.md#symbol-stepdelta)
- [`format.SymbolTuple`](./format.ts.mdmd.md#symbol-symboltuple)
- [`format.UNREAD_WORDS`](./format.ts.mdmd.md#symbol-unread_words)
- [`rows.AuthoredWords`](./rows.ts.mdmd.md#symbol-authoredwords)
- [`rows.FileRows`](./rows.ts.mdmd.md#symbol-filerows)
- [`rows.RowSymbol`](./rows.ts.mdmd.md#symbol-rowsymbol)
- [`Rows`](./rows.ts.mdmd.md#symbol-rows)
- [`rows.RowsChange`](./rows.ts.mdmd.md#symbol-rowschange)
- [`rows.emptyFileRows`](./rows.ts.mdmd.md#symbol-emptyfilerows)
- [`rows.emptyRowsChange`](./rows.ts.mdmd.md#symbol-emptyrowschange)
- [`shape.FileShape`](./shape.ts.mdmd.md#symbol-fileshape)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- [`shape.edgeEnds`](./shape.ts.mdmd.md#symbol-edgeends)
- [`shape.edgeKey`](./shape.ts.mdmd.md#symbol-edgekey)
- [`shape.emptyChange`](./shape.ts.mdmd.md#symbol-emptychange)
- [`summary.DependencyRow`](./summary.ts.mdmd.md#symbol-dependencyrow) (type-only)
- [`summary.EntryRow`](./summary.ts.mdmd.md#symbol-entryrow) (type-only)
- [`summary.ReExportRow`](./summary.ts.mdmd.md#symbol-reexportrow) (type-only)
- [`summary.ReferenceRole`](./summary.ts.mdmd.md#symbol-referencerole) (type-only)
- [`summary.RowReference`](./summary.ts.mdmd.md#symbol-rowreference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
