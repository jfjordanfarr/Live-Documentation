/**
 * Discovery held to git itself, over small repositories made at random from a seed. The oracle is not the listing
 * discovery reads (`git ls-files --others --ignored --directory`) but another of git's own accounts, `git status
 * --porcelain -z --ignored -uall`, which names every ignored file one by one: with the default glob and no `exclude`,
 * the files discovery documents are exactly the files on the disk, read by a plain walk of the folders, less what
 * status calls ignored and less the documents, and the documents it finds are exactly the documents on the disk less
 * what status calls ignored. A failure names its seed, and `ORACLE_SEED=<n>` runs that seed alone.
 *
 * What the repositories hold: tracked and untracked files, `.gitignore` files at every depth with negations,
 * `.git/info/exclude`, folders ignored whole and in part, names with `[ ] * ? \`, spaces and other alphabets, beside
 * each wildcard name the plain name it matches as a pattern (tracked more often than not), top-level names beginning
 * with `:` (`:abc`, `:(x)`, `:!y`), files force-added under ignored folders, a tracked file gone from the disk, case
 * twins with `core.ignorecase` true and false (made only where the disk tells case apart), patterns that name a
 * folder's contents but not the folder, folder negations, and a slash or `**` inside a pattern; and, made on purpose
 * since random names never make them, a tracked `.gitignore` marked skip-worktree and deleted, a file in the place of
 * a tracked folder, and a tracked folder whose case differs on the disk where `core.ignorecase` is true. Nested
 * repositories have a property of their own: a submodule, a plain nested repository and one whose `.git` is a file,
 * each judged by its own status, the outer status deciding only whether its folder is ignored; and beside them two
 * folders that hold a `.git` and are the outer repository's own, as git has them, judged by the outer status: one
 * below which the outer index holds a tracked or an intent-to-add entry, and one whose `.git` names no repository.
 *
 * What the main property cannot see: the folders git ignores whole are left unread, so a file below one never reaches
 * the judging, and with folders in the listing never judged it still passes all thirty seeds. The nested property
 * catches that, in six of its fifteen, as do the written cases of links, of nested repositories inside ignored
 * folders and of a folder made during the walk.
 *
 * The deviations from git that are known and remain, left out of the repositories made here: a case twin of a tracked
 * file where `core.ignorecase` is true, which git takes for the tracked file itself while discovery documents both
 * names, as the disk holds both; a folder `.GIT` in another case, which git takes for its store where
 * `core.ignorecase` is true and discovery walks; and the files beyond a link to a folder, whose links git judges and
 * whose contents git never sees (held by their own cases in `discovery.test.ts` and `gitIgnored.test.ts`). The record
 * of 2026-11-20 under `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/` says why.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
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

/** Whether this disk tells apart two names that differ in case alone, as Linux's do and Windows' and macOS's do not. */
const diskTellsCaseApart = ((): boolean => {
  const probe = mkdtempSync(path.join(os.tmpdir(), "case-probe-"));
  writeFileSync(path.join(probe, "a"), "");
  const apart = !existsSync(path.join(probe, "A"));
  rmSync(probe, { recursive: true, force: true });
  return apart;
})();

// Names that differ in case alone (`Build` and `build`, `Out` and `out`) are made only where the disk tells case apart;
// on a disk that folds case, as Windows' and macOS's do, they would be one file.
const NAMES = ["a", "b", "a1", "a[1]", "[ab]", "b?", "bc", "a\\b", "ab", "a*", "x y", "café", ...(diskTellsCaseApart ? ["Build", "Out"] : []), "build", "out", "deep", "keep", "ж"];
const TOP_NAMES = [":abc", ":(x)", ":!y"];
const SUFFIXES = [".ts", ".log", ".tmp", ".md", ".txt", ""];
const PATTERNS = ["build/", "*.log", "!keep.log", "out/", "a*", "/a1", "*.tmp", "!b.tmp", "x y/", "café", "Build/", "**/deep", "[ab]1/", "a\\[1\\]", "b?", "!a.ts", "*.md", "!*.md", "deep/", "/out", "*", "!b", "\\*", "/:*", "!/:abc.ts", "build/*", "!build/", "!deep/", "deep/*.ts", "a/**/b", "a/b", "out/**"];

function git(root: string, ...args: string[]): string {
  return execFileSync("git", ["-C", root, "-c", "user.email=test@example.com", "-c", "user.name=test", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

/** Every file on the disk under `root`, by a plain walk that enters no `.git` and follows no link, workspace-relative. */
function onDisk(root: string, under = ""): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(path.join(root, under), { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const relative = under === "" ? entry.name : `${under}/${entry.name}`;
    if (entry.isDirectory()) found.push(...onDisk(root, relative));
    else found.push(relative);
  }
  return found;
}

/** What `git status --porcelain -z --ignored -uall` calls ignored in `root`: files, and the folders it names whole (with `/`). */
function ignoredByStatus(root: string): string[] {
  return git(root, "status", "--porcelain", "-z", "--ignored", "-uall").split("\0").filter((entry) => entry.startsWith("!! ")).map((entry) => entry.slice(3));
}

const ignoredBy = (entries: readonly string[], relative: string): boolean => entries.some((entry) => entry === relative || (entry.endsWith("/") && relative.startsWith(entry)));

/** Random files, excludes and tracked files in the repository at `root`, made from `next`. */
function fill(root: string, next: () => number, top: boolean): void {
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  const ignoreCase = next() < 0.5;
  git(root, "config", "core.ignorecase", String(ignoreCase));
  git(root, "config", "core.autocrlf", "false");

  const files = new Set<string>();
  const folderSet = new Set<string>([""]);
  const add = (parts: string[]): void => {
    const file = parts.join("/");
    const prefixes = parts.map((_part, index) => parts.slice(0, index + 1).join("/"));
    // A path whose folder is a file already, or a file that is a folder already, cannot be made.
    if (prefixes.slice(0, -1).some((prefix) => files.has(prefix)) || folderSet.has(file) || files.has(file)) return;
    files.add(file);
    for (const prefix of prefixes.slice(0, -1)) folderSet.add(prefix);
  };
  for (let count = 4 + Math.floor(next() * 16); count > 0; count -= 1) {
    const depth = 1 + Math.floor(next() * 3);
    const parts = Array.from({ length: depth - 1 }, () => pick(NAMES));
    parts.push(`${pick(NAMES)}${pick(SUFFIXES)}`);
    add(parts);
  }
  // Names a pathspec reads as magic, at the top alone, where it would be read so.
  if (top) for (const name of TOP_NAMES) if (next() < 0.4) add([`${name}${pick(SUFFIXES)}`]);
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
  const gitignores: string[] = [];
  for (const folder of folderSet) {
    if (next() < 0.35) {
      const lines = Array.from({ length: 1 + Math.floor(next() * 3) }, () => pick(PATTERNS));
      writeFileSync(path.join(root, folder, ".gitignore"), `${lines.join("\n")}\n`);
      const file = folder === "" ? ".gitignore" : `${folder}/.gitignore`;
      files.add(file);
      gitignores.push(file);
    }
  }
  if (next() < 0.5) appendFileSync(path.join(git(root, "rev-parse", "--absolute-git-dir").trim(), "info", "exclude"), `${pick(PATTERNS)}\n`);

  // Where git matches without regard to case, a case twin of a tracked path is the tracked path to git: none is tracked.
  const lowered = new Map<string, Set<string>>();
  for (const prefix of [...files, ...folderSet]) lowered.set(prefix.toLowerCase(), (lowered.get(prefix.toLowerCase()) ?? new Set()).add(prefix));
  const twin = (file: string): boolean => file.split("/").some((_part, index, parts) => (lowered.get(parts.slice(0, index + 1).join("/").toLowerCase())?.size ?? 0) > 1);
  const tracked = [...files].filter((file) => (plainer.has(file) || gitignores.includes(file) || next() < 0.3) && !(ignoreCase && twin(file)));
  // Named literally, so that adding `a[1].log` adds no `a1.log` beside it.
  if (tracked.length > 0) git(root, "--literal-pathspecs", "add", "-f", "--", ...tracked);
  if (tracked.length > 0 && next() < 0.3) unlinkSync(path.join(root, pick(tracked)));

  // A tracked `.gitignore` marked skip-worktree and gone from the disk: git still reads it, from the index.
  const hidden = gitignores.filter((file) => tracked.includes(file));
  if (hidden.length > 0 && next() < 0.4) {
    const file = pick(hidden);
    git(root, "--literal-pathspecs", "update-index", "--skip-worktree", "--", file);
    rmSync(path.join(root, file), { force: true });
  }
  // A file in the place of a tracked folder.
  const deepTracked = tracked.filter((file) => file.includes("/") && !twin(file));
  if (deepTracked.length > 0 && next() < 0.4) {
    const folder = pick(deepTracked).split("/")[0];
    rmSync(path.join(root, folder), { recursive: true, force: true });
    writeFileSync(path.join(root, folder), "x\n");
  }
  // A tracked folder whose case differs on the disk, as Windows allows a rename of case alone.
  const renamable = tracked.filter((file) => file.includes("/") && !twin(file) && file.split("/")[0].toLowerCase() !== file.split("/")[0].toUpperCase());
  if (ignoreCase && renamable.length > 0 && next() < 0.5) {
    const folder = pick(renamable).split("/")[0];
    const other = folder === folder.toLowerCase() ? folder.toUpperCase() : folder.toLowerCase();
    try {
      renameSync(path.join(root, folder), path.join(root, other));
    } catch {
      // The folder was replaced by a file above.
    }
  }
}

const documented = async (root: string): Promise<{ files: string[]; documents: string[] }> => {
  const config = normalizeLiveDocumentationConfig({});
  const files = (await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false })).map((file) => path.relative(root, file).split(path.sep).join("/"));
  return { files: files.sort(), documents: await discoverDocuments({ workspaceRoot: root, config }) };
};

const split = (kept: string[]): { files: string[]; documents: string[] } => ({ files: kept.filter((file) => !file.endsWith(".md")).sort(), documents: kept.filter((file) => file.endsWith(".md")).sort() });

const seeds = process.env.ORACLE_SEED !== undefined ? [Number(process.env.ORACLE_SEED)] : Array.from({ length: 30 }, (_seed, index) => index + 1);

describe("discovery against git status, over random repositories", () => {
  it.each(seeds)("documents exactly the files on the disk that status does not call ignored, less the documents, and finds exactly such documents: seed %i", async (seed) => {
    const root = mkdtempSync(path.join(os.tmpdir(), "discovery-oracle-"));
    folders.push(root);
    git(root, "init", "-q");
    fill(root, random(seed), true);
    const ignored = ignoredByStatus(root);
    expect(await documented(root), `seed ${seed}`).toEqual(split(onDisk(root).filter((file) => !ignoredBy(ignored, file))));
  });

  it.each(seeds.slice(0, 15))("judges each nested repository's files by its own status, and the outer's decides only whether its folder is ignored: seed %i", async (seed) => {
    const next = random(seed * 7919);
    const root = mkdtempSync(path.join(os.tmpdir(), "discovery-oracle-nested-"));
    folders.push(root);
    git(root, "init", "-q");
    fill(root, next, true);
    // A submodule (a nested repository with a commit, added to the outer index as a gitlink) and a plain nested one.
    const nested = ["n1", next() < 0.5 || !statSync(path.join(root, "deep"), { throwIfNoEntry: false })?.isDirectory() ? "n2" : "deep/n2"];
    for (const [index, folder] of nested.entries()) {
      rmSync(path.join(root, folder), { recursive: true, force: true });
      mkdirSync(path.join(root, folder), { recursive: true });
      git(path.join(root, folder), "init", "-q");
      fill(path.join(root, folder), next, false);
      if (index === 0) {
        git(path.join(root, folder), "commit", "-q", "--allow-empty", "-m", "nested");
        git(root, "add", "-f", folder);
      }
    }
    // A nested repository whose `.git` is a file naming its store elsewhere, the form a submodule and a linked worktree take.
    const store = mkdtempSync(path.join(os.tmpdir(), "discovery-oracle-store-"));
    folders.push(store);
    rmSync(path.join(root, "n3"), { recursive: true, force: true });
    git(root, "init", "-q", "--separate-git-dir", path.join(store, "n3.git"), "n3");
    fill(path.join(root, "n3"), next, false);
    nested.push("n3");
    // Folders that hold a `.git` and are the outer repository's own all the same, as git has them, judged by the outer
    // status: one below which the outer index holds a tracked or an intent-to-add entry, and one whose `.git` names no
    // repository.
    for (const folder of ["o1", "b1"]) {
      rmSync(path.join(root, folder), { recursive: true, force: true });
      for (const name of ["t.ts", "u.log", "v.tmp", "w.md"]) {
        mkdirSync(path.join(root, folder, "sub"), { recursive: true });
        writeFileSync(path.join(root, folder, next() < 0.5 ? name : `sub/${name}`), "x\n");
      }
    }
    git(root, "add", "-f", ...(next() < 0.5 ? [] : ["-N"]), "--", ...onDisk(root, "o1").slice(0, 1));
    git(path.join(root, "o1"), "init", "-q");
    appendFileSync(path.join(root, "o1", ".git", "info", "exclude"), "*.ts\n*.md\n");
    writeFileSync(path.join(root, "b1", ".git"), "gitdir: nowhere\n");
    const outer = ignoredByStatus(root);
    const inner = new Map(nested.map((folder) => [folder, ignoredByStatus(path.join(root, folder))]));
    const kept = onDisk(root).filter((file) => {
      const folder = nested.find((candidate) => file.startsWith(`${candidate}/`));
      if (folder === undefined) return !ignoredBy(outer, file);
      return !ignoredBy(outer, `${folder}/`) && !ignoredBy(outer, folder) && !ignoredBy(inner.get(folder) ?? [], file.slice(folder.length + 1));
    });
    expect(await documented(root), `seed ${seed}`).toEqual(split(kept));
  });
});
