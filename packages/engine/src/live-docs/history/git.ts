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
   * names was left out. The same environment keeps the person's own configuration of git from that process, though
   * git's answer could not depend on it: every file the tree holds is tracked, and a tracked file is never ignored.
   */
  async workingTree(change: string, directory: string): Promise<WorkingTree> {
    const index = `${directory}.index`;
    await fs.mkdir(directory);
    let removal: Promise<void> | undefined;
    // A signal and the worker's finally may both release the same tree. They share one operation and its result.
    const remove = (): Promise<void> => (removal ??= Promise.all([fs.rm(directory, { recursive: true, force: true }), fs.rm(index, { force: true })]).then(() => undefined));
    try {
      await this.git(["read-tree", change], { GIT_INDEX_FILE: index });
      await writeStoredTree(this.root, change, directory);
    } catch (error) {
      await remove();
      throw error;
    }
    this.gitDirectory ??= this.git(["rev-parse", "--path-format=absolute", "--git-common-dir"]).then((output) => output.trim());
    const environment = { GIT_DIR: await this.gitDirectory, GIT_WORK_TREE: directory, GIT_INDEX_FILE: index, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: os.devNull };
    return { root: directory, environment, remove };
  }

  private gitDirectory: Promise<string> | undefined;

  async changesBetween(from: string, to: string): Promise<VersionChanges> {
    return parseNameStatus(
      await this.git(["-c", "diff.relative=false", "diff", "--no-ext-diff", "--name-status", "-z", "-M50%", "-l0", from, to])
    );
  }

  private async git(args: readonly string[], env?: Record<string, string>): Promise<string> {
    return (await execFileAsync("git", ["-C", this.root, ...args], { cwd: this.root, maxBuffer: LARGEST_OUTPUT, env })).stdout;
  }
}

/** The modes of a tree's entries: a file, an executable file, a symbolic link, and another repository's commit. */
const FILE_MODE = "100644";
const EXECUTABLE_MODE = "100755";
const LINK_MODE = "120000";
const SUBMODULE_MODE = "160000";

/**
 * Writes every entry of a change's tree under `directory` as the repository stores it: a file's blob bytes, executable
 * where its mode says so; a symbolic link to the target its blob holds; an empty folder where another repository's
 * commit stands, as a checkout leaves a submodule it has not initialized.
 *
 * @throws When an entry's path would leave the directory or name a `.git`, which git itself refuses to check out.
 */
export async function writeStoredTree(root: string, change: string, directory: string): Promise<void> {
  const listing = (await execFileAsync("git", ["-C", root, "ls-tree", "-r", "-z", "--full-tree", change], { cwd: root, maxBuffer: LARGEST_OUTPUT })).stdout;
  const blobs: Array<{ mode: string; id: string; file: string }> = [];
  for (const entry of listing.split("\0")) {
    if (entry === "") continue;
    // Each entry is `<mode> <type> <id>\t<path>`.
    const tab = entry.indexOf("\t");
    const [mode, , id] = entry.slice(0, tab).split(" ");
    const relative = entry.slice(tab + 1);
    const parts = relative.split("/");
    if (parts.some((part) => part === "" || part === "." || part === ".." || part.toLowerCase() === ".git")) {
      throw new Error(`the tree of ${change} holds ${JSON.stringify(relative)}, a path git refuses to check out`);
    }
    const file = path.join(directory, ...parts);
    if (mode === SUBMODULE_MODE) {
      await fs.mkdir(file, { recursive: true });
    } else if (mode === FILE_MODE || mode === EXECUTABLE_MODE || mode === LINK_MODE) {
      blobs.push({ mode, id, file });
    } else {
      throw new Error(`the tree of ${change} holds ${JSON.stringify(relative)} with mode ${mode}, which no checkout writes`);
    }
  }
  if (blobs.length === 0) return;
  const reader = spawn("git", ["-C", root, "cat-file", "--batch"], { cwd: root, stdio: ["pipe", "pipe", "pipe"] });
  let errors = "";
  reader.stderr.setEncoding("utf8");
  reader.stderr.on("data", (text: string) => {
    errors += text;
  });
  const exited = new Promise<void>((resolve, reject) => {
    reader.on("error", reject);
    reader.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`git cat-file failed for ${change} (exit ${code}): ${errors.trim()}`))));
  });
  // Node writes the request as the pipe drains while the answer is read below, so neither side waits on the other.
  reader.stdin.end(blobs.map((blob) => `${blob.id}\n`).join(""));
  // Each object comes back as `<id> <type> <size>\n`, its bytes and a line break, in the order asked.
  // The chunks not yet read, joined only once they hold what is awaited, so that a large blob is not copied chunk by chunk.
  let chunks: Buffer[] = [];
  let received = 0;
  let awaited = 1;
  let next = 0;
  try {
    for await (const chunk of reader.stdout as AsyncIterable<Buffer>) {
      chunks.push(chunk);
      received += chunk.length;
      if (received < awaited) continue;
      let pending = Buffer.concat(chunks);
      awaited = 1;
      for (;;) {
        const headerEnd = pending.indexOf(0x0a);
        if (headerEnd < 0) break;
        const header = pending.subarray(0, headerEnd).toString("utf8");
        const [id, type, size] = header.split(" ");
        const blob = blobs.at(next);
        if (blob === undefined || id !== blob.id || type !== "blob") {
          throw new Error(`git cat-file answered ${JSON.stringify(header)} where the blob ${blob?.id ?? "(none)"} of ${change} was asked for`);
        }
        const end = headerEnd + 1 + Number(size);
        if (pending.length < end + 1) {
          awaited = end + 1;
          break;
        }
        const bytes = pending.subarray(headerEnd + 1, end);
        await fs.mkdir(path.dirname(blob.file), { recursive: true });
        if (blob.mode === LINK_MODE) {
          await fs.symlink(bytes.toString("utf8"), blob.file);
        } else {
          await fs.writeFile(blob.file, bytes, { mode: blob.mode === EXECUTABLE_MODE ? 0o777 : 0o666 });
        }
        pending = pending.subarray(end + 1);
        next += 1;
      }
      chunks = pending.length > 0 ? [pending] : [];
      received = pending.length;
    }
  } catch (error) {
    reader.kill();
    await exited.catch(() => undefined);
    throw error;
  }
  await exited;
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
