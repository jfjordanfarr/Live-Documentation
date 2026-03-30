# packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-active-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-active-renderer.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-pin-active-renderer-ts
- Generated At: 2026-03-30T18:52:14.542Z

## Authored
### Purpose

DOM renderer for the Membrane Map's pin-active dependency-flow view. Transforms `PinLayoutResult` into a nested HTML structure of ancestor directory membranes containing topological columns, each with directory-grouped file cards and symbol lists.

### Notes

- Created in [Dev Day 80](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as Step 7 of the Membrane Map execution plan; ancestor membrane nesting and `onNavigateToDirectory` callback added in [Dev Day 81](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-24.1.md)
- Key exports: `renderPinActiveLayout` (main entry), `PinActiveCallbacks` (interaction handlers including `onNavigateToDirectory`), `PinActiveRenderResult` (DOM element + measured anchors for connection rendering)
- Ancestor membranes render as nested thin-bordered `.pa-ancestor-membrane` divs, each with a clickable label that navigates back to that directory in browse mode — the "escape hatch" interaction model
- Per-column membrane group labels are deduplicated: suppressed when the group's directory matches the LCA directory, otherwise shown as a path relative to the LCA
- Grid columns use fixed `320px` widths (changed from `1fr` in [Dev Day 83](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md)) so card dimensions remain stable when the column gap slider is adjusted; inner band grids also use fixed widths and `var(--local-column-gap)` for horizontal gaps.
- Symbol rows receive `.membrane-card__symbol-row--pinned` class when the symbol is actively pinned, providing a visual border treatment matching the Local Map's pinned-symbol styling.
- All user-supplied text is escaped through `escapeHtml` to prevent XSS in symbol names and directory labels
- [Dev Day 84](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-28.1.md): added pin-all toggle button to flow card headers via `onPinAllSymbols` in `PinActiveCallbacks`, reference badges on symbol rows (`createReferenceBadges` helper), and `--pinned` class on `__internals__` rows.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T18:52:14.542Z","inputHash":"fa1dcc7dfb2acd8a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PinActiveCallbacks` {#symbol-pinactivecallbacks}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-active-renderer.ts#L53)

##### `PinActiveCallbacks` — Summary
Callbacks for pin-active renderer interactive elements.

#### `PinActiveRenderResult` {#symbol-pinactiverenderresult}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-active-renderer.ts#L62)

##### `PinActiveRenderResult` — Summary
Result from renderPinActiveLayout.

#### `renderPinActiveLayout` {#symbol-renderpinactivelayout}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-active-renderer.ts#L86)
- Returns: [`PinActiveRenderResult`](#symbol-pinactiverenderresult)
- Parameters: `pinLayout`: [`PinLayoutResult`](./pin-layout.ts.mdmd.md#symbol-pinlayoutresult); `nodesById`: `ReadonlyMap`; `callbacks`: [`PinActiveCallbacks`](#symbol-pinactivecallbacks); `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)

##### `renderPinActiveLayout` — Summary
Render the dependency-flow layout when pins are active.

Creates a horizontal column layout where:
- Upstream (dependency) nodes appear on the left
- Pinned nodes appear in the center
- Downstream (dependent) nodes appear on the right
- Nodes within each column are grouped by directory (membrane)

##### `renderPinActiveLayout` — Parameters
- `callbacks`: Interaction handlers
- `nodesById`: Node payload lookup
- `pinLayout`: Computed dependency-flow layout from computePinLayout
- `pinSet`: Current pin state (for highlighting active pins)
- `selectedNodeId`: Currently selected node for highlight
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`focal-overlay.MeasuredAnchor`](./focal-overlay.ts.mdmd.md#symbol-measuredanchor) (type-only)
- [`pin-layout.DirectoryBand`](./pin-layout.ts.mdmd.md#symbol-directoryband) (type-only)
- [`pin-layout.PinLayoutResult`](./pin-layout.ts.mdmd.md#symbol-pinlayoutresult) (type-only)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.areAllSymbolsPinned`](./pin-state.ts.mdmd.md#symbol-areallsymbolspinned) (type-only)
- [`pin-state.isSymbolPinned`](./pin-state.ts.mdmd.md#symbol-issymbolpinned) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
<!-- LIVE-DOC:END Dependencies -->
