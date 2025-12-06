# packages/scripts/src/live-docs/explorer/client/detailPanel.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/detailPanel.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-detailpanel-ts
- Generated At: 2025-12-05T04:16:17.282Z

## Authored
### Purpose
Manages the Explorer's right-hand detail panel. Fetches and displays Live Doc metadata, dependency lists, and public symbols for the currently selected node.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- Exposes a `DetailPanelApi` with `setNode()` to update the panel and `getFocusedNode()` to query the current selection.
- Populates the sidebar with "Open in Editor", "Open in Local View", and dependency links.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.282Z","inputHash":"cff7775d3fdef912"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DetailPanelApi` {#symbol-detailpanelapi}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/detailPanel.ts#L9)

#### `createDetailPanel` {#symbol-createdetailpanel}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/detailPanel.ts#L15)
- Returns: `DetailPanelApi`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`parsers.parseExplorerDetailPayload`](./parsers.ts.mdmd.md#symbol-parseexplorerdetailpayload)
- [`types.ExplorerDependencyReference`](../shared/types.ts.mdmd.md#symbol-explorerdependencyreference) (type-only)
- [`types.ExplorerDetailPayload`](../shared/types.ts.mdmd.md#symbol-explorerdetailpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
