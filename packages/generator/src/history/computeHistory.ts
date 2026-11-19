/**
 * The history command: a repository's history regenerated under one lens and
 * written as one sequence, `<docsRoot>/history/history.json`, for the CLI and
 * the Explorer to read (the plan's C1, in `.mdmd/layer-3/change-over-time.mdmd.md`).
 *
 * @remarks
 * The mainline is read from the version control and sampled. Every sampled
 * change the cache lacks under the lens is checked out into a scratch working
 * tree under the system's temporary folder, summarized by a process of its own
 * (see `summarizeChange.ts`), and the tree removed; a pool runs a few at a
 * time. Then the sequence is derived from consecutive summaries and what the
 * version control says between them, each step replayed as it is written, and
 * written beside the cache. A second run regenerates only what the cache
 * lacks. Nothing here is committed, and nothing reaches a remote.
 *
 * Since 2026-11-19 the summaries are gzipped and name their prose by hash in
 * the lens's text store, which holds each text once; the pool is sized by the
 * machine's memory and processors and the peak memory a summarizing process
 * was last measured to take, which every run records beside the cache; and
 * every run says which cache folders belong to no current lens and how much
 * they hold, removing them only when asked.
 *
 * @module
 */

import { fork, type ChildProcess } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/engine/config/liveDocumentationConfig";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { Interner } from "@live-documentation/engine/live-docs/history/codec";
import { HISTORY_DIRECTORY, HISTORY_FILE, type CommitInfo, type HistoryLens, type HistorySequence, type Sampling } from "@live-documentation/engine/live-docs/history/format";
import { openGitRepository } from "@live-documentation/engine/live-docs/history/git";
import { lensOf } from "@live-documentation/engine/live-docs/history/lens";
import { compareLinks, linksOf, rowsDifferences, rowsOfSummary, type RowLink, type Rows } from "@live-documentation/engine/live-docs/history/rows";
import { sampleChanges } from "@live-documentation/engine/live-docs/history/sampling";
import { momentAt, SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import { shapeOfSummary } from "@live-documentation/engine/live-docs/history/shape";
import { HISTORY_SUMMARY_FORMAT, summarizeGraph, type CommitSummary } from "@live-documentation/engine/live-docs/history/summary";
import { readText, TEXT_STORE_DIRECTORY } from "@live-documentation/engine/live-docs/history/textStore";
import type { MainlineChange, VersionControl, WorkingTree } from "@live-documentation/engine/live-docs/history/versionControl";
import { WORDS_DIRECTORY, wordsStore, type WordsHead } from "@live-documentation/engine/live-docs/history/words";

import { generatorIdentity } from "./generatorIdentity";
import type { SummaryReport, SummaryTask } from "./summarizeChange";

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
  /** Remove the cache folders of every lens but the current one. */
  removeSuperseded?: boolean;
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
}

/**
 * The record a run leaves beside the caches of how much memory one summarizing process took on this repository, so
 * that the next run sizes its pool by it: `<docsRoot>/history/pool.json`.
 */
const POOL_RECORD = "pool.json";

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
  const relative = (absolute: string): string => path.relative(workspaceRoot, absolute).split(path.sep).join("/");
  const superseded = await supersededCaches(historyFolder, lens.key, options.removeSuperseded === true, relative);
  for (const cache of superseded) {
    options.progress(`${cache.removed ? "removed" : "kept"} ${cache.folder}, the cache of a lens that is not the current one: ${formatBytes(cache.bytes)}`);
  }
  if (superseded.some((cache) => !cache.removed)) {
    options.progress(`--remove-superseded removes the caches of other lenses, ${formatBytes(superseded.reduce((sum, cache) => sum + cache.bytes, 0))} in all`);
  }
  const missing: MainlineChange[] = [];
  for (const change of sampled) {
    if (!(await cached(cacheFolder, change.id, options.keepIndex))) {
      missing.push(change);
    }
  }
  const measured = (await recordedPool(historyFolder))?.peakMemory;
  const machineJobs = options.jobs ?? poolSize({ totalMemory: os.totalmem(), processors: os.cpus().length, peakMemory: measured ?? UNMEASURED_PEAK_MEMORY });
  const jobs = Math.max(1, Math.min(machineJobs, missing.length));
  const sizing =
    options.jobs !== undefined
      ? "as asked"
      : `by ${formatBytes(os.totalmem())} of memory and ${os.cpus().length} processors at ${formatBytes(measured ?? UNMEASURED_PEAK_MEMORY)} a process, ${measured === undefined ? "before any was measured here" : "as last measured here"}`;
  const pool = missing.length > 0 ? `, ${jobs} at a time ${sizing}` : "";
  options.progress(`${sampled.length} changes sampled of ${mainline.length}; ${sampled.length - missing.length} in the cache under lens ${lens.key}, ${missing.length} to regenerate${pool}`);

  const started = Date.now();
  const regeneration = await regenerate(missing, { versionControl, configuration, lens, cacheFolder, keepIndex: options.keepIndex, jobs, progress: options.progress });
  const regenerationMilliseconds = missing.length > 0 ? Date.now() - started : 0;
  if (regeneration.peakMemory > 0) {
    await recordPeakMemory(historyFolder, lens.key, regeneration.peakMemory);
    options.progress(`the largest summarizing process took ${formatBytes(regeneration.peakMemory)} at its peak; the next run sizes its pool by it`);
  }
  const timings = regeneration.timings;

  const texts = new Interner();
  const builder = await buildSequence(sampled, {
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
    texts,
    ownConfiguration: options.configPath === undefined,
    head: end.head
  });
  options.progress(headCheck);
  sequence.words = await writeWords(sequence, historyFolder, path.join(cacheFolder, TEXT_STORE_DIRECTORY), texts, options.progress);
  const file = path.join(historyFolder, HISTORY_FILE);
  await writeInPlace(file, JSON.stringify(sequence));

  return {
    sequence,
    file: relative(file),
    cache: relative(cacheFolder),
    sampled: sampled.length,
    regenerated: missing.length,
    cached: sampled.length - missing.length,
    millisecondsPerChange: timings.length > 0 ? timings.reduce((sum, time) => sum + time, 0) / timings.length : 0,
    jobs,
    regenerationMilliseconds,
    peakMemory: regeneration.peakMemory,
    cacheBytes: await folderBytes(cacheFolder),
    superseded
  };
}

/** The cache folders under the history folder named by a lens key other than the current one, removed when asked. */
async function supersededCaches(historyFolder: string, current: string, remove: boolean, relative: (absolute: string) => string): Promise<SupersededCache[]> {
  const caches: SupersededCache[] = [];
  for (const entry of await fs.readdir(historyFolder, { withFileTypes: true })) {
    // A lens key is sixteen hexadecimal digits (`lensOf`); nothing else the history folder holds is named so.
    if (!entry.isDirectory() || !/^[0-9a-f]{16}$/u.test(entry.name) || entry.name === current) {
      continue;
    }
    const folder = path.join(historyFolder, entry.name);
    const bytes = await folderBytes(folder);
    if (remove) {
      await fs.rm(folder, { recursive: true, force: true });
    }
    caches.push({ lens: entry.name, folder: relative(folder), bytes, removed: remove });
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

interface PoolRecord {
  /** The lens the peak was measured under. */
  lens: string;
  /** The largest peak resident memory a summarizing process took under it, in bytes. */
  peakMemory: number;
}

/** What a run last recorded of a summarizing process's peak memory on this repository, when one has. */
async function recordedPool(historyFolder: string): Promise<PoolRecord | undefined> {
  try {
    const record = JSON.parse(await fs.readFile(path.join(historyFolder, POOL_RECORD), "utf8")) as Partial<PoolRecord>;
    return typeof record.peakMemory === "number" && record.peakMemory > 0 && typeof record.lens === "string" ? { lens: record.lens, peakMemory: record.peakMemory } : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Records the run's largest peak, so that the next run sizes its pool by what this repository was measured to take:
 * under the same lens the largest of every run's, since a run that regenerates only the newest change sees one
 * change's peak and not the history's; under a new lens, this run's alone, since the generator has changed.
 */
async function recordPeakMemory(historyFolder: string, lens: string, peakMemory: number): Promise<void> {
  const previous = await recordedPool(historyFolder);
  const record: PoolRecord = { lens, peakMemory: previous?.lens === lens ? Math.max(previous.peakMemory, peakMemory) : peakMemory };
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
    input = JSON.parse(await fs.readFile(file, "utf8")) as LiveDocumentationConfigInput;
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

function summaryPath(cacheFolder: string, change: string): string {
  return path.join(cacheFolder, `${change}.json.gz`);
}

function indexPath(cacheFolder: string, change: string): string {
  return path.join(cacheFolder, `${change}.index.json.gz`);
}

async function cached(cacheFolder: string, change: string, keepIndex: boolean): Promise<boolean> {
  const wanted = keepIndex ? [summaryPath(cacheFolder, change), indexPath(cacheFolder, change)] : [summaryPath(cacheFolder, change)];
  for (const file of wanted) {
    try {
      await fs.access(file);
    } catch {
      return false;
    }
  }
  return true;
}

interface RegenerationContext {
  versionControl: VersionControl;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  cacheFolder: string;
  keepIndex: boolean;
  jobs: number;
  progress: (line: string) => void;
}

/**
 * Regenerates the changes the cache lacks, `jobs` at a time, each in a scratch
 * tree under the system's temporary folder and a process of its own.
 *
 * @returns How long each change took, in milliseconds, and the largest peak memory a process reported.
 */
async function regenerate(changes: readonly MainlineChange[], context: RegenerationContext): Promise<{ timings: number[]; peakMemory: number }> {
  const timings: number[] = [];
  let peakMemory = 0;
  if (changes.length === 0) {
    return { timings, peakMemory };
  }
  const trees = new Set<WorkingTree>();
  const children = new Set<ChildProcess>();
  // A run stopped by a signal removes its scratch trees, so that the repository keeps no worktree of it.
  const stop = (signal: NodeJS.Signals): void => {
    for (const child of children) {
      child.kill(signal);
    }
    void Promise.allSettled([...trees].map((tree) => tree.remove())).then(() => process.exit(130));
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  // What the generator warned, once each with the number of changes that gave it, rather than again at every change.
  const warnings = new Map<string, number>();
  const started = Date.now();
  try {
    await inPool(changes, context.jobs, async (change) => {
      const began = Date.now();
      const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-history-"));
      try {
        // Git names a worktree's record after its folder, so each tree's folder has a name of its own: two trees of one
        // name made at once raced for the same record (found 2026-10-17, two at a time over this repository).
        const tree = await context.versionControl.workingTree(change.id, path.join(scratch, path.basename(scratch)));
        trees.add(tree);
        try {
          const { warned, report } = await runSummary(
            {
              tree: tree.root,
              configuration: context.configuration,
              lens: context.lens.key,
              commit: change.id,
              summaryPath: summaryPath(context.cacheFolder, change.id),
              textStore: path.join(context.cacheFolder, TEXT_STORE_DIRECTORY),
              indexPath: context.keepIndex ? indexPath(context.cacheFolder, change.id) : undefined
            },
            children
          );
          peakMemory = Math.max(peakMemory, report?.peakMemory ?? 0);
          for (const message of new Set(warned)) {
            warnings.set(message, (warnings.get(message) ?? 0) + 1);
          }
        } finally {
          trees.delete(tree);
          await tree.remove();
        }
      } finally {
        // Git owns removal of a registered tree. If it fails, retain the tree and its metadata for diagnosis instead
        // of deleting the working directory behind Git's back and leaving a dangling registration.
        await fs.rmdir(scratch).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "ENOTEMPTY") throw error;
          context.progress(`kept scratch directory after incomplete Git cleanup: ${scratch}`);
        });
      }
      timings.push(Date.now() - began);
      const mean = timings.reduce((sum, time) => sum + time, 0) / timings.length;
      const wall = (Date.now() - started) / timings.length;
      context.progress(
        `${timings.length}/${changes.length} regenerated: ${change.id.slice(0, 8)} in ${seconds(Date.now() - began)}; ${seconds(mean)} a change, ${seconds(wall)} of wall clock a change at ${context.jobs} at a time`
      );
    });
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    for (const [message, count] of warnings) {
      context.progress(`the generator warned at ${count} of the ${changes.length} changes regenerated: ${message}`);
    }
  }
  return { timings, peakMemory };
}

/**
 * Runs one summary in a process of its own, the generator's code loaded
 * afresh, and waits for it.
 *
 * @returns The lines the generator warned on its way, and what the process reported when it ended.
 */
function runSummary(task: SummaryTask, children: Set<ChildProcess>): Promise<{ warned: string[]; report?: SummaryReport }> {
  // The worker sits beside this module, as TypeScript under tsx or as JavaScript once built.
  const worker = path.join(__dirname, `summarizeChange${path.extname(__filename)}`);
  return new Promise((resolve, reject) => {
    const child = fork(worker, [JSON.stringify(task)], { stdio: ["ignore", "ignore", "pipe", "ipc"] });
    children.add(child);
    let errors = "";
    let report: SummaryReport | undefined;
    child.on("message", (message) => {
      report = message as SummaryReport;
    });
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (text: string) => {
      errors += text;
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      children.delete(child);
      if (code === 0) {
        resolve({ warned: errors.split("\n").map((line) => line.trim()).filter(Boolean), report });
      } else {
        reject(new Error(`the summary of ${task.commit} failed (${signal ?? `exit ${code}`}): ${errors.trim().split("\n").slice(-5).join(" | ")}`));
      }
    });
  });
}

/** Runs `work` over the items, at most `size` at once; after a failure no new item starts, and the first failure is thrown once the running ones end. */
async function inPool<T>(items: readonly T[], size: number, work: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  let failure: Error | undefined;
  const lane = async (): Promise<void> => {
    while (failure === undefined && next < items.length) {
      const item = items[next];
      next += 1;
      try {
        await work(item);
      } catch (error) {
        failure ??= error instanceof Error ? error : new Error(String(error));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, lane));
  if (failure !== undefined) {
    throw failure;
  }
}

interface SequenceContext {
  versionControl: VersionControl;
  lens: HistoryLens;
  cacheFolder: string;
  authors: boolean;
  source: HistorySequence["source"];
  /** The texts' hashes, each given an id where the sequence first names it. */
  texts: Interner;
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
  const first = await readSummary(context, sampled[0].id);
  const builder = new SequenceBuilder({ lens: context.lens, source: context.source }, commitOf(sampled[0]), shapeOfSummary(first), rowsOfSummary(first, textId));
  for (let index = 1; index < sampled.length; index += 1) {
    const [summary, version] = await Promise.all([
      readSummary(context, sampled[index].id),
      context.versionControl.changesBetween(sampled[index - 1].id, sampled[index].id)
    ]);
    builder.add(commitOf(sampled[index]), shapeOfSummary(summary), version, rowsOfSummary(summary, textId));
  }
  return builder;
}

interface HeadCheckContext {
  versionControl: VersionControl;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  texts: Interner;
  /** Whether the lens's configuration is the workspace's own, the one its committed mirror was made under. */
  ownConfiguration: boolean;
  head: string;
}

/**
 * The check at the head, from a path independent of the history's own: the last step's rows, replayed through every
 * step from the base, must be the rows and links of the graph derived afresh from the Live Docs committed at the
 * head, read from a checkout of it. It is asked only where the committed mirror was made by this very generator under
 * this configuration: when the generator runs, unmodified, from the commit the history ends at, as it does over its
 * own repository. A difference stops the run, as a replay's does.
 *
 * @returns A line saying what was checked, or why the check does not apply.
 */
async function checkHead(sequence: HistorySequence, context: HeadCheckContext): Promise<string> {
  const generator = context.lens.generator;
  if (generator.code === null || generator.modified !== null || generator.commit !== context.head || !context.ownConfiguration) {
    return "the check at the head does not apply: the mirror committed there was not made by this generator, unmodified, under this configuration";
  }
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-history-head-"));
  let committed: LiveDocGraph;
  try {
    const tree = await context.versionControl.workingTree(context.head, path.join(scratch, path.basename(scratch)));
    try {
      committed = await readLiveDocGraph({ workspaceRoot: tree.root, config: context.configuration });
    } catch (error) {
      return `the check at the head does not apply: the mirror committed there does not read (${error instanceof Error ? error.message : String(error)})`;
    } finally {
      await tree.remove();
    }
  } finally {
    await fs.rm(scratch, { recursive: true, force: true });
  }
  if (Object.keys(committed.files).length === 0) {
    return "the check at the head does not apply: no Live Docs are committed there";
  }
  const replayed = momentAt(sequence, sequence.steps.length).rows;
  const differences = headDifferences(replayed, committed, (hash) => context.texts.id(hash));
  if (differences.length > 0) {
    throw new Error(
      `the history's last step is not the graph of the Live Docs committed at ${context.head.slice(0, 8)}: ${differences.slice(0, 5).join("; ")}. ` +
        "When the mirror was not regenerated after the last change of the source, run `npm run live-docs:generate`, commit the docs and run again."
    );
  }
  const symbols = [...replayed.values()].reduce((sum, file) => sum + file.symbols.length, 0);
  return `the last step's ${replayed.size} files, ${symbols} symbols and ${linksOf(replayed).length} links are those of the Live Docs committed at ${context.head.slice(0, 8)}, read afresh`;
}

/**
 * Where a moment's rows, replayed, differ from a graph derived from committed Live Docs: the graph's rows read by the
 * one rule every summary is read by, its texts named by `textId`, and its links read straight from its resolved
 * edges, apart from the rows' reading of them.
 */
export function headDifferences(replayed: Rows, committed: LiveDocGraph, textId: (hash: string) => number): string[] {
  const fromMirror = rowsOfSummary(summarizeGraph(committed, "", "").summary, textId);
  return [...rowsDifferences(fromMirror, replayed), ...linkDifferences(linksOfGraph(committed), linksOf(replayed))];
}

/**
 * Writes the words store beside the sequence, `<history folder>/history-words/<index>.json`, each text the sequence
 * names read from the lens's text store, which checks it against its hash; a store an earlier run wrote is replaced.
 *
 * @returns What the sequence's head says of it.
 */
async function writeWords(sequence: HistorySequence, historyFolder: string, textStore: string, texts: Interner, progress: (line: string) => void): Promise<WordsHead> {
  const read = await Promise.all(texts.values.map((hash) => readText(textStore, hash)));
  const { head, parts } = wordsStore(sequence, WORDS_DIRECTORY, (id) => read[id]);
  const folder = path.join(historyFolder, WORDS_DIRECTORY);
  await fs.rm(folder, { recursive: true, force: true });
  await fs.mkdir(folder, { recursive: true });
  let bytes = 0;
  for (const [index, part] of parts.entries()) {
    const json = JSON.stringify(part);
    bytes += Buffer.byteLength(json);
    await writeInPlace(path.join(folder, `${index}.json`), json);
  }
  progress(`wrote the words of every step beside the sequence: ${head.texts} texts in ${parts.length} parts by directory, ${formatBytes(bytes)}`);
  return head;
}

/** Every link between two different files of a graph, read from its resolved edges, counted by ends and kind. */
function linksOfGraph(graph: LiveDocGraph): RowLink[] {
  const counted = new Map<string, RowLink>();
  for (const file of Object.values(graph.files)) {
    for (const edge of file.edges) {
      if (edge.to === undefined || edge.to === file.codePath) continue;
      const link: RowLink = { from: file.codePath, ...(edge.from !== undefined ? { fromSymbol: edge.from } : {}), to: edge.to, ...(edge.toSymbol !== undefined ? { toSymbol: edge.toSymbol } : {}), kind: edge.kind, count: 0 };
      const key = [link.from, link.fromSymbol ?? "", link.to, link.toSymbol ?? "", link.kind].join("\0");
      const existing = counted.get(key) ?? link;
      existing.count += 1;
      counted.set(key, existing);
    }
  }
  return [...counted.values()].sort(compareLinks);
}

function linkDifferences(expected: readonly RowLink[], actual: readonly RowLink[]): string[] {
  const words = (link: RowLink): string => `${link.from}${link.fromSymbol ? `#${link.fromSymbol}` : ""} -${link.kind}-> ${link.to}${link.toSymbol ? `#${link.toSymbol}` : ""} x${link.count}`;
  const want = new Set(expected.map(words));
  const have = new Set(actual.map(words));
  return [...[...want].filter((link) => !have.has(link)).map((link) => `the link ${link} is missing`), ...[...have].filter((link) => !want.has(link)).map((link) => `the link ${link} was not expected`)];
}

async function readSummary(context: SequenceContext, change: string): Promise<CommitSummary> {
  const file = summaryPath(context.cacheFolder, change);
  const summary = JSON.parse(gunzipSync(await fs.readFile(file)).toString("utf8")) as CommitSummary;
  if (summary.format !== HISTORY_SUMMARY_FORMAT || summary.lens !== context.lens.key || summary.commit !== change) {
    throw new Error(`${file} is not the summary of ${change} under lens ${context.lens.key}; remove it and run again`);
  }
  return summary;
}

async function writeInPlace(target: string, content: string): Promise<void> {
  const temporary = `${target}.${process.pid}.partial`;
  await fs.writeFile(temporary, content, "utf8");
  await fs.rename(temporary, target);
}

function seconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)} s`;
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
