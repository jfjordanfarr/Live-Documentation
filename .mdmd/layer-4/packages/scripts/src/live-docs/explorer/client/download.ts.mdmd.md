# packages/scripts/src/live-docs/explorer/client/download.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/download.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-download-ts
- Generated At: 2026-02-20T21:28:57.787Z

## Authored

### Purpose

Collects Live Documentation entries and exports them as flattened markdown or ZIP archives. Supports both single-document and full-bundle downloads across server and static modes. [AI-Agent-Workspace/ChatHistory/2026/02/2026-02-20.1.md]

### Notes

- Created 2026-02-20 during the Explorer monolith refactor that brought `index.ts` from 1763 → 941 lines.
- Re-exports `DownloadBundleType` and `DownloadFormat` enums from `panels/sources-view.ts` to keep the public API co-located with the download logic.
- Uses JSZip for multi-file archive creation; the library is loaded dynamically in the browser bundle.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-20T21:28:57.787Z","inputHash":"51e56407db806a54"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `DownloadBundleType` {#symbol-downloadbundletype}

- Type: unknown
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/download.ts#L17)

#### `DownloadFormat` {#symbol-downloadformat}

- Type: unknown
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/download.ts#L17)

#### `DocEntry` {#symbol-docentry}

- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/download.ts#L20)

##### `DocEntry` — Summary

A single document entry for download.

#### `DownloadContext` {#symbol-downloadcontext}

- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/download.ts#L30)

##### `DownloadContext` — Summary

Options controlling which docs are collected and how they are fetched.

#### `downloadDocs` {#symbol-downloaddocs}

- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/download.ts#L229)
- Parameters: `bundleType`: [`DownloadBundleType`](./panels/sources-view.ts.mdmd.md#symbol-downloadbundletype); `format`: [`DownloadFormat`](./panels/sources-view.ts.mdmd.md#symbol-downloadformat); `ctx`: [`DownloadContext`](#symbol-downloadcontext)

##### `downloadDocs` — Summary

Main download function — collects docs and exports in the selected format.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- `jszip` - `JSZip`
- [`dataLoader.DataLoaderApi`](./dataLoader.ts.mdmd.md#symbol-dataloaderapi) (type-only)
- [`sources-view.DownloadBundleType`](./panels/sources-view.ts.mdmd.md#symbol-downloadbundletype) (type-only)
- [`sources-view.DownloadFormat`](./panels/sources-view.ts.mdmd.md#symbol-downloadformat) (type-only)
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
