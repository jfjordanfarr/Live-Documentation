# packages/explorer/src/client/history/history-control.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/history-control.ts
- Generated At: 2026-10-22T16:47:54.048Z

## Authored
### Purpose
The history control of the 3D Local Map: fetches the bundle's sequence when first opened or when an address names a commit, owns the cursor over it, turns a move of the thumb into a moment for the view with the renames from the one shown before, drives the scrubber and the step panel, carries the commit to the address, and tells the tray when a pin does not stand at the moment shown.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), its scenarios 9, 10 and 14 and the paragraph "The bundle and the Explorer". The sequence is fetched only when asked for, so a page without history is no slower; an address that names a commit fetches it before the first picture, in `index.ts`, so that the page draws the moment once. The last step is today: there the view draws today's docs and the address carries no commit. A scrub feeds the view at energy zero (placement alone) and a rest at the tuning's energy, or settles the standing picture when the drag ended where it placed it; play is a second control at the tuning's rate, every step played. Leaving 3D for 2D or another view returns the picture to today and closes the control, since the 2D map and the World Map draw today's docs; coming back is today too unless the address names a commit.
- A moment's names are read once per file asked: today's file is followed back by the engine's `followPath`, which stops at its birth, so a file not yet born is absent even where an earlier file stood at its path; a directory by `followPins`. The ticks are `ticksFor` over today's pinned files and open directories, recomputed when the pins change. A commit the sequence lacks, or one a short prefix names more than once, is said beside the track and today shown. A pin absent at the moment is said in the tray as "not yet born", a directory with nothing under it as such, and never dropped. Held by `tests/e2e/history-scrubber.spec.ts`; the first run of that spec found the names misaligned when a pinned file was also the subject, which is why the moment follows each file on its own.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the control builds each moment's related-doc links and hands the step panel the bundle's documents to read.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryControlOptions` {#symbol-historycontroloptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L40)

##### `HistoryControlOptions` — Summary
What the control is made with.

#### `HistoryContext` {#symbol-historycontext}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L70)

##### `HistoryContext` — Summary
What the client tells the control at every change of state.

#### `HistoryControl` {#symbol-historycontrol}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L82)

##### `HistoryControl` — Summary
The control as the client drives it.

#### `isHistorySequence` {#symbol-ishistorysequence}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L100)

##### `isHistorySequence` — Summary
Whether a sequence has the format this client reads.

#### `truncatedWords` {#symbol-truncatedwords}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L105)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `truncatedWords` — Summary
Why the history begins where it does, when it is cut there; null when it begins where the repository did.

#### `createHistoryControl` {#symbol-createhistorycontrol}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L112)
- Returns: [`HistoryControl`](#symbol-historycontrol)
- Parameters: `options`: [`HistoryControlOptions`](#symbol-historycontroloptions)

##### `createHistoryControl` — Summary
Make the control under the 3D view, its scrubber and panel hidden until opened.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HISTORY_FORMAT`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_format)
- [`format.HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)
- [`queries.stepsMatching`](../../../../engine/src/live-docs/history/queries.ts.mdmd.md#symbol-stepsmatching)
- [`sequence.commitAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-commitat)
- [`ticks.Pins`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-pins)
- [`Ticks`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-ticks)
- [`ticks.followPath`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followpath)
- [`ticks.followPins`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followpins)
- [`ticks.ticksFor`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-ticksfor)
- [`cursor.HistoryCursor`](./cursor.ts.mdmd.md#symbol-historycursor)
- [`moment.HistoryMoment`](./moment.ts.mdmd.md#symbol-historymoment) (type-only)
- [`rekey.Renames`](./rekey.ts.mdmd.md#symbol-renames) (type-only)
- [`scrubber.createScrubber`](./scrubber.ts.mdmd.md#symbol-createscrubber)
- [`snapshot.relatedDocLinksOf`](./snapshot.ts.mdmd.md#symbol-relateddoclinksof)
- [`snapshot.snapshotGraphOf`](./snapshot.ts.mdmd.md#symbol-snapshotgraphof)
- [`step-panel.createStepPanel`](./step-panel.ts.mdmd.md#symbol-createsteppanel)
- [`step-summary.stepSummary`](./step-summary.ts.mdmd.md#symbol-stepsummary-function)
- [`tick-model.tickModel`](./tick-model.ts.mdmd.md#symbol-tickmodel-function)
- [`types.HistoryTuning`](../types.ts.mdmd.md#symbol-historytuning) (type-only)
- [`retained-state.RetainedItem`](../views/retained-state.ts.mdmd.md#symbol-retaineditem) (type-only)
- [`staticExplorerData.BundledHistory`](../../shared/staticExplorerData.ts.mdmd.md#symbol-bundledhistory) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
