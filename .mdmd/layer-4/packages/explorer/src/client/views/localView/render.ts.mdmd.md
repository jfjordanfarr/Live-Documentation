# packages/explorer/src/client/views/localView/render.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/render.ts
- Generated At: 2026-10-02T21:07:39.688Z

## Authored
### Purpose

Builds the native Local Map’s classic neighborhood, independently pinned branches or explicit FROM/TO path.

### Notes

Uses the same native card and symbol factories across all three disclosures. Branch ranking comes from the pure branch graph; explicit pathfinding retains its own ordered columns and fit behavior. The rendering boundary originated in the December 4, 2025 Local Map extraction.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderLocalView` {#symbol-renderlocalview}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/render.ts#L9)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderLocalView` — Summary
Renders (or re-renders) the Local Map DOM layout from the current controller state.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-renderer.renderBranches`](./branch-renderer.ts.mdmd.md#symbol-renderbranches)
- [`column-factory.createHierarchicalColumn`](./column-factory.ts.mdmd.md#symbol-createhierarchicalcolumn)
- [`column-factory.createStackedColumn`](./column-factory.ts.mdmd.md#symbol-createstackedcolumn)
- [`column-factory.highlightSymbolInColumn`](./column-factory.ts.mdmd.md#symbol-highlightsymbolincolumn)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
