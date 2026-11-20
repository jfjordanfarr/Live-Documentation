import { execFileSync, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bringTreeForward, followLink, openGitRepository, parseMainline, parseNameStatus, parseTags, placeEntry, realDisk, writeStoredTree, writeTreeAnew, type DiskEntry, type TreeDisk } from "./git";

const OUT = "it is a symbolic link out of the tree, which the history does not follow";
const NOWHERE = "it is a symbolic link to nothing the commit holds";
const FOLDER = "it is a symbolic link to a folder, which the history does not follow: what is read through it reads as gone, an import through it is not resolved, and the check at the head of such a history fails";
const DOCS_ROOT = "it is a symbolic link at or above the docs root, where the generator needs a folder, which the history does not follow";

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
        // Every file is its blob's bytes, as git stores it; a link to a file of the tree is a copy of that file's bytes.
        const listed = git(repository, ["ls-tree", "-r", "--name-only", commit]).split("\n").filter(Boolean);
        expect([...written.keys()].sort()).toEqual(listed.sort());
        expect(tree.unwritten).toEqual([]);
        for (const file of listed) {
          const stored = execFileSync("git", ["cat-file", "blob", `${commit}:${file === "link.ts" ? "src/a.ts" : file}`], { cwd: repository, env: isolated }).toString("latin1");
          expect(written.get(file), `${file} at ${commit.slice(0, 8)}`).toBe(stored);
        }
        expect((await fs.lstat(path.join(tree.root, "link.ts"))).isSymbolicLink()).toBe(false);
        expect((await fs.stat(path.join(tree.root, "run.sh"))).mode & 0o100).toBe(0o100);
        if (commit === first) {
          // The commit's own checkout, which applies no attribute since the commit declares none, gives the same files.
          const checkout = path.join(scratch, "checkout");
          git(repository, ["worktree", "add", "--detach", "--quiet", checkout, commit]);
          try {
            const expected = await contents(checkout);
            expected.delete(".git");
            // A checkout writes the link itself; the history, a copy of the file it leads to.
            expected.set("link.ts", expected.get("src/a.ts")!);
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
      GIT_NO_REPLACE_OBJECTS: "1",
      // Nothing fetched for a partial clone's missing object, and no prompt for credentials (since 2026-11-20); the
      // tree's writer sets the same, the tree's environment being made from the writer's.
      GIT_NO_LAZY_FETCH: "1",
      GIT_TERMINAL_PROMPT: "0",
      // The repository's own settings that could change the tree's answers, set aside as `-c` sets them (since 2026-11-20).
      GIT_CONFIG_COUNT: "2",
      GIT_CONFIG_KEY_0: "core.fsmonitor",
      GIT_CONFIG_VALUE_0: "false",
      GIT_CONFIG_KEY_1: "core.excludesFile",
      GIT_CONFIG_VALUE_1: os.devNull
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

  it("writes no link itself, so that nothing is written through one, and names a link out of the tree", async () => {
    // A link `a` to a folder outside, and a tree `a/` holding a file: were the link written, the file would land outside.
    const sub = tree([["100644", "blob", blob("evil\n"), "evil.txt"]]);
    const change = commit(tree([["120000", "blob", blob(outside), "a"], ["040000", "tree", sub, "a"], ["100644", "blob", blob("kept\n"), "b.txt"]]));
    const directory = await folder();
    const unwritten = await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux" });
    expect(await fs.readdir(outside)).toEqual([]);
    expect(unwritten).toEqual([{ path: "a", reason: OUT }]);
    expect(await fs.readFile(path.join(directory, "a", "evil.txt"), "utf8")).toBe("evil\n");
    expect(await fs.readFile(path.join(directory, "b.txt"), "utf8")).toBe("kept\n");
  });

  it("writes a link to a file of the tree as a copy of that file, through chains and links in the middle of a path, and names every other link", async () => {
    // The independent review of 2026-11-19: `CLAUDE.md -> AGENTS.md`, `lib/b.ts -> ../src/b.ts`, `docs/alias.md -> guide.md`.
    const agents = blob("# Agents\n");
    const b = blob("export const b = 1;\n");
    const guide = blob("# Guide\n");
    const src = tree([["100644", "blob", b, "b.ts"]]);
    const lib = tree([["120000", "blob", blob("../src/b.ts"), "b.ts"], ["120000", "blob", blob("../shared/c.ts"), "c.ts"]]);
    const docs = tree([["120000", "blob", blob("guide.md"), "alias.md"], ["120000", "blob", blob("alias.md"), "chain.md"], ["100644", "blob", guide, "guide.md"], ["120000", "blob", blob("loop-b.md"), "loop-a.md"], ["120000", "blob", blob("loop-a.md"), "loop-b.md"]]);
    const entries: Array<[string, string, string, string]> = [
      ["100644", "blob", agents, "AGENTS.md"],
      ["120000", "blob", blob("AGENTS.md"), "CLAUDE.md"],
      ["040000", "tree", docs, "docs"],
      ["120000", "blob", blob("src"), "shared"],
      ["040000", "tree", lib, "lib"],
      ["120000", "blob", blob("src"), "folder-link"],
      ["120000", "blob", blob("missing.md"), "nowhere.md"],
      ["120000", "blob", blob("../../x"), "climb"],
      ["120000", "blob", blob(""), "empty"],
      ["120000", "blob", blob("a\0b"), "nul"],
      ["040000", "tree", src, "src"]
    ];
    const change = commit(tree(entries.sort((x, y) => (x[3] < y[3] ? -1 : 1))));
    const directory = await folder();
    const unwritten = await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux" });
    const read = (file: string): Promise<string> => fs.readFile(path.join(directory, file), "utf8");
    expect(await read("CLAUDE.md")).toBe("# Agents\n");
    expect(await read("lib/b.ts")).toBe("export const b = 1;\n");
    // Through `shared -> src`, a link in the middle of the path.
    await expect(read("lib/c.ts")).rejects.toThrow();
    expect(await read("docs/alias.md")).toBe("# Guide\n");
    expect(await read("docs/chain.md")).toBe("# Guide\n");
    expect(unwritten).toEqual([
      { path: "climb", reason: OUT },
      { path: "docs/loop-a.md", reason: "it is a symbolic link in a chain that does not end within 8 links, a cycle or longer" },
      { path: "docs/loop-b.md", reason: "it is a symbolic link in a chain that does not end within 8 links, a cycle or longer" },
      { path: "empty", reason: NOWHERE },
      { path: "folder-link", reason: FOLDER },
      { path: "lib/c.ts", reason: NOWHERE },
      { path: "nowhere.md", reason: NOWHERE },
      { path: "nul", reason: NOWHERE },
      { path: "shared", reason: FOLDER }
    ]);
    for (const file of ["CLAUDE.md", "lib/b.ts", "docs/alias.md", "docs/chain.md"]) {
      expect((await fs.lstat(path.join(directory, file))).isSymbolicLink(), file).toBe(false);
    }
  });

  it("resolves a link's target one part at a time, as the disk does: a link in the target is followed before the `..` after it", () => {
    // The review's second pass: `a/b -> ../x/y`, `l -> a/b/../z.txt`; the disk reads `l` as `x/z.txt`, not `a/z.txt`.
    const listing = new Map([
      ["a/b", { mode: "120000", id: "ab" }],
      ["a/z.txt", { mode: "100644", id: "az" }],
      ["x/y/k.txt", { mode: "100644", id: "k" }],
      ["x/z.txt", { mode: "100644", id: "xz" }],
      ["l", { mode: "120000", id: "l" }]
    ]);
    const targets = new Map([["a/b", "../x/y"], ["l", "a/b/../z.txt"]]);
    expect(followLink("l", listing, targets)).toEqual({ file: { mode: "100644", id: "xz" } });
    // A `..` above the tree's root, reached through a link, is out of the tree.
    expect(followLink("m", new Map([...listing, ["m", { mode: "120000", id: "m" }]]), new Map([...targets, ["m", "a/b/../../../../z.txt"]]))).toEqual({ reason: OUT });
  });

  it("follows a link in the middle of a path to the file it reaches", () => {
    const listing = new Map([
      ["shared", { mode: "120000", id: "l1" }],
      ["src/c.ts", { mode: "100644", id: "c" }],
      ["lib/c.ts", { mode: "120000", id: "l2" }]
    ]);
    const targets = new Map([["shared", "src"], ["lib/c.ts", "../shared/c.ts"]]);
    expect(followLink("lib/c.ts", listing, targets)).toEqual({ file: { mode: "100644", id: "c" } });
    expect(followLink("shared", listing, targets)).toEqual({ reason: FOLDER });
  });

  it("writes no link at or above the docs root, even to a file of the tree, copies one beneath it, and fails no commit for one", async () => {
    // The fourth review of 2026-11-19: a link at the docs root carried the generator's writes and its pruning outside.
    // Beneath the root a copy is a plain file the generator can only rewrite or remove (the review's second pass).
    const kept = blob("kept\n");
    const mirror = tree([["120000", "blob", blob("../../kept.txt"), "a.ts.md"]]);
    const entries: Array<[string, string, string, string]> = [["120000", "blob", blob("kept.txt"), ".mdmd"], ["100644", "blob", kept, "kept.txt"]];
    const at = commit(tree(entries));
    const beneath = commit(tree([["040000", "tree", tree([["040000", "tree", mirror, "layer-4"]]), "docs"], ["100644", "blob", kept, "kept.txt"]]));
    const directory = await folder();
    expect(await writeStoredTree(path.join(repository, ".git"), at, directory, { platform: "linux", docsRoot: ".mdmd/layer-4" })).toEqual([{ path: ".mdmd", reason: DOCS_ROOT }]);
    const other = await folder();
    expect(await writeStoredTree(path.join(repository, ".git"), beneath, other, { platform: "linux", docsRoot: "docs/layer-4" })).toEqual([]);
    expect(await fs.readFile(path.join(other, "docs", "layer-4", "a.ts.md"), "utf8")).toBe("kept\n");
    // Above the root: a copy at `docs` would stand where the generator needs a folder.
    const above = commit(tree([["120000", "blob", blob("kept.txt"), "docs"], ["100644", "blob", kept, "kept.txt"]]));
    expect(await writeStoredTree(path.join(repository, ".git"), above, await folder(), { platform: "linux", docsRoot: "docs/layer-4" })).toEqual([{ path: "docs", reason: DOCS_ROOT }]);
    // Without a docs root asked for, the same link is a copy of the file it leads to.
    const third = await folder();
    expect(await writeStoredTree(path.join(repository, ".git"), at, third, { platform: "linux" })).toEqual([]);
    expect(await fs.readFile(path.join(third, ".mdmd"), "utf8")).toBe("kept\n");
  });

  it("writes empty the files its caller asks for so, every name standing, and still names an entry it refuses there", async () => {
    const archive = tree([["100644", "blob", blob("big\n"), "picture.png"], ["100755", "blob", blob("#!/bin/sh\n"), "run.sh"], ["120000", "blob", blob(outside), "zlink"]]);
    const change = commit(tree([["040000", "tree", archive, "archive"], ["100644", "blob", blob("kept\n"), "kept.txt"]]));
    const directory = await folder();
    const unwritten = await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux", contentless: (file) => file.startsWith("archive/") });
    expect(unwritten).toEqual([{ path: "archive/zlink", reason: OUT }]);
    expect((await fs.readdir(directory)).sort()).toEqual(["archive", "kept.txt"]);
    expect(await fs.readFile(path.join(directory, "archive", "picture.png"), "utf8")).toBe("");
    expect(await fs.readFile(path.join(directory, "archive", "run.sh"), "utf8")).toBe("");
    expect((await fs.stat(path.join(directory, "archive", "run.sh"))).mode & 0o100).toBe(0o100);
    expect(await fs.readFile(path.join(directory, "kept.txt"), "utf8")).toBe("kept\n");
  });

  it("asks the disk once for each folder it made or found, however many entries lie beneath it", async () => {
    const files = Array.from({ length: 5 }, (_, index): [string, string, string, string] => ["100644", "blob", blob(`${index}\n`), `f${index}.txt`]);
    const change = commit(tree([["040000", "tree", tree([["040000", "tree", tree(files), "deep"]]), "docs"]]));
    const directory = await folder();
    const real = realDisk(directory);
    const asked: string[] = [];
    const disk: TreeDisk = {
      entry: (relative) => {
        asked.push(relative);
        return real.entry(relative);
      },
      makeFolder: (relative) => real.makeFolder(relative),
      remove: (relative, what) => real.remove(relative, what)
    };
    expect(await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux", disk })).toEqual([]);
    expect(asked.filter((relative) => relative === "docs" || relative === "docs/deep")).toEqual(["docs", "docs/deep"]);
    expect(await fs.readdir(path.join(directory, "docs", "deep"))).toHaveLength(5);
  });

  /**
   * A disk that takes two names for one as APFS or NTFS may, standing in over this machine's: names folded as APFS folds
   * them (Unicode normalization and case, `s` with `ſ`, `μ` with `µ`, `σ` with `ς`), and NTFS's short names. It answers
   * what the real disk holds under the folded name, so the writer is asked what such a disk would answer.
   */
  function foldingDisk(directory: string): TreeDisk {
    const shortNames: Record<string, string> = { "longna~1": "longname" };
    const fold = (name: string): string => {
      const folded = name.normalize("NFD").toUpperCase().toLowerCase();
      return shortNames[folded] ?? folded;
    };
    // The real path a name of the stand-in disk resolves to, part by part, or undefined where nothing answers to it.
    const resolve = async (relative: string): Promise<string | undefined> => {
      let real = directory;
      for (const part of relative.split("/")) {
        const names = await fs.readdir(real).catch(() => undefined);
        const match = names?.find((name) => fold(name) === fold(part));
        if (match === undefined) return undefined;
        real = path.join(real, match);
      }
      return real;
    };
    return {
      async entry(relative) {
        const real = await resolve(relative);
        if (real === undefined) return "absent";
        const stat = await fs.lstat(real);
        return stat.isSymbolicLink() ? "link" : stat.isDirectory() ? "folder" : "other";
      },
      async makeFolder(relative) {
        if ((await resolve(relative)) !== undefined) throw Object.assign(new Error(`EEXIST: ${relative}`), { code: "EEXIST" });
        await fs.mkdir(path.join(directory, ...relative.split("/")));
      },
      async remove(relative, what) {
        const real = await resolve(relative);
        if (real === undefined) {
          if (what === "whole") return;
          throw Object.assign(new Error(`ENOENT: ${relative}`), { code: "ENOENT" });
        }
        if (what === "file") await fs.unlink(real);
        else if (what === "folder") await fs.rmdir(real);
        else await fs.rm(real, { recursive: true, force: true });
      }
    };
  }

  it("asks the disk whether two names are one, so that a link is never followed under a name the disk takes for its own", async () => {
    // Ordinary commits git accepts: a link, then a file beneath another spelling the disk takes for the link's name.
    const pairs: Array<[string, string]> = [
      ["A", "a"],
      ["s", "ſ"],
      ["é", "é"],
      ["µ", "Μ"],
      ["σ", "ς"],
      ["LONGNAME", "LONGNA~1"]
    ];
    for (const [link, other] of pairs) {
      const sub = tree([["100644", "blob", blob("evil\n"), "evil.txt"]]);
      const change = commit(tree([["120000", "blob", blob(outside), link], ["040000", "tree", sub, other], ["100644", "blob", blob("kept\n"), "kept.txt"]].sort((x, y) => (x[3] < y[3] ? -1 : 1)) as Array<[string, string, string, string]>));
      const directory = await folder();
      const unwritten = await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux", disk: foldingDisk(directory) });
      expect(await fs.readdir(outside), `${link} and ${other}`).toEqual([]);
      // The link is never written, whatever the order: the file beneath the other spelling lands in the tree.
      expect(unwritten, `${link} and ${other}`).toEqual([{ path: link, reason: OUT }]);
      // This machine's disk tells the two names apart, and writes the file the same.
      const real = await folder();
      expect(await writeStoredTree(path.join(repository, ".git"), change, real, { platform: "linux" })).toEqual([{ path: link, reason: OUT }]);
      expect(await fs.readFile(path.join(real, other, "evil.txt"), "utf8")).toBe("evil\n");
      expect(await fs.readdir(outside)).toEqual([]);
    }
  });

  it("does not bring a tree forward on a disk that takes two names for one, where a tree written anew keeps the first in the tree's order", async () => {
    // The old change holds `readme.md`; the new one holds `README.md` and `readme.md`, which such a disk takes for one.
    const before = commit(tree([["100644", "blob", blob("old\n"), "readme.md"]]));
    const after = commit(tree([["100644", "blob", blob("new\n"), "README.md"], ["100644", "blob", blob("old\n"), "readme.md"]]));
    const anew = await folder();
    expect(await writeStoredTree(path.join(repository, ".git"), after, anew, { platform: "linux", disk: foldingDisk(anew), docsRoot: ".mdmd" })).toEqual([
      { path: "readme.md", reason: "another entry already stands at its name on this disk, which takes the two names for one" }
    ]);
    expect(await fs.readdir(anew)).toEqual(["README.md"]);
    const kept = await folder();
    const { written } = await writeTreeAnew(path.join(repository, ".git"), before, kept, { platform: "linux", disk: foldingDisk(kept), docsRoot: ".mdmd" });
    // Kept, `readme.md` would stand where the tree written anew holds `README.md`: the tree is written anew instead.
    expect(await bringTreeForward(path.join(repository, ".git"), after, kept, written, { platform: "linux", disk: foldingDisk(kept), docsRoot: ".mdmd" })).toEqual({
      writtenAnew: "the disk left out an entry the listing did not, which a tree written anew settles by the tree's order: another entry already stands at its name on this disk, which takes the two names for one"
    });
    // On a disk that tells the two apart, as Linux's does, it is brought forward, and holds what is written anew.
    const real = await folder();
    const first = await writeTreeAnew(path.join(repository, ".git"), before, real, { platform: "linux", docsRoot: ".mdmd" });
    await fs.writeFile(path.join(real, "PROBE"), "");
    const folds = await fs.stat(path.join(real, "probe")).then(() => true, () => false);
    await fs.rm(path.join(real, "PROBE"));
    const brought = await bringTreeForward(path.join(repository, ".git"), after, real, first.written, { platform: "linux", docsRoot: ".mdmd" });
    if (folds) {
      expect(brought).toHaveProperty("writtenAnew");
    } else {
      expect(brought).toMatchObject({ unwritten: [] });
      expect((await fs.readdir(real)).sort()).toEqual(["README.md", "readme.md"]);
      expect(await fs.readFile(path.join(real, "README.md"), "utf8")).toBe("new\n");
    }
  });

  // A folder whose mode forbids writing refuses an unlink to anyone but root, so in a container run as root the refusal
  // this case needs cannot be had; there it is skipped, and the refusals by name below go through the stand-in disk.
  it.skipIf(process.getuid?.() === 0)("writes a tree anew in a fresh folder beside it wherever the disk refuses to put it right, and leaves that folder as it was", async () => {
    // The old change holds `locked/a.txt`, which the new one drops; the disk refuses its removal (a folder this user may
    // not write, as Windows refuses while a scanner holds a file open). Until 2026-11-20 the fall-back then removed the
    // same folder, which the disk refused again, and that refusal failed the worker.
    const locked = tree([["100644", "blob", blob("a\n"), "a.txt"]]);
    const before = commit(tree([["100644", "blob", blob("k\n"), "keep.txt"], ["040000", "tree", locked, "locked"]]));
    const after = commit(tree([["100644", "blob", blob("k\n"), "keep.txt"]]));
    const parent = path.dirname(await folder());
    const first = await (await openGitRepository(repository)).workingTree(before, path.join(parent, "tree00"), { docsRoot: ".mdmd" });
    await fs.chmod(path.join(first.root, "locked"), 0o555);
    try {
      const next = await first.bringTo(after, { docsRoot: ".mdmd" });
      expect(next.broughtForward).toBe(false);
      expect(next.writtenAnew).toBe("the disk refused to put it right in place (EACCES)");
      expect(path.dirname(next.root)).toBe(parent);
      expect(path.basename(next.root)).not.toBe("tree00");
      expect(path.basename(next.root)).toHaveLength("tree00".length);
      expect(await fs.readdir(next.root)).toEqual(["keep.txt"]);
      expect(await fs.readdir(path.join(first.root, "locked"))).toEqual(["a.txt"]);
    } finally {
      await fs.chmod(path.join(first.root, "locked"), 0o755);
    }
  });

  /**
   * A kept file changed on the disk between two changes. `keep.txt` is the same blob at both changes, so it is kept;
   * between them something changes it on the disk, each time at the same length, so that only its time, its mode or its
   * identity can tell. Until 2026-11-20 the walk read names alone, and the tree came forward holding what neither change
   * holds. Each case stands on a ground some disks lack, and where this one lacks it the case says so and is skipped,
   * rather than fail with the product sound or pass without having tested anything (the independent review of
   * 2026-11-20).
   */
  describe("a kept file changed in place since it was written", () => {
    const CHANGED = { writtenAnew: "a file kept from the last change was changed on the disk since it was written" };
    let store: string;
    let before: string;
    let after: string;

    beforeAll(() => {
      store = path.join(repository, ".git");
      before = commit(tree([["100644", "blob", blob("a\n"), "a.txt"], ["100644", "blob", blob("kept\n"), "keep.txt"]]));
      after = commit(tree([["100644", "blob", blob("b\n"), "b.txt"], ["100644", "blob", blob("kept\n"), "keep.txt"]]));
    });

    /** The old change's tree written anew in a fresh folder, that folder, and its kept file. */
    async function written(): Promise<{ directory: string; file: string; first: Awaited<ReturnType<typeof writeTreeAnew>> }> {
      const directory = await folder();
      const first = await writeTreeAnew(store, before, directory, { platform: "linux", docsRoot: ".mdmd" });
      return { directory, file: path.join(directory, "keep.txt"), first };
    }

    /**
     * Whether a file written now beside `directory`, on its disk, carries a later time of the kind named than `than`,
     * waiting up to three seconds for the disk's clock to tick (two seconds is FAT's step): the ground of a case in which
     * a rewrite is told by its time. The probe stands beside the tree, never in it.
     */
    async function clockPassed(directory: string, time: "mtimeMs" | "ctimeMs", than: number): Promise<boolean> {
      const probe = path.join(path.dirname(directory), "clock-probe");
      for (const began = Date.now(); Date.now() - began < 3000; await new Promise((resolve) => setTimeout(resolve, 5))) {
        await fs.writeFile(probe, String(Date.now()));
        if ((await fs.lstat(probe))[time] > than) return true;
      }
      return false;
    }

    it("is seen where it was rewritten at the same size, once the disk's clock has ticked", async (context) => {
      const { directory, file, first } = await written();
      // Without the wait, a disk whose clock ticks coarsely (FAT, or Linux before 6.13) can rewrite within one tick, which
      // no stamp sees (`FileStamp`); the case would then be red with the product sound.
      if (!(await clockPassed(directory, "mtimeMs", first.written.get("keep.txt")!.stamp!.mtimeMs))) context.skip("this disk's clock did not tick within three seconds, so no rewrite can be told by its time here");
      await fs.writeFile(file, "KEPT\n");
      expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd" })).toEqual(CHANGED);
    });

    it("is seen where it was re-moded, on a disk that keeps POSIX modes", async (context) => {
      const { directory, file, first } = await written();
      // Windows keeps no POSIX mode: `chmod(0o755)` of a plain file changes nothing there, and the case would be red with
      // the product sound. The disk is asked, with a probe beside the tree.
      const probe = path.join(path.dirname(directory), "mode-probe");
      await fs.writeFile(probe, "", { mode: 0o644 });
      await fs.chmod(probe, 0o755);
      if (((await fs.lstat(probe)).mode & 0o111) === 0) context.skip("this disk keeps no POSIX mode, so a file cannot be re-moded here");
      await fs.chmod(file, 0o755);
      expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd" })).toEqual(CHANGED);
    });

    it("is seen where it was replaced by a rename", async () => {
      const { directory, file, first } = await written();
      await fs.writeFile(`${file}.new`, "kept\n");
      await fs.rename(`${file}.new`, file);
      expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd" })).toEqual(CHANGED);
    });

    it("is seen by its identity alone, every other part of its stamp the same", async () => {
      // The stamp the writer would have taken of a file of another identity: what the disk now says of the file that
      // replaced it, but for the identity, so that only the identity can tell whatever the clock did (the independent
      // review of 2026-11-20 found the identity held only on runs where the clock did not tick between two writes).
      const { directory, file, first } = await written();
      const identity = (await fs.lstat(file)).ino;
      await fs.writeFile(`${file}.new`, "kept\n");
      await fs.rename(`${file}.new`, file);
      const now = await fs.lstat(file);
      expect(now.ino).not.toBe(identity);
      const stamp = { size: now.size, mtimeMs: now.mtimeMs, ctimeMs: now.ctimeMs, mode: now.mode, ino: identity };
      const stamped = new Map([...first.written].map(([relative, entry]) => [relative, relative === "keep.txt" ? { ...entry, stamp } : entry]));
      expect(await bringTreeForward(store, after, directory, stamped, { platform: "linux", docsRoot: ".mdmd" })).toEqual(CHANGED);
    });

    it("is seen where it was rewritten at the same size with its modification time put back, by its change time", async (context) => {
      // The stamp is taken here at a whole second, which reads back exactly where a time with its fraction would not.
      const { directory, file, first } = await written();
      await fs.utimes(file, 1_700_000_000, 1_700_000_000);
      const at = await fs.lstat(file);
      const stamp = { size: at.size, mtimeMs: at.mtimeMs, ctimeMs: at.ctimeMs, mode: at.mode, ino: at.ino };
      const stamped = new Map([...first.written].map(([relative, entry]) => [relative, relative === "keep.txt" ? { ...entry, stamp } : entry]));
      if (!(await clockPassed(directory, "ctimeMs", stamp.ctimeMs))) context.skip("this disk's change time did not tick within three seconds, or it keeps none, so no rewrite can be told by it here");
      await fs.writeFile(file, "KEPT\n");
      await fs.utimes(file, 1_700_000_000, 1_700_000_000);
      expect((await fs.lstat(file)).mtimeMs).toBe(stamp.mtimeMs);
      expect(await bringTreeForward(store, after, directory, stamped, { platform: "linux", docsRoot: ".mdmd" })).toEqual(CHANGED);
    });

    it("is brought forward where nothing touched it", async () => {
      const { directory, first } = await written();
      expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd" })).toMatchObject({ unwritten: [] });
      expect((await fs.readdir(directory)).sort()).toEqual(["b.txt", "keep.txt"]);
    });
  });

  it("does not bring a tree forward where a file, a folder or a submodule's folder it kept is gone, which only the walk's counts see", async () => {
    // Every name the walk finds is one written, so only its counts see a written name gone (the independent review of
    // 2026-11-20 broke the counts and every test stayed green). Each kept entry is the same at both changes.
    const store = path.join(repository, ".git");
    const kept: Array<[string, string, string, string]> = [
      ["040000", "tree", tree([["100644", "blob", blob("deep\n"), "deep.txt"]]), "folder"],
      ["100644", "blob", blob("kept\n"), "keep.txt"],
      ["160000", "commit", commit(tree([["100644", "blob", blob("x\n"), "x.txt"]])), "sub"]
    ];
    const before = commit(tree([["100644", "blob", blob("a\n"), "a.txt"], ...kept]));
    const after = commit(tree([["100644", "blob", blob("b\n"), "b.txt"], ...kept]));
    const gone: Array<[string, (directory: string) => Promise<void>]> = [
      ["a kept file", (directory) => fs.rm(path.join(directory, "keep.txt"))],
      ["a kept folder, whole", (directory) => fs.rm(path.join(directory, "folder"), { recursive: true })],
      ["a kept submodule's folder", (directory) => fs.rmdir(path.join(directory, "sub"))]
    ];
    for (const [what, remove] of gone) {
      const directory = await folder();
      const first = await writeTreeAnew(store, before, directory, { platform: "linux", docsRoot: ".mdmd" });
      await remove(directory);
      expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd" }), what).toEqual({ writtenAnew: "a file or folder its writer wrote was gone" });
    }
    // Untouched, all three are brought forward.
    const directory = await folder();
    const first = await writeTreeAnew(store, before, directory, { platform: "linux", docsRoot: ".mdmd" });
    expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd" })).toMatchObject({ unwritten: [] });
    expect((await fs.readdir(directory)).sort()).toEqual(["b.txt", "folder", "keep.txt", "sub"]);
  });

  it("does not bring a tree forward on Windows where a name it leaves or makes holds ~ and a digit, which short names make depend on the order of writing", async () => {
    // Finding 6 of the independent review of 2026-11-20, reasoned and not run on Windows: on a disk that makes 8.3 short
    // names, `ABCDEFGHIJ.TXT` written first takes `ABCDEF~1.TXT`, and a literal `ABCDEF~1.TXT` is then refused; in a
    // tree brought forward the long name may hold `~2`, and the literal is written. The platform is imitated by its seam.
    const store = path.join(repository, ".git");
    const plain = blob("kept\n");
    const without = commit(tree([["100644", "blob", blob("a\n"), "ABCDEFGHIJ.TXT"], ["100644", "blob", plain, "kept.txt"]]));
    const holding = commit(tree([["100644", "blob", blob("b\n"), "ABCDEF~1.TXT"], ["100644", "blob", blob("a\n"), "ABCDEFGHIJ.TXT"], ["100644", "blob", plain, "kept.txt"]]));
    const SHORT = { writtenAnew: "a name holds ~ and a digit, which on Windows a short name may take or not by the order the names were made" };
    for (const [from, to, label] of [[without, holding, "makes"], [holding, without, "leaves"]] as const) {
      const windows = await folder();
      const first = await writeTreeAnew(store, from, windows, { platform: "win32", docsRoot: ".mdmd" });
      expect(await bringTreeForward(store, to, windows, first.written, { platform: "win32", docsRoot: ".mdmd" }), label).toEqual(SHORT);
      // Elsewhere the same step is brought forward.
      const linux = await folder();
      const other = await writeTreeAnew(store, from, linux, { platform: "linux", docsRoot: ".mdmd" });
      expect(await bringTreeForward(store, to, linux, other.written, { platform: "linux", docsRoot: ".mdmd" }), label).toMatchObject({ unwritten: [] });
    }
  });

  it("gives up bringing a tree forward, by name, where the disk refuses a removal as Windows does", async () => {
    // Windows refuses with EPERM or EBUSY while a scanner holds a file open, and EACCES where it may not be written.
    const store = path.join(repository, ".git");
    const before = commit(tree([["100644", "blob", blob("a\n"), "a.txt"], ["100644", "blob", blob("kept\n"), "keep.txt"]]));
    const after = commit(tree([["100644", "blob", blob("kept\n"), "keep.txt"]]));
    for (const code of ["EPERM", "EBUSY", "EACCES"]) {
      const directory = await folder();
      const first = await writeTreeAnew(store, before, directory, { platform: "linux", docsRoot: ".mdmd" });
      const real = realDisk(directory);
      const refusing: TreeDisk = {
        ...real,
        remove: async (relative, what) => {
          if (what === "file") throw Object.assign(new Error(`${code}: ${relative}`), { code });
          return real.remove(relative, what);
        }
      };
      expect(await bringTreeForward(store, after, directory, first.written, { platform: "linux", docsRoot: ".mdmd", disk: refusing }), code).toEqual({ writtenAnew: `the disk refused to put it right in place (${code})` });
      expect(await fs.readFile(path.join(directory, "a.txt"), "utf8"), code).toBe("a\n");
    }
  });

  it("decides each entry's place by what the disk answers: a folder made a level at a time, a link or a file refused, a taken name refused", async () => {
    const answers = new Map<string, DiskEntry>([["vendor", "link"], ["docs", "folder"], ["docs/a.md", "other"], ["readme", "other"]]);
    const made: string[] = [];
    const disk: TreeDisk = {
      entry: async (relative) => answers.get(relative) ?? "absent",
      makeFolder: async (relative) => {
        made.push(relative);
        answers.set(relative, "folder");
      },
      remove: async () => undefined
    };
    expect(await placeEntry(["vendor", "lib", "x.js"], disk)).toBe("it lies beneath vendor, which is a symbolic link on this disk, and nothing is written through it");
    expect(await placeEntry(["readme", "x"], disk)).toBe("it lies beneath readme, which is a file on this disk, and nothing is written through it");
    expect(await placeEntry(["docs", "a.md"], disk)).toBe("another entry already stands at its name on this disk, which takes the two names for one");
    expect(await placeEntry(["src", "deep", "x.ts"], disk)).toBeUndefined();
    expect(made).toEqual(["src", "src/deep"]);
    const tooLong: TreeDisk = { entry: async () => { throw Object.assign(new Error("too long"), { code: "ENAMETOOLONG" }); }, makeFolder: async () => undefined, remove: async () => undefined };
    expect(await placeEntry(["x".repeat(300)], tooLong)).toBe("this disk cannot hold its name (ENAMETOOLONG)");
  });

  it("leaves out a name that is not UTF-8, which could only be written under another name", async () => {
    const id = blob("odd\n");
    const root = execFileSync("git", ["mktree"], { cwd: repository, env: isolated, input: Buffer.concat([Buffer.from(`100644 blob ${id}\tbad-`), Buffer.from([0xff, 0xfe]), Buffer.from(`.txt\n100644 blob ${id}\tgood.txt\n`)]), encoding: "utf8" }).trim();
    const directory = await folder();
    const unwritten = await writeStoredTree(path.join(repository, ".git"), commit(root), directory, { platform: "linux" });
    expect(unwritten.map((entry) => entry.reason)).toEqual(["its name is not valid UTF-8, so it cannot be written under its own name"]);
    expect(await fs.readdir(directory)).toEqual(["good.txt"]);
  });

  it("leaves out a name this disk cannot hold and writes the rest of the commit", async () => {
    const long = `${"n".repeat(300)}.txt`;
    const change = commit(tree([["100644", "blob", blob("long\n"), long], ["100644", "blob", blob("kept\n"), "kept.txt"]]));
    const directory = await folder();
    expect(await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux" })).toEqual([{ path: long, reason: "this disk cannot hold its name (ENAMETOOLONG)" }]);
    expect(await fs.readdir(directory)).toEqual(["kept.txt"]);
  });

  it("leaves out on Windows a name that would climb out of the folder or that Windows cannot hold, and writes it elsewhere as the name it is", async () => {
    const change = commit(tree([["100644", "blob", blob("climb\n"), "..\\..\\x"], ["100644", "blob", blob("drive\n"), "c:d"], ["100644", "blob", blob("plain\n"), "plain.txt"]]));
    const windows = await folder();
    expect((await writeStoredTree(path.join(repository, ".git"), change, windows, { platform: "win32" })).map((entry) => entry.path)).toEqual(["..\\..\\x", "c:d"]);
    expect(await fs.readdir(windows)).toEqual(["plain.txt"]);
    const linux = await folder();
    expect(await writeStoredTree(path.join(repository, ".git"), change, linux, { platform: "linux" })).toEqual([]);
    expect((await fs.readdir(linux)).sort()).toEqual(["..\\..\\x", "c:d", "plain.txt"]);
  });

  it("reads each blob as stored, a replacement the repository holds for it set aside", async () => {
    const original = blob("as committed\n");
    const change = commit(tree([["100644", "blob", original, "kept.txt"]]));
    git(["replace", original, blob("as replaced locally\n")]);
    const directory = await folder();
    await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux" });
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
    await writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux" });
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
      await expect(writeStoredTree(path.join(repository, ".git"), change, directory, { platform: "linux" })).rejects.toThrow(/EACCES|permission denied/u);
    } finally {
      await fs.chmod(directory, 0o755);
    }
  }, 60_000);
});

describe("every git call of the history command", () => {
  const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
  const git = (cwd: string, args: string[], env: NodeJS.ProcessEnv = isolated): string => execFileSync("git", args, { cwd, env, encoding: "utf8" }).trim();
  let scratch: string;

  beforeAll(async () => {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-git-calls-"));
  });

  afterAll(async () => {
    await fs.rm(scratch, { recursive: true, force: true });
  });

  /**
   * The modules of the history command, tests aside: its two folders and its entry. A module that starts git otherwise
   * than through `historyGit` or `spawnHistoryGit` fails here, each start allowed elsewhere named with why.
   */
  it("starts git only through the two functions that set what every call sets, so that a call added without them fails here", async () => {
    const root = path.resolve(__dirname, "..", "..", "..", "..", "..");
    const folders = ["packages/engine/src/live-docs/history", "packages/generator/src/history"];
    const modules = [
      ...(await Promise.all(folders.map(async (folder) => (await fs.readdir(path.join(root, folder))).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts")).map((name) => `${folder}/${name}`)))).flat(),
      "scripts/live-docs/history.ts"
    ];
    // Each module's starts of git that do not go through the two functions, by how many it may have and why.
    const allowed: Record<string, [count: number, why: string]> = {
      "packages/engine/src/live-docs/history/git.ts": [2, "the two functions themselves"],
      "packages/generator/src/history/summarizeChange.ts": [1, "`standingFiles` runs in the tree's environment, which the tree writer makes from what every call sets (held above)"]
    };
    const starts: Record<string, number> = {};
    for (const module of modules) {
      const text = await fs.readFile(path.join(root, module), "utf8");
      const count = text.match(/(?<![.\w$])(?:execFileAsync|execFile|execFileSync|spawn|spawnSync|exec|execSync)\s*\(\s*["'`]git["'`]/gu)?.length ?? 0;
      if (count > 0 || module in allowed) starts[module] = count;
    }
    expect(starts).toEqual(Object.fromEntries(Object.entries(allowed).map(([module, [count]]) => [module, count])));
  });

  it("never fetches from a remote, as rename detection would in a partial clone without blobs", async () => {
    // The independent review of 2026-11-20: `changesBetween` (`git diff -M50%`) ran without `GIT_NO_LAZY_FETCH`, and in
    // a partial clone without blobs rename detection fetched them from the clone's remote.
    const origin = path.join(scratch, "origin");
    await fs.mkdir(origin);
    git(origin, ["init", "--quiet", "-b", "main"]);
    git(origin, ["config", "uploadpack.allowFilter", "true"]);
    const lines = Array.from({ length: 40 }, (_, index) => `export const value${index} = ${index};`);
    await fs.writeFile(path.join(origin, "old.ts"), `${lines.join("\n")}\n`);
    git(origin, ["add", "--all"]);
    git(origin, ["commit", "--quiet", "-m", "a file"]);
    const from = git(origin, ["rev-parse", "HEAD"]);
    await fs.rm(path.join(origin, "old.ts"));
    // Renamed with one line changed, so that only the blobs' contents can tell it a rename.
    await fs.writeFile(path.join(origin, "new.ts"), `${[...lines.slice(0, 39), "export const changed = 1;"].join("\n")}\n`);
    git(origin, ["add", "--all"]);
    git(origin, ["commit", "--quiet", "-m", "the file renamed and changed"]);
    const to = git(origin, ["rev-parse", "HEAD"]);
    const renamed = git(origin, ["rev-parse", `${to}:new.ts`]);
    const clone = path.join(scratch, "clone");
    git(scratch, ["clone", "--quiet", "--no-checkout", "--filter=blob:none", pathToFileURL(origin).href, clone]);
    const missing = (): boolean => {
      try {
        execFileSync("git", ["cat-file", "-e", renamed], { cwd: clone, env: { ...isolated, GIT_NO_LAZY_FETCH: "1" }, stdio: "ignore" });
        return false;
      } catch {
        return true;
      }
    };
    expect(missing(), "the clone holds no blob to begin with").toBe(true);
    const repo = await openGitRepository(clone);
    // Without the blobs, git cannot weigh the rename: the call fails or reads no rename, and fetches nothing.
    await repo.changesBetween(from, to).then(
      (changes) => expect(changes.renamed).toEqual([]),
      (error: unknown) => expect(String(error)).toMatch(/git/u)
    );
    expect(missing(), "the blob is still not in the clone").toBe(true);
  }, 60_000);
});

/**
 * The repository's own configuration, which `GIT_CONFIG_GLOBAL` and `GIT_CONFIG_NOSYSTEM` do not set aside, against the
 * tree's calls: the tree writer's, and the generator's in the tree (`ls-files`, `check-ignore`). The file-system monitor
 * and the excludes file are set aside (`SET_ASIDE` in `git.ts`), each case red with them let in; the split index and the
 * sparse checkout are not, and their cases, green with them let in, hold why: should a version of git apply them to
 * these calls, they fail.
 */
describe("the repository's own settings and a tree's calls", () => {
  const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
  let scratch: string;
  let repository: string;
  let change: string;

  const git = (args: string[]): string => execFileSync("git", args, { cwd: repository, env: isolated, encoding: "utf8" }).trim();

  beforeAll(async () => {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-settings-"));
    repository = path.join(scratch, "repository");
    await fs.mkdir(path.join(repository, "d"), { recursive: true });
    await fs.mkdir(path.join(repository, "e"));
    git(["init", "--quiet", "-b", "main"]);
    await fs.writeFile(path.join(repository, "d", "a.ts"), "export const a = 1;\n");
    await fs.writeFile(path.join(repository, "e", "b.ts"), "export const b = 1;\n");
    git(["add", "--all"]);
    git(["commit", "--quiet", "-m", "two folders"]);
    change = git(["rev-parse", "HEAD"]);
  });

  afterAll(async () => {
    await fs.rm(scratch, { recursive: true, force: true });
  });

  /** The change's tree as a worker makes it, and what `run` gives in it with the tree's environment, as the generator runs git there. */
  async function inTree<T>(run: (root: string, env: NodeJS.ProcessEnv) => Promise<T> | T): Promise<T> {
    const tree = await (await openGitRepository(repository)).workingTree(change, path.join(await fs.mkdtemp(path.join(scratch, "tree-")), "tree00"), { docsRoot: ".mdmd" });
    try {
      return await run(tree.root, { ...isolated, ...tree.environment });
    } finally {
      await tree.remove();
    }
  }

  it("runs no program the repository names as its file-system monitor", async () => {
    const marker = path.join(scratch, "monitor-ran");
    const monitor = path.join(scratch, "monitor.sh");
    await fs.writeFile(monitor, `#!/bin/sh\necho ran >> '${marker}'\n`, { mode: 0o755 });
    git(["config", "core.fsmonitor", monitor]);
    try {
      const listed = await inTree((root, env) => execFileSync("git", ["ls-files", "-z"], { cwd: root, env, encoding: "utf8" }).split("\0").filter(Boolean));
      expect(listed.sort()).toEqual(["d/a.ts", "e/b.ts"]);
      await expect(fs.access(marker)).rejects.toThrow();
    } finally {
      git(["config", "--unset", "core.fsmonitor"]);
    }
  });

  it("writes nothing into the repository's git directory where the repository asks for a split index", async () => {
    git(["config", "core.splitIndex", "true"]);
    try {
      const before = (await fs.readdir(path.join(repository, ".git"))).sort();
      await inTree(() => undefined);
      expect((await fs.readdir(path.join(repository, ".git"))).sort()).toEqual(before);
    } finally {
      git(["config", "--unset", "core.splitIndex"]);
    }
  });

  it("lists every file of the tree as in it where the repository asks for a sparse checkout", async () => {
    git(["config", "core.sparseCheckout", "true"]);
    git(["config", "core.sparseCheckoutCone", "true"]);
    git(["config", "index.sparse", "true"]);
    await fs.mkdir(path.join(repository, ".git", "info"), { recursive: true });
    await fs.writeFile(path.join(repository, ".git", "info", "sparse-checkout"), "/*\n!/*/\n/d/\n");
    try {
      // `-t` tags each entry: `H` for a file in the tree, `S` for one marked as not in it.
      const listed = await inTree((root, env) => execFileSync("git", ["ls-files", "-t", "--stage", "-z"], { cwd: root, env, encoding: "utf8" }).split("\0").filter(Boolean));
      expect(listed.map((entry) => `${entry.slice(0, 1)} ${entry.slice(entry.indexOf("\t") + 1)}`).sort()).toEqual(["H d/a.ts", "H e/b.ts"]);
    } finally {
      git(["config", "--unset", "core.sparseCheckout"]);
      git(["config", "--unset", "core.sparseCheckoutCone"]);
      git(["config", "--unset", "index.sparse"]);
      await fs.rm(path.join(repository, ".git", "info", "sparse-checkout"));
    }
  });

  it("ignores none of the generator's writes by an excludes file the repository names", async () => {
    const excludes = path.join(scratch, "excludes");
    await fs.writeFile(excludes, "*.mdmd.md\n");
    git(["config", "core.excludesFile", excludes]);
    try {
      const ignored = await inTree(async (root, env) => {
        await fs.mkdir(path.join(root, ".mdmd"));
        await fs.writeFile(path.join(root, ".mdmd", "a.ts.mdmd.md"), "# a\n");
        // As `gitIgnored` asks: 0 when some path is ignored, 1 when none is.
        const result = spawnSync("git", ["check-ignore", "--stdin", "-z"], { cwd: root, env, input: ".mdmd/a.ts.mdmd.md\0", encoding: "utf8" });
        return [result.status, result.stdout];
      });
      expect(ignored).toEqual([1, ""]);
    } finally {
      git(["config", "--unset", "core.excludesFile"]);
    }
  });
});
