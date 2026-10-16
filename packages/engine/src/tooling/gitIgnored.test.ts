import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { withoutGitIgnored } from "./gitIgnored";

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
