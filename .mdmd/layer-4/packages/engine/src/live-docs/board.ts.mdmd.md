# packages/engine/src/live-docs/board.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/board.ts
- Generated At: 2026-09-28T21:15:51.097Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Board` {#symbol-board}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L27)

##### `Board` — Summary
A board, as written to disk: everything the file says and nothing else.

#### `Thing` {#symbol-thing}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L45)

##### `Thing` — Summary
Anything on the board: a system, a database, a person, a region that holds others.

#### `Door` {#symbol-door}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L59)

##### `Door` — Summary
An opening a thing serves: its name and the opening kind the docs use.

#### `Connection` {#symbol-connection}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L65)

##### `Connection` — Summary
A connection no scan can see, with `declared` as its basis.

#### `LegendEntry` {#symbol-legendentry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L75)

##### `LegendEntry` — Summary
How a kind is drawn: a shape for a thing that holds nothing, a tint for one that holds things.

#### `Placement` {#symbol-placement}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L81)

##### `Placement` — Summary
Where a thing sits on the board plane, in board units.

#### `SHAPES` {#symbol-shapes}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L88)
- Returns: `ReadonlySet`

##### `SHAPES` — Summary
The shapes the tool ships.

#### `TINTS` {#symbol-tints}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L91)
- Returns: `ReadonlySet`

##### `TINTS` — Summary
The tints the tool ships, drawn light on the white board and deep on the dark one.

#### `DOOR_KINDS` {#symbol-door_kinds}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L94)
- Returns: `ReadonlySet`

##### `DOOR_KINDS` — Summary
The opening kinds a door may have: the kinds the docs already publish.

#### `DEFAULT_LEGEND` {#symbol-default_legend}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L97)
- Returns: `ReadonlyArray`

##### `DEFAULT_LEGEND` — Summary
How the tool draws the kinds it knows when the legend does not say.

#### `renderBoard` {#symbol-renderboard}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L133)
- Parameters: `board`: [`Board`](#symbol-board)

##### `renderBoard` — Summary
Writes a board as markdown. The output always ends with one newline.

#### `parseBoard` {#symbol-parseboard}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L174)
- Returns: [`Board`](#symbol-board)

##### `parseBoard` — Summary
Reads a board back from markdown, refusing anything outside the grammar.

#### `BoardIssue` {#symbol-boardissue}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L325)

##### `BoardIssue` — Summary
Something wrong with a board that the grammar alone cannot refuse.

#### `lintBoard` {#symbol-lintboard}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L336)
- Returns: [`BoardIssue`](#symbol-boardissue)[]
- Parameters: `board`: [`Board`](#symbol-board)

##### `lintBoard` — Summary
Checks what the grammar cannot: names unique and declared, a thing held by
at most one other and never by itself through any chain, door kinds and
legend words the tool knows, and a layout that names each thing once. What
needs the docs, a `From` that resolves and a door that is served, is checked
where the board meets the graph.

#### `legendFor` {#symbol-legendfor}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/board.ts#L426)
- Returns: [`LegendEntry`](#symbol-legendentry)
- Parameters: `board`: [`Board`](#symbol-board)

##### `legendFor` — Summary
The legend entry for a kind: the board's own, or the tool's default, or nothing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.LiveDocSyntaxError`](./document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.Reader`](./document.ts.mdmd.md#symbol-reader)
- [`openings.ADDRESS_KIND`](./openings.ts.mdmd.md#symbol-address_kind)
- [`openings.ROUTE_KIND`](./openings.ts.mdmd.md#symbol-route_kind)
- [`openings.SQL_OBJECT_KINDS`](./openings.ts.mdmd.md#symbol-sql_object_kinds)
<!-- LIVE-DOC:END Dependencies -->
