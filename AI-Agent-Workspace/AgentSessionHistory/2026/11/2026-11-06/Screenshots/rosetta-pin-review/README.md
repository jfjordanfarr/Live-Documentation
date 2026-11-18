# The owner's pinned picture on the 2D round's first handback, and three ways to give the Internals row room

_Status: the root's review pictures of November 6, 2026, not a change to the product. Six are of builds; one is a sketch, marked as one. The owner looked at the 2D Local Map on port 8900 with `tests/integration/programs/rosetta-manifest.json` pinned whole and reported elements overlapping at large zoom-outs, buttons crossing the pin's highlight border, and an Internals row collapsed small with tiny buttons ([Turn 5 of the November 6 record](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-5), with [their own screenshots](../../../ChatHistory/2026/11/2026-11-06.1.images/rosetta-manifest-pinned-buttons-on-highlight-border.png)). Port 8900 was then serving the 2D drawing committed before this session; the 2D round was a builder's first handback, reviewed and sent back, not merged. These pictures set the same picture on both, and sketch a decision that is the owner's._

Taken by the root in a private headless Chromium at 1440 × 960, twice the pixel density, the layout's background search off, the pin carried in the address, the camera moved by the Zoom Out button one step a press. "Before" is port 8900 (the main tree's build: the 3D round of this session staged, the 2D drawing as committed at `51eec0c3`). "Handback" is a copy of the 2D builder's bundle as built at 19:22 on November 6, its first handback with its first fix in progress. The scripts were the root's scratch scripts and are not kept.

## The same picture, before and on the handback

| Press | Band | Before | On the handback |
| --- | --- | --- | --- |
| 3 | middle | [before-press-3.png](before-press-3.png): names of two sizes; each row's Pin and More stand on the highlight's top border. | [handback-press-3.png](handback-press-3.png): every name one size; Pin and More inside the highlight; the file's name wrapped at its seam instead of shrunk. |
| 5 | far | [before-press-5.png](before-press-5.png): the dots larger than their gutters, past the card's edges; More above each highlight. | [handback-press-5.png](handback-press-5.png): dots inside the card; More inside each highlight; names cut with an ellipsis at one size. |
| 9 | overview | [before-press-9.png](before-press-9.png): the dots as two columns of beads wider than the card; the file names of the neighbours a few pixels tall. | [handback-press-9.png](handback-press-9.png): nothing outside its card. **Two faults**, both sent back: file names break inside a word beside the node's More ("main.r / s", "Main.c / s", "compil / er-…"), and the subject's own name is cut to "rose…" because a file pinned whole counted every row as pinned, so the overview kept every row. |

In both, the Internals row at the foot of each card is as the owner saw it: its label and its buttons follow the map, since its row, about 19 px tall, has no room to hold them.

## The Internals row three ways: a sketch

[internals-row-three-ways.png](internals-row-three-ways.png). **A sketch, not the product.** One neighbour card (`compiler-edges.json` of the C++ sample) at one, three and five presses out, top to bottom: the reading band's first step out, the middle band, the far band. Left to right:

1. **As built.** The Internals row keeps its own short box. One press out it reads like the rows above it; from the middle band out its label, its Pin and More and its dot follow the map and shrink, while every symbol row's hold their size.
2. **One line of room.** The row is 49 px tall, a symbol row's head and one slot line. Its label, buttons and dot hold their size like every other row's through the far band. Each card is about 30 px taller at reading scale, one blank line under "Internals".
3. **A symbol's full slot.** The row is 66 px tall, as every symbol row is with two slot lines. The held sizes are the same as with one line at every step shown; each card is about 47 px taller, two blank lines under "Internals".

How it was made, and what it leaves out: the two right-hand columns inject one style rule before the first render (the Internals row's height), so the layout and the ladder's room measurement see it and the product's own rules hold the row's parts. The row's dashed outline does not yet grow with its held label, so it shows as a thin strip above the label in the far band; a build would hold it as the pin's highlight is held. Nothing else was changed, and nothing here is in the product.
