# packages/explorer/src/client/detailPanel.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/detailPanel.ts
- Generated At: 2026-10-08T16:03:27.562Z

## Authored
### Purpose
The Explorer's detail panel: renders a selected file's Live Doc from the graph in the bundle, with its metadata, its authored block as markdown and its generated sections as navigable lists, and downloads the doc rendered back to markdown.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- Since 2026-09-28 the panel reads the graph's file for a node instead of splitting the doc's markdown by regex, and `renderLiveDoc` gives back the doc's bytes for the download; the fetches from the retired server went with it.
- Added "Open in Membrane Map" button and `onOpenInMembraneMap` callback on 2026-03-28, wired through `DetailPanelApi` so the Explorer can navigate from any detail view into the Membrane Map with the selected node focused.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DetailPanelApi` {#symbol-detailpanelapi}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L17)

##### `DetailPanelApi` — Summary
Public API surface of the Explorer detail panel component.

#### `DetailPanelOptions` {#symbol-detailpaneloptions}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L29)

##### `DetailPanelOptions` — Summary
Configuration options for the Explorer detail panel.

#### `createDetailPanel` {#symbol-createdetailpanel}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L60)
- Returns: [`DetailPanelApi`](#symbol-detailpanelapi)
- Parameters: `options`: [`DetailPanelOptions`](#symbol-detailpaneloptions)

##### `createDetailPanel` — Summary
Creates the detail panel component for viewing a file's Live Doc
and node metadata.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.renderLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`markdown.renderMarkdown`](./markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
