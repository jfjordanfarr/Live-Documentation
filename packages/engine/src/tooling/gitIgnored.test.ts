import { globSync } from "glob";
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { foldersGitIgnoresWhole, foldersReadAsEmpty, gitIgnores, withoutGitIgnored, type GitIgnoreAnswer } from "./gitIgnored";

const gitIgnoreAnswer = (root: string, paths: readonly string[]): GitIgnoreAnswer | null => gitIgnores(root)?.answer(paths) ?? null;

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

describe("withoutGitIgnored", () => {
  it("drops what .gitignore and .git/info/exclude name, and keeps a tracked file whatever ignores it", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.log\n");
    appendFileSync(path.join(root, ".git", "info", "exclude"), "nested/\n");
    mkdirSync(path.join(root, "nested"));
    for (const file of ["a.log", "b.md", "kept.log", "nested/c.md"]) writeFileSync(path.join(root, file), "x\n");
    git(root, "add", "-f", "kept.log");

    const files = ["a.log", "b.md", "kept.log", "nested/c.md"].map((file) => path.join(root, file));
    expect(withoutGitIgnored(root, files)).toEqual([path.join(root, "b.md"), path.join(root, "kept.log")]);
  });

  it("keeps every file outside a repository, and answers an empty list with an empty list", () => {
    const root = workspace();
    writeFileSync(path.join(root, "a.log"), "x\n");
    const files = [path.join(root, "a.log")];
    expect(withoutGitIgnored(root, files)).toEqual(files);
    expect(withoutGitIgnored(root, [])).toEqual([]);
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
    files(root, ["lib/lib.ts", "lib/own.tmp", "lib/x.gen", "lib/y.gen", "lib/excl.ts", "nest/n.ts", "nest/own.tmp", "nest/x.gen", "nest/excl.ts", "hid/h.ts", "shared/s.ts", "ign/kept.ts"]);
    writeFileSync(path.join(root, "lib", ".gitignore"), "*.tmp\n");
    writeFileSync(path.join(root, "nest", ".gitignore"), "*.tmp\n");
    git(path.join(root, "lib"), "init", "-q");
    git(path.join(root, "lib"), "add", "lib.ts", "x.gen", ".gitignore");
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
    const paths = ["lib/lib.ts", "lib/own.tmp", "lib/x.gen", "lib/y.gen", "lib/excl.ts", "nest/n.ts", "nest/own.tmp", "nest/x.gen", "nest/excl.ts", "hid/h.ts", "ign/link/s.ts", "open/s.ts", "ign/kept.ts"];
    const expected = { ignored: ["hid/h.ts", "ign/link/s.ts", "lib/excl.ts", "lib/own.tmp", "nest/excl.ts", "nest/own.tmp"], unjudged: ["open/s.ts"] };
    expect(answer(root, paths)).toEqual(expected);
    // With git tied to the outer repository by its variables, as the history ties it to a tree, each nested repository
    // is still asked by its own `.git`.
    const tied = { GIT_DIR: process.env.GIT_DIR, GIT_WORK_TREE: process.env.GIT_WORK_TREE };
    process.env.GIT_DIR = path.join(root, ".git");
    process.env.GIT_WORK_TREE = root;
    try {
      expect(answer(root, paths)).toEqual(expected);
    } finally {
      for (const [name, value] of Object.entries(tied)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it("leaves unjudged a path in a nested repository whose git cannot answer", () => {
    const root = workspace();
    git(root, "init", "-q");
    files(root, ["broken/a.ts", "b.ts"]);
    writeFileSync(path.join(root, "broken", ".git"), "gitdir: nowhere\n");
    expect(answer(root, ["broken/a.ts", "b.ts"])).toEqual({ ignored: [], unjudged: ["broken/a.ts"] });
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
    // Asked from the workspace, or from the repository's top limited to it, git 2.56.1 fails two folders inside an
    // ignored one ("directory entry not superset of prefix"); asked from the top with no limit, it names `ign/`, so
    // the workspace is ignored whole. Until this form no folder was named there, and the walk was whole.
    const deep = path.join(outer, "ign", "a", "b", "ws");
    expect([...foldersGitIgnoresWhole(deep)]).toEqual([""]);
    expect(ignored(deep, [".", "c.ts"])).toEqual([".", "c.ts"]);
  });

  it("answers the same whatever GIT_*_PATHSPECS the person's environment holds", () => {
    const root = workspace();
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "build/\n");
    appendFileSync(path.join(root, ".git", "info", "exclude"), "*.local.ts\n");
    files(root, ["build/a.ts", "b.local.ts", "c.ts", "sub/A.ts"]);
    const paths = ["build/a.ts", "b.local.ts", "c.ts", "sub/A.ts"];
    for (const name of ["GIT_LITERAL_PATHSPECS", "GIT_GLOB_PATHSPECS", "GIT_NOGLOB_PATHSPECS", "GIT_ICASE_PATHSPECS"]) {
      process.env[name] = "1";
      try {
        expect(ignored(root, paths), name).toEqual(["b.local.ts", "build/a.ts"]);
        expect([...foldersGitIgnoresWhole(path.join(root, "sub"))], name).toEqual([]);
      } finally {
        delete process.env[name];
      }
    }
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

  it("tells apart two folders whose names differ in case alone", () => {
    const root = workspace();
    for (const file of ["Skip/a.md", "skip/b.md"]) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "");
    }
    expect(globSync("**/*.md", { cwd: root, fs: foldersReadAsEmpty(root, new Set(["Skip"])), posix: true })).toEqual(["skip/b.md"]);
  });
});
