#!/usr/bin/env node
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput,
  normalizeLiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";

import { optionValue, packageVersion, readConfiguration, runCommand, UsageError } from "./cli";
import { generateLiveDocs } from "../../packages/generator/src/generator";

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
  check: boolean;
  changedOnly: boolean;
}

type ChangeCounts = Record<"created" | "updated" | "unchanged" | "skipped", number>;

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false,
    globs: [],
    include: [],
    dryRun: false,
    check: false,
    changedOnly: false
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
        parsed.workspace = optionValue(argv, ++index, current);
        break;
      }

      case "--root": {
        parsed.root = optionValue(argv, ++index, current);
        break;
      }

      case "--base-layer": {
        parsed.baseLayer = optionValue(argv, ++index, current);
        break;
      }

      case "--extension": {
        parsed.extension = optionValue(argv, ++index, current);
        break;
      }

      case "--glob": {
        parsed.globs.push(optionValue(argv, ++index, current));
        break;
      }

      case "--include": {
        parsed.include.push(optionValue(argv, ++index, current));
        break;
      }

      case "--config": {
        parsed.configPath = optionValue(argv, ++index, current);
        break;
      }

      case "--dry-run": {
        parsed.dryRun = true;
        break;
      }

      case "--check": {
        parsed.check = true;
        break;
      }

      case "--changed": {
        parsed.changedOnly = true;
        break;
      }

      default: {
        if (current.startsWith("-")) {
          throw new UsageError(`${current} is not an option.`);
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

function usage(): string {
  return `Usage: npm run live-docs:generate -- [options] [glob ...]\n\n` +
    `Writes a Live Doc for each file of the workspace, and the graph index beside them.\n\n` +
    `Options:\n` +
    `  --workspace <path>        The folder to document (default: the current directory).\n` +
    `  --config <file>           The configuration (default: the workspace's .live-docs.config.json\n` +
    `                            when it has one, else the shipped defaults).\n` +
    `  --root <path>             In place of the configuration's root.\n` +
    `  --base-layer <name>       In place of the configuration's baseLayer.\n` +
    `  --extension <suffix>      In place of the configuration's extension (default .md).\n` +
    `  --glob <pattern>          Which files receive docs, in place of the configuration's glob (can\n` +
    `                            repeat); an argument that is not an option is taken as one too.\n` +
    `  --include <pattern>       Write only this file or glob, resolved against the whole workspace (can repeat).\n` +
    `  --dry-run                 Report what would change; write nothing.\n` +
    `  --check                   Exit 1 when docs would be created, changed or deleted; write nothing.\n` +
    `  --changed                 Only the files git reports as changed.\n` +
    `  -v, --version             Print the generator's version.\n` +
    `  -h, --help                Print this help.\n` +
    `\nExamples:\n` +
    `  npm run live-docs:generate\n` +
    `  npm run live-docs:generate -- --dry-run --changed\n` +
    `  npm run live-docs:generate -- --include "scripts/live-docs/*.ts" --dry-run`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.version) {
    console.log(await packageVersion("generator"));
    return;
  }

  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());

  // The file given, else the workspace's own configuration, as every command reads it; without either, the defaults.
  const configInput: LiveDocumentationConfigInput = await readConfiguration(workspaceRoot, args.configPath);

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
    dryRun: args.dryRun || args.check,
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

  const dryRunSuffix = args.check ? " (check)" : args.dryRun ? " (dry-run)" : "";
  console.log(
    `[live-docs] Base layer processed ${layer4Result.processed} file(s)${dryRunSuffix}: ${layer4Counts.created} created, ${layer4Counts.updated} updated, ${layer4Counts.unchanged} unchanged, ${layer4Counts.skipped} skipped, ${layer4Result.deleted} deleted.`
  );

  const createdLayer4Docs = layer4Result.files.filter((record) => record.change === "created");
  const deletedLayer4Docs = layer4Result.deletedFiles;

  const MAX_LISTED = 10;
  const verb = args.dryRun || args.check ? "Would create" : "Created";

  if (createdLayer4Docs.length > 0) {
    const listed = createdLayer4Docs
      .slice(0, MAX_LISTED)
      .map((record) => record.docPath ?? record.sourcePath);
    const remainder = createdLayer4Docs.length - listed.length;
    const suffix = remainder > 0 ? `, +${remainder} more` : "";
    console.log(`[live-docs] ${verb} ${createdLayer4Docs.length} Live Doc(s): ${listed.join(", ")}${suffix}`);
  }

  if (deletedLayer4Docs.length > 0) {
    const listed = deletedLayer4Docs.slice(0, MAX_LISTED);
    const remainder = deletedLayer4Docs.length - listed.length;
    const suffix = remainder > 0 ? `, +${remainder} more` : "";
    const deleteVerb = args.dryRun || args.check ? "Would delete" : "Deleted";
    console.log(`[live-docs] ${deleteVerb} ${deletedLayer4Docs.length} Live Doc(s): ${listed.join(", ")}${suffix}`);
  }

  if (args.check && (layer4Result.written > 0 || layer4Result.deleted > 0)) {
    console.error(`Live Docs differ from source: ${layer4Counts.created} would be created, ${layer4Counts.updated} updated, ${layer4Result.deleted} deleted. Run live-docs:generate and commit the result.`);
    process.exitCode = 1;
  }
}

runCommand("live-docs:generate", main);
