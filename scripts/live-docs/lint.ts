#!/usr/bin/env node
import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfigInput,
  type LiveDocumentationEvidenceStrictMode
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { hasMeaningfulAuthoredContent } from "@live-documentation/shared/live-docs/core";

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

function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAuthoredContentIgnorePatterns(configRoot: string, baseLayer: string): RegExp[] {
  const root = configRoot.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  const layer = baseLayer.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  const prefix = `${escapeRegexLiteral(root)}/${escapeRegexLiteral(layer)}`;
  return [new RegExp(`^${prefix}/tests/integration/dist/`)];
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
  const authoredContentIgnorePatterns = buildAuthoredContentIgnorePatterns(
    config.root,
    config.baseLayer
  );

  await Promise.all(
    files.map(async (absolutePath) => {
      const content = await fs.readFile(absolutePath, "utf8");
      const relativePath = path.relative(workspaceRoot, absolutePath).split(path.sep).join("/");

      validateStructure(relativePath, content, issues);
      validateAuthoredSections(relativePath, content, warnings, authoredContentIgnorePatterns);

      const archetype = detectArchetype(content);
      if (archetype === "implementation") {
        validateImplementationEvidence(
          relativePath,
          content,
          warnings,
          issues,
          config.evidence.strict
        );
      } else if (archetype === "test") {
        validateTestLinks(relativePath, content, warnings);
      }

      validateRelativeLinks(relativePath, content, issues);
    })
  );

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

function validateStructure(file: string, content: string, issues: LintIssue[]): void {
  const requiredHeadings = ["## Metadata", "## Authored", "## Generated"];
  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) {
      issues.push({
        file,
        message: `missing required heading: ${heading}`
      });
    }
  }

  const requiredSections = ["Public Symbols", "Dependencies"];
  for (const section of requiredSections) {
    if (!hasSection(content, section)) {
      issues.push({
        file,
        message: `missing generated section markers for ${section}`
      });
    }
  }
}

function validateAuthoredSections(
  file: string,
  content: string,
  warnings: LintWarning[],
  ignorePatterns: RegExp[]
): void {
  if (shouldIgnoreAuthoredContentWarning(file, ignorePatterns)) {
    return;
  }
  const block = extractAuthoredBlock(content);
  if (!block) {
    return;
  }

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

function shouldIgnoreAuthoredContentWarning(file: string, ignorePatterns: RegExp[]): boolean {
  return ignorePatterns.some(pattern => pattern.test(file));
}

function validateImplementationEvidence(
  file: string,
  content: string,
  warnings: LintWarning[],
  issues: LintIssue[],
  strictMode: LiveDocumentationEvidenceStrictMode
): void {
  const observedEvidenceExists = hasSection(content, "Observed Evidence");
  if (!observedEvidenceExists) {
    return;
  }

  const block = extractSection(content, "Observed Evidence");
  const trimmed = block.trim();
  if (!trimmed) {
    reportEvidenceProblem(
      file,
      "Observed Evidence block empty",
      strictMode,
      warnings,
      issues
    );
    return;
  }

  const waiverMatch = trimmed.match(/^<!--\s*evidence-waived[^>]*-->/i);
  const hasWaiver = Boolean(waiverMatch);
  const remainder = hasWaiver ? trimmed.slice(waiverMatch![0].length).trim() : trimmed;

  const lines = remainder.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const hasDefaultMessage = lines.some((line) =>
    line.toLowerCase().includes("_no automated evidence found_")
  );
  const hasBullet = lines.some((line) => line.startsWith("- "));
  const hasEvidenceEntries = hasBullet || (!hasDefaultMessage && lines.length > 0);

  if (!hasEvidenceEntries) {
    if (hasWaiver) {
      if (!hasDefaultMessage) {
        warnings.push({
          file,
          message: "Evidence waiver present but default message missing"
        });
      }
      return;
    }

    reportEvidenceProblem(
      file,
      "Observed Evidence contains no automated evidence and lacks a waiver comment",
      strictMode,
      warnings,
      issues
    );
    return;
  }

  if (hasDefaultMessage && !hasWaiver) {
    reportEvidenceProblem(
      file,
      "Observed Evidence indicates no automated evidence but is missing an evidence waiver comment",
      strictMode,
      warnings,
      issues
    );
  }

  if (hasWaiver && hasEvidenceEntries && !hasDefaultMessage) {
    warnings.push({
      file,
      message: "Evidence waiver present despite recorded evidence entries"
    });
  }

  if (!hasBullet && !hasDefaultMessage) {
    warnings.push({
      file,
      message: "Observed Evidence should enumerate tests as bullet list items"
    });
  }
}

function reportEvidenceProblem(
  file: string,
  message: string,
  strictMode: LiveDocumentationEvidenceStrictMode,
  warnings: LintWarning[],
  issues: LintIssue[]
): void {
  if (strictMode === "off") {
    return;
  }

  if (strictMode === "error") {
    issues.push({ file, message });
    return;
  }

  warnings.push({ file, message });
}

function validateTestLinks(file: string, content: string, warnings: LintWarning[]): void {
  if (!hasSection(content, "Targets")) {
    warnings.push({
      file,
      message: "Targets block missing"
    });
  }
  if (!hasSection(content, "Supporting Fixtures")) {
    warnings.push({
      file,
      message: "Supporting Fixtures block missing"
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

function hasSection(content: string, section: string): boolean {
  const begin = `<!-- LIVE-DOC:BEGIN ${section} -->`;
  const end = `<!-- LIVE-DOC:END ${section} -->`;
  return content.includes(begin) && content.includes(end);
}

function extractSection(content: string, section: string): string {
  const begin = `<!-- LIVE-DOC:BEGIN ${section} -->`;
  const end = `<!-- LIVE-DOC:END ${section} -->`;
  const startIndex = content.indexOf(begin);
  const endIndex = content.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return "";
  }
  return content.slice(startIndex + begin.length, endIndex).trim();
}

function detectArchetype(content: string): string {
  const match = content.match(/-\s+Archetype:\s+(\w+)/);
  if (match) {
    return match[1].toLowerCase();
  }
  return "implementation";
}

function extractAuthoredBlock(content: string): string | undefined {
  const headingRegex = /^##\s+Authored\s*$/m;
  const headingMatch = headingRegex.exec(content);
  if (!headingMatch || headingMatch.index === undefined) {
    return undefined;
  }

  const afterHeadingIndex = content.indexOf("\n", headingMatch.index + headingMatch[0].length);
  if (afterHeadingIndex === -1) {
    return undefined;
  }

  const startIndex = afterHeadingIndex + 1;
  const remainder = content.slice(startIndex);
  const nextHeadingMatch = /\r?\n##\s+/m.exec(remainder);
  const endIndex = nextHeadingMatch ? startIndex + nextHeadingMatch.index : content.length;

  return content.slice(startIndex, endIndex).trim();
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