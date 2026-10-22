/**
 * The version-control seam's first implementation: git, read through the
 * `git` executable on the local clone.
 *
 * @remarks
 * The executable, never `.git` by hand, since a `.git` can be a file pointing
 * elsewhere and a pack is deltas (the plan's failed ideas); never a remote,
 * never credentials. The mainline is the head's first parents, oldest first
 * (`rev-list --first-parent --reverse`); a working tree is a detached worktree
 * (`worktree add --detach`), removed with `worktree remove --force`, the
 * repository's hooks switched off for it so that no checkout runs a stranger's
 * code, its line endings as stored rather than as the person's `core.autocrlf`
 * would convert them, and Git LFS's pointers left in place rather than fetched
 * from a remote; the renames and the content changes between two changes are git's own
 * word (`diff --name-status -M50%`), with no limit on the renames it may weigh
 * so that a large change is never read as deaths and births for want of time.
 * Each call states the options its reading depends on, so that a person's own
 * configuration of git does not change what the history says.
 *
 * @module
 */

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

  async workingTree(change: string, directory: string): Promise<WorkingTree> {
    // Git names a worktree's record after the folder's name, so trees made at once need folders of different names.
    // The tree as the repository stores it and its own attributes declare it, whatever the person's git converts on
    // checkout; no hook of the repository runs, and Git LFS writes its pointers rather than fetching a file.
    await this.git(["-c", `core.hooksPath=${os.devNull}`, "-c", "core.autocrlf=false", "worktree", "add", "--detach", "--quiet", directory, change], {
      GIT_LFS_SKIP_SMUDGE: "1"
    });
    return {
      root: directory,
      remove: async () => {
        try {
          await this.git(["worktree", "remove", "--force", directory]);
        } finally {
          await fs.rm(directory, { recursive: true, force: true });
        }
      }
    };
  }

  async changesBetween(from: string, to: string): Promise<VersionChanges> {
    return parseNameStatus(
      await this.git(["-c", "diff.relative=false", "diff", "--no-ext-diff", "--name-status", "-z", "-M50%", "-l0", from, to])
    );
  }

  private async git(args: readonly string[], env?: Record<string, string>): Promise<string> {
    return (await execFileAsync("git", ["-C", this.root, ...args], { cwd: this.root, maxBuffer: LARGEST_OUTPUT, env })).stdout;
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
