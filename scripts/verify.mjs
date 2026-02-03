#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

/**
 * Checks if xvfb-run is needed and available for headless VS Code tests.
 * Returns the wrapper command if needed, or null if not.
 */
function getXvfbWrapper() {
  // Only needed on Linux without a display
  if (process.platform !== "linux" || process.env.DISPLAY) {
    return null;
  }

  // Check if xvfb-run is available
  const check = spawnSync("which", ["xvfb-run"], { stdio: "pipe" });
  if (check.status !== 0) {
    return null;
  }

  return ["xvfb-run", "-a"];
}

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

function runNpmScript(label, args, env) {
  const npmArgs = Array.isArray(args) ? args : [args];
  const npmExecPath = process.env.npm_execpath;
  const useNodeShim = Boolean(npmExecPath && npmExecPath.endsWith(".js"));
  const options = {
    env: { ...process.env, ...env },
    shell: useNodeShim ? false : process.platform === "win32"
  };

  if (useNodeShim && npmExecPath) {
    runStep(label, process.execPath, [npmExecPath, ...npmArgs], options);
  } else {
    runStep(label, npmCommand, npmArgs, options);
  }
}

function parseFlags(argv) {
  let mode =
    normalizeMode(process.env.BENCHMARK_MODE ?? process.env.npm_config_mode) ??
    "ast";
  let generateReport = coerceBoolean(process.env.npm_config_report) ?? false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--mode") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--mode requires a value (ast, all)");
      }
      const resolved = normalizeMode(value);
      if (!resolved) {
        throw new Error(`Invalid mode: ${value}`);
      }
      mode = resolved;
      index += 1;
      continue;
    }

    if (token.startsWith("--mode=")) {
      const [, value] = token.split("=", 2);
      if (!value) {
        throw new Error("--mode requires a value (ast, all)");
      }
      const resolved = normalizeMode(value);
      if (!resolved) {
        throw new Error(`Invalid mode: ${value}`);
      }
      mode = resolved;
      continue;
    }

    if (token === "--report") {
      generateReport = true;
      continue;
    }

    if (token === "--no-report") {
      generateReport = false;
      continue;
    }

    if (!token.startsWith("-")) {
      const resolved = normalizeMode(token);
      if (!resolved) {
        throw new Error(`Unknown argument: ${token}`);
      }
      mode = resolved;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return { mode, generateReport };
}

function normalizeMode(candidate) {
  if (!candidate) {
    return undefined;
  }
  const normalized = String(candidate).toLowerCase();
  if (["ast", "all"].includes(normalized)) {
    return normalized;
  }
  return undefined;
}

function coerceBoolean(value) {
  if (value === undefined) {
    return undefined;
  }
  const normalized = String(value).toLowerCase();
  if (["1", "true", "yes", "on", ""].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return undefined;
}

function runVerify() {
  const { mode, generateReport } = parseFlags(process.argv.slice(2));
  const benchmarkEnv = { BENCHMARK_MODE: mode };

  try {
    runNpmScript("Lint", ["run", "lint"], benchmarkEnv);
    runNpmScript("Unit tests", ["run", "test:unit"], benchmarkEnv);

    // Integration tests need xvfb on headless Linux (no $DISPLAY)
    const xvfbWrapper = getXvfbWrapper();
    if (xvfbWrapper) {
      runStep(
        "Integration tests (via xvfb)",
        xvfbWrapper[0],
        [...xvfbWrapper.slice(1), npmCommand, "run", "test:integration"],
        { env: { ...process.env, ...benchmarkEnv } }
      );
    } else {
      runNpmScript("Integration tests", ["run", "test:integration"], benchmarkEnv);
    }

    runNpmScript("Documentation link enforcement", ["run", "docs:links:enforce"], benchmarkEnv);

    if (generateReport) {
      const reportModes = resolveReportModes(mode);
      for (const reportMode of reportModes) {
        runStep(
          `Generate test report (${reportMode})`,
          process.platform === "win32" ? "npx.cmd" : "npx",
          [
            "tsx",
            "--tsconfig",
            "./tsconfig.base.json",
            "./scripts/reporting/generateTestReport.ts",
            "--mode",
            reportMode
          ],
          {
            env: { ...process.env, ...benchmarkEnv },
            shell: process.platform === "win32"
          }
        );
      }
    }
  } catch (error) {
    console.error("\nVerification failed.");
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runVerify();

function resolveReportModes(mode) {
  if (!mode || mode === "ast") {
    return ["ast"];
  }
  if (mode === "all") {
    return ["ast"];
  }
  return [mode];
}
