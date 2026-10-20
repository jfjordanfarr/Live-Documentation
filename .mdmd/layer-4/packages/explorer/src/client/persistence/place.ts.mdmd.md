# packages/explorer/src/client/persistence/place.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/place.ts
- Generated At: 2026-10-14T18:27:57.627Z

## Authored
### Purpose

Reads an Explorer address as a comparable navigation place: view, map subject, opened directories, Local Map representation and layout, path destination, and explicitly open evidence. Browser history uses that identity to distinguish a new place from changes to pins, filters or the picture within it.

### Notes

- Browser history was introduced in the [September 30 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-30.2.SUMMARIZED.md). Comparing parsed state avoids treating each compressed pin edit as another history entry.
- [View consolidation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4) gives Local Map folder navigation the same Back/Forward semantics as the retired folder view. The data-source parameter is not a place change.
- The end of a path asked for (2026-10-14, [Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) is a place of its own, a file with or without its symbol or a directory; its start, the newest pin, is not, since pinning stays within a place.
- Opening, changing and closing evidence are navigation steps even when the map subject stays fixed. File-symbol targets, directories and bundled-document fragments remain distinct. This follows the owner's [shared-link and Back decision](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-19); the application restores reader-only steps without asking a renderer to redraw the map.

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
