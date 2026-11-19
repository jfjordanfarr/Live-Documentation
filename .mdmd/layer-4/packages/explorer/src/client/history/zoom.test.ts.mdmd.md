# packages/explorer/src/client/history/zoom.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/zoom.test.ts
- Generated At: 2026-11-19T04:31:53.346Z

## Authored
### Purpose
Verify the track's zoom arithmetic: the focus keeps its place, the range stays inside the history between the least span and the whole, a trackpad's many small turns add up, a slide keeps the span, a view rounds to a range or to none, and a range slides by the least amount to hold the step shown.

### Notes
Written with `zoom.ts` on 2026-11-19, for the owner's question in [Turn 26 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-26). The cases are hand-worked numbers rather than the module's own formulas, so that a change of the arithmetic shows here.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`zoom.LEAST_SPAN`](./zoom.ts.mdmd.md#symbol-least_span)
- [`zoom.panView`](./zoom.ts.mdmd.md#symbol-panview)
- [`zoom.rangeOfView`](./zoom.ts.mdmd.md#symbol-rangeofview)
- [`zoom.slideToHold`](./zoom.ts.mdmd.md#symbol-slidetohold)
- [`zoom.wheelFactor`](./zoom.ts.mdmd.md#symbol-wheelfactor)
- [`zoom.zoomView`](./zoom.ts.mdmd.md#symbol-zoomview)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
