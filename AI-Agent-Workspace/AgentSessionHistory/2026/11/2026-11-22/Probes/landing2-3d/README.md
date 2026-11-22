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
