# packages/explorer/src/client/history/step-summary.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/step-summary.ts
- Generated At: 2026-10-20T21:28:54.178Z

## Authored
### Purpose
What one step of the history changed, as the step panel says it: the commit; the files born, dead, renamed and resized with their archetype and symbol count at the step; the directories renamed whole; the wires that came, went and changed their count; and the files whose content changed while their shape did not; each file read where it stands today, through every rename since.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions): "each file a link that pins it where it still exists today and says 'gone since' where it does not". A file's fate is the engine's `followPath` from the step to the last one: a file that died on the way is gone since the commit that killed it; one that stands at the last step but not in today's bundle (a deletion not yet committed) is "not in today's docs"; a dead file is read under its path before the step, with its shape from the shape before. The summary is computed at rest, not while the thumb drags, since a full summary a frame is not what a drag reads. Kept by `step-summary.test.ts`.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) a summary names the documents the step linked and unlinked, a dead file's links with its shape before the step; they count among the step's changes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FileToday` {#symbol-filetoday}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L23)

##### `FileToday` — Summary
Where a file of the step stands today: under a path the bundle holds, or gone, since a commit when the sequence saw it die.

#### `SummaryFile` {#symbol-summaryfile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L26)

##### `SummaryFile` — Summary
A file as the panel names it: its path at the step, its shape there, and where it stands today.

#### `SummaryEdge` {#symbol-summaryedge}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L35)

##### `SummaryEdge` — Summary
A directed wire between two files, by their paths at the step.

#### `SummaryDocLink` {#symbol-summarydoclink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L42)

##### `SummaryDocLink` — Summary
A link from a file's authored words to a document, the file as the panel names it.

#### `StepSummary (interface)` {#symbol-stepsummary-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L48)

##### `StepSummary (interface)` — Summary
The step, in the panel's order.

#### `changeCount` {#symbol-changecount}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L70)

##### `changeCount` — Summary
How many things the step changed, the wires counted with the files.

#### `stepSummary (function)` {#symbol-stepsummary-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-summary.ts#L78)
- Returns: [`StepSummary`](#symbol-stepsummary-interface)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence); `shape`: [`Shape`](../views/worldMap/layout.ts.mdmd.md#symbol-shape)

##### `stepSummary (function)` — Summary
The summary of a step, given the shape at that step (so that the caller's
cursor is not seeked again) and whether a path stands in today's bundle.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.CommitInfo`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`format.HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.changeAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.commitAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.seek`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`shape.FileShape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-fileshape)
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-edgekey)
- [`ticks.followPath`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followpath)
<!-- LIVE-DOC:END Dependencies -->
