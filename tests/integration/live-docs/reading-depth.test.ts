/**
 * The reading depth's margin, and its proof. A file nested deeper than `READING_DEPTH` marks the process that reads
 * it, and the history gives a marked change to a fresh process (`processMark.ts`); below the depth, a summary must not
 * depend on which worker made it, which holds only if no process, however cold, runs out of stack there. The ruling
 * of 2026-11-20 sets the depth at most half the smallest depth at which a fresh process fails any kind of nesting a
 * reader can meet. So each kind is written here, alone in a repository of one commit, nested to twice the depth by
 * the depth's own measure, and given as the first change of a worker started as the pool starts one: the worker must
 * read it, unmapped by nothing, marked for its depth alone. A later TypeScript, grammar or Node that lowers a cold limit
 * below twice the depth turns this red (the record of 2026-11-20, `Probes/history-rebuild-speed/depth-probe.md`).
 */
import { fork } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readTree, type SyntaxNode } from "../../../packages/engine/src/live-docs/adapters/treeSitter";
import { summarizedConfiguration } from "../../../packages/engine/src/live-docs/history/lens";
import { READING_DEPTH } from "../../../packages/engine/src/live-docs/processMark";
import { summarizingEnvironment, summarizingFlags } from "../../../packages/generator/src/history/regenerate";
import type { WorkerReport, WorkerTask } from "../../../packages/generator/src/history/summarizeChange";
import { buildRepository, git } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const worker = path.join(repoRoot, "packages", "generator", "src", "history", "summarizeChange.ts");
const CONFIG = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

// A private, short temporary folder for the repositories, the trees and tsx's socket, shared with no other run.
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "rd-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

/** The tree-sitter grammar each extension is read with (`c.ts` reads C with the C++ grammar); TypeScript otherwise. */
const GRAMMARS: Record<string, string> = { ".py": "python", ".c": "cpp", ".cpp": "cpp", ".cs": "c-sharp", ".java": "java", ".go": "go", ".rs": "rust", ".ps1": "powershell" };

const r = (text: string, n: number): string => text.repeat(n);
/** `n` lines, each indented one space more than the last, then a last line: a block nested in a block, by indentation. */
const indented = (line: string, n: number, last: string): string =>
  Array.from({ length: n }, (_, i) => `${" ".repeat(i)}${line}\n`).join("") + `${" ".repeat(n)}${last}\n`;

/** A kind of nesting: the file it is written in, and its text at `n` levels or terms. */
type Construct = [name: string, file: string, text: (n: number) => string];

/**
 * Every kind of nesting the readers meet: for TypeScript its brackets, its nested scopes and its long chains, left
 * and right; for each tree-sitter grammar the product reads, its brackets, its blocks and its chains.
 */
const CONSTRUCTS: Construct[] = [
  ["TypeScript: nested arrays", "m.ts", (n) => `export const x = ${r("[", n)}1${r("]", n)};\n`],
  ["TypeScript: nested objects", "m.ts", (n) => `export const x = ${r("{a:", n)}1${r("}", n)};\n`],
  ["TypeScript: parentheses", "m.ts", (n) => `export const x = ${r("(", n)}1${r(")", n)};\n`],
  ["TypeScript: nested calls", "m.ts", (n) => `declare function f(x?: unknown): unknown;\nexport const x = ${r("f(", n)}${r(")", n)};\n`],
  ["TypeScript: arrow functions", "m.ts", (n) => `export const x = ${r("() => ", n)}1;\n`],
  ["TypeScript: blocks", "m.ts", (n) => `export function f() {${r("{", n)}${r("}", n)}}\n`],
  ["TypeScript: if chains", "m.ts", (n) => `export function f(a: boolean) {${r("if (a) {} else ", n)}{}}\n`],
  ["TypeScript: ternaries", "m.ts", (n) => `declare const a: boolean;\nexport const x = ${r("a ? 1 : ", n)}2;\n`],
  ["TypeScript: JSX elements", "m.tsx", (n) => `export const x = ${r("<a>", n)}${r("</a>", n)};\n`],
  ["TypeScript: template literals", "m.ts", (n) => `export const x = ${r("`${", n)}1${r("}`", n)};\n`],
  ["TypeScript: type literals", "m.ts", (n) => `export type T = ${r("{a:", n)}number${r("}", n)};\n`],
  ["TypeScript: type arguments", "m.ts", (n) => `export type T = ${r("Array<", n)}number${r(">", n)};\n`],
  ["TypeScript: type arguments in calls", "m.ts", (n) => `declare function f<X>(): X;\nexport const x = f<${r("Array<", n)}number${r(">", n)}>();\n`],
  ["TypeScript: array types", "m.ts", (n) => `export type T = number${r("[]", n)};\n`],
  ["TypeScript: tuple types", "m.ts", (n) => `export type T = ${r("[", n)}number${r("]", n)};\n`],
  ["TypeScript: parenthesized types", "m.ts", (n) => `export type T = ${r("(", n)}number${r(")", n)};\n`],
  ["TypeScript: union types", "m.ts", (n) => `export type T = ${r("1 | (", n)}1${r(")", n)};\n`],
  ["TypeScript: indexed access types", "m.ts", (n) => `declare const a: any;\nexport type T = typeof a${r('["a"]', n)};\n`],
  ["TypeScript: type operators", "m.ts", (n) => `export type T = ${r("keyof ", n)}number;\n`],
  ["TypeScript: mapped types", "m.ts", (n) => `export type T<X extends string> = ${r("{ [K in X]: ", n)}number${r(" }", n)};\n`],
  ["TypeScript: qualified names", "m.ts", (n) => `export type T = a${r(".b", n)};\n`],
  ["TypeScript: function types", "m.ts", (n) => `export type T = ${r("() => ", n)}number;\n`],
  ["TypeScript: conditional types", "m.ts", (n) => `export type T<X> = ${r("X extends 1 ? 1 : ", n)}2;\n`],
  ["TypeScript: nested functions", "m.ts", (n) => `export ${r("function f() {", n)}${r("}", n)}\n`],
  ["TypeScript: nested namespaces", "m.ts", (n) => `export ${r("namespace A {", n)}${r("}", n)}\n`],
  ["TypeScript: class expressions", "m.ts", (n) => `export const x = ${r("class { x = ", n)}1${r(" }", n)};\n`],
  ["TypeScript: a + b + …", "m.ts", (n) => `declare const a: number;\nexport const x = a${r(" + a", n)};\n`],
  ["TypeScript: a.b().c()…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r(".b()", n)};\n`],
  ["TypeScript: a.b.c…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r(".b", n)};\n`],
  ["TypeScript: a[0][0]…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r("[0]", n)};\n`],
  ["TypeScript: a = b = …", "m.ts", (n) => `let a: unknown;\nexport const x = ${r("a = ", n)}1;\n`],
  ["TypeScript: !!a", "m.ts", (n) => `declare const a: unknown;\nexport const x = ${r("!", n)}a;\n`],

  ["Python: parentheses", "m.py", (n) => `x = ${r("(", n)}1${r(")", n)}\n`],
  ["Python: lists", "m.py", (n) => `x = ${r("[", n)}1${r("]", n)}\n`],
  ["Python: dictionaries", "m.py", (n) => `x = ${r('{"a": ', n)}1${r("}", n)}\n`],
  ["Python: lambdas", "m.py", (n) => `x = ${r("lambda: ", n)}1\n`],
  ["Python: nested ifs", "m.py", (n) => `a = 1\n${indented("if a:", n, "pass")}`],
  ["Python: nested functions", "m.py", (n) => indented("def f():", n, "pass")],
  ["Python: a + b + …", "m.py", (n) => `x = a${r(" + a", n)}\n`],
  ["Python: a.b().c()…", "m.py", (n) => `x = a${r(".b()", n)}\n`],

  ["C: parentheses", "m.c", (n) => `int x = ${r("(", n)}1${r(")", n)};\n`],
  ["C: nested calls", "m.c", (n) => `void g(void) { ${r("f(", n)}0${r(")", n)}; }\n`],
  // A statement in each, or the grammar reads `{{}}` as an initializer list.
  ["C: blocks", "m.c", (n) => `void f(void) {${r("{ ;", n)}${r("}", n)}}\n`],
  ["C: if chains", "m.c", (n) => `void f(int a) {${r("if (a) {} else ", n)}{}}\n`],
  ["C: initializer lists", "m.c", (n) => `int x[] = ${r("{", n)}1${r("}", n)};\n`],
  ["C: a + b + …", "m.c", (n) => `int f(int a) { return a${r(" + a", n)}; }\n`],
  ["C: a->b->…", "m.c", (n) => `void f(struct s *a) { a${r("->b", n)}; }\n`],

  ["C++: parentheses", "m.cpp", (n) => `int x = ${r("(", n)}1${r(")", n)};\n`],
  ["C++: blocks", "m.cpp", (n) => `void f() {${r("{ ;", n)}${r("}", n)}}\n`],
  ["C++: lambdas", "m.cpp", (n) => `auto x = ${r("[] { return ", n)}1${r("; }", n)};\n`],
  // Spaced, or the grammar reads `>>` as a shift past fifty levels.
  ["C++: template arguments", "m.cpp", (n) => `${r("A<", n)}int${r(" >", n)} x;\n`],
  ["C++: nested namespaces", "m.cpp", (n) => `${r("namespace a {", n)}${r("}", n)}\n`],
  ["C++: nested classes", "m.cpp", (n) => `${r("class A {", n)}${r("};", n)}\n`],
  ["C++: a + b + …", "m.cpp", (n) => `int f(int a) { return a${r(" + a", n)}; }\n`],
  ["C++: a.b().c()…", "m.cpp", (n) => `void f(S a) { a${r(".b()", n)}; }\n`],

  ["C#: parentheses", "m.cs", (n) => `class C { int x = ${r("(", n)}1${r(")", n)}; }\n`],
  ["C#: blocks", "m.cs", (n) => `class C { void F() {${r("{", n)}${r("}", n)}} }\n`],
  ["C#: if chains", "m.cs", (n) => `class C { void F(bool a) {${r("if (a) {} else ", n)}{}} }\n`],
  ["C#: lambdas", "m.cs", (n) => `class C { void F() { var x = ${r("() => ", n)}1; } }\n`],
  ["C#: type arguments", "m.cs", (n) => `class C { ${r("A<", n)}int${r(">", n)} x; }\n`],
  ["C#: nested classes", "m.cs", (n) => `${r("class C {", n)}${r("}", n)}\n`],
  ["C#: a + b + …", "m.cs", (n) => `class C { string s = "a"${r(' + "a"', n)}; }\n`],
  ["C#: a.b().c()…", "m.cs", (n) => `class C { void F(D a) { var y = a${r(".B()", n)}; } }\n`],

  ["Java: parentheses", "m.java", (n) => `class C { int x = ${r("(", n)}1${r(")", n)}; }\n`],
  ["Java: blocks", "m.java", (n) => `class C { void f() {${r("{", n)}${r("}", n)}} }\n`],
  ["Java: if chains", "m.java", (n) => `class C { void f(boolean a) {${r("if (a) {} else ", n)}{}} }\n`],
  ["Java: lambdas", "m.java", (n) => `class C { Object x = ${r("() -> ", n)}1; }\n`],
  ["Java: array initializers", "m.java", (n) => `class C { Object x = ${r("{", n)}1${r("}", n)}; }\n`],
  ["Java: type arguments", "m.java", (n) => `class C { ${r("A<", n)}Integer${r(">", n)} x; }\n`],
  ["Java: nested classes", "m.java", (n) => `${r("class C {", n)}${r("}", n)}\n`],
  ["Java: a + b + …", "m.java", (n) => `class C { String s = "a"${r(' + "a"', n)}; }\n`],
  ["Java: a.b().c()…", "m.java", (n) => `class C { void f(D a) { Object y = a${r(".b()", n)}; } }\n`],

  ["Go: parentheses", "m.go", (n) => `package m\n\nvar x = ${r("(", n)}1${r(")", n)}\n`],
  ["Go: blocks", "m.go", (n) => `package m\n\nfunc f() {${r("{", n)}${r("}", n)}}\n`],
  ["Go: if chains", "m.go", (n) => `package m\n\nfunc f(a bool) {${r("if a {} else ", n)}{}}\n`],
  ["Go: composite literals", "m.go", (n) => `package m\n\nvar x = ${r("[]any{", n)}1${r("}", n)}\n`],
  ["Go: function literals", "m.go", (n) => `package m\n\nvar x = ${r("func() any { return ", n)}1${r(" }()", n)}\n`],
  ["Go: a + b + …", "m.go", (n) => `package m\n\nvar x = a${r(" + a", n)}\n`],
  ["Go: a.b().c()…", "m.go", (n) => `package m\n\nvar x = a${r(".B()", n)}\n`],

  ["Rust: parentheses", "m.rs", (n) => `fn f() { let x = ${r("(", n)}1${r(")", n)}; }\n`],
  ["Rust: blocks", "m.rs", (n) => `fn f() {${r("{", n)}${r("}", n)}}\n`],
  ["Rust: if chains", "m.rs", (n) => `fn f(a: bool) {${r("if a {} else ", n)}{}}\n`],
  ["Rust: arrays", "m.rs", (n) => `fn f() { let x = ${r("[", n)}1${r("]", n)}; }\n`],
  ["Rust: closures", "m.rs", (n) => `fn f() { let x = ${r("|| ", n)}1; }\n`],
  ["Rust: type arguments", "m.rs", (n) => `pub type T = ${r("Vec<", n)}i32${r(">", n)};\n`],
  ["Rust: nested modules", "m.rs", (n) => `${r("pub mod a {", n)}${r("}", n)}\n`],
  ["Rust: a + b + …", "m.rs", (n) => `fn f(a: i32) -> i32 { a${r(" + a", n)} }\n`],
  ["Rust: a.b().c()…", "m.rs", (n) => `fn f(a: A) { a${r(".b()", n)}; }\n`],

  ["PowerShell: parentheses", "m.ps1", (n) => `$x = ${r("(", n)}1${r(")", n)}\n`],
  ["PowerShell: script blocks", "m.ps1", (n) => `$x = ${r("{ ", n)}1${r(" }", n)}\n`],
  ["PowerShell: arrays", "m.ps1", (n) => `$x = ${r("@(", n)}1${r(")", n)}\n`],
  ["PowerShell: hashtables", "m.ps1", (n) => `$x = ${r("@{ a = ", n)}1${r(" }", n)}\n`],
  ["PowerShell: nested ifs", "m.ps1", (n) => `${r("if ($a) { ", n)}1${r(" }", n)}\n`],
  ["PowerShell: nested functions", "m.ps1", (n) => `${r("function f { ", n)}1${r(" }", n)}\n`],
  ["PowerShell: a + b + …", "m.ps1", (n) => `$x = $a${r(" + $a", n)}\n`],
  ["PowerShell: a.b().c()…", "m.ps1", (n) => `$x = $a${r(".b()", n)}\n`]
];

/** A file's depth as `processMark.ts` counts it: the root 1, each child of `ts.forEachChild` one more. Also whether TypeScript reported a syntax error. */
function typeScriptDepth(file: string, text: string): { depth: number; malformed: boolean } {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const root = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  let deepest = 0;
  const nodes: Array<[ts.Node, number]> = [[root, 1]];
  while (nodes.length > 0) {
    const [node, depth] = nodes.pop()!;
    deepest = Math.max(deepest, depth);
    ts.forEachChild(node, (child) => {
      nodes.push([child, depth + 1]);
    });
  }
  const diagnostics = (root as unknown as { parseDiagnostics: readonly unknown[] }).parseDiagnostics;
  return { depth: deepest, malformed: diagnostics.length > 0 };
}

/** A tree's depth as `treeSitter.ts` counts it: by a cursor, the root 1. */
function cursorDepth(root: SyntaxNode): number {
  const cursor = root.walk();
  try {
    let depth = 1;
    let deepest = 1;
    for (;;) {
      deepest = Math.max(deepest, depth);
      if (cursor.gotoFirstChild()) {
        depth += 1;
        continue;
      }
      while (!cursor.gotoNextSibling()) {
        if (!cursor.gotoParent()) return deepest;
        depth -= 1;
      }
    }
  } finally {
    cursor.delete();
  }
}

async function depthOf([, file, text]: Construct, n: number): Promise<{ depth: number; malformed: boolean }> {
  const grammar = GRAMMARS[path.extname(file)];
  if (!grammar) return typeScriptDepth(file, text(n));
  return readTree(grammar, text(n), (root) => ({ depth: cursorDepth(root), malformed: root.hasError }));
}

/**
 * The fewest levels at which the construct is `target` deep or deeper by the measure, its depth there, and whether it
 * is written as the language writes it. A tree-sitter tree is parsed outside the stack and walked by a cursor, so it is
 * measured where it is written. TypeScript's parser recurses, and this test's own process, warm and deep in the test
 * runner's calls, may overflow where the worker does not: its depth is measured at 8, 16, 32 and 64 levels, where it
 * must grow by the same steps, and found at `target` from them.
 */
async function nestedTo(construct: Construct, target: number): Promise<{ n: number; depth: number; malformed: boolean }> {
  const samples = await Promise.all([8, 16, 32, 64].map(async (n) => ({ n, ...(await depthOf(construct, n)) })));
  const slope = (samples[1].depth - samples[0].depth) / 8;
  const depthAt = (n: number): number => samples[0].depth + slope * (n - 8);
  if (slope <= 0 || samples.some((sample) => sample.depth !== depthAt(sample.n))) throw new Error(`${construct[0]} does not deepen by the same step each level: ${JSON.stringify(samples)}`);
  let n = Math.max(1, 8 + Math.ceil((target - samples[0].depth) / slope));
  if (GRAMMARS[path.extname(construct[1])] === undefined) return { n, depth: depthAt(n), malformed: samples.some((sample) => sample.malformed) };
  while ((await depthOf(construct, n)).depth < target) n += 1;
  while (n > 1 && (await depthOf(construct, n - 1)).depth >= target) n -= 1;
  return { n, ...(await depthOf(construct, n)) };
}

/** At most `count` of the calls at a time, as the pool runs a few workers at a time. */
function lanes(count: number): <T>(run: () => Promise<T>) => Promise<T> {
  let running = 0;
  const waiting: Array<() => void> = [];
  return async (run) => {
    if (running >= count) await new Promise<void>((resolve) => waiting.push(resolve));
    running += 1;
    try {
      return await run();
    } finally {
      running -= 1;
      waiting.shift()?.();
    }
  };
}
const lane = lanes(4);

/**
 * What a worker started as the pool starts one (`regenerate.ts`: tsx's loader, the pool's environment) reports of its
 * first change: a repository of one commit holding the file and the configuration.
 */
async function firstChange(file: string, text: string): Promise<WorkerReport> {
  const repository = fs.mkdtempSync(path.join(privateTemporary, "repo-"));
  const [commit] = buildRepository(repository, [
    { message: "One nested file", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(CONFIG)}\n`, [`src/${file}`]: text } }
  ]);
  const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
  const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
  const folder = fs.mkdtempSync(path.join(privateTemporary, "worker-"));
  const child = fork(worker, ["--worker", store, folder], {
    stdio: ["ignore", "ignore", "pipe", "ipc"],
    env: summarizingEnvironment({ ...process.env, TMPDIR: privateTemporary, TSX_TSCONFIG_PATH: tsconfigPath }),
    execArgv: summarizingFlags(worker)
  });
  let errors = "";
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (chunk: string) => {
    errors += chunk;
  });
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  const task: WorkerTask = {
    configuration: summarizedConfiguration(normalizeLiveDocumentationConfig(CONFIG)),
    lens: "0123456789abcdef",
    commit,
    summaryPath: path.join(cache, `${commit}.json.gz`),
    textStore: path.join(cache, "texts")
  };
  try {
    return await new Promise<WorkerReport>((resolve, reject) => {
      child.once("message", (message) => resolve(message as WorkerReport));
      child.once("exit", (code, signal) => reject(new Error(`the worker ended (${signal ?? `exit ${code}`}): ${errors.slice(-2000)}`)));
      child.send(task);
    });
  } finally {
    if (child.connected) child.disconnect();
    await exited;
    for (const made of [repository, cache, folder]) fs.rmSync(made, { recursive: true, force: true });
  }
}

describe("the reading depth", () => {
  const target = 2 * READING_DEPTH;

  it.concurrent.each(CONSTRUCTS)(`is at most half the depth a fresh process reads: %s, at ${target} deep`, async (...construct) => {
    const { n, ...measured } = await nestedTo(construct, target);
    // The construct is written as the language writes it, and is as deep as twice the reading depth.
    expect(measured.malformed, `${construct[0]} at ${n} levels`).toBe(false);
    expect(measured.depth).toBeGreaterThanOrEqual(target);
    const report = await lane(() => firstChange(construct[1], construct[2](n)));
    // Read, unmapped by nothing (a stack overflow would leave the file unmapped), and marked for its depth alone.
    expect({ unmapped: report.unmapped, marked: report.marked, published: report.published }, `${construct[0]} at ${n} levels, ${measured.depth} deep`).toEqual({
      unmapped: [],
      marked: ["deep"],
      published: true
    });
  }, 600_000);
});
