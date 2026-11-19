import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import * as gitUtils from "../gitUtils";
import { openGitRepository, parseMainline, parseNameStatus, parseTags } from "./git";

describe("parseMainline", () => {
  it("reads each record after rev-list's commit line, a subject with spaces and an author with a comma included", () => {
    const output = [
      "commit 1111",
      "\u001e1111\u001f\u001f2026-01-05T10:00:00+00:00\u001fFarr, Jordan\u001fBegin with a core",
      "commit 2222",
      "\u001e2222\u001f1111\u001f2026-01-06T10:00:00+02:00\u001fAda\u001fMerge: two parents",
      "commit 3333",
      "\u001e3333\u001f2222 9999\u001f2026-01-07T10:00:00Z\u001fAda\u001f",
      ""
    ].join("\n");
    expect(parseMainline(output)).toEqual([
      { id: "1111", parents: [], date: "2026-01-05T10:00:00+00:00", author: "Farr, Jordan", subject: "Begin with a core" },
      { id: "2222", parents: ["1111"], date: "2026-01-06T10:00:00+02:00", author: "Ada", subject: "Merge: two parents" },
      { id: "3333", parents: ["2222", "9999"], date: "2026-01-07T10:00:00Z", author: "Ada", subject: "" }
    ]);
    expect(parseMainline("")).toEqual([]);
  });
});

describe("parseNameStatus", () => {
  it("reads renames and in-place changes from the NUL-separated listing, a path with a tab or a newline included", () => {
    const output = ["M", "src/a.ts", "R087", "src/old\tname.ts", "src/new.ts", "A", "src/born.ts", "D", "src/dead.ts", "T", "bin/tool", "C075", "x.ts", "y.ts", "M", "doc\nwith newline.md", ""].join("\0");
    expect(parseNameStatus(output)).toEqual({
      renamed: [["src/old\tname.ts", "src/new.ts"]],
      modified: ["src/a.ts", "bin/tool", "doc\nwith newline.md"]
    });
    expect(parseNameStatus("")).toEqual({ renamed: [], modified: [] });
  });
});

describe("parseTags", () => {
  it("names an annotated tag's peeled commit and a light tag's own", () => {
    expect([...parseTags("aaaa bbbb\ncccc \n\n")]).toEqual(["bbbb", "cccc"]);
  });
});

describe("a commit's tree for the history", () => {
  it("is made at once with another, each through an index of its own, registering nothing, and removed with its index", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "history-tree-"));
    const pending: Array<{ args: readonly string[]; env?: Record<string, string>; resolve: (stdout?: string) => void; reject: (error: Error) => void }> = [];
    const exec = vi.spyOn(gitUtils, "execFileAsync").mockImplementation(async (_command, args, options) => {
      if (args.includes("--show-toplevel")) return { stdout: root, stderr: "" };
      return new Promise((resolve, reject) => pending.push({ args, env: options.env, resolve: (stdout = "") => resolve({ stdout, stderr: "" }), reject }));
    });
    try {
      const repo = await openGitRepository(root);
      const first = repo.workingTree("a", path.join(root, "a"));
      const second = repo.workingTree("b", path.join(root, "b"));
      // Both trees read their commits at once: nothing waits on the other's registry change.
      await vi.waitFor(() => expect(pending.map((call) => call.args.at(-1))).toEqual(["a", "b"]));
      expect(pending.every((call) => call.args.includes("read-tree"))).toBe(true);
      expect(pending.map((call) => call.env?.GIT_INDEX_FILE)).toEqual([path.join(root, "a.index"), path.join(root, "b.index")]);
      pending[0].resolve();
      pending[1].resolve();
      await vi.waitFor(() => expect(pending).toHaveLength(4));
      expect(pending[2].args).toEqual(expect.arrayContaining(["checkout-index", "--all", `--prefix=${path.join(root, "a")}${path.sep}`]));
      expect(pending.some((call) => call.args.includes("worktree"))).toBe(false);
      pending[2].resolve();
      pending[3].resolve();
      await vi.waitFor(() => expect(pending).toHaveLength(5));
      expect(pending[4].args).toContain("--git-common-dir");
      pending[4].resolve(`${root}/.git\n`);
      const [a, b] = await Promise.all([first, second]);
      // A process in the tree asks git through the repository, the tree and the tree's own index.
      expect(a.environment).toEqual({ GIT_DIR: `${root}/.git`, GIT_WORK_TREE: path.join(root, "a"), GIT_INDEX_FILE: path.join(root, "a.index") });
      await fs.writeFile(path.join(root, "a.index"), "index");
      const removal = a.remove();
      expect(a.remove(), "signal cleanup joins the worker's removal").toBe(removal);
      await removal;
      await b.remove();
      expect((await fs.readdir(root)).sort()).toEqual([]);
    } finally {
      exec.mockRestore();
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("removes what it made when the commit cannot be read", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "history-tree-"));
    const exec = vi.spyOn(gitUtils, "execFileAsync").mockImplementation(async (_command, args) => {
      if (args.includes("--show-toplevel")) return { stdout: root, stderr: "" };
      throw new Error("fatal: not a tree object");
    });
    try {
      const repo = await openGitRepository(root);
      await expect(repo.workingTree("nothing", path.join(root, "tree"))).rejects.toThrow("not a tree object");
      expect(await fs.readdir(root)).toEqual([]);
    } finally {
      exec.mockRestore();
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

