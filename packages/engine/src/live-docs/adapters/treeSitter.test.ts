import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { Language, Node, Parser, Tree } from "web-tree-sitter";

import { grammarParser, readTree, type SyntaxNode } from "./treeSitter";

// The platform's class of a WebAssembly trap or abort, and a stand-in for the module's exit, which is no `Error`.
const RuntimeError = (globalThis as unknown as { WebAssembly: { RuntimeError: new (message: string) => Error } }).WebAssembly.RuntimeError;
class ExitStatus {
  readonly name = "ExitStatus";
  constructor(readonly status: number) {}
}

/** Each way the runtime can throw while a tree is taken, read or released, each made to happen once. */
const FAULTS: Array<[string, () => { mockRestore(): void }]> = [
  ["a trap in the parse", () => vi.spyOn(Parser.prototype, "parse").mockImplementationOnce(() => { throw new RuntimeError("unreachable"); })],
  ["an exit of the module in the parse", () => vi.spyOn(Parser.prototype, "parse").mockImplementationOnce(() => { throw new ExitStatus(1); })],
  ["a trap in the walk of the tree's nodes", () => vi.spyOn(Node.prototype, "namedChildren", "get").mockImplementationOnce(() => { throw new RuntimeError("memory access out of bounds"); })],
  ["a stack overflow in the walk", () => vi.spyOn(Node.prototype, "namedChildren", "get").mockImplementationOnce(() => { throw new RangeError("Maximum call stack size exceeded"); })],
  ["a trap in the tree's release", () => vi.spyOn(Tree.prototype, "delete").mockImplementationOnce(() => { throw new RuntimeError("unreachable"); })],
  ["a grammar's load that fails", () => vi.spyOn(Language, "load").mockRejectedValueOnce(new RuntimeError("Aborted(OOM)"))]
];

/** The two passes in which the generator hands a file to its adapter: the index pass, which swallows the adapter's errors, and the analysis pass. */
const PASSES: Array<[string, (root: string, file: string) => Promise<unknown>]> = [
  ["the index pass", async (root, file) => {
    const { buildWorkspaceIndexes } = await vi.importActual<typeof import("../discovery")>("../discovery");
    return buildWorkspaceIndexes({ targetFiles: [file], workspaceRoot: root, liveDocsRoot: ".mdmd/layer-4", docExtension: ".mdmd.md", fileIndex: new Set(["module.py"]) });
  }],
  ["the analysis pass", async (root, file) => {
    const { analyzeSourceFile } = await vi.importActual<typeof import("../sourceAnalysis")>("../sourceAnalysis");
    return analyzeSourceFile(file, root, new Set(["module.py"])).catch(() => undefined);
  }]
];

describe("anything thrown while a tree is taken, read or released", () => {
  // The runtime restores none of its state when a call into its one WebAssembly module throws, and which throws were
  // the module's cannot be told from the error, so every throw marks the process, and the history's worker publishes
  // nothing more (until 2026-11-20 only a `RuntimeError` thrown inside `parse` marked it).
  for (const [fault, make] of FAULTS) {
    for (const [pass, run] of PASSES) {
      it(`marks the process for ${fault}, in ${pass}`, async () => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), "tree-fault-"));
        try {
          const file = path.join(root, "module.py");
          await fs.writeFile(file, "import os\n\ndef f():\n    return os.sep\n");
          // A module of its own, so that the mark starts unset and the grammar is loaded anew.
          vi.resetModules();
          const own = await vi.importActual<typeof import("../processMark")>("../processMark");
          await run(root, file);
          expect(own.processMarks()).toEqual([]);
          vi.resetModules();
          const fresh = await vi.importActual<typeof import("../processMark")>("../processMark");
          const spy = make();
          try {
            await run(root, file);
          } finally {
            spy.mockRestore();
          }
          expect(fresh.processMarks()).toEqual(["runtime"]);
        } finally {
          await fs.rm(root, { recursive: true, force: true });
        }
      });
    }
  }

  it("leaves the process unmarked when nothing throws", async () => {
    vi.resetModules();
    const own = await vi.importActual<typeof import("./treeSitter")>("./treeSitter");
    const mark = await vi.importActual<typeof import("../processMark")>("../processMark");
    await expect(own.readTree("python", "import os\n", (root) => root.type)).resolves.toBe("module");
    expect(mark.processMarks()).toEqual([]);
  });

  // A warm process has more stack to spare than a fresh one, so a tree deeper than the reading depth marks the process
  // whether or not anything overflowed (the review of 2026-11-20).
  it("marks the process for a tree deeper than the reading depth, and not for one at it", async () => {
    vi.resetModules();
    const own = await vi.importActual<typeof import("./treeSitter")>("./treeSitter");
    const mark = await vi.importActual<typeof import("../processMark")>("../processMark");
    // `x = (((…)))`: the module, the statement, the assignment, then a parenthesized expression a level, then `1`.
    const nested = (levels: number): string => `x = ${"(".repeat(levels)}1${")".repeat(levels)}\n`;
    const depthOf = (root: SyntaxNode): number => 1 + Math.max(0, ...root.children.map(depthOf));
    const atDepth = mark.READING_DEPTH - 4;
    expect(await own.readTree("python", nested(atDepth), depthOf)).toBe(mark.READING_DEPTH);
    expect(mark.processMarks()).toEqual([]);
    await own.readTree("python", nested(atDepth + 1), () => undefined);
    expect(mark.processMarks()).toEqual(["deep"]);
  });
});

describe("the grammar loader", () => {
  // A process that lives across many generations, as the history's worker does, must not fail every later file of a
  // grammar for one load that failed (until 2026-11-20 the failed load was kept for the process's life).
  it("drops a load that fails, so that the next asks again", async () => {
    const load = vi.spyOn(Language, "load").mockRejectedValueOnce(new Error("refused once"));
    try {
      await expect(grammarParser("java")).rejects.toThrow("refused once");
      const parser = await grammarParser("java");
      expect(parser.parse("class A {}")?.rootNode.type).toBe("program");
      expect(load).toHaveBeenCalledTimes(2);
    } finally {
      load.mockRestore();
    }
  });
});

/** Every ERROR and MISSING node of a tree, by its text. */
function errors(node: SyntaxNode): string[] {
  const found = node.type === "ERROR" || node.isMissing ? [node.text] : [];
  return found.concat(node.children.flatMap(errors));
}

/** The named node types of a tree, in document order. */
function types(node: SyntaxNode): string[] {
  return [node.type, ...node.namedChildren.flatMap(types)];
}

async function parse(grammar: string, source: string): Promise<{ errors: string[]; types: string[] }> {
  return readTree(grammar, source, (root) => ({ errors: errors(root), types: types(root) }));
}

describe("the PowerShell grammar the engine builds", () => {
  it("reads a comma list of bare words as one argument, and the statements after it", async () => {
    const parsed = await parse("powershell", [
      "Export-ModuleMember -Function Get-Alpha, Get-Beta",
      "Format-Table Name, Status -AutoSize",
      "Select-Object @{ n = 'x'; e = { 1 } }, Name",
      "function Get-Alpha { }"
    ].join("\n"));
    expect(parsed.errors).toEqual([]);
    expect(parsed.types.filter((type) => type === "command_argument_list")).toHaveLength(3);
    expect(parsed.types).toContain("function_statement");
  });

  it("reads a bare word that begins with a variable as one argument, and as a dot-source's path", async () => {
    const parsed = await parse("powershell", [
      "Import-Module $PSScriptRoot\\..\\modules\\Tools\\Tools.psm1 -Force",
      "Import-Module ${PSScriptRoot}/Tools.psm1",
      ". ${PSScriptRoot}/lib/Logging.ps1",
      ". $PSScriptRoot/lib/Settings.ps1"
    ].join("\n"));
    expect(parsed.errors).toEqual([]);
  });

  it("reads using statements, before a param block", async () => {
    const parsed = await parse("powershell", [
      "using namespace System.Text",
      "using module ./Tools.psm1",
      "using module @{ ModuleName = 'Tools'; ModuleVersion = '1.0' }",
      "using assembly System.Windows.Forms",
      "[CmdletBinding()]",
      "param($Name)",
      "Write-Output $Name"
    ].join("\n"));
    expect(parsed.errors).toEqual([]);
    expect(parsed.types.filter((type) => type === "using_statement")).toHaveLength(4);
    expect(parsed.types).toContain("param_block");
  });

  it("leaves the grammars it does not build to the bundled ones", async () => {
    expect((await parse("python", "import os\n")).errors).toEqual([]);
  });
});
