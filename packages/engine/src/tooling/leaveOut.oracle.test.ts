import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { leaveOut, type IgnoreFileText } from "./leaveOut";

/**
 * `leaveOut`'s `.gitignore` half held to git's own answer, rule for rule: for every file and folder of a tree, whether
 * git ignores it and which file and line decided (`git check-ignore -v -n --no-index`, which names a negation that
 * matched too). Each tree is made in a fresh repository with nothing tracked and git's global and system configuration
 * kept out, and asked twice: with names matched as written (`core.ignorecase=false`, as on Linux) and without regard to
 * case (`core.ignorecase=true`, as in every repository made on Windows).
 */

const made: string[] = [];
afterAll(() => {
  for (const folder of made) fs.rmSync(folder, { recursive: true, force: true });
});

/** A tree: its files (a path ending in `/` is an empty folder), and its `.gitignore` files by path with their text. */
interface Tree {
  files: string[];
  ignores: Record<string, string>;
}

const git = (cwd: string, args: string[], input?: string, ignoreCase = false) => spawnSync("git", ["-c", "core.excludesFile=", "-c", `core.ignorecase=${ignoreCase}`, ...args], {
  cwd, input, encoding: "utf8", env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", HOME: cwd }
});

/** Every file and folder of the tree, relative, with whether it is a folder, `.git` aside. */
function listing(root: string): Array<{ path: string; folder: boolean }> {
  const found: Array<{ path: string; folder: boolean }> = [];
  const walk = (relative: string): void => {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      if (relative === "" && entry.name === ".git") continue;
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      found.push({ path: child, folder: entry.isDirectory() });
      if (entry.isDirectory()) walk(child);
    }
  };
  walk("");
  return found.sort((a, b) => (a.path < b.path ? -1 : 1));
}

/** Git's word and the function's on each path of a tree, in one comparable line each: `path  ignored|kept  file:line`. */
function bothWords(tree: Tree, ignoreCase: boolean): { git: string[]; ours: string[] } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "leave-out-git-"));
  made.push(root);
  expect(git(root, ["init", "-q", "."]).status).toBe(0);
  for (const file of tree.files) {
    const at = path.join(root, file);
    if (file.endsWith("/")) fs.mkdirSync(at, { recursive: true });
    else {
      fs.mkdirSync(path.dirname(at), { recursive: true });
      fs.writeFileSync(at, "");
    }
  }
  for (const [file, text] of Object.entries(tree.ignores)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  const entries = listing(root);
  const asked = git(root, ["check-ignore", "-v", "-n", "-z", "--no-index", "--stdin"], entries.map((entry) => entry.path).join("\0") + "\0", ignoreCase);
  expect(asked.status === 0 || asked.status === 1, asked.stderr).toBe(true);
  const fields = asked.stdout.split("\0");
  const gitWords: string[] = [];
  for (let i = 0; i + 3 < fields.length; i += 4) {
    const [source, line, pattern, name] = fields.slice(i, i + 4);
    const ignored = source !== "" && !pattern.startsWith("!");
    gitWords.push(`${name}  ${ignored ? "ignored" : "kept"}  ${source ? `${source}:${line}` : "-"}`);
  }
  const ignoreFiles: IgnoreFileText[] = entries.filter((entry) => !entry.folder && path.posix.basename(entry.path) === ".gitignore")
    .map((entry) => ({ path: entry.path, text: fs.readFileSync(path.join(root, entry.path), "utf8") }));
  const decide = leaveOut({ ignoreFiles, gitIgnoreCase: ignoreCase });
  const ours = entries.map((entry) => {
    const verdict = entry.folder ? decide.folder(entry.path) : decide.file(entry.path);
    const rule = verdict.rule?.kind === "gitignore" ? `${verdict.rule.file}:${verdict.rule.line}` : "-";
    return `${entry.path}  ${verdict.kept ? "kept" : "ignored"}  ${rule}`;
  });
  return { git: gitWords.sort(), ours: ours.sort() };
}

/** The named cases: each a shape of git's rules. */
const CASES: Record<string, Tree> = {
  "nested files, a deeper file's opinion beating its parent's": {
    files: ["a.log", "sub/keep.log", "sub/x.log", "sub/deeper/keep.log", "other/keep.log"],
    ignores: { ".gitignore": "*.log\n", "sub/.gitignore": "!keep.log\n" }
  },
  "negation, and the last matching line winning": {
    files: ["a.txt", "keep.txt", "b.txt", "late.txt"],
    ignores: { ".gitignore": "*.txt\n!keep.txt\n!late.txt\nlate.txt\n" }
  },
  "anchored and unanchored patterns": {
    files: ["top.txt", "a/top.txt", "mid/name.txt", "x/mid/name.txt", "name.txt", "deep/er/name.txt", "a/b/c.txt", "b/c.txt"],
    ignores: { ".gitignore": "/top.txt\nmid/name.txt\nname.txt\na/b/c.txt\n" }
  },
  "a trailing slash matching folders only": {
    files: ["build", "out/build/x.o", "lib/build/", "dist/a.js", "dist2"],
    ignores: { ".gitignore": "build/\ndist/\ndist2/\n" }
  },
  "double stars": {
    files: ["logs/a.txt", "x/logs/b.txt", "x/y/logs", "a/b", "a/x/b", "a/x/y/b", "q/x/r/s.t", "a1b", "a/1/b2", "abc/def", "zz"],
    ignores: { ".gitignore": "**/logs\na/**/b\n**/x/**\na**b\nabc/**\n***z\n" }
  },
  "character classes": {
    files: ["a.c", "b.c", "d.c", "ax.h", "dx.h", "1st.txt", "x1.txt", "]x", "-z", "az", "bz", "[ab", "a"],
    ignores: { ".gitignore": "[abc].c\n[!a]x.h\n[[:digit:]]*.txt\n[]]x\n[a-]z\n[ab\n" }
  },
  "a negated class with a caret, and a range": {
    files: ["a.o", "b.o", "m.o", "z.o", "Q.o"],
    ignores: { ".gitignore": "[^a].o\n!m.o\n[l-n].o\n" }
  },
  "escapes, comments and trailing spaces": {
    files: ["#hash", "!bang", "trail ", "trail", "*star", "star", "  #lead", "sp ace"],
    ignores: { ".gitignore": "# a comment\n\\#hash\n\\!bang\ntrail\\ \n\\*star\n  #lead\nsp ace   \n" }
  },
  "a folder named, and a ! beneath it that cannot re-include": {
    files: ["build/keep.txt", "build/x.o", "build/sub/keep.txt", "gen/keep.txt", "gen/x.o"],
    ignores: { ".gitignore": "build/\n!build/keep.txt\ngen/*\n!gen/keep.txt\n" }
  },
  "a .gitignore inside an ignored folder, never read": {
    files: ["vendor/a.js", "vendor/keep.js", "vendor/inner/b.js"],
    ignores: { ".gitignore": "vendor/\n", "vendor/.gitignore": "!*\n", "vendor/inner/.gitignore": "!b.js\n" }
  },
  "carriage returns, a byte-order mark and blank lines": {
    files: ["a.tmp", "b.bak", "c.keep"],
    ignores: { ".gitignore": "﻿*.tmp\r\n\r\n*.bak\r\n" }
  },
  "a nested file's anchored pattern": {
    files: ["sub/docs/a.md", "sub/x/docs/b.md", "docs/c.md", "sub/docs/deep/d.md"],
    ignores: { "sub/.gitignore": "docs/*.md\n/x/\n" }
  },
  "one star stopping at a slash": {
    files: ["a/x.c", "a/b/x.c", "qr", "q/r/s", "p/q", "pxq", "s/t/u", "s/txu", "v/w/x", "v/wyx"],
    ignores: { ".gitignore": "a/*.c\np?q\nq/*\ns/t?u\nv/w[/y]x\n" }
  },
  "names that differ only in case": {
    files: ["Build/x", "build2/y", "README.MD", "readme.md"],
    ignores: { ".gitignore": "build/\nBUILD2\n*.md\n" }
  },
  "case folded as git folds it, an escaped letter and a class's members compared as written": {
    files: ["A.txt", "a.txt", "Bq", "bq", "Cx", "cx", "Dy", "dy", "Ez", "ez", "Logs/one", "src/Logs/two", "F/g/H"],
    ignores: { ".gitignore": "[A].txt\n\\Bq\n[A-C]x\n[[:upper:]]y\n[[:lower:]]z\nlogs/\nf/G/h\n" }
  },
  "a pattern with a dot folder and dot files": {
    files: [".env", ".config/a", "x/.cache/b", ".gitkeep"],
    ignores: { ".gitignore": ".*\n!.gitkeep\n!.gitignore\n" }
  }
};

describe("leaveOut's .gitignore half against git's own answer", () => {
  for (const [name, tree] of Object.entries(CASES)) {
    for (const ignoreCase of [false, true]) {
      it(`${name}, core.ignorecase=${ignoreCase}`, () => {
        const words = bothWords(tree, ignoreCase);
        expect(words.ours).toEqual(words.git);
      }, 30_000);
    }
  }

  // A generator of trees and patterns with a fixed seed: each case it finds that differs comes back as a named case.
  it("agrees with git on trees and patterns made at random from a fixed seed", () => {
    let seed = 20261121;
    const random = (n: number): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed % n;
    };
    const names = ["a", "b", "ab", "x.c", "y.h", "log", "Log", "build", "Build", ".hid", "k.txt", "K.TXT", "1"];
    const tokens = ["a", "b", "x", "*", "?", "**", "/", ".c", ".h", "[ab]", "[!a]", "build", "BUILD", "log", ".txt", "k", "K", "!", "[A-Z]"];
    const disagreements: string[] = [];
    for (let round = 0; round < 60; round++) {
      const files = new Set<string>();
      for (let i = 0; i < 12; i++) {
        const depth = 1 + random(3);
        files.add(Array.from({ length: depth }, () => names[random(names.length)]).join("/"));
      }
      // A path that is both a file and a folder's ancestor cannot be made; keep the folders.
      const all = [...files];
      const kept = all.filter((file) => !all.some((other) => other.startsWith(`${file}/`)));
      const pattern = () => Array.from({ length: 1 + random(3) }, () => tokens[random(tokens.length)]).join("");
      const lines = Array.from({ length: 1 + random(4) }, pattern);
      const ignores: Record<string, string> = { ".gitignore": `${lines.join("\n")}\n` };
      const folder = kept.find((file) => file.includes("/"))?.split("/")[0];
      if (folder && random(2) === 0) ignores[`${folder}/.gitignore`] = `${pattern()}\n${pattern()}\n`;
      for (const ignoreCase of [false, true]) {
        const words = bothWords({ files: kept, ignores }, ignoreCase);
        if (JSON.stringify(words.ours) !== JSON.stringify(words.git)) disagreements.push(JSON.stringify({ ignoreCase, files: kept, ignores, git: words.git, ours: words.ours }));
      }
    }
    expect(disagreements).toEqual([]);
  }, 120_000);
});
