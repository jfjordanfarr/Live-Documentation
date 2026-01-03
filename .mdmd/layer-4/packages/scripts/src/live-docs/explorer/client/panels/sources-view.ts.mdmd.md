# packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-panels-sources-view-ts
- Generated At: 2026-01-03T21:58:16.452Z

## Authored
### Purpose
Renders the Knowledge Sources panel showing graph health warnings and data source metadata. Displays missing dependency counts, stale Live Docs, and other diagnostic information about the underlying graph data.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `renderSourcesView()` function populates the sidebar with graph statistics, while `renderHealthWarnings()` surfaces actionable issues.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-03T21:58:16.452Z","inputHash":"887493753295012b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StaticDocsMap` {#symbol-staticdocsmap}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L17)

##### `StaticDocsMap` — Summary
Static docs map type (nodeId → markdown content)

#### `NavigateToNodeCallback` {#symbol-navigatetonodecallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L20)

##### `NavigateToNodeCallback` — Summary
Callback for navigating to a node from health warnings

#### `DownloadAllCallback` {#symbol-downloadallcallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L23)

##### `DownloadAllCallback` — Summary
Callback for bulk download

#### `SourcesViewConfig` {#symbol-sourcesviewconfig}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L26)

##### `SourcesViewConfig` — Summary
Sources view configuration

#### `renderSourcesView` {#symbol-rendersourcesview}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L96)
- Parameters: `config`: [`SourcesViewConfig`](./index.ts.mdmd.md#symbol-sourcesviewconfig)

##### `renderSourcesView` — Summary
Render the Sources view panel showing graph statistics and health information.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`index.ViewerConfig`](../persistence/index.ts.mdmd.md#symbol-viewerconfig) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
