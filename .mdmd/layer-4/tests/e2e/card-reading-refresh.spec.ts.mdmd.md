# tests/e2e/card-reading-refresh.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-reading-refresh.spec.ts
- Generated At: 2026-11-09T04:43:27.440Z

## Authored
### Purpose
Current browser regressions separating fixed-slot text presentation from changes to disclosed rows and reading retention, using the shipped continuing-search defaults.

### Notes
Introduced during the root’s normal-default integration review of the owner’s [reading-choice feedback](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review). The prior sparse-search journeys proved stable card dimensions but could not detect an unnecessary search restart. A normal pinned `reading-state.ts` visit recreated all nine cards and sixteen rows on each book action, then ran eight more ordering seeds, despite unchanged scope and almost identical final geometry. No visible reorder was proved in that observation.

A fresh context uses the current product defaults rather than the suite’s sparse-search storage preference. After the initial continuing search completes, whole-card folding and a single-description opening must retain search counters, ordered DOM identities, card/row/slot boxes, pins and keyboard focus while updating actual text and accessible state. The estate’s compact `PaymentsContext.cs` is the boundary example: folding its current text preserves the scene; keeping its already visible symbol open adds the independent reading retention’s Close control through a structural render; whole-card opening then discloses its seven rows through another structural render, surviving reload. A reading-only file also folds and restores row emphasis in place without acquiring a pin. Existing growing-card journeys cover the growing-mode fallback. No test deadline is enlarged.

The first normal-default test’s original rectangle baseline preceded keyboard focus, whose camera rewrite changed screen boxes by 0.010498 px before the reading action. An independent focus-only probe established that both subsequent reading actions changed boxes by exactly zero. Baselines now bracket each reading action after focus framing settles, retaining exact equality and the original search/DOM continuity checks. A separate diagnostic toggled books while the normal search remained at try one/running; the same cards and rows survived while that search continued to twelve/settled.

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
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
