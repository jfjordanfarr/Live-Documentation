# tests/e2e/look-change-cost.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/look-change-cost.spec.ts
- Generated At: 2026-11-19T05:58:26.944Z

## Authored
### Purpose

Status: current. It holds what a change of look costs the 2D Local Map, by count rather than by clock, on the estate's `PaymentService.cs` pinned whole: a change between the reading and connections looks, out and back, restyles the whole map once (the new look's own restyle, since the looks' sizes are custom properties every card inherits from the map); and the cross-fade's class, added and taken away at rest in each of the three looks, restyles less than half of what a restyle of the whole map touches. The counts are read from Chromium traces (each style pass and the elements it restyled), and the whole map's count is measured on the page itself by setting one custom property on the map.

### Notes

Written in the night of 2026-11-18 to 19 for the freeze the owner found jarring when a zoom crossed a look's edge ("the stutter of performance as the stylesheet breakpoints were hit", [Turn 37 of that day's record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)). On this repository's `pathfind.ts` a change between reading and connections restyled the whole map three times: once at the old look, when `morphLook` read a box to restart animations that were not running; once for the new look; and once at the fade's end, when the class came off and took the held scales of the look left from every card and row, while one rule under the class ending in a bare `:not()` made the browser restyle everything inside the map whenever the class came or went. The measurements, the mend and what is left are in [the round's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/look-change-freeze/README.md). The machine is shared by several builders, so no case asserts a time; the one wait (250 ms, past the cross-fade's 160 ms animations, before the class is taken away) is a wait, not a measure. Both cases were shown able to fail: on `main` before the mend (`924bec80`) the first counted three whole-map restyles each way on the estate (a restyle of the whole map there touching 583 elements; out, 592, 698 and 703), and the second found the class's coming and going restyling more than the whole map's count in every look (702 against 568 in connections), the whole subtree the bare `:not()` rule made the browser restyle.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Browser`, `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
