/**
 * The Node host's provider of tree-sitter WebAssembly bytes ({@link GrammarHost}): reads the `web-tree-sitter` runtime
 * and each language's `.wasm` grammar from disk, preferring the engine's own patched build under
 * `packages/engine/grammars/<name>/` over `@vscode/tree-sitter-wasm`.
 *
 * @remarks
 * Written 2026-11-24 for Step 7 of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6). Keeps Node path resolution (`__dirname`, `require.resolve`)
 * and disk reads (`node:fs/promises`) completely out of `adapters/treeSitter.ts` and out of the browser scan bundle.
 *
 * @module
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { setGrammarHost } from "../live-docs/adapters/treeSitter";
import { throwIfMachineFailure } from "./sourceText";
import type { GrammarHost } from "./workspaceFiles";

/** The engine's own grammars, at the package root: this module lies two folders down, in `src/tooling` or `dist/tooling`. */
const OWN_GRAMMARS = path.resolve(__dirname, "..", "..", "grammars");
const BUNDLED_GRAMMARS = path.join(path.dirname(require.resolve("@vscode/tree-sitter-wasm/package.json")), "wasm");
const RUNTIME_WASM = require.resolve("web-tree-sitter/web-tree-sitter.wasm");

/**
 * Reads the engine's own grammar build when present, falling back to `@vscode/tree-sitter-wasm`. A read of the
 * engine's own build that fails for a cause of the machine's (such as `EMFILE` or `EACCES`) throws rather than
 * silently loading an unpatched bundled grammar.
 */
async function readGrammarBytes(name: string): Promise<Uint8Array> {
  const own = path.join(OWN_GRAMMARS, name, `tree-sitter-${name}.wasm`);
  try {
    return await fs.readFile(own);
  } catch (error) {
    throwIfMachineFailure(error);
  }
  return fs.readFile(path.join(BUNDLED_GRAMMARS, `tree-sitter-${name}.wasm`));
}

/** The Node disk {@link GrammarHost}: supplies `web-tree-sitter.wasm` and grammar `.wasm` files as bytes. */
export const NODE_GRAMMAR_HOST: GrammarHost = {
  runtime: () => fs.readFile(RUNTIME_WASM),
  grammar: readGrammarBytes
};

/** Registers {@link NODE_GRAMMAR_HOST} as the active tree-sitter grammar host for the current Node process. */
export function registerNodeGrammars(): void {
  setGrammarHost(NODE_GRAMMAR_HOST);
}
