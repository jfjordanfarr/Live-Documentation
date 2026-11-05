# The card ladder, first pass: three bands of one card

Pictures of the priority ladder the owner asked for on [November 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-9) and agreed to see built ([Turn 10](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)): inside a box that never changes, the zoom picks a band and each band below reading scale lets one tier of the card leave, while names, the node's controls and the anchor dots hold their screen size. Built for the slot composition, under Tuning → 2D Layout → Card Text, with Text Resistance (0.8) and Control Resistance (1) beside it. Taken by the root in a private headless Chromium at 1440 × 960 with the layout's background search off. Implementation evidence for the owner's eye, not a verdict.

## The journey

The same journey on the payment service and on `pathfind.ts` with its two symbol pins: the subject as first framed (the reading band), one zoom step closer (still the reading band), zoom steps out until the map reports the middle band, then the far band, then Reset Zoom.

| Step | Payment service | pathfind.ts |
| --- | --- | --- |
| Reading band, as first framed | [picture](payment-1-reading.png) | [picture](pathfind-1-reading.png) |
| One step closer, reading band | [picture](payment-2-in-one.png) | [picture](pathfind-2-in-one.png) |
| Middle band | [picture](payment-3-middle.png) | [picture](pathfind-3-middle.png) |
| Far band | [picture](payment-4-far.png) | [picture](pathfind-4-far.png) |
| Reset Zoom, reading band again | [picture](payment-5-back.png) | [picture](pathfind-5-back.png) |

## What each band shows

- **Reading** (0.74 to 1.3 of the calibrated reading scale): the slot composition as it is, names, slots of Slot Lines lines, the row's Pin and More, the path, the directory line, the counts.
- **Middle** (0.45 to 0.74): the descriptions, the row controls and the type badges leave; each symbol's name stands centred in the allotment its slot had, drawn larger so that it holds most of its screen size.
- **Far** (0.25 to 0.45): the path, the directory line, the tests chips, the counts and the cycle link leave; of the node's controls only More remains, at its full screen size; the names grow further.
- **One step closer**: a description gains a line inside its fixed slot as the camera comes closer, since its type holds its screen size; nothing else changes.

Hidden parts keep their boxes, so no row and no card changes size in any band, and nothing re-solves on a zoom.

## What was measured

Screen pixels, from the replay that took the pictures; the card's box in the map's own pixels.

| Step | Camera scale | Band | Payment card box | Name height | More button | Anchor dot |
| --- | --- | --- | --- | --- | --- | --- |
| Reading | 1.45 | reading | 440 × 391 | 17.4 px | 29 px | 20.3 px |
| One step closer | 1.74 | reading | 440 × 391 | 20.9 px | 29 px | 20.3 px |
| Middle | 1.007 | middle | 440 × 391 | 16.2 px | 29 px | 20.3 px |
| Far | 0.583 | far | 440 × 391 | 14.5 px | 29 px | 20.3 px |
| Reset Zoom | 1.45 | reading | 440 × 391 | 17.4 px | 29 px | 20.3 px |

The name's screen height follows the resistance: in the reading band it scales with the map (one step closer, 1.2 times), and from the middle band down it keeps ratio to the power of 0.2, so 93 % of its reading height at the middle band's scale and 83 % at the far band's. The More button and the anchor dot keep their screen size at every band (resistance 1). Every card's box, the subject's and its neighbours', is identical at every step; the row's explicit allotment, 32 px plus 17 px per slot line, made the payment card 391 px against 385 before, six pixels the earlier figure in [the composition evidence](../card-composition/README.md) does not have. The [ladder spec](../../../../tests/e2e/card-ladder.spec.ts) holds these promises, and that with both resistances at 0 everything scales with the map.

## What the root sees, offered for the owner's eye

- At the middle band the card is a list of names with even spacing and its three controls at hand; the empty band where the Purpose stood is visible, since its box stays. The file's name grows with the symbols' names.
- At the far band the subject and its neighbours read as name, symbols and one More button each, and the symbol names are the largest text on the map; the wires still end at their dots. The directory bands' labels are map-level text that does not yet follow the ladder.
- Not in this pass: the overview band's own drawing, unconnected symbols folding into a count, wires gathered per file pair, the ladder on the growing composition.

## Verification

The TypeScript build and lint pass on the changed sources; the ladder spec's two cases and the slot spec's four pass on this bundle; the gate for the pass is recorded in [the session record](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-10).
