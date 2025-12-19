# packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-column-factory-ts
- Generated At: 2025-12-19T21:55:44.472Z

## Authored
### Purpose
Creates column containers for the Local Map's three-column layout. Handles both hierarchical (directory-grouped) and stacked (flat list) column layouts depending on the visualization mode.

### Notes
Extracted from render.ts during Dev Day 50 (12/19). The `createHierarchicalColumn()` and `createStackedColumn()` functions build the upstream/center/downstream column structures.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:55:44.472Z","inputHash":"a58113d8db4d5c4e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `highlightSymbolInColumn` {#symbol-highlightsymbolincolumn}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts#L25)

##### `highlightSymbolInColumn` — Summary
Highlights a specific symbol row in a column.
Used in path mode to auto-highlight FROM/TO symbols.

##### `highlightSymbolInColumn` — Parameters
- `column`: The column element to search in
- `symbol`: The symbol name to highlight

#### `createHierarchicalColumn` {#symbol-createhierarchicalcolumn}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts#L49)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `nodes`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]

##### `createHierarchicalColumn` — Summary
Creates a hierarchical column layout for the Local Map.
Used for the classic directory-grouped node layout.

##### `createHierarchicalColumn` — Parameters
- `connectionScore`: Map of node IDs to connection scores
- `controller`: The LocalViewController instance
- `direction`: The direction (inbound/outbound/center)
- `emptyLabel`: Label to show when no nodes
- `hopIndex`: Optional hop index for multi-hop visualization
- `label`: The column label text
- `nodes`: The nodes to render in this column
- `position`: The visual position (left/center/right)

##### `createHierarchicalColumn` — Returns
The created column element

#### `createStackedColumn` {#symbol-createstackedcolumn}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts#L117)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `nodes`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `guides`: [`CenterAlignmentGuides`](./layout-measure.ts.mdmd.md#symbol-centeralignmentguides)

##### `createStackedColumn` — Summary
Creates a stacked column layout for the Local Map.
Used for multi-hop visualization where nodes are vertically stacked
and aligned based on their connection targets.

##### `createStackedColumn` — Parameters
- `connectionScore`: Map of node IDs to connection scores
- `controller`: The LocalViewController instance
- `direction`: The direction (inbound/outbound)
- `emptyLabel`: Label to show when no nodes
- `guides`: Alignment guides from the center column
- `hopIndex`: Optional hop index for multi-hop visualization
- `label`: The column label text
- `nodes`: The nodes to render in this column
- `position`: The visual position (left/right)

##### `createStackedColumn` — Returns
The created column element

#### `computeDirectionalAlignmentValue` {#symbol-computedirectionalalignmentvalue}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts#L247)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `guides`: [`CenterAlignmentGuides`](./layout-measure.ts.mdmd.md#symbol-centeralignmentguides); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `computeDirectionalAlignmentValue` — Summary
Computes the alignment Y value for a node in a stacked column.
Determines where a node should be positioned based on its
connections to the center column.

##### `computeDirectionalAlignmentValue` — Parameters
- `controller`: The LocalViewController instance
- `direction`: The direction of the column
- `guides`: Alignment guides from the center column
- `node`: The node to compute alignment for

##### `computeDirectionalAlignmentValue` — Returns
The Y coordinate for alignment
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layoutUtils.ROOT_KEY`](../layoutUtils.ts.mdmd.md#symbol-root_key)
- [`layoutUtils.getDirectoryKey`](../layoutUtils.ts.mdmd.md#symbol-getdirectorykey)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`layout-renderer.renderLayoutForNodes`](./layout-renderer.ts.mdmd.md#symbol-renderlayoutfornodes)
- [`types.CenterAlignmentGuides`](./types.ts.mdmd.md#symbol-centeralignmentguides) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
