# `packages/engine/src/live-docs/history/sequence.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/history/sequence.ts`
- Generated At: 2026-11-19T21:10:12.275Z

## Authored
### Purpose
Writing a sequence step by step with a keyframe every 256 steps, and reading a step back: the commit and the change at a step, the shape at a step from the nearest keyframe and at most 255 deltas, and the head the bundle carries.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The builder derives each change, writes it, reads it back through the tables as a reader would, and stops at the first difference from the shape it came from: [the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md)'s replay of all 122 of its snapshots against their indexes is a property of every build here, not a script run once.
- Only the last shape is held while building, so a long history builds in the memory of one snapshot (scenarios 4 and 6).
- Keyframes answer scenario 4 and C4: "a seek is the nearest keyframe plus its deltas, so a jump across the whole history costs what a step costs".

`changeAt` decodes a step's change once per sequence and hands the same object back after (2026-10-18, for the Explorer's C4), since every reader walks the changes again and again and a page scrubbing through a history asks many times a second; a caller reads a change and never changes it.

Since 2026-11-19 ([Turn 35](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18) a moment is a shape and the rows of every file. The builder derives both changes of a step, writes them in one delta, replays both through the tables as a reader would, and stops on any difference from the shape and the rows it was given, and on any disagreement between the replayed rows and the replayed shape: the files, symbol counts, entry marks and wire counts the shape carries must be those the rows make, so the two streams of deltas hold each other at every step. A broken codec that dropped a step's reordering of symbols was seen to stop it. The rows are optional to the builder and the writer, so that a caller that reads no summaries, as the Explorer's tests do, builds a sequence of the shape alone; `momentAt` and `rowsChangeAt` read the rows back, and `seek` reads the shape as before. Rows are shared between moments and never changed in place.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SequenceHead` {#symbol-sequencehead}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L44)

##### `SequenceHead` — Summary
What a sequence says of itself before its body.

#### `Moment` {#symbol-moment}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L51)

##### `Moment` — Summary
Everything a sequence knows of one change: its shape, the first rung, and its rows, the second.

#### `SequenceWriter` {#symbol-sequencewriter}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L58)

##### `SequenceWriter` — Summary
Writes a sequence from its base and one change per step.

#### `SequenceBuilder` {#symbol-sequencebuilder}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L129)

##### `SequenceBuilder` — Summary
Builds a sequence from the shapes of the sampled changes, oldest first, and what the version control says between
them, and from their rows when it is given them: given rows at its base, it must be given them at every step.

#### `commitCount` {#symbol-commitcount}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L183)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `commitCount` — Summary
How many changes a sequence holds, its base included.

#### `commitAt` {#symbol-commitat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L188)
- Returns: [`CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `commitAt` — Summary
The change at a step: the base's at step 0.

#### `changeAt` {#symbol-changeat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L203)
- Returns: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `changeAt` — Summary
What the step did, by path; step 0, the base, did nothing. The change is
decoded once per sequence and the same object returned after, so a caller
reads it and never changes it.

#### `rowsChangeAt` {#symbol-rowschangeat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L209)
- Returns: [`RowsChange`](./rows.ts.mdmd.md#symbol-rowschange)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `rowsChangeAt` — Summary
What the step did to the rows, by path and anchor; decoded once per sequence, as {@link changeAt} is.

#### `seek` {#symbol-seek}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L242)
- Returns: [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `seek` — Summary
The shape at a step: the nearest keyframe at or before it, or the base, and the deltas after it.

#### `momentAt` {#symbol-momentat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L253)
- Returns: [`Moment`](#symbol-moment)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `momentAt` — Summary
The shape and the rows at a step, from the nearest keyframe at or before it, or the base, and the deltas after it.

#### `headOf` {#symbol-headof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L267)
- Returns: [`HistoryHead`](./format.ts.mdmd.md#symbol-historyhead)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `headOf` — Summary
What the sequence says of itself without its body.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`codec.Interners`](./codec.ts.mdmd.md#symbol-interners)
- [`codec.RowTables`](./codec.ts.mdmd.md#symbol-rowtables)
- [`codec.decodeChange`](./codec.ts.mdmd.md#symbol-decodechange)
- [`codec.decodeRows`](./codec.ts.mdmd.md#symbol-decoderows)
- [`codec.decodeRowsChange`](./codec.ts.mdmd.md#symbol-decoderowschange)
- [`codec.decodeShape`](./codec.ts.mdmd.md#symbol-decodeshape)
- [`codec.encodeChange`](./codec.ts.mdmd.md#symbol-encodechange)
- [`codec.encodeRows`](./codec.ts.mdmd.md#symbol-encoderows)
- [`codec.encodeRowsChange`](./codec.ts.mdmd.md#symbol-encoderowschange)
- [`codec.encodeShape`](./codec.ts.mdmd.md#symbol-encodeshape)
- [`codec.newInterners`](./codec.ts.mdmd.md#symbol-newinterners)
- [`derive.deriveChange`](./derive.ts.mdmd.md#symbol-derivechange)
- [`format.CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo)
- [`format.HISTORY_FORMAT`](./format.ts.mdmd.md#symbol-history_format)
- [`format.HistoryHead`](./format.ts.mdmd.md#symbol-historyhead)
- [`format.HistoryLens`](./format.ts.mdmd.md#symbol-historylens)
- [`format.HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)
- [`format.HistorySource`](./format.ts.mdmd.md#symbol-historysource)
- [`format.HistoryStep`](./format.ts.mdmd.md#symbol-historystep)
- [`format.HistoryWindow`](./format.ts.mdmd.md#symbol-historywindow)
- [`format.KEYFRAME_INTERVAL`](./format.ts.mdmd.md#symbol-keyframe_interval)
- [`format.Keyframe`](./format.ts.mdmd.md#symbol-keyframe)
- [`format.SnapshotTuples`](./format.ts.mdmd.md#symbol-snapshottuples)
- [`rows.FileRows`](./rows.ts.mdmd.md#symbol-filerows)
- [`Rows`](./rows.ts.mdmd.md#symbol-rows)
- [`rows.RowsChange`](./rows.ts.mdmd.md#symbol-rowschange)
- [`rows.applyRowsChange`](./rows.ts.mdmd.md#symbol-applyrowschange)
- [`rows.deriveRowsChange`](./rows.ts.mdmd.md#symbol-deriverowschange)
- [`rows.emptyRowsChange`](./rows.ts.mdmd.md#symbol-emptyrowschange)
- [`rows.rowsAgainstShape`](./rows.ts.mdmd.md#symbol-rowsagainstshape)
- [`rows.rowsDifferences`](./rows.ts.mdmd.md#symbol-rowsdifferences)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- [`shape.applyChange`](./shape.ts.mdmd.md#symbol-applychange)
- [`shape.shapeDifferences`](./shape.ts.mdmd.md#symbol-shapedifferences)
- [`versionControl.VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
