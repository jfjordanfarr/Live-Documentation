# packages/explorer/src/client/panels/omnisearch.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/omnisearch.ts
- Generated At: 2026-10-08T16:03:27.800Z

## Authored
### Purpose
Implements the Omnisearch bar for fuzzy artifact discovery. Provides keyboard-navigable search results with real-time filtering across all graph nodes by name, path, and symbol content.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `initOmnisearch()` function sets up the search input handler, result rendering, and keyboard navigation for the Ctrl+P-style search experience.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OmnisearchSelectCallback` {#symbol-omnisearchselectcallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/omnisearch.ts#L12)
- Parameters: `node`: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `OmnisearchSelectCallback` — Summary
Callback for when a node is selected from search results

#### `OmnisearchConfig` {#symbol-omnisearchconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/omnisearch.ts#L15)

##### `OmnisearchConfig` — Summary
Omnisearch configuration

#### `initOmnisearch` {#symbol-initomnisearch}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/omnisearch.ts#L29)
- Parameters: `config`: [`OmnisearchConfig`](#symbol-omnisearchconfig)

##### `initOmnisearch` — Summary
Initialize the omnisearch panel with keyboard shortcuts and fuzzy search.

##### `initOmnisearch` — Parameters
- `config`: Omnisearch configuration

##### `initOmnisearch` — Returns
API for programmatic control
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`template.omnisearch`](../../shared/template.html.mdmd.md#symbol-omnisearch)
- [`template.omnisearch-input`](../../shared/template.html.mdmd.md#symbol-omnisearch-input)
- [`template.omnisearch-results`](../../shared/template.html.mdmd.md#symbol-omnisearch-results)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
