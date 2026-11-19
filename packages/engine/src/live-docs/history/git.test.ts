import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { caseInsensitiveDisk, openGitRepository, parseMainline, parseNameStatus, parseTags, writeStoredTree } from "./git";

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

/**
 * A repository of two commits whose attributes differ: the first declares none, the second asks every file to be
 * checked out with CRLF endings, and the person's checkout stands at the second, with those endings on disk.
 */
describe("a commit's tree for the history", () => {
  // The repository's own git is kept from the person's configuration; the person's configuration is set per test.
  const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
  const git = (cwd: string, args: string[]): string => execFileSync("git", args, { cwd, env: isolated, encoding: "utf8" });
  let scratch: string;
  let repository: string;
  let first: string;
  let second: string;

  beforeAll(async () => {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-tree-"));
    repository = path.join(scratch, "repository");
    await fs.mkdir(path.join(repository, "src"), { recursive: true });
    git(repository, ["init", "--quiet", "-b", "main"]);
    await fs.writeFile(path.join(repository, "src", "a.ts"), "export const a = 1;\nexport const b = 2;\n");
    await fs.writeFile(path.join(repository, "run.sh"), "#!/bin/sh\necho run\n", { mode: 0o755 });
    await fs.symlink("src/a.ts", path.join(repository, "link.ts"));
    git(repository, ["add", "--all"]);
    git(repository, ["commit", "--quiet", "-m", "Begin without attributes"]);
    first = git(repository, ["rev-parse", "HEAD"]).trim();
    await fs.writeFile(path.join(repository, ".gitattributes"), "* text eol=crlf\n");
    await fs.writeFile(path.join(repository, "src", "a.ts"), "export const a = 1;\nexport const b = 3;\n");
    git(repository, ["add", "--all"]);
    git(repository, ["commit", "--quiet", "-m", "Ask for CRLF endings"]);
    second = git(repository, ["rev-parse", "HEAD"]).trim();
    // The person's checkout as git leaves it after the second commit is checked out afresh: CRLF on disk.
    await fs.rm(path.join(repository, "src", "a.ts"));
    git(repository, ["checkout", "--", "src/a.ts"]);
  });

  afterAll(async () => {
    await fs.rm(scratch, { recursive: true, force: true });
  });

  /** Every file of a folder, by its path relative to it, with its bytes or a link's target. */
  async function contents(folder: string): Promise<Map<string, string>> {
    const found = new Map<string, string>();
    for (const entry of await fs.readdir(folder, { recursive: true, withFileTypes: true })) {
      const file = path.join(entry.parentPath, entry.name);
      const relative = path.relative(folder, file).split(path.sep).join("/");
      if (relative.split("/")[0] === ".git") continue;
      if (entry.isSymbolicLink()) found.set(relative, `-> ${await fs.readlink(file)}`);
      else if (entry.isFile()) found.set(relative, await fs.readFile(file, "latin1"));
    }
    return found;
  }

  it("holds the person's checkout to the attributes of its head: CRLF on disk", async () => {
    // The ground the next test stands on: were the person's attributes applied, the first commit would come out with CRLF.
    expect(await fs.readFile(path.join(repository, "src", "a.ts"), "latin1")).toContain("\r\n");
  });

  it("writes each commit's files as the repository stores them, a commit without attributes as a checkout of it does", async () => {
    const repo = await openGitRepository(repository);
    for (const commit of [first, second]) {
      const tree = await repo.workingTree(commit, path.join(scratch, `tree-${commit.slice(0, 8)}`));
      try {
        const written = await contents(tree.root);
        // Every file is its blob's bytes, as git stores it, and a link is a link to the target its blob holds.
        const listed = git(repository, ["ls-tree", "-r", "--name-only", commit]).split("\n").filter(Boolean);
        expect([...written.keys()].sort()).toEqual(listed.sort());
        for (const file of listed) {
          const stored = execFileSync("git", ["cat-file", "blob", `${commit}:${file}`], { cwd: repository, env: isolated }).toString("latin1");
          expect(written.get(file), `${file} at ${commit.slice(0, 8)}`).toBe(file === "link.ts" ? `-> ${stored}` : stored);
        }
        expect((await fs.stat(path.join(tree.root, "run.sh"))).mode & 0o100).toBe(0o100);
        if (commit === first) {
          // The commit's own checkout, which applies no attribute since the commit declares none, gives the same files.
          const checkout = path.join(scratch, "checkout");
          git(repository, ["worktree", "add", "--detach", "--quiet", checkout, commit]);
          try {
            const expected = await contents(checkout);
            expected.delete(".git");
            expect(written).toEqual(expected);
          } finally {
            git(repository, ["worktree", "remove", "--force", checkout]);
          }
        } else {
          // Where a commit's own attributes would convert its files on checkout, the history reads them as stored.
          expect(written.get("src/a.ts")).not.toContain("\r\n");
        }
      } finally {
        await tree.remove();
      }
    }
  });

  it("is made at once with another, each with an index of its own, registers nothing, and is removed with its index", async () => {
    const repo = await openGitRepository(repository);
    const [a, b] = await Promise.all([repo.workingTree(first, path.join(scratch, "a")), repo.workingTree(second, path.join(scratch, "b"))]);
    expect(git(repository, ["worktree", "list", "--porcelain"]).split("\n").filter((line) => line.startsWith("worktree "))).toHaveLength(1);
    // A process in the tree asks git through the repository, the tree and the tree's own index, apart from the person's configuration.
    expect({ ...a.environment, GIT_DIR: await fs.realpath(a.environment.GIT_DIR) }).toEqual({
      GIT_DIR: await fs.realpath(path.join(repository, ".git")),
      GIT_WORK_TREE: path.join(scratch, "a"),
      GIT_INDEX_FILE: path.join(scratch, "a.index"),
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_NO_REPLACE_OBJECTS: "1"
    });
    expect(a.unwritten).toEqual([]);
    expect(execFileSync("git", ["ls-files"], { cwd: a.root, env: { ...isolated, ...a.environment }, encoding: "utf8" }).split("\n").filter(Boolean).sort()).toEqual(["link.ts", "run.sh", "src/a.ts"]);
    const removal = a.remove();
    expect(a.remove(), "signal cleanup joins the worker's removal").toBe(removal);
    await removal;
    await b.remove();
    expect((await fs.readdir(scratch)).sort()).toEqual(["repository"]);
  });

  it("removes what it made when the commit cannot be read", async () => {
    const repo = await openGitRepository(repository);
    await expect(repo.workingTree("0".repeat(40), path.join(scratch, "tree"))).rejects.toThrow();
    expect((await fs.readdir(scratch)).sort()).toEqual(["repository"]);
  });
});

/**
 * Trees no ordinary commit holds, made with `git hash-object` and `git mktree` as a hostile or damaged repository could
 * carry them: a clone does not check its objects by default (`transfer.fsckObjects` is off).
 */
describe("a tree the writer must not follow out of its folder", () => {
  const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
  let scratch: string;
  let repository: string;
  let outside: string;

  const git = (args: string[], input?: string | Buffer): string => execFileSync("git", args, { cwd: repository, env: isolated, input, encoding: "utf8", maxBuffer: 1 << 28 }).trim();
  const blob = (content: string | Buffer): string => git(["hash-object", "-w", "--stdin"], content);
  /** A tree of the given entries, `[mode, type, id, name]`, written as they are given. */
  const tree = (entries: Array<[string, string, string, string]>): string => git(["mktree"], entries.map(([mode, type, id, name]) => `${mode} ${type} ${id}\t${name}\n`).join(""));
  const commit = (root: string): string => git(["commit-tree", root, "-m", "a tree"]);

  beforeAll(async () => {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-hostile-"));
    repository = path.join(scratch, "repository");
    outside = path.join(scratch, "outside");
    await fs.mkdir(repository);
    await fs.mkdir(outside);
    git(["init", "--quiet", "-b", "main"]);
  });

  afterAll(async () => {
    await fs.rm(scratch, { recursive: true, force: true });
  });

  /** A fresh folder for a tree, as the history command gives each change one. */
  async function folder(): Promise<string> {
    const made = await fs.mkdtemp(path.join(scratch, "tree-"));
    const directory = path.join(made, "tree");
    await fs.mkdir(directory);
    return directory;
  }

  it("never writes through a link the tree itself made, and says which entry it left out", async () => {
    // A link `a` to a folder outside, and a tree `a/` holding a file: written in turn, the file would land outside.
    const sub = tree([["100644", "blob", blob("evil\n"), "evil.txt"]]);
    const change = commit(tree([["120000", "blob", blob(outside), "a"], ["040000", "tree", sub, "a"], ["100644", "blob", blob("kept\n"), "b.txt"]]));
    const directory = await folder();
    const unwritten = await writeStoredTree(repository, change, directory, { caseInsensitive: false, platform: "linux" });
    expect(await fs.readdir(outside)).toEqual([]);
    expect(unwritten).toEqual([{ path: "a/evil.txt", reason: "it lies beneath the symbolic link a, which nothing is written through" }]);
    expect(await fs.readlink(path.join(directory, "a"))).toBe(outside);
    expect(await fs.readFile(path.join(directory, "b.txt"), "utf8")).toBe("kept\n");
  });

  it("on a disk that takes two cases for one name, writes nothing through a link of the other case, nor two files of one name", async () => {
    // An ordinary commit, which git's own checks accept: a link `A` and a file `a/x`, and two files `Foo` and `foo`.
    const sub = tree([["100644", "blob", blob("x\n"), "x"]]);
    const change = commit(tree([["120000", "blob", blob(outside), "A"], ["100644", "blob", blob("upper\n"), "Foo"], ["040000", "tree", sub, "a"], ["100644", "blob", blob("lower\n"), "foo"]]));
    const insensitive = await folder();
    expect(await writeStoredTree(repository, change, insensitive, { caseInsensitive: true, platform: "linux" })).toEqual([
      { path: "a/x", reason: "it lies beneath the symbolic link A, which nothing is written through" },
      { path: "foo", reason: "it names the same file as Foo on this disk, which does not tell their cases apart" }
    ]);
    expect(await fs.readdir(outside)).toEqual([]);
    // On a disk that tells them apart, every entry is written, each where it belongs.
    const sensitive = await folder();
    expect(await writeStoredTree(repository, change, sensitive, { caseInsensitive: false, platform: "linux" })).toEqual([]);
    expect(await fs.readFile(path.join(sensitive, "a", "x"), "utf8")).toBe("x\n");
    expect(await fs.readdir(outside)).toEqual([]);
    // This machine's temporary folder is read for what it is.
    expect(await caseInsensitiveDisk(scratch)).toBe(process.platform === "darwin" || process.platform === "win32" ? expect.any(Boolean) : false);
  });

  it("leaves out on Windows a name that would climb out of the folder or that Windows cannot hold, and writes it elsewhere as the name it is", async () => {
    const change = commit(tree([["100644", "blob", blob("climb\n"), "..\\..\\x"], ["100644", "blob", blob("drive\n"), "c:d"], ["100644", "blob", blob("plain\n"), "plain.txt"]]));
    const windows = await folder();
    expect((await writeStoredTree(repository, change, windows, { caseInsensitive: true, platform: "win32" })).map((entry) => entry.path)).toEqual(["..\\..\\x", "c:d"]);
    expect(await fs.readdir(windows)).toEqual(["plain.txt"]);
    const linux = await folder();
    expect(await writeStoredTree(repository, change, linux, { caseInsensitive: false, platform: "linux" })).toEqual([]);
    expect((await fs.readdir(linux)).sort()).toEqual(["..\\..\\x", "c:d", "plain.txt"]);
  });

  it("reads each blob as stored, a replacement the repository holds for it set aside", async () => {
    const original = blob("as committed\n");
    const change = commit(tree([["100644", "blob", original, "kept.txt"]]));
    git(["replace", original, blob("as replaced locally\n")]);
    const directory = await folder();
    await writeStoredTree(repository, change, directory, { caseInsensitive: false, platform: "linux" });
    expect(await fs.readFile(path.join(directory, "kept.txt"), "utf8")).toBe("as committed\n");
  });

  it("streams blobs of every size to disk byte for byte, across the reader's chunks", async () => {
    const large = Buffer.alloc(5 * 1024 * 1024 + 7, 0);
    for (let index = 0; index < large.length; index += 1) large[index] = (index * 31 + 7) % 251;
    const contents: Record<string, Buffer> = {
      "large.bin": large,
      "empty.txt": Buffer.alloc(0),
      "header.txt": Buffer.from(`${"0".repeat(40)} blob 12\nnot a header\n`),
      "unterminated.txt": Buffer.from("no line break at the end"),
      "newlines.txt": Buffer.from("\n\n\n")
    };
    const change = commit(tree(Object.entries(contents).map(([name, content]) => ["100644", "blob", blob(content), name])));
    const directory = await folder();
    await writeStoredTree(repository, change, directory, { caseInsensitive: false, platform: "linux" });
    for (const [name, content] of Object.entries(contents)) {
      expect((await fs.readFile(path.join(directory, name))).equals(content), name).toBe(true);
    }
  });

  it("rejects once, with the write's own failure, when a write fails while blobs are still being asked for", async () => {
    // Thousands of blobs, so that the request is still being written to git when the first write fails.
    const files = path.join(scratch, "many");
    await fs.mkdir(files);
    const names = Array.from({ length: 6000 }, (_, index) => `f${String(index).padStart(5, "0")}.txt`);
    await Promise.all(names.map((name, index) => fs.writeFile(path.join(files, name), `file ${index}\n`)));
    const ids = git(["hash-object", "-w", "--stdin-paths"], names.map((name) => path.join(files, name)).join("\n")).split("\n");
    const change = commit(tree(names.map((name, index) => ["100644", "blob", ids[index], name])));
    const directory = await folder();
    await fs.chmod(directory, 0o555);
    try {
      await expect(writeStoredTree(repository, change, directory, { caseInsensitive: false, platform: "linux" })).rejects.toThrow(/EACCES|permission denied/u);
    } finally {
      await fs.chmod(directory, 0o755);
    }
  }, 60_000);
});
