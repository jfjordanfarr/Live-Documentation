# packages/scripts/src/live-docs/explorer/client/parsers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/parsers.ts
- Generated At: 2026-09-27T23:21:27.307Z

## Authored
### Purpose
Runtime schema validators for graph and detail payloads fetched from the Explorer server. Ensures API responses conform to expected shapes before the client processes them.

### Notes
- Created 2025-12-02 to centralise JSON parsing logic.
- Uses a builder-pattern validator (`expectObject`, `expectArray`, `expectString`) for lightweight runtime checks without external dependencies.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseExplorerGraphPayload` {#symbol-parseexplorergraphpayload}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/parsers.ts#L139)

##### `parseExplorerGraphPayload` — Summary
Validates and casts an unknown value to an {@link ExplorerGraphPayload}.

#### `parseExplorerDetailPayload` {#symbol-parseexplorerdetailpayload}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/parsers.ts#L145)

##### `parseExplorerDetailPayload` — Summary
Validates and casts an unknown value to an {@link ExplorerDetailPayload}.
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
