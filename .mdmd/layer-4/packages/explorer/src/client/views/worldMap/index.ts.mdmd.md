# packages/explorer/src/client/views/worldMap/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/index.ts
- Generated At: 2026-10-02T22:31:59.248Z

## Authored
### Purpose
The World Map view's door: reads the bundle's board text, refuses it with a note when it is not a board or has faults, joins it to the graph with the engine's own modules, builds the model, and gives a `WorldMapController` the root to draw into with the two ways out of the view, a file into the Local Map and a thing's folder into the Membrane Map. A bundle without a board gets a note that says how to build one. The controller's handle is left at `window.__worldMap` for the tests.

### Notes
- Written on 2026-09-28 when the World Map landed ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)), the board probe's rendering ported onto real data. The parse, lint and join are the calls `npm run live-docs:board` makes, so what the page draws is what the command prints. The view is created once and rendered once; `dispose` empties the root.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WorldMapViewOptions` {#symbol-worldmapviewoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/index.ts#L14)

#### `WorldMapView` {#symbol-worldmapview}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/index.ts#L24)

#### `createWorldMapView` {#symbol-createworldmapview}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/index.ts#L32)
- Returns: [`WorldMapView`](#symbol-worldmapview)
- Parameters: `options`: [`WorldMapViewOptions`](#symbol-worldmapviewoptions)

##### `createWorldMapView` — Summary
Creates the World Map over the bundle's board, or a note saying the bundle has none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`board.lintBoard`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-lintboard)
- [`board.parseBoard`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-parseboard)
- [`boardGraph.deriveBoardGraph`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`document.LiveDocSyntaxError`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`graph.LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`controller.WorldMapApi`](./controller.ts.mdmd.md#symbol-worldmapapi)
- [`controller.WorldMapController`](./controller.ts.mdmd.md#symbol-worldmapcontroller)
- [`model.buildWorldModel`](./model.ts.mdmd.md#symbol-buildworldmodel)
<!-- LIVE-DOC:END Dependencies -->
