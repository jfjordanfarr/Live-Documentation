# packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-index-ts
- Generated At: 2026-03-23T20:05:53.966Z

## Authored
### Purpose

Main controller for the Circuit Board (treemap) view in the Live Docs Explorer. Orchestrates progressive disclosure, the two-zone layout (squarified directory tiles above, uniform file card grid below), dimmed sibling strips, pan/zoom, connection highlighting, and node selection.

### Notes

- This is the post-refactoring controller from [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md), replacing the original 741-line monolithic `circuitView.ts`. The refactoring extracted pure functions (`state.ts`, `aggregation.ts`, `squarify.ts`) and DOM builders (`directoryTile.ts`, `breadcrumb.ts`) into separate modules, leaving the controller responsible for wiring, rendering, and interaction.
- Implements "Option C" from the progressive disclosure design discussion: directories render as squarified tiles in the upper zone, individual files render as uniform 220×120px cards in a CSS flex-wrap grid in the lower zone, and sibling directories appear as dimmed strips along the right edge. Zone height uses a proportional weight-based split clamped to [160px, layoutHeight−160px].
- The `render()` function does a full DOM teardown (`innerHTML = ""`) on each call — the same constraint identified as "the roadblock" in the design analysis. State-awareness comes from `boardState.expandedDirectories`: the controller finds the deepest expanded directory as the viewing directory and its parent for sibling computation.
- `expandAndScrollToNode(nodeId)` builds a full ancestor chain by walking aggregate levels from root to the target file's containing directory, enabling omnisearch and external link navigation to work correctly with the progressive disclosure model.
- `createSiblingStrip(aggregate, onExpand)` builds thin dimmed buttons for peer directories; clicking swaps which directory is expanded without losing hierarchy context.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-23T20:05:53.966Z","inputHash":"68c2886e6f17aa90"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CircuitViewOptions` {#symbol-circuitviewoptions}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts#L54)

##### `CircuitViewOptions` — Summary
Options passed to the Circuit Board view factory.

#### `CircuitViewApi` {#symbol-circuitviewapi}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts#L65)

##### `CircuitViewApi` — Summary
Public API surface of the Circuit Board (treemap) view.

#### `createCircuitView` {#symbol-createcircuitview}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts#L78)
- Returns: [`CircuitViewApi`](#symbol-circuitviewapi)
- Parameters: `options`: [`CircuitViewOptions`](#symbol-circuitviewoptions)

##### `createCircuitView` — Summary
Creates the Circuit Board (treemap) view for the Live Docs Explorer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`types.CircuitTransform`](../../types.ts.mdmd.md#symbol-circuittransform) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`aggregation.DirectoryAggregate`](./aggregation.ts.mdmd.md#symbol-directoryaggregate) (type-only)
- [`aggregation.computeAggregateWeight`](./aggregation.ts.mdmd.md#symbol-computeaggregateweight) (type-only)
- [`aggregation.computeChildAggregates`](./aggregation.ts.mdmd.md#symbol-computechildaggregates) (type-only)
- [`aggregation.computeFileWeight`](./aggregation.ts.mdmd.md#symbol-computefileweight) (type-only)
- [`aggregation.findDirectoryByPath`](./aggregation.ts.mdmd.md#symbol-finddirectorybypath) (type-only)
- [`breadcrumb.createBreadcrumb`](./breadcrumb.ts.mdmd.md#symbol-createbreadcrumb)
- [`directoryTile.createDirectoryTile`](./directoryTile.ts.mdmd.md#symbol-createdirectorytile)
- [`state.CircuitBoardState`](./state.ts.mdmd.md#symbol-circuitboardstate)
- [`state.buildBreadcrumbs`](./state.ts.mdmd.md#symbol-buildbreadcrumbs)
- [`state.collapseAll`](./state.ts.mdmd.md#symbol-collapseall)
- [`state.createInitialState`](./state.ts.mdmd.md#symbol-createinitialstate)
- [`state.expandDirectory`](./state.ts.mdmd.md#symbol-expanddirectory)
- [`state.findContainingDirectory`](./state.ts.mdmd.md#symbol-findcontainingdirectory)
- [`state.hasExpandedDirectories`](./state.ts.mdmd.md#symbol-hasexpandeddirectories)
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect)
- [`layoutUtils.buildHierarchy`](../layoutUtils.ts.mdmd.md#symbol-buildhierarchy)
- [`squarify.computeSquarifiedLayout`](../squarify.ts.mdmd.md#symbol-computesquarifiedlayout)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
