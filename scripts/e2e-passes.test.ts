import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { configFor } from "../tests/e2e/playwright.config";

/**
 * The two-pass runner, run as the gate runs it, against a stand-in for Playwright's command line that records each
 * call and exits as it is told. The runner is copied beside a `node_modules` holding the stand-in, so that it finds
 * the stand-in where it would find Playwright; nothing in it knows that it is under test.
 */
interface Call { argv: string[]; pass: string; port: string | undefined }

const FAKE_CLI = `
const fs = require("node:fs");
const pass = process.env.LIVE_DOCS_E2E_PASS;
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify({ argv: process.argv.slice(2), pass, port: process.env.LIVE_DOCS_E2E_PORT }) + "\\n");
const outcome = process.env["FAKE_" + (pass || "list")] ?? "0";
if (!pass && outcome !== "0") process.stderr.write("Error: No tests found\\n");
if (outcome === "signal") process.kill(process.pid, "SIGTERM");
else process.exit(Number(outcome));
`;

function runPasses(args: string[], env: Record<string, string> = {}): { status: number | null; calls: Call[]; stderr: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-passes-"));
  try {
    fs.mkdirSync(path.join(root, "scripts"));
    fs.copyFileSync(path.join(__dirname, "e2e-passes.mjs"), path.join(root, "scripts", "e2e-passes.mjs"));
    const fake = path.join(root, "node_modules", "@playwright", "test");
    fs.mkdirSync(fake, { recursive: true });
    fs.writeFileSync(path.join(fake, "package.json"), JSON.stringify({ name: "@playwright/test", exports: { "./cli": "./cli.js" } }));
    fs.writeFileSync(path.join(fake, "cli.js"), FAKE_CLI);
    const log = path.join(root, "calls.jsonl");
    const run = spawnSync(process.execPath, [path.join(root, "scripts", "e2e-passes.mjs"), ...args], {
      cwd: os.tmpdir(),
      encoding: "utf8",
      env: { ...process.env, LIVE_DOCS_E2E_PASS: "", ...env, FAKE_LOG: log }
    });
    const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf8").trim().split("\n").map(line => JSON.parse(line) as Call) : [];
    return { status: run.status, calls, stderr: run.stderr };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

describe("the two-pass runner", () => {
  it("lists the narrowing whole, then runs the shared pass and the alone pass, each with the caller's arguments after its own", () => {
    const { status, calls } = runPasses(["tests/e2e/a.spec.ts", "--grep", "x", "--repeat-each", "2"], { LIVE_DOCS_E2E_PORT: "8791" });
    expect(status).toBe(0);
    expect(calls.map(call => call.pass)).toEqual(["", "shared", "alone"]);
    expect(calls[0].argv.slice(3)).toEqual(["--list", "tests/e2e/a.spec.ts", "--grep", "x", "--repeat-each", "2"]);
    for (const call of calls.slice(1)) {
      // The configuration is found from the runner's own place, whatever the working directory.
      expect(call.argv[0]).toBe("test");
      expect(call.argv[1]).toBe("--config");
      expect(call.argv[2].split(path.sep).join("/")).toMatch(/\/tests\/e2e\/playwright\.config\.ts$/);
      // The runner adds no filter of its own, so the caller's `--grep` is the only one on the line and the pass's own
      // stands in the configuration, where Playwright applies both.
      expect(call.argv.slice(3)).toEqual(["--pass-with-no-tests", "tests/e2e/a.spec.ts", "--grep", "x", "--repeat-each", "2"]);
      expect(call.port).toBe("8791");
    }
  });

  it("runs the second pass when the first fails, and exits with the worse of the two", () => {
    const firstRed = runPasses([], { FAKE_shared: "1" });
    expect(firstRed.calls.map(call => call.pass)).toEqual(["", "shared", "alone"]);
    expect(firstRed.status).toBe(1);
    expect(runPasses([], { FAKE_alone: "1" }).status).toBe(1);
    expect(runPasses([], { FAKE_shared: "1", FAKE_alone: "130" }).status).toBe(130);
  });

  it("counts a pass that ended by a signal as failed", () => {
    const { status, calls } = runPasses([], { FAKE_shared: "signal" });
    expect(calls.map(call => call.pass)).toEqual(["", "shared", "alone"]);
    expect(status).toBe(1);
  });

  it("fails, and runs neither pass, when the narrowing selects no case in either, as Playwright alone fails on it", () => {
    const { status, calls, stderr } = runPasses(["tests/e2e/misspelt.spec.ts"], { FAKE_list: "1" });
    expect(calls.map(call => call.pass)).toEqual([""]);
    expect(status).toBe(1);
    expect(stderr).toContain("No tests found");
  });
});

describe("the browser suite's configuration under each pass", () => {

  /** What a configuration's filters keep of a test's title with its tags, as Playwright reads it. */
  const keeps = (config: { grep?: RegExp | RegExp[]; grepInvert?: RegExp | RegExp[] }, title: string): boolean => {
    const all = (value: RegExp | RegExp[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
    const grep = all(config.grep);
    return (grep.length === 0 || grep.some(pattern => pattern.test(title))) && !all(config.grepInvert).some(pattern => pattern.test(title));
  };

  it("splits the cases between the two passes, each case in exactly one, and keeps every case at one worker when run directly", () => {
    const [shared, alone, direct] = [configFor("shared"), configFor("alone"), configFor(undefined)];
    expect([shared.workers, alone.workers, direct.workers]).toEqual([2, 1, 1]);
    for (const title of ["case.spec.ts a slow case @alone", "case.spec.ts a quick case"]) {
      expect([keeps(shared, title), keeps(alone, title)].filter(Boolean), title).toHaveLength(1);
      expect(keeps(direct, title), title).toBe(true);
    }
    expect(keeps(alone, "case.spec.ts a slow case @alone")).toBe(true);
    // The second pass writes its failures and its report where the first pass's stay.
    expect(alone.outputDir).toBeDefined();
    expect(alone.outputDir).not.toBe(shared.outputDir);
    expect(JSON.stringify(alone.reporter)).not.toBe(JSON.stringify(shared.reporter));
  });
});
