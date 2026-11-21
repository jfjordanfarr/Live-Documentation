// Stands in for `node:process` in the scanning page: a page has no environment, so `env` is empty, and `nextTick` runs
// its function once the caller's turn has ended, as a microtask. The global `process` is not given: a module that
// reaches for it fails in the page, and `node-needs.json` lists the modules that name it.
import { counted } from "./calls.mjs";

export const env = {};
export const nextTick = counted("process.nextTick", (callback, ...args) => queueMicrotask(() => callback(...args)));

export default { env, nextTick };
