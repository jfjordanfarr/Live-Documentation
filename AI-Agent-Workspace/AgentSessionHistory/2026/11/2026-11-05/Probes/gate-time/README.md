# November 5, 2026 — where the hour-long gate goes, and what would shorten it

The owner's question of [Turn 8](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-8): the local gate, `npm run safe:commit -- --e2e`, takes about an hour today against about half an hour two weeks ago, and a prompt cache lives about an hour, so an agent waiting on the gate comes back to a cold cache. The owner asked for Opus subagents at high or extra-high reasoning, never max, a holistic look at what the suites assert, and use of the machine's resources (20 hardware threads, 62 GB). Three Opus subagents at high reasoning read the logs, the configurations, the specs and the earlier records while the day's fourth gate ran; they ran nothing and changed nothing. Their findings are consolidated here by the root; measurements follow in the last section as the root makes them, one workload at a time.

## In short

- **The tests are the time.** Playwright's 42.2 minutes are 40.8 minutes of the tests' own durations; the unit project's 350 seconds are 46 seconds of tests and about 262 seconds of Vitest starting a fresh Node process for each of 155 files, one after another, from the 9p mount. There is no hidden overhead to remove.
- **The largest cuts that weaken nothing:** split the one deadline-bound unit suite into its own one-worker project and return the rest to parallel workers (about 4.7 minutes); fix the causes of the four timing-bound browser failures seen today, each of which costs a 42-minute rerun (every full run today failed at least one); stop recording a full DOM-snapshot trace of every passing test (1 to 3 minutes); pin the browser to one thread per core (1 to 2 minutes); serve the bundles from the container's disk (under a minute).
- **The owner's calls, worth about seven minutes more:** whether the still-picture deck's tour and journeys, which feed only the scoreboard, belong in the gate; whether a 204-second browser proof that the force graph rests at half energy is a promise of its own beside its unit test; whether promises that are not about this repository may move from the growing repository bundle to the frozen estate sample; whether coverage, which nothing consumes, stays on by default; and whether the clone and its `node_modules` stay on the Windows drive over 9p, which slows every process start and file read.
- **Two gaps found on the way, worth fixing regardless:** `overlapsAmong`, the only judge of label collisions in about fifteen specs, has no test of its own, so a judge that always found nothing would pass the whole suite; and two contrast helpers assume different backdrops.

## Where the gate's minutes go (the second gate of the day, 16:11 to 17:07 UTC)

| Phase | Minutes | Basis |
| --- | --- | --- |
| Live Docs generate and lint, ESLint, three `tsc` builds, the tests' type check | 4.8 | gate start to the unit project's start |
| Unit project, one worker | 5.8 | `Duration 349.86s`: tests 45.9 s, import 47 s, transform 11.7 s, the rest per-file process isolation and coverage |
| Integration project | 1.0 | bound by sequential `tsx` spawns in two files |
| Doc links, three SlopCop audits (`slopcop:markdown` 45 s), three bundle builds | 2.3 | |
| Playwright, one worker, 302 tests | 42.2 | 40.8 minutes of test durations |

Playwright's minutes: 3D files (`force-graph-*`, `history-*`, `perspective-zoom`, `cited-by`, 82 tests) 18.3; 2D Local Map and reading files (121 tests) 14.8; still-picture (12 tests) 4.0; everything else (87 tests) 3.7. The 24 tests over 20 s take 43 % of the time; the 103 under 3 s take 2.4 minutes together. Since November 2 the suite grew from 265 tests in 2,042 s to 302 in 2,450 s: the repository bundle is a fixture that grows with every commit (926 files now), and the November 4 reading cards made each Local Map layout and search trial costlier.

The unit project: only `forceGraphPhysics.test.ts` needs a worker to itself (22.4 s of the 45.6 s of test time; the next slowest file takes 2.3 s). At the default 19 workers the same project took 46 s on November 3, with coverage on.

## Ranked changes that weaken no assertion, threshold, timeout or worker count

1. **Split the unit project** (patch prepared): a `unit-serial` project holding only the physics suite at one worker, in a later group so that it runs after every other file, and the `unit` project back on the default workers. Estimated 65 to 80 s instead of 355, about 4.7 minutes.
2. **Remove the causes of the timing-bound browser failures.** `explorer-navigation.spec.ts:26` opens a second browser context while the sender's whole-repository 3D settle still runs, two 3D renders at once inside one test, the very condition the serialization rule exists to avoid: a `goto("about:blank")` before the second context, nothing being asserted on the sender afterwards (the same pattern at :80). `perspective-zoom.spec.ts:193` installs its frame sampler after four round trips to a page busy drawing the transition and can miss the 0.22 to 0.52 fold window: install the sampler before the click, which also makes the case stronger since it then sees every frame. `local-map-search.spec.ts:100` runs at 97 % of its budget on this repository's five files although its claim is the search's stopping rule, which its sibling at :37 already holds on the frozen estate fixture for that stated reason: use the estate there too. `force-graph-focus.spec.ts:70`, which failed at 34 s in the fourth gate, is a product cost: the 2D click returned 8 s after its input and the 3D click 11 s, the page's main thread blocked in `perspectiveTransition.ts` (`captureLocalScene` samples up to 257 points per wire; `visualCopy` inlines about 400 computed declarations on every element of every card), a freeze a person sees too, and the subject of its own measurement.
3. **Trace recording.** `retain-on-failure` records a full trace of every test and discards it on a pass: DOM snapshots before, at and after every action, a screencast, and the network including the 7 MB graph. One failing test's trace held 49 snapshots totalling 57 MB, two of them 29 MB, each 1.1 to 1.5 s to capture, written to the 9p mount. Options: `trace: "off"` for the gate with `--trace on` for a rerun of a failure; or `{ mode: "retain-on-failure", snapshots: false }`, which keeps the action log, console, network and screencast; or the trace kept but written to the container's disk. A choice about failure evidence, to state in the config's Live Doc. Estimated 1 to 3 minutes.
4. **One thread per core.** The November 2 probe measured CPU affinity alone at 17 to 21 % off a large 3D settle and 6.6 % off a 33-test paired run, with the 2D specs within noise; the frame-rate flags, which hurt the 2D specs, are left out. `taskset -c 0,2,4,…,18` before the Playwright command where `taskset` exists. Estimated 1 to 2 minutes.
5. **Serve the bundles from the container's disk.** About 450 page loads at about 0.1 s of 9p reads each. Under a minute.
6. **Small:** memoize `loadGraph` per worker (under 30 s); the 180 ms × 100 wait in `local-map-keyboard.spec.ts:23` names no motion or throttle, so two animation frames may keep the observation (about 15 s; ask first).
7. **The static steps:** the packages are type-checked three times (typed ESLint, the build, the tests' tsconfig, not incremental); `eslint --concurrency=auto`, incremental builds, one `tsc -b` over the references, and running the independent static steps side by side are the candidates, unmeasured, perhaps 1.5 to 3 minutes before the tests and about 50 s after them.
8. **The integration project:** `pipeline.test.ts` (49 s) and `inspect-cli.test.ts` (43 s) spawn `tsx` sequentially; asynchronous spawning with concurrent independent cases would bring the project from about 61 s to 35 to 40 s. Bundling the CLIs is advised against: they would no longer run the way people run them.

Not recommended: more Playwright workers (the owner's rule of October 19 and the November 2 numbers stand); the frame-rate flags; shortening fixed waits, each of which names a motion length, a throttle or an observation window; the 3D frame's cost (18 minutes sit in settles, and fewer triangles or more physics ticks per frame would change the picture or what a spec reads as ticks); `--pool=threads` or `isolate: false` for the unit project, since mocks would leak between files.

## The owner's calls

- **The still-picture deck in the gate.** Its tour, journeys and screenshots feed only the scoreboard; its four Force Graph cases assert only that a canvas exists. About 1.5 to 2.5 minutes.
- **The half-energy rest in the browser.** `force-graph-update.spec.ts:128` spends 204 s proving on the whole repository what its unit test proves on the physics alone: five whole-repository settles.
- **Promises that are not about this repository.** Wires, identity and packing variants (about 51 s), the setup settles in `force-graph-focus.spec.ts:167` and `:70` and `local-map-packing.spec.ts:102` (about 60 s), `local-map-search.spec.ts:65` (about 40 s) could hold their claims on the frozen estate sample, which stops the drift toward budgets as the repository grows. Which claims are about this repository is the owner's judgement.
- **Overlap in the browser suite.** A first batch of ten consolidations saving about 134 s, every assertion kept and placed: the retained five-file picture read in full by both `local-map-branches.spec.ts:269` and the deck's retained case; `local-map-hidden.spec.ts:95` waiting for a whole search to finish when it asserts only that it resumed; `card-reading.spec.ts:244` repeating the tap loop of :77; `force-graph-focus.spec.ts:147` contained in `force-graph-exploration.spec.ts:79`; small folds in history-emphasis, history-panel, layout-lab, local-map-corset, explorer-history, search-bar, tuning, card-slots, world-map-design and inventory-counts. Merges and deletions of tests are the owner's to approve.
- **Coverage.** On by default since the scaffolding commit with no owner decision; nothing consumes it (no threshold, no CI artifact, the folder git-ignored), and the report left after a gate is the integration project's alone, since that run empties the folder first. Off by default with an opt-in `test:coverage` script would save an unmeasured 10 to 30 s and the block counters in the physics loops.
- **The 9p mount.** The clone and its `node_modules` sit on the Windows drive; every Node start and file read pays for it. A clone on the container's disk may be the largest single gain across the gate, and it is a devcontainer decision.

## Gaps found on the way

- `overlapsAmong` in `tests/e2e/design-audit.ts` judges "no two labels collide" for about fifteen specs, every one of which expects an empty list, and has no test of its own; a small Vitest file would make a broken judge fail.
- `local-map-path.spec.ts:75` assumes a black backdrop behind transparent layers and `tests/e2e/contrast.ts:32` a white one; the path spec should reuse the contrast helper.
- `world-map.spec.ts:161` reads back through the test handle the position it just wrote, and the "nothing changes size" check at :176 reads a CSS font size that scaling the world would not change, so it cannot fail.
- The November 2 probe said no heavy file settles the same picture twice; `force-graph-discovery.spec.ts:121` and `:161` both open and settle the generator.ts pin picture.

## What was tried before (from the records)

| When | Tried | Outcome |
| --- | --- | --- |
| October 17 to 19 | Four and three workers | 9 of 145 and 7 of 145 over budget; the owner: "E2E playwright must be serialized" |
| October 19 | Five budgets raised to about twice their measured times | Gate green at 25.7 minutes |
| November 2 | Two and three workers; 2D alone on four workers with WebGL off | 3, 8 and 4 failures; the rule stands |
| November 2 | The deck's tour without samples along wires | still-picture 520 to 306 s, scoreboard identical; kept |
| November 2 | New headless mode, GPU blocklist off, a quarter of the pixels | Same frame cost |
| November 2 | CPU affinity and frame-rate flags | Together 4 % off the suite; pinning alone 6.6 % off 33 tests; not built |
| November 4 to 5 | Unit project on one worker for one five-second deadline | 350 s today against 154 s at four workers |

## Measurements

Made by the root after the fourth gate, with nothing else running, from 20:23 to 20:50 UTC; the chain's log is `speed.log` in the session scratchpad.

**The unit split, three runs.** With `forceGraphPhysics.test.ts` in its own `unit-serial` project at one worker after the rest, and the `unit` project back on the default workers, coverage still on:

| Run | Vitest `Duration` | Wall clock | The 2,000-body case |
| --- | --- | --- | --- |
| 1 | 73.1 s | 83.0 s | 2.63 s of its 5 s |
| 2 | 72.6 s | 76.4 s | 2.64 s |
| 3 | 68.2 s | 73.2 s | 2.61 s |

Against 349.9 s in the gate: about 4.6 minutes saved, every test passing, the deadline-bound case at half its budget each time (it took 4.1 s alone yesterday with the whole project on one worker, so the serial group running after everything else costs it nothing). Kept.

**Coverage off.** The same two projects with `--coverage.enabled=false`: `Duration` 41.4 s, wall clock 45.3 s, against 68 to 73 s with it on; the integration project alone 50.1 s against 60.9 s in the gate. About 40 s per gate, nothing consuming the report. Proposed to the owner, not changed.

**The three cause fixes, five runs each, every one passing:** `explorer-navigation.spec.ts:26` 15.2 to 15.9 s where it had taken 19 to 37 s; `local-map-search.spec.ts:100` 1.3 to 1.4 s on the estate where it had taken 29 to 32 s on the repository; `perspective-zoom.spec.ts:193` 7.7 to 7.8 s with every frame seen. Kept: about 50 s per gate, and no 42-minute rerun for these three.

**The trace and pinning, on a 36-test subset** (`card-reading`, `force-graph-focus`, `perspective-zoom`), the same bundles, one worker:

| Variant | Wall clock | Test time |
| --- | --- | --- |
| As configured, a full trace recorded for every test and kept on failure | 5.7 min | 5.40 min |
| `--trace off` | 4.8 min | 4.47 min |
| Pinned to one thread per core (`taskset`), trace as configured | 5.7 min | 5.33 min |
| Trace kept on failure without DOM snapshots (the setting adopted) | 5.2 min | 4.86 min |

The trace's recording took about a sixth of this subset's time, and leaving out the DOM snapshots alone recovered about half of that while keeping the action log, console, network and screencast for a failure; the subset is rich in actions and DOM, so the whole suite's share is likely smaller than that, perhaps 2 to 4 minutes with the snapshots off and 3 to 5 with the trace off, which remains the owner's option. Pinning gained nothing here, where the 3D pictures are the small estate's; the November 2 measurement of pinning alone was on large settles, and the whole-suite claim stays unverified, so pinning is not adopted. A single baseline run was used for the subset rather than the A, B, A pattern the profile asked for; runs vary 5 to 16 % between repetitions, so the trace's saving is approximate.
