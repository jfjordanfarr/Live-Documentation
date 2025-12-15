#!/usr/bin/env node
import { globSync } from "glob";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  compileIgnorePatterns,
  loadSlopcopConfig,
  resolveIgnoreGlobs,
  resolveIncludeGlobs
} from "./config";
import {
  findBrokenMarkdownLinks,
  type MarkdownLinkIssue
} from "../../packages/shared/src/tooling/markdownLinks";

interface ParsedArgs {
  helpRequested: boolean;
  jsonOutput: boolean;
  workspace?: string;
  config?: string;
}

interface GroupedIssues {
  group: string;
  entries: MarkdownLinkIssue[];
}

const EXIT_SUCCESS = 0;
const EXIT_BROKEN_LINKS = 3;
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

const DEFAULT_PATTERNS = ["**/*.md", "**/*.mdmd", "**/README", "**/README.md"];

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
    const ignoreGlobs = resolveIgnoreGlobs(config, "markdown", DEFAULT_IGNORE);
    const patterns = resolveIncludeGlobs(config, "markdown", DEFAULT_PATTERNS);
    const ignoreTargetPatterns = compileIgnorePatterns(config, "markdown");

    const files = collectMarkdownFiles(workspaceRoot, patterns, ignoreGlobs);
    const issues = files.flatMap(file =>
      findBrokenMarkdownLinks(file, {
        workspaceRoot,
        ignoreTargetPatterns
      })
    );

    const result = {
      scannedFiles: files.length,
      issues: issues.map(issue => ({
        ...issue,
        file: toRelative(issue.file, workspaceRoot)
      }))
    };

    if (args.jsonOutput) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      renderHumanReadable(result);
    }

    process.exit(result.issues.length === 0 ? EXIT_SUCCESS : EXIT_BROKEN_LINKS);
  } catch (error) {
    console.error("SlopCop markdown audit failed.");
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

function collectMarkdownFiles(
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
      const absolute = path.resolve(workspaceRoot, match);
      discovered.add(absolute);
    }
  }

  return Array.from(discovered).sort();
}

function toRelative(filePath: string, workspaceRoot: string): string {
  return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
}

function renderHumanReadable(result: { scannedFiles: number; issues: MarkdownLinkIssue[] }): void {
  console.log("SlopCop Markdown Link Audit");
  console.log(`  Scanned files: ${result.scannedFiles}`);
  console.log(`  Broken links: ${result.issues.length}`);

  if (result.issues.length === 0) {
    console.log("  ✔ No broken links detected");
    return;
  }

  const grouped = groupIssues(result.issues);

  for (const bucket of grouped) {
    console.log(`  ${bucket.group} (${bucket.entries.length})`);
    for (const entry of bucket.entries) {
      const relativeFile = entry.file;
      console.log(
        `    - ${relativeFile}:${entry.line}:${entry.column} -> ${entry.target}`
      );
    }
  }
}

function groupIssues(issues: MarkdownLinkIssue[]): GroupedIssues[] {
  const buckets = new Map<string, MarkdownLinkIssue[]>();

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
    "Usage: slopcop-markdown [options]\n\n" +
      "Options:\n" +
      "  --json            Emit JSON instead of human-readable output\n" +
      "  --workspace PATH  Override the workspace root (defaults to CWD)\n" +
      "  --config PATH     Explicit slopcop.config.json to load\n" +
      "  -h, --help        Show this help message"
  );
}

