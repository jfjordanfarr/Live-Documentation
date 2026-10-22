# packages/explorer/src/client/history/scrubber.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/scrubber.ts
- Generated At: 2026-10-22T02:34:31.449Z

## Authored
### Purpose
The history's scrubber along the bottom of the 3D Local Map: a track with one tick per step from the tick model, the thumb, the ruler of dates beneath, the date and the hash read out, play and pause, and the authors toggle; the slider grammar on the keys and a drag coalesced to one call per animation frame.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), for the feel of the drag the owner put before play ([October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3): "the ability to scrub and have it feel good and useful sounds way more useful"). The track is a slider by role, its value spoken as the date and the commit's subject; the arrows move a step, Page Up and Page Down between the model's stops (the major ticks, the ends among them), Home and End to the ends, each a rest. While the pointer drags, the steps it crosses are kept to one `onScrub` per animation frame, so the thumb never lags the hand, and the release is one `onRest`; the control places the first without a tick and settles at the second.
- The ticks and the ruler are redrawn only when the model changes; a ruler label that would land on its neighbour is hidden, and one past the track's right edge is drawn ending at it, measurements of the page that the pure model leaves to the DOM. A history cut at its beginning (a shallow clone, or a window an export carries; scenario 8) gets a hatched band before its first tick, with its words on hover, the lane and the ruler starting after it; the band grew from a thread beside the track after the first look, where the thumb at step 0 covered it ([the pictures](../../../../../../../AI-Agent-Workspace/Screenshots/2026-10-18/history/README.md)). Authors are text in the panel only; the toggle rides the address (the plan's C8). Held by `tests/e2e/history-scrubber.spec.ts`.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the ruler's labels are placed again whenever the ruler's width changes, as when the reader opens and the scrubber ends at its edge; before, they were measured once when drawn, and a narrower scrubber could have laid them on each other.
- Since 2026-10-22 ([Turn 9 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-9)) the thumb stands at its step's position in the model, whatever the granularity; its own rule (the step's tick, or else the step's index) misplaced it by date inside a grouped period.
- Since 2026-10-22 ([Turn 10 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-10)) the pointer reaches three pixels (`POINTER_REACH_PX`) on the axis by date: a tick is one or two pixels wide, and a click on one must choose it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ScrubberState` {#symbol-scrubberstate}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/scrubber.ts#L29)

##### `ScrubberState` — Summary
What the scrubber draws.

#### `ScrubberOptions` {#symbol-scrubberoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/scrubber.ts#L51)

##### `ScrubberOptions` — Summary
What the scrubber tells.

#### `Scrubber` {#symbol-scrubber}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/scrubber.ts#L62)

##### `Scrubber` — Summary
The scrubber as the control drives it.

#### `createScrubber` {#symbol-createscrubber}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/scrubber.ts#L74)
- Returns: [`Scrubber`](#symbol-scrubber)
- Parameters: `options`: [`ScrubberOptions`](#symbol-scrubberoptions)

##### `createScrubber` — Summary
Make the scrubber under its parent, hidden until synced.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tick-model.TickModel`](./tick-model.ts.mdmd.md#symbol-tickmodel-interface)
- [`tick-model.nextStop`](./tick-model.ts.mdmd.md#symbol-nextstop)
- [`tick-model.stepAtPosition`](./tick-model.ts.mdmd.md#symbol-stepatposition)
- [`icon-button.iconButton`](../panels/icon-button.ts.mdmd.md#symbol-iconbutton)
- [`types.HistoryAxis`](../types.ts.mdmd.md#symbol-historyaxis) (type-only)
<!-- LIVE-DOC:END Dependencies -->
