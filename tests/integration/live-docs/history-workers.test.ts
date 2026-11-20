/**
 * A worker of the history summarizes change after change in one process, its tree brought forward between them; each
 * of its summaries must be the summary a fresh process makes of that change in a tree written anew. The scripted
 * repository's seven commits hold what a process could carry wrongly from one change to the next: files git tracks
 * though an ignore file names them (asked of the tree's own index through the tree's git environment), documents
 * linked from the docs that come and go (asked of the same index), files renamed, removed and rewritten. One run gives
 * every change to one worker; another gives each change a worker of its own (as many workers as changes, each taking
 * one); the two caches must agree byte for byte, summaries and texts (the record of 2026-11-20,
 * `Probes/history-rebuild-fast`).
 */
import { fork, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import * as zlib from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import type { LiveDocGraph } from "../../../packages/engine/src/live-docs/graph";
import type { HistoryLens } from "../../../packages/engine/src/live-docs/history/format";
import { summarizedConfiguration } from "../../../packages/engine/src/live-docs/history/lens";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { regenerate, Scratch, summarizingEnvironment, summarizingFlags, type Worker } from "../../../packages/generator/src/history/regenerate";
import type { WorkerReport, WorkerTask } from "../../../packages/generator/src/history/summarizeChange";
import { buildRepository, CHECKED_SCRIPT, COLLISION_SCRIPT, git, SCRIPT, SCRIPTED_CONFIG } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const historyScript = path.join(repoRoot, "scripts", "live-docs", "history.ts");

// A private, short temporary folder for the trees and for tsx's socket, shared with no other run on the machine.
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "lw-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

function history(workspace: string, jobs: number): string {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", workspace, "--jobs", String(jobs)], {
    encoding: "utf8",
    env: { ...process.env, TMPDIR: privateTemporary }
  });
  if (result.error) throw result.error;
  expect(result.status, result.stderr).toBe(0);
  return result.stderr + result.stdout;
}

/**
 * Every summary and text of a lens's cache folder by its path within it: a summary unzipped, a text as stored. The
 * run's own records beside them (`whole.json`, which names when and how the run went) are no part of a summary.
 */
function cacheOf(workspace: string): Map<string, string> {
  const historyFolder = path.join(workspace, ".mdmd", "history");
  const lenses = fs.readdirSync(historyFolder, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^[0-9a-f]{16}$/u.test(entry.name));
  expect(lenses).toHaveLength(1);
  const cache = path.join(historyFolder, lenses[0].name);
  const files = new Map<string, string>();
  for (const entry of fs.readdirSync(cache, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const relative = path.relative(cache, file).split(path.sep).join("/");
    const summary = /^[0-9a-f]{40}\.json\.gz$/u.test(relative);
    if (!summary && !relative.startsWith("texts/")) continue;
    const bytes = fs.readFileSync(file);
    files.set(relative, summary ? zlib.gunzipSync(bytes).toString("utf8") : bytes.toString("utf8"));
  }
  return files;
}

describe("a worker's summaries, change after change in one process", () => {
  // The seven commits, with documents linked that come and go; a file git tracks though an ignore file names it; renames.
  // A name of 300 characters, which no disk here holds, in every commit: every tree after the first is written anew in a
  // fresh folder, so each tree's git environment differs from the last's, and a worker that kept an earlier tree's
  // would ask the wrong index (the second review of 2026-11-20 found no other case holding that guard by itself).
  const LONG_NAME = { [`long/${"x".repeat(300)}.txt`]: "a name no disk here holds\n" };
  it.each([
    ["the scripted repository", SCRIPT, "brought forward"],
    ["the repository with a file tracked and ignored", CHECKED_SCRIPT, "brought forward"],
    ["the repository of renames onto a dead file's path", COLLISION_SCRIPT, "brought forward"],
    ["the scripted repository with a name no disk here holds", SCRIPT.map((commit) => ({ ...commit, indexOnly: LONG_NAME })), "written anew"]
  ])("are those of a fresh process for each change, byte for byte: %s", (name, script, trees) => {
    const together = fs.mkdtempSync(path.join(privateTemporary, "together-"));
    const apart = fs.mkdtempSync(path.join(privateTemporary, "apart-"));
    const commits = buildRepository(together, script);
    expect(buildRepository(apart, script), name).toEqual(commits);
    const one = history(together, 1);
    // One worker, its tree brought forward at every change after the first, or written anew at every one.
    expect(one.match(/\d+\/\d+ regenerated: /gu)).toHaveLength(commits.length);
    expect(one.match(/its tree written anew/gu)).toHaveLength(trees === "brought forward" ? 1 : commits.length);
    history(apart, commits.length);
    const a = cacheOf(together);
    const b = cacheOf(apart);
    expect([...a.keys()].sort()).toEqual([...b.keys()].sort());
    for (const [file, text] of b) expect(a.get(file), file).toBe(text);
    expect([...a.keys()].filter((file) => file.endsWith(".json.gz"))).toHaveLength(commits.length);
  }, 300_000);
});

// A whole second, so that the time set reads back exactly (a time read with its fraction does not).
const HELD_TIME = 1_700_000_000;

/** The workspace's files, written over what stands; `held` names the files and folders whose modification time is then set to one time. */
function writeOver(folder: string, files: Record<string, string>, held: readonly string[] = []): void {
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
    fs.writeFileSync(path.join(folder, file), text);
  }
  for (const relative of held) fs.utimesSync(path.join(folder, relative), HELD_TIME, HELD_TIME);
}

/** What the generator derives of each file of the workspace: its edges, and the files it reaches and is reached from. */
async function generatedGraph(folder: string): Promise<Record<string, unknown>> {
  const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" });
  const quiet = (): undefined => undefined;
  const result = await generateLiveDocs({ workspaceRoot: folder, config: configuration, keepAuthoredStaleDocs: false, logger: { info: quiet, warn: quiet, error: quiet } });
  expect(result.failed).toEqual([]);
  const graph = JSON.parse(fs.readFileSync(path.join(folder, result.index!), "utf8")) as LiveDocGraph;
  return Object.fromEntries(Object.entries(graph.files).map(([file, doc]) => [file, { edges: doc.edges, outbound: doc.outbound, inbound: doc.inbound }]));
}

describe("the language adapters' caches, in one process generating commit after commit in one folder", () => {
  // A worker generates every change of its run in one folder, as the history's tree is brought forward in place. What
  // an adapter keeps of a file or a folder by its absolute path lives for one generation: the second generation must
  // derive what a fresh process derives, which a fresh folder stands for here, since no cache has met its paths. Each
  // case is built so that a fact kept from the first generation would give another graph: a cache with no guard (Rust's
  // packages), and caches guarded by a modification time, which a coarse disk or a fast writer can leave unchanged
  // (held here). Until 2026-11-20 these caches lived for the process, and the worker renamed its tree at every change.
  it.each([
    [
      "Rust: a library gains the manifest that names its crate, and the program is touched",
      {
        "app/Cargo.toml": `[package]\nname = "app"\nversion = "0.1.0"\n\n[dependencies]\nfancy = { path = "../mylib" }\n`,
        "app/src/main.rs": `use fancy::greet;\n\nfn main() {\n    greet();\n}\n`,
        "mylib/src/lib.rs": `/// Says hello.\npub fn greet() {}\n`
      },
      { "mylib/Cargo.toml": `[package]\nname = "fancy"\nversion = "0.1.0"\n`, "app/src/main.rs": `use fancy::greet;\n\nfn main() {\n    greet();\n    greet();\n}\n` },
      []
    ],
    [
      "Python: a module appears in a folder whose time stands, and another is rewritten in place",
      {
        "app/__init__.py": "",
        "app/main.py": `from .helpers import shout\nfrom .lib import second\n\n\ndef run():\n    return shout(second())\n`,
        "app/lib.py": `def first():\n    return 1\n`
      },
      { "app/helpers.py": `def shout(text):\n    return text\n`, "app/lib.py": `def second():\n    return 2\n` },
      ["app", "app/lib.py"]
    ],
    [
      "C: a header appears in a folder whose time stands",
      { "src/main.c": `#include "util.h"\n\nint main(void) {\n  return twice(1);\n}\n` },
      { "src/util.h": `int twice(int value);\n` },
      ["src"]
    ],
    [
      "C#: a type's file is rewritten in place to declare the type a program uses",
      {
        "src/Program.cs": `namespace Demo\n{\n    public class Program\n    {\n        public Widget Make() => new Widget();\n    }\n}\n`,
        "src/Shapes.cs": `namespace Demo\n{\n    public class Gadget\n    {\n    }\n}\n`
      },
      { "src/Shapes.cs": `namespace Demo\n{\n    public class Widget\n    {\n    }\n}\n` },
      ["src/Shapes.cs"]
    ],
    [
      "Java: a type's file is rewritten in place to declare the type a program uses",
      {
        "src/demo/Program.java": `package demo;\n\npublic class Program {\n    public Widget make() {\n        return new Widget();\n    }\n}\n`,
        "src/demo/Shapes.java": `package demo;\n\nclass Gadget {\n}\n`
      },
      { "src/demo/Shapes.java": `package demo;\n\nclass Widget {\n}\n` },
      ["src/demo/Shapes.java"]
    ],
    [
      "Go: a package's file is rewritten in place to declare the function a program calls",
      {
        "go.mod": `module example.com/demo\n\ngo 1.21\n`,
        "main.go": `package main\n\nimport "example.com/demo/lib"\n\nfunc main() {\n\tlib.Helper()\n}\n`,
        "lib/lib.go": `package lib\n\n// Other does nothing.\nfunc Other() {}\n`
      },
      { "lib/lib.go": `package lib\n\n// Helper does nothing.\nfunc Helper() {}\n` },
      ["lib/lib.go"]
    ]
  ])("derive what a fresh process derives: %s", async (_name, first, second, held) => {
    const reused = fs.mkdtempSync(path.join(privateTemporary, "reused-"));
    writeOver(reused, first, held);
    const before = await generatedGraph(reused);
    // As a tree brought forward: the docs root removed whole, the change's files written over the last change's.
    fs.rmSync(path.join(reused, ".mdmd"), { recursive: true, force: true });
    writeOver(reused, second, held);
    const fresh = fs.mkdtempSync(path.join(privateTemporary, "fresh-"));
    writeOver(fresh, { ...first, ...second });
    const expected = await generatedGraph(fresh);
    // The case means something only where the change changes the graph.
    expect(expected).not.toEqual(before);
    expect(await generatedGraph(reused)).toEqual(expected);
  }, 120_000);
});

describe("a worker in a repository git would not look for with a bare environment", () => {
  // A Docker bind mount with another owner, a container job, a repository on another drive: git's discovery refuses a
  // repository whose folder another owns unless the person's configuration names it `safe.directory`, which a worker's
  // bare environment cannot see. Git's own knob for that refusal stands in for the other owner; the pool's environment
  // strips it, so the worker is forked here with it. Until 2026-11-20 the worker looked for the repository itself.
  it("makes its summary, handed the repository's git directory", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "owned-"));
    const [commit] = buildRepository(repository, SCRIPT.slice(0, 1));
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
    const folder = fs.mkdtempSync(path.join(privateTemporary, "worker-"));
    const worker = path.join(repoRoot, "packages", "generator", "src", "history", "summarizeChange.ts");
    const environment = { ...summarizingEnvironment({ ...process.env, TMPDIR: privateTemporary, TSX_TSCONFIG_PATH: tsconfigPath }), GIT_TEST_ASSUME_DIFFERENT_OWNER: "1" };
    const child = fork(worker, ["--worker", store, folder], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: environment, execArgv: summarizingFlags(worker) });
    let errors = "";
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (text: string) => {
      errors += text;
    });
    const task: WorkerTask = {
      configuration: summarizedConfiguration(normalizeLiveDocumentationConfig(SCRIPTED_CONFIG)),
      lens: "0123456789abcdef",
      commit,
      summaryPath: path.join(cache, `${commit}.json.gz`),
      textStore: path.join(cache, "texts")
    };
    try {
      const report = await new Promise<WorkerReport>((resolve, reject) => {
        child.once("message", (message) => resolve(message as WorkerReport));
        child.once("exit", (code) => reject(new Error(`the worker ended (exit ${code}): ${errors}`)));
        child.send(task);
      });
      expect(report.unwritten).toEqual([]);
      const summary = JSON.parse(zlib.gunzipSync(fs.readFileSync(task.summaryPath)).toString("utf8")) as { commit: string; files: Array<{ path: string }> };
      expect(summary.commit).toBe(commit);
      expect(summary.files.map((file) => file.path)).toContain("src/app/main.ts");
    } finally {
      child.disconnect();
    }
  }, 120_000);
});

describe("a worker whose tree-sitter runtime faults", () => {
  // The runtime restores none of its state when a call into it throws, so a fault after a worker's first change may come
  // of a state an earlier change left (the independent review of 2026-11-20, its fourth round). A trap is stood in for
  // by node's own `--import`, given to this worker alone: every parse throws a `RuntimeError` once a file stands.
  it("writes nothing of a change after its first in which it faulted, and a fresh worker writes that change", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "faulted-"));
    const config = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
    const commits = buildRepository(repository, [
      { message: "A module", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(config)}\n`, "src/m.py": "import os\n" } },
      { message: "The module grows", date: "2026-01-06T10:00:00+00:00", write: { "src/m.py": "import os\n\n\ndef f():\n    return os.sep\n" } }
    ]);
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
    const fault = path.join(privateTemporary, `fault-${process.pid}`);
    const runtime = pathToFileURL(path.join(repoRoot, "package.json")).href;
    const trap = `import { createRequire } from "node:module"; import { existsSync } from "node:fs"; const { Parser } = createRequire(${JSON.stringify(runtime)})("web-tree-sitter"); const parse = Parser.prototype.parse; Parser.prototype.parse = function (...given) { if (existsSync(${JSON.stringify(fault)})) throw new WebAssembly.RuntimeError("a stand-in trap"); return parse.apply(this, given); };`;
    const task = (commit: string): WorkerTask => workerTask(config, cache, commit);
    const start = () => startRealWorker(store, [trap]);
    const first = start();
    try {
      const sound = await first.summarize(task(commits[0]));
      expect([sound.published, sound.marked]).toEqual([true, []]);
      const kept = fs.readdirSync(cache, { recursive: true });
      fs.writeFileSync(fault, "");
      const faulted = await first.summarize(task(commits[1]));
      expect([faulted.published, faulted.marked]).toEqual([false, ["unmapped", "runtime"]]);
      // Nothing of the change reached the cache: no summary, no text.
      expect(fs.readdirSync(cache, { recursive: true })).toEqual(kept);
    } finally {
      first.end();
    }
    const fresh = start();
    try {
      const report = await fresh.summarize(task(commits[1]));
      expect([report.published, report.marked]).toEqual([true, ["unmapped", "runtime"]]);
      // The file the fault left unmapped is named, not dropped in silence, and no doc of another day stands in for it.
      const summary = JSON.parse(zlib.gunzipSync(fs.readFileSync(task(commits[1]).summaryPath)).toString("utf8")) as { files: Array<{ path: string }>; unmapped?: Array<[string, string]> };
      expect(summary.unmapped).toEqual([["src/m.py", "a stand-in trap"]]);
      expect(summary.files.map((file) => file.path)).not.toContain("src/m.py");
    } finally {
      fresh.end();
      fs.rmSync(fault, { force: true });
    }
  }, 120_000);
});

/** A worker's task for a change of a repository whose configuration is `config`, its summary and texts going to `cache`. */
function workerTask(config: object, cache: string, commit: string): WorkerTask {
  return {
    configuration: summarizedConfiguration(normalizeLiveDocumentationConfig(config)),
    lens: "0123456789abcdef",
    commit,
    summaryPath: path.join(cache, `${commit}.json.gz`),
    textStore: path.join(cache, "texts")
  };
}

/**
 * A real worker, forked as the pool forks it, in a folder of its own, with each of `imports` (a module's source) given
 * to it alone through node's own `--import`, to stand in for a fault the product has no door to.
 */
function startRealWorker(store: string, imports: readonly string[] = []): { summarize: (task: WorkerTask) => Promise<WorkerReport>; end: () => void } {
  const worker = path.join(repoRoot, "packages", "generator", "src", "history", "summarizeChange.ts");
  const folder = fs.mkdtempSync(path.join(privateTemporary, "worker-"));
  const flags = imports.flatMap((source) => ["--import", `data:text/javascript,${encodeURIComponent(source)}`]);
  const child = fork(worker, ["--worker", store, folder], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: summarizingEnvironment({ ...process.env, TMPDIR: privateTemporary, TSX_TSCONFIG_PATH: tsconfigPath }), execArgv: [...summarizingFlags(worker), ...flags] });
  let errors = "";
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (text: string) => {
    errors += text;
  });
  const summarize = (task: WorkerTask): Promise<WorkerReport> =>
    new Promise<WorkerReport>((resolve, reject) => {
      child.once("message", (message) => resolve(message as WorkerReport));
      child.once("exit", (code) => reject(new Error(`the worker ended (exit ${code}): ${errors}`)));
      child.send(task);
    });
  return { summarize, end: () => child.disconnect() };
}

/** A summary of the cache, unzipped, with what it says of the files and of those it could not map. */
function readSummary(task: WorkerTask): { text: string; files: string[]; unmapped?: Array<[string, string]> } {
  const text = zlib.gunzipSync(fs.readFileSync(task.summaryPath)).toString("utf8");
  const summary = JSON.parse(text) as { files: Array<{ path: string; symbols?: unknown }>; unmapped?: Array<[string, string]> };
  return { text, files: summary.files.map((file) => file.path), ...(summary.unmapped ? { unmapped: summary.unmapped } : {}) };
}

/** A TypeScript module whose one export is an array nested `depth` deep. */
function nestedTable(name: string, depth: number): string {
  return `export const ${name} = ${"[".repeat(depth)}1${"]".repeat(depth)};\n`;
}

describe("a file nested between a fresh process's limit and a warm one's", () => {
  // A worker that has summarized earlier changes has more stack to spare than a fresh process, since V8 has compiled
  // more: a table nested 1,000 deep is read warm and not fresh (the independent review of 2026-11-20 at `e1e27e33a`).
  // A file beyond the reading depth marks the worker, so that a fresh process decides the change.
  it("gives the summary a fresh process makes of the change alone, byte for byte, whichever worker meets it", () => {
    // Forty tables nested within the reading depth warm a worker's parser, which V8 then compiles to smaller frames; the
    // last change removes them, so that a fresh process given it alone is not warmed by them within its own generation.
    const warm = Object.fromEntries(Array.from({ length: 40 }, (_, index) => [`src/warm/t${index}.ts`, nestedTable(`t${index}`, 250)]));
    const script = [
      { ...SCRIPT[0], write: { ...SCRIPT[0].write, ...warm } },
      ...SCRIPT.slice(1, 3),
      { message: "A deep table", date: "2026-06-01T10:00:00+00:00", remove: Object.keys(warm), write: { "src/table.ts": nestedTable("table", 1000) } }
    ];
    const together = fs.mkdtempSync(path.join(privateTemporary, "deep-together-"));
    const apart = fs.mkdtempSync(path.join(privateTemporary, "deep-apart-"));
    const commits = buildRepository(together, script);
    expect(buildRepository(apart, script)).toEqual(commits);
    const one = history(together, 1);
    history(apart, commits.length);
    const a = cacheOf(together);
    const b = cacheOf(apart);
    const last = `${commits[3]}.json.gz`;
    expect(JSON.parse(a.get(last)!).files.length, "files in the warm worker's summary").toBe(JSON.parse(b.get(last)!).files.length);
    expect([...a.keys()].sort()).toEqual([...b.keys()].sort());
    for (const [file, text] of b) expect(a.get(file), file).toBe(text);
    // The warm worker read the table, and was marked for its depth alone; the fresh process could not map it.
    expect(one).toContain(`${commits[3].slice(0, 8)}: its worker, which had summarized earlier changes, was marked: a file nested beyond the reading depth; summarized again in a fresh worker`);
    expect(one).toContain(`${commits[3].slice(0, 8)}: decided by a fresh process, its worker ended after it: a file the generator could not map`);
  }, 300_000);
});

describe("a file the generator cannot map", () => {
  // Until 2026-11-20 such a file was left out of the summary in silence, and a doc committed for it on an earlier day
  // was read into the graph as that day's reading (the independent review of 2026-11-20 at `e1e27e33a`).
  it("is named in the summary, and the doc committed for it on another day does not stand in", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "unmapped-"));
    const config = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
    buildRepository(repository, [{ message: "A table", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(config)}\n`, "src/table.ts": "export const oldTable = [1];\n" } }]);
    // The table's doc, committed as a person's workspace commits it.
    const quiet = (): undefined => undefined;
    const generated = await generateLiveDocs({ workspaceRoot: repository, config: normalizeLiveDocumentationConfig(config), logger: { info: quiet, warn: quiet, error: quiet } });
    expect(generated.failed).toEqual([]);
    git(repository, ["add", "--all"]);
    git(repository, ["commit", "--quiet", "-m", "Its docs"], { GIT_AUTHOR_DATE: "2026-01-06T10:00:00+00:00", GIT_COMMITTER_DATE: "2026-01-06T10:00:00+00:00" });
    // The table nested beyond what a fresh process reads, renamed, and its doc not generated again.
    fs.writeFileSync(path.join(repository, "src", "table.ts"), nestedTable("newTable", 1000));
    git(repository, ["add", "--all"]);
    git(repository, ["commit", "--quiet", "-m", "A deep table"], { GIT_AUTHOR_DATE: "2026-01-07T10:00:00+00:00", GIT_COMMITTER_DATE: "2026-01-07T10:00:00+00:00" });
    const commit = git(repository, ["rev-parse", "HEAD"]).trim();
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const task = workerTask(config, fs.mkdtempSync(path.join(privateTemporary, "cache-")), commit);
    const worker = startRealWorker(store);
    try {
      const report = await worker.summarize(task);
      expect(report.published).toBe(true);
      expect(report.marked).toContain("unmapped");
      const summary = readSummary(task);
      expect(summary.files).not.toContain("src/table.ts");
      expect(summary.text).not.toContain("oldTable");
      expect(summary.unmapped).toEqual([["src/table.ts", "Maximum call stack size exceeded"]]);
    } finally {
      worker.end();
    }
  }, 120_000);

  // The reason of a failure the disk gives names the path it failed on, which lies in the worker's own folder.
  it("reads the same in a summary made by any worker in any folder", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "unmapped-name-"));
    const config = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
    // A name the disk holds, whose doc's name it does not (`<name>.mdmd.md` is longer than 255 bytes).
    const long = `src/${"n".repeat(247)}.ts`;
    const [commit] = buildRepository(repository, [{ message: "A long name", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(config)}\n`, [long]: "export const x = 1;\n", "src/a.ts": "export const a = 1;\n" } }]);
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const made: string[] = [];
    for (const _worker of [0, 1]) {
      const task = workerTask(config, fs.mkdtempSync(path.join(privateTemporary, "cache-")), commit);
      const worker = startRealWorker(store);
      try {
        const report = await worker.summarize(task);
        expect(report.published).toBe(true);
        const summary = readSummary(task);
        expect(summary.unmapped?.map(([file]) => file)).toEqual([long]);
        expect(summary.unmapped?.[0][1]).toMatch(/^ENAMETOOLONG/u);
        made.push(summary.text);
      } finally {
        worker.end();
      }
    }
    expect(made[1]).toBe(made[0]);
  }, 120_000);
});

describe("the tree's git environment", () => {
  // Set in the worker only while it summarizes in that tree, so that nothing the worker runs between two summaries (the
  // next tree's writer, whose readers of objects inherit the process's environment) sees another tree's index or work
  // tree. The worker's report is stood in for by node's own `--import`, which adds the `GIT_` names its process holds.
  it("is gone from the worker once each summary is made", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "environment-"));
    const commits = buildRepository(repository, SCRIPT.slice(0, 2));
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
    const told = `const send = process.send.bind(process); process.send = (message, ...rest) => send({ ...message, held: Object.keys(process.env).filter((name) => name.startsWith("GIT_")) }, ...rest);`;
    const worker = startRealWorker(store, [told]);
    try {
      for (const commit of commits) {
        const report = (await worker.summarize(workerTask(SCRIPTED_CONFIG, cache, commit))) as WorkerReport & { held: string[] };
        expect(report.published).toBe(true);
        expect(report.held).toEqual([]);
      }
    } finally {
      worker.end();
    }
  }, 120_000);
});

describe("a failure of the machine's, not the file's", () => {
  // Too many open files, a full disk, a file Windows holds: no property of the change, so a summary made with one is
  // never written. A stand-in failure of `readFile` on one file, given to every worker, through node's own `--import`.
  const runtime = pathToFileURL(path.join(repoRoot, "package.json")).href;
  const failure = `import { createRequire } from "node:module"; const promises = createRequire(${JSON.stringify(runtime)})("node:fs/promises"); const readFile = promises.readFile; promises.readFile = function (file, ...rest) { if (String(file).endsWith("src/m.py")) return Promise.reject(Object.assign(new Error("EMFILE: too many open files, open 'src/m.py'"), { code: "EMFILE", syscall: "open", errno: -24 })); return readFile.call(this, file, ...rest); };`;

  it("is not written, is tried once more by a fresh worker, and then stops the run", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "machine-"));
    const config = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
    const [commit] = buildRepository(repository, [{ message: "A module", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(config)}\n`, "src/m.py": "import os\n" } }]);
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
    const configuration = normalizeLiveDocumentationConfig(config);
    const progress: string[] = [];
    let started = 0;
    const startWorker = async (): Promise<Worker> => {
      started += 1;
      const worker = startRealWorker(store, [failure]);
      return { summarize: (change) => worker.summarize(workerTask(config, cache, change.id)), end: async () => worker.end() };
    };
    const change = { id: commit, parents: [], date: "2026-01-05T10:00:00Z", author: "Ada", subject: "A module" };
    await expect(
      regenerate([change], { store, configuration, lens: { key: "0123456789abcdef", configuration } as unknown as HistoryLens, cacheFolder: cache, keepIndex: false, jobs: 1, memory: 1e12, scratch: new Scratch(), progress: (line) => progress.push(line), startWorker })
    ).rejects.toThrow(`the summary of ${commit} failed twice for a cause of the machine's: src/m.py: EMFILE: too many open files`);
    expect(started).toBe(2);
    expect(progress.filter((line) => line.includes("summarized again in a fresh worker"))).toHaveLength(1);
    // Nothing of the change reached the cache.
    expect(fs.readdirSync(cache)).toEqual([]);
  }, 120_000);
});
