# tests/e2e/card-ladder.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-ladder.spec.ts
- Generated At: 2026-11-06T10:54:12.883Z

## Authored
### Purpose
Browser regressions for the card ladder's first pass on the slot composition: the zoom's band, read from the map's `data-lod`, lets one tier of the card leave at the middle and far bands, names and the node's controls hold their screen size by the resistances in Tuning, and no card's box changes in any band.

### Notes
Written on [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10) with the ladder's first pass, which the owner asked for in [Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-9). The first case walks the payment service from the reading band one step closer, then out to the middle and far bands by the Zoom Out button until the map reports each, then back by Reset Zoom, asserting at each band what has left and what remains, the name's screen height against the resistance's prediction (ratio to the power of 0.2 at 0.8), the More button's and the anchor dot's unchanged screen size, and every card's box in the map's own pixels. The second sets both resistances to 0 in Tuning and checks that names, the button and the dot then scale with the map. The slot composition's own promises stay in [card-slots.spec.ts](card-slots.spec.ts.mdmd.md).

Since [Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11) the first case expects a name's screen height at the middle and far bands to be its reading height times the least of its measured room times the zoom ratio and Name Growth, and the file's name likewise within its header less the buttons' intrusion (all three at the middle band, More alone further out); the path is hidden from the middle band. The second case sets Name Growth to 1 with the resistances at 0, so that names and the file's name follow the map.

On November 6 ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), the shells merge) the spec's private stillness wait became the shared `localMapStill` of `still-picture.ts`.

Since the breakpoint pass (2026-11-06, [Turns 17 to 19](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)) the spec reads the map's `data-step` and the rows' measured rooms: one step closer, the name, the More buttons and the anchor dot grow with the map (zooming in shrinks nothing, which replaced the earlier assertion that controls hold their screen size when zooming in); a held control is drawn at its step's scale, within the step's bounds of its reading size (0.87 to 1.15, from the step module's constants), rather than exactly at it. Three cases were added: the camera's `data-camera` and the viewport's layer only while a wheel zoom or a drag moves it; every step on `tests/e2e/still-picture.ts` with a row pinned, out to the camera's minimum and in to its maximum, asserting that no dot covers its name, More stands on every row and no name crosses it or leaves its row, names stay within their limits, the pinned highlight holds its name inside its row, the prose stays at 12 px, past the last step nothing changes in the map's own units, and zooming in shrinks nothing; and the Pin's fold into More beyond the middle band, by keyboard, under the owner's rule of 2026-10-15 that releasing a file's last symbol pin leaves the file pinned whole.

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
- [`ladder-steps.LAST_STEP`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.STEP_HYSTERESIS`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-step_hysteresis)
- [`ladder-steps.STEP_RATIO`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
