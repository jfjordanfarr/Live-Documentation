#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

import { invocationFolder } from "./cli";

/** This checkout, whose tsx and TypeScript configuration run each stage. */
const CHECKOUT = path.resolve(__dirname, "..", "..");

interface OrchestratorOptions {
  generatorArgs: string[];
  skipGenerate: boolean;
  skipLint: boolean;
  showHelp: boolean;
}

interface Stage {
  label: string;
  script: string;
  args: string[];
  enabled: boolean;
}

class StageError extends Error {
  constructor(readonly stage: string, readonly exitCode: number) {
    super(`${stage} failed with exit code ${exitCode}`);
  }
}

const PIPELINE_CONFIG_FLAGS = new Set([
  "--workspace",
  "--config",
  "--root",
  "--base-layer",
  "--extension"
]);

function parseArgs(rawArgs: string[]): OrchestratorOptions {
  const options: OrchestratorOptions = {
    generatorArgs: [],
    skipGenerate: false,
    skipLint: false,
    showHelp: false
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--") {
      options.generatorArgs.push(...rawArgs.slice(index + 1));
      break;
    }
    switch (arg) {
      case "--help":
      case "-h":
        options.showHelp = true;
        break;
      case "--skip-generate":
        options.skipGenerate = true;
        break;
      case "--skip-lint":
        options.skipLint = true;
        break;
      default:
        options.generatorArgs.push(arg);
    }
  }

  return options;
}

function splitFlagAndValue(arg: string): [string, string | undefined] {
  if (!arg.startsWith("--")) {
    return [arg, undefined];
  }

  const equalsIndex = arg.indexOf("=");
  if (equalsIndex === -1) {
    return [arg, undefined];
  }

  const flag = arg.slice(0, equalsIndex);
  const value = arg.slice(equalsIndex + 1);
  return [flag, value];
}

function filterArgsForLint(args: string[]): string[] {
  const filtered: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (!current) {
      continue;
    }

    const [flagCandidate] = splitFlagAndValue(current);
    if (!PIPELINE_CONFIG_FLAGS.has(flagCandidate)) {
      continue;
    }

    filtered.push(current);

    const hasInlineValue = current.includes("=");
    if (hasInlineValue) {
      continue;
    }

    if (index + 1 < args.length) {
      const possibleValue = args[index + 1];
      if (possibleValue && !possibleValue.startsWith("-")) {
        filtered.push(possibleValue);
        index += 1;
      }
    }
  }

  return filtered;
}

function formatUsage(): string {
  return `Usage: npm run livedocs -- [options]\n\n` +
    `Runs the Live Documentation pipeline in order: generate, then lint.\n\n` +
    `Options:\n` +
    `  --skip-generate   Skip Live Doc regeneration step.\n` +
    `  --skip-lint       Skip lint step.\n` +
    `  -h, --help        Show this help message.\n\n` +
  `Any additional options are forwarded to live-docs:generate (e.g. --dry-run, --check, --changed).\n` +
  `When running via npm, pass two "--" separators to forward generator flags without npm config warnings:\n` +
  `  npm run livedocs -- -- --include path/to/file.ts --dry-run`;
}

function runStage(stage: Stage): void {
  if (!stage.enabled) {
    console.log(`[live-docs] Skipping ${stage.label}`);
    return;
  }

  const absolutePath = path.join(__dirname, stage.script);
  const tsx = path.join(CHECKOUT, "node_modules", "tsx", "dist", "cli.mjs");
  const tsconfig = path.join(CHECKOUT, "tsconfig.base.json");
  console.log(`[live-docs] Running ${stage.label}...`);
  // From the folder the pipeline was run from, so that each stage takes the paths typed, and its default workspace, from there.
  const result = spawnSync(process.execPath, [tsx, "--tsconfig", tsconfig, absolutePath, ...stage.args], { stdio: "inherit", cwd: invocationFolder() });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new StageError(stage.label, result.status ?? 1);
  }
  console.log(`[live-docs] Completed ${stage.label}`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  // Each stage reads the workspace's own configuration when none is named, so the arguments go as they were typed.
  const lintArgs = filterArgsForLint(options.generatorArgs);

  if (options.showHelp) {
    console.log(formatUsage());
    return;
  }

  const stages: Stage[] = [
    {
      label: "live-docs:generate",
      script: "generate.ts",
      args: options.generatorArgs,
      enabled: !options.skipGenerate
    },
    {
      label: "live-docs:lint",
      script: "lint.ts",
      args: lintArgs,
      enabled: !options.skipLint
    }
  ];

  for (const stage of stages) {
    try {
      runStage(stage);
    } catch (error) {
      if (error instanceof StageError) {
        process.exitCode = error.exitCode;
        console.error(`[live-docs] ${error.message}`);
      } else if (error instanceof Error) {
        process.exitCode = 1;
        console.error(`[live-docs] ${stage.label} failed: ${error.message}`);
      } else {
        process.exitCode = 1;
        console.error(`[live-docs] ${stage.label} failed with unknown error`);
      }
      return;
    }
  }

  console.log("[live-docs] Pipeline complete");
}

main();
