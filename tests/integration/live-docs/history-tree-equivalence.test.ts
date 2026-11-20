/**
 * The history's tree against the whole tree, as the oracle: over every sample workspace of the integration tests,
 * which between them hold every adapter's kind of reference, each top-level folder is excluded in turn, and the docs
 * the generator writes over the tree the history writes (every name standing, an excluded image, font or recording
 * written empty) must equal, byte for byte, the docs it writes over the whole tree under the same configuration. The
 * rule that such a file may be empty rests on this (the coordinator's ruling of 2026-11-19, after an
 * independent review found that leaving such files out changed what included code depends on).
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig, type LiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { writeStoredTree } from "../../../packages/engine/src/live-docs/history/git";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { treeOptions } from "../../../packages/generator/src/history/summarizeChange";
import { FIXTURE_GIT_ENV } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "le-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

/**
 * Every sample workspace: each folder of the fixtures, and each program of each language, as git tracks them. Until
 * 2026-11-20 they were listed from the folders on disk, so an empty folder left beside the samples, which git keeps
 * nothing of, made a case that failed at `git commit` with nothing to commit.
 */
function workspaces(): string[] {
  const tracked = execFileSync("git", ["ls-files", "-z", "--", "tests/integration/fixtures", "tests/integration/programs"], { cwd: repoRoot, encoding: "utf8" })
    .split("\0")
    .filter(Boolean)
    .map((file) => file.split("/").slice(2));
  const samples = new Set<string>();
  for (const parts of tracked) {
    // A fixture is a folder of `fixtures`; a program is a folder of a language's folder of `programs`.
    const depth = parts[0] === "fixtures" ? 2 : 3;
    if (parts.length > depth) samples.add(path.join(...parts.slice(0, depth)));
  }
  return [...samples].sort();
}

/** Every file under a folder, by its path relative to it, with its bytes. */
function filesOf(folder: string): Map<string, string> {
  const found = new Map<string, string>();
  if (!fs.existsSync(folder)) return found;
  for (const entry of fs.readdirSync(folder, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    found.set(path.relative(folder, file).split(path.sep).join("/"), fs.readFileSync(file, "latin1"));
  }
  return found;
}

/** How many files the history's trees wrote empty across every sample: the rule is exercised, not passed by default. */
let emptiedInAll = 0;

const quiet = { info: (): undefined => undefined, warn: (): undefined => undefined, error: (): undefined => undefined };
const now = (): Date => new Date(0);

describe("the history's tree, every name standing and an excluded image, font or recording empty, against the whole tree", () => {
  for (const workspace of workspaces()) {
    it(`gives the same docs over ${workspace} with each top-level folder excluded in turn`, async () => {
      const source = path.join(repoRoot, "tests", "integration", workspace);
      const repository = fs.mkdtempSync(path.join(privateTemporary, "repo-"));
      fs.cpSync(source, repository, { recursive: true, verbatimSymlinks: true });
      // A sample with a mirror of its own is read with it; the docs root is never a folder to exclude.
      const ownConfiguration = path.join(repository, ".live-docs.config.json");
      const own = fs.existsSync(ownConfiguration) ? (JSON.parse(fs.readFileSync(ownConfiguration, "utf8")) as Partial<LiveDocumentationConfig>) : {};
      const base = normalizeLiveDocumentationConfig(own);
      execFileSync("git", ["init", "--quiet", "-b", "main"], { cwd: repository, env: FIXTURE_GIT_ENV });
      execFileSync("git", ["add", "--all", "--force"], { cwd: repository, env: FIXTURE_GIT_ENV });
      execFileSync("git", ["commit", "--quiet", "-m", "sample"], { cwd: repository, env: FIXTURE_GIT_ENV });
      const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, env: FIXTURE_GIT_ENV, encoding: "utf8" }).trim();
      const docsRootTop = base.root.replace(/^\.\//u, "").split("/")[0];
      const folders = fs
        .readdirSync(repository, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== ".git" && entry.name !== docsRootTop)
        .map((entry) => entry.name)
        .sort();
      for (const folder of folders) {
        const config = normalizeLiveDocumentationConfig({ ...own, exclude: [...base.exclude, `${folder}/**`] });
        // The whole tree: a copy of the sample, every file as it is.
        const whole = fs.mkdtempSync(path.join(privateTemporary, "whole-"));
        fs.cpSync(source, whole, { recursive: true, verbatimSymlinks: true });
        // The history's tree of the same commit.
        const reduced = path.join(fs.mkdtempSync(path.join(privateTemporary, "tree-")), "tree");
        fs.mkdirSync(reduced);
        const options = treeOptions(config, reduced);
        expect(await writeStoredTree(path.join(repository, ".git"), commit, reduced, options), `${workspace} without ${folder}`).toEqual([]);
        emptiedInAll += [...filesOf(reduced).keys()].filter((file) => options.contentless!(file)).length;
        for (const root of [whole, reduced]) {
          await generateLiveDocs({ workspaceRoot: root, config, keepAuthoredStaleDocs: false, logger: quiet, now });
        }
        const docs = (root: string): Map<string, string> => filesOf(path.join(root, config.root));
        const fromWhole = docs(whole);
        const fromReduced = docs(reduced);
        expect([...fromReduced.keys()].sort(), `${workspace} without ${folder}: the docs written`).toEqual([...fromWhole.keys()].sort());
        for (const [file, text] of fromWhole) {
          expect(fromReduced.get(file), `${workspace} without ${folder}: ${file}`).toBe(text);
        }
        fs.rmSync(whole, { recursive: true, force: true });
        fs.rmSync(path.dirname(reduced), { recursive: true, force: true });
      }
      fs.rmSync(repository, { recursive: true, force: true });
    }, 600_000);
  }

  it("wrote some file empty, so that the equality above held over the rule and not around it", () => {
    expect(emptiedInAll).toBeGreaterThan(0);
  });
});
