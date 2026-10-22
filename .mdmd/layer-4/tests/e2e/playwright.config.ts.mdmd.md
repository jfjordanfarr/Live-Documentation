# tests/e2e/playwright.config.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/playwright.config.ts
- Entry: tooling
- Generated At: 2026-10-22T02:20:05.469Z

## Authored
### Purpose

Playwright test configuration for the Membrane Map E2E suite, defining browser setup, web server launch, and reporter settings.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) as part of the Playwright E2E infrastructure setup.
- Runs a single Chromium worker against a pre-built static explorer bundle served via `http-server` on port 8766.
- HTML reports are written to `reports/e2e/` (gitignored); screenshots and traces are captured only on failure.
- One worker, and the files' tests in order, by the owner's rule of 2026-10-19: "E2E playwright must be serialized. Can't be parallellized unless we want to enjoy flaky test fails" ([Turn 12 of the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-12)). This note had justified it by a shared browser context and port, neither of which held; the measured reason ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-11)) is the box: a 3D test's software renderer (SwiftShader in the headless shell, a 26-thread GPU process) takes about nine of the ten cores alone, so under three workers each test ran about one and a half times as long as alone and under four about twice, with 7 and then 9 of the 145 tests over their budgets by three to six seconds, none failing on a fact, and four 2D tests that wait on timed behaviour already take 25 to 29 of their 30 seconds alone. The suite took 9.7 minutes on three workers and 8.7 on four, against 20 on one; the design that would have made more workers honest (3D tests taking turns, budgets that fit the waiting tests) was declined as too complex.
- A `storageState` seeds every test's page with the Local Map's continuing search off (`searchStarts: 0`), so that a picture read after it is drawn is the picture it first drew; a spec that seeds the tuning itself chooses, and the search has its own spec (2026-10-07).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../../../tests/e2e/playwright.config.ts#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `defineConfig`, `devices`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
<!-- LIVE-DOC:END Dependencies -->
