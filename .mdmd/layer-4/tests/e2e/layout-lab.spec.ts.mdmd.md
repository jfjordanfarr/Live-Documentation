# tests/e2e/layout-lab.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/layout-lab.spec.ts
- Generated At: 2026-10-06T23:02:46.381Z

## Authored
### Purpose

Holds the layout lab's model to the page: on every deck scope, a capture laid out again at the page's own tuning gives the page's numbers.

### Notes

For each scope the test's own page shows the retained Local Map, `captureFromPage` reads it, and the lab's baseline must show no drift: every card's width, height and pin, every label's height, the placement measure and the picture's size; Pretext must have agreed with the page on every text. A failure here means the card model has fallen behind the stylesheet, or Pretext and the browser disagree on a text. A second test per scope (2026-10-06) reads the start the page drew and its price from the placed root, loads the scope again with no restarts (`orderStarts` 0 seeded into the Explorer's storage) and holds the chosen start no costlier than the ranking's order; the page may have drawn more than once before the reading, so the previous picture may be among the starts.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`capture.captureFromPage`](../../scripts/layout-lab/capture.ts.mdmd.md#symbol-capturefrompage)
- [`evaluate.baselineConfig`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-baselineconfig)
- [`evaluate.driftOf`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-driftof)
- [`evaluate`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-evaluate)
- [`scopes.loadBundleGraph`](../../scripts/layout-lab/scopes.ts.mdmd.md#symbol-loadbundlegraph)
- [`scopes.DECK_SCOPES`](./scopes.ts.mdmd.md#symbol-deck_scopes)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
