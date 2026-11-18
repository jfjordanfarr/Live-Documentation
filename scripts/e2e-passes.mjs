#!/usr/bin/env node
// Runs the browser suite in two passes over bundles already built: the cases that can share the machine at two
// workers, then the few tagged `@alone` at one worker. A case is tagged when its own work nearly fills its time limit
// with the machine to itself, so that a second worker beside it pushes it over; running it alone keeps every limit as
// it was written. Arguments are handed to both passes (a spec file, `--list`, `--repeat-each`). The exit code is 1 if
// either pass failed. Each pass keeps its own report and its own failure artifacts (see the configuration).
import { spawnSync } from "node:child_process";

const config = "tests/e2e/playwright.config.ts";
const extra = process.argv.slice(2);

function pass(name, args, env) {
  console.log(`\nBrowser suite, ${name}`);
  const run = spawnSync("npx", ["playwright", "test", "--config", config, "--pass-with-no-tests", ...args, ...extra], {
    stdio: "inherit",
    env: { ...process.env, ...env }
  });
  return run.status ?? 1;
}

const shared = pass("first pass: the cases that share the machine, two workers", ["--grep-invert", "@alone", "--workers=2"], {});
const alone = pass("second pass: the cases that need the machine to themselves, one worker", ["--grep", "@alone", "--workers=1"], { LIVE_DOCS_E2E_PASS: "alone" });
process.exit(shared !== 0 || alone !== 0 ? 1 : 0);
