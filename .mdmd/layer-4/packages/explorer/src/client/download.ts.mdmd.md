# packages/explorer/src/client/download.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/download.ts
- Generated At: 2026-10-08T16:40:17.400Z

## Authored
### Purpose
Collects the Live Docs, rendered back from the graph, and the bundled related markdown, and exports them as one flattened markdown file or a ZIP that keeps the directory structure.

### Notes
- Created 2026-02-20 during the Explorer monolith refactor that brought `index.ts` from 1763 to 941 lines.
- Re-exports `DownloadBundleType` and `DownloadFormat` from `panels/sources-view.ts` to keep the public API co-located with the download logic.
- Uses JSZip for multi-file archive creation.
- Since 2026-10-08 one `saveBlob` hands every download to the browser (the markdown and ZIP paths each had their own copy), and `downloadFactsJson` writes the Knowledge Sources panel's facts out as `knowledge-sources.json`, the owner's shape for headless parity: a person takes the data out and hands it on. The ZIP's README no longer lists chat history among the related documentation, which left the bundle on 2026-09-27.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DownloadBundleType` {#symbol-downloadbundletype}
- Type: unknown
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L19)

#### `DownloadFormat` {#symbol-downloadformat}
- Type: unknown
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L19)

#### `DocEntry` {#symbol-docentry}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L22)

##### `DocEntry` — Summary
A single document entry for download.

#### `DownloadContext` {#symbol-downloadcontext}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L32)

##### `DownloadContext` — Summary
What the download draws on: the graph's files and the bundled related markdown.

#### `downloadFactsJson` {#symbol-downloadfactsjson}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L104)
- Parameters: `facts`: [`SourcesFacts`](./panels/sources-facts.ts.mdmd.md#symbol-sourcesfacts-interface)

##### `downloadFactsJson` — Summary
The Knowledge Sources panel's facts as one JSON file, so that what the screen says can be taken out as data.

#### `downloadDocs` {#symbol-downloaddocs}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/download.ts#L178)
- Parameters: `bundleType`: [`DownloadBundleType`](./panels/sources-view.ts.mdmd.md#symbol-downloadbundletype); `format`: [`DownloadFormat`](./panels/sources-view.ts.mdmd.md#symbol-downloadformat); `ctx`: [`DownloadContext`](#symbol-downloadcontext)

##### `downloadDocs` — Summary
Main download function — collects docs and exports in the selected format.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `jszip` - `JSZip`
- [`document.renderLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`sources-facts.SourcesFacts`](./panels/sources-facts.ts.mdmd.md#symbol-sourcesfacts-interface) (type-only)
- [`sources-view.DownloadBundleType`](./panels/sources-view.ts.mdmd.md#symbol-downloadbundletype) (type-only)
- [`sources-view.DownloadFormat`](./panels/sources-view.ts.mdmd.md#symbol-downloadformat) (type-only)
<!-- LIVE-DOC:END Dependencies -->
