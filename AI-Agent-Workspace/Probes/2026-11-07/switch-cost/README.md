# Probe: the cost of the 2D and 3D switches under force-graph-focus.spec.ts:70

_Status: an instrument of 2026-11-07 with its numbers. It is a Playwright spec that uses the browser suite's own observation helper (`tests/e2e/force-graph-observation.ts`), so it runs from inside the suite's tree: copy it to `tests/e2e/_probe/`, run `NODE_PATH=$PWD/node_modules npx playwright test --config tests/e2e/playwright.config.ts _probe/switch-cost` from the repository root, and remove the folder afterwards, since the suite would otherwise run it. It needs the bundle built first (`npm run live-docs:visualize`); the config serves it on 8766, and `LIVE_DOCS_E2E_PORT` points it at another build served on another port._

`switch-cost.spec.ts` walks the steps of the suite's case "a focused URL centers its node, direct clicks pin it, and More opens its details" with the clock on each: the focused load of the repository's 3D picture, the click on the sphere, Inspect and Centre, the press of 2D until the call returns and until the focus card shows, the press of 3D until the call returns and until the focus is centred. A press returns when the page's main thread has run its handler, so the two "click returned" laps are the switches' synchronous cost. It prints one `SWITCH-COST` line.

## The numbers of November 7

The case ran at 29.7 s in the gate over the 3D shells' third round and timed out at 31.9 s in the gate over that round with the root's two changes and the 2D column clearance; its budget is the suite's default 30 s. The question was whether the round had made a switch dearer. Two builds, each measured twice, alone on the machine, headless Chromium at about four frames a second that day:

| Build | 2D press returned | 3D press returned | Whole case |
| --- | --- | --- | --- |
| The branch head `343c3ef6`, without the third round | 10.2 s, 10.7 s | 15.2 s, 15.7 s | 31.1 s, 32.4 s |
| The working tree: the third round, the root's changes, the clearance | 10.5 s, 9.9 s | 15.2 s, 14.9 s | 31.9 s, 30.9 s |

The round added nothing: the two switches cost the same on both builds, and together more than the case's budget on this machine today. The profile of November 5 had measured the same two blocks at 8 and 11 s and named them a product cost in `perspectiveTransition.ts`, a freeze a person sees too; the case passed alone at 25.3 s that day and failed in that day's gate at 34 s. The cause to fix is the switch's synchronous work, not the budget.

## Where the time went, and the fix (November 7 to 8, a builder's milestone)

A second instrument stands beside the first: [`switch-breakdown.spec.ts`](switch-breakdown.spec.ts), run the same way, presses 2D and then 3D on the focus case's picture (this repository's 3D map on `graph.ts`, no click on the sphere) and on the whole repository (the Whole toggle, pressed after twenty seconds, since that picture settles for minutes here), and prints the page's own `live-docs:` measures around each press. The measures are the product's since this round (`live-docs:switch-capture`, `-hold`, `-render`, `-capture-destination`, `-animation-setup`, `-press`, and inside the capture `live-docs:capture-cards`, `-wires`, `-directories`, `-copies`), so the numbers before are those of the round's base with only the measures added, served on 8914, and the numbers after are the fixed bundle on 8911, all under the machine's browser lock, headless Chromium at 1440 × 960 by the suite's default. The machine was busier this night than on November 7 (other builders' suites between runs), so a figure is worth comparing within one row, not across days.

### Before: the focus case's picture (41 cards, 168 wires, 20 directory bands, 8,081 elements in the 2D map)

| Press | The press's task | Capture: cards' copies | wires' sampling | directory shells | Hold: the source surface copied | The destination's render | The press's handler alone |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2D (3D to 2D) | 9.6 s | 4.3 s | 2.6 s | 0.45 s | 0.05 s (a copy of the 3D view, never seen) | 1.4 s, the 2D map's own | 1.5 s; the capture of the map just drawn ran in its microtask |
| 3D (2D to 3D) | 14.2 s | 4.0 s | 2.4 s | 0.42 s | 5.2 s (a copy of the whole 2D map, every computed property of 8,081 elements) | 0.02 s | the whole task |

On the whole repository (54 cards, 168 wires, 20 bands) the same parts: 2D, capture 7.7 s (cards 4.9, wires 2.3, shells 0.5) and the 2D map's render 1.3 s; 3D, capture 7.5 s and hold 6.4 s, a task of 15.8 s. The first probe on that build: 2D press returned 16.3 s, 3D 21.4 s, the case 45.1 s.

So the time was the transition's own work, not the views': each card was copied with every computed property of every element (about 100 ms a card, and every card of the map, most outside the frame), each wire sampled by up to 257 calls of `getPointAtLength` (about 15 ms a wire), and the hold copied the whole source surface again, on the way to 2D a copy that was never painted, since the 2D map is ready at once and the cover went in the same task.

### The fix

In `perspectiveTransition.ts` and `perspectiveGeometry.ts`, the transition's look and its 1.4 s unchanged:

1. The hold keeps the source surface itself drawn over the destination (`perspective-held` in `local.css`), its size and border kept, released at once; an inactive view is laid out and drawn already, only transparent. 5.2 s and 6.4 s to 0.
2. The capture copies only the cards whose boxes meet the transition's frame (2 of 41 here, 3 of 54 on the whole repository), since a card is drawn only inside its own box while it folds; inside a copied card and a shell's outline and label, a block box that stays outside the frame (grown by 64 px) all the way to the card's title, toward which the card shrinks, is copied without its contents. Every card's token and name still travel; every wire and shell is still captured (an off-frame band as an empty box of its size).
3. The wires' samples are read from their path data, which the 2D map writes as M, L, C and Q, flattened finely enough to agree with the browser's within a small fraction of a pixel. 2.4 to 2.6 s to 0.03 to 0.09 s.
4. The cards' copies that remain are made in slices of 16 ms, each a task of its own, while the source picture is held still, and the transition starts when the destination has drawn and the copies are done; on the way to 2D the 3D picture is held while the map's cards are copied, and the map takes no input meanwhile.

A review by a second agent of this diff found five faults in the first version of it, all mended: a tall card's rows below the frame shrink into it while the card folds (hence the title in point 2); a stale press could release a newer hold (holds are now counted and released once, and an abandoned capture is cancelled); the held 2D map grew into its zoom controls' room; the release faded for 0.4 s; and a click could reach the 2D map while its cards were copied.

### After: the fixed bundle, twice (8911)

| Run | Picture | 2D: the press's task | of which the 2D map's render | 3D: the press's task | Copies, in slices, until the transition starts |
| --- | --- | --- | --- | --- | --- |
| 1 | focus | 1.27 s | 1.23 s | 0.23 s | 2.0 s on the way to 2D, 1.7 s on the way to 3D |
| 2 | focus | 1.08 s | 1.04 s | 0.16 s | 1.6 s, 1.3 s |
| 1 | whole | 2.16 s | 2.09 s | 0.46 s | 2.9 s, not printed |
| 2 | whole | 2.25 s | 2.17 s | 0.26 s | 2.4 s, 2.3 s |

The switch's own work in a press is now 40 to 230 ms on the focus case's picture (the capture's places, wires and shells and the first slice of the copies); what remains of a 2D press is the 2D map's own render of the picture, 1.0 to 2.2 s here, which any arrival in 2D pays and which this round did not touch (it is the 2D map's frame cost, the next round's question). The copies take 1.3 to 2.9 s of wall time on this machine because the 3D picture's software renderer draws a frame between slices in a few hundred milliseconds; their own work is some 0.35 s. The first probe on the fixed bundle, twice: 2D press returned 5.4 s and 3.0 s, 3D 4.7 s and 3.8 s, the case 22.9 s and 15.5 s, against 45.1 s on the base the same night; a Playwright click's return also waits for the page's frames, which is why it reads longer than the press's task.

The regression is the case "the 2D and 3D presses return at once, and the transition still folds the cards, peels the membranes and carries the names" in `tests/e2e/force-graph-focus.spec.ts`: it times each press in the page and requires the switch's own part under 0.5 s (the 2D map's render, as the page measures it, left out), the longest wait of a 20 ms timer from the press's return until the transition's layer goes under 1 s (its longest 0.19 to 0.32 s on the fixed bundle, a frame of the 3D picture's software renderer; the switch's own part of a press 0.2 to 0.3 s over two runs), the layer shown, the focus's travelling name, the directory membranes and the cards folding. On the base with measures it fails at the 2D press: 11.1 s, of which 1.2 s the 2D map's render.

## Corrections with the header round (November 8)

The frames of the transition, before and after, are in [switch motion](../../../Screenshots/2026-11-08/switch-motion/README.md), taken by [`motion-frames.cjs`](motion-frames.cjs) with the page's animation time frozen at each frame. At the same times they show the same picture.

The header round's specs and a review of its diff brought these corrections to the switch:

- **A cover takes the pointer.** A transparent cover over the views' room takes the pointer while a picture is held.
- **Keys, not inert.** The 2D map's keys are held back while its cards are copied, in place of making it inert, which recomputed the style of all its elements twice.
- **No copies under reduced motion.** Under reduced motion no card is copied. The switch had waited on copies no transition would draw, and swallowed the keys meanwhile (`local-map-branches.spec.ts:186`).
- **Copies record the live picture's interactivity.** A copy read in slices is read after its view was made inactive, so it records the live picture's `interactivity` rather than the view's inertness (`perspective-zoom.spec.ts:53`).
- **Adaptive slices.** A slice of the copying is as long as the page was away since the last one, between 16 and 100 ms. Slices of 16 ms between the 3D picture's software frames of a few hundred milliseconds had kept the copying to a twentieth of the time, and the transition waiting more than 5 s (`force-graph-shells.spec.ts:345`, `perspective-zoom.spec.ts:250`).

The regression gained a check on the clock: the transition's first frame within 400 ms of its start. Before the fix it came 4.6 s late on the way to 2D; after, 83 to 179 ms over three runs.

The regression's readings after the corrections, on the focus case's picture, over three runs:

| Press | Press took | Of which the 2D map's render | Longest wait of a 20 ms timer after it |
| --- | --- | --- | --- |
| 2D | 1.24 to 1.30 s | 1.02 to 1.06 s | 0.23 to 0.28 s |
| 3D | 0.24 to 0.39 s | 0.02 s | 0.26 to 0.41 s |
