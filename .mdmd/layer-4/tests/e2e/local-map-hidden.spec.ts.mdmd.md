# tests/e2e/local-map-hidden.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-hidden.spec.ts
- Generated At: 2026-10-16T04:41:12.681Z

## Authored
### Purpose
Holds the Local Map's work to the view shown, in a real browser: the continuing search's counters stop while Knowledge Sources is shown and go on after the return, from the seed after the last tried and not from the first, with every card the same element; a filter changed while away is drawn when the map is shown again; and the page hidden pauses the search while visible resumes it.

### Notes
- Written 2026-10-16 with [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16), after [the probe](../../../../AI-Agent-Workspace/Probes/2026-10-16/explorer-performance/README.md) measured the search running behind Knowledge Sources and the return's 240 ms render of an unchanged picture ([Turn 12 of the October 15 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-12)).
- Seeds the tuning itself, as `local-map-search.spec.ts` does (the suite otherwise runs with the search off): the ranking's order alone before paint and eighty seeds with a patience of eighty, long enough for a view to be switched while the search runs and short enough to settle within the test's budget; the moves at zero length. Cards are told apart from cards drawn anew by a mark put on their elements. The views are switched by the navigation buttons; the page's visibility is set on the document and announced with `visibilitychange`, since a headless browser has no other way to hide a tab.
- The first run found a step already waiting when the view switched still ran once after it: the gate now stands in the waiting step as well as in the scheduling.
- The two pausing tests run the search's eighty seeds to the end after the return, 19 to 29 seconds on one worker, so since 2026-10-19 they declare a minute rather than the default half ([Turn 12 of the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-12)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
