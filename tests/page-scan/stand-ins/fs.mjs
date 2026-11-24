// Stands in for `node:fs` in the scanning page: a file system held in memory, which the page fills with the folder a
// person hands it and from which it reads back the docs the scan wrote. Paths are POSIX and absolute; the page puts
// the folder at `/ws`. Each function answers as Node's does on Linux, failures included: the same `code`, `syscall`
// and `path` on the error, since the engine tells a file's absence from a failure of the machine by them
// (`machineFailure`, `live-docs/processMark.ts`). There are no links, and a folder holds what was put under it.
//
// Only what the scan's path calls is here; `node-needs.json` lists it, and its test holds this module to that list.
// The page's own access to the tree is `tree`, which is not counted, so that the tally holds the scan's calls alone.
import { counted } from "./calls.mjs";
import { rules } from "./path.mjs";

/** Each file by its absolute path: its bytes and its time of change. */
const files = new Map();
/** Each folder by its absolute path; the root is always there. */
const folders = new Set(["/"]);
/** How many times the scan read each file, by its absolute path. */
const reads = new Map();

const ERRNO = { ENOENT: -2, ENOTDIR: -20, EISDIR: -21, EEXIST: -17, ENOTEMPTY: -39 };
const DESCRIPTION = {
  ENOENT: "no such file or directory",
  ENOTDIR: "not a directory",
  EISDIR: "illegal operation on a directory",
  EEXIST: "file already exists",
  ENOTEMPTY: "directory not empty"
};

/** A failure as Node gives it: `ENOENT: no such file or directory, open '/ws/a.ts'`, with `errno`, `code`, `syscall` and `path`. */
function failure(code, syscall, path) {
  return Object.assign(new Error(`${code}: ${DESCRIPTION[code]}, ${syscall} '${path}'`), { errno: ERRNO[code], code, syscall, path });
}

const absolute = (path) => rules.resolve(String(path));

function addFolders(path) {
  for (let folder = rules.dirname(path); !folders.has(folder); folder = rules.dirname(folder)) folders.add(folder);
}

/** What lies at a path: a file, a folder, or the code of its absence (`ENOTDIR` where a file stands on the way). */
function lookUp(path) {
  if (files.has(path)) return "file";
  if (folders.has(path)) return "folder";
  for (let above = rules.dirname(path); above !== "/"; above = rules.dirname(above)) {
    if (files.has(above)) return "ENOTDIR";
    if (folders.has(above)) break;
  }
  return "ENOENT";
}

class Stats {
  constructor(kind, size, mtimeMs) {
    this.kind = kind;
    this.size = size;
    this.mtimeMs = mtimeMs;
    this.mtime = new Date(mtimeMs);
  }
  isFile() { return this.kind === "file"; }
  isDirectory() { return this.kind === "folder"; }
  isSymbolicLink() { return false; }
}

class Dirent {
  constructor(name, parentPath, kind) {
    this.name = name;
    this.parentPath = parentPath;
    this.kind = kind;
  }
  isFile() { return this.kind === "file"; }
  isDirectory() { return this.kind === "folder"; }
  isSymbolicLink() { return false; }
}

function statOf(path, syscall) {
  const at = absolute(path);
  const kind = lookUp(at);
  if (kind === "file") return new Stats("file", files.get(at).bytes.byteLength, files.get(at).mtimeMs);
  if (kind === "folder") return new Stats("folder", 4096, 0);
  throw failure(kind, syscall, String(path));
}

/** A folder's entries, sorted by name, as `Dirent`s or names. */
function entriesOf(path, options) {
  const at = absolute(path);
  const kind = lookUp(at);
  if (kind === "file") throw failure("ENOTDIR", "scandir", String(path));
  if (kind !== "folder") throw failure(kind, "scandir", String(path));
  const prefix = at === "/" ? "/" : `${at}/`;
  const found = new Map();
  for (const file of files.keys()) if (file.startsWith(prefix) && !file.slice(prefix.length).includes("/")) found.set(file.slice(prefix.length), "file");
  for (const folder of folders) if (folder.startsWith(prefix) && folder !== at && !folder.slice(prefix.length).includes("/")) found.set(folder.slice(prefix.length), "folder");
  const names = [...found.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return options?.withFileTypes ? names.map((name) => new Dirent(name, at, found.get(name))) : names;
}

/** A file's bytes, or the failure Node would give; nothing counted. */
function foundBytes(path, syscall) {
  const at = absolute(path);
  const kind = lookUp(at);
  if (kind === "folder") throw failure("EISDIR", "read", String(path));
  if (kind !== "file") throw failure(kind, syscall, String(path));
  return files.get(at).bytes;
}

/** A file's bytes, counted as a read of the scan's once found. */
function bytesOf(path, syscall) {
  const bytes = foundBytes(path, syscall);
  const at = absolute(path);
  reads.set(at, (reads.get(at) ?? 0) + 1);
  return bytes;
}

const encodingOf = (options) => (typeof options === "string" ? options : options?.encoding);

function text(bytes, options) {
  const encoding = encodingOf(options);
  if (!encoding) return bytes;
  if (encoding !== "utf8" && encoding !== "utf-8") throw new Error(`the stand-in for node:fs reads no encoding but UTF-8, and was asked for ${encoding}`);
  return new TextDecoder().decode(bytes);
}

function writeTo(path, data, syscall) {
  const at = absolute(path);
  const parent = lookUp(rules.dirname(at));
  if (parent !== "folder") throw failure(parent === "file" ? "ENOTDIR" : parent, syscall, String(path));
  if (folders.has(at)) throw failure("EISDIR", syscall, String(path));
  files.set(at, { bytes: typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data), mtimeMs: Date.now() });
}

function makeFolder(path, options) {
  const at = absolute(path);
  const kind = lookUp(at);
  if (kind === "folder") {
    if (options?.recursive) return undefined;
    throw failure("EEXIST", "mkdir", String(path));
  }
  if (kind === "file") throw failure(options?.recursive ? "ENOTDIR" : "EEXIST", "mkdir", String(path));
  if (!options?.recursive && lookUp(rules.dirname(at)) !== "folder") throw failure("ENOENT", "mkdir", String(path));
  let first = at;
  for (let above = rules.dirname(at); !folders.has(above); above = rules.dirname(above)) {
    if (files.has(above)) throw failure("ENOTDIR", "mkdir", String(path));
    first = above;
  }
  folders.add(at);
  addFolders(at);
  return options?.recursive ? first : undefined;
}

function remove(path, options) {
  const at = absolute(path);
  const kind = lookUp(at);
  if (kind === "file") {
    files.delete(at);
    return;
  }
  if (kind === "folder") {
    if (!options?.recursive) throw Object.assign(new Error(`Path is a directory: rm returned EISDIR (is a directory) ${path}`), { code: "ERR_FS_EISDIR", errno: 21, syscall: "rm", path: String(path) });
    for (const file of [...files.keys()]) if (file.startsWith(`${at}/`)) files.delete(file);
    for (const folder of [...folders]) if (folder === at || folder.startsWith(`${at}/`)) folders.delete(folder);
    folders.add("/");
    return;
  }
  if (!options?.force) throw failure(kind, "stat", String(path));
}

function removeFolder(path) {
  const at = absolute(path);
  const kind = lookUp(at);
  if (kind === "file") throw failure("ENOTDIR", "rmdir", String(path));
  if (kind !== "folder") throw failure(kind, "rmdir", String(path));
  if (entriesOf(at).length > 0) throw failure("ENOTEMPTY", "rmdir", String(path));
  folders.delete(at);
}

/** A handle on an open file, for the reads of its first bytes. */
function handleOn(path) {
  const bytes = bytesOf(path, "open");
  return {
    async read(buffer, offset = 0, length = buffer.byteLength - offset, position = 0) {
      const slice = bytes.subarray(position ?? 0, (position ?? 0) + length);
      buffer.set(slice, offset);
      return { bytesRead: slice.byteLength, buffer };
    },
    async close() {}
  };
}

/** `node:fs/promises`, and `promises` of `node:fs`. */
export const promises = {
  readFile: counted("fs.promises.readFile", async (path, options) => text(bytesOf(path, "open"), options)),
  writeFile: counted("fs.promises.writeFile", async (path, data) => writeTo(path, data, "open")),
  stat: counted("fs.promises.stat", async (path) => statOf(path, "stat")),
  mkdir: counted("fs.promises.mkdir", async (path, options) => makeFolder(path, options)),
  readdir: counted("fs.promises.readdir", async (path, options) => entriesOf(path, options)),
  rm: counted("fs.promises.rm", async (path, options) => remove(path, options)),
  rmdir: counted("fs.promises.rmdir", async (path) => removeFolder(path)),
  open: counted("fs.promises.open", async (path) => handleOn(path))
};

/** Node's way of answering a callback: after the caller's own turn has ended. */
const later = (callback, ...args) => queueMicrotask(() => callback(...args));

export const readdir = counted("fs.readdir", (path, options, callback) => {
  const answer = typeof options === "function" ? options : callback;
  try {
    later(answer, null, entriesOf(path, typeof options === "function" ? undefined : options));
  } catch (error) {
    later(answer, error);
  }
});

export const readdirSync = counted("fs.readdirSync", (path, options) => entriesOf(path, options));

/** `statSync` and `lstatSync` answer nothing for a path not there when told `throwIfNoEntry: false`, as Node does. */
function statOrNothing(path, options, syscall) {
  try {
    return statOf(path, syscall);
  } catch (error) {
    if (options?.throwIfNoEntry === false && (error.code === "ENOENT" || error.code === "ENOTDIR")) return undefined;
    throw error;
  }
}
export const statSync = counted("fs.statSync", (path, options) => statOrNothing(path, options, "stat"));
export const lstatSync = counted("fs.lstatSync", (path, options) => statOrNothing(path, options, "lstat"));

/** The page's own hand on the tree, uncounted: to fill it, empty it, and read back what the scan wrote and read. */
export const tree = {
  put(path, bytes, mtimeMs = 0) {
    const at = absolute(path);
    files.set(at, { bytes, mtimeMs });
    addFolders(at);
  },
  /** Removes a folder and everything in it, when it is there. */
  drop(path) {
    remove(path, { recursive: true, force: true });
  },
  resetReads() {
    reads.clear();
  },
  files: () => [...files.keys()].sort(),
  bytes: (path) => files.get(absolute(path))?.bytes,
  /**
   * A file's bytes for the page's own host of the scan (`page-entry.mjs`), counted as a read of the scan's but not as a
   * call of `fs`: failing as `fs.promises.readFile` fails, so that the engine reads an absence or a folder as it does on a
   * disk. Every ask of the host is counted, found or not, since a failed ask waits on a page as long as one that finds
   * its file, and "read once" holds for both (2026-11-22; before, an ask for an absent `go.mod` was not counted).
   */
  read: (path) => {
    const at = absolute(path);
    reads.set(at, (reads.get(at) ?? 0) + 1);
    return foundBytes(path, "open");
  },
  /** Each file the scan read, with the number of times it read it. */
  reads: () => Object.fromEntries([...reads].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
  /** Each folder's entries, uncounted, for the page's own host (`PAGE_HOST` in `page-entry.mjs`). */
  entries: (path) => entriesOf(path, { withFileTypes: true })
};

export default { promises, readdir, readdirSync, statSync, lstatSync };
