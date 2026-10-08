# packages/explorer/src/client/views/localView/render.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/render.ts
- Generated At: 2026-10-07T02:59:51.907Z

## Authored
### Purpose

Builds the native Local Map’s classic neighborhood, independently pinned branches or explicit FROM/TO path.

### Notes

Uses the same native card and symbol factories across all three disclosures. Branch ranking comes from the pure branch graph; explicit pathfinding retains its own ordered columns and fit behavior. The rendering boundary originated in the December 4, 2025 Local Map extraction.
- A branch picture keeps its stage across renders (`keepStage`, 2026-10-07): the container is not cleared and the stage's root is the layout root again, so that the renderer can move the picture from the previous one; any other picture, an empty one, or a path drops the stage and starts from an empty container. Choosing a different file marks its card as the one last interacted with, which a move then holds still.
- A picture is drawn as branches whenever something is pinned or a directory is opened (`controller.exploring`), with or without a file in focus (2026-10-08): a directory entered on its own has none, so the empty hint waits for both to be absent, the classic subgraph is built only around a selected file, and the camera's refit follows the selected file's id or null.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderLocalView` {#symbol-renderlocalview}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/render.ts#L10)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderLocalView` — Summary
Renders (or re-renders) the Local Map DOM layout from the current controller state.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-renderer.createStage`](./branch-renderer.ts.mdmd.md#symbol-createstage)
- [`branch-renderer.renderBranches`](./branch-renderer.ts.mdmd.md#symbol-renderbranches)
- [`column-factory.createHierarchicalColumn`](./column-factory.ts.mdmd.md#symbol-createhierarchicalcolumn)
- [`column-factory.createStackedColumn`](./column-factory.ts.mdmd.md#symbol-createstackedcolumn)
- [`column-factory.highlightSymbolInColumn`](./column-factory.ts.mdmd.md#symbol-highlightsymbolincolumn)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
