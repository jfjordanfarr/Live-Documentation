# packages/explorer/src/client/panels/sources-view.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/sources-view.ts
- Generated At: 2026-09-29T19:31:57.363Z

## Authored
### Purpose
Renders the Knowledge Sources panel: graph statistics, health warnings (high fan-out, high fan-in, islands), the tree of bundled related markdown, and the export controls.

### Notes
- Extracted from client/index.ts on 2025-12-19. The data-source and viewer-configuration rows that described a server mode went on 2026-09-28.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NavigateToNodeCallback` {#symbol-navigatetonodecallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L17)

##### `NavigateToNodeCallback` — Summary
Callback for navigating to a node from health warnings

#### `DownloadBundleType` {#symbol-downloadbundletype}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L20)

##### `DownloadBundleType` — Summary
Download bundle type

#### `DownloadFormat` {#symbol-downloadformat}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L23)

##### `DownloadFormat` — Summary
Download format

#### `DownloadCallback` {#symbol-downloadcallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L26)
- Parameters: `bundleType`: [`DownloadBundleType`](#symbol-downloadbundletype); `format`: [`DownloadFormat`](#symbol-downloadformat)

##### `DownloadCallback` — Summary
Callback for downloading documentation

#### `ViewBundledDocCallback` {#symbol-viewbundleddoccallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L29)

##### `ViewBundledDocCallback` — Summary
Callback for viewing a bundled doc in the detail panel

#### `BundledDocsData` {#symbol-bundleddocsdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L32)

##### `BundledDocsData` — Summary
Bundled docs tree data

#### `SourcesViewConfig` {#symbol-sourcesviewconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L38)

##### `SourcesViewConfig` — Summary
Sources view configuration

#### `renderSourcesView` {#symbol-rendersourcesview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L235)
- Parameters: `config`: [`SourcesViewConfig`](#symbol-sourcesviewconfig)

##### `renderSourcesView` — Summary
Render the Sources view panel showing graph statistics and health information.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`staticExplorerData.BundledMarkdownTreeNode`](../../shared/staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
