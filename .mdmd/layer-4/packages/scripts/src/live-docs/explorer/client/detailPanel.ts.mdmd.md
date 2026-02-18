# packages/scripts/src/live-docs/explorer/client/detailPanel.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/detailPanel.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-detailpanel-ts
- Generated At: 2026-02-18T21:27:51.047Z

## Authored
### Purpose
Manages the Explorer's right-hand detail panel. Fetches and displays Live Doc metadata, dependency lists, and public symbols for the currently selected node.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- Exposes a `DetailPanelApi` with `setNode()` to update the panel and `getFocusedNode()` to query the current selection.
- Populates the sidebar with "Open in Editor", "Open in Local View", and dependency links.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:51.047Z","inputHash":"6457e0f1febe0468"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DetailPanelApi` {#symbol-detailpanelapi}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/detailPanel.ts#L19)

##### `DetailPanelApi` — Summary
Public API surface of the Explorer detail panel component.

#### `DetailPanelOptions` {#symbol-detailpaneloptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/detailPanel.ts#L31)

##### `DetailPanelOptions` — Summary
Configuration options for the Explorer detail panel.

#### `createDetailPanel` {#symbol-createdetailpanel}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/detailPanel.ts#L66)
- Returns: [`DetailPanelApi`](#symbol-detailpanelapi)
- Parameters: `options`: [`DetailPanelOptions`](#symbol-detailpaneloptions)

##### `createDetailPanel` — Summary
Creates the detail panel component for viewing Live Doc markdown
and node metadata in server or static mode.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`markdown.renderMarkdown`](./markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`types.ExplorerDetailPayload`](../shared/types.ts.mdmd.md#symbol-explorerdetailpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
