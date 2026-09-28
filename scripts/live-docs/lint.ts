#!/usr/bin/env node
import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { hasMeaningfulAuthoredContent } from "@live-documentation/shared/live-docs/core";
import { LiveDocSyntaxError, authoredBlockOf, parseLiveDoc, type LiveDoc } from "@live-documentation/shared/live-docs/document";
import { deriveLiveDocGraph, type LiveDocGraph } from "@live-documentation/shared/live-docs/graph";

/** Maximum number of islands to display before truncating */
const MAX_ISLAND_DISPLAY = 30;

interface LintIssue {
  file: string;
  message: string;
}

interface LintWarning {
  file: string;
  message: string;
}

interface ParsedArgs {
  help: boolean;
  version: boolean;
  workspace?: string;
  configPath?: string;
  root?: string;
  baseLayer?: string;
  extension?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false
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
      case "--config": {
        parsed.configPath = expectValue(argv, ++index, current);
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
      default: {
        if (current.startsWith("-")) {
          throw new Error(`Unknown option: ${current}`);
        }
        throw new Error(`Unexpected argument: ${current}`);
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
  return [
    "Usage: npm run live-docs:lint -- [options]",
    "",
    "Options:",
    "  --workspace <path>     Workspace root (defaults to current directory).",
    "  --config <file>        Load configuration from JSON file.",
    "  --root <path>          Override liveDocumentation.root.",
    "  --base-layer <name>    Override liveDocumentation.baseLayer.",
    "  --extension <suffix>   Override liveDocumentation.extension.",
    "  --version              Print CLI version.",
    "  --help                 Show this help message."
  ].join("\n");
}

async function readConfigFile(configPath: string): Promise<LiveDocumentationConfigInput> {
  const resolved = path.resolve(configPath);
  const raw = await fs.readFile(resolved, "utf8");
  return JSON.parse(raw) as LiveDocumentationConfigInput;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.version) {
    const version = process.env.LIVE_DOCS_LINT_VERSION ?? "0.1.0";
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

  const config = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    ...configInput
  });

  const docGlob = path.join(
    config.root,
    config.baseLayer,
    "**",
    `*${config.extension}`
  );
  const files = await glob(docGlob, {
    cwd: workspaceRoot,
    absolute: true,
    nodir: true,
    windowsPathsNoEscape: true
  });

  if (files.length === 0) {
    console.log("live-docs:lint — no staged Live Docs found");
    return;
  }

  const issues: LintIssue[] = [];
  const warnings: LintWarning[] = [];
  const docs: Array<{ docPath: string; doc: LiveDoc }> = [];

  await Promise.all(
    files.map(async (absolutePath) => {
      const content = await fs.readFile(absolutePath, "utf8");
      const relativePath = path.relative(workspaceRoot, absolutePath).split(path.sep).join("/");

      const doc = validateStructure(relativePath, content, issues);
      if (doc) {
        docs.push({ docPath: relativePath, doc });
      }
      validateAuthoredSections(relativePath, content, warnings);
      validateRelativeLinks(relativePath, content, issues);
    })
  );

  // The graph is derived only from docs the grammar accepted; a structural failure is reported on its own.
  if (issues.length === 0) {
    validateConnectivity(deriveLiveDocGraph(docs, config), warnings);
  }

  if (warnings.length > 0) {
    console.warn("\nLive Doc lint warnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning.file}: ${warning.message}`);
    }
  }

  if (issues.length > 0) {
    console.error("\nLive Doc lint failures:");
    for (const issue of issues) {
      console.error(`- ${issue.file}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`live-docs:lint — ${files.length} file(s) validated`);
}

/** Parses the doc through the grammar, recording a refusal as an issue. */
function validateStructure(file: string, content: string, issues: LintIssue[]): LiveDoc | undefined {
  try {
    return parseLiveDoc(content);
  } catch (error) {
    if (!(error instanceof LiveDocSyntaxError)) {
      throw error;
    }
    issues.push({ file, message: error.message });
    return undefined;
  }
}

function validateAuthoredSections(
  file: string,
  content: string,
  warnings: LintWarning[]
): void {
  const block = authoredBlockOf(content);

  const missingPieces: string[] = [];

  const purpose = extractSubsection(block, "Purpose");
  if (!purpose) {
    missingPieces.push("Purpose heading missing");
  } else if (!hasMeaningfulSubsection(purpose, [
    "_pending authored purpose_",
    "_pending purpose_",
    "_pending_"
  ])) {
    missingPieces.push("Purpose content pending");
  }

  const notes = extractSubsection(block, "Notes");
  if (!notes) {
    missingPieces.push("Notes heading missing");
  } else if (!hasMeaningfulSubsection(notes, [
    "_pending notes_",
    "_pending_"
  ])) {
    missingPieces.push("Notes content pending");
  }

  if (missingPieces.length > 0) {
    warnings.push({
      file,
      message: `Authored sections missing content: ${missingPieces.join(", ")}`
    });
    return;
  }

  if (!hasMeaningfulAuthoredContent(block)) {
    warnings.push({
      file,
      message: "Authored block still uses placeholder content"
    });
  }
}

function validateRelativeLinks(file: string, content: string, issues: LintIssue[]): void {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(content))) {
    const target = match[1];
    if (target.startsWith("http://") || target.startsWith("https://")) {
      issues.push({
        file,
        message: `contains absolute link (${target})`
      });
    }
    if (/^[a-zA-Z]+:\\/.test(target)) {
      issues.push({
        file,
        message: `contains absolute filesystem link (${target})`
      });
    }
  }
}

/**
 * Validate graph connectivity: detect "islands" (nodes with no dependencies and no dependents).
 * Islands may indicate:
 * - Missing adapter detection for the file's language
 * - Cruft from deleted infrastructure
 * - Truly standalone utility files (rare)
 */
function validateConnectivity(graph: LiveDocGraph, warnings: LintWarning[]): void {
  const islands: string[] = [];

  for (const file of Object.values(graph.files)) {
    if (file.outbound.length === 0 && file.inbound.length === 0) {
      islands.push(file.codePath);
    }
  }

  if (islands.length === 0) {
    return;
  }

  // Group islands by directory prefix for readability
  const byDirectory = new Map<string, string[]>();
  for (const island of islands) {
    const dir = path.dirname(island);
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, []);
    }
    byDirectory.get(dir)!.push(path.basename(island));
  }

  // Sort directories alphabetically
  const sortedDirs = [...byDirectory.keys()].sort();

  // Build grouped output
  let displayedCount = 0;
  const groupedIslands: string[] = [];
  
  for (const dir of sortedDirs) {
    const files = byDirectory.get(dir)!.sort();
    for (const file of files) {
      if (displayedCount >= MAX_ISLAND_DISPLAY) {
        break;
      }
      groupedIslands.push(`${dir}/${file}`);
      displayedCount++;
    }
    if (displayedCount >= MAX_ISLAND_DISPLAY) {
      break;
    }
  }

  const remaining = islands.length - displayedCount;
  const suffix = remaining > 0 ? ` ...and ${remaining} more` : "";

  warnings.push({
    file: "(graph)",
    message: `${islands.length} disconnected node(s) detected (no dependencies and no dependents):\n    - ${groupedIslands.join("\n    - ")}${suffix}`
  });
}

function extractSubsection(block: string, heading: string): string | undefined {
  const regex = new RegExp(`###\\s+${heading}\\s*\r?\n`, "i");
  const match = regex.exec(block);
  if (!match || match.index === undefined) {
    return undefined;
  }

  const start = match.index + match[0].length;
  const remainder = block.slice(start);
  const nextHeading = /\r?\n###\s+/i.exec(remainder);
  const end = nextHeading ? start + nextHeading.index : block.length;

  return block.slice(start, end).trim();
}

function hasMeaningfulSubsection(section: string, placeholders: string[]): boolean {
  const trimmed = section.trim();
  if (!trimmed) {
    return false;
  }

  const normalized = trimmed.toLowerCase();
  for (const placeholder of placeholders) {
    if (normalized === placeholder) {
      return false;
    }
  }

  return true;
}

main().catch((error) => {
  console.error("live-docs:lint failed");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});