# packages/explorer/src/client/views/localView/held-lines.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/held-lines.test.ts
- Generated At: 2026-11-10T21:46:16.064Z

## Authored
### Purpose

Vitest cases for the held header: `heldSegments` on the names the owner has seen; `chooseHeldHeader` on the examples of the header round ("branch-renderer.ts" in a two-line room at the far step gives "branch-renderer" / ".ts" with More sharing the second line; "local-map-overview.spec.ts" stands whole on two lines at the overview band; a name that fits beside the controls shares the first line; a name that fills the room's last line with no room for the controls is cut beside them; the middle band's controls taller than a line) and over a grid of names, widths, room heights, control widths and heights, holding every principle that can be stated of the lines; `heldTitle`'s scales and room at the middle, far and overview bands, More held to a line of the name beyond the middle band; and that the stylesheet carries a drawing rule and a controls rule for every band and step the card reading writes.

### Notes

Written with the module on 2026-11-06, from the root's third review of the far bands, and rewritten on 2026-11-07 when the name became one line (the owner's "rather silly clunky" two-line titles, [November 6 record, Turn 8](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-8)). A character is one unit wide, as a monospaced font measures, so the expected line can be counted by hand: "verify.ts" with six units beside the button and twenty below goes below whole, the case the review of November 6 named; "branch-renderer.ts" beside a More two lines of the name tall in a room of two is cut on one line, where the four rules of November 6 drew "branch- / renderer.ts", the owner's picture. The grid checks, for every room, that one line holds the name and the lines before it are empty and stand beside the buttons, that a whole name stands below the buttons only when it does not fit beside them, and that a cut name fits neither line whole, stands on the wider and keeps as much of its start as fits with the ellipsis. The stylesheet case reads `reading.css` and fails if the last step grows without a drawing rule for it.

Rewritten on 2026-11-08 for the header round. A character is one unit wide and a line one unit tall, so the expected headers can be counted by hand. The grid holds, for every room: the first line holds the name's start; the controls stand on the last line sharing it, or alone on the line after; a shared line leaves them their width and a gap; a whole name fits the room, every line but the last filled and ending at a seam unless its segment is wider than a line; and a cut name is cut only on its last line, beside the controls, and only where the whole header would not have fitted.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`held-lines.HELD_BANDS`](./held-lines.ts.mdmd.md#symbol-held_bands)
- [`held-lines.HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom)
- [`held-lines.TitleRooms`](./held-lines.ts.mdmd.md#symbol-titlerooms)
- [`held-lines.chooseHeldHeader`](./held-lines.ts.mdmd.md#symbol-chooseheldheader)
- [`held-lines.heldSegments`](./held-lines.ts.mdmd.md#symbol-heldsegments)
- [`held-lines.heldTitle`](./held-lines.ts.mdmd.md#symbol-heldtitle)
- [`ladder-steps.FIRST_STEP`](./ladder-steps.ts.mdmd.md#symbol-first_step)
- [`ladder-steps.LAST_STEP`](./ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.LOOK_BANDS`](./ladder-steps.ts.mdmd.md#symbol-look_bands)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
