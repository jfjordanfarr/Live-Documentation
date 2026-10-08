# packages/explorer/src/client/views/worldMap/model.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/worldMap/model.test.ts
- Generated At: 2026-09-28T23:04:10.107Z

## Authored
### Purpose
Keeps what the model makes of a board joined to five docs: regions of the things that hold things, nested, with their pieces at every depth and their tints from the legend; pieces of the rest, shaped by the legend and counted from their docs, with their doors, files and what they stand on; roads in the air for calls and on the board for what stands on what, crossings for declared connections between regions, and an issue for a connection that joins a thing and a region; a token for what two pieces share; positions for pieces only; and a piece's regions nearest first.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)). The docs are rendered through the Live Doc grammar and joined by `deriveBoardGraph`, so the fixture is what the generator and the engine would give the Explorer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board) (type-only)
- [`boardGraph.deriveBoardGraph`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`document.LiveDoc`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.parseLiveDoc`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.deriveLiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`model.buildWorldModel`](./model.ts.mdmd.md#symbol-buildworldmodel)
- [`model.regionsOf`](./model.ts.mdmd.md#symbol-regionsof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
