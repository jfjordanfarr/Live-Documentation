# tests/e2e/hidden-file-cells.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/hidden-file-cells.spec.ts
- Generated At: 2026-11-17T13:35:19.031Z

## Authored
### Purpose
Current. Protects, in the browser, the Hidden Files trial of Tuning → 2D Layout on this repository's picture of `packages/engine/src/live-docs/pathfind.ts`: with Cells chosen, every card, closed box, membrane and handle stands at the same rectangle as with Count at the reading, connections and overview looks; each encasing directory's handle holds a mark for each file and directory its count counts, draws no count's words, veils at most one mark, keeps the count in its hover text, keeps its name whole beside any mark, and draws every cell at a closed directory's size. On the pathfind picture and the estate, at the three looks, wherever Count draws its words the parent's path is drawn at least as wide with Cells, to a pixel: the marks stand in the count's room. A press on a cell pins its file without opening the handle's directory, keeps the handle and the new card in view, the link then carries the choice, and unpinning the card brings the cell back; a press on a small skin opens its directory. A cell says its file's name alone on hover and "Pin <path>" to assistive technology, is lit alone under the pointer, and the marks of a handle are one stop in the tab order between the handle and More, moved among by the arrow keys and pressed by Enter. With Cells under name, the third value: no rectangle moves against Count at the three looks; at the reading look every encasing handle draws its marks under the line, inside the strip, and none in the line, history far more of them than beside the name; farther out the line's marks are those of Cells beside name exactly; the path is never narrower than with Count; a press on a cell under the name pins without opening the directory and keeps the handle in view, the field's arrow keys move in reading order, and a press on the field's air still opens the directory.

### Notes
Written on 2026-11-17 for the first milestone of the trial the owner asked about on 2026-11-16 ([Turn 6 of that record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-6): "Could those be represented as cute little cells that could be clicked on to expand them into fuller-sized nodes?"). The pure arithmetic of the line, how many marks fit and which one is veiled, is held by `closed-looks.test.ts`; this spec holds what only a page can show. It sets `searchStarts: 0` so that both visits draw the same order, since the comparison is of the two choices, not of the search. The marks' light eases in, so the lit case waits for it. The path case was added the same day on the root's review of the first milestone, whose marks had taken the whole parent path wherever the line was short ("live-docs" stood alone where Count drew "packages/engine/src/live-docs +30 files, 2 directories", and three directories of the picture are named `live-docs`); it compares only handles whose count Count draws, since where Count has no room for its words the marks may take the path's room.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Browser`, `Page`, `expect`, `test`
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`types.HiddenFilesLook`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-hiddenfileslook) (type-only)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
