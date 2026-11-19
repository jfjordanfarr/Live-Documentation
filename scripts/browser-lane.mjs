#!/usr/bin/env node
// The browser lane: one machine's browser shared by many builders at once, first come, first served.
//
//   node scripts/browser-lane.mjs [--label <who>] [--max-seconds <n>] -- <command…>
//   node scripts/browser-lane.mjs --status
//
// A caller takes a numbered ticket in the lane's folder and waits until every ticket before it is gone or belongs to a
// process that has died; then it holds the lane, runs the command, and lets go whatever happens. The command runs in a
// process group of its own and carries a mark in its environment, which every process it starts inherits, so that at
// the end the lane can find and end what the command left behind, a web server above all, even one that left the group.
// A hold longer than its cap (300 s unless asked) is ended, and its last line says it was cut and how many of a
// Playwright run's cases had finished. While holding, the lane also takes the older `flock` on
// /tmp/live-docs-browser.lock, so that a builder still using that convention never overlaps it. Each hold appends one
// line to the lane's log. The reasons, one incident each, are in this file's Live Doc and in the internal tooling
// reference.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** How long a hold may last, in seconds, unless `--max-seconds` says otherwise. */
export const DEFAULT_MAX_SECONDS = 300;

/** How long an ended command is given between the polite signal and the forceful one, in seconds. */
export const GRACE_SECONDS = 5;

/** The environment variable that marks every process a hold's command starts; its value is the hold's own token. */
export const LANE_MARK = "LIVE_DOCS_BROWSER_LANE";

/** The exit code of a hold its cap ended, as `timeout(1)` gives. */
export const CAPPED_EXIT = 124;

const POLL_MS = 250;

/**
 * Where the lane keeps its tickets and log, and which older lock it also takes. Named absolutely under `/tmp` where
 * there is one, beside the older lock, so that sessions whose temporary directories differ still meet in one lane; the
 * environment may name others, as the lane's own tests do.
 */
export function lanePlaces(env = process.env) {
  const temporary = process.platform === "win32" ? os.tmpdir() : "/tmp";
  const dir = env.LIVE_DOCS_BROWSER_LANE_DIR || path.join(temporary, "live-docs-browser-lane");
  return {
    dir,
    tickets: path.join(dir, "tickets"),
    log: path.join(dir, "lane.log"),
    oldLock: env.LIVE_DOCS_BROWSER_LOCK || path.join(temporary, "live-docs-browser.lock")
  };
}

/** A ticket's file name for its place in the queue, padded so that the names sort as their numbers do. */
export function ticketName(seq) {
  return `${String(seq).padStart(10, "0")}.json`;
}

/** The place in the queue a ticket's file name holds, or undefined for any other file. */
export function ticketSeq(name) {
  const match = /^(\d{10})\.json$/.exec(name);
  return match ? Number(match[1]) : undefined;
}

/**
 * Whose turn it is. The tickets are taken in the order of their numbers; a ticket whose state is "dead" is skipped;
 * the first that is not holds the lane and the rest wait behind it in order.
 */
export function laneTurn(tickets, stateOf) {
  const ordered = [...tickets].sort((a, b) => a.seq - b.seq);
  const standing = [];
  const dead = [];
  const abandoned = [];
  for (const ticket of ordered) {
    const state = stateOf(ticket);
    if (state === "live") standing.push(ticket);
    else if (state === "abandoned") abandoned.push(ticket);
    else dead.push(ticket);
  }
  return { holder: standing[0], waiting: standing.slice(1), dead, abandoned };
}

/** Whether a hold begun at `heldSince` (ms) has reached a cap of `maxSeconds` at `now` (ms). */
export function capReached(heldSince, maxSeconds, now) {
  return now - heldSince >= maxSeconds * 1000;
}

/**
 * A ticket's state, from what the machine says of it. "live" while the lane process that took it runs; also while that
 * process is gone but processes its command started still run and its hold is within its cap and grace, since they may
 * still be using the browser. "abandoned" when such processes outlive the cap with no lane to end them: the next in
 * line ends them. Otherwise "dead", and skipped.
 */
export function ticketState(ticket, { ownerAlive, markedAlive }, now) {
  if (ownerAlive) return "live";
  if (!markedAlive) return "dead";
  if (typeof ticket.held === "number" && !capReached(ticket.held, ticket.maxSeconds + GRACE_SECONDS, now)) return "live";
  return "abandoned";
}

/** A Playwright run's progress as its list reporter prints it: cases announced, and those finished by outcome. */
export function emptyProgress() {
  return { total: 0, passed: 0, failed: 0, skipped: 0 };
}

// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;

/**
 * The progress after one line of output. "Running 12 tests using 2 workers" adds to the cases announced (the two-pass
 * runner prints it once per pass); the list reporter's row for a finished case begins with its mark (✓ or "ok" for a
 * pass, ✘ or "x" for a failure, "-" for a skip) and its number.
 */
export function readProgressLine(progress, line) {
  const text = line.replace(ANSI, "");
  const running = /^\s*Running (\d+) tests? using \d+ workers?/.exec(text);
  if (running) return { ...progress, total: progress.total + Number(running[1]) };
  const row = /^ {2}(✓|ok|✘|x|-)\s+\d+ /.exec(text);
  if (!row) return progress;
  const key = row[1] === "✓" || row[1] === "ok" ? "passed" : row[1] === "-" ? "skipped" : "failed";
  return { ...progress, [key]: progress[key] + 1 };
}

/** The cases a progress has seen finish. */
export function finished(progress) {
  return progress.passed + progress.failed + progress.skipped;
}

/**
 * What the lane says when its cap ends a hold: plainly that the run was cut, and, for a Playwright run, how many of its
 * cases had finished at the cut, so that the failures the cut itself causes (the server going away under the cases
 * still running) are not read as the product's.
 */
export function cutNotice(progress, maxSeconds) {
  const head = `browser-lane: CUT by the ${maxSeconds} s cap.`;
  if (progress.total === 0) {
    return `${head} The command was ended before it finished; nothing after the cut says anything about the product.`;
  }
  const done = finished(progress);
  return `${head} ${done} of ${progress.total} cases had finished (${progress.passed} passed, ${progress.failed} failed, `
    + `${progress.skipped} skipped); the other ${progress.total - done} did not finish, and any failure printed after the cut `
    + "is the cut, not the product. Ask for fewer cases, or a longer --max-seconds.";
}

/** The lane log's line for one hold. */
export function holdLine({ at, label, waitedMs, heldMs, exit, capped, progress, leftBehind, command }) {
  const seconds = ms => `${(ms / 1000).toFixed(1)}s`;
  const parts = [
    new Date(at).toISOString(),
    `label=${label}`,
    `waited=${seconds(waitedMs)}`,
    `held=${seconds(heldMs)}`,
    `exit=${exit}`,
    `capped=${capped ? "yes" : "no"}`
  ];
  if (progress && progress.total > 0) parts.push(`cases=${finished(progress)}/${progress.total}`, `failed=${progress.failed}`);
  if (leftBehind.length > 0) parts.push(`left-behind=${leftBehind.map(describeProcess).join(",")}`);
  parts.push(`command=${JSON.stringify(command.join(" "))}`);
  return parts.join("  ");
}

function describeProcess({ pid, ports }) {
  return ports.length > 0 ? `${pid}(port ${ports.join("+")})` : String(pid);
}

/**
 * The command line's request: `{ status: true }`, or `{ label, maxSeconds, command }`; throws with the reason when the
 * line cannot be read.
 */
export function parseArguments(argv, cwd = process.cwd()) {
  const split = argv.indexOf("--");
  const own = split === -1 ? argv : argv.slice(0, split);
  const command = split === -1 ? [] : argv.slice(split + 1);
  const request = { status: false, label: path.basename(cwd), maxSeconds: DEFAULT_MAX_SECONDS, command };
  for (let i = 0; i < own.length; i++) {
    const flag = own[i];
    if (flag === "--status") request.status = true;
    else if (flag === "--label") request.label = valueOf(own, ++i, flag);
    else if (flag === "--max-seconds") {
      const value = Number(valueOf(own, ++i, flag));
      if (!Number.isFinite(value) || value <= 0) throw new Error("--max-seconds takes a positive number of seconds");
      request.maxSeconds = value;
    } else throw new Error(`unknown argument ${flag}`);
  }
  if (!request.status && command.length === 0) throw new Error("no command: put it after --");
  return request;
}

function valueOf(args, index, flag) {
  const value = args[index];
  if (value === undefined || value.startsWith("--")) throw new Error(`${flag} takes a value`);
  return value;
}

// ---------------------------------------------------------------------------------------------------------------------
// The machine: processes, tickets, the older lock.

/** A process's start time in clock ticks since boot, which with its pid names it uniquely; undefined where unknown. */
function processStart(pid) {
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf8");
    return Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[19]);
  } catch {
    return undefined;
  }
}

/** Whether the process that took a ticket still runs: its pid answers and, where it can be read, began when it did. */
function ownerAlive(ticket) {
  try {
    process.kill(ticket.pid, 0);
  } catch (error) {
    if (error.code !== "EPERM") return false;
  }
  const start = processStart(ticket.pid);
  return start === undefined || ticket.start === undefined || start === ticket.start;
}

/** The processes, other than this one, whose environment carries a hold's mark; an empty list where /proc is absent. */
function markedProcesses(token) {
  const needle = `${LANE_MARK}=${token}\0`;
  let entries;
  try {
    entries = fs.readdirSync("/proc");
  } catch {
    return [];
  }
  const found = [];
  for (const entry of entries) {
    if (!/^\d+$/.test(entry) || Number(entry) === process.pid) continue;
    try {
      if (`${fs.readFileSync(`/proc/${entry}/environ`, "latin1")}\0`.includes(needle)) found.push(Number(entry));
    } catch {
      // Gone, or not ours to read.
    }
  }
  return found;
}

/** The TCP ports each of the given processes listens on, read from /proc. */
function listeningPorts(pids) {
  const byInode = new Map();
  for (const table of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    let text;
    try {
      text = fs.readFileSync(table, "utf8");
    } catch {
      continue;
    }
    for (const line of text.split("\n").slice(1)) {
      const fields = line.trim().split(/\s+/);
      if (fields[3] === "0A") byInode.set(fields[9], parseInt(fields[1].split(":")[1], 16));
    }
  }
  return pids.map(pid => {
    const ports = new Set();
    try {
      for (const fd of fs.readdirSync(`/proc/${pid}/fd`)) {
        const link = fs.readlinkSync(`/proc/${pid}/fd/${fd}`);
        const inode = /^socket:\[(\d+)\]$/.exec(link)?.[1];
        if (inode && byInode.has(inode)) ports.add(byInode.get(inode));
      }
    } catch {
      // Gone, or not ours to read.
    }
    return { pid, ports: [...ports].sort((a, b) => a - b) };
  });
}

function signal(pid, name) {
  try {
    process.kill(pid, name);
    return true;
  } catch {
    return false;
  }
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Ends every process carrying a hold's mark, politely and then by force; returns what it found, with their ports. */
async function endLeftBehind(token) {
  const found = markedProcesses(token);
  if (found.length === 0) return [];
  const described = listeningPorts(found);
  for (const pid of found) signal(pid, "SIGTERM");
  for (let waited = 0; waited < 2000 && markedProcesses(token).length > 0; waited += 100) await pause(100);
  for (const pid of markedProcesses(token)) signal(pid, "SIGKILL");
  return described;
}

function readTickets(places) {
  let names;
  try {
    names = fs.readdirSync(places.tickets);
  } catch {
    return [];
  }
  const tickets = [];
  for (const name of names) {
    const seq = ticketSeq(name);
    if (seq === undefined) continue;
    try {
      tickets.push({ ...JSON.parse(fs.readFileSync(path.join(places.tickets, name), "utf8")), seq, file: path.join(places.tickets, name) });
    } catch {
      // Removed while being read.
    }
  }
  return tickets;
}

function stateOf(ticket, now) {
  const alive = ownerAlive(ticket);
  return ticketState(ticket, { ownerAlive: alive, markedAlive: !alive && markedProcesses(ticket.token).length > 0 }, now);
}

/** Writes a file whole, so that a reader never sees half of it: written beside, then linked or renamed into place. */
function writeWhole(target, text, { exclusive }) {
  const scratch = `${target}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(scratch, text);
  try {
    if (exclusive) fs.linkSync(scratch, target);
    else fs.renameSync(scratch, target);
  } finally {
    fs.rmSync(scratch, { force: true });
  }
}

/** Takes the next number in the queue: one past the highest ticket standing, created exclusively, retried on a race. */
function takeTicket(places, body) {
  fs.mkdirSync(places.tickets, { recursive: true });
  for (;;) {
    const highest = fs.readdirSync(places.tickets).map(ticketSeq).filter(seq => seq !== undefined).reduce((a, b) => Math.max(a, b), 0);
    const seq = highest + 1;
    const file = path.join(places.tickets, ticketName(seq));
    try {
      writeWhole(file, JSON.stringify({ ...body, seq }), { exclusive: true });
      return { ...body, seq, file };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
}

/**
 * Holds the older `flock` lock until `release` is called or this process ends; resolves once it is held, and says so
 * first when someone outside the lane holds it.
 */
function takeOldLock(lockPath) {
  if (process.platform === "win32") return Promise.resolve({ release() {} });
  const fd = fs.openSync(lockPath, "a");
  // `flock` locks the open file this process shares with it, which stays locked after `flock` exits for as long as
  // this process keeps it open: until `release`, or until this process ends however it ends.
  const free = spawnSync("flock", ["-n", "-x", "3"], { stdio: ["ignore", "ignore", "inherit", fd] });
  if (free.status === 0) return Promise.resolve({ release: () => fs.closeSync(fd) });
  console.error(`browser-lane: waiting for ${lockPath}, held by someone outside the lane`);
  return new Promise((resolve, reject) => {
    const child = spawn("flock", ["-x", "3"], { stdio: ["ignore", "ignore", "inherit", fd] });
    child.on("error", error => {
      fs.closeSync(fd);
      reject(new Error(`could not take ${lockPath}: ${error.message}`));
    });
    child.on("exit", code => {
      if (code === 0) resolve({ release: () => fs.closeSync(fd) });
      else {
        fs.closeSync(fd);
        reject(new Error(`could not take ${lockPath}: flock exited ${code}`));
      }
    });
  });
}

/** Whether someone holds the older lock now; undefined where that cannot be asked. */
function oldLockHeld(lockPath) {
  if (!fs.existsSync(lockPath)) return false;
  const tried = spawnSync("flock", ["-n", "-s", lockPath, "true"]);
  if (tried.error) return undefined;
  return tried.status !== 0;
}

// ---------------------------------------------------------------------------------------------------------------------
// The two commands.

function printStatus(places, now = Date.now()) {
  const turn = laneTurn(readTickets(places), ticket => stateOf(ticket, now));
  const age = since => `${Math.round((now - since) / 1000)} s`;
  console.log(`Browser lane: ${places.dir}`);
  if (turn.holder) {
    const t = turn.holder;
    console.log(t.held
      ? `Holding: ${t.label} (pid ${t.pid}), for ${age(t.held)} of its ${t.maxSeconds} s, running: ${t.command.join(" ")}`
      : `Next: ${t.label} (pid ${t.pid}), arrived ${age(t.arrived)} ago, taking the lane`);
  } else {
    console.log("Holding: nobody");
  }
  turn.waiting.forEach((t, i) => console.log(`Waiting ${i + 1}: ${t.label} (pid ${t.pid}), for ${age(t.arrived)}`));
  for (const t of turn.dead) console.log(`Skipped: ${t.label} (pid ${t.pid} is gone)`);
  for (const t of turn.abandoned) console.log(`Abandoned: ${t.label}'s command outlived its lane and its cap; the next in line ends it`);
  const held = oldLockHeld(places.oldLock);
  const outside = held && !turn.holder?.held ? ", by someone outside the lane" : "";
  console.log(`Older lock ${places.oldLock}: ${held === undefined ? "cannot be asked" : held ? `held${outside}` : "free"}`);
}

async function hold(places, request) {
  if (process.env[LANE_MARK]) {
    throw new Error("this command already runs inside the browser lane; a lane within it would wait on itself");
  }
  if (request.command.some(arg => arg === places.oldLock)) {
    throw new Error(`the lane takes ${places.oldLock} itself; a command that takes it again would wait on the lane until the cap. Drop the flock.`);
  }
  const token = randomBytes(8).toString("hex");
  const arrived = Date.now();
  const mine = takeTicket(places, {
    pid: process.pid, start: processStart(process.pid), label: request.label, command: request.command,
    arrived, held: null, maxSeconds: request.maxSeconds, token
  });
  let child;
  let ended = false;
  const leave = () => fs.rmSync(mine.file, { force: true });
  process.on("exit", leave);
  const onSignal = name => {
    if (child && !ended) signal(-child.pid, "SIGTERM");
    else {
      leave();
      process.exit(128 + os.constants.signals[name]);
    }
  };
  for (const name of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(name, onSignal);

  // Wait for the turn, ending on the way what an abandoned hold left running, and clearing the tickets of the dead.
  let announced = false;
  for (;;) {
    const now = Date.now();
    const turn = laneTurn(readTickets(places), ticket => (ticket.seq === mine.seq ? "live" : stateOf(ticket, now)));
    for (const ticket of turn.abandoned) {
      const stopped = await endLeftBehind(ticket.token);
      fs.rmSync(ticket.file, { force: true });
      appendLog(places, `${new Date().toISOString()}  label=${ticket.label}  abandoned: its lane died and its command outlived the cap; ended ${stopped.map(describeProcess).join(",") || "nothing"}`);
    }
    for (const ticket of turn.dead) fs.rmSync(ticket.file, { force: true });
    if (turn.holder?.seq === mine.seq) break;
    if (!announced) {
      const ahead = [turn.holder, ...turn.waiting].filter(t => t && t.seq < mine.seq);
      console.error(`browser-lane: waiting behind ${ahead.map(t => t.label).join(", ")}`);
      announced = true;
    }
    await pause(POLL_MS);
  }

  const lock = await takeOldLock(places.oldLock);
  const held = Date.now();
  writeWhole(mine.file, JSON.stringify({ ...mine, held, file: undefined }), { exclusive: false });
  console.error(`browser-lane: ${request.label} holds the lane (waited ${((held - arrived) / 1000).toFixed(1)} s, cap ${request.maxSeconds} s)`);

  let progress = emptyProgress();
  let progressAtCut;
  let capped = false;
  const outcome = await new Promise(resolve => {
    child = spawn(request.command[0], request.command.slice(1), {
      detached: process.platform !== "win32",
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, [LANE_MARK]: token }
    });
    for (const [stream, sink] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      let partial = "";
      stream.on("data", chunk => {
        sink.write(chunk);
        const lines = (partial + chunk.toString()).split("\n");
        partial = lines.pop();
        for (const line of lines) progress = readProgressLine(progress, line);
      });
    }
    const cap = setTimeout(() => {
      capped = true;
      progressAtCut = progress;
      console.error(`\nbrowser-lane: the ${request.maxSeconds} s cap is reached; ending the command (${finished(progress)} of ${progress.total} cases had finished)`);
      signal(-child.pid, "SIGTERM");
      setTimeout(() => signal(-child.pid, "SIGKILL"), GRACE_SECONDS * 1000).unref();
    }, request.maxSeconds * 1000);
    child.on("error", error => {
      clearTimeout(cap);
      resolve({ code: 127, error });
    });
    child.on("exit", (code, signalName) => {
      clearTimeout(cap);
      resolve({ code: code ?? 128 + (os.constants.signals[signalName] ?? 0) });
    });
  });
  ended = true;
  // The group first, for what stayed in it, then whatever carries the mark outside it.
  signal(-child.pid, "SIGKILL");
  const leftBehind = await endLeftBehind(token);
  const releasedAt = Date.now();
  lock.release();
  leave();

  const exit = capped ? CAPPED_EXIT : outcome.code;
  const line = holdLine({
    at: releasedAt, label: request.label, waitedMs: held - arrived, heldMs: releasedAt - held, exit, capped,
    progress: capped ? progressAtCut : progress, leftBehind, command: request.command
  });
  appendLog(places, line);
  if (outcome.error) console.error(`browser-lane: the command could not be started: ${outcome.error.message}`);
  if (leftBehind.length > 0) {
    console.error(`browser-lane: ended what the command left running: ${leftBehind.map(describeProcess).join(", ")}`);
  }
  console.error(capped ? cutNotice(progressAtCut, request.maxSeconds) : `browser-lane: released after ${((releasedAt - held) / 1000).toFixed(1)} s, exit ${exit}`);
  return exit;
}

function appendLog(places, line) {
  fs.mkdirSync(places.dir, { recursive: true });
  fs.appendFileSync(places.log, `${line}\n`);
}

async function main() {
  let request;
  try {
    request = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(`browser-lane: ${error.message}`);
    console.error("Usage: node scripts/browser-lane.mjs [--label <who>] [--max-seconds <n>] -- <command…>\n       node scripts/browser-lane.mjs --status");
    process.exit(2);
  }
  const places = lanePlaces();
  if (request.status) {
    printStatus(places);
    return;
  }
  try {
    process.exitCode = await hold(places, request);
  } catch (error) {
    console.error(`browser-lane: ${error.message}`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  await main();
}
