# packages/explorer/src/client/history/navigation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/navigation.ts
- Generated At: 2026-11-19T05:10:42.835Z

## Authored
### Purpose
Find commits by their hash, date or message and give a selected interval the timeline's full width, keeping the original commit identities and the complete history available.

### Notes
The [November 1 end-user review](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/Summarized/2026-11-01.1.SUMMARIZED.md#turn-2) found that the full history's quiet months compressed a busy period into a few pixels. Range selection recomputes tick density over an inclusive interval; it does not sample or discard commits. Returned tick and stop indices still refer to the complete sequence. A range's first step preserves its actual change weight rather than becoming a fictitious base commit.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryRange` {#symbol-historyrange}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/history/navigation.ts#L7)

##### `HistoryRange` — Summary
Inclusive step indices in the complete sequence, not a sampled or rebuilt history.

#### `findCommits` {#symbol-findcommits}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/navigation.ts#L10)

##### `findCommits` — Summary
Find commits by hash, displayed date and message; exact hash prefixes lead, otherwise most recent first.

#### `rangedTickModel` {#symbol-rangedtickmodel}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/navigation.ts#L22)
- Returns: [`TickModel`](./tick-model.ts.mdmd.md#symbol-tickmodel-interface)
- Parameters: `input`: [`TickModelInput`](./tick-model.ts.mdmd.md#symbol-tickmodelinput); `range`: [`HistoryRange`](#symbol-historyrange)

##### `rangedTickModel` — Summary
Recompute tick density inside a selected interval while keeping every returned step in the sequence's numbering. The
granularity is chosen over the interval's own steps, so that as a zoom narrows the range months resolve into weeks,
days and single commits. The stops are the interval's own, its two ends among them, and beyond it the whole history's,
so that the coarse pair can carry the thumb past an end of the interval to the next mark (2026-11-19).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.CommitInfo`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`tick-model.TickModel`](./tick-model.ts.mdmd.md#symbol-tickmodel-interface)
- [`tick-model.TickModelInput`](./tick-model.ts.mdmd.md#symbol-tickmodelinput)
- [`tick-model.tickModel`](./tick-model.ts.mdmd.md#symbol-tickmodel-function)
<!-- LIVE-DOC:END Dependencies -->
