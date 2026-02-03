# packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-panels-omnisearch-ts
- Generated At: 2026-02-03T21:55:35.901Z

## Authored
### Purpose
Implements the Omnisearch bar for fuzzy artifact discovery. Provides keyboard-navigable search results with real-time filtering across all graph nodes by name, path, and symbol content.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `initOmnisearch()` function sets up the search input handler, result rendering, and keyboard navigation for the Ctrl+P-style search experience.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.901Z","inputHash":"2594f08e29e5421a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OmnisearchSelectCallback` {#symbol-omnisearchselectcallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts#L11)
- Parameters: `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `OmnisearchSelectCallback` — Summary
Callback for when a node is selected from search results

#### `OmnisearchConfig` {#symbol-omnisearchconfig}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts#L14)

##### `OmnisearchConfig` — Summary
Omnisearch configuration

#### `initOmnisearch` {#symbol-initomnisearch}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts#L45)
- Parameters: `config`: [`OmnisearchConfig`](./index.ts.mdmd.md#symbol-omnisearchconfig)

##### `initOmnisearch` — Summary
Initialize the omnisearch panel with keyboard shortcuts and fuzzy search.

##### `initOmnisearch` — Parameters
- `config`: Omnisearch configuration

##### `initOmnisearch` — Returns
API for programmatic control
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
