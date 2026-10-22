# packages/engine/src/live-docs/boardGraph.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/boardGraph.test.ts
- Generated At: 2026-10-22T16:47:52.589Z

## Authored
### Purpose
Measures the join on a graph of six docs that are rendered through `renderLiveDoc` and read back through `parseLiveDoc`, so the fixture is what the generator would write: files by folder with one thing nested in another, doors from a doc and from a declaration, what a thing stands on from its manifest's externals, six wires with the edges behind them, and the three issues the join reports instead of refusing.

### Notes
- The graph is `deriveLiveDocGraph` over the docs at the shipped default location (`.live-documentation/source`), so a change to the grammar, or to how the graph derives its inbound and outbound lists, reaches this test before it reaches a real board.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](./board.ts.mdmd.md#symbol-board) (type-only)
- [`boardGraph.deriveBoardGraph`](./boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.deriveLiveDocGraph`](./graph.ts.mdmd.md#symbol-derivelivedocgraph)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/boards.mdmd.md`](../../../../../layer-3/boards.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
