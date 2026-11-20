/**
 * The history command: a repository's history regenerated under one lens and
 * written as one sequence, `<docsRoot>/history/history.json`, for the CLI and
 * the Explorer to read (the plan's C1, in `.mdmd/layer-3/change-over-time.mdmd.md`).
 *
 * @remarks
 * The mainline is read from the version control and sampled. Every sampled
 * change the cache lacks under the lens is summarized in a scratch tree by a
 * pool of worker processes, each started once and given runs of consecutive
 * changes, keeping its tree from one change to the next (`regenerate.ts`;
 * until 2026-11-20 a process of its own for each change); then the sequence is derived from
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
 * A change whose summary stands counts as cached. Where the sequence reads a
 * summary that does not read, or one that first named a text the store lacks
 * or holds other than the text of its hash, that change is summarized again
 * and the sequence read again, so that a store damaged or copied in part
 * mends itself rather than failing every later run. One run at a time writes
 * under a history folder: a run holds a lock there while it writes, and
 * removes at its start what a stopped run left half written.
 *
 * Since 2026-11-20 a run goes on from the sequence the last run wrote, rather
 * than derive and replay every step again, when the line has only grown since
 * and nothing that decides the steps has changed: the record beside the
 * sequence (`history-resume.json`) names the sequence's bytes and the key it
 * was read under, the lens's key, the identity of the code that reads
 * summaries into a sequence and the whole configuration, and every change of
 * the written sequence must be the first of the changes sampled now, as this
 * run would write it. Only the last written change's summary and the new
 * ones are read, each new step is replayed and held to its summary as every
 * step always was, and the bytes written are those a whole derivation writes,
 * which `--rederive` asks for. That is a trade: a run that goes on does not
 * read the written steps' summaries, so a damaged one is found at the next
 * whole derivation and not at once, while the sequence already written stays
 * right, since it was made when they read and the record holds it to its own
 * hash. Every text the sequence names is still read from the store and held
 * to its hash at every run, for the words, so a damaged text is mended at once. The steps'
 * git words are asked before any summary is read, a few at once, since a
 * process with a large heap pays for every process it starts; the check at
 * the head reads the committed docs from git's object store rather than
 * writing the head's tree (`headCheck.ts`). Measured in the record of
 * 2026-11-20 (`Probes/history-rebuild-fast`) on this repository's 1,356
 * commits, the cache whole: a run with nothing to regenerate took 96 s
 * before; after, 61 s where it derived every step and 4.5 s where it went on.
 *
 * The key is broad: the code's identity covers every file of the engine and
 * the generator but a test, so any commit that touches either package derives
 * every step once at the next run, while a repository that only uses the tool
 * goes on every time. An independent review of the same day found the key
 * taken after the regeneration, the record believed in any shape, a record's
 * damage failing every later run, and git's own version outside the key; each
 * is mended, and the record now holds its own hash.
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
import { bundledSummary } from "@live-documentation/engine/live-docs/history/bundled";
import { Interner } from "@live-documentation/engine/live-docs/history/codec";
import { HISTORY_DIRECTORY, HISTORY_FILE, type CommitInfo, type HistoryLens, type HistorySequence, type Sampling } from "@live-documentation/engine/live-docs/history/format";
import { openGitRepository } from "@live-documentation/engine/live-docs/history/git";
import { canonicalJson, lensOf } from "@live-documentation/engine/live-docs/history/lens";
import { linksOf, rowsOfSummary } from "@live-documentation/engine/live-docs/history/rows";
import { sampleChanges } from "@live-documentation/engine/live-docs/history/sampling";
import { momentAt, SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import { shapeOfSummary } from "@live-documentation/engine/live-docs/history/shape";
import { HISTORY_SUMMARY_FORMAT, textHash, type CommitSummary } from "@live-documentation/engine/live-docs/history/summary";
import { TEXT_STORE_DIRECTORY, textPath } from "@live-documentation/engine/live-docs/history/textStore";
import type { MainlineChange, VersionControl } from "@live-documentation/engine/live-docs/history/versionControl";
import { WORDS_DIRECTORY, wordsStore, type WordsHead } from "@live-documentation/engine/live-docs/history/words";

import { generatorIdentity, sequenceCodeIdentity } from "./generatorIdentity";
import { committedLiveDocGraph, headDifferences, leftOutAtHead } from "./headCheck";
import { indexPath, regenerate, Scratch, summaryPath } from "./regenerate";

/** What to compute. */
export interface HistoryOptions {
  /** The repository's top level, as the person gave it. */
  workspace: string;
  /** A configuration file for the lens, relative to the working directory; the workspace's `.live-docs.config.json` when absent, or the defaults. */
  configPath?: string;
  sampling: Sampling;
  /** How many changes are regenerated at once, one by each worker process of the pool; when absent, {@link poolSize} for this machine. */
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
  /** Derive every step of the sequence from the summaries, rather than go on from the sequence the last run wrote. */
  rederive?: boolean;
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

/**
 * What the history did not read of a commit's files, by kind, as each commit's summary names them: the entries its tree
 * did not hold (`unwritten`), and the files the generator could not map there (`unmapped`). The sequence does not carry
 * them, and such a file reads in it as gone at that commit; each kind is listed beside the sequence (`list`, a line each:
 * the commit, the path and the reason), said on every run, carried in the record a run goes on from, and passed over by
 * the check at the head, by one path through this module. Until a review of 2026-11-20 only the first kind was: the
 * second was written into each summary and read by nothing, so that after the run that made the summary no command and
 * no file said a file was not mapped, and the check at the head reported its committed doc as a difference.
 */
const NOT_READ = {
  unwritten: {
    list: "unwritten.txt",
    heading: "The entries the history did not write into each commit's tree, and so did not read",
    said: "were not written into their trees and so not read, each for the reason the list gives (a symbolic link that leads to no file of the tree, a name this disk cannot hold)",
    atHead: "the head's tree did not hold them"
  },
  unmapped: {
    list: "unmapped.txt",
    heading: "The files the generator could not map at each commit, and so did not read",
    said: "could not be mapped by the generator, each for the reason the list gives",
    atHead: "the generator could not map them at the head"
  }
} as const;

/** A kind of what the history did not read of a commit's files ({@link NOT_READ}). */
type NotReadKind = keyof typeof NOT_READ;

const NOT_READ_KINDS = Object.keys(NOT_READ) as NotReadKind[];

/** What the history did not read, by kind: each commit, a path and why, in the line's order and each summary's. */
type NotRead = Record<NotReadKind, Array<[commit: string, path: string, reason: string]>>;

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
  const byMemory = Math.floor(poolMemory(machine) / machine.peakMemory);
  return Math.max(1, Math.min(machine.processors - 1, byMemory));
}

/** The memory the pool may hold, half the machine's, by which it is sized ({@link poolSize}) and each worker bounded (`workerBound`). */
export function poolMemory(machine: { totalMemory: number }): number {
  return machine.totalMemory / 2;
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
  // Both identities are taken before any work, so that the record a run leaves is keyed with the code that did the run,
  // even when the code on disk changes while it runs (the independent review of 2026-11-20, finding 1).
  const [generator, code] = await Promise.all([generatorIdentity(), sequenceCodeIdentity()]);
  const lens = lensOf(generator, configuration, { ignoresCase: await versionControl.ignoresCase() });

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
      return await run(options, { workspaceRoot, versionControl, configuration, lens, code, end, mainline, sampled, historyFolder, cacheFolder, scratch });
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
  /** The identity of the code that reads summaries into a sequence, taken at the run's start (`sequenceCodeIdentity`). */
  code: string;
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
  const missing = await absentFromCache(sampled, cacheFolder, options.keepIndex);
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
  const timings: number[] = [];
  let peakMemory = 0;
  let regenerationMilliseconds = 0;
  // The most changes summarized at once, whether they were missing or summarized again.
  let jobsUsed = jobs;
  // Summarizes the changes, stopping the run where the deadline left some undone.
  const summarize = async (changes: readonly MainlineChange[]): Promise<void> => {
    if (changes.length === 0) return;
    const at = Math.max(1, Math.min(machineJobs, changes.length));
    jobsUsed = Math.max(jobsUsed, at);
    const began = Date.now();
    const regeneration = await regenerate(changes, { store: versionControl.store, configuration, lens, cacheFolder, keepIndex: options.keepIndex, jobs: at, memory: poolMemory(machine), scratch: context.scratch, deadline, progress: options.progress });
    regenerationMilliseconds += Date.now() - began;
    timings.push(...regeneration.timings);
    peakMemory = Math.max(peakMemory, regeneration.peakMemory);
    if (regeneration.peakMemory > 0) {
      await recordPeakMemory(historyFolder, lens.key, regeneration.peakMemory, regeneration.timings.length);
      options.progress(`the largest summarizing process took ${formatBytes(regeneration.peakMemory)} at its peak; the next run sizes its pool by the largest measured here`);
    }
    if (regeneration.timings.length < changes.length) {
      const held = sampled.length - (changes.length - regeneration.timings.length);
      throw new HistoryStopped(
        `stopped after ${options.stopAfterMinutes} minutes, as asked: the cache at ${relative(cacheFolder)} holds ${held} of the ${sampled.length} changes sampled under lens ${lens.key}, and ${changes.length - regeneration.timings.length} remain. ` +
          "No history was written; the next run resumes from the cache."
      );
    }
  };
  await summarize(missing);

  const reading: ReadingContext = {
    versionControl,
    lens,
    cacheFolder,
    textStore,
    historyFolder,
    authors: options.authors,
    bundleExclude: configuration.bundleExclude,
    key: continuationKey(lens.key, context.code, configuration),
    ...(options.rederive === true ? { rederive: "asked with --rederive" } : {}),
    progress: options.progress,
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
  };
  // A summary that does not read, or names a text the store lacks or holds changed, is found where the sequence reads
  // it, and summarized again; the sequence is then read again. One summarized again for that reason must read after.
  let derived = await deriveSequence(sampled, reading);
  const summarizedAgain = new Set<string>();
  while (!derived.whole) {
    const still = derived.damaged.filter((change) => summarizedAgain.has(change.id));
    if (still.length > 0 && derived.wentOn) {
      // Summarizing again did not mend what a run going on met, so the run derives every step instead, once, rather than
      // fail every run until --rederive; it says what the damage was: a summary that still does not read, or a text the
      // record of the written sequence names and the summaries made again do not write.
      const short = (changes: readonly MainlineChange[]): string => changes.map((change) => change.id.slice(0, 8)).join(", ");
      // Taken here, where the run is known not to be whole: inside the callbacks below the variable is not narrowed.
      const doNotRead = derived.unread;
      const unread = still.filter((change) => doNotRead.has(change.id));
      const unwrittenTexts = still.filter((change) => !doNotRead.has(change.id));
      const what = [
        ...(unread.length > 0 ? [`the summaries of ${short(unread)} still do not read`] : []),
        ...(unwrittenTexts.length > 0 ? [`the record of the sequence the last run wrote still names texts that the summaries of ${short(unwrittenTexts)} do not write`] : [])
      ];
      options.progress(`changes summarized again did not mend what a run going on met: ${what.join(", and ")}; every step is derived again`);
      reading.rederive = "a run that went on from it met damage that summarizing again did not mend";
      derived = await deriveSequence(sampled, reading);
      continue;
    }
    if (still.length > 0) {
      throw new Error(`the summaries of ${still.map((change) => change.id.slice(0, 8)).join(", ")} were summarized again by this run and still do not read or name texts the store holds`);
    }
    const ids = derived.damaged.map((change) => change.id);
    options.progress(`${ids.length} changes are summarized again, since their summaries do not read or name texts the store lacks or holds changed: ${ids.slice(0, 3).map((id) => id.slice(0, 8)).join(", ")}${ids.length > 3 ? ", …" : ""}`);
    for (const id of ids) summarizedAgain.add(id);
    await summarize(derived.damaged);
    derived = await deriveSequence(sampled, reading);
  }
  const { builder, texts, read, notRead } = derived;
  const sequence = builder.finish();
  options.progress(derived.line);
  const headCheck = await checkHead(sequence, {
    workspaceRoot,
    configuration,
    lens,
    textOf: (id) => read[id],
    leftOut: atCommit(notRead, end.head),
    asked: options.checkHead === true,
    ownConfiguration: options.configPath === undefined,
    head: end.head
  });
  options.progress(headCheck.line);
  const written = await writeSequence(sequence, historyFolder, read, options.progress);
  await writeContinuation(historyFolder, { format: CONTINUATION_FORMAT, key: reading.key, sequence: written, texts: texts.values, firstNamed: derived.firstNamed, ...notRead });
  for (const kind of NOT_READ_KINDS) {
    const entries = notRead[kind];
    const list = await writeNotRead(historyFolder, kind, entries);
    if (list === undefined) continue;
    // Each file once, and each commit once, however many commits a file stood unread through.
    const files = new Set(entries.map(([, file]) => file)).size;
    const commits = new Set(entries.map(([commit]) => commit)).size;
    options.progress(`${files} files at ${commits} commits ${NOT_READ[kind].said}; they read in the history as gone at those commits. The list is ${relative(list)}`);
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

  // A change both missing and summarized again was regenerated once, as the person counts it.
  const regenerated = new Set([...missing.map((change) => change.id), ...summarizedAgain]).size;
  return {
    sequence,
    file: relative(path.join(historyFolder, HISTORY_FILE)),
    cache: relative(cacheFolder),
    sampled: sampled.length,
    regenerated,
    cached: sampled.length - regenerated,
    millisecondsPerChange: timings.length > 0 ? timings.reduce((sum, time) => sum + time, 0) / timings.length : 0,
    jobs: jobsUsed,
    regenerationMilliseconds,
    peakMemory,
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
 * The sampled changes the cache lacks: those without a summary, or without an index where one is kept, in the
 * mainline's order. Whether a summary that stands reads, and whether the texts it names are sound, is found where the
 * sequence is read from the summaries (`deriveSequence`), which reads each once.
 */
async function absentFromCache(sampled: readonly MainlineChange[], cacheFolder: string, keepIndex: boolean): Promise<MainlineChange[]> {
  const absent = new Set<string>();
  await inBatches(sampled, async (change) => {
    const wanted = keepIndex ? [summaryPath(cacheFolder, change.id), indexPath(cacheFolder, change.id)] : [summaryPath(cacheFolder, change.id)];
    for (const file of wanted) {
      try {
        await fs.access(file);
      } catch {
        absent.add(change.id);
        return;
      }
    }
  });
  return sampled.filter((change) => absent.has(change.id));
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

/** What reading the summaries into a sequence needs. */
interface ReadingContext {
  versionControl: VersionControl;
  lens: HistoryLens;
  cacheFolder: string;
  textStore: string;
  historyFolder: string;
  authors: boolean;
  source: HistorySequence["source"];
  /** The configuration's bundle exclusions, applied to each summary as it is read (`bundled.ts`). */
  bundleExclude: readonly string[];
  /** The key a sequence written by an earlier run must carry for this run to go on from it ({@link continuationKey}). */
  key: string;
  /** Why every step is derived from the summaries, whatever an earlier run wrote, when it is. */
  rederive?: string;
  progress: (line: string) => void;
}

/** The sequence read from the summaries, or the changes whose summaries kept it from being read whole. */
type Derived =
  | {
      whole: true;
      damaged: [];
      builder: SequenceBuilder;
      /** The texts' hashes, each given an id where the sequence first names it. */
      texts: Interner;
      /** Each text by its id, read from the store and held to its hash. */
      read: string[];
      /** For each text's id, the place in the sequence of the change whose summary first named it. */
      firstNamed: number[];
      /** The files each change's summary says the history did not read there, by kind: its tree did not hold them, or the generator could not map them. */
      notRead: NotRead;
      /** What the progress says of how the sequence was made. */
      line: string;
    }
  | {
      whole: false;
      /** The changes whose summaries do not read, or name a text the store lacks or holds changed, in the mainline's order. */
      damaged: MainlineChange[];
      /** Of the damaged, by id, those whose summary itself does not read; the others first named a text the store lacks or holds changed. */
      unread: ReadonlySet<string>;
      /** Whether the reading went on from the sequence the last run wrote, whose record named the texts. */
      wentOn: boolean;
    };

/** How many git processes the reading of the sequence runs at once. */
const GIT_AT_ONCE = 8;

/**
 * The sequence from the cached summaries of the sampled changes, oldest first, and the version control's word between
 * each two: gone on from the sequence the last run wrote, where {@link writtenSequence} finds one this run may go on
 * from, and else derived whole. Each new step is replayed and held to the summary it was derived from as it is
 * written, as every step was when the sequence was first written.
 *
 * @remarks
 * Each summary the reading needs is read once, and every text the sequence names is read once from the store and held
 * to its hash, for the words beside the sequence and the check at the head. Until 2026-11-20 every summary was read
 * twice, once to find what was missing or damaged before regenerating and once to build the sequence, and every text
 * twice; and every step was derived and replayed again at every run, though the line had only grown since the last.
 * A summary that does not read, or that first named a text the store lacks or holds changed, is returned as damaged:
 * the caller summarizes it again and reads again. A changed text is removed first, so that the new summary writes it.
 */
async function deriveSequence(sampled: readonly MainlineChange[], context: ReadingContext): Promise<Derived> {
  const commitOf = (change: MainlineChange): CommitInfo => ({
    id: change.id,
    parents: change.parents,
    date: change.date,
    ...(context.authors ? { author: change.author } : {}),
    subject: change.subject
  });
  const head = { lens: context.lens, source: context.source };
  const damaged = new Set<string>();
  // Of the damaged, those whose summary itself does not read; the others first named a text the store lacks or holds changed.
  const unread = new Set<string>();
  // What the history reads of a summary is what the bundle shows: the documents `bundleExclude` names are left out here.
  const read = async (index: number): Promise<CommitSummary | undefined> => {
    const change = sampled[index];
    try {
      return bundledSummary(await readSummaryFile(summaryPath(context.cacheFolder, change.id), context.lens.key, change.id), context.bundleExclude);
    } catch {
      damaged.add(change.id);
      unread.add(change.id);
      return undefined;
    }
  };
  let texts = new Interner();
  let firstNamed: number[] = [];
  let notRead = noneNotRead();
  // Each text's id, given where it is first named, and the place of the change that first named it.
  const textId =
    (index: number) =>
    (hash: string): number => {
      const known = texts.values.length;
      const id = texts.id(hash);
      if (id === known) firstNamed.push(index);
      return id;
    };
  const noteNotRead = (index: number, summary: CommitSummary): void => {
    for (const kind of NOT_READ_KINDS) {
      for (const [file, reason] of summary[kind] ?? []) notRead[kind].push([sampled[index].id, file, reason]);
    }
  };

  let builder: SequenceBuilder | undefined;
  let start = 1;
  let line: string | undefined;
  const written = context.rederive !== undefined ? { reason: context.rederive } : await writtenSequence(sampled, commitOf, context);
  if ("sequence" in written) {
    const last = written.sequence.steps.length;
    texts = new Interner(written.record.texts);
    firstNamed = [...written.record.firstNamed];
    const recorded = written.record;
    notRead = Object.fromEntries(NOT_READ_KINDS.map((kind) => [kind, recorded[kind].map(([commit, file, reason]): [string, string, string] => [commit, file, reason])])) as NotRead;
    const summary = await read(last);
    if (summary === undefined) return { whole: false, damaged: sampled.filter((change) => damaged.has(change.id)), unread, wentOn: true };
    try {
      builder = SequenceBuilder.continuing(head, written.sequence, shapeOfSummary(summary), rowsOfSummary(summary, textId(last)));
      start = last + 1;
      line = `went on from the sequence the last run wrote, its ${last + 1} changes replayed when it was written, and replayed the ${sampled.length - start} new steps to the shape and the rows each was derived from`;
    } catch (error) {
      context.progress(`every step is derived again: ${error instanceof Error ? error.message : String(error)}`);
      builder = undefined;
    }
  }
  if (builder === undefined) {
    texts = new Interner();
    firstNamed = [];
    notRead = noneNotRead();
    const first = await read(0);
    if (first !== undefined) {
      noteNotRead(0, first);
      builder = new SequenceBuilder(head, commitOf(sampled[0]), shapeOfSummary(first), rowsOfSummary(first, textId(0)));
    }
    start = 1;
  }
  // Git's word between each two changes, asked before the summaries are read, while this process is small: a process
  // with a large heap pays for every process it starts (the probe of 2026-11-20: 17 s for 1,333 of them, against 5.6 s).
  const words = await atOnce(sampled.slice(start), GIT_AT_ONCE, (change, offset) => context.versionControl.changesBetween(sampled[start + offset - 1].id, change.id));
  for (let index = start; index < sampled.length; index += 1) {
    const summary = await read(index);
    if (summary === undefined) continue;
    noteNotRead(index, summary);
    // A summary after a damaged one is still read, for what it names, so that one reading finds every damaged change.
    const rows = rowsOfSummary(summary, textId(index));
    if (builder !== undefined && damaged.size === 0) builder.add(commitOf(sampled[index]), shapeOfSummary(summary), words[index - start], rows);
  }
  const textsRead = new Array<string>(texts.values.length);
  await inBatches([...texts.values.keys()], async (id) => {
    const hash = texts.values[id];
    const file = textPath(context.textStore, hash);
    let text: string | undefined;
    try {
      text = await fs.readFile(file, "utf8");
    } catch {
      text = undefined;
    }
    if (text !== undefined && textHash(text) === hash) {
      textsRead[id] = text;
      return;
    }
    if (text !== undefined) await fs.rm(file, { force: true });
    damaged.add(sampled[firstNamed[id]].id);
  });
  if (damaged.size > 0 || builder === undefined) return { whole: false, damaged: sampled.filter((change) => damaged.has(change.id)), unread, wentOn: line !== undefined };
  const why = "reason" in written && written.reason !== NOTHING_WRITTEN ? `; the sequence the last run wrote was not gone on from: ${written.reason}` : "";
  return {
    whole: true,
    damaged: [],
    builder,
    texts,
    read: textsRead,
    firstNamed,
    notRead,
    line: line ?? `every step replayed to the shape and the rows it was derived from, ${sampled.length - 1} steps${why}`
  };
}

/** Runs `work` over the items, at most `size` at once, and gives the results in the items' order. */
async function atOnce<T, R>(items: readonly T[], size: number, work: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await work(items[index], index);
      }
    })
  );
  return results;
}

/**
 * The file beside the sequence that says how the last run made it, so that the next run may go on from it: the
 * sequence's own hash, the key it was read under, the texts' hashes by their ids, where each was first named, and what
 * the history did not read of the changes' files ({@link NOT_READ}).
 */
const CONTINUATION_FILE = "history-resume.json";

/**
 * The version of {@link CONTINUATION_FILE}'s format. Since the independent review of 2026-11-20 (its second), the record
 * also holds its own hash (`check`), so that a record damaged after it was written is not believed; since a review of
 * the same day (format 3), the files the generator could not map (`unmapped`) beside the entries the trees did not hold.
 */
const CONTINUATION_FORMAT = "live-docs-history-resume/3";

/** What {@link CONTINUATION_FILE} holds. */
interface ContinuationRecord extends NotRead {
  format: typeof CONTINUATION_FORMAT;
  /** The key the sequence was read under ({@link continuationKey}). */
  key: string;
  /** The SHA-256 of `history.json` as it was written beside this record. */
  sequence: string;
  /** Each text's hash, by its id in the sequence. */
  texts: string[];
  /** For each text's id, the place in the sequence (0 is its base) of the change whose summary first named it. */
  firstNamed: number[];
  /**
   * The SHA-256 of the record's other fields ({@link recordCheck}). A text's hash changed in the record names a text no
   * summary writes, and two swapped give each id the other's words; neither shows at the last moment, which is all the
   * replay looks at.
   */
  check: string;
}

/** The hash a record holds of its other fields, in the order the format lists them. */
function recordCheck(record: Omit<ContinuationRecord, "check">): string {
  return createHash("sha256").update(JSON.stringify([record.format, record.key, record.sequence, record.texts, record.firstNamed, ...NOT_READ_KINDS.map((kind) => record[kind])])).digest("hex");
}

/**
 * The record as it was written, or why it is not believed: it must be an object of the format's fields, each of its
 * type, every text's hash named once, a place for each, and its own hash its fields' ({@link recordCheck}). Until the
 * review of 2026-11-20 a record holding `null` stopped the run with a TypeError.
 */
function recordOf(value: unknown): ContinuationRecord | { reason: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { reason: "its record does not read" };
  const record = value as Partial<ContinuationRecord>;
  if (record.format !== CONTINUATION_FORMAT) return { reason: "its record is of another format" };
  const hash = (field: unknown): boolean => typeof field === "string" && /^[0-9a-f]{64}$/u.test(field);
  const sound =
    typeof record.key === "string" &&
    hash(record.sequence) &&
    Array.isArray(record.texts) &&
    record.texts.every(hash) &&
    new Set(record.texts).size === record.texts.length &&
    Array.isArray(record.firstNamed) &&
    record.firstNamed.length === record.texts.length &&
    record.firstNamed.every((place) => Number.isInteger(place) && place >= 0) &&
    NOT_READ_KINDS.every((kind) => {
      const entries: unknown = record[kind];
      return Array.isArray(entries) && entries.every((entry) => Array.isArray(entry) && entry.length === 3 && entry.every((part) => typeof part === "string"));
    }) &&
    record.check === recordCheck(record as ContinuationRecord);
  return sound ? (record as ContinuationRecord) : { reason: "its record does not read" };
}

/**
 * The key a written sequence is gone on from under: the lens's key, which names the summaries it was read from; the
 * identity of the code that reads summaries into a sequence and of the git whose words the steps carry
 * (`sequenceCodeIdentity`), taken at the run's start; and the whole configuration, of which the reading uses the
 * bundle's exclusions and the docs root. The sampling, the authors and the line are held apart, by the changes the
 * written sequence names ({@link writtenSequence}). For a change that alters only earlier steps (an edit of the bundle's
 * exclusions that touches a file only early commits held, or of the code that reads an early step) the key is the only
 * guard: the replay's guard looks at the last moment alone.
 */
function continuationKey(lens: string, code: string, configuration: LiveDocumentationConfig): string {
  return createHash("sha256").update(canonicalJson({ format: CONTINUATION_FORMAT, lens, code, configuration })).digest("hex").slice(0, 16);
}

/** The reason given where no sequence stands beside the cache, which the progress need not repeat. */
const NOTHING_WRITTEN = "no sequence stands beside the cache";

/**
 * The sequence the last run wrote, and the record of how, when this run may go on from it: the record names the
 * sequence's bytes as they stand, under this run's key, and the sequence's changes, its base and every step, are the
 * first of the changes sampled today, each as this run would write it (its parents, date, author where the sequence
 * carries authors, and subject). Otherwise the reason.
 *
 * @remarks
 * Only a sequence whose every change is still sampled can be gone on from byte for byte: one that stopped short of
 * today's line has written strings into its tables, and given them ids, that a sequence derived whole would never hold
 * or would hold under other ids.
 */
async function writtenSequence(
  sampled: readonly MainlineChange[],
  commitOf: (change: MainlineChange) => CommitInfo,
  context: ReadingContext
): Promise<{ sequence: HistorySequence; record: ContinuationRecord } | { reason: string }> {
  let bytes: Buffer;
  try {
    bytes = await fs.readFile(path.join(context.historyFolder, HISTORY_FILE));
  } catch {
    return { reason: NOTHING_WRITTEN };
  }
  let read: unknown;
  try {
    read = JSON.parse(await fs.readFile(path.join(context.historyFolder, CONTINUATION_FILE), "utf8"));
  } catch {
    return { reason: `no record of how it was made stands beside it (${CONTINUATION_FILE})` };
  }
  const record = recordOf(read);
  if ("reason" in record) return record;
  if (record.sequence !== createHash("sha256").update(bytes).digest("hex")) return { reason: "it is not the sequence its record describes" };
  if (record.key !== context.key) return { reason: "it was read from the summaries under another lens, by other code or under another configuration" };
  const sequence = JSON.parse(bytes.toString("utf8")) as HistorySequence;
  const commits = [sequence.base.commit, ...sequence.steps.map((step) => step.commit)];
  if (commits.length > sampled.length || commits.some((commit, index) => JSON.stringify(commit) !== JSON.stringify(commitOf(sampled[index])))) {
    return { reason: "its changes are not the first of the changes sampled now" };
  }
  if (!record.firstNamed.every((place) => place < commits.length)) return { reason: "its record does not read" };
  return { sequence, record };
}

/** Writes the record of how the sequence beside it was made, after the sequence, so that it never names a sequence that is not whole. */
async function writeContinuation(historyFolder: string, record: Omit<ContinuationRecord, "check">): Promise<void> {
  await writeInPlace(path.join(historyFolder, CONTINUATION_FILE), JSON.stringify({ ...record, check: recordCheck(record) }));
}

/** Nothing not read, of either kind. */
function noneNotRead(): NotRead {
  return { unwritten: [], unmapped: [] };
}

/** What the history did not read at one commit, by kind: each path with why, for the check at the head. */
function atCommit(notRead: NotRead, commit: string): Record<NotReadKind, Array<[path: string, reason: string]>> {
  const at = (kind: NotReadKind): Array<[string, string]> => notRead[kind].filter(([change]) => change === commit).map(([, file, reason]): [string, string] => [file, reason]);
  return { unwritten: at("unwritten"), unmapped: at("unmapped") };
}

/**
 * Writes beside the sequence every file of one kind the history did not read at a commit, with why ({@link NOT_READ}:
 * `<history folder>/unwritten.txt` or `unmapped.txt`, a line each: the commit, the path and the reason), or removes that
 * list where there is none. The sequence does not carry them: such a file reads in it as gone at that commit.
 *
 * @returns The list's path, when there is one.
 */
async function writeNotRead(historyFolder: string, kind: NotReadKind, entries: ReadonlyArray<[commit: string, path: string, reason: string]>): Promise<string | undefined> {
  const file = path.join(historyFolder, NOT_READ[kind].list);
  if (entries.length === 0) {
    await fs.rm(file, { force: true });
    return undefined;
  }
  const lines = entries.map(([commit, entry, reason]) => `${commit}\t${JSON.stringify(entry)}\t${reason}`);
  await writeInPlace(file, `# ${NOT_READ[kind].heading}: commit, path, reason.\n${lines.join("\n")}\n`);
  return file;
}

interface HeadCheckContext {
  /** The repository's top level, whose object store holds the head's committed docs. */
  workspaceRoot: string;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  /** Each text the sequence names, by its id, as the reading held it to its hash. */
  textOf: (id: number) => string;
  /**
   * The files the head's summary says the history did not read there, by kind ({@link NOT_READ}: its tree did not hold
   * them, or the generator could not map them), each with why: the check does not compare them.
   */
  leftOut: Record<NotReadKind, ReadonlyArray<[path: string, reason: string]>>;
  /** Whether the person asked for the check, asserting that the docs committed at the head were made by this generator under this configuration. */
  asked: boolean;
  /** Whether the lens's configuration is the workspace's own, the one its committed mirror was made under. */
  ownConfiguration: boolean;
  head: string;
}

/**
 * The check at the head (see `headCheck.ts`): the last step, replayed through every step from the base, must be the
 * graph read afresh from the Live Docs committed at the head, read from git's object store. It applies by
 * {@link HEAD_CHECK_RULE}; where it applies, a difference or docs that do not read stop the run, and where it does not,
 * the line says it was skipped and why.
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
  let committed: LiveDocGraph;
  try {
    committed = await committedLiveDocGraph(context.workspaceRoot, context.head, context.configuration);
  } catch (error) {
    throw new Error(`the Live Docs committed at ${context.head.slice(0, 8)} do not read, so the history's last step cannot be held to them: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  if (Object.keys(committed.files).length === 0) {
    if (context.asked) {
      throw new Error(`--check-head holds the history's last step to the Live Docs committed at ${context.head.slice(0, 8)}, and none are committed there`);
    }
    return { applied: false, line: `the check at the head was skipped: no Live Docs are committed at ${context.head.slice(0, 8)}` };
  }
  const moment = momentAt(sequence, sequence.steps.length);
  const notCompared = NOT_READ_KINDS.map((kind) => [kind, leftOutAtHead(committed, new Map(context.leftOut[kind]))] as const);
  const differences = headDifferences(moment, committed, context.textOf, new Set(notCompared.flatMap(([, files]) => [...files.keys()])));
  // What the history did not read at the head is named, with why, so that nothing the check passes over is passed over silently.
  const passedOver = notCompared
    .filter(([, files]) => files.size > 0)
    .map(([kind, files]) => `; not compared, since ${NOT_READ[kind].atHead} and so the history does not read them: ${[...files].map(([file, reason]) => `${file} (${reason})`).join("; ")}`)
    .join("");
  if (differences.length > 0) {
    throw new Error(
      `the history's last step is not the graph of the Live Docs committed at ${context.head.slice(0, 8)}: ${differences.slice(0, 5).join("; ")}${passedOver}. ` +
        "When the mirror was not regenerated after the last change of the source, run `npm run live-docs:generate`, commit the docs and run again."
    );
  }
  const symbols = [...moment.rows.values()].reduce((sum, file) => sum + file.symbols.length, 0);
  return {
    applied: true,
    line: `the last step's ${moment.rows.size} files, ${symbols} symbols with their words, and ${linksOf(moment.rows).length} links are those of the Live Docs committed at ${context.head.slice(0, 8)}, read afresh${passedOver}`
  };
}

/**
 * Writes the words store and then the sequence beside it, so that a sequence never names a store that is not whole:
 * the store goes to a folder named by its content, `history-words-<hash>`, the sequence is renamed into place after
 * it, and only then are the stores no sequence names removed. A run stopped at any point leaves a sequence and the
 * store it names.
 *
 * @param read - Each text the sequence names, by its id, as the reading held it to its hash.
 * @returns The SHA-256 of the sequence as written, which the record beside it names.
 */
async function writeSequence(sequence: HistorySequence, historyFolder: string, read: readonly string[], progress: (line: string) => void): Promise<string> {
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
  const written = JSON.stringify(sequence);
  await writeInPlace(path.join(historyFolder, HISTORY_FILE), written);
  for (const entry of await fs.readdir(historyFolder, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== folder && (entry.name === WORDS_DIRECTORY || entry.name.startsWith(`${WORDS_DIRECTORY}-`))) {
      await fs.rm(path.join(historyFolder, entry.name), { recursive: true, force: true });
    }
  }
  const bytes = json.reduce((sum, part) => sum + Buffer.byteLength(part), 0);
  progress(`wrote the words of every step beside the sequence: ${head.texts} texts in ${parts.length} parts by directory, ${formatBytes(bytes)}`);
  return createHash("sha256").update(written).digest("hex");
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
