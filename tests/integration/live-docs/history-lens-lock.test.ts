/**
 * The lens keys this repository's dependency lock only through the entries of the packages the summarizing process can
 * load (`keyedLockEntries` in `generatorIdentity.ts`). A package the process loads that the key leaves out would let the
 * cache serve, in silence, a summary another installation made; so this case runs a real worker, through the same
 * entry the history command starts, over a small repository in every language the engine reads, and records every
 * path the worker reads or looks for, by Node's permission model in its audit mode, which refuses nothing and reports
 * each access no `--allow-fs-read` names. The grammars are WebAssembly files read from disk, not modules, and are
 * reported as any other read. Every read under a `node_modules` folder must fall inside a keyed entry of the lock
 * (since 2026-11-20).
 *
 * What the recording cannot see: the reads of a thread, which the permission model does not report, so that a thread
 * started through the public `Worker` fails the case by its script's name (esbuild's own is kept in the main thread by
 * its variable `ESBUILD_WORKER_THREADS`), while a thread node starts itself, which no wrapper of `Worker` meets, is
 * not seen at all; what a child process reads, git or esbuild's binary, which are no Node processes; and a package
 * loaded only on a path this small repository does not take.
 */
import { fork } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { summarizedConfiguration } from "../../../packages/engine/src/live-docs/history/lens";
import { keyedLockEntries, LOCK_ROOTS } from "../../../packages/generator/src/history/generatorIdentity";
import { summarizingEnvironment, summarizingFlags } from "../../../packages/generator/src/history/regenerate";
import type { WorkerReport, WorkerTask } from "../../../packages/generator/src/history/summarizeChange";
import { buildRepository, git } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const lockPackages = (JSON.parse(fs.readFileSync(path.join(repoRoot, "package-lock.json"), "utf8")) as { packages: Record<string, Record<string, unknown>> }).packages;

// A private, short temporary folder for the tree, the cache and tsx's socket, shared with no other run on the machine.
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "ll-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

const CONFIG = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

/** One file or more in each language and manifest the engine reads, so that every grammar and every reader is loaded. */
const FILES: Record<string, string> = {
  ".live-docs.config.json": `${JSON.stringify(CONFIG)}\n`,
  "package.json": `{ "name": "polyglot", "version": "1.0.0" }\n`,
  "tsconfig.json": `{ "compilerOptions": { "strict": true, "jsx": "react-jsx" } }\n`,
  "src/main.ts": `import { twice } from "./util";\nimport { View } from "./view";\n\n/** Runs the app. */\nexport function main(): number {\n  return twice(View.length);\n}\n`,
  "src/util.ts": `/** Doubles a number. */\nexport function twice(value: number): number {\n  return value * 2;\n}\n`,
  "src/view.tsx": `/** Draws the app. */\nexport function View(): unknown {\n  return <div>app</div>;\n}\n`,
  "src/legacy.js": `export function old() {\n  return "legacy";\n}\n`,
  "py/pyproject.toml": `[project]\nname = "app"\nversion = "0.1.0"\n`,
  "py/app/__init__.py": "",
  "py/app/main.py": `"""The app's entry."""\nimport re\n\nfrom .helpers import shout\n\n\ndef run():\n    """Runs the app."""\n    return shout(re.sub(r"a+", "b", "aaa"))\n`,
  "py/app/helpers.py": `def shout(text):\n    return text.upper()\n`,
  "c/main.c": `#include "util.h"\n\nint main(void) {\n  return twice(1);\n}\n`,
  "c/util.h": `int twice(int value);\n`,
  "cpp/main.cpp": `#include <vector>\n\nclass Box {\n public:\n  int size() const { return 1; }\n};\n\nint main() {\n  return Box().size();\n}\n`,
  "cs/Demo.csproj": `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFramework>net8.0</TargetFramework>\n  </PropertyGroup>\n</Project>\n`,
  "cs/Program.cs": `namespace Demo\n{\n    /// <summary>The program.</summary>\n    public class Program\n    {\n        public Widget Make() => new Widget();\n    }\n\n    public class Widget\n    {\n    }\n}\n`,
  "cs/appsettings.json": `{ "Logging": { "LogLevel": { "Default": "Information" } } }\n`,
  "java/pom.xml": `<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>demo</groupId>\n  <artifactId>demo</artifactId>\n  <version>1.0</version>\n</project>\n`,
  "java/src/main/java/demo/Program.java": `package demo;\n\n/** The program. */\npublic class Program {\n    public Widget make() {\n        return new Widget();\n    }\n}\n`,
  "java/src/main/java/demo/Widget.java": `package demo;\n\nclass Widget {\n}\n`,
  "go/go.mod": `module example.com/demo\n\ngo 1.21\n`,
  "go/main.go": `package main\n\nimport "example.com/demo/lib"\n\nfunc main() {\n\tlib.Helper()\n}\n`,
  "go/lib/lib.go": `package lib\n\n// Helper does nothing.\nfunc Helper() {}\n`,
  "rust/Cargo.toml": `[package]\nname = "demo"\nversion = "0.1.0"\n`,
  "rust/src/main.rs": `mod lib;\n\nfn main() {\n    lib::greet();\n}\n`,
  "rust/src/lib.rs": `/// Says hello.\npub fn greet() {}\n`,
  "ruby/app.rb": `require_relative "helper"\n\n# The app.\nclass App\n  def run\n    Helper.new.call\n  end\nend\n`,
  "ruby/helper.rb": `class Helper\n  def call\n    1\n  end\nend\n`,
  "ps/Tools.psm1": `function Get-Thing {\n    param([string]$Name)\n    "thing $Name"\n}\n`,
  "ps/run.ps1": `. $PSScriptRoot/Tools.psm1\nGet-Thing -Name demo\n`,
  "web/index.html": `<!doctype html>\n<html><head><link rel="stylesheet" href="site.css"></head><body><script src="../src/legacy.js"></script></body></html>\n`,
  "web/site.css": `.app { color: red; }\n`,
  "db/schema.sql": `CREATE TABLE things (id INTEGER PRIMARY KEY, name TEXT);\n`,
  "docs/design.md": "# Design\n\nHow the app is put together.\n"
};

/**
 * Preloaded into the worker: every path the permission model reports read, once each, appended to `reads.txt` as it is
 * met, and the script of every thread started through the public `Worker`, to `threads.txt`. The permission model
 * neither restricts nor reports a thread's reads (Node 26: a read in a `Worker` passes unreported even where the main
 * thread's is refused), so such a thread is a part of the run the recording cannot see, and is named; a thread node
 * starts for itself does not pass through `Worker`, and is not.
 */
function recorder(folder: string): string {
  return [
    `const { subscribe } = require("node:diagnostics_channel");`,
    `const { appendFileSync } = require("node:fs");`,
    `const { syncBuiltinESMExports } = require("node:module");`,
    `const threads = require("node:worker_threads");`,
    `const reads = ${JSON.stringify(path.join(folder, "reads.txt"))};`,
    `const started = ${JSON.stringify(path.join(folder, "threads.txt"))};`,
    `const seen = new Set();`,
    `subscribe("node:permission-model:fs", (message) => {`,
    `  if (message.permission !== "FileSystemRead" || seen.has(message.resource)) return;`,
    `  seen.add(message.resource);`,
    `  appendFileSync(reads, \`\${message.resource}\\n\`);`,
    `});`,
    `const Worker = threads.Worker;`,
    `threads.Worker = class extends Worker {`,
    `  constructor(script, options) {`,
    `    appendFileSync(started, \`\${String(script)}\\n\`);`,
    `    super(script, options);`,
    `  }`,
    `};`,
    `syncBuiltinESMExports();`
  ].join("\n");
}

/** The lines of a record the recorder wrote, none when it wrote none. */
function recorded(file: string): string[] {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").filter((line) => line !== "") : [];
}

/**
 * The paths of `reads` under a `node_modules` folder that no keyed entry covers: within this repository, a path whose
 * nearest enclosing entry of the lock is not keyed, or that lies in no entry and stands on disk; anywhere else, any
 * path that stands. A path in no entry that does not stand is a place Node looked for a package and found none, which
 * the lock records by holding no entry there.
 */
function uncoveredReads(reads: Iterable<string>, keyed: ReadonlySet<string>): string[] {
  const uncovered = new Set<string>();
  for (const read of reads) {
    // Without regard to case: TypeScript asks whether the disk folds case by reading its own path in the other case.
    if (!read.split(path.sep).some((segment) => segment.toLowerCase() === "node_modules")) continue;
    const relative = path.relative(repoRoot, read).split(path.sep).join("/");
    if (!relative.startsWith("../") && !path.isAbsolute(relative)) {
      const segments = relative.split("/");
      let place: string | undefined;
      for (let length = segments.length; length > 0 && place === undefined; length -= 1) {
        const candidate = segments.slice(0, length).join("/");
        if (lockPackages[candidate] !== undefined) place = candidate;
      }
      if (place !== undefined) {
        if (!keyed.has(place)) uncovered.add(relative);
        continue;
      }
    }
    if (fs.existsSync(read)) uncovered.add(read);
  }
  return [...uncovered].sort();
}

/** Every path a worker reads while it summarizes the repository's one commit, and its report. */
async function readsOfASummary(): Promise<{ reads: Set<string>; threads: string[]; report: WorkerReport; summary: string }> {
  const repository = fs.mkdtempSync(path.join(privateTemporary, "repo-"));
  const [commit] = buildRepository(repository, [{ message: "Every language", date: "2026-01-05T10:00:00+00:00", write: FILES }]);
  const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
  const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
  const folder = fs.mkdtempSync(path.join(privateTemporary, "worker-"));
  const records = fs.mkdtempSync(path.join(privateTemporary, "reads-"));
  const preload = path.join(privateTemporary, "record-reads.cjs");
  fs.writeFileSync(preload, recorder(records));
  const worker = path.join(repoRoot, "packages", "generator", "src", "history", "summarizeChange.ts");
  // No `--allow-fs-read`, so that every read is reported; writes, processes, threads and WebAssembly are allowed, so
  // that only reads are reported (the recorder's own appends among the writes).
  const audit = ["--permission-audit", "--allow-fs-write=*", "--allow-child-process", "--allow-worker", "--allow-wasi", "--allow-addons", "--require", preload];
  // esbuild, which tsx compiles the sources with, runs its synchronous calls in a thread of its own unless told not to;
  // told not to, it finds and runs its binary from the main thread, whose reads are reported. What it loads is the same.
  const environment = { ...summarizingEnvironment({ ...process.env, TMPDIR: privateTemporary, TSX_TSCONFIG_PATH: tsconfigPath }), ESBUILD_WORKER_THREADS: "0" };
  const child = fork(worker, ["--worker", store, folder], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: environment, execArgv: [...audit, ...summarizingFlags(worker)] });
  let errors = "";
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (text: string) => {
    errors += text;
  });
  const task: WorkerTask = {
    configuration: summarizedConfiguration(normalizeLiveDocumentationConfig(CONFIG)),
    lens: "0123456789abcdef",
    commit,
    summaryPath: path.join(cache, `${commit}.json.gz`),
    textStore: path.join(cache, "texts")
  };
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  try {
    const report = await new Promise<WorkerReport>((resolve, reject) => {
      child.once("message", (message) => resolve(message as WorkerReport));
      child.once("exit", (code) => reject(new Error(`the worker ended (exit ${code}): ${errors}`)));
      child.send(task);
    });
    return { reads: new Set(recorded(path.join(records, "reads.txt"))), threads: recorded(path.join(records, "threads.txt")), report, summary: task.summaryPath };
  } finally {
    child.disconnect();
    await exited;
  }
}

describe("the lock's half of the lens's key", () => {
  it("covers every package a worker reads under node_modules, grammars among them, and finds one taken out", async () => {
    const { reads, threads, report, summary } = await readsOfASummary();
    expect(report.published).toBe(true);
    // No thread was started through `Worker`, whose reads the recording could not see.
    expect(threads).toEqual([]);
    expect(fs.existsSync(summary)).toBe(true);
    const relative = [...reads].map((read) => path.relative(repoRoot, read).split(path.sep).join("/"));
    // The recording sees what it must: the runtime's own WebAssembly, a grammar of the bundle and one of the engine's
    // own, read from disk, and the compiler's module; the loader the worker runs under, read before any summary; and
    // the compiler the loader runs, its binary found from the main thread.
    expect(relative).toContain("node_modules/web-tree-sitter/web-tree-sitter.wasm");
    expect(relative).toContain("node_modules/@vscode/tree-sitter-wasm/wasm/tree-sitter-python.wasm");
    expect(relative).toContain("packages/engine/grammars/powershell/tree-sitter-powershell.wasm");
    expect(relative).toContain("node_modules/typescript/lib/typescript.js");
    expect(relative.some((read) => read.startsWith("node_modules/tsx/"))).toBe(true);
    expect(relative.some((read) => read.startsWith("node_modules/@esbuild/"))).toBe(true);

    const keyed = new Set(keyedLockEntries(lockPackages).keys());
    expect(uncoveredReads(reads, keyed)).toEqual([]);

    // Red: with a package the worker loads taken out of the keyed set, its files are named.
    const withoutRuntime = new Set([...keyed].filter((place) => place !== "node_modules/web-tree-sitter"));
    expect(uncoveredReads(reads, withoutRuntime)).toContain("node_modules/web-tree-sitter/web-tree-sitter.wasm");
    // Red: without the launcher named as a root, the launcher and what it alone brings are named.
    const withoutLauncher = new Set(keyedLockEntries(lockPackages, undefined, LOCK_ROOTS.filter((root) => root.name !== "tsx")).keys());
    expect(uncoveredReads(reads, withoutLauncher).some((read) => read.startsWith("node_modules/tsx/"))).toBe(true);
  }, 180_000);
});
