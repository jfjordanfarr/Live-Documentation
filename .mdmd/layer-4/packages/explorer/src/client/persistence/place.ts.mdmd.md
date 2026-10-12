# packages/explorer/src/client/persistence/place.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/place.ts
- Generated At: 2026-10-12T19:21:19.478Z

## Authored
### Purpose

Reads an Explorer address as a navigable place: view, focused file, opened directories and complete path endpoints. Explicit 2D/3D changes remain history steps, while pins change the picture within a place.

### Notes

- Browser history was introduced in the [September 30 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-30.2.SUMMARIZED.md). Comparing parsed state avoids treating each compressed pin edit as another history entry.
- [View consolidation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4) gives Local Map folder navigation the same Back/Forward semantics as the retired folder view. A path counts only once both ends exist; the data-source parameter is not a place change.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `placeOf` {#symbol-placeof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/place.ts#L10)

##### `placeOf` — Summary
Reads the place from an address's query, in either form the Explorer writes: `?view=&node=` or the compressed `?s=`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`url-state.parseNavigation`](./url-state.ts.mdmd.md#symbol-parsenavigation)
<!-- LIVE-DOC:END Dependencies -->
