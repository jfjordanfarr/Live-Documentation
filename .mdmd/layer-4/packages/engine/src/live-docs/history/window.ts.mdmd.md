# packages/engine/src/live-docs/history/window.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/window.ts
- Generated At: 2026-10-18T00:39:19.367Z

## Authored
### Purpose
The part of a sequence an export carries, all of it, the commits since a date or the last so many, re-based so that its first commit is a full snapshot and its tables name only what it uses.

### Notes
- Written 2026-10-17 for C1, from C7's close in [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): what an export carries is the exporter's choice and sized, since it "is liable to make certain sizes of things absolutely explode" ([Turn 3 of October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). The static builder's `--history` reads it.
- A window keeps the source's and the lens's words and says which window it is; its base is where its knowledge begins, which the scrubber's left edge is to say (scenario 8).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistorySelection` {#symbol-historyselection}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/window.ts#L20)
- Returns: [`HistoryWindow`](./format.ts.mdmd.md#symbol-historywindow)

##### `HistorySelection` — Summary
Which part of a sequence to carry.

#### `windowOf` {#symbol-windowof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/window.ts#L23)
- Returns: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence); `selection`: [`HistorySelection`](#symbol-historyselection)

##### `windowOf` — Summary
The window of the sequence the selection names, re-based on its first change.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](./format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`format.HistoryWindow`](./format.ts.mdmd.md#symbol-historywindow) (type-only)
- [`sequence.SequenceWriter`](./sequence.ts.mdmd.md#symbol-sequencewriter)
- [`sequence.changeAt`](./sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.commitAt`](./sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.commitCount`](./sequence.ts.mdmd.md#symbol-commitcount)
- [`sequence.seek`](./sequence.ts.mdmd.md#symbol-seek)
<!-- LIVE-DOC:END Dependencies -->
