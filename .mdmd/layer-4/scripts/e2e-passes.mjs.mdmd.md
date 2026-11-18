# scripts/e2e-passes.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/e2e-passes.mjs
- Entry: command `test:e2e` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-11-18T17:24:34.402Z

## Authored
### Purpose
Runs the browser suite in two passes over bundles already built: every case that can share the machine at two workers, then the few tagged `@alone` at one worker. It is what `npm run test:e2e` runs after the bundle builds, so it is the browser stage of the gate.

### Notes
- Written on 2026-11-18, after the first whole run at two workers in the container on the Linux disk ([what was measured](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-whole-suite-at-two-workers)): 482 of 488 cases in 41.9 minutes where one worker takes 72. Four of the failures were cases whose own work nearly fills their time limit when they have the machine to themselves (27 to 48 s against 30 and 60), so a second worker beside them pushed them over; each passed alone.
- Why two passes and not longer limits: the owner asked for as many workers as "the system reliably tolerates" ([Turn 4 of the November 17 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-4)) and had decided on 2026-11-12 that the clocks on slow cases stay as the alarm on the product's speed ([Turn 3 of the November 12 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/2026-11-12.1.record.md#turn-3)). Running a slow case alone leaves its clock meaning what it meant at one worker.
- A case earns the `@alone` tag by failing at two workers and passing alone, and for no other reason. A case that fails at two workers for another cause, such as a reading taken before the picture is complete, is mended at that cause and not tagged.
- Arguments are handed to both passes, so `node scripts/e2e-passes.mjs --list` shows that the two passes hold every case between them, and a spec file or `--repeat-each` narrows or repeats both. A pass that selects no case passes.
- The second pass sets `LIVE_DOCS_E2E_PASS=alone`, by which the configuration gives it a report and a folder of failure artifacts of its own (`reports/e2e-alone/`, `test-results-alone/`), since each Playwright run clears the folders it writes to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
<!-- LIVE-DOC:END Dependencies -->
