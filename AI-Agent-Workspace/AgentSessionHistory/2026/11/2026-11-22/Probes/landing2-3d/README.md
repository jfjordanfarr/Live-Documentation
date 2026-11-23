# The second landing's three 3D failures: what was measured

**Historical evidence, 2026-11-22, about 21:55 to 22:10 UTC.** Taken by a builder on the day branch at `a503db4d9` with its bundles rebuilt, one worker, each run a hold of the browser lane on its own. The probes were lines added to the two specs and removed again; nothing of them is committed but this page and the two traces beside it.

## 1. `force-graph-discovery.spec.ts`, "the largest group grows from its seed"

**Does today's picture rest at all? Yes, in 2,863 substeps**, the same number on two runs and 2,866 on a third (373 spheres, wrappers off, two hops).

| Run | Start (the archipelago enters) | Growth (the largest group from its seed) |
| --- | --- | --- |
| Bound lifted to 20,000 substeps | 49 substeps | at rest in 2,863 substeps, 1,447 frames, 25.2 s |
| The spec whole, with a larger bound | 48 substeps | at rest in 2,863 substeps, 1,448 frames, 27.9 s |
| Traced, a reading every ten substeps or so | | at rest in 2,866 substeps |
| Traced, today's two new files dropped from the data served | | at rest in 2,866 substeps: the same; the two files stand outside the two hops this picture shows, and dropping them changed nothing ([its trace](trace-two-fewer.txt)) |

For comparison: 1,319 on 2026-11-13, when the bound of 2,700 was written as twice that; 1,875 with one file and not at rest after 2,702 without it on 2026-11-16; about 5,250 on 2026-11-19, by the case's Live Doc; 1,925 on the first landing this afternoon; stopped at the bound, 2,703 and 2,705, on the second.

### What one file tips between

Not two states of the simulation. One long, slow tail, and a threshold it sits on.

[The trace of today's growth](trace-today.txt) reads every sphere's place about every ten substeps and gives the largest move a substep as a share of the picture's diagonal:

- By 880 substeps the picture has calmed: the last reading above one ten-thousandth of the diagonal a substep is at 878.
- **From there to rest at 2,866, two thirds of the whole settle, the largest move stays between 1.3 and 10 hundred-thousandths of the diagonal**, a median of 3.6, with one brief stir (one file, `rust.ts`, up to 17 at 2,174 to 2,206). Of the 177 readings in that stretch 55 are at or under 3. In 99 of them the sphere moving most is the same file, `tests/page-scan/fixtures.ts`, gliding.
- The motion is said to be at rest when the largest move of a tick has stayed at or under 3 hundred-thousandths of the diagonal for ten ticks in a row (`STILL_FRACTION`, `QUIET_TICKS`). The tail's speed is that number, give or take a factor of two, for two thousand substeps.

So when rest is said is when a glide that hovers at the threshold first holds under it ten ticks running. A file more or less changes the glide's speed by a few tens of per cent, and that moves the crossing by a thousand substeps either way: 1,875 or more than 2,702 on November 16; 1,925 or 2,863 today. Through that stretch the picture itself hardly changes: its diagonal grows by seven units in 2,500 after substep 500. (The probe's measure is a substep's, averaged over some ten; the rule's is a tick's, so the two numbers are near, not the same.)

This is the rule the Explorer design already describes under Rest ("It does not know a lull from a balance"): the settle's length in substeps is a property of the simulation's slow tail against its stillness threshold, and it wants more than this round. What would shorten the tail is the forces' matter (the Settle Hold trial of 2026-11-19 was built for it and is off by default); what would make the count steady is a rule of rest that does not sit on the tail's own speed.

### What the case can honestly hold meanwhile

The count of substeps to rest, held to a number of one day, measures where a hovering tail happens to cross a line; it will go on tripping as files are added, in either direction. Two things are steady in the trace and could be held:

- **That the picture calms**: the largest move a substep under a ten-thousandth of the diagonal within a stated count (today by 880 substeps). That is the bulk of the settle, and a picture that does not come to rest fails it.
- **That it is then said to be at rest at all**, under a bound far above the tail, stated from the picture's size.

The first needs the page to say the motion's largest move, as it says its substeps; the probe read it from every sphere's place, which costs a tenth of a second a reading. It was not built this round.

**What was done: nothing; the case stands as merged and is red by its bound.** A restatement of the two bounds from the picture's own size was written and run (2.5 substeps a sphere for the start and 16 for the growth, about twice the most measured, 1.1 and 7.7; 360 and 5,968 for today's picture; the spec's three cases passed with it) and was taken out again uncommitted. The settle's length does not follow the picture's size, as the trace shows, so a bound a sphere states nothing true; and [the case's own Live Doc](../../../../../../../.mdmd/layer-4/tests/e2e/force-graph-discovery.spec.ts.mdmd.md) already holds, from 2026-11-19 when the same settle took about 5,250 substeps, that "the bound is the measure of that fault, not to be raised".

## 2. `force-graph-focus.spec.ts`, "a focused URL centers its node, direct clicks pin it, and More opens its details"

Failed once, at two workers in the landing, waiting for graph.ts's More while the actions shown were those of the shell of `packages/explorer`. **Not reproduced**: it passed alone in root's run and twice here; and with the page's processor slowed four times the actions offered stayed graph.ts's for the twelve seconds read (that run then ran out of the case's own 30 s on the probe's waiting, so it is a reading and not a pass).

What was measured alone:

- The click arrives as a move, a press and a release at one place (fractional pixels); in the twelve seconds after it the map received no other pointer event.
- **The pin begins no building.** graph.ts is already the subject, so pinning it changes nothing of what is shown; `data-building` stayed absent while `aria-busy` stayed true for five seconds after the click (slowed four times). A press counts as the pointer's own move, so from then on the still pointer may hover.
- In every run here the actions offered stayed graph.ts's.

What that leaves, unproven: by the hover's rule, what stands under a still pointer once the dwell is reached is rested on, so a body that slides under the pointer while the picture settles would take the offered actions from the pinned file. The landing's page is consistent with that and no run here showed it. Nothing was changed for this case.

## 3. `force-graph-focus.spec.ts`, "the 2D and 3D presses return at once"

The 3D press's 503.0 and 503.3 ms were not a timer. Three more readings, alone:

| Run | `toGraph.returned` | What else |
| --- | --- | --- |
| Plain | 467 ms | the case failed on the transition's first frame instead, 417 ms against 400 |
| With the browser's profiler on | 596 ms | within the press 414 ms, of which **266 ms in one `getBoundingClientRect`** called from the press's own lines |
| Profiler on, Wire Answers off | 537 ms | within the press 324 ms, of which 193 ms in the same call |

The page's own measures for the plain run: the whole press 312 ms, of which the capture of the 2D scene 64 ms, the hold 0.3 ms and the 3D map's render with the reveal 40 ms; about 200 ms fall after the render and before the press's end. The profile puts them in a forced layout: `changePerspective` in `packages/explorer/src/client/index.ts` reads a view's box directly in two places, once before anything changes and once after the views have been switched and the destination rendered, and the browser lays the page out to answer. Which of the two pays was not separated. Between the press's end and the reading, the first slice of the cards' copies (99 ms under the profiler) and the destination's capture run.

So the press does real work at the edge of its bound of 500 ms, 467 to 503 without the profiler, and most of it is one layout of the page. The 3D client's own share, its render, is 35 to 45 ms. Turning Wire Answers off did not remove the layout. Whether the press was this long before today was not measured: the first landing did not reach these lines, and yesterday's `main` was not built.

**Nothing was changed for this case.** The cause lies in the perspective change in `index.ts`, which another builder holds this round.

## 4. What the second case now says when it fails (added about 22:30 UTC)

No cause was found for the More that was not found, so nothing was mended; the case was made to say what would have had to be captured. Before it presses "More actions for graph.ts" it waits, in the case's own time as the press waited before, until any actions are offered, and then holds in one look that they are graph.ts's (`expectActionsOf` in `tests/e2e/force-graph-observation.ts`). It adds no wait of its own and no second try, and it cannot pass where the case failed: another body's actions fail it at once.

Seen red by a made fault, the pointer taken to rest on a directory shell's skin after the click and before the look (lines added for the run and removed):

> the actions offered should be those of packages/engine/src/live-docs/graph.ts; they are: "Actions for the shell of scripts/layout-lab" (shell:scripts/layout-lab). A press at the pointer's place (719.5, 83.5) would take hold of: shell:scripts/layout-lab. The map does not say it is building; aria-busy is false; its motion has run 433 substeps

It failed in 17.5 s where the landing's failure took the case's whole thirty. Without the fault the case passed alone (22.7 s).

The same press is made the same blind way in two more places of `force-graph-focus.spec.ts`, both on the estate sample after its picture is held at rest, and both left as they are: "mouse Unpin releases hover attention" presses "Unpin PaymentResultModel.cs" straight after moving the pointer to the sphere, and "keyboard More keeps its sphere's controls available" holds "More actions for PaymentResultModel.cs" visible by its name and then focuses "Pin PaymentResultModel.cs". The two later places that reach Pin by name first hold the actions' `data-node-id`. `force-graph-discovery.spec.ts` presses no body's action.

## 5. Did the day slow the press of 3D and the transition's first frame? (23:36 to 00:01 UTC)

**Yes, both are today's; neither stood at its bound yesterday.** The press case alone, one worker, on yesterday's `main` (`76cd9914c`) and on the day branch's tip (`0c5a66ec9`), each built in a checkout of its own, run turn and turn about; then one build's data served to the other's code, three steps of the day built between them, and today's build with two of the day's new defaults put back. Milliseconds, the range and the median; every run is in [the table](press-yesterday-and-today.tsv) with the load beside it.

| Build | Runs | Press of 3D returned (bound 500) | Press of 2D less its render (500) | First frame to 3D (400) | First frame to 2D (400) | The page's own measure of the 3D press | Elements under `#view-map` at the press of 3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Yesterday's `main` | 7 | 398 to 627, **419** | 280 to 387, 311 | 277 to 426, **300** | 269 to 484, 302 | 250 to 458, 274 | 13,781 |
| Today's tip | 7 | 413 to 584, **496** | 354 to 456, 383 | 346 to 467, **385** | 358 to 466, 375 | 268 to 413, 335 | 14,810 |
| Yesterday's code, today's data | 3 | 413 to 438, 419 | 302 to 338, 318 | 328 to 342, 335 | 302 to 325, 311 | 263 to 274, 270 | 14,576 |
| Today's code, yesterday's data | 3 | 458 to 471, 462 | 317 to 425, 403 | 292 to 331, 315 | 329 to 332, 329 | 308 to 321, 311 | 13,994 |
| `4d9ebbfae`, 04:39, the 3D budget of 2,048 | 3 | 409 to 461, 418 | 286 to 335, 325 | 319 to 348, 338 | 301 to 324, 321 | 264 to 293, 270 | 14,024 |
| `22b74e21b`, the step before the arrival's merge | 4 | 420 to 459, 429 | 281 to 388, 305 | 332 to 379, 352 | 315 to 344, 327 | 274 to 306, 278 | 14,570 |
| `15f4d689c`, the arrival made the default | 4 | 484 to 593, 535 | 300 to 359, 329 | 713 to 827, 764 | 358 to 432, 403 | 319 to 397, 360 | 14,529 |
| Today's tip, Wire Answers off | 3 | 477 to 497, 491 | 357 to 376, 367 | 361 to 409, 376 | 389 to 410, 399 | 324 to 331, 326 | 14,577 |
| Today's tip, Arrival and Arrival Waits as yesterday | 3 | 472 to 521, 480 | 377 to 589, 403 | 364 to 513, 374 | 377 to 508, 406 | 319 to 358, 326 | 14,810 |

The case failed two times of seven on yesterday's build (once on the first frame to 2D at 419, once with every number high, the press at 627) and four of seven on today's.

**The press of 3D: the code, about 45 to 75 ms, and not the picture.** Yesterday's code returns in 419 with either day's data; today's code in 462 with yesterday's data and 496 with its own, and the two swapped sets do not overlap (413 to 438 against 458 to 471). It is in the day's last five merges that touch the page: 418 at 04:39 and 429 at the step before the arrival's merge, both yesterday's number, and 535 at that merge (`15f4d689c`), where the press also began an arrival, a fault `cb7a75798` took out later (its first frame of 713 to 827 is that fault's). Which of the five (`15f4d689c`, `cb7a75798`, `7683d9ecb`, `d55e6392e`, `992fc454b`) was not parted, and what in it pays was not found. **It is not the defaults:** with Wire Answers off the press is 491, and with the arrival as it stood yesterday 480; Wire Answers accounts for 233 of the elements and none of the time.

**The first frame: about 85 ms to 3D and 70 to 2D, from the picture and the code both, spread over the day.** Today's data on yesterday's code adds about 35 to 3D and 10 to 2D; today's code on yesterday's data about 15 and 27; it was already 338 and 321 at 04:39 and 352 and 327 before the arrival's merge. No one merge carries it.

**The picture grew by 1,029 elements under the 2D map**, 13,781 to 14,810: about 800 from the repository's own growth and about 230 from Wire Answers on.

What the numbers are worth: the machine was shared throughout with another builder's runs and builds (load 1.9 to 4.3, and 8.3 for the one run straight after this probe's own three builds; 21 runs waited behind that builder on the lane), and the other builder's hold from about 23:47 shared the machine with those three builds. A build's own runs spread by 20 to 170 ms, so a step of 45 ms between two builds of the day is near that spread; the two swaps, tight and apart, are the firmer evidence. Each step of the day was built with its own data. The counting lines added to the case in each checkout were removed, and the checkouts with them.

Beside the cause already found, the 190 ms the press pays to make the held 2D map inert, which stood yesterday too: this is a second, smaller cost that came in today.
