# Rings: a subject that never moves

_Design probe, 2026-10-01. Root agent: Claude Fable 5.1. The "subject-fixed concentric explanation" proposed in [Turn 3](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-3) and cleared in [Turn 4](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-4) and [Turn 6](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-6), built after the [still-picture deck](still-picture-deck.md) had a scoreboard to judge it on. The rules and predictions below were written before the page existed and are not edited afterwards; what was measured is appended under its own heading. The page itself is disposable, at `AI-Agent-Workspace/tmp/probes/2026-10-01/rings/`, and is never committed. This record decides nothing._

## The idea in one paragraph

The Local Map answers "what does this file touch?" with two columns beside a subject, and the first scoreboard showed what that costs: 5 of 19 cards in frame, the rest stacked off the top and bottom. The Membrane answers "what do these five files touch?" with a treemap bent into columns, and pays 35 cards off frame and wires through cards. Rings keeps the Local Map's cards and its grammar (uses enter on the left, offers leave on the right, blue offers, green uses) and drops the single axis. The subject sits at the center of the frame and never moves: not when a symbol is pinned, not when a card is kept, not when the view zooms. Its providers fill the half-plane to its left and its consumers the half-plane to its right, each on its own ray from the subject, as close to it as the picture allows. Flow is radial: inward on the left, outward on the right, and the left-in right-out rule holds on every card without a wrap. A file two steps away that the person has kept sits further out on its own side. Everything else at two steps is a count on the card it hangs off, not a card.

## The rules, stated so they can fail

1. **The subject is a full card at the center of the frame.** Every move keeps its screen position: pinning a symbol fades what is unrelated and moves nothing; keeping a card reflows the others around the subject; the wheel zooms about the subject's center, not the pointer. Making another card the subject is the only move that changes the center, and it is a history entry.
2. **Sides by role.** A card that the subject uses sits in the left half-plane; a card that uses the subject sits in the right. A kept card that neither uses nor is used by the subject sits on the side of its role toward the cards it does touch (a consumer right, a provider left, neither right). A card that both uses and is used by the subject sits at the top or bottom.
3. **Each card sits on its own ray at the smallest radius that is clear.** Cards are ordered around each side, kept cards nearest the horizontal, the rest by folder so siblings stay adjacent. A card is pushed out along its ray until its box clears the subject's box by a corridor, every placed card's box by a gap, and every placed card's wire to the subject by a margin, and until its own wire to the subject clears every placed box. Wires to the subject therefore cross no card by construction.
4. **A card shows the symbols in play.** A kept card and the subject show every public symbol and the Internals row, as the Local Map does. Any other card shows only the rows that carry a reference to or from the subject, plus Internals, and a count of the symbols it is not showing. Keeping a card shows them all and is the one way to grow the picture.
5. **Every reference between two showing rows is drawn.** That includes references between two neighbors (chords), which the Local Map never draws. A chord whose straight path would cross the subject bows around it through the corridor. Chords are routed, not placed; what they cross is counted and reported, not hidden.
6. **What is not a card is a count.** Each card carries the number of further files it touches that are not drawn. No ring of chips in this cut: at scale 1 and this frame they would sit outside it for this subject, so they would be a claim about the picture that the frame cannot keep.
7. **The address holds the subject, the kept set and the pinned symbol.** Reload returns the same picture; Back returns the previous subject.

What the rules give up, said first: there is no second ring of full cards unless the person keeps them, so a chain three deep is three keeps away, and a subject with many consumers spends the right half-plane and leaves the left empty, which is a true picture of a foundation file and an unbalanced one. The paper deck's rule that a camera "handles it" is refused here: a card the frame cannot hold at scale 1 is off frame and reported, never shrunk.

## The paper play, four cards

The [four-card exercise](../2026-09-30/interaction-game.md#a-tiny-deck): A `app/view` offers `view`, uses `B.total` and `C.rate`; B `app/price` offers `total`, uses `C.rate`; C `shared/tax` offers `rate`; D `shared/invoice` offers `invoice`, uses `C.rate`. Frame six by three units, a full card two by three; a card showing fewer rows is drawn at the height those rows take, about two by one and a fifth for a name and one row.

**A is the subject, nothing kept.** A at the center, two by three, the frame's full height. B and C are providers: left half-plane, stacked, each showing its one row in play (`total`, `rate`) and Internals, at x from -3 to -1, B above C, both in frame. D is two steps away and not kept: not a card; C carries the count "1 more". Wires: B.total to A, C.rate to A, and the chord C.rate to B, because both rows show; it leaves C's right side, which faces A, and must reach B's left side, which faces away, so it curls around B's near corner through the gap between the two cards. Nothing crosses a card. Four facts: three drawn and legible, one not drawn (D uses C.rate), recovered by keeping D or by making C the subject. Journey "which files use C.rate?" (answer A, B, D): one gesture on C's `rate` row; A and B light, D is not there, so 2 of 3 legible; A does not move; not a history entry; the same row again restores everything, error 0.

**Make C the subject** (the recovering move): C stays where it is on screen while A and B, now its consumers, slide to its right, D appears as a third consumer below them, then the whole scene glides until C is centered. Two phases so that the card acted on is the thing that holds still, then the camera moves everything together.

What the paper play claims against the other views: the Local Map's paper row drew the same three cards and could not draw B uses C.rate at all; the Membrane drew two and folded C away. Rings draws the chord and keeps all three in frame, and admits D by a count. If the measurement shows the chord crossing a card or the stack leaving the frame, the rules above are wrong, which is the finding.

## Predictions for the real runs

Same frame as the Explorer's at 1600 by 1000: a 260 px sidebar and a 1340 by 1000 main area. Same scope sets as the deck. The state is "the journey file's subject is the deck's subject, the other four scope files kept", so that every scope file is a full card and every fact in scope has both rows showing. From the bundle's counts: `graph.ts` has 1 provider (`document.ts`) and 17 consumers, with `staticBuilder.ts` two steps away and kept; `PaymentService.cs` has 7 providers and 1 consumer, with `HubProxy.cs` and `PaymentHub.cs` two steps away, `GatewayClient.cs` three, all kept.

| Test | Rings on this repository, `graph.ts` subject | Rings on the estate, `PaymentService.cs` subject |
| --- | --- | --- |
| 1 Legible facts | 11 of 15. All 15 drawn (10 spokes, 5 chords). The right half-plane must hold 18 cards, 3 of them full, and the area says it nearly fits: 15 cards in frame, 3 partly, 1 off (`staticBuilder.ts`, pushed outermost on the right). Off frame 4, covered 0, small 0. Scale 1.00, smallest label 11 px | 3 of 3. 12 cards, all in frame. About 24 wires, since the kept hubs' references to the compact contract cards have both rows showing |
| 2 Occlusion | 1 wire of about 23: the chord from `document.ts` on the left to `staticBuilder.ts` on the far right, which must cross the right half-plane's packed cards | 3 of about 24: the chords from `PaymentHub.cs` and `HubProxy.cs` on the right to the contract cards on the left bow around the subject and clip a card on the way |
| 3 Text faults | 0 and 0 | 0 and 0 |
| 4 Route invariance | 0 of all wires; content coordinates, camera as a transform | 0 |
| 5 Hidden facts | 0 not drawn; 4 off frame, one pan each; the cost line reads "N symbols not shown" over the 14 compact cards | 0 not drawn, 0 off frame |
| 6 Journey, `GraphFile` of `graph.ts` (5 answers) | 1 gesture on a 13 px label; subject moved 0; 5 of 5 answer names legible, all five consumers being ring cards in frame; not a history entry; return error 0 | Journey on `IPaymentService.cs` as the subject: 1 gesture, 13 px; moved 0; 4 of 4 legible; no history entry; return 0 |

If the first prediction holds, Rings shows about three times the Local Map's legible facts on the same five files at the same scale, and the price is one occluded chord and a right half-plane that is full. If the cards do not fit, the finding is that eighteen neighbors at reading size need more than a half-plane of 1340 by 1000, which no arrangement escapes, and the question moves to what the compact card may still drop.

## What was measured

Measured on 2026-10-01 by the instrument of the deck, `tests/e2e/still-picture.ts`, driven by the probe's own spec (`rings.spec.ts` beside the page) over the same scope sets and journeys, at the same frame. The Local Map and Membrane Map rows are the deck's first scoreboard, quoted; the Rings rows are the last run of the day, after the changes listed below. Pictures: [the repository state](rings/repository-rings-state.png), [its journey's answer](rings/repository-rings-journey-answer.png), [the estate state](rings/estate-rings-state.png) and [its journey's answer](rings/estate-rings-journey-answer.png).

### This repository, five files, 15 facts

| View | Legible | Drawn | Off frame | Not drawn | Cards (in frame / partly / all) | Wires | Occluded wires | Routes changed | Journey: gestures, target px, subject moved px, answers legible, return error px |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
| Local Map, `graph.ts` selected | 4 | 10 | 6 | 5 | 5 / 2 / 19 | 70 | 0 | 0 | 1, 13, 0, 2 of 5, 0 |
| Membrane Map, all five pinned | 2 | 15 | 13 | 0 | 7 / 1 / 42 | 207 | 3 | 0 | 2, 7, 742, 0 of 5, 0 |
| Rings, `graph.ts` subject, four kept | 11 | 15 | 4 | 0 | 9 / 5 / 20 | 55 | 0 | 0 | 1, 13, 0, 4 of 5, 0 |

### The estate, five files, 3 facts

| View | Legible | Drawn | Off frame | Not drawn | Cards (in frame / partly / all) | Wires | Occluded wires | Routes changed | Journey: gestures, target px, subject moved px, answers legible, return error px |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
| Local Map, `PaymentService.cs` selected | 0 | 2 | 2 | 1 | 6 / 2 / 9 | 17 | 0 | 0 | 1, 13, 0, 4 of 4, 0 |
| Membrane Map, all five pinned | 0 | 3 | 3 | 0 | 10 / 1 / 20 | 71 | 2 | 0 | 2, 10, 72, 0 of 4, 0 |
| Rings, `PaymentService.cs` subject, four kept | 3 | 3 | 0 | 0 | 12 / 0 / 12 | 14 | 0 | 0 | 1, 13, 0, 4 of 4, 0 |

No label collided and no text was cut off in any run; the smallest label is 11 px at scale 1 everywhere.

### Predictions against measurements

- **Legible facts, drawn and off frame held exactly on the repository**: 11 of 15, 15 drawn, 4 off frame, as predicted; and 3 of 3 on the estate. The subject-fixed numbers held too: the subject moved 0 px when its symbol was pinned and sat 0 px from its start after the unpin, on both bundles, in one gesture on a 13 px label. The Membrane's journey moves the subject 742 px for the same question.
- **Cards in frame missed**: 9 fully in frame and 5 partly against a predicted 15 and 3. Two things cost it: the gaps between cards grew from 16 to 24 px so that a routed wire can pass between them, and the placement spreads cards to the poles, where the frame is only 500 px deep, as soon as the horizontal is taken. The journey's answers followed: 4 of 5 rather than 5, with `emit.ts` placed below the frame.
- **Occlusion was the wrong prediction, twice.** The first measurement read 35 of 55 wires over a foreign card against a predicted 1. The diagnosis was not chords but spokes: the fan around a fixed subject is one lane deep. Once about twelve cards sit around the subject at reading size, a thirteenth has no ray on which a straight wire to the subject's edge misses the cards already placed, whatever its angle or radius. The deck's rule 3, "wires to the subject cross no card by construction", is true only up to that capacity. The final measurement reads 0 of 55 and 0 of 14 because the wires that cannot run straight are now routed through the gaps between cards. On the estate the prediction of 3 occluded chords was wrong in the same direction, and for the same reason it is now 0.
- **The estate's wire count was 14, not about 24**, because rule 5 changed after the first picture (below).

### What the pictures taught, in the order they taught it

1. **Draw chords between kept cards only.** The first picture drew 82 wires on the repository: every consumer of `graph.ts` also uses `document.ts`, so rule 5 as written ("every reference between two showing rows") drew a chord from each compact card to the kept provider on the far side, through the subject. The rule now reads: a wire for every reference between the subject and a card, and for every reference between two kept cards; the rest are counted on the status line ("64 references not shown") and keeping a card is what reveals its chords. This is the Membrane's forty-two-card lesson from the other direction: the picture must not grow because a neighbour happens to share a provider.
2. **A card's angle must be free.** The first layout gave each card a fixed ray, evenly spaced, and failed outright on the four-card synthetic set: a card whose wires go to the subject's upper rows cannot sit on a ray below a card that fills the horizontal. Each card now searches the angles of its side near the one its own wires point at, and takes the clear place nearest the subject in the frame's own shape (a wide frame has more room beside the subject than above it). Cards with no wire to the subject are placed last, since they constrain the others for nothing.
3. **Test the drawn wire, not a fan.** A fan from a card's inner edge to the subject's whole edge blocked everything behind the first card. The placement now samples the curve that will be drawn, row to row, so cards can nest where their wires diverge.
4. **Route what cannot run straight.** A wire whose simple curve would cross any card, including the face of its own card beyond the pin stub, takes the shortest eight-connected path on an 8 px grid around every card, pulled tight and with rounded corners (`route.mjs`). The repository run routes 5 of 55 wires this way, the estate 10 of 14. The price is visible: routed wires share channels and read as cables, and a chord from `PaymentHub.cs` to `IPaymentService.cs` travels under the subject and around two cards to arrive from the left as the grammar requires.
5. **The side labels went.** "uses" and "used by" beside the subject's corners collided with cards; the help text carries the orientation instead. The pins' colours and the sides say the same thing without words.
6. **The address is a query string**, as the Explorer's is, because a hash address let the route test's six pans survive into the journey as the same document: the first journey measured its answers against a panned camera.

### What the eye says, for the owner's eye to overrule

The estate picture is the first still picture of the five-file set in which every fact in scope is legible and nothing is hidden: twelve cards, fourteen wires, the subject in the middle, its seven contracts and data rows to the left, its one configuration consumer and the three kept hubs to the right, and the one chord between them drawn. The repository picture is honest and dense: `document.ts` alone on the left, seventeen consumers filling the right half-plane and spilling off the top and bottom, and from the subject's `LiveDocGraph` pin a trunk of some twenty wires running up and down beside its edge to the cards at the poles, the Local Map's bundle turned through ninety degrees. A foundation file draws a lopsided picture, and that is a true statement about it rather than a fault of the layout, but the empty left half is space the frame had and the picture did not use.

What a still picture cannot show and this record does not claim: the transition when another card becomes the subject (it holds its screen position while the others gather round it, then the camera glides it to the center, two phases of about half a second each), the hover, and the feel of the wheel zooming about the subject. The page is served for looking: `node AI-Agent-Workspace/tmp/probes/2026-10-01/rings/serve.cjs 8882`, then `http://localhost:8882/repository/` and `/estate/`; `build.cjs` rebundles the Explorer's graph projection for it, and the instrument runs with `npx playwright test --config AI-Agent-Workspace/tmp/probes/2026-10-01/rings/playwright.config.ts`.

### Open, and next

- **Capacity is the real finding.** At scale 1 in a 1340 by 1000 frame, about twelve neighbours fit around a fixed subject with straight wires and about fourteen with routed ones; `graph.ts` has eighteen. No arrangement of full cards escapes that count; what can change is what a compact card may still drop (its path and directory are already gone; its pins and the Internals row remain), whether the trunk from one pin should be one drawn cable that fans at the far end, and whether the empty side of a lopsided subject may hold the overflow of the full side with wires that go around.
- **A second ring of names** (the deck's rule 6 counted them instead) would say where the next step leads; it was left out because at this frame it would sit outside it for this subject.
- **The transitions need the owner's eye**, not a number; the journey's numbers only say that nothing moved.
- **If the direction holds**, the ring placement and the router are a layout the Membrane Map's pin-active mode could adopt with its own cards, or the Local Map could adopt in place of its two columns, since the cards, pins and wire grammar are the Local Map's unchanged.


## The owner's reading, 2026-10-01

Read against the pictures above, in [Turn 7](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-7): the deck prices neither the harsh turns of the routed wires, nor cards of one folder sitting together, nor the designs in which moving is part of reading; and by their eye the Local Map is "far more informative about the shapes and connections of classes", the Membrane Map "far more informative about directory collocation/containment and long-distance multi-hop chains", and both have "a real sense of directionality" that the ring loses. On the first lesson above, the 82 wires: "Is that the shape of the software?" It is. Every one of the 27 chords that lesson dropped is a reference in the docs; the rule hid them and the deck charged nothing, because they fall outside the five-file scope. Rule 5 is restored on the page as it was written: every reference between two showing rows is drawn, and the subset is the person's to make by pinning. What that draws, same states, same frame:

| Bundle | Wires | Routed | Cards placed behind others | References not drawn, their rows folded on compact cards |
| --- | ---: | ---: | ---: | ---: |
| This repository | 82 (was 55) | 13 (was 5) | 1 | 37 (was 64) |
| The estate | 38 (was 14) | 31 (was 10) | 3 | 2 (was 26) |

Pictures: [the repository with every reference drawn](rings/repository-rings-all-references.png) and [the estate](rings/estate-rings-all-references.png). What they show that the kept-only pictures hid: on the estate the three hubs use the same six contract files the service uses, so twenty-four chords cross from the right half-plane to the left, and every one has to go around the subject, which sits in the middle of the only road between its providers and its consumers. On the repository the chords from the consumers to `document.ts` box the subject in a frame of cables. A fixed center is an obstacle to every chord by construction. The Local Map never meets the problem because it never draws a chord, which is the same omission, equally unpriced.

The measures the deck lacks, each named with the measure it pulls against, are proposed in the reply of Turn 7 and enter the deck on the owner's yes, with predictions written before any run.
