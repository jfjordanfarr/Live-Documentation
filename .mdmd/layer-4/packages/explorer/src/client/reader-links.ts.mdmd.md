# packages/explorer/src/client/reader-links.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/reader-links.ts
- Generated At: 2026-11-04T15:03:15.877Z

## Authored
### Purpose
Current shared resolver for links in canonical documentation, used by on-map text and the full reader.

### Notes
Extracted from the existing reader during native card integration to keep document-relative resolution, exact symbol anchors, re-export origins and unavailable-link behavior identical on both surfaces. It resolves only against the bundled graph and Markdown inventory; it does not read source files or fetch missing content.

Introduced during the [November 4 portrait integration](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReaderLinkContext` {#symbol-readerlinkcontext}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/reader-links.ts#L9)

##### `ReaderLinkContext` — Summary
The bundled facts against which every documentation surface resolves a link.

#### `fileInspection` {#symbol-fileinspection}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reader-links.ts#L34)
- Parameters: `node`: [`ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload); `context`: [`ReaderLinkContext`](#symbol-readerlinkcontext)

##### `fileInspection` — Summary
Follow a documented re-export to its origin where the bundle carries that evidence.

#### `resolveReaderTarget` {#symbol-resolvereadertarget}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reader-links.ts#L61)
- Returns: [`InspectionTarget`](./types.ts.mdmd.md#symbol-inspectiontarget)
- Parameters: `context`: [`ReaderLinkContext`](#symbol-readerlinkcontext)

##### `resolveReaderTarget` — Summary
Resolve a documentation link to an exact bundled file, symbol, directory or authored document.

#### `readerLink` {#symbol-readerlink}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reader-links.ts#L90)
- Parameters: `target`: [`InspectionTarget`](./types.ts.mdmd.md#symbol-inspectiontarget)

##### `readerLink` — Summary
An escaped, inert-until-activated link to known evidence within the bundle.

#### `createReaderLinkHandler` {#symbol-createreaderlinkhandler}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reader-links.ts#L101)
- Parameters: `context`: [`ReaderLinkContext`](#symbol-readerlinkcontext)

##### `createReaderLinkHandler` — Summary
Authored Live Doc prose and bundled Markdown use exactly the same navigation rules.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.symbolName`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`types.InspectionTarget`](./types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
