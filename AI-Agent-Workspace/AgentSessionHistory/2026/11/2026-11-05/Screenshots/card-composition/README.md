# Two card compositions, side by side: descriptions that grow, and fixed slots

Matched pictures for the comparison the owner authorized on [November 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-4), after agreeing that a tap at the overview scale should not switch a card to a larger drawing and re-solve the layout around it ([Turn 3](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-3)), and retaken after the owner's two decisions of [Turn 6](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-6): a card never resizes when the person zooms, and with fixed slots every symbol gets the same allotment, a configurable number of text lines whether text exists or not. Both compositions live in the same bundle behind the Card Text switch under Tuning → 2D Layout, with Slot Lines beside it, so the owner can flip between them on port 8900 with the same subject, pins and camera. Taken by the root in a private headless Chromium at 1440 × 960 with the layout's background search off (`searchStarts: 0`). This is implementation evidence for a judgement the owner has not yet made; the composition not chosen is to be deleted.

## The two compositions

**Grow**, the drawing committed as `ec9a4c62` earlier the same day: a tap on a name opens that description in place, the card takes its reading drawing, larger type, the Uses and Used by row, recorded facts above each description, and the layout re-solves around it with the name held still. Since Turn 6 an outward zoom no longer folds the prose: the card keeps its box and its prose fades to 0.35 below reading scale.

**Slot**, the owner's instinct built for comparison: the card keeps its ordinary type and a fixed 440 px box; the Purpose and every symbol have the same slot, as many lines of 12 px text as Slot Lines says, two by default, filled or not, cut with an ellipsis; a tap or Enter on a name opens the full text in the reader dialog; below reading scale the prose fades; no tap saves a reading choice. `Get` and `Post` have recorded facts but no prose and keep their empty slots, since the allotment is the symbol's, not the text's; their facts stay with the reader. There are no books, since nothing opens in the layout, and the Uses and Used by row stays hidden as in the ordinary drawing.

## Pictures

Each row is one step of the same journey; each cell links one composition's picture. Steps: the subject as first framed; after a tap on a symbol's name (`PaymentService`, or `walk (function)`); two zoom steps out; a tap at that scale.

| Subject and step | Grow | Slot |
| --- | --- | --- |
| Payment service, first framed | [picture](payment-grow-1-reading-scale.png) | [picture](payment-slot-1-reading-scale.png) |
| Payment service, after the tap | [picture](payment-grow-2-after-tap.png) | [picture](payment-slot-2-after-tap.png) |
| Payment service, two steps out | [picture](payment-grow-3-overview.png) | [picture](payment-slot-3-overview.png) |
| Payment service, a tap two steps out | [picture](payment-grow-4-overview-tap.png) | [picture](payment-slot-4-overview-tap.png) |
| pathfind.ts with two symbol pins, first framed | [picture](pathfind-grow-1-reading-scale.png) | [picture](pathfind-slot-1-reading-scale.png) |
| pathfind.ts, after the tap | [picture](pathfind-grow-2-after-tap.png) | [picture](pathfind-slot-2-after-tap.png) |
| pathfind.ts, two steps out | [picture](pathfind-grow-3-overview.png) | [picture](pathfind-slot-3-overview.png) |
| pathfind.ts, a tap two steps out | [picture](pathfind-grow-4-overview-tap.png) | [picture](pathfind-slot-4-overview-tap.png) |

## What was measured

The subject card's box in the map's own pixels, the screen box divided by the camera scale, so that the two compositions compare across their different initial fits (the fit frames the subject card, which is smaller in slot mode, so grow starts at scale 1.25 and slot at 1.45). Slot Lines at its default of two.

| Step | Payment service, grow | Payment service, slot | pathfind.ts, grow | pathfind.ts, slot |
| --- | --- | --- | --- | --- |
| First framed | 520 × 637, read | 440 × 385 | 520 × 628, read | 440 × 498 |
| After the tap | 520 × 545, one folded | 440 × 385, reader open | 520 × 424, one folded | 440 × 498, reader open |
| Two steps out | 520 × 637, prose faded | 440 × 385, prose faded | 520 × 628, prose faded | 440 × 498, prose faded |
| A tap two steps out | 520 × 545, one folded | 440 × 385, reader open | 520 × 424, one folded | 440 × 498, reader open |

Zoom changed no box in either composition. In grow mode a tap folds or opens a description and the box follows, at any scale; in slot mode no step changed any box, the picture did not move under a tap at either scale, and Reset Zoom returned the first picture exactly. The [slot spec](../../../../tests/e2e/card-slots.spec.ts) holds those promises and the [reading spec](../../../../tests/e2e/card-reading.spec.ts) the grow composition's.

Later the same day the ladder's first pass gave every symbol row an explicit allotment of 32 px plus 17 px per slot line, which made the payment card 391 px and the pathfind card 506 px; the figures above are from before that. On [November 6](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) the slot card lost its fixed 440 px width and took the ordinary card's, its slots wrapping at whatever width the names, path and chips give, after the fixed width kept a directory from being framed whole; the pictures here still show the 440 px cards. The allotment with fixed slots, measured on the same cards: every symbol's name stands in a 21 px label row, 4 px above a slot of 41 px at two lines (24 at one, 58 at three), with 4 px to the next name, pinned or not, with or without recorded facts. The first pictures of the day had rows without facts 8 px shorter than rows with hidden facts, which the owner saw as uneven spacing ([Turn 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-5)); the hidden facts had kept a margin meant for the reading card, and it is gone.

## What the root sees, offered for the owner's eye

- The slot card reads as one drawing at every scale. Two steps out, its faded prose still says where text is without asking to be read, and the neighbours' Purposes show the same way, so the overview is the reading picture made small rather than a different picture. The grow card now does the same with its reading drawing, which stays large and faded two steps out.
- With the even allotment the slot card is taller than before: the payment service's three symbols each take 70 px of the card whether they have a description or not, and the card is about twice the folded grow card's height and about three fifths of the read one's, paid always. Slot Lines at one gives a tighter card and cuts the Purpose and most descriptions to a first line.
- The empty slots of `Get` and `Post` are visible space. The owner's further picture ([Turn 7](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-7)) is that at a far enough zoom the names themselves take that space, with the descriptions hidden there, so that type stays legible on screen while the box stays; that is the next increment, not in these pictures.
- The grow card at reading scale shows more at once, the recorded facts and the full prose, at a type size that reads without zooming; the slot card asks the person to zoom in to read 12 px prose and to open the reader for facts and the rest of a cut description.

## Verification

The TypeScript build and lint pass on the changed sources. The slot spec's four cases and the reading spec's rewritten zoom cases pass on this bundle; the full local gate for the pass is recorded in [the session record](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-6).
