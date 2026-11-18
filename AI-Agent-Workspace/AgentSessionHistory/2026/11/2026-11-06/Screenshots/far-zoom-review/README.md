# The far zoom-out of the 2D Local Map, and the 3D shells, as the root found them on November 6

_Status: a review, not a change. The owner opened [the November 6 session](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-1) asking the root to build, explore and say what it does and does not like about the November 5–6 work, and reported that "the 2D local map still had things exceeding boundaries at very distant zoom-outs (but improvement was noticeable!)". These are the pictures and measurements behind the root's answer. Nothing in the product changed. Two of the pictures are sketches made by injecting styles into the served page; they are marked as sketches wherever they appear._

Taken on the bundle built from `9c7c0ac5` (the product as committed at `51eec0c3`), served on port 8900, in a private headless Chromium at 1440 × 960 with a fresh profile, so every setting is the default a new visitor gets: fixed-slot cards, Name Growth 1.5, the layout's background search on. The subject is `tests/e2e/still-picture.ts`, the owner's subject of [November 5, Turn 11](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-11): a card of 59 symbol rows among 43 neighbours. The camera moves by the Zoom Out button, one step a press. The scripts are kept under [the probe folder](../../../Probes/2026-11-06/far-zoom-review/README.md).

## What exceeds which boundary

Measured at every press by `box-audit.cjs`, in screen pixels: each drawn part of a card against the card's own box, and each part of a symbol row against the row's.

| Press | Scale | Band / step | Dots past the card's edge | Farthest, px | Dots above their row | Row buttons above their row | Farthest, px |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | reading / 0 | 0 of 195 | | 0 of 195 | 0 of 232 | |
| 1 | 0.833 | reading / 1 | 0 of 195 | | 0 of 195 | 0 of 232 | |
| 2 | 0.694 | middle / 2 | 0 of 195 | | 0 of 195 | 158 of 232 | 2.6 |
| 3 | 0.579 | middle / 3 | 0 of 195 | | 158 of 195 | 158 of 232 | 3.6 |
| 4 | 0.482 | middle / 4 | 0 of 195 | | 158 of 195 | 158 of 232 | 4.4 |
| 5 | 0.402 | far / 5 | 158 of 195 | 2.7 | 158 of 195 | 79 of 116 | 5.1 |
| 6 | 0.335 | far / 6 | 158 of 195 | 4.6 | 158 of 195 | 79 of 116 | 5.7 |
| 7 | 0.279 | far / 7 | 158 of 195 | 6.2 | 158 of 195 | 79 of 116 | 6.1 |
| 8 | 0.233 | overview / 8 | 158 of 195 | 7.5 | 158 of 195 | 79 of 116 | 5.7 |
| 9 | 0.194 | overview / 9 | 158 of 195 | 7.4 | 158 of 195 | 79 of 116 | 4.7 |
| 10 | 0.162 | overview / 10 | 158 of 195 | 6.1 | 158 of 195 | 79 of 116 | 4.0 |
| 12 | 0.112 | overview / 10 | 158 of 195 | 4.3 | 158 of 195 | 79 of 116 | 2.7 |

The 37 dots that never leave are the Internals rows', which are not held. No name crosses its card, no card's ink lies over a neighbour's box, and the page raised no error at any of the eighteen presses.

The cause is in the stylesheet, not in a miscalculation. A held dot is scaled about the edge beside its name (`transform-origin: right center` for the dot that uses, `left center` for the dot that offers), the rule of [November 6, Turn 17](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6), "the dots will grow outward", so every pixel it gains goes away from the name and, once the card has shrunk under it, past the card's edge. Its ceiling is its row's height, which it reaches at the overview band: on a card 66 px wide the two dots of a row are each 14 px across, a third of their width outside the card. Vertically a dot and a row's More are scaled about the name's own line, which stands at the top of a row whose slot is empty, so they rise above the row by up to 6 px and the dots of neighbouring rows stand as two unbroken columns of beads. [The overview band's first step](still-picture-08-overview.png) and [the last step](still-picture-10-last-step.png) show it.

## What a far zoom-out holds, and what it lets go

Measured by `type-sizes.cjs`: the height on screen of each kind of name, as least / median / greatest over everything drawn.

| Press | Band / step | Symbol names | File names, all 44 cards | The subject's file name | Directory names | Rows of the subject cut with an ellipsis |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | reading / 0 | 12 / 12 / 12 | 15 / 15 / 15 | 15 | 14 | 0 of 59 |
| 1 | reading / 1 | 10 / 10 / 10 | 12.5 / 12.5 / 12.5 | 12.5 | 11.7 | 0 of 59 |
| 2 | middle / 2 | 8.4 / 16.8 / 18 | 7.7 / 14.6 / 22.5 | 15 | 9.7 | 2 of 59 |
| 4 | middle / 4 | 5.8 / 12 / 18 | 3.6 / 8.2 / 22.5 | 7 | 6.8 | 35 of 59 |
| 5 | far / 5 | 4.9 / 12 / 18 | 4.4 / 8.4 / 22.5 | 8.6 | 5.6 | 25 of 59 |
| 6 | far / 6 | 4.1 / 12 / 18 | 3.4 / 6.6 / 22.5 | 6.6 | 4.7 | 46 of 59 |
| 8 | overview / 8 | 2.8 / 12 / 12.9 | 2.2 / 4.5 / 17 | 4.3 | 3.3 | 54 of 59 |
| 10 | overview / 10 | 2 / 8.9 / 8.9 | 1.5 / 3.1 / 11.8 | 3 | 2.3 | 55 of 59 |

(The least symbol-name figure in each row is the Internals label, which is not held.)

Three things stand in those numbers.

- **The ladder holds the inner detail and lets the outer identity go.** From the far band outward a symbol's name is held at 12 px while the median file name is 8.4 px and falling, the subject's own name 4.3 px by the overview band, and a directory's name is never held at all: 5.6 px at the far band, 3.3 px at the overview band. The far view exists to show which files, in which directories, connect to which; those are the names it loses first.
- **Size follows the length of a name.** A name may grow to Name Growth, 1.5, times its held size where its row has room, so a short name is drawn half again as large as a long one beside it, and a file's name is scaled to fit beside its card's buttons, so `types.ts` stands at 22.5 px where `local-map-simplicity.spec.ts` stands at 4.4 px. Nothing about the software is said by either difference. [The far band as it is](still-picture-05-far.png) against [the same step with Name Growth at 1](still-picture-05-far-name-growth-1.png), the lever that already exists.
- **Zooming out one step makes names larger.** Inside the reading band a name follows the map, 12 px to 10 px; at the middle band's first step it jumps to its held size times its growth, 16.8 px at the median and 18 px at most, then falls back to 12 px over two steps. The steadiness the ladder was built for is broken at its first rung.

And one thing in the pictures that no number above carries: with the descriptions gone, most of a card is the empty room their slots keep. [At the far band](still-picture-05-far.png) `types.ts` is a title, one row and a blank box.

## The pictures

| Picture | What it shows |
| --- | --- |
| [still-picture-00-reading.png](still-picture-00-reading.png) | As framed on arrival, the reading band: every symbol's name over its two-line slot, the neighbours clipped by the frame as the centred card intends. |
| [still-picture-05-far.png](still-picture-05-far.png) | Five presses out, the far band's first step: names of three sizes on one card, the subject's own name among the smallest text on it, directory names too small to read. |
| [still-picture-05-far-name-growth-1.png](still-picture-05-far-name-growth-1.png) | The same step with the Name Growth lever at 1: every symbol name one size, the short file names one size, the long ones still shrunk to fit. |
| [still-picture-08-overview.png](still-picture-08-overview.png) | Eight presses out, the overview band's first step: names cut to two or three letters beside a More on every row, the dots as two columns of beads wider than the card. |
| [still-picture-10-last-step.png](still-picture-10-last-step.png) | Ten presses out, the last step, past which nothing is held further. |
| [still-picture-05-far-sketch.png](still-picture-05-far-sketch.png) | **A sketch, not the product.** The far band with file names and directory names held at one size and wrapped at their seams into the card's own room, symbol names at one size, and no button on a row. |
| [still-picture-08-overview-sketch.png](still-picture-08-overview-sketch.png) | **A sketch, not the product.** The overview band with the symbol rows silent, the dots following the map, and file and directory names held. |
| [shells-off.png](shells-off.png) | Yesterday's link B: the 3D Local Map pinned on `forceGraphView.ts`, two hops, Group Wrappers off; a ring on every sphere with more behind it. |
| [shells-skin-depth-2.png](shells-skin-depth-2.png) | Yesterday's link A: the same pin with the skin at Shell Depth 2. The rings are gone; three dim labels (`e2e · 45`, `explorer/src · 75`, `engine/src · 139`) stand in the mass where their shells are, and the island wrappers ring the outskirts. One load of each in the software renderer reported rest 19 s and 24 s after navigation, shells on and off. |

### How the sketches were made, and what they leave out

`far-sketch.cjs` loads the served page with Name Growth at 1, presses Zoom Out to the step, and injects a stylesheet and a layer of labels placed from the cards' and directory labels' own boxes: file names at 13 px and directory names at 11 px, at every step. At the far band it hides each row's Pin and More; at the overview band it also hides the symbol names and lets the dots follow the map, then asks the page to draw its wires again, so the wires in the sketch are the product's own, ending at the smaller dots. It does not gather the wires by file pair, does not fold unconnected symbols into a count, and its labels are not clipped by the map's frame at the bottom edge. It shows one question for the eye, which names a far view should hold, and nothing about how the product would build it.

## What the root sees

In the 2D map, at reading scale the fixed-slot card is the best the card has looked: an even rhythm, a two-line gist under every name, nothing moving under the hand. Below it the ladder's mechanism is sound (a box that never changes, bands and steps as named states, every held size clamped, a crisp picture at rest) and its priorities are upside down from the far band outward. What the owner saw exceeding its boundaries is the held dots, and they are the symptom: a part that belongs to a symbol is being held at full size on a card that no longer has room to say which symbol it is. The remedy the root would bring to the owner is the overview band's own drawing, the owner's "sixth order" of [November 5, Turn 10](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-10), begun one band earlier than planned and led by the file's name, with directory names held beside it; the two sketches are that proposal's first picture.

In the 3D map, the shells' mechanism is the one the owner described on [November 5, Turn 11](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), many files held as one body with their references bundled, and their look does not yet carry it: 139 files of `engine/src` are a faint smudge under a grey label, harder to find than the rings they replace, which the owner had called "eye-catching elements that can expand into more" on November 3. A shell wants to be the most visible thing in the picture that is not pinned.
