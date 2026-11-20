import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { gitIgnores } from "@live-documentation/engine/tooling/gitIgnored";

import { auditedFiles } from "./auditedFiles";

/**
 * Every case names the files it expects, written out from what git itself says of the repository it makes (`git
 * status --ignored`). Until the review of the third form (2026-11-20) each case was also held to an oracle, the old
 * full walk judged by `withoutGitIgnored`; since that judging came to read the very listing the audits read, the
 * oracle graded the code by itself, and it is gone: the written lists are the cases' only measure.
 */
const foldersGitIgnoresWhole = (root: string): ReadonlySet<string> => gitIgnores(root)?.folders ?? new Set();

const folders: string[] = [];
// The variables a case sets, restored one by one: the process's own environment is the one git is started with.
const environment = { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: process.env.GIT_CONFIG_GLOBAL };
afterEach(() => {
  for (const folder of folders.splice(0)) fs.rmSync(folder, { recursive: true, force: true });
  for (const [name, value] of Object.entries(environment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function workspace(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "audited-files-"));
  folders.push(root);
  return root;
}

function write(root: string, files: Record<string, string>): void {
  for (const [relative, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), text);
  }
}

function git(root: string, ...args: string[]): void {
  const result = spawnSync("git", ["-C", root, "-c", "user.email=test@example.com", "-c", "user.name=test", ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
}

/** The audited files as workspace-relative paths. */
function audited(root: string, patterns = ["**/*.md"], ignoreGlobs = ["**/node_modules/**"]): string[] {
  return auditedFiles(root, patterns, ignoreGlobs).map((file) => path.relative(root, file).split(path.sep).join("/"));
}

describe("auditedFiles", () => {
  it("never reads a folder git ignores whole, and reads one that holds a tracked file", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\nmixed/\n", "README.md": "", "build/deep/a.md": "", "mixed/kept.md": "", "mixed/sub/b.md": "" });
    git(root, "init", "-q");
    git(root, "add", "-f", "mixed/kept.md");
    // Every folder the shortened walk reads, it reads through the file system it hands glob, which reads the others
    // with `fs.readdirSync`; a walk that shortened nothing would read none through it, and is red here too.
    const read = new Set<string>();
    const readdirSync = fs.readdirSync;
    const spy = vi.spyOn(fs, "readdirSync").mockImplementation(((...args: unknown[]) => {
      read.add(path.relative(root, String(args[0])).split(path.sep).join("/"));
      return Reflect.apply(readdirSync, fs, args);
    }) as unknown as typeof fs.readdirSync);
    let files: string[];
    try {
      files = auditedFiles(root, ["**/*.md"], ["**/.git/**"]);
    } finally {
      spy.mockRestore();
    }
    expect(files).toEqual([path.join(root, "README.md"), path.join(root, "mixed", "kept.md")]);
    expect([...read].sort()).toEqual(["", "mixed"]);
  });

  it("leaves out what every kind of excludes file ignores, keeps a tracked file inside an ignored folder, and walks no folder git ignores whole", () => {
    const root = workspace();
    const globalExcludes = path.join(workspace(), "excludes");
    fs.writeFileSync(globalExcludes, "global/\n");
    const globalConfig = path.join(path.dirname(globalExcludes), "gitconfig");
    fs.writeFileSync(globalConfig, `[core]\n\texcludesFile = ${globalExcludes}\n`);
    process.env.GIT_CONFIG_GLOBAL = globalConfig;
    write(root, {
      ".gitignore": "build/\nmixed/\n*.log.md\n",
      "build/a.md": "", "build/deep/b.md": "",
      "mixed/kept.md": "", "mixed/dropped.md": "", "mixed/sub/c.md": "",
      "only-logs/x.log.md": "",
      "part/x.log.md": "", "part/kept.md": "",
      "sub/.gitignore": "local/\n", "sub/local/d.md": "", "sub/kept.md": "",
      "excluded/e.md": "", "global/g.md": "", "README.md": ""
    });
    git(root, "init", "-q");
    fs.appendFileSync(path.join(root, ".git", "info", "exclude"), "excluded/\n");
    git(root, "add", "-f", "mixed/kept.md");

    expect(audited(root)).toEqual(["README.md", "mixed/kept.md", "part/kept.md", "sub/kept.md"]);
    // A folder that holds a tracked file is walked, and what is ignored inside it is named by itself.
    expect([...foldersGitIgnoresWhole(root)].sort()).toEqual(["build", "excluded", "global", "mixed/sub", "only-logs", "sub/local"]);
  });

  it("does not walk a nested repository or a worktree inside an ignored folder, and walks one inside a folder git does not ignore as before", () => {
    const root = workspace();
    write(root, { ".gitignore": "ignored/\n", "README.md": "", "ignored/nested/n.md": "", "open/nested/m.md": "", "open/nested/.gitignore": "build/\n", "open/nested/build/out.md": "" });
    git(root, "init", "-q");
    git(root, "add", ".gitignore", "README.md");
    git(root, "commit", "-qm", "first");
    git(path.join(root, "ignored", "nested"), "init", "-q");
    git(path.join(root, "open", "nested"), "init", "-q");
    git(root, "worktree", "add", "-q", "--detach", "ignored/worktree");

    // Git reads the nested repository's own .gitignore for the paths it is given, as it did before.
    expect(audited(root)).toEqual(["README.md", "open/nested/m.md"]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual(["ignored"]);
  });

  it("reads names with spaces, glob characters, other alphabets and a newline as names", () => {
    const root = workspace();
    const odd = "a [b]*{c,d} é\nf";
    write(root, { ".gitignore": "/odd*\n", [`odd ${odd}/x.md`]: "", [`kept ${odd}/y.md`]: "", "[b]/z.md": "" });
    git(root, "init", "-q");

    expect(audited(root)).toEqual(["[b]/z.md", `kept ${odd}/y.md`]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual([`odd ${odd}`]);
  });

  it("follows git's case rule where git matches names without regard to case, and exactly where it does not", () => {
    for (const ignoreCase of [true, false]) {
      const root = workspace();
      write(root, { ".gitignore": "Build/\n", "build/a.md": "", "README.md": "" });
      git(root, "init", "-q");
      git(root, "config", "core.ignorecase", String(ignoreCase));
      expect(audited(root)).toEqual(ignoreCase ? ["README.md"] : ["README.md", "build/a.md"]);
    }
  });

  it("judges each path by its name, a name a tracked file's wildcard pattern would match among them", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n*.log.md\n", "a1/build/x.md": "", "a[1]/build/x.md": "", "a1.log.md": "", "a[1].log.md": "", "b?/out/x.md": "", "bc/out/x.md": "", "a\\b/out/x.md": "", "ab/out/x.md": "", "ab/.gitignore": "out/\n", "a\\b/.gitignore": "out/\n", "kept.md": "" });
    git(root, "init", "-q");
    git(root, "add", "-f", "a1/build/x.md", "a1.log.md", "bc/out/x.md", "ab/out/x.md");
    fs.appendFileSync(path.join(root, ".git", "info", "exclude"), "out/\n");
    // Asked as patterns, `a[1]/build/x.md` matched the tracked `a1/build/x.md` and was kept, and so each of the others.
    expect(audited(root)).toEqual(["a1.log.md", "a1/build/x.md", "ab/out/x.md", "bc/out/x.md", "kept.md"]);
  });

  it("judges a submodule's files by the submodule's own git", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n*.gen.md\n", "build/a.md": "", "module/b.md": "", "module/.gitignore": "own.md\n", "module/own.md": "", "module/mine.md": "", "module/x.gen.md": "", "module/build/c.md": "", "README.md": "" });
    git(path.join(root, "module"), "init", "-q");
    git(path.join(root, "module"), "add", "b.md", "x.gen.md", ".gitignore");
    git(path.join(root, "module"), "commit", "-qm", "module");
    fs.appendFileSync(path.join(root, "module", ".git", "info", "exclude"), "mine.md\n");
    git(root, "init", "-q");
    git(root, "add", "module");

    // The outer `build/` and `*.gen.md` reach no file of the submodule; its own `.gitignore` and `.git/info/exclude` do.
    // Until this form `module/build/c.md` and the tracked `module/x.gen.md` were dropped, and `module/mine.md` read.
    expect(audited(root)).toEqual(["README.md", "module/b.md", "module/build/c.md", "module/x.gen.md"]);
  });

  it("asks of a path through a link to a folder as its link: ignored with the link, else read", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n", "src/real/r.md": "", "README.md": "", "build/kept.md": "" });
    fs.mkdirSync(path.join(root, "open"));
    fs.symlinkSync(path.join("..", "src", "real"), path.join(root, "build", "link"));
    fs.symlinkSync(path.join("..", "src", "real"), path.join(root, "open", "link"));
    git(root, "init", "-q");
    // A tracked file keeps `build` from being a folder git ignores whole, so that the walk finds what is under its link.
    git(root, "add", "-f", "build/kept.md");
    fs.appendFileSync(path.join(root, ".git", "info", "exclude"), "*.md\n!README.md\n!src/**\n");

    // `*/**/*.md` follows both links; git judges no path beyond one, so `build/link/r.md` goes with the ignored
    // `build/link`, and `open/link/r.md`, whose link git does not ignore, is read as every file is that git cannot judge.
    expect(audited(root, ["*/**/*.md"])).toEqual(["build/kept.md", "open/link/r.md", "src/real/r.md"]);
    expect(audited(root)).toEqual(["README.md", "build/kept.md", "src/real/r.md"]);
  });

  it("judges a folder or a file whose path begins with a colon by its name", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n/:*\n!/:kept.md\n", "build/a.md": "", "README.md": "", ":(bad)/c.md": "", ":!x.md": "", ":kept.md": "" });
    git(root, "init", "-q");

    // Until 2026-11-20 git refused `:(bad)/c.md`, and the audit then read every file found.
    expect(audited(root)).toEqual([":kept.md", "README.md"]);
    expect([...foldersGitIgnoresWhole(root)].sort()).toEqual([":(bad)", "build"]);
  });

  it("reads nothing of a workspace that lies inside a folder an outer repository ignores", () => {
    const outer = workspace();
    write(outer, { ".gitignore": "inner/\n", "inner/a.md": "", "inner/sub/b.md": "", "inner/:(bad).md": "" });
    git(outer, "init", "-q");
    const root = path.join(outer, "inner");
    // Git names the workspace itself (`./`), and it reads as empty.
    expect(audited(root)).toEqual([]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual([""]);
  });

  it("walks everything where git cannot answer: outside a repository, and with no git on the path", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n", "build/a.md": "", "README.md": "" });
    expect(audited(root)).toEqual(["README.md", "build/a.md"]);
    expect(foldersGitIgnoresWhole(root).size).toBe(0);

    git(root, "init", "-q");
    process.env.PATH = workspace();
    expect(foldersGitIgnoresWhole(root).size).toBe(0);
    expect(audited(root)).toEqual(["README.md", "build/a.md"]);
  });
});
