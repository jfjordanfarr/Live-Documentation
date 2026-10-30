import { defineConfig, devices } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * Playwright E2E configuration for the Live Docs Explorer.
 *
 * Tests run against a pre-built static explorer bundle served via http-server.
 * The `webServer` block starts the server automatically before the first test
 * and tears it down after the last.
 *
 * Run:   npx playwright test --config tests/e2e/playwright.config.ts
 * Or:    npm run test:e2e
 *
 * The server's port is 8766 unless `LIVE_DOCS_E2E_PORT` names another, so that two checkouts of the repository
 * (a builder's worktree beside the main tree, 2026-10-30) can run the suite at the same time, each against its own
 * built bundle; `reuseExistingServer` would otherwise hand the second run the first one's pages.
 */
const port = Number(process.env.LIVE_DOCS_E2E_PORT ?? 8766);
const site = `http://localhost:${port}`;

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  // One worker, the owner's rule (2026-10-19): a 3D test's software renderer takes about nine of the box's ten cores
  // alone, so tests run beside each other overrun their budgets; the measurements are in this file's Live Doc.
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../../reports/e2e" }]],
  timeout: 30_000,

  use: {
    baseURL: site,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    // The Local Map's continuing search is off for the suite, so that a picture read after it is drawn is the picture
    // it first drew; the search has its own spec, and a spec that seeds the tuning itself chooses (2026-10-07).
    storageState: {
      cookies: [],
      origins: [{ origin: site, localStorage: [{ name: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) }] }]
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npx http-server ../../dist/explorer -p ${port} -c-1 --silent`,
    port,
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
