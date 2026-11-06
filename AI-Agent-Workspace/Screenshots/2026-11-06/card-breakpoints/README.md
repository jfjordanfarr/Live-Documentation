# The card ladder as breakpoints: steps, clamps, a held More, a crisp picture at rest

Pictures and measurements of the breakpoint pass the owner asked for on [November 6, Turns 17 to 19](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6): the anchor dots over their names at far zoom, the pinned highlight shorter than its grown name, no More on a row once its controls left, descriptions shrinking close up, the map blurred close up and aliased far out, and the proposal of breakpoint-driven designs, with clamps "to prevent runaway goofy rendering results that emerge from extreme inputs". Built by a builder on the fixed-slot composition (the Card Text default), the same three journeys as [the card-ladder pictures of November 5](../../2026-11-05/card-ladder/README.md), retaken at every step rather than at the bands only. Taken in a private headless Chromium at 1440 × 960 (the phone at 390 × 844) against the worktree's own bundle, with the layout's background search off. Implementation evidence for the owner's eye, not a verdict.

## What changed, in the order of the brief

1. **Steps.** The zoom against the calibrated reading scale now picks a band (what leaves, unchanged: 0.25, 0.45, 0.74, 1.3 with a 15 % margin) and a step every 20 % of zoom, each step centred on a whole number of steps out from reading scale and kept a quarter step past its edges (`ladder-steps.ts`, Vitest). The map says both, `data-lod` and `data-step`; the stylesheet's custom properties are written only when the band or a held scale changes, never between. A Zoom button moves the camera by exactly the step ratio, so each press moves exactly one step (steps 0 to 10 on every journey below). A held size on screen lies between 0.87 and 1.15 of its reading size across a step.
2. **The layer.** The map's viewport is a compositor layer only while the camera moves (a drag, a pinch, inertia, an animated wheel zoom, a fit), and the map says so as `data-camera="moving"`; at rest the picture is drawn afresh at its own scale. `localMapSettled` in the specs waits on it.
3. **The dots** grow from their edge beside the name, the use-dot leftward and the offer-dot rightward, between their reading size and their row's height; the wires are drawn again when a step changes the dots, so that they end at the dots as drawn.
4. **The highlight** of a pinned row is a layer under the name that grows downward with it, never shorter than the name's own box, never past its row.
5. **More per row.** Every row keeps its More at every band, held; the Pin stands through the middle band, held with More, and beyond it folds into More's menu (Pin, Unpin, Pin only this symbol), reachable by keyboard. A name the room beside More cannot hold at its held size ends with its own ellipsis.
6. **Clamps.** The first step holds reading size for every closer zoom: zooming in shrinks nothing, and a description stays at its reading size (the close band's prose shrink is gone). Past the last step, at about a sixth of reading scale, the held sizes stay and the card shrinks with the map. The dot, the row's buttons and the node's buttons stop at the row's height (14, 17 and 20 px against 66); a name never draws below its held size while its row's height allows, nor above Name Growth times it.

## The blur and the aliasing, before and after

The owner's two pictures of Turn 17, retaken on `tests/e2e/still-picture.ts` with the Zoom buttons: six presses in, and nine out.

| | Before (the bundle at 26a1bb86) | After |
| --- | --- | --- |
| Close up, the whole frame | [picture](layer-before-close.png) | [picture](layer-after-close.png) |
| Close up, `scoreForeign`'s row | [picture](layer-before-close-detail.png) | [picture](layer-after-close-detail.png) |
| Far out, the whole frame | [picture](layer-before-far.png) | [picture](layer-after-far.png) |
| Far out, the card | [picture](layer-before-far-detail.png) | [picture](layer-after-far-detail.png) |

Before, close up, the name is soft and its description held 12 px on screen while the name grew to 33 px; after, both are sharp and the description grows with the map, 36 px at the camera's closest (its 12 px reading size times the map's scale of 3). Far out, [the same crop enlarged four times](layer-far-magnified.png) shows the wires and names jagged before and smooth after, the dots over the names' first letters before and clear of them after; it also shows the cost discussed below, the names after held at their reading size and cut to two or three letters beside each row's held More, where before they were scaled to the whole row.

## The journeys, at every step

Each sheet shows the subject card at every moment of its journey: the reading scale as first framed, one Zoom Out press at a time until the camera can go no farther, Reset Zoom, and one Zoom In press at a time until it can come no closer. [Payment service](payment-sheet.png), [pathfind.ts with its two symbol pins](pathfind-sheet.png), [still-picture.ts](still-picture-sheet.png). Full frames are kept at the first moment of each band and at both extremes; they are linked in the tables.

The tables are screen pixels: the subject row's name (`PaymentService`, `walk (function)`, `readPicture`), the file's name, the row's More, the node's More, the row's use-dot and a slot's description, with the row Pin's place and, over every row of the card, how many rows have a dot over the name, a name under More, and a name cut with an ellipsis. Every card's box was the same at every moment of every journey.

### Payment service (25 moments; card boxes identical at every moment: yes)

| Moment | Camera scale | Band | Step | Name px | File name px | Row More px | Node More px | Dot px | Prose px | Row Pin | Rows with a dot over the name | Names under More | Names cut | Picture |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reading | 1.45 | reading | 0 | 17.4 | 21.7 | 24.7 | 29 | 20.3 | 17.4 | shown | 0 | 0 | 0 | [picture](payment-00-reading.png) |
| out-1 | 1.208 | reading | 1 | 14.5 | 18.1 | 24.6 | 29 | 20.3 | 14.5 | shown | 0 | 0 | 0 |  |
| out-2 | 1.007 | middle | 2 | 26.1 | 25.7 | 24.6 | 29 | 20.3 | 12.1 | shown | 0 | 0 | 0 | [picture](payment-02-out-2.png) |
| out-3 | 0.839 | middle | 3 | 25.2 | 19.4 | 24.6 | 29 | 20.3 | 10.1 | shown | 0 | 0 | 0 |  |
| out-4 | 0.699 | middle | 4 | 19.6 | 14.2 | 24.7 | 29 | 20.3 | 8.4 | shown | 0 | 0 | 0 |  |
| out-5 | 0.583 | far | 5 | 19.1 | 14.7 | 24.6 | 29 | 20.3 | 7 | in More | 0 | 0 | 0 | [picture](payment-05-out-5.png) |
| out-6 | 0.486 | far | 6 | 17.4 | 11.7 | 24.7 | 29 | 20.3 | 5.8 | in More | 0 | 0 | 1 |  |
| out-7 | 0.405 | far | 7 | 17.4 | 9.4 | 24.6 | 26.7 | 20.3 | 4.9 | in More | 0 | 0 | 1 |  |
| out-8 | 0.337 | overview | 8 | 17.4 | 7.8 | 22.3 | 22.3 | 20.3 | 4 | in More | 0 | 0 | 1 | [picture](payment-08-out-8.png) |
| out-9 | 0.281 | overview | 9 | 15.5 | 6.5 | 18.5 | 18.5 | 18.5 | 3.4 | in More | 0 | 0 | 1 |  |
| out-10 | 0.234 | overview | 10 | 13 | 5.4 | 15.5 | 15.5 | 15.5 | 2.8 | in More | 0 | 0 | 1 |  |
| out-11 | 0.195 | overview | 10 | 10.8 | 4.5 | 12.9 | 12.9 | 12.9 | 2.3 | in More | 0 | 0 | 1 |  |
| out-12 | 0.163 | overview | 10 | 9 | 3.8 | 10.7 | 10.7 | 10.7 | 2 | in More | 0 | 0 | 1 |  |
| out-13 | 0.136 | overview | 10 | 7.5 | 3.1 | 8.9 | 8.9 | 8.9 | 1.6 | in More | 0 | 0 | 1 |  |
| out-14 | 0.113 | overview | 10 | 6.2 | 2.6 | 7.5 | 7.5 | 7.5 | 1.4 | in More | 0 | 0 | 1 |  |
| out-15 | 0.094 | overview | 10 | 5.2 | 2.2 | 6.2 | 6.2 | 6.2 | 1.1 | in More | 0 | 0 | 1 |  |
| out-16 | 0.078 | overview | 10 | 4.3 | 1.8 | 5.2 | 5.2 | 5.2 | 0.9 | in More | 0 | 0 | 1 |  |
| out-17 | 0.065 | overview | 10 | 3.6 | 1.5 | 4.3 | 4.3 | 4.3 | 0.8 | in More | 0 | 0 | 1 |  |
| out-18 | 0.054 | overview | 10 | 3 | 1.3 | 3.6 | 3.6 | 3.6 | 0.7 | in More | 0 | 0 | 1 |  |
| out-19 | 0.05 | overview | 10 | 2.8 | 1.2 | 3.3 | 3.3 | 3.3 | 0.6 | in More | 0 | 0 | 1 | [picture](payment-19-farthest.png) |
| back | 1.45 | reading | 0 | 17.4 | 21.7 | 24.7 | 29 | 20.3 | 17.4 | shown | 0 | 0 | 0 |  |
| in-1 | 1.74 | reading | 0 | 20.9 | 26.1 | 29.6 | 34.8 | 24.4 | 20.9 | shown | 0 | 0 | 0 |  |
| in-2 | 2.088 | reading | 0 | 25.1 | 31.3 | 35.5 | 41.8 | 29.2 | 25.1 | shown | 0 | 0 | 0 |  |
| in-3 | 2.506 | close | 0 | 30.1 | 37.6 | 42.6 | 50.1 | 35.1 | 30.1 | shown | 0 | 0 | 0 | [picture](payment-23-in-3.png) |
| in-4 | 3 | close | 0 | 36 | 45 | 51 | 60 | 42 | 36 | shown | 0 | 0 | 0 | [picture](payment-24-closest.png) |

### pathfind.ts (25 moments; card boxes identical at every moment: yes)

| Moment | Camera scale | Band | Step | Name px | File name px | Row More px | Node More px | Dot px | Prose px | Row Pin | Rows with a dot over the name | Names under More | Names cut | Picture |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reading | 1.45 | reading | 0 | 17.4 | 21.8 | 24.6 | 29 | 20.3 | 17.4 | shown | 0 | 0 | 0 | [picture](pathfind-00-reading.png) |
| out-1 | 1.208 | reading | 1 | 14.5 | 18.1 | 24.7 | 29 | 20.3 | 14.5 | shown | 0 | 0 | 0 |  |
| out-2 | 1.007 | middle | 2 | 26.1 | 32.6 | 24.6 | 29 | 20.3 | 12.1 | shown | 0 | 0 | 0 | [picture](pathfind-02-out-2.png) |
| out-3 | 0.839 | middle | 3 | 25.7 | 28.1 | 24.6 | 29 | 20.3 | 10.1 | shown | 0 | 0 | 0 |  |
| out-4 | 0.699 | middle | 4 | 19.9 | 18.7 | 24.7 | 29 | 20.3 | 8.4 | shown | 0 | 0 | 0 |  |
| out-5 | 0.583 | far | 5 | 19.7 | 23.8 | 24.6 | 29 | 20.3 | 7 | in More | 0 | 0 | 0 | [picture](pathfind-05-out-5.png) |
| out-6 | 0.486 | far | 6 | 17.4 | 18.7 | 24.7 | 29 | 20.3 | 5.8 | in More | 0 | 0 | 1 |  |
| out-7 | 0.405 | far | 7 | 17.4 | 15 | 24.6 | 26.7 | 20.3 | 4.9 | in More | 0 | 0 | 2 |  |
| out-8 | 0.337 | overview | 8 | 17.4 | 12.5 | 22.3 | 22.3 | 20.3 | 4 | in More | 0 | 0 | 3 | [picture](pathfind-08-out-8.png) |
| out-9 | 0.281 | overview | 9 | 15.5 | 10.4 | 18.5 | 18.5 | 18.5 | 3.4 | in More | 0 | 0 | 3 |  |
| out-10 | 0.234 | overview | 10 | 13 | 8.7 | 15.5 | 15.5 | 15.5 | 2.8 | in More | 0 | 0 | 3 |  |
| out-11 | 0.195 | overview | 10 | 10.8 | 7.3 | 12.9 | 12.9 | 12.9 | 2.3 | in More | 0 | 0 | 3 |  |
| out-12 | 0.163 | overview | 10 | 9 | 6 | 10.7 | 10.7 | 10.7 | 2 | in More | 0 | 0 | 3 |  |
| out-13 | 0.136 | overview | 10 | 7.5 | 5 | 8.9 | 8.9 | 8.9 | 1.6 | in More | 0 | 0 | 3 |  |
| out-14 | 0.113 | overview | 10 | 6.2 | 4.2 | 7.5 | 7.5 | 7.5 | 1.4 | in More | 0 | 0 | 3 |  |
| out-15 | 0.094 | overview | 10 | 5.2 | 3.5 | 6.2 | 6.2 | 6.2 | 1.1 | in More | 0 | 0 | 3 |  |
| out-16 | 0.078 | overview | 10 | 4.3 | 2.9 | 5.2 | 5.2 | 5.2 | 0.9 | in More | 0 | 0 | 3 |  |
| out-17 | 0.065 | overview | 10 | 3.6 | 2.4 | 4.3 | 4.3 | 4.3 | 0.8 | in More | 0 | 0 | 3 |  |
| out-18 | 0.054 | overview | 10 | 3 | 2 | 3.6 | 3.6 | 3.6 | 0.7 | in More | 0 | 0 | 3 |  |
| out-19 | 0.05 | overview | 10 | 2.8 | 1.9 | 3.3 | 3.3 | 3.3 | 0.6 | in More | 0 | 0 | 3 | [picture](pathfind-19-farthest.png) |
| back | 1.45 | reading | 0 | 17.4 | 21.8 | 24.6 | 29 | 20.3 | 17.4 | shown | 0 | 0 | 0 |  |
| in-1 | 1.74 | reading | 0 | 20.9 | 26.1 | 29.6 | 34.8 | 24.4 | 20.9 | shown | 0 | 0 | 0 |  |
| in-2 | 2.088 | reading | 0 | 25.1 | 31.3 | 35.5 | 41.8 | 29.2 | 25.1 | shown | 0 | 0 | 0 |  |
| in-3 | 2.506 | close | 0 | 30.1 | 37.6 | 42.6 | 50.1 | 35.1 | 30.1 | shown | 0 | 0 | 0 | [picture](pathfind-23-in-3.png) |
| in-4 | 3 | close | 0 | 36 | 45 | 51 | 60 | 42 | 36 | shown | 0 | 0 | 0 | [picture](pathfind-24-closest.png) |

### still-picture.ts (26 moments; card boxes identical at every moment: yes)

| Moment | Camera scale | Band | Step | Name px | File name px | Row More px | Node More px | Dot px | Prose px | Row Pin | Rows with a dot over the name | Names under More | Names cut | Picture |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reading | 1 | reading | 0 | 12 | 15 | 17 | 20 | 14 | 12 | shown | 0 | 0 | 0 | [picture](still-picture-00-reading.png) |
| out-1 | 0.833 | reading | 1 | 10 | 12.5 | 17 | 20 | 14 | 10 | shown | 0 | 0 | 0 |  |
| out-2 | 0.694 | middle | 2 | 18 | 15 | 17 | 20 | 14 | 8.3 | shown | 0 | 0 | 2 | [picture](still-picture-02-out-2.png) |
| out-3 | 0.579 | middle | 3 | 15 | 10.6 | 17 | 20 | 14 | 6.9 | shown | 0 | 0 | 3 |  |
| out-4 | 0.482 | middle | 4 | 12 | 7 | 17 | 20 | 14 | 5.8 | shown | 0 | 0 | 35 |  |
| out-5 | 0.402 | far | 5 | 12 | 8.6 | 17 | 20 | 14 | 4.8 | in More | 0 | 0 | 25 | [picture](still-picture-05-out-5.png) |
| out-6 | 0.335 | far | 6 | 12 | 6.6 | 17 | 20 | 14 | 4 | in More | 0 | 0 | 46 |  |
| out-7 | 0.279 | far | 7 | 12 | 5.2 | 17 | 18.4 | 14 | 3.3 | in More | 0 | 0 | 50 |  |
| out-8 | 0.233 | overview | 8 | 12 | 4.3 | 15.3 | 15.3 | 14 | 2.8 | in More | 0 | 0 | 54 | [picture](still-picture-08-out-8.png) |
| out-9 | 0.194 | overview | 9 | 10.7 | 3.6 | 12.8 | 12.8 | 12.8 | 2.3 | in More | 0 | 0 | 55 |  |
| out-10 | 0.162 | overview | 10 | 8.9 | 3 | 10.7 | 10.7 | 10.7 | 1.9 | in More | 0 | 0 | 55 |  |
| out-11 | 0.135 | overview | 10 | 7.4 | 2.5 | 8.9 | 8.9 | 8.9 | 1.6 | in More | 0 | 0 | 55 |  |
| out-12 | 0.112 | overview | 10 | 6.2 | 2.1 | 7.4 | 7.4 | 7.4 | 1.3 | in More | 0 | 0 | 55 |  |
| out-13 | 0.093 | overview | 10 | 5.2 | 1.7 | 6.2 | 6.2 | 6.2 | 1.1 | in More | 0 | 0 | 55 |  |
| out-14 | 0.078 | overview | 10 | 4.3 | 1.4 | 5.1 | 5.1 | 5.1 | 0.9 | in More | 0 | 0 | 55 |  |
| out-15 | 0.065 | overview | 10 | 3.6 | 1.2 | 4.3 | 4.3 | 4.3 | 0.8 | in More | 0 | 0 | 55 |  |
| out-16 | 0.054 | overview | 10 | 3 | 1 | 3.6 | 3.6 | 3.6 | 0.6 | in More | 0 | 0 | 55 |  |
| out-17 | 0.05 | overview | 10 | 2.8 | 0.9 | 3.3 | 3.3 | 3.3 | 0.6 | in More | 0 | 0 | 55 | [picture](still-picture-17-farthest.png) |
| back | 1 | reading | 0 | 12 | 15 | 17 | 20 | 14 | 12 | shown | 0 | 0 | 0 |  |
| in-1 | 1.2 | reading | 0 | 14.4 | 18 | 20.4 | 24 | 16.8 | 14.4 | shown | 0 | 0 | 0 |  |
| in-2 | 1.44 | reading | 0 | 17.3 | 21.6 | 24.5 | 28.8 | 20.2 | 17.3 | shown | 0 | 0 | 0 |  |
| in-3 | 1.728 | close | 0 | 20.7 | 25.9 | 29.4 | 34.6 | 24.2 | 20.7 | shown | 0 | 0 | 0 | [picture](still-picture-21-in-3.png) |
| in-4 | 2.074 | close | 0 | 24.9 | 31.1 | 35.3 | 41.5 | 29 | 24.9 | shown | 0 | 0 | 0 |  |
| in-5 | 2.488 | close | 0 | 29.9 | 37.3 | 42.3 | 49.8 | 34.8 | 29.9 | shown | 0 | 0 | 0 |  |
| in-6 | 2.986 | close | 0 | 35.8 | 44.8 | 50.8 | 59.7 | 41.8 | 35.8 | shown | 0 | 0 | 0 |  |
| in-7 | 3 | close | 0 | 36 | 45 | 51 | 60 | 42 | 36 | shown | 0 | 0 | 0 | [picture](still-picture-25-closest.png) |

## A pinned row, and a phone

[The pinned row](pinned-row-sheet.png) `readPicture` on `still-picture.ts`, enlarged, at the reading band and at the first step of the middle, far and overview bands and at the last step: the highlight grows downward with the name and holds it at every step, and beyond the middle band the row's Pin has gone into More's menu. The ladder spec walks every step out to the camera's least scale and in to its greatest with this row pinned and asserts, at each, the text inside the highlight and the highlight inside its row, no dot over any name, More drawn on every row and no name crossing it, and every wire from the pinned row's offer-dot starting at the dot as drawn.

A phone, 390 × 844, on the payment service: [reading](phone-reading.png), [middle](phone-middle.png), [far](phone-far.png). The one-held-button rule is the phone's too: each row keeps one More, the rest in its menu.

## The frame cost, before and after

The root's instrument (`zoom-perf.cjs`, kept with its wheel copy under [the frame-cost probe](../../../Probes/2026-11-06/frame-cost/README.md); Chrome DevTools Protocol metrics and requestAnimationFrame intervals over 1.2 s after a Zoom Out press, three presses, three tuning variants: the ladder; the resistances at 0 and Name Growth at 1, constant properties; the growing composition), and a copy of it that zooms by five wheel notches instead (an animated zoom, the motion a person makes), on `tests/e2e/still-picture.ts` and the payment service. Before is the untouched bundle at 26a1bb86, after the bundle these pictures come from; both on the same machine, one after the other, with nothing else running. Durations are in seconds.

#### still-picture.ts, wheel zoom out (five notches)

| Variant | Zoom | Band before → after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | LayoutCount | RecalcStyleCount | RecalcStyle s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ladder | 1 | reading → reading | 20 → 30 | 66.1 → 42 | 216.6 → 233.3 | 13 → 11 | 1 → 3 | 27 → 26 | 0.675 → 0.084 | 1.704 → 0.852 |
| ladder | 2 | middle → middle | 22 → 29 | 58.7 → 41.7 | 166.7 → 150 | 10 → 8 | 2 → 8 | 26 → 29 | 0.665 → 0.185 | 2.063 → 1.084 |
| ladder | 3 | far → far | 15 → 24 | 83.6 → 51.5 | 166.8 → 266.6 | 9 → 9 | 1 → 4 | 31 → 32 | 0.692 → 0.108 | 2.554 → 1.292 |
| constantVars | 1 | reading → reading | 48 → 48 | 25.3 → 25.3 | 149.9 → 200.1 | 7 → 7 | 1 → 1 | 39 → 38 | 0.04 → 0.045 | 0.557 → 0.622 |
| constantVars | 2 | middle → middle | 62 → 42 | 19.4 → 28.8 | 166.7 → 183.3 | 2 → 5 | 3 → 2 | 51 → 36 | 0.042 → 0.079 | 0.402 → 0.786 |
| constantVars | 3 | far → far | 64 → 52 | 18.9 → 23.2 | 150 → 200 | 2 → 3 | 2 → 2 | 39 → 49 | 0.03 → 0.049 | 0.33 → 0.576 |
| grow | 1 | reading → reading | 73 → 74 | 16.5 → 16.3 | 33.3 → 16.8 | 1 → 0 | 1 → 3 | 72 → 44 | 0.415 → 0.017 | 0.627 → 0.177 |
| grow | 2 | middle → middle | 72 → 71 | 16.9 → 17 | 33.4 → 33.4 | 3 → 2 | 1 → 5 | 75 → 49 | 0.417 → 0.042 | 0.654 → 0.29 |
| grow | 3 | far → far | 73 → 72 | 16.5 → 16.8 | 16.8 → 33.3 | 0 → 1 | 1 → 5 | 77 → 49 | 0.435 → 0.05 | 0.668 → 0.271 |

#### still-picture.ts, Zoom Out button (the root's instrument)

| Variant | Zoom | Band before → after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | LayoutCount | RecalcStyleCount | RecalcStyle s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ladder | 1 | reading → reading | 66 → 67 | 18.4 → 18 | 116.7 → 66.7 | 3 → 3 | 5 → 11 | 23 → 27 | 0.034 → 0.036 | 0.264 → 0.226 |
| ladder | 2 | middle → middle | 73 → 71 | 16.5 → 17 | 33.3 → 50 | 1 → 1 | 3 → 8 | 8 → 11 | 0.03 → 0.039 | 0.112 → 0.132 |
| ladder | 3 | middle → middle | 63 → 66 | 19.1 → 18.3 | 183.2 → 83.3 | 2 → 2 | 3 → 8 | 23 → 27 | 0.033 → 0.044 | 0.294 → 0.209 |
| constantVars | 1 | reading → reading | 68 → 70 | 17.8 → 17.2 | 99.9 → 66.6 | 2 → 2 | 5 → 7 | 23 → 23 | 0.006 → 0.005 | 0.21 → 0.18 |
| constantVars | 2 | middle → middle | 71 → 71 | 17 → 17 | 50 → 50 | 1 → 1 | 3 → 4 | 8 → 8 | 0.038 → 0.044 | 0.107 → 0.117 |
| constantVars | 3 | middle → middle | 66 → 70 | 18.4 → 17.3 | 133.4 → 66.7 | 1 → 1 | 3 → 4 | 22 → 23 | 0.003 → 0.003 | 0.184 → 0.132 |
| grow | 1 | reading → reading | 73 → 72 | 16.6 → 16.7 | 33.3 → 33.4 | 1 → 2 | 5 → 11 | 23 → 27 | 0.015 → 0.02 | 0.111 → 0.131 |
| grow | 2 | middle → middle | 74 → 73 | 16.2 → 16.6 | 16.8 → 16.8 | 0 → 0 | 4 → 8 | 24 → 27 | 0.016 → 0.018 | 0.093 → 0.097 |
| grow | 3 | middle → middle | 73 → 73 | 16.5 → 16.5 | 16.8 → 16.8 | 0 → 0 | 2 → 8 | 7 → 11 | 0.014 → 0.013 | 0.093 → 0.093 |

#### Payment service, wheel zoom out (five notches)

| Variant | Zoom | Band before → after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | LayoutCount | RecalcStyleCount | RecalcStyle s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ladder | 1 | reading → reading | 61 → 58 | 19.9 → 20.8 | 83.3 → 83.3 | 7 → 7 | 1 → 3 | 77 → 50 | 0.323 → 0.017 | 0.511 → 0.323 |
| ladder | 2 | middle → middle | 64 → 67 | 18.8 → 17.9 | 33.4 → 50 | 9 → 5 | 2 → 9 | 79 → 55 | 0.42 → 0.024 | 0.708 → 0.29 |
| ladder | 3 | far → far | 64 → 65 | 18.9 → 18.5 | 33.4 → 66.6 | 9 → 6 | 1 → 7 | 70 → 46 | 0.362 → 0.034 | 0.725 → 0.372 |
| constantVars | 1 | reading → reading | 62 → 63 | 19.4 → 19.1 | 83.4 → 83.3 | 6 → 6 | 1 → 1 | 39 → 41 | 0.008 → 0.011 | 0.149 → 0.176 |
| constantVars | 2 | middle → middle | 73 → 71 | 16.5 → 17 | 16.8 → 33.4 | 0 → 2 | 3 → 3 | 46 → 48 | 0.017 → 0.01 | 0.13 → 0.166 |
| constantVars | 3 | far → far | 73 → 71 | 16.5 → 17 | 16.8 → 50 | 0 → 1 | 1 → 1 | 35 → 38 | 0.009 → 0.009 | 0.08 → 0.132 |
| grow | 1 | reading → reading | 67 → 69 | 18.1 → 17.5 | 50 → 50 | 6 → 4 | 3 → 5 | 70 → 48 | 0.116 → 0.025 | 0.208 → 0.134 |
| grow | 2 | middle → middle | 74 → 73 | 16.3 → 16.6 | 16.8 → 16.7 | 0 → 0 | 2 → 6 | 67 → 51 | 0.139 → 0.014 | 0.207 → 0.095 |
| grow | 3 | far → far | 73 → 73 | 16.5 → 16.5 | 16.8 → 16.8 | 0 → 0 | 1 → 5 | 71 → 49 | 0.113 → 0.015 | 0.175 → 0.092 |

#### Payment service, Zoom Out button (the root's instrument)

| Variant | Zoom | Band before → after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | LayoutCount | RecalcStyleCount | RecalcStyle s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ladder | 1 | reading → reading | 74 → 74 | 16.4 → 16.4 | 16.8 → 16.8 | 0 → 0 | 5 → 11 | 22 → 27 | 0.008 → 0.006 | 0.065 → 0.072 |
| ladder | 2 | middle → middle | 73 → 73 | 16.4 → 16.5 | 16.8 → 16.8 | 0 → 0 | 3 → 8 | 8 → 11 | 0.007 → 0.005 | 0.063 → 0.044 |
| ladder | 3 | middle → middle | 74 → 73 | 16.2 → 16.5 | 16.8 → 16.8 | 0 → 0 | 2 → 8 | 7 → 11 | 0.006 → 0.008 | 0.047 → 0.044 |
| constantVars | 1 | reading → reading | 74 → 74 | 16.4 → 16.3 | 16.8 → 16.8 | 0 → 0 | 5 → 7 | 23 → 22 | 0.003 → 0.003 | 0.058 → 0.069 |
| constantVars | 2 | middle → middle | 73 → 73 | 16.5 → 16.6 | 16.8 → 16.8 | 0 → 0 | 3 → 4 | 8 → 8 | 0.004 → 0.004 | 0.04 → 0.047 |
| constantVars | 3 | middle → middle | 74 → 73 | 16.4 → 16.5 | 16.8 → 16.8 | 0 → 0 | 2 → 4 | 7 → 7 | 0 → 0.001 | 0.042 → 0.034 |
| grow | 1 | reading → reading | 74 → 73 | 16.4 → 16.4 | 16.8 → 16.8 | 0 → 0 | 5 → 11 | 23 → 26 | 0.006 → 0.005 | 0.057 → 0.053 |
| grow | 2 | middle → middle | 73 → 73 | 16.5 → 16.5 | 16.8 → 16.8 | 0 → 0 | 4 → 8 | 24 → 26 | 0.006 → 0.005 | 0.039 → 0.042 |
| grow | 3 | middle → middle | 73 → 73 | 16.5 → 16.5 | 16.8 → 16.8 | 0 → 0 | 3 → 8 | 23 → 26 | 0.004 → 0.004 | 0.042 → 0.035 |

### What the numbers say

- The per-frame writes were the cost the owner felt: on `still-picture.ts` a wheel zoom spent 0.67 to 0.69 s of its 1.2 s in style recalculation with the ladder, against 0.03 to 0.04 s with constant properties. After, 0.08 to 0.19 s; the frames drawn in the window rose from 20, 22, 15 to 30, 29, 24, and the main thread's task time about halved. The growing composition, which never used the ladder's properties but was invalidated by them every frame, went from 0.42 s of recalculation to 0.02 to 0.05 s.
- Crisp at rest has a price: when the camera stops, the viewport stops being a layer and the whole picture is drawn again at its scale, one frame of about 150 to 270 ms on `still-picture.ts`'s map, a 59-row card among its neighbours (the maximum frame column, after). The constant-properties variant, which had nothing to recalculate before, shows that price alone: 48, 62, 64 frames before, 48, 42, 52 after. Before, the picture was never drawn again, and stayed blurred or aliased.
- A Zoom button press is one jump and was cheap before and after; its numbers barely move. The payment service, a small picture, was smooth before and after.
- While the camera moves, a new step changes what the layer holds (names, dots, wires), so the layer is drawn again once at that step, four times to a doubling.

## What the builder sees, offered for the owner's eye

- The dots stay clear of the names at every step, and the names are no longer jagged far out nor soft close up. Close up, everything grows with the map: the description now reads at its proper size beside the name instead of shrinking to fit more lines.
- More on every row at every band costs the names their room on narrow cards. On `still-picture.ts` beyond the middle band, More holds 17 px on screen while the card is a fraction of its width, and with the names held at their reading size most of them are cut to a few letters (`sco…`, `rea…`; 46 of the card’s 59 rows, Internals included, at the far band’s second step, 54 and then 55 at the overview band). Before this pass the names there were scaled to fit the whole row, the row's buttons having left. The alternatives, for the owner to choose between by eye: names that shrink to fit beside More instead of being cut (the four-fifths floor given up beyond the middle band), More leaving at the overview band, or the cut kept.
- The file's name still gives way to the card's held buttons by its scale rather than by an ellipsis, since cutting it would change the header's line count and so the card's box: at the overview band on `still-picture.ts` it is 4 px against the symbols' 12. Whether the file's name should be cut too, or the card's More stop holding, is open.
- Each step's leap snaps, as the brief asked; the builder took no motion recording, so how the leap reads in a wheel zoom is for the owner to see on the page. An ease would be a short transition on the names', dots' and controls' transforms when `data-step` changes; not built.
- The overview band's own drawing, the collapse of several badges into one expandable one on a phone, and unconnected symbols folding into a count remain unbuilt.

## Verification

On the bundle these pictures come from: `npm run build` and `npm run lint` pass; the unit projects pass, 1,626 tests in 159 files, among them the step module's 12; the browser specs, one worker on the worktree's own server, pass: the ladder, local-map-motion, card-slots and perspective-zoom specs (19 tests), and card-reading, local-map-keyboard, explorer-navigation, layout-lab, local-map-framing, pin-clicks, local-map-row-motion, design-audit, local-map-corset, inspection, local-map-branches, local-map-path and tuning (106 tests). A wider run of 206 tests over 31 spec files, on an earlier bundle of this pass, passed 204: local-map-motion's zoomed pin transition failed because that bundle's wires met the dots' laid-out boxes rather than the dots as drawn, which this bundle corrects, and inspection's keyboard reading journey once found the page blank after its two Back steps, which neither a run of the case alone three times nor the whole inspection spec reproduced on this bundle.
