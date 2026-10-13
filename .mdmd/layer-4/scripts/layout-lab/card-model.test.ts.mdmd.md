# scripts/layout-lab/card-model.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/card-model.test.ts
- Generated At: 2026-10-13T16:52:35.663Z

## Authored
### Purpose

Verifies the card model and its endpoint identities without a browser: chip wrapping, synthesized text heights, exact and normalized pin resolution, row-order reconstruction, and point-in-polygon membership.

### Notes

A chip row is tested at several widths, including chips wider than their row; synthesized text crosses its line-break threshold. Pin cases distinguish exact names from normalized aliases, later duplicate registrations from earlier rows, a hidden winning row from a missing name, and row endpoints from file or asset hubs. Display and registration queues are rebuilt from the requested construction order before layout ordering, including exact duplicates and case collisions such as `Item` and `item`. The stepped polygon checks include points both inside and outside its notch.

The text layout itself is held to the browser by the drift spec because Pretext preparation needs a canvas. The model tests began with the [October 6 lab](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10); the identity and ordering regressions protect the [October 13 competition work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`capture.RowCapture`](./capture.ts.mdmd.md#symbol-rowcapture) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface)
- [`card-model.chipsHeight`](./card-model.ts.mdmd.md#symbol-chipsheight)
- [`card-model.registerPins`](./card-model.ts.mdmd.md#symbol-registerpins)
- [`card-model.resolvePin`](./card-model.ts.mdmd.md#symbol-resolvepin)
- [`card-model.synthesizedHeight`](./card-model.ts.mdmd.md#symbol-synthesizedheight)
- [`measurer.cardViews`](./measurer.ts.mdmd.md#symbol-cardviews)
- [`signals.insidePolygon`](./signals.ts.mdmd.md#symbol-insidepolygon)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
