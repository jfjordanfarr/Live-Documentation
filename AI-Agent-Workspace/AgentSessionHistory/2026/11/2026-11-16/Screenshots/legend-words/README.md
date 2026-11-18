# The legend in the fewest words, 2026-11-16

Historical evidence for the round that made every row of the Explorer's legend a sample and at most two words ([the owner's Turn 10](../../../2026-11-15/2026-11-15.1.record.md#turn-10): "I still strongly strongly strongly continue to urge to minimize visibile words that come from _us_"). What a row said at length is now its tooltip and accessible description; the 2D key's four rows for the two roles are one drawing; the kinds are one row; the 3D key's Faded row is gone. No colour changed. The design as it stands is in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md).

Every sheet is a composition made for looking: the legend panel of two builds side by side at twice the device pixels, with the page it describes beside them. The words in a sheet's heading and captions are the sheet's, not the product's. **Before** is the build of `d54755f1`; **after** is the round's. The pages are 1440 by 900 windows; each legend panel is cropped whole from the same page in a taller window, since the longest key before the round did not fit the sidebar of a 900 px window. This machine draws its fallback face, not the owner's Segoe UI; every row is one line, so only widths would differ.

## The sheets

- `2d-reading.png`: the 2D key at the reading look, on this repository's `scripts` directory, whose closed directories are folders of cells coloured by kind. Three columns: before (five rows), after with the kinds' row (three rows), and after with the template's one line for that row left out (two rows), where a cell's hover is the colours' only key. The owner's choice between the last two is open.
- `2d-overview.png`: the same place seven presses of Zoom Out away, the overview look, where the wires' width row is drawn. The same three columns: six rows, four, three.
- `3d-ordinary.png`: the 3D key for a file of this repository and its hops, the pointer resting off the map: eight rows before, three of them wrapped, and seven after. The subject is `packages/explorer/src/client/pathfind.ts`, a file the round did not touch, so that both builds draw the same neighbourhood.
- `3d-longest.png`: the 3D key at its longest, a path through this repository with tests and both kinds of document shown. Before, thirteen rows, four of them wrapped onto a second line, and the sidebar's content stood 972 px tall in a 900 px window, so the last rows were reached by scrolling. After, ten rows, none wrapped (the three kinds take two lines), and the sidebar holds them.
- `3d-estate-path.png`: the estate sample's path of four files, a small picture with the path, the frontier, rings, wrapped groups and shells: nine rows before, eight after.
- `3d-structure.png`: the structure layout, the one place the Directory kind and the Contains row are drawn.
- `tooltips.png`: each row of the new keys, as the page drew it, beside its sentence. A headless browser paints no native tooltip, so the sentence is read from the row's `title` attribute on the page and set beside the row; it is not a picture of the tooltip itself. The size row has two sentences, the second said while a folder is drawn.

## How they were made

A scratch script opened each state on both builds served side by side, pressed nothing but Zoom Out, the two document checkboxes and the Structure button, moved the pointer off the map, and took the legend panel and the page; a second composed the sheets. The column without the kinds' row is the round's own build with that one line of the page removed as it was served. The 3D pictures of the two builds are separate visits: the simulation does not stand identically twice, so the spheres differ between the columns' pages while the rows compared are the same state's.
