# tests/e2e/playwright.config.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/playwright.config.ts
- Generated At: 2026-10-07T13:20:49.700Z

## Authored
### Purpose

Playwright test configuration for the Membrane Map E2E suite, defining browser setup, web server launch, and reporter settings.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) as part of the Playwright E2E infrastructure setup.
- Runs a single Chromium worker against a pre-built static explorer bundle served via `http-server` on port 8766.
- HTML reports are written to `reports/e2e/` (gitignored); screenshots and traces are captured only on failure.
- `fullyParallel: false` and `workers: 1` because tests share one browser context and the http-server port.
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
<!-- LIVE-DOC:END Dependencies -->
