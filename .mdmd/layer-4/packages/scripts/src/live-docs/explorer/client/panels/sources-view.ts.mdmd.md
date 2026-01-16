# packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-panels-sources-view-ts
- Generated At: 2026-01-16T18:02:35.373Z

## Authored
### Purpose
Renders the Knowledge Sources panel showing graph health warnings and data source metadata. Displays missing dependency counts, stale Live Docs, and other diagnostic information about the underlying graph data.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `renderSourcesView()` function populates the sidebar with graph statistics, while `renderHealthWarnings()` surfaces actionable issues.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-16T18:02:35.373Z","inputHash":"ccad7769a9eef661"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StaticDocsMap` {#symbol-staticdocsmap}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L18)

##### `StaticDocsMap` — Summary
Static docs map type (nodeId → markdown content)

#### `NavigateToNodeCallback` {#symbol-navigatetonodecallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L21)

##### `NavigateToNodeCallback` — Summary
Callback for navigating to a node from health warnings

#### `DownloadBundleType` {#symbol-downloadbundletype}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L24)

##### `DownloadBundleType` — Summary
Download bundle type

#### `DownloadFormat` {#symbol-downloadformat}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L27)

##### `DownloadFormat` — Summary
Download format

#### `DownloadCallback` {#symbol-downloadcallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L30)
- Parameters: `bundleType`: [`DownloadBundleType`](#symbol-downloadbundletype); `format`: [`DownloadFormat`](#symbol-downloadformat)

##### `DownloadCallback` — Summary
Callback for downloading documentation

#### `ViewBundledDocCallback` {#symbol-viewbundleddoccallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L33)

##### `ViewBundledDocCallback` — Summary
Callback for viewing a bundled doc in the detail panel

#### `BundledDocsData` {#symbol-bundleddocsdata}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L36)

##### `BundledDocsData` — Summary
Bundled docs tree data

#### `SourcesViewConfig` {#symbol-sourcesviewconfig}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L42)

##### `SourcesViewConfig` — Summary
Sources view configuration

#### `renderSourcesView` {#symbol-rendersourcesview}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts#L246)
- Parameters: `config`: [`SourcesViewConfig`](./index.ts.mdmd.md#symbol-sourcesviewconfig)

##### `renderSourcesView` — Summary
Render the Sources view panel showing graph statistics and health information.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`index.ViewerConfig`](../persistence/index.ts.mdmd.md#symbol-viewerconfig) (type-only)
- [`staticExplorerData.BundledMarkdownTreeNode`](../../shared/staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
