# The cells trial: what a drawn directory hides, as cells in place of "+2 files"

Historical record of a design probe, November 17, 2026, by the root of [the November 16 session](../../../Summarized/2026-11-16.1.SUMMARIZED.md). The trial itself is in the product (commit `7062d323`) behind Tuning → 2D Layout → Hidden Files, and its current behaviour is in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md). Nothing here is decided: the owner has not yet looked.

## What was asked

The owner, on a 2D picture whose directories said "+2 directories", "+11 files" and "+2 files" ([Turn 6](../../../2026-11-16/2026-11-16.1.record.md#turn-6)): "now that we have cells in directories... Any reason we still need the \"+2 files\", \"+11 files\", etc? Could those be represented as cute little cells that could be clicked on to expand them into fuller-sized nodes? ... I just notice that once we're looking at wiring, we don't really see the delightful cells anymore."

## What was built, in three rounds by one builder

The root's brief and its reviews are in the record: [the brief's design](../../../2026-11-16/2026-11-16.1.record.md#the-cells-trial-begun), [the first handback](../../../2026-11-16/2026-11-16.1.record.md#the-cells-trials-first-handback-and-roots-review), [the second](../../../2026-11-16/2026-11-16.1.record.md#the-cells-trials-second-handback-roots-look-and-its-last-round), [the last](../../../2026-11-16/2026-11-16.1.record.md#the-cells-trials-last-handback-roots-look-and-the-trial-brought-to-main).

1. **Cells in the handle's line, where the count's words stood.** A closed directory's own cell for each file not drawn and its own small skin for each directory not drawn; a press on a cell pins its file, a press on a skin opens its directory; one keyboard stop a directory, the arrow keys among its marks; drawn at half a closed cell's strength until the pointer or focus is on one. No card or directory moves between Count and Cells. **The fault of this round came from the brief's own order of giving way:** the marks took the whole of the parent's path before the path took any ([the picture](overview-first-round-path-lost.png): "live-docs" and a long row of marks where Count draws "packages/engine/src/live-docs +30 files, 2 directories").
2. **The marks stand in the count's room.** Against the path they claim only the width the count's words would take; beyond that, only what the line leaves free ([Count](overview-count.png) beside [Cells](overview-cells-beside-name.png) at the overview look). A cell's press keeps still what a press on its directory's handle keeps still, so that the handle and the new card stand in view. The cost, by the builder's numbers at reading size: three marks and a veiled one of 23 in `history`, three and one of 75 in `localView`.
3. **A third value, Cells under name.** At the reading look the marks are drawn under the handle's line as a closed directory's own field, in 39 units the strip already keeps free; every handle of the `pathfind.ts` picture then shows all it hides. From the connections look out it is the line's marks. One camera, three values: [Count](reading-count.png), [Cells beside name](reading-cells-beside-name.png), [Cells under name](reading-cells-under-name.png). The three are the root's, taken at one camera on the trial as committed (`7062d323`), after the root moved the field 3 units down from the line's foot, where a cell had touched a letter's descender in the builder's picture. The key gains its row for a cell's kinds only while cells are drawn.

## Numbers, as the builder reported them

- Thirty-nine rectangles (every card, closed box, directory band and handle) equal between Count and each cells value at three looks on this repository's `pathfind.ts` picture, and on the estate.
- The path's rendered width with Cells no narrower than with Count wherever Count draws its words; the case that holds this fails on the first round's rule ("Expected: >= 94.390625, Received: 0.640625"). The estate's copy of that case cannot fail on its picture, whose one such handle hides a single file.
- A cell's pressable area on the screen at reading size on this repository: 11 by 15 px beside the name, 11 by 9.5 px under it. The handle beside it, which opens the whole directory, keeps its 24 px.

## Seen by the root and left for the owner's eye

- At the connections look, where Count has no room for its words, the marks beside the name take what was left of the path ("…ocs/history" becomes "history" and two cells).
- Two cells in a field stand on a diagonal and a loose cell stands higher than a skin beside it: the closed field's own packing, the same in a closed box.
- Under today's colours the cells are blue and green beside blue and green pins; under the proposed palette they are grey and violet.

## Found beside the trial, not mended

At the connections look, after a second file is pinned, a card's "Internals" row stands over its "+8 symbols" line (60.6 by 2.9 px on `history/sequence.ts`), at rest and with Count: open `/?view=local&node=packages/engine/src/live-docs/pathfind.ts`, pin `packages/engine/src/live-docs/history/codec.ts`, go to the connections look. Reported by the builder; not run down. The builder's picture of it went with its worktree; the address above draws it again.
