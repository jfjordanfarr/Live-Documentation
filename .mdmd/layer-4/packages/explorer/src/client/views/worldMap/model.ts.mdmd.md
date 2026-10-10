# packages/explorer/src/client/views/worldMap/model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/model.ts
- Generated At: 2026-10-10T17:19:03.810Z

## Authored
### Purpose
What the World Map draws, read from a board joined to the graph, as pure data: a thing that holds things is a region with a tint; every other thing is a piece with a shape, its files, symbols, doors and what it stands on; a wire between two pieces is a road, in the air door to door when it is a call (it lands on a door or was observed beyond source) and on the board when one piece stands on another's code; a declared connection between two regions is a crossing; what two or more pieces stand on outside the board is a token they share; the board's Layout gives positions for pieces; and what could not be drawn is said in words.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)). The words piece, region, road, crossing and token are the renderer's; the vision's picture still says piece, district, tunnel and wire, a difference [Boards](../../../../../../../layer-3/boards.mdmd.md) notes for when the World Map is rebuilt. Shapes and tints come from the board's legend through `legendFor`, with `cube` and `grey` for a kind it does not know.
- A wire that joins a thing and a region is not drawn, and the model says so in its issues; what a closed region shows of its members' wires is the design's open question ([the survey of groups](../../../../../../../../AI-Agent-Workspace/Research/2026-09-28-groups-and-nested-boards.md)).
- Measured by `model.test.ts` on five docs rendered through the Live Doc grammar and a board with nested regions, an imagined thing and a person.
- Since 2026-10-10 ([Turn 12 of the October 9 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-12)) a piece carries its ghosts from the join, one per name and basis with the files that call it, for the controller to draw as doors with no road.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Tint` {#symbol-tint}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L22)

##### `Tint` — Summary
The tints a region may be drawn in, light on the white board and deep on the dark one.

#### `WorldPiece` {#symbol-worldpiece}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L25)

##### `WorldPiece` — Summary
A thing drawn as a solid on the board.

#### `WorldRegion` {#symbol-worldregion}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L45)

##### `WorldRegion` — Summary
A thing that holds things, drawn as a tinted region around them.

#### `WorldRoad` {#symbol-worldroad}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L58)

##### `WorldRoad` — Summary
A wire between two pieces.

#### `WorldCrossing` {#symbol-worldcrossing}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L72)

##### `WorldCrossing` — Summary
A declared connection between two regions.

#### `WorldToken` {#symbol-worldtoken}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L80)

##### `WorldToken` — Summary
Something two or more pieces stand on.

#### `WorldModel` {#symbol-worldmodel}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L88)

##### `WorldModel` — Summary
Everything the World Map draws, derived from a board joined to the graph: the pieces, regions, roads, crossings and tokens, the positions the board places, and what could not be drawn.

#### `buildWorldModel` {#symbol-buildworldmodel}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L102)
- Returns: [`WorldModel`](#symbol-worldmodel)
- Parameters: `board`: [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board); `joined`: [`BoardGraph`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-boardgraph); `graph`: [`LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `buildWorldModel` — Summary
Builds what the World Map draws.

#### `regionsOf` {#symbol-regionsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L194)
- Returns: [`WorldRegion`](#symbol-worldregion)[]
- Parameters: `model`: [`WorldModel`](#symbol-worldmodel)

##### `regionsOf` — Summary
The region a piece is in, at every depth, nearest first.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board)
- [`board.SHAPES`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-shapes)
- [`board.TINTS`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-tints)
- [`board.legendFor`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-legendfor)
- [`BoardGraph`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-boardgraph) (type-only)
- [`boardGraph.Ghost`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-ghost) (type-only)
- [`boardGraph.ServedDoor`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-serveddoor) (type-only)
- [`boardGraph.StandsOn`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-standson) (type-only)
- [`boardGraph.WireBasis`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wirebasis) (type-only)
- [`boardGraph.WireDoor`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wiredoor) (type-only)
- [`boardGraph.WireLine`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wireline) (type-only)
- [`graph.LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`layout.Shape`](./layout.ts.mdmd.md#symbol-shape) (type-only)
- [`projection.Point2`](./projection.ts.mdmd.md#symbol-point2) (type-only)
<!-- LIVE-DOC:END Dependencies -->
