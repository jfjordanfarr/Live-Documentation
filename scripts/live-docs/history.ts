#!/usr/bin/env node
/**
 * Live Documentation history CLI: a repository's history regenerated under
 * one lens and written as one sequence beside the graph index.
 *
 * Usage: npm run live-docs:history -- [options]
 *
 * @module history
 */
import os from "node:os";
import process from "node:process";

import type { HistorySequence, Sampling } from "@live-documentation/engine/live-docs/history/format";
import { changeAt, headOf } from "@live-documentation/engine/live-docs/history/sequence";

import { endQuietlyWhenThePipeCloses } from "./cli";
import { computeHistory } from "../../packages/generator/src/history/computeHistory";

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
}

const GIBIBYTE = 1024 ** 3;

async function main(): Promise<void> {
  endQuietlyWhenThePipeCloses();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  const run = await computeHistory({
    workspace: args.workspace ?? ".",
    configPath: args.configPath,
    sampling: samplingOf(args),
    jobs: args.jobs ?? defaultJobs(),
    keepIndex: args.keepIndex,
    authors: args.authors,
    progress: (line) => process.stderr.write(`[history] ${line}\n`)
  });
  if (args.json) {
    printJson(run.sequence);
  } else {
    const bytes = Buffer.byteLength(JSON.stringify(run.sequence));
    console.log(
      `Wrote ${run.file}: ${run.sequence.steps.length + 1} changes from ${run.sequence.base.commit.id.slice(0, 8)} to ${run.sequence.source.head.slice(0, 8)}, ${formatBytes(bytes)}; ${run.regenerated} regenerated, ${run.cached} from the cache at ${run.cache}.`
    );
  }
}

/** Two processes on a machine of 8 GiB or less; else one fewer than the processors, at most three. */
function defaultJobs(): number {
  return os.totalmem() <= 8 * GIBIBYTE ? 2 : Math.max(1, Math.min(3, os.cpus().length - 1));
}

function samplingOf(args: ParsedArgs): Sampling {
  const since = args.since === undefined ? {} : { since: args.since };
  if (args.every !== undefined && args.step !== "commit") {
    throw new Error("--every counts commits; it takes --step commit, the default.");
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
  const parsed: ParsedArgs = { help: false, json: false, step: "commit", keepIndex: false, authors: true };
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
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      case "--config":
        parsed.configPath = expectValue(argv, ++index, current);
        break;
      case "--every":
        parsed.every = positiveInteger(expectValue(argv, ++index, current), current);
        break;
      case "--since": {
        const value = expectValue(argv, ++index, current);
        if (Number.isNaN(Date.parse(value))) {
          throw new Error(`--since takes a date, as 2026-09-01; ${value} is not one.`);
        }
        parsed.since = value;
        break;
      }
      case "--step": {
        const value = expectValue(argv, ++index, current);
        if (value !== "commit" && value !== "day" && value !== "week" && value !== "tag") {
          throw new Error("--step takes commit, day, week or tag.");
        }
        parsed.step = value;
        break;
      }
      case "--jobs":
        parsed.jobs = positiveInteger(expectValue(argv, ++index, current), current);
        break;
      case "--keep-index":
        parsed.keepIndex = true;
        break;
      case "--no-authors":
        parsed.authors = false;
        break;
      default:
        throw new Error(`Unknown argument '${current}'. See --help.`);
    }
  }
  return parsed;
}

function expectValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} takes a value.`);
  }
  return value;
}

function positiveInteger(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${flag} takes a whole number of one or more; ${value} is not one.`);
  }
  return parsed;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function usage(): string {
  return (
    `Usage: npm run live-docs:history -- [options]\n\n` +
    `Regenerates the sampled commits of the repository's mainline (the first parents of HEAD) with this\n` +
    `generator and one configuration, and writes the sequence to <docs root>/history/history.json, with\n` +
    `a cache beside it so that a second run regenerates only the commits the cache lacks. Never committed.\n\n` +
    `Options:\n` +
    `  --workspace <path>   The repository's top level (default: the current directory).\n` +
    `  --config <file>      The configuration applied to every commit (default: the workspace's\n` +
    `                       .live-docs.config.json as it stands, or the shipped defaults).\n` +
    `  --step <unit>        commit (default), day, week or tag: which commits are regenerated.\n` +
    `  --every <n>          Every n-th commit, with --step commit.\n` +
    `  --since <date>       Only commits on or after the date.\n` +
    `  --jobs <n>           Commits regenerated at once, one process each (default: 2 on 8 GiB or less,\n` +
    `                       else one fewer than the processors, at most 3).\n` +
    `  --keep-index         Keep each commit's full index.json, gzipped, in the cache.\n` +
    `  --no-authors         Leave the authors' names out of the sequence.\n` +
    `  --json               Print the sequence's head and one line per step as JSON lines.\n` +
    `  --help               Display this help text.\n` +
    `\nThe first and the last commit are always regenerated, so the sequence spans what it samples.\n` +
    `Progress goes to stderr.\n` +
    `\nExamples:\n` +
    `  npm run live-docs:history\n` +
    `  npm run live-docs:history -- --every 8 --jobs 2\n` +
    `  npm run live-docs:history -- --step week --since 2026-01-01 --no-authors\n`
  );
}

main().catch((error: unknown) => {
  console.error(`live-docs:history failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
