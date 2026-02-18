#!/usr/bin/env node
// Live Documentation: .mdmd/layer-4/tooling/documentationLinkCli.mdmd.md#implementation-surface
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_RULES,
  runDocumentationLinkEnforcement,
  type DocumentationLinkEnforcementResult,
  type DocumentationLinkViolation,
  type DocumentationRule
} from "../../packages/shared/src/tooling/documentationLinks";
import { normalizeWorkspacePath } from "../../packages/shared/src/tooling/pathUtils";

interface ParsedArgs {
  helpRequested: boolean;
  jsonOutput: boolean;
  workspace?: string;
  fix: boolean;
  include: string[];
  configPath?: string;
  labelOverride?: string;
  docGlobs: string[];
  codeGlobs: string[];
}

const EXIT_SUCCESS = 0;
const EXIT_VIOLATIONS = 3;
const EXIT_FAILURE = 4;

/** Numeric exit codes used by the documentation-link enforcement CLI. */
export const EXIT_CODES = {
  SUCCESS: EXIT_SUCCESS,
  VIOLATIONS: EXIT_VIOLATIONS,
  FAILURE: EXIT_FAILURE
} as const;

/**
 * CLI entry point for the documentation-link enforcement tool.
 *
 * Parses arguments, discovers workspace rules, runs
 * {@link runDocumentationLinkEnforcement}, and renders results to stdout.
 *
 * @returns Numeric exit code: `0` on success, `3` when violations are found,
 *          `4` on unexpected failure.
 */
export async function runCli(argv: string[]): Promise<number> {
  try {
    const args = parseArgs(argv);

    if (args.helpRequested) {
      printHelp();
      return EXIT_SUCCESS;
    }

    const workspaceRoot = path.resolve(args.workspace ?? process.cwd());
    validateWorkspace(workspaceRoot);

    const includeList = resolveIncludeList(args.include, workspaceRoot);
    const rules = resolveRules(args, workspaceRoot);

    const result = runDocumentationLinkEnforcement({
      workspaceRoot,
      fix: args.fix,
      includeList: includeList.length > 0 ? includeList : undefined,
      rules
    });

    renderResult(result, args.jsonOutput, args.fix);
    return result.violations.length === 0 ? EXIT_SUCCESS : EXIT_VIOLATIONS;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error", error);
    }
    return EXIT_FAILURE;
  }
}

if (typeof require !== "undefined" && require.main === module) {
  void runCli(process.argv.slice(2)).then((exitCode) => {
    process.exit(exitCode);
  });
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    helpRequested: false,
    jsonOutput: false,
    fix: false,
    include: [],
    docGlobs: [],
    codeGlobs: []
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
      case "--no-json":
        parsed.jsonOutput = false;
        break;
      case "--fix":
        parsed.fix = true;
        break;
      case "--no-fix":
        parsed.fix = false;
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
      case "--include": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--include requires a path argument");
        }
        parsed.include.push(next);
        index += 1;
        break;
      }
      case "--config": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--config requires a path argument");
        }
        parsed.configPath = next;
        index += 1;
        break;
      }
      case "--label": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--label requires a value");
        }
        parsed.labelOverride = next;
        index += 1;
        break;
      }
      case "--doc-glob": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--doc-glob requires a pattern");
        }
        parsed.docGlobs.push(next);
        index += 1;
        break;
      }
      case "--code-glob": {
        const next = argv[index + 1];
        if (!next) {
          throw new Error("--code-glob requires a pattern");
        }
        parsed.codeGlobs.push(next);
        index += 1;
        break;
      }
      default:
        if (token.startsWith("--workspace=")) {
          const [, value] = token.split("=", 2);
          if (!value) {
            throw new Error("--workspace requires a path argument");
          }
          parsed.workspace = value;
          break;
        }

        if (token.startsWith("--include=")) {
          const [, value] = token.split("=", 2);
          if (!value) {
            throw new Error("--include requires a path argument");
          }
          parsed.include.push(value);
          break;
        }

        if (token.startsWith("--config=")) {
          const [, value] = token.split("=", 2);
          if (!value) {
            throw new Error("--config requires a path argument");
          }
          parsed.configPath = value;
          break;
        }

        if (token.startsWith("--label=")) {
          const [, value] = token.split("=", 2);
          if (!value) {
            throw new Error("--label requires a value");
          }
          parsed.labelOverride = value;
          break;
        }

        if (token.startsWith("--doc-glob=")) {
          const [, value] = token.split("=", 2);
          if (!value) {
            throw new Error("--doc-glob requires a pattern");
          }
          parsed.docGlobs.push(value);
          break;
        }

        if (token.startsWith("--code-glob=")) {
          const [, value] = token.split("=", 2);
          if (!value) {
            throw new Error("--code-glob requires a pattern");
          }
          parsed.codeGlobs.push(value);
          break;
        }

        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return parsed;
}

function resolveIncludeList(paths: string[], workspaceRoot: string): string[] {
  return paths.flatMap((entry) => {
    const segments = entry.split(",").map((segment) => segment.trim()).filter(Boolean);
    return segments.map((segment) => toWorkspaceRelative(segment, workspaceRoot));
  });
}

function resolveRules(args: ParsedArgs, workspaceRoot: string): DocumentationRule[] | undefined {
  if (args.configPath) {
    const configPath = toAbsolutePath(args.configPath, workspaceRoot);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    const payload = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (!Array.isArray(payload)) {
      throw new Error("Configuration file must export an array of rules");
    }

    const rules: DocumentationRule[] = payload.map((entry, index) => validateRule(entry, index, configPath));
    if (rules.length === 0) {
      throw new Error("Configuration file did not provide any documentation rules");
    }
    return rules;
  }

  if (args.docGlobs.length || args.codeGlobs.length || args.labelOverride) {
    const baseRule = DEFAULT_RULES[0];
    return [
      {
        label: args.labelOverride ?? baseRule.label,
        docGlobs: args.docGlobs.length ? args.docGlobs : baseRule.docGlobs,
        codeGlobs: args.codeGlobs.length ? args.codeGlobs : baseRule.codeGlobs
      }
    ];
  }

  return undefined;
}

function validateRule(value: unknown, index: number, source: string): DocumentationRule {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Rule #${index} in ${source} must be an object`);
  }

  const candidate = value as Partial<DocumentationRule>;
  if (!candidate.label || typeof candidate.label !== "string") {
    throw new Error(`Rule #${index} in ${source} is missing a string label`);
  }

  if (!Array.isArray(candidate.docGlobs) || candidate.docGlobs.length === 0) {
    throw new Error(`Rule #${index} in ${source} must provide docGlobs as a non-empty array`);
  }

  if (!Array.isArray(candidate.codeGlobs) || candidate.codeGlobs.length === 0) {
    throw new Error(`Rule #${index} in ${source} must provide codeGlobs as a non-empty array`);
  }

  if (!candidate.codeGlobs.every((entry) => typeof entry === "string") || !candidate.docGlobs.every((entry) => typeof entry === "string")) {
    throw new Error(`Rule #${index} in ${source} must express docGlobs and codeGlobs as strings`);
  }

  return {
    label: candidate.label,
    docGlobs: candidate.docGlobs,
    codeGlobs: candidate.codeGlobs
  };
}

function toWorkspaceRelative(candidate: string, workspaceRoot: string): string {
  const absolute = path.isAbsolute(candidate)
    ? candidate
    : path.resolve(workspaceRoot, candidate);

  const relative = path.relative(workspaceRoot, absolute);
  if (!relative || relative.startsWith("..")) {
    throw new Error(`Included path ${candidate} is outside the workspace root`);
  }

  return normalizeWorkspacePath(relative);
}

function toAbsolutePath(candidate: string, workspaceRoot: string): string {
  return path.isAbsolute(candidate)
    ? candidate
    : path.resolve(workspaceRoot, candidate);
}

function renderResult(
  result: DocumentationLinkEnforcementResult,
  jsonOutput: boolean,
  attemptedFix: boolean
): void {
  if (jsonOutput) {
    const payload = {
      ok: result.violations.length === 0,
      attemptedFix,
      ...result
    };
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  console.log("Documentation Link Enforcement");
  console.log(`  Documents scanned: ${result.scannedDocuments}`);
  console.log(`  Code files scanned: ${result.scannedFiles}`);
  console.log(`  Files fixed: ${result.fixedFiles}`);

  if (result.violations.length === 0) {
    console.log(
      attemptedFix ? "  All documentation links satisfied after fixes." : "  All documentation links satisfied."
    );
    return;
  }

  console.log("  Violations:");
  for (const violation of result.violations) {
    console.log(renderViolation(violation));
  }
}

function renderViolation(violation: DocumentationLinkViolation): string {
  const parts = [
    `    - [${violation.kind}] ${violation.filePath}`
  ];

  parts.push(` (label: ${violation.label}`);
  if (violation.docPath) {
    parts.push(`, doc: ${violation.docPath}${violation.slug ? `#${violation.slug}` : ""}`);
  }
  parts.push(")");

  if (violation.message) {
    parts.push(` — ${violation.message}`);
  }

  if (violation.expected && violation.kind === "mismatched-breadcrumb") {
    parts.push(`\n      expected: ${violation.expected}`);
    if (violation.actual !== undefined) {
      parts.push(`\n      actual: ${violation.actual}`);
    }
  }

  return parts.join("");
}

function validateWorkspace(workspaceRoot: string): void {
  if (!fs.existsSync(workspaceRoot) || !fs.statSync(workspaceRoot).isDirectory()) {
    throw new Error(`Workspace directory not found: ${workspaceRoot}`);
  }
}

function printHelp(): void {
  console.log(
    "Usage: enforce-documentation-links [options]\n\n" +
      "Options:\n" +
      "  --json             Emit JSON instead of human-readable output\n" +
      "  --no-json          Force human-readable output\n" +
      "  --fix              Insert or update missing documentation comments\n" +
      "  --no-fix           Run in check mode (default)\n" +
      "  --include PATH     Limit enforcement to a specific code path (repeatable or comma-separated)\n" +
      "  --workspace PATH   Override the workspace root (defaults to CWD)\n" +
      "  --config FILE      Load documentation rules from a JSON file\n" +
      "  --label VALUE      Override the default rule label (when not using --config)\n" +
      "  --doc-glob GLOB    Override documentation globs (repeatable, when not using --config)\n" +
      "  --code-glob GLOB   Override code globs (repeatable, when not using --config)\n" +
      "  -h, --help         Show this help message"
  );
}
