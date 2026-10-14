# packages/explorer/src/client/persistence/place.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/place.ts
- Generated At: 2026-10-14T18:27:57.627Z

## Authored
### Purpose

Reads an Explorer address as a navigable place: view, focused file, opened directories, the Local Map's representation and 3D layout, and the end of a path asked for. Explicit 2D/3D and layout changes remain history steps, while pins change the picture within a place.

### Notes

- Browser history was introduced in the [September 30 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-30.2.SUMMARIZED.md). Comparing parsed state avoids treating each compressed pin edit as another history entry.
- [View consolidation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4) gives Local Map folder navigation the same Back/Forward semantics as the retired folder view. The data-source parameter is not a place change.
- The end of a path asked for (2026-10-14, [Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) is a place of its own, a file with or without its symbol or a directory; its start, the newest pin, is not, since pinning stays within a place.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `placeOf` {#symbol-placeof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/place.ts#L11)

##### `placeOf` — Summary
Reads the place from an address's query, in either form the Explorer writes: `?view=&node=` or the compressed `?s=`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.decompressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`url-state.parseNavigation`](./url-state.ts.mdmd.md#symbol-parsenavigation)
<!-- LIVE-DOC:END Dependencies -->
