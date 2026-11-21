// Stands in for `node:child_process` in the scanning page, where no process can be started: each call fails as Node's
// does for a program that is not there (`ENOENT` on `spawn`), so that the engine takes its way for no git, as it does
// on a machine without git. Each call is counted, and the commands asked for are kept, for the page to report.
import { counted } from "./calls.mjs";

/** Each command line the scan asked to run, in order. */
export const asked = [];

function notThere(command, args) {
  asked.push([command, ...(args ?? [])].join(" "));
  return Object.assign(new Error(`spawnSync ${command} ENOENT`), { errno: -2, code: "ENOENT", syscall: `spawnSync ${command}`, path: command, spawnargs: args ?? [] });
}

export const spawnSync = counted("child_process.spawnSync", (command, args) => {
  const error = notThere(command, args);
  return { error, status: null, signal: null, output: null, pid: 0, stdout: null, stderr: null };
});

export const execFile = counted("child_process.execFile", (command, args, options, callback) => {
  const answer = typeof options === "function" ? options : callback;
  const error = notThere(command, args);
  queueMicrotask(() => answer?.(error, "", ""));
});

export default { spawnSync, execFile };
