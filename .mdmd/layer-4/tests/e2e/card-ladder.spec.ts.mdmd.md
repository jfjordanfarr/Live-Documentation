# tests/e2e/card-ladder.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-ladder.spec.ts
- Generated At: 2026-11-06T07:19:51.739Z

## Authored
### Purpose
Browser regressions for the card ladder's first pass on the slot composition: the zoom's band, read from the map's `data-lod`, lets one tier of the card leave at the middle and far bands, names and the node's controls hold their screen size by the resistances in Tuning, and no card's box changes in any band.

### Notes
Written on [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10) with the ladder's first pass, which the owner asked for in [Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-9). The first case walks the payment service from the reading band one step closer, then out to the middle and far bands by the Zoom Out button until the map reports each, then back by Reset Zoom, asserting at each band what has left and what remains, the name's screen height against the resistance's prediction (ratio to the power of 0.2 at 0.8), the More button's and the anchor dot's unchanged screen size, and every card's box in the map's own pixels. The second sets both resistances to 0 in Tuning and checks that names, the button and the dot then scale with the map. The slot composition's own promises stay in [card-slots.spec.ts](card-slots.spec.ts.mdmd.md).

Since [Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11) the first case expects a name's screen height at the middle and far bands to be its reading height times the least of its measured room times the zoom ratio and Name Growth, and the file's name likewise within its header less the buttons' intrusion (all three at the middle band, More alone further out); the path is hidden from the middle band. The second case sets Name Growth to 1 with the resistances at 0, so that names and the file's name follow the map.

On November 6 ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), the shells merge) the spec's private stillness wait became the shared `localMapStill` of `still-picture.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
