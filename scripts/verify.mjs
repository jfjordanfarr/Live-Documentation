#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runNpmScript, runStep } from "./steps.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tscBin = path.join(repoRoot, "node_modules", "typescript", "lib", "tsc.js");

function runVerify() {
  try {
    runNpmScript("Lint", ["run", "lint"]);
    runNpmScript("Build (tsc)", ["run", "build"]);
    runStep("Type-check tests", process.execPath, [tscBin, "-p", "tests/integration/tsconfig.json"]);
    runNpmScript("Unit tests", ["run", "test:unit"]);
    runNpmScript("Integration tests", ["run", "test:integration"]);
    runNpmScript("Documentation link enforcement", ["run", "docs:links:enforce"]);
  } catch (error) {
    console.error("\nVerification failed.");
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runVerify();
