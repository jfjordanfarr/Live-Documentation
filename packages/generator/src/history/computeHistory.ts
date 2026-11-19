/**
 * The history command: a repository's history regenerated under one lens and
 * written as one sequence, `<docsRoot>/history/history.json`, for the CLI and
 * the Explorer to read (the plan's C1, in `.mdmd/layer-3/change-over-time.mdmd.md`).
 *
 * @remarks
 * The mainline is read from the version control and sampled. Every sampled
 * change the cache lacks under the lens is summarized in a scratch tree by a
 * process of its own (`regenerate.ts`); then the sequence is derived from
 * consecutive summaries and what the version control says between them, each
 * step replayed as it is written, and written beside the cache. A second run
 * regenerates only what the cache lacks. Nothing here is committed, and
 * nothing reaches a remote.
 *
 * Since 2026-11-19 the summaries are gzipped and name their prose by hash in
 * the lens's text store, which holds each text once; the pool is sized by the
 * memory and processors the run may use and the peak memory a summarizing
 * process was measured to take; and every run says which cache folders
 * belong to no current lens and how much they hold, removing them only when
 * asked and only once the current lens is whole.
 *
 * A change counts as cached only when its summary reads and every text it
 * names is in the store and is the text of its hash; a change that fails
 * either is summarized again, so that a store damaged or copied in part
 * mends itself rather than failing every later run. One run at a time writes
 * under a history folder: a run holds a lock there while it writes, and
 * removes at its start what a stopped run left half written.
 *
 * @module
 */

import { createHash, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  parseLiveDocumentationConfigBytes,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/engine/config/liveDocumentationConfig";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { bundledSummary } from "@live-documentation/engine/live-docs/history/bundled";
import { Interner } from "@live-documentation/engine/live-docs/history/codec";
import { HISTORY_DIRECTORY, HISTORY_FILE, type CommitInfo, type HistoryLens, type HistorySequence, type Sampling } from "@live-documentation/engine/live-docs/history/format";
import { openGitRepository } from "@live-documentation/engine/live-docs/history/git";
import { lensOf } from "@live-documentation/engine/live-docs/history/lens";
import { linksOf, rowsOfSummary } from "@live-documentation/engine/live-docs/history/rows";
import { sampleChanges } from "@live-documentation/engine/live-docs/history/sampling";
import { momentAt, SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import { shapeOfSummary } from "@live-documentation/engine/live-docs/history/shape";
import { HISTORY_SUMMARY_FORMAT, textHash, type CommitSummary } from "@live-documentation/engine/live-docs/history/summary";
import { TEXT_STORE_DIRECTORY, textPath } from "@live-documentation/engine/live-docs/history/textStore";
import type { MainlineChange, VersionControl } from "@live-documentation/engine/live-docs/history/versionControl";
import { textsOfFile, WORDS_DIRECTORY, wordsStore, type WordsHead } from "@live-documentation/engine/live-docs/history/words";

import { generatorIdentity } from "./generatorIdentity";
import { headDifferences } from "./headCheck";
import { indexPath, regenerate, Scratch, summaryPath, treeOptions } from "./regenerate";

/** What to compute. */
export interface HistoryOptions {
  /** The repository's top level, as the person gave it. */
  workspace: string;
  /** A configuration file for the lens, relative to the working directory; the workspace's `.live-docs.config.json` when absent, or the defaults. */
  configPath?: string;
  sampling: Sampling;
  /** How many changes are regenerated at once, each in a process of its own; when absent, {@link poolSize} for this machine. */
  jobs?: number;
  /** Keep each change's full graph index, gzipped, in the cache. */
  keepIndex: boolean;
  /** Carry the authors' names in the steps. */
  authors: boolean;
  /** Remove the cache folders of every lens but the current one, once the current one holds every sampled change. */
  removeSuperseded?: boolean;
  /**
   * Hold the history's last step to the Live Docs committed at the commit it ends at, as the person asserts those docs
   * were made by this generator under this configuration; see {@link HEAD_CHECK_RULE}.
   */
  checkHead?: boolean;
  /** Start no change after this many minutes of regeneration; a run stopped so throws {@link HistoryStopped}. */
  stopAfterMinutes?: number;
  /** Where progress goes, a line at a time. */
  progress: (line: string) => void;
}

/** A cache folder under the history folder that belongs to another lens than the current one. */
export interface SupersededCache {
  /** Its lens key, which names it. */
  lens: string;
  /** Workspace-relative path. */
  folder: string;
  /** The bytes of the files it holds. */
  bytes: number;
  /** Whether this run removed it. */
  removed: boolean;
}

/** What a run did. */
export interface HistoryRun {
  sequence: HistorySequence;
  /** Workspace-relative path of the sequence written. */
  file: string;
  /** Workspace-relative path of the lens's cache. */
  cache: string;
  /** How many changes were sampled, how many were regenerated and how many the cache held. */
  sampled: number;
  regenerated: number;
  cached: number;
  /** The mean time one change's regeneration took, in milliseconds; 0 when none was regenerated. */
  millisecondsPerChange: number;
  /** How many changes were regenerated at once. */
  jobs: number;
  /** The wall clock the regeneration took, in milliseconds; 0 when none was regenerated. */
  regenerationMilliseconds: number;
  /** The largest peak resident memory a summarizing process of this run reported, in bytes; 0 when none was regenerated. */
  peakMemory: number;
  /** The bytes the current lens's cache folder holds after the run. */
  cacheBytes: number;
  /** The cache folders of other lenses, and whether this run removed them. */
  superseded: SupersededCache[];
  /** Whether the last step was held to the Live Docs committed at the head, and what was found or why it was skipped. */
  headCheck: { applied: boolean; line: string };
}

/** A run that stopped, as asked, before the cache held every sampled change: no sequence was written. */
export class HistoryStopped extends Error {}

/**
 * When the check at the head applies, in the words the command prints when it skips it.
 */
export const HEAD_CHECK_RULE =
  "it applies when asked with --check-head, or when this generator runs unmodified from the commit the history ends at, under the workspace's own configuration, as over this tool's own repository";

/**
 * The record a run leaves beside the caches of how much memory one summarizing process took on this repository, so
 * that the next run sizes its pool by it: `<docsRoot>/history/pool.json`.
 */
const POOL_RECORD = "pool.json";

/**
 * A run's claim on the history folder while it writes there: an empty file named by the machine, the process and a
 * nonce, `run.<host>.<pid>.<nonce>.lock`, made in one step so that no one ever reads a claim half written.
 */
const LOCK_NAME = /^run\.([0-9a-f]{12})\.(\d+)\.([0-9a-z]+)\.lock$/u;

/** How many times a run that met another's claim tries again, a short random wait apart, before it refuses. */
const LOCK_ATTEMPTS = 6;

/** The list beside the sequence of the entries the history did not write into a commit's tree, and so did not read, each with why. */
const UNWRITTEN_LIST = "unwritten.txt";

/** The marker a lens's cache folder holds once a run wrote a whole history from it: when, and of which head. */
const WHOLE_MARKER = "whole.json";

/**
 * What one summarizing process is expected to take before any has been measured on a repository: the largest peak
 * measured on 2026-11-19 over every 25th commit of this repository's history and its head (1,064 files), 526 MB,
 * rounded up to 768 MiB. A larger repository takes more, which its first run measures and records.
 */
export const UNMEASURED_PEAK_MEMORY = 768 * 1024 ** 2;

/**
 * How many summarizing processes a machine runs at once: as many as half its memory holds at the measured peak of
 * one, since the person's own work goes on beside the run, and one fewer than its processors, since each process
 * keeps one busy and the command and git need one; never fewer than one.
 */
export function poolSize(machine: { totalMemory: number; processors: number; peakMemory: number }): number {
  const byMemory = Math.floor(machine.totalMemory / 2 / machine.peakMemory);
  return Math.max(1, Math.min(machine.processors - 1, byMemory));
}

/**
 * The memory and the processors this process may use: the machine's, or less where the operating system says so. In
 * a container whose memory is limited, `process.constrainedMemory` reads the limit from the control group; the
 * processors are those the process may be scheduled on, `os.availableParallelism`, which a limit of processor time
 * (`docker run --cpus`) does not lower.
 */
export function usableMachine(reported: { totalMemory: number; constrainedMemory: number | undefined; processors: number }): { totalMemory: number; processors: number } {
  const limit = reported.constrainedMemory;
  return { totalMemory: limit !== undefined && limit > 0 && limit < reported.totalMemory ? limit : reported.totalMemory, processors: reported.processors };
}

/** Computes the history and writes the sequence. */
export async function computeHistory(options: HistoryOptions): Promise<HistoryRun> {
  const workspaceRoot = path.resolve(options.workspace);
  const versionControl = await openGitRepository(workspaceRoot);
  const configuration = await lensConfiguration(workspaceRoot, options.configPath);
  const lens = lensOf(await generatorIdentity(), configuration);

  const end = await versionControl.mainlineEnd();
  const mainline = await versionControl.mainline();
  const tagged = options.sampling.rule === "tags" ? await versionControl.tagged() : new Set<string>();
  const sampled = sampleChanges(mainline, options.sampling, tagged).map((index) => mainline[index]);
  if (sampled.length === 0) {
    throw new Error(`no change of the mainline is sampled by ${JSON.stringify(options.sampling)}`);
  }

  const historyFolder = path.join(workspaceRoot, configuration.root, HISTORY_DIRECTORY);
  const cacheFolder = path.join(historyFolder, lens.key);
  await prepareHistoryFolder(historyFolder, cacheFolder);
  const scratch = new Scratch();
  return scratch.during(async () => {
    // A signal removes the claim with the scratch folders; a run that ends removes it here.
    const claim = await holdLock(historyFolder, options.progress);
    scratch.hold(claim);
    try {
      return await run(options, { workspaceRoot, versionControl, configuration, lens, end, mainline, sampled, historyFolder, cacheFolder, scratch });
    } finally {
      await scratch.release(claim);
    }
  });
}

interface RunContext {
  workspaceRoot: string;
  versionControl: VersionControl;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  end: Awaited<ReturnType<VersionControl["mainlineEnd"]>>;
  mainline: MainlineChange[];
  sampled: MainlineChange[];
  historyFolder: string;
  cacheFolder: string;
  scratch: Scratch;
}

async function run(options: HistoryOptions, context: RunContext): Promise<HistoryRun> {
  const { workspaceRoot, versionControl, configuration, lens, end, mainline, sampled, historyFolder, cacheFolder } = context;
  const relative = (absolute: string): string => path.relative(workspaceRoot, absolute).split(path.sep).join("/");
  const leftovers = await removeLeftovers(historyFolder);
  if (leftovers > 0) {
    options.progress(`removed ${leftovers} files a stopped run left half written`);
  }
  if (options.removeSuperseded === true) {
    // While the current lens fills, only the newest whole lens is kept beside it, so the folder never holds more than two.
    for (const cache of await supersededCaches(historyFolder, lens.key, "all but the newest whole", relative)) {
      if (cache.removed) options.progress(`removed ${cache.folder}, the cache of a lens that is neither the current one nor the newest whole one: ${formatBytes(cache.bytes)}`);
    }
  }
  const textStore = path.join(cacheFolder, TEXT_STORE_DIRECTORY);
  const { missing, damaged } = await uncached(sampled, cacheFolder, textStore, lens.key, options.keepIndex);
  if (damaged.length > 0) {
    options.progress(`${damaged.length} changes are summarized again, since their summaries do not read or name texts the store lacks or holds changed: ${damaged.slice(0, 3).map((id) => id.slice(0, 8)).join(", ")}${damaged.length > 3 ? ", …" : ""}`);
  }
  const record = await recordedPool(historyFolder);
  const machine = usableMachine({ totalMemory: os.totalmem(), constrainedMemory: process.constrainedMemory(), processors: os.availableParallelism() });
  const peak = record?.peakMemory ?? UNMEASURED_PEAK_MEMORY;
  const machineJobs = options.jobs ?? poolSize({ ...machine, peakMemory: peak });
  const jobs = Math.max(1, Math.min(machineJobs, missing.length));
  const sizing =
    options.jobs !== undefined
      ? "as asked"
      : `by ${formatBytes(machine.totalMemory)} of memory and ${machine.processors} processors this process may use, at ${formatBytes(peak)} a process, ${record === undefined ? "before any was measured here" : "as measured here"}`;
  const pool = missing.length > 0 ? `, ${jobs} at a time ${sizing}` : "";
  options.progress(`${sampled.length} changes sampled of ${mainline.length}; ${sampled.length - missing.length} in the cache under lens ${lens.key}, ${missing.length} to regenerate${pool}`);

  const started = Date.now();
  const deadline = options.stopAfterMinutes === undefined ? undefined : started + options.stopAfterMinutes * 60_000;
  const regeneration = await regenerate(missing, { versionControl, configuration, lens, cacheFolder, keepIndex: options.keepIndex, jobs, scratch: context.scratch, deadline, progress: options.progress });
  const regenerationMilliseconds = missing.length > 0 ? Date.now() - started : 0;
  if (regeneration.peakMemory > 0) {
    await recordPeakMemory(historyFolder, lens.key, regeneration.peakMemory, regeneration.timings.length);
    options.progress(`the largest summarizing process took ${formatBytes(regeneration.peakMemory)} at its peak; the next run sizes its pool by the largest measured here`);
  }
  if (regeneration.timings.length < missing.length) {
    const held = sampled.length - missing.length + regeneration.timings.length;
    throw new HistoryStopped(
      `stopped after ${options.stopAfterMinutes} minutes, as asked: the cache at ${relative(cacheFolder)} holds ${held} of the ${sampled.length} changes sampled under lens ${lens.key}, and ${missing.length - regeneration.timings.length} remain. ` +
        "No history was written; the next run resumes from the cache."
    );
  }
  const timings = regeneration.timings;

  const texts = new Interner();
  const unwritten: Array<[string, string, string]> = [];
  const builder = await buildSequence(sampled, {
    unwritten,
    bundleExclude: configuration.bundleExclude,
    versionControl,
    lens,
    cacheFolder,
    authors: options.authors,
    texts,
    source: {
      system: versionControl.system,
      root: options.workspace,
      branch: end.branch,
      head: end.head,
      shallow: end.truncated,
      knowledgeBegins: mainline[0].id,
      sampling: options.sampling,
      authors: options.authors
    }
  });
  const sequence = builder.finish();
  options.progress(`every step replayed to the shape and the rows it was derived from, ${sequence.steps.length} steps`);
  const headCheck = await checkHead(sequence, {
    versionControl,
    configuration,
    lens,
    textStore,
    texts,
    asked: options.checkHead === true,
    ownConfiguration: options.configPath === undefined,
    head: end.head,
    scratch: context.scratch
  });
  options.progress(headCheck.line);
  await writeSequence(sequence, historyFolder, textStore, texts, options.progress);
  const unwrittenList = await writeUnwritten(historyFolder, unwritten);
  if (unwrittenList !== undefined) {
    options.progress(
      `${unwritten.length} files at ${new Set(unwritten.map(([commit]) => commit)).size} commits were not written into their trees and so not read, each for the reason the list gives (a symbolic link that leads to no file of the tree, a name this disk cannot hold); they read in the history as gone at those commits. The list is ${relative(unwrittenList)}`
    );
  }
  await writeInPlace(path.join(cacheFolder, WHOLE_MARKER), `${JSON.stringify({ head: end.head, changes: sampled.length, at: new Date().toISOString() })}\n`);

  // Only now does the current lens hold every sampled change, so the caches of other lenses can go.
  const superseded = await supersededCaches(historyFolder, lens.key, options.removeSuperseded === true ? "all" : "none", relative);
  for (const cache of superseded) {
    options.progress(`${cache.removed ? "removed" : "kept"} ${cache.folder}, the cache of a lens that is not the current one: ${formatBytes(cache.bytes)}`);
  }
  if (superseded.some((cache) => !cache.removed)) {
    options.progress(`--remove-superseded removes the caches of other lenses, ${formatBytes(superseded.reduce((sum, cache) => sum + cache.bytes, 0))} in all`);
  }

  return {
    sequence,
    file: relative(path.join(historyFolder, HISTORY_FILE)),
    cache: relative(cacheFolder),
    sampled: sampled.length,
    regenerated: missing.length,
    cached: sampled.length - missing.length,
    millisecondsPerChange: timings.length > 0 ? timings.reduce((sum, time) => sum + time, 0) / timings.length : 0,
    jobs,
    regenerationMilliseconds,
    peakMemory: regeneration.peakMemory,
    cacheBytes: await folderBytes(cacheFolder),
    superseded,
    headCheck
  };
}

/**
 * Claims the history folder for this run, or refuses while another run on this machine holds a claim.
 *
 * @remarks
 * Each run makes a claim of its own, an empty file whose name says the machine and the process, and only then lists
 * the claims there are: it holds the folder when no other claim of a live run stands, and otherwise withdraws its own,
 * waits a short random while and tries again, refusing after {@link LOCK_ATTEMPTS} tries. Two runs can never both
 * hold the folder: each made its claim before it looked, so the later to look always sees the other's. A claim whose
 * process has ended on this machine, or that a run on another machine left in a folder copied here, as a restored
 * cache is, is removed by whoever meets it, which is safe whoever else removes it too. Until a second review of
 * 2026-11-19 one lock file was written and then taken over by removing it, and two runs meeting a dead lock at once
 * could both proceed, one removing the other's fresh lock.
 *
 * @returns The claim's path, which the caller removes when the run ends.
 */
export async function holdLock(historyFolder: string, progress: (line: string) => void): Promise<string> {
  const host = createHash("sha256").update(os.hostname()).digest("hex").slice(0, 12);
  for (let attempt = 1; ; attempt += 1) {
    const claim = path.join(historyFolder, `run.${host}.${process.pid}.${randomBytes(6).toString("hex")}.lock`);
    await fs.writeFile(claim, "", { flag: "wx" });
    let holder: { pid: number; since: Date } | undefined;
    for (const name of await fs.readdir(historyFolder)) {
      const other = LOCK_NAME.exec(name);
      if (other === null || path.join(historyFolder, name) === claim) continue;
      const pid = Number(other[2]);
      if (other[1] === host && alive(pid)) {
        holder ??= { pid, since: (await fs.stat(path.join(historyFolder, name)).catch(() => undefined))?.mtime ?? new Date(0) };
        continue;
      }
      await fs.rm(path.join(historyFolder, name), { force: true });
      progress(`removed ${name}, the claim of ${other[1] === host ? `process ${pid}, which has ended` : "a run on another machine"}`);
    }
    if (holder === undefined) return claim;
    await fs.rm(claim, { force: true });
    if (attempt >= LOCK_ATTEMPTS) {
      throw new Error(
        `another history run (process ${holder.pid}, since ${holder.since.toISOString()}) is writing under ${historyFolder}; wait for it to end, or remove its run.*.${holder.pid}.*.lock there if no such process runs`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 200));
  }
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** Removes every file a stopped run left half written under the history folder, `*.partial`, and returns how many. */
async function removeLeftovers(historyFolder: string): Promise<number> {
  let removed = 0;
  for (const entry of await fs.readdir(historyFolder, { withFileTypes: true, recursive: true })) {
    if (entry.name.endsWith(".partial")) {
      await fs.rm(path.join(entry.parentPath, entry.name), { recursive: true, force: true });
      removed += 1;
    }
  }
  return removed;
}

/**
 * The sampled changes the cache lacks: those without a summary, or without an index where one is kept, and those
 * `damaged`, whose summary does not read as this lens's summary of the change or names a text the store lacks or
 * holds changed. A changed text is removed, so that the change's new summary writes it afresh.
 */
async function uncached(sampled: readonly MainlineChange[], cacheFolder: string, textStore: string, lens: string, keepIndex: boolean): Promise<{ missing: MainlineChange[]; damaged: string[] }> {
  const missing: MainlineChange[] = [];
  const damaged: string[] = [];
  const named = new Map<string, Set<string>>();
  await inBatches(sampled, async (change) => {
    const wanted = keepIndex ? [summaryPath(cacheFolder, change.id), indexPath(cacheFolder, change.id)] : [summaryPath(cacheFolder, change.id)];
    for (const file of wanted) {
      try {
        await fs.access(file);
      } catch {
        missing.push(change);
        return;
      }
    }
    try {
      named.set(change.id, new Set(textsOfSummary(await readSummaryFile(summaryPath(cacheFolder, change.id), lens, change.id))));
    } catch {
      missing.push(change);
      damaged.push(change.id);
    }
  });
  // Every text the cached summaries name, read once and held to its hash.
  const sound = new Map<string, boolean>();
  for (const hashes of named.values()) {
    for (const hash of hashes) sound.set(hash, false);
  }
  await inBatches([...sound.keys()], async (hash) => {
    const file = textPath(textStore, hash);
    let text: string;
    try {
      text = await fs.readFile(file, "utf8");
    } catch {
      return;
    }
    if (textHash(text) === hash) {
      sound.set(hash, true);
    } else {
      await fs.rm(file, { force: true });
    }
  });
  for (const change of sampled) {
    const hashes = named.get(change.id);
    if (hashes !== undefined && [...hashes].some((hash) => !sound.get(hash))) {
      missing.push(change);
      damaged.push(change.id);
    }
  }
  // In the mainline's order, as they were sampled.
  const order = new Map(sampled.map((change, index) => [change.id, index]));
  missing.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  damaged.sort((a, b) => order.get(a)! - order.get(b)!);
  return { missing, damaged };
}

/** Every text a summary names by hash. */
function textsOfSummary(summary: CommitSummary): string[] {
  const hashes: string[] = [];
  for (const file of summary.files) {
    if (file.authored !== undefined) hashes.push(file.authored);
    for (const symbol of file.symbols) {
      if (symbol.text !== undefined) hashes.push(symbol.text);
    }
  }
  return hashes;
}

// How many files are read at once: enough to keep the disk busy, few enough to stay far from the limit of open files.
const READ_BATCH = 64;

/** Runs `work` over the items, at most {@link READ_BATCH} at once. */
async function inBatches<T>(items: readonly T[], work: (item: T) => Promise<void>): Promise<void> {
  for (let start = 0; start < items.length; start += READ_BATCH) {
    await Promise.all(items.slice(start, start + READ_BATCH).map(work));
  }
}

/**
 * The cache folders under the history folder named by a lens key other than the current one, each removed as asked:
 * `all`, `none`, or `all but the newest whole`, which keeps the other lens a whole history was most recently written
 * from (its `whole.json`), so that a lens that comes back finds its cache.
 */
async function supersededCaches(historyFolder: string, current: string, remove: "all" | "none" | "all but the newest whole", relative: (absolute: string) => string): Promise<SupersededCache[]> {
  const others: Array<{ lens: string; folder: string; whole?: string }> = [];
  for (const entry of await fs.readdir(historyFolder, { withFileTypes: true })) {
    // A lens key is sixteen hexadecimal digits (`lensOf`); nothing else the history folder holds is named so.
    if (!entry.isDirectory() || !/^[0-9a-f]{16}$/u.test(entry.name) || entry.name === current) {
      continue;
    }
    const folder = path.join(historyFolder, entry.name);
    const whole = await fs.readFile(path.join(folder, WHOLE_MARKER), "utf8").then((text) => (JSON.parse(text) as { at?: string }).at, () => undefined);
    others.push({ lens: entry.name, folder, ...(typeof whole === "string" ? { whole } : {}) });
  }
  const newestWhole = others.filter((other) => other.whole !== undefined).sort((a, b) => compare(b.whole!, a.whole!))[0]?.lens;
  const caches: SupersededCache[] = [];
  for (const other of others) {
    const bytes = await folderBytes(other.folder);
    const removed = remove === "all" || (remove === "all but the newest whole" && other.lens !== newestWhole);
    if (removed) {
      await fs.rm(other.folder, { recursive: true, force: true });
    }
    caches.push({ lens: other.lens, folder: relative(other.folder), bytes, removed });
  }
  return caches.sort((a, b) => compare(a.lens, b.lens));
}

/** The bytes of every file under a folder. */
async function folderBytes(folder: string): Promise<number> {
  let bytes = 0;
  for (const entry of await fs.readdir(folder, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      bytes += (await fs.stat(path.join(entry.parentPath, entry.name))).size;
    }
  }
  return bytes;
}

/** What runs measured of a summarizing process's peak memory on this repository. */
export interface PoolRecord {
  /** The lens the latest run measured under. */
  lens: string;
  /** The largest peak resident memory the record holds, in bytes. */
  peakMemory: number;
  /** How many changes were measured under the lens. */
  changes: number;
}

/** What a run last recorded of a summarizing process's peak memory on this repository, when one has. */
async function recordedPool(historyFolder: string): Promise<PoolRecord | undefined> {
  try {
    const record = JSON.parse(await fs.readFile(path.join(historyFolder, POOL_RECORD), "utf8")) as Partial<PoolRecord>;
    return typeof record.peakMemory === "number" && record.peakMemory > 0 && typeof record.lens === "string"
      ? { lens: record.lens, peakMemory: record.peakMemory, changes: typeof record.changes === "number" ? record.changes : 0 }
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The record after a run measured `peakMemory` over `changes` changes under `lens`. Under the same lens the record
 * keeps the largest peak of every run, since a run that regenerates only the newest change sees one change's peak and
 * not the history's. Under a new lens the generator has changed, and the run's peak replaces the record's only when it
 * was measured over at least as many changes; until then the larger of the two stands, so that a small sampled run
 * never shrinks the estimate a whole history was measured to need.
 */
export function nextPoolRecord(previous: PoolRecord | undefined, lens: string, peakMemory: number, changes: number): PoolRecord {
  if (previous === undefined) return { lens, peakMemory, changes };
  if (previous.lens === lens) return { lens, peakMemory: Math.max(previous.peakMemory, peakMemory), changes: previous.changes + changes };
  return { lens, peakMemory: changes >= previous.changes ? peakMemory : Math.max(previous.peakMemory, peakMemory), changes };
}

async function recordPeakMemory(historyFolder: string, lens: string, peakMemory: number, changes: number): Promise<void> {
  const record = nextPoolRecord(await recordedPool(historyFolder), lens, peakMemory, changes);
  await writeInPlace(path.join(historyFolder, POOL_RECORD), `${JSON.stringify(record)}\n`);
}

/**
 * The lens's configuration: the file given, else the workspace's own
 * `.live-docs.config.json` as it stands, else the shipped defaults, applied
 * to every change, since a change's own configuration would make a change of
 * the tool look like a change of the code. Its docs root must lie inside the
 * workspace, since the docs of every change are written there in the scratch
 * tree and the cache beside them in the real one.
 */
async function lensConfiguration(workspaceRoot: string, configPath: string | undefined): Promise<LiveDocumentationConfig> {
  const file = configPath ? path.resolve(configPath) : path.join(workspaceRoot, ".live-docs.config.json");
  let input: LiveDocumentationConfigInput = {};
  try {
    input = parseLiveDocumentationConfigBytes(await fs.readFile(file));
  } catch (error) {
    if (configPath || (error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw new Error(`cannot read the configuration at ${file}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }
  const configuration = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const docsRoot = path.relative(workspaceRoot, path.resolve(workspaceRoot, configuration.root));
  if (docsRoot === "" || docsRoot.startsWith("..") || path.isAbsolute(docsRoot)) {
    throw new Error(`the docs root ${configuration.root} does not lie inside the workspace; the history is written under it`);
  }
  return configuration;
}

/** Makes the history folder, which ignores itself, since nothing derived from local history is committed. */
async function prepareHistoryFolder(historyFolder: string, cacheFolder: string): Promise<void> {
  await fs.mkdir(cacheFolder, { recursive: true });
  await fs.writeFile(
    path.join(historyFolder, ".gitignore"),
    "# Written by the history command: the cache and the sequence are derived from this clone's history and never committed.\n*\n",
    "utf8"
  );
}

interface SequenceContext {
  versionControl: VersionControl;
  lens: HistoryLens;
  cacheFolder: string;
  authors: boolean;
  source: HistorySequence["source"];
  /** The texts' hashes, each given an id where the sequence first names it. */
  texts: Interner;
  /** Filled with the files each summary says its tree did not hold. */
  unwritten: Array<[commit: string, path: string, reason: string]>;
  /** The configuration's bundle exclusions, applied to each summary as it is read (`bundled.ts`). */
  bundleExclude: readonly string[];
}

/**
 * The sequence from the cached summaries of the sampled changes, oldest first, and the version control's word between
 * each two, each text the summaries name given its id as it is first met.
 */
async function buildSequence(sampled: readonly MainlineChange[], context: SequenceContext): Promise<SequenceBuilder> {
  const commitOf = (change: MainlineChange): CommitInfo => ({
    id: change.id,
    parents: change.parents,
    date: change.date,
    ...(context.authors ? { author: change.author } : {}),
    subject: change.subject
  });
  const textId = (hash: string): number => context.texts.id(hash);
  // What the history reads of a summary is what the bundle shows: the documents `bundleExclude` names are left out here.
  const read = async (change: MainlineChange): Promise<CommitSummary> =>
    bundledSummary(await readSummaryFile(summaryPath(context.cacheFolder, change.id), context.lens.key, change.id), context.bundleExclude);
  const notRead = (change: MainlineChange, summary: CommitSummary): void => {
    for (const [file, reason] of summary.unwritten ?? []) context.unwritten.push([change.id, file, reason]);
  };
  const first = await read(sampled[0]);
  notRead(sampled[0], first);
  const builder = new SequenceBuilder({ lens: context.lens, source: context.source }, commitOf(sampled[0]), shapeOfSummary(first), rowsOfSummary(first, textId));
  for (let index = 1; index < sampled.length; index += 1) {
    const [summary, version] = await Promise.all([read(sampled[index]), context.versionControl.changesBetween(sampled[index - 1].id, sampled[index].id)]);
    notRead(sampled[index], summary);
    builder.add(commitOf(sampled[index]), shapeOfSummary(summary), version, rowsOfSummary(summary, textId));
  }
  return builder;
}

/**
 * Writes beside the sequence every entry the history did not write into a commit's tree, and so did not read, with
 * why (`<history folder>/unwritten.txt`, a line each: the commit, the path and the reason), or removes
 * that list where there is none. The sequence does not carry them: such a file reads in it as gone at that commit.
 *
 * @returns The list's path, when there is one.
 */
async function writeUnwritten(historyFolder: string, unwritten: ReadonlyArray<[commit: string, path: string, reason: string]>): Promise<string | undefined> {
  const file = path.join(historyFolder, UNWRITTEN_LIST);
  if (unwritten.length === 0) {
    await fs.rm(file, { force: true });
    return undefined;
  }
  const lines = unwritten.map(([commit, entry, reason]) => `${commit}\t${JSON.stringify(entry)}\t${reason}`);
  await writeInPlace(file, `# The entries the history did not write into each commit's tree, and so did not read: commit, path, reason.\n${lines.join("\n")}\n`);
  return file;
}

interface HeadCheckContext {
  versionControl: VersionControl;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  textStore: string;
  texts: Interner;
  /** Whether the person asked for the check, asserting that the docs committed at the head were made by this generator under this configuration. */
  asked: boolean;
  /** Whether the lens's configuration is the workspace's own, the one its committed mirror was made under. */
  ownConfiguration: boolean;
  head: string;
  scratch: Scratch;
}

/**
 * The check at the head (see `headCheck.ts`): the last step, replayed through every step from the base, must be the
 * graph read afresh from the Live Docs committed at the head. It applies by {@link HEAD_CHECK_RULE}; where it applies,
 * a difference or docs that do not read stop the run, and where it does not, the line says it was skipped and why.
 */
async function checkHead(sequence: HistorySequence, context: HeadCheckContext): Promise<{ applied: boolean; line: string }> {
  const generator = context.lens.generator;
  const own = generator.code !== null && generator.modified === null && generator.commit === context.head && context.ownConfiguration;
  if (!context.asked && !own) {
    const why =
      generator.code === null
        ? "this generator is installed, not run from a checkout of its repository"
        : generator.modified !== null
          ? "this generator's code differs from its commit"
          : generator.commit !== context.head
            ? `this generator runs from ${generator.commit?.slice(0, 8) ?? "no commit"} and the history ends at ${context.head.slice(0, 8)}`
            : "the configuration was given with --config";
    return { applied: false, line: `the check at the head was skipped: ${HEAD_CHECK_RULE}, and here ${why}` };
  }
  const scratch = await context.scratch.folder("live-docs-history-head-");
  let committed: LiveDocGraph;
  try {
    const directory = path.join(scratch, path.basename(scratch));
    const tree = await context.versionControl.workingTree(context.head, directory, treeOptions(context.configuration, directory));
    try {
      committed = await readLiveDocGraph({ workspaceRoot: tree.root, config: context.configuration });
    } catch (error) {
      throw new Error(`the Live Docs committed at ${context.head.slice(0, 8)} do not read, so the history's last step cannot be held to them: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  } finally {
    await context.scratch.release(scratch);
  }
  if (Object.keys(committed.files).length === 0) {
    if (context.asked) {
      throw new Error(`--check-head holds the history's last step to the Live Docs committed at ${context.head.slice(0, 8)}, and none are committed there`);
    }
    return { applied: false, line: `the check at the head was skipped: no Live Docs are committed at ${context.head.slice(0, 8)}` };
  }
  const moment = momentAt(sequence, sequence.steps.length);
  const texts = new Map<number, string>();
  const ids = [...new Set([...moment.rows.values()].flatMap(textsOfFile))];
  await inBatches(ids, async (id) => {
    texts.set(id, await readStoredText(context.textStore, context.texts.values[id]));
  });
  const differences = headDifferences(moment, committed, (id) => texts.get(id)!);
  if (differences.length > 0) {
    throw new Error(
      `the history's last step is not the graph of the Live Docs committed at ${context.head.slice(0, 8)}: ${differences.slice(0, 5).join("; ")}. ` +
        "When the mirror was not regenerated after the last change of the source, run `npm run live-docs:generate`, commit the docs and run again."
    );
  }
  const symbols = [...moment.rows.values()].reduce((sum, file) => sum + file.symbols.length, 0);
  return {
    applied: true,
    line: `the last step's ${moment.rows.size} files, ${symbols} symbols with their words, and ${linksOf(moment.rows).length} links are those of the Live Docs committed at ${context.head.slice(0, 8)}, read afresh`
  };
}

/** A text of the store, held to its hash. */
async function readStoredText(store: string, hash: string): Promise<string> {
  const text = await fs.readFile(textPath(store, hash), "utf8");
  if (textHash(text) !== hash) {
    // The texts were held to their hashes at the run's start: this one changed while it ran.
    throw new Error(`the text ${hash} in ${store} changed while the history ran; run it again, which summarizes again every change that names it`);
  }
  return text;
}

/**
 * Writes the words store and then the sequence beside it, so that a sequence never names a store that is not whole:
 * the store goes to a folder named by its content, `history-words-<hash>`, the sequence is renamed into place after
 * it, and only then are the stores no sequence names removed. A run stopped at any point leaves a sequence and the
 * store it names.
 */
async function writeSequence(sequence: HistorySequence, historyFolder: string, textStore: string, texts: Interner, progress: (line: string) => void): Promise<void> {
  const read: string[] = new Array<string>(texts.values.length);
  await inBatches([...texts.values.keys()], async (id) => {
    read[id] = await readStoredText(textStore, texts.values[id]);
  });
  const { head, parts } = wordsStore(sequence, WORDS_DIRECTORY, (id) => read[id]);
  const json = parts.map((part) => JSON.stringify(part));
  const hash = createHash("sha256");
  for (const part of json) hash.update(part).update("\0");
  const folder = `${WORDS_DIRECTORY}-${hash.digest("hex").slice(0, 16)}`;
  const target = path.join(historyFolder, folder);
  if (!(await exists(target))) {
    const partial = `${target}.${process.pid}.partial`;
    await fs.rm(partial, { recursive: true, force: true });
    await fs.mkdir(partial);
    for (const [index, part] of json.entries()) {
      await fs.writeFile(path.join(partial, `${index}.json`), part, "utf8");
    }
    await fs.rename(partial, target);
  }
  const words: WordsHead = { ...head, folder };
  sequence.words = words;
  await writeInPlace(path.join(historyFolder, HISTORY_FILE), JSON.stringify(sequence));
  for (const entry of await fs.readdir(historyFolder, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== folder && (entry.name === WORDS_DIRECTORY || entry.name.startsWith(`${WORDS_DIRECTORY}-`))) {
      await fs.rm(path.join(historyFolder, entry.name), { recursive: true, force: true });
    }
  }
  const bytes = json.reduce((sum, part) => sum + Buffer.byteLength(part), 0);
  progress(`wrote the words of every step beside the sequence: ${head.texts} texts in ${parts.length} parts by directory, ${formatBytes(bytes)}`);
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** A summary in the cache, refused unless it is this lens's summary of the change. */
async function readSummaryFile(file: string, lens: string, change: string): Promise<CommitSummary> {
  const summary = JSON.parse(gunzipSync(await fs.readFile(file)).toString("utf8")) as CommitSummary;
  if (summary.format !== HISTORY_SUMMARY_FORMAT || summary.lens !== lens || summary.commit !== change) {
    throw new Error(`${file} is not the summary of ${change} under lens ${lens}`);
  }
  return summary;
}

async function writeInPlace(target: string, content: string): Promise<void> {
  const temporary = `${target}.${process.pid}.partial`;
  await fs.writeFile(temporary, content, "utf8");
  await fs.rename(temporary, target);
}

/** A size in the units a person reads it in. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
