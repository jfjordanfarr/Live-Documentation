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


describe("the history worktree lifecycle", () => {
  it("excludes overlapping registry changes, keeps analysis trees alive together, and drains after a failed command", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "history-lifecycle-"));
    const pending: Array<{ args: readonly string[]; resolve: () => void; reject: (error: Error) => void }> = [];
    const exec = vi.spyOn(gitUtils, "execFileAsync").mockImplementation(async (_command, args) => {
      if (args.includes("--show-toplevel")) return { stdout: root, stderr: "" };
      return new Promise((resolve, reject) => pending.push({ args, resolve: () => resolve({ stdout: "", stderr: "" }), reject }));
    });
    try {
      const repo = await openGitRepository(root);
      const first = repo.workingTree("a", path.join(root, "a"));
      const second = repo.workingTree("b", path.join(root, "b"));
      await vi.waitFor(() => expect(pending).toHaveLength(1));
      pending[0].resolve();
      const a = await first;
      await vi.waitFor(() => expect(pending).toHaveLength(2));
      pending[1].resolve();
      const b = await second;
      // Both trees are available to independent summary workers before either is removed.
      expect([a.root, b.root]).toEqual([path.join(root, "a"), path.join(root, "b")]);
      const removal = a.remove();
      expect(a.remove(), "signal cleanup joins the worker's removal").toBe(removal);
      const next = repo.workingTree("c", path.join(root, "c"));
      const otherRemoval = b.remove();
      await vi.waitFor(() => expect(pending).toHaveLength(3));
      expect(pending[2].args).toContain("remove");
      const failure = expect(removal).rejects.toThrow("registry failure");
      pending[2].reject(new Error("registry failure"));
      await failure;
      await vi.waitFor(() => expect(pending).toHaveLength(4));
      expect(pending[3].args).toContain("add");
      pending[3].resolve();
      await next;
      await vi.waitFor(() => expect(pending).toHaveLength(5));
      expect(pending[4].args).toContain("remove");
      pending[4].resolve();
      await otherRemoval;
    } finally {
      exec.mockRestore();
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
