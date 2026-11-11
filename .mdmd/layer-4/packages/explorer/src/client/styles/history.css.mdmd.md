# packages/explorer/src/client/styles/history.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/history.css
- Generated At: 2026-10-18T05:36:02.256Z

## Authored
### Purpose
The styles of the history's scrubber, its compact step panel and the dialog with the whole step in the 3D Local Map, and of the room the open scrubber takes from the controls and the tray above it.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions). The major ticks are tall and blue, the minor shorter and grey, the quiet faint hairlines; the truncated beginning is a hatched band the lane and the ruler start after; the panel stands on the left of the picture, as tall as what the step says and no taller than the room above the scrubber, where it scrolls (2026-10-30: its top and bottom had both been pinned, so a one-line step got a panel the picture's height). `#main` carries `--history-room`, set by the control to the scrubber's height when it is open, by which `local.css` lifts the perspective controls and the pin tray.
- Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)) the panel is compact. Its width rule is unchanged. Its subject is clamped to two lines with an ellipsis and clipped, as the cards' folded descriptions are, so no reveal by the browser can scroll it. Its header holds the "…" and hide buttons. Its height also leaves room for the control strip, which is 46 px tall and stands at 18 px plus the scrubber's room: before, the panel's lower edge could run under that strip. The whole step's dialog is about 720 px wide, never wider than the viewport less 32 px nor taller than it less 48 px. Its header stands while its body scrolls, and it has no animation.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
