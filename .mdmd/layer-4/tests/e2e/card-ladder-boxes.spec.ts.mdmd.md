# tests/e2e/card-ladder-boxes.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/card-ladder-boxes.spec.ts
- Generated At: 2026-11-08T07:45:51.302Z

## Authored
### Purpose

The card ladder's box audit as a browser regression: at every Zoom Out press from reading scale to the farthest zoom, on this repository's still picture, on `rosetta-manifest.json` pinned whole and on an estate subject with a pinned symbol, no drawn part of a 2D Local Map card lies outside its card, no part a row holds lies above or below its row, no two dots overlap, no dot lies over a name, no directory label draws outside its membrane or over a card, every card's and row's box stands where the layout put it, and names keep one size: symbol names their reading size through the far band, file names their reading size from the middle band out, a directory's name its reading size through the middle band and never smaller than the map's own scale.

### Notes

Written in the far bands' round (2026-11-06) from the root's instrument of the [far-zoom review](../../../../AI-Agent-Workspace/Screenshots/2026-11-06/far-zoom-review/README.md), `box-audit.cjs`, which the review kept out of the suite until the owner's report ([Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3): "elements overlapping/clipping through at extreme zooms") settled what the far bands should hold. It measures against half a pixel on screen, where the instrument had counted only overflows past 1.5 px; on the bundle of `a5a7047e`, before the round, both cases fail, the still picture at the first press out (Pin and More 1.4 px above their rows, Internals' dots 0.7 px) and, before the highlight's margin became a designed exception in the root's review, the estate subject at reading scale (its pinned highlight 2.9 px above its row, in the gap). A row is read as a band across its card, as the instrument read it: across, the card's border bounds a row's parts. Two parts are designed to stand past their box: the hub, past its card's edge, whose size and overhang in the map's own units are compared across presses instead; and a pinned row's highlight, above its row by its wrapper's margin, never into the row above. Boxes are read from the layout's offsets, which no transform enters; drawn parts from their boxes on screen, a pinned row's highlight from its wrapper's layer, a label's held caption from its aria-hidden child's box (the label's own generated content until the root's fourth review), the file's held name by its line height at its own scale. The reading sizes are the map's own units times the reading scale the arrival framed, which is calibrated and is 1.45 for the estate subject. The overview band's silence is checked by its symbol names: none on the still picture, and only the pinned row's on the estate subject.

Since the root's review of the first milestone and the second milestone (2026-11-06) the spec also holds: that a picture drawn at any zoom (a pin made one press out, in the middle band, in the far band with the continuing search off and on, in the overview band and at the farthest zoom, each by the control that state draws) lays out every card, row and pin, read from the layout's offsets, as the same pin made at reading scale; that walking back in from the farthest zoom shows at every press the band, the step and the readings of the walk out; that at the overview band no silent row draws a dot; and that the walk ends at the farthest zoom, the only press where Zoom Out is disabled, at the last step's scale or, farther, with the whole picture in the frame. The far band's last held step is the sixth.

After the root's third review of the round (2026-11-06), from the owner's picture of `rosetta-manifest.json` pinned whole, that file pinned whole is a third subject: at every press every pinned row's highlight holds its row's whole head, the name and the buttons drawn, with a map pixel of air on every side, so that no button crosses its border; and at the overview band its rows go silent, a whole-file pin being a pin of the file, which its card's highlight shows. On every subject the audit also measures each drawn line of every file's name in the name's own font: the lines drawn are the attribute the card reading chose for the band and step, as many lines tall; no line runs past its room or under the node's buttons (the owner's "main.r / s" beside the node's More had broken a word there).

Since 2026-11-08 the audit holds the header round's six principles ([November 7 record, Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-07.1.record.md#turn-3) and [Turn 4](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-07.1.record.md#turn-4--november-8)) at every press on its three subjects: the name's first line is never empty; each line but the last ends at a seam of the name, by the audit's own oracle (`seamSegments` in the spec: after a hyphen, after a dot unless a short extension follows it, before a short extension's dot, and before a capital that follows a small letter; computed outside the page and handed to it, and independent of the code under test, `heldSegments`, since a review of 2026-11-08 found the audit agreeing with the segmentation it checks) unless its segment is wider than a line, and is filled, the next segment not fitting it; a cut ends the room's last line only; no line runs past its room or under the controls; and the node's drawn controls stand at the header's right edge, never above the name's first line, never with a line of the name below them, never further than the line after the name's last, and beside the last line wherever the name is cut. On 2026-11-07 it had held the one line of that day (every line before the name's empty, the name whole or its start cut with an ellipsis), and before that the four rules of several lines. On the bundle of the one-line milestone the new checks fail on all three subjects and on the walk back in: the controls standing above the name's first line (1,268 readings over the walks), not at the header's right edge (1,101), lines not filled (343, the one-line cut beside the corner's More), and first lines left empty (261, the name standing below More); the checks of a break inside a segment, of a cut before the last line, of a line below the controls and of the reading band's controls over the name have no case there, since that bundle drew one line, and the unit tests of `held-lines.ts` hold the same rules over a grid of rooms. Since the header round the per-press assertion is soft, so that a failing walk reports every press it breaks.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`ladder-steps.LAST_STEP`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.STEP_RATIO`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
