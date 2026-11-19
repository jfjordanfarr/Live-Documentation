# packages/engine/src/live-docs/history/rows.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/rows.ts
- Generated At: 2026-11-19T06:20:28.569Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RowSymbol` {#symbol-rowsymbol}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L35)

##### `RowSymbol` — Summary
One public symbol of a file at a change: a row of its card.

#### `AuthoredWords` {#symbol-authoredwords}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L53)

##### `AuthoredWords` — Summary
What is known of a file's authored words at a change: the id of their text; `unread`, when a doc stood whose form
today's reader cannot read the words of; or `none`, when no doc of the file stood where the lens reads it.

#### `FileRows` {#symbol-filerows}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L56)

##### `FileRows` — Summary
A file's rows and lines at a change.

#### `Rows` {#symbol-rows}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L69)

##### `Rows` — Summary
Every file's rows at a change, by its workspace-relative path.

#### `RowsChange` {#symbol-rowschange}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L72)

##### `RowsChange` — Summary
What one step does to the rows, by path and anchor; applied after the step's {@link ShapeChange}, in this order.

#### `emptyRowsChange` {#symbol-emptyrowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L94)
- Returns: [`RowsChange`](#symbol-rowschange)

##### `emptyRowsChange` — Summary
A change of rows that changes nothing, to be filled in.

#### `emptyFileRows` {#symbol-emptyfilerows}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L99)
- Returns: [`FileRows`](#symbol-filerows)

##### `emptyFileRows` — Summary
The rows of a file that has none yet.

#### `rowsOfSummary` {#symbol-rowsofsummary}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L104)
- Returns: [`Rows`](#symbol-rows)
- Parameters: `summary`: [`CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary)

##### `rowsOfSummary` — Summary
The rows a summary records, each text named by the id `textId` gives its hash.

#### `renameRows` {#symbol-renamerows}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L131)
- Returns: [`Rows`](#symbol-rows)
- Parameters: `rows`: [`Rows`](#symbol-rows); `renamed`: `ReadonlyArray`

##### `renameRows` — Summary
The rows with each renamed file moved to its new path, and every reference, line and re-export that named it renamed
with it. A file's rows that name no renamed file are the same object as before: rows are shared between moments and
never changed in place.

#### `deriveRowsChange` {#symbol-deriverowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L168)
- Returns: [`RowsChange`](#symbol-rowschange)
- Parameters: `before`: [`Rows`](#symbol-rows); `after`: [`Rows`](#symbol-rows); `change`: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)

##### `deriveRowsChange` — Summary
The change of rows from one change to the next, given the step's change of shape, whose renames it follows and
whose births and deaths it relies on. Applying the two to `before` gives `after` exactly.

#### `applyRowsChange` {#symbol-applyrowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L239)
- Returns: [`Rows`](#symbol-rows)
- Parameters: `rows`: [`Rows`](#symbol-rows); `change`: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange); `rowsChange`: [`RowsChange`](#symbol-rowschange)

##### `applyRowsChange` — Summary
The rows after a step: the step's change of shape and change of rows applied, in the format's order. The rows given
are not changed; a file the step leaves alone is the same object after it.

#### `rowsDifferences` {#symbol-rowsdifferences}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L291)
- Parameters: `expected`: [`Rows`](#symbol-rows); `actual`: [`Rows`](#symbol-rows)

##### `rowsDifferences` — Summary
Where two rows differ, in words, at most `limit` of them; empty when they are the same rows.

#### `RowLink` {#symbol-rowlink}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L322)

##### `RowLink` — Summary
One link between rows: from a symbol of a file, or from the file's dependency lines, to a file or a symbol of it.

#### `linksOf` {#symbol-linksof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L338)
- Returns: [`RowLink`](#symbol-rowlink)[]
- Parameters: `rows`: [`Rows`](#symbol-rows); `from`: `ReadonlySet`

##### `linksOf` — Summary
Every link between two different files the rows make, by its ends and kind with how many references or lines make
it, sorted; only the links of the files `from` names when given. The links of one file to itself are no links.

#### `compareLinks` {#symbol-comparelinks}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L363)
- Parameters: `a`: [`RowLink`](#symbol-rowlink); `b`: [`RowLink`](#symbol-rowlink)

##### `compareLinks` — Summary
Links in a stable order: by their source, its symbol, their target, its symbol, and their kind.

#### `rowsAgainstShape` {#symbol-rowsagainstshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L379)
- Parameters: `rows`: [`Rows`](#symbol-rows)

##### `rowsAgainstShape` — Summary
Where the rows and a shape of the same change disagree about what both carry, in words, at most `limit`: the files,
each file's symbol count and entry mark, and each wire's count, which is the number of the source's lines and
references that resolved to the target. The shape and the rows are written as two streams of deltas; this holds
them to each other at every step.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.EdgeKind`](../graph.ts.mdmd.md#symbol-edgekind) (type-only)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange) (type-only)
- [`summary.CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary) (type-only)
- [`summary.DependencyRow`](./summary.ts.mdmd.md#symbol-dependencyrow) (type-only)
- [`summary.EntryRow`](./summary.ts.mdmd.md#symbol-entryrow) (type-only)
- [`summary.ReExportRow`](./summary.ts.mdmd.md#symbol-reexportrow) (type-only)
- [`summary.RowReference`](./summary.ts.mdmd.md#symbol-rowreference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
