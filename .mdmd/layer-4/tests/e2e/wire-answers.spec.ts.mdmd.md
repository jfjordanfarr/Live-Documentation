# `tests/e2e/wire-answers.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/wire-answers.spec.ts`
- Generated At: 2026-11-22T02:10:47.094Z

## Authored
### Purpose
Browser cases for the two wire trials of Tuning → 2D Wires, on the estate's `PaymentService` with `Data` opened and on this repository's `pathfind.ts`: Wire Answers' rest, pass-over, press, Escape, press elsewhere, a drag begun on a wire that pans, the keyboard's walk from a card, a gathered wire's spoken name, and the design audit with both levers on; Direction Marks' three values, read from the chevrons written into the wires' paths.

### Notes
- Made on November 21, 2026, with [`wire-answers.ts`](../../packages/explorer/src/client/views/localView/wire-answers.ts.mdmd.md) and [`wire-marks.ts`](../../packages/explorer/src/client/views/localView/wire-marks.ts.mdmd.md). The pass-over moves the pointer across a wire in eight steps and waits past the dwell: nothing may stand. The audit lets the pinned panel cover map text elsewhere, since it floats over the map as the World Map's does, but not the names of the two cards it speaks of. The pictures are [the line-direction evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/line-direction/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Browser`, `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`types.DirectionMarks`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-directionmarks) (type-only)
- [`types.WireAnswersChoice`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-wireanswerschoice) (type-only)
- [`pointerRest.REST_DWELL`](../../packages/explorer/src/client/views/pointerRest.ts.mdmd.md#symbol-rest_dwell)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`search-bar.choose`](./search-bar.ts.mdmd.md#symbol-choose)
- [`still-picture.AT_READING_SIZE`](./still-picture.ts.mdmd.md#symbol-at_reading_size)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
