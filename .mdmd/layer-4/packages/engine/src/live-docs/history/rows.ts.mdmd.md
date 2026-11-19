# packages/engine/src/live-docs/history/rows.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/rows.ts
- Generated At: 2026-11-19T19:05:05.593Z

## Authored
### Purpose
The history's second rung: each file's symbol rows and lines at a commit, by path, what a 2D card draws (its public symbols in the doc's order with their kinds, flags and type references, its dependency lines, entries, re-exported anchors, citing documents and the ids of its words), what a step does to them, the links between rows, and the checks a sequence is held to.

### Notes
- Written 2026-11-19 for the owner's three rungs of history in the 2D map ([Turn 35](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of the November 18 record: "all three rungs ... we should", "Then we should really do it"), C15 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The facts are those the summary keeps (`summary.ts`); a text is named here by the id the sequence gives it, not by its hash.
- The links are not kept apart: they are the references and dependency lines that resolved (`linksOf`), so each fact is held once, and the shape's wire counts are checked against them (`rowsAgainstShape`).
- A step's change is named by path and anchor and applied after the shape's change, whose renames, deaths and births it follows: a renamed file keeps its rows and every reference, line and re-export that named it is renamed with it, so a rename costs nothing beyond its shape's line, as [the probe of 2026-11-18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-cost/README.md) found decisive (41.5 KB to 8.5 KB for its largest step). Symbols born carry their place in their file's rows after the step; only when the symbols that stayed change places is the file's order written whole.
- A symbol is believed renamed only on sound evidence: in one file at one step, one gone and one born of the same kind whose descriptions are one text, not none, each the other's only such match. The probe matched kind and source line, which moves with any edit above a symbol; a description unchanged across a rename is the doc's own word that the symbol is the same.
- Rows are shared between moments and never changed in place: a step copies a file the first time it changes it, and a rename copies only the files that name a renamed one, so that replaying a long history costs what the step changes and not the whole snapshot each time; rows are compared field by field rather than as JSON. Over a test history of 260 steps that changed all of 34,000 symbols at each, the first version, which copied every row and compared by JSON at every step, took 97 s, and this one 9.6 s.

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
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L97)
- Returns: [`RowsChange`](#symbol-rowschange)

##### `emptyRowsChange` — Summary
A change of rows that changes nothing, to be filled in.

#### `emptyFileRows` {#symbol-emptyfilerows}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L102)
- Returns: [`FileRows`](#symbol-filerows)

##### `emptyFileRows` — Summary
The rows of a file that has none yet.

#### `rowsOfSummary` {#symbol-rowsofsummary}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L107)
- Returns: [`Rows`](#symbol-rows)
- Parameters: `summary`: [`CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary)

##### `rowsOfSummary` — Summary
The rows a summary records, each text named by the id `textId` gives its hash.

#### `renameRows` {#symbol-renamerows}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L134)
- Returns: [`Rows`](#symbol-rows)
- Parameters: `rows`: [`Rows`](#symbol-rows); `renamed`: `ReadonlyArray`

##### `renameRows` — Summary
The rows with each renamed file moved to its new path, and every reference, line and re-export that named it renamed
with it. A file's rows that name no renamed file are the same object as before: rows are shared between moments and
never changed in place.

#### `deriveRowsChange` {#symbol-deriverowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L171)
- Returns: [`RowsChange`](#symbol-rowschange)
- Parameters: `before`: [`Rows`](#symbol-rows); `after`: [`Rows`](#symbol-rows); `change`: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)

##### `deriveRowsChange` — Summary
The change of rows from one change to the next, given the step's change of shape, whose renames it follows and
whose births and deaths it relies on. Applying the two to `before` gives `after` exactly.

#### `applyRowsChange` {#symbol-applyrowschange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L274)
- Returns: [`Rows`](#symbol-rows)
- Parameters: `rows`: [`Rows`](#symbol-rows); `change`: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange); `rowsChange`: [`RowsChange`](#symbol-rowschange)

##### `applyRowsChange` — Summary
The rows after a step: the step's change of shape and change of rows applied, in the format's order. The rows given
are not changed; a file the step leaves alone is the same object after it.

#### `rowsDifferences` {#symbol-rowsdifferences}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L335)
- Parameters: `expected`: [`Rows`](#symbol-rows); `actual`: [`Rows`](#symbol-rows)

##### `rowsDifferences` — Summary
Where two rows differ, in words, at most `limit` of them; empty when they are the same rows.

#### `RowLink` {#symbol-rowlink}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L366)

##### `RowLink` — Summary
One link between rows: from a symbol of a file, or from the file's dependency lines, to a file or a symbol of it.

#### `linksOf` {#symbol-linksof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L382)
- Returns: [`RowLink`](#symbol-rowlink)[]
- Parameters: `rows`: [`Rows`](#symbol-rows); `from`: `ReadonlySet`

##### `linksOf` — Summary
Every link between two different files the rows make, by its ends and kind with how many references or lines make
it, sorted; only the links of the files `from` names when given. The links of one file to itself are no links.

#### `compareLinks` {#symbol-comparelinks}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L407)
- Parameters: `a`: [`RowLink`](#symbol-rowlink); `b`: [`RowLink`](#symbol-rowlink)

##### `compareLinks` — Summary
Links in a stable order: by their source, its symbol, their target, its symbol, and their kind.

#### `rowsAgainstShape` {#symbol-rowsagainstshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L423)
- Parameters: `rows`: [`Rows`](#symbol-rows)

##### `rowsAgainstShape` — Summary
Where the rows and a shape of the same change disagree about what both carry, in words, at most `limit`: the files,
each file's symbol count and entry mark, and each wire's count, which is the number of the source's lines and
references that resolved to the target. The shape and the rows are written as two streams of deltas; this holds
them to each other at every step.

#### `citedByLabel` {#symbol-citedbylabel}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/rows.ts#L479)

##### `citedByLabel` — Summary
A `Cited By` line's label as the doc writes it, from the citing document's path: a backtick written as an apostrophe (`formatInlineCode`).
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
