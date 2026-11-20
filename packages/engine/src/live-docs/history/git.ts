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
 * Nothing is written outside the tree's folder whatever the commit holds.
 * No symbolic link is ever written: a link to a file of the tree is written as
 * a copy of that file, any other is left out and named (since 2026-11-19).
 * The disk itself is asked, without following a link, once for each folder,
 * so that an entry beneath a file, one whose name the disk already holds by
 * its own rule of names (case, normalization, short names), or one whose name
 * the disk or the platform cannot hold is left out and named, and the summary
 * says it was not read; a third review found that a folding rule of this
 * module's own missed what APFS and NTFS take for one name. Every name of the
 * commit stands; a file the caller says no reader reads is written empty.
 * Blobs are streamed to disk rather than held whole; every failure of the
 * reader ends in one rejection; and every call reads the commit as stored,
 * the repository's replacement objects set aside.
 *
 * @module
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { execFileAsync } from "../gitUtils";
import type { MainlineChange, MainlineEnd, VersionChanges, VersionControl, WorkingTree, WorkingTreeOptions } from "./versionControl";

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
   * is tracked, and a tracked file is never ignored. A tree is brought to another change by {@link WorkingTree.bringTo}.
   */
  async workingTree(change: string, directory: string, options?: WorkingTreeOptions): Promise<WorkingTree> {
    await fs.mkdir(directory);
    return this.treeAt(change, directory, async () => ({ ...(await writeTreeAnew(this.root, change, directory, options)), broughtForward: false }));
  }

  /**
   * The tree `write` leaves at `directory` for the change, with the change's index read beside it, `<directory>.index`.
   *
   * @remarks
   * A tree is brought to its next change under a new name, the folder renamed first (one call, whatever it holds), so
   * that no file's absolute path at one change is its path at another: the language adapters keep what they read of a
   * file by its absolute path for the life of a process, guarded by its modification time alone or by nothing (the
   * record of 2026-11-20, `Probes/history-rebuild-speed`, section 7), and a process that summarizes change after change
   * must never meet a path it read at another change. Where the rename is refused, as Windows refuses it while another
   * process holds a file of the folder open, the new change's tree is written anew under the new name, and the old
   * folder is left to whoever made the folder above it to remove.
   */
  private async treeAt(change: string, directory: string, write: () => Promise<WrittenTree & { broughtForward: boolean }>): Promise<WorkingTree> {
    const index = `${directory}.index`;
    let removal: Promise<void> | undefined;
    // A signal and the worker's finally may both release the same tree. They share one operation and its result.
    const remove = (): Promise<void> => (removal ??= Promise.all([fs.rm(directory, { recursive: true, force: true }), fs.rm(index, { force: true })]).then(() => undefined));
    let tree: WrittenTree & { broughtForward: boolean };
    try {
      await this.git(["read-tree", change], { GIT_INDEX_FILE: index });
      tree = await write();
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
    return {
      root: directory,
      environment,
      unwritten: tree.unwritten,
      broughtForward: tree.broughtForward,
      remove,
      bringTo: async (next, to, options) => {
        await fs.rm(index, { force: true });
        let moved = true;
        try {
          await fs.rename(directory, to);
        } catch {
          moved = false;
          await fs.mkdir(to);
          await fs.rm(directory, { recursive: true, force: true }).catch(() => undefined);
        }
        return this.treeAt(next, to, async () => {
          const brought = moved ? await bringTreeForward(this.root, next, to, tree.written, options) : undefined;
          if (brought !== undefined) return { ...brought, broughtForward: true };
          if (moved) {
            await fs.rm(to, { recursive: true, force: true });
            await fs.mkdir(to);
          }
          return { ...(await writeTreeAnew(this.root, next, to, options)), broughtForward: false };
        });
      }
    };
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
export async function placeEntry(parts: readonly string[], disk: TreeDisk, folders: Set<string> = new Set()): Promise<string | undefined> {
  try {
    for (let depth = 1; depth < parts.length; depth += 1) {
      const folder = parts.slice(0, depth).join("/");
      // A folder this writer made or found is one still: it never replaces one, and nothing else writes in the tree meanwhile.
      if (folders.has(folder)) continue;
      const standing = await disk.entry(folder);
      if (standing === "absent") {
        await disk.makeFolder(folder);
      } else if (standing !== "folder") {
        return `it lies beneath ${folder}, which is ${standing === "link" ? "a symbolic link" : "a file"} on this disk, and nothing is written through it`;
      }
      folders.add(folder);
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
  /** Written as an empty file: its name stands, and no reader reads its content (`WorkingTreeOptions.contentless`). */
  empty?: true;
}

/** How many symbolic links one is followed through before it is taken for a cycle. */
const LINK_HOPS = 8;

/** Where a symbolic link of a commit's tree leads, read through the tree's own listing and never through the disk. */
export type LinkEnd = { file: { mode: string; id: string } } | { reason: string };

/**
 * Follows a symbolic link of a commit's tree to what it names, through the commit's own listing and as the disk would:
 * one part of the path at a time, a link met on the way followed before the next part, so that a `..` after a link
 * climbs from where the link leads (`l -> a/b/../z.txt` with `a/b -> ../x/y` reads `x/z.txt`). Up to {@link LINK_HOPS}
 * links are followed. A link that reaches a regular file of the tree gives that file's mode and blob; any other gives
 * the reason it is not followed.
 *
 * @param link - The link's repository-relative path.
 * @param listing - Every entry of the commit's tree by its path: its mode and object id.
 * @param targets - Each link's target as its blob holds it, by the link's path.
 */
export function followLink(link: string, listing: ReadonlyMap<string, { mode: string; id: string }>, targets: ReadonlyMap<string, string>): LinkEnd {
  const folders = foldersOf(listing);
  // The parts resolved so far, from the tree's root, and the parts still to take.
  const resolved: string[] = [];
  let remaining = link.split("/");
  let hops = 0;
  while (remaining.length > 0) {
    const part = remaining.shift()!;
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (resolved.length === 0) return { reason: OUT_OF_TREE };
      resolved.pop();
      continue;
    }
    resolved.push(part);
    const here = resolved.join("/");
    const entry = listing.get(here);
    if (entry?.mode === LINK_MODE) {
      if (hops === LINK_HOPS) return { reason: `it is a symbolic link in a chain that does not end within ${LINK_HOPS} links, a cycle or longer` };
      hops += 1;
      const target = targets.get(here) ?? "";
      if (target === "" || target.includes("\0")) return { reason: NOTHING };
      if (target.startsWith("/") || /^[A-Za-z]:/u.test(target)) return { reason: OUT_OF_TREE };
      // The link's own part gives way to its target, read from the folder the link stands in.
      resolved.pop();
      remaining = [...target.split("/"), ...remaining];
      continue;
    }
    // A file or a submodule with more of the path after it: the path leads nowhere.
    if (entry !== undefined && remaining.some((rest) => rest !== "" && rest !== ".")) return { reason: NOTHING };
  }
  const at = resolved.join("/");
  const entry = listing.get(at);
  if (entry !== undefined && (entry.mode === FILE_MODE || entry.mode === EXECUTABLE_MODE)) return { file: entry };
  if (entry?.mode === SUBMODULE_MODE || folders.has(at) || at === "") return { reason: TO_FOLDER };
  return { reason: NOTHING };
}

const OUT_OF_TREE = "it is a symbolic link out of the tree, which the history does not follow";
const NOTHING = "it is a symbolic link to nothing the commit holds";
const TO_FOLDER =
  "it is a symbolic link to a folder, which the history does not follow: what is read through it reads as gone, an import through it is not resolved, and the check at the head of such a history fails";

const folderCache = new WeakMap<ReadonlyMap<string, unknown>, Set<string>>();

/** Every folder a listing's entries lie in, by its path, made once a listing. */
function foldersOf(listing: ReadonlyMap<string, unknown>): Set<string> {
  let folders = folderCache.get(listing);
  if (folders === undefined) {
    folders = new Set<string>();
    for (const entry of listing.keys()) {
      const parts = entry.split("/");
      for (let depth = 1; depth < parts.length; depth += 1) folders.add(parts.slice(0, depth).join("/"));
    }
    folderCache.set(listing, folders);
  }
  return folders;
}

/** The blobs of the given ids, whole, by id: for the targets of symbolic links, which are short. */
async function readSmallBlobs(root: string, ids: readonly string[]): Promise<Map<string, Buffer>> {
  const found = new Map<string, Buffer>();
  if (ids.length === 0) return found;
  const reader = spawn("git", ["-C", root, "cat-file", "--batch"], { cwd: root, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, ...READ_AS_STORED } });
  const chunks: Buffer[] = [];
  let errors = "";
  reader.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
  reader.stderr.setEncoding("utf8");
  reader.stderr.on("data", (text: string) => {
    errors += text;
  });
  reader.stdin.on("error", () => undefined);
  const code = await new Promise<number | null>((resolve, reject) => {
    reader.on("error", reject);
    reader.on("close", resolve);
    reader.stdin.end(ids.map((id) => `${id}\n`).join(""));
  });
  if (code !== 0) throw new Error(`git cat-file failed reading the targets of symbolic links (exit ${code}): ${errors.trim() || "no word"}`);
  const all = Buffer.concat(chunks);
  let at = 0;
  for (const id of ids) {
    const lineEnd = all.indexOf(0x0a, at);
    const [answered, type, size] = all.subarray(at, lineEnd).toString("utf8").split(" ");
    if (answered !== id || type !== "blob") throw new Error(`git cat-file answered ${answered} ${type} where the blob ${id} was asked for`);
    found.set(id, all.subarray(lineEnd + 1, lineEnd + 1 + Number(size)));
    at = lineEnd + 1 + Number(size) + 1;
  }
  return found;
}

/**
 * Writes every entry of a change's tree under `directory` as the repository stores it: a file's blob bytes, executable
 * where its mode says so, streamed to disk as git gives them; an empty folder where another repository's commit
 * stands, as a checkout leaves a submodule it has not initialized; an empty file where the caller asks for its name
 * without its content (`contentless`); and, for a symbolic link that leads through the commit's own listing to a file
 * of the tree ({@link followLink}), a copy of that file, so that no link is ever on the disk and a reader finds at the
 * link's path what it finds in a checkout.
 *
 * Nothing is ever written outside `directory`, and no entry stops the tree. An entry is left out, and returned with the
 * reason, when it is a symbolic link out of the tree, to a folder or to nothing, in a chain that does not end, or at
 * or above the docs root the caller names (until 2026-11-19 links were written as links, and a link at the
 * docs root carried the generator's writes and pruning outside the scratch folder; for one day after, no link was
 * written at all, and the files and documents links stood for dropped out of the history); when its path would leave
 * the directory or name a `.git`; when the platform cannot hold its name; when the disk, asked once for each folder
 * ({@link placeEntry}), has a file where one of its folders goes, or already holds something at its name, as a disk
 * that takes `A` and `a`, or `s` and `ſ`, for one name may; or when the disk cannot hold its name. Of two entries that
 * clash, the first in the tree's order is written.
 *
 * @param disk - The disk, asked; the real one under `directory` unless a test stands one in.
 * @returns The entries not written, in the tree's order.
 */
export async function writeStoredTree(
  root: string,
  change: string,
  directory: string,
  options?: WorkingTreeOptions & { platform?: NodeJS.Platform; disk?: TreeDisk }
): Promise<UnwrittenEntry[]> {
  return (await writeTreeAnew(root, change, directory, options)).unwritten;
}

/** What the writer left on the disk of a change's tree: every entry it wrote, by its repository-relative path. */
export type WrittenEntries = ReadonlyMap<string, Readonly<TreeEntry>>;

/** A tree as the writer left it: the entries left out, in the tree's order, and those written. */
export interface WrittenTree {
  unwritten: UnwrittenEntry[];
  written: WrittenEntries;
}

/** {@link writeStoredTree}, with what it wrote, which {@link bringTreeForward} starts from. */
export async function writeTreeAnew(
  root: string,
  change: string,
  directory: string,
  options?: WorkingTreeOptions & { platform?: NodeJS.Platform; disk?: TreeDisk }
): Promise<WrittenTree> {
  return writePlan(root, change, directory, await planTree(root, change, options), options?.disk ?? realDisk(directory), new Set());
}

/** A change's tree as the writer means to write it: the entries it writes, in the tree's order, and those its listing refuses, with why. */
interface TreePlan {
  entries: TreeEntry[];
  refused: UnwrittenEntry[];
  /** Each path's place in the tree's order, by which the entries left out are listed. */
  position: Map<string, number>;
}

/**
 * The entries of a change's tree the writer writes, and those it refuses by the listing alone: every rule of {@link
 * writeStoredTree} that does not ask the disk.
 */
async function planTree(root: string, change: string, options?: WorkingTreeOptions & { platform?: NodeJS.Platform }): Promise<TreePlan> {
  const platform = options?.platform ?? process.platform;
  const contentless = options?.contentless ?? ((): boolean => false);
  const docsRoot = options?.docsRoot;
  const listing = (await execFileAsync("git", ["-C", root, "ls-tree", "-r", "-z", "--full-tree", change], { cwd: root, maxBuffer: LARGEST_OUTPUT, env: READ_AS_STORED })).stdout;
  const refused: UnwrittenEntry[] = [];
  const entries: TreeEntry[] = [];
  const named = new Set<string>();
  const position = new Map<string, number>();
  const listed: Array<{ mode: string; id: string; relative: string }> = [];
  for (const line of listing.split("\0")) {
    if (line === "") continue;
    // Each entry is `<mode> <type> <id>\t<path>`.
    const tab = line.indexOf("\t");
    const [mode, , id] = line.slice(0, tab).split(" ");
    listed.push({ mode, id, relative: line.slice(tab + 1) });
  }
  // The commit's own listing, which a link is followed through, never the disk.
  const byPath = new Map(listed.map(({ mode, id, relative }) => [relative, { mode, id }]));
  const links = listed.filter((entry) => entry.mode === LINK_MODE);
  const linkBlobs = await readSmallBlobs(root, [...new Set(links.map((entry) => entry.id))]);
  const targets = new Map(links.map((entry) => [entry.relative, linkBlobs.get(entry.id)?.toString("utf8") ?? ""]));
  // A copy at the docs root or above it would stand where the generator needs a folder; beneath it a copy is a plain file.
  const atOrAboveDocsRoot = (relative: string): boolean => docsRoot !== undefined && (relative === docsRoot || docsRoot.startsWith(`${relative}/`));
  for (const { mode, id, relative } of listed) {
    if (!position.has(relative)) position.set(relative, position.size);
    const parts = relative.split("/");
    if (parts.some((part) => part === "" || part === "." || part === ".." || part.toLowerCase() === ".git")) {
      refused.push({ path: relative, reason: "its path would leave the tree or name a .git, which git refuses to check out" });
    } else if (platform === "win32" && parts.some((part) => WINDOWS_FORBIDDEN.test(part))) {
      refused.push({ path: relative, reason: "its name cannot be written on Windows, where git refuses to check it out" });
    } else if (mode !== FILE_MODE && mode !== EXECUTABLE_MODE && mode !== SUBMODULE_MODE && mode !== LINK_MODE) {
      refused.push({ path: relative, reason: `its mode ${mode} is one no checkout writes` });
    } else if (relative.includes("�")) {
      // Git's listing is read as UTF-8, so a name that is not would be written under another name than its own.
      refused.push({ path: relative, reason: "its name is not valid UTF-8, so it cannot be written under its own name" });
    } else if (named.has(relative)) {
      refused.push({ path: relative, reason: "the tree names it twice" });
    } else if (mode === LINK_MODE && atOrAboveDocsRoot(relative)) {
      refused.push({ path: relative, reason: "it is a symbolic link at or above the docs root, where the generator needs a folder, which the history does not follow" });
    } else if (mode === LINK_MODE) {
      // A link to a file of the tree is written as a copy of that file, so that a reader finds there what it finds in
      // a checkout and nothing is ever written or read through a link; any other is named.
      const end = followLink(relative, byPath, targets);
      if ("reason" in end) {
        refused.push({ path: relative, reason: end.reason });
      } else {
        named.add(relative);
        entries.push({ mode: end.file.mode, id: end.file.id, relative, parts, ...(contentless(relative) ? { empty: true as const } : {}) });
      }
    } else {
      named.add(relative);
      entries.push({ mode, id, relative, parts, ...(mode !== SUBMODULE_MODE && contentless(relative) ? { empty: true as const } : {}) });
    }
  }
  return { entries, refused, position };
}

/**
 * Writes a plan's entries under `directory`, asking the disk before each ({@link placeEntry}), and returns every entry
 * left out, the listing's and the disk's, in the tree's order, and every entry written.
 *
 * @param folders - The folders the writer may take as standing without asking the disk: none for a tree written anew.
 */
async function writePlan(root: string, change: string, directory: string, plan: TreePlan, disk: TreeDisk, folders: Set<string>): Promise<{ unwritten: UnwrittenEntry[]; written: Map<string, TreeEntry> }> {
  const unwritten: UnwrittenEntry[] = [...plan.refused];
  const left = new Set<string>();
  const leaveOut = (entry: TreeEntry, reason: string): void => {
    unwritten.push({ path: entry.relative, reason });
    left.add(entry.relative);
  };
  // An entry that becomes no folder or file of its own: one refused, or a submodule's empty folder.
  const place = async (entry: TreeEntry): Promise<boolean> => {
    const reason = await placeEntry(entry.parts, disk, folders);
    if (reason !== undefined) {
      leaveOut(entry, reason);
      return false;
    }
    if (entry.mode === SUBMODULE_MODE) {
      try {
        await disk.makeFolder(entry.relative);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === undefined || !NAME_FAILURES.has(code)) throw error;
        leaveOut(entry, `this disk cannot hold its name (${code})`);
      }
      return false;
    }
    return true;
  };
  await writeBlobs(root, change, directory, plan.entries, place, (entry, code) => leaveOut(entry, `this disk cannot hold its name (${code})`));
  const written = new Map(plan.entries.filter((entry) => !left.has(entry.relative)).map((entry) => [entry.relative, entry]));
  // In the tree's order, whether an entry was refused by its name or by the disk.
  return { unwritten: unwritten.sort((a, b) => (plan.position.get(a.path) ?? 0) - (plan.position.get(b.path) ?? 0)), written };
}

/**
 * Brings a tree the writer wrote for one change to another change in place, so that it holds what {@link
 * writeStoredTree} writes for that change into an empty folder: file for file, byte for byte, mode for mode, and
 * nothing else. The two changes' plans are compared, not git's word between the commits, so that the tree's own rules
 * stay their single source and a link whose target changed, or a file written empty, is seen as the entry it writes.
 * Every entry the old tree holds otherwise than the new change's plan writes it (another blob, mode or emptiness, or
 * not at all) is removed, and so is every folder no entry of the new change lies in, the deepest first; the docs root,
 * where the generator wrote and pruned, is removed whole; then every entry the plan writes and the old tree does not
 * hold so is written, in the tree's order, the disk asked before each as for a tree written anew.
 *
 * @remarks
 * A tree written anew settles a clash of two names the disk takes for one by the tree's order, the first written; a
 * tree brought forward could settle it otherwise, since the name standing may be the later one. So wherever the disk
 * refuses an entry the listing did not, or a folder that should be empty is not, or something the old tree held is
 * not there, the tree is not brought forward and the caller writes it anew: a tree brought forward never holds an
 * entry the disk refused. The generator writes only under the docs root (the record of 2026-11-20,
 * `Probes/history-rebuild-fast`, and `history-tree-forward.test.ts`, which holds a tree brought forward to the tree
 * written anew with the generator run between).
 *
 * @param previous - What the writer wrote of the old change, as this function or {@link writeTreeAnew} returned it.
 * @returns The new change's tree as written, or undefined where it was not brought forward, the folder then in no
 *   state to be read.
 */
export async function bringTreeForward(
  root: string,
  change: string,
  directory: string,
  previous: WrittenEntries,
  options?: WorkingTreeOptions & { platform?: NodeJS.Platform; disk?: TreeDisk }
): Promise<WrittenTree | undefined> {
  const docsRoot = options?.docsRoot;
  // Without a docs root inside the tree, nothing says where the generator wrote.
  if (docsRoot === undefined) return undefined;
  const within = (file: string): boolean => file === docsRoot || file.startsWith(`${docsRoot}/`);
  const plan = await planTree(root, change, options);
  const next = new Map(plan.entries.map((entry) => [entry.relative, entry]));
  const kept = new Map<string, TreeEntry>();
  const gone: Array<Readonly<TreeEntry>> = [];
  for (const [file, entry] of previous) {
    if (within(file)) continue;
    const wanted = next.get(file);
    if (wanted !== undefined && wanted.mode === entry.mode && wanted.id === entry.id && wanted.empty === entry.empty) kept.set(file, wanted);
    else gone.push(entry);
  }
  try {
    await fs.rm(path.join(directory, ...docsRoot.split("/")), { recursive: true, force: true });
    for (const entry of gone) {
      const at = path.join(directory, ...entry.parts);
      if (entry.mode === SUBMODULE_MODE) await fs.rmdir(at);
      else await fs.unlink(at);
    }
    // Every folder the old tree made that no entry of the new one lies in goes, the deepest first; one not empty means
    // the tree holds what its writer did not write.
    const needed = foldersOf(next);
    const standing = [...foldersOf(previous)].filter((folder) => !needed.has(folder) && !within(folder));
    for (const folder of standing.sort((a, b) => b.split("/").length - a.split("/").length)) {
      await fs.rmdir(path.join(directory, ...folder.split("/")));
    }
    // The folders above the docs root the generator made, where the change holds none, the deepest first.
    const above = docsRoot.split("/").slice(0, -1).map((_part, depth, parts) => parts.slice(0, depth + 1).join("/"));
    for (const folder of above.reverse().filter((folder) => !needed.has(folder) && !standing.includes(folder))) {
      await fs.rmdir(path.join(directory, ...folder.split("/"))).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== undefined && GIVE_UP.has(code)) return undefined;
    throw error;
  }
  // The folders that stand: every folder a kept entry lies in, outside the docs root.
  const folders = new Set([...foldersOf(kept)].filter((folder) => !within(folder)));
  const toWrite = plan.entries.filter((entry) => !kept.has(entry.relative));
  let tree: Awaited<ReturnType<typeof writePlan>>;
  try {
    tree = await writePlan(root, change, directory, { entries: toWrite, refused: plan.refused, position: plan.position }, options?.disk ?? realDisk(directory), folders);
  } catch (error) {
    // A folder taken as standing that is not (a disk that took the docs root and a kept folder for one name removed
    // both), or a file Windows will not yet let be made again: the tree is written anew.
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== undefined && GIVE_UP.has(code)) return undefined;
    throw error;
  }
  const { unwritten, written } = tree;
  // An entry the disk refused: a tree written anew settles it by the tree's order.
  if (unwritten.length !== plan.refused.length) return undefined;
  for (const [file, entry] of kept) written.set(file, entry);
  // A name no writer of the tree made, a leftover outside the docs root say, would enter the next summary unseen.
  if (!(await holdsOnly(directory, written))) return undefined;
  return { unwritten, written };
}

/**
 * Whether the names under `directory` are exactly those a tree's writer made: a file for each entry written but a
 * submodule, a folder for each submodule and for each folder an entry lies in, and nothing else. Names only, read by
 * one walk of the folders, never a file's bytes.
 */
async function holdsOnly(directory: string, written: WrittenEntries): Promise<boolean> {
  const folders = new Set(foldersOf(written));
  let files = 0;
  for (const entry of written.values()) {
    if (entry.mode === SUBMODULE_MODE) folders.add(entry.relative);
    else files += 1;
  }
  let foundFiles = 0;
  let foundFolders = 0;
  for (const found of await fs.readdir(directory, { recursive: true, withFileTypes: true })) {
    const relative = path.relative(directory, path.join(found.parentPath, found.name)).split(path.sep).join("/");
    if (found.isDirectory()) {
      if (!folders.has(relative)) return false;
      foundFolders += 1;
    } else if (found.isFile()) {
      const entry = written.get(relative);
      if (entry === undefined || entry.mode === SUBMODULE_MODE) return false;
      foundFiles += 1;
    } else {
      return false;
    }
  }
  return foundFiles === files && foundFolders === folders.size;
}

/**
 * The failures in bringing a tree forward that mean the tree is not as its writer left it, or the disk will not let it
 * be put right in place (Windows refuses to remove what another process holds open): the tree is written anew.
 */
const GIVE_UP = new Set(["ENOENT", "ENOTEMPTY", "EEXIST", "ENOTDIR", "EISDIR", "EPERM", "EBUSY", "EACCES"]);

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
  const blobs = entries.filter((entry) => entry.mode !== SUBMODULE_MODE && entry.empty !== true);
  const open = async (entry: TreeEntry): Promise<fs.FileHandle | undefined> => {
    try {
      // `wx` makes the file or fails where anything stands, so nothing is written over another entry.
      return await fs.open(path.join(directory, ...entry.parts), "wx", entry.mode === EXECUTABLE_MODE ? 0o777 : 0o666);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === undefined || !NAME_FAILURES.has(code)) throw error;
      cannotHold(entry, code);
      return undefined;
    }
  };
  let placed = 0;
  // Submodules and empty files stand between blobs in the tree's order; each is placed when the blobs before it are
  // written, and an empty file made there without its blob being asked for.
  const placeUpTo = async (entry: TreeEntry | undefined): Promise<void> => {
    const until = entry === undefined ? entries.length : entries.indexOf(entry, placed);
    for (; placed < until; placed += 1) {
      const between = entries[placed];
      if (between.mode === SUBMODULE_MODE) await place(between);
      else if (between.empty === true && (await place(between))) await (await open(between))?.close();
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
  let body: { entry: TreeEntry; remaining: number; handle?: fs.FileHandle } | undefined;
  // The line break that follows an object's bytes, still to be passed over.
  let separator = false;
  const finish = async (): Promise<void> => {
    if (body === undefined) return;
    const { handle } = body;
    body = undefined;
    if (handle !== undefined) await handle.close();
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
        body = { entry, remaining: Number(size), ...(wanted ? { handle: await open(entry) } : {}) };
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
