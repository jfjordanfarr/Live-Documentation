/**
 * The version-control seam's first implementation: git, read through the
 * `git` executable on the local clone.
 *
 * @remarks
 * The executable, never `.git` by hand, since a `.git` can be a file pointing
 * elsewhere and a pack is deltas (the plan's failed ideas); never a remote,
 * never credentials. The mainline is the head's first parents, oldest first
 * (`rev-list --first-parent --reverse`); the renames and the content changes
 * between two changes are git's own word (`diff --name-status -M50%`), with no
 * limit on the renames it may weigh so that a large change is never read as
 * deaths and births for want of time. Each call states the options its
 * reading depends on, so that a person's own configuration of git does not
 * change what the history says.
 *
 * A working tree is a change's tracked files as the repository stores them:
 * each blob's bytes from the object store (`ls-tree` and `cat-file --batch`),
 * written by this module with nothing converted. No attributes apply, the
 * change's own or anyone's, no `core.autocrlf` and no filter, so Git LFS's
 * pointers stay pointers; the bytes depend on the change alone, never on the
 * person's checkout, configuration or version of git. Until 2026-11-19 the
 * files were written by `checkout-index`, which applied the attributes of the
 * person's current checkout rather than the change's: a change without
 * attributes came out with CRLF endings because today's head asked for them.
 * The change's tree is also read into an index of its own beside the
 * directory, registering nothing with the repository, so that a process in
 * the tree can ask git what it tracks ({@link WorkingTree.environment}).
 *
 * Since a second review of 2026-11-19 nothing is written outside the tree's
 * folder whatever the commit holds: the disk itself is asked, without
 * following a link, before each entry is written, so that an entry beneath a
 * link or a file, one whose name the disk already holds by its own rule of
 * names (case, normalization, short names), or one whose name the disk or the
 * platform cannot hold is left out and named, and the summary says it was not
 * read. A third review found that a folding rule of this module's own, as the
 * second pass had, missed what APFS and NTFS take for one name. Blobs are
 * streamed to disk rather than held whole; every failure of the reader ends
 * in one rejection; and every call reads the commit as stored, the
 * repository's replacement objects set aside.
 *
 * @module
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { execFileAsync } from "../gitUtils";
import type { MainlineChange, MainlineEnd, VersionChanges, VersionControl, WorkingTree } from "./versionControl";

// A listing of a large repository's history or of a large change runs to many megabytes.
const LARGEST_OUTPUT = 1 << 30;

// One record per change: a separator, then the fields, each after a unit separator.
const RECORD = "\u001e";
const FIELD = "\u001f";
const MAINLINE_FORMAT = ["%x1e%H", "%P", "%cI", "%an", "%s"].join("%x1f");

/**
 * The git repository whose top level is `workspaceRoot`, as the history
 * command's version control.
 *
 * @throws When `workspaceRoot` is not in a git repository, or is a folder below its top level: the history of a repository is read whole.
 */
export async function openGitRepository(workspaceRoot: string): Promise<VersionControl> {
  const root = path.resolve(workspaceRoot);
  let topLevel: string;
  try {
    topLevel = (await execFileAsync("git", ["-C", root, "rev-parse", "--show-toplevel"], { cwd: root })).stdout.trim();
  } catch (error) {
    throw new Error(`${root} is not in a git repository: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  const [realRoot, realTop] = await Promise.all([fs.realpath(root), fs.realpath(topLevel)]);
  if (realRoot !== realTop) {
    throw new Error(`${root} lies inside the repository at ${topLevel}; the history of a repository is read whole, so point at its top level`);
  }
  return new GitRepository(root);
}

class GitRepository implements VersionControl {
  readonly system = "git";

  constructor(private readonly root: string) {}

  async mainlineEnd(): Promise<MainlineEnd> {
    const [branch, head, shallow] = await Promise.all([
      this.git(["rev-parse", "--abbrev-ref", "HEAD"]),
      this.git(["rev-parse", "HEAD"]),
      this.git(["rev-parse", "--is-shallow-repository"])
    ]);
    return { branch: branch.trim(), head: head.trim(), truncated: shallow.trim() === "true" };
  }

  async mainline(): Promise<MainlineChange[]> {
    return parseMainline(await this.git(["rev-list", "--first-parent", "--reverse", `--format=${MAINLINE_FORMAT}`, "HEAD"]));
  }

  async tagged(): Promise<Set<string>> {
    return parseTags(await this.git(["for-each-ref", "--format=%(objectname) %(*objectname)", "refs/tags"]));
  }

  /**
   * The change's tracked files written into `directory` as the repository stores them (see the module's remarks), and
   * the change's tree read into an index beside it, `<directory>.index`, with nothing registered with the repository.
   * The generator asks git what a tree tracks and ignores (`gitIgnored`), so a process in the tree is given the
   * repository, the tree and its index by {@link WorkingTree.environment}; without them a tracked file a `.gitignore`
   * names was left out. The same environment keeps the person's own configuration of git, and the repository's
   * replacement objects, from that process, though git's answer could not depend on them: every file the tree holds
   * is tracked, and a tracked file is never ignored.
   */
  async workingTree(change: string, directory: string): Promise<WorkingTree> {
    const index = `${directory}.index`;
    await fs.mkdir(directory);
    let removal: Promise<void> | undefined;
    // A signal and the worker's finally may both release the same tree. They share one operation and its result.
    const remove = (): Promise<void> => (removal ??= Promise.all([fs.rm(directory, { recursive: true, force: true }), fs.rm(index, { force: true })]).then(() => undefined));
    let unwritten: UnwrittenEntry[];
    try {
      await this.git(["read-tree", change], { GIT_INDEX_FILE: index });
      unwritten = await writeStoredTree(this.root, change, directory);
    } catch (error) {
      await remove();
      throw error;
    }
    this.gitDirectory ??= this.git(["rev-parse", "--path-format=absolute", "--git-common-dir"]).then((output) => output.trim());
    const environment = {
      GIT_DIR: await this.gitDirectory,
      GIT_WORK_TREE: directory,
      GIT_INDEX_FILE: index,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_NO_REPLACE_OBJECTS: "1"
    };
    return { root: directory, environment, unwritten, remove };
  }

  private gitDirectory: Promise<string> | undefined;

  async changesBetween(from: string, to: string): Promise<VersionChanges> {
    return parseNameStatus(
      await this.git(["-c", "diff.relative=false", "diff", "--no-ext-diff", "--name-status", "-z", "-M50%", "-l0", from, to])
    );
  }

  private async git(args: readonly string[], env?: Record<string, string>): Promise<string> {
    return (await execFileAsync("git", ["-C", this.root, ...args], { cwd: this.root, maxBuffer: LARGEST_OUTPUT, env: { ...env, ...READ_AS_STORED } })).stdout;
  }
}

/**
 * What every call that reads a commit sets, so that the repository's replacement objects (`refs/replace`), which are
 * local state no other clone shares, do not stand in for the commit's own trees and blobs.
 */
const READ_AS_STORED = { GIT_NO_REPLACE_OBJECTS: "1" };

/** The modes of a tree's entries: a file, an executable file, a symbolic link, and another repository's commit. */
const FILE_MODE = "100644";
const EXECUTABLE_MODE = "100755";
const LINK_MODE = "120000";
const SUBMODULE_MODE = "160000";

/** An entry of a change's tree that was not written into its working tree, and why. */
export interface UnwrittenEntry {
  path: string;
  reason: string;
}

/** What a path under a tree's folder is on the disk, read without following a link. */
export type DiskEntry = "absent" | "folder" | "link" | "other";

/**
 * The disk a tree is written to, as the writer asks it, by paths relative to the tree's folder: the real disk
 * ({@link realDisk}), or in a test a stand-in that treats names as one as APFS or NTFS do.
 */
export interface TreeDisk {
  /** What stands at the path, read with `lstat`, never through a link. */
  entry(relative: string): Promise<DiskEntry>;
  /** Makes one folder at the path, never through a link; fails where anything stands there, by the disk's own rule of names. */
  makeFolder(relative: string): Promise<void>;
}

/** The real disk under a folder. */
export function realDisk(directory: string): TreeDisk {
  const full = (relative: string): string => path.join(directory, ...relative.split("/"));
  return {
    async entry(relative) {
      try {
        const stat = await fs.lstat(full(relative));
        return stat.isSymbolicLink() ? "link" : stat.isDirectory() ? "folder" : "other";
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return "absent";
        throw error;
      }
    },
    async makeFolder(relative) {
      await fs.mkdir(full(relative));
    }
  };
}

// Windows's rules for a name, as Git for Windows applies them (`core.protectNTFS`): no separator, drive mark or
// character the file system forbids, no trailing dot or space, and no device name.
// eslint-disable-next-line no-control-regex -- the control characters are what Windows forbids in a name
const WINDOWS_FORBIDDEN = /[\\:<>"|?*\u0000-\u001f]|[. ]$|^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$/iu;

/**
 * The failures of the disk that mean it cannot hold a name or a path, rather than that it failed: a name too long, a
 * name it does not accept, a name that is already another's by its own rule of names, a path through something that
 * is not a folder. An entry that meets one is left out and named; any other failure fails the tree.
 */
const NAME_FAILURES = new Set(["ENAMETOOLONG", "EILSEQ", "EINVAL", "EEXIST", "ENOTDIR", "EISDIR", "ELOOP"]);

/**
 * Prepares the place of one entry on the disk, asking the disk at each step: every folder above it, one level at a
 * time, must be a folder (made where absent) and never a link or a file, and nothing may stand where the entry goes.
 * Whether two names are one is the disk's own rule, case, Unicode normalization and short names included, never a
 * rule of this module's.
 *
 * @returns Why the entry cannot be written, or undefined where it can.
 */
export async function placeEntry(parts: readonly string[], disk: TreeDisk): Promise<string | undefined> {
  try {
    for (let depth = 1; depth < parts.length; depth += 1) {
      const folder = parts.slice(0, depth).join("/");
      const standing = await disk.entry(folder);
      if (standing === "absent") {
        await disk.makeFolder(folder);
      } else if (standing !== "folder") {
        return `it lies beneath ${folder}, which is ${standing === "link" ? "a symbolic link" : "a file"} on this disk, and nothing is written through it`;
      }
    }
    const standing = await disk.entry(parts.join("/"));
    if (standing !== "absent") {
      return "another entry already stands at its name on this disk, which takes the two names for one";
    }
    return undefined;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== undefined && NAME_FAILURES.has(code)) return `this disk cannot hold its name (${code})`;
    throw error;
  }
}

/** One entry of a tree as the writer meets it, in the tree's order. */
interface TreeEntry {
  mode: string;
  id: string;
  relative: string;
  parts: string[];
}

/**
 * Writes every entry of a change's tree under `directory` as the repository stores it: a file's blob bytes, executable
 * where its mode says so, streamed to disk as git gives them; a symbolic link to the target its blob holds; an empty
 * folder where another repository's commit stands, as a checkout leaves a submodule it has not initialized.
 *
 * Nothing is ever written outside `directory`, and no entry stops the tree. An entry is left out, and returned with the
 * reason, when its path would leave the directory or name a `.git`; when the platform cannot hold its name; when the
 * disk, asked at every step ({@link placeEntry}), has a link or a file where one of its folders goes, or already holds
 * something at its name, as a disk that takes `A` and `a`, or `s` and `ſ`, for one name may; or when the disk cannot
 * hold its name. Of two entries that clash, the first in the tree's order is written.
 *
 * @param disk - The disk, asked; the real one under `directory` unless a test stands one in.
 * @returns The entries not written, in the tree's order.
 */
export async function writeStoredTree(root: string, change: string, directory: string, options?: { platform?: NodeJS.Platform; disk?: TreeDisk }): Promise<UnwrittenEntry[]> {
  const platform = options?.platform ?? process.platform;
  const disk = options?.disk ?? realDisk(directory);
  const listing = (await execFileAsync("git", ["-C", root, "ls-tree", "-r", "-z", "--full-tree", change], { cwd: root, maxBuffer: LARGEST_OUTPUT, env: READ_AS_STORED })).stdout;
  const unwritten: UnwrittenEntry[] = [];
  const entries: TreeEntry[] = [];
  const named = new Set<string>();
  const position = new Map<string, number>();
  for (const line of listing.split("\0")) {
    if (line === "") continue;
    // Each entry is `<mode> <type> <id>\t<path>`.
    const tab = line.indexOf("\t");
    const [mode, , id] = line.slice(0, tab).split(" ");
    const relative = line.slice(tab + 1);
    if (!position.has(relative)) position.set(relative, position.size);
    const parts = relative.split("/");
    if (parts.some((part) => part === "" || part === "." || part === ".." || part.toLowerCase() === ".git")) {
      unwritten.push({ path: relative, reason: "its path would leave the tree or name a .git, which git refuses to check out" });
    } else if (platform === "win32" && parts.some((part) => WINDOWS_FORBIDDEN.test(part))) {
      unwritten.push({ path: relative, reason: "its name cannot be written on Windows, where git refuses to check it out" });
    } else if (mode !== FILE_MODE && mode !== EXECUTABLE_MODE && mode !== LINK_MODE && mode !== SUBMODULE_MODE) {
      unwritten.push({ path: relative, reason: `its mode ${mode} is one no checkout writes` });
    } else if (named.has(relative)) {
      unwritten.push({ path: relative, reason: "the tree names it twice" });
    } else {
      named.add(relative);
      entries.push({ mode, id, relative, parts });
    }
  }
  // An entry that becomes no folder or file of its own: one refused, or a submodule's empty folder.
  const place = async (entry: TreeEntry): Promise<boolean> => {
    const reason = await placeEntry(entry.parts, disk);
    if (reason !== undefined) {
      unwritten.push({ path: entry.relative, reason });
      return false;
    }
    if (entry.mode === SUBMODULE_MODE) {
      try {
        await disk.makeFolder(entry.relative);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === undefined || !NAME_FAILURES.has(code)) throw error;
        unwritten.push({ path: entry.relative, reason: `this disk cannot hold its name (${code})` });
      }
      return false;
    }
    return true;
  };
  await writeBlobs(root, change, directory, entries, place, (entry, code) => unwritten.push({ path: entry.relative, reason: `this disk cannot hold its name (${code})` }));
  // In the tree's order, whether an entry was refused by its name or by the disk.
  return unwritten.sort((a, b) => (position.get(a.path) ?? 0) - (position.get(b.path) ?? 0));
}

/**
 * Writes the entries in the tree's order, asking `place` before each whether and where it may go, and `git cat-file
 * --batch` for each blob, a file's bytes streamed to disk chunk by chunk so that no blob is held whole; a blob whose
 * entry was refused is read and passed over. Every failure, the reader's, its pipes' or a write's, ends the reader and
 * rejects once, with the first failure.
 */
async function writeBlobs(
  root: string,
  change: string,
  directory: string,
  entries: readonly TreeEntry[],
  place: (entry: TreeEntry) => Promise<boolean>,
  cannotHold: (entry: TreeEntry, code: string) => void
): Promise<void> {
  const blobs = entries.filter((entry) => entry.mode !== SUBMODULE_MODE);
  let placed = 0;
  // Submodules stand between blobs in the tree's order; each is placed when the blobs before it are written.
  const placeUpTo = async (entry: TreeEntry | undefined): Promise<void> => {
    const until = entry === undefined ? entries.length : entries.indexOf(entry, placed);
    for (; placed < until; placed += 1) {
      if (entries[placed].mode === SUBMODULE_MODE) await place(entries[placed]);
    }
    if (entry !== undefined) placed = until + 1;
  };
  if (blobs.length === 0) {
    await placeUpTo(undefined);
    return;
  }
  const reader = spawn("git", ["-C", root, "cat-file", "--batch"], { cwd: root, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, ...READ_AS_STORED } });
  let errors = "";
  let pipeFailure: Error | undefined;
  reader.stderr.setEncoding("utf8");
  reader.stderr.on("data", (text: string) => {
    errors += text;
  });
  // A request still being written when the reader ends fails with EPIPE; it is the reader's end that is reported.
  reader.stdin.on("error", (error: Error) => {
    pipeFailure ??= error;
  });
  const exited = new Promise<number | null>((resolve, reject) => {
    reader.on("error", reject);
    reader.on("close", resolve);
  });
  // Settled at once, so that a reader ending while a write is awaited is never an unhandled rejection.
  const ended = exited.then(
    (code) => ({ code, error: undefined as Error | undefined }),
    (error: Error) => ({ code: null, error })
  );
  // Node writes the request as the pipe drains while the answer is read below, so neither side waits on the other.
  reader.stdin.end(blobs.map((blob) => `${blob.id}\n`).join(""));
  // Each object comes back as `<id> <type> <size>\n`, its bytes and a line break, in the order asked.
  let next = 0;
  let header = Buffer.alloc(0);
  // The object being read: its entry, the bytes still to come, and where they go, if anywhere.
  let body: { entry: TreeEntry; remaining: number; handle?: fs.FileHandle; link?: Buffer[] } | undefined;
  // The line break that follows an object's bytes, still to be passed over.
  let separator = false;
  const finish = async (): Promise<void> => {
    if (body === undefined) return;
    const { entry, handle, link } = body;
    body = undefined;
    if (handle !== undefined) await handle.close();
    if (link !== undefined) {
      try {
        await fs.symlink(Buffer.concat(link).toString("utf8"), path.join(directory, ...entry.parts));
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === undefined || !NAME_FAILURES.has(code)) throw error;
        cannotHold(entry, code);
      }
    }
    next += 1;
    separator = true;
  };
  const open = async (entry: TreeEntry): Promise<fs.FileHandle | undefined> => {
    try {
      // `wx` makes the file or fails where anything stands, a link included, so nothing is written through one.
      return await fs.open(path.join(directory, ...entry.parts), "wx", entry.mode === EXECUTABLE_MODE ? 0o777 : 0o666);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === undefined || !NAME_FAILURES.has(code)) throw error;
      cannotHold(entry, code);
      return undefined;
    }
  };
  try {
    for await (const chunk of reader.stdout as AsyncIterable<Buffer>) {
      let at = 0;
      while (at < chunk.length) {
        if (separator) {
          at += 1;
          separator = false;
          continue;
        }
        if (body !== undefined) {
          const piece = chunk.subarray(at, at + body.remaining);
          if (body.handle !== undefined) await body.handle.write(piece);
          else body.link?.push(Buffer.from(piece));
          body.remaining -= piece.length;
          at += piece.length;
          if (body.remaining === 0) await finish();
          continue;
        }
        const lineEnd = chunk.indexOf(0x0a, at);
        if (lineEnd < 0) {
          header = Buffer.concat([header, chunk.subarray(at)]);
          break;
        }
        const line = Buffer.concat([header, chunk.subarray(at, lineEnd)]).toString("utf8");
        header = Buffer.alloc(0);
        at = lineEnd + 1;
        const [id, type, size] = line.split(" ");
        const entry = blobs.at(next);
        if (entry === undefined || id !== entry.id || type !== "blob") {
          throw new Error(`git cat-file answered ${JSON.stringify(line)} where the blob ${entry?.id ?? "(none)"} of ${change} was asked for`);
        }
        await placeUpTo(entry);
        const wanted = await place(entry);
        body = { entry, remaining: Number(size), ...(wanted ? (entry.mode === LINK_MODE ? { link: [] } : { handle: await open(entry) }) : {}) };
        if (body.remaining === 0) await finish();
      }
    }
    await placeUpTo(undefined);
  } catch (error) {
    await body?.handle?.close().catch(() => undefined);
    reader.kill();
    await ended;
    throw error;
  }
  const { code, error } = await ended;
  if (error !== undefined) throw error;
  if (code !== 0) {
    throw new Error(`git cat-file failed for ${change} (exit ${code}): ${errors.trim() || pipeFailure?.message || "no word"}`);
  }
  if (next !== blobs.length) {
    throw new Error(`git cat-file gave ${next} of the ${blobs.length} blobs of ${change}`);
  }
}

/** The changes of `git rev-list --format` with the mainline's format, oldest first as listed. */
export function parseMainline(output: string): MainlineChange[] {
  const changes: MainlineChange[] = [];
  // Each record follows the `commit <id>` line rev-list writes; it ends at the next line break.
  for (const chunk of output.split(RECORD).slice(1)) {
    const line = chunk.split("\n", 1)[0];
    const [id, parents, date, author, subject] = line.split(FIELD);
    changes.push({ id, parents: parents.split(" ").filter(Boolean), date, author, subject: subject ?? "" });
  }
  return changes;
}

/** The changes the tags of `git for-each-ref --format='%(objectname) %(*objectname)'` name: an annotated tag's peeled change, a light tag's own. */
export function parseTags(output: string): Set<string> {
  const changes = new Set<string>();
  for (const line of output.split("\n")) {
    const [object, peeled] = line.trim().split(" ");
    if (object) {
      changes.add(peeled || object);
    }
  }
  return changes;
}

/** The renames and content changes of `git diff --name-status -z`. */
export function parseNameStatus(output: string): VersionChanges {
  const changes: VersionChanges = { renamed: [], modified: [] };
  const fields = output.split("\0");
  for (let index = 0; index < fields.length && fields[index] !== ""; ) {
    const status = fields[index];
    if (status.startsWith("R") || status.startsWith("C")) {
      if (status.startsWith("R")) {
        changes.renamed.push([fields[index + 1], fields[index + 2]]);
      }
      index += 3;
      continue;
    }
    if (status === "M" || status === "T") {
      changes.modified.push(fields[index + 1]);
    }
    index += 2;
  }
  return changes;
}
