#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { parseLiveDoc } from "@live-documentation/engine/live-docs/document";

import { optionValue, readConfiguration, runCommand, UsageError, workspaceFolder } from "./cli";

interface CliOptions {
  help: boolean;
  workspace?: string;
  configPath?: string;
  docsRoot?: string;
  baseLayer?: string;
  extension?: string;
  quiet: boolean;
}

interface OrphanRecord {
  docPath: string;
  expectedCodePath: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    quiet: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "-h":
      case "--help": {
        options.help = true;
        break;
      }

      case "--workspace": {
        options.workspace = optionValue(argv, ++index, arg);
        break;
      }

      case "--config": {
        options.configPath = optionValue(argv, ++index, arg);
        break;
      }

      case "--extension": {
        options.extension = optionValue(argv, ++index, arg);
        break;
      }

      case "--root":
      case "--docs-root": {
        options.docsRoot = optionValue(argv, ++index, arg);
        break;
      }

      case "--base-layer": {
        options.baseLayer = optionValue(argv, ++index, arg);
        break;
      }

      case "--quiet": {
        options.quiet = true;
        break;
      }

      default: {
        throw new UsageError(arg.startsWith("-") ? `${arg} is not an option.` : `${arg} is not an option; the command takes no paths.`);
      }
    }
  }

  return options;
}

function usage(): string {
  return "Usage: npm run live-docs:orphans -- [options]\n\n" +
    "Lists the Live Docs whose source file no longer exists, and exits 1 when there is one.\n" +
    "The docs are where the workspace's configuration puts them, its root, baseLayer and extension.\n\n" +
    "Options:\n" +
    "  --workspace <path>    Workspace root (default: the nearest folder, from the current directory up, that\n" +
    "                        holds a .live-docs.config.json; else the current directory).\n" +
    "  --config <file>       The configuration (default: the workspace's .live-docs.config.json when it\n" +
    "                        has one, else the shipped defaults).\n" +
    "  --root <path>         In place of the configuration's root (also --docs-root).\n" +
    "  --base-layer <name>   In place of the configuration's baseLayer.\n" +
    "  --extension <suffix>  In place of the configuration's extension.\n" +
    "  --quiet               Print nothing when there is no orphan.\n" +
    "  -h, --help            Print this help.";
}

async function collectLiveDocFiles(root: string, extension: string): Promise<string[]> {
  const results: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(extension)) {
        results.push(fullPath);
      }
    }
  }

  await walk(root);
  return results;
}

/**
 * The source file a Live Doc documents, as the doc grammar's own reader reads it, so that a code path the writer
 * writes in its quoted form reads back as the path and not as the quotes. For a doc the reader refuses, its
 * `- Code Path:` line by pattern, in the code span the writer writes it in since 2026-11-19 or bare as before;
 * `undefined` for a doc with neither, or one that cannot be opened, which the caller maps from the doc's place instead.
 */
async function extractCodePath(liveDocPath: string): Promise<string | undefined> {
  let content: string;
  try {
    content = await fs.readFile(liveDocPath, { encoding: "utf8" });
  } catch {
    return undefined;
  }
  try {
    return parseLiveDoc(content).codePath;
  } catch {
    const match = content.match(/^\s*-\s*Code Path:\s*`([^`]+)`\s*$/m) ?? content.match(/^\s*-\s*Code Path:\s*(.+)$/m);
    return match?.[1].trim();
  }
}

async function pathExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function findOrphans(options: CliOptions): Promise<OrphanRecord[]> {
  const workspaceRoot = workspaceFolder(options.workspace);
  // The configuration's root, base layer and extension, as every other command reads them (until 2026-11-22 this
  // command read .live-documentation/source unless told, and the npm script told it this repository's .mdmd/layer-4).
  const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...(await readConfiguration(workspaceRoot, options.configPath)),
    ...(options.docsRoot ? { root: options.docsRoot } : {}), ...(options.baseLayer ? { baseLayer: options.baseLayer } : {}), ...(options.extension ? { extension: options.extension } : {}) });
  const baseLayerPath = path.resolve(workspaceRoot, config.root, config.baseLayer);

  const stats = await fs.stat(baseLayerPath).catch(() => undefined);
  if (!stats || !stats.isDirectory()) {
    throw new Error(`Live documentation layer not found: ${baseLayerPath}`);
  }

  const liveDocs = await collectLiveDocFiles(baseLayerPath, config.extension);
  const orphans: OrphanRecord[] = [];

  for (const liveDoc of liveDocs) {
    const relativeDoc = path.relative(baseLayerPath, liveDoc);
    const codePathFromMetadata = await extractCodePath(liveDoc);

    let expectedCodePath = codePathFromMetadata ?? relativeDoc;
    if (expectedCodePath.endsWith(config.extension)) {
      expectedCodePath = expectedCodePath.slice(0, -config.extension.length);
    }

    const absoluteTarget = path.resolve(workspaceRoot, expectedCodePath);
    if (!(await pathExists(absoluteTarget))) {
      orphans.push({
        docPath: path.relative(workspaceRoot, liveDoc).replace(/\\/g, "/"),
        expectedCodePath: expectedCodePath.replace(/\\/g, "/")
      });
    }
  }

  return orphans;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage());
    return;
  }

  const orphans = await findOrphans(options);

  if (orphans.length === 0) {
    if (!options.quiet) {
      console.log("No orphan live documentation files found.");
    }
    return;
  }

  console.error(`Found ${orphans.length} orphan live documentation file(s):`);
  for (const orphan of orphans) {
    console.error(` - ${orphan.docPath} (expected code path: ${orphan.expectedCodePath})`);
  }
  process.exitCode = 1;
}

runCommand("live-docs:orphans", main);
