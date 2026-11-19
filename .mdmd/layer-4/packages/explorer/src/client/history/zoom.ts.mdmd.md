# packages/explorer/src/client/history/zoom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/zoom.ts
- Generated At: 2026-11-19T04:00:00.000Z

## Authored
### Purpose
The arithmetic of zooming and sliding the history's track: from the range shown, a step to zoom about, a factor and the history's length to the new range, and the same for a slide, a wheel's turn read as a factor, and the least slide of a range that holds a step. The scrubber turns the wheel, a pinch and the plus and minus keys into these calls.

### Notes
Written on 2026-11-19 for the owner's question in [Turn 26 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-26): "Could I pinch or scroll the history ticks area to expand or contract it, as one does for horizontal zoom in/out in FL Studio?" A zoom moves the range the finder's start and end brackets already chose (since 2026-11-01), so nothing new is stored: the range stays temporary presentation state, out of the address. The view is kept in fractional steps while a gesture runs, since a trackpad's turns are small and each alone would round to no change; the range shown is the view rounded. The least span, eight steps, keeps a day's commits in view together with their ticks a few pixels apart; a range the finder chose narrower than that is never widened by a narrowing. The wheel's factor is an exponential of its delta, so that even notches take even steps and a pinch (a wheel with Ctrl held, small deltas) is read more strongly.

## Generated
