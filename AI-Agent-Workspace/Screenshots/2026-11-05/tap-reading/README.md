# Descriptions open on a tap, not on hover

Current implementation evidence for the change the owner asked for on [November 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-1): "text expansion does not occur on hover but instead on tap/click." Taken by the root in a private headless Chromium against the rebuilt bundle, with the layout's background search off (`searchStarts: 0`) so that pictures settle; the payment service of the C# estate sample is the subject, with its descriptions deliberately folded at the start so that every opening below is the tap's doing. Verification status is at the end; this is implementation evidence, not owner acceptance.

## The grammar, in pictures

| Picture | What it shows |
| --- | --- |
| [Folded start](01-folded.png) | The subject at reading scale with every description folded: names, pins and the Uses / Used by controls. |
| [Hover draws nothing](02-hover-draws-no-text.png) | The pointer resting on the `PaymentService` name for 600 ms. No description appears and no card moves: the measured change in the card's name position is 0 px. Hover still highlights the row's wires, as before. |
| [A tap opens the symbol](03-tap-opens-symbol.png) | One click on the name. Its description and recorded facts unfold beneath the row; the book beside it reads as pressed, the name reports `aria-expanded="true"`, and the card's name stayed where it was (0.0004 px). |
| [A second tap keeps the first](04-two-symbols-open.png) | A click on `Post` opens it too; both stay open, the name still unmoved (0.0004 px). A third click on `PaymentService` folds only that one. |
| [The file's name opens everything](05-title-opens-all.png) | One click on `PaymentService.cs`: the Purpose and all three descriptions open, the name reports `aria-expanded="true"` and stays put (0.0001 px). A second click folds them all. |
| [Zoomed out, folded](06-zoomed-out-folded.png) | A wheel zoom out past the overview threshold folds the prose; Reset Zoom restores it. Unchanged from the November 4 behavior. |
| [Phone, folded](07-phone-folded.png) and [phone, a tap opens](08-phone-tap-opens.png) | At 390×844 with a touch pointer, a tap on the name opens its description; the picture is the same grammar. |

Keyboard: focusing a symbol's name and pressing Enter opens its description and leaves the name focused; Enter again folds it. The file's name does the same for the whole card. The More menu of the card offers Inspect, Pin file and Centre, which is where the evidence reader now lives for a card; a symbol's More menu offers Inspect for the symbol.

## What the first candidate got wrong, and the repair

The first rebuilt candidate held the tapped row still through the change, as a pin does. Measured on the payment service, that let the re-solved layout seat the taller card higher and leap the card's name upward by 103 px on the first tap; the row stayed under the pointer, the name did not. For a reading change the eye is on the card, so the repair holds the card's name instead and lets the card grow downward from the tapped row. The measurements above are from the repaired build: the name moves by less than a thousandth of a pixel on a symbol tap, a second symbol tap and the file-name tap.

## Two observations, not changed here

On the touch picture the rows other than the tapped one draw dimmed. A tap raises the same hover highlight a mouse does and nothing clears it until the next touch elsewhere; this is the existing hover highlighting, present before this change, and it is noted here rather than repaired.

At the overview scale a tap does more than open one description: the card leaves its compact overview drawing for its reading drawing, with larger type and the Uses and Used by controls, and grows from 309 × 162 to 433 × 337 px at 0.83 scale (measured on the payment service at 900 × 700 with the search off). The layout re-solves around that larger card and the left column of neighbours changed order, PaymentQuery, PaymentResult, PaymentRequest becoming PaymentRequest, PaymentResult, PaymentQuery; a second tap folds the description and the card returns to its size, but the solve begins from the picture the open made and keeps the new order, with the name held still throughout. A fresh load with the same folded entry draws the original order, so this is the solve's history, not the saved reading. The browser spec asserts what the design promises there, the same cards and a still name, and the composition question is raised in the session's reply.

## Verification

The TypeScript build and lint pass on the changed sources. The [reading browser spec](../../../../tests/e2e/card-reading.spec.ts) was rewritten for taps: open, fold and reopen two symbols with per-state geometry and a still name under both anchor tunings, the overview journey with a tap instead of a hover, inspection from More after a tap, the keyboard journey for a symbol and for the file, the file-name opening and folding everything, and a tapped description surviving a 3D round trip as saved reading; the specs that clicked names to inspect were moved to More → Inspect. The focused run and the full local gate are recorded in [the session record](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-1).
