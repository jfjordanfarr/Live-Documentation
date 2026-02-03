# packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-layout-renderer-ts
- Generated At: 2026-02-03T21:55:36.551Z

## Authored
### Purpose
Orchestrates Local Map layout rendering by mode (single-hop, multi-hop, path). Dispatches to appropriate column renderers and coordinates the overall DOM structure for each visualization mode.

### Notes
Extracted from render.ts during Dev Day 50 (12/19) as part of Phase 3 tech-debt reduction. This is the top-level render orchestrator that calls into card-factory.ts and column-factory.ts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.551Z","inputHash":"b8d4672338f687d5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderLayoutForNodes` {#symbol-renderlayoutfornodes}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts#L34)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `nodes`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]

##### `renderLayoutForNodes` — Summary
Renders a layout surface for a set of nodes.
Uses directory hierarchy grouping for visual organization.

##### `renderLayoutForNodes` — Parameters
- `connectionScore`: Map of node IDs to connection scores for sorting
- `controller`: The LocalViewController instance
- `direction`: The direction (inbound/outbound/center)
- `nodes`: The nodes to render

##### `renderLayoutForNodes` — Returns
The rendered surface element, or null if no eligible nodes

#### `reorderDirectory` {#symbol-reorderdirectory}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts#L160)
- Parameters: `dir`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)

##### `reorderDirectory` — Summary
Reorders a directory hierarchy for optimal visual presentation.
Nodes and subdirectories are sorted by connection score (descending)
with alphabetical fallback for ties.

##### `reorderDirectory` — Parameters
- `computeScore`: Function to compute aggregate score for a directory
- `connectionScore`: Map of node IDs to connection scores
- `dir`: The directory node to reorder
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`layoutUtils.DirectoryLayoutPlan`](../layoutUtils.ts.mdmd.md#symbol-directorylayoutplan) (type-only)
- [`layoutUtils.ROOT_KEY`](../layoutUtils.ts.mdmd.md#symbol-root_key) (type-only)
- [`layoutUtils.buildHierarchy`](../layoutUtils.ts.mdmd.md#symbol-buildhierarchy) (type-only)
- [`layoutUtils.computeDirectoryLayout`](../layoutUtils.ts.mdmd.md#symbol-computedirectorylayout) (type-only)
- [`layoutUtils.measureDirectoryTree`](../layoutUtils.ts.mdmd.md#symbol-measuredirectorytree) (type-only)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
