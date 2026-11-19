/**
 * What the history command does on a summary's behalf before the summarizing
 * process runs: each change's tree written into a scratch folder, the process
 * started in it with the task and the environment it is given, and the folder
 * removed after; a pool runs a few changes at once.
 *
 * @remarks
 * Split from `computeHistory.ts` on 2026-11-19, so that the code deciding
 * which files and which environment a summary sees is in the lens's key
 * (`generatorIdentity.ts`), while the command's reading of summaries into a
 * sequence is not. Before, the tree and the environment were made in the
 * command's own module, outside the key, and the guard that holds the key to
 * the summarizing process's imports could not see them: the environment that
 * let a tracked file a `.gitignore` names into a summary had changed what
 * summaries said without changing the key.
 *
 * The summarizing process is given only the variables of the person's
 * environment it needs ({@link summarizingEnvironment}), the tree's own, and
 * only the node flags it needs ({@link summarizingFlags}): git's answer of
 * what the tree tracks and ignores is then the tree's, whatever the person's
 * shell had set. Since 2026-11-19 the tree leaves out what the summarizing
 * process never opens ({@link unread}).
 *
 * @module
 */

import { fork, type ChildProcess } from "node:child_process";
import { rmSync } from "node:fs";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { LiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { matchesPathPattern } from "@live-documentation/engine/live-docs/archetype";
import type { HistoryLens } from "@live-documentation/engine/live-docs/history/format";
import { TEXT_STORE_DIRECTORY } from "@live-documentation/engine/live-docs/history/textStore";
import type { MainlineChange, VersionControl } from "@live-documentation/engine/live-docs/history/versionControl";

import { marksScan } from "../generator";
import type { SummaryReport, SummaryTask } from "./summarizeChange";

/** Where a change's summary lies in the lens's cache folder. */
export function summaryPath(cacheFolder: string, change: string): string {
  return path.join(cacheFolder, `${change}.json.gz`);
}

/** Where a change's full graph index lies in the lens's cache folder, when the cache keeps it. */
export function indexPath(cacheFolder: string, change: string): string {
  return path.join(cacheFolder, `${change}.index.json.gz`);
}

/**
 * The scratch folders of a run under the system's temporary folder and the processes it started, all removed or ended
 * when a signal stops it: a folder is held from the moment it is made, before anything is written into it.
 */
export class Scratch {
  private readonly folders = new Set<string>();
  private readonly children = new Set<ChildProcess>();

  /** A new empty folder, held until {@link release}. */
  async folder(prefix: string): Promise<string> {
    const made = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
    this.folders.add(made);
    return made;
  }

  /** Holds a file or folder made elsewhere, so that a signal removes it too, until {@link release}. */
  hold(made: string): void {
    this.folders.add(made);
  }

  /** Removes a folder and everything in it. */
  async release(folder: string): Promise<void> {
    await fs.rm(folder, { recursive: true, force: true });
    this.folders.delete(folder);
  }

  /** Holds a process, so that a signal ends it. */
  started(child: ChildProcess): void {
    this.children.add(child);
    child.once("exit", () => this.children.delete(child));
  }

  /** Runs `work`; a SIGINT or SIGTERM meanwhile ends every process held and removes every folder held, then exits. */
  async during<T>(work: () => Promise<T>): Promise<T> {
    const stop = (signal: NodeJS.Signals): void => {
      for (const child of this.children) {
        child.kill(signal);
      }
      for (const folder of this.folders) {
        rmSync(folder, { recursive: true, force: true });
      }
      process.exit(130);
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    try {
      return await work();
    } finally {
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
    }
  }
}

/** What regenerating needs. */
export interface RegenerationContext {
  versionControl: VersionControl;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  cacheFolder: string;
  keepIndex: boolean;
  jobs: number;
  /** When to start no further change, in milliseconds since the epoch; the changes running then are finished. */
  deadline?: number;
  scratch: Scratch;
  progress: (line: string) => void;
}

/**
 * Regenerates the changes, `jobs` at a time, each in a scratch tree under the system's temporary folder and a process
 * of its own, starting none after the deadline when there is one.
 *
 * @returns How long each change regenerated took, in milliseconds, and the largest peak memory a process reported.
 */
export async function regenerate(changes: readonly MainlineChange[], context: RegenerationContext): Promise<{ timings: number[]; peakMemory: number }> {
  const timings: number[] = [];
  let peakMemory = 0;
  if (changes.length === 0) {
    return { timings, peakMemory };
  }
  // What the generator warned, once each with the number of changes that gave it, rather than again at every change.
  const warnings = new Map<string, number>();
  const started = Date.now();
  try {
    await inPool(changes, context.jobs, context.deadline, async (change) => {
      const began = Date.now();
      const scratch = await context.scratch.folder("live-docs-history-");
      try {
        const tree = await context.versionControl.workingTree(change.id, path.join(scratch, path.basename(scratch)), unread(context.configuration));
        const { warned, report } = await runSummary(
          {
            tree: tree.root,
            configuration: context.configuration,
            lens: context.lens.key,
            commit: change.id,
            summaryPath: summaryPath(context.cacheFolder, change.id),
            textStore: path.join(context.cacheFolder, TEXT_STORE_DIRECTORY),
            indexPath: context.keepIndex ? indexPath(context.cacheFolder, change.id) : undefined,
            ...(tree.unwritten.length > 0 ? { unwritten: tree.unwritten } : {})
          },
          context.scratch,
          scratch,
          { ...summarizingEnvironment(process.env), ...tree.environment }
        );
        peakMemory = Math.max(peakMemory, report?.peakMemory ?? 0);
        if (tree.unwritten.length > 0) {
          context.progress(`${change.id.slice(0, 8)}: ${tree.unwritten.length} files of its tree were not written on this disk, and its summary says they were not read:`);
          for (const entry of tree.unwritten) {
            context.progress(`  ${entry.path}: ${entry.reason}`);
          }
        }
        for (const message of new Set(warned)) {
          warnings.set(message, (warnings.get(message) ?? 0) + 1);
        }
      } finally {
        // The tree and its index lie inside the scratch folder, and nothing of them is registered anywhere else.
        await context.scratch.release(scratch);
      }
      timings.push(Date.now() - began);
      const mean = timings.reduce((sum, time) => sum + time, 0) / timings.length;
      const wall = (Date.now() - started) / timings.length;
      context.progress(
        `${timings.length}/${changes.length} regenerated: ${change.id.slice(0, 8)} in ${seconds(Date.now() - began)}; ${seconds(mean)} a change, ${seconds(wall)} of wall clock a change at ${context.jobs} at a time`
      );
    });
  } finally {
    for (const [message, count] of warnings) {
      context.progress(`the generator warned at ${count} of the ${changes.length} changes regenerated: ${message}`);
    }
  }
  return { timings, peakMemory };
}

/**
 * The files of a change's tree the summarizing process never opens, by their repository-relative paths, which the tree
 * writer leaves out: those the configuration's `exclude` names, by discovery's own rule (`matchesPathPattern`), but
 * never a file under the docs root, which the generator reads and rewrites whatever `exclude` says, nor a file that
 * marks a scan nested in the workspace (`marksScan`, by the rule the generator's own search for one reads), whose
 * warning holds wherever the scan lies. The tree's listing still holds them all, which is how the summary asks whether
 * a linked document stands. Measured on 2026-11-19 over this repository: the process opened no file of the excluded
 * `AI-Agent-Workspace/`, which held 511 of the 521 GB a rebuild wrote.
 */
export function unread(configuration: LiveDocumentationConfig): (file: string) => boolean {
  const docsRoot = `${configuration.root.replace(/\\/gu, "/").replace(/^(?:\.\/)+/u, "").replace(/\/+$/u, "")}/`;
  return (file) => !file.startsWith(docsRoot) && !marksScan(file, configuration) && configuration.exclude.some((pattern) => matchesPathPattern(file, pattern));
}

/**
 * The variables of the command's environment the summarizing process is given, by name, and no other, so that nothing
 * the person's shell set, `NODE_OPTIONS` among them, changes what it loads or how it reads: `PATH`, by which it finds
 * git; the temporary folders, where the platform keeps them; on Windows the system's folders, without which a process
 * there cannot start; and tsx's own `TSX_TSCONFIG_PATH`, when the command runs under tsx, which names the TypeScript
 * configuration the lens keys.
 */
const SUMMARIZING_VARIABLES = ["PATH", "Path", "TMPDIR", "TMP", "TEMP", "SystemRoot", "SYSTEMROOT", "windir", "WINDIR", "TSX_TSCONFIG_PATH"];

/** The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set. */
export function summarizingEnvironment(environment: NodeJS.ProcessEnv): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const name of SUMMARIZING_VARIABLES) {
    const value = environment[name];
    if (value !== undefined) kept[name] = value;
  }
  return kept;
}

/**
 * The flags node is started with for the summarizing process, and no other: none for the built JavaScript, and for
 * the TypeScript module, under tsx, tsx's loader alone. Until 2026-11-19 `fork` passed on the command's own flags
 * (`process.execArgv`), so that a flag given to node or tsx, as `--conditions` or `--stack-size`, reached the process
 * that makes a summary, where the lens could not see it.
 */
export function summarizingFlags(worker: string): string[] {
  return path.extname(worker) === ".ts" ? ["--import", pathToFileURL(require.resolve("tsx")).href] : [];
}

/**
 * Runs one summary in a process of its own, the generator's code loaded
 * afresh, and waits for it.
 *
 * @returns The lines the generator warned on its way, and what the process reported when it ended.
 */
async function runSummary(task: SummaryTask, scratch: Scratch, folder: string, environment: Record<string, string>): Promise<{ warned: string[]; report?: SummaryReport }> {
  // The worker sits beside this module, as TypeScript under tsx or as JavaScript once built.
  const worker = path.join(__dirname, `summarizeChange${path.extname(__filename)}`);
  // The task goes in a file of the scratch folder, never on the command line, whose length the platform limits: a
  // commit whose tree leaves thousands of entries out would otherwise fail to start (`spawn E2BIG`).
  const taskFile = path.join(folder, "task.json");
  await fs.writeFile(taskFile, JSON.stringify(task), "utf8");
  return new Promise((resolve, reject) => {
    const child = fork(worker, [taskFile], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: environment, execArgv: summarizingFlags(worker) });
    scratch.started(child);
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
      if (code === 0) {
        resolve({ warned: errors.split("\n").map((line) => line.trim()).filter(Boolean), report });
      } else {
        reject(new Error(`the summary of ${task.commit} failed (${signal ?? `exit ${code}`}): ${errors.trim().split("\n").slice(-5).join(" | ")}`));
      }
    });
  });
}

/**
 * Runs `work` over the items, at most `size` at once; after a failure, or past the deadline, no new item starts, and the
 * first failure is thrown once the running ones end.
 */
async function inPool<T>(items: readonly T[], size: number, deadline: number | undefined, work: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  let failure: Error | undefined;
  const lane = async (): Promise<void> => {
    while (failure === undefined && next < items.length && (deadline === undefined || Date.now() < deadline)) {
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

function seconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)} s`;
}
