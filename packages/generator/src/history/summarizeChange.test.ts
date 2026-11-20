import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { openGitRepository } from "@live-documentation/engine/live-docs/history/git";

import { standingFiles } from "./summarizeChange";

/**
 * Whether a linked document stood at a commit is asked of the commit's own listing, never the disk (the second pass of
 * the independent review of 2026-11-19, finding 7): on a disk that tells case apart the two agree, since every name is
 * written, so the case gives the tree an index naming a file the disk lacks, as a disk that folds case or Unicode form
 * can, and holds the answer to the index.
 */
describe("the files that stand in a commit's tree", () => {
  const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
  let scratch: string;
  let repository: string;

  beforeAll(async () => {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-standing-"));
    repository = path.join(scratch, "repository");
    await fs.mkdir(path.join(repository, "docs"), { recursive: true });
    await fs.writeFile(path.join(repository, "docs", "design.md"), "# Design\n");
    await fs.writeFile(path.join(repository, "a.ts"), "export const a = 1;\n");
    for (const args of [["init", "--quiet", "-b", "main"], ["add", "--all"], ["commit", "--quiet", "-m", "a commit"]]) {
      execFileSync("git", args, { cwd: repository, env: isolated });
    }
  });

  afterAll(async () => {
    await fs.rm(scratch, { recursive: true, force: true });
  });

  it("are those the commit's listing holds, whatever the disk the tree was written to answers, but those its tree did not hold", async () => {
    const repo = await openGitRepository(repository);
    const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, env: isolated, encoding: "utf8" }).trim();
    const tree = await repo.workingTree(commit, path.join(scratch, "tree"));
    const saved = { ...process.env };
    try {
      // The disk lacks the document under the name the listing holds, as a disk that folds names may hold it under another.
      await fs.rename(path.join(tree.root, "docs", "design.md"), path.join(tree.root, "docs", "Design.md"));
      Object.assign(process.env, tree.environment);
      expect([...(await standingFiles(tree.root, []))].sort()).toEqual(["a.ts", "docs/design.md"]);
      expect([...(await standingFiles(tree.root, [{ path: "a.ts" }]))]).toEqual(["docs/design.md"]);
    } finally {
      for (const name of Object.keys(tree.environment)) {
        if (saved[name] === undefined) delete process.env[name];
        else process.env[name] = saved[name];
      }
      await tree.remove();
    }
  });
});
