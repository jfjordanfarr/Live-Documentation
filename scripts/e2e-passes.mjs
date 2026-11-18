#!/usr/bin/env node
// Runs the browser suite in two passes over bundles already built: the cases that can share the machine at two
// workers, then the few tagged `@alone` at one worker. A case is tagged when its own work nearly fills its time limit
// with the machine to itself, so that a second worker beside it pushes it over; running it alone keeps every limit as
// it was written. Which cases and how many workers each pass takes is the configuration's, chosen by
// `LIVE_DOCS_E2E_PASS`, so that the pass's own filter and a caller's `--grep` both apply. Arguments are handed to both
// passes (a spec file, `--grep`, `--list`, `--repeat-each`), and a pass that selects no case passes. The second pass
// runs whatever the first one did; the exit code is the worse of the two. Each pass keeps its own report and its own
// failure artifacts (see the configuration).
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
const config = fileURLToPath(new URL("../tests/e2e/playwright.config.ts", import.meta.url));
const extra = process.argv.slice(2);

function pass(name, value) {
  console.log(`\nBrowser suite, ${name}`);
  const run = spawnSync(process.execPath, [cli, "test", "--config", config, "--pass-with-no-tests", ...extra], {
    stdio: "inherit",
    env: { ...process.env, LIVE_DOCS_E2E_PASS: value }
  });
  if (run.error) {
    console.error(`Playwright could not be started: ${run.error.message}`);
  }
  return run.status ?? 1;
}

const shared = pass("first pass: the cases that share the machine, two workers", "shared");
const alone = pass("second pass: the cases that need the machine to themselves, one worker", "alone");
process.exit(Math.max(shared, alone));
