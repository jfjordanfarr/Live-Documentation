/**
 * What git ignores, read from git itself, so that discovery and the audits read
 * the files the repository holds and nothing a checkout happens to carry beside
 * them.
 *
 * @remarks
 * Files are collected by glob, dot folders included, which also finds what no
 * pattern of the root `.gitignore` names: a nested worktree another agent
 * works in, a probe's log, a tool's cache. Git already knows which of these
 * are the repository's: a tracked file always is, whatever ignores it, and an
 * untracked file is not when `.gitignore` at any level, `.git/info/exclude`
 * or the global excludes file names it. Without git, or outside a repository,
 * it cannot answer, and the caller keeps every file or reads `.gitignore`
 * itself, as discovery did alone before 2026-10-16.
 *
 * Since 2026-11-20 (the third form of that day) git is asked one question,
 * `git ls-files --others --ignored --exclude-standard --directory`, and its
 * listing is what the walk leaves unread and what it judges ignored
 * ({@link gitIgnores}): a walk asks once before it and reads each folder the
 * listing names whole as empty ({@link foldersReadAsEmpty}), so that a
 * checkout's ignored copies of the repository, builds and caches are never
 * read file by file (in the main checkout, with its builders' worktrees,
 * discovery's walk of the files took 64 s where a clean worktree took 1.4 s),
 * and asks again after it to judge what it found, so that a folder a build
 * makes during the walk is judged as git judges it then. A path is ignored
 * when it, or a folder above it, is in the listing. The two forms before it
 * re-made git's classification with `git check-ignore`, and differed from git
 * where a `.gitignore` is kept off the disk, where case folds, and where a
 * file took a tracked folder's place. The measurements and the cases: the
 * probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
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
  /** The paths git ignores: each, or a folder above it, is in the listing of the repository that holds it. */
  ignored: Set<string>;
  /**
   * The paths git cannot judge: each passes through a link to a folder that holds no repository and that git does
   * not ignore, and a path beyond a link is no path of the repository to git; or lies in a nested repository whose git
   * could not be asked.
   */
  unjudged: Set<string>;
}

/** Git's word on what it ignores in a workspace, from one listing. */
export interface GitIgnores {
  /** The folders git ignores whole, workspace-relative with forward slashes; `""` when it ignores the workspace itself. */
  readonly folders: ReadonlySet<string>;
  /** A file system for glob (its `fs` option) on which {@link GitIgnores.folders} read as empty. */
  readonly unread: FSOption;
  /** What git says of each of the paths (workspace-relative, forward slashes; `.` or `""` for the workspace itself). */
  answer(relativePaths: readonly string[]): GitIgnoreAnswer;
}

/** A repository the judging has met: its listing, and the folders that hold an entry of its index, read when needed. */
interface Repository {
  readonly root: string;
  readonly entries: Set<string> | null;
  holdsIndexed?: Set<string>;
}

/**
 * Git's word on what it ignores in the workspace at `workspaceRoot`, or `null`
 * when git cannot answer: it is not installed, `workspaceRoot` lies in no
 * repository, git does not trust its owner, or its listing fails in any other
 * way. A caller that gets `null` walks the whole workspace and uses its rule
 * for no git, so that a failed answer is never applied to a shortened walk.
 *
 * @remarks
 * The listing names each untracked path git ignores: a folder it ignores whole
 * once, with a trailing slash and none of its contents, and an ignored file in
 * a folder that is not ignored whole by itself. It never names a tracked path,
 * and it is git's own classification, so it reads a `.gitignore` that sparse
 * checkout or skip-worktree keeps off the disk from the index, folds case
 * where `core.ignorecase` says so (a tracked `Build/a.ts` is the file
 * `build/a.ts` on the disk), and names a file that took the place of a
 * tracked folder. Asked from the very folder git ignores whole, git prints it
 * as `./`; asked from a folder anywhere inside one, git fails ("directory
 * entry not superset of prefix", and so too from the repository's top limited
 * to the workspace's folder). It is then asked from the top with no limit,
 * and the folder above the workspace that it names means that the workspace
 * is ignored whole.
 *
 * Git does not descend into a nested repository, a submodule or not, nor
 * follow a link. A folder below the workspace is another repository when it
 * holds a `.git`, the index of the repository around it has no entry below it
 * (a gitlink at the folder itself is a submodule's), and git, asked there,
 * finds a repository whose top is that folder: as git itself has it, a folder
 * whose `.git` names no repository, or below which the outer index holds a
 * tracked or intent-to-add entry, is the outer repository's own, and the
 * outer listing judges it. A path in another repository is judged by that
 * repository's own listing, asked with the variables that tie git to a
 * repository taken out of the environment but the command line's
 * configuration, as git does when it enters a submodule; the outer repository
 * decides only whether that folder is ignored, and a path in a repository
 * whose git cannot be asked is unjudged. A path beyond a link to a folder is
 * ignored when the link or a folder above it is, judged by the linked
 * repository when the link leads to one, and is otherwise unjudged. The cases,
 * tried on git 2.56.1, are the tests beside this module and discovery's.
 */
export function gitIgnores(workspaceRoot: string): GitIgnores | null {
  const own = listing(workspaceRoot, false);
  if (!own) return null;
  const outer: Repository = { root: "", entries: own.entries };
  const kinds = new Map<string, Repository | "link" | "folder">();
  const kindOf = (folder: string, around: Repository): Repository | "link" | "folder" => {
    let kind = kinds.get(folder);
    if (kind === undefined) {
      const at = path.join(workspaceRoot, folder);
      kind = fs.lstatSync(at, { throwIfNoEntry: false })?.isSymbolicLink() ? "link" : "folder";
      if (fs.existsSync(path.join(at, ".git")) && !indexHolds(around, folder.slice(around.root === "" ? 0 : around.root.length + 1)) && topOfItsOwn(at)) {
        kind = { root: folder, entries: listing(at, true)?.entries ?? null };
      }
      kinds.set(folder, kind);
    }
    return kind;
  };
  const indexHolds = (repository: Repository, folder: string): boolean => {
    if (!repository.holdsIndexed) {
      repository.holdsIndexed = new Set();
      const result = spawnSync("git", ["-C", path.join(workspaceRoot, repository.root), "ls-files", "-z"], { encoding: "utf8", env: gitEnvironment(repository.root !== ""), maxBuffer: 1 << 28 });
      for (const entry of result.status === 0 ? result.stdout.split("\0") : []) {
        for (let slash = entry.lastIndexOf("/"); slash > 0; slash = entry.lastIndexOf("/", slash - 1)) repository.holdsIndexed.add(entry.slice(0, slash));
      }
    }
    return repository.holdsIndexed.has(folder);
  };
  const judged = (relative: string): "ignored" | "kept" | "unjudged" => {
    if (own.entries.has("")) return "ignored";
    const parts = relative === "" || relative === "." ? [] : relative.split("/");
    let repository = outer;
    for (let end = 1; end <= parts.length; end += 1) {
      const prefix = parts.slice(0, end).join("/");
      if (repository.entries?.has(repository.root === "" ? prefix : prefix.slice(repository.root.length + 1))) return "ignored";
      if (end === parts.length) break;
      const kind = kindOf(prefix, repository);
      if (typeof kind === "object") {
        if (!kind.entries) return "unjudged";
        repository = kind;
      } else if (kind === "link") return "unjudged";
    }
    return "kept";
  };
  return {
    folders: own.folders,
    unread: foldersReadAsEmpty(workspaceRoot, own.folders),
    answer: (relativePaths) => {
      const answer: GitIgnoreAnswer = { ignored: new Set(), unjudged: new Set() };
      for (const relative of relativePaths) {
        const verdict = judged(relative);
        if (verdict !== "kept") answer[verdict].add(relative);
      }
      return answer;
    }
  };
}

/**
 * The paths among `relativePaths` (relative to `workspaceRoot`, forward
 * slashes) that git ignores ({@link gitIgnores}); `null` when git cannot
 * answer. A path git cannot judge is not among them.
 */
export function gitIgnored(workspaceRoot: string, relativePaths: readonly string[]): Set<string> | null {
  return gitIgnores(workspaceRoot)?.answer(relativePaths).ignored ?? null;
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
 * The variables git itself keeps when it enters a submodule, of those that tie it to a repository: the configuration
 * given on the command line (`git -c`, and `GIT_CONFIG_COUNT` with its numbered keys and values).
 */
const KEPT_IN_A_SUBMODULE: ReadonlySet<string> = new Set(["GIT_CONFIG_PARAMETERS", "GIT_CONFIG_COUNT"]);

/** The variables that tie git to one repository (`git rev-parse --local-env-vars`), read once, for a nested repository's question. */
let localVariables: readonly string[] | undefined;

/**
 * The environment of a git call: the process's own, and for a nested repository less the variables that tie git to a
 * repository but {@link KEPT_IN_A_SUBMODULE}, as git's own `prepare_submodule_repo_env` makes it, so that git finds
 * the nested repository by its own `.git` and still reads the person's command-line configuration.
 */
function gitEnvironment(nested: boolean): NodeJS.ProcessEnv {
  const env = { ...process.env };
  if (nested) {
    localVariables ??= spawnSync("git", ["rev-parse", "--local-env-vars"], { encoding: "utf8" }).stdout?.split("\n").filter((name) => name.length > 0) ?? [];
    for (const name of localVariables) if (!KEPT_IN_A_SUBMODULE.has(name)) delete env[name];
  }
  return env;
}

/** Whether git, asked in `folder` as a repository of its own, finds one whose top is that folder. */
function topOfItsOwn(folder: string): boolean {
  const result = spawnSync("git", ["-C", folder, "rev-parse", "--show-cdup"], { encoding: "utf8", env: gitEnvironment(true) });
  return !result.error && result.status === 0 && result.stdout.trim() === "";
}

/**
 * Git's listing of what it ignores under `folder` ({@link gitIgnores}), as paths relative to `folder` with no trailing
 * slash (`""` for `folder` itself), and the folders among them; `null` when git fails.
 */
function listing(folder: string, nested: boolean): { entries: Set<string>; folders: Set<string> } | null {
  const env = gitEnvironment(nested);
  const listed = (where: readonly string[]): string[] | null => {
    const result = spawnSync("git", [...where, "ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory"], { encoding: "utf8", env, maxBuffer: 1 << 28 });
    return result.error || result.status !== 0 ? null : result.stdout.split("\0").filter((entry) => entry.length > 0);
  };
  // The paths git prints are relative to the folder it is asked from: `folder`, or the repository's top above it.
  let prefix = "";
  let printed = listed(["-C", folder]);
  if (!printed) {
    // Asked from a folder inside one it ignores whole, git fails ("directory entry not superset of prefix"), as it does
    // when it cannot answer at all; asked from the repository's top, it names that folder.
    const where = spawnSync("git", ["-C", folder, "rev-parse", "--show-cdup", "--show-prefix"], { encoding: "utf8", env });
    if (where.error || where.status !== 0) return null;
    const newline = where.stdout.indexOf("\n");
    prefix = where.stdout.slice(newline + 1).replace(/\n$/u, "");
    printed = prefix === "" ? null : listed(["-C", folder, "-C", where.stdout.slice(0, newline) || "."]);
    if (!printed) return null;
  }
  const entries = new Set<string>();
  const folders = new Set<string>();
  for (const entry of printed) {
    const name = entry.replace(/\/$/u, "");
    // `folder` itself (printed `./`), or a folder above it, is ignored whole.
    let relative: string;
    if (name === "." || prefix.startsWith(`${name}/`)) relative = "";
    else if (name.startsWith(prefix)) relative = name.slice(prefix.length);
    else continue;
    entries.add(relative);
    if (entry.endsWith("/")) folders.add(relative);
  }
  return { entries, folders };
}

/** A path as workspace-relative with forward slashes, whether given absolute or relative. */
function toWorkspacePath(workspaceRoot: string, file: string): string {
  return path.relative(workspaceRoot, path.resolve(workspaceRoot, file)).split(path.sep).join("/");
}
