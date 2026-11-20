/**
 * What the history command does on a summary's behalf: a pool of workers
 * started, each a summarizing process given its environment and its flags,
 * and handed the changes to summarize one at a time, a run of consecutive
 * changes after another; each worker writes its own tree in a scratch folder
 * of its own and brings it forward from change to change
 * (`summarizeChange.ts`), and the folder is removed when the worker ends.
 *
 * @remarks
 * Since 2026-11-20 the workers live across changes and write their own
 * trees; before, each change had a process of its own and this module wrote
 * every tree on the command's main thread (the record of that day,
 * `Probes/history-rebuild-fast`).
 *
 * Split from `computeHistory.ts` on 2026-11-19, so that the code deciding
 * which files and which environment a summary sees is in the lens's key
 * (`generatorIdentity.ts`), while the command's reading of summaries into a
 * sequence is not. Before, the tree and the environment were made in the
 * command's own module, outside the key, and the guard that holds the key to
 * the summarizing process's imports could not see them: the environment that
 * let a tracked file a `.gitignore` names into a summary had changed what
 * summaries said without changing the key.
 *
 * A worker is given only the variables of the person's environment it needs
 * ({@link summarizingEnvironment}) and only the node flags it needs ({@link
 * summarizingFlags}); it sets each tree's own environment while it
 * summarizes in that tree: git's answer of what the tree tracks and ignores
 * is then the tree's, whatever the person's shell had set.
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
import type { HistoryLens } from "@live-documentation/engine/live-docs/history/format";
import { summarizedConfiguration } from "@live-documentation/engine/live-docs/history/lens";
import { TEXT_STORE_DIRECTORY } from "@live-documentation/engine/live-docs/history/textStore";
import type { MainlineChange } from "@live-documentation/engine/live-docs/history/versionControl";
import type { ProcessMark } from "@live-documentation/engine/live-docs/processMark";

import type { WorkerReport, WorkerTask } from "./summarizeChange";

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

  /**
   * Removes a folder and everything in it, retrying a removal refused for a while (as Windows refuses while a scanner
   * holds a file open), so that a tree a worker could not put right and left beside its own goes with the worker.
   */
  async release(folder: string): Promise<void> {
    await fs.rm(folder, { recursive: true, force: true, maxRetries: 5 });
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
  /**
   * The git directory of the repository whose changes are summarized (the version control's `store`), found by the
   * command in the person's environment, which each worker is handed so that it never looks for the repository itself.
   */
  store: string;
  configuration: LiveDocumentationConfig;
  lens: HistoryLens;
  cacheFolder: string;
  keepIndex: boolean;
  jobs: number;
  /**
   * The memory the pool may hold, in bytes, by which it was sized (`poolMemory` in `computeHistory.ts`): a worker that
   * holds more than its share of it, this over `jobs`, after a change is replaced ({@link workerBound}).
   */
  memory: number;
  /** When to start no further change, in milliseconds since the epoch; the changes running then are finished. */
  deadline?: number;
  scratch: Scratch;
  progress: (line: string) => void;
  /** What starts a worker: {@link startWorker} unless a test hands a stand-in. */
  startWorker?: (context: RegenerationContext) => Promise<Worker>;
}

/**
 * Regenerates the changes in a pool of `jobs` workers, starting none after the deadline when there is one: processes
 * each started once, each taking runs of the line's consecutive changes in turn and keeping its tree from one change
 * to the next (`WorkingTree.bringTo`), so that a change costs what differs from the worker's last one, and not a
 * process and a tree of its own.
 *
 * @remarks
 * Until 2026-11-20 each change had a process of its own, and this module wrote every tree on the command's one main
 * thread, which is what the pool waited for; the record of that day (`Probes/history-rebuild-fast`) measures both. The
 * runs are short, about four to a worker, so that changes costing more at the line's end than at its start still
 * spread over every worker.
 *
 * @returns How long each change regenerated took, in milliseconds, and the largest peak memory a worker reported.
 */
export async function regenerate(changes: readonly MainlineChange[], context: RegenerationContext): Promise<{ timings: number[]; peakMemory: number }> {
  const timings: number[] = [];
  let peakMemory = 0;
  if (changes.length === 0) {
    return { timings, peakMemory };
  }
  // What the generator warned, once each with the number of changes that gave it, rather than again at every change.
  const warnings = new Map<string, number>();
  // Why trees were written anew rather than brought forward, each with the number of changes, said once at the end.
  const writtenAnew = new Map<string, number>();
  // The changes a fresh process decided, by each reason the worker that first took the change was marked or failed for
  // (until a review of 2026-11-20, only where the fresh process was marked itself); and the files the generator could
  // not map, each once, with the number of changes at which any was (until then, a file once at every such change).
  const decided = new Map<DecidedBy, number>();
  const unmappedFiles = new Set<string>();
  let unmappedChanges = 0;
  const started = Date.now();
  const runs: MainlineChange[][] = [];
  const length = Math.max(1, Math.ceil(changes.length / (context.jobs * 4)));
  for (let start = 0; start < changes.length; start += length) runs.push(changes.slice(start, start + length));
  let failure: Error | undefined;
  const open = (): boolean => failure === undefined && (context.deadline === undefined || Date.now() < context.deadline);
  const start = context.startWorker ?? startWorker;
  const bound = workerBound(context.memory, context.jobs);
  const lane = async (): Promise<void> => {
    let worker: Worker | undefined;
    // One change summarized by the lane's worker, or by a fresh one where there is none. A worker whose derivation may
    // depend on its own past (`marked`, `processMark.ts`) is ended, and the next change starts in a new one.
    const summarize = async (change: MainlineChange): Promise<WorkerReport> => {
      worker ??= await start(context);
      const report = await worker.summarize(change);
      peakMemory = Math.max(peakMemory, report.peakMemory);
      // A worker that holds more than its share of the pool's memory, or half its heap's limit, is replaced too, so that
      // what still grows with each change, unfound, never fails a run (its next change is a fresh worker's first).
      const full = report.heldMemory > bound || report.heapShare > 1 / 2;
      if (full) context.progress(`${change.id.slice(0, 8)}: its worker holds ${formatMegabytes(report.heldMemory)}, ${Math.round(report.heapShare * 100)}% of its heap's limit, against ${formatMegabytes(bound)} and a half; replaced`);
      if (report.marked.length > 0 || !report.published || full) {
        await worker.end();
        worker = undefined;
      }
      return report;
    };
    try {
      for (let run = runs.shift(); run !== undefined && open(); run = runs.shift()) {
        for (const change of run) {
          if (!open()) break;
          const began = Date.now();
          let report = await summarize(change);
          // Why a fresh process decides the change, where one does: what the worker that first took it was marked for,
          // and a failure of the machine's. A worker's first change is a fresh process's; a later one marked is refused.
          const reasons: DecidedBy[] = [...report.marked, ...(report.machineFailure ? (["machine"] as const) : [])];
          if (!report.published) {
            // Either the worker was marked during a change after its first, so that its derivation may be an earlier
            // change's, or a file failed for a cause of the machine's: the change goes to a fresh worker, whose first
            // change is what a fresh process makes and is written whatever it is but for the machine's failure, so that
            // no change is summarized a third time nor written twice.
            context.progress(`${change.id.slice(0, 8)}: ${report.machineFailure ? `${report.machineFailure.path} failed for a cause of the machine's (${report.machineFailure.error})` : `its worker, which had summarized earlier changes, was marked: ${marks(report.marked)}`}; summarized again in a fresh worker`);
            report = await summarize(change);
            if (report.machineFailure) throw new Error(`the summary of ${change.id} failed twice for a cause of the machine's: ${report.machineFailure.path}: ${report.machineFailure.error}`);
            if (!report.published) throw new Error(`a fresh worker did not write the summary of ${change.id}`);
          }
          if (report.marked.length > 0) {
            // Published by a worker whose first change it was: what a fresh process makes of the change alone.
            context.progress(`${change.id.slice(0, 8)}: decided by a fresh process, its worker ended after it: ${marks(report.marked)}`);
          }
          for (const reason of reasons) decided.set(reason, (decided.get(reason) ?? 0) + 1);
          for (const file of report.unmapped) unmappedFiles.add(file.path);
          if (report.unmapped.length > 0) unmappedChanges += 1;
          if (report.unwritten.length > 0) {
            context.progress(`${change.id.slice(0, 8)}: ${report.unwritten.length} entries of its tree were not written, and its summary says they were not read:`);
            for (const entry of report.unwritten) {
              context.progress(`  ${entry.path}: ${entry.reason}`);
            }
          }
          for (const message of new Set(report.warned)) {
            warnings.set(message, (warnings.get(message) ?? 0) + 1);
          }
          const anew = report.broughtForward ? undefined : (report.writtenAnew ?? "no reason given");
          if (anew !== undefined) writtenAnew.set(anew, (writtenAnew.get(anew) ?? 0) + 1);
          timings.push(Date.now() - began);
          const mean = timings.reduce((sum, time) => sum + time, 0) / timings.length;
          const wall = (Date.now() - started) / timings.length;
          context.progress(
            `${timings.length}/${changes.length} regenerated: ${change.id.slice(0, 8)} in ${seconds(Date.now() - began)}${anew === undefined ? "" : `, its tree written anew: ${anew}`}; ${seconds(mean)} a change, ${seconds(wall)} of wall clock a change at ${context.jobs} at a time`
          );
        }
      }
    } catch (error) {
      failure ??= error instanceof Error ? error : new Error(String(error));
    } finally {
      // A worker that cannot be ended or its folder removed fails the run once every lane has stopped, as a summary does.
      await worker?.end().catch((error: unknown) => {
        failure ??= error instanceof Error ? error : new Error(String(error));
      });
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.min(context.jobs, changes.length) }, lane));
  } finally {
    for (const [message, count] of warnings) {
      context.progress(`the generator warned at ${count} of the ${changes.length} changes regenerated: ${message}`);
    }
    for (const [reason, count] of [...writtenAnew].sort(([a], [b]) => (a < b ? -1 : 1))) {
      context.progress(`trees written anew at ${count} of the ${changes.length} changes regenerated: ${reason}`);
    }
    for (const [reason, words] of Object.entries(DECIDED_WORDS) as Array<[DecidedBy, string]>) {
      const count = decided.get(reason);
      if (count !== undefined) context.progress(`${count} of the ${changes.length} changes regenerated were decided by a fresh process: ${words}`);
    }
    if (unmappedFiles.size > 0) {
      context.progress(`${unmappedFiles.size} files the generator could not map, at ${unmappedChanges} of the ${changes.length} changes regenerated; each summary names its own`);
    }
  }
  if (failure !== undefined) {
    throw failure;
  }
  return { timings, peakMemory };
}

/**
 * The resident memory past which a worker is replaced after a change: its share of the memory the pool was sized by,
 * so that the workers together never hold more than the pool planned for, whatever grows in them.
 */
export function workerBound(memory: number, jobs: number): number {
  return memory / Math.max(1, jobs);
}

/** A summarizing process started once, which summarizes changes one at a time in a tree it keeps. */
export interface Worker {
  summarize(change: MainlineChange): Promise<WorkerReport>;
  /** Ends the process and removes its folder, its tree in it. */
  end(): Promise<void>;
}

/**
 * Starts a worker (`summarizeChange.ts`, as TypeScript under tsx or as JavaScript once built) in a scratch folder of its
 * own, where it writes its trees, with the node flags of {@link summarizingFlags} and the environment of {@link
 * summarizingEnvironment} and nothing else of the command's; each tree's own environment is set by the worker for the
 * task that summarizes in it.
 */
async function startWorker(context: RegenerationContext): Promise<Worker> {
  const worker = path.join(__dirname, `summarizeChange${path.extname(__filename)}`);
  const folder = await context.scratch.folder("live-docs-history-");
  const child = fork(worker, ["--worker", context.store, folder], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: summarizingEnvironment(process.env), execArgv: summarizingFlags(worker) });
  context.scratch.started(child);
  let errors = "";
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (text: string) => {
    // Only the last lines are said when it fails.
    errors = `${errors}${text}`.slice(-8192);
  });
  let current: { change: string; resolve: (report: WorkerReport) => void; reject: (error: Error) => void } | undefined;
  const failed = (why: string): void => {
    current?.reject(new Error(`the summary of ${current.change} failed (${why}): ${errors.trim().split("\n").slice(-5).join(" | ")}`));
    current = undefined;
  };
  // Ended only when the process has: an error (a message that could not be sent, say) fails the task, and the process
  // is ended, its folder removed only once it is gone. A process that never started never exits.
  const exited = new Promise<void>((resolve) => {
    child.on("error", (error) => {
      failed(error.message);
      if (child.pid === undefined) resolve();
      else child.kill();
    });
    child.once("exit", (code, signal) => {
      failed(signal ?? `exit ${code}`);
      resolve();
    });
  });
  child.on("message", (message) => {
    current?.resolve(message as WorkerReport);
    current = undefined;
  });
  const handle: Worker = {
    summarize: (change) =>
      new Promise<WorkerReport>((resolve, reject) => {
        current = { change: change.id, resolve, reject };
        const task: WorkerTask = {
          configuration: summarizedConfiguration(context.configuration),
          lens: context.lens.key,
          ignoresCase: context.lens.ignoresCase === true,
          commit: change.id,
          summaryPath: summaryPath(context.cacheFolder, change.id),
          textStore: path.join(context.cacheFolder, TEXT_STORE_DIRECTORY),
          indexPath: context.keepIndex ? indexPath(context.cacheFolder, change.id) : undefined
        };
        child.send(task);
      }),
    end: async () => {
      if (child.connected) child.disconnect();
      await exited;
      await context.scratch.release(folder);
    }
  };
  return handle;
}

/**
 * The variables of the command's environment the summarizing process is given, by name, and no other, so that nothing
 * the person's shell set changes what it loads or how it reads (of `NODE_OPTIONS`, only the heap limit is carried, by
 * {@link summarizingEnvironment}): `PATH`, by which it finds
 * git; the temporary folders, where the platform keeps them; on Windows the system's folders, without which a process
 * there cannot start; and tsx's own `TSX_TSCONFIG_PATH`, when the command runs under tsx, which names the TypeScript
 * configuration the lens keys.
 */
const SUMMARIZING_VARIABLES = ["PATH", "Path", "TMPDIR", "TMP", "TEMP", "SystemRoot", "SYSTEMROOT", "windir", "WINDIR", "TSX_TSCONFIG_PATH"];

/**
 * The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set, and of
 * the command's `NODE_OPTIONS` only its heap limit, `--max-old-space-size`, the way a person raises it through `npm run`
 * (`NODE_OPTIONS=--max-old-space-size=8192 npm run live-docs:history`), which decides whether a summary of a large
 * repository is made at all, never what it says. Any other option in it stays out.
 */
export function summarizingEnvironment(environment: NodeJS.ProcessEnv): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const name of SUMMARIZING_VARIABLES) {
    const value = environment[name];
    if (value !== undefined) kept[name] = value;
  }
  const heap = heapLimit((environment.NODE_OPTIONS ?? "").split(/\s+/u).filter(Boolean));
  if (heap.length > 0) kept.NODE_OPTIONS = heap.join(" ");
  return kept;
}

/** The last `--max-old-space-size` among node's flags, as one word, given as `--max-old-space-size=N` or as two words; none when it is not among them. */
function heapLimit(flags: readonly string[]): string[] {
  let heap: string[] = [];
  flags.forEach((flag, index) => {
    if (/^--max[-_]old[-_]space[-_]size=\d+$/u.test(flag)) heap = [flag];
    else if (/^--max[-_]old[-_]space[-_]size$/u.test(flag) && /^\d+$/u.test(flags[index + 1] ?? "")) heap = [`${flag}=${flags[index + 1]}`];
  });
  return heap;
}

/**
 * The flags node is started with for the summarizing process, and no other: for the TypeScript module, under tsx,
 * tsx's loader; and the command's own `--max-old-space-size`, when it was given one, which decides whether a summary
 * of a large repository is made at all, never what it says. Until 2026-11-19 `fork` passed on every flag of the
 * command's (`process.execArgv`), so that a flag such as `--conditions` or `--stack-size` reached the process that
 * makes a summary, where the lens could not see it; for a while after, none was passed, and a summary that outgrew
 * node's default heap could not be made by any means.
 *
 * @param commandFlags - The command's own flags, `process.execArgv` unless a test gives others.
 */
export function summarizingFlags(worker: string, commandFlags: readonly string[] = process.execArgv): string[] {
  const loader = path.extname(worker) === ".ts" ? ["--import", pathToFileURL(require.resolve("tsx")).href] : [];
  return [...loader, ...heapLimit(commandFlags)];
}

/** What each mark of a worker means, in the words of the run's lines. */
const MARK_WORDS: Record<ProcessMark, string> = {
  deep: "a file nested beyond the reading depth",
  unmapped: "a file the generator could not map",
  runtime: "a fault of the tree-sitter runtime"
};

/** Why a fresh process decided a change: a mark of the worker that first took it, or a failure of the machine's there. */
type DecidedBy = ProcessMark | "machine";

/** Each reason a fresh process decided a change, in the words and the order of the run's last lines. */
const DECIDED_WORDS: Record<DecidedBy, string> = { ...MARK_WORDS, machine: "a file that failed for a cause of the machine's" };

function marks(reasons: readonly ProcessMark[]): string {
  return reasons.map((reason) => MARK_WORDS[reason]).join("; ");
}

function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / 2 ** 20)} MiB`;
}

function seconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)} s`;
}
