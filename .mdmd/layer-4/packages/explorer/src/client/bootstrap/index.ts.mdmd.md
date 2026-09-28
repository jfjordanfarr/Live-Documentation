# packages/explorer/src/client/bootstrap/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/bootstrap/index.ts
- Generated At: 2026-09-28T01:11:42.727Z

## Authored
### Purpose
Barrel for the entry heuristics that choose which file to focus when neither the URL nor local storage names one.

### Notes
- Extracted from client/index.ts on 2025-12-19. Only the entry heuristics live here; the client's initialization is in `index.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDefaultEntryNodeId` {#symbol-inferdefaultentrynodeid}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/index.ts#L8)

#### `scoreNode` {#symbol-scorenode}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/index.ts#L9)

#### `buildDegreeMap` {#symbol-builddegreemap}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/index.ts#L10)

#### `LinkEndpointResolver` {#symbol-linkendpointresolver}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/index.ts#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`entry-heuristics.LinkEndpointResolver`](./entry-heuristics.ts.mdmd.md#symbol-linkendpointresolver) (re-export)
- [`entry-heuristics.buildDegreeMap`](./entry-heuristics.ts.mdmd.md#symbol-builddegreemap) (re-export)
- [`entry-heuristics.inferDefaultEntryNodeId`](./entry-heuristics.ts.mdmd.md#symbol-inferdefaultentrynodeid) (re-export)
- [`entry-heuristics.scoreNode`](./entry-heuristics.ts.mdmd.md#symbol-scorenode) (re-export)
<!-- LIVE-DOC:END Dependencies -->
