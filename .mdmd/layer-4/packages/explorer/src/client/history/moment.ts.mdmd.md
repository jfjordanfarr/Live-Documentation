# packages/explorer/src/client/history/moment.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/moment.ts
- Generated At: 2026-10-20T21:28:54.029Z

## Authored
### Purpose
The type of a moment of the history the 3D Local Map shows in place of today: the step and its commit, the picture's data, and the names of today's things at that moment and of its things today, followed through every rename between.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and its scenario 9. The view reads its pins, its subject, its path and its open directories through `fileAt` and `directoryAt`, so that a pinned file is found under its old name and one not yet born retains nothing; a click on a sphere of the past goes through `fileToday` and `directoryToday` to the thing as it stands today, and a thing gone since does nothing there, since the step panel says so. `history-control.ts` makes a moment per step shown; `forceGraphView.ts` draws it.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) a moment carries its related-doc links beside its graph, so that the 3D view draws the documents the step's files linked to then.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryMoment` {#symbol-historymoment}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/moment.ts#L19)

##### `HistoryMoment` — Summary
One step of the history as the view draws it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.CommitInfo`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
