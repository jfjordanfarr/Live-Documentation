// Stand-in for `node:process`, which `tooling/gitIgnored.ts` has imported since the probe of November 19 was built.
// A page has no environment and no git; `nextTick` is a microtask.
const process = { env: {}, platform: "browser", cwd: () => "/", nextTick: (fn, ...args) => queueMicrotask(() => fn(...args)) };
export default process;
