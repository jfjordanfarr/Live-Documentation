# packages/scripts/src/live-docs/explorer/client/views/localView/render.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/render.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-render-ts
- Generated At: 2025-12-18T23:59:04.103Z

## Authored
### Purpose
DOM rendering logic for the Local Map view. Lays out inbound/center/outbound columns and registers anchor rectangles for SVG connection drawing.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 by extracting rendering code from the monolithic `localView.ts`.
- Renders directory nodes as expandable groups using `computeDirectoryLayout`.
- Passes anchor positions to the controller for Bézier spline routing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-18T23:59:04.103Z","inputHash":"5a5817f4470b4185"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderLocalView` {#symbol-renderlocalview}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/render.ts#L20)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`layoutUtils.DirectoryLayoutPlan`](../layoutUtils.ts.mdmd.md#symbol-directorylayoutplan) (type-only)
- [`layoutUtils.ROOT_KEY`](../layoutUtils.ts.mdmd.md#symbol-root_key) (type-only)
- [`layoutUtils.buildHierarchy`](../layoutUtils.ts.mdmd.md#symbol-buildhierarchy) (type-only)
- [`layoutUtils.computeDirectoryLayout`](../layoutUtils.ts.mdmd.md#symbol-computedirectorylayout) (type-only)
- [`layoutUtils.getDirectoryKey`](../layoutUtils.ts.mdmd.md#symbol-getdirectorykey) (type-only)
- [`layoutUtils.measureDirectoryTree`](../layoutUtils.ts.mdmd.md#symbol-measuredirectorytree) (type-only)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`layout-math.computeColumnCount`](./layout-math.ts.mdmd.md#symbol-computecolumncount)
- [`layout-math.computeGridTemplate`](./layout-math.ts.mdmd.md#symbol-computegridtemplate)
- [`layout-math.generateColumnLabel`](./layout-math.ts.mdmd.md#symbol-generatecolumnlabel)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`state.SymbolPin`](./state.ts.mdmd.md#symbol-symbolpin) (type-only)
- [`types.CenterAlignmentGuides`](./types.ts.mdmd.md#symbol-centeralignmentguides) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
