import { spawnSync } from "node:child_process";

/**
 * The steps of the gate's scripts, shared by `verify.mjs` and
 * `safe-to-commit.mjs`: one command run to completion with its output on this
 * console, and one npm script run that way.
 */

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

/**
 * How to run `npm <args>` here: through the npm that started this script when
 * it is a JavaScript file, so that no shell is involved, else the platform's
 * npm, which on Windows is a `.cmd` and needs one.
 */
function npmInvocation(args) {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && npmExecPath.endsWith(".js")) {
    return { command: process.execPath, args: [npmExecPath, ...args], shell: false };
  }
  return { command: npmCommand, args, shell: process.platform === "win32" };
}

/** Runs one command to completion with its output on this console; throws when it fails. */
export function runStep(label, command, args, options = {}) {
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

/** Runs one npm script as a step: `runNpmScript("Lint", ["run", "lint"])`. */
export function runNpmScript(label, args) {
  const { command, args: full, shell } = npmInvocation(Array.isArray(args) ? args : [args]);
  runStep(label, command, full, { shell });
}
