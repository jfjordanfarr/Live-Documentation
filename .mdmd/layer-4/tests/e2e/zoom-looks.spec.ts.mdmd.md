# tests/e2e/zoom-looks.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/zoom-looks.spec.ts
- Generated At: 2026-11-10T21:46:21.177Z

## Authored
### Purpose

Status: current; the browser regression of a trial, not of an adopted design. It holds Tuning's Zoom Looks, the 2D Local Map's choice between the card ladder's steps (the default) and three looks, on the estate's `PaymentService.cs` pinned whole: with three looks, every Zoom Out press from reading scale to the tenth and every press back shows the look the design gives it (reading through the second press, connections from the third to the sixth, overview from the seventh), the same both ways; inside a look every visible name keeps its text, its lines and its ellipsis and every held part its size in the map's own units; no card's box changes; past reading every row's head (its drawn name, dots and buttons) stays inside its card, off every other row's box and head, and no border or layer of its name box runs through it; in overview no line of a held file name ends inside a word that fits a line; nothing a slot card draws past reading is smaller than 8 px on screen at 1440×960; and the reader's open descriptions and pins are the same after the walk. A change of look animates where motion is welcome and runs no animation or transition at all under reduced motion; and at each of the four changes, with every animation held at its start, middle and end, nothing held is drawn larger on screen than it was before the change or is after it, and no drawing of a file's name lies outside its card or over a row still drawn. With the default the page still reports the ladder's band and step at every press, and the choice is made in Tuning, saved and carried by the page's link.

### Notes

Written with the trial (2026-11-10) from the root's design of it, [Turn 5 of the November 10 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-5), which tests the owner's hypothesis of [2026-11-08, Turn 2](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-2): "very very FEW breakpoints (2-3) for heavily quanitized different looks of the nodes", since "I am simply seeing too much unexpected change as I zoom". Everything is read from the page as drawn rather than from the constants that implement the looks: a held name's lines from its generated content, a symbol name's lines from its text's line boxes and its ellipsis from its text overflowing its box, held sizes from boxes on screen over the camera's scale. The press-by-look expectation is the design's, written out. A change of look fades what leaves over 160 ms, so each press is read once the picture is at rest and the Local Map's animations have ended. The spec was shown able to fail: with the trial made to draw each step's own lines inside a look (the step written as the ladder's and the trial's attribute withheld, a temporary change), the walk failed on every file name's lines and height in the connections look. Since the root's second review of the trial (the same day) the walk also audits the held looks' boxes, as `card-ladder-boxes.spec.ts` does for the ladder, after the Internals row's dashed border was seen running through its enlarged name; reads the overview's file-name lines against the audit's own seams (`seamSegments`, the oracle of `card-ladder-boxes.spec.ts`, independent of `heldSegments`), where a line may end inside a segment only if that segment is wider than a line; and a fourth test presses across both edges each way in two fresh contexts and reads the running animations at once, which must be some where motion is welcome and none under `prefers-reduced-motion: reduce` (it found the Internals box's colour fading on its old hover transition, now removed in the trial). Since the root's third review the fifth test samples the changes of look as described, after the first frame of a change on the way in was seen bulging past both its sizes. Both new checks were shown able to fail: with the Internals row's round-one border restored in the trial the walk failed at every connections press out and back on `PaymentService/App.config:__internals__: its name box's border runs through its symbol-label-text` (and its More), and with the start reckoned from the looks' scales alone the sampling failed on the way in, for example `connections → reading, sample 0: Contracts/IPaymentService.cs:IPaymentService symbol-label-text 26.6 px against 22.2 before and 12.1 after`. The 8 px floor covers the slot cards only, the trial's scope; directory captions stand outside it and are smaller at the overview look's farthest presses (the trial's evidence, `AI-Agent-Workspace/Screenshots/2026-11-10/zoom-looks/README.md`).

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
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
