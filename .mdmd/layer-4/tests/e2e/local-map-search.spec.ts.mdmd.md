# tests/e2e/local-map-search.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-search.spec.ts
- Generated At: 2026-10-07T13:20:49.372Z

## Authored
### Purpose
Holds the continuing search in a real browser: after a thin first paint, twelve further starts find and adopt a better picture whose arithmetic price is within 2% of the page's measurement and whose own price is below the first paint's; a change of pins starts the search afresh from the seed after the first paint's last; a patience of three settles it well short of its cap.

### Notes
- Seeds the tuning itself (the suite otherwise runs with the search off, by the Playwright config's `storageState`), reads the search from the root's `data-search-*` attributes, and waits on `localMapSettled`, which waits for the search as well as for a move; the moves are set to zero length for speed. The second test clicks a row on a card wholly in the frame, since the map does not scroll. Written 2026-10-07 ([Turn 17](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-17)).
- Since 2026-10-08 the first paint of the first two tests is the ranking's order alone (`orderStarts: 0`), so that the better picture the search must find rests on a measured fact, that a seeded start beats the ranking's bare order on every scope the lab has tabulated (24% on 2026-10-06; 31% on this scope on 2026-10-08, [the lab's table](../../../../AI-Agent-Workspace/Probes/2026-10-08/layout-lab/repository-five-files-panel-pass.md)), and not on one seed beating another: the day the Knowledge Sources panel's facts module joined graph.ts's picture as a new consumer, the first paint's own seed became the shortest of thirteen and the tests that expected a later seed to beat it settled instead of capping.

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
