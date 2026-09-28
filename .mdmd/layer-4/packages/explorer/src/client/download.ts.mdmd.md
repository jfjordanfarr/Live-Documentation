# packages/explorer/src/client/download.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/download.ts
- Generated At: 2026-09-28T01:11:42.781Z

## Authored
### Purpose
Collects the Live Docs, rendered back from the graph, and the bundled related markdown, and exports them as one flattened markdown file or a ZIP that keeps the directory structure.

### Notes
- Created 2026-02-20 during the Explorer monolith refactor that brought `index.ts` from 1763 to 941 lines.
- Re-exports `DownloadBundleType` and `DownloadFormat` from `panels/sources-view.ts` to keep the public API co-located with the download logic.
- Uses JSZip for multi-file archive creation.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DownloadBundleType` {#symbol-downloadbundletype}
- Type: unknown
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L18)

#### `DownloadFormat` {#symbol-downloadformat}
- Type: unknown
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L18)

#### `DocEntry` {#symbol-docentry}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L21)

##### `DocEntry` — Summary
A single document entry for download.

#### `DownloadContext` {#symbol-downloadcontext}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L31)

##### `DownloadContext` — Summary
What the download draws on: the graph's files and the bundled related markdown.

#### `downloadDocs` {#symbol-downloaddocs}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L180)
- Parameters: `bundleType`: [`DownloadBundleType`](./panels/sources-view.ts.mdmd.md#symbol-downloadbundletype); `format`: [`DownloadFormat`](./panels/sources-view.ts.mdmd.md#symbol-downloadformat); `ctx`: [`DownloadContext`](#symbol-downloadcontext)

##### `downloadDocs` — Summary
Main download function — collects docs and exports in the selected format.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `jszip` - `JSZip`
- [`document.renderLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`sources-view.DownloadBundleType`](./panels/sources-view.ts.mdmd.md#symbol-downloadbundletype) (type-only)
- [`sources-view.DownloadFormat`](./panels/sources-view.ts.mdmd.md#symbol-downloadformat) (type-only)
<!-- LIVE-DOC:END Dependencies -->
