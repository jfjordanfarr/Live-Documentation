// Scratch shim for the probe: no git in a page. spawnSync reports an error, so discovery falls back to `.gitignore`.
export const calls = [];
export function spawnSync(command, args) { calls.push([command, ...(args ?? [])].join(" ")); return { error: new Error("no processes in a page"), status: null, stdout: "", stderr: "" }; }
export function execFile(command, args, options, callback) { calls.push([command, ...(args ?? [])].join(" ")); const cb = typeof options === "function" ? options : callback; cb?.(new Error("no processes in a page")); }
export function spawn() { throw new Error("no processes in a page"); }
export function fork() { throw new Error("no processes in a page"); }
export default { spawnSync, execFile, spawn, fork };
