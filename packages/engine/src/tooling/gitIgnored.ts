/**
 * What git ignores, asked of git itself, so that discovery and the audits read
 * the files the repository holds and nothing a checkout happens to carry beside
 * them.
 *
 * @remarks
 * Files are collected by glob, dot folders included, which also finds what no
 * pattern of the root `.gitignore` names: a nested worktree another agent
 * works in, a probe's log, a tool's cache. Git already knows which of these
 * are the repository's: a tracked file always is, whatever ignores it, and an
 * untracked file is not when `.gitignore` at any level, `.git/info/exclude`
 * or the global excludes file names it. `git check-ignore` answers for every
 * candidate in one call. Without git, or outside a repository, it cannot
 * answer, and the caller keeps every file or reads `.gitignore` itself, as
 * discovery did alone before 2026-10-16.
 *
 * Since 2026-11-20 git is also asked, before a walk, for the folders it ignores
 * whole ({@link foldersGitIgnoresWhole}), and the walk reads them as empty
 * ({@link foldersReadAsEmpty}), so that a checkout's ignored copies of the
 * repository, builds and caches are no longer read file by file only to be
 * thrown away: in the main checkout, with its builders' worktrees, discovery's
 * walk of the files took 64 s where a clean worktree took 1.4 s. What a walk
 * keeps is the same by construction, since every file under such a folder is
 * untracked and ignored, and {@link walksNoLinkToAFolder} says which walks may
 * be shortened so. The measurements and the cases: the probe of 2026-11-20
 * under `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import type { FSOption } from "glob";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * The paths among `relativePaths` (relative to `workspaceRoot`, forward
 * slashes) that git ignores: untracked and named by an excludes pattern. A
 * tracked file is never among them. `null` when git cannot answer, because it
 * is not installed or `workspaceRoot` is not inside a repository, or refuses
 * one of the paths: one inside a submodule, one that passes through a link to
 * a folder, or one that begins with a `:` git reads as pathspec magic.
 */
export function gitIgnored(workspaceRoot: string, relativePaths: readonly string[]): Set<string> | null {
  if (relativePaths.length === 0) return new Set();
  const result = spawnSync("git", ["-C", workspaceRoot, "check-ignore", "--stdin", "-z"], {
    input: `${relativePaths.join("\0")}\0`,
    encoding: "utf8",
    maxBuffer: 1 << 28
  });
  // 0: some of the paths are ignored; 1: none is; anything else is git missing, no repository here, or a path refused.
  if (result.error || (result.status !== 0 && result.status !== 1)) return null;
  return new Set(result.stdout.split("\0").filter((entry) => entry.length > 0));
}

/**
 * Whether git matches names without regard to case in the repository that
 * holds `workspaceRoot`: its `core.ignorecase`, which git sets true on a clone
 * made where the file system does not tell case apart, as on Windows. False
 * when the setting is false or absent, or git cannot answer.
 */
export function gitIgnoresCase(workspaceRoot: string): boolean {
  const result = spawnSync("git", ["-C", workspaceRoot, "config", "--type=bool", "--get", "core.ignorecase"], { encoding: "utf8" });
  return !result.error && result.status === 0 && result.stdout.trim() === "true";
}

/**
 * The files among `files` (absolute or workspace-relative) that git does not
 * ignore; all of `files` when git cannot answer.
 */
export function withoutGitIgnored(workspaceRoot: string, files: readonly string[]): string[] {
  const relative = files.map((file) => toWorkspacePath(workspaceRoot, file));
  const ignored = gitIgnored(workspaceRoot, relative);
  if (!ignored) return [...files];
  return files.filter((_file, index) => !ignored.has(relative[index]));
}

/**
 * The folders under `workspaceRoot` that git ignores whole, untracked and
 * named by an excludes pattern, as workspace-relative paths with forward
 * slashes and no trailing slash; none when git cannot answer. `git ls-files
 * --others --ignored --exclude-standard --directory` names such a folder once,
 * with a trailing slash, and not its contents: a folder an excludes pattern
 * names, or one whose every entry is ignored. It descends into an ignored
 * folder that holds a tracked file and names what is ignored inside it, and it
 * never descends into a nested repository, whose folders are walked as before.
 *
 * Two that git names are left out, so that no walk's answer depends on whether
 * they were read: the workspace itself (git's `./`, when the workspace lies in
 * an ignored folder of an outer repository), and a folder whose path begins
 * with a `:`. Git reads such a path as pathspec magic and may refuse it
 * ({@link gitIgnored}), and a caller then keeps what it keeps when git cannot
 * answer, which may hold the folder's files.
 */
export function foldersGitIgnoresWhole(workspaceRoot: string): Set<string> {
  const result = spawnSync("git", ["-C", workspaceRoot, "ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory"], {
    encoding: "utf8",
    maxBuffer: 1 << 28
  });
  if (result.error || result.status !== 0) return new Set();
  return new Set(
    result.stdout
      .split("\0")
      .filter((entry) => entry.endsWith("/") && entry !== "./" && !entry.startsWith(":"))
      .map((entry) => entry.slice(0, -1))
  );
}

/**
 * Whether glob, matching `pattern`, can never pass through a link to a
 * folder: true for `**` and one name, a name with no `/` or `\` and at most
 * one `*`, so that no expansion of its braces makes a deeper part or a second
 * `**`. Glob follows no link under a leading `**`, and matches the name only
 * against each folder's entries. Under any other pattern it may follow one,
 * and git refuses the path ({@link gitIgnored}): a walk that read a folder git
 * ignores whole as empty could then lose the one path that made git refuse,
 * and with it the answer the caller gives when git cannot answer.
 */
export function walksNoLinkToAFolder(pattern: string): boolean {
  if (!pattern.startsWith("**/")) return false;
  const name = pattern.slice("**/".length);
  return !/[/\\]/u.test(name) && !/\*.*\*/u.test(name);
}

/**
 * A file system for glob (its `fs` option) in which each of `folders`
 * (workspace-relative, forward slashes) reads as empty, and every other folder
 * as it is. Glob takes ignore patterns or an object in their place, not both,
 * and its callers already pass patterns: reading the folders as empty leaves
 * those patterns as they are. A glob that stopped calling these functions
 * would walk the folders again, and lose no file.
 */
export function foldersReadAsEmpty(workspaceRoot: string, folders: ReadonlySet<string>): FSOption {
  const empty = (folder: string): boolean => folders.has(toWorkspacePath(workspaceRoot, folder));
  return {
    readdir: (folder, options, callback) => (empty(folder) ? process.nextTick(callback, null, []) : fs.readdir(folder, options, callback)),
    readdirSync: (folder, options) => (empty(folder) ? [] : fs.readdirSync(folder, options)),
    promises: { readdir: async (folder: string, options: { withFileTypes: true }) => (empty(folder) ? [] : fs.promises.readdir(folder, options)) }
  };
}

/** A path as workspace-relative with forward slashes, whether given absolute or relative. */
function toWorkspacePath(workspaceRoot: string, file: string): string {
  return path.relative(workspaceRoot, path.resolve(workspaceRoot, file)).split(path.sep).join("/");
}
