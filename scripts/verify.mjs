#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tscBin = path.join(repoRoot, "node_modules", "typescript", "lib", "tsc.js");

function runStep(label, command, args, options = {}) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const exitCode = typeof result.status === "number" ? result.status : 1;
    throw new Error(`${label} failed with exit code ${exitCode}`);
  }
}

function runNpmScript(label, args) {
  const npmArgs = Array.isArray(args) ? args : [args];
  const npmExecPath = process.env.npm_execpath;
  const useNodeShim = Boolean(npmExecPath && npmExecPath.endsWith(".js"));
  const options = {
    shell: useNodeShim ? false : process.platform === "win32"
  };

  if (useNodeShim && npmExecPath) {
    runStep(label, process.execPath, [npmExecPath, ...npmArgs], options);
  } else {
    runStep(label, npmCommand, npmArgs, options);
  }
}

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
