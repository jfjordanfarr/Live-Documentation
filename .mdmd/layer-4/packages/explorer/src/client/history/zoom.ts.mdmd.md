# packages/explorer/src/client/history/zoom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/zoom.ts
- Generated At: 2026-11-19T04:54:31.792Z

## Authored
### Purpose
The arithmetic of zooming and sliding the history's track: from the range shown, a step to zoom about, a factor and the history's length to the new range, and the same for a slide, a wheel's turn read as a factor, and the least slide of a range that holds a step. The scrubber turns the wheel, a pinch and the plus and minus keys into these calls.

### Notes
Written on 2026-11-19 for the owner's question in [Turn 26 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-26): "Could I pinch or scroll the history ticks area to expand or contract it, as one does for horizontal zoom in/out in FL Studio?" A zoom moves the range the finder's start and end brackets already chose (since 2026-11-01), so nothing new is stored: the range stays temporary presentation state, out of the address. The view is kept in fractional steps while a gesture runs, since a trackpad's turns are small and each alone would round to no change; the range shown is the view rounded. The least span, eight steps, keeps a day's commits in view together with their ticks a few pixels apart; a range the finder chose narrower than that is never widened by a narrowing. The wheel's factor is an exponential of its delta, so that even notches take even steps and a pinch (a wheel with Ctrl held, small deltas) is read more strongly.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LEAST_SPAN` {#symbol-least_span}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L17)

##### `LEAST_SPAN` — Summary
The narrowest range a zoom reaches, in steps between its ends: eight steps keep the ticks a few pixels apart and a day's commits in view together.

#### `View` {#symbol-view}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L20)

##### `View` — Summary
A range in fractional steps, its first and its last.

#### `zoomView` {#symbol-zoomview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L33)
- Returns: [`View`](#symbol-view)
- Parameters: `view`: [`View`](#symbol-view)

##### `zoomView` — Summary
The view scaled by `factor` about `focus`, a step (fractional) that stays where it stands on the track: a factor
below one narrows, above one widens. The span is held between the least span (or the whole history, if shorter) and
the whole history, `last` being the history's last step; a range already narrower than the least, as the finder can
choose, is never widened by a narrowing, and a range of one step widens from one. The view is slid back inside the
history where the scale would carry it past an end. `share`, from 0 at the track's start to 1 at its end, is where the
focus stands on the track; on the date axis that is not its share of the steps, and the pointer's own share keeps the
focus under the pointer. Without it, the focus's share of the steps.

#### `panView` {#symbol-panview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L46)
- Returns: [`View`](#symbol-view)
- Parameters: `view`: [`View`](#symbol-view)

##### `panView` — Summary
The view slid by `by` steps, later for a positive amount, held inside the history.

#### `rangeOfView` {#symbol-rangeofview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L54)
- Returns: [`HistoryRange`](./navigation.ts.mdmd.md#symbol-historyrange)
- Parameters: `view`: [`View`](#symbol-view)

##### `rangeOfView` — Summary
The range a view shows, its ends rounded to steps; null where it shows the whole history.

#### `slideToHold` {#symbol-slidetohold}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L61)
- Returns: [`HistoryRange`](./navigation.ts.mdmd.md#symbol-historyrange)
- Parameters: `range`: [`HistoryRange`](./navigation.ts.mdmd.md#symbol-historyrange)

##### `slideToHold` — Summary
The range slid by the least amount that holds the step, its span kept; the range itself where it holds it already.

#### `wheelFactor` {#symbol-wheelfactor}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/zoom.ts#L73)

##### `wheelFactor` — Summary
The factor a wheel's turn scales the view by: an exponential of its vertical delta, so that a trackpad's run of small
deltas is smooth and a notched wheel's even notches take even steps, each about a fifth. A trackpad's pinch reaches
the page as a wheel with Ctrl held and small deltas, so it is read more strongly. Lines and pages are read as pixels.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`navigation.HistoryRange`](./navigation.ts.mdmd.md#symbol-historyrange) (type-only)
<!-- LIVE-DOC:END Dependencies -->
