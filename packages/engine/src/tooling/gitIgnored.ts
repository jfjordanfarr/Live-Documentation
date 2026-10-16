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
 * @module
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

/**
 * The paths among `relativePaths` (relative to `workspaceRoot`, forward
 * slashes) that git ignores: untracked and named by an excludes pattern. A
 * tracked file is never among them. `null` when git cannot answer, because it
 * is not installed or `workspaceRoot` is not inside a repository.
 */
export function gitIgnored(workspaceRoot: string, relativePaths: readonly string[]): Set<string> | null {
  if (relativePaths.length === 0) return new Set();
  const result = spawnSync("git", ["-C", workspaceRoot, "check-ignore", "--stdin", "-z"], {
    input: `${relativePaths.join("\0")}\0`,
    encoding: "utf8",
    maxBuffer: 1 << 28
  });
  // 0: some of the paths are ignored; 1: none is; anything else is git missing or no repository here.
  if (result.error || (result.status !== 0 && result.status !== 1)) return null;
  return new Set(result.stdout.split("\0").filter((entry) => entry.length > 0));
}

/**
 * The files among `files` (absolute or workspace-relative) that git does not
 * ignore; all of `files` when git cannot answer.
 */
export function withoutGitIgnored(workspaceRoot: string, files: readonly string[]): string[] {
  const relative = files.map((file) => path.relative(workspaceRoot, path.resolve(workspaceRoot, file)).split(path.sep).join("/"));
  const ignored = gitIgnored(workspaceRoot, relative);
  if (!ignored) return [...files];
  return files.filter((_file, index) => !ignored.has(relative[index]));
}
