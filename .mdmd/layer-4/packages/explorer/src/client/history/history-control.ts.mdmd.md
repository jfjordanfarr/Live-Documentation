# packages/explorer/src/client/history/history-control.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/history-control.ts
- Generated At: 2026-11-01T22:32:18.300Z

## Authored
### Purpose
The history control of the 3D Local Map: fetches the bundle's sequence when first opened or when an address names a commit, owns the cursor over it, turns a move of the thumb into a moment for the view with the renames from the one shown before, drives the scrubber and the step panel, carries the commit to the address, and tells the tray when a pin does not stand at the moment shown.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), its scenarios 9, 10 and 14 and the paragraph "The bundle and the Explorer". The sequence is fetched only when asked for, so a page without history is no slower; an address that names a commit fetches it before the first picture, in `index.ts`, so that the page draws the moment once. The last step is today: there the view draws today's docs and the address carries no commit. A scrub feeds the view at energy zero (placement alone) and a rest at the tuning's energy, or settles the standing picture when the drag ended where it placed it; play is a second control at the tuning's rate, every step played. Leaving 3D for 2D or another view returns the picture to today and closes the control, since the 2D map and the World Map draw today's docs; coming back is today too unless the address names a commit.
- A moment's names are read once per file asked: a current or anchored historical file is followed by the engine's `followPath`, which stops at its birth, so a file not yet born is absent even where an earlier file stood at its path; a directory by `followPins`. The ticks are `ticksFor` over each pin's lifetime anchor and the open directories, recomputed when the pins change. A commit the sequence lacks, or one a short prefix names more than once, is said beside the track and today shown. A pin absent at the moment is said in the tray as "not yet created" or "deleted at <commit>" ("not yet born" until 2026-10-30, when the owner's Created and Deleted of 2026-10-26 replaced the words on screen), a directory with nothing under it as such, and never dropped. Held by `tests/e2e/history-scrubber.spec.ts`; the first run of that spec found the names misaligned when a pinned file was also the subject, which is why the moment follows each file on its own.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the control builds each moment's related-doc links and hands the step panel the bundle's documents to read.

- Since 2026-10-31 ([Turn 8 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8)) each moment carries what its step changed, the files born, renamed, resized, re-kinded, their entry or content changed, and the two ends of every wire that came, went or changed, with the pairs whose wire came or changed, read from the engine's change at the step, so that the view can tell them apart in the picture; the control takes the rate the scrubber's own speed control chose, which the client writes into Tuning's Play Rate. The November 1 correction removes play-state-dependent emphasis: change facts remain stable for the displayed commit, including the final commit over today's graph while history is open.
- Since 2026-10-30 ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)) the step panel can be hidden while the scrubber stays, by its own button or the scrubber's toggle. The choice holds across steps while the history is open and is not in the address; closing the history forgets it, so an opened history shows its panel. A hidden panel is not drawn until it is shown.

The [November 1 repairs](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2) introduced lifetime-anchored historical selections, moment-specific search and actionable deleted rows. Validated historical lookup nodes never enter the current canonical graph. Each past-only pin supplies its own anchor to salient-tick calculation; a tray focus can return to the nearest moment in its lifetime. Manual seeking, search and explicit inspection pause playback. Range selection restricts presentation and playback, not the loaded history.

Back and Forward can require an asynchronously loaded historical selection. Restoration waits for that sequence before validating retained identities, stays a replacement of the existing browser-history entry while it waits, and yields to a newer navigation. This fixes the [November 1 reload-and-Back journey](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2), where a cleared present-day page otherwise dropped its past-only pin before loading the evidence needed to recognize it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryControlOptions` {#symbol-historycontroloptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L46)

##### `HistoryControlOptions` — Summary
What the control is made with.

#### `HistoryContext` {#symbol-historycontext}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L79)

##### `HistoryContext` — Summary
What the client tells the control at every change of state.

#### `HistoryControl` {#symbol-historycontrol}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L91)

##### `HistoryControl` — Summary
The control as the client drives it.

#### `isHistorySequence` {#symbol-ishistorysequence}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L119)

##### `isHistorySequence` — Summary
Whether a sequence has the format this client reads.

#### `truncatedWords` {#symbol-truncatedwords}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L124)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `truncatedWords` — Summary
Why the history begins where it does, when it is cut there; null when it begins where the repository did.

#### `createHistoryControl` {#symbol-createhistorycontrol}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/history-control.ts#L131)
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
- [`sequence.changeAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.commitAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.seek`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`ticks.Pins`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-pins)
- [`Ticks`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-ticks)
- [`ticks.followPath`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followpath)
- [`ticks.followPins`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followpins)
- [`ticks.ticksFor`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-ticksfor)
- [`cursor.HistoryCursor`](./cursor.ts.mdmd.md#symbol-historycursor)
- [`file-identity.historicalDirectories`](./file-identity.ts.mdmd.md#symbol-historicaldirectories)
- [`file-identity.historicalNode`](./file-identity.ts.mdmd.md#symbol-historicalnode)
- [`file-identity.historicalOrigin`](./file-identity.ts.mdmd.md#symbol-historicalorigin)
- [`file-identity.referenceAt`](./file-identity.ts.mdmd.md#symbol-referenceat)
- [`file-identity.referenceFor`](./file-identity.ts.mdmd.md#symbol-referencefor)
- [`moment.HistoryChanges`](./moment.ts.mdmd.md#symbol-historychanges) (type-only)
- [`moment.HistoryMoment`](./moment.ts.mdmd.md#symbol-historymoment) (type-only)
- [`navigation.HistoryRange`](./navigation.ts.mdmd.md#symbol-historyrange)
- [`navigation.rangedTickModel`](./navigation.ts.mdmd.md#symbol-rangedtickmodel)
- [`rekey.NO_RENAMES`](./rekey.ts.mdmd.md#symbol-no_renames)
- [`rekey.Renames`](./rekey.ts.mdmd.md#symbol-renames)
- [`scrubber.createScrubber`](./scrubber.ts.mdmd.md#symbol-createscrubber)
- [`snapshot.relatedDocLinksOf`](./snapshot.ts.mdmd.md#symbol-relateddoclinksof)
- [`snapshot.snapshotGraphOf`](./snapshot.ts.mdmd.md#symbol-snapshotgraphof)
- [`step-panel.createStepPanel`](./step-panel.ts.mdmd.md#symbol-createsteppanel)
- [`step-summary.stepSummary`](./step-summary.ts.mdmd.md#symbol-stepsummary-function)
- [`types.HistoryTuning`](../types.ts.mdmd.md#symbol-historytuning) (type-only)
- [`forceGraphEmphasis.pairKey`](../views/forceGraphEmphasis.ts.mdmd.md#symbol-pairkey)
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
