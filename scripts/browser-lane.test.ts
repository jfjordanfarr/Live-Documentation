import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  capReached,
  CAPPED_EXIT,
  cutNotice,
  emptyProgress,
  GRACE_SECONDS,
  laneTurn,
  parseArguments,
  readProgressLine,
  ticketName,
  ticketSeq,
  ticketState
} from "./browser-lane.mjs";

/**
 * The browser lane: its queue's rules as pure functions, then the lane itself driven with stand-in commands in a lane
 * folder and lock of the test's own. Nothing here asserts a duration; the cases wait on states and read orders.
 */

interface Ticket { seq: number; label: string; held?: number | null; maxSeconds?: number }

describe("the lane's queue", () => {
  const ticket = (seq: number, label: string, extra: Partial<Ticket> = {}): Ticket => ({ seq, label, held: null, maxSeconds: 300, ...extra });

  it("serves tickets in the order of their numbers, whatever order they are read in", () => {
    const turn = laneTurn([ticket(3, "c"), ticket(1, "a"), ticket(2, "b")], () => "live");
    expect(turn.holder?.label).toBe("a");
    expect(turn.waiting.map(t => t.label)).toEqual(["b", "c"]);
  });

  it("skips a ticket whose process is gone, and the next in line holds", () => {
    const turn = laneTurn([ticket(1, "gone"), ticket(2, "next"), ticket(3, "after")], (t: Ticket) => (t.label === "gone" ? "dead" : "live"));
    expect(turn.holder?.label).toBe("next");
    expect(turn.waiting.map(t => t.label)).toEqual(["after"]);
    expect(turn.dead.map(t => t.label)).toEqual(["gone"]);
  });

  it("numbers tickets so that their names sort as their numbers do", () => {
    const names = [10, 9, 100, 1].map(ticketName).sort();
    expect(names.map(ticketSeq)).toEqual([1, 9, 10, 100]);
    expect(ticketSeq("0000000001.json.123.tmp")).toBeUndefined();
  });

  it("reaches the cap at the cap and not before", () => {
    expect(capReached(1_000, 300, 1_000 + 299_999)).toBe(false);
    expect(capReached(1_000, 300, 1_000 + 300_000)).toBe(true);
  });

  it("keeps a hold whose lane died while its command runs within the cap, and abandons it after", () => {
    const held = ticket(1, "orphan", { held: 0, maxSeconds: 10 });
    const within = (10 + GRACE_SECONDS) * 1000 - 1;
    expect(ticketState(held, { ownerAlive: false, markedAlive: true }, within)).toBe("live");
    expect(ticketState(held, { ownerAlive: false, markedAlive: true }, within + 1)).toBe("abandoned");
    expect(ticketState(held, { ownerAlive: false, markedAlive: false }, 0)).toBe("dead");
    expect(ticketState(held, { ownerAlive: true, markedAlive: false }, 10 ** 9)).toBe("live");
    // A waiter that died before it held has no command to wait for.
    expect(ticketState(ticket(2, "waiter"), { ownerAlive: false, markedAlive: true }, 0)).toBe("abandoned");
  });
});

describe("what the lane reads of a Playwright run", () => {
  const read = (lines: string[]) => lines.reduce(readProgressLine, emptyProgress());

  it("counts the cases announced by each pass and those finished by outcome, colours or none", () => {
    const progress = read([
      "Running 7 tests using 2 workers",
      "  ✓  1 [chromium] › a.spec.ts:3:1 › one (1.2s)",
      "  \u001b[31m✘\u001b[39m  2 [chromium] › a.spec.ts:9:1 › two (30.0s)",
      "  -  3 [chromium] › a.spec.ts:12:1 › three",
      "     4 [chromium] › a.spec.ts:15:1 › begun, not finished",
      "Browser suite, second pass",
      "Running 2 tests using 1 worker",
      "  ok 5 [chromium] › b.spec.ts:1:1 › five (2.0s)"
    ]);
    expect(progress).toEqual({ total: 9, passed: 2, failed: 1, skipped: 1 });
  });

  it("says plainly that a run was cut, and how many of its cases had finished", () => {
    const notice = cutNotice({ total: 40, passed: 11, failed: 1, skipped: 0 }, 300);
    expect(notice).toContain("CUT by the 300 s cap");
    expect(notice).toContain("12 of 40 cases had finished (11 passed, 1 failed, 0 skipped)");
    expect(notice).toContain("the other 28 did not finish");
    expect(cutNotice(emptyProgress(), 5)).toContain("CUT by the 5 s cap");
  });
});

describe("the lane's command line", () => {
  it("reads its own flags before -- and the command after it", () => {
    expect(parseArguments(["--label", "me", "--max-seconds", "60", "--", "npx", "playwright", "--max-seconds"], "/x/y"))
      .toEqual({ status: false, label: "me", maxSeconds: 60, command: ["npx", "playwright", "--max-seconds"] });
    expect(parseArguments(["--", "true"], "/work/agent-7").label).toBe("agent-7");
    expect(parseArguments(["--status"]).status).toBe(true);
    expect(() => parseArguments(["--label", "me"])).toThrow(/no command/);
    expect(() => parseArguments(["--max-seconds", "0", "--", "true"])).toThrow(/positive/);
  });
});

// ---------------------------------------------------------------------------------------------------------------------

const LANE = path.join(__dirname, "browser-lane.mjs");
let root: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "browser-lane-"));
  env = { ...process.env, LIVE_DOCS_BROWSER_LANE_DIR: path.join(root, "lane"), LIVE_DOCS_BROWSER_LOCK: path.join(root, "old.lock") };
  delete env.LIVE_DOCS_BROWSER_LANE;
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

interface Run { code: number | null; stderr: string; stdout: string }

/** Starts the lane with a command: a promise of its end, which can also say what the lane has printed so far. */
function lane(args: string[], extraEnv: NodeJS.ProcessEnv = {}): Promise<Run> & { stderrSoFar(): string } {
  const child = spawn(process.execPath, [LANE, ...args], { env: { ...env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", chunk => (stdout += chunk));
  child.stderr.on("data", chunk => (stderr += chunk));
  const done = new Promise<Run>(resolve => child.on("close", code => resolve({ code, stderr, stdout })));
  return Object.assign(done, { stderrSoFar: () => stderr });
}

/** Waits until a condition holds, polling; fails with the condition's name if it never does. */
async function until(what: string, condition: () => boolean, limitMs = 20_000): Promise<void> {
  for (let waited = 0; !condition(); waited += 50) {
    if (waited > limitMs) throw new Error(`never: ${what}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

const node = (script: string, ...args: string[]) => [process.execPath, "-e", script, ...args];
const marks = () => (fs.existsSync(path.join(root, "marks")) ? fs.readFileSync(path.join(root, "marks"), "utf8").trim().split("\n") : []);
const tickets = () => (fs.existsSync(path.join(root, "lane", "tickets")) ? fs.readdirSync(path.join(root, "lane", "tickets")).filter(name => name.endsWith(".json")) : []);
const laneLog = () => fs.readFileSync(path.join(root, "lane", "lane.log"), "utf8").trim().split("\n");
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/** A stand-in that marks its start, waits for the test to release it by a file, and marks its end. */
const GATED = `
const fs = require("node:fs"), path = require("node:path");
const [name, root] = process.argv.slice(1);
fs.appendFileSync(path.join(root, "marks"), name + " start\\n");
const wait = setInterval(() => {
  if (!fs.existsSync(path.join(root, "release-" + name))) return;
  clearInterval(wait);
  fs.appendFileSync(path.join(root, "marks"), name + " end\\n");
}, 20);
`;

describe("the lane, driven", () => {
  it("serves two waiters in the order they arrived, one at a time", async () => {
    const release = (name: string) => fs.writeFileSync(path.join(root, `release-${name}`), "");
    // Each takes an older lock of its own, so that the queue alone orders them.
    const own = (name: string) => ({ LIVE_DOCS_BROWSER_LOCK: path.join(root, `${name}.lock`) });
    const first = lane(["--label", "first", "--", ...node(GATED, "first", root)], own("first"));
    await until("the first holds", () => marks().includes("first start"));
    const second = lane(["--label", "second", "--", ...node(GATED, "second", root)], own("second"));
    await until("the second has its ticket", () => tickets().length === 2);
    const third = lane(["--label", "third", "--", ...node(GATED, "third", root)], own("third"));
    await until("the third has its ticket", () => tickets().length === 3);
    release("third");
    release("second");
    release("first");
    const runs = await Promise.all([first, second, third]);
    expect(runs.map(run => run.code)).toEqual([0, 0, 0]);
    expect(marks()).toEqual(["first start", "first end", "second start", "second end", "third start", "third end"]);
    expect(laneLog().map(line => /label=(\S+)/.exec(line)?.[1])).toEqual(["first", "second", "third"]);
    expect(tickets()).toEqual([]);
  }, 60_000);

  it("skips a ticket left by a process that is gone", async () => {
    const gone = spawnSync(process.execPath, ["-e", "process.stdout.write(String(process.pid))"], { encoding: "utf8" });
    fs.mkdirSync(path.join(root, "lane", "tickets"), { recursive: true });
    fs.writeFileSync(path.join(root, "lane", "tickets", "0000000001.json"), JSON.stringify({ pid: Number(gone.stdout), label: "gone", command: ["x"], arrived: 0, held: null, maxSeconds: 300, token: "none" }));
    const run = await lane(["--label", "after", "--", ...node("")]);
    expect(run.code).toBe(0);
    expect(run.stderr).not.toContain("waiting behind");
    expect(tickets()).toEqual([]);
  }, 30_000);

  it("ends a command that outlives its cap, says it was cut, and frees the lane", async () => {
    const pidFile = path.join(root, "pid");
    const run = await lane(["--label", "slow", "--max-seconds", "1", "--", ...node(`require("node:fs").writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); setInterval(() => {}, 1000)`)]);
    expect(run.code).toBe(CAPPED_EXIT);
    expect(run.stderr.trim().split("\n").at(-1)).toContain("CUT by the 1 s cap");
    expect(alive(Number(fs.readFileSync(pidFile, "utf8")))).toBe(false);
    expect(laneLog()[0]).toContain("capped=yes");
    const next = await lane(["--label", "next", "--", ...node("")]);
    expect(next.code).toBe(0);
    expect(next.stderr).not.toContain("waiting behind");
  }, 30_000);

  it("says, of a Playwright run its cap cut, how many cases had finished", async () => {
    const run = await lane(["--max-seconds", "1", "--", ...node(`
      console.log("Running 5 tests using 1 worker");
      console.log("  ✓  1 [chromium] › a.spec.ts:1:1 › one (1.0s)");
      console.log("  ✓  2 [chromium] › a.spec.ts:2:1 › two (1.0s)");
      console.log("  ✘  3 [chromium] › a.spec.ts:3:1 › three (1.0s)");
      setInterval(() => {}, 1000);`)]);
    expect(run.code).toBe(CAPPED_EXIT);
    expect(run.stderr.trim().split("\n").at(-1)).toContain("3 of 5 cases had finished (2 passed, 1 failed, 0 skipped)");
    expect(laneLog()[0]).toContain("cases=3/5");
  }, 30_000);

  it("ends a server the command left listening outside its process group", async () => {
    const serverFile = path.join(root, "server");
    // The command starts a server in a session of its own, as Playwright starts its web server, and exits without it.
    const run = await lane(["--label", "leaver", "--", ...node(`
      const { spawn } = require("node:child_process");
      const server = spawn(process.execPath, ["-e", \`
        const s = require("node:net").createServer();
        s.listen(0, "127.0.0.1", () => require("node:fs").writeFileSync(${JSON.stringify(serverFile)}, process.pid + " " + s.address().port));
      \`], { detached: true, stdio: "ignore" });
      server.unref();
      const wait = setInterval(() => { if (require("node:fs").existsSync(${JSON.stringify(serverFile)})) { clearInterval(wait); } }, 20);`)]);
    expect(run.code).toBe(0);
    const [pid, port] = fs.readFileSync(serverFile, "utf8").split(" ").map(Number);
    expect(alive(pid)).toBe(false);
    expect(run.stderr).toContain(`${pid}(port ${port})`);
    expect(laneLog()[0]).toContain(`left-behind=${pid}(port ${port})`);
  }, 30_000);

  it("waits for a holder of the older lock outside the lane before it runs", async () => {
    const outside = spawn("flock", ["-x", path.join(root, "old.lock"), ...node(GATED, "outside", root)], { stdio: "ignore" });
    const outsideClosed = new Promise(resolve => outside.on("close", resolve));
    await until("the outside holder has the lock", () => marks().includes("outside start"));
    const inside = lane(["--", ...node(GATED, "inside", root)]);
    await until("the lane waits for the older lock", () => inside.stderrSoFar().includes("held by someone outside the lane"));
    expect(marks()).toEqual(["outside start"]);
    fs.writeFileSync(path.join(root, "release-inside"), "");
    fs.writeFileSync(path.join(root, "release-outside"), "");
    expect((await inside).code).toBe(0);
    await outsideClosed;
    expect(marks()).toEqual(["outside start", "outside end", "inside start", "inside end"]);
  }, 30_000);

  it("refuses a command that would take the older lock the lane already holds", async () => {
    const run = await lane(["--", "flock", "-x", path.join(root, "old.lock"), "true"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("Drop the flock");
  }, 30_000);
});
