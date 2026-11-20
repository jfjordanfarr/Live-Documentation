import { globSync } from "glob";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { foldersReadAsEmpty, gitIgnored, gitIgnores, type GitIgnoreAnswer } from "./gitIgnored";

const gitIgnoreAnswer = (root: string, paths: readonly string[]): GitIgnoreAnswer | null => gitIgnores(root)?.answer(paths) ?? null;
const foldersGitIgnoresWhole = (root: string): ReadonlySet<string> => gitIgnores(root)?.folders ?? new Set();

/** Whether this disk tells apart two names that differ in case alone, as Linux's do and Windows' and macOS's do not. */
const diskTellsCaseApart = ((): boolean => {
  const probe = mkdtempSync(path.join(tmpdir(), "case-probe-"));
  writeFileSync(path.join(probe, "a"), "");
  const apart = !existsSync(path.join(probe, "A"));
  rmSync(probe, { recursive: true, force: true });
  return apart;
})();

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

function workspace(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "slopcop-git-ignored-"));
  tempDirs.push(dir);
  return dir;
}

function git(cwd: string, ...args: string[]): void {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
}

describe("gitIgnored", () => {
  it("names what .gitignore and .git/info/exclude ignore, and never a tracked file whatever ignores it", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    appendFileSync(path.join(root, ".git", "info", "exclude"), "nested/\n");
    mkdirSync(path.join(root, "nested"));
    for (const file of ["a.log", "b.md", "kept.log", "nested/c.md"]) writeFileSync(path.join(root, file), "x\n");
    git(root, "add", "-f", "kept.log");
    expect([...(gitIgnored(root, ["a.log", "b.md", "kept.log", "nested/c.md", "nested"]) ?? [])].sort()).toEqual(["a.log", "nested", "nested/c.md"]);
  });

  it("cannot answer outside a repository", () => {
    const root = workspace();
    writeFileSync(path.join(root, "a.log"), "x\n");
    expect(gitIgnored(root, ["a.log"])).toBeNull();
  });
});

describe("gitIgnoreAnswer", () => {
  function files(root: string, names: readonly string[]): void {
    for (const file of names) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "x\n");
    }
  }
  const answer = (root: string, paths: readonly string[]): { ignored: string[]; unjudged: string[] } | null => {
    const given = gitIgnoreAnswer(root, paths);
    return given && { ignored: [...given.ignored].sort(), unjudged: [...given.unjudged].sort() };
  };

  it("judges each path by its name, not as a pattern that a tracked file matches", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "build/\n*.log\nout/\n");
    const paths = ["a1/build/x.ts", "a[1]/build/x.ts", "a1.log", "a[1].log", "bc/x.log", "b?/x.log", "ab/out/x.ts", "a\\b/out/x.ts", "a*/out/y.ts"];
    files(root, paths);
    git(root, "add", "-f", "a1/build/x.ts", "a1.log", "bc/x.log", "ab/out/x.ts");
    // Asked as patterns, the untracked ones matched the tracked ones and were not reported, all but `a*/out/y.ts`.
    expect(answer(root, paths)).toEqual({ ignored: ["a*/out/y.ts", "a[1].log", "a[1]/build/x.ts", "a\\b/out/x.ts", "b?/x.log"], unjudged: [] });
  });

  it("judges a path beginning with a colon as its name, and a folder holding a tracked file as tracked", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "abc.ts\n/:(*\n/:!*\nmixed/\n");
    files(root, [":abc.ts", "abc.ts", ":(x).ts", ":!y.ts", "mixed/kept.ts", "mixed/other.ts", "plain/a.ts"]);
    git(root, "add", "-f", "mixed/kept.ts");
    // Asked as a pathspec, `:abc.ts` was judged as `abc.ts`, and `:(x).ts` and `:!y.ts` were refused with every path.
    expect(answer(root, [":abc.ts", "abc.ts", ":(x).ts", ":!y.ts", "mixed", "mixed/kept.ts", "mixed/other.ts", "plain"])).toEqual({
      ignored: [":!y.ts", ":(x).ts", "abc.ts", "mixed/other.ts"],
      unjudged: []
    });
  });

  it("judges a path in a submodule or a nested repository by that repository's own git, and asks of a path through a link as its link", () => {
    const root = workspace();
    files(root, ["lib/lib.ts", "lib/own.tmp", "lib/kept.tmp", "lib/x.gen", "lib/y.gen", "lib/excl.ts", "nest/n.ts", "nest/own.tmp", "nest/x.gen", "nest/excl.ts", "hid/h.ts", "shared/s.ts", "ign/kept.ts", "sep/s.ts", "sep/s.tmp", "sep/z.gen"]);
    writeFileSync(path.join(root, "lib", ".gitignore"), "*.tmp\n");
    writeFileSync(path.join(root, "nest", ".gitignore"), "*.tmp\n");
    git(path.join(root, "lib"), "init", "-q");
    git(path.join(root, "lib"), "add", "lib.ts", "x.gen", ".gitignore");
    git(path.join(root, "lib"), "add", "-f", "kept.tmp");
    // A repository whose `.git` is a file naming its store elsewhere, the form a submodule and a linked worktree take.
    const store = path.join(workspace(), "sep.git");
    git(root, "init", "-q", "--separate-git-dir", store, "sep");
    appendFileSync(path.join(store, "info", "exclude"), "*.tmp\n");
    git(path.join(root, "lib"), "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-qm", "lib");
    appendFileSync(path.join(root, "lib", ".git", "info", "exclude"), "excl.ts\n");
    git(path.join(root, "nest"), "init", "-q");
    appendFileSync(path.join(root, "nest", ".git", "info", "exclude"), "excl.ts\n");
    git(path.join(root, "hid"), "init", "-q");
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.gen\nign/\nhid/\n");
    git(root, "add", "lib", ".gitignore");
    git(root, "add", "-f", "ign/kept.ts");
    symlinkSync(path.join("..", "shared"), path.join(root, "ign", "link"));
    symlinkSync("shared", path.join(root, "open"));
    // Each repository's own rules judge its own paths, its `.git/info/exclude` among them, and what it tracks
    // (`lib/x.gen`) is never ignored; the outer `*.gen` reaches no file of theirs. The outer repository decides only
    // whether a nested repository's folder is ignored (`hid/`). Until this form, `lib/x.gen` and `nest/x.gen` were
    // judged ignored by the outer pattern, and `lib/excl.ts` and `nest/excl.ts` kept.
    const paths = ["lib/lib.ts", "lib/own.tmp", "lib/kept.tmp", "lib/x.gen", "lib/y.gen", "lib/excl.ts", "nest/n.ts", "nest/own.tmp", "nest/x.gen", "nest/excl.ts", "hid/h.ts", "ign/link/s.ts", "open/s.ts", "ign/kept.ts", "sep/s.ts", "sep/s.tmp", "sep/z.gen"];
    const expected = { ignored: ["hid/h.ts", "ign/link/s.ts", "lib/excl.ts", "lib/own.tmp", "nest/excl.ts", "nest/own.tmp", "sep/s.tmp"], unjudged: ["open/s.ts"] };
    expect(answer(root, paths)).toEqual(expected);
    // With git tied to the outer repository by its variables, as the history ties it to a tree, each nested repository
    // is still asked by its own `.git` and its own index (where `lib/kept.tmp` is tracked).
    const tied = { GIT_DIR: process.env.GIT_DIR, GIT_WORK_TREE: process.env.GIT_WORK_TREE, GIT_INDEX_FILE: process.env.GIT_INDEX_FILE };
    process.env.GIT_DIR = path.join(root, ".git");
    process.env.GIT_WORK_TREE = root;
    process.env.GIT_INDEX_FILE = path.join(root, ".git", "index");
    try {
      expect(answer(root, paths)).toEqual(expected);
    } finally {
      for (const [name, value] of Object.entries(tied)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it("judges by the outer listing a folder whose .git names no repository, or below which the outer index holds an entry", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\nbuild/\n");
    files(root, ["broken/a.ts", "broken/x.log", "broken/build/b.ts", "vendor/lib/a.ts", "vendor/lib/x.log", "c.ts"]);
    git(root, "add", ".");
    git(root, "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-qm", "c");
    files(root, ["added/n.ts", "added/x.log", "added/later.ts"]);
    git(root, "add", "-N", "added/later.ts");
    writeFileSync(path.join(root, "broken", ".git"), "gitdir: nowhere\n");
    // A folder holding a repository of its own below which the outer index has a tracked entry, and one with only an
    // intent-to-add entry: git takes both for its own folders (the review of the third form, 2026-11-20).
    git(path.join(root, "vendor", "lib"), "init", "-q");
    appendFileSync(path.join(root, "vendor", "lib", ".git", "info", "exclude"), "a.ts\n");
    git(path.join(root, "added"), "init", "-q");
    appendFileSync(path.join(root, "added", ".git", "info", "exclude"), "n.ts\n");
    const paths = ["broken/a.ts", "broken/x.log", "broken/build/b.ts", "vendor/lib/a.ts", "vendor/lib/x.log", "added/n.ts", "added/x.log", "added/later.ts", "c.ts"];
    // Until this was mended, `broken/` was left unjudged, `vendor/lib/a.ts` (tracked) judged ignored by the inner
    // exclude and `vendor/lib/x.log` kept, and `added/` judged by its inner repository.
    expect(answer(root, paths)).toEqual({ ignored: ["added/x.log", "broken/build/b.ts", "broken/x.log", "vendor/lib/x.log"], unjudged: [] });
  });

  it("takes git's own view of each folder holding a .git, from the repository around it, and leaves unjudged what git refuses to answer for", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\nign/\n");
    const own = ["named-nothing", "tracked", "intent", "deeper", "ign"];
    const other = ["plain", "unborn", "linked", "sep", "worktree", "inner/deep"];
    const refusing = ["bare", "elsewhere", "badconfig", "format", "module"];
    for (const folder of [...own, ...other, ...refusing, "inner"]) files(root, [`${folder}/a.ts`, `${folder}/x.log`]);
    files(root, ["tracked/t.ts", "deeper/sub/s.ts"]);
    git(root, "add", "-f", "tracked/t.ts");
    git(root, "add", "-N", "intent/a.ts");
    writeFileSync(path.join(root, "named-nothing", ".git"), "gitdir: nowhere\n");
    const commit = (where: string): void => git(where, "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "c");
    // A gitlink deeper down: a submodule of the outer index inside `deeper/`.
    git(path.join(root, "deeper", "sub"), "init", "-q");
    commit(path.join(root, "deeper", "sub"));
    git(root, "add", "deeper/sub");
    for (const folder of ["tracked", "intent", "deeper", "ign", "plain", "unborn", "badconfig", "format", "inner", "inner/deep"]) git(path.join(root, folder), "init", "-q");
    for (const folder of ["plain", "inner", "inner/deep"]) commit(path.join(root, folder));
    // A submodule at the folder itself, whose own git refuses (its format unknown).
    git(path.join(root, "module"), "init", "-q");
    commit(path.join(root, "module"));
    git(root, "add", "module");
    const stores = workspace();
    git(root, "init", "-q", "--separate-git-dir", path.join(stores, "sep.git"), "sep");
    git(stores, "init", "-q", "--bare", "linked.git");
    symlinkSync(path.join(stores, "linked.git"), path.join(root, "linked", ".git"));
    git(path.join(stores, "linked.git"), "config", "core.bare", "false");
    git(path.join(stores, "linked.git"), "config", "core.worktree", path.join(root, "linked"));
    git(path.join(root, "plain"), "worktree", "add", "-q", "--detach", path.join(root, "worktree", "wt"));
    renameSync(path.join(root, "worktree", "a.ts"), path.join(root, "worktree", "wt", "a.ts"));
    renameSync(path.join(root, "worktree", "x.log"), path.join(root, "worktree", "wt", "x.log"));
    git(root, "init", "-q", "--bare", "bare/.git");
    git(root, "init", "-q", "elsewhere");
    git(path.join(root, "elsewhere"), "config", "core.worktree", stores);
    appendFileSync(path.join(root, "badconfig", ".git", "config"), "[broken\n");
    git(path.join(root, "format"), "config", "core.repositoryformatversion", "99");
    git(path.join(root, "module"), "config", "core.repositoryformatversion", "99");
    for (const store of ["plain/.git", "unborn/.git", "inner/.git", "inner/deep/.git", "tracked/.git", "intent/.git", "deeper/.git", "ign/.git", path.join(stores, "sep.git"), path.join(stores, "linked.git")]) {
      appendFileSync(path.join(path.isAbsolute(store) ? store : path.join(root, store), "info", "exclude"), "a.ts\n");
    }
    // The form of the review of the third form, git's listing of what it does not ignore, limited to the folder: it
    // prints the folder whole where git takes it for another repository, and enters it otherwise; but at a submodule's
    // own folder it prints nothing, as for a folder of its own with nothing untracked in it, so the gitlink is read too.
    const view = (around: string, folder: string): string[] => spawnSync("git", ["--literal-pathspecs", "-C", around, "ls-files", "-z", "--others", "--exclude-standard", "--", folder], { encoding: "utf8" }).stdout.split("\0").filter((entry) => entry.length > 0);
    for (const folder of [...other.filter((folder) => folder !== "inner/deep" && folder !== "worktree"), "worktree/wt", "bare", "elsewhere", "badconfig", "format", "inner"]) expect(view(root, folder), folder).toEqual([`${folder}/`]);
    expect(view(path.join(root, "inner"), "deep")).toEqual(["deep/"]);
    expect(view(root, "module")).toEqual([]);
    for (const folder of ["named-nothing", "tracked", "intent", "deeper"]) expect(view(root, folder), folder).toEqual(folder === "intent" ? [] : [`${folder}/a.ts`]);
    expect(view(root, "ign")).toEqual([]);

    const paths = [...own, ...other.filter((folder) => folder !== "worktree"), "worktree/wt", ...refusing].flatMap((folder) => [`${folder}/a.ts`, `${folder}/x.log`]);
    // Git's own folders: the outer `*.log` judges, the inner exclude does not. Another repository: its own exclude
    // judges, the outer `*.log` does not. One whose git refuses: unjudged. Until this form `badconfig/`, `format/` and a
    // submodule refusing were taken for folders of the outer repository, which git does not enter, and their files kept.
    expect(answer(root, paths)).toEqual({
      ignored: ["deeper/x.log", "ign/a.ts", "ign/x.log", "inner/deep/a.ts", "intent/x.log", "linked/a.ts", "named-nothing/x.log", "plain/a.ts", "sep/a.ts", "tracked/x.log", "unborn/a.ts", "worktree/wt/a.ts"].sort(),
      unjudged: ["badconfig/a.ts", "badconfig/x.log", "bare/a.ts", "bare/x.log", "elsewhere/a.ts", "elsewhere/x.log", "format/a.ts", "format/x.log", "module/a.ts", "module/x.log"]
    });
  });

  it("leaves unjudged a path in a nested repository whose owner git does not trust, though it trusts the repository around it", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    files(root, ["a.ts", "nest/b.ts", "nest/x.log"]);
    writeFileSync(path.join(root, "nest", ".gitignore"), "b.ts\n");
    git(path.join(root, "nest"), "init", "-q");
    const names = ["GIT_TEST_ASSUME_DIFFERENT_OWNER", "GIT_CONFIG_GLOBAL", "GIT_CONFIG_NOSYSTEM", "GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"];
    const given = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    // Git's own switch for an owner other than the person, and `safe.directory` naming the outer folder alone; no global
    // or system configuration, which may trust every folder (this container's names `*`).
    const empty = path.join(workspace(), "gitconfig");
    writeFileSync(empty, "");
    Object.assign(process.env, { GIT_TEST_ASSUME_DIFFERENT_OWNER: "1", GIT_CONFIG_GLOBAL: empty, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "safe.directory", GIT_CONFIG_VALUE_0: realpathSync(root) });
    try {
      // Until this form `nest/` was taken for a folder of the outer repository, which git does not enter: both kept, in silence.
      expect(answer(root, ["a.ts", "nest/b.ts", "nest/x.log"])).toEqual({ ignored: [], unjudged: ["nest/b.ts", "nest/x.log"] });
    } finally {
      for (const [name, value] of Object.entries(given)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it("takes for the outer repository's own a tracked folder whose case differs on the disk and holds a repository, where core.ignorecase is true", () => {
    const root = workspace();
    git(root, "init", "-q");
    git(root, "config", "core.ignorecase", "true");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    files(root, ["Vendor/lib/a.ts"]);
    git(root, "add", "Vendor/lib/a.ts");
    git(root, "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-qm", "c");
    // As Windows allows a rename of case alone; git's index, which folds case, still holds `vendor/lib/a.ts`.
    renameSync(path.join(root, "Vendor"), path.join(root, "vendor"));
    files(root, ["vendor/lib/x.log"]);
    git(path.join(root, "vendor", "lib"), "init", "-q");
    appendFileSync(path.join(root, "vendor", "lib", ".git", "info", "exclude"), "a.ts\n");
    files(root, ["vendor/lib/n.ts"]);
    const run = (...args: string[]): string[] => spawnSync("git", ["--literal-pathspecs", "-C", root, ...args], { encoding: "utf8" }).stdout.split("\0").filter((entry) => entry.length > 0);
    // Git's own view, as status has it, enters the folder (and calls the tracked file deleted, where the disk tells case
    // apart); `ls-files` limited to the folder alone first drops the index entries outside `vendor/`, exactly in case,
    // and takes the folder for another repository. With a second pathspec that matches nothing, nothing is dropped.
    expect(run("status", "--porcelain", "-z", "-uall", "--", "vendor/lib")).toEqual(["?? vendor/lib/n.ts"]);
    expect(run("ls-files", "-z", "--others", "--exclude-standard", "--", "vendor/lib")).toEqual(["vendor/lib/"]);
    expect(run("ls-files", "-z", "--others", "--exclude-standard", "--", "vendor/lib", ".git")).toEqual(["vendor/lib/n.ts"]);
    // Until this form the outer index was compared exactly: `vendor/lib` was taken for another repository, the tracked
    // `a.ts` dropped by its exclude and `x.log` kept.
    expect(answer(root, ["vendor/lib/a.ts", "vendor/lib/x.log", "vendor/lib/n.ts"])).toEqual({ ignored: ["vendor/lib/x.log"], unjudged: [] });
  });

  it("judges by the outer listing a folder whose .git file names no repository and below which nothing is tracked", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    files(root, ["stray/a.ts", "stray/x.log", "stray/sub/b.log"]);
    writeFileSync(path.join(root, "stray", ".git"), "gitdir: nowhere\n");
    expect(answer(root, ["stray/a.ts", "stray/x.log", "stray/sub/b.log"])).toEqual({ ignored: ["stray/sub/b.log", "stray/x.log"], unjudged: [] });
  });

  it("leaves unjudged a path in a real nested repository whose git cannot answer", () => {
    const root = workspace();
    git(root, "init", "-q");
    files(root, ["nest/a.ts", "b.ts"]);
    git(path.join(root, "nest"), "init", "-q");
    // An index git cannot read: git finds the repository, and its listing fails.
    writeFileSync(path.join(root, "nest", ".git", "index"), "not an index\n");
    expect(answer(root, ["nest/a.ts", "b.ts"])).toEqual({ ignored: [], unjudged: ["nest/a.ts"] });
  });

  it("asks a nested repository with the person's command-line configuration, as git does a submodule", () => {
    const root = workspace();
    git(root, "init", "-q");
    files(root, ["a.secret.ts", "nest/b.secret.ts", "nest/c.ts"]);
    git(path.join(root, "nest"), "init", "-q");
    const excludes = path.join(workspace(), "excludes");
    writeFileSync(excludes, "*.secret.ts\n");
    const given = { GIT_CONFIG_COUNT: process.env.GIT_CONFIG_COUNT, GIT_CONFIG_KEY_0: process.env.GIT_CONFIG_KEY_0, GIT_CONFIG_VALUE_0: process.env.GIT_CONFIG_VALUE_0, GIT_CONFIG_PARAMETERS: process.env.GIT_CONFIG_PARAMETERS };
    try {
      // Both forms git gives a command's own configuration to the commands it starts: numbered, and `git -c`'s.
      Object.assign(process.env, { GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "core.excludesFile", GIT_CONFIG_VALUE_0: excludes });
      expect(answer(root, ["a.secret.ts", "nest/b.secret.ts", "nest/c.ts"])).toEqual({ ignored: ["a.secret.ts", "nest/b.secret.ts"], unjudged: [] });
      for (const name of ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"]) delete process.env[name];
      process.env.GIT_CONFIG_PARAMETERS = `'core.excludesfile'='${excludes}'`;
      expect(answer(root, ["a.secret.ts", "nest/b.secret.ts", "nest/c.ts"])).toEqual({ ignored: ["a.secret.ts", "nest/b.secret.ts"], unjudged: [] });
    } finally {
      for (const [name, value] of Object.entries(given)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it("cannot answer outside a repository, and answers an empty list", () => {
    const root = workspace();
    expect(gitIgnoreAnswer(root, ["a.ts"])).toBeNull();
    git(root, "init", "-q");
    expect(answer(root, [])).toEqual({ ignored: [], unjudged: [] });
  });
});

/**
 * The faults of the form that re-made git's classification with `git check-ignore --no-index` (2026-11-20, second
 * form), each red there: the listing is git's own classification, and gives git's answer in each.
 */
describe("git's own classification, where re-making it failed", () => {
  const commit = (root: string): void => git(root, "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-qm", "c");
  function files(root: string, names: readonly string[]): void {
    for (const file of names) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "x\n");
    }
  }
  const ignored = (root: string, paths: readonly string[]): string[] | null => {
    const found = gitIgnores(root)?.answer(paths).ignored;
    return found ? [...found].sort() : null;
  };

  it("reads a .gitignore that sparse checkout keeps off the disk, from the index", () => {
    const root = workspace();
    git(root, "init", "-q");
    files(root, ["in/a.ts", "out/b.ts"]);
    writeFileSync(path.join(root, "out", ".gitignore"), "*.log\n");
    git(root, "add", ".");
    commit(root);
    git(root, "sparse-checkout", "set", "in");
    files(root, ["out/x.log", "out/y.ts"]);
    expect(ignored(root, ["out/x.log", "out/y.ts", "in/a.ts"])).toEqual(["out/x.log"]);
  });

  it("reads a .gitignore marked skip-worktree and gone from the disk, from the index", () => {
    const root = workspace();
    git(root, "init", "-q");
    files(root, ["sub/a.ts"]);
    writeFileSync(path.join(root, "sub", ".gitignore"), "*.log\nbuild/\n");
    git(root, "add", ".");
    commit(root);
    git(root, "update-index", "--skip-worktree", "sub/.gitignore");
    rmSync(path.join(root, "sub", ".gitignore"));
    files(root, ["sub/x.log", "sub/build/y.ts", "sub/z.ts"]);
    expect(ignored(root, ["sub/x.log", "sub/build/y.ts", "sub/z.ts", "sub/a.ts"])).toEqual(["sub/build/y.ts", "sub/x.log"]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual(["sub/build"]);
  });

  it("takes a tracked file whose folder differs in case on the disk for the tracked file, where core.ignorecase is true", () => {
    const root = workspace();
    git(root, "init", "-q");
    git(root, "config", "core.ignorecase", "true");
    writeFileSync(path.join(root, ".gitignore"), "build/\n");
    files(root, ["Build/a.ts"]);
    git(root, "add", "-f", "Build/a.ts");
    commit(root);
    // As Windows allows a rename of case alone; on this disk the folder is then `build` alone.
    renameSync(path.join(root, "Build"), path.join(root, "build"));
    files(root, ["build/new.ts"]);
    expect(ignored(root, ["build/a.ts", "build/new.ts"])).toEqual(["build/new.ts"]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual([]);
  });

  it("judges a file that took the place of a tracked folder as the file it is", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "/x\n");
    files(root, ["x/y.ts"]);
    git(root, "add", "-f", "x/y.ts");
    commit(root);
    rmSync(path.join(root, "x"), { recursive: true });
    writeFileSync(path.join(root, "x"), "x\n");
    expect(ignored(root, ["x"])).toEqual(["x"]);
  });

  it("does not take for ignored a workspace that holds a tracked file inside a folder an outer repository ignores, and answers from two folders deep", () => {
    const outer = workspace();
    git(outer, "init", "-q");
    writeFileSync(path.join(outer, ".gitignore"), "ign/\n");
    files(outer, ["ign/ws/kept.ts", "ign/ws/other.ts", "ign/a/b/ws/c.ts"]);
    git(outer, "add", "-f", "ign/ws/kept.ts");
    const inner = path.join(outer, "ign", "ws");
    expect(ignored(inner, ["."])).toEqual([]);
    expect(ignored(inner, ["kept.ts", "other.ts"])).toEqual(["other.ts"]);
    // Asked from the workspace, or from the repository's top limited to it, git 2.56.1 fails anywhere inside a folder it
    // ignores whole ("directory entry not superset of prefix"; `./` is printed only from that folder itself); asked from
    // the top with no limit, it names `ign/`, so the workspace is ignored whole. Until this form no folder was named
    // there, and the walk was whole.
    const deep = path.join(outer, "ign", "a", "b", "ws");
    expect([...foldersGitIgnoresWhole(deep)]).toEqual([""]);
    expect(ignored(deep, [".", "c.ts"])).toEqual([".", "c.ts"]);
  });

});

describe("foldersGitIgnoresWhole", () => {
  const searchPath = process.env.PATH;
  afterEach(() => {
    process.env.PATH = searchPath;
  });

  it("names each folder git ignores whole once, descends into one that holds a tracked file, and reads a path beginning with a colon as a name", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "build/\nmixed/\n*.log\n/:*\nempty/\n");
    for (const file of ["build/a/b.txt", "mixed/kept.txt", "mixed/dropped.txt", "mixed/sub/c.txt", "logs/x.log", "part/y.log", "part/kept.txt", ":(bad)/c.txt"]) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "x\n");
    }
    mkdirSync(path.join(root, "empty"));
    git(root, "add", "-f", "mixed/kept.txt");

    // `logs/` holds only what is ignored; an empty ignored folder is named too, and holds nothing to walk.
    expect([...foldersGitIgnoresWhole(root)].sort()).toEqual([":(bad)", "build", "empty", "logs", "mixed/sub"]);
    // From a folder inside the workspace, the folders are named from there.
    expect([...foldersGitIgnoresWhole(path.join(root, "mixed"))]).toEqual(["sub"]);
    // From an ignored folder, git names the folder itself (`./`): the workspace's own path.
    expect([...foldersGitIgnoresWhole(path.join(root, "build"))]).toEqual([""]);
  });

  it("names none outside a repository, or with no git on the path", () => {
    const root = workspace();
    mkdirSync(path.join(root, "build"));
    writeFileSync(path.join(root, "build", "a.txt"), "x\n");
    writeFileSync(path.join(root, ".gitignore"), "build/\n");
    expect(foldersGitIgnoresWhole(root).size).toBe(0);
    git(root, "init", "-q");
    expect([...foldersGitIgnoresWhole(root)]).toEqual(["build"]);
    process.env.PATH = workspace();
    expect(foldersGitIgnoresWhole(root).size).toBe(0);
  });
});

describe("foldersReadAsEmpty", () => {
  it("hides the named folders' contents from glob, and no other folder's", () => {
    const root = workspace();
    for (const file of ["skip/a.md", "skip/deep/b.md", "skipped/c.md", "keep/skip/d.md"]) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "");
    }
    const unread = foldersReadAsEmpty(root, new Set(["skip"]));
    expect(globSync("**/*.md", { cwd: root, fs: unread, posix: true }).sort()).toEqual(["keep/skip/d.md", "skipped/c.md"]);
  });

  // Two such folders can only be made where the disk tells case apart; on a disk that folds case there is one.
  it.runIf(diskTellsCaseApart)("tells apart two folders whose names differ in case alone, where the disk does", () => {
    const root = workspace();
    for (const file of ["Skip/a.md", "skip/b.md"]) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "");
    }
    expect(globSync("**/*.md", { cwd: root, fs: foldersReadAsEmpty(root, new Set(["Skip"])), posix: true })).toEqual(["skip/b.md"]);
  });
});
