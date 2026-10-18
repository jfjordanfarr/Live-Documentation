# packages/explorer/src/client/history/tick-model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/tick-model.ts
- Generated At: 2026-10-18T05:55:48.769Z

## Authored
### Purpose
The ticks of the history's scrubber as one pure function: from every step's date, the engine's major and minor ticks for the pins (`ticksFor`, the plan's C3) and a chosen granularity and axis, to the ticks drawn with their weights and positions, the stops the step key moves between, and the ruler of dates beneath. The view's half of the granularity seam (the plan's C14).

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and the view's half of its C14, from the owner's words of [October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3): "the kind of quantum leap events are major ticks and the update-only changes are minor ticks", and "there is no one right granularity, depending on the size of the history". A major tick is a step that changed the shape of what is pinned, or with nothing pinned any step, the beginning too; a minor tick a step in which the version control saw a pinned file's content change and the graph saw nothing; the rest are quiet and drawn faint so the whole history stays in view, and a drag passes through every one of them whatever the ticks.
- The levers: the granularity (`step`, `day`, `week`, `month`, `salient`, or `auto`) and the axis (`steps`, evenly by index, or `time`, by date, so that a quiet half-year reads as a gap). A coarser granularity groups the steps by calendar period in UTC and draws one tick per period at the period's last step, carrying the heaviest weight of its steps; `salient` keeps only the major and minor ticks. The automatic rule is the finest granularity whose tick count fits `TICK_BUDGET` (120), so a five-commit repository shows five ticks and three years of ten commits a day show months; both levers live in `TuningConfig.history` and the Tuning panel's History group.
- By the time axis the thumb's reading is the latest step at or before the instant under it, the shape as of that date, so a drag through a gap holds the step before it; a commit date earlier than its predecessor's cannot fold the track. The ruler labels the first step of each year, month or day by the history's span; the scrubber hides the labels that would land on their neighbours, since that is a measurement of the page. Kept by `tick-model.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TICK_BUDGET` {#symbol-tick_budget}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L29)

##### `TICK_BUDGET` — Summary
How many ticks a track shows at most before the automatic choice coarsens them.

#### `TickModelInput` {#symbol-tickmodelinput}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L32)

##### `TickModelInput` — Summary
What the model is made from.

#### `TickWeight` {#symbol-tickweight}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L44)

##### `TickWeight` — Summary
How a tick is drawn: a change of the shape of what is pinned, a change of content alone, or neither.

#### `Tick` {#symbol-tick}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L47)

##### `Tick` — Summary
One tick drawn: the step the thumb lands on, where it stands on the track, and its weight.

#### `RulerLabel` {#symbol-rulerlabel}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L57)

##### `RulerLabel` — Summary
One label of the ruler beneath the ticks.

#### `TickModel (interface)` {#symbol-tickmodel-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L64)

##### `TickModel (interface)` — Summary
What the scrubber draws and the keys move by.

#### `positionOfStep` {#symbol-positionofstep}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L87)
- Parameters: `axis`: [`HistoryAxis`](../types.ts.mdmd.md#symbol-historyaxis)

##### `positionOfStep` — Summary
Where a step stands on the track: by its index, or by its date between the first and the last.

#### `stepAtPosition` {#symbol-stepatposition}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L100)
- Parameters: `axis`: [`HistoryAxis`](../types.ts.mdmd.md#symbol-historyaxis)

##### `stepAtPosition` — Summary
The step a position on the track names: by index the nearest step; by date the latest step at or before the instant
the position names, which is the shape as of that date, so that a drag through a quiet stretch holds the step before it.

#### `periodOf` {#symbol-periodof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L115)

##### `periodOf` — Summary
The calendar period a date falls in, in UTC: the day, the week (from its Monday) or the month.

#### `automaticGranularity` {#symbol-automaticgranularity}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L164)

##### `automaticGranularity` — Summary
The finest granularity whose ticks fit the budget; months when none does.

#### `rulerOf` {#symbol-rulerof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L176)
- Returns: [`RulerLabel`](#symbol-rulerlabel)[]
- Parameters: `axis`: [`HistoryAxis`](../types.ts.mdmd.md#symbol-historyaxis)

##### `rulerOf` — Summary
The ruler's labels: the first step of every year when the history spans more than two years, of every month when it
spans more than two, else of every day; each read where its step stands. The scrubber hides the labels that would
land on their neighbours.

#### `tickModel (function)` {#symbol-tickmodel-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L205)
- Returns: [`TickModel`](#symbol-tickmodel-interface)
- Parameters: `input`: [`TickModelInput`](#symbol-tickmodelinput)

##### `tickModel (function)` — Summary
The model the scrubber draws from.

#### `nextStop` {#symbol-nextstop}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/tick-model.ts#L214)
- Parameters: `model`: [`TickModel`](#symbol-tickmodel-interface)

##### `nextStop` — Summary
The stop the step key reaches from a step: the next major tick forward, the previous one back, the ends at the ends.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Ticks`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-ticks) (type-only)
- [`types.HistoryAxis`](../types.ts.mdmd.md#symbol-historyaxis) (type-only)
- [`types.HistoryGranularity`](../types.ts.mdmd.md#symbol-historygranularity) (type-only)
<!-- LIVE-DOC:END Dependencies -->
