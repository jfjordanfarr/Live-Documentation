# tests/e2e/playwright.config.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/playwright.config.ts
- Live Doc ID: LD-test-tests-e2e-playwright-config-ts
- Generated At: 2026-03-30T19:28:11.577Z

## Authored
### Purpose

Playwright test configuration for the Membrane Map E2E suite, defining browser setup, web server launch, and reporter settings.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) as part of the Playwright E2E infrastructure setup.
- Runs a single Chromium worker against a pre-built static explorer bundle served via `http-server` on port 8766.
- HTML reports are written to `reports/e2e/` (gitignored); screenshots and traces are captured only on failure.
- `fullyParallel: false` and `workers: 1` because tests share one browser context and the http-server port.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.577Z","inputHash":"189aab4af39abcad"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../../../tests/e2e/playwright.config.ts#L13)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `defineConfig`, `devices`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
