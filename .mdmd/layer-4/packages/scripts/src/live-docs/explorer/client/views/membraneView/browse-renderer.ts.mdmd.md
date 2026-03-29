# packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-browse-renderer-ts
- Generated At: 2026-03-29T21:52:09.667Z

## Authored

### Purpose

DOM rendering of the Membrane Map's browse mode, converting a `MembraneLayout` tree into nested HTML elements: collapsed directory tiles with aggregate metric badges, expanded membrane borders with graduated depth styling, leaf file tiles with adaptive symbol lists, and Local-Map-style card grids for focused leaf directories.

### Notes

- Created during [Dev Day 80 Step 5](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the first DOM rung after the four pure-math foundation rungs.
- The focus-path mechanism switches from absolute `left`/`top` positioning to relative `margin` positioning along the ancestor chain of the focused directory, enabling content-driven height propagation so card grids can overflow their treemap allocation and the membrane stretches naturally.
- Collapsed tiles show aggregate metrics (file count, symbol count, outbound/inbound dependency counts) with progressive disclosure — tiles below 80×50px hide metrics entirely, tiles below 120×60px show only file count, preventing badge overflow on small tiles.
- Mixed-content directories (containing both files and subdirectories) render a hybrid two-zone layout (added [Dev Day 83](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md)): directories get squarified treemap tiles while files render as a card grid underneath, solving the area-crushing problem where files at weight=1 were dwarfed by directories at weight=N.
- File cards support collapsed/expanded dual-mode: collapsed cards show only name, path, and symbol count; expanded cards reveal all symbol rows with pin anchors and a pin-all button (CSS-only icon, not emoji). Cards with test coverage receive `.membrane-card--test-backed` styling.
- [Dev Day 84](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-28.1.md) additions: reference badges on symbol rows showing inbound/outbound/type-only edge roles (`createReferenceBadges` helper), `data-node-id`/`data-symbol` attributes on `__internals__` rows enabling internals pinning, `--pinned` class on internals rows when pinned, and pin-all button on both collapsed and expanded cards with toggle state via `areAllSymbolsPinned`.
- Leaf directories (the focused directory whose children are all files) render children as uniform card-grid cards with full pin anchors, registering `MeasuredAnchor` elements in the `BrowseRenderResult.anchors` array so the focal overlay can draw connections spanning card-grid pins and overlay pins.
- XSS prevention: `escapeHtml` sanitizes file/directory names before DOM insertion.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-29T21:52:09.667Z","inputHash":"da756528ba663be7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `BrowseRenderCallbacks` {#symbol-browserendercallbacks}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts#L56)

##### `BrowseRenderCallbacks` — Summary

Callbacks invoked by browse-mode interactive elements.

#### `BrowseRenderResult` {#symbol-browserenderresult}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts#L66)

##### `BrowseRenderResult` — Summary

Result from renderBrowseMode, including any card-grid anchors.

#### `renderBrowseMode` {#symbol-renderbrowsemode}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts#L86)
- Returns: [`BrowseRenderResult`](#symbol-browserenderresult)
- Parameters: `layout`: [`MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout); `callbacks`: [`BrowseRenderCallbacks`](#symbol-browserendercallbacks); `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset); `expandedCards`: `ReadonlySet`; `testCoverage`: [`TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap)

##### `renderBrowseMode` — Summary

Render the full membrane tree into a positioned DOM subtree.

##### `renderBrowseMode` — Parameters

- `aggregates`: Pre-computed aggregate metrics keyed by directory path
- `callbacks`: Click handlers for expand/collapse/select
- `collapsed`: Set of directory IDs that are currently collapsed
- `layout`: Pre-computed membrane layout (from computeMembraneLayout)
- `nodesById`: Lookup for ExplorerNodePayload by ID
- `selectedNodeId`: Currently selected node ID (for highlight)

##### `renderBrowseMode` — Returns

A root HTMLElement containing the entire membrane tree

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`aggregation.DirectoryAggregate`](../circuitView/aggregation.ts.mdmd.md#symbol-directoryaggregate) (type-only)
- [`focal-overlay.MeasuredAnchor`](./focal-overlay.ts.mdmd.md#symbol-measuredanchor) (type-only)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.areAllSymbolsPinned`](./pin-state.ts.mdmd.md#symbol-areallsymbolspinned) (type-only)
- [`pin-state.isSymbolPinned`](./pin-state.ts.mdmd.md#symbol-issymbolpinned) (type-only)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
<!-- LIVE-DOC:END Dependencies -->
