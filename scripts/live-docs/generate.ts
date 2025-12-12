#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";

import { generateLiveDocs } from "../../packages/server/src/features/live-docs/generator";
import { generateSystemLiveDocs } from "../../packages/server/src/features/live-docs/system/generator";

interface ParsedArgs {
  help: boolean;
  version: boolean;
  workspace?: string;
  root?: string;
  baseLayer?: string;
  extension?: string;
  globs: string[];
  include: string[];
  configPath?: string;
  dryRun: boolean;
  changedOnly: boolean;
  system: boolean;
  systemOutput?: string;
  systemClean: boolean;
}

type ChangeCounts = Record<"created" | "updated" | "unchanged" | "skipped", number>;

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false,
    globs: [],
    include: [],
    dryRun: false,
    changedOnly: false,
    system: false,
    systemClean: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    switch (current) {
      case "-h":
      case "--help": {
        parsed.help = true;
        break;
      }

      case "-v":
      case "--version": {
        parsed.version = true;
        break;
      }

      case "--workspace": {
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      }

      case "--root": {
        parsed.root = expectValue(argv, ++index, current);
        break;
      }

      case "--base-layer": {
        parsed.baseLayer = expectValue(argv, ++index, current);
        break;
      }

      case "--extension": {
        parsed.extension = expectValue(argv, ++index, current);
        break;
      }

      case "--glob": {
        parsed.globs.push(expectValue(argv, ++index, current));
        break;
      }

      case "--include": {
        parsed.include.push(expectValue(argv, ++index, current));
        break;
      }

      case "--config": {
        parsed.configPath = expectValue(argv, ++index, current);
        break;
      }

      case "--dry-run": {
        parsed.dryRun = true;
        break;
      }

      case "--changed": {
        parsed.changedOnly = true;
        break;
      }

      case "--system": {
        parsed.system = true;
        break;
      }

      case "--system-output": {
        parsed.systemOutput = expectValue(argv, ++index, current);
        parsed.system = true;
        break;
      }

      case "--system-clean": {
        parsed.systemClean = true;
        parsed.system = true;
        break;
      }

      default: {
        if (current.startsWith("-")) {
          throw new Error(`Unknown option: ${current}`);
        }

        // Treat bare arguments as glob patterns
        const candidate = current.trim();
        if (candidate) {
          parsed.globs.push(candidate);
        }
      }
    }
  }

  return parsed;
}

function expectValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`Option ${flag} requires a value.`);
  }
  return value;
}

function usage(): string {
  return `Usage: npm run live-docs:generate -- [options]\n\n` +
    `Options:\n` +
    `  --workspace <path>        Workspace root (defaults to current directory).\n` +
    `  --root <path>             Override liveDocumentation.root.\n` +
    `  --base-layer <name>       Override liveDocumentation.baseLayer.\n` +
    `  --extension <suffix>      Override liveDocumentation.extension (default .md).\n` +
    `  --glob <pattern>          Additional glob pattern (can repeat).\n` +
    `  --include <pattern>       Target a specific file or glob (can repeat).\n` +
    `  --config <file>           Load configuration from JSON file.\n` +
    `  --dry-run                 Preview changes without writing files.\n` +
    `  --changed                 Limit regeneration to changed files (git status).\n` +
  `  --system                  Materialise System Layer views to the default workspace output folder.\n` +
  `  --system-output <dir>     Materialise System Layer views to the specified directory.\n` +
  `  --system-clean            Remove the system output directory before generation (requires --system or --system-output).\n` +
    `  --version                 Print generator version.\n` +
    `  --help                    Display this help text.\n` +
    `\nExamples:\n` +
    `  npm run live-docs:generate\n` +
  `  npm run live-docs:generate -- --dry-run --changed\n` +
  `  npm run live-docs:generate -- --system-output ./AI-Agent-Workspace/tmp/system-cli-output --system-clean\n` +
  `  npm run live-docs:generate -- --glob packages/**/*.ts --include tests/**/*.ts`;
}

async function readConfigFile(configPath: string): Promise<LiveDocumentationConfigInput> {
  const resolved = path.resolve(configPath);
  const raw = await fs.readFile(resolved, "utf8");
  const parsed = JSON.parse(raw) as LiveDocumentationConfigInput;
  return parsed;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.version) {
    const version = process.env.LIVE_DOCS_GENERATOR_VERSION ?? "0.1.0";
    console.log(version);
    return;
  }

  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());

  let configInput: LiveDocumentationConfigInput = {};
  if (args.configPath) {
    configInput = await readConfigFile(args.configPath);
  }

  if (args.root) {
    configInput.root = args.root;
  }

  if (args.baseLayer) {
    configInput.baseLayer = args.baseLayer;
  }

  if (args.extension) {
    configInput.extension = args.extension;
  }

  if (args.globs.length > 0) {
    configInput.glob = args.globs;
  }

  const normalizedConfig: LiveDocumentationConfig = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    ...configInput
  });

  const includePatterns = args.include
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((pattern) => {
      if (path.isAbsolute(pattern)) {
        const relative = path.relative(workspaceRoot, pattern);
        return relative.startsWith("..") ? pattern : relative;
      }
      return pattern;
    });

  const layer4Result = await generateLiveDocs({
    workspaceRoot,
    config: normalizedConfig,
    dryRun: args.dryRun,
    changedOnly: args.changedOnly,
    include: includePatterns
  });

  const layer4Counts = layer4Result.files.reduce<ChangeCounts>(
    (acc, record) => {
      acc[record.change] += 1;
      return acc;
    },
    { created: 0, updated: 0, unchanged: 0, skipped: 0 }
  );

  const dryRunSuffix = args.dryRun ? " (dry-run)" : "";
  console.log(
    `[live-docs] Layer 4 processed ${layer4Result.processed} file(s)${dryRunSuffix}: ${layer4Counts.created} created, ${layer4Counts.updated} updated, ${layer4Counts.unchanged} unchanged, ${layer4Counts.skipped} skipped, ${layer4Result.deleted} deleted.`
  );

  const createdLayer4Docs = layer4Result.files.filter((record) => record.change === "created");
  const deletedLayer4Docs = layer4Result.deletedFiles;

  if (args.system) {
    const defaultSystemOutput = path.join("AI-Agent-Workspace", "tmp", "system-cli-output");
    const systemOutputCandidate = args.systemOutput ?? defaultSystemOutput;
    const systemOutputDir = path.isAbsolute(systemOutputCandidate)
      ? systemOutputCandidate
      : path.resolve(workspaceRoot, systemOutputCandidate);

    const layer3Result = await generateSystemLiveDocs({
      workspaceRoot,
      config: normalizedConfig,
      dryRun: args.dryRun,
      outputDir: systemOutputDir,
      cleanOutputDir: args.systemClean
    });

    const layer3Counts = layer3Result.files.reduce<ChangeCounts>(
      (acc, record) => {
        acc[record.change] += 1;
        return acc;
      },
      { created: 0, updated: 0, unchanged: 0, skipped: 0 }
    );

    console.log(
      `[live-docs] System views processed ${layer3Result.processed} plan(s)${dryRunSuffix}: ` +
        `${layer3Counts.created} created, ${layer3Counts.updated} updated, ` +
        `${layer3Counts.unchanged} unchanged, ${layer3Counts.skipped} skipped, ${layer3Result.deleted} deleted.`
    );

    const createdLayer3Docs = layer3Result.files.filter((record) => record.change === "created");
    const deletedLayer3Docs = layer3Result.deletedFiles;

    const MAX_LISTED = 10;
    const verb = args.dryRun ? "Would create" : "Created";

    if (createdLayer4Docs.length > 0) {
      const listed = createdLayer4Docs
        .slice(0, MAX_LISTED)
        .map((record) => record.docPath ?? record.sourcePath);
      const remainder = createdLayer4Docs.length - listed.length;
      const suffix = remainder > 0 ? `, +${remainder} more` : "";
      console.log(`[live-docs] ${verb} ${createdLayer4Docs.length} Layer 4 Live Doc(s): ${listed.join(", ")}${suffix}`);
    }

    if (createdLayer3Docs.length > 0) {
      const listed = createdLayer3Docs
        .slice(0, MAX_LISTED)
        .map((record) => record.docPath);
      const remainder = createdLayer3Docs.length - listed.length;
      const suffix = remainder > 0 ? `, +${remainder} more` : "";
      console.log(
        `[live-docs] ${verb} ${createdLayer3Docs.length} System view(s) at ${systemOutputDir}: ${listed.join(", ")}${suffix}`
      );
    }

    if (deletedLayer4Docs.length > 0) {
      const listed = deletedLayer4Docs.slice(0, MAX_LISTED);
      const remainder = deletedLayer4Docs.length - listed.length;
      const suffix = remainder > 0 ? `, +${remainder} more` : "";
      const deleteVerb = args.dryRun ? "Would delete" : "Deleted";
      console.log(`[live-docs] ${deleteVerb} ${deletedLayer4Docs.length} Layer 4 Live Doc(s): ${listed.join(", ")}${suffix}`);
    }

    if (deletedLayer3Docs.length > 0) {
      const listed = deletedLayer3Docs.slice(0, MAX_LISTED);
      const remainder = deletedLayer3Docs.length - listed.length;
      const suffix = remainder > 0 ? `, +${remainder} more` : "";
      const deleteVerb = args.dryRun ? "Would delete" : "Deleted";
      console.log(
        `[live-docs] ${deleteVerb} ${deletedLayer3Docs.length} System view(s) from ${systemOutputDir}: ${listed.join(", ")}${suffix}`
      );
    }

    if (!args.dryRun && layer3Result.outputDir) {
      console.log(`[live-docs] System views available under: ${layer3Result.outputDir}`);
    }
  } else {
    const MAX_LISTED = 10;
    const verb = args.dryRun ? "Would create" : "Created";

    if (createdLayer4Docs.length > 0) {
      const listed = createdLayer4Docs
        .slice(0, MAX_LISTED)
        .map((record) => record.docPath ?? record.sourcePath);
      const remainder = createdLayer4Docs.length - listed.length;
      const suffix = remainder > 0 ? `, +${remainder} more` : "";
      console.log(`[live-docs] ${verb} ${createdLayer4Docs.length} Layer 4 Live Doc(s): ${listed.join(", ")}${suffix}`);
    }

    if (deletedLayer4Docs.length > 0) {
      const listed = deletedLayer4Docs.slice(0, MAX_LISTED);
      const remainder = deletedLayer4Docs.length - listed.length;
      const suffix = remainder > 0 ? `, +${remainder} more` : "";
      const deleteVerb = args.dryRun ? "Would delete" : "Deleted";
      console.log(`[live-docs] ${deleteVerb} ${deletedLayer4Docs.length} Layer 4 Live Doc(s): ${listed.join(", ")}${suffix}`);
    }

    console.log("[live-docs] System materialisation skipped. Use npm run live-docs:system for on-demand views.");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`live-docs:generate failed: ${message}`);
  process.exitCode = 1;
});