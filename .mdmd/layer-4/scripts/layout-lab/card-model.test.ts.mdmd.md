# scripts/layout-lab/card-model.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/card-model.test.ts
- Generated At: 2026-11-08T10:06:47.584Z

## Authored
### Purpose

Verifies the card model and its endpoint identities without a browser: chip wrapping, synthesized text heights, exact and normalized pin resolution, row-order reconstruction, and point-in-polygon membership.

### Notes

A chip row is tested at several widths, including chips wider than their row; synthesized text crosses its line-break threshold. Pin cases distinguish exact names from normalized aliases, later duplicate registrations from earlier rows, a hidden winning row from a missing name, and row endpoints from file or asset hubs. Display and registration queues are rebuilt from the requested construction order before layout ordering, including exact duplicates and case collisions such as `Item` and `item`. The stepped polygon checks include points both inside and outside its notch.

The text layout itself is held to the browser by the drift spec because Pretext preparation needs a canvas. The model tests began with the [October 6 lab](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10); the identity and ordering regressions protect the [October 13 competition work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

A case of [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) holds a slot card's height and pins to its fixed allotments, whatever its rows' text.

Since 2026-11-08 a case holds the title's rule without a page: the room's box by the stylesheet's arithmetic, a name sharing its last line with the room (as tall as the room), a name whose last line leaves no room (the room on a line of its own), two lines with the room beside the second, a room shorter than a line, and a capture from before the round, whose title is its lines.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.edgeKey`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-edgekey)
- [`pin-state.EMPTY_PIN_SET`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`capture.CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture) (type-only)
- [`capture.PreparedText`](./capture.ts.mdmd.md#symbol-preparedtext) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface)
- [`card-model.cardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-function)
- [`card-model.chipsHeight`](./card-model.ts.mdmd.md#symbol-chipsheight)
- [`card-model.registerPins`](./card-model.ts.mdmd.md#symbol-registerpins)
- [`card-model.resolvePin`](./card-model.ts.mdmd.md#symbol-resolvepin)
- [`card-model.synthesizedHeight`](./card-model.ts.mdmd.md#symbol-synthesizedheight)
- [`card-model.titleHeight`](./card-model.ts.mdmd.md#symbol-titleheight)
- [`card-model.titleRoomBox`](./card-model.ts.mdmd.md#symbol-titleroombox)
- [`measurer.cardViews`](./measurer.ts.mdmd.md#symbol-cardviews)
- [`signals.insidePolygon`](./signals.ts.mdmd.md#symbol-insidepolygon)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
