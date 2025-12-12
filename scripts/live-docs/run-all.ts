#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

interface OrchestratorOptions {
  generatorArgs: string[];
  skipTargets: boolean;
  skipGenerate: boolean;
  skipLint: boolean;
  runReport: boolean;
  showHelp: boolean;
  partialRun: boolean;
  skipTargetsExplicit: boolean;
  forceTargets: boolean;
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

const VALUE_FLAGS = new Set([
  "--workspace",
  "--root",
  "--base-layer",
  "--extension",
  "--glob",
  "--include",
  "--config"
]);

const BOOLEAN_FLAGS = new Set([
  "--dry-run",
  "--changed"
]);

const PIPELINE_CONFIG_FLAGS = new Set([
  "--workspace",
  "--config",
  "--root",
  "--base-layer",
  "--extension"
]);

function parseArgs(rawArgs: string[]): OrchestratorOptions {
  const generatorArgs: string[] = [];
  const options: OrchestratorOptions = {
    generatorArgs,
    skipTargets: false,
    skipGenerate: false,
    skipLint: false,
    runReport: false,
    showHelp: false,
    partialRun: false,
    skipTargetsExplicit: false,
    forceTargets: false
  };

  const appendFlag = (flag: string, value?: string): void => {
    generatorArgs.push(flag);
    if (typeof value === "string") {
      generatorArgs.push(value);
    }
  };

  const markPartial = (): void => {
    options.partialRun = true;
  };

  const expectValue = (args: string[], index: number, flag: string): string => {
    const candidate = args[index];
    if (!candidate || candidate.startsWith("-")) {
      throw new Error(`Option ${flag} requires a value.`);
    }
    return candidate;
  };

  const processValueFlag = (
    flag: string,
    inlineValue: string | undefined,
    args: string[],
    indexRef: { current: number }
  ): void => {
    let value = inlineValue;
    if (value === undefined) {
      indexRef.current += 1;
      value = expectValue(args, indexRef.current, flag);
    }
    appendFlag(flag, value);
    if (flag === "--include" || flag === "--glob") {
      markPartial();
    }
  };

  const processBooleanFlag = (flag: string): void => {
    appendFlag(flag);
    if (flag === "--dry-run" || flag === "--changed") {
      markPartial();
    }
  };

  const processGeneratorArg = (args: string[], indexRef: { current: number }): void => {
    const current = args[indexRef.current];
    if (!current) {
      return;
    }

    const [flagCandidate, inlineValue] = splitFlagAndValue(current);

    if (VALUE_FLAGS.has(flagCandidate)) {
      processValueFlag(flagCandidate, inlineValue, args, indexRef);
      return;
    }

    if (BOOLEAN_FLAGS.has(flagCandidate)) {
      processBooleanFlag(flagCandidate);
      return;
    }

    generatorArgs.push(current);
    if (!current.startsWith("--")) {
      markPartial();
    }
  };

  const indexRef = { current: 0 };
  while (indexRef.current < rawArgs.length) {
    const arg = rawArgs[indexRef.current];

    if (arg === "--") {
      const remaining = rawArgs.slice(indexRef.current + 1);
      for (let inner = 0; inner < remaining.length; inner += 1) {
        const innerRef = { current: inner };
        processGeneratorArg(remaining, innerRef);
        inner = innerRef.current;
      }
      break;
    }

    switch (arg) {
      case "--help":
      case "-h": {
        options.showHelp = true;
        indexRef.current += 1;
        continue;
      }
      case "--skip-targets": {
        options.skipTargets = true;
        options.skipTargetsExplicit = true;
        indexRef.current += 1;
        continue;
      }
      case "--skip-generate": {
        options.skipGenerate = true;
        indexRef.current += 1;
        continue;
      }
      case "--skip-lint": {
        options.skipLint = true;
        indexRef.current += 1;
        continue;
      }
      case "--report": {
        options.runReport = true;
        indexRef.current += 1;
        continue;
      }
      case "--force-targets": {
        options.forceTargets = true;
        options.skipTargets = false;
        indexRef.current += 1;
        continue;
      }
      default: {
        processGeneratorArg(rawArgs, indexRef);
        indexRef.current += 1;
      }
    }
  }

  if (options.partialRun && !options.forceTargets && !options.skipTargetsExplicit) {
    options.skipTargets = true;
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

function filterArgsForLintAndReport(args: string[]): string[] {
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
    `Runs the Live Documentation pipeline in order: target manifest → generate → lint.\n\n` +
    `Options:\n` +
    `  --skip-targets    Skip manifest regeneration step.\n` +
    `  --skip-generate   Skip Live Doc regeneration step.\n` +
    `  --skip-lint       Skip lint step.\n` +
    `  --report          Run live-docs:report after lint completes.\n` +
  `  --force-targets   Run manifest even when executing a partial regeneration.\n` +
    `  -h, --help        Show this help message.\n\n` +
  `Any additional options are forwarded to live-docs:generate (e.g. --dry-run, --changed).\n` +
  `When running via npm, pass two "--" separators to forward generator flags without npm config warnings:\n` +
  `  npm run livedocs -- -- --include path/to/file.ts --dry-run`;
}

async function runStage(stage: Stage): Promise<void> {
  if (!stage.enabled) {
    console.log(`[live-docs] Skipping ${stage.label}`);
    return;
  }

  const absolutePath = path.resolve(process.cwd(), stage.script);
  const moduleUrl = pathToFileURL(absolutePath).href;

  const previousArgv = process.argv;
  const previousExitCode = process.exitCode;

  console.log(`[live-docs] Running ${stage.label}...`);

  try {
    process.argv = [previousArgv[0], absolutePath, ...stage.args];
    process.exitCode = undefined;

    await import(moduleUrl);

    const exitCode = typeof process.exitCode === "number" ? process.exitCode : 0;
    if (exitCode !== 0) {
      throw new StageError(stage.label, exitCode);
    }

    console.log(`[live-docs] Completed ${stage.label}`);
  } finally {
    process.argv = previousArgv;
    process.exitCode = previousExitCode;
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const workspaceRoot = resolveWorkspaceRoot(options.generatorArgs);
  options.generatorArgs = appendDefaultConfigIfPresent(options.generatorArgs, workspaceRoot);
  const lintAndReportArgs = filterArgsForLintAndReport(options.generatorArgs);

  if (options.showHelp) {
    console.log(formatUsage());
    return;
  }

  if (options.partialRun && options.skipTargets && !options.forceTargets) {
    console.log(
      "[live-docs] Partial Live Docs run detected; skipping live-docs:targets. Pass --force-targets to rebuild the manifest."
    );
  }

  const stages: Stage[] = [
    {
      label: "live-docs:targets",
      script: "scripts/live-docs/build-target-manifest.ts",
      args: [],
      enabled: !options.skipTargets
    },
    {
      label: "live-docs:generate",
      script: "scripts/live-docs/generate.ts",
      args: options.generatorArgs,
      enabled: !options.skipGenerate
    },
    {
      label: "live-docs:lint",
      script: "scripts/live-docs/lint.ts",
      args: lintAndReportArgs,
      enabled: !options.skipLint
    }
  ];

  if (options.runReport) {
    stages.push({
      label: "live-docs:report",
      script: "scripts/live-docs/report-precision.ts",
      args: lintAndReportArgs,
      enabled: true
    });
  }

  for (const stage of stages) {
    try {
      await runStage(stage);
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
      throw error;
    }
  }

  console.log("[live-docs] Pipeline complete");
}

main().catch(() => {
  if (typeof process.exitCode !== "number") {
    process.exitCode = 1;
  }
});
