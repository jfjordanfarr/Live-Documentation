import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { HISTORY_FOLDERS, keysTheLens, SUMMARY_MODULES } from "./generatorIdentity";

const repository = path.resolve(__dirname, "..", "..", "..", "..");

/** The repository-relative path of a module a source file imports, when it is one of this repository's TypeScript files. */
function resolveImport(from: string, specifier: string): string | undefined {
  let base: string;
  if (specifier.startsWith(".")) {
    base = path.posix.join(path.posix.dirname(from), specifier);
  } else {
    const aliased = /^@live-documentation\/(engine|generator|explorer)\/(.+)$/u.exec(specifier);
    if (!aliased) return undefined;
    base = `packages/${aliased[1]}/src/${aliased[2]}`;
  }
  for (const candidate of [`${base}.ts`, `${base}/index.ts`, base]) {
    try {
      readFileSync(path.join(repository, candidate));
      return candidate;
    } catch {
      // Not this one.
    }
  }
  throw new Error(`${from} imports ${specifier}, which resolves to no file`);
}

/**
 * The modules a source file imports that leave something at run time, read by the TypeScript parser: an `import type`,
 * an `export type` or an import whose every name is a type leaves nothing, and is elided.
 */
function runtimeImports(file: string): string[] {
  const source = ts.createSourceFile(file, readFileSync(path.join(repository, file), "utf8"), ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const elided =
        clause !== undefined &&
        (clause.isTypeOnly ||
          (clause.name === undefined && clause.namedBindings !== undefined && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every((element) => element.isTypeOnly)));
      if (!elided) specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier) && !node.isTypeOnly) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const [argument] = node.arguments;
      if (argument !== undefined && ts.isStringLiteral(argument)) specifiers.push(argument.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return specifiers;
}

/** Every module of this repository a source file reaches at run time, itself included. */
function runtimeClosure(entry: string): Set<string> {
  const reached = new Set<string>();
  const pending = [entry];
  while (pending.length > 0) {
    const file = pending.pop()!;
    if (reached.has(file)) continue;
    reached.add(file);
    for (const specifier of runtimeImports(file)) {
      const resolved = resolveImport(file, specifier);
      if (resolved !== undefined && resolved.endsWith(".ts")) pending.push(resolved);
    }
  }
  return reached;
}

describe("the lens's key", () => {
  it("is made of every module the summarizing process runs", () => {
    const reached = runtimeClosure("packages/generator/src/history/summarizeChange.ts");
    expect(reached.size).toBeGreaterThan(20);
    const unkeyed = [...reached].filter((file) => !keysTheLens(file));
    // A module the summaries depend on and the key leaves out would let the cache serve a summary another generator made.
    expect(unkeyed).toEqual([]);
    expect([...reached].filter((file) => HISTORY_FOLDERS.some((folder) => file.startsWith(folder))).sort()).toEqual([...SUMMARY_MODULES].sort());
  });

  it("finds an import the summarizing process would make of a module the key leaves out", () => {
    // The check above must be able to fail: the sequence's codec, reached from the summary, is a module the key leaves out.
    expect(keysTheLens("packages/engine/src/live-docs/history/codec.ts")).toBe(false);
    expect(runtimeClosure("packages/engine/src/live-docs/history/sequence.ts")).toContain("packages/engine/src/live-docs/history/codec.ts");
  });

  it("leaves out the tests and the history modules that only read summaries, and keeps every other file of the two packages", () => {
    expect(keysTheLens("packages/engine/src/live-docs/graph.ts")).toBe(true);
    expect(keysTheLens("packages/engine/package.json")).toBe(true);
    expect(keysTheLens("packages/generator/src/generator.ts")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/history/summary.ts")).toBe(true);
    expect(keysTheLens("packages/generator/src/history/summarizeChange.ts")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/graph.test.ts")).toBe(false);
    expect(keysTheLens("packages/engine/src/live-docs/history/queries.ts")).toBe(false);
    expect(keysTheLens("packages/generator/src/history/computeHistory.ts")).toBe(false);
    expect(keysTheLens("packages/explorer/src/client/index.ts")).toBe(false);
  });
});
