# Where the Explorer's time goes: the Local Map's clicks, the continuing search, and the suite

_A probe of October 16, 2026, by the root Claude Code agent (Fable 5.1), after the owner reported that "clicks in certain collapse elements (arrow or name) appears to cause a big delay, especially when chained together" and asked what performance tools the agent has, what other pain points exercising the site finds, and whether the Playwright suite would speed up with the site ([Turn 11 of the October 15 session](../../../ChatHistory/2026/10/2026-10-15.1.record.md#turn-11)). The scripts are disposable and not committed; this record is. Nothing was changed in the product._

## Method

Three instruments, all run against the built bundle served on port 8766 (`dist/explorer`, built by the sixth gate run of the C++ pass, current with `e254096f`), in headless Chromium at 1600 by 1000 CSS pixels:

- **A Playwright driver** with a V8 CPU profile (Chrome DevTools Protocol `Profiler`, 250 µs sampling) and a Chrome trace (`devtools.timeline`, `blink.user_timing`) running throughout, and a `PerformanceObserver` counting long tasks. It opens the Local Map, then clicks, by dispatching `click()` in the page and timing the synchronous handler: a directory's name (opens it), a closed directory's box, the X that closes it, the biggest closed directory the labels offer, a chain of four such clicks 300 ms apart, a card (pins the file), its X, a symbol row, the "+N symbols" reveal; then six hovers, the sidebar's arrow and typing in the search. After each click it waits until the root says no move runs and the search is not running, and reads the renderer's own counters from the root (`data-layout-ms`, the starts tried, the search's trials and adoptions). The profile is mapped back through the bundle's sourcemap; the trace is bucketed per click into layouts, style recalculations, paints and animation frames.
- **A temporary spec** run through the real runner (then deleted) timing each step of the still-picture deck's "Local Map, retained" test on the repository's two scopes, to tell the page's own time from the instrument's.
- **The last gate run's Playwright report** (`reports/e2e`), read for every test's duration.

Three runs of the driver: the shipped tuning on `packages/explorer/src/client/index.ts` as subject; the same with the continuing search off (`searchStarts: 0`, which is also the suite's configuration); and the shipped tuning on the deck's retained chain scope (four files retained whole).

## What it found

### A click's cost, and what follows it

| Scope and click | handler (ms) | of which layout | move ends | settled | search trials, adoptions | long tasks after the click |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| 34 cards, 130 wires: open a directory by name | 277 | 224 | 448 | 1,791 | 8 seeds + 10 joins, 1 + 1 | 2 (359 ms) |
| open a closed box (47 cards after) | 283 | 225 | 482 | 5,503 | 9 + 20, 7 + 7 | 8 (902 ms) |
| open the biggest directory (+45 files, 92 cards) | 454 | 387 | 474 | 4,338 | 8 + 18, 4 + 4 | 13 (1,532 ms) |
| chain of four, 300 ms apart | 271, 291, 284, 268 | | | 5,329 after the last | 9 + 20, 7 + 7 | 13 (1,724 ms) |
| pin `types.ts` (72 cards, 383 wires) | 1,029 | 931 | 553 | 23,726 | 15 + 50, 17 + 16 | 167 (20,005 ms) |
| the same clicks with the search off | 295 to 355 | 245 to 289 | 462 to 480 | 465 to 491 | none | 1 (the handler) |
| retained chain scope, 65 to 108 cards, 418 wires: open by name | 690 | 574 | 518 | 10,908 | 12 + 31, 9 + 7 | 96 (8,767 ms) |
| the biggest directory (108 cards) | 956 | 809 | 508 | 15,173 | 14 + 43, 11 + 9 | 166 (15,703 ms) |
| chain of four, 300 ms apart | 763, 847, 817, 799 | | | 12,823 after the last | 12 + 39, 10 + 9 | 138 (14,436 ms) |

Every collapse control runs the same render, so the name, the box and the X cost the same. The handler is the synchronous part: `renderBranches` builds every card afresh, lays out three or four starts (the ranking's, the previous picture's, and two seeds), each measured on the page and placed by the network simplex, and shows the cheapest; the main thread is blocked for it, so the click lands late by that much. Then the move runs 450 ms. Then, with the shipped tuning, the continuing search tries up to 32 seeds (patience 8) and every boundary join of each incumbent in idle callbacks, each trial a full simplex solve, and each adoption a page measurement and another 450 ms move; a join trial does not consume the patience, so a click on the chain scope is followed by 30 to 43 join trials. The picture settles 2 to 5 s after a click on a small neighbourhood, 6 to 15 s on the retained scope, 24 s after pinning a hub, with the main thread in long tasks for most of it. A click that arrives in that window waits for the running trial, and its render stops the search and begins it anew, so chained clicks stack their handlers and restart the tail each time. With the search off, every click settles when its move ends, about 480 ms after it.

### Where the time goes

The search-off profile (15.8 s sampled over 13 renders and their moves): `renderBranches` 45%, of which the starts' layout 39%, and inside it the network simplex 27% against the page measurer's 6% and the order step's 4%; `drawConnections` 31%, the wires measured, routed and rebuilt as SVG on every animation frame of every move. In the simplex, `TreeIndex.rebuild` is 12% on its own: the spanning tree's adjacency and postorder are rebuilt from scratch at every iteration, and `cutValues` recomputed over the whole tree (6.5%), where the method's known form updates both incrementally. The shipped-tuning profile (75 s sampled) is the same two costs with the search multiplying the first: the simplex 29% of self time, `drawConnections` 30%, `searchStep` 32% inclusive. Building the cards' DOM is 1.6%; the state's persistence 0.3%.

On the chain scope the trace counts about 10 animation frames per 500 ms move: at 418 wires a frame's redraw exceeds 16 ms, and the move runs near 20 frames a second.

### What is not slow

Hover highlight 1 to 2 ms a row. The sidebar's arrow 0.2 ms. Typing in the search: no long task. The World Map: ready 294 ms after navigation with one long task of 93 ms, a pin 9 ms, entering a thing into the Local Map 55 ms to the first picture. The bundle loads in under 200 ms on localhost; `explorer-data.json` is 5.0 MB and `index.js` 1.8 MB minified (1.2 MB of it three.js), a cost only over a network. The 3D view's own frame rate was not measured: headless Chromium draws WebGL in software, which says nothing about the owner's machine. The 2D/3D transition was excluded by the owner.

### Behind the other views

The owner asked at Turn 12 whether a click in Knowledge Sources, on a file the Local Map could draw, runs the exploration and the simplex, and whether the layout should be lazier. Measured with a fourth driver on the same bundle:

- **Knowledge Sources as the landing, a click on a file name:** 4 ms, no long task, and no Local Map root exists in the page; the click opens the detail panel. The World Map as the landing: no Local Map root either, no long task. `renderCurrentView` draws only the view shown, so the layout is already deferred until the Local Map is looked at.
- **Leaving the Local Map while its search runs:** the switch to Knowledge Sources takes 19 ms, and the search goes on behind it, since a view is hidden by opacity, not removed: in six seconds hidden it tried 8 seeds and 10 joins and settled, 179 ms of long tasks on the 34-card neighbourhood, which on the retained scope would be the 8 to 15 s tail measured above.
- **Coming back:** the switch to the map takes 240 ms synchronous, a full render of the picture that was still in the page unchanged, and the search begins again from seed one, discarding what it found while hidden.
- **A recentre from inside the map** on a file with a small neighbourhood: 23 ms, a 9 ms layout; the cost is the wires and constraints, not the cards.

So the eagerness is inside the map, not across the views: every change of state while the map is shown re-explores, rebuilds every card's element and re-solves every start from scratch, a return to the view re-renders an unchanged picture, and the search spends its budget on a view no one is looking at and loses it on return.

### The suite

The gate's Playwright run took 966 s for 131 tests on one worker (the working notes' "about 3 min" is stale). By kind: the still-picture deck 337 s; the 3D specs 187 s (`force-graph-focus` alone waits 16 s on one timer and 19.8 s in all); the specs that cross 2D and 3D (presets, perspective zoom, navigation) 144 s; the 2D Local Map specs about 230 s; the World Map 31 s. Literal fixed waits total 49 s at their call sites, more where they sit in loops. The suite runs with the continuing search off, so none of the tail above is in it.

The retained deck test's steps on the repository's scopes (31 and 49 s in the timing spec; 81 and 114 s in the gate, which also runs the journeys):

| step | five files | chain |
| --- | ---: | ---: |
| the page's first picture (its own layout 377 and 525 ms) | 1.8 s | 1.7 s |
| `readPicture`, one in-page reading sampling every wire with hit tests | 11.9 s | 7.6 s |
| `runTour`, planned pans by mouse with a reading after each | 11.6 s | 7.4 s |
| `scoreRoutes`, six pans by mouse, each 160 and 700 ms of rest | 20.9 s | 11.8 s |

Nine tenths of the deck's time is the instrument reading and panning the page; the site's own layout is under 5% of it. A faster render would not move the deck or the 3D specs. It would shorten the 2D specs by the renders they perform, each 0.3 to 1 s today, bounded below by the 450 ms moves the tests wait for and the fixed waits.

## The possibility space, undecided

Each of these is testable against today's behaviour with the layout lab and the probe above; none is proposed here.

- **The search's budget.** Bound the join trials by the patience as the seeds are, or spend the search's time where a click is not expected. Trades how far the picture is improved after a click against the main thread's quiet; the lab's reports say what the later seeds and joins actually bought.
- **The simplex kept incremental.** Update the tree index and the cut values per pivot, as the method of Gansner et al. does, instead of rebuilding them per iteration; and reuse a solve for a start whose order equals one already solved. The same optimum, so a pure speedup, measurable as identical placements on every capture.
- **The wires during a move.** Route once per two frames, or only the wires whose endpoints moved. Trades the motion's fidelity against its frame rate at hundreds of wires.
- **One measurement per render.** Measure the cards once and price every start arithmetically, as the search already does, then measure the chosen start; about 6% of a render today.
- **The suite's waits.** Condition waits in place of timers where a condition exists; several workers, which the deck's report writing and shots assume do not run at once. The instrument's reading cost is its own choice of hit tests per wire.
