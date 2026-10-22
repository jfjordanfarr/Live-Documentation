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
 * @module
 */

import { fork, type ChildProcess } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/engine/config/liveDocumentationConfig";
import {
  HISTORY_DIRECTORY,
  HISTORY_FILE,
  HISTORY_SUMMARY_FORMAT,
  type CommitInfo,
  type CommitSummary,
  type HistoryLens,
  type HistorySequence,
  type Sampling
} from "@live-documentation/engine/live-docs/history/format";
import { openGitRepository } from "@live-documentation/engine/live-docs/history/git";
import { lensOf } from "@live-documentation/engine/live-docs/history/lens";
import { sampleChanges } from "@live-documentation/engine/live-docs/history/sampling";
import { SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import { shapeOfSummary } from "@live-documentation/engine/live-docs/history/summary";
import type { MainlineChange, VersionControl, WorkingTree } from "@live-documentation/engine/live-docs/history/versionControl";

import { generatorIdentity } from "./generatorIdentity";
import type { SummaryTask } from "./summarizeChange";

/** What to compute. */
export interface HistoryOptions {
  /** The repository's top level, as the person gave it. */
  workspace: string;
  /** A configuration file for the lens, relative to the working directory; the workspace's `.live-docs.config.json` when absent, or the defaults. */
  configPath?: string;
  sampling: Sampling;
  /** How many changes are regenerated at once, each in a process of its own. */
  jobs: number;
  /** Keep each change's full graph index, gzipped, in the cache. */
  keepIndex: boolean;
  /** Carry the authors' names in the steps. */
  authors: boolean;
  /** Where progress goes, a line at a time. */
  progress: (line: string) => void;
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
  const missing: MainlineChange[] = [];
  for (const change of sampled) {
    if (!(await cached(cacheFolder, change.id, options.keepIndex))) {
      missing.push(change);
    }
  }
  const jobs = Math.max(1, Math.min(options.jobs, missing.length));
  const pool = missing.length > 0 ? `, ${jobs} at a time` : "";
  options.progress(`${sampled.length} changes sampled of ${mainline.length}; ${sampled.length - missing.length} in the cache under lens ${lens.key}, ${missing.length} to regenerate${pool}`);

  const timings = await regenerate(missing, { versionControl, configuration, lens, cacheFolder, keepIndex: options.keepIndex, jobs, progress: options.progress });

  const builder = await buildSequence(sampled, {
    versionControl,
    lens,
    cacheFolder,
    authors: options.authors,
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
  const file = path.join(historyFolder, HISTORY_FILE);
  await writeInPlace(file, JSON.stringify(sequence));

  const relative = (absolute: string): string => path.relative(workspaceRoot, absolute).split(path.sep).join("/");
  return {
    sequence,
    file: relative(file),
    cache: relative(cacheFolder),
    sampled: sampled.length,
    regenerated: missing.length,
    cached: sampled.length - missing.length,
    millisecondsPerChange: timings.length > 0 ? timings.reduce((sum, time) => sum + time, 0) / timings.length : 0
  };
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
  return path.join(cacheFolder, `${change}.json`);
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
 * @returns How long each change took, in milliseconds.
 */
async function regenerate(changes: readonly MainlineChange[], context: RegenerationContext): Promise<number[]> {
  const timings: number[] = [];
  if (changes.length === 0) {
    return timings;
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
          const warned = await runSummary(
            {
              tree: tree.root,
              configuration: context.configuration,
              lens: context.lens.key,
              commit: change.id,
              summaryPath: summaryPath(context.cacheFolder, change.id),
              indexPath: context.keepIndex ? indexPath(context.cacheFolder, change.id) : undefined
            },
            children
          );
          for (const message of new Set(warned)) {
            warnings.set(message, (warnings.get(message) ?? 0) + 1);
          }
        } finally {
          trees.delete(tree);
          await tree.remove();
        }
      } finally {
        await fs.rm(scratch, { recursive: true, force: true });
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
  return timings;
}

/**
 * Runs one summary in a process of its own, the generator's code loaded
 * afresh, and waits for it.
 *
 * @returns The lines the generator warned on its way.
 */
function runSummary(task: SummaryTask, children: Set<ChildProcess>): Promise<string[]> {
  // The worker sits beside this module, as TypeScript under tsx or as JavaScript once built.
  const worker = path.join(__dirname, `summarizeChange${path.extname(__filename)}`);
  return new Promise((resolve, reject) => {
    const child = fork(worker, [JSON.stringify(task)], { stdio: ["ignore", "ignore", "pipe", "ipc"] });
    children.add(child);
    let errors = "";
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (text: string) => {
      errors += text;
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      children.delete(child);
      if (code === 0) {
        resolve(errors.split("\n").map((line) => line.trim()).filter(Boolean));
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
}

/** The sequence from the cached summaries of the sampled changes, oldest first, and the version control's word between each two. */
async function buildSequence(sampled: readonly MainlineChange[], context: SequenceContext): Promise<SequenceBuilder> {
  const commitOf = (change: MainlineChange): CommitInfo => ({
    id: change.id,
    parents: change.parents,
    date: change.date,
    ...(context.authors ? { author: change.author } : {}),
    subject: change.subject
  });
  const builder = new SequenceBuilder({ lens: context.lens, source: context.source }, commitOf(sampled[0]), shapeOfSummary(await readSummary(context, sampled[0].id)));
  for (let index = 1; index < sampled.length; index += 1) {
    const [summary, version] = await Promise.all([
      readSummary(context, sampled[index].id),
      context.versionControl.changesBetween(sampled[index - 1].id, sampled[index].id)
    ]);
    builder.add(commitOf(sampled[index]), shapeOfSummary(summary), version);
  }
  return builder;
}

async function readSummary(context: SequenceContext, change: string): Promise<CommitSummary> {
  const file = summaryPath(context.cacheFolder, change);
  const summary = JSON.parse(await fs.readFile(file, "utf8")) as CommitSummary;
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
