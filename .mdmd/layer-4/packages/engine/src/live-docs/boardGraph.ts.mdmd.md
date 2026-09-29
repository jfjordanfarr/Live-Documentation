# packages/engine/src/live-docs/boardGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/boardGraph.ts
- Generated At: 2026-09-29T01:19:52.316Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WireBasis` {#symbol-wirebasis}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L27)

##### `WireBasis` — Summary
How a wire is known: the basis of the edges it stands for, or `declared` for a connection a person wrote.

#### `WireDoor` {#symbol-wiredoor}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L30)

##### `WireDoor` — Summary
A door a wire lands on; the kind is absent when a declared connection names a door nothing serves.

#### `WireLine` {#symbol-wireline}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L36)

##### `WireLine` — Summary
One file-level edge behind a wire: the evidence a hover shows.

#### `Wire` {#symbol-wire}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L44)

##### `Wire` — Summary
One wire between two things.

#### `StandsOn` {#symbol-standson}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L58)

##### `StandsOn` — Summary
Something a thing stands on that lives outside it: what a manifest names and no doc answers to.

#### `ServedDoor` {#symbol-serveddoor}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L66)
- Extends: [`Door`](./board.ts.mdmd.md#symbol-door)

##### `ServedDoor` — Summary
A door a thing serves, with the file whose doc publishes it; no file when the board declares the door.

#### `BoardThing` {#symbol-boardthing}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L71)

##### `BoardThing` — Summary
A thing of the board with what the graph says about it.

#### `BoardGraph` {#symbol-boardgraph}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L84)

##### `BoardGraph` — Summary
A board joined to the graph.

#### `deriveBoardGraph` {#symbol-deriveboardgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L105)
- Returns: [`BoardGraph`](#symbol-boardgraph)
- Parameters: `board`: [`Board`](./board.ts.mdmd.md#symbol-board); `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)

##### `deriveBoardGraph` — Summary
Joins a board to the graph of the workspace it sits in.

##### `deriveBoardGraph` — Parameters
- `board`: The parsed board.
- `boardPath`: Workspace-relative path of the board file, with forward slashes; `From` paths resolve against its folder.
- `graph`: The graph derived from the workspace's docs.

#### `doorsOf` {#symbol-doorsof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L211)
- Returns: [`Door`](./board.ts.mdmd.md#symbol-door)[]
- Parameters: `file`: [`GraphFile`](./graph.ts.mdmd.md#symbol-graphfile)

##### `doorsOf` — Summary
The doors a file serves: its public symbols whose kind is an opening kind.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](./board.ts.mdmd.md#symbol-board)
- [`board.BoardIssue`](./board.ts.mdmd.md#symbol-boardissue)
- [`board.DOOR_KINDS`](./board.ts.mdmd.md#symbol-door_kinds)
- [`board.Door`](./board.ts.mdmd.md#symbol-door)
- [`board.Thing`](./board.ts.mdmd.md#symbol-thing)
- [`document.symbolName`](./document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphFile`](./graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
