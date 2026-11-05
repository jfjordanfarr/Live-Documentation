# tests/e2e/card-reading.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-reading.spec.ts
- Generated At: 2026-11-05T03:49:57.624Z

## Authored
### Purpose
Current browser regressions for native portrait reading and reversible exploration.

### Notes
Uses actual documentation to exercise distinct Walk/walk hover targets, repeated return without DOM replacement, outward zoom and reading reset, phone framing, explicit full text and keyboard focus, shared unpinned reading and pinned folded text. The long-symbol case requires its parameter documentation, preventing a summary-only reader from claiming to provide the full description.

Introduced during the [November 4 portrait integration](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

Additional journeys cover Close on an unpinned reading card, search from overview followed by symbol-focused resize, an explicit full reader restored in 3D without creating discovery, and temporary reading ending across a perspective round trip. See the [integration record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

The [November 5 owner feedback](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) exposed two gaps: the old hover loop compared geometry only after leaving, and overview tests never tried to read while prose was suppressed. Nine added cases cover uninterrupted per-target geometry under both anchor tunings for PaymentService/Post and Walk/walk, actual rapid pointer hits, useful-scale hover/book/new-pin requests, deliberate folds independent of pins, pan and small inward zoom preserving requests, genuine actions during preview, interrupted returns, and rapid zoom reversal. Pointer targets are checked for actual reachability; automatic locator scrolling cannot disguise drift. The tuning seed uses the current persistence key/version.

Seven new cases fail the original 30aeaf8b bundle. The interrupted-return case instead catches a defect exposed by the first repair: completed expansions followed by 20 ms exits/reentry accumulated almost 397 px before the return-home lifetime was fixed. Rapid zoom uses genuine clicks on premeasured visible controls; locator actionability waits had let the disclosure finish and missed the overlap. The original tests and 0.1 px scene-restoration tolerance remain.

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
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`search-bar.choose`](./search-bar.ts.mdmd.md#symbol-choose)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
