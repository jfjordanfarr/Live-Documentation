# packages/scripts/src/live-docs/explorer/client/dataLoader.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/dataLoader.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-dataloader-ts
- Generated At: 2026-02-20T21:07:59.882Z

## Authored

### Purpose

Manages lazy-loading of bundled documentation for the Explorer client. In server mode, fetches from `/bundled-docs` on first access; in static mode, returns embedded data immediately. [AI-Agent-Workspace/ChatHistory/2026/02/2026-02-20.1.md]

### Notes

- Created 2026-02-20 during the Explorer monolith refactor (1763 → 941 lines) that extracted data loading, download, and Force Graph logic into dedicated modules.
- Exposes a `DataLoaderApi` with `getBundledDocs()` and `loadServerBundledDocs()`, consumed by the download and detail panel subsystems.
- Replaces ~80 lines of inline loading state and fetch logic that lived in `index.ts`.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-20T21:07:59.882Z","inputHash":"8d580bf809f8abcb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `ServerBundledDocsState` {#symbol-serverbundleddocsstate}

- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dataLoader.ts#L19)

##### `ServerBundledDocsState` — Summary

Tracks the lazy-loading state for server-fetched bundled documentation.

#### `DataLoaderOptions` {#symbol-dataloaderoptions}

- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dataLoader.ts#L30)

##### `DataLoaderOptions` — Summary

Options for creating the data loader.

#### `DataLoaderApi` {#symbol-dataloaderapi}

- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dataLoader.ts#L42)

##### `DataLoaderApi` — Summary

Public API for the data loader.

#### `createDataLoader` {#symbol-createdataloader}

- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dataLoader.ts#L57)
- Returns: [`DataLoaderApi`](#symbol-dataloaderapi)
- Parameters: `options`: [`DataLoaderOptions`](#symbol-dataloaderoptions)

##### `createDataLoader` — Summary

Creates a data loader that manages bundled documentation fetching.

In static mode, returns embedded data immediately.
In server mode, lazily fetches from `/bundled-docs` on first access.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`sources-view.BundledDocsData`](./panels/sources-view.ts.mdmd.md#symbol-bundleddocsdata) (type-only)
- [`staticExplorerData.BundledMarkdownTreeNode`](../shared/staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- [`staticExplorerData.RelatedDocLink`](../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
<!-- LIVE-DOC:END Dependencies -->
