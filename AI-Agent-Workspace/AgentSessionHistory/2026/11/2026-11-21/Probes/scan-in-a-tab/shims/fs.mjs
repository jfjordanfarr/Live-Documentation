// The stand-in for `node:fs` of the probe of November 19, with what the engine has come to ask of it since:
// `lstatSync`, `statSync` answering `undefined` under `throwIfNoEntry: false`, and `unlink`, all in or beside
// `tooling/gitIgnored.ts`. The tree is the same one the page fills, since both import the one module.
import * as base from "../../../../2026-11-19/Probes/execution-surface/shims/fs.mjs";
export * from "../../../../2026-11-19/Probes/execution-surface/shims/fs.mjs";

export function lstatSync(p, options) {
  try { return base.statSync(p); } catch (error) { if (options?.throwIfNoEntry === false) return undefined; throw error; }
}
export function statSync(p, options) {
  try { return base.statSync(p); } catch (error) { if (options?.throwIfNoEntry === false) return undefined; throw error; }
}
export const promises = { ...base.promises, unlink: (p) => base.promises.rm(p) };
export const unlink = promises.unlink;
export default { ...base.default, promises, lstatSync, statSync };
