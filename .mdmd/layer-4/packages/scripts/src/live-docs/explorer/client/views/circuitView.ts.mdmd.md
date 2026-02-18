# packages/scripts/src/live-docs/explorer/client/views/circuitView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-ts
- Generated At: 2026-02-18T21:27:51.482Z

## Authored
### Purpose
Circuit Board view for the Explorer. Renders the entire Live Doc graph as a treemap where folders are nested rectangles and files are interactive cells. Supports zoom, pan, and click-to-focus navigation.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was refactored.
- Uses `computeTreemapLayout` from `layoutUtils.ts` to compute cell positions.
- Click events update `ExplorerState.selectedNode` and can trigger Local Map view switches.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:51.482Z","inputHash":"9f78e1bb95f2d275"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CircuitViewOptions` {#symbol-circuitviewoptions}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView.ts#L27)

##### `CircuitViewOptions` — Summary
Options passed to the Circuit Board view factory.

#### `CircuitViewApi` {#symbol-circuitviewapi}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView.ts#L38)

##### `CircuitViewApi` — Summary
Public API surface of the Circuit Board (treemap) view.

#### `createCircuitView` {#symbol-createcircuitview}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView.ts#L51)
- Returns: [`CircuitViewApi`](#symbol-circuitviewapi)
- Parameters: `options`: [`CircuitViewOptions`](#symbol-circuitviewoptions)

##### `createCircuitView` — Summary
Creates the Circuit Board (treemap) view for the Live Docs Explorer.
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
