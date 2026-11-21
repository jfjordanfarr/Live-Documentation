# Probe: what a press of 2D or 3D still did that grew with the picture

_Status: a record of 2026-11-20, a builder's milestone, with its instruments and numbers. It continues [the switch-cost record of 2026-11-07](../../../2026-11-07/Probes/switch-cost/README.md), which says what the press does and how its cost was first cut from ten seconds to a quarter of one. The frames of the transition, before and after this round, are in [Screenshots/press-cost](../../Screenshots/press-cost/README.md)._

## The fault

The case "the 2D and 3D presses return at once, …" in `tests/e2e/force-graph-focus.spec.ts` holds each press's own time under 500 ms (a press of 2D less the 2D map's own render, `live-docs:switch-render`). On `main` at `0976d4909` it was red. On this repository's picture round `packages/engine/src/live-docs/graph.ts`, one more card had taken the press of 3D from 406 to 637 ms. The bound was right. The press's own time was not flat in the size of the picture.

## How it was measured

[`press-probe.spec.ts`](press-probe.spec.ts) opens four pictures in the 3D map. It presses 2D, waits for the transition to play, and then presses 3D. Each press is timed in the page as the regression times it: from the click until a message posted after it is answered. The probe prints the page's own `live-docs:` measures. With `PROBE_PROFILE` unset, it also takes a CPU profile of exactly the press: a marker function runs for 3 ms before the click, and another as the press returns. [`analyze.mjs`](analyze.mjs) maps the samples between the two markers through the bundle's source map. It sums them by function, by top-level task, and by the callers of a native function such as `getBoundingClientRect`.

[`anatomy-probe.spec.ts`](anatomy-probe.spec.ts) opens the 2D map and times the first read of geometry after each change that `setActiveView` makes. [`cv-probe.spec.ts`](cv-probe.spec.ts) traces the 2D map's `content-visibility`, opacity and `inert` every frame on a load into it and on leaving it. All the files here run as the 2026-11-07 instruments did: copy the specs to `tests/e2e/_probe/`, build, and run Playwright with the suite's configuration inside the browser lane. Remove the folder afterwards.

The pictures:

| Picture | Names (cards) | Cards copied | Wires | Shells | Elements in the 2D map |
| --- | --- | --- | --- | --- | --- |
| Small: `packages/explorer/src/shared/staticExplorerData.ts` | 23 | 4 | 31 | 14 | 7,564 |
| The case's: `packages/engine/src/live-docs/graph.ts` | 50 | 5 | 201 | 22 | 13,673 |
| Large: `packages/explorer/src/client/persistence/local-storage.ts` | 75 | 5 | 195 | 11 | 13,530 |
| Larger: `graph.ts` and `local-storage.ts` pinned together | 124 | 7 | 403 | 25 | 25,889 |

All runs were headless Chromium at the suite's defaults on the machine's graphics card, one at a time in the lane.

## Where the time went

The profile of the press of 3D on graph.ts (765 ms in the window) and on the larger picture (826 ms):

| Part | graph.ts | Larger | What it grows with |
| --- | --- | --- | --- |
| The directory shells' copies (`visualCopy` of each band's outline and label, every computed property of every element, at once) | 306 ms | 169 ms | the shells' elements inside the frame: 0.13 to 0.6 s over the four pictures |
| Layout forced by reading the destination's box after `setActiveView` | 177 ms | 274 ms | the 2D map's elements |
| The wires' sampling | 40 ms | 87 ms | the wires: about 0.2 ms a wire |
| A second slice of the cards' copies, run before the press's message was answered: a slice is as long as "the page was away", which counted the press's own work, up to 100 ms | 101 ms | 101 ms | flat, at its cap |
| The 3D map's render, the anchor, the URL, the rest | about 140 ms | about 190 ms | slowly |

The layout was not layout. [`anatomy-probe.spec.ts`](anatomy-probe.spec.ts) timed each change that `setActiveView` makes. Making the 2D map `inert` cost the next read 138 to 160 ms on graph.ts's map and 260 to 265 ms on the larger one. Every other change cost under 2.5 ms. Chromium implements `inert` as an inherited style, so the map's every element has its style recomputed.

The 2026-11-08 round had found the same cost on the destination map ("Keys, not inert") and avoided it there. It still stood on the source map in every press of 3D.

On the press of 2D, the destination map's capture runs in a microtask of the press. There, the shells cost 37 to 382 ms and the wires 14 to 106 ms.

## The mend

These changes leave the transition's look unchanged. They are in `perspectiveTransition.ts`, `dom.ts` and `shell.css`:

1. **The press reads places and copies nothing.** At the press, the capture reads where everything stands: each card's place and title, and each wire's screen matrix, data and stroke. It also reads each shell's box and depth. The shells' copies join the cards' copies in the slices after the press, an element a step. A shell stands as an empty box of its size until its copy is whole. The wires' samples join them too, a wire a step, in the order the map drew them.
2. **The first slice is the least.** The first slice of copying is a task after the press, and its length is the least, 16 ms. Before, the press's own work counted as time "the page was away", so the first slice after it ran its full 100 ms. The slice loop also now checks its budget after every finished piece. Before, it did not, so a run of small pieces could overrun it.
3. **The source is made inert when released, and an inactive view is not rendered.** `setActiveView` leaves a held surface's `inert` alone; the hold's release sets it. An inactive view, once faded, is now `content-visibility: hidden`, so the browser keeps its contents' state but spends nothing on their style or layout. Making an unrendered view inert costs 2 to 3 ms, not 140 to 265. A held surface is exempt until it is released.

   The view's fade of 0.4 s is kept: only the way out is a discrete transition (`allow-discrete`), so the view stays rendered through its fade and goes unrendered at its end. A first version also made the way in a transition. Chromium then kept the view unrendered until the fade's first frame: 230 ms on a quiet machine, traced every frame on a load into the 2D map. At two workers it was long enough for `explorer-navigation.spec.ts:67` to find the map's layer not visible for 5 s. A view shown is now rendered at once. The trace after the correction: rendered on the frame it became active, and on leaving for the World Map rendered through the fade, unrendered 37 ms after its opacity reached 0.

The 2D map is no longer made inert in the press. Shown again, it pays one style pass of 70 to 140 ms (the anatomy probe), inside its own render, where today's `inert = false` paid as much or more. The 2D map's render read the same before and after over three runs each (graph.ts 1.37 s before, 1.50 and 1.61 s after; the larger picture 2.93 s before, 2.89 and 2.88 s after). An earlier pair that seemed to differ by a fifth was the machine.

One thing is no longer guarded while the transition plays. The held 2D map is not inert during the hold, which lasts 1 to 3 s while the copies are made. The hold's cover still takes the pointer, but a Tab pressed in that time could move the focus into the held map, and the release would then take it away.

## The numbers

The probe's readings, without the profiler. The own time is the press's return, less the 2D map's render for a press of 2D:

| Picture | Names | 2D press's own, before | 2D, after | 3D press, before | 3D, after |
| --- | --- | --- | --- | --- | --- |
| Small | 23 | 478 ms | 66 ms | 853 ms | 80 ms |
| graph.ts | 50 | 399 ms | 118 ms | 662 ms | 100 ms |
| Large | 75 | 324 ms | 140 ms | 951 ms | 114 ms |
| Larger (two pins) | 124 | 590 ms | 216 ms | 839 ms | 173 ms |

Before, the cost followed the shells' elements in the frame more than the names, so it was neither flat nor monotone. After, it rises about 1 ms a name for a press of 2D and about 0.6 ms a name for a press of 3D.

The regression's readings (`SWITCH-PRESSES`):

| Case | Build | 2D own | 3D | Longest wait after (2D, 3D) | First frame after the start (2D, 3D) |
| --- | --- | --- | --- | --- | --- |
| graph.ts, line 262 | main | 405 ms | 592 ms, red | 253, 339 ms | 233, 272 ms |
| graph.ts, line 262 | this round, three runs | 114, 132, 112 ms | 102, 129, 95 ms | 278 to 369 ms | 255 to 342 ms |
| Larger, the new case | main | 584 ms, red | 706 ms, red | 368, 513 ms | 298, 361 ms |
| Larger, the new case | this round, three runs | 212, 193, 207 ms | 195, 138, 134 ms | 374 to 485 ms | 321 to 382 ms |

With the correction to the way in, inside the suite's shared pass at two workers, the cases read: graph.ts 208 ms (2D own) and 118 ms (3D); the larger picture 286 and 168 ms. The 180 cases of the 22 spec files that exercise the switch all passed.

So graph.ts's presses have some 370 to 400 ms of room under the 500 ms bound. Before this round, the 2D press had 95 ms of room and the 3D press was over by 92 ms.

The first frame's 400 ms bound is close on the larger picture, before and after alike (361 and 382 ms). That frame is a frame of the 3D map's renderer, which this round did not touch.

## What still grows

On the press of 2D, most of what remains in the window is the 2D map's own work that its render measure does not cover. On the larger picture there are three parts. A connection redraw that the render schedules for the next frame takes 79 ms. A second placement of the map about the subject, in the press's microtask, takes 46 ms and redraws the connections again. Garbage collection takes 41 ms.

The second placement repeats the first with the same anchor, since the 2D map has drawn by then. It may be redundant on the way to 2D. It was left as it is: whether it is redundant is a question about the 2D map's placement, not about the switch.

On the press of 3D, what remains is the 3D map's own render (28 to 46 ms) and the reading of its scene (about 20 ms). The URL's state and the capture's reading of places also remain (5 to 14 ms).

## Root's review, 2026-11-21: the press is mended and the round does not land yet

**In the whole suite.** Root ran the whole browser suite on this round merged at `main`'s tip (`e7bc662a7`, started 23:43 UTC on November 20): 596 passed, 2 failed, 7 skipped. The case at line 262, red on `main`, passed: graph.ts's presses took 246 ms (2D own) and 130 ms (3D). The new case's presses passed their bound too, at 382 and 178 ms, and the case was red on another check it had taken from the shared helper: the 3D transition's first frame came 421 ms after its start, against 400 (the 2D transition's, 361 ms).

**The new case narrowed** (`eb8dac271`, root's). That bound was never met with room on the larger picture, before this round or after (the table above: 298 and 361 ms on `main`, 321 to 382 after). So the new case holds what this round mended, the press's own time, the page's answering and the transition drawn whole, and the first frame's bound stays on graph.ts's picture.

**Then graph.ts's own case failed on it.** The focus spec's sixteen cases three times over at two workers: 47 passed, and graph.ts's case once red, its 3D transition's first frame 482 ms after the start (365 and 276 in the other two).

**Whether the round made the first frame later: it did.** [`first-frame-compare.sh`](first-frame-compare.sh) runs graph.ts's case beside itself at two workers, twelve times in each of two checkouts; [what it printed](first-frame-compare.txt). Milliseconds, smallest to largest of twelve:

| Reading | `main` (`e74d5741d`) | This round (`eb8dac271`) |
| --- | --- | --- |
| 2D press, own | 436 to 587, median 496 | 201 to 326, median 248 |
| 3D press | 701 to 808, median 748 | 121 to 157, median 132 |
| 2D first frame after the start | 274 to 369, median 284, none over 400 | 300 to 407, median 346, one over |
| 3D first frame after the start | 297 to 358, median 335, none over 400 | 312 to 425, median 346, three over |
| Longest wait after (2D, 3D) | medians 320, 415 | medians 386, 398 |

So the press is what this record says it is, a quarter to a half of what it was under the same load. And the first frame of the transition comes about 60 ms later on the way to 2D and has a longer tail on the way to 3D: the case that is always red on `main` for its press would be red in some runs for its first frame, four of twelve under this load and none of one in the whole suite. Root's reading, not measured: work the press no longer does is now done between the transition's start and its first frame, the 2D map rendered afresh when it is shown and the held map let go when the layer starts.

**Decision.** `main` is not moved. A case that fails in some runs is a worse thing to hold than one that fails in all of them, and a standing bound is not narrowed to let a mend in. The round stands on the branch `press-landing` for a pass on the first frame: what fills the time between a transition's start and its first frame, on `main` and here, and a mend that leaves the first frame no later than `main`'s. One fact for that pass: on `main` the first frame already comes 284 to 335 ms after the start, and the comment on the bound says the membranes peel in the transition's first 0.3 s, so the peel is hardly seen today either; a transition whose clock starts at its first frame would not lose it, which is a design question and not this pass's to settle alone. The task is on [the Explorer's work item](../../../../../../Work/explorer-holds-a-large-map.md).
