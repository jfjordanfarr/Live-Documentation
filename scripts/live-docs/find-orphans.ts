#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { LIVE_DOCUMENTATION_FILE_EXTENSION } from "@live-documentation/engine/config/liveDocumentationConfig";

interface CliOptions {
  help: boolean;
  workspace: string;
  docsRoot: string;
  baseLayer: string;
  quiet: boolean;
}

interface OrphanRecord {
  docPath: string;
  expectedCodePath: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    workspace: process.cwd(),
    docsRoot: ".live-documentation",
    baseLayer: "source",
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
        options.workspace = expectValue(argv, ++index, arg);
        break;
      }

      case "--docs-root": {
        options.docsRoot = expectValue(argv, ++index, arg);
        break;
      }

      case "--base-layer": {
        options.baseLayer = expectValue(argv, ++index, arg);
        break;
      }

      case "--quiet": {
        options.quiet = true;
        break;
      }

      default: {
        if (arg.startsWith("-")) {
          throw new Error(`Unknown option: ${arg}`);
        }

        // Bare arguments are not supported for now; reserve for future filters.
        throw new Error(`Unexpected argument: ${arg}`);
      }
    }
  }

  return options;
}

function expectValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`Option ${flag} requires a value.`);
  }
  return value;
}

function usage(): string {
  return "Usage: tsx scripts/live-docs/find-orphans.ts [options]\n\n" +
    "Options:\n" +
    "  --workspace <path>    Workspace root (default: current directory).\n" +
    "  --docs-root <path>    Relative path to the live documentation mirror (default: .live-documentation).\n" +
    "  --base-layer <name>   Base layer folder to scan (default: source).\n" +
    "  --quiet               Suppress success output (still prints orphans).\n" +
    "  --help                Show this help message.\n";
}

async function collectLiveDocFiles(root: string): Promise<string[]> {
  const results: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(LIVE_DOCUMENTATION_FILE_EXTENSION)) {
        results.push(fullPath);
      }
    }
  }

  await walk(root);
  return results;
}

async function extractCodePath(liveDocPath: string): Promise<string | undefined> {
  try {
    const content = await fs.readFile(liveDocPath, { encoding: "utf8" });
    const match = content.match(/^\s*-\s*Code Path:\s*(.+)$/m);
    if (match) {
      return match[1].trim();
    }
  } catch {
    // Ignore unreadable files; caller will handle via fallback mapping.
  }
  return undefined;
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
  const workspaceRoot = path.resolve(options.workspace);
  const docsRoot = path.resolve(workspaceRoot, options.docsRoot);
  const baseLayerPath = path.join(docsRoot, options.baseLayer);

  const stats = await fs.stat(baseLayerPath).catch(() => undefined);
  if (!stats || !stats.isDirectory()) {
    throw new Error(`Live documentation layer not found: ${baseLayerPath}`);
  }

  const liveDocs = await collectLiveDocFiles(baseLayerPath);
  const orphans: OrphanRecord[] = [];

  for (const liveDoc of liveDocs) {
    const relativeDoc = path.relative(baseLayerPath, liveDoc);
    const codePathFromMetadata = await extractCodePath(liveDoc);

    let expectedCodePath = codePathFromMetadata ?? relativeDoc;
    if (expectedCodePath.endsWith(LIVE_DOCUMENTATION_FILE_EXTENSION)) {
      expectedCodePath = expectedCodePath.slice(0, -LIVE_DOCUMENTATION_FILE_EXTENSION.length);
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
  try {
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
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void main();
