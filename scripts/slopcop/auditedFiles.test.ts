import { globSync } from "glob";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { withoutGitIgnored } from "@live-documentation/engine/tooling/gitIgnored";

import { auditedFiles, foldersGitIgnoresWhole, foldersReadAsEmpty, walksNoLinkToAFolder } from "./auditedFiles";

/**
 * Every case holds the shortened walk to the walk the audits made until 2026-11-20, kept here as the oracle: each
 * pattern matched over the whole workspace, then what git ignores dropped, every file kept when git cannot answer. A
 * case is red when the shortened walk leaves a file out that the oracle keeps, or keeps one the oracle drops.
 */
function oracle(root: string, patterns: string[], ignoreGlobs: string[]): string[] {
  const found = new Set<string>();
  for (const pattern of patterns) {
    for (const match of globSync(pattern, { cwd: root, ignore: ignoreGlobs, nodir: true, dot: true })) found.add(path.resolve(root, match));
  }
  return withoutGitIgnored(root, Array.from(found).sort());
}

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

/** The audited files as workspace-relative paths, after checking them against the oracle. */
function audited(root: string, patterns = ["**/*.md"], ignoreGlobs = ["**/node_modules/**"]): string[] {
  const files = auditedFiles(root, patterns, ignoreGlobs);
  expect(files).toEqual(oracle(root, patterns, ignoreGlobs));
  return files.map((file) => path.relative(root, file).split(path.sep).join("/"));
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
    expect(files).toEqual(oracle(root, ["**/*.md"], ["**/.git/**"]));
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

  it("reads every file, as before, where git refuses a path in a submodule", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n", "build/a.md": "", "module/b.md": "", "README.md": "" });
    git(path.join(root, "module"), "init", "-q");
    git(path.join(root, "module"), "add", "b.md");
    git(path.join(root, "module"), "commit", "-qm", "module");
    git(root, "init", "-q");
    git(root, "add", "module");

    // Git refuses `module/b.md`, and the audit then reads every file found, the ignored build among them.
    expect(audited(root)).toEqual(["README.md", "build/a.md", "module/b.md"]);
  });

  it("walks in full a pattern that may pass through a link to a folder inside an ignored folder", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n", "src/real/r.md": "", "README.md": "" });
    fs.mkdirSync(path.join(root, "build"));
    fs.symlinkSync(path.join("..", "src", "real"), path.join(root, "build", "link"));
    git(root, "init", "-q");

    // `*/**/*.md` follows `build/link`, and git refuses `build/link/r.md`; then every file found is read, as before.
    expect(audited(root, ["*/**/*.md"])).toEqual(["build/link/r.md", "src/real/r.md"]);
    expect(audited(root)).toEqual(["README.md", "src/real/r.md"]);
  });

  it("walks a folder whose path begins with a colon, which git may read as pathspec magic and refuse", () => {
    const root = workspace();
    write(root, { ".gitignore": "build/\n/:*\n", "build/a.md": "", "README.md": "", ":(bad)/c.md": "" });
    git(root, "init", "-q");

    // Git refuses `:(bad)/c.md`, so the answer is as before: every file found.
    expect(audited(root)).toEqual([":(bad)/c.md", "README.md", "build/a.md"]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual(["build"]);
  });

  it("walks a workspace that lies inside a folder an outer repository ignores, as before", () => {
    const outer = workspace();
    write(outer, { ".gitignore": "inner/\n", "inner/a.md": "", "inner/sub/b.md": "" });
    git(outer, "init", "-q");
    const root = path.join(outer, "inner");
    expect(audited(root)).toEqual([]);
    // Git names the workspace itself (`./`), which is walked all the same: a top-level name git refuses changes the answer.
    write(root, { ":(bad).md": "" });
    expect(audited(root)).toEqual([":(bad).md", "a.md", "sub/b.md"]);
    expect(foldersGitIgnoresWhole(root).size).toBe(0);
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
    write(root, { "skip/a.md": "", "skip/deep/b.md": "", "skipped/c.md": "", "keep/skip/d.md": "" });
    const unread = foldersReadAsEmpty(root, new Set(["skip"]));
    expect(globSync("**/*.md", { cwd: root, fs: unread, posix: true }).sort()).toEqual(["keep/skip/d.md", "skipped/c.md"]);
  });
});
