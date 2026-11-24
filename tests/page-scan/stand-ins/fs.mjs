// Stands in for `node:fs` in the scanning page: a read-only in-memory input tree holding the folder a person hands the
// page at `/ws`, answering the remaining Node disk fallback functions in `nodeHost.ts` until Step 9 removes standalone
// no-run adapter calls. Generated docs and the index no longer touch `fs.mjs` (Step 6 `OutputSink` in `page-entry.mjs`).
//
// Only what the scan's path names is here; `node-needs.json` lists it, and its test holds this module to that list.
// The page's own access to the tree is `tree`, which is not counted, so that the tally holds the scan's calls alone.
import { counted } from "./calls.mjs";
import { rules } from "./path.mjs";

/** Each file by its absolute path: its bytes and its time of change. */
const files = new Map();
/** Each folder by its absolute path; the root is always there. */
const folders = new Set(["/"]);
/** How many times the scan read each file, by its absolute path. */
const reads = new Map();

const ERRNO = { ENOENT: -2, ENOTDIR: -20, EISDIR: -21 };
const DESCRIPTION = {
  ENOENT: "no such file or directory",
  ENOTDIR: "not a directory",
  EISDIR: "illegal operation on a directory"
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

/** `promises` of `node:fs` (retained only for `nodeHost.ts` fallbacks until Step 9). */
export const promises = {
  readFile: counted("fs.promises.readFile", async (path, options) => text(bytesOf(path, "open"), options)),
  stat: counted("fs.promises.stat", async (path) => statOf(path, "stat")),
  readdir: counted("fs.promises.readdir", async (path, options) => entriesOf(path, options)),
  open: counted("fs.promises.open", async (path) => handleOn(path))
};

export const readdirSync = counted("fs.readdirSync", (path, options) => entriesOf(path, options));

/** `statSync` answers nothing for a path not there when told `throwIfNoEntry: false`, as Node does. */
function statOrNothing(path, options, syscall) {
  try {
    return statOf(path, syscall);
  } catch (error) {
    if (options?.throwIfNoEntry === false && (error.code === "ENOENT" || error.code === "ENOTDIR")) return undefined;
    throw error;
  }
}
export const statSync = counted("fs.statSync", (path, options) => statOrNothing(path, options, "stat"));

/** The page's own hand on the tree, uncounted: to fill it, empty it, and read the input folder. */
export const tree = {
  put(path, bytes, mtimeMs = 0) {
    const at = absolute(path);
    files.set(at, { bytes, mtimeMs });
    addFolders(at);
  },
  /** Removes a folder and everything in it, when it is there. */
  drop(path) {
    const at = absolute(path);
    files.delete(at);
    const prefix = at === "/" ? "/" : `${at}/`;
    for (const file of [...files.keys()]) if (file.startsWith(prefix)) files.delete(file);
    for (const folder of [...folders]) if (folder === at || folder.startsWith(prefix)) folders.delete(folder);
    folders.add("/");
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

export default { promises, readdirSync, statSync };
