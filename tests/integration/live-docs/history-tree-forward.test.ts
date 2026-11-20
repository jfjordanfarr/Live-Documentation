/**
 * A tree brought forward from one change to another, held to the tree written anew for the other as the oracle: file
 * for file, byte for byte, mode for mode, folder for folder, with nothing extra, and the same entries left out. Over
 * the sample workspaces of the integration tests, committed in turn into one repository so that each step changes the
 * tree whole, the generator run over each tree before it is brought forward as a worker of the history runs it; over
 * small edits of one sample, each a kind of entry changing (a file's bytes, its mode, a file added, removed, renamed,
 * become a folder and back, two names differing by case, a link made, retargeted and led nowhere, an excluded picture
 * written empty, a committed doc added); and over this repository's own commits, near and far apart, forward and back.
 * The rule of bringing a tree forward rests on this (`bringTreeForward` in `git.ts`; the record of 2026-11-20,
 * `Probes/history-rebuild-fast`).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig, parseLiveDocumentationConfigBytes, DEFAULT_LIVE_DOCUMENTATION_CONFIG, type LiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { openGitRepository, writeStoredTree } from "../../../packages/engine/src/live-docs/history/git";
import type { WorkingTree } from "../../../packages/engine/src/live-docs/history/versionControl";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { treeOptions } from "../../../packages/generator/src/history/summarizeChange";
import { FIXTURE_GIT_ENV } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "lf-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

const quiet = { info: (): undefined => undefined, warn: (): undefined => undefined, error: (): undefined => undefined };
const now = (): Date => new Date(0);

/** Every entry under a folder, by its path relative to it: a folder, or a file with its executable bit and the hash of its bytes. */
function snapshot(folder: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const entry of fs.readdirSync(folder, { recursive: true, withFileTypes: true })) {
    const file = path.join(entry.parentPath, entry.name);
    const relative = path.relative(folder, file).split(path.sep).join("/");
    if (entry.isDirectory()) found.set(relative, "folder");
    else if (entry.isFile()) found.set(relative, `file ${(fs.statSync(file).mode & 0o111) !== 0 ? "executable" : "plain"} ${createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`);
    else found.set(relative, "other");
  }
  return found;
}

/** The tree written anew for a change, as the oracle: what stands, and what was left out. */
async function writtenAnew(repository: string, change: string, configuration: LiveDocumentationConfig): Promise<{ entries: Map<string, string>; unwritten: unknown[] }> {
  const directory = path.join(fs.mkdtempSync(path.join(privateTemporary, "anew-")), "tree");
  fs.mkdirSync(directory);
  // The git directory as the command finds it: in a linked worktree, as this repository's checkout may be, `.git` is a file.
  const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
  const unwritten = await writeStoredTree(store, change, directory, treeOptions(configuration, directory));
  const entries = snapshot(directory);
  fs.rmSync(path.dirname(directory), { recursive: true, force: true });
  return { entries, unwritten };
}

/** Brings a tree along the changes, each brought tree held to the one written anew, with `between` run over each tree before the next. */
async function holdAlong(repository: string, changes: readonly string[], configuration: LiveDocumentationConfig, between: (tree: WorkingTree) => Promise<void>): Promise<{ forward: number; clashes: number }> {
  const versionControl = await openGitRepository(repository);
  const folder = fs.mkdtempSync(path.join(privateTemporary, "along-"));
  let forward = 0;
  // The changes whose tree written anew meets a name this disk takes for another's (on Windows and macOS, `A.ts` beside
  // `a.ts`), where a tree is rightly not brought forward: the counts hold on a disk that folds case and on one that does not.
  let clashes = 0;
  const left: string[] = [];
  const directory = path.join(folder, "tree00");
  let tree = await versionControl.workingTree(changes[0], directory, treeOptions(configuration, directory));
  try {
    for (let index = 1; index < changes.length; index += 1) {
      await between(tree);
      const before = tree.root;
      tree = await tree.bringTo(changes[index], treeOptions(configuration, tree.root));
      if (tree.broughtForward) forward += 1;
      const oracle = await writtenAnew(repository, changes[index], configuration);
      if ((oracle.unwritten as Array<{ reason: string }>).some((entry) => entry.reason.includes("on this disk, which takes the two names for one"))) clashes += 1;
      const brought = snapshot(tree.root);
      const label = `${changes[index - 1].slice(0, 8)} -> ${changes[index].slice(0, 8)}`;
      expect([...brought.keys()].filter((entry) => !oracle.entries.has(entry)), `${label}: entries the brought tree holds and the new one does not`).toEqual([]);
      expect([...oracle.entries.keys()].filter((entry) => !brought.has(entry)), `${label}: entries the new tree holds and the brought one does not`).toEqual([]);
      for (const [entry, value] of oracle.entries) expect(brought.get(entry), `${label}: ${entry}`).toBe(value);
      expect(tree.unwritten, `${label}: the entries left out`).toEqual(oracle.unwritten);
      // A tree brought forward stays in its folder; one written anew stands in a fresh folder of a name as long, the one
      // that could not be put right left beside it for the worker's end. Nothing else stands there but the tree's index.
      const name = path.basename(tree.root);
      if (tree.broughtForward) {
        expect(tree.root, `${label}: the tree's folder`).toBe(before);
      } else {
        expect(name, `${label}: the fresh folder's name`).toHaveLength(path.basename(before).length);
        left.push(path.basename(before));
      }
      expect(fs.readdirSync(folder).sort(), `${label}: the folder holding the trees`).toEqual([name, `${name}.index`, ...left].sort());
    }
  } finally {
    await tree.remove();
    fs.rmSync(folder, { recursive: true, force: true });
  }
  return { forward, clashes };
}

function git(repository: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repository, env: FIXTURE_GIT_ENV, encoding: "utf8", maxBuffer: 1 << 28 }).trim();
}

function commitAll(repository: string, message: string): string {
  git(repository, ["add", "--all", "--force"]);
  git(repository, ["commit", "--quiet", "--allow-empty", "-m", message]);
  return git(repository, ["rev-parse", "HEAD"]);
}

/** Every sample workspace, as `history-tree-equivalence.test.ts` takes them: each folder of the fixtures and each program, as git tracks them. */
function workspaces(): string[] {
  const tracked = execFileSync("git", ["ls-files", "-z", "--", "tests/integration/fixtures", "tests/integration/programs"], { cwd: repoRoot, encoding: "utf8" })
    .split("\0")
    .filter(Boolean)
    .map((file) => file.split("/").slice(2));
  const samples = new Set<string>();
  for (const parts of tracked) {
    const depth = parts[0] === "fixtures" ? 2 : 3;
    if (parts.length > depth) samples.add(path.join(...parts.slice(0, depth)));
  }
  return [...samples].sort();
}

/** Empties a repository's working folder but its `.git`. */
function emptied(repository: string): void {
  for (const entry of fs.readdirSync(repository)) if (entry !== ".git") fs.rmSync(path.join(repository, entry), { recursive: true, force: true });
}

describe("a tree brought forward from one change to another, against the tree written anew", () => {
  it("equals the new tree at every step through every sample workspace in turn, the generator run over each before", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "samples-"));
    git(repository, ["init", "--quiet", "-b", "main"]);
    const changes: string[] = [];
    const samples = workspaces();
    expect(samples.length).toBeGreaterThan(40);
    for (const workspace of samples) {
      emptied(repository);
      // Each sample as git tracks it, so that a leftover folder on this disk is no part of it.
      const files = execFileSync("git", ["ls-files", "-z", "--", path.join("tests", "integration", workspace)], { cwd: repoRoot, encoding: "utf8" }).split("\0").filter(Boolean);
      for (const file of files) {
        const target = path.join(repository, path.relative(path.join("tests", "integration", workspace), file));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(path.join(repoRoot, file), target, { verbatimSymlinks: true });
      }
      changes.push(commitAll(repository, workspace));
    }
    // One configuration for the line, as the history applies the lens's to every change: the defaults, a picture excluded.
    const configuration = normalizeLiveDocumentationConfig({ exclude: ["**/*.png"] });
    const { forward, clashes } = await holdAlong(repository, changes, configuration, async (tree) => {
      await generateLiveDocs({ workspaceRoot: tree.root, config: configuration, keepAuthoredStaleDocs: false, logger: quiet, now });
    });
    // The rule is exercised, not passed by writing every tree anew.
    expect(forward).toBe(changes.length - 1 - clashes);
  }, 600_000);

  it("equals the new tree through each kind of small change", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "edits-"));
    git(repository, ["init", "--quiet", "-b", "main"]);
    const write = (file: string, text: string): void => {
      fs.mkdirSync(path.dirname(path.join(repository, file)), { recursive: true });
      fs.writeFileSync(path.join(repository, file), text);
    };
    write("src/a.ts", "export const a = 1;\n");
    write("src/b.ts", "export const b = 1;\n");
    write("src/deep/c.ts", "export const c = 1;\n");
    write("assets/logo.png", "a picture");
    write("tool.sh", "#!/bin/sh\n");
    write(".mdmd/layer-1/notes.md", "# Notes\n");
    const changes = [commitAll(repository, "start")];
    const byMessage = new Map<string, string>();
    const step = (message: string, edit: () => void): void => {
      edit();
      changes.push(commitAll(repository, message));
      byMessage.set(message, changes.at(-1)!);
    };
    step("a file's bytes", () => write("src/a.ts", "export const a = 2;\n"));
    step("a file's mode", () => fs.chmodSync(path.join(repository, "tool.sh"), 0o755));
    step("a file added", () => write("src/added.ts", "export const added = 1;\n"));
    step("a file renamed", () => fs.renameSync(path.join(repository, "src", "added.ts"), path.join(repository, "src", "renamed.ts")));
    step("a file removed, its folder emptied with it", () => fs.rmSync(path.join(repository, "src", "deep"), { recursive: true }));
    step("a file become a folder", () => {
      fs.rmSync(path.join(repository, "src", "b.ts"));
      write("src/b.ts/inner.ts", "export const inner = 1;\n");
    });
    step("a folder become a file", () => {
      fs.rmSync(path.join(repository, "src", "b.ts"), { recursive: true });
      write("src/b.ts", "export const b = 2;\n");
    });
    step("a name beside one differing by case", () => write("src/A.ts", "export const A = 1;\n"));
    step("the first of the two removed", () => fs.rmSync(path.join(repository, "src", "a.ts")));
    step("a link to a file", () => fs.symlinkSync("A.ts", path.join(repository, "src", "link.ts")));
    step("the file the link leads to", () => write("src/A.ts", "export const A = 3;\n"));
    step("the link retargeted", () => {
      fs.rmSync(path.join(repository, "src", "link.ts"));
      fs.symlinkSync("b.ts", path.join(repository, "src", "link.ts"));
    });
    step("the link led nowhere", () => {
      fs.rmSync(path.join(repository, "src", "link.ts"));
      fs.symlinkSync("gone.ts", path.join(repository, "src", "link.ts"));
    });
    step("an excluded picture changed", () => write("assets/logo.png", "another picture"));
    step("a doc of the mirror committed", () => write(".mdmd/layer-4/src/b.ts.mdmd.md", "# b\n"));
    step("an executable made plain again", () => fs.chmodSync(path.join(repository, "tool.sh"), 0o644));
    step("a link to a folder, which the plan refuses", () => {
      write("src/shared/util.ts", "export const util = 1;\n");
      fs.symlinkSync("shared", path.join(repository, "src", "folder-link"));
    });
    step("the link to a folder removed", () => fs.rmSync(path.join(repository, "src", "folder-link")));
    // A name that is not UTF-8, which the plan refuses, is the one refused name this disk can hold; git itself refuses
    // a `.git` part in its index, so that one is held by `git.test.ts`'s trees made by hand.
    const notUtf8 = Buffer.concat([Buffer.from(path.join(repository, "src")), Buffer.from([0x2f, 0x6e, 0xff, 0x2e, 0x74, 0x73])]);
    step("a name that is not UTF-8 appears", () => fs.writeFileSync(notUtf8, "export const n = 1;\n"));
    step("and goes", () => fs.rmSync(notUtf8));
    // A submodule's link: an empty folder, as a checkout leaves one it has not initialized.
    const gitlink = (id: string): void => {
      fs.mkdirSync(path.join(repository, "vendor", "sub"), { recursive: true });
      git(repository, ["update-index", "--add", "--cacheinfo", `160000,${id},vendor/sub`]);
    };
    step("a submodule's link added", () => gitlink("1".repeat(40)));
    step("the submodule's link changed", () => gitlink("2".repeat(40)));
    step("the submodule's link become a folder", () => {
      git(repository, ["rm", "--cached", "--quiet", "vendor/sub"]);
      write("vendor/sub/inner.ts", "export const inner = 2;\n");
    });
    step("and a link again", () => {
      fs.rmSync(path.join(repository, "vendor", "sub"), { recursive: true });
      git(repository, ["rm", "--cached", "--quiet", "-r", "vendor/sub"]);
      gitlink("2".repeat(40));
    });
    step("the submodule's link removed", () => {
      git(repository, ["rm", "--cached", "--quiet", "vendor/sub"]);
      fs.rmSync(path.join(repository, "vendor"), { recursive: true });
    });
    step("nothing", () => undefined);
    // The docs root named, since the generator's writes below stand in for it there (the default root is another).
    const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", exclude: ["assets/**"] });
    // Each step is held to the tree written anew in `holdAlong`; that the steps hold what they say is held here.
    const listing = (message: string): string => git(repository, ["ls-tree", "-r", byMessage.get(message)!]);
    expect(listing("the submodule's link changed")).toContain(`160000 commit ${"2".repeat(40)}\tvendor/sub`);
    expect(listing("a link to a folder, which the plan refuses")).toMatch(/^120000 blob \S+\tsrc\/folder-link$/mu);
    expect(listing("a name that is not UTF-8 appears")).toContain('\t"src/n\\377.ts"');
    expect(listing("and goes")).not.toContain("\\377");
    const { forward, clashes } = await holdAlong(repository, changes, configuration, async (tree) => {
      // What the generator does in the docs root: a doc written, one rewritten, one pruned, the index written.
      fs.mkdirSync(path.join(tree.root, ".mdmd", "layer-4", "src"), { recursive: true });
      fs.writeFileSync(path.join(tree.root, ".mdmd", "layer-4", "src", "b.ts.mdmd.md"), "# b, as the generator writes it\n");
      fs.writeFileSync(path.join(tree.root, ".mdmd", "layer-4", "src", "x.ts.mdmd.md"), "# x\n");
      fs.rmSync(path.join(tree.root, ".mdmd", "layer-1", "notes.md"), { force: true });
      fs.writeFileSync(path.join(tree.root, ".mdmd", "index.json"), "{}\n");
    });
    expect(forward).toBe(changes.length - 1 - clashes);
  }, 120_000);

  it("equals the new tree where the docs root lies in folders the change does not hold, which the generator made", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "nested-"));
    git(repository, ["init", "--quiet", "-b", "main"]);
    fs.mkdirSync(path.join(repository, "src"));
    fs.writeFileSync(path.join(repository, "src", "a.ts"), "export const a = 1;\n");
    const first = commitAll(repository, "a file");
    fs.writeFileSync(path.join(repository, "src", "a.ts"), "export const a = 2;\n");
    const second = commitAll(repository, "the file changed");
    const configuration = normalizeLiveDocumentationConfig({ root: "site/docs" });
    const { forward, clashes } = await holdAlong(repository, [first, second, first], configuration, async (tree) => {
      fs.mkdirSync(path.join(tree.root, "site", "docs", "layer-4"), { recursive: true });
      fs.writeFileSync(path.join(tree.root, "site", "docs", "index.json"), "{}\n");
    });
    expect(forward).toBe(2 - clashes);
  }, 60_000);

  it("is written anew where the generator left something outside the docs root, and equals the new tree", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "stray-"));
    git(repository, ["init", "--quiet", "-b", "main"]);
    fs.mkdirSync(path.join(repository, "src", "gone"), { recursive: true });
    fs.writeFileSync(path.join(repository, "src", "gone", "a.ts"), "export const a = 1;\n");
    const first = commitAll(repository, "a folder");
    fs.rmSync(path.join(repository, "src", "gone"), { recursive: true });
    fs.writeFileSync(path.join(repository, "src", "b.ts"), "export const b = 1;\n");
    const second = commitAll(repository, "the folder gone");
    fs.writeFileSync(path.join(repository, "src", "b.ts"), "export const b = 2;\n");
    const third = commitAll(repository, "a file changed");
    const configuration = normalizeLiveDocumentationConfig({});
    // A file no writer of the tree made, in a folder the next change no longer holds, then in one it keeps: bringing
    // forward gives up both times, the first when the folder will not go, the second when the names are counted.
    let step = 0;
    const { forward } = await holdAlong(repository, [first, second, third], configuration, async (tree) => {
      step += 1;
      fs.writeFileSync(path.join(tree.root, "src", ...(step === 1 ? ["gone", "stray.txt"] : ["stray.txt"])), "left behind\n");
    });
    expect(forward).toBe(0);
  }, 60_000);

  it("equals the new tree between this repository's own commits, near and far apart, forward and back", async () => {
    const line = git(repoRoot, ["rev-list", "--first-parent", "--reverse", "HEAD"]).split("\n");
    const input = parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(repoRoot, ".live-docs.config.json")));
    const configuration = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
    const head = line.length - 1;
    const changes = [line[head - 1], line[head], line[Math.min(100, head)], line[head - 2]];
    const { forward, clashes } = await holdAlong(repoRoot, changes, configuration, async (tree) => {
      // The docs root as the generator leaves it: docs rewritten and pruned, the index written.
      const root = path.join(tree.root, configuration.root);
      fs.mkdirSync(root, { recursive: true });
      fs.writeFileSync(path.join(root, "index.json"), "{}\n");
      fs.writeFileSync(path.join(root, "stray.mdmd.md"), "# stray\n");
    });
    expect(forward).toBe(changes.length - 1 - clashes);
  }, 300_000);
});
