# `scripts/e2e-passes.mjs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/e2e-passes.mjs`
- Entry: command `test:e2e` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-11-19T21:10:18.314Z

## Authored
### Purpose
Runs the browser suite in two passes over bundles already built: every case that can share the machine at two workers, then the few tagged `@alone` at one worker. It is what `npm run test:e2e` runs after the bundle builds, so it is the browser stage of the gate.

### Notes
- Written on 2026-11-18, after the first whole run at two workers in the container on the Linux disk ([what was measured](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-whole-suite-at-two-workers)): 482 of 488 cases in 41.9 minutes where one worker takes 72. Four of the failures were cases whose own work nearly fills their time limit when they have the machine to themselves (27 to 48 s against 30 and 60), so a second worker beside them pushed them over; each passed alone.
- Why two passes and not longer limits: the owner asked for as many workers as "the system reliably tolerates" ([Turn 4 of the November 17 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-4)) and had decided on 2026-11-12 that the clocks on slow cases stay as the alarm on the product's speed ([Turn 3 of the November 12 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/2026-11-12.1.record.md#turn-3)). Running a slow case alone leaves its clock meaning what it meant at one worker.
- The first whole run of the two passes, the same day ([the run](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-first-whole-run-of-the-two-passes)): 479 of 484 at two workers in 41.1 minutes, then 4 of 4 alone in 2.1; the gate 47 minutes 26 seconds in all against 73 minutes 46 at one worker. Of the five red, two are the suite's known races and one a reading taken too early under load (`history-scrubber.spec.ts:180`, not tagged); the other two were the search-pause cases of `local-map-hidden.spec.ts`, which wait 45 s for a search that takes 40 to 44 s alone, and which were tagged after passing alone twice each. Later that day one of the two was mended to wait only for what it promises and lost its tag, and `history-scrubber.spec.ts:180` was mended at its cause (its wait now also asks that the map has built). Five cases carry the tag.
- A case earns the `@alone` tag by failing at two workers and passing alone, and for no other reason. A case that fails at two workers for another cause, such as a reading taken before the picture is complete, is mended at that cause and not tagged.
- Arguments are handed to both passes, so `node scripts/e2e-passes.mjs --list` shows that the two passes hold every case between them, and a spec file, `--grep` or `--repeat-each` narrows or repeats both. A pass that selects no case passes, but not both (below). The second pass runs whether or not the first passed, and the exit code is the worse of the two.
- The runner names each pass in `LIVE_DOCS_E2E_PASS` (`shared`, `alone`) and adds no filter or worker count of its own: the configuration gives each pass its cases, its workers, and for the second a report and a folder of failure artifacts of its own (`reports/e2e-alone/`, `test-results-alone/`), since each Playwright run clears the folders it writes to. Until a review the same day the runner put the pass's filter on Playwright's command line, where a caller's `--grep` replaced it: `npm run test:e2e -- --grep x` ran the matching untagged cases a second time in the pass meant for the tagged ones, at one worker, and `--grep-invert` let the tagged cases into the first pass. A configuration's filter and the command line's are applied together. `scripts/e2e-passes.test.ts` runs the runner against a stand-in for Playwright's command line and reads the configuration under each pass.
- A narrowing that selects no case in either pass, such as a misspelt spec path, fails, as Playwright alone fails on it. Each pass on its own must be allowed to be empty, so the runner first lists the whole suite with the caller's arguments and no pass's filter (about 4 s for every case) and stops there with Playwright's own "No tests found" when nothing is selected. Until a review on 2026-11-18 such a run passed both passes and exited 0.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:module` - `createRequire`
- `node:url` - `fileURLToPath`
<!-- LIVE-DOC:END Dependencies -->
