# The Internals row held at every band, and the black square at the built row's weight

_Status: the root's and a builder's sketches of November 8, 2026, for the owner's eye; not a change to the product, and no form here is chosen. They follow the owner's two answers about the Internals row: "internals is still always small" (November 7, [Turn 8 of the November 6–7 record](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-8), on `symbolAnchors.ts`), and, asked to choose among [the three forms of November 6](../../2026-11-06/internals-slot/README.md), "'As Built' is by far the most aesthetically pleasing so far. C. Black Square is probably the most likely to be improvable upon until it actually _passes_ 'As built' aesthetically" ([Turn 2 of the November 7 record](../../../ChatHistory/2026/11/2026-11-07.1.record.md#turn-2)). The reading these pictures test is the root's: the built row's quiet (a dashed outline, italic text, a grey dashed dot, a row 19 px tall in the map's units) is the bar, and what is wrong with it is only that from the middle band out its name, its buttons and its dot follow the map and shrink while every public row's head holds its reading size; C's one idea worth keeping is a square the wires run into, in place of the dot; the black room the November 6 forms gave the row is what lost._

## What is drawn

Two subjects. The first is the November 6 one, `packages/explorer/src/client/views/localView/card-factory.ts`, selected (not pinned), whose card ends in the Internals row where the largest bundle of wires in the picture arrives; the crops are framed round that row's dot, at reading scale and at three, six and eight presses out, which on this bundle are the middle band (step 3), the far band (step 6) and the overview band (step 8). The second is the owner's: `packages/explorer/src/client/views/symbolAnchors.ts` pinned alone by the address the search gives when the file is typed and chosen, at the fourth and fifth presses (the middle band's step 4 and the far band's step 5), the map dragged 700 px left so that the `localView` band of the owner's far picture is in frame; there most cards show nothing but their Internals row.

Taken by a builder in a private headless Chromium at 1440 × 960 and twice the pixel density, a fresh context for every form, the layout's background search off, the camera moved by the Zoom Out button one step a press, on port 8900's bundle of `476ea2c8`. Each form is one stylesheet appended to the head as soon as the parser reaches the body, so that it follows the bundle's own stylesheet and stands before the page's first render, where the layout, the ladder's room measurement and the product's held-size rules all see it; no script changes the page's elements. The stylesheets are printed below; the scripts that took the pictures and the measurements are kept in [the probe folder](../../../Probes/2026-11-08/internals-held/README.md), with the readings as JSON here.

| Picture | Shows |
| --- | --- |
| [forms-reading.png](forms-reading.png) | The foot of `card-factory.ts`'s card at reading scale, five ways: as built, H, C1, C2, C3. |
| [forms-zoomed-out.png](forms-zoomed-out.png) | The same five, a row each, at three, six and eight presses out. |
| [card-factory-as-built-00-reading-0-whole.png](card-factory-as-built-00-reading-0-whole.png) | The whole frame at reading scale as built. |
| [card-factory-C1-00-reading-0-whole.png](card-factory-C1-00-reading-0-whole.png) | The same frame with C1: every card's Internals dot a black square. |
| `card-factory-<form>-<press>-<band>-<step>.png` | Each crop of the composites on its own. |
| [symbolAnchors-as-built-04-middle-4-panned.png](symbolAnchors-as-built-04-middle-4-panned.png), [H](symbolAnchors-H-04-middle-4-panned.png), [C1](symbolAnchors-C1-04-middle-4-panned.png) | The owner's subject at the fourth press, the closer of the owner's two pictures, three ways. |
| [symbolAnchors-as-built-05-far-5-panned.png](symbolAnchors-as-built-05-far-5-panned.png), [H](symbolAnchors-H-05-far-5-panned.png), [C1](symbolAnchors-C1-05-far-5-panned.png) | The same at the fifth press, the far one. |
| `card-factory-readings-0-3-6-8.json`, `symbolAnchors-readings-4.json`, `symbolAnchors-readings-5.json` | The measurements below, with each form's address and page errors (none). |

## The forms

- **As built.** The reference, taken again on this bundle so that the set is matched. A dashed outline round the name and its buttons, italic 11 px text, a grey dashed dot; the row 19 px tall where a public row has its 66 px allotment. Its name, buttons and dot obey the product's held-size rules like every row's, but those rules bound a row's held head by the row's own height (the name by `--row-fill-h`, the buttons by the room to the row's bottom, the dot by the row's height over its own), and in a row this short that bound is reached at once: from the middle band out the head follows the map.
- **H, held.** The row exactly as built, with that bound lifted for it alone: its name held by the text scale, its buttons and its dot by the control scale, the same scales the stylesheet gives public rows, the dot still bounded by its card's edge and kept on the name's line. Nothing else changes: no allotment, no box behind it. The head grows downward from the row's top, as every row's does, so from the middle band out it stands below the row's box and below its dashed outline, which does not grow (measured below). At reading scale H is as built, since the first step holds reading size anyway.
- **C1, the square at the dot's size.** H, with the dot replaced by a black square the wires run into: the dot's own box, which is 12 px and a 1 px border, 14 px in the map's units (19 px on screen at reading scale, held at that through the middle band), black, a 2 px edge in the green of uses at 75 % alpha, a radius of 2.5 px, no glow. The outline, the italic and the name stay as built.
- **C2, the square half again as large.** C1 with the square at 18 px (half again the dot's 12 px width, 1.29 times its 14 px box), about the centre the dot's box had, so that the row keeps its height and the square stays on the name's line; it stands 1.5 px proud of the row's bottom in the map's units at reading scale (2.0 px on screen), and not above its top.
- **C3, the square on the card's surface.** C1 with the row's dashed outline and background dropped (the border kept, transparent, so that nothing moves): the name stands on the card as the November 6 C did, and only the square marks the row.

## Measurements

Read from the page in each form's own run, in CSS pixels on screen (the pictures are twice that). The name's height is its drawn box's (the line box of its text, scaled as drawn), the type its computed size times the map's scale and its own; the public row beside it is the card's first shown public row (`NODE_HUB` on `card-factory.ts`, `normalizeSymbolIdentifier` on `symbolAnchors.ts`).

| Subject | Form | Press, band, step | Internals name, px (type) | Public name, px (type) | Head below the row | Head below the outline | Head below the card border | Dot or square, px | Dot or square below the row |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `card-factory.ts` | as built | 0, reading 0 | 16.3 (15) | 16.3 (15) | 0 | 0 | 0 | 19 | 0 |
| `card-factory.ts` | as built | 3, middle 3 | 10.4 (9.5) | 16.3 (15) | 0 | 0 | 0 | 14.9 | 0 |
| `card-factory.ts` | as built | 6, far 6 | 6 (5.5) | 16.3 (15) | 0 | 0 | 0 | 8.7 | 0 |
| `card-factory.ts` | as built | 8, overview 8 | not drawn | not drawn | – | – | – | 6 | – |
| `card-factory.ts` | H | 0, reading 0 | 16.3 (15) | 16.3 (15) | 0 | 0 | 0 | 19 | 0 |
| `card-factory.ts` | H | 3, middle 3 | 16.3 (15) | 16.3 (15) | 9.1 | 7.5 | 0 | 19 | 9.1 |
| `card-factory.ts` | H | 6, far 6 | 16.3 (15) | 16.3 (15) | 14.9 | 14 | 1.7 | 12.3 | 11.3 |
| `card-factory.ts` | H | 8, overview 8 | not drawn | not drawn | – | – | – | 8.5 | – |
| `card-factory.ts` | C1 | 0, reading 0 | 16.3 (15) | 16.3 (15) | 0 | 0 | 0 | 19 | 0 |
| `card-factory.ts` | C1 | 3, middle 3 | 16.3 (15) | 16.3 (15) | 9.1 | 7.5 | 0 | 19 | 9.1 |
| `card-factory.ts` | C1 | 6, far 6 | 16.3 (15) | 16.3 (15) | 14.9 | 14 | 1.7 | 12.3 | 11.3 |
| `card-factory.ts` | C1 | 8, overview 8 | not drawn | not drawn | – | – | – | 8.5 | – |
| `card-factory.ts` | C2 | 0, reading 0 | 16.3 (15) | 16.3 (15) | 2 | 0 | 0 | 24.5 | 2 |
| `card-factory.ts` | C2 | 3, middle 3 | 16.3 (15) | 16.3 (15) | 10.9 | 9.4 | 0 | 22.8 | 10.9 |
| `card-factory.ts` | C2 | 6, far 6 | 16.3 (15) | 16.3 (15) | 14.9 | 14 | 1.7 | 13.2 | 11.8 |
| `card-factory.ts` | C2 | 8, overview 8 | not drawn | not drawn | – | – | – | 9.2 | – |
| `card-factory.ts` | C3 | 0, reading 0 | 16.3 (15) | 16.3 (15) | 0 | 0 | 0 | 19 | 0 |
| `card-factory.ts` | C3 | 3, middle 3 | 16.3 (15) | 16.3 (15) | 9.1 | 7.5 | 0 | 19 | 9.1 |
| `card-factory.ts` | C3 | 6, far 6 | 16.3 (15) | 16.3 (15) | 14.9 | 14 | 1.7 | 12.3 | 11.3 |
| `card-factory.ts` | C3 | 8, overview 8 | not drawn | not drawn | – | – | – | 8.5 | – |
| `symbolAnchors.ts` | as built | 4, middle 4 | 9.2 (8.4) | 17.4 (16) | 0 | 0 | 0 | 13.3 | 0 |
| `symbolAnchors.ts` | H | 4, middle 4 | 17.4 (16) | 17.4 (16) | 12.1 | 10.7 | 0 | 18.9 | 11.3 |
| `symbolAnchors.ts` | C1 | 4, middle 4 | 17.4 (16) | 17.4 (16) | 12.1 | 10.7 | 0 | 18.9 | 11.3 |
| `symbolAnchors.ts` | as built | 5, far 5 | 7.7 (7) | 17.4 (15.9) | 0 | 0 | 0 | 11.1 | 0 |
| `symbolAnchors.ts` | H | 5, far 5 | 17.4 (15.9) | 17.4 (15.9) | 14.2 | 13 | 0 | 15.7 | 11.7 |
| `symbolAnchors.ts` | C1 | 5, far 5 | 17.4 (15.9) | 17.4 (15.9) | 14.2 | 13 | 0 | 15.7 | 11.7 |

The head is the name, its Pin and More, and the dot or square, as drawn; "below the row" is how far its lowest part stands below the row's box, "below the outline" below the dashed outline's box (which C3 leaves transparent, in the same place), "below the card border" past the inner edge of the card's bottom border. No part stands above or to the right of the row in any form. Every other card measured (`branch-renderer.ts` beside `card-factory.ts`; `branches.ts` and `connections.ts` beside `symbolAnchors.ts`) reads the same figures as the subject.

- **As built**, the Internals name is a public name's size at reading scale (both 11 px in the map's units) and from the middle band out follows the map: 0.64 and 0.37 of a public name's height at three and six presses on `card-factory.ts`, 0.53 and 0.44 at four and five on `symbolAnchors.ts`.
- **Held** (H, C1, C2, C3), it is a public name's size at every band where rows are drawn.
- **The overflow.** At reading scale every form keeps the row's head inside its box, except C2: its square stands 2 px on screen below the row's bottom (1.5 px in the map's units), and not above its top. From the middle band out, the held head stands 9 to 15 px below the row's box, since it grows downward from the row's top and the row is 19 px tall in the map's units. At the middle band the lowest part is the dot or square; at the far band it is the name's line box, which on `card-factory.ts` reaches 1.7 px past the inner edge of the card's bottom border, onto the border (the letters themselves stay above it in the picture). A build would bound the held head by the room of the box it belongs to.
- **The square's size.** At the far band the dot and the square are smaller on screen than at the middle band (12.3 px against 19 for C1 on `card-factory.ts`), because a dot's held size is also bounded by its room to the card's edge, which H keeps.

## What the sketches get wrong

- H's held head stands outside its row and its outline from the middle band out: the outline, a box of the row as built, stays at the row's height while the name below it is held. A build would bound the held head by the room of the box it belongs to, which the ladder's principle asks, and that box is the question: the row as built is too short to hold a reading-size name past the first step, so holding the name means giving the row the room its held head needs (a line of it, not the November 6 slot), or letting the outline grow with the head as a pinned row's highlight does.
- The wires end at the middle of the square and draw over its black, as they did over the November 6 square; whether they stop at its edge is a detail of a build.
- At the overview band (eight presses) every row of an unpinned card is silent on this bundle, the Internals row with them, and the wires end on the file's own dots; the five forms draw the same picture there. The November 6 overview, on an older bundle, still drew the rows' dots.
- The square replaces a round dot that every public row keeps on its left; whether a square reads as "the wires end inside" or as a different kind of dot at the far band, where it is 12 px on screen, is for the eye.

## The injected styles

As built has none. H is `h.css`; C1 is `h.css` and `c1.css`; C2 is C1 and `c2.css`; C3 is C1 and `c3.css`.

H, `h.css`:

```css
/* H, held: the Internals row exactly as built, its name, its buttons and its dot held as a public row's are, by the
   scales the stylesheet gives public rows (reading.css), without the bound of the row's own height: the name by the
   text scale (and Name Growth, 1 by default), the buttons and the dot by the control scale, the dot still bounded by its
   card's edge and kept on the name's line. The row keeps its height; where the held head is taller, it stands out. */
.local-slot-card .symbol-row.internals-row {
    --row-control-scale: max(1, var(--control-scale, 1));
    --dot-scale: clamp(1, var(--control-scale, 1), var(--row-dot-room, 1));
    --dot-y: calc((max(var(--row-dot-h, 14) / 2 * var(--dot-scale), var(--row-dot-mid, 7) + (var(--row-name-y, 0) + var(--row-name-h, 0) / 2) * (var(--name-scale, 1) - 1)) - var(--row-dot-mid, 7)) * 1px);
}
[data-lod="reading"]:not([data-step="0"]) .local-slot-card .symbol-row.internals-row:not(.local-name-wraps) {
    --name-scale: max(1, var(--text-scale, 1));
}
:is([data-lod="middle"], [data-lod="far"], [data-lod="overview"]) .local-slot-card .symbol-row.internals-row {
    --name-scale: max(1, max(var(--text-scale, 1), min(0.9 * var(--name-room) / var(--row-name-w, 1), var(--text-scale, 1) * var(--name-growth, 1))));
}
```

C1, `c1.css`, over H:

```css
/* C1, over H: the dot replaced by a black square the wires run into, in the dot's own box (12 px and its 1 px border,
   14 px as laid out), held as the dot is; an edge in the green of uses at reduced alpha, a small radius, no glow. */
.local-slot-card .symbol-row.internals-row .internals-anchor {
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border-radius: 2.5px !important;
    background: #000 !important;
    border: 2px solid rgba(0, 211, 170, .75) !important;
    box-shadow: none !important;
}
```

C2, `c2.css`, over C1:

```css
/* C2, over C1: the square at 18 px, grown about its own centre where the dot's box was, so that the row's height and the
   square's centre on the name's line are unchanged: its margins take back the 4 px it grew. */
.local-slot-card .symbol-row.internals-row .internals-anchor {
    width: 18px;
    height: 18px;
    margin: 2px -2px -2px;
}
```

C3, `c3.css`, over C1:

```css
/* C3, over C1: the row's dashed outline and background dropped, so that the name stands on the card's own surface and
   only the square marks the row; the border stays, transparent, so that nothing moves. */
.local-slot-card .symbol-row.internals-row .internals-label {
    background: none;
    border-color: transparent;
}
```
