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
 * or the global excludes file names it. Where git cannot answer in the
 * repository that holds the workspace, the caller keeps every file or reads
 * `.gitignore` itself, as discovery did alone before 2026-10-16. A workspace
 * that lies in no repository has no listing of its own, but each repository
 * within it, a folder of several clones among them, is asked of its own files
 * (2026-11-20); what lies outside every repository is the caller's rule for no
 * git, with nothing to warn of.
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

/** What git says of a list of paths: which it ignores, which it cannot judge, and which lie in no repository. */
export interface GitIgnoreAnswer {
  /** The paths git ignores: each, or a folder above it, is in the listing of the repository that holds it. */
  ignored: Set<string>;
  /**
   * The paths git cannot judge: each passes through a link that git does not ignore to a folder that is not a
   * repository's top (a plain folder, or one in the middle of a repository), and a path beyond a link is no path of the
   * repository around to git; or lies in a folder holding a `.git` whose git could not be asked, or of which git said
   * nothing.
   */
  unjudged: Set<string>;
  /**
   * The paths that lie in no repository, in a workspace that lies in none: git has no word on them, and none was
   * wanted, so the caller's rule for no git judges them with nothing to warn of.
   */
  outside: Set<string>;
}

/** Git's word on what it ignores in a workspace, from one listing. */
export interface GitIgnores {
  /** The folders git ignores whole, workspace-relative with forward slashes; `""` when it ignores the workspace itself. */
  readonly folders: ReadonlySet<string>;
  /** What git says of each of the paths (workspace-relative, forward slashes; `.` or `""` for the workspace itself). */
  answer(relativePaths: readonly string[]): GitIgnoreAnswer;
}

/** Why git gave no listing of what it ignores in a folder that lies in a repository. */
export interface GitUnanswered {
  /** Git's own first line of complaint, or that git could not be started, or its answer passed the buffer. */
  readonly reason: string;
}

/** A repository the judging has met: the folder at its top, workspace-relative, and its listing. */
interface Repository {
  readonly root: string;
  readonly entries: Set<string>;
}

/**
 * Git's word on what it ignores in the workspace at `workspaceRoot`, or `null`
 * when git cannot answer in the repository that holds it: it is not installed,
 * does not trust the owner, or its listing fails in any other way, which
 * `unanswered` is told of. A caller that gets `null` walks the whole workspace
 * and uses its rule for no git, so that a failed answer is never applied to a
 * shortened walk. Where the workspace lies in no repository
 * ({@link liesInNoRepository}) there is no listing of its own and no folder is
 * left unread, but each folder in it that holds a `.git` is asked directly, as
 * a link to a repository's top is, and the paths outside every repository are
 * {@link GitIgnoreAnswer.outside}.
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
 * follow a link. Whether a folder below the workspace that holds a `.git` is
 * another repository is git's own word, asked of the repository around it
 * ({@link anotherRepository}); the code re-made that judgment twice, and was
 * wrong each time. A path in another repository is judged by that
 * repository's own listing, asked with the variables that tie git to a
 * repository taken out of the environment but the command line's
 * configuration ({@link gitEnvironment}); the outer repository decides only
 * whether that folder is ignored, and a path in a repository whose git cannot
 * answer (an owner it does not trust, a configuration it cannot read) is
 * unjudged. A path beyond a link to a folder is ignored when the link or a
 * folder above it is, judged by the linked repository when git, asked in the
 * linked folder, says it is that repository's top, and is otherwise unjudged,
 * a link into the middle of a repository among them, whether its folder holds
 * no `.git` or one git climbs past (2026-11-20). The cases, tried on git
 * 2.56.1, are the tests beside this module and discovery's.
 */
export function gitIgnores(workspaceRoot: string, unanswered?: (why: GitUnanswered) => void): GitIgnores | null {
  // `null` where the workspace lies in no repository: no repository is around its paths until one is met below it.
  let outer: Repository | null = null;
  let folders = new Set<string>();
  if (!liesInNoRepository(workspaceRoot)) {
    const own = listing(workspaceRoot, false, false);
    if ("reason" in own) {
      unanswered?.(own);
      return null;
    }
    outer = { root: "", entries: own.entries };
    folders = own.folders;
  }
  const kinds = new Map<string, Repository | "link" | "folder" | "unanswered">();
  const kindOf = (folder: string, around: Repository | null): Repository | "link" | "folder" | "unanswered" => {
    let kind = kinds.get(folder);
    if (kind === undefined) {
      const at = path.join(workspaceRoot, folder);
      const link = fs.lstatSync(at, { throwIfNoEntry: false })?.isSymbolicLink() === true;
      kind = link ? "link" : "folder";
      if (fs.existsSync(path.join(at, ".git"))) {
        // To the repository around, a link is a file, and it has no view of what lies beyond; where no repository is
        // around, there is none to ask. Such a folder is asked directly, and answers where git there finds it the top of
        // a work tree. Where git cannot say, the folder's paths are unjudged, as a repository's whose git cannot answer.
        const direct = link || around === null;
        const another = direct || anotherRepository(path.join(workspaceRoot, around.root), around.root === "" ? folder : folder.slice(around.root.length + 1), around.root !== "");
        if (another === null) kind = "unanswered";
        else if (another) {
          const inner = listing(at, true, direct);
          kind = "entries" in inner ? { root: folder, entries: inner.entries } : "unanswered";
        }
      }
      kinds.set(folder, kind);
    }
    return kind;
  };
  const judged = (relative: string): "ignored" | "kept" | "unjudged" | "outside" => {
    if (outer?.entries.has("")) return "ignored";
    const parts = relative === "" || relative === "." ? [] : relative.split("/");
    let repository = outer;
    // Past a folder git has no word on, the listing around still judges what it names below it: git named it, so git
    // entered there; beyond a link or inside a repository it does not enter, it names nothing. Where no repository is
    // around, a link to a folder that is no repository's top leads to more of no repository.
    let unsure = false;
    for (let end = 1; end <= parts.length; end += 1) {
      const prefix = parts.slice(0, end).join("/");
      if (repository?.entries.has(repository.root === "" ? prefix : prefix.slice(repository.root.length + 1))) return "ignored";
      if (end === parts.length || unsure) continue;
      const kind = kindOf(prefix, repository);
      if (typeof kind === "object") repository = kind;
      else if (kind === "unanswered" || (kind === "link" && repository !== null)) unsure = true;
    }
    return unsure ? "unjudged" : repository === null ? "outside" : "kept";
  };
  return {
    folders,
    answer: (relativePaths) => {
      const answer: GitIgnoreAnswer = { ignored: new Set(), unjudged: new Set(), outside: new Set() };
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
 * answer in the repository that holds the workspace. A path git cannot judge,
 * or one that lies in no repository, is not among them.
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
 *
 * Glob reads a folder whose read fails as empty, whatever the failure, so each
 * failed read of another folder is also told to `failed`, for the walk to judge
 * once glob is done: a folder that could not be read for a cause of the
 * machine's (too many open files) must stop the walk, not lose its files in
 * silence (2026-11-20).
 */
export function foldersReadAsEmpty(workspaceRoot: string, folders: ReadonlySet<string>, failed?: (error: NodeJS.ErrnoException) => void): FSOption {
  const empty = (folder: string): boolean => folders.has(toWorkspacePath(workspaceRoot, folder));
  return {
    readdir: (folder, options, callback) => {
      if (empty(folder)) {
        process.nextTick(callback, null, []);
        return;
      }
      fs.readdir(folder, options, (error, entries) => {
        if (error) failed?.(error);
        callback(error, entries);
      });
    },
    readdirSync: (folder, options) => {
      if (empty(folder)) return [];
      try {
        return fs.readdirSync(folder, options);
      } catch (error) {
        failed?.(error as NodeJS.ErrnoException);
        throw error;
      }
    }
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
 * repository but {@link KEPT_IN_A_SUBMODULE}, so that git finds the nested repository by its own `.git` and still
 * reads the person's command-line configuration. Git's messages stay in the person's language: none is parsed.
 *
 * @remarks
 * Git's own `prepare_submodule_repo_env` keeps the same two and also sets `GIT_DIR=.git`, and a repository named by
 * `GIT_DIR` escapes git's check of its owner: that is why git answers inside a submodule whose owner it does not trust.
 * This code does not set it. A nested repository that is not a submodule, which git itself never enters, would then
 * pass the check too, and whether to trust such a repository is the owner's choice of what to trust, not this module's;
 * so a nested repository whose owner git does not trust, a submodule among them, is not asked, its paths are unjudged,
 * and the caller warns (2026-11-20).
 */
function gitEnvironment(nested: boolean): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (nested) {
    localVariables ??= spawnSync("git", ["rev-parse", "--local-env-vars"], { encoding: "utf8" }).stdout?.split("\n").filter((name) => name.length > 0) ?? [];
    for (const name of localVariables) if (!KEPT_IN_A_SUBMODULE.has(name)) delete env[name];
  }
  return env;
}

/**
 * Whether git, in the repository around `folder` (at `around`), takes `folder` (relative to `around`, holding a
 * `.git`) for another repository; `null` when git cannot say.
 *
 * @remarks
 * Git's own view, from its listing of what it does not ignore there: an untracked folder it takes for another
 * repository is printed whole, `folder/`, and never entered; a submodule's is a gitlink in the index, printed with mode
 * 160000; a folder git takes for its own it enters, printing what is in it, if anything. Git itself decides, by its own
 * rules: a `.git` naming no repository is no repository, a folder below which the index holds an entry (tracked,
 * intent-to-add, a gitlink deeper down, in whatever case `core.ignorecase` folds) is its own, and a repository git
 * would refuse to work in (an owner it does not trust, a configuration it cannot read, a format it does not know) is
 * another repository all the same. Until this form (2026-11-20) the code read the whole index and asked `git rev-parse`
 * in the folder, and was wrong for the last kind and for case. More output than a folder's own entries means git
 * entered it.
 *
 * The second pathspec, `.git`, matches nothing (git never lists nor tracks a `.git`), and is there so that the
 * pathspecs share no leading folder: given `vendor/lib` alone, `ls-files` first drops every index entry outside
 * `vendor/`, exactly in case, and a tracked `Vendor/lib/a.ts` with the folder `vendor` on the disk is then no entry, and
 * git takes the folder for another repository where `git status` enters it as its own (tried on git 2.56.1).
 *
 * Where git prints nothing, it has not said which: a folder of its own with nothing in it to print (every file
 * ignored) looks the same as a submodule whose folder's case differs from its gitlink where `core.ignorecase` is true
 * (gitlink `lib`, folder `Lib`), which git does not enter while the pathspec, matched exactly, finds no gitlink. Both
 * are `null`: the folder's paths are unjudged, but what the listing around names as ignored inside it (git entered
 * it, then) is ignored all the same.
 */
function anotherRepository(around: string, folder: string, nested: boolean): boolean | null {
  const result = spawnSync("git", ["--literal-pathspecs", "-C", around, "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", folder, ".git"], { encoding: "utf8", env: gitEnvironment(nested), maxBuffer: 1 << 16 });
  if (result.error && Reflect.get(result.error, "code") === "ENOBUFS") return false;
  if (result.error || result.status !== 0) return null;
  const printed = result.stdout.split("\0").filter((entry) => entry.length > 0);
  if (printed.length === 0) return null;
  return printed.includes(`${folder}/`) || printed.some((entry) => entry.startsWith("160000 ") && entry.endsWith(`\t${folder}`));
}

/**
 * Whether `folder` lies in no repository by its own structure: no `.git` in it or in any folder above it, and none
 * named to git by `GIT_DIR`. Only there is the rule for no git the rule, and no fall-back from git's word; a stale
 * `GIT_DIR`, a `GIT_CEILING_DIRECTORIES` that hides the top, a file system's boundary and a `.git` above that names no
 * repository all make git say "not a git repository" too, where a repository is meant. The one answer to the question
 * for discovery, the audits and the command line's note (2026-11-20; until then the command line kept a copy of its
 * own that followed links and read no `GIT_DIR`, and with a stale one said both that the folder lay in no repository
 * and that git could not be asked).
 */
export function liesInNoRepository(folder: string): boolean {
  if (process.env.GIT_DIR) return false;
  for (let at = path.resolve(folder); ; at = path.dirname(at)) {
    if (fs.lstatSync(path.join(at, ".git"), { throwIfNoEntry: false }) !== undefined) return false;
    if (path.dirname(at) === at) return true;
  }
}

/**
 * Git's listing of what it ignores under `folder` ({@link gitIgnores}), as paths relative to `folder` with no trailing
 * slash (`""` for `folder` itself), and the folders among them; or why git gave none. With `top`, as for a folder
 * asked directly, the listing counts only where git says `folder` is its repository's top: a link into the middle of a
 * repository, or to a folder whose `.git` git climbs past (an empty `.git/`), is not judged by the repository around
 * the place it leads to (2026-11-20).
 */
function listing(folder: string, nested: boolean, top: boolean): { entries: Set<string>; folders: Set<string> } | GitUnanswered {
  const env = gitEnvironment(nested);
  const failure = (result: ReturnType<typeof spawnSync>): GitUnanswered => ({
    reason: !result.error
      ? String(result.stderr ?? "").split("\n")[0].trim() || `git exited with ${result.status ?? result.signal}`
      : Reflect.get(result.error, "code") === "ENOBUFS" ? `git's answer was longer than the buffer that reads it (${result.error.message})` : `git could not be started (${result.error.message})`
  });
  // Where git stands in `folder`: inside a work tree or not, the way up to its top, and the folder's place below it. A
  // repository whose work tree is elsewhere, or that has none, answers for no file of the folder, the workspace's own
  // among them (2026-11-20).
  const where = spawnSync("git", ["-C", folder, "rev-parse", "--is-inside-work-tree", "--show-cdup", "--show-prefix"], { encoding: "utf8", env });
  if (where.error || where.status !== 0) return failure(where);
  const [inside, cdup = "", above = ""] = where.stdout.split("\n");
  if (inside !== "true") return { reason: `${folder} lies outside the work tree of the repository git finds there` };
  if (top && above !== "") return { reason: `${folder} is not the top of the repository git finds there, but its folder ${above}` };
  let failed: GitUnanswered | undefined;
  const listed = (at: readonly string[]): string[] | null => {
    const result = spawnSync("git", [...at, "ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory"], { encoding: "utf8", env, maxBuffer: 1 << 28 });
    if (!result.error && result.status === 0) return result.stdout.split("\0").filter((entry) => entry.length > 0);
    failed = failure(result);
    return null;
  };
  // The paths git prints are relative to the folder it is asked from: `folder`, or the repository's top above it.
  let prefix = "";
  let printed = listed(["-C", folder]);
  if (!printed) {
    // Asked from a folder inside one it ignores whole, git fails ("directory entry not superset of prefix"), as it does
    // when it cannot answer at all; asked from the repository's top, it names that folder.
    prefix = above;
    printed = prefix === "" ? null : listed(["-C", folder, "-C", cdup || "."]);
    if (!printed) return failed ?? { reason: "git's listing failed" };
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
