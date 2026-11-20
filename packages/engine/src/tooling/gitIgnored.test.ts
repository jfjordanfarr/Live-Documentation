import { globSync } from "glob";
import { spawnSync } from "node:child_process";
import nodeFs, { appendFileSync, existsSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { foldersReadAsEmpty, gitIgnored, gitIgnores, liesInNoRepository, type GitIgnoreAnswer } from "./gitIgnored";

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

  it("names nothing outside every repository, where git has no word and the caller's rule for no git judges", () => {
    const root = workspace();
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    writeFileSync(path.join(root, "a.log"), "x\n");
    expect(spawnSync("git", ["-C", root, "rev-parse"], { encoding: "utf8" }).status).toBe(128);
    expect(liesInNoRepository(root)).toBe(true);
    expect([...(gitIgnored(root, ["a.log"]) ?? ["no answer"])]).toEqual([]);
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

  it("asks a link to a repository's top of that repository directly, and leaves unjudged a link to a repository git refuses, to a plain folder and into the middle of a repository", () => {
    const outside = workspace();
    files(outside, ["repo/o.ts", "repo/o.local.ts", "bad/b.ts", "plain/p.ts", "mid/sub/m.ts", "mid/sub/m.local.ts", "mid/strayed/s.local.ts", "mid/hollow/h.local.ts"]);
    for (const folder of ["repo", "bad", "mid"]) git(path.join(outside, folder), "init", "-q");
    // A folder in the middle of `mid` whose `.git` names no repository: git there finds `mid` above it.
    writeFileSync(path.join(outside, "mid", "strayed", ".git"), "gitdir: nowhere\n");
    // And one whose `.git` is an empty folder, which git climbs past to `mid`.
    mkdirSync(path.join(outside, "mid", "hollow", ".git"));
    appendFileSync(path.join(outside, "repo", ".git", "info", "exclude"), "*.local.ts\n");
    appendFileSync(path.join(outside, "mid", ".git", "info", "exclude"), "*.local.ts\n");
    appendFileSync(path.join(outside, "bad", ".git", "config"), "[broken\n");
    const root = workspace();
    git(root, "init", "-q");
    mkdirSync(path.join(root, "links"));
    for (const [link, target] of [["repo", "repo"], ["bad", "bad"], ["plain", "plain"], ["mid", "mid/sub"], ["strayed", "mid/strayed"], ["hollow", "mid/hollow"]]) symlinkSync(path.join(outside, target), path.join(root, "links", link));
    // To the repository around, a link is a file: asked about it, git prints the link and nothing beyond it. Asked from
    // the linked folder, git answers as the linked repository there: at its top for `repo`, a subfolder for `mid`.
    const run = (cwd: string, ...args: string[]): string => spawnSync("git", ["--literal-pathspecs", "-C", cwd, ...args], { encoding: "utf8" }).stdout;
    expect(run(root, "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", "links/repo", ".git")).toBe("links/repo\0");
    expect(run(path.join(root, "links", "repo"), "ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory")).toBe("o.local.ts\0");
    expect(run(path.join(root, "links", "mid"), "rev-parse", "--show-prefix")).toBe("sub/\n");
    // Git refuses where a `.git` names no repository; it does not climb to `mid`.
    expect(spawnSync("git", ["-C", path.join(root, "links", "strayed"), "rev-parse", "--show-prefix"], { encoding: "utf8" }).status).toBe(128);
    // Past an empty `.git/` it climbs, and answers as `mid` with a prefix: not the linked repository's top.
    expect(run(path.join(root, "links", "hollow"), "rev-parse", "--show-prefix")).toBe("hollow/\n");
    expect(run(path.join(root, "links", "hollow"), "ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory")).toBe("./\0h.local.ts\0");
    const paths = ["links/repo/o.ts", "links/repo/o.local.ts", "links/bad/b.ts", "links/plain/p.ts", "links/mid/m.ts", "links/mid/m.local.ts", "links/strayed/s.local.ts", "links/hollow/h.local.ts"];
    // Until this round a link was never asked: both of `repo`'s files were unjudged, though the texts said otherwise.
    // And until the next, `links/hollow/h.local.ts` was judged ignored by `mid`, the repository around the place the
    // link leads to, in silence.
    expect(answer(root, paths)).toEqual({ ignored: ["links/repo/o.local.ts"], unjudged: ["links/bad/b.ts", "links/hollow/h.local.ts", "links/mid/m.local.ts", "links/mid/m.ts", "links/plain/p.ts", "links/strayed/s.local.ts"] });
  });

  it("leaves unjudged a submodule whose folder's case differs from its gitlink where git folds case, and judges as ignored what the listing around names in a folder git says nothing of", () => {
    const root = workspace();
    files(root, ["lib/a.ts", "stray/x.log", "stray/sub/y.log", "Vendor/lib/t.ts"]);
    git(path.join(root, "lib"), "init", "-q");
    git(path.join(root, "lib"), "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "c");
    git(root, "init", "-q");
    git(root, "config", "core.ignorecase", "true");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    git(root, "add", "lib", "Vendor/lib/t.ts");
    // As Windows allows: the submodule's folder renamed in case alone; its own exclude names `*.ts`. And a tracked
    // folder renamed in case alone, holding a repository, with nothing untracked in it but an ignored file.
    renameSync(path.join(root, "lib"), path.join(root, "Lib"));
    appendFileSync(path.join(root, "Lib", ".git", "info", "exclude"), "*.ts\n");
    files(root, ["Lib/x.log"]);
    writeFileSync(path.join(root, "stray", ".git"), "gitdir: nowhere\n");
    renameSync(path.join(root, "Vendor"), path.join(root, "vendor"));
    git(path.join(root, "vendor", "lib"), "init", "-q");
    files(root, ["vendor/lib/x.log"]);
    const run = (...args: string[]): string => spawnSync("git", ["-C", root, ...args], { encoding: "utf8" }).stdout;
    // Git prints nothing for either folder: matched exactly, `Lib` finds no gitlink, and every file of `stray` is
    // ignored. An ignore-case pathspec would find the gitlink (`:(icase)Lib`, without --literal-pathspecs); not used,
    // since it would re-make git's folding of case, and nothing printed is taken for git having said nothing.
    expect(run("--literal-pathspecs", "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", "Lib", ".git")).toBe("");
    expect(run("--literal-pathspecs", "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", "stray", ".git")).toBe("");
    expect(run("--literal-pathspecs", "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", "vendor/lib", ".git")).toBe("");
    expect(run("ls-files", "-z", "--stage", "--", ":(icase)Lib")).toMatch(/^160000 [0-9a-f]+ 0\tlib\0$/u);
    // The listing around names `stray/` whole, and `vendor/lib/x.log` by itself, inside a folder git enters.
    const listed = run("ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory").split("\0");
    expect(listed).toContain("stray/");
    expect(listed).toContain("vendor/lib/x.log");
    // Until this round `Lib` was taken for the outer repository's own folder, which git does not enter: `Lib/a.ts`, which
    // the submodule ignores, kept in silence. The tracked `vendor/lib/t.ts` is unjudged with them, warned of.
    expect(answer(root, ["Lib/a.ts", "Lib/x.log", "stray/x.log", "stray/sub/y.log", "vendor/lib/t.ts", "vendor/lib/x.log"])).toEqual({
      ignored: ["stray/sub/y.log", "stray/x.log", "vendor/lib/x.log"],
      unjudged: ["Lib/a.ts", "Lib/x.log", "vendor/lib/t.ts"]
    });
  });

  it("takes an answer longer than a repository's single entry for git entering the folder", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    const names = Array.from({ length: 1500 }, (_name, index) => `big/a-file-with-a-long-name-to-fill-the-answer-${String(index).padStart(4, "0")}.ts`);
    files(root, [...names, "big/x.log"]);
    writeFileSync(path.join(root, "big", ".git"), "gitdir: nowhere\n");
    const printed = spawnSync("git", ["--literal-pathspecs", "-C", root, "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", "big", ".git"], { encoding: "utf8", maxBuffer: 1 << 24 }).stdout;
    expect(printed.length).toBeGreaterThan(1 << 16);
    expect(answer(root, [names[0], "big/x.log"])).toEqual({ ignored: ["big/x.log"], unjudged: [] });
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

  it("says a path outside every repository lies in none, and answers an empty list", () => {
    const root = workspace();
    files(root, ["a.ts"]);
    expect(gitIgnoreAnswer(root, ["a.ts"])).toEqual({ ignored: new Set(), unjudged: new Set(), outside: new Set(["a.ts"]) });
    git(root, "init", "-q");
    expect(answer(root, [])).toEqual({ ignored: [], unjudged: [] });
  });

  it("asks each repository within a workspace that lies in no repository directly, and says what lies outside every one", () => {
    const root = workspace();
    // The reviewer's shape: a folder of clones, scanned as one, with a `.gitignore` of its own that no git reads.
    writeFileSync(path.join(root, ".gitignore"), "*.cfg\n");
    files(root, ["a.ts", "loose/x.cfg", "loose/b.ts", "proj/a.ts", "proj/settings.cfg", "proj/dist/bundle.js", "sub/inner/y.ts", "sub/inner/x.local.ts", "bad/b.ts", "hollow/h.ts"]);
    writeFileSync(path.join(root, "proj", ".gitignore"), "dist/\n");
    git(path.join(root, "proj"), "init", "-q");
    git(path.join(root, "proj"), "add", ".gitignore", "a.ts", "settings.cfg");
    git(path.join(root, "sub", "inner"), "init", "-q");
    appendFileSync(path.join(root, "sub", "inner", ".git", "info", "exclude"), "*.local.ts\n");
    git(path.join(root, "bad"), "init", "-q");
    appendFileSync(path.join(root, "bad", ".git", "config"), "[broken\n");
    // An empty `.git/`: git climbs past it and, above, finds no repository either.
    mkdirSync(path.join(root, "hollow", ".git"));
    const run = (cwd: string, ...args: string[]): { status: number | null; stdout: string } => spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
    // Git's own word first: none at the workspace; each repository's own status; none at the empty `.git`.
    expect(run(root, "rev-parse").status).toBe(128);
    expect(run(path.join(root, "proj"), "status", "--porcelain", "--ignored", "-uall").stdout).toBe("A  .gitignore\nA  a.ts\nA  settings.cfg\n!! dist/bundle.js\n");
    expect(run(path.join(root, "sub", "inner"), "status", "--porcelain", "--ignored", "-uall").stdout).toBe("?? y.ts\n!! x.local.ts\n");
    expect(run(path.join(root, "bad"), "status").status).toBe(128);
    expect(run(path.join(root, "hollow"), "rev-parse").status).toBe(128);
    const paths = ["a.ts", "loose/x.cfg", "loose/b.ts", "proj/a.ts", "proj/settings.cfg", "proj/dist/bundle.js", "sub/inner/y.ts", "sub/inner/x.local.ts", "bad/b.ts", "hollow/h.ts"];
    // Until this round git gave no answer at all here, and the workspace's `.gitignore` judged every file: the tracked
    // `proj/settings.cfg` left out, `proj/dist/bundle.js` documented, in silence.
    expect(gitIgnoreAnswer(root, paths)).toEqual({
      ignored: new Set(["proj/dist/bundle.js", "sub/inner/x.local.ts"]),
      unjudged: new Set(["bad/b.ts", "hollow/h.ts"]),
      outside: new Set(["a.ts", "loose/x.cfg", "loose/b.ts"])
    });
    // Nothing is left unread where the workspace has no listing of its own.
    expect(foldersGitIgnoresWhole(root).size).toBe(0);
  });

  it("asks a working clone below a folder whose git does not answer, where no repository is around, and counts a link to a plain folder there as outside", () => {
    const root = workspace();
    const parents = ["gitfile", "hollow", "badconfig", "format"];
    files(root, parents.flatMap((parent) => [`${parent}/loose.ts`, `${parent}/clone/a.ts`, `${parent}/clone/dist/out.ts`]));
    for (const parent of parents) {
      writeFileSync(path.join(root, parent, "clone", ".gitignore"), "dist/\n");
      git(path.join(root, parent, "clone"), "init", "-q");
    }
    writeFileSync(path.join(root, "gitfile", ".git"), "gitdir: nowhere\n");
    mkdirSync(path.join(root, "hollow", ".git"));
    for (const parent of ["badconfig", "format"]) git(path.join(root, parent), "init", "-q");
    appendFileSync(path.join(root, "badconfig", ".git", "config"), "[broken\n");
    git(path.join(root, "format"), "config", "core.repositoryformatversion", "99");
    const plain = workspace();
    files(plain, ["p.ts"]);
    symlinkSync(plain, path.join(root, "linked"));
    // Git's own word first: no answer at any parent, nor in the linked folder; each clone answers for itself.
    for (const folder of [root, plain, ...parents.map((parent) => path.join(root, parent))]) expect(spawnSync("git", ["-C", folder, "rev-parse"], { encoding: "utf8" }).status, folder).toBe(128);
    for (const parent of parents) expect(spawnSync("git", ["-C", path.join(root, parent, "clone"), "status", "--porcelain", "--ignored", "-uall"], { encoding: "utf8" }).stdout, parent).toBe("?? .gitignore\n?? a.ts\n!! dist/out.ts\n");
    // Until this round nothing below an unanswered folder was asked: every clone's `dist/out.ts` was unjudged, and kept.
    expect(gitIgnoreAnswer(root, [...parents.flatMap((parent) => [`${parent}/loose.ts`, `${parent}/clone/a.ts`, `${parent}/clone/dist/out.ts`]), "linked/p.ts"])).toEqual({
      ignored: new Set(parents.map((parent) => `${parent}/clone/dist/out.ts`)),
      unjudged: new Set(parents.map((parent) => `${parent}/loose.ts`)),
      outside: new Set(["linked/p.ts"])
    });
  });

  // Until 2026-11-20 `existsSync` probed each folder's `.git`, and read a probe that failed for a cause of the machine's
  // as no repository there: that repository's ignored files were judged by the one around, or by none.
  it("throws a probe of a folder's .git that fails for a cause of the machine's, and reads a .git that is a dangling link as none", () => {
    const root = workspace();
    files(root, ["proj/a.ts", "dangling/b.ts"]);
    git(path.join(root, "proj"), "init", "-q");
    symlinkSync(path.join(root, "nowhere"), path.join(root, "dangling", ".git"));
    expect(gitIgnoreAnswer(root, ["dangling/b.ts"])).toEqual({ ignored: new Set(), unjudged: new Set(), outside: new Set(["dangling/b.ts"]) });
    const probed = path.join(root, "proj", ".git");
    const statSync = nodeFs.statSync;
    const probe = vi.spyOn(nodeFs, "statSync").mockImplementation(((...args: unknown[]) => {
      if (String(args[0]) === probed) throw Object.assign(new Error(`EMFILE: too many open files, stat '${probed}'`), { code: "EMFILE", syscall: "stat", errno: -24 });
      return Reflect.apply(statSync, nodeFs, args);
    }) as typeof nodeFs.statSync);
    try {
      expect(() => gitIgnoreAnswer(root, ["proj/a.ts"])).toThrow("EMFILE: too many open files, stat");
    } finally {
      probe.mockRestore();
    }
  });

  it("judges a working clone below a broken repository by the clone's own rules, though the broken one's .gitignore names the clone", () => {
    // This pins a recorded choice, the root's ruling of 2026-11-20 on the reviewer's shape: whether `bad`, were its git
    // answering, would ignore `clone/` is not known, and is not guessed by reading `.git`'s insides. The person is warned
    // of `bad` by its own files, and mending it mends what lies below.
    const root = workspace();
    files(root, ["bad/b.ts", "bad/clone/c.ts", "bad/clone/x.log"]);
    writeFileSync(path.join(root, "bad", ".gitignore"), "clone/\n");
    writeFileSync(path.join(root, "bad", "clone", ".gitignore"), "*.log\n");
    git(path.join(root, "bad"), "init", "-q");
    appendFileSync(path.join(root, "bad", ".git", "config"), "[broken\n");
    git(path.join(root, "bad", "clone"), "init", "-q");
    // Git's own word first: none at the workspace or at `bad`; the clone answers for itself.
    expect(spawnSync("git", ["-C", root, "rev-parse"], { encoding: "utf8" }).status).toBe(128);
    expect(spawnSync("git", ["-C", path.join(root, "bad"), "status"], { encoding: "utf8" }).status).toBe(128);
    expect(spawnSync("git", ["-C", path.join(root, "bad", "clone"), "status", "--porcelain", "--ignored", "-uall"], { encoding: "utf8" }).stdout).toBe("?? .gitignore\n?? c.ts\n!! x.log\n");
    const paths = ["bad/.gitignore", "bad/b.ts", "bad/clone/.gitignore", "bad/clone/c.ts", "bad/clone/x.log"];
    // Kept: `bad/clone/.gitignore` and `bad/clone/c.ts`, in none of the three sets.
    expect(gitIgnoreAnswer(root, paths)).toEqual({
      ignored: new Set(["bad/clone/x.log"]),
      unjudged: new Set(["bad/.gitignore", "bad/b.ts"]),
      outside: new Set()
    });
  });

  it("asks a nested repository whose name git would read as a pattern or as magic by its name", () => {
    const root = workspace();
    git(root, "init", "-q");
    files(root, [":(x)lib/a.local.ts", ":(x)lib/b.ts", "a[1]/a.local.ts", "a[1]/b.ts", "a1/c.ts"]);
    for (const folder of [":(x)lib", "a[1]"]) {
      git(path.join(root, folder), "init", "-q");
      appendFileSync(path.join(root, folder, ".git", "info", "exclude"), "*.local.ts\n");
    }
    const question = (literal: boolean, folder: string): { status: number | null; stdout: string } =>
      spawnSync("git", [...(literal ? ["--literal-pathspecs"] : []), "-C", root, "ls-files", "-z", "--stage", "--others", "--exclude-standard", "--", folder, ".git"], { encoding: "utf8" });
    // Read as a pathspec, `:(x)lib` is magic git refuses; read as a name, git prints the folder whole: another repository.
    expect(question(false, ":(x)lib").status).toBe(128);
    expect(question(true, ":(x)lib").stdout).toBe(":(x)lib/\0");
    expect(question(true, "a[1]").stdout).toBe("a[1]/\0");
    expect(answer(root, [":(x)lib/a.local.ts", ":(x)lib/b.ts", "a[1]/a.local.ts", "a[1]/b.ts", "a1/c.ts"])).toEqual({ ignored: [":(x)lib/a.local.ts", "a[1]/a.local.ts"], unjudged: [] });
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
