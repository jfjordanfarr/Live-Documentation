# vitest.config.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: vitest.config.ts
- Entry: tooling
- Generated At: 2026-11-08T19:07:04.903Z

## Authored
### Purpose
Runs three Vitest projects: `unit` over ordinary package, script, audit and browser-helper tests; `unit-serial` over suites whose unchanged deadlines require an otherwise idle machine; and `integration` over generator and CLI fixture suites with their existing longer deadlines.

### Notes
- The resolver prefers `.ts` over `.js` beside it, so that a stray compiled twin is never what the tests exercise, and aliases the three packages as `tsconfig.base.json` does. The integration project's timeouts are long on purpose: every suite there runs the generator over a fixture workspace or spawns the CLI through tsx. Coverage covers package sources only.
- Began on 2025-10-16 with the repository's scaffolding; the unit project last widened on 2026-10-14 to take the browser suite's pure tests. Gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

The unit tests run as two projects since the [November 5 scheduling change](../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-8), measured in [the gate-time probe](../../AI-Agent-Workspace/Probes/2026-11-05/gate-time/README.md): three runs of 73.1, 72.6 and 68.2 s against 349.9 s, the 2,000-body case at 2.6 s of its 5 s each time. This followed the [November 5 verification](../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9). That verification found an exact 2,000-body physics comparison in `forceGraphPhysics.test.ts` exceeding its unchanged five-second deadline at 19 workers (7.710 s, the runner's default on the observed 20-logical-CPU machine) and at four (5.753 s), and taking 4.117 s in a complete one-worker run, so the whole unit project was put on one worker; in the gate that took about 350 s, against about 46 s for 154 files on 19 workers on 2026-11-03. Now `unit-serial` holds the deadline-bound suites, listed in `serialUnitFiles`, on one worker and in a later group (`sequence.groupOrder`) than every other project's files, so nothing runs beside them, while `unit` runs every other file on the default workers. A suite belongs in `unit-serial` only when it is measured to miss an unchanged deadline under parallel load. These are observed runs, not universal timing guarantees. All fixtures, assertions, coverage and deadlines remain; integration scheduling and CI's opt-in browser gate are unchanged.

On November 8, 2026, measured contention admitted two more suites to that same serial stage. The history keyframe/replay case exceeded its unchanged 5,000 ms deadline in two candidate full-unit runs (6,970 and 7,498 ms) and on a pristine `5b610371` control with its own dependencies/build (7,057 ms); its unchanged seven-test file passed in isolation with 1.60 s of test work. The approximation oracle's full 64-file picture comparison exceeded the same deadline under candidate parallel load (5,235 ms), while its unchanged four-test file passed in isolation with 1.10 s of test work; its whole-picture input does not depend on the hop default. Both suites retain every case, input, assertion and coverage setting. Only their execution stage changes; the ordinary unit workers, integration scheduling and deadlines are unchanged.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../vitest.config.ts#L23)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `vitest/config` - `defaultExclude`, `defineConfig`
<!-- LIVE-DOC:END Dependencies -->
