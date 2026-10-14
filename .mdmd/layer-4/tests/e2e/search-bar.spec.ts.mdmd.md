# tests/e2e/search-bar.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/search-bar.spec.ts
- Generated At: 2026-10-14T18:28:01.314Z

## Authored
### Purpose

Playwright over the search bar: one search finds directories, files and symbols, grouped, with Ctrl+P reaching it and the old dialog and toolbar gone; a chosen symbol, directory and file are each pinned and become the newest pin, the destination field appearing with the first; a file's matched symbols are capped at five with the rest counted and the fold lists them all; and the bar stands in every view, a file chosen on the World Map opens the Local Map pinned, and its words with results open and a path answered pass the design audit.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) after the bar was played by eye on both bundles. The fold is tested against a file found from the graph itself, a uniquely named one with at least seven symbols containing an e, so the test does not depend on which file that is.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`search-bar.choose`](./search-bar.ts.mdmd.md#symbol-choose)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`search-bar.newestKey`](./search-bar.ts.mdmd.md#symbol-newestkey)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
