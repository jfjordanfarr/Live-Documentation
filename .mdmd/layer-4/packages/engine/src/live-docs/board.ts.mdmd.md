# packages/engine/src/live-docs/board.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/board.ts
- Generated At: 2026-09-28T21:15:51.097Z

## Authored
### Purpose
The grammar of a board, the one markdown file in which a person declares an estate: its things, each with a kind, the folder its docs come from, the doors it promises and what it holds; the connections no scan can see; a legend of how each kind is drawn; and where each thing sits. `renderBoard` writes a board and `parseBoard` reads one back, inverses as the Live Doc grammar's are, refusing anything outside the grammar; `lintBoard` checks what the grammar alone cannot. Nothing here reads the docs: the join is `boardGraph.ts`.

### Notes
- Written on 2026-09-28 as the last of the five growths the vision's step 3 lists, the evening the owner set the board's shape: two nouns, kinds as free labels drawn through a legend, floors as an arrangement the tool forgets, and where a board lives left to the host that opens it ([Turn 43](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-43) and [Turn 45](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-45)). The proposal with the owner's words is [board-text.md](../../../../../../AI-Agent-Workspace/Probes/2026-09-28/board-text.md); the design, and the forks still open, are in [Boards](../../../../../layer-3/boards.mdmd.md).
- The strict sections carry no `LIVE-DOC` markers because a person writes them, so the parser's refusals and `lintBoard` are the whole gate. A change to a line's form changes `renderBoard`, `parseBoard` and the round-trip test together, and reaches the two real boards: the estate sample's `board.md` and [this repository's](../../../../../layer-3/board.mdmd.md), which the integration test keeps valid.
- `DOOR_KINDS` are the opening kinds of `openings.ts`, so a door a person promises is one the docs could publish. `SHAPES` and `TINTS` are the words the World Map can draw; `DEFAULT_LEGEND` covers the kinds a manifest's doc publishes (`web`, `service`, `program`, `library`) and four a person is likely to write. `legendFor` looks a kind up in the board's legend first, then the tool's; a kind neither knows gets no entry.
- Measured by `board.test.ts`: one full board byte for byte, the empty placeholders, seven refusals and twelve lint faults on one board.

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
