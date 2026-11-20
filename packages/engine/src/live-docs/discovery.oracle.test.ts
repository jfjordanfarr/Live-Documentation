/**
 * Discovery held to git itself, over small repositories made at random from a seed: with the default glob and no
 * `exclude`, the files discovery documents are exactly what `git ls-files --cached --others --exclude-standard` lists,
 * less the documents and less what is not on the disk, and the documents it finds are exactly the documents git lists.
 * Nothing here asks discovery's own helpers: git is the oracle. A failure names its seed, and `ORACLE_SEED=<n>` runs
 * that seed alone.
 *
 * What the repositories hold: tracked and untracked files, `.gitignore` files at every depth with negations,
 * `.git/info/exclude`, folders ignored whole and in part, names with `[ ] * ? \`, spaces and other alphabets, files
 * force-added under ignored folders, a tracked file gone from the disk, and case twins, with `core.ignorecase` true
 * and false. Left out, since git lists no file of theirs one by one and the comparison would not hold by design: a
 * submodule, a nested repository, a link to a folder (each held by its own case in `discovery.test.ts` and
 * `gitIgnored.test.ts`); a case twin of a tracked file where `core.ignorecase` is true, which git takes for the
 * tracked file itself; and a folder `.GIT` in another case (the record of 2026-11-20 says why).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync, appendFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { discoverDocuments, discoverTargetFiles } from "./discovery";

const folders: string[] = [];
afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

/** A small deterministic generator of numbers in [0, 1) from a seed (mulberry32). */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ["a", "b", "a1", "a[1]", "[ab]", "b?", "bc", "a\\b", "ab", "a*", "x y", "café", "Build", "build", "out", "Out", "deep", "keep", "ж"];
const SUFFIXES = [".ts", ".log", ".tmp", ".md", ".txt", ""];
const PATTERNS = ["build/", "*.log", "!keep.log", "out/", "a*", "/a1", "*.tmp", "!b.tmp", "x y/", "café", "Build/", "**/deep", "[ab]1/", "a\\[1\\]", "b?", "!a.ts", "*.md", "!*.md", "deep/", "/out", "*", "!b", "\\*"];

function git(root: string, ...args: string[]): string {
  return execFileSync("git", ["-C", root, "-c", "user.email=test@example.com", "-c", "user.name=test", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

/** A repository made from `seed`, and what git lists in it. */
function repositoryFrom(seed: number): { root: string; listed: string[] } {
  const next = random(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  const root = mkdtempSync(path.join(os.tmpdir(), "discovery-oracle-"));
  folders.push(root);
  git(root, "init", "-q");
  const ignoreCase = next() < 0.5;
  git(root, "config", "core.ignorecase", String(ignoreCase));
  git(root, "config", "core.autocrlf", "false");

  const files = new Set<string>();
  const folderSet = new Set<string>([""]);
  for (let count = 4 + Math.floor(next() * 16); count > 0; count -= 1) {
    const depth = 1 + Math.floor(next() * 3);
    const parts = Array.from({ length: depth - 1 }, () => pick(NAMES));
    parts.push(`${pick(NAMES)}${pick(SUFFIXES)}`);
    const file = parts.join("/");
    const prefixes = parts.map((_part, index) => parts.slice(0, index + 1).join("/"));
    // A path whose folder is a file already, or a file that is a folder already, cannot be made.
    if (prefixes.slice(0, -1).some((prefix) => files.has(prefix)) || folderSet.has(file)) continue;
    files.add(file);
    for (const prefix of prefixes.slice(0, -1)) folderSet.add(prefix);
  }
  // Beside a name with a wildcard, the plain name it matches as a pattern, tracked more often than not: asked as a
  // pathspec, the wildcard name was taken for the tracked file and kept though git ignores it (the review of 2026-11-20).
  const plainer = new Set<string>();
  for (const file of [...files]) {
    const plain = file.split("/").map((part) => part.replace(/^a\[1\]/u, "a1").replace(/^\[ab\]/u, "a").replace(/^b\?/u, "bc").replace(/^a\\b/u, "ab").replace(/^a\*/u, "ab")).join("/");
    const prefixes = plain.split("/").map((_part, index, parts) => parts.slice(0, index + 1).join("/"));
    if (plain === file || files.has(plain) || folderSet.has(plain) || prefixes.slice(0, -1).some((prefix) => files.has(prefix))) continue;
    files.add(plain);
    for (const prefix of prefixes.slice(0, -1)) folderSet.add(prefix);
    if (next() < 0.7) plainer.add(plain);
  }
  for (const file of files) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), "x\n");
  }
  for (const folder of folderSet) {
    if (next() < 0.35) {
      const lines = Array.from({ length: 1 + Math.floor(next() * 3) }, () => pick(PATTERNS));
      writeFileSync(path.join(root, folder, ".gitignore"), `${lines.join("\n")}\n`);
      files.add(folder === "" ? ".gitignore" : `${folder}/.gitignore`);
    }
  }
  if (next() < 0.5) appendFileSync(path.join(root, ".git", "info", "exclude"), `${pick(PATTERNS)}\n`);

  // Where git matches without regard to case, a case twin of a tracked path is the tracked path to git: none is tracked.
  const lowered = new Map<string, Set<string>>();
  for (const prefix of [...files, ...folderSet]) lowered.set(prefix.toLowerCase(), (lowered.get(prefix.toLowerCase()) ?? new Set()).add(prefix));
  const twin = (file: string): boolean => file.split("/").some((_part, index, parts) => (lowered.get(parts.slice(0, index + 1).join("/").toLowerCase())?.size ?? 0) > 1);
  const tracked = [...files].filter((file) => (plainer.has(file) || next() < 0.3) && !(ignoreCase && twin(file)));
  // Named literally, so that adding `a[1].log` adds no `a1.log` beside it.
  if (tracked.length > 0) git(root, "--literal-pathspecs", "add", "-f", "--", ...tracked);
  if (tracked.length > 0 && next() < 0.3) unlinkSync(path.join(root, pick(tracked)));

  const listed = git(root, "ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0").filter((entry) => entry.length > 0);
  return { root, listed: [...new Set(listed)].filter((file) => existsSync(path.join(root, file))).sort() };
}

const seeds = process.env.ORACLE_SEED !== undefined ? [Number(process.env.ORACLE_SEED)] : Array.from({ length: 30 }, (_seed, index) => index + 1);

describe("discovery against git, over random repositories", () => {
  const config = normalizeLiveDocumentationConfig({});
  it.each(seeds)("documents exactly what git lists, less the documents and what is not on the disk, and finds exactly the documents git lists: seed %i", async (seed) => {
    const { root, listed } = repositoryFrom(seed);
    const files = (await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false })).map((file) => path.relative(root, file).split(path.sep).join("/"));
    const documents = await discoverDocuments({ workspaceRoot: root, config });
    expect([...files].sort(), `seed ${seed}`).toEqual(listed.filter((file) => !file.endsWith(".md")));
    expect(documents, `seed ${seed}`).toEqual(listed.filter((file) => file.endsWith(".md")));
  });
});
