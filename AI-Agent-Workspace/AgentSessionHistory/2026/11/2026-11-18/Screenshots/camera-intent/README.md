# The camera's intent: a step's reveal, and Tuning's Arrival

_Historical evidence, taken in the night of 2026-11-18 to 19 by the builder of the camera-intent round, on the branch `camera-intent-on-main` (main at `534f76e0` with the round's change); the "main" pictures are main at `534f76e0` itself. The design is in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md) and the step's rule in [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md)._

**The setup.** This repository's Explorer and the estate sample, built by `npm run build`, `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`, served on port 8790, Chromium at 1440 × 900, device scale 1, the continuing search off (`searchStarts: 0`) so that the picture is the first one drawn. Arrival was chosen through the saved tuning; a link carries it the same way (below).

## A step: the owner's case, a cell under `live-docs/history` on `pathfind.ts`

| Picture | What I see |
| --- | --- |
| `cell-press-codec-before.png` | The reading look at `pathfind.ts`. At the right, `…ages/engine/src/live-docs/history` draws its 23 hidden files as two rows of cells under its name; the pointer is on the first, `codec.ts`. |
| `cell-press-codec-after-main.png` | **Main, after the press.** The `history` handle is held where it was, its first card `format.ts` under it, and `codec.ts`, the file just pinned, is nowhere on screen: the layout put it past the right edge (its card at x 1,525 to 1,849 in a frame ending at 1,440). The left two thirds of the view are empty. This is "I quickly lose it". |
| `cell-press-codec-after-mark.png` | **This round, about a third of a second after the picture settled.** The camera has panned, at the same scale, until `codec.ts`'s card stands wholly in view at the right; its outline is drawn in the selection blue, a 3 px ring a little outside the card's own violet test-backed border. `format.ts` and `shape.ts` are at the left. The `history` handle has gone off the top: the card and the handle could not both be in view at this scale, and the newcomer wins. |
| `cell-press-codec-after.png` | The same, a moment later: the ring has faded and the card wears its own border. |
| `cell-press-shape-after-main.png` | **Main**, the sixteenth cell, `shape.ts`, whose card is taller than the view at this scale: the handle held, and below it nothing of `shape.ts` but the top of a membrane at the very bottom edge. |
| `cell-press-shape-after.png` | **This round**: `shape.ts` is entered at its top, its name row at the top of the view and as much of the card as the view holds below it; `codec.ts` beside it. |

Measured on this round's build: the first cell's card wholly inside the frame, the sixteenth's top at the frame's top; on main, both outside (`tests/e2e/camera-intent.spec.ts`, the first case, fails on main).

## An arrival: Reading, Then Neighbours

Six frames of a screencast across the hold and the ease, picked by time from the camera's own scale sampled every few milliseconds: at rest at reading size, mid-hold, the hold's end, a third and two thirds into the ease, and the end. A screencast sends a frame only when the picture changes, so the hold's frames repeat the first.

| Picture | What I see |
| --- | --- |
| `arrival-strip-repo-pathfind.png` | `pathfind.ts`. Frames 1 to 3: the card at reading size, centred, its neighbours cut at both edges, as today's arrival leaves it (frame 1 is still the page's own fade-in). Frame 4, a third into the ease: scale 0.67, the card shrinking about its own middle, `graph.ts` coming in at the left and the `history` directory at the right. Frames 5 and 6: the connections look at scale 0.335, the floor (the connections look's sixth press): `pathfind.ts` centred, `document.ts` and `graph.ts` at the left, the history, client and panels directories and `emit.ts` at the right, every name legible; the neighbours above and below are cut, as the rule says when they do not all fit. The hold measured 1,056 ms from the samples and the ease 1,029 ms to the first sample at rest, longer than the 700 ms written because this picture's frames are slow to draw. |
| `arrival-strip-estate-payments-context.png` | `PaymentsContext.cs`. Frames 1 to 3: the card at its reading scale, 1.45, its neighbours cut. Frame 4: scale 1.23, the first of the ease. Frame 5: 0.66, the look changing to connections. Frame 6: scale 0.59, the whole neighbourhood: `PaymentService` with `App.config`, `…ervice/Data` with `PostPaymentRow.cs` and `Payment.cs`, `…/SqlServer` with the stored procedure, `PaymentService.cs` at the right, and the subject in the middle with its blue ring. Hold 940 ms, ease 688 ms. |
| `arrival-repo-pathfind-frame-1.png`, `…-frame-6.png`; `arrival-estate-payments-context-frame-1.png`, `…-frame-6.png` | The first and last frames of each strip at full size. |

**Is the pull back jarring?** On the estate it reads as a camera stepping back: the subject shrinks and slides from the middle to a little right of it while its neighbours arrive around it, and nothing jumps; the change of look (reading to connections, the names re-held at their look's size) happens during the ease and is the one moment where text visibly changes size under motion. On this repository it reads as a straight zoom out about the subject, which stays centred throughout, and the ease is smooth but slow-feeling because the frames are heavy. Neither is a jolt; whether the hold of about a second is too long or too short, and whether the end should be the default, is for the owner's eye.

## The lever's address

Tuning → 2D Layout → **Arrival**: Reading Size (the default), Reading, Then Neighbours, Neighbours. A link carries a choice other than Reading Size as the other 2D levers are carried: in the `s=` snapshot's layout settings (`layout.localMap.arrival`, `"then-neighbours"` or `"neighbours"`), which the page writes into its own address after the next exploration change with the lever set, and which a fresh browser opens in that choice. Links made for testers:

- `pathfind.ts`, Reading, Then Neighbours: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkRMAnEgSzGyhABcALAUwDsBaZx8gc3oCNUAriQDOIAL5j4zGvkzoA1pi6NhAehZdyHVcJLpVCSo1YATDGtkMAZlpMA6WqPiFIAbVDTIIWQqUr1zJrauvqGYMZm6BaY1rYOTiCiXgBU4gC6YkA`
- the estate's `PaymentsContext.cs`, Reading, Then Neighbours: `/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkRMAnEgSzGyhABcALAUwDsBaZx8gc3oCNUAriQDOIAL5j4zGgAVMATwC2LWgGVGJMOXSMA9ABFMtTLrlKVwgMKpmtRgA9aAOnSj4hSAG1Q0yCDPKtuqa2nqGxqYKgbRWNnaOLm4gon4AVOIAumJAA`
- the same, Neighbours: `/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkRMAnEgSzGyhADsBTcgcwAsAjVAVxIGcQBffvFo0ACpgCeAW3q0ALgGV6JMOXT0A9ABFMczBvHTZcngGFU8+gA85AOnR94hSAG1QIyCEMz5SlWs0dPQNJHxNzSxt7RxA+TwAqAQBdfiA`

The plain address `?view=local&node=…` carries no tuning, as for every other lever.

## The browser cases

`tests/e2e/camera-intent.spec.ts`, seven cases, all passing on this round's build. On main at `534f76e0` (the lever's type and the floor's ratio written into a copy of the spec, since main has neither) six fail and one passes: a cell's press (the card is not marked, and is out of view, measured separately above), the default arrival (main has no Arrival control to read), Reading, Then Neighbours on either picture (the camera stays at reading size), reduced motion (the same) and the link (the same). The case that passes on main, an input during the hold ending the arrival, cannot fail there, since main never eases back.
