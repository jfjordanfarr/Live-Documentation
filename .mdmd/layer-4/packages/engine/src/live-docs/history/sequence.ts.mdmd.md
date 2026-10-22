# packages/engine/src/live-docs/history/sequence.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/sequence.ts
- Generated At: 2026-10-22T16:47:53.349Z

## Authored
### Purpose
Writing a sequence step by step with a keyframe every 256 steps, and reading a step back: the commit and the change at a step, the shape at a step from the nearest keyframe and at most 255 deltas, and the head the bundle carries.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The builder derives each change, writes it, reads it back through the tables as a reader would, and stops at the first difference from the shape it came from: [the probe](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md)'s replay of all 122 of its snapshots against their indexes is a property of every build here, not a script run once.
- Only the last shape is held while building, so a long history builds in the memory of one snapshot (scenarios 4 and 6).
- Keyframes answer scenario 4 and C4: "a seek is the nearest keyframe plus its deltas, so a jump across the whole history costs what a step costs".

`changeAt` decodes a step's change once per sequence and hands the same object back after (2026-10-18, for the Explorer's C4), since every reader walks the changes again and again and a page scrubbing through a history asks many times a second; a caller reads a change and never changes it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SequenceHead` {#symbol-sequencehead}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L37)

##### `SequenceHead` — Summary
What a sequence says of itself before its body.

#### `SequenceWriter` {#symbol-sequencewriter}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L44)

##### `SequenceWriter` — Summary
Writes a sequence from its base and one change per step.

#### `SequenceBuilder` {#symbol-sequencebuilder}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L96)

##### `SequenceBuilder` — Summary
Builds a sequence from the shapes of the sampled changes, oldest first, and what the version control says between them.

#### `commitCount` {#symbol-commitcount}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L130)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `commitCount` — Summary
How many changes a sequence holds, its base included.

#### `commitAt` {#symbol-commitat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L135)
- Returns: [`CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `commitAt` — Summary
The change at a step: the base's at step 0.

#### `changeAt` {#symbol-changeat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L149)
- Returns: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `changeAt` — Summary
What the step did, by path; step 0, the base, did nothing. The change is
decoded once per sequence and the same object returned after, so a caller
reads it and never changes it.

#### `seek` {#symbol-seek}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L165)
- Returns: [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `seek` — Summary
The shape at a step: the nearest keyframe at or before it, or the base, and the deltas after it.

#### `headOf` {#symbol-headof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sequence.ts#L183)
- Returns: [`HistoryHead`](./format.ts.mdmd.md#symbol-historyhead)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `headOf` — Summary
What the sequence says of itself without its body.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`codec.Interner`](./codec.ts.mdmd.md#symbol-interner)
- [`codec.Interners`](./codec.ts.mdmd.md#symbol-interners)
- [`codec.Tables`](./codec.ts.mdmd.md#symbol-tables)
- [`codec.decodeChange`](./codec.ts.mdmd.md#symbol-decodechange)
- [`codec.decodeShape`](./codec.ts.mdmd.md#symbol-decodeshape)
- [`codec.encodeChange`](./codec.ts.mdmd.md#symbol-encodechange)
- [`codec.encodeShape`](./codec.ts.mdmd.md#symbol-encodeshape)
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
