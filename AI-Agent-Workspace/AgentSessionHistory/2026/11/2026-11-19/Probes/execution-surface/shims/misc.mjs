// Scratch shim for the probe: `node:os`, `node:url`, `node:crypto`, `node:zlib`, `node:util` as far as the generator's
// own path reaches them. Anything the generator should not reach throws, so that reaching it shows.
export function tmpdir() { return "/tmp"; }
export function cpus() { return [{}]; }
export function pathToFileURL(p) { return new URL("file://" + encodeURI(p).replace(/#/g, "%23").replace(/\?/g, "%3F")); }
export function fileURLToPath(u) { return decodeURIComponent(new URL(String(u)).pathname); }
export function createHash() { throw new Error("node:crypto reached from the generator"); }
export function randomBytes() { throw new Error("node:crypto reached from the generator"); }
export function gzipSync() { throw new Error("node:zlib reached"); }
export function gunzipSync() { throw new Error("node:zlib reached"); }
export function promisify(fn) { return (...args) => new Promise((ok, fail) => fn(...args, (e, ...r) => (e ? fail(e) : ok(r.length > 1 ? { stdout: r[0], stderr: r[1] } : r[0])))); }
export default { tmpdir, cpus, pathToFileURL, fileURLToPath, createHash, randomBytes, gzipSync, gunzipSync, promisify };
