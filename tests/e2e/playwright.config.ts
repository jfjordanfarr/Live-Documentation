import { defineConfig, devices } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { browserLaunchOptions } from "./browser-launch";

/**
 * Playwright E2E configuration for the Live Docs Explorer.
 *
 * Tests run against a pre-built static explorer bundle served via http-server.
 * The `webServer` block starts the server automatically before the first test
 * and tears it down after the last.
 *
 * Run:   npx playwright test --config tests/e2e/playwright.config.ts   (every case, one worker, bundles as built)
 * Or:    npm run test:e2e   (builds the bundles, then two passes: see `workers` below)
 *
 * The server's port is 8766 unless `LIVE_DOCS_E2E_PORT` names another, so that two checkouts of the repository
 * (a builder's worktree beside the main tree, 2026-10-30) can run the suite at the same time, each against its own
 * built bundle; `reuseExistingServer` would otherwise hand the second run the first one's pages.
 */
const port = Number(process.env.LIVE_DOCS_E2E_PORT ?? 8766);
const site = `http://localhost:${port}`;
// Set by scripts/e2e-passes.mjs for its second pass, the cases tagged `@alone`.
const alonePass = process.env.LIVE_DOCS_E2E_PASS === "alone";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  // One worker when Playwright is run directly. It was the owner's rule (2026-10-19): a 3D test's software renderer
  // keeps most of the machine busy alone (about fourteen of this box's twenty hardware threads, ten cores, 2026-11-02),
  // so tests run beside each other overrun their budgets. On 2026-11-17 the owner lifted it for "whatever the system
  // reliably tolerates"; measured that day with the graphics card, four workers stretch every case by half and a few in
  // a hundred then fail on waits that ran out. On 2026-11-18 two workers ran the suite in 42 minutes against 72 and
  // failed four cases that pass alone, each on a time limit its own work nearly fills. So `npm run test:e2e` runs two
  // passes (scripts/e2e-passes.mjs): everything at two workers but the cases tagged `@alone`, then those at one worker,
  // with no limit changed. A case earns the tag by failing at two workers and passing alone, and for no other reason.
  // The measurements are in this file's Live Doc.
  workers: 1,
  // The second pass keeps its own report and its own failure artifacts, so that it does not erase the first pass's.
  reporter: [["list"], ["html", { open: "never", outputFolder: alonePass ? "../../reports/e2e-alone" : "../../reports/e2e" }]],
  ...(alonePass ? { outputDir: "../../test-results-alone" } : {}),
  timeout: 30_000,
  // Prints which renderer draws the run's WebGL, and stops a run whose graphics card was asked for and did not answer.
  globalSetup: "./renderer-report",

  use: {
    baseURL: site,
    // On the host's graphics card where the container was given one, and Playwright's own launch everywhere else.
    launchOptions: browserLaunchOptions(),
    screenshot: "only-on-failure",
    // A trace is kept only for a failure, without DOM snapshots: recording them for every test cost about a sixth of the
    // suite's time (measured 2026-11-05, a 36-test subset: 5.7 min with them, 5.2 without them, 4.8 with the trace off), and one failing
    // test's trace held 57 MB of them. The action log, console, network and screencast remain.
    trace: { mode: "retain-on-failure", snapshots: false },
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
