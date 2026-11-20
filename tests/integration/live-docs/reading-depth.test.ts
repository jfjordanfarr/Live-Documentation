/**
 * The reading bounds' margin, and their proof. A file nested beyond `READING_DEPTH` or deeper than `TREE_DEPTH` marks
 * the process that reads it, and the history gives a marked change to a fresh process (`processMark.ts`); within the
 * bounds, a summary must not depend on which worker made it, which holds only if no process, however cold, runs out of
 * stack there. The ruling of 2026-11-20 sets each bound at most half the smallest depth at which a fresh process fails
 * a construct it bounds. So each kind of nesting is written here, alone in a repository of one commit, and given as the
 * first change of a worker started as the pool starts one: the worker must read it, unmapped by nothing, marked for its
 * depth alone. TypeScript's nesting constructs, which its parser reaches by recursion, are nested to twice the nesting
 * bound; its chains, which its parser reads by a loop, and every tree-sitter construct, to twice the tree's bound, by
 * the bounds' own measures. Since the two add up on one stack, the lowest nesting construct is also wrapped in each
 * chain at one and a half times both bounds at once. A later TypeScript, grammar or Node that lowers a cold limit
 * below these turns this red (the record of 2026-11-20, `Probes/history-rebuild-speed/depth-probe.md`).
 */
import { fork } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parse as parseToml } from "smol-toml";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readXmlElements } from "../../../packages/engine/src/live-docs/adapters/pom";
import { readTree, type SyntaxNode } from "../../../packages/engine/src/live-docs/adapters/treeSitter";
import { summarizedConfiguration } from "../../../packages/engine/src/live-docs/history/lens";
import { jsonChildren, READING_DEPTH, TREE_DEPTH, typeScriptExtent } from "../../../packages/engine/src/live-docs/processMark";
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

/**
 * A kind of nesting: the file it is written in, its text at `n` levels or terms, and, for a TypeScript chain, which
 * its parser reads by a loop and which is bounded by the tree's depth, `chain`.
 */
type Construct = [name: string, file: string, text: (n: number) => string, chain?: "chain"];

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
  // The chains: each step the measure takes for a loop of the parser's, alone, and mixed.
  ["TypeScript: a + b + …", "m.ts", (n) => `declare const a: number;\nexport const x = a${r(" + a", n)};\n`, "chain"],
  ["TypeScript: a, b, …", "m.ts", (n) => `declare const a: number;\nexport const x = (a${r(", a", n)});\n`, "chain"],
  ["TypeScript: a()()…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r("()", n)};\n`, "chain"],
  ["TypeScript: a.b.c…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r(".b", n)};\n`, "chain"],
  ["TypeScript: a[0][0]…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r("[0]", n)};\n`, "chain"],
  ["TypeScript: a.b().c()…", "m.ts", (n) => `declare const a: any;\nexport const x = a${r(".b()", n)};\n`, "chain"],
  // The same steps the other way round, which the parser takes by recursion: nesting.
  ["TypeScript: a = b = …", "m.ts", (n) => `let a: unknown;\nexport const x = ${r("a = ", n)}1;\n`],
  ["TypeScript: a ** b ** …", "m.ts", (n) => `declare const a: number;\nexport const x = a${r(" ** a", n)};\n`],
  ["TypeScript: a + (b + (…))", "m.ts", (n) => `declare const a: number;\nexport const x = ${r("a + (", n)}a${r(")", n)};\n`],
  ["TypeScript: a[a[…]]", "m.ts", (n) => `declare const a: any;\nexport const x = ${r("a[", n)}0${r("]", n)};\n`],
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
function typeScriptMeasure(file: string, text: string): { nesting: number; depth: number; malformed: boolean } {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const root = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const diagnostics = (root as unknown as { parseDiagnostics: readonly unknown[] }).parseDiagnostics;
  return { ...typeScriptExtent(root), malformed: diagnostics.length > 0 };
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

/** The count that bounds the construct, `depth` here: its nesting for a TypeScript nesting construct, its tree's depth otherwise. */
async function depthOf([, file, text, chain]: Construct, n: number): Promise<{ depth: number; malformed: boolean }> {
  const grammar = GRAMMARS[path.extname(file)];
  if (grammar) return readTree(grammar, text(n), (root) => ({ depth: cursorDepth(root), malformed: root.hasError }));
  const measured = typeScriptMeasure(file, text(n));
  return { depth: chain ? measured.depth : measured.nesting, malformed: measured.malformed };
}

/**
 * The fewest levels at which the construct is `target` deep or deeper by the count that bounds it, that count there,
 * and whether it is written as the language writes it. A tree-sitter tree is parsed outside the stack and walked by a cursor, so it is
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
async function firstChange(file: string, text: string, beside: Record<string, string> = {}): Promise<WorkerReport> {
  const repository = fs.mkdtempSync(path.join(privateTemporary, "repo-"));
  const files = Object.fromEntries(Object.entries({ ...beside, [file]: text }).map(([name, content]) => [`src/${name}`, content]));
  const [commit] = buildRepository(repository, [
    { message: "One nested file", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(CONFIG)}\n`, ...files } }
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

/** Read, unmapped by nothing (a stack overflow would leave the file unmapped), and marked for its depth alone. */
function expectReadCold(report: WorkerReport, what: string): void {
  expect({ unmapped: report.unmapped, marked: report.marked, published: report.published }, what).toEqual({ unmapped: [], marked: ["deep"], published: true });
}

/**
 * The chains the lowest nesting construct is wrapped in: around `seed`, `m` links, each as in `CONSTRUCTS`. The seed is
 * the innermost operand, the left-most, so that the chain and the nesting add up on one path.
 */
const JOINT_CHAINS: Array<[name: string, text: (seed: string, m: number) => string]> = [
  ["a + b + …", (seed, m) => `${seed}${r(" + a", m)}`],
  ["a, b, …", (seed, m) => `(${seed}${r(", a", m)})`],
  ["a()()…", (seed, m) => `${seed}${r("()", m)}`],
  ["a.b.c…", (seed, m) => `${seed}${r(".b", m)}`],
  ["a[0][0]…", (seed, m) => `${seed}${r("[0]", m)}`],
  ["a.b().c()…", (seed, m) => `${seed}${r(".b()", m)}`]
];
/** Nested tuple types, the nesting construct a fresh process fails soonest (the probe of 2026-11-20), as the chain's seed. */
const tupleSeed = (k: number): string => `(a as ${r("[", k)}number${r("]", k)})`;
const jointText = (chain: (seed: string, m: number) => string, k: number, m: number): string => `declare const a: any;\nexport const x = ${chain(tupleSeed(k), m)};\n`;

describe("the reading bounds", () => {
  const nestingTarget = 2 * READING_DEPTH;
  const treeTarget = 2 * TREE_DEPTH;

  it.concurrent.each(CONSTRUCTS)(`are at most half what a fresh process reads: %s, at twice its bound`, async (...construct) => {
    const target = construct[3] === "chain" || GRAMMARS[path.extname(construct[1])] ? treeTarget : nestingTarget;
    const { n, ...measured } = await nestedTo(construct, target);
    // The construct is written as the language writes it, and is as deep as twice its bound.
    expect(measured.malformed, `${construct[0]} at ${n} levels`).toBe(false);
    expect(measured.depth).toBeGreaterThanOrEqual(target);
    const report = await lane(() => firstChange(construct[1], construct[2](n)));
    expectReadCold(report, `${construct[0]} at ${n} levels, ${measured.depth} deep by its bound's count`);
  }, 600_000);

  // The parser's recursion and the generator's own walks add up on one stack: the lowest nesting construct inside
  // each chain, nested to one and a half times the nesting bound and as deep as one and a half times the tree's.
  it.concurrent.each(JOINT_CHAINS)("are at most two thirds of what a fresh process reads together: nested tuple types inside %s", async (name, chain) => {
    const nestingWanted = 1.5 * READING_DEPTH;
    const depthWanted = 1.5 * TREE_DEPTH;
    const measure = (k: number, m: number) => typeScriptMeasure("m.ts", jointText(chain, k, m));
    let k = 1;
    while (measure(k, 1).nesting < nestingWanted) k += 1;
    let m = 1;
    while (measure(k, m).depth < depthWanted) m += 1;
    const measured = measure(k, m);
    expect(measured.malformed, `${name} at ${k} and ${m} levels`).toBe(false);
    expect(measured.nesting).toBeGreaterThanOrEqual(nestingWanted);
    expect(measured.depth).toBeGreaterThanOrEqual(depthWanted);
    const report = await lane(() => firstChange("m.ts", jointText(chain, k, m)));
    expectReadCold(report, `tuple types ${k} levels inside ${name} ${m} links: nested ${measured.nesting}, ${measured.depth} deep`);
  }, 600_000);

  // A value a reader built of a file's content, measured as `nestingBeyondDepth` measures it (the root 1), to the bound
  // of the mechanism that built it: `JSON.parse` and the POM's reader hold no stack, so only our own walks recurse over
  // their values, under the tree's bound; TypeScript's reader of a tsconfig recurses as its parser does, under the nesting bound.
  const valueDepth = <T>(root: T, children: (node: T) => readonly T[]): number => {
    let deepest = 0;
    const nodes: Array<[T, number]> = [[root, 1]];
    while (nodes.length > 0) {
      const [node, depth] = nodes.pop()!;
      deepest = Math.max(deepest, depth);
      for (const child of children(node)) nodes.push([child, depth + 1]);
    }
    return deepest;
  };
  const arrays = (levels: number): string => `${r("[", levels)}1${r("]", levels)}`;
  it.concurrent.each([
    ["a JSON document, read by `JSON.parse`", treeTarget, (levels: number) => ({ file: "deep.json", text: arrays(levels) }), (text: string) => valueDepth(JSON.parse(text), jsonChildren)],
    ["a POM's elements", treeTarget, (levels: number) => ({ file: "pom.xml", text: `<project>${r("<a>", levels)}${r("</a>", levels)}</project>` }), (text: string) => valueDepth(readXmlElements(text), (element) => element.children)],
    [
      "a tsconfig beside a package's manifest, read by TypeScript's reader of JSON",
      nestingTarget,
      (levels: number) => ({ file: "tsconfig.json", text: `{"compilerOptions": {}, "x": ${arrays(levels)}}`, beside: { "package.json": `{"name": "x"}` } }),
      (text: string) => valueDepth(JSON.parse(text), jsonChildren)
    ]
  ] as const)("are at most half what a fresh process reads: %s, at twice its bound", async (name, target, write, depthOf) => {
    let levels = 1;
    while (depthOf(write(levels).text) < target) levels += 1;
    const written = write(levels);
    // The rows are read as a union whose third member has no one shape; what stands beside the file is named here.
    const beside: Record<string, string> = "beside" in written ? (written.beside as Record<string, string>) : {};
    const report = await lane(() => firstChange(written.file, written.text, beside));
    expectReadCold(report, `${name} at ${levels} levels, ${depthOf(written.text)} deep`);
  }, 600_000);

  // The TOML reader (`smol-toml`, behind the Cargo and pyproject readers) recurses, but refuses past a fixed count of
  // its own, whatever the stack: the same in every process, so no bound of ours is needed (the first builder's probe of
  // 2026-11-20: 1,000 levels read, 10,000 refused). A fresh worker given the refused manifest reads it as invalid.
  it("leaves the TOML reader to its own fixed limit, the same in every process", async () => {
    const manifest = (levels: number): string => `[package]\nname = "x"\nversion = "0.1.0"\n\n[package.metadata]\nx = ${arrays(levels)}\n`;
    expect(() => parseToml(manifest(1_000))).not.toThrow();
    expect(() => parseToml(manifest(10_000))).toThrow(/nested/u);
    const report = await lane(() => firstChange("Cargo.toml", manifest(10_000)));
    expect({ unmapped: report.unmapped, marked: report.marked, published: report.published }).toEqual({ unmapped: [], marked: [], published: true });
  }, 600_000);
});
