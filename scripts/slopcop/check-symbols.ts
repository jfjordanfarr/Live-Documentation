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
  type SlopcopSymbolConfig
} from "./config";
import {
  findSymbolReferenceAnomalies,
  type SymbolReferenceIssue,
  type SymbolRuleSetting
} from "../../packages/shared/src/tooling/symbolReferences";

interface ParsedArgs {
  helpRequested: boolean;
  jsonOutput: boolean;
  workspace?: string;
  config?: string;
}

interface RenderableIssue {
  kind: SymbolReferenceIssue["kind"];
  severity: SymbolReferenceIssue["severity"];
  file: string;
  line: number;
  column: number;
  slug: string;
  message: string;
  targetFile?: string;
  target?: string;
}

const EXIT_SUCCESS = 0;
const EXIT_SYMBOL_ISSUES = 3;
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
    const symbolConfig = config.symbols;
    if (!isSymbolAuditEnabled(symbolConfig)) {
      if (args.jsonOutput) {
        process.stdout.write(
          `${JSON.stringify({ scannedFiles: 0, issues: [], skipped: true }, null, 2)}\n`
        );
      } else {
        console.log("SlopCop Symbol Audit");
        console.log("  Skipped — symbol audit disabled in slopcop.config.json");
      }
      process.exit(EXIT_SUCCESS);
    }

    const ignoreGlobs = resolveIgnoreGlobs(config, "symbols", DEFAULT_IGNORE);
    const patterns = resolveIncludeGlobs(config, "symbols", DEFAULT_PATTERNS);
    const ignoreSlugPatterns = compileIgnorePatterns(config, "symbols");

    const files = collectMarkdownFiles(workspaceRoot, patterns, ignoreGlobs);
    const issues = findSymbolReferenceAnomalies({
      workspaceRoot,
      files,
      ignoreSlugPatterns,
      duplicateHeading: toRuleSetting(symbolConfig?.duplicateHeadingSeverity, "warn"),
      missingAnchor: toRuleSetting(symbolConfig?.missingAnchorSeverity, "error")
    });

    const renderable: RenderableIssue[] = issues.map((issue) => ({
      kind: issue.kind,
      severity: issue.severity,
      file: toRelative(issue.file, workspaceRoot),
      line: issue.line,
      column: issue.column,
      slug: issue.slug,
      message: issue.message,
      targetFile: issue.targetFile ? toRelative(issue.targetFile, workspaceRoot) : undefined,
      target: issue.target
    }));

    const result = {
      scannedFiles: files.length,
      issues: renderable
    };

    if (args.jsonOutput) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      renderHumanReadable(result);
    }

    process.exit(renderable.length === 0 ? EXIT_SUCCESS : EXIT_SYMBOL_ISSUES);
  } catch (error) {
    console.error("SlopCop symbol audit failed.");
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

function isSymbolAuditEnabled(config: SlopcopSymbolConfig | undefined): boolean {
  return config?.enabled === true;
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

function renderHumanReadable(result: { scannedFiles: number; issues: RenderableIssue[] }): void {
  console.log("SlopCop Symbol Audit");
  console.log(`  Scanned files: ${result.scannedFiles}`);
  console.log(`  Issues: ${result.issues.length}`);

  if (result.issues.length === 0) {
    console.log("  ✔ No symbol issues detected");
    return;
  }

  const grouped = groupIssues(result.issues);
  for (const bucket of grouped) {
    console.log(`  ${bucket.group} (${bucket.entries.length})`);
    for (const entry of bucket.entries) {
      const target = entry.targetFile ? ` -> ${entry.targetFile}` : "";
      console.log(
        `    - [${entry.severity}] ${entry.file}:${entry.line}:${entry.column} #${entry.slug}${target}`
      );
      console.log(`      ${entry.message}`);
    }
  }
}

function groupIssues(issues: RenderableIssue[]): Array<{ group: string; entries: RenderableIssue[] }> {
  const buckets = new Map<string, RenderableIssue[]>();

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
          if (left.line === right.line) {
            return left.column - right.column;
          }
          return left.line - right.line;
        }
        return left.file.localeCompare(right.file);
      })
    }));
}

function toRuleSetting(value: SymbolRuleSetting | undefined, fallback: SymbolRuleSetting): SymbolRuleSetting {
  if (!value) {
    return fallback;
  }
  return value;
}

function printHelp(): void {
  console.log(
    `Usage: slopcop-symbols [options]\n\n` +
      "Options:\n" +
      "  --json            Emit JSON instead of human-readable output\n" +
      "  --workspace PATH  Override the workspace root (defaults to CWD)\n" +
      "  --config PATH     Explicit slopcop.config.json to load\n" +
      "  -h, --help        Show this help message"
  );
}
