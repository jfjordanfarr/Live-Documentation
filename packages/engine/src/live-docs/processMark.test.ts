import ts from "typescript";
import { describe, expect, it } from "vitest";

import { throwIfMachineFailure } from "../tooling/sourceText";
import { failedCall, machineFailure, READING_DEPTH, typeScriptBeyondDepth, typeScriptExtent } from "./processMark";

const parsed = (file: string, text: string): ts.SourceFile => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
const nestingOf = (file: string, text: string): number => typeScriptExtent(parsed(file, text)).nesting;

describe("the TypeScript measure", () => {
  // The audit of the parser's speculative reads (every `tryParse`, `lookAhead` and `speculationHelper`, and every parse
  // whose result is dropped) was made for this version alone: the record of 2026-11-20, `AI-Agent-Workspace/
  // AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-speed/depth-probe.md`, its fourth round.
  it("was audited against the TypeScript installed", () => {
    expect(ts.version, "TypeScript changed: redo the audit of the parser's speculative reads in depth-probe.md (its fourth round's table) before changing the version expected here").toBe("5.9.3");
  });

  it("reads a bracketed JSDoc default alone, never the tag's prose after it, and never throws", () => {
    const tag = (prose: string): string => `/** @param {number} [a=1] the default, as in f${prose}x */\nexport function f(a) {}\n`;
    const plain = nestingOf("m.ts", tag(""));
    // The reviewer's three shapes: prose 150, 250 and 3,000 parentheses deep, which no parser reads as code.
    for (const depth of [150, 250, 3_000]) {
      const root = parsed("m.ts", tag("(".repeat(depth)));
      expect(typeScriptExtent(root).nesting, `${depth} parentheses of prose`).toBe(plain);
      expect(typeScriptBeyondDepth(root)).toBe(false);
    }
    // A default nested beyond the bound still counts, with prose after it or without.
    const deep = `/** @param {number} [a=${"[".repeat(READING_DEPTH)}1${"]".repeat(READING_DEPTH)}] its prose ] */\nexport function f(a) {}\n`;
    expect(typeScriptBeyondDepth(parsed("m.ts", deep))).toBe(true);
    expect(typeScriptBeyondDepth(parsed("m.js", deep))).toBe(true);
    // A JSX element's text may hold a `]` that is not the default's end: in a JSX file the default is read to the tag's end.
    const element = `/** @param {number} [a=<a>]{${"[".repeat(READING_DEPTH)}1${"]".repeat(READING_DEPTH)}}</a>] its prose */\nexport function f(a) {}\n`;
    expect(typeScriptBeyondDepth(parsed("m.tsx", element))).toBe(true);
  });

  it("counts the comparisons a type-argument attempt runs through, within a statement and not across statements", () => {
    const side = (n: number): string => `declare function f(...a: unknown[]): void;\ndeclare const a: number;\nf(${Array.from({ length: n }, () => "a < a").join(", ")});\n`;
    // In TypeScript each comparison of the run is a level; JavaScript makes no attempt.
    expect(nestingOf("m.ts", side(64)) - nestingOf("m.ts", side(32))).toBe(32);
    expect(nestingOf("m.tsx", side(64)) - nestingOf("m.tsx", side(32))).toBe(32);
    expect(nestingOf("m.js", side(64))).toBe(nestingOf("m.js", side(32)));
    // A test file whose whole body is one call, holding many statements of comparisons: no run crosses a statement.
    const body = (n: number): string => `describe("x", () => {\n${"  expect(a < b, c < d).toBe(true);\n".repeat(n)}});\n`;
    expect(nestingOf("m.ts", body(500))).toBe(nestingOf("m.ts", body(5)));
    expect(nestingOf("m.ts", body(500))).toBeLessThan(20);
  });

  it("counts within a statement every comparison of the statements it holds, a label's path through a block among them", () => {
    // A block an attempt reads is a type literal, and a statement written as a label's (`x: a < a, …`) is a member whose
    // type a run goes on through. The outer statement, deep in its parentheses, counts the block's comparisons too.
    const labeled = (n: number): string =>
      `declare function f(...a: unknown[]): void;\ndeclare const a: any;\nf(${"(".repeat(50)}a${")".repeat(50)} < a, () => { x: ${Array.from({ length: n }, () => "a < a").join(", ")}; });\n`;
    expect(nestingOf("m.ts", labeled(64)) - nestingOf("m.ts", labeled(32))).toBe(32);
  });

  it("counts a class member's comparisons as a statement's, never another member's", () => {
    // A run cannot pass from one member to the next: members are parted by `;` or a line's end, never by a comma.
    const members = (n: number): string => `declare const a: number, b: number;\nexport class C {\n  x = a < b;\n${Array.from({ length: n }, (_, i) => `  m${i}() { return a < b; }\n`).join("")}}\n`;
    expect(nestingOf("m.ts", members(500))).toBe(nestingOf("m.ts", members(5)));
  });
});

/** A failed system call as node makes one: its code and the call named on the error. */
const failed = (code: string): Error => Object.assign(new Error(`${code}: a failed call, open 'src/a.ts'`), { code, syscall: "open" });

/** An error of a library's own that keeps the failure it met as its `cause`. */
const wrapped = (cause: unknown): Error => new Error("the library could not read its file", { cause });

describe("a failure of the machine's, told from the file's", () => {
  it("is a failed call for any cause but the name's or the path's, whether thrown as it is or wrapped by a library", () => {
    expect(machineFailure(failed("EMFILE"))).toBe(true);
    expect(machineFailure(failed("ENAMETOOLONG"))).toBe(false);
    expect(machineFailure(new Error("Maximum call stack size exceeded"))).toBe(false);
    // Until 2026-11-20 only the error itself was read: a failed call a library wrapped sorted as the file's.
    expect(machineFailure(wrapped(failed("EMFILE")))).toBe(true);
    expect(machineFailure(wrapped(wrapped(failed("EBUSY"))))).toBe(true);
    expect(machineFailure(wrapped(failed("ENAMETOOLONG")))).toBe(false);
    expect(failedCall(wrapped(failed("EACCES")))).toBe("EACCES");
  });

  it("ends at a chain of causes that turns back on itself", () => {
    const first = new Error("first");
    const second = new Error("second", { cause: first });
    (first as Error & { cause?: unknown }).cause = second;
    expect(machineFailure(first)).toBe(false);
  });

  it("is thrown on by a reader's catch, and absence, wrapped or not, is the file's answer", () => {
    expect(() => throwIfMachineFailure(wrapped(failed("EMFILE")))).toThrow("the library could not read its file");
    expect(() => throwIfMachineFailure(failed("ENOENT"))).not.toThrow();
    expect(() => throwIfMachineFailure(wrapped(failed("ENOENT")))).not.toThrow();
  });
});
