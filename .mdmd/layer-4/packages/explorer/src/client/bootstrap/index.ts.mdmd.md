# packages/explorer/src/client/bootstrap/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/bootstrap/index.ts
- Generated At: 2026-10-08T16:03:27.538Z

## Authored
### Purpose
Barrel for the entry heuristics that choose which file to focus when neither the URL nor local storage names one.

### Notes
- Extracted from client/index.ts on 2025-12-19. Only the entry heuristics live here; the client's initialization is in `index.ts`.
- Since 2026-10-08 only `inferDefaultEntryNodeId` is re-exported; `scoreNode`, `buildDegreeMap` and the resolver type are imported from `entry-heuristics.ts` by the one file that names them, its test ([the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDefaultEntryNodeId` {#symbol-inferdefaultentrynodeid}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/index.ts#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`entry-heuristics.inferDefaultEntryNodeId`](./entry-heuristics.ts.mdmd.md#symbol-inferdefaultentrynodeid) (re-export)
<!-- LIVE-DOC:END Dependencies -->
