# The far and overview bands of the 2D card ladder, held parts bounded by their boxes

_Status: implementation evidence for the root's review and the owner's eye, not a verdict. A builder built the far and overview bands in two milestones, from the root's briefs after the owner's report in [the November 6 record, Turn 1](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-1) and go-ahead in [Turn 3](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-3), with the fixes the root's four reviews of November 6 and 7 asked for, on commit `a5a7047e`, uncommitted in its worktree. The pictures were taken by the review's [`box-audit.cjs`](../../../Probes/2026-11-06/far-zoom-review/README.md) and a pinned-pictures probe on that worktree's final bundle, served on port 8911, in a private headless Chromium at 1440 × 960 with a fresh profile, so every setting is a new visitor's default; the camera moves by the Zoom Out button, one step a press, from the arrival's reading scale. The "before" numbers are the same scripts on the bundle of `a5a7047e` itself, whose Live Docs held 44 files in the still picture against 46 now (this round's specs and modules are files too)._

## What was built

One principle, the root's: inside a box that never changes, a held thing is bounded by the room of the box it belongs to; where its room runs out it follows the map or leaves the picture; it never overflows its box, never lies over another part, and text is never drawn smaller than the map's own scale to make room for something else. The current design is in [the Explorer design's ladder section](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#native-portrait-reading); in short:

- Name Growth defaults to 1: every symbol name on screen one size, every file name another. The lever stays, for symbol names.
- A row's head (its name, its Pin and More, its dots' line) is held about the row's top edge and stops at the row's bottom. A dot grows from its edge beside the name and stops at its card's border, centred on its name's line.
- A pinned row's highlight keeps its designed place, from its wrapper's top, a margin above its row, and holds the row's whole head, down past the taller of its name and its buttons as drawn, with air on every side.
- The first press out, still in the reading band, holds a symbol's name at 12 px, cut where the room beside its held buttons runs out, unless it wraps at the reading width.
- From the middle band out the file's name is held at its reading size, the same on every card, in lines chosen for each band and step: a segment between its seams breaks only when it is wider than a full line, a name that fits whole below the node's buttons goes there, and where the room runs out the last line ends with an ellipsis.
- A directory label's caption is held on one line while its label's box has the room, cut at its start, and follows the map past that.
- The bands: middle to the fourth press, far the fifth and sixth, overview from the seventh, the edges placed so that a press out and the press back show the same band.
- The overview band is the file's own: a symbol row goes silent and draws nothing, dots included, unless its symbol is pinned by name; a whole-file pin silences its rows like any card's, and the card's own highlight says it is pinned. Each pair of files joined below is joined by one gathered wire each way, hub to hub, as wide as its count of references; a symbol pinned by name keeps its own wires, drawn above. The legend says "Width: references" there.
- Zooming out stops at the last step, or at four fifths of the scale that frames the whole map where that is farther; the Zoom buttons are disabled at the farthest and the closest zoom.
- A picture drawn at any zoom lays out every card, row and pin as the same picture drawn at reading scale.

## What exceeds which boundary, before and after

`box-audit.cjs` on `tests/e2e/still-picture.ts`, in screen pixels; the script counts a part as outside when it overhangs by more than 1.5 px. The [box audit spec](../../../../tests/e2e/card-ladder-boxes.spec.ts) holds every part to half a pixel at every press, on the still picture, on `rosetta-manifest.json` pinned whole and on the estate's payment service with a pinned symbol: on the bundle before, it fails on the still picture at the first press out (Pin and More 1.4 px above their rows, Internals' dots 0.7 px); on the final bundle all three pass at every press. The hubs' designed overhang is the one part past a card's edge, constant in the map's own units; since the second milestone a hub is drawn only where a wire of the band shown ends on it, so on the still picture none is drawn before the overview band.

Before (`a5a7047e`, 44 files):

| Press | Scale | Band / step | Dots past the card's edge | Farthest, px | Dots above or below their row | Farthest, px | Row buttons above or below their row | Farthest, px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | reading / 0 | 0 of 195 | | 0 of 195 | | 0 of 232 | |
| 1 | 0.833 | reading / 1 | 0 of 195 | | 0 of 195 | | 0 of 232 | |
| 2 | 0.694 | middle / 2 | 0 of 195 | | 0 of 195 | | 158 of 232 | 2.6 |
| 3 | 0.579 | middle / 3 | 0 of 195 | | 158 of 195 | 2.1 | 158 of 232 | 3.6 |
| 4 | 0.482 | middle / 4 | 0 of 195 | | 158 of 195 | 2.9 | 158 of 232 | 4.4 |
| 5 | 0.402 | far / 5 | 158 of 195 | 2.7 | 158 of 195 | 3.6 | 79 of 116 | 5.1 |
| 7 | 0.279 | far / 7 | 158 of 195 | 6.2 | 158 of 195 | 4.6 | 79 of 116 | 6.1 |
| 8 | 0.233 | overview / 8 | 158 of 195 | 7.5 | 158 of 195 | 5 | 79 of 116 | 5.7 |
| 10 | 0.162 | overview / 10 | 158 of 195 | 6.1 | 158 of 195 | 4 | 79 of 116 | 4 |
| 12 | 0.112 | overview / 10 | 158 of 195 | 4.3 | 158 of 195 | 2.7 | 79 of 116 | 2.7 |
| 17 | 0.05 | overview / 10 | 158 of 195 | 1.9 | 0 of 195 | | 0 of 116 | |

After (the final bundle, 46 files):

| Press | Scale | Band / step | Dots past the card's edge | Dots above or below their row | Row buttons above or below their row | Held file names past their card | Labels outside their membrane or over a card |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | reading / 0 | 0 of 197 | 0 of 197 | 0 of 236 | none drawn | 0 of 7 |
| 1 | 0.833 | reading / 1 | 0 of 197 | 0 of 197 | 0 of 236 | none drawn | 0 of 7 |
| 2 | 0.694 | middle / 2 | 0 of 197 | 0 of 197 | 0 of 236 | 0 of 46 | 0 of 7 |
| 4 | 0.482 | middle / 4 | 0 of 197 | 0 of 197 | 0 of 236 | 0 of 46 | 0 of 7 |
| 5 | 0.402 | far / 5 | 0 of 197 | 0 of 197 | 0 of 118 | 0 of 46 | 0 of 7 |
| 6 | 0.335 | far / 6 | 0 of 197 | 0 of 197 | 0 of 118 | 0 of 46 | 0 of 7 |
| 7 | 0.279 | overview / 7 | none drawn | none drawn | none drawn | 0 of 46 | 0 of 7 |
| 10 | 0.162 | overview / 10 | none drawn | none drawn | none drawn | 0 of 46 | 0 of 7 |
| 15 | 0.075 | overview / 10 | none drawn | none drawn | none drawn | 0 of 46 | 0 of 7 |

Every press reads as these rows do, 0 to 15 on the still picture (the farthest zoom now four fifths of the scale that frames the whole map, 0.075, where the bundle before went on to 0.05) and 0 to 10 on the payment service, whose map is small enough to stop at the last step; at the overview band the hubs drawn, 48 on the still picture, stand inside their designed overhang; no card's ink lies over a neighbour's box and the page raised no error at any press.

## What a far zoom-out holds, before and after

`type-sizes.cjs`: the height on screen of each kind of name as least / median / greatest over everything drawn. The script reads a file's name and a directory's caption where they are drawn from the middle band out (the held element and the label's held child); on the bundle before it reads what it read before. The least symbol-name figure is Internals' label, which its short row bounds. The band of each press is the final bundle's; the bundle before had its far band to the seventh press and its overview from the eighth.

| Press | Band / step | Symbol names, before | after | File names, before | after | The subject's file name, before | after | Directory names, before | after | Rows of the subject cut, before | after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | reading / 0 | 12 / 12 / 12 | 12 / 12 / 12 | 15 / 15 / 15 | 15 / 15 / 15 | 15 | 15 | 14 | 14 | 0 of 59 | 0 of 59 |
| 1 | reading / 1 | 10 / 10 / 10 | 11 / 12 / 12 | 12.5 / 12.5 / 12.5 | 12.5 / 12.5 / 12.5 | 12.5 | 12.5 | 11.7 | 11.7 | 0 of 59 | 1 of 59 |
| 2 | middle / 2 | 8.4 / 16.8 / 18 | 9.1 / 12 / 12 | 7.7 / 14.6 / 22.5 | 15 / 15 / 15 | 15 | 15 | 9.7 | 14 | 2 of 59 | 2 of 59 |
| 4 | middle / 4 | 5.8 / 12 / 18 | 6.3 / 12 / 12 | 3.6 / 8.2 / 22.5 | 15 / 15 / 15 | 7 | 15 | 6.8 | 14 | 35 of 59 | 35 of 59 |
| 5 | far / 5 | 4.9 / 12 / 18 | 5.3 / 12 / 12 | 4.4 / 8.4 / 22.5 | 15 / 15 / 15 | 8.6 | 15 | 5.6 | 12.1 | 25 of 59 | 25 of 59 |
| 6 | far / 6 | 4.1 / 12 / 18 | 4.4 / 12 / 12 | 3.4 / 6.6 / 22.5 | 15 / 15 / 15 | 6.6 | 15 | 4.7 | 10 | 46 of 59 | 46 of 59 |
| 7 | overview / 7 | 3.4 / 12 / 15.4 | none drawn | 2.7 / 5.4 / 20.3 | 15 / 15 / 15 | 5.2 | 15 | 3.9 | 8.4 | 50 of 59 | none drawn |
| 8 | overview / 8 | 2.8 / 12 / 12.9 | none drawn | 2.2 / 4.5 / 17 | 15 / 15 / 15 | 4.3 | 15 | 3.3 | 7 | 54 of 59 | none drawn |
| 10 | overview / 10 | 2 / 8.9 / 8.9 | none drawn | 1.5 / 3.1 / 11.8 | 15 / 15 / 15 | 3 | 15 | 2.3 | 4.8 | 55 of 59 | none drawn |
| 12 | overview / 10 | 1.4 / 6.2 / 6.2 | none drawn | 1.1 / 2.2 / 8.2 | 10.4 / 10.4 / 10.4 | 2.1 | 10.4 | 1.6 | 3.4 | 55 of 59 | none drawn |

A directory's name holds 14 px through the middle band; its label's own box, its line and the 14 px of padding beneath it, holds about 2.14 times the name's height, so from the far band's first step it follows the map at that ceiling. Beyond the last step (press 11 on) everything shrinks with the map, as before.

## Pictures

| Picture | What it shows |
| --- | --- |
| [still-picture-00-reading.png](still-picture-00-reading.png) | As framed on arrival. |
| [still-picture-02-middle.png](still-picture-02-middle.png) | The middle band's first step: every symbol name 12 px with its Pin and More held beside it, every file name 15 px, the descriptions and the header's lines gone. |
| [still-picture-05-far.png](still-picture-05-far.png) | The far band's first step: file names in the header's room at their seams, the dots inside their cards and on their names' lines, directory captions cut at their start. |
| [still-picture-06-far-last-step.png](still-picture-06-far-last-step.png) | The far band's last step, the sixth since the root's review: "card-ladder-" / "boxes.spec.ts", "force-graph-" / "directories.sp…", the last line holding what fits with an ellipsis; every row still drawn with its More. |
| [still-picture-07-overview.png](still-picture-07-overview.png) | The overview band's first step: rows silent, the gathered wires between the files' hubs, "still-" / "picture.ts" below the subject's More rather than broken beside it. |
| [still-picture-10-last-step.png](still-picture-10-last-step.png) | The last step: 15 px names on cards 46 px wide on screen; a segment wider than such a line breaks inside ("still-pi" / "cture.t" / "s"), and the test cards' one line is cut to a few letters. |
| [still-picture-15-farthest.png](still-picture-15-farthest.png) | The farthest zoom, where the whole map stands in the frame: the last step's drawing shrunk with the map. |
| [still-picture-pinned-07-overview.png](still-picture-pinned-07-overview.png) | The subject's first symbol pinned, at the overview band: its row stays drawn with its own wires above the ten gathered ones. |
| [payment-service-05-far.png](payment-service-05-far.png) | The estate's payment service at the far band's first step (its reading scale is 1.45, so it is larger on screen throughout). |
| [payment-service-07-overview.png](payment-service-07-overview.png) | The same at the overview band: the gathered wires hub to hub, "PostPayment" / "Row.cs" at its seam. |
| [payment-service-pinned-07-overview.png](payment-service-pinned-07-overview.png) | `PaymentService` pinned, at the overview band: its row drawn with its own wire, 22 gathered wires, and the subject's name cut to its one line above the pinned row ("PaymentS…"). |
| [rosetta-pinned-whole-00-reading.png](rosetta-pinned-whole-00-reading.png) | `rosetta-manifest.json` pinned whole, the owner's subject, as framed on arrival. |
| [rosetta-pinned-whole-03-middle.png](rosetta-pinned-whole-03-middle.png) | The same at the middle band, where the owner saw Pin and More on the highlights' top border: every row's highlight holds its name and its buttons with air. |
| [rosetta-pinned-whole-06-far-last-step.png](rosetta-pinned-whole-06-far-last-step.png) | The far band's last step: "main.rs", "Main.cs", "main.cpp" whole beside More, "compiler-" / "edges.json" at its seam. |
| [rosetta-pinned-whole-09-overview.png](rosetta-pinned-whole-09-overview.png) | Press 9, the press of the root's picture of "main.r" / "s": every name whole or cut at its end ("compile…"), the subject's rows silent, its card highlighted, and its name whole on three lines where it had been cut to "rose…". |

## The root's first review: a render below reading scale must lay out what a render at reading scale lays out

The root found that a pin made five presses out drew the still picture's subject 202 px wide against 284 px pinned at reading scale, four neighbours 82 px nearer; the bundle of `a5a7047e` did the same. Three causes, found in turn:

1. **A held name's cut entered the card's width.** The render measures each card's width from its content, and a held name's `max-width`, read from the render before, limited it. The cut is now `calc(… * 1px + 0%)`: CSS Sizing 3, section 5.2.1 (cyclic percentages), treats a max size containing a percentage as `none` when the box's intrinsic size contribution is computed, and laid out the 0% resolves against the name's button, so the cut is unchanged.
2. **The pins were read from the dots as drawn.** One press out, eight cards stood two or three pixels from where the same pin made at reading scale put them (the root's probe had seen five a pixel off). The placement's repair in the first handback read the layout's offsets up to the card's wrapper, but the wrapper is not among an anchor's offset parents, so that path never ran and every pin was still read from the dot's drawn box, which the ladder shifts and scales at a held step: 112.5 at reading scale, 114.2 one press out. The placement now reads a dot as the layout search does, its drawn box with the ladder's shift and scale taken back, and a slot card's description slot is hidden rather than taken out below reading scale, so that a row's children are the same in every band.
3. **Single precision.** With the shift taken back, one pin still differed: an Internals dot laid out at 4292.5 read back at 4292.4984 one press out, the single-precision noise of a transformed page's boxes far down a tall picture, which tipped its half-pixel rounding and moved seven cards a pixel. The placement's pins and the search's rows are now put back on the layout's grid of 1/64 px, where every box the layout gives stands; at reading scale, untransformed, the readings are already on it.

The spec the root asked for is the box audit's "a picture drawn at any zoom": the still picture pinned at reading scale, and pinned at each state by the control that state draws (a row's Pin one press out and in the middle band, a row's More in the far band with the continuing search off and on, the node's More in the overview band and at the farthest zoom), every card's place and size, every row's place and height and every anchor's centre compared in the map's own units. On the pre-fix bundle (the first milestone's handback) it fails at the first press out (`types.ts` at 26,356 against 26,359); on the bundle with causes 1 and 2 fixed it failed there by one pixel (2349 against 2348); on the final bundle it passes in all six states. A probe that pins the subject's first row at reading scale and one press out finds 0 of 46 cards different, where it had found 8. The spec pins the subject's first row, which the arrival frames at its title, rather than `readPicture`, which the arrival had left outside the frame once the Live Docs gained a card.

**The neighbour seen at press 8 with the search off** was not a fault of the round: the specs this round wrote import `still-picture.ts`, so its card gained neighbours as the Live Docs grew (44, then 45, then 46 files). The base commit's code built on the same Live Docs, with the search off, lays out identically: 0 of 46 cards differ.

**The audit's reading of the camera's scale** compared two readings at 1e-6; the scale comes from the computed transform, which the browser writes to six significant digits (0.161506 read against 0.16150574 on `rosetta-manifest.json`), so the box audit and the overview spec now compare scales at 1e-5, the readings' own precision.

## The second milestone: the overview band's wires and the farthest zoom

- **Gathered wires.** At the overview band every pair of files joined by a wire of the closer bands is joined by one gathered wire each way, from the offering card's hub at its right edge to the using card's at its left, 2.2 to 8.8 px wide by its count, its accessible name its two files and its count; the bundles' shared runs are not drawn there. The still picture draws 121 wires at the far band and 12 at the overview with its first symbol pinned (10 gathered, 2 the pinned symbol's own); the payment service 45 and 28 (22 gathered, 1 own); `rosetta-manifest.json` 25 and 25, each of its files joined to it once.
- **Hubs.** A card's node-level hub stands in the existing hub's place, the using side added where a card had none; a hub is drawn only where a wire of the band shown ends on it.
- **A silent row draws nothing**, dots included; a wire ends on a dot only on a row pinned by name, otherwise on its file's hub; a pinned symbol's own wires are drawn above the gathered ones, which still count them.
- **The farthest zoom** (`zoom-limits.ts`, with Vitest): the last step's scale, or four fifths of the scale that frames the whole map where that is farther, by wheel, pinch and button alike; the Zoom buttons are disabled at the limits. The still picture stops at press 15 (0.075), with the whole map in the frame; the payment service at press 10, the last step.
- **The band edges** stand at each band's last press's ratio over the square root of the band margin times the step ratio (about 1.175), derived in code, so that a press out and a press back show the same band; the overview begins at the seventh press. Vitest walks the presses out and back; the box audit walks back in from the last step and compares every press.

## The root's third review: the owner's `rosetta-manifest.json` pinned whole

- **A third subject for the box audit**, pinned whole: at every press every pinned row's highlight holds its row's whole head, the name and the buttons drawn, with a map pixel of air on every side, so that no button crosses its border; the highlight follows the taller of the name and the buttons.
- **A whole-file pin is a pin of the file.** At the overview band its rows go silent like any card's and the card's own highlight says it is pinned; a row stays drawn there only for a symbol pinned by name. The subject's name, which had been cut to "rose…" above every pinned row, now has the card's room ([press 9](rosetta-pinned-whole-09-overview.png)).
- **File names never break inside a word that fits a line.** The browser's own wrapping, at zero-width spaces beside a float standing for the buttons, took its emergency break before moving a line past the float ("main.r" / "s", "compil" / "er-…" at press 9). The lines are now chosen at render by `held-lines.ts` for each band and step from the name's seams, measured in its font, and drawn as written, one attribute a band and step, which also ends the dependence on a computed `-webkit-line-clamp`. Vitest holds the four rules over named cases and a grid of names and rooms; the box audit measures every drawn line of every file's name at every press on all three subjects: the content drawn is the chosen lines, no line but a cut last one ends inside a segment that would fit a full line, none runs past its room or under the node's buttons.
- **The Internals row** is held, waiting for the owner's choice.

## The root's fourth review: the full gate on the main tree

The full gate on the main tree (this round over the two 3D shell rounds) failed 16 browser cases on November 7; 13 were this round's.

- **The layout lab and the headless command (12 cases).** Every card's `inbound:*` pin had drifted, the lab giving 127 where the page gave 92 on a 184 px test card: the lab's Internals dot against the card's middle. The page had not moved: its registry still resolves `inbound:*` to Internals' dot, and the placement's cost was the lab's. The second milestone's node-level hub on a card's using side, which the registry keys only as `inbound:#hub`, carries the class `hub`, and the lab's capture reads every hub as its side's `*` pin. That hub now carries `overview-hub` as well, and the capture leaves it out; the lab's baselines are unchanged. (The hypothesis that `laidOutBox` shifted hubs did not hold: it takes back only a dot's transform.)
- **The spatial legend (1 case).** The 2D legend's rows include the overview band's "Width: references", not displayed at the arrival's zoom; the case now reads the rows shown, the five as before, and that the gathered key is hidden there.
- **Two attributed to the round for checking.** The history scrubber's requested overview runs in the 3D view, which the 2D zoom floor does not reach; it fails the same way on the code of `a5a7047e` with the same history (the root's correction of this sentence, which first said the case passed: the builder's own handback says it does not). A diagnosing agent's build of `a5a7047e` then showed the day's renderer at about 3.7 frames a second against about 9 the day before, every timed case 1.4 to 2.4 times slower, so the case's ten-second poll is the likelier cause; its run on that build with the history was not made, the history taking hours to compute. The retained exploration of `local-map-branches.spec.ts` times out in the test's own reading of its 385 wires on 91 cards, as long on the code of `a5a7047e` on the same Live Docs: the picture has grown since the case's budget was set (more than a hundred wires, 24 to 26 seconds, on October 19). See the handback for the timings.
- **A second reader's findings, folded in.** The generated content no longer carries an alternative text (`content: … / ""`), which browsers before Firefox 128 and Safari 17.4 reject as a whole declaration: the file's held name is aria-hidden already, and a directory's caption is now drawn by an aria-hidden child of its label. A hub is marked as ending a wire only once both of the wire's ends are measured. The overview band counts its backward wires again, a backward gathered wire counting the references it carries, so the 3D button's word about backward wires in 2D stays there. `laidOutBox` calls `layoutTopOf` rather than repeating it. The layout grid's comment says whose unit 1/64 px is, that the reading scale is a transformed page too, and that the noise grows down the picture. The design's paragraph no longer says the page's find meets a file's name from the middle band out: there the layout's copy is hidden, and generated content is not searched.

## Also found: the still-picture deck's retained chain

`still-picture.spec.ts` marked its "Local Map, retained" case on the repository's chain scope as expected to fail since `e104f9fa` (three lane samples of two wires counted as foreign where a corridor lay inside a directory's membrane, on fixed-slot cards), to "announce the fix by passing". On the final bundle it passes, so the mark is removed: a mark kept on a passing case fails the suite. A probe that opens the retained chain as the case does finds it drawn at reading scale (1.45, so the ladder takes no part) with no foreign lane sample, on the final bundle and equally on the code of `a5a7047e` built on the same Live Docs: the picture changed as the Live Docs gained this round's files, and the rule that a membrane leaves a corridor it does not own was not repaired. The root may want to say so in direction.md.

## What the builder still does not like

- At the last steps a 15 px name on a card 46 px wide on screen has segments wider than its line, which break inside by the rules ("still-pi" / "cture.t" / "s"), and a test card's one line is cut to a few letters; the name holds its size at the cost of saying which file it is.
- At the far band's last step and the overview band a long file name is cut after its second line ("force-graph-" / "directories.sp…"), and a subject whose symbol is pinned by name has one line above that row ("PaymentS…").
- A directory's name follows the map from the far band, since its label's box holds only about twice its height: 8.4 px at the overview band's first step, 4.8 px at its last.
- The anchor dots stop at their card's border, about twice their reading size, so from the far band they shrink with the map: 10.9 px at press 5, 9 px at press 6.
- The held file name's room is computed twice, by the stylesheet, which scales and places the drawing, and by the line choice, which mirrors its formulas; the box audit fails if they drift, but the duplication remains.
