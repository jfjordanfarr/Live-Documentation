/**
 * The history command over a small repository built from a script of commits
 * (`scripted-repository.ts`), held to oracles it does not produce: the
 * generator's own index at every commit, regenerated here; git's own
 * `diff --name-status -M50%` between consecutive commits; the directory
 * renamed whole; and what `inspect --at` and `inspect --between` answer from
 * the sequence.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildRepository, git, MODEL, SCRIPT, SCRIPTED_CONFIG as CONFIG } from "./scripted-repository";
import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
import type { HistorySequence } from "../../../packages/engine/src/live-docs/history/format";
import { openGitRepository } from "../../../packages/engine/src/live-docs/history/git";
import { changeAt, seek } from "../../../packages/engine/src/live-docs/history/sequence";
import { edgeKey, type Shape } from "../../../packages/engine/src/live-docs/history/shape";
import { buildStaticExplorer } from "../../../packages/explorer/src/shared/staticBuilder";
import type { StaticExplorerData } from "../../../packages/explorer/src/shared/staticExplorerData";
import { generateLiveDocs } from "../../../packages/generator/src/generator";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const historyScript = path.join(repoRoot, "scripts", "live-docs", "history.ts");
const inspectScript = path.join(repoRoot, "scripts", "live-docs", "inspect.ts");

let repository: string;
let commits: string[];
let sequence: HistorySequence;
let firstRun: CliResult;
let secondRun: CliResult;
const temporary: string[] = [];

interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

beforeAll(() => {
  repository = fs.mkdtempSync(path.join(os.tmpdir(), "history-fixture-"));
  temporary.push(repository);
  commits = buildRepository(repository, SCRIPT);
  firstRun = runCli(historyScript, ["--workspace", repository, "--jobs", "3", "--keep-index"]);
  if (firstRun.exitCode !== 0) {
    throw new Error(`the history command failed: ${firstRun.stderr}`);
  }
  sequence = JSON.parse(fs.readFileSync(path.join(repository, ".mdmd", "history", "history.json"), "utf8")) as HistorySequence;
  secondRun = runCli(historyScript, ["--workspace", repository, "--jobs", "1", "--keep-index"]);
});

afterAll(() => {
  for (const folder of temporary) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

describe("the history command over a scripted repository", () => {
  it("samples every commit of the mainline, oldest first, under one lens", () => {
    expect(sequence.format).toBe("live-docs-history/2");
    expect([sequence.base.commit.id, ...sequence.steps.map((step) => step.commit.id)]).toEqual(commits);
    expect(sequence.source).toMatchObject({ system: "git", branch: "main", head: commits[commits.length - 1], shallow: false, knowledgeBegins: commits[0], authors: true });
    expect(sequence.source.sampling).toEqual({ rule: "every-commit" });
    expect(sequence.lens.configuration.entryPoints).toEqual(["src/app/main.ts"]);
    expect(sequence.steps[0].commit).toMatchObject({ author: "Ada Fixture", subject: "Rename the core to the engine", parents: [commits[0]] });
    expect(Date.parse(sequence.steps[0].commit.date)).toBe(Date.parse(SCRIPT[1].date));
  });

  it("reproduces, by replay, the generator's own index at every commit, regenerated independently here", async () => {
    for (let step = 0; step < commits.length; step += 1) {
      const expected = await regeneratedShape(repository, commits[step]);
      const replayed = seek(sequence, step);
      expect(sortedFiles(replayed), `files at step ${step}`).toEqual(sortedFiles(expected));
      expect(sortedEdges(replayed), `edges at step ${step}`).toEqual(sortedEdges(expected));
    }
  });

  it("holds every step's renames and touched files to git's own diff between the two commits", () => {
    for (let step = 1; step < commits.length; step += 1) {
      const git = nameStatus(repository, commits[step - 1], commits[step]);
      const before = seek(sequence, step - 1);
      const after = seek(sequence, step);
      const change = changeAt(sequence, step);
      const visible = git.renamed.filter(([from, to]) => before.files.has(from) && after.files.has(to));
      expect(change.renamed, `renames at step ${step}`).toEqual(visible);
      for (const touched of change.touched) {
        expect(git.modified, `touched at step ${step}`).toContain(touched);
      }
    }
    const rewrite = nameStatus(repository, commits[2], commits[3]);
    expect(rewrite.renamed).toEqual([]);
    expect(rewrite.deleted).toContain("lib/big.ts");
    expect(rewrite.added).toContain("lib/huge.ts");
    // The screen's rename lies between the thresholds, so a reading at any other than git's 50% would differ here.
    expect(nameStatus(repository, commits[1], commits[2]).renamed).toEqual([["src/app/view.ts", "src/app/screen.ts"]]);
    expect(nameStatus(repository, commits[1], commits[2], "-M90%").renamed).toEqual([]);
  });

  it("reads each step as the script wrote it", () => {
    const steps = commits.map((_, step) => changeAt(sequence, step));
    expect(steps[1].renamed).toEqual([
      ["src/core/model.ts", "src/engine/model.ts"],
      ["src/core/util.ts", "src/engine/util.ts"]
    ]);
    expect(steps[1].touched).toEqual(["src/app/main.ts", "src/app/view.ts"]);
    expect(steps[1].edgesAdded).toEqual([]);
    expect(steps[1].edgesRemoved).toEqual([]);
    expect(steps[2].renamed).toEqual([["src/app/view.ts", "src/app/screen.ts"]]);
    expect(steps[2].touched).toEqual(["src/app/main.ts"]);
    expect(steps[3].born.map(([file]) => file)).toEqual(["lib/huge.ts"]);
    expect(steps[3].dead).toEqual(["lib/big.ts"]);
    expect(steps[3].renamed).toEqual([]);
    expect(steps[3].edgesAdded).toEqual([["src/app/main.ts", "lib/huge.ts", 1]]);
    expect(steps[3].edgesRemoved).toEqual([["src/app/main.ts", "lib/big.ts"]]);
    expect(steps[4].dead).toEqual(["lib/legacy.ts"]);
    expect(steps[4].edgesRemoved).toEqual([["src/app/main.ts", "lib/legacy.ts"]]);
    expect(steps[5].resized).toEqual([["src/engine/util.ts", 3]]);
    expect(steps[5].touched).toEqual([]);
    expect(steps[6].touched).toEqual(["src/engine/model.ts"]);
    expect(steps[6].resized).toEqual([]);
    expect(seek(sequence, 0).files.get("src/app/main.ts")?.entry).toBe(true);
    // The committed mirror's orphan is the generator of its day's, not this lens's reading of the source.
    expect(sequence.paths).not.toContain("lib/ghost.ts");
  });

  it("carries the documents each commit's authored words linked to, only those that stood then, and none from a doc the lens prunes", () => {
    const main = "src/app/main.ts";
    const links = (step: number): string[] => [...seek(sequence, step).docLinks].map((key) => key.replace("\u0000", " -> ")).sort();
    const early = [`lib/legacy.ts -> docs/old-notes.md`, `${main} -> docs/design.md`];
    // The plan is linked from the first commit and written at the fourth: it counts from there.
    expect(links(0)).toEqual(early);
    expect(links(1)).toEqual(early);
    expect(links(2)).toEqual(early);
    expect(links(3)).toEqual([...early, `${main} -> docs/later.md`].sort());
    // The legacy helper's link leaves with it, and the main file's doc drops the design.
    for (const step of [4, 5, 6]) expect(links(step), `step ${step}`).toEqual([`${main} -> docs/later.md`]);
    expect(changeAt(sequence, 3).docLinksAdded).toEqual([[main, "docs/later.md"]]);
    expect(changeAt(sequence, 4).docLinksRemoved).toEqual([["lib/legacy.ts", "docs/old-notes.md"], [main, "docs/design.md"]]);
    // A doc link is a change of its file's shape, never a content-only touch, and the orphan's link never counts.
    expect(changeAt(sequence, 4).touched).toEqual([]);
    expect([...seek(sequence, 0).docLinks].some((key) => key.startsWith("lib/ghost.ts"))).toBe(false);
  });

  it("names the directory renamed whole, and no other", () => {
    const renamed = commits.map((_, step) => changeAt(sequence, step).directoriesRenamed);
    expect(renamed[1]).toEqual([["src/core", "src/engine"]]);
    expect(renamed.filter((pairs, step) => step !== 1 && pairs.length > 0)).toEqual([]);
  });

  it("regenerates nothing the second time, and writes the same sequence", () => {
    expect(secondRun.exitCode, secondRun.stderr).toBe(0);
    expect(firstRun.stdout).toContain(`${commits.length} regenerated`);
    expect(secondRun.stdout).toContain("0 regenerated");
    expect(secondRun.stderr).not.toContain("regenerated:");
    const again = JSON.parse(fs.readFileSync(path.join(repository, ".mdmd", "history", "history.json"), "utf8")) as HistorySequence;
    expect(again).toEqual(sequence);
    const cache = path.join(repository, ".mdmd", "history", sequence.lens.key);
    for (const commit of commits) {
      expect(fs.existsSync(path.join(cache, `${commit}.json`))).toBe(true);
      expect(fs.existsSync(path.join(cache, `${commit}.index.json.gz`))).toBe(true);
    }
  });

  it("checks a commit out as the repository stores it, whatever the person's git would convert", async () => {
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "history-seam-"));
    temporary.push(scratch);
    const personalConfig = path.join(scratch, "gitconfig");
    fs.writeFileSync(personalConfig, "[core]\n\tautocrlf = true\n", "utf8");
    const saved = process.env.GIT_CONFIG_GLOBAL;
    process.env.GIT_CONFIG_GLOBAL = personalConfig;
    try {
      const tree = await (await openGitRepository(repository)).workingTree(commits[0], path.join(scratch, "tree"));
      try {
        expect(fs.readFileSync(path.join(tree.root, "src", "core", "model.ts"), "utf8")).toBe(MODEL(1));
      } finally {
        await tree.remove();
      }
      expect(fs.existsSync(path.join(scratch, "tree"))).toBe(false);
    } finally {
      if (saved === undefined) {
        delete process.env.GIT_CONFIG_GLOBAL;
      } else {
        process.env.GIT_CONFIG_GLOBAL = saved;
      }
    }
  });

  it("leaves no worktree registered in the repository and keeps its history out of git", () => {
    const worktrees = git(repository, ["worktree", "list", "--porcelain"]).split("\n").filter((line) => line.startsWith("worktree "));
    expect(worktrees).toHaveLength(1);
    expect(git(repository, ["status", "--porcelain", "--untracked-files=all"]).split("\n").filter(Boolean).filter((line) => line.includes(".mdmd/history"))).toEqual([]);
  });
});

describe("the bundle's history", () => {
  it("carries the window the exporter asks for, re-based on its first commit, and says so in the data", async () => {
    const output = fs.mkdtempSync(path.join(os.tmpdir(), "history-bundle-"));
    temporary.push(output);
    const config = normalizeLiveDocumentationConfig(CONFIG);
    await generateLiveDocs({ workspaceRoot: repository, config, logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });
    const quiet = { log: () => undefined, error: () => undefined };

    await buildStaticExplorer({ workspaceRoot: repository, outputDir: output, config, history: { rule: "last", count: 3 }, logger: quiet });
    const window = JSON.parse(fs.readFileSync(path.join(output, "explorer-history.json"), "utf8")) as HistorySequence;
    const data = JSON.parse(fs.readFileSync(path.join(output, "explorer-data.json"), "utf8")) as StaticExplorerData;
    expect(window.window).toEqual({ rule: "last", count: 3 });
    expect([window.base.commit.id, ...window.steps.map((step) => step.commit.id)]).toEqual(commits.slice(-3));
    expect(sortedFiles(seek(window, 0))).toEqual(sortedFiles(seek(sequence, commits.length - 3)));
    expect(sortedEdges(seek(window, 2))).toEqual(sortedEdges(seek(sequence, commits.length - 1)));
    expect(window.paths.length).toBeLessThan(sequence.paths.length);
    expect(data.history).toMatchObject({ file: "explorer-history.json", head: { window: { rule: "last", count: 3 }, commits: 3, first: { id: commits[4] }, last: { id: commits[6] } } });

    await buildStaticExplorer({ workspaceRoot: repository, outputDir: output, config, history: { rule: "none" }, logger: quiet });
    expect(fs.existsSync(path.join(output, "explorer-history.json"))).toBe(false);
    expect((JSON.parse(fs.readFileSync(path.join(output, "explorer-data.json"), "utf8")) as StaticExplorerData).history).toBeUndefined();
  });
});

describe("inspect's history questions", () => {
  it("answers whether a file exists at a commit, with its wires, from the shape alone", () => {
    const before = runInspect(repository, ["--at", commits[1].slice(0, 10), "--from", "src/app/view.ts", "--json"]);
    expect(before.exitCode, before.stderr).toBe(0);
    const at = JSON.parse(before.stdout) as { kind: string; answeredFrom: string; commit: { id: string }; file: { exists: boolean; outbound: Array<{ codePath: string }>; inbound: Array<{ codePath: string }> } };
    expect(at).toMatchObject({ kind: "at", answeredFrom: "shape", commit: { id: commits[1] }, file: { exists: true } });
    expect(at.file.outbound.map((neighbour) => neighbour.codePath)).toEqual(["src/engine/model.ts"]);
    expect(at.file.inbound.map((neighbour) => neighbour.codePath)).toEqual(["src/app/main.ts"]);

    const after = runInspect(repository, ["--at", commits[2], "--from", "src/app/view.ts"]);
    expect(after.exitCode, after.stderr).toBe(0);
    expect(after.stdout.split("\n")[0]).toContain("from the shape alone");
    expect(after.stdout).toContain("src/app/view.ts does not exist at");

    const main = runInspect(repository, ["--at", commits[0], "--from", "src/app/main.ts"]);
    expect(main.exitCode, main.stderr).toBe(0);
    expect(main.stdout).toContain("Linked documents: 1 document\n  docs/design.md");
  });

  it("walks from the entries of a commit with the pathfinder", () => {
    const result = runInspect(repository, ["--at", commits[0], "--reachable", "--json"]);
    expect(result.exitCode, result.stderr).toBe(0);
    const walk = JSON.parse(result.stdout) as { kind: string; starts: Array<{ codePath: string }>; reached: Array<{ codePath: string; hops: number }>; testsOnly: string[] };
    expect(walk.kind).toBe("at-reachable");
    expect(walk.starts.map((start) => start.codePath)).toEqual(expect.arrayContaining(["src/app/main.ts", "tests/main.test.ts"]));
    expect(walk.reached).toEqual(expect.arrayContaining([{ codePath: "src/core/model.ts", hops: 1 }, { codePath: "lib/legacy.ts", hops: 1 }]));
    const text = runInspect(repository, ["--at", commits[0], "--reachable"]);
    expect(text.stdout.split("\n")[0]).toContain("from the shape alone");
  });

  it("lists what changed between two commits, through every rename between", () => {
    const result = runInspect(repository, ["--between", commits[0], commits[commits.length - 1], "--json"]);
    expect(result.exitCode, result.stderr).toBe(0);
    const between = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(between).toMatchObject({
      kind: "between",
      answeredFrom: "shape",
      born: ["lib/huge.ts"],
      dead: ["lib/big.ts", "lib/legacy.ts"],
      renamed: [
        { from: "src/app/view.ts", to: "src/app/screen.ts" },
        { from: "src/core/model.ts", to: "src/engine/model.ts" },
        { from: "src/core/util.ts", to: "src/engine/util.ts" }
      ],
      resized: [{ codePath: "src/engine/util.ts", before: 2, after: 3 }],
      edgesAdded: [{ from: "src/app/main.ts", to: "lib/huge.ts" }],
      edgesRemoved: [
        { from: "src/app/main.ts", to: "lib/big.ts" },
        { from: "src/app/main.ts", to: "lib/legacy.ts" }
      ]
    });
    expect(between).toMatchObject({
      docLinksAdded: [{ from: "src/app/main.ts", doc: "docs/later.md" }],
      docLinksRemoved: [
        { from: "lib/legacy.ts", doc: "docs/old-notes.md" },
        { from: "src/app/main.ts", doc: "docs/design.md" }
      ]
    });
    const text = runInspect(repository, ["--between", commits[0].slice(0, 8), commits[1].slice(0, 8)]);
    expect(text.exitCode, text.stderr).toBe(0);
    expect(text.stdout.split("\n")[0]).toContain("from the shape alone");
    expect(text.stdout).toContain("src/core/model.ts -> src/engine/model.ts");
    // The words a person reads are Created and Deleted (the owner, 2026-10-26); the format's fields stay born and dead.
    const words = runInspect(repository, ["--between", commits[2], commits[4]]);
    expect(words.exitCode, words.stderr).toBe(0);
    expect(words.stdout).toContain("Created: 1 file\n  lib/huge.ts");
    expect(words.stdout).toContain("Deleted: 2 files\n  lib/big.ts\n  lib/legacy.ts");
    expect(words.stdout).not.toMatch(/\b(Born|Dead)\b/u);
  });

  it("refuses a commit the sequence does not hold, and says so", () => {
    const result = runInspect(repository, ["--at", "0000000", "--from", "src/app/main.ts"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("no step of the history is at 0000000");
  });

  it("refuses plainly where no history has been computed, naming the command", () => {
    const bare = fs.mkdtempSync(path.join(os.tmpdir(), "history-none-"));
    temporary.push(bare);
    fs.writeFileSync(path.join(bare, ".live-docs.config.json"), JSON.stringify(CONFIG), "utf8");
    const result = runInspect(bare, ["--at", "abc1234", "--from", "src/app/main.ts"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("npm run live-docs:history");
  });
});

/**
 * The commit's shape, regenerated here as a first run over its source sees
 * it: its tree checked out with the mirror it committed removed, the
 * generator run over it, and the derived graph summarized by this test's own
 * reading.
 */
async function regeneratedShape(root: string, commit: string): Promise<Shape> {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "history-oracle-"));
  const tree = path.join(scratch, "tree");
  git(root, ["worktree", "add", "--detach", "--quiet", tree, commit]);
  try {
    fs.rmSync(path.join(tree, CONFIG.root, CONFIG.baseLayer), { recursive: true, force: true });
    const config = normalizeLiveDocumentationConfig(CONFIG);
    await generateLiveDocs({ workspaceRoot: tree, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
    const graph = await readLiveDocGraph({ workspaceRoot: tree, config });
    // The oracle reads files and wires from a fresh generation; the doc links are held to the script in their own test.
    const shape: Shape = { files: new Map(), edges: new Map(), docLinks: new Set() };
    for (const file of Object.values(graph.files)) {
      shape.files.set(file.codePath, { archetype: file.archetype ?? "", symbols: file.symbols.length, entry: file.entries.length > 0 });
      for (const edge of file.edges) {
        if (edge.to && edge.to !== file.codePath) {
          const key = edgeKey(file.codePath, edge.to);
          shape.edges.set(key, (shape.edges.get(key) ?? 0) + 1);
        }
      }
    }
    return shape;
  } finally {
    git(root, ["worktree", "remove", "--force", tree]);
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

/** Git's own word on two commits, read from the plain `--name-status` output by this test. */
function nameStatus(root: string, from: string, to: string, threshold = "-M50%"): { renamed: Array<[string, string]>; modified: string[]; added: string[]; deleted: string[] } {
  const result = { renamed: [] as Array<[string, string]>, modified: [] as string[], added: [] as string[], deleted: [] as string[] };
  for (const line of git(root, ["diff", "--name-status", threshold, from, to]).split("\n").filter(Boolean)) {
    const [status, first, second] = line.split("\t");
    if (status.startsWith("R")) result.renamed.push([first, second]);
    else if (status === "M") result.modified.push(first);
    else if (status === "A") result.added.push(first);
    else if (status === "D") result.deleted.push(first);
  }
  result.renamed.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return result;
}

function sortedFiles(shape: Shape): Array<[string, string, number, boolean]> {
  return [...shape.files].map(([file, value]): [string, string, number, boolean] => [file, value.archetype, value.symbols, value.entry]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

function sortedEdges(shape: Shape): Array<[string, number]> {
  return [...shape.edges].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

function runCli(script: string, args: string[]): CliResult {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, script, ...args], { encoding: "utf8", env: process.env });
  if (result.error) {
    throw result.error;
  }
  return { exitCode: result.status ?? 0, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function runInspect(workspace: string, args: string[]): CliResult {
  return runCli(inspectScript, ["--workspace", workspace, ...args]);
}
