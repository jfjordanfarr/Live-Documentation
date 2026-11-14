# packages/explorer/src/client/views/localView/overview-files.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/overview-files.ts
- Generated At: 2026-11-14T00:14:43.032Z

## Authored
### Purpose
The pure rules of a trial for the owner's eye, files only at the 2D Local Map's farthest zoom look: when the overview draws files only (the choice made, the three looks drawn, the overview shown), which element a change between the two layouts holds still on screen (the one under the pointer, else the one nearest the frame's centre), and what Fit frames while the compact picture is shown (the picture with its rows, so that a second press changes nothing). The controller, the branch renderer, the card reading and the wires read the container's attribute named here.

### Notes
Written on 2026-11-13 after the owner, having opened three directories in Flow, wrote "I feel like the "Flow" look is much closer to what the full zoom-out in the 2D Local Map might reasonably be" ([November 13, Turn 8](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-8)). It stands behind Tuning → 2D Layout → Zoomed Out Fully, whose default keeps the cards' size, because the owner's own rule had been that cards do not resize as the map zooms out; the trial bends it at one look, by the move a fold of a description already makes, so that the owner can judge the far picture and the move into it by eye.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OVERVIEW_FILES_ATTRIBUTE` {#symbol-overview_files_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L16)

##### `OVERVIEW_FILES_ATTRIBUTE` — Summary
The container's attribute that says the overview draws files only, read by the stylesheet and the wires.

#### `OVERVIEW_LINES_ATTRIBUTE` {#symbol-overview_lines_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L23)

##### `OVERVIEW_LINES_ATTRIBUTE` — Summary
The container's attribute that says, for the length of the move back in from files only, that the wires are still drawn
as the pairs' lines: a row the growing card still hides has no wire drawn to it, and the symbols' wires are drawn
when the move ends.

#### `COMPACT_AIR` {#symbol-compact_air}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L26)

##### `COMPACT_AIR` — Summary
The air left below a compact card's name, in lines of the name at its size, so that its last line is clear of the card's edge.

#### `filesNameScale` {#symbol-filesnamescale}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L34)

##### `filesNameScale` — Summary
The scale a compact card's name is held at with files only: the overview look's, unless the widest of the name's
segments (the pieces between its seams) would not fit the card's room across at it; then the largest at which every
segment fits, so that the name breaks only at its seams, as Flow's names do; never below the connections look's
scale, where a segment wider still breaks as it must. Rounded down to the thousandth that the stylesheet is written.

#### `OverviewFilesTuning` {#symbol-overviewfilestuning}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L41)

##### `OverviewFilesTuning` — Summary
The tuning the trial reads: the three looks with fixed slots, and the choice itself.

#### `overviewFilesShown` {#symbol-overviewfilesshown}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L48)
- Parameters: `tuning`: [`OverviewFilesTuning`](#symbol-overviewfilestuning); `look`: [`ZoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-type)

##### `overviewFilesShown` — Summary
Whether the map draws files only: the choice made, the three looks drawn, and the overview the look shown.

#### `PictureSize` {#symbol-picturesize}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L53)

##### `PictureSize` — Summary
A picture's size in the map's own units, as the scene lays it out.

#### `rowsFrame` {#symbol-rowsframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L65)
- Returns: `Box`
- Parameters: `content`: `Box`; `shown`: [`PictureSize`](#symbol-picturesize); `rows`: [`PictureSize`](#symbol-picturesize)

##### `rowsFrame` — Summary
What Fit frames while files only is shown: the content as measured, grown by what the picture with its rows has more
than the compact one, from the same top left (the two share their columns, so the width rarely differs). Fit then
frames the same picture whichever of the two is shown, so that a second press changes nothing and Fit never flips
between the two layouts: the compact picture stands in the frame the picture with its rows would fill. Without the
size of the picture with its rows the content is framed as it is.

#### `ScreenBox` {#symbol-screenbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L72)

##### `ScreenBox` — Summary
A box on screen, as `getBoundingClientRect` gives it.

#### `heldIndex` {#symbol-heldindex}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L84)

##### `heldIndex` — Summary
The element held still while the picture changes between its two layouts: the one under the pointer when the pointer
is over one, else the one whose centre is nearest the frame's centre (the first of equals), else none. A box with no
size is not on screen and is never held.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
- [`ladder-steps.ZoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-type)
<!-- LIVE-DOC:END Dependencies -->
