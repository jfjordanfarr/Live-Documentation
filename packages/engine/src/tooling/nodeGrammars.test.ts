import { promises as fs } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { getGrammarHost, readTree, setGrammarHost, type GrammarHost } from "../live-docs/adapters/treeSitter";
import { NODE_GRAMMAR_HOST, registerNodeGrammars } from "./nodeGrammars";

const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d];

describe("nodeGrammars and GrammarHost", () => {
  afterEach(() => {
    registerNodeGrammars();
  });

  it("reads the tree-sitter runtime and bundled grammars as valid WebAssembly bytes", async () => {
    const runtime = await NODE_GRAMMAR_HOST.runtime();
    expect(Array.from(runtime.subarray(0, 4))).toEqual(WASM_MAGIC);

    const python = await NODE_GRAMMAR_HOST.grammar("python");
    expect(Array.from(python.subarray(0, 4))).toEqual(WASM_MAGIC);
  });

  it("prefers the engine's own patched grammar build on disk over @vscode/tree-sitter-wasm", async () => {
    const ownPath = path.resolve(__dirname, "..", "..", "grammars", "powershell", "tree-sitter-powershell.wasm");
    const expected = await fs.readFile(ownPath);
    const loaded = await NODE_GRAMMAR_HOST.grammar("powershell");
    expect(Buffer.from(loaded).equals(expected)).toBe(true);
  });

  it("parses through a custom in-memory GrammarHost and throws clearly when no host is configured", async () => {
    const runtimeBytes = new Uint8Array(await NODE_GRAMMAR_HOST.runtime());
    const pythonBytes = new Uint8Array(await NODE_GRAMMAR_HOST.grammar("python"));
    const asked: string[] = [];
    const memoryGrammars: GrammarHost = {
      runtime: async () => {
        asked.push("runtime");
        return runtimeBytes;
      },
      grammar: async (name) => {
        asked.push(name);
        if (name === "python") return pythonBytes;
        throw new Error(`unexpected grammar ${name}`);
      }
    };

    setGrammarHost(memoryGrammars);
    expect(getGrammarHost()).toBe(memoryGrammars);
    expect(await readTree("python", "def greet():\n    return 1\n", (root) => root.type)).toBe("module");
    expect(asked).toEqual(["runtime", "python"]);

    // Re-registering the identical host keeps cached parsers warm without re-reading bytes.
    setGrammarHost(memoryGrammars);
    expect(await readTree("python", "x = 2\n", (root) => root.type)).toBe("module");
    expect(asked).toEqual(["runtime", "python"]);

    // Clearing the host makes parsing fail with a clear diagnostic rather than touching disk.
    setGrammarHost(undefined);
    expect(getGrammarHost()).toBeUndefined();
    await expect(readTree("python", "x = 1\n", (root) => root.type)).rejects.toThrow(/No tree-sitter GrammarHost is configured/u);
  });
});
