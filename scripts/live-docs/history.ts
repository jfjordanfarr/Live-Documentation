#!/usr/bin/env node
/**
 * Live Documentation history CLI: a repository's history regenerated under
 * one lens and written as one sequence beside the graph index.
 *
 * Usage: npm run live-docs:history -- [options]
 *
 * @module history
 */
import process from "node:process";

import type { HistorySequence, Sampling } from "@live-documentation/engine/live-docs/history/format";
import { changeAt, headOf } from "@live-documentation/engine/live-docs/history/sequence";

import { computeHistory, formatBytes, HistoryStopped } from "../../packages/generator/src/history/computeHistory";
import { endQuietlyWhenThePipeCloses, optionValue, runCommand, typedPath, UsageError, workspaceFolder } from "./cli";

interface ParsedArgs {
  help: boolean;
  json: boolean;
  workspace?: string;
  configPath?: string;
  every?: number;
  since?: string;
  step: "commit" | "day" | "week" | "tag";
  jobs?: number;
  keepIndex: boolean;
  authors: boolean;
  removeSuperseded: boolean;
  checkHead: boolean;
  rederive: boolean;
  keepWorkers: boolean;
  stopAfter?: number;
}

async function main(): Promise<void> {
  endQuietlyWhenThePipeCloses();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  let run;
  try {
    run = await computeHistory({
      workspace: workspaceFolder(args.workspace),
      configPath: args.configPath === undefined ? undefined : typedPath(args.configPath),
      sampling: samplingOf(args),
      jobs: args.jobs,
      keepIndex: args.keepIndex,
      authors: args.authors,
      removeSuperseded: args.removeSuperseded,
      checkHead: args.checkHead,
      rederive: args.rederive,
      keepWorkers: args.keepWorkers,
      stopAfterMinutes: args.stopAfter,
      progress: (line) => process.stderr.write(`[history] ${line}\n`)
    });
  } catch (error) {
    if (!(error instanceof HistoryStopped)) throw error;
    // Not a failure of the history, and not a history: a caller tells the two apart by the exit code.
    console.log(`History incomplete: ${error.message}`);
    process.exitCode = STOPPED;
    return;
  }
  // Said on every run whose lens keeps workers, one that regenerates nothing included, whose pool says nothing then.
  const keptWorkers = run.sequence.lens.keepWorkers === true ? ` ${KEPT_WORKERS}` : "";
  if (args.json) {
    printJson(run.sequence);
    if (keptWorkers !== "") process.stderr.write(`[history]${keptWorkers}\n`);
  } else {
    const bytes = Buffer.byteLength(JSON.stringify(run.sequence));
    const regenerated =
      run.regenerated > 0
        ? `${run.regenerated} regenerated in ${minutes(run.regenerationMilliseconds)} at ${run.jobs} at a time, the largest process ${formatBytes(run.peakMemory)} at its peak`
        : "0 regenerated";
    const kept = run.superseded.filter((cache) => !cache.removed);
    const others = kept.length > 0 ? ` The caches of ${kept.length} other lenses hold ${formatBytes(kept.reduce((sum, cache) => sum + cache.bytes, 0))}; --remove-superseded removes them.` : "";
    console.log(
      `Wrote ${run.file}: ${run.sequence.steps.length + 1} changes from ${run.sequence.base.commit.id.slice(0, 8)} to ${run.sequence.source.head.slice(0, 8)}, ${formatBytes(bytes)}; ${regenerated}; ${run.cached} from the cache at ${run.cache}, which holds ${formatBytes(run.cacheBytes)}.${keptWorkers}${others}\n` +
        `${run.headCheck.applied ? "Checked" : "Not checked"}: ${run.headCheck.line}.`
    );
  }
}

/** What the closing line says of a history whose lens keeps workers (`--keep-workers`), whether or not this run regenerated any commit. */
const KEPT_WORKERS = "Its summaries were made by workers kept from commit to commit (--keep-workers), not yet shown to be those a process of its own makes.";

/** The exit code of a run stopped by --stop-after before the cache held every sampled commit. */
const STOPPED = 3;

function minutes(milliseconds: number): string {
  return milliseconds < 120_000 ? `${(milliseconds / 1000).toFixed(1)} s` : `${(milliseconds / 60_000).toFixed(1)} min`;
}

function samplingOf(args: ParsedArgs): Sampling {
  const since = args.since === undefined ? {} : { since: args.since };
  if (args.every !== undefined && args.step !== "commit") {
    throw new UsageError("--every counts commits; it takes --step commit, the default.");
  }
  switch (args.step) {
    case "commit":
      return args.every !== undefined && args.every > 1 ? { rule: "every-nth", n: args.every, ...since } : { rule: "every-commit", ...since };
    case "day":
      return { rule: "daily", ...since };
    case "week":
      return { rule: "weekly", ...since };
    case "tag":
      return { rule: "tags", ...since };
  }
}

/** The sequence's head as one line of JSON, then one line per change with its paths written out. */
function printJson(sequence: HistorySequence): void {
  const head = headOf(sequence);
  console.log(JSON.stringify({ kind: "head", ...head }));
  for (let step = 0; step <= sequence.steps.length; step += 1) {
    const commit = step === 0 ? sequence.base.commit : sequence.steps[step - 1].commit;
    const change = changeAt(sequence, step);
    const files = step === 0 ? { files: sequence.base.files.length, edges: sequence.base.edges.length } : {};
    console.log(JSON.stringify({ kind: "step", step, commit, ...files, ...nonEmpty(change) }));
  }
}

function nonEmpty(change: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(change).filter(([, value]) => !Array.isArray(value) || value.length > 0));
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { help: false, json: false, step: "commit", keepIndex: false, authors: true, removeSuperseded: false, checkHead: false, rederive: false, keepWorkers: false };
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    switch (current) {
      case "-h":
      case "--help":
        parsed.help = true;
        break;
      case "--json":
        parsed.json = true;
        break;
      case "--workspace":
        parsed.workspace = optionValue(argv, ++index, current);
        break;
      case "--config":
        parsed.configPath = optionValue(argv, ++index, current);
        break;
      case "--every":
        parsed.every = positiveInteger(optionValue(argv, ++index, current), current);
        break;
      case "--since": {
        const value = optionValue(argv, ++index, current);
        if (Number.isNaN(Date.parse(value))) {
          throw new UsageError(`--since takes a date, as 2026-09-01; ${value} is not one.`);
        }
        parsed.since = value;
        break;
      }
      case "--step": {
        const value = optionValue(argv, ++index, current);
        if (value !== "commit" && value !== "day" && value !== "week" && value !== "tag") {
          throw new UsageError("--step takes commit, day, week or tag.");
        }
        parsed.step = value;
        break;
      }
      case "--jobs":
        parsed.jobs = positiveInteger(optionValue(argv, ++index, current), current);
        break;
      case "--keep-index":
        parsed.keepIndex = true;
        break;
      case "--no-authors":
        parsed.authors = false;
        break;
      case "--remove-superseded":
        parsed.removeSuperseded = true;
        break;
      case "--check-head":
        parsed.checkHead = true;
        break;
      case "--rederive":
        parsed.rederive = true;
        break;
      case "--keep-workers":
        parsed.keepWorkers = true;
        break;
      case "--stop-after": {
        // 0 starts no commit: the run writes a history only when the cache already holds every one.
        const value = optionValue(argv, ++index, current);
        const minutes = Number(value);
        if (!Number.isInteger(minutes) || minutes < 0) {
          throw new UsageError(`--stop-after takes a whole number of minutes, 0 or more; ${value} is not one.`);
        }
        parsed.stopAfter = minutes;
        break;
      }
      default:
        throw new UsageError(`${current} is not an option.`);
    }
  }
  return parsed;
}

function positiveInteger(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new UsageError(`${flag} takes a whole number of one or more; ${value} is not one.`);
  }
  return parsed;
}

function usage(): string {
  return (
    `Usage: npm run live-docs:history -- [options]\n\n` +
    `Regenerates the sampled commits of the repository's mainline (the first parents of HEAD) with this\n` +
    `generator and one configuration, and writes the sequence to <docs root>/history/history.json, with\n` +
    `a cache beside it so that a second run regenerates only the commits the cache lacks. Never committed.\n\n` +
    `Options:\n` +
    `  --workspace <path>   The repository's top level (default: the nearest folder, from the current\n` +
    `                       directory up, that holds a .live-docs.config.json; else the current directory).\n` +
    `  --config <file>      The configuration applied to every commit (default: the workspace's\n` +
    `                       .live-docs.config.json as it stands, or the shipped defaults).\n` +
    `  --step <unit>        commit (default), day, week or tag: which commits are regenerated.\n` +
    `  --every <n>          Every n-th commit, with --step commit.\n` +
    `  --since <date>       Only commits on or after the date.\n` +
    `  --jobs <n>           Commits regenerated at once, a worker each (default: as many as half the\n` +
    `                       memory holds at the peak a process last took here, at most one fewer than\n` +
    `                       the processors).\n` +
    `  --keep-workers       Let a worker go on from one commit to the next, bringing its tree forward,\n` +
    `                       rather than give every commit a process of its own. Faster, but not yet shown\n` +
    `                       to make the summaries a fresh process makes: for a file nested hundreds of\n` +
    `                       levels deep a summary may depend on the worker. Not for a history you mean\n` +
    `                       to keep. Its summaries have a cache of their own, under a lens of their own.\n` +
    `  --keep-index         Keep each commit's full index.json, gzipped, in the cache.\n` +
    `  --no-authors         Leave the authors' names out of the sequence.\n` +
    `  --remove-superseded  Remove the caches of other lenses, which every run lists with their sizes,\n` +
    `                       keeping only the newest whole one until the current lens's cache holds every\n` +
    `                       sampled commit. The same code's cache under the other way of running workers\n` +
    `                       (--keep-workers or not) is never removed; it is listed as kept, with its size.\n` +
    `  --check-head         Hold the last commit's rows and links to the Live Docs committed there, read\n` +
    `                       afresh, and fail where they differ: say so when those docs were generated by\n` +
    `                       this generator under this configuration. Without it the check applies only\n` +
    `                       when this generator runs unmodified from the commit the history ends at,\n` +
    `                       under the workspace's own configuration, and is skipped elsewhere.\n` +
    `  --rederive           Derive every step of the sequence from the summaries again. Without it a run\n` +
    `                       goes on from the sequence the last run wrote when only new commits follow it\n` +
    `                       and the lens, the code that reads summaries, git and the configuration are the\n` +
    `                       same; any change to the engine or the generator derives every step once.\n` +
    `  --stop-after <min>   Start no commit after this many minutes of regeneration. A run stopped so\n` +
    `                       writes no history, keeps what it summarized for the next run, and exits 3.\n` +
    `  --json               Print the sequence's head and one line per step as JSON lines.\n` +
    `  -h, --help           Print this help.\n` +
    `\nThe first and the last commit are always regenerated, so the sequence spans what it samples.\n` +
    `Progress goes to stderr.\n` +
    `\nExamples:\n` +
    `  npm run live-docs:history\n` +
    `  npm run live-docs:history -- --every 8 --jobs 2\n` +
    `  npm run live-docs:history -- --step week --since 2026-01-01 --no-authors\n`
  );
}

runCommand("live-docs:history", main);
