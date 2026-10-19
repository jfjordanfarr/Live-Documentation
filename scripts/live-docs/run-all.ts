#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

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

function hasConfigArg(args: string[]): boolean {
  for (const arg of args) {
    const [flagCandidate] = splitFlagAndValue(arg);
    if (flagCandidate === "--config") {
      return true;
    }
  }
  return false;
}

function resolveWorkspaceRoot(args: string[]): string {
  for (let index = 0; index < args.length; index += 1) {
    const [flagCandidate, inlineValue] = splitFlagAndValue(args[index] ?? "");
    if (flagCandidate !== "--workspace") {
      continue;
    }

    if (inlineValue) {
      return path.resolve(inlineValue);
    }

    const nextValue = args[index + 1];
    if (nextValue && !nextValue.startsWith("-")) {
      return path.resolve(nextValue);
    }
  }

  return path.resolve(process.cwd());
}

function appendDefaultConfigIfPresent(args: string[], workspaceRoot: string): string[] {
  if (hasConfigArg(args)) {
    return args;
  }

  const defaultConfigPath = path.join(workspaceRoot, ".live-docs.config.json");
  if (!fs.existsSync(defaultConfigPath)) {
    return args;
  }

  return [...args, "--config", defaultConfigPath];
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

  const absolutePath = path.resolve(process.cwd(), stage.script);
  const tsx = path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  const tsconfig = path.resolve(process.cwd(), "tsconfig.base.json");
  console.log(`[live-docs] Running ${stage.label}...`);
  const result = spawnSync(process.execPath, [tsx, "--tsconfig", tsconfig, absolutePath, ...stage.args], { stdio: "inherit" });
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

  const workspaceRoot = resolveWorkspaceRoot(options.generatorArgs);
  options.generatorArgs = appendDefaultConfigIfPresent(options.generatorArgs, workspaceRoot);
  const lintArgs = filterArgsForLint(options.generatorArgs);

  if (options.showHelp) {
    console.log(formatUsage());
    return;
  }

  const stages: Stage[] = [
    {
      label: "live-docs:generate",
      script: "scripts/live-docs/generate.ts",
      args: options.generatorArgs,
      enabled: !options.skipGenerate
    },
    {
      label: "live-docs:lint",
      script: "scripts/live-docs/lint.ts",
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
