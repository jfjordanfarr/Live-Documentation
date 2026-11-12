# tests/e2e/card-slots.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-slots.spec.ts
- Generated At: 2026-11-09T03:50:01.907Z

## Authored
### Purpose
Current browser regressions for fixed-slot cards: their allotted text space, deliberate shared reading choices, accessible books, and exact symbol arrivals in the reader.

### Notes

Following the owner’s [additional reading feedback](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review) and the root’s visual review on November 9 UTC, books return to meaningful prose in the fixed-slot composition. The cases exercise all, none and a single exact description through user controls, compare map-unit boxes, distinguish saved intent from currently visible prose at the middle/reading band boundary, verify whole-card reset and per-symbol precedence, and take none/subset/explicit-fold choices through a fresh shared visit, reload and Back/Forward. A preceding place proves that book toggles do not become navigation entries. Empty `Get`/`Post` slots have no empty books. Exact-target reading checks the long `reachability (function)` to `Walk (interface)` link, reopening a different map symbol, same-target refresh preserving an intentional scroll, and the distinct C# class/constructor declarations with the same base name. Existing deadlines remain unchanged. Earlier paragraphs record the original comparison’s contract.

Written on [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4) with the slot composition, which the owner asked to see beside the growing one before choosing. The cases hold what that composition promises: the ordinary drawing with no books and no reading class; the Purpose and a described symbol showing two lines, the Purpose cut with an ellipsis; every symbol getting the same allotment, filled or not, pinned or not, with or without hidden facts, and Slot Lines changing that allotment for all at once ([Turn 6](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6)); hover, a tap and the zoom fold changing no card's box, the tap opening the reader dialog and saving no reading choice; the prose fading to 0.35 two steps out and returning on Return to reading size (named Reset Zoom until 2026-11-12); a long description clamped at two lines with no Read full description link; the file's name opening the whole file in the reader; Enter on a name doing what a tap does; and the Tuning switch moving between the compositions at once, with books and the reading class returning under grow. Boxes are compared in the map's own pixels so that zoom does not disturb the comparison, and screen pictures within a scale to show nothing moved. The growing composition's cases stay in [card-reading.spec.ts](card-reading.spec.ts.mdmd.md). Whichever composition the owner does not choose is to be deleted with its spec.

Since the ladder's first pass later on November 5 ([Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)) two zoom steps out reach the middle band, so the first case expects the map's `data-lod` and a hidden Purpose there instead of the fade, which no longer applies to slot cards; the ladder's own promises are in [card-ladder.spec.ts](card-ladder.spec.ts.mdmd.md).

Since [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) the service's two-line slot is expected clipped, since a slot card took the ordinary card's width that day.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Locator`, `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
