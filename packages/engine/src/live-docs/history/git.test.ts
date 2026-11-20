import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
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
      makeFolder: (relative) => real.makeFolder(relative)
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
    expect(await bringTreeForward(path.join(repository, ".git"), after, kept, written, { platform: "linux", disk: foldingDisk(kept), docsRoot: ".mdmd" })).toBeUndefined();
    // On a disk that tells the two apart, as Linux's does, it is brought forward, and holds what is written anew.
    const real = await folder();
    const first = await writeTreeAnew(path.join(repository, ".git"), before, real, { platform: "linux", docsRoot: ".mdmd" });
    await fs.writeFile(path.join(real, "PROBE"), "");
    const folds = await fs.stat(path.join(real, "probe")).then(() => true, () => false);
    await fs.rm(path.join(real, "PROBE"));
    const brought = await bringTreeForward(path.join(repository, ".git"), after, real, first.written, { platform: "linux", docsRoot: ".mdmd" });
    if (folds) {
      expect(brought).toBeUndefined();
    } else {
      expect(brought?.unwritten).toEqual([]);
      expect((await fs.readdir(real)).sort()).toEqual(["README.md", "readme.md"]);
      expect(await fs.readFile(path.join(real, "README.md"), "utf8")).toBe("new\n");
    }
  });

  it("writes a tree anew in a fresh folder beside it wherever the disk refuses to put it right, and leaves that folder as it was", async () => {
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
      expect(path.dirname(next.root)).toBe(parent);
      expect(path.basename(next.root)).not.toBe("tree00");
      expect(path.basename(next.root)).toHaveLength("tree00".length);
      expect(await fs.readdir(next.root)).toEqual(["keep.txt"]);
      expect(await fs.readdir(path.join(first.root, "locked"))).toEqual(["a.txt"]);
    } finally {
      await fs.chmod(path.join(first.root, "locked"), 0o755);
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
      }
    };
    expect(await placeEntry(["vendor", "lib", "x.js"], disk)).toBe("it lies beneath vendor, which is a symbolic link on this disk, and nothing is written through it");
    expect(await placeEntry(["readme", "x"], disk)).toBe("it lies beneath readme, which is a file on this disk, and nothing is written through it");
    expect(await placeEntry(["docs", "a.md"], disk)).toBe("another entry already stands at its name on this disk, which takes the two names for one");
    expect(await placeEntry(["src", "deep", "x.ts"], disk)).toBeUndefined();
    expect(made).toEqual(["src", "src/deep"]);
    const tooLong: TreeDisk = { entry: async () => { throw Object.assign(new Error("too long"), { code: "ENAMETOOLONG" }); }, makeFolder: async () => undefined };
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
