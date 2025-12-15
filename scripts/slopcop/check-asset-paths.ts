#!/usr/bin/env node
import { globSync } from "glob";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  compileIgnorePatterns,
  loadSlopcopConfig,
  resolveIgnoreGlobs,
  resolveIncludeGlobs,
  resolveRootDirectories
} from "./config";
import {
  findBrokenAssetReferences,
  type AssetReferenceIssue
} from "../../packages/shared/src/tooling/assetPaths";

interface ParsedArgs {
  helpRequested: boolean;
  jsonOutput: boolean;
  workspace?: string;
  config?: string;
}

interface GroupedIssues {
  group: string;
  entries: AssetReferenceIssue[];
}

const EXIT_SUCCESS = 0;
const EXIT_BROKEN_REFERENCES = 3;
const EXIT_FAILURE = 4;

const DEFAULT_IGNORE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.vscode-test/**",
  "**/coverage/**",
  "**/dist/**",
  "**/out/**",
  "**/.live-documentation/**",
  "**/AI-Agent-Workspace/ChatHistory/**"
];

const DEFAULT_PATTERNS = ["**/*.html", "**/*.htm", "**/*.css", "**/*.scss", "**/*.sass"];

(async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.helpRequested) {
      printHelp();
      process.exit(EXIT_SUCCESS);
    }

    const workspaceRoot = path.resolve(args.workspace ?? process.cwd());
    if (!fs.existsSync(workspaceRoot) || !fs.statSync(workspaceRoot).isDirectory()) {
      console.error(`Workspace directory not found: ${workspaceRoot}`);
      process.exit(EXIT_FAILURE);
    }
    const configPath = args.config ? path.resolve(args.config) : undefined;
    const config = loadSlopcopConfig(workspaceRoot, configPath);
    const ignoreGlobs = resolveIgnoreGlobs(config, "assets", DEFAULT_IGNORE);
    const includeGlobs = resolveIncludeGlobs(config, "assets", DEFAULT_PATTERNS);
    const ignoreTargetPatterns = compileIgnorePatterns(config, "assets");
    const rootDirectories = resolveRootDirectories(config, "assets").map((entry) =>
      path.isAbsolute(entry) ? entry : path.resolve(workspaceRoot, entry)
    );

    const files = collectAssetFiles(workspaceRoot, includeGlobs, ignoreGlobs);
    const issues = files.flatMap((file) =>
      findBrokenAssetReferences(file, {
        workspaceRoot,
        ignoreTargetPatterns,
        assetRootDirectories: rootDirectories
      })
    );

    const result = {
      scannedFiles: files.length,
      issues: issues.map((issue) => ({
        ...issue,
        file: toRelative(issue.file, workspaceRoot)
      }))
    };

    if (args.jsonOutput) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      renderHumanReadable(result);
    }

    process.exit(result.issues.length === 0 ? EXIT_SUCCESS : EXIT_BROKEN_REFERENCES);
  } catch (error) {
    console.error("SlopCop asset audit failed.");
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(EXIT_FAILURE);
  }
})();

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    helpRequested: false,
    jsonOutput: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    switch (token) {
      case "-h":
      case "--help":
        parsed.helpRequested = true;
        break;
      case "--json":
        parsed.jsonOutput = true;
        break;
      case "--workspace": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--workspace requires a path argument");
        }
        parsed.workspace = next;
        index += 1;
        break;
      }
      case "--config": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--config requires a path argument");
        }
        parsed.config = next;
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return parsed;
}

function collectAssetFiles(
  workspaceRoot: string,
  patterns: string[],
  ignoreGlobs: string[]
): string[] {
  const discovered = new Set<string>();

  for (const pattern of patterns) {
    const matches = globSync(pattern, {
      cwd: workspaceRoot,
      ignore: ignoreGlobs,
      nodir: true,
      dot: true
    });

    for (const match of matches) {
      discovered.add(path.resolve(workspaceRoot, match));
    }
  }

  return Array.from(discovered).sort();
}

function toRelative(filePath: string, workspaceRoot: string): string {
  return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
}

function renderHumanReadable(result: { scannedFiles: number; issues: AssetReferenceIssue[] }): void {
  console.log("SlopCop Asset Reference Audit");
  console.log(`  Scanned files: ${result.scannedFiles}`);
  console.log(`  Broken references: ${result.issues.length}`);

  if (result.issues.length === 0) {
    console.log("  ✔ No broken asset references detected");
    return;
  }

  const grouped = groupIssues(result.issues);
  for (const bucket of grouped) {
    console.log(`  ${bucket.group} (${bucket.entries.length})`);
    for (const entry of bucket.entries) {
      const attributeSuffix = entry.attribute ? ` via ${entry.attribute}` : "";
      console.log(
        `    - ${entry.file}:${entry.line}:${entry.column}${attributeSuffix} -> ${entry.target}`
      );
    }
  }
}

function groupIssues(issues: AssetReferenceIssue[]): GroupedIssues[] {
  const buckets = new Map<string, AssetReferenceIssue[]>();

  for (const issue of issues) {
    const segments = issue.file.split("/");
    const group = segments.length > 1 ? segments[0] : ".";
    const bucket = buckets.get(group);
    if (bucket) {
      bucket.push(issue);
    } else {
      buckets.set(group, [issue]);
    }
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, entries]) => ({
      group,
      entries: entries.sort((left, right) => {
        if (left.file === right.file) {
          return left.line - right.line || left.column - right.column;
        }
        return left.file.localeCompare(right.file);
      })
    }));
}

function printHelp(): void {
  console.log(
    "Usage: slopcop-assets [options]\n\n" +
      "Options:\n" +
      "  --json            Emit JSON instead of human-readable output\n" +
      "  --workspace PATH  Override the workspace root (defaults to CWD)\n" +
      "  --config PATH     Explicit slopcop.config.json to load\n" +
      "  -h, --help        Show this help message"
  );
}
