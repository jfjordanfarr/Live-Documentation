import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { browserLaunchOptions } from "./browser-launch";
import { serverPortForThisRun, type ServerPort } from "./served-build";

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
 * The server is the suite's own, on a port found free unless `LIVE_DOCS_E2E_PORT` names one, and a named port that
 * already answers is refused unless `LIVE_DOCS_E2E_REUSE=1` asks to use it: several checkouts run the suite on one
 * machine at once, and a run handed another checkout's server would test that checkout's pages without a word
 * (2026-11-19). The first global setup proves that the server serves this checkout's `dist/explorer` and that its
 * bundles were built together (`served-build.ts`).
 */
// http-server's own script, run by this Node: through `npx` a wrapper stood between Playwright and the server, and a
// cleanup that ended the wrapper left the server holding its port (2026-11-19).
const httpServer = require.resolve("http-server/bin/http-server");
// Set by scripts/e2e-passes.mjs: "shared" for its first pass, every case but those tagged `@alone`, at two workers;
// "alone" for its second, those cases at one worker. Unset, Playwright run directly takes every case at one worker. The
// pass's filter stands here and not on the runner's command line, because Playwright applies a configuration's `grep`
// and a command line's `--grep` together, where a second `--grep` on the command line replaces the first. The
// configuration is a function of the pass's name, so that a unit test reads each pass's as Playwright receives it.
export const configFor = (pass: string | undefined, { port, reuse }: ServerPort = { port: 8766, reuse: false }) => defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  // One worker when Playwright is run directly, two in the gate's first pass. It was the owner's rule (2026-10-19): a 3D test's software renderer
  // keeps most of the machine busy alone (about fourteen of this box's twenty hardware threads, ten cores, 2026-11-02),
  // so tests run beside each other overrun their budgets. On 2026-11-17 the owner lifted it for "whatever the system
  // reliably tolerates"; measured that day with the graphics card, four workers stretch every case by half and a few in
  // a hundred then fail on waits that ran out. On 2026-11-18 two workers ran the suite in 42 minutes against 72 and
  // failed four cases that pass alone, each on a time limit its own work nearly fills. So `npm run test:e2e` runs two
  // passes (scripts/e2e-passes.mjs): everything at two workers but the cases tagged `@alone`, then those at one worker,
  // with no limit changed. A case earns the tag by failing at two workers and passing alone, and for no other reason.
  // The measurements are in this file's Live Doc.
  workers: pass === "shared" ? 2 : 1,
  ...(pass === "shared" ? { grepInvert: /@alone/ } : pass === "alone" ? { grep: /@alone/ } : {}),
  // The second pass keeps its own report and its own failure artifacts, so that it does not erase the first pass's.
  reporter: [["list"], ["html", { open: "never", outputFolder: pass === "alone" ? "../../reports/e2e-alone" : "../../reports/e2e" }]],
  ...(pass === "alone" ? { outputDir: "../../test-results-alone" } : {}),
  timeout: 30_000,
  // Prints which renderer draws the run's WebGL, and stops a run whose graphics card was asked for and did not answer.
  // First, that the bundles are current and the server serves them; then which renderer draws the run's WebGL.
  globalSetup: ["./served-build", "./renderer-report"],

  use: {
    baseURL: `http://localhost:${port}`,
    // On the host's graphics card where the container was given one, and Playwright's own launch everywhere else.
    launchOptions: browserLaunchOptions(),
    screenshot: "only-on-failure",
    // A trace is kept only for a failure, without DOM snapshots: recording them for every test cost about a sixth of the
    // suite's time (measured 2026-11-05, a 36-test subset: 5.7 min with them, 5.2 without them, 4.8 with the trace off), and one failing
    // test's trace held 57 MB of them. The action log, console, network and screencast remain.
    trace: { mode: "retain-on-failure", snapshots: false },
    // The Local Map's continuing search is off for the suite, so that a picture read after it is drawn is the picture
    // it first drew; the search has its own spec, and a spec that seeds the tuning itself chooses (2026-10-07). Nothing
    // else is seeded: the suite runs on the arrival that ships, at reading size and then eased back to the neighbours
    // (2026-11-22), and a case whose subject is the picture at reading size says so in its own seed (AT_READING_SIZE,
    // still-picture.ts). A suite seeded away from the default would test a product nobody has.
    storageState: {
      cookies: [],
      origins: [{ origin: `http://localhost:${port}`, localStorage: [{ name: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) }] }]
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `"${process.execPath}" "${httpServer}" "${path.resolve(__dirname, "../../dist/explorer")}" -p ${port} -c-1 --silent`,
    port,
    reuseExistingServer: reuse,
    timeout: 15_000,
  },
});

export default configFor(process.env.LIVE_DOCS_E2E_PASS, serverPortForThisRun());
