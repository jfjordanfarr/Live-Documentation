import { globSync } from "glob";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { foldersGitIgnoresWhole, foldersReadAsEmpty, walksNoLinkToAFolder, withoutGitIgnored } from "./gitIgnored";

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

describe("foldersGitIgnoresWhole", () => {
  const searchPath = process.env.PATH;
  afterEach(() => {
    process.env.PATH = searchPath;
  });

  it("names each folder git ignores whole once, descends into one that holds a tracked file, and leaves out a path beginning with a colon", () => {
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
    expect([...foldersGitIgnoresWhole(root)].sort()).toEqual(["build", "empty", "logs", "mixed/sub"]);
    // From a folder inside the workspace, the folders are named from there.
    expect([...foldersGitIgnoresWhole(path.join(root, "mixed"))]).toEqual(["sub"]);
    // From an ignored folder, git names the folder itself (`./`), which is left out.
    expect(foldersGitIgnoresWhole(path.join(root, "build")).size).toBe(0);
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

describe("walksNoLinkToAFolder", () => {
  it("is true only for `**` and one name, with at most one star", () => {
    for (const pattern of ["**/*", "**/*.md", "**/README", "**/*.{html,htm,css}", "**/{a,b}.md"]) expect(walksNoLinkToAFolder(pattern), pattern).toBe(true);
    for (const pattern of ["*.md", "src/**/*.md", "*/**/*.md", "**/src/*.md", "**/{a,b/c}.md", "**/{*,}*", "**/*{,x}*", "**/a\\b", "./**/*.md", "**"]) {
      expect(walksNoLinkToAFolder(pattern), pattern).toBe(false);
    }
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
});
