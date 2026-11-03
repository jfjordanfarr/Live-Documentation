# November 2, 2026 — can the browser suite run faster without weakening a test

Measured by a builder in its own worktree, at `8e473140` (the tree tonight's baseline ran on) and then `493efd74`, with
nothing else on the machine running a browser. The question was the owner's: can the Playwright suite run materially
faster on this machine without weakening any test? Tonight's full run, one worker: 265 tests, 2,197 s of wall clock
(36.6 min), 2,160 s of summed test time.

## In short

- **One change is built and kept:** the still-picture deck's tour no longer samples every wire along its length on each
  of its readings, since it never uses the samples. The still-picture spec fell from 520 s to 306 s of test time on one
  worker, with its scoreboard identical in all 14 rows. The whole suite on one worker went from 2,197 s (36.6 min,
  tonight) to 2,084 s (34.7 min), all 265 passing: 5 % off. It is the only change built.
- **No worker count above one holds,** on the whole suite or on any split measured: two workers took 23.6 min with 3
  tests failing, three took 20.9 min with 8 failing, and even the 2D tests alone, WebGL off, failed 4 on four workers.
  Each failure is a test near its budget, or one that samples a picture in motion, running slower beside another;
  each passes on one worker. The owner's rule of 2026-10-19 stands on today's numbers.
- **The machine has ten cores, not twenty:** `lscpu` reports an Intel i9-10900K, ten cores of two hardware threads each.
  Twenty is the count of threads; two tests side by side share cores. (Whether the measurements of 2026-10-19 on a
  ten-core box ran on this CPU with half its threads cannot be told from here.)
- **No flag or viewport makes a 3D frame cheaper.** New headless mode and `--ignore-gpu-blocklist` draw the same
  picture in the same time; a quarter of the pixels saves 4 %. Two launch settings do shorten settles without changing
  the settled picture: one thread of each core (CPU affinity) takes 17 to 21 % off a large picture's settle, and lifting
  the 60-frames-a-second limit up to 39 % off a small one's. Together, over the whole suite on one worker, they saved 4 %
  (2,084 s to 2,004 s, all passing), because the 2D specs got slower by as much as 15 % while the 3D ones got faster by
  up to 25 %. Neither is built; they are the owner's to weigh (below).
- **No heavy file settles the same picture twice** across its tests, so no shared page would keep the assertions the same.

## Baseline and method

Tonight's numbers are read from the main tree's HTML report of the run (`reports/e2e/index.html`, 20:15), unchanged.
Every other number here was measured in this worktree with its own bundles (built from the same commit; the repository
bundle carries the main tree's history sequence, copied into the worktree's ignored `.mdmd/history/`), the server on
port 8777, and `LIVE_DOCS_E2E_PORT=8777`. The instrument was a Playwright reporter that wrote, for each test, its
duration, status, budget and every top-level step with the source line that made it; a step was put in a category by
that line (a line that waits on `aria-busy` on `#graph-svg` is a 3D settle, and so on). CPU was sampled with `vmstat` and,
for single probes, read from `/proc` for the browser's processes. The renderer probes opened one 3D picture under a
given Chromium configuration, counted the renderer's actual draws through the same `__THREE_DEVTOOLS__` hook the suite's
observation instrument uses, waited for `aria-busy="false"`, and hashed a screenshot of the settled canvas. The
scripts were disposable and are not kept; the numbers are.

Runs here varied: the first one-worker run of the five heaviest files was 5 to 16 % slower per file than tonight, while
the closing one-worker run of the whole suite matched tonight test by test (median ratio 1.01, p90 1.06). A VS Code
agent-host process held about one CPU throughout. So a change is judged against a run of the same specs in this
worktree, and a worker count against tonight's per-test times.

## 1. Where the time goes inside the heaviest tests

The five heaviest files on one worker, before the tour change (seconds of test time):

| Category | still-picture | force-graph-update | force-graph-discovery | history-scrubber | force-graph-focus | All five |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 3D settle (`aria-busy="false"`) | 0 | 188.3 | 178.0 | 98.3 | 49.0 | 513.5 (44 %) |
| `page.evaluate` (readings) | 266.2 | 4.4 | 0.6 | 1.2 | 1.5 | 273.9 (23 %) |
| Input (mouse moves, clicks) | 128.5 | 12.1 | 0.4 | 9.8 | 44.5 | 195.3 (17 %) |
| Fixed `waitForTimeout` | 78.4 | 3.9 | 0 | 1.1 | 8.3 | 91.8 (8 %) |
| Everything else | 47.4 | 4.4 | 6.1 | 17.4 | 23.5 | 98.8 (8 %) |
| Total | 520.5 | 213.1 | 185.1 | 127.8 | 126.8 | 1,173.3 |

(One history-scrubber test failed in 0.7 s on the first bundle, which lacked the history; its time is missing here.)

- **The 3D files are their settles:** 88 % of force-graph-update, 96 % of force-graph-discovery, 77 % of
  history-scrubber. A settle is a count of frames times the cost of a frame: the whole repository's settle at full
  energy is 571 frames of a median 138 ms (77 s). One browser alone drew 565 to 573 frames in every configuration tried
  (beside another, 616 to 689), so for a large picture only the frame's cost can move. A small picture is held by the frame rate instead: each settle of the scripted history sample
  takes 5.1 to 5.2 s, 275 frames at the browser's 60 a second (section 4).
- **still-picture was its readings:** one call of `readPicture` on the repository's retained five files took 30 to 46 s.
  A CPU profile of one reading (30.1 s; 381 wires, 128,513 samples): `getPointAtLength` 38 %, `elementFromPoint` 28 %,
  the loop's own script 23 %, `isPointInFill` 7 %. The tour re-read the whole picture at its start and after every pan,
  and used none of the samples.
- **Input in still-picture is the Local Map panning slowly:** a six-step `mouse.move` over the retained repository
  picture took 2 to 4 s, about half a second an event, in every drag of the tour and of the six route pans. That is the
  page's time to answer the event, not the test's.
- **Fixed waits are 8 %:** most of them `dragBy`'s 160 ms before letting go and 700 ms after (55 s in still-picture).
  They are left alone: the 700 ms is the window in which the route measure would see a wire that changes shape after a
  pan, and a wait on a condition would close that window early. Shortening it is not a cause fix.

## 2. Workers

### The whole suite

| Configuration | Wall clock | Summed test time | Passed | Over budget | Failed on an assertion | Median slowdown, 3D files / others |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 worker, tonight (main tree, before the tour change) | 2,197 s (36.6 min) | 2,160 s | 265 | 0 | 0 | 1 / 1 |
| 1 worker, after the tour change | 2,084 s (34.7 min) | 2,042 s | 265 | 0 | 0 | 1.01 / 1.01 |
| 2 workers | 1,419 s (23.6 min) | 2,458 s | 262 | 2 | 1 | 1.28 / 1.17 |
| 3 workers | 1,256 s (20.9 min) | 2,901 s | 257 | 4 | 4 | 1.58 / 1.35 |

The slowdown is each test's time against its own time tonight (still-picture left out, since the tour change moved it).

What failed on two workers:

| Test | Alone tonight | On two workers | Budget | How |
| --- | ---: | ---: | ---: | --- |
| force-graph-focus: a focused URL centers its node, direct clicks pin it, and More opens its details | 19.8 s | 37.2 s | 30 s | over budget |
| local-map-search: a change of pins starts the search afresh | 25.8 s | 31.7 s | 30 s | over budget |
| perspective-zoom: nested directory animation represents each ancestor once | 8.7 s | 17.4 s | 30 s | the transition's bridge element was never seen in 5 s |

And on three workers, besides the first two again: history-scrubber's deleted-file test (31.6 s of 30), local-map-branches'
lanes test (61.7 s of 60), history-scrubber's overview test (the camera had not yet followed the growth: 389 files
outside the uncovered frame), local-map-hidden's page-hidden test (its `localMapSettled` wait of 30 s ran out),
perspective-zoom's native symbol wires (no sampled frame of the transition caught the fold between 0 and 1) and the
nested animation again.

### A split: 2D tests in parallel, 3D tests one at a time

Playwright 1.58 does have a per-project worker limit (`testProject.workers`), so a split can be one invocation. The
honest form is sequential, the 2D tests in parallel first and the 3D tests alone after, since a 3D test takes fourteen
of the twenty threads and slows whatever runs beside it. To find the 2D tests, the candidate set (every test outside the
3D-named files) was run with WebGL disabled (`--disable-webgl --disable-webgl2`), so that a test that draws 3D fails
rather than runs: 25 tests in twelve mixed files did, and were moved to the 3D side.

| Phase | Tests | Workers | Wall clock | Summed test time | Passed | Over budget | Other failures | Median slowdown |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2D, WebGL off | 156 | 4 | 512 s | 1,088 s | 152 | 2 | 2 | 1.37 |
| 3D (not run; tonight's one-worker time for the same tests) | 109 | 1 | 1,201 s | 1,201 s | — | — | — | 1 |

Even the 2D tests alone slow by a median of 1.37 on four workers (p90 1.74), and four failed: local-map-branches' lanes test
(73.8 s of 60), local-map-search's change of pins (32.4 s of 30), and both of local-map-hidden's search tests, whose
`localMapSettled` waits ran out at 30 s. The split's best total, about 1,713 s (28.5 min), is bounded by the 3D tests
alone (20 min) and still fails four tests. It was not built.

The tests that fail first under any parallel load are the ones already close to their budgets alone: local-map-search's
change of pins (25.8 s of 30 tonight, 27.2 s in the closing run, 91 %), local-map-hidden's two search tests (their 30 s `localMapSettled` waits against
23 to 29 s of search), force-graph-focus's focused URL (19.8 of 30), history-scrubber's deleted file (20.2 of 30) and
local-map-branches' lanes test (36.8 of 60).

## 3. The heaviest files and a shared page

None qualifies. Each test of the five heaviest files opens its own state: force-graph-update's two tests start at
different energies with the tests hidden and shown; force-graph-discovery's three start at the archipelago, a pin and
the pin with the reader, then move through states of their own; history-scrubber's fifteen and force-graph-focus's
thirteen each open a different entry; still-picture's twelve are four scopes by three views. A shared page would start
each test from the last one's end and make it fail on another's fact. The redundancy found was inside a test: the tour's
re-readings, now cheap (section 5).

## 4. The software renderer

The renderer in every configuration was `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader
driver)`. The scene is force-graph-update's: the whole repository, the root open, tests shown, full energy, 1,100 by
700. The canvas hash is of the settled picture.

| Configuration | Settle | Frames | Median frame | CPU | Threads busy, mean | Canvas |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Headless shell, as the suite runs | 77.2 s; 83.1 s again | 571; 572 | 138 ms; 146 ms | 1,085 s; 1,152 s | 14.1; 13.9 | `ce2994b51d47` |
| New headless mode (`channel: "chromium"`) | 78.2 s | 571 | 140 ms | 1,094 s | 14.0 | same |
| `--ignore-gpu-blocklist` | 77.7 s | 571 | 140 ms | 1,091 s | 14.0 | same |
| A quarter of the pixels (550 by 350) | 74.1 s | 565 | 134 ms | 1,005 s | 13.6 | (another size) |
| Pinned to one thread of each core (10 threads) | 63.3 s; 65.6 s again | 571; 573 | 113 ms; 116 ms | 600 s; 626 s | 9.5 | same |
| Pinned to five cores, both threads (10 threads) | 68.2 s | 571 | 121 ms | 581 s | 8.5 | same |
| Two at once, unpinned | 101.1 s, 103.1 s | 616, 624 | 164, 167 ms | 848, 862 s | 8.4 each | same |
| Three at once, unpinned | 137.8 to 139.8 s | 672 to 689 | 205 to 208 ms | 806 to 831 s | 5.9 each | same |
| Two at once, pinned to threads 0–9 and 10–19 | 120.3 s, 117.6 s | 643, 616 | 187, 192 ms | 629, 601 s | 5.2 each | same |

- The frame's cost hardly depends on its size, so a smaller viewport is not a lever; the mode and the blocklist change
  nothing.
- Confined to one thread of each core, SwiftShader finishes the same picture 18 to 21 % sooner on about half the CPU
  time. It sizes its work to every hardware thread (its library reads the count with `sysconf`, not the process's
  affinity, and has no setting for it); the likely reason, not measured here, is that a thread sharing its core with its
  sibling holds back each frame's parallel work. Two browsers on disjoint halves of the
  machine are each slower than two unpinned (118 to 120 s against 101 to 103 s), so pinning does not make two 3D tests
  side by side honest; it only makes one alone faster.
- On a paired run of the same specs on one worker:

| Spec | Unpinned | Pinned, one thread a core | Change |
| --- | ---: | ---: | ---: |
| force-graph-update | 204.1 s | 169.3 s | −17.0 % |
| force-graph-focus | 125.4 s | 122.2 s | −2.5 % |
| local-map-branches | 108.0 s | 111.0 s | +2.7 % |
| local-map-hidden | 74.6 s | 72.5 s | −2.8 % |
| local-map-search | 41.7 s | 42.5 s | +1.8 % |
| All 33 tests, all passed both ways | 553.8 s | 517.5 s | −6.6 % |

Small pictures are bound the other way, by the browser's 60 frames a second: the scripted history sample settles in
275 frames of 16.7 ms (4.9 s), the estate sample's entry in 161 (3.1 s). Without the frame-rate limit
(`--disable-gpu-vsync --disable-frame-rate-limit`) the same frames take 11.3 ms and 9.3 ms: 3.5 s and 1.9 s. The settled
picture is the same (the history sample's hash at once; the estate's six seconds after, `720f29ab1ba6` both ways), but
the timeline moves: one second after the estate settled without the limit the canvas still differed, since the page's
time-based camera motion had not finished while the frame-paced physics had. On four 3D specs, one worker, against the
closing one-worker run:

| Spec | With the limit | Without | Change |
| --- | ---: | ---: | ---: |
| history-scrubber | 136.8 s | 116.7 s | −14.7 % |
| force-graph-wires | 71.7 s | 63.6 s | −11.4 % |
| force-graph-focus | 123.8 s | 118.8 s | −4.1 % |
| perspective-zoom | 44.2 s | 45.7 s | +3.3 % |
| All 44 tests, all passed both ways | 376.5 s | 344.7 s | −8.5 % |

Both settings together, the whole suite on one worker against the closing run without them: all 265 passed, 2,004 s of
wall clock against 2,084 s, 1,958 s of test time against 2,042 s (−4.1 %).

| Spec | Without | With both | Change |
| --- | ---: | ---: | ---: |
| force-graph-exploration | 71.8 s | 54.0 s | −24.9 % |
| history-scrubber | 136.8 s | 113.7 s | −16.9 % |
| force-graph-update | 206.1 s | 174.4 s | −15.4 % |
| force-graph-discovery | 167.8 s | 145.2 s | −13.5 % |
| force-graph-wires | 71.7 s | 63.7 s | −11.2 % |
| force-graph-focus | 123.8 s | 114.6 s | −7.4 % |
| still-picture | 309.5 s | 326.2 s | +5.4 % |
| local-map-search | 43.2 s | 45.0 s | +4.2 % |
| local-map-packing | 58.0 s | 63.6 s | +9.5 % |
| local-map-branches | 108.1 s | 118.6 s | +9.7 % |
| local-map-path | 42.6 s | 49.0 s | +14.8 % |

## 5. What changed

`493efd74` lets `readPicture` leave out the sampling along the wires (`along: false`) and the tour reads that way, since
which wires are legible is decided by their endpoints' rows and names and never by the samples:

| Scope | Test | Before | After | Readings before | Readings after |
| --- | --- | ---: | ---: | --- | --- |
| repository, five files | Local Map | 38.5 s | 29.6 s | 3, 13.3 s | 3, 5.0 s |
| repository, five files | Local Map, retained | 183.2 s | 88.4 s | 3, 108.0 s | 3, 29.5 s |
| repository, chain | Local Map | 62.4 s | 46.5 s | 4, 20.0 s | 4, 6.9 s |
| repository, chain | Local Map, retained | 163.9 s | 74.2 s | 6, 107.4 s | 6, 18.5 s |
| estate, five files | Local Map | 12.9 s | 12.6 s | 2, 0.5 s | 2, 0.3 s |
| estate, five files | Local Map, retained | 18.4 s | 16.2 s | 2, 3.2 s | 2, 1.5 s |
| estate, chain | Local Map | 13.4 s | 13.1 s | 3, 0.2 s | 3, 0.1 s |
| estate, chain | Local Map, retained | 13.1 s | 11.7 s | 3, 1.5 s | 3, 0.5 s |
| all twelve, the four Force Graph rows included | | 520.5 s | 306.3 s | | |

The scoreboard the spec writes (`reports/still-picture/scoreboard.json`) was compared row by row before and after,
leaving out when each row was measured: all 14 rows identical, the tours' pans, legible counts and verified counts with
them. No assertion, budget or threshold changed.

## For the owner

- **The serialization rule.** On today's numbers it holds: against one worker with the tour change (34.7 min), two
  workers would save 11 min a run and fail 3 tests, three would save 14 and fail 8. Reopening it would need what was
  declined on 2026-10-19, budgets that fit tests running beside others, and the tests that sample a picture in motion
  (perspective-zoom's two, history-scrubber's overview) would still be at the mercy of load.
- **The tests near their budgets alone** are the first to fail under any load and are fragile even on one worker:
  local-map-search's change of pins at 86 to 91 % of its 30 s, and local-map-hidden's two search tests whose inner 30 s wait
  holds 23 to 29 s of search. Whether those searches should take that long is a question about the page, not the test.
- **The two launch settings** (one thread of each core; no frame-rate limit) together saved 4 % of the suite, since they
  slow the 2D specs while they speed the 3D ones. Applied to the 3D tests alone they would keep the gain without the
  loss, but that needs the suite split into 3D and 2D projects by test, the machinery measured above for workers, and
  the frame-rate setting also moves the page's frame-paced physics ahead of its time-based camera motion, a premise
  some 3D specs may rest on. Pinning is Linux-only (`taskset` on the runner, the cores read from their sibling lists).
  Not built: new machinery for a few per cent.
- **The 3D frame on the software renderer** costs about 138 ms however small the canvas, and the physics takes at most
  10 ms of each frame (`FRAME_BUDGET`), so a large picture settles in some 570 frames. Only the page could change that.
- **The Local Map pans slowly in a large picture:** half a second an event over the retained repository picture in the
  headless browser. Worth a look in a real browser, through the owner's window.
