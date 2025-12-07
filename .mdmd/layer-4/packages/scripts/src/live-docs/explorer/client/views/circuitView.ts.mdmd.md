# packages/scripts/src/live-docs/explorer/client/views/circuitView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-ts
- Generated At: 2025-12-07T19:11:27.401Z

## Authored
### Purpose
Circuit Board view for the Explorer. Renders the entire Live Doc graph as a treemap where folders are nested rectangles and files are interactive cells. Supports zoom, pan, and click-to-focus navigation.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was refactored.
- Uses `computeTreemapLayout` from `layoutUtils.ts` to compute cell positions.
- Click events update `ExplorerState.selectedNode` and can trigger Local Map view switches.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T19:11:27.401Z","inputHash":"c5948c4ba853fbb2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CircuitViewOptions` {#symbol-circuitviewoptions}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView.ts#L19)

#### `CircuitViewApi` {#symbol-circuitviewapi}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView.ts#L29)

#### `createCircuitView` {#symbol-createcircuitview}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView.ts#L41)
- Returns: `CircuitViewApi`
- Parameters: `options`: `CircuitViewOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`types.CircuitTransform`](../types.ts.mdmd.md#symbol-circuittransform) (type-only)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TestCoverageMap`](../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`layoutUtils.DirectoryLayoutPlan`](./layoutUtils.ts.mdmd.md#symbol-directorylayoutplan)
- [`layoutUtils.ROOT_KEY`](./layoutUtils.ts.mdmd.md#symbol-root_key)
- [`layoutUtils.buildHierarchy`](./layoutUtils.ts.mdmd.md#symbol-buildhierarchy)
- [`layoutUtils.computeDirectoryLayout`](./layoutUtils.ts.mdmd.md#symbol-computedirectorylayout)
- [`layoutUtils.findDominantDirectory`](./layoutUtils.ts.mdmd.md#symbol-finddominantdirectory)
- [`layoutUtils.getDirectoryKey`](./layoutUtils.ts.mdmd.md#symbol-getdirectorykey)
- [`layoutUtils.measureDirectoryTree`](./layoutUtils.ts.mdmd.md#symbol-measuredirectorytree)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
