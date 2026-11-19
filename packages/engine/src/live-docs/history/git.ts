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
 * folder whatever the commit holds: an entry beneath a link or a file the tree
 * made, one clashing by case on a disk that does not tell cases apart (probed,
 * not assumed by platform), or one whose name the platform cannot hold is
 * left out and named, so that the summary says it was not read; blobs are
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

/** What decides which names a working tree's disk can hold apart; read from the disk when not given. */
export interface TreeDisk {
  /** Whether the disk takes two names that differ only in case for the same file. */
  caseInsensitive: boolean;
  /** The platform, whose path rules decide which names may be written at all. */
  platform: NodeJS.Platform;
}

// Windows's rules for a name, as Git for Windows applies them (`core.protectNTFS`): no separator, drive mark or
// character the file system forbids, no trailing dot or space, and no device name.
// eslint-disable-next-line no-control-regex -- the control characters are what Windows forbids in a name
const WINDOWS_FORBIDDEN = /[\\:<>"|?*\u0000-\u001f]|[. ]$|^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$/iu;

/**
 * Whether a folder's disk takes two names that differ only in case for the same file: a probe written under one case
 * and looked for under the other.
 */
export async function caseInsensitiveDisk(folder: string): Promise<boolean> {
  const name = `.Case-Probe-${process.pid}-${Math.random().toString(36).slice(2)}`;
  const probe = path.join(folder, name);
  await fs.writeFile(probe, "");
  try {
    await fs.lstat(path.join(folder, name.toLowerCase()));
    return true;
  } catch {
    return false;
  } finally {
    await fs.rm(probe, { force: true });
  }
}

/**
 * Writes every entry of a change's tree under `directory` as the repository stores it: a file's blob bytes, executable
 * where its mode says so, streamed to disk as git gives them; a symbolic link to the target its blob holds; an empty
 * folder where another repository's commit stands, as a checkout leaves a submodule it has not initialized.
 *
 * Nothing is ever written outside `directory`. An entry is not written, and is returned with the reason, when its path
 * would leave the directory or name a `.git`; when the platform cannot hold its name; when it lies beneath a link or a
 * file of the tree, as a tree holding both `a` as a link and `a/x` does, or `A` as a link and `a/x` on a disk that
 * takes `A` and `a` for one name; or when it names a path already written, under another case on such a disk. Of two
 * entries that clash, the first in the tree's order is written.
 *
 * @returns The entries not written, in the tree's order.
 */
export async function writeStoredTree(root: string, change: string, directory: string, given?: Partial<TreeDisk>): Promise<UnwrittenEntry[]> {
  const disk: TreeDisk = {
    caseInsensitive: given?.caseInsensitive ?? (await caseInsensitiveDisk(path.dirname(directory))),
    platform: given?.platform ?? process.platform
  };
  const listing = (await execFileAsync("git", ["-C", root, "ls-tree", "-r", "-z", "--full-tree", change], { cwd: root, maxBuffer: LARGEST_OUTPUT, env: READ_AS_STORED })).stdout;
  const fold = (relative: string): string => (disk.caseInsensitive ? relative.toLowerCase() : relative);
  // What each path written so far is, by its folded path: a file or a link, which nothing may lie beneath, or a folder.
  const written = new Map<string, { kind: "file" | "link" | "folder"; path: string }>();
  const unwritten: UnwrittenEntry[] = [];
  const blobs: Array<{ mode: string; id: string; file: string }> = [];
  for (const entry of listing.split("\0")) {
    if (entry === "") continue;
    // Each entry is `<mode> <type> <id>\t<path>`.
    const tab = entry.indexOf("\t");
    const [mode, , id] = entry.slice(0, tab).split(" ");
    const relative = entry.slice(tab + 1);
    const parts = relative.split("/");
    const refuse = (reason: string): void => {
      unwritten.push({ path: relative, reason });
    };
    if (parts.some((part) => part === "" || part === "." || part === ".." || part.toLowerCase() === ".git")) {
      refuse("its path would leave the tree or name a .git, which git refuses to check out");
      continue;
    }
    if (disk.platform === "win32" && parts.some((part) => WINDOWS_FORBIDDEN.test(part))) {
      refuse("its name cannot be written on Windows, where git refuses to check it out");
      continue;
    }
    if (mode !== FILE_MODE && mode !== EXECUTABLE_MODE && mode !== LINK_MODE && mode !== SUBMODULE_MODE) {
      refuse(`its mode ${mode} is one no checkout writes`);
      continue;
    }
    const beneath = parts.slice(0, -1).map((_, index) => written.get(fold(parts.slice(0, index + 1).join("/")))).find((parent) => parent !== undefined && parent.kind !== "folder");
    if (beneath !== undefined) {
      refuse(`it lies beneath the ${beneath.kind === "link" ? "symbolic link" : "file"} ${beneath.path}, which nothing is written through`);
      continue;
    }
    const same = written.get(fold(relative));
    if (same !== undefined) {
      refuse(same.path === relative ? "the tree names it twice" : `it names the same file as ${same.path} on this disk, which does not tell their cases apart`);
      continue;
    }
    for (let index = 1; index < parts.length; index += 1) {
      const folder = parts.slice(0, index).join("/");
      if (!written.has(fold(folder))) written.set(fold(folder), { kind: "folder", path: folder });
    }
    const file = path.join(directory, ...parts);
    if (mode === SUBMODULE_MODE) {
      written.set(fold(relative), { kind: "folder", path: relative });
      await fs.mkdir(file, { recursive: true });
    } else {
      written.set(fold(relative), { kind: mode === LINK_MODE ? "link" : "file", path: relative });
      blobs.push({ mode, id, file });
    }
  }
  if (blobs.length > 0) {
    await writeBlobs(root, change, blobs);
  }
  return unwritten;
}

/**
 * Asks `git cat-file --batch` for each blob in turn and writes each as it comes, a file's bytes streamed to disk chunk
 * by chunk so that no blob is held whole. Every failure, the reader's, its pipes' or a write's, ends the reader and
 * rejects once, with the first failure.
 */
async function writeBlobs(root: string, change: string, blobs: ReadonlyArray<{ mode: string; id: string; file: string }>): Promise<void> {
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
  // The object being written: its blob, the bytes still to come, and where they go.
  let body: { blob: (typeof blobs)[number]; remaining: number; handle?: fs.FileHandle; link?: Buffer[] } | undefined;
  // The line break that follows an object's bytes, still to be passed over.
  let separator = false;
  const finish = async (): Promise<void> => {
    if (body === undefined) return;
    const { blob, handle, link } = body;
    body = undefined;
    if (handle !== undefined) await handle.close();
    if (link !== undefined) await fs.symlink(Buffer.concat(link).toString("utf8"), blob.file);
    next += 1;
    separator = true;
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
          else body.link!.push(Buffer.from(piece));
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
        const blob = blobs.at(next);
        if (blob === undefined || id !== blob.id || type !== "blob") {
          throw new Error(`git cat-file answered ${JSON.stringify(line)} where the blob ${blob?.id ?? "(none)"} of ${change} was asked for`);
        }
        await fs.mkdir(path.dirname(blob.file), { recursive: true });
        body =
          blob.mode === LINK_MODE
            ? { blob, remaining: Number(size), link: [] }
            : { blob, remaining: Number(size), handle: await fs.open(blob.file, "wx", blob.mode === EXECUTABLE_MODE ? 0o777 : 0o666) };
        if (body.remaining === 0) await finish();
      }
    }
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
