#!/usr/bin/env node
/**
 * Technical Debt Detector
 * 
 * Ultra-simple heuristics to flag areas that may need attention:
 * 1. WARN: Code files longer than a threshold (default 1000 lines)
 * 2. INFO: Files not modified in over N days (default 30)
 * 
 * This is intentionally lightweight - it just helps point attention.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// ============================================================================
// Configuration
// ============================================================================

const LINE_THRESHOLD = 1000;
const STALE_DAYS_THRESHOLD = 30;

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts"
]);

const DOC_EXTENSIONS = new Set([
  ".md",
  ".mdmd"
]);

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /dist\//,
  /out\//,
  /coverage\//,
  /\.vscode-test\//,
  /AI-Agent-Workspace\/tmp\//,
  /AI-Agent-Workspace\/ChatHistory\//,
  /AI-Agent-Workspace\/ollama-traces\//,
  /\.live-documentation\//
];

// Files that are known to be large but acceptable
const LARGE_FILE_ALLOWLIST = [
  // Add paths here as needed, e.g.:
  // "packages/scripts/src/live-docs/explorer/client/index.ts"
];

// ============================================================================
// Types
// ============================================================================

interface LargeFileWarning {
  file: string;
  lines: number;
}

interface StaleFileInfo {
  file: string;
  daysSinceEdit: number;
  lastEditDate: string;
}

interface DetectionResult {
  largeFiles: LargeFileWarning[];
  staleFiles: StaleFileInfo[];
}

// ============================================================================
// Main
// ============================================================================

(function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());

  if (!fs.existsSync(workspaceRoot)) {
    console.error(`Workspace not found: ${workspaceRoot}`);
    process.exit(1);
  }

  const result = detectTechnicalDebt(workspaceRoot, args);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    renderHumanReadable(result, args);
  }

  // This script only warns, never fails the pipeline
  process.exit(0);
})();

// ============================================================================
// Detection Logic
// ============================================================================

function detectTechnicalDebt(
  workspaceRoot: string,
  args: ParsedArgs
): DetectionResult {
  const gitFiles = getGitTrackedFiles(workspaceRoot);
  const largeFiles: LargeFileWarning[] = [];
  const staleFiles: StaleFileInfo[] = [];

  const now = Date.now();

  for (const relativePath of gitFiles) {
    if (shouldIgnore(relativePath)) {
      continue;
    }

    const ext = path.extname(relativePath).toLowerCase();
    const fullPath = path.join(workspaceRoot, relativePath);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    // Check for large code files
    if (CODE_EXTENSIONS.has(ext)) {
      const lineCount = countLines(fullPath);
      if (lineCount > LINE_THRESHOLD && !isAllowlisted(relativePath)) {
        largeFiles.push({ file: relativePath, lines: lineCount });
      }
    }

    // Check for stale files (code + docs)
    if (CODE_EXTENSIONS.has(ext) || DOC_EXTENSIONS.has(ext)) {
      if (!args.skipStale) {
        const lastEditDate = getLastCommitDate(workspaceRoot, relativePath);
        if (lastEditDate) {
          const daysSinceEdit = Math.floor((now - lastEditDate.getTime()) / (24 * 60 * 60 * 1000));
          if (daysSinceEdit > STALE_DAYS_THRESHOLD) {
            staleFiles.push({
              file: relativePath,
              daysSinceEdit,
              lastEditDate: lastEditDate.toISOString().split("T")[0]
            });
          }
        }
      }
    }
  }

  // Sort results
  largeFiles.sort((a, b) => b.lines - a.lines);
  staleFiles.sort((a, b) => b.daysSinceEdit - a.daysSinceEdit);

  return { largeFiles, staleFiles };
}

function getGitTrackedFiles(workspaceRoot: string): string[] {
  try {
    const output = execSync("git ls-files", {
      cwd: workspaceRoot,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024
    });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    console.error("Failed to list git-tracked files");
    return [];
  }
}

function getLastCommitDate(workspaceRoot: string, file: string): Date | null {
  try {
    const output = execSync(`git log -1 --format=%cI -- "${file}"`, {
      cwd: workspaceRoot,
      encoding: "utf-8"
    });
    const dateStr = output.trim();
    if (!dateStr) {
      return null;
    }
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

function shouldIgnore(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return IGNORE_PATTERNS.some(pattern => pattern.test(normalized));
}

function isAllowlisted(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return LARGE_FILE_ALLOWLIST.some(allowed => normalized === allowed || normalized.endsWith(allowed));
}

// ============================================================================
// Output
// ============================================================================

function renderHumanReadable(result: DetectionResult, args: ParsedArgs): void {
  const { largeFiles, staleFiles } = result;

  console.log("\n=== Technical Debt Detection ===\n");

  // Large files (warnings)
  if (largeFiles.length > 0) {
    console.log(`⚠️  WARNINGS: ${largeFiles.length} file(s) exceed ${LINE_THRESHOLD} lines\n`);
    for (const { file, lines } of largeFiles) {
      console.log(`   ${lines.toString().padStart(5)} lines  ${file}`);
    }
    console.log();
  } else {
    console.log(`✅ No files exceed ${LINE_THRESHOLD} lines\n`);
  }

  // Stale files (info)
  if (!args.skipStale) {
    if (staleFiles.length > 0) {
      const topStale = args.staleLimit ? staleFiles.slice(0, args.staleLimit) : staleFiles;
      const moreCount = staleFiles.length - topStale.length;

      console.log(`ℹ️  INFO: ${staleFiles.length} file(s) unchanged for ${STALE_DAYS_THRESHOLD}+ days\n`);
      for (const { file, daysSinceEdit, lastEditDate } of topStale) {
        console.log(`   ${daysSinceEdit.toString().padStart(4)} days (${lastEditDate})  ${file}`);
      }
      if (moreCount > 0) {
        console.log(`   ... and ${moreCount} more (use --stale-limit to show more)`);
      }
      console.log();
    } else {
      console.log(`✅ All tracked files have been modified within ${STALE_DAYS_THRESHOLD} days\n`);
    }
  }

  // Summary
  const hasWarnings = largeFiles.length > 0;
  if (hasWarnings) {
    console.log("Consider refactoring large files to improve LLM edit accuracy.\n");
  }
}

// ============================================================================
// CLI
// ============================================================================

interface ParsedArgs {
  help: boolean;
  json: boolean;
  workspace?: string;
  skipStale: boolean;
  staleLimit?: number;
}

function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    help: false,
    json: false,
    skipStale: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--json") {
      result.json = true;
    } else if (arg === "--skip-stale") {
      result.skipStale = true;
    } else if (arg === "--stale-limit") {
      const val = argv[++i];
      result.staleLimit = parseInt(val, 10) || 20;
    } else if (arg === "--workspace") {
      result.workspace = argv[++i];
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
Technical Debt Detector

Usage: npx tsx scripts/analysis/tech-debt-detector.ts [options]

Options:
  --help, -h       Show this help message
  --json           Output results as JSON
  --skip-stale     Skip checking for stale files (faster)
  --stale-limit N  Limit stale file output to top N (default: show all)
  --workspace DIR  Specify workspace root (default: cwd)

Heuristics:
  - WARN: Code files (ts/js) longer than ${LINE_THRESHOLD} lines
  - INFO: Files not edited in ${STALE_DAYS_THRESHOLD}+ days

Exit code is always 0 (informational only).
`);
}
