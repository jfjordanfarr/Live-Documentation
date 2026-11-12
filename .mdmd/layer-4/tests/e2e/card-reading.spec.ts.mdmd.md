# tests/e2e/card-reading.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-reading.spec.ts
- Generated At: 2026-11-06T07:19:51.783Z

## Authored
### Purpose
Current browser regressions for native portrait reading and reversible exploration.

### Notes
Uses actual documentation to exercise distinct Walk/walk hover targets, repeated return without DOM replacement, outward zoom and reading reset, phone framing, explicit full text and keyboard focus, shared unpinned reading and pinned folded text. The long-symbol case requires its parameter documentation, preventing a summary-only reader from claiming to provide the full description.

Introduced during the [November 4 portrait integration](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

Additional journeys cover Close on an unpinned reading card, search from overview followed by symbol-focused resize, an explicit full reader restored in 3D without creating discovery, and temporary reading ending across a perspective round trip. See the [integration record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

The [November 5 owner feedback](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) exposed two gaps: the old hover loop compared geometry only after leaving, and overview tests never tried to read while prose was suppressed. Nine added cases cover uninterrupted per-target geometry under both anchor tunings for PaymentService/Post and Walk/walk, actual rapid pointer hits, useful-scale hover/book/new-pin requests, deliberate folds independent of pins, pan and small inward zoom preserving requests, genuine actions during preview, interrupted returns, and rapid zoom reversal. Pointer targets are checked for actual reachability; automatic locator scrolling cannot disguise drift. The tuning seed uses the current persistence key/version.

Seven new cases fail the original 30aeaf8b bundle. The interrupted-return case instead catches a defect exposed by the first repair: completed expansions followed by 20 ms exits/reentry accumulated almost 397 px before the return-home lifetime was fixed. Rapid zoom uses genuine clicks on premeasured visible controls; locator actionability waits had let the disclosure finish and missed the overlap. The original tests and 0.1 px scene-restoration tolerance remain.

Rewritten on [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1) for descriptions that open on a tap: hovering a name draws nothing and moves nothing; taps on two symbols open, fold and reopen them with the same picture for the same set of open descriptions and a card name that never moves, under both anchor tunings; the overview journey taps instead of hovering; inspection comes from More after a tap; a name opens and folds from the keyboard and keeps focus, for a symbol and for the file; the file's name opens and folds everything; and a tapped description is saved reading that survives a 3D round trip. The preview-visit cases of November 5 (interrupted returns, a preview ending on leaving 2D) went with the previews; the rapid-zoom, phone-resize, full-reader, explicit-fold and shared-reading cases stay. The evidence is under [tap reading](../../../../AI-Agent-Workspace/Screenshots/2026-11-05/tap-reading/README.md). The overview tests run with the idle search off; since [Turn 6](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6) they assert that two steps out the prose fades and no card's box changes, measured in the map's own pixels, that a tap, the book and a new pin still read there, and that Return to reading size (named Reset Zoom until 2026-11-12) returns the prose to full strength; the phone case and the search-from-overview case expect the fade rather than the old fold.

Since [Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), when Card Text came to default to the fixed-slot composition, this spec pins the growing composition in its init script, since its journeys read that composition's recorded facts and in-place descriptions; the composition not chosen is to be deleted with its spec when the owner decides.

On [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) the pin became `keepGrowingComposition`, which merges the choice into the saved tuning rather than replacing it.

On November 6 ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), the shells merge) the spec's private stillness wait became the shared `localMapStill` of `still-picture.ts`.

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
- [`still-picture.keepGrowingComposition`](./still-picture.ts.mdmd.md#symbol-keepgrowingcomposition)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
