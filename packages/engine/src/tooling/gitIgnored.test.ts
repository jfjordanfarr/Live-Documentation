import { globSync } from "glob";
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { foldersGitIgnoresWhole, foldersReadAsEmpty, gitIgnoreAnswer, withoutGitIgnored } from "./gitIgnored";

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

  it("judges a path in a submodule or a nested repository as one in a plain folder, and asks of a path through a link as its link", () => {
    const root = workspace();
    files(root, ["lib/lib.ts", "lib/own.tmp", "lib/x.gen", "lib/excl.ts", "nest/n.ts", "nest/own.tmp", "nest/x.gen", "nest/excl.ts", "shared/s.ts", "ign/kept.ts"]);
    writeFileSync(path.join(root, "lib", ".gitignore"), "*.tmp\n");
    writeFileSync(path.join(root, "nest", ".gitignore"), "*.tmp\n");
    git(path.join(root, "lib"), "init", "-q");
    git(path.join(root, "lib"), "add", "lib.ts", "x.gen", ".gitignore");
    git(path.join(root, "lib"), "-c", "user.email=t@example.com", "-c", "user.name=t", "commit", "-qm", "lib");
    appendFileSync(path.join(root, "lib", ".git", "info", "exclude"), "excl.ts\n");
    git(path.join(root, "nest"), "init", "-q");
    appendFileSync(path.join(root, "nest", ".git", "info", "exclude"), "excl.ts\n");
    git(root, "init", "-q");
    writeFileSync(path.join(root, ".gitignore"), "*.gen\nign/\n");
    git(root, "add", "lib", ".gitignore");
    git(root, "add", "-f", "ign/kept.ts");
    symlinkSync(path.join("..", "shared"), path.join(root, "ign", "link"));
    symlinkSync("shared", path.join(root, "open"));
    // The inner repositories' own .gitignore files count, and the outer one's; their .git/info/exclude does not, and a
    // file the submodule tracks (`lib/x.gen`) is judged by the outer patterns all the same.
    const paths = ["lib/lib.ts", "lib/own.tmp", "lib/x.gen", "lib/excl.ts", "nest/n.ts", "nest/own.tmp", "nest/x.gen", "nest/excl.ts", "ign/link/s.ts", "open/s.ts", "ign/kept.ts"];
    expect(answer(root, paths)).toEqual({ ignored: ["ign/link/s.ts", "lib/own.tmp", "lib/x.gen", "nest/own.tmp", "nest/x.gen"], unjudged: ["open/s.ts"] });
  });

  it("cannot answer outside a repository, and answers an empty list", () => {
    const root = workspace();
    expect(gitIgnoreAnswer(root, ["a.ts"])).toBeNull();
    expect(answer(root, [])).toEqual({ ignored: [], unjudged: [] });
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
