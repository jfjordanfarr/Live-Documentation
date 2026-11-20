/**
 * `treeSitter.ts` is the one way the product takes a tree-sitter tree: `readTree` measures each tree's depth and marks
 * the process for any throw from the grammar's load to the tree's release (`processMark.ts`). A file that imported the
 * runtime itself, or took a parser from `grammarParser` and parsed with it, would read trees no mark covers, and a
 * worker of the history could then make a summary that depends on its past (the review of 2026-11-20).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..", "..");
const LOADER = path.join(repoRoot, "packages", "engine", "src", "live-docs", "adapters", "treeSitter.ts");
const SOURCE = /\.(?:[cm]?[jt]s|tsx|jsx)$/u;

/** Every source file of the product and its commands: each package's `src`, and `scripts`, without tests. */
async function productFiles(): Promise<string[]> {
  const roots = [path.join(repoRoot, "scripts")];
  for (const entry of await fs.readdir(path.join(repoRoot, "packages"), { withFileTypes: true })) {
    if (entry.isDirectory()) roots.push(path.join(repoRoot, "packages", entry.name, "src"));
  }
  const files: string[] = [];
  for (const root of roots) {
    for (const entry of await fs.readdir(root, { recursive: true, withFileTypes: true })) {
      const file = path.join(entry.parentPath, entry.name);
      if (!entry.isFile() || !SOURCE.test(entry.name) || /\.test\.[^.]+$/u.test(entry.name)) continue;
      if (path.relative(root, file).split(path.sep).some((part) => part === "node_modules" || part === "dist")) continue;
      files.push(file);
    }
  }
  return files.sort();
}

/** What a source text does of the runtime: whether it loads `web-tree-sitter` (import, export, require or dynamic import), and whether it names `grammarParser` anywhere. */
function reachesTheRuntime(text: string): { imports: boolean; namesGrammarParser: boolean } {
  const imports = ts.preProcessFile(text, true, true).importedFiles.some((file) => file.fileName === "web-tree-sitter" || file.fileName.startsWith("web-tree-sitter/"));
  const source = ts.createSourceFile("file.ts", text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  let namesGrammarParser = false;
  const nodes: ts.Node[] = [source];
  while (nodes.length > 0 && !namesGrammarParser) {
    const node = nodes.pop()!;
    if ((ts.isIdentifier(node) || ts.isStringLiteral(node)) && node.text === "grammarParser") namesGrammarParser = true;
    ts.forEachChild(node, (child) => {
      nodes.push(child);
    });
  }
  return { imports, namesGrammarParser };
}

describe("the one way to a tree-sitter tree", () => {
  it("is `treeSitter.ts`: no other file imports the runtime, and none names `grammarParser`", async () => {
    const files = await productFiles();
    expect(files).toContain(LOADER);
    const offenders: string[] = [];
    for (const file of files) {
      if (file === LOADER) continue;
      const found = reachesTheRuntime(await fs.readFile(file, "utf8"));
      if (found.imports) offenders.push(`${path.relative(repoRoot, file)} imports web-tree-sitter`);
      if (found.namesGrammarParser) offenders.push(`${path.relative(repoRoot, file)} names grammarParser`);
    }
    expect(offenders).toEqual([]);
    // The loader itself is seen to do both, so that the check reads what it claims to.
    expect(reachesTheRuntime(await fs.readFile(LOADER, "utf8"))).toEqual({ imports: true, namesGrammarParser: true });
  });

  it("sees each way a file could reach the runtime", () => {
    for (const text of [
      `import { Parser } from "web-tree-sitter";`,
      `import type { Node } from "web-tree-sitter";`,
      `export { Parser } from "web-tree-sitter";`,
      `const runtime = require("web-tree-sitter");`,
      `const runtime = await import("web-tree-sitter");`
    ]) {
      expect(reachesTheRuntime(text).imports, text).toBe(true);
    }
    for (const text of [
      `import { grammarParser } from "./treeSitter";\nconst parser = await grammarParser("python");`,
      `import { grammarParser as parserOf } from "./treeSitter";`,
      `import * as loader from "./treeSitter";\nconst parser = await loader.grammarParser("go");`,
      `import * as loader from "./treeSitter";\nconst parser = await loader["grammarParser"]("go");`
    ]) {
      expect(reachesTheRuntime(text).namesGrammarParser, text).toBe(true);
    }
    expect(reachesTheRuntime(`import { readTree } from "./treeSitter";\nawait readTree("python", "x = 1", (root) => root.type);`)).toEqual({ imports: false, namesGrammarParser: false });
  });
});
