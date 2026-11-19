// Scratch shim for the probe: `node:fs` and `node:fs/promises` over an in-memory tree that the page fills from a
// directory handle. It stands where a real seam would stand, so that the unchanged engine and generator can be
// bundled into a page and measured. Paths are POSIX, rooted at the workspace root the page chooses (`/ws`).
const files = new Map();   // absolute path -> { bytes: Uint8Array | null, lazy: (() => Promise<Uint8Array>) | null, mtimeMs }
const dirs = new Set(["/"]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
export const stats = { reads: 0, readBytes: 0, writes: 0, writeBytes: 0, statCalls: 0, syncCalls: 0 };

function norm(p) {
  const parts = [];
  for (const part of String(p).replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop(); else parts.push(part);
  }
  return "/" + parts.join("/");
}
function parentOf(p) { const i = p.lastIndexOf("/"); return i <= 0 ? "/" : p.slice(0, i); }
function addDirs(p) { let d = parentOf(p); while (!dirs.has(d)) { dirs.add(d); d = parentOf(d); } }
function enoent(p, op) { const e = new Error(`ENOENT: no such file or directory, ${op} '${p}'`); e.code = "ENOENT"; return e; }

/** The page puts a file in: bytes now, or a reader called on first use. */
export function putFile(p, bytesOrReader, mtimeMs = 0) {
  const key = norm(p);
  addDirs(key);
  files.set(key, typeof bytesOrReader === "function" ? { bytes: null, lazy: bytesOrReader, mtimeMs } : { bytes: bytesOrReader, lazy: null, mtimeMs });
}
export function listFiles() { return [...files.keys()]; }
export function fileBytes(p) { return files.get(norm(p))?.bytes; }
export function reset() { files.clear(); dirs.clear(); dirs.add("/"); }

async function bytesOf(p) {
  const entry = files.get(norm(p));
  if (!entry) throw enoent(p, "open");
  if (!entry.bytes) { entry.bytes = await entry.lazy(); entry.lazy = null; }
  stats.reads += 1; stats.readBytes += entry.bytes.byteLength;
  return entry.bytes;
}
function statOf(p, op) {
  const key = norm(p);
  const entry = files.get(key);
  if (entry) return makeStats(true, entry.bytes ? entry.bytes.byteLength : 0, entry.mtimeMs);
  if (dirs.has(key)) return makeStats(false, 0, 0);
  throw enoent(p, op);
}
function makeStats(isFile, size, mtimeMs) {
  return { isFile: () => isFile, isDirectory: () => !isFile, isSymbolicLink: () => false, size, mtimeMs, mtime: new Date(mtimeMs) };
}
function makeDirent(name, isFile, parent) {
  return { name, parentPath: parent, path: parent, isFile: () => isFile, isDirectory: () => !isFile, isSymbolicLink: () => false };
}
function children(p) {
  const key = norm(p);
  if (!dirs.has(key)) throw enoent(p, "scandir");
  const prefix = key === "/" ? "/" : key + "/";
  const out = new Map();
  for (const f of files.keys()) if (f.startsWith(prefix)) { const rest = f.slice(prefix.length); const i = rest.indexOf("/"); out.set(i < 0 ? rest : rest.slice(0, i), i < 0); }
  for (const d of dirs) if (d.startsWith(prefix) && d !== key) { const rest = d.slice(prefix.length); const i = rest.indexOf("/"); if (!out.has(i < 0 ? rest : rest.slice(0, i))) out.set(i < 0 ? rest : rest.slice(0, i), false); }
  return [...out.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([name, isFile]) => makeDirent(name, isFile, key));
}

export const promises = {
  async readFile(p, options) {
    const bytes = await bytesOf(p);
    const enc = typeof options === "string" ? options : options?.encoding;
    return enc ? decoder.decode(bytes) : bytes;
  },
  async writeFile(p, data) {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    stats.writes += 1; stats.writeBytes += bytes.byteLength;
    putFile(p, bytes, Date.now());
  },
  async stat(p) { stats.statCalls += 1; return statOf(p, "stat"); },
  async lstat(p) { stats.statCalls += 1; return statOf(p, "lstat"); },
  async access(p) { statOf(p, "access"); },
  async mkdir(p) { const key = norm(p); dirs.add(key); addDirs(key); },
  async readdir(p, options) { const list = children(p); return options?.withFileTypes ? list : list.map((d) => d.name); },
  async rm(p) { const key = norm(p); files.delete(key); for (const f of [...files.keys()]) if (f.startsWith(key + "/")) files.delete(f); for (const d of [...dirs]) if (d === key || d.startsWith(key + "/")) dirs.delete(d); },
  async rmdir(p) { dirs.delete(norm(p)); },
  async rename(from, to) { const e = files.get(norm(from)); if (!e) throw enoent(from, "rename"); files.delete(norm(from)); putFile(to, e.bytes ?? e.lazy, e.mtimeMs); },
  async realpath(p) { return norm(p); },
  async mkdtemp(prefix) { const d = norm(prefix + Math.random().toString(36).slice(2, 8)); dirs.add(d); addDirs(d); return d; },
  async copyFile(from, to) { putFile(to, await bytesOf(from), Date.now()); },
  async open(p) {
    const bytes = await bytesOf(p);
    return {
      async read(buffer, offset, length, position) {
        const start = position ?? 0; const slice = bytes.subarray(start, start + length);
        buffer.set(slice, offset ?? 0); return { bytesRead: slice.byteLength, buffer };
      },
      async close() {}
    };
  }
};

export function statSync(p) { stats.syncCalls += 1; return statOf(p, "stat"); }
export function existsSync(p) { stats.syncCalls += 1; const key = norm(p); return files.has(key) || dirs.has(key); }
export function readdirSync(p, options) { stats.syncCalls += 1; const list = children(p); return options?.withFileTypes ? list : list.map((d) => d.name); }
export function rmSync(p) { promises.rm(p); }
export function readFileSync(p, options) {
  stats.syncCalls += 1;
  const entry = files.get(norm(p));
  if (!entry?.bytes) throw enoent(p, "open (sync, not yet read)");
  const enc = typeof options === "string" ? options : options?.encoding;
  return enc ? decoder.decode(entry.bytes) : entry.bytes;
}
export const { readFile, writeFile, stat, lstat, access, mkdir, readdir, rm, rmdir, rename, realpath, mkdtemp, copyFile, open } = promises;
export default { promises, statSync, existsSync, readdirSync, rmSync, readFileSync };
