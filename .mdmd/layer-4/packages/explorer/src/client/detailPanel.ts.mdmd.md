# packages/explorer/src/client/detailPanel.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/detailPanel.ts
- Generated At: 2026-10-20T21:28:53.853Z

## Authored
### Purpose
The Explorer's evidence reader: renders a file or symbol from the bundled Live Docs, a directory from the graph's file inventory, or a bundled authored document. It presents navigation and retention controls supplied by the application without owning those state changes, and downloads the displayed document as Markdown.

### Notes
- Created during the [November 21, 2025 Explorer modularisation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-21.SUMMARIZED.md), when the client gained separate state, DOM and reader modules.
- Since 2026-09-28 the panel reads the graph's file for a node instead of splitting the doc's markdown by regex, and `renderLiveDoc` gives back the doc's bytes for the download; the fetches from the retired server went with it.
- Inspecting evidence is independent of the map subject and retained pins. The application supplies the current Pin, Centre or Open actions and handles reader-link and Close callbacks; the panel renders native buttons with accessible labels and pressed states. This boundary follows the owner's [accepted inspect-first grammar](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-24), resumed in [October 20 Turn 2](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The former unconditional view-switching footer is historical.
- Authored and generated links resolve through actual document/code paths and the bundled-document inventory, without assuming a documentation root or suffix. Documented re-exports can lead to their origin; a local target absent from the bundle is identified as unavailable. Bundled-document fragments name the section being read.
- Repeated rendering of the same target preserves reader scroll. Fragment navigation scrolls only the reader body, hidden content is inert, and action updates preserve keyboard focus. Responsive presentation and canvas orientation belong to the application shell.
- The Internals target describes file-level connections not attributed to a public symbol; it does not assert that private symbols have been documented. Downloading a file uses its actual configured Live Doc filename.
- `setNote` (2026-10-20, [Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) puts one line above the evidence; the application uses it to say that the reader shows today's version of a document while the 3D picture shows a past commit.
- A Live Doc's authored block, a bundled document and a directory's one-line summary are all marked `reader-prose`, the one set of prose rules in `shell.css` (2026-10-21, [Turn 2](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)). Until then a bundled document's container carried `detail-doc-content` and `bundled-doc-content`, which no stylesheet defined after the January 2026 bundling, so it read at the browser's 16 px with the browser's dark-blue links.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DetailPanelAction` {#symbol-detailpanelaction}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L19)

##### `DetailPanelAction` — Summary
A reader control whose meaning and state belong to the application.

#### `DetailPanelApi` {#symbol-detailpanelapi}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L28)

##### `DetailPanelApi` — Summary
Public API surface of the Explorer detail panel component.

#### `DetailPanelOptions` {#symbol-detailpaneloptions}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L44)

##### `DetailPanelOptions` — Summary
Configuration options for the Explorer detail panel.

#### `createDetailPanel` {#symbol-createdetailpanel}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/detailPanel.ts#L72)
- Returns: [`DetailPanelApi`](#symbol-detailpanelapi)
- Parameters: `options`: [`DetailPanelOptions`](#symbol-detailpaneloptions)

##### `createDetailPanel` — Summary
Creates the detail panel component for viewing a file's Live Doc
and node metadata.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.renderLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`document.symbolName`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`markdown.renderMarkdown`](./markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`types.InspectionTarget`](./types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`pin-state.INTERNAL_SYMBOL`](./views/pin-state.ts.mdmd.md#symbol-internal_symbol)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
