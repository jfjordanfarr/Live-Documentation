# packages/explorer/src/client/views/localView/overview-files.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/overview-files.ts
- Generated At: 2026-11-16T01:26:25.413Z

## Authored
### Purpose
The pure rules of a trial for the owner's eye, files only at the 2D Local Map's farthest zoom look: when the overview draws files only (the choice made, the three looks drawn, the overview shown), which element a change between the two layouts holds still on screen (the one under the pointer, else the one nearest the frame's centre), and what Fit frames while the compact picture is shown (the picture with its rows, so that a second press changes nothing). The controller, the branch renderer, the card reading and the wires read the container's attribute named here.

### Notes
Written on 2026-11-13 after the owner, having opened three directories in Flow, wrote "I feel like the "Flow" look is much closer to what the full zoom-out in the 2D Local Map might reasonably be" ([November 13, Turn 8](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-8)). It stands behind Tuning → 2D Layout → Zoomed Out Fully, whose default keeps the cards' size, because the owner's own rule had been that cards do not resize as the map zooms out; the trial bends it at one look, by the move a fold of a description already makes, so that the owner can judge the far picture and the move into it by eye.

Files only is the default of Zoomed Out Fully since 2026-11-15, chosen by the owner's eye over cards that keep their size with their rows drawn as bars ([Turn 1 of that day's record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)), and the module's header no longer calls it a trial. Files only means files and what the person pinned by name (2026-11-15, the root's decision on the owner's standing word of October 1, 2026, "I'm not open to having the user open the shape of their software and believe it's all fine and dandy when it's not"): `wholeNameScale` finds the size a pinned row's name is held at there, brought down a tenth at a time until it stands whole, never below the connections look's.

`pinnedRowScales` (2026-11-15, [Turn 1 of that day's record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)): the pinned rows of one card take one size at the overview look, the tightest's, as a card's file name takes one scale; the root, of `renderBranches` at 2.3 beside `BranchStage` at 2.7 on one card: a difference of size that means nothing reads as a difference of kind. Across cards the sizes may differ, as file names' do.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OVERVIEW_FILES_ATTRIBUTE` {#symbol-overview_files_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L19)

##### `OVERVIEW_FILES_ATTRIBUTE` — Summary
The container's attribute that says the overview draws files only, read by the stylesheet and the wires.

#### `OVERVIEW_LINES_ATTRIBUTE` {#symbol-overview_lines_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L26)

##### `OVERVIEW_LINES_ATTRIBUTE` — Summary
The container's attribute that says, for the length of the move back in from files only, that the wires are still drawn
as the pairs' lines: a row the growing card still hides has no wire drawn to it, and the symbols' wires are drawn
when the move ends.

#### `COMPACT_AIR` {#symbol-compact_air}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L29)

##### `COMPACT_AIR` — Summary
The air left below a compact card's name, in lines of the name at its size, so that its last line is clear of the card's edge.

#### `filesNameScale` {#symbol-filesnamescale}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L37)

##### `filesNameScale` — Summary
The scale a compact card's name is held at with files only: the overview look's, unless the widest of the name's
segments (the pieces between its seams) would not fit the card's room across at it; then the largest at which every
segment fits, so that the name breaks only at its seams, as Flow's names do; never below the connections look's
scale, where a segment wider still breaks as it must. Rounded down to the thousandth that the stylesheet is written.

#### `wholeNameScale` {#symbol-wholenamescale}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L48)

##### `wholeNameScale` — Summary
The scale a name is held at where it comes down in size before it is cut (2026-11-15, a symbol pinned by name at the
overview look): the largest scale, from the overview look's down to the connections look's a tenth at a time, at which
`whole` says the name stands whole in its room; the connections look's where none does, and the name is cut there.

#### `pinnedRowScales` {#symbol-pinnedrowscales}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L60)

##### `pinnedRowScales` — Summary
One size for the rows of one card that the overview look draws, those pinned by name (2026-11-15): each takes the
scale of the tightest of them, the least, as a card's file name takes one scale, since a difference of size that
means nothing reads as a difference of kind. A row that is not pinned keeps its own, which no look draws there.
Across cards the sizes may differ, as file names' do.

#### `OverviewFilesTuning` {#symbol-overviewfilestuning}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L66)

##### `OverviewFilesTuning` — Summary
The tuning the choice reads: the three looks with fixed slots, and the choice itself.

#### `overviewFilesShown` {#symbol-overviewfilesshown}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L73)
- Parameters: `tuning`: [`OverviewFilesTuning`](#symbol-overviewfilestuning); `look`: [`ZoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-type)

##### `overviewFilesShown` — Summary
Whether the map draws files only: the choice made, the three looks drawn, and the overview the look shown.

#### `PictureSize` {#symbol-picturesize}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L78)

##### `PictureSize` — Summary
A picture's size in the map's own units, as the scene lays it out.

#### `rowsFrame` {#symbol-rowsframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L90)
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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L97)

##### `ScreenBox` — Summary
A box on screen, as `getBoundingClientRect` gives it.

#### `heldIndex` {#symbol-heldindex}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/overview-files.ts#L109)

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
