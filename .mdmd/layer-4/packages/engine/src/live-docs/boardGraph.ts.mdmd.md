# packages/engine/src/live-docs/boardGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/boardGraph.ts
- Generated At: 2026-10-08T19:04:55.063Z

## Authored
### Purpose
Where a board meets the graph. Given a parsed board, the graph derived from the docs and the board's path, it gives each thing its files (the docs under its `From` folder, the deepest folder winning so a nested thing keeps its own), the doors it serves (its files' opening symbols with their files, then what it declares), what it stands on (what its manifests name and no doc answers to), the wires between things that the file-level edges imply, keyed by the door they land on and the basis they were observed with, the declared connections as wires with `declared` as their basis, and what the join found wanting, reported and never refused. It touches no file system, so the CLI and the Explorer call the same function.

### Notes
- Written on 2026-09-28 with the grammar ([Turn 45](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-45)). A wire is what Structurizr calls an implied relationship, which [the survey of declared facts](../../../../../../AI-Agent-Workspace/Research/2026-09-28-declared-facts-prior-art.md) found the C4 tools derive rather than store; the design, and what it does not cover yet (snapshots, the wires of a closed region), are in [Boards](../../../../../layer-3/boards.mdmd.md).
- A file under no thing's folder belongs to nothing, and an edge to or from it implies no wire: a board that leaves a folder out leaves its wires out, by design.
- What a thing stands on is read from the docs of its manifests, told by `MANIFEST_KINDS` in `openings.ts`, the kinds the project and package manifest adapters publish; a new manifest adapter publishes one of them or adds its own there, or its externals are not read here. A `packages.config` publishes no symbol, so the packages it lists are not read as standing-on; this is a gap.
- Wires come out sorted by from, to, door and basis, so the CLI's report and the tests are stable; the lines behind a wire keep the files' order.
- Measured by `boardGraph.test.ts` on six docs rendered through the Live Doc grammar, and by the estate's board in `tests/integration/live-docs/board.test.ts`, where every remote hand-verified edge is a wire.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WireBasis` {#symbol-wirebasis}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L28)

##### `WireBasis` — Summary
How a wire is known: the basis of the edges it stands for, or `declared` for a connection a person wrote.

#### `WireDoor` {#symbol-wiredoor}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L31)

##### `WireDoor` — Summary
A door a wire lands on; the kind is absent when a declared connection names a door nothing serves.

#### `WireLine` {#symbol-wireline}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L37)

##### `WireLine` — Summary
One file-level edge behind a wire: the evidence a hover shows.

#### `Wire` {#symbol-wire}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L45)

##### `Wire` — Summary
One wire between two things.

#### `StandsOn` {#symbol-standson}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L59)

##### `StandsOn` — Summary
Something a thing stands on that lives outside it: what a manifest names and no doc answers to.

#### `ServedDoor` {#symbol-serveddoor}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L67)
- Extends: [`Door`](./board.ts.mdmd.md#symbol-door)

##### `ServedDoor` — Summary
A door a thing serves, with the file whose doc publishes it; no file when the board declares the door.

#### `BoardThing` {#symbol-boardthing}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L72)

##### `BoardThing` — Summary
A thing of the board with what the graph says about it.

#### `BoardGraph` {#symbol-boardgraph}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L85)

##### `BoardGraph` — Summary
A board joined to the graph.

#### `deriveBoardGraph` {#symbol-deriveboardgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L103)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/boardGraph.ts#L209)
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
- [`openings.MANIFEST_KINDS`](./openings.ts.mdmd.md#symbol-manifest_kinds)
<!-- LIVE-DOC:END Dependencies -->
