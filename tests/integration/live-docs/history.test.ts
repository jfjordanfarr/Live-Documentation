/**
 * The history command over a small repository built from a script of commits
 * (`scripted-repository.ts`), held to oracles it does not produce: the
 * generator's own index at every commit, regenerated here; git's own
 * `diff --name-status -M50%` between consecutive commits; the directory
 * renamed whole; and what `inspect --at` and `inspect --between` answer from
 * the sequence.
 */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import * as zlib from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
import type { HistorySequence } from "../../../packages/engine/src/live-docs/history/format";
import { openGitRepository } from "../../../packages/engine/src/live-docs/history/git";
import { linksOf, type RowLink } from "../../../packages/engine/src/live-docs/history/rows";
import { changeAt, momentAt, seek } from "../../../packages/engine/src/live-docs/history/sequence";
import { edgeKey, type Shape } from "../../../packages/engine/src/live-docs/history/shape";
import { sectionsOfDescription, type CommitSummary, type SummaryFile } from "../../../packages/engine/src/live-docs/history/summary";
import { readText, TEXT_STORE_DIRECTORY } from "../../../packages/engine/src/live-docs/history/textStore";
import { textInPart, textsOfFile, wordsPartFile, type WordsPart } from "../../../packages/engine/src/live-docs/history/words";
import { buildStaticExplorer } from "../../../packages/explorer/src/shared/staticBuilder";
import type { StaticExplorerData } from "../../../packages/explorer/src/shared/staticExplorerData";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { buildRepository, CHECKED_CONFIG, CHECKED_SCRIPT, FIXTURE_GIT_ENV, git, MODEL, SCRIPT, SCRIPTED_CONFIG as CONFIG } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsxLoader = path.join(repoRoot, "node_modules", "tsx", "dist", "loader.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const historyScript = path.join(repoRoot, "scripts", "live-docs", "history.ts");
const inspectScript = path.join(repoRoot, "scripts", "live-docs", "inspect.ts");

let repository: string;
let commits: string[];
let sequence: HistorySequence;
let firstRun: CliResult;
let secondRun: CliResult;
const temporary: string[] = [];

/**
 * A temporary folder of this file's own, for every folder it makes and every history command it runs: the system's
 * is shared by every history run on the machine, another test file's or another person's, and until 2026-11-19 their
 * trees read here as this file's leftovers and a tidy of theirs removed this file's trees mid-run. Short, since tsx
 * makes its socket in it.
 */
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "lh-"));
process.env.TMPDIR = privateTemporary;
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

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
    expect(sequence.format).toBe("live-docs-history/3");
    expect([sequence.base.commit.id, ...sequence.steps.map((step) => step.commit.id)]).toEqual(commits);
    expect(sequence.source).toMatchObject({ system: "git", branch: "main", head: commits[commits.length - 1], shallow: false, knowledgeBegins: commits[0], authors: true });
    expect(sequence.source.sampling).toEqual({ rule: "every-commit" });
    expect(sequence.lens.configuration.entryPoints).toEqual(["src/app/main.ts"]);
    expect(sequence.steps[0].commit).toMatchObject({ author: "Ada Fixture", subject: "Rename the core to the engine", parents: [commits[0]] });
    expect(Date.parse(sequence.steps[0].commit.date)).toBe(Date.parse(SCRIPT[1].date));
  });

  it("reproduces, by replay, the generator's own index at every commit, regenerated independently here", async () => {
    for (let step = 0; step < commits.length; step += 1) {
      const { shape: expected, symbols, links } = await regeneratedShape(repository, commits[step]);
      const moment = momentAt(sequence, step);
      const replayed = moment.shape;
      expect(sortedFiles(replayed), `files at step ${step}`).toEqual(sortedFiles(expected));
      expect(sortedEdges(replayed), `edges at step ${step}`).toEqual(sortedEdges(expected));
      // The rows: each file's symbols in the doc's order, and every link between two files, from symbol or file to symbol or file.
      expect(new Map([...moment.rows].map(([file, rows]) => [file, rows.symbols.map((symbol) => [symbol.name, symbol.slug, symbol.kind])])), `symbols at step ${step}`).toEqual(symbols);
      expect(linksOf(moment.rows).map(linkWords).sort(), `links at step ${step}`).toEqual(links);
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
      expect(fs.existsSync(path.join(cache, `${commit}.json.gz`))).toBe(true);
      expect(fs.existsSync(path.join(cache, `${commit}.index.json.gz`))).toBe(true);
    }
  });

  it("keeps each commit's rows, and that day's words once each by hash, saying unread where the mirror's form hides them", async () => {
    const cache = path.join(repository, ".mdmd", "history", sequence.lens.key);
    const summary = (step: number): CommitSummary => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(cache, `${commits[step]}.json.gz`))).toString("utf8")) as CommitSummary;
    const first = summary(0);
    const file = (path: string): SummaryFile => first.files.find((entry) => entry.path === path)!;
    const store = path.join(cache, TEXT_STORE_DIRECTORY);
    // The main file's doc stood with its words, which the text store holds as that day's.
    expect(await readText(store, file("src/app/main.ts").authored!)).toContain("as [the design](../../../../docs/design.md) lays out");
    // The big helper's doc stood in an older form: its words are unread, never the generator's placeholder.
    expect(file("lib/big.ts")).toMatchObject({ unread: true });
    expect(file("lib/big.ts").authored).toBeUndefined();
    // No doc of the model stood at the first commit: it has no words of that day at all.
    expect(file("src/core/model.ts").authored).toBeUndefined();
    expect(file("src/core/model.ts").unread).toBeUndefined();
    // Its rows are the generator's own, in the doc's order, each description named by hash.
    expect(file("src/core/model.ts").symbols.map((symbol) => [symbol.name, symbol.kind])).toEqual([["Model", "interface"], ["makeModel", "function"]]);
    expect(file("src/core/model.ts").symbols[1].references).toEqual([{ role: "returns", type: "Model", to: "src/core/model.ts", toSymbol: file("src/core/model.ts").symbols[0].slug }]);
    expect(sectionsOfDescription(await readText(store, file("src/core/model.ts").symbols[1].text!))[0]).toEqual({ title: "Summary", body: ["Makes a model."] });
    expect(file("src/app/main.ts").dependencies.map((line) => [line.label, line.to])).toEqual(expect.arrayContaining([["big", "lib/big.ts"], ["model.makeModel", "src/core/model.ts"]]));
    // A text unchanged across the commits is stored once: the store holds fewer texts than the summaries name.
    const named = commits.flatMap((_, step) => summary(step).files.flatMap((entry) => [entry.authored, ...entry.symbols.map((symbol) => symbol.text)])).filter((hash): hash is string => hash !== undefined);
    const stored = fs.readdirSync(store, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
    expect(new Set(named).size).toBe(stored.length);
    expect(stored.length).toBeLessThan(named.length);
  });

  it("lists the caches of other lenses with their sizes at every run, and removes them only when asked", () => {
    const history = path.join(repository, ".mdmd", "history");
    const stale = path.join(history, "0123456789abcdef");
    fs.mkdirSync(path.join(stale, "texts", "ab"), { recursive: true });
    fs.writeFileSync(path.join(stale, "texts", "ab", "old"), "x".repeat(2048));
    const listed = runCli(historyScript, ["--workspace", repository, "--jobs", "1", "--keep-index"]);
    expect(listed.exitCode, listed.stderr).toBe(0);
    expect(listed.stderr).toContain("kept .mdmd/history/0123456789abcdef, the cache of a lens that is not the current one: 2.0 KB");
    expect(listed.stdout).toContain("The caches of 1 other lenses hold 2.0 KB; --remove-superseded removes them.");
    expect(fs.existsSync(stale)).toBe(true);
    const removed = runCli(historyScript, ["--workspace", repository, "--jobs", "1", "--keep-index", "--remove-superseded"]);
    expect(removed.exitCode, removed.stderr).toBe(0);
    expect(removed.stderr).toContain("removed .mdmd/history/0123456789abcdef");
    expect(fs.existsSync(stale)).toBe(false);
    // The current lens's cache and the record of the pool stay.
    expect(fs.existsSync(path.join(history, sequence.lens.key))).toBe(true);
    expect(JSON.parse(fs.readFileSync(path.join(history, "pool.json"), "utf8"))).toMatchObject({ lens: sequence.lens.key, peakMemory: expect.any(Number) });
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
    // The window's words ride beside it, a part per directory, each text its rows name there and no other.
    expect(window.words?.folder).toBe("explorer-history-words");
    const last = momentAt(window, 2).rows;
    const mainPart = JSON.parse(fs.readFileSync(path.join(output, "explorer-history-words", wordsPartFile(window.words!, "src/app/main.ts")!), "utf8")) as WordsPart;
    expect(textInPart(mainPart, last.get("src/app/main.ts")!.authored as number)).toContain("Its later form is in [the plan]");
    const named = new Set([...Array(3).keys()].flatMap((step) => [...momentAt(window, step).rows.values()].flatMap(textsOfFile)));
    const carried = fs.readdirSync(path.join(output, "explorer-history-words")).flatMap((part) => (JSON.parse(fs.readFileSync(path.join(output, "explorer-history-words", part), "utf8")) as WordsPart).ids);
    expect(new Set(carried)).toEqual(named);

    await buildStaticExplorer({ workspaceRoot: repository, outputDir: output, config, history: { rule: "none" }, logger: quiet });
    expect(fs.existsSync(path.join(output, "explorer-history.json"))).toBe(false);
    expect(fs.existsSync(path.join(output, "explorer-history-words"))).toBe(false);
    expect((JSON.parse(fs.readFileSync(path.join(output, "explorer-data.json"), "utf8")) as StaticExplorerData).history).toBeUndefined();
  });
});

describe("inspect's history questions", () => {
  it("answers whether a file exists at a commit, with its wires, and its rows and links as that day's docs listed them", () => {
    const before = runInspect(repository, ["--at", commits[1].slice(0, 10), "--from", "src/app/view.ts", "--json"]);
    expect(before.exitCode, before.stderr).toBe(0);
    const at = JSON.parse(before.stdout) as {
      kind: string;
      answeredFrom: string;
      commit: { id: string };
      file: { exists: boolean; outbound: Array<{ codePath: string }>; inbound: Array<{ codePath: string }> };
      rows: { symbols: Array<{ name: string; references: Array<{ role: string; to?: string }> }> };
      links: { outbound: RowLink[]; inbound: RowLink[] };
    };
    expect(at).toMatchObject({ kind: "at", answeredFrom: "rows", commit: { id: commits[1] }, file: { exists: true } });
    expect(at.file.outbound.map((neighbour) => neighbour.codePath)).toEqual(["src/engine/model.ts"]);
    expect(at.file.inbound.map((neighbour) => neighbour.codePath)).toEqual(["src/app/main.ts"]);
    expect(at.rows.symbols.map((symbol) => symbol.name)).toEqual(["render", "renderAll"]);
    expect(at.rows.symbols[0].references).toEqual([{ role: "parameter", parameter: "model", type: "Model", to: "src/engine/model.ts", toSymbol: expect.any(String) }]);
    expect(at.links.inbound).toEqual([expect.objectContaining({ from: "src/app/main.ts", to: "src/app/view.ts", kind: "import" })]);

    const after = runInspect(repository, ["--at", commits[2], "--from", "src/app/view.ts"]);
    expect(after.exitCode, after.stderr).toBe(0);
    expect(after.stdout.split("\n")[0]).toContain("from the rows that day's docs listed");
    expect(after.stdout).toContain("src/app/view.ts does not exist at");

    const main = runInspect(repository, ["--at", commits[0], "--from", "src/app/main.ts"]);
    expect(main.exitCode, main.stderr).toBe(0);
    expect(main.stdout).toContain("Linked documents: 1 document\n  docs/design.md");
    expect(main.stdout).toContain("Symbols: 1 symbol, in the doc's order\n  main  function");
    expect(main.stdout).toContain("Dependencies: 5 lines");
  });

  it("lists the links at a commit between two files, and between two symbols named path#Symbol", () => {
    const files = runInspect(repository, ["--at", commits[1], "--from", "src/app/view.ts", "--to", "src/engine/model.ts", "--json"]);
    expect(files.exitCode, files.stderr).toBe(0);
    const between = JSON.parse(files.stdout) as { kind: string; answeredFrom: string; links: RowLink[] };
    expect(between).toMatchObject({ kind: "at-links", answeredFrom: "rows" });
    expect(between.links.map((link) => [link.from, link.fromSymbol, link.to, link.kind])).toEqual([
      ["src/app/view.ts", undefined, "src/engine/model.ts", "import"],
      ["src/app/view.ts", "symbol-render", "src/engine/model.ts", "parameter"],
      ["src/app/view.ts", "symbol-renderall", "src/engine/model.ts", "parameter"]
    ]);
    const symbols = runInspect(repository, ["--at", commits[1], "--from", "src/app/view.ts#renderAll", "--to", "src/engine/model.ts#Model"]);
    expect(symbols.exitCode, symbols.stderr).toBe(0);
    expect(symbols.stdout).toContain("Links between src/app/view.ts#symbol-renderall and src/engine/model.ts#");
    expect(symbols.stdout).toContain(": 1 link\n  src/app/view.ts#symbol-renderall -> src/engine/model.ts#");
    const missing = runInspect(repository, ["--at", commits[1], "--from", "src/app/view.ts#nothing", "--to", "src/engine/model.ts"]);
    expect(missing.exitCode).toBe(1);
    expect(missing.stderr).toContain("lists no one symbol nothing");
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

  it("prints a file's words at a commit, and says plainly where that day's words cannot be read or none were written", () => {
    const main = runInspect(repository, ["--at", commits[0], "--from", "src/app/main.ts", "--words"]);
    expect(main.exitCode, main.stderr).toBe(0);
    expect(main.stdout).toContain("Authored:\n  ### Purpose\n  Runs the app, as [the design](../../../../docs/design.md) lays out.");
    // The design link left the main file's words at the fifth commit, and its later words are read there.
    const later = runInspect(repository, ["--at", commits[4], "--from", "src/app/main.ts", "--words", "--json"]);
    expect((JSON.parse(later.stdout) as { authored: { state: string; text: string } }).authored.text).not.toContain("the design");
    const big = runInspect(repository, ["--at", commits[0], "--from", "lib/big.ts", "--words"]);
    expect(big.exitCode, big.stderr).toBe(0);
    expect(big.stdout).toContain("Not readable: the doc that stood at");
    expect(big.stdout).toContain("Descriptions: 1 symbol\n  big\n    Summary:\n      Counts to a big number, one step at a time.");
    const model = runInspect(repository, ["--at", commits[0], "--from", "src/core/model.ts", "--words", "--json"]);
    expect(JSON.parse(model.stdout)).toMatchObject({ kind: "at-words", answeredFrom: "words", authored: { state: "none" }, descriptions: [{ name: "Model" }, { name: "makeModel", sections: [{ title: "Summary", body: ["Makes a model."] }] }] });
    const today = runInspect(repository, ["--from", "src/app/main.ts", "--words"]);
    expect(today.exitCode).toBe(1);
    expect(today.stderr).toContain("takes --at");
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
 * A second repository, built from the checked script, whose head commits the mirror the generator writes there: what
 * the history must read of any repository, and what it holds itself to and mends.
 */
describe("the history over a repository that commits its mirror", () => {
  let checked: string;
  let ids: string[];
  let history: string;
  let first: CliResult;

  beforeAll(async () => {
    checked = fs.mkdtempSync(path.join(os.tmpdir(), "history-checked-"));
    temporary.push(checked);
    ids = buildRepository(checked, CHECKED_SCRIPT);
    // The mirror as a person commits it: today's generator over the checkout at the head.
    await generateLiveDocs({ workspaceRoot: checked, config: normalizeLiveDocumentationConfig(CHECKED_CONFIG), logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });
    git(checked, ["add", "--all"]);
    git(checked, ["commit", "--quiet", "-m", "Commit the mirror"], { GIT_AUTHOR_DATE: "2026-03-04T10:00:00+00:00", GIT_COMMITTER_DATE: "2026-03-04T10:00:00+00:00" });
    ids.push(git(checked, ["rev-parse", "HEAD"]).trim());
    history = path.join(checked, ".mdmd", "history");
    first = runCli(historyScript, ["--workspace", checked, "--jobs", "2", "--check-head"]);
  });

  const summaryOf = (commit: string): CommitSummary => {
    const lens = (JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence).lens.key;
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(history, lens, `${commit}.json.gz`))).toString("utf8")) as CommitSummary;
  };

  it("keeps a file git tracks though an ignore file names it, as a checkout of the commit does", () => {
    expect(first.exitCode, first.stderr).toBe(0);
    expect(summaryOf(ids[0]).files.map((file) => file.path)).toContain("src/table.ts");
    // The oracle: git itself, asked of the commit, tracks it.
    expect(git(checked, ["ls-tree", "-r", "--name-only", ids[0]]).split("\n")).toContain("src/table.ts");
    expect(summaryOf(ids[0]).files.find((file) => file.path === "src/main.ts")?.dependencies.map((line) => line.to)).toContain("src/table.ts");
  });

  it("summarizes a module exporting $ and $$, each under an anchor of its own", () => {
    expect(summaryOf(ids[0]).files.find((file) => file.path === "src/select.ts")?.symbols.map((symbol) => [symbol.name, symbol.slug])).toEqual([
      ["$", "symbol-~24"],
      ["$$", "symbol-~24~24"]
    ]);
  });

  it("holds the last step to the mirror committed at the head when asked, and says so", () => {
    // The configuration, the ignore file and the three modules, each documented.
    expect(first.stdout).toMatch(/Checked: the last step's 5 files, \d+ symbols with their words, and \d+ links/u);
    expect(first.stdout).toContain(`are those of the Live Docs committed at ${ids[2].slice(0, 8)}, read afresh.`);
  });

  it("says the check was skipped, and why, when it was not asked and this generator did not make the mirror", () => {
    const unasked = runCli(historyScript, ["--workspace", checked, "--jobs", "1"]);
    expect(unasked.exitCode, unasked.stderr).toBe(0);
    expect(unasked.stdout).toContain("Not checked: the check at the head was skipped: it applies when asked with --check-head, or when this generator runs unmodified from the commit the history ends at");
    expect(unasked.stdout).toMatch(/and here this generator(?: runs from \w+ and the history ends at| is installed|'s code differs from its commit)/u);
  });

  it("refuses a last step that differs from the committed mirror, naming the difference", () => {
    const stale = fs.mkdtempSync(path.join(os.tmpdir(), "history-stale-"));
    temporary.push(stale);
    git(os.tmpdir(), ["clone", "--quiet", checked, stale]);
    // The source changes and the mirror is not regenerated.
    fs.appendFileSync(path.join(stale, "src", "select.ts"), "\n/** Selects the last of many. */\nexport function last(queries: string[]): string {\n  return queries[queries.length - 1];\n}\n");
    git(stale, ["commit", "--quiet", "-am", "Select the last of many"]);
    const refused = runCli(historyScript, ["--workspace", stale, "--jobs", "2", "--check-head"]);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain("the history's last step is not the graph of the Live Docs committed at");
    expect(refused.stderr).toContain("the symbols of src/select.ts differ");
  });

  it("summarizes again a change whose text is missing or changed, rather than failing every later run", () => {
    const lens = (JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence).lens.key;
    const store = path.join(history, lens, TEXT_STORE_DIRECTORY);
    const named = summaryOf(ids[0]).files.find((file) => file.path === "src/main.ts")!.symbols[0].text!;
    const gone = path.join(store, named.slice(0, 2), named);
    const changed = summaryOf(ids[0]).files.find((file) => file.path === "src/table.ts")!.symbols[0].text!;
    fs.rmSync(gone);
    fs.writeFileSync(path.join(store, changed.slice(0, 2), changed), "words someone changed");
    const mended = runCli(historyScript, ["--workspace", checked, "--jobs", "2"]);
    expect(mended.exitCode, mended.stderr).toBe(0);
    expect(mended.stderr).toContain("are summarized again, since their summaries do not read or name texts the store lacks or holds changed");
    expect(mended.stdout).toMatch(/[1-9]\d* regenerated/u);
    expect(fs.existsSync(gone)).toBe(true);
    expect(fs.readFileSync(path.join(store, changed.slice(0, 2), changed), "utf8")).not.toBe("words someone changed");
  });

  it("writes the words beside the sequence in a folder of their own, the one the sequence names, and leaves no other", () => {
    const sequence = JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence;
    const folders = fs.readdirSync(history).filter((name) => name.startsWith("history-words"));
    expect(folders).toEqual([sequence.words!.folder]);
    expect(sequence.words!.folder).toMatch(/^history-words-[0-9a-f]{16}$/u);
  });

  it("removes what a stopped run left half written, and refuses to write beside a run that holds the folder", () => {
    const lens = (JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence).lens.key;
    const leftover = path.join(history, lens, `${ids[0]}.json.gz.4242.partial`);
    fs.writeFileSync(leftover, "half");
    const host = createHash("sha256").update(os.hostname()).digest("hex").slice(0, 12);
    // This test's own process holds a claim, as another run on this machine would.
    const live = path.join(history, `run.${host}.${process.pid}.test.lock`);
    fs.writeFileSync(live, "");
    const refused = runCli(historyScript, ["--workspace", checked, "--jobs", "1"]);
    fs.rmSync(live);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain(`another history run (process ${process.pid}`);
    expect(fs.existsSync(leftover)).toBe(true);
    // A claim whose process has ended, and one a run on another machine left, are removed.
    fs.writeFileSync(path.join(history, `run.${host}.${2 ** 22 + 1}.dead.lock`), "");
    fs.writeFileSync(path.join(history, "run.0123456789ab.42.elsewhere.lock"), "");
    const resumed = runCli(historyScript, ["--workspace", checked, "--jobs", "1"]);
    expect(resumed.exitCode, resumed.stderr).toBe(0);
    expect(resumed.stderr).toContain(`the claim of process ${2 ** 22 + 1}, which has ended`);
    expect(resumed.stderr).toContain("the claim of a run on another machine");
    expect(resumed.stderr).toContain("removed 1 files a stopped run left half written");
    expect(fs.existsSync(leftover)).toBe(false);
    expect(fs.readdirSync(history).filter((name) => name.endsWith(".lock"))).toEqual([]);
  });

  it("removes its claim and its scratch trees when a signal stops it", async () => {
    const lens = (JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence).lens.key;
    for (const commit of ids) fs.rmSync(path.join(history, lens, `${commit}.json.gz`));
    // A temporary folder of the run's own: the system's is shared by every history run on the machine, another
    // builder's or another test file's, whose trees until 2026-11-19 read here as this run's leftovers three times in ten.
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "history-signal-"));
    temporary.push(scratch);
    const trees = (): string[] => fs.readdirSync(scratch).filter((name) => name.startsWith("live-docs-history-"));
    // The command itself under tsx's loader, not tsx's command line, so that the process signalled and waited for is the
    // one that cleans up, not a wrapper that relays the signal and exits on its own.
    const child = spawn(process.execPath, ["--import", pathToFileURL(tsxLoader).href, historyScript, "--workspace", checked, "--jobs", "2"], {
      env: { ...process.env, TMPDIR: scratch, TSX_TSCONFIG_PATH: tsconfigPath },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    const exited = new Promise<number | null>((resolve) => child.on("exit", (code) => resolve(code)));
    // Stopped once its summarizing processes are at work, its trees written and its claim held.
    await new Promise<void>((resolve) => {
      child.stderr.on("data", (text: string) => {
        stderr += text;
        if (stderr.includes("to regenerate")) resolve();
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(trees().length, "the run's trees stand when the signal comes").toBeGreaterThan(0);
    child.kill("SIGINT");
    expect(await exited).toBe(130);
    expect(fs.readdirSync(history).filter((name) => name.endsWith(".lock"))).toEqual([]);
    expect(trees()).toEqual([]);
    // The next run regenerates what the stopped one did not finish.
    const mended = runCli(historyScript, ["--workspace", checked, "--jobs", "2"]);
    expect(mended.exitCode, mended.stderr).toBe(0);
  }, 120_000);

  it("stops when asked before the cache is whole, writes no history, and keeps beside the current lens only the newest whole one", () => {
    const lens = (JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence).lens.key;
    // Two older lenses: one a whole history was written from, and one a run never finished.
    const whole = path.join(history, "0123456789abcdef");
    const partial = path.join(history, "fedcba9876543210");
    fs.mkdirSync(whole, { recursive: true });
    fs.writeFileSync(path.join(whole, "whole.json"), JSON.stringify({ head: "abc", changes: 3, at: "2026-11-01T00:00:00.000Z" }));
    fs.mkdirSync(partial, { recursive: true });
    fs.rmSync(path.join(history, lens, `${ids[1]}.json.gz`));
    fs.rmSync(path.join(history, "history.json"));
    const stopped = runCli(historyScript, ["--workspace", checked, "--jobs", "1", "--stop-after", "0", "--remove-superseded"]);
    expect(stopped.exitCode, stopped.stderr).toBe(3);
    expect(stopped.stdout).toContain(`History incomplete: stopped after 0 minutes, as asked: the cache at .mdmd/history/${lens} holds 2 of the 3 changes sampled`);
    expect(fs.existsSync(path.join(history, "history.json"))).toBe(false);
    expect(fs.existsSync(whole)).toBe(true);
    expect(fs.existsSync(partial)).toBe(false);
    // Once the current lens is whole, the other lens's cache goes, and the current one is marked whole.
    const done = runCli(historyScript, ["--workspace", checked, "--jobs", "1", "--remove-superseded"]);
    expect(done.exitCode, done.stderr).toBe(0);
    expect(fs.existsSync(whole)).toBe(false);
    expect(JSON.parse(fs.readFileSync(path.join(history, lens, "whole.json"), "utf8"))).toMatchObject({ head: ids[ids.length - 1], changes: 3 });
  });
});

/**
 * A repository whose one commit leaves thousands of entries out of its tree, made with `git hash-object` and `git
 * mktree`: a tree `vendor` of symbolic links out of the tree, which the history does not follow.
 */
describe("the history over a commit whose tree leaves thousands of entries out", () => {
  it("completes, names every entry not read, and keeps the list where a person finds it after the run", () => {
    const repository = fs.mkdtempSync(path.join(os.tmpdir(), "history-unwritten-"));
    temporary.push(repository);
    const run = (args: string[], input?: string): string => execFileSync("git", args, { cwd: repository, env: FIXTURE_GIT_ENV, input, encoding: "utf8", maxBuffer: 1 << 28 }).trim();
    run(["init", "--quiet", "-b", "main"]);
    const files = path.join(repository, "..", `${path.basename(repository)}-blobs`);
    temporary.push(files);
    fs.mkdirSync(files);
    const names = Array.from({ length: 3000 }, (_, index) => `module-with-a-long-name-${String(index).padStart(5, "0")}.ts`);
    names.forEach((name, index) => fs.writeFileSync(path.join(files, name), `/elsewhere/${index}.ts`));
    const ids = run(["hash-object", "-w", "--stdin-paths"], names.map((name) => path.join(files, name)).join("\n")).split("\n");
    const vendor = run(["mktree"], names.map((name, index) => `120000 blob ${ids[index]}\t${name}\n`).join(""));
    const kept = run(["hash-object", "-w", "--stdin"], "/** Kept. */\nexport const kept = 1;\n");
    const root = run(["mktree"], `100644 blob ${kept}\tkept.ts\n040000 tree ${vendor}\tvendor\n`);
    const commit = run(["commit-tree", root, "-m", "A tree that leaves thousands of entries out"], undefined);
    run(["update-ref", "refs/heads/main", commit]);

    const result = runCli(historyScript, ["--workspace", repository, "--jobs", "1"]);
    expect(result.exitCode, result.stderr.slice(-2000)).toBe(0);
    // Every entry not read is said, not the first few.
    expect(result.stderr.split("\n").filter((line) => line.includes("it is a symbolic link out of the tree"))).toHaveLength(3000);
    expect(result.stderr).toContain("3000 files at 1 commits were not written into their trees and so not read");
    // Where the run says the list is: the history folder under the default docs root, since this repository configures none.
    const listed = /The list is (\S+)/u.exec(result.stderr)![1];
    const history = path.dirname(path.join(repository, listed));
    const list = fs.readFileSync(path.join(repository, listed), "utf8").split("\n").filter((line) => line !== "" && !line.startsWith("#"));
    expect(list).toHaveLength(3000);
    expect(list[0]).toBe(`${commit}\t"vendor/${names[0]}"\tit is a symbolic link out of the tree, which the history does not follow`);
    const sequence = JSON.parse(fs.readFileSync(path.join(history, "history.json"), "utf8")) as HistorySequence;
    const summary = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(history, sequence.lens.key, `${commit}.json.gz`))).toString("utf8")) as CommitSummary;
    expect(summary.unwritten).toHaveLength(3000);
    expect(summary.files.map((file) => file.path)).toEqual(["kept.ts"]);
  }, 300_000);
});

/**
 * The commit's shape, regenerated here as a first run over its source sees
 * it: its tree checked out with the mirror it committed removed, the
 * generator run over it, and the derived graph summarized by this test's own
 * reading.
 */
async function regeneratedShape(root: string, commit: string): Promise<{ shape: Shape; symbols: Map<string, string[][]>; links: string[] }> {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "history-oracle-"));
  const tree = path.join(scratch, "tree");
  git(root, ["worktree", "add", "--detach", "--quiet", tree, commit]);
  try {
    fs.rmSync(path.join(tree, CONFIG.root, CONFIG.baseLayer), { recursive: true, force: true });
    const config = normalizeLiveDocumentationConfig(CONFIG);
    await generateLiveDocs({ workspaceRoot: tree, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
    const graph = await readLiveDocGraph({ workspaceRoot: tree, config });
    // The oracle reads files, wires, symbols and links from a fresh generation; the doc links are held to the script in their own test.
    const shape: Shape = { files: new Map(), edges: new Map(), docLinks: new Set() };
    const symbols = new Map<string, string[][]>();
    const links = new Map<string, number>();
    for (const file of Object.values(graph.files)) {
      shape.files.set(file.codePath, { archetype: file.archetype ?? "", symbols: file.symbols.length, entry: file.entries.length > 0 });
      symbols.set(file.codePath, file.symbols.map((symbol) => [symbol.name, symbol.slug ?? "", symbol.kind]));
      for (const edge of file.edges) {
        if (edge.to && edge.to !== file.codePath) {
          const key = edgeKey(file.codePath, edge.to);
          shape.edges.set(key, (shape.edges.get(key) ?? 0) + 1);
          const link = linkWords({ from: file.codePath, fromSymbol: edge.from, to: edge.to, toSymbol: edge.toSymbol, kind: edge.kind, count: 0 });
          links.set(link, (links.get(link) ?? 0) + 1);
        }
      }
    }
    return { shape, symbols, links: [...links].map(([link, count]) => `${link} x${count}`).sort() };
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

/** A link in words: its ends and its kind, and with a count when it has one. */
function linkWords(link: RowLink): string {
  const words = `${link.from}#${link.fromSymbol ?? ""} -${link.kind}-> ${link.to}#${link.toSymbol ?? ""}`;
  return link.count > 0 ? `${words} x${link.count}` : words;
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
