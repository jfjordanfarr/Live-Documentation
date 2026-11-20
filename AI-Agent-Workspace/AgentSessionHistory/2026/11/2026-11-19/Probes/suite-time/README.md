# Where the browser stage's time goes: the page's load, the suite's time limits, and every case timed

_Historical evidence: a record of November 20, 2026 (UTC), taken between 03:57 and 05:50 UTC by a builder for the root, on `21b6e602` in the builder's own worktree. It is not current documentation. Measurement only: no product code, test or configuration was changed. Numbers are of this machine (ten cores, twenty threads, the host's RTX 3090 reached through WSL2) on this date, with two other builders sharing it; each timing carries the load average beside it._

## The machine as found, and how it was measured anyway

The container had been rebuilt at 03:38. Its set-up script (`.devcontainer/post-create.sh`) was still at `npx playwright install --with-deps chromium` at 04:30, and remained there through the stage: Playwright's own unzipping stopped at 03:40 while writing one file (`libwidevinecdm.so`) of the full Chromium, and never resumed. By 05:50 that process had been ended (not by this builder; a `root-setup` hold was in the lane's queue), and the shared cache `~/.cache/ms-playwright/` still held no headless shell. Two things follow for everyone on the machine until the script is mended or rerun:

- **No headless shell is installed**, so `npx playwright test` cannot start a browser at all (`Executable doesn't exist at …/chromium_headless_shell-1208/…`). A second install by this builder (and one by another builder) stopped the same way after two files, with `UV_USE_IO_URING=0` too; `unzip` extracted the same archive in 2.9 s.
- **The script's next step never ran**: Mesa's EGL (`libegl1 libegl-mesa0`), which the browser needs to reach the card. Without it the browser draws WebGL in SwiftShader without a word; the suite's own first line would then stop the run, as `renderer-report.ts` is written to.

So every browser run here used, by environment only, a private copy of each in `/tmp/claude-1000/st/` (removed at the end): the headless shell unzipped by hand (`PLAYWRIGHT_BROWSERS_PATH`), and the two Debian packages the set-up script names plus `libwayland-client0`, fetched with `apt-get download` and unpacked with `dpkg -x` (`LD_LIBRARY_PATH`, `__EGL_VENDOR_LIBRARY_DIRS`). The suite's launch (`tests/e2e/browser-launch.ts`) was used unchanged; every run's first line named `ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)`. The packages are the versions the set-up script would install (`libegl-mesa0 25.0.7-2+deb13u1`, `libegl1 1.7.0-1+b2`), so the numbers should be those of the container once its script finishes; that is an expectation, not a measurement.

## The answer in short

- **The stage took 43.0 minutes** (lane hold 2,580 s): the first pass 40.4 min for 604 cases at two workers, the second 2.4 min for the five `@alone` cases. Its cases add up to **80.4 minutes of case time**; the first pass ran 1.93 cases at once on average. The 40 slowest cases are 32% of the case time; the median case takes 4.8 s.
- **What the cases' steps spend it on** (Playwright's own step times): waiting in assertions that poll the page, 24%; `waitForFunction`, 15%; gestures, 13%; the instruments' `evaluate` readings, 12%; locator waits, 12%; **fixed pauses (`waitForTimeout`), 10%: 1,089 pauses, 462 s**; navigation to the load event, 5%; the specs' own work in Node between steps, 5%; fixtures, 3%.
- **A load and its first picture is about a fifth of the case time**, not most of it: on a sample of 20 cases spread over the table, the first page's load to its picture at rest was 10% of those cases' time (25 to 63% in the cases under 5 s, 2 to 14% in those over 12 s); over the suite's 889 navigations at the sample's median of 1.2 s a load, about 18 minutes of the 80.
- **The page's own load**: this repository's 2D picture of one file rests 1.8 s after navigation (the estate's in 0.9 s), 95% of it the main thread busy, a third of that style recalculation and layout forced by the layout's measurements. A 3D picture rests in 6.6 s on the repository and 5.5 s on the estate, because a 3D settle is some 300 to 330 drawn frames at about 50 a second: the main thread is 40% idle on the estate. The continuing search, where a case turns it on, adds 4.7 s to the repository's picture of `generator.ts` and 1.2 s to the estate's.
- **The suite's time limits**: 636 sites. 11 alarms (in four files), 149 case limits (nets), 351 step waits, 4 deadlines inside the page, and 121 fixed pauses (written; 1,089 run).
- **Failures**: six in the stage. `force-graph-discovery.spec.ts:70` fails alone three times in three (a picture that does not come to rest within its 2,700 substeps: a fault, not the load). `force-graph-focus.spec.ts:182` failed alone once in three (a race). The four `history-panel.spec.ts` failures were this worktree's: its bundle carried no history; with the main checkout's history copied in and the bundle rebuilt, all four passed.
- **The gate's other stages took 3.2 minutes here** (193 s, load 1.6 at the start), against about 8 in the main checkout tonight: integration tests 64 s, unit tests 41 s, lint 40 s, the tests' type-check 15 s, the Live Docs pipeline 14 s, the build 13 s, the rest 6 s.
- **A third worker was not measured**: the lane was not free long enough (below).

## 1. The page's load and its first picture

**How.** [`load-profile.ts`](load-profile.ts) opens each address in a fresh context exactly as the suite does (its launch, the Desktop Chrome window of 1,280 by 720, the saved tuning `searchStarts: 0`), with a long-task observer and a frame watcher put in before the page's own script. A 2D picture is at rest by the suite's own test (`localMapSettled`, then every card's box unchanged for 150 ms) and the time given is the moment its boxes last changed; a 3D picture is at rest when `#graph-svg` first turns `aria-busy="false"` after being busy. Three clean loads each, then one under a Chrome trace and the V8 sampling profiler (250 µs), read by [`load-analyse.mjs`](load-analyse.mjs), which maps the profile through the bundle's source map.

```bash
node scripts/browser-lane.mjs --label suite-time --max-seconds 290 -- \
  npx tsx --tsconfig tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/load-profile.ts \
  --port 18931 --runs 3 --profile --out /tmp/claude-1000/st/load --only repo-2d,estate-2d,estate-3d
node AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/load-analyse.mjs /tmp/claude-1000/st/load repo-2d 1768
```

| Address (one file in focus) | At rest, ms (three loads) | First card / first busy, ms | The page's `data-layout-ms` | Long tasks: count, total ms | Load average |
| --- | --- | --- | --- | --- | --- |
| Repository, 2D, `packages/generator/src/generator.ts` | **1,825** (1,784; 1,825; 1,838) | 1,461 | 689 to 721 | 3, about 1,300 (the largest 970 to 1,005) | 1.8 to 1.9 |
| Estate, 2D, `PaymentService/PaymentService.cs` | **921** (896; 921; 949) | 559 | 185 to 206 | 2, about 470 | 1.8 |
| Repository, 3D, the same file | **6,630** (6,629; 6,630; 6,768) | 646 | (456 substeps) | 6, about 940 | 3.2 to 3.5 |
| Estate, 3D, `Portal/Services/GatewayClient.cs` | **5,458** (5,424; 5,458; 5,493) | 419 | (384 substeps) | 4, about 640 | 1.8 |
| Repository, 2D, the product's default tuning (the continuing search on, 13 starts tried) | **6,562** (6,500; 6,562; 7,120) | 1,537 | 695 to 816 | 10 to 13, 2,230 to 2,806 | 2.3 to 2.5 |
| Estate, 2D, default tuning | **2,076** (2,069; 2,076; 2,107) | 550 | 191 | 2, about 470 | 2.2 |

With this repository's history in the bundle (3.6 MB beside the 10.9 MB of data) the repository's loads were the same: 2D 1,732 to 1,787 ms, 3D 6,559 to 6,599 ms (load 1.5 to 1.7). The page's data arrives in about 75 ms (10.9 MB, served locally) and `DOMContentLoaded` comes at 250 to 320 ms, the 1.47 MB script parsed and run.

**The repository's 2D load, by phase** (the profiled load, 1,768 ms to rest; the main thread was busy 1,673 ms of it, 95%):

| Phase | ms | What it is |
| --- | ---: | --- |
| Page, script and styles | ~350 | HTML, the script's evaluation (module set-up: Three, JSZip, 53 ms), a task of 127 ms of native work and garbage collection, the data's fetch (75 ms) |
| Building the graph and the branches | < 60 | `graph.ts` 25 ms, `exploreBranches` 8 ms, `orderExploration` 46 ms inclusive: small |
| Laying out the first picture | 602 | `layoutStarts` → `layoutScene` 513 ms inclusive, of which measuring the cards 274 ms (`naturalWidthOf` 124 ms self, `measure` 87, `pin` 57) and the readings' rooms 174 ms (`measureRooms`) |
| Building the cards and drawing the scene | ~340 | `showScene` 141 ms, `createNodeCard` 87, `writeHandleNeeds` 103 ms self, `attachReading` 46, `drawConnections` 46 |
| Framing and the last settle | 143 | one task at 1,409 ms: `framePlace` 71 ms with 97 ms of style and layout |
| Idle | 95 | |

By the browser's kinds of work in the same window: script 741 ms, **style and layout 585 ms** (`UpdateLayoutTree` 412, `Layout` 161), paint and composite 79 ms, HTML and CSS parsing 29 ms, garbage collection 48 ms, other 239 ms. The measuring functions' "self" time above is mostly that style and layout: each reads a box (`getBoundingClientRect`, `offsetWidth`) after writes, and the browser recomputes styles and layout before answering. The one long task of 1,058 ms (from 351 ms) is the whole first render, `bootstrapExplorer` → `renderBranches`.

**The estate's 2D load** (850 ms): busy 70%; script 338 ms, style and layout 172 ms; the same functions at a fifth of the cost (`naturalWidthOf` 29, `framePlace` 26, `writeHandleNeeds` 21, `measure` 21 ms).

**The 3D loads.** The repository's (6,702 ms profiled): busy 84%. 328 frames were drawn, each handing its WebGL picture to the processor's compositor (`Commit`, 2,456 ms in all, a median of 7.0 ms a frame, the price of `--disable-gpu-compositing`), and each running the frame's callbacks (2,210 ms: `animateFocus` 1,887 ms inclusive, of which drawing 977, the physics' ticks 346, `positionNames` 264, `updateFocus` 403; Three's first use of its shader programs, `onFirstUse`, 228 ms once). The estate's (5,385 ms): **busy only 60%, idle 2,158 ms**; 284 frames, `Commit` 1,765 ms, the frame's callbacks 805 ms. So a 3D settle's time is mostly its count of frames: about 300 at about 50 to 60 a second whatever the map's size, a floor of some five seconds; the repository's picture costs 1.2 times the estate's, where its 2D picture costs 2 times.

**The continuing search** (the repository's picture at the default tuning, 6,829 ms profiled, busy 98%): after the same first picture it tried 13 starts in 5 s. Inclusive: `searchStep` 1,367 ms, `tryAdoptPicture` 1,025, `layoutScene` 1,484 (the first layout's included), **`drawConnections` 1,386 ms** (the wires drawn again for each picture tried or adopted; `anchor` 235 ms self, `drawWire` 118, `gradientFor` 108), `measureRooms` 640, `applyPose` 625, `measureLayoutExtents` 324 (`containerRect` 195 self). Style and layout in that window: 2,336 ms (`UpdateLayoutTree` 1,102, `Layout` 621, `PrePaint` 601). The suite turns the search off by default; 33 spec files set the tuning themselves, and a few of their cases turn it on (`local-map-search`, `local-map-hidden`, `camera-intent.spec.ts:294`, `card-ladder-boxes.spec.ts:455`, the layout lab's search case).

## 2. Every time limit in the suite

[`time-limits.mjs`](time-limits.mjs) reads every `.ts` under `tests/e2e/` but Vitest's `*.test.ts` and writes one row per limit, with file, line, construct, value and kind (`node AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/time-limits.mjs > time-limits.tsv`, from the repository's root). Nothing in the suite was changed.

| Kind | Sites | Files | What it is |
| --- | ---: | ---: | --- |
| **Alarm** | 11 | 4 | A bound whose failure says the product is too slow |
| Net (case limit) | 149 | 45 | `test.setTimeout` (147), the configuration's 30 s for every case, the server's 15 s start |
| Wait (one step) | 351 | 66 | `{ timeout }` on an assertion, a locator or a `waitForFunction` (196); `expect.poll` with Playwright's default 5 s (136); `waitForFunction` with none, so the case's limit (18); one guard on Playwright's fake clock |
| Deadline in the page | 4 | 4 | a loop run inside the page that throws after 5 or 8 s (the suite's `localMapStill`, its copies in `card-slots`, `inspection`, `local-map-learning`) |
| Fixed pause | 121 written | 43 | `waitForTimeout` (119) and two timers: not limits but costs paid every time; 1,089 ran in the stage |

The alarms, every one:

| Where | What | Bound |
| --- | --- | --- |
| `force-graph-discovery.spec.ts:75`, `:76` | `caseClock`, `cameToRest` seconds | 300 s a case, 120 s a settle |
| `force-graph-update.spec.ts:144`, `:145` | `caseClock`, `cameToRest` seconds | 240 s, 150 s |
| `force-graph-update.spec.ts:49` | "the picture finishes growing within a minute" | 60 s, hard |
| `force-graph-reveal.spec.ts:82`, `:87`, `:102` | `caseClock`, `cameToRest` seconds | 150 s, 90 s |
| `force-graph-focus.spec.ts:318`, `:319`, `:321` | a press's own work, the longest input wait after it, the transition's first frame | 500, 1,000, 400 ms |

How they were told apart. An alarm's own message names speed: the clocks of `force-graph-observation.ts` say "Slow, not broken", and the three press bounds of `force-graph-focus` measure a duration and are documented as the switch-cost fix's promise. Everything else fails with Playwright's "Timeout N ms exceeded" or a message about what did not appear, and was counted a plain wait, including `test.setTimeout` (three of the four alarm files name their own limit "only the net"). Two were judgment calls: `force-graph-update.spec.ts:49` is a poll loop's deadline, but its message promises a time, so it is counted an alarm and stays; `force-graph-defaults.spec.ts:136` compares a time with a bound on Playwright's fake clock, a guard that the case reads the phase it means, so it is a plain wait. A further kind no construct shows: several nets and waits are sized from measured product time ("the budgets are twice the measured times", `local-map-packing.spec.ts:110`; "the budget is sized to that work", `still-picture.spec.ts:380`), and a slower product reaches them. They are counted plain waits here, since their message is a timeout, and nothing below rests on changing any limit of either kind.

## 3. Where the stage's 43 minutes go

**How.** The whole stage once, on this worktree's build, 04:27:03 to 05:10:03 UTC, the machine shared with the two other builders' lane holds before and after it (load 1.6 to 5.3 during it). The two-pass runner hands its arguments to both passes, so a reporter was added on the command line and nothing in the configuration: [`duration-reporter.cjs`](duration-reporter.cjs) appends one line per finished case (its place, pass, worker, start, duration, status, the first page it opened, and its time split by what its steps were doing). Both passes appended to one file. The per-case data is [`cases.tsv`](cases.tsv); the tables are [`cases-analyse.mjs`](cases-analyse.mjs)'s.

```bash
SUITE_TIME_OUT=/tmp/claude-1000/st/cases.jsonl node scripts/browser-lane.mjs --label suite-time --max-seconds 5400 -- \
  node scripts/e2e-passes.mjs --reporter=list,$PWD/AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/duration-reporter.cjs
node AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/cases-analyse.mjs /tmp/claude-1000/st/cases.jsonl --slowest 40 --tsv cases.tsv
```

(The command line replaces the configuration's own reporters, so this run wrote no HTML report.) 609 cases: 596 passed, 6 failed, 7 skipped (the table's not-applicable scenarios). The bundle of this repository carried no history in this run (below); that shortens four cases of `history-panel.spec.ts` by about 9 s in all and changes nothing else measured.

**By what the steps were doing**, over the 4,827 s of case time:

| Step kind | s | Share |
| --- | ---: | ---: |
| Assertions that poll (`expect(...).toHave…`, `expect.poll`) | 1,141 | 23.6% |
| `waitForFunction` | 720 | 14.9% |
| Gestures (click, press, mouse, wheel, drag) | 616 | 12.8% |
| `evaluate` (the instruments' readings and the specs' own) | 587 | 12.2% |
| Locator waits (`waitForSelector`, `locator.waitFor`) | 578 | 12.0% |
| **Fixed pauses (`waitForTimeout`), 1,089 of them** | **462** | **9.6%** |
| Navigation, to the load event | 248 | 5.1% |
| Fixtures and hooks (context, page, storage) | 157 | 3.3% |
| Queries, screenshots, other | 86 | 1.8% |
| Outside any step (the specs' own work in Node, such as the layout lab's) | 241 | 5.0% |

Where the pauses are: `still-picture.spec.ts` 67.5 s (130 pauses, 23% of its time), `closed-directory-looks` 52.1 s (31%), `descriptions-zoomed-out` 46.1 s (46%), `hidden-file-cells` 42.6 s (38%), `closed-directory-families` 40.1 s (56%), `local-map-directories` 26.8 s, `local-map-branches` 18.5 s, `local-map-keyboard` 18.1 s (100 Tab presses with 180 ms after each: 83% of the case), the scenario table 15.8 s. Four of the five heaviest files open with the same helper, `waitForSelector(".branch-mode")`, `localMapSettled`, then `waitForTimeout(500)`: half a second after the suite's own test of rest has passed.

**By the map a case opens first:**

| Map | Cases | Case time (s) | Share | Mean (s) | Where its time goes |
| --- | ---: | ---: | ---: | ---: | --- |
| This repository | 332 | 3,157 | 65.4% | 9.5 | locator waits 17%, `waitForFunction` 15%, gestures 15%, `evaluate` 15%, pauses 11%, assertions 11% |
| Estate | 153 | 992 | 20.6% | 6.5 | assertions 52% (most of them polls on a 3D settle), gestures 10%, pauses 9% |
| History samples | 59 | 549 | 11.4% | 9.3 | assertions 52%, `waitForFunction` 27% |
| Rosetta | 40 | 120 | 2.5% | 3.0 | `waitForFunction` 30%, `evaluate` 25% |
| None (no page opened, or `about:blank`) | 23 | 6 | 0.1% | 0.3 | |
| Link targets | 2 | 2 | 0.1% | 1.2 | |

The tidepool sample is not part of the suite (`e2e-bundles.mjs` does not build it) and no case opens it.

**By spec file**, the twenty longest of 77 (the rest are in [`cases.tsv`](cases.tsv)):

| Spec file | Cases | Case time (s) | Share | Mean (s) |
| --- | ---: | ---: | ---: | ---: |
| still-picture.spec.ts | 12 | 297.9 | 6.2% | 24.8 |
| card-ladder-boxes.spec.ts | 6 | 294.1 | 6.1% | 49.0 |
| history-emphasis.spec.ts | 16 | 216.7 | 4.5% | 13.5 |
| history-scrubber.spec.ts | 17 | 189.1 | 3.9% | 11.1 |
| layout-lab.spec.ts | 14 | 186.0 | 3.9% | 13.3 |
| closed-directory-looks.spec.ts | 7 | 169.4 | 3.5% | 24.2 |
| force-graph-focus.spec.ts | 15 | 159.5 | 3.3% | 10.6 |
| card-reading.spec.ts | 17 | 150.4 | 3.1% | 8.8 |
| force-graph-exploration.spec.ts | 8 | 149.7 | 3.1% | 18.7 |
| scenarios/still-pictures.spec.ts | 50 | 131.0 | 2.7% | 2.6 |
| local-map-directories.spec.ts | 14 | 130.9 | 2.7% | 9.4 |
| local-map-branches.spec.ts | 11 | 119.6 | 2.5% | 10.9 |
| camera-intent.spec.ts | 12 | 114.7 | 2.4% | 9.6 |
| hidden-file-cells.spec.ts | 7 | 111.3 | 2.3% | 15.9 |
| descriptions-zoomed-out.spec.ts | 9 | 101.0 | 2.1% | 11.2 |
| history-panel.spec.ts | 16 | 100.2 | 2.1% | 6.3 |
| overview-files.spec.ts | 10 | 93.8 | 1.9% | 9.4 |
| force-graph-discovery.spec.ts | 3 | 88.9 | 1.8% | 29.6 |
| zoom-looks.spec.ts | 10 | 84.1 | 1.7% | 8.4 |
| force-graph-update.spec.ts | 2 | 78.9 | 1.6% | 39.4 |

**The 40 slowest cases**, at two workers but for those marked alone, with what their steps were doing and, in the last column, what they wait for as their source shows:

| # | Case | s | Map | Steps | Waiting for |
| ---: | --- | ---: | --- | --- | --- |
| 1 | card-ladder-boxes.spec.ts:444 (any zoom lays out every card, row and pin) | 107.2 | repository | gestures 39.1, locator waits 35.7, evaluate 14.9, waitForFunction 10.0; 12 loads | each press of zoom on a fresh load of the repository, each picture read whole |
| 2 | still-picture.spec.ts:378 (repository, chain, retained) | 86.7 | repository | evaluate 48.1, pauses 6.1, locator waits 6.1; 13 pauses | the still-picture instrument reading the retained picture |
| 3 | card-ladder-boxes.spec.ts:469 (the three looks) | 81.6 | repository | gestures 31.7, locator waits 28.3, evaluate 11.7; 10 loads | as #1 |
| 4 | still-picture.spec.ts:378 (repository, five files, retained) | 72.8 | repository | evaluate 36.2, gestures 8.3, pauses 6.9; 15 pauses | as #2 |
| 5 | force-graph-update.spec.ts:140 (two changes come to rest) | 64.8 | repository | waitForFunction 50.2 | two 3D settles of the repository (an alarm case) |
| 6 | local-map-search.spec.ts:65 (a change of pins restarts the search) | 60.0 | repository | waitForFunction 38.5, evaluate 9.1 | the continuing search, run to its end twice |
| 7 | card-ladder-boxes.spec.ts:491 (walking back in) | 44.8 | repository | evaluate 28.1, gestures 8.0 | reading the picture at each press |
| 8 | closed-directory-looks.spec.ts:90 (each look and shape) | 44.1 | repository | pauses 10.5, waitForFunction 10.3, locator waits 10.1; 11 loads, 21 pauses | a load and a settle per look |
| 9 | card-ladder-boxes.spec.ts:367 (each press out keeps held parts) | 44.0 | repository | evaluate 21.3, gestures 4.7 | reading at each press |
| 10 | closed-directory-looks.spec.ts:90 (second shape) | 43.0 | repository | as #8 | as #8 |
| 11 | still-picture.spec.ts:334 (repository, chain) | 41.2 | repository | gestures 11.6, evaluate 11.4, pauses 8.7; 16 pauses | the instrument's tour of pans |
| 12 | force-graph-exploration.spec.ts:84 (discovery survives a layout switch) | 40.0 | estate | assertions 38.1 | polls on 3D settles |
| 13 | force-graph-discovery.spec.ts:181 (closing and sharing the reader) | 38.9 | repository | assertions 35.8; 5 loads | 3D settles (an alarm case) |
| 14 | local-map-branches.spec.ts:287 (retained exploration, lanes) | 38.2 | repository, alone | evaluate 27.8 | reading every wire and lane of a hundred-wire picture |
| 15 | force-graph-exploration.spec.ts:40 (whole overview) | 36.5 | estate | assertions 35.5 | polls on 3D settles |
| 16 | history-scrubber.spec.ts:785 (a drag places every step) | 36.4 | history | waitForFunction 32.3; 12 pauses | the history's 3D pictures settling after the drag |
| 17 | layout-lab.spec.ts:135 (phone geometry) | 34.1 | repository | evaluate 5.8, locator waits 5.2 | the lab's headless layout in Node beside the page (21 s outside Playwright's steps) |
| 18 | force-graph-identity.spec.ts:171 (directory names clear rings) | 33.7 | estate | assertions 30.9 | 3D settles through the perspective journey |
| 19 | still-picture.spec.ts:334 (repository, five files) | 31.7 | repository | evaluate 9.3, pauses 8.6; 18 pauses | as #11 |
| 20 | history-emphasis.spec.ts:134 (glow at 1 step a second) | 30.7 | history | assertions 25.1; 5 loads | the history's playback at its own pace, one step a second |
| 21 | camera-intent.spec.ts:294 (the search's re-frame never zooms in) | 29.8 | repository | waitForFunction 16.3, locator waits 10.6 | the continuing search (six starts) |
| 22 | closed-directory-families.spec.ts:84 (names at each far look) | 29.6 | repository | pauses 16.0; 32 pauses | fixed pauses after each look |
| 23 | local-map-overview.spec.ts:74 (the overview band's wires) | 29.5 | repository | gestures 2.9; 20 s outside Playwright's steps | the spec's own work in Node between steps |
| 24 | local-map-hidden.spec.ts:51 (the search pauses and resumes) | 29.3 | repository, alone | waitForFunction 23.4 | the continuing search to its end |
| 25 | force-graph-discovery.spec.ts:70 (the archipelago) | 29.0 | repository | waitForFunction 25.9 | a 3D settle that does not come (failed) |
| 26, 27, 29 | history-emphasis.spec.ts:134 (glow at 0.5, dim at 1 and 0.5 steps a second) | 28.1 to 28.9 | history | assertions 22.5 to 23.6 | playback at its own pace |
| 28 | closed-directory-families.spec.ts:84 (second family) | 28.3 | repository | pauses 16.0 | as #22 |
| 30 | hidden-file-cells.spec.ts:236 (Cells under name) | 27.9 | repository | pauses 12.0; 24 pauses | fixed pauses after each look |
| 31 | layout-lab.spec.ts:20 (repository, chain) | 27.4 | repository, alone | evaluate 15.4 | the lab's capture of the page |
| 32 | local-map-branches.spec.ts:454 (rows stand where their wires lead) | 27.0 | repository | locator waits 11.7, gestures 7.9, pauses 5.4 | three loads and Tuning |
| 33 | layout-lab.spec.ts:20 (repository, five files) | 26.1 | repository | evaluate 13.8 | as #31 |
| 34, 35 | closed-directory-looks.spec.ts:314 (far looks keep the name held) | 25.4, 25.5 | repository | pauses 12.0; 24 pauses, 6 loads | fixed pauses after each look |
| 36 | layout-lab.spec.ts:124 (the search judges a cycle's trials) | 24.6 | repository | waitForFunction 15.1 | the page's search with one start |
| 37 | local-map-packing.spec.ts:107 (packing keeps the selected file in place) | 23.8 | repository | assertions 12.6, evaluate 7.5 | a 3D settle of the repository at full energy |
| 38 | force-graph-directories.spec.ts:151 (a hub's Open frames its members) | 23.2 | estate | assertions 16.4 | 3D settles |
| 39 | history-scrubber.spec.ts:726 (the address carries the commit) | 22.5 | history, alone | waitForFunction 17.8; 4 loads | the history's pictures settling |
| 40 | force-graph-exploration.spec.ts:206 (Whole in Structure, off) | 22.2 | estate | assertions 21.2 | 3D settles |

The 40 are 1,540 s, 32% of the case time. Three groups stand out: **3D settles** (#5, 12, 13, 15, 16, 18, 25, 37 to 40, and most of the history cases), which wait at the display's pace; **reading a large picture** (#1 to 4, 7, 9, 11, 14, 19, 31, 33), the instruments' `evaluate` over this repository's map; and **fixed pauses** (#8, 10, 22, 28, 30, 34, 35).

**How much of a case is its load.** Twenty passed cases spread evenly over the table by duration; each one's first address loaded alone by `load-profile.ts --urls` (one load each, 05:27 UTC, load 0.5 to 1.8) and timed to its first picture at rest. The case's own saved settings (an `addInitScript` of its own tuning) were not reproduced, so this is the address's load under the suite's saved settings.

| Case | Case s | Loads in it | Picture | First load to rest, s | Share |
| --- | ---: | ---: | --- | ---: | ---: |
| shell-accessibility.spec.ts:160 | 0.3 | 1 | landing, no picture | (none in 30 s) | |
| world-map.spec.ts:157 | 1.2 | 1 | World Map | (none) | |
| inspection.spec.ts:296 | 1.4 | 1 | 2D, estate | 0.90 | 63% |
| scenarios/still-pictures.spec.ts:66, Go, root | 1.8 | 1 | 2D, Rosetta | 0.83 | 47% |
| layout-lab.spec.ts:31 | 2.2 | 2 | 2D, estate | 1.07 | 49% |
| scenarios/still-pictures.spec.ts:66, Go, retained | 2.7 | 1 | 2D, Rosetta | 1.06 | 40% |
| history-emphasis.spec.ts:431 | 3.2 | 1 | 3D, history | 1.35 | 42% |
| inspection.spec.ts:327 | 3.7 | 1 | 2D, estate | 0.85 | 23% |
| force-graph-wires.spec.ts:380 | 4.1 | 1 | 3D, estate | 4.77 | (the case does not wait for rest) |
| card-slots.spec.ts:226 | 4.6 | 1 | 2D, repository | 1.26 | 28% |
| camera-intent.spec.ts:139 | 5.1 | 1 | 2D, repository | 1.63 | 32% |
| pin-clicks.spec.ts:175 | 6.1 | 1 | landing | (none) | |
| closed-directory-families.spec.ts:137 | 7.1 | 1 | 2D, estate | 0.93 | 13% |
| cited-by.spec.ts:26 | 8.3 | 1 | 3D, repository | 22.2 | (the case does not wait for rest) |
| force-graph-focus.spec.ts:388 | 9.7 | 1 | 3D, estate | 1.18 | 12% |
| history-emphasis.spec.ts:220 | 10.6 | 2 | 3D, history | 2.96 | 28% |
| still-picture.spec.ts:378, estate chain | 12.8 | 1 | 2D, estate | 1.08 | 8% |
| spatial-legend.spec.ts:234 | 16.3 | 3 | 2D, repository | 1.42 | 9% |
| layout-lab.spec.ts:20, repository five files | 26.1 | 1 | 2D, repository | 3.75 | 14% |
| card-ladder-boxes.spec.ts:444 | 107.2 | 12 | 2D, repository | 2.24 | 2% (12 loads: about 25%) |

Over the fifteen cases whose first picture rests within their own time, the first load is 22.5 s of 214.4 s, **10%**. Counting every load: the stage made 889 navigations; at the sample's median of 1.2 s from navigation to rest that is about 18 minutes of the 80, **about a fifth**. The other four fifths are gestures and what they set moving, the polls and waits on it, the instruments' readings, and the fixed pauses.

**Failures, each run again alone** (`npx playwright test … --repeat-each 3`, one worker, 05:14 to 05:18 UTC):

| Case | In the stage | Alone | Reading |
| --- | --- | --- | --- |
| `force-graph-discovery.spec.ts:70` | failed, 29.0 s: "did not come to rest within 2700 substeps … after 2707 substeps, 1364 frames and 24.3 s it was still moving" | **failed 3 of 3**: 2,710, 2,726, 2,724 substeps at 59 to 60 frames a second | a fault: the largest group grown from its seed does not come to rest within its substep bound, the machine idle or not. Not the load |
| `force-graph-focus.spec.ts:182` | failed: the focused sphere 30.7 px from centre against 8 | **failed 1 of 3** (22.7 px) | a race in the focus's framing, with or without a neighbour |
| `history-panel.spec.ts:137`, `:164`, `:295` (two sizes) | failed at once: "/ carries a history" | **passed 4 of 4** once the bundle carried one | this worktree's: `npm run live-docs:history` had never run in it. The main checkout's `.mdmd/history/` was copied in (ignored by git) and the bundle rebuilt (`npm run live-docs:visualize`, 5.2 s) |
| `history-panel.spec.ts:249` (in that rerun, not in the stage) | passed | failed once in the rerun: `apiRequestContext.get: socket hang up` | the test's own request for the bundle; the same error was seen once on 2026-11-17 and not reproduced. The server's, not the product's |

## 4. A third worker: not measured

After the stage the lane was not free long enough for a pass of some thirty minutes: another builder's timed CPU runs of up to fifteen minutes and a third builder's single cases were queued throughout (this builder's own short holds waited 150 to 670 s each). Run without that, a third worker would also have disturbed their timings. So no number is offered; what the numbers here allow is a bound: the first pass ran 78.1 minutes of case time in 40.4 minutes, 1.93 at once, so a third worker can at best bring it to about 27 minutes, and the measurements of 2026-11-17 (four workers stretched every case by half and failed two or three in a hundred) say the real figure lies well above that.

## 5. The gate's stages that are not the browser

Asked for by the root during the leg. One run of `npm run safe:commit` (no `--e2e`) in this worktree, in the lane, 05:31:29 to 05:34:42 UTC, load 1.6 at its start and 7.7 at its end (other builders' work had begun beside it). [`gate-time.sh`](gate-time.sh) stamps every line of the gate's output and takes each stage from one `=== label ===` header to the next; neither gate script was touched. It passed.

```bash
node scripts/browser-lane.mjs --label suite-time-gate --max-seconds 900 -- \
  bash AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/gate-time.sh /tmp/claude-1000/st/gate.log
```

| Stage | s | Inside it |
| --- | ---: | --- |
| Live Docs pipeline (generate, then lint) | 14.2 | generate 11.7 s (to `Wrote the graph index`), lint 2.0 s (1,120 files) |
| Lint (`eslint .`) | 39.6 | type-aware: the rules took 19.8 s of it (`no-misused-promises` 4.4 s, `no-unsafe-assignment` 3.8, `no-unsafe-return` 1.4, `no-unused-vars` 1.3, `no-floating-promises` 1.1, `no-unsafe-argument` 1.1); the other ~20 s is parsing and building the TypeScript programs the type-aware rules read, over about 640 files, with the "Multiple projects found" warning on every run |
| Build (`tsc`, three packages) | 13.2 | engine 1.8 s, explorer 10.1 s (its build and a second, `--noEmit` check of `src/client`), generator 0.9 s |
| Type-check of the tests | 15.1 | `--extendedDiagnostics`: 1,258 files, 131,818 lines of TypeScript and 180,181 of declarations; check 11.6 s, program 2.2, parse 1.8, bind 1.1; 771 MB |
| Unit tests (Vitest `unit`, `unit-serial`) | 40.8 | 213 files, 2,680 tests; Vitest's own sums: import 110.7 s, tests 113.5 s over its workers; first file's start to last's end 36.5 s; the longest file `computeHistory.test.ts` 21.6 s, then `git.test.ts` 8.5, `sourceText.test.ts` 8.3, `browser-lane.test.ts` 5.9 |
| Integration tests | 64.1 | 24 files, 231 tests, 269 s of file time in 66 s: the wall is held by its longest files, `history-tree-equivalence.test.ts` 42.1 s, `history.test.ts` 39.2, `pipeline.test.ts` 37.9, `inspect-cli.test.ts` 30.9, `history-reading.test.ts` 30.2 |
| Documentation links, three SlopCop audits | 5.7 | links 0.9 s, markdown 2.1, assets 0.5, symbols 2.2 |
| Whole run | **193.2** | |

The details are from one more run of each of the four longest, in the lane at 05:46 to 05:48 (`vitest run … --reporter=json`, `TIMING=all npx eslint .`, `tsc -p tests/tsconfig.json --extendedDiagnostics`); the stage times are from the gate's own run. **This does not reproduce the main checkout's 8 minutes**: here the stages outside unit and integration took 88 s, where the root's reading of that log leaves about five and a half minutes. What differs was not measured: that run's load (about 3), what its working tree held for the Live Docs pipeline and ESLint to walk, and whether `npm install` or a first `tsx` compile ran inside it. Stamping that log's lines as `gate-time.sh` does would say which stage holds the difference.

## 6. The candidate gains, ranked

Estimates are the stage's wall time at two workers, taken as case time divided by the 1.93 cases the first pass ran at once. None rests on loosening, moving or removing a clock; every alarm above stays as written.

| # | Gain | Kind | Estimate | What would prove it safe | What it gives up |
| ---: | --- | --- | --- | --- | --- |
| 0 | **Finish the container's set-up** (the stuck `playwright install` and the EGL step after it) | machine | not a speed-up: without it the browser suite cannot start, and once the shell is found it would draw in software | the suite's first line naming D3D12 | nothing |
| 1 | **Fixed pauses that follow a settled wait become event waits**: the four helpers' `waitForTimeout(500)` after `localMapSettled`, the 180 ms after each of 100 Tab presses, the 600 to 1,200 ms after a gesture in `still-picture.spec.ts` where a signal of rest exists | test code (plain waits only) | of 462 s of pauses, perhaps half, **~230 s case time, about 2 minutes** | for each case, the reading after the event wait equals the reading after the pause, byte for byte, over five runs; and each case still fails on a bundle broken for its promise (a wait that cannot see a fault proves nothing). A pause that cannot be replaced names a motion the page does not report, which is the product's to say | nothing if the proof holds; pauses that sample motion at chosen moments (the motion specs) stay |
| 2 | **The 2D first render's forced layouts**: read every card's box once, then write (`naturalWidthOf`, `measure`, `pin` in `branch-renderer.ts`, `measureRooms` in `card-reading.ts`, `writeHandleNeeds`, `framePlace`), where today reads and writes interleave and each read recomputes style and layout | product, pictures identical | 585 ms of style and layout in the repository's 1.8 s load; if half goes, ~0.3 s a 2D render of the repository, which every load pays and, if the re-layouts after a press measure the same way (not profiled here), every zoom press and pin change: **~1 to 2 minutes**, and the product faster for its users | screenshots identical to the byte and the layout's published attributes (`data-placement-cost`, `data-order-score`, the directories' `data-segments`) equal over the scenario table and the still-picture instrument's addresses; the measured answers (natural widths, heights, rooms) equal over recorded pages, as a pure function's outputs | nothing |
| 3 | **Instruments that read a large picture more cheaply**: `evaluate` is 587 s (12%), most of it the still-picture instrument, the card-ladder readings and the design audit over this repository's map (#1 to 4, 7, 9, 11, 14 of the slowest) | test code | a third of it, **~200 s case time, about 1.5 minutes** | each reading's JSON identical before and after over the same pages | nothing |
| 4 | **The 3D settle at the frame's pace**: a settle is about 300 physics ticks, one a frame, at 50 to 60 frames a second, a floor of about five seconds whatever the map; on the estate the main thread is 40% idle meanwhile. Taking a second tick in a frame that has the time would reach the same rest in fewer frames | product, a design fork | the estate's and the history's cases spend half their 1,541 s in polls, mostly on 3D settles; if settles halved, **~400 s case time, about 3.5 minutes**, more with the repository's 3D cases | positions at rest equal to the bit over recorded inputs (the same ticks in the same order) and screenshots at rest identical | the motion a person sees would run faster than it does: the entry's pace is the owner's design, so this is theirs to choose |
| 5 | **The continuing search's redraws**: `drawConnections` is 1.4 s of the 5 s search on `generator.ts`, the wires drawn again for each picture tried | product, pictures identical | the cases that turn the search on are about 200 s; a third of it, **~70 s case time, half a minute**; more for users, who always have the search on | the adopted picture and the search's record (`data-search-tried`, `data-order-start`, `data-order-score`) equal, screenshots at rest identical | nothing |
| 6 | **Still-picture halves to the scenario table**: the 93 still-picture cases of the November 18 ledger, 464 s at one worker, against the table's 5.5 promises a second | test structure (the owner's pattern) | saved only as cases are split and their still halves deleted: perhaps **~300 s case time, 2.5 minutes** if all moved | each promise moved is broken on purpose once and the table goes red where the case did | nothing, if every promise moves with its literal made a law or a recorded baseline |
| 7 | **A third worker** | configuration | not measured; at best about 13 minutes off the first pass, in practice less | two whole first passes at three workers with every failure passing alone, and none new | nothing if it holds; the machine shared with other builders is less able to hold it |
| 8 | **No trace recorded while a case passes** (`trace: retain-on-failure` records every case and keeps only failures'; measured on 2026-11-05 at about 8% of a subset's time) | configuration | **~3 minutes** | none needed for the pictures | the trace of a failure, which would have to be taken by running the case again with a trace |

For the gate's other stages (193 s here), ranked the same way:

| # | Gain | Estimate | Proof | What it gives up |
| ---: | --- | --- | --- | --- |
| G1 | **Split the integration stage's longest files** (`history-tree-equivalence`, `history`, `pipeline`, `inspect-cli`, `history-reading`: 42, 39, 38, 31, 30 s) so that its 269 s of file time spread over the workers: the wall is held by the longest file, not by the total | 64 s toward about 30 to 40 s if the longest file halves | the same tests, the same assertions, counted before and after | nothing |
| G2 | **Lint and type-checks share their work**: `eslint .` builds TypeScript programs for its type-aware rules (~20 s), the build checks the explorer twice (10.1 s), and the tests' type-check checks 1,258 files again (15.1 s); one `tsc -b` with project references, or ESLint's project service on a single `tsconfig`, would check each file once | of the 68 s of lint, build and type-check, perhaps 20 to 30 s | the same diagnostics, the same errors on a file broken on purpose | a configuration change to the projects, which is work in itself |
| G3 | **`computeHistory.test.ts` (21.6 s)** holds the unit stage's wall near its 36.5 s with the serial physics project after it | a few seconds | as G1 | nothing |
| G4 | The Live Docs pipeline (14 s), the build of the generator and engine (3 s) and the audits (6 s) | little | | |

## What was run and what was only read

- **Run**: `npm ci`, `npm run build`, `npm run e2e:bundles` (and `npm run live-docs:visualize` again with the history copied in); the load probe in seven lane holds; the whole stage once; the two failures three times each alone; `history-panel.spec.ts` once on the bundle with a history; the 20 sampled addresses once each; `npm run safe:commit` once; the gate's longest stages once more for their detail.
- **Read**: `scripts/e2e-passes.mjs`, `scripts/e2e-bundles.mjs`, `tests/e2e/playwright.config.ts`, `browser-launch.ts`, `renderer-report.ts`, `served-build.ts` (its opening), `still-picture.ts` and `force-graph-observation.ts` (their wait helpers), `scenarios/instrument.ts` and `still-pictures.spec.ts` (their openings), every `tests/e2e` source by the scanner and the contexts of the alarms and the heaviest pauses by eye; `branch-renderer.ts` (the search's start and adoption), `forceGraphView.ts` (its frame loop); `scripts/safe-to-commit.mjs`, `verify.mjs`, `steps.mjs`; the November 17 summary, the November 18 scenario-suite record and `.mdmd/layer-2/internal-tooling.mdmd.md` in full.
- **Not measured**: a third worker; the load and first picture of the World Map and the landing page (no picture of either kind to wait for); a case's own saved settings in the load sample; any software-rendered run.

## Files here

- `README.md`, this record.
- [`cases.tsv`](cases.tsv): the 609 cases of the stage, one row each (137 KB).
- [`load-profile.ts`](load-profile.ts), [`load-analyse.mjs`](load-analyse.mjs): the page's load, timed and profiled.
- [`time-limits.mjs`](time-limits.mjs): the table of time limits, written to standard output.
- [`duration-reporter.cjs`](duration-reporter.cjs), [`cases-analyse.mjs`](cases-analyse.mjs): the per-case record and its tables.
- [`gate-time.sh`](gate-time.sh): the gate's stages without the browser, timed.

No traces, profiles or screenshots are kept: the profiles were 0.2 to 6.7 MB each and are written again by the command above in a minute.
