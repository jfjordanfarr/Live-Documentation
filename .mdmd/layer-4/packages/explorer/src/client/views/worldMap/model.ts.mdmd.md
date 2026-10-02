# packages/explorer/src/client/views/worldMap/model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/model.ts
- Generated At: 2026-10-02T22:33:03.781Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Tint` {#symbol-tint}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L21)

#### `WorldPiece` {#symbol-worldpiece}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L24)

##### `WorldPiece` — Summary
A thing drawn as a solid on the board.

#### `WorldRegion` {#symbol-worldregion}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L42)

##### `WorldRegion` — Summary
A thing that holds things, drawn as a tinted region around them.

#### `WorldRoad` {#symbol-worldroad}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L55)

##### `WorldRoad` — Summary
A wire between two pieces.

#### `WorldCrossing` {#symbol-worldcrossing}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L69)

##### `WorldCrossing` — Summary
A declared connection between two regions.

#### `WorldToken` {#symbol-worldtoken}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L77)

##### `WorldToken` — Summary
Something two or more pieces stand on.

#### `WorldModel` {#symbol-worldmodel}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L84)

#### `buildWorldModel` {#symbol-buildworldmodel}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L98)
- Returns: [`WorldModel`](#symbol-worldmodel)
- Parameters: `board`: [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board); `joined`: [`BoardGraph`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-boardgraph); `graph`: [`LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `buildWorldModel` — Summary
Builds what the World Map draws.

#### `regionsOf` {#symbol-regionsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/model.ts#L189)
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
- [`boardGraph.ServedDoor`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-serveddoor) (type-only)
- [`boardGraph.StandsOn`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-standson) (type-only)
- [`boardGraph.WireBasis`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wirebasis) (type-only)
- [`boardGraph.WireDoor`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wiredoor) (type-only)
- [`boardGraph.WireLine`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wireline) (type-only)
- [`graph.LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`layout.Shape`](./layout.ts.mdmd.md#symbol-shape) (type-only)
- [`projection.Point2`](./projection.ts.mdmd.md#symbol-point2) (type-only)
<!-- LIVE-DOC:END Dependencies -->
