#!/usr/bin/env node
// Runs the browser suite in two passes over bundles already built: the cases that can share the machine at two
// workers, then the few tagged `@alone` at one worker. A case is tagged when its own work nearly fills its time limit
// with the machine to itself, so that a second worker beside it pushes it over; running it alone keeps every limit as
// it was written. Which cases and how many workers each pass takes is the configuration's, chosen by
// `LIVE_DOCS_E2E_PASS`, so that the pass's own filter and a caller's `--grep` both apply. Arguments are handed to both
// passes (a spec file, `--grep`, `--list`, `--repeat-each`); a pass that selects no case passes, but a narrowing that
// selects none in either fails before they start. The second pass
// runs whatever the first one did; the exit code is the worse of the two. Each pass keeps its own report and its own
// failure artifacts (see the configuration).
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
const config = fileURLToPath(new URL("../tests/e2e/playwright.config.ts", import.meta.url));
const extra = process.argv.slice(2);

function playwright(args, pass, stdio) {
  const run = spawnSync(process.execPath, [cli, "test", "--config", config, ...args, ...extra], {
    stdio,
    env: { ...process.env, LIVE_DOCS_E2E_PASS: pass }
  });
  if (run.error) {
    console.error(`Playwright could not be started: ${run.error.message}`);
  }
  return run.status ?? 1;
}

function pass(name, value) {
  console.log(`\nBrowser suite, ${name}`);
  return playwright(["--pass-with-no-tests"], value, "inherit");
}

// Either pass may select no case, but not both: a narrowing that selects none at all, such as a misspelt spec path,
// fails as Playwright alone fails on it. So the whole suite is first listed with the caller's arguments and no pass's
// filter, which Playwright refuses with "No tests found" (on the error stream, shown here) when nothing is selected.
const listed = playwright(["--list"], "", ["ignore", "ignore", "inherit"]);
if (listed !== 0) {
  process.exit(listed);
}
const shared = pass("first pass: the cases that share the machine, two workers", "shared");
const alone = pass("second pass: the cases that need the machine to themselves, one worker", "alone");
process.exit(Math.max(shared, alone));
