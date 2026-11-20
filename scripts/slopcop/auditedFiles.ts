/**
 * The files an audit reads: what its patterns match in the workspace, less what git ignores, found without reading the
 * folders git ignores whole.
 *
 * @remarks
 * The audits match their patterns over the whole workspace and then ask git which of the files found it ignores
 * (`gitIgnored`), so that a checkout's ignored copies of the repository, builds and caches are never audited. Until
 * 2026-11-20 the walk read every one of those folders file by file only to throw the files away: in the main checkout,
 * with its builders' worktrees under `.claude/worktrees/`, the markdown audit took 19.5 s where a clean worktree took
 * 2.1 s. Now git is asked once, before the walk, for the folders it ignores whole (`git ls-files --others --ignored
 * --exclude-standard --directory`, which names such a folder once, with a trailing slash, when nothing in it is
 * tracked), and the walk reads each of those folders as empty. What the audit reads is the same by construction: every
 * file under such a folder is untracked and ignored, so the filter that follows the walk would have dropped it.
 *
 * Three rules keep that true where it would not otherwise hold, for git refuses the whole question (`gitIgnored` is
 * then `null`, and the audit reads every file the walk found) when one path it is given lies inside a submodule, passes
 * through a link to a folder, or begins with a `:` git reads as pathspec magic. A pattern is walked this way only when
 * it is a leading `**` and one name ({@link walksNoLinkToAFolder}), under which glob follows no link to a folder; a
 * folder whose path begins with `:` is walked; and when git refuses the files of the shortened walk, the walk is made
 * again in full and judged as before. A submodule never lies in a folder git ignores whole, since its folder is
 * tracked, so git refuses the full walk as it refused the short one.
 *
 * The records of the measurements and the cases: the probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import { globSync, type FSOption } from "glob";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { gitIgnored, withoutGitIgnored } from "@live-documentation/engine/tooling/gitIgnored";

/**
 * The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
 * they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
 * audits always matched them.
 */
export function auditedFiles(workspaceRoot: string, patterns: readonly string[], ignoreGlobs: readonly string[]): string[] {
  const folders = foldersGitIgnoresWhole(workspaceRoot);
  if (folders.size > 0) {
    const files = matching(workspaceRoot, patterns, ignoreGlobs, foldersReadAsEmpty(workspaceRoot, folders));
    const relative = files.map((file) => toWorkspacePath(workspaceRoot, file));
    const ignored = gitIgnored(workspaceRoot, relative);
    if (ignored) {
      return files.filter((_file, index) => !ignored.has(relative[index]));
    }
    // Git refused one of the paths, and refuses the same path in the full walk: there every file found is read.
  }
  return withoutGitIgnored(workspaceRoot, matching(workspaceRoot, patterns, ignoreGlobs, undefined));
}

/**
 * The folders under `workspaceRoot` that git ignores whole, untracked and named by an excludes pattern, as
 * workspace-relative paths with forward slashes and no trailing slash; none when git cannot answer. Git names such a
 * folder once and not its contents, and descends into an ignored folder that holds a tracked file, naming what is
 * ignored inside it. Neither the workspace itself (git's `./`, when the workspace lies in an ignored folder of an outer
 * repository) nor a folder whose path begins with `:` is among them: a path beginning with `:` may be refused, and the
 * audit's answer must not depend on whether such a path was walked.
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
 * Whether glob, matching `pattern`, can never pass through a link to a folder: true for `**` and one name, a name with
 * no `/` or `\` and at most one `*`, so that no expansion of its braces makes a deeper part or a second `**`. Glob
 * follows no link under a leading `**`, and matches the name only against each folder's entries; under any other
 * pattern it may follow a link, and git refuses a path that passes through one.
 */
export function walksNoLinkToAFolder(pattern: string): boolean {
  if (!pattern.startsWith("**/")) return false;
  const name = pattern.slice("**/".length);
  return !/[/\\]/u.test(name) && !/\*.*\*/u.test(name);
}

/**
 * A file system for glob in which each of `folders` (workspace-relative, forward slashes) reads as empty, and every
 * other folder as it is. Glob takes its ignore patterns or an object in their place, not both; reading the folders as
 * empty leaves its patterns as they are, and a glob that stopped calling these functions would walk the folders again,
 * never lose a file.
 */
export function foldersReadAsEmpty(workspaceRoot: string, folders: ReadonlySet<string>): FSOption {
  const empty = (folder: string): boolean => folders.has(toWorkspacePath(workspaceRoot, folder));
  return {
    readdir: (folder, options, callback) => (empty(folder) ? process.nextTick(callback, null, []) : fs.readdir(folder, options, callback)),
    readdirSync: (folder, options) => (empty(folder) ? [] : fs.readdirSync(folder, options)),
    promises: { readdir: async (folder: string, options: { withFileTypes: true }) => (empty(folder) ? [] : fs.promises.readdir(folder, options)) }
  };
}

/** The files each pattern matches, as absolute paths, sorted; a pattern that passes no link is walked on `unread`. */
function matching(workspaceRoot: string, patterns: readonly string[], ignoreGlobs: readonly string[], unread: FSOption | undefined): string[] {
  const discovered = new Set<string>();
  for (const pattern of patterns) {
    const matches = globSync(pattern, {
      cwd: workspaceRoot,
      ignore: [...ignoreGlobs],
      nodir: true,
      dot: true,
      ...(unread && walksNoLinkToAFolder(pattern) ? { fs: unread } : {})
    });
    for (const match of matches) {
      discovered.add(path.resolve(workspaceRoot, match));
    }
  }
  return Array.from(discovered).sort();
}

function toWorkspacePath(workspaceRoot: string, file: string): string {
  return path.relative(workspaceRoot, path.resolve(workspaceRoot, file)).split(path.sep).join("/");
}
