# packages/engine/src/live-docs/history/ticks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/ticks.ts
- Generated At: 2026-10-18T00:39:19.287Z

## Authored
### Purpose
C3's major and minor ticks of a pin set: the steps in which the graph's shape of a pinned file, or of a file under a pinned directory, changed, and the steps in which git saw such a file's content change and the graph saw nothing. With nothing pinned every step is a major tick.

### Notes
- Written 2026-10-17 for C1, the pure part of C3 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), which the owner closed that day: "the kind of quantum leap events are major ticks and the update-only changes are minor ticks? I actually think that's visually quite clever!" ([Turn 3 of October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). The view's granularity, C14's tick model of days, weeks and months, belongs to the scrubber's ticket.
- A pin is read at one step, the last by default, and followed through the renames on either side of it, so a file pinned after its move is found under its old name in the steps before it (scenario 2, one file's life); a directory follows its renames whole.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Pins` {#symbol-pins}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L29)

##### `Pins` — Summary
What is pinned: files and directories, by path.

#### `Ticks` {#symbol-ticks}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L35)

##### `Ticks` — Summary
The steps that touch what is pinned, in order.

#### `ticksFor` {#symbol-ticksfor}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L47)
- Returns: [`Ticks`](#symbol-ticks)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence); `pins`: [`Pins`](#symbol-pins)

##### `ticksFor` — Summary
The major and minor ticks of the pins over the sequence's steps.

##### `ticksFor` — Parameters
- `at`: The step the pins' paths are read at; the last step by default.
- `pins`: What is pinned, by path at the step `at`.
- `sequence`: The sequence.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](./format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.changeAt`](./sequence.ts.mdmd.md#symbol-changeat)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange) (type-only)
<!-- LIVE-DOC:END Dependencies -->
