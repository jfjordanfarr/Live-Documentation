# A dedicated slot for Internals: three sketched forms beside the row as built

_Status: the root's sketches of November 6, 2026, for a design discussion with the owner; not a change to the product, and no form here is chosen. The owner answered three ways of giving the Internals row room with a call for "a dedicated design slot with special styling", designed from what Internals is for ([Turn 7 of the November 6 record](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-7); the history of the pseudo-symbol in the owner's words is in that turn's work notes). These pictures set three forms of such a slot beside the row as it is built today, on one subject, at four scales._

## What is drawn

The subject is `packages/explorer/src/client/views/localView/card-factory.ts`, the file that builds the cards. Its card shows what Internals is for: five public rows, each open on both sides (green dot where its uses arrive, blue dot where its users leave), and at the foot the Internals row, where the largest bundle of wires in the picture ends. To its right `branch-renderer.ts` shows only its Internals row, which takes wires from three of this file's public symbols.

Taken by the root in a private headless Chromium at 1440 × 960 and twice the pixel density, the layout's background search off, the camera moved by the Zoom Out button one step a press, on a copy of the 2D builder's bundle as built at 19:22 on November 6 (its first handback, not merged; port 8900 does not show it). Each form is one stylesheet injected before the first render, printed below, so the layout, the ladder's room measurement and the product's own held-size rules see it; no script and no change to the page's elements. The scripts were the root's scratch scripts and are not kept.

| Picture | Shows |
| --- | --- |
| [forms-reading.png](forms-reading.png) | The foot of the subject's card at reading scale, four ways: as built, A, B, C. |
| [forms-zoomed-out.png](forms-zoomed-out.png) | The same four, a row each, at three, six and eight presses out: the middle, far and overview bands of that bundle. |
| [as-built-whole-frame.png](as-built-whole-frame.png) | The whole frame at reading scale as built. |
| [sealed-box-whole-frame.png](sealed-box-whole-frame.png) | The same frame with form A, the neighbour's Internals included. |
| [sealed-box-far-band-whole-frame.png](sealed-box-far-band-whole-frame.png) | Form A six presses out: three cards with their Internals in one picture. |

## The forms

Every form gives the row a symbol's allotment (a name's line and two description lines, 66 px at the map's own scale, which the owner called the only reasonable one of the three earlier ways), sets "Internals" upright in the public rows' type, drops the dashed outline, and leaves the place of a public row's blue dot without one.

- **As built.** A dashed outline, italic text, a grey dashed dot, in a row about 19 px tall. From the middle band out its name and buttons follow the map and shrink while every public row's hold their size.
- **A. Sealed box.** One flat black box across the whole row and both gutters. Its one opening is a square in the green of uses, where the wires end; where each public row has its blue dot the box is closed. The name stands inside the dark, on the line every row's name stands on; the room where a public symbol has its description is black.
- **B. Open mouth.** The box is open through the card's left wall, the side uses enter by, marked with a green edge, and ends short of the right gutter. No dot: the wires run into the dark.
- **C. Black square.** The square that once stood before the name as a character, grown into the thing itself: where a public row has a round green dot, Internals has a black square the wires run into, and its name stands beside it on the card's own surface.

## What the sketches get wrong

- The card is taller by the slot's added room in every form; nothing else about the card was redrawn.
- **A** at six presses: the name stands at the box's lower edge. **B** at six presses: the name is cut to "Inter…", since the sketch narrows its room. **C** at six presses: the name is not held and draws small. A build would place and hold each.
- The wires end at the middle of the opening and draw over it; whether they should stop at its edge is a detail of a build.
- On a short card the file-level blue dot, which stands at half the card's height on its right edge, can fall beside the box and read as its way out. It is not Internals' and a build would keep it away.
- The overview band here is that bundle's: its rows' dots still follow the map. The 2D round in progress ends wires on the file's own dots there, so whether the box stays at that band is a question of its own.

## The injected styles

A, `box.css`:

```css
.local-slot-card .symbol-row.internals-row { position: relative; height: calc(32px + var(--slot-lines, 2) * 17px); grid-template-rows: auto minmax(0, 1fr); align-content: start; margin-top: 2px; }
.local-slot-card .symbol-row.internals-row::before { content: ""; position: absolute; inset: 0 -7px; border-radius: 5px; background: #06070a; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .09); z-index: 0; }
.local-slot-card .symbol-row.internals-row > * { position: relative; z-index: 1; }
.local-slot-card .symbol-row.internals-row .internals-label { background: none; border: 0; margin-top: 0; padding: 7px 7px 4px; }
.local-slot-card .symbol-row.internals-row .internals-text { font-style: normal; letter-spacing: 0; color: var(--text-secondary); }
.local-slot-card .symbol-row.internals-row .internals-anchor { margin-top: 7px; align-self: start; border-radius: 3px !important; background: #000 !important; border: 2px solid rgba(0, 211, 170, .85) !important; box-shadow: none !important; }
.local-slot-card .symbol-row.internals-row .symbol-anchor-placeholder { margin-top: 0; }
```

B, `mouth.css`, where it differs from A:

```css
.local-slot-card .symbol-row.internals-row::before { content: ""; position: absolute; top: 0; bottom: 0; left: -13px; right: 26px; border-radius: 0 5px 5px 0; background: #06070a; box-shadow: inset 3px 0 0 rgba(0, 211, 170, .8), inset 0 0 0 1px rgba(255, 255, 255, .09); z-index: 0; }
.local-slot-card .symbol-row.internals-row .internals-label { background: none; border: 0; margin-top: 0; padding: 7px 7px 4px; margin-right: 28px; }
.local-slot-card .symbol-row.internals-row .internals-anchor { margin-top: 0; align-self: center; grid-row: 1 / -1; background: transparent !important; border: 0 !important; box-shadow: none !important; }
```

C, `square.css`, which has no box behind the row:

```css
.local-slot-card .symbol-row.internals-row { position: relative; height: calc(32px + var(--slot-lines, 2) * 17px); grid-template-rows: auto minmax(0, 1fr); align-content: start; margin-top: 2px; }
.local-slot-card .symbol-row.internals-row .internals-anchor { width: 40px; height: 40px; margin: 13px 0 0 -4px; justify-self: start; align-self: start; grid-row: 1 / -1; border-radius: 5px !important; background: #000 !important; border: 2px solid rgba(0, 211, 170, .75) !important; box-shadow: 0 0 0 1px rgba(0, 0, 0, .6), inset 0 0 0 1px rgba(255, 255, 255, .05) !important; }
.local-slot-card .symbol-row.internals-row .internals-label { background: none; border: 0; margin-top: 0; padding: 21px 7px 4px 30px; }
.local-slot-card .symbol-row.internals-row .internals-text { font-style: normal; letter-spacing: 0; color: var(--text-secondary); }
.local-slot-card .symbol-row.internals-row .symbol-anchor-placeholder { margin-top: 0; }
```
