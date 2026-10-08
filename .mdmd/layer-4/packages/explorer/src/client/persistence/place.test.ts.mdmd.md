# packages/explorer/src/client/persistence/place.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/persistence/place.test.ts
- Generated At: 2026-10-02T21:07:39.046Z

## Authored
### Purpose
Keeps what `place.ts` counts as a move and what as a change within a place: views and files are different places, a bare node is the Local Map, an opened folder of the Membrane Map is a move, pins, expanded cards, pan and zoom are the same place, a path counts only with both ends, and the data file the page was opened on is ignored.

### Notes
- Written on 2026-09-30 with Back and Forward ([Turn 16](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-16)). The Membrane Map cases build real compressed `?s=` addresses through `compressSnapshot`, since that one parameter carries both the open folders and the pins, which is the reason `place.ts` decodes it rather than comparing raw addresses.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.DEFAULT_SNAPSHOT`](./compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`place.placeOf`](./place.ts.mdmd.md#symbol-placeof)
- [`pin-state.addPin`](../views/pin-state.ts.mdmd.md#symbol-addpin)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
