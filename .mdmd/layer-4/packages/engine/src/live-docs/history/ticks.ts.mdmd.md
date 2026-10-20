# packages/engine/src/live-docs/history/ticks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/ticks.ts
- Generated At: 2026-10-20T21:28:53.507Z

## Authored
### Purpose
C3's major and minor ticks of a pin set: the steps in which the graph's shape of a pinned file, or of a file under a pinned directory, changed, and the steps in which git saw such a file's content change and the graph saw nothing. With nothing pinned every step is a major tick.

### Notes
- Written 2026-10-17 for C1, the pure part of C3 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), which the owner closed that day: "the kind of quantum leap events are major ticks and the update-only changes are minor ticks? I actually think that's visually quite clever!" ([Turn 3 of October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). The view's granularity, C14's tick model of days, weeks and months, belongs to the scrubber's ticket.
- A pin is read at one step, the last by default, and followed through the renames on either side of it, so a file pinned after its move is found under its old name in the steps before it (scenario 2, one file's life); a directory follows its renames whole.

`followPins` and `followPath` (2026-10-18, for the Explorer's C4 in [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): where today's pins stand at a step, path for path in the order given, so that the tray can say which pin does not stand there and the view can retain a pinned file under its old name; and where one file of one step stands at another, or the step at which it ceased to on the way, its death going forward or its birth going back, so that the step panel can say "gone since" and a file not yet born is absent even where an earlier file stood at its path. A file below the version control's similarity threshold is a death and a birth, so a later file at the same path is another file.

Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) a link from a pinned file's authored words to a document coming or going is a change of its shape, a major tick.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Pins` {#symbol-pins}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L33)

##### `Pins` — Summary
What is pinned: files and directories, by path.

#### `Ticks` {#symbol-ticks}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L39)

##### `Ticks` — Summary
The steps that touch what is pinned, in order.

#### `ticksFor` {#symbol-ticksfor}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L51)
- Returns: [`Ticks`](#symbol-ticks)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence); `pins`: [`Pins`](#symbol-pins)

##### `ticksFor` — Summary
The major and minor ticks of the pins over the sequence's steps.

##### `ticksFor` — Parameters
- `at`: The step the pins' paths are read at; the last step by default.
- `pins`: What is pinned, by path at the step `at`.
- `sequence`: The sequence.

#### `followPins` {#symbol-followpins}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L95)
- Returns: [`Pins`](#symbol-pins)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence); `pins`: [`Pins`](#symbol-pins)

##### `followPins` — Summary
The pins' paths as they stand at step `to`, read at step `at` and followed
through the renames between, in either direction: a file pinned today found
under its old name at an earlier step, or a path of an earlier step carried
to its name today. Each list answers the one given, path for path, in its
order. A path that no rename touches keeps its name whether or not a file
stands at it; whether one does is the shape's to say, and whether a file
was yet born is {@link followPath}'s.

#### `FollowedPath` {#symbol-followedpath}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L114)

##### `FollowedPath` — Summary
Where a file of one step stands at another, or the step at which it ceased to on the way.

#### `followPath` {#symbol-followpath}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/ticks.ts#L130)
- Returns: [`FollowedPath`](#symbol-followedpath)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `followPath` — Summary
Follows one file, standing at `path` at step `from`, to step `to`. A file
below the version control's similarity threshold is a death and a birth,
shown as such, so a later file at the same path is another file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](./format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.changeAt`](./sequence.ts.mdmd.md#symbol-changeat)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange) (type-only)
<!-- LIVE-DOC:END Dependencies -->
