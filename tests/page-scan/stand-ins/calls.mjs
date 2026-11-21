// The tally every stand-in keeps of the calls made of it, by function, so that a run of the page says exactly what of
// Node the scan asked for and how often. Not a stand-in itself: the stand-ins wrap each of their functions with
// `counted`, and the page reads and empties the tally around each scan.

/** Calls by the stand-in function's name, `fs.promises.readFile` or `child_process.spawnSync`. */
const calls = new Map();

/** The function `body`, counting each call under `name` before it runs. */
export function counted(name, body) {
  return function standIn(...args) {
    calls.set(name, (calls.get(name) ?? 0) + 1);
    return body.apply(this, args);
  };
}

/** Each stand-in function called since the last `resetCalls`, with its count, sorted by name. */
export function callCounts() {
  return Object.fromEntries([...calls].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

export function resetCalls() {
  calls.clear();
}
