# packages/explorer/src/client/views/worldMap/inside/model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/inside/model.ts
- Generated At: 2026-09-29T01:55:09.153Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FLAT_FILES` {#symbol-flat_files}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L22)

##### `FLAT_FILES` — Summary
A folder with this many files or fewer, and no folder of its own, shows its files instead of closing into a box.

#### `InsideRow` {#symbol-insiderow}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L24)

#### `InsideCard` {#symbol-insidecard}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L31)

##### `InsideCard` — Summary
A file: a card with its public symbols as rows.

#### `InsideBox` {#symbol-insidebox}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L42)

##### `InsideBox` — Summary
A folder closed into a box.

#### `InsideNode` {#symbol-insidenode}
- Type: type
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L51)
- Returns: [`InsideCard`](#symbol-insidecard), [`InsideBox`](#symbol-insidebox)

#### `InsideLine` {#symbol-insideline}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L53)

#### `InsideEdge` {#symbol-insideedge}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L60)

##### `InsideEdge` — Summary
An edge between two nodes inside, from the consumer to the provider, as the docs write it.

#### `InsideWallNode` {#symbol-insidewallnode}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L73)

##### `InsideWallNode` — Summary
A node a wall pin's edges touch, on which row.

#### `InsideWall` {#symbol-insidewall}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L80)

##### `InsideWall` — Summary
A pin on the wall: what the folder calls beyond itself (`out`, the left wall) or serves to it (`in`, the right wall).

#### `InsideModel` {#symbol-insidemodel}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L88)

#### `InsideOptions` {#symbol-insideoptions}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L99)

#### `buildInsideModel` {#symbol-buildinsidemodel}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L113)
- Returns: [`InsideModel`](#symbol-insidemodel)
- Parameters: `options`: [`InsideOptions`](#symbol-insideoptions)

##### `buildInsideModel` — Summary
Builds the folder map of a thing, or of a folder inside it.

#### `neighboursOf` {#symbol-neighboursof}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L271)
- Parameters: `model`: [`InsideModel`](#symbol-insidemodel)

##### `neighboursOf` — Summary
The nodes a node is wired to, by the edges and the walls.

#### `isUnder` {#symbol-isunder}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L284)

#### `relative` {#symbol-relative}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L288)

#### `basename` {#symbol-basename}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L292)

#### `dirname` {#symbol-dirname}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/model.ts#L296)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.symbolName`](../../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.EdgeBasis`](../../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-edgebasis) (type-only)
- [`graph.LiveDocGraph`](../../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
