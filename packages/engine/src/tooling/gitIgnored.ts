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
 * keeps is the same as a full walk's, since git judges every file under such a
 * folder ignored ({@link gitIgnoreAnswer}). The measurements and the cases: the
 * probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`,
 * and its section on judging every path by its name.
 *
 * @module
 */
import type { FSOption } from "glob";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/** What git says of a list of paths: which it ignores, and which it cannot judge. */
export interface GitIgnoreAnswer {
  /** The paths git ignores: untracked, and named by an excludes pattern or lying in a folder or under a link git ignores. */
  ignored: Set<string>;
  /**
   * The paths git cannot judge: each passes through a link to a folder that git does not ignore, and a path beyond a
   * link is no path of the repository to git, which refuses to judge it.
   */
  unjudged: Set<string>;
}

/**
 * What git says of each of `relativePaths` (relative to `workspaceRoot`,
 * forward slashes): whether it ignores it, judged by the path's own name,
 * and which paths it cannot judge. `null` when git cannot answer at all,
 * because it is not installed, `workspaceRoot` is not inside a repository, or
 * git does not trust its owner.
 *
 * @remarks
 * Plain `git check-ignore` reads each path as a pathspec, a pattern, and does
 * not report a path whose pattern matches a tracked file: an untracked
 * `a[1].log` beside a tracked `a1.log` was kept though `*.log` ignores it, and
 * `a\b/out/x.ts` beside a tracked `ab/out/x.ts`. It also refuses the whole
 * call for one path inside a submodule or beginning with `:(` or `:!`, and
 * reads a leading `:abc.ts` as `abc.ts`. So git is asked with `--no-index`,
 * which judges each path by the excludes patterns alone, and each path is
 * given as `./path`, which git reads as the name itself however it begins;
 * the paths that are tracked, or are a folder holding a tracked file (the
 * paths plain `check-ignore` takes for tracked when read literally), are then
 * taken out, from `git ls-files`, since a tracked file is never ignored.
 *
 * Two kinds of path git still answers in its own way. Inside a submodule or a
 * nested repository, a path is judged as one in a plain folder: by the outer
 * repository's excludes and every `.gitignore` on its way, the inner
 * repository's own included, but not the inner repository's
 * `.git/info/exclude`, and a file the inner repository tracks may be judged
 * ignored. And git refuses any path that passes through a link to a folder:
 * such a path is asked as its link, so that what lies under a link git
 * ignores, or under a folder git ignores, is ignored, and is otherwise
 * unjudged. The cases, tried on git 2.56.1: the probe named in the module's
 * remarks.
 */
export function gitIgnoreAnswer(workspaceRoot: string, relativePaths: readonly string[]): GitIgnoreAnswer | null {
  if (relativePaths.length === 0) return { ignored: new Set(), unjudged: new Set() };
  const tracked = gitPaths(workspaceRoot, ["ls-files", "-z"], 0);
  if (!tracked) return null;
  const linkOf = leadingLinks(workspaceRoot);
  // Each path, and the path git is asked about for it: itself, or the link to a folder it passes through.
  const asked = relativePaths.map((relative) => [relative, linkOf(relative) ?? relative] as const);
  const named = gitPaths(workspaceRoot, ["check-ignore", "--no-index", "--stdin", "-z"], 1, [...new Set(asked.map(([, question]) => question))].map((question) => `./${question}`));
  if (!named) return null;
  const holdsTracked = new Set<string>();
  for (const file of tracked) {
    for (let end = file.length; end > 0; end = file.lastIndexOf("/", end - 1)) holdsTracked.add(file.slice(0, end));
  }
  const ignored = new Set(named.map((entry) => entry.slice("./".length)).filter((entry) => !holdsTracked.has(entry)));
  const answer: GitIgnoreAnswer = { ignored: new Set(), unjudged: new Set() };
  for (const [relative, question] of asked) {
    if (ignored.has(question)) answer.ignored.add(relative);
    else if (question !== relative) answer.unjudged.add(relative);
  }
  return answer;
}

/**
 * The paths among `relativePaths` (relative to `workspaceRoot`, forward
 * slashes) that git ignores ({@link gitIgnoreAnswer}); `null` when git cannot
 * answer. A path git cannot judge is not among them.
 */
export function gitIgnored(workspaceRoot: string, relativePaths: readonly string[]): Set<string> | null {
  return gitIgnoreAnswer(workspaceRoot, relativePaths)?.ignored ?? null;
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
 * ignore, a file git cannot judge among them; all of `files` when git cannot
 * answer.
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
 * names, or one whose every entry is ignored, whose ignored files and folders
 * it then names as well. It descends into an ignored folder that holds a
 * tracked file and names what is ignored inside it, and it never descends
 * into a nested repository, whose folders are walked as before. When the
 * workspace itself lies in a folder an outer repository ignores, git names it
 * (`./`), and it is the workspace's own path, `""`.
 */
export function foldersGitIgnoresWhole(workspaceRoot: string): Set<string> {
  const entries = gitPaths(workspaceRoot, ["ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory"], 0) ?? [];
  return new Set(entries.filter((entry) => entry.endsWith("/")).map((entry) => toWorkspacePath(workspaceRoot, entry)));
}

/**
 * A file system for glob (its `fs` option) in which each of `folders`
 * (workspace-relative, forward slashes) reads as empty, and every other folder
 * as it is. Glob takes ignore patterns or an object in their place, not both,
 * and its callers already pass patterns: reading the folders as empty leaves
 * those patterns as they are. Glob 14 walks with `readdir` and `readdirSync`
 * alone; a glob that stopped calling these would walk the folders again, and
 * lose no file.
 */
export function foldersReadAsEmpty(workspaceRoot: string, folders: ReadonlySet<string>): FSOption {
  const empty = (folder: string): boolean => folders.has(toWorkspacePath(workspaceRoot, folder));
  return {
    readdir: (folder, options, callback) => (empty(folder) ? process.nextTick(callback, null, []) : fs.readdir(folder, options, callback)),
    readdirSync: (folder, options) => (empty(folder) ? [] : fs.readdirSync(folder, options))
  };
}

/**
 * The paths git prints, `-z` separated, for `args` run in `workspaceRoot` with `input` on its standard input; `null`
 * when git exits with neither 0 nor `alsoAnswered` (check-ignore's 1: nothing is ignored), as when it cannot answer.
 */
function gitPaths(workspaceRoot: string, args: readonly string[], alsoAnswered: number, input?: readonly string[]): string[] | null {
  const result = spawnSync("git", ["-C", workspaceRoot, ...args], {
    ...(input ? { input: input.map((entry) => `${entry}\0`).join("") } : {}),
    encoding: "utf8",
    maxBuffer: 1 << 28
  });
  if (result.error || (result.status !== 0 && result.status !== alsoAnswered)) return null;
  return result.stdout.split("\0").filter((entry) => entry.length > 0);
}

/** For a workspace-relative path, the first folder on its way that is a link, or `undefined`; each folder is read once. */
function leadingLinks(workspaceRoot: string): (relative: string) => string | undefined {
  const isLink = new Map<string, boolean>();
  return (relative) => {
    for (let slash = relative.indexOf("/"); slash !== -1; slash = relative.indexOf("/", slash + 1)) {
      const folder = relative.slice(0, slash);
      let link = isLink.get(folder);
      if (link === undefined) {
        link = fs.lstatSync(path.join(workspaceRoot, folder), { throwIfNoEntry: false })?.isSymbolicLink() ?? false;
        isLink.set(folder, link);
      }
      if (link) return folder;
    }
    return undefined;
  };
}

/** A path as workspace-relative with forward slashes, whether given absolute or relative. */
function toWorkspacePath(workspaceRoot: string, file: string): string {
  return path.relative(workspaceRoot, path.resolve(workspaceRoot, file)).split(path.sep).join("/");
}
