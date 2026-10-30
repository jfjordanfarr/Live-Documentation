# tests/e2e/search-bar.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/search-bar.spec.ts
- Generated At: 2026-10-30T14:57:11.744Z

## Authored
### Purpose

Playwright over the search bar: one search finds directories, files and symbols, grouped, with Ctrl+P reaching it and the old dialog and toolbar gone; a chosen symbol, directory and file are each pinned and become the newest pin, the destination field appearing with the first; a file named by the words is the first file offered, ahead of files that only expose a symbol of that name; a row's path reads at least 4.5:1 against its row, selected or not; each field is a combobox over a listbox whose expanded state and active descendant follow the results and the keyboard, open and after Escape; a file's matched symbols are capped at five with the rest counted and the fold lists them all; and the bar stands in every view, a file chosen on the World Map opens the Local Map pinned, and its words with results open and a path answered pass the design audit.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) after the bar was played by eye on both bundles. The fold is tested against a file found from the graph itself, a uniquely named one with at least seven symbols containing an e, so the test does not depend on which file that is.
- The ranking and contrast tests were added on 2026-10-30 for findings the [October 23 review](../../../../AI-Agent-Workspace/Screenshots/2026-10-23/README.md) made and the owner accepted ([Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)): "generator" listed `generator.ts` in the ninth row, and the paths were 10 px `#666` on `#1f1f22`, about 2.5:1 on a selected row. The contrast is judged by [contrast.ts](contrast.ts.mdmd.md) from the colours the page computes, each row's backgrounds laid over one another, so a selected row's tint counts.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`contrast.AA_SMALL_TEXT`](./contrast.ts.mdmd.md#symbol-aa_small_text)
- [`contrast.backdrop`](./contrast.ts.mdmd.md#symbol-backdrop)
- [`contrast.contrastRatio`](./contrast.ts.mdmd.md#symbol-contrastratio)
- [`contrast.parseColour`](./contrast.ts.mdmd.md#symbol-parsecolour)
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
