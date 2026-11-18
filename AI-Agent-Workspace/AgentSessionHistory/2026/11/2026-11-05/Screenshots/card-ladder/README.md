# The card ladder: three bands of one card, and names that take the room

Pictures of the priority ladder the owner asked for on [November 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-9) and agreed to see built ([Turn 10](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)), retaken after [Turn 11](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), when the owner met the growing card on port 8900, and again on [November 6](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) at the ordinary card width, with the row's Pin and More kept through the middle band ("None of the fonts grew at all. The symbols didn't expand to fill the spaces left by the disappearance of the text that they had opened. I didn't see elements go away."): inside a box that never changes, the zoom picks a band, each band below reading scale lets one tier of the card leave, names and the file's name hold their screen size and grow into the room the hidden text leaves, and the node's controls and the anchor dots hold their screen size. Built for the fixed-slot composition, now the Card Text default, with Text Resistance (1), Name Growth (1.5) and Control Resistance (1) beside Slot Lines under Tuning → 2D Layout. Taken by the root in a private headless Chromium at 1440 × 960; the payment and pathfind journeys with the layout's background search off, the still-picture journey as a fresh profile sees the page, nothing seeded. Implementation evidence for the owner's eye, not a verdict.

## The journeys

The payment service and `pathfind.ts` with its two symbol pins: the subject as first framed (the reading band), one zoom step closer (still the reading band), zoom steps out until the map reports the middle band, then the far band, then Reset Zoom.

| Step | Payment service | pathfind.ts |
| --- | --- | --- |
| Reading band, as first framed | [picture](payment-1-reading.png) | [picture](pathfind-1-reading.png) |
| One step closer, reading band | [picture](payment-2-in-one.png) | [picture](pathfind-2-in-one.png) |
| Middle band | [picture](payment-3-middle.png) | [picture](pathfind-3-middle.png) |
| Far band | [picture](payment-4-far.png) | [picture](pathfind-4-far.png) |
| Reset Zoom, reading band again | [picture](payment-5-back.png) | [picture](pathfind-5-back.png) |

The owner's own subject of Turn 11, `tests/e2e/still-picture.ts`, a file of some sixty symbols whose card stands 4,187 px tall, as a fresh browser sees it on port 8900 with no switch touched: [reading](still-picture-default-1-reading.png), [middle](still-picture-default-2-middle.png), [far](still-picture-default-3-far.png), [overview](still-picture-default-4-overview.png), [back](still-picture-default-5-back.png).

## What each band shows

- **Reading** (0.74 to 1.3 of the calibrated reading scale): the slot composition as it is, names, slots of Slot Lines lines, the row's Pin and More, the path, the directory line, the counts; names scale with the map.
- **Middle** (0.45 to 0.74): the descriptions, the type badges, the path, the directory line, the test chips and the counts leave; the row's Pin and More stay, at the map's scale for now; each symbol's name stands centred in the allotment its slot had and grows into the room up to those controls, up to Name Growth times its held size; the file's name grows into the header down to the Purpose's slot, short of the card's three buttons at their held size.
- **Far** (0.25 to 0.45): the row's Pin and More leave, of the node's controls only More remains, at its full screen size, and the cycle link leaves; names grow into the whole row while it has room; the file's name is bound by its width and by More's held size.
- **Overview** (below 0.25): nothing more leaves yet; the names stay as large as their rows allow, which on a two-line slot is about their reading size; the file's name shrinks under More's room. The band's own drawing, the sixth order, is not built.
- **One step closer**: a description gains a line inside its fixed slot as the camera comes closer; nothing else changes.

Hidden parts keep their boxes, so no row and no card changes size in any band, and nothing re-solves on a zoom. The rule for a name below reading scale: its scale is the least of the room measured at render (nine tenths of its row's allotment over its own text, by width and by height) and the zoom's inverse times Name Growth, so a name steps up by half at the middle band's edge and holds that screen size until its row runs out of room.

## What was measured

Screen pixels, from the replays that took the pictures; the card's box in the map's own pixels; the payment card's `PaymentService` row and the pathfind card's `walk (function)` row.

| Step | Camera scale | Band | Payment card box | Name height | File name height | More button | Anchor dot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reading | 1.45 | reading | 371 × 391 | 17.4 px | 21.7 px | 29 px | 20.3 px |
| One step closer | 1.74 | reading | 371 × 391 | 20.9 px | 26.1 px | 29 px | 20.3 px |
| Middle | 1.007 | middle | 371 × 391 | 26.1 px | 25.7 px | 29 px | 20.3 px |
| Far | 0.583 | far | 371 × 391 | 23.1 px | 14.7 px | 29 px | 20.3 px |
| Reset Zoom | 1.45 | reading | 371 × 391 | 17.4 px | 21.7 px | 29 px | 20.3 px |

The pathfind card, 348 × 506, measures the same names but its file name 32.6 px at the middle band and 23.8 at the far: `pathfind.ts` is short, so the buttons' held size leaves it its room, where `PaymentService.cs` is wide and is bound by it. At the far band a name's growth is bound by its text's width over the whole row, so the payment card's `PaymentService` holds 23.1 px and pathfind's `walk (function)` 24.3. On `still-picture.ts` as a fresh profile sees it (reading scale 1.0, the fit of a tall card, a 284 px card): names 12 px at reading, 17.2 at middle (scale 0.694), 13.8 at far (0.402) and 8 at overview (0.233); the file's name 15, 15 (its width leaves it no room beside the three buttons), 8.6 and 3.7; More 20 px throughout, 18.6 at overview; the 284 × 4187 box and every neighbour's unchanged at every step. The overview band's figures are the step ladder's reason: nothing holds there yet. The [ladder spec](../../../../tests/e2e/card-ladder.spec.ts) holds the bands, the constancies, the fill against the rooms the card wrote, the unchanged boxes, and that with the resistances at 0 and Name Growth at 1 everything scales with the map.

## What the root sees, offered for the owner's eye

- At the middle band a card is its file's name and a list of symbol names, the largest text on the map, evenly spaced, with its three controls at hand; the wires still end at their dots. The step up at the band's edge is abrupt, half again in one frame; whether it should ease is the owner's call.
- At the far band the symbol names hold while a wide file name gives way to More: on the payment card the symbols are larger than the file's name there, and on the narrow still-picture card the file's name cannot grow at all beside its three buttons. Name Growth at 1 removes the growth and keeps the file's name the largest; the lever is there to find the balance by eye. The owner's November 6 findings on these pictures, the dots over the names, the highlight the text leaves, a scale-invariant More per row, clamps, and breakpoints in place of per-frame scaling, are the next pass.
- The empty band where the Purpose stood, and the path's and directory line's, is visible at the middle band, since every box stays; the file's name grows into it on cards whose name is short enough.
- Not in this pass: the overview band's own drawing, unconnected symbols folding into a count, wires gathered per file pair, the directory bands' labels following the ladder, the ladder on the growing composition.

## Verification

The TypeScript build and lint pass on the changed sources; the ladder spec's two cases, the slot spec's four, the Tuning spec's three and the 3D wrapper spec's three pass on this bundle (12 in 1.3 minutes); the gate for the pass is recorded in [the session record](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-11).
