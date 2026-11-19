# `scripts/e2e-passes.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/e2e-passes.test.ts`
- Generated At: 2026-11-19T21:10:18.330Z

## Authored
### Purpose
Holds the browser suite's two-pass runner, [`e2e-passes.mjs`](./e2e-passes.mjs.mdmd.md), to its promises without a browser: the order of the passes and what each is handed, the exit code, and a narrowing that selects nothing. It also reads the suite's configuration under each pass to show that every case falls in exactly one pass, at two workers for the shared pass and one for the others.

### Notes
- Written on 2026-11-18 by a review of the runner of that day ([the runner's notes](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-first-whole-run-of-the-two-passes)). Until then the runner put each pass's filter on Playwright's command line, where a caller's `--grep` replaced it, and a narrowing that selected no case in either pass exited 0. The cases that hold the runner failed against it as it stood.
- The runner is run as the gate runs it, from a copy placed beside a `node_modules` that holds a stand-in for Playwright's command line. The stand-in records each call and exits as an environment variable tells it, so the runner is tested without knowing it is under test and without a test-only hook in it.
- The configuration of each pass is read from the configuration's own `configFor`, imported as any module is, so that the gate's type-check of the tests holds the case to the configuration's real type. Its first form imported the configuration afresh under each value of `LIVE_DOCS_E2E_PASS`; that dynamic import could not be typed in the tests' project, which reads these files as CommonJS under Node's resolution, and failed the gate's "Type-check tests" stage on 2026-11-19. Its filters are read as Playwright reads them, against a test's title with its tags; that Playwright applies a configuration's filter and the command line's together was read in its source (1.58) and checked with real listings on 2026-11-19: 537 and 5 cases for the whole suite, 1 and 1 for `--grep "search pauses"`, and a misspelt path refused with "No tests found".

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`playwright.config.configFor`](../tests/e2e/playwright.config.ts.mdmd.md#symbol-configfor)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
