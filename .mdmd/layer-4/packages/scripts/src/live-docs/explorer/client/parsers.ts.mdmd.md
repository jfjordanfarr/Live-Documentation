# packages/scripts/src/live-docs/explorer/client/parsers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/parsers.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-parsers-ts
- Generated At: 2026-02-03T21:55:36.017Z

## Authored
### Purpose
Runtime schema validators for graph and detail payloads fetched from the Explorer server. Ensures API responses conform to expected shapes before the client processes them.

### Notes
- Created 2025-12-02 to centralise JSON parsing logic.
- Uses a builder-pattern validator (`expectObject`, `expectArray`, `expectString`) for lightweight runtime checks without external dependencies.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.017Z","inputHash":"adcf30057bdeeb52"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseExplorerGraphPayload` {#symbol-parseexplorergraphpayload}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/parsers.ts#L138)

#### `parseExplorerDetailPayload` {#symbol-parseexplorerdetailpayload}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/parsers.ts#L143)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerDependencyReference`](../shared/types.ts.mdmd.md#symbol-explorerdependencyreference) (type-only)
- [`types.ExplorerDetailPayload`](../shared/types.ts.mdmd.md#symbol-explorerdetailpayload) (type-only)
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerGraphStats`](../shared/types.ts.mdmd.md#symbol-explorergraphstats) (type-only)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
