#!/usr/bin/env node
/**
 * Live Documentation CLI
 *
 * Mirrors your codebase into deterministic, machine-verified markdown.
 *
 * Usage:
 *   live-docs <command> [options]
 *
 * Commands:
 *   generate    Generate Live Documentation for your workspace
 *   lint        Validate structural markers and link hygiene
 *   inspect     Trace dependency paths between artifacts
 *   visualize   Build a static Explorer bundle
 *
 * Run `live-docs <command> --help` for command-specific options.
 */

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const COMMANDS: Record<string, string> = {
  generate: "generate.ts",
  lint: "lint.ts",
  inspect: "inspect.ts",
  visualize: "visualize-static.ts",
  system: "system.ts",
  report: "report-precision.ts",
  orphans: "find-orphans.ts"
};

function printUsage(): void {
  console.log(`
Live Documentation CLI

Usage:
  live-docs <command> [options]

Commands:
  generate    Generate Live Documentation for your workspace
  lint        Validate structural markers and link hygiene
  inspect     Trace dependency paths between artifacts
  visualize   Build a static Explorer bundle
  system      Materialise System Layer views
  report      Report precision metrics
  orphans     Find orphaned Live Docs

Options:
  --help      Show this help message
  --version   Show version number

Examples:
  live-docs generate --workspace ./my-project
  live-docs inspect --from src/index.ts --to src/utils.ts
  live-docs lint --config .live-docs.config.json

For command-specific help:
  live-docs <command> --help
`);
}

function printVersion(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require("../package.json") as { version: string };
  console.log(`live-docs version ${pkg.version}`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(0);
  }

  if (args[0] === "--version" || args[0] === "-v") {
    printVersion();
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (!command || !(command in COMMANDS)) {
    console.error(`Unknown command: ${command}`);
    console.error(`Run 'live-docs --help' for available commands.`);
    process.exit(1);
  }

  // Resolve the script path relative to the monorepo scripts folder
  // In development, we use tsx to run TypeScript directly
  // In production (published), we'd have compiled JS
  const scriptName = COMMANDS[command];
  const scriptsRoot = path.resolve(__dirname, "../../../scripts/live-docs");
  const scriptPath = path.join(scriptsRoot, scriptName);

  // Use tsx to execute the script (development mode)
  // TODO: For production, compile scripts and use node directly
  const tsxPath = path.resolve(__dirname, "../../../node_modules/.bin/tsx");
  const tsconfigPath = path.resolve(__dirname, "../../../tsconfig.base.json");

  const child = spawn(
    process.platform === "win32" ? `${tsxPath}.cmd` : tsxPath,
    ["--tsconfig", tsconfigPath, scriptPath, ...commandArgs],
    {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env
    }
  );

  child.on("error", (error) => {
    console.error(`Failed to execute command: ${error.message}`);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main();
