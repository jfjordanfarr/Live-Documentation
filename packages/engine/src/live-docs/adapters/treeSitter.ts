/**
 * Loads tree-sitter grammars for the adapters.
 *
 * The runtime is `web-tree-sitter`. A grammar is the engine's own build when
 * the package carries one, `grammars/<name>/tree-sitter-<name>.wasm`, built
 * from an upstream grammar with a patch that upstream has not yet taken;
 * otherwise it comes from `@vscode/tree-sitter-wasm`, whose own JavaScript
 * entry point cannot be required from Node, so only its `.wasm` files are used.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { Language, Parser, type Node, type Tree } from "web-tree-sitter";

/** A node of a parsed tree; the runtime's own name for it collides with the DOM type. */
export type SyntaxNode = Node;

/** The engine's own grammars, at the package root: this module lies three folders down, in `src` or in `dist`. */
const OWN_GRAMMARS = path.resolve(__dirname, "..", "..", "..", "grammars");
const BUNDLED_GRAMMARS = path.join(path.dirname(require.resolve("@vscode/tree-sitter-wasm/package.json")), "wasm");

/** The `.wasm` file a grammar is loaded from: the engine's own build when there is one, the bundled one otherwise. */
function grammarFile(grammar: string): string {
  const own = path.join(OWN_GRAMMARS, grammar, `tree-sitter-${grammar}.wasm`);
  return existsSync(own) ? own : path.join(BUNDLED_GRAMMARS, `tree-sitter-${grammar}.wasm`);
}

let runtime: Promise<void> | undefined;
const parsers = new Map<string, Promise<Parser>>();

/**
 * One parser per grammar, created on first use and kept for the life of the process; a load that fails, the
 * runtime's or the grammar's, is dropped, so that the next file asks again and a process that lives across many
 * generations never fails a file for a failure of the past.
 */
export function grammarParser(grammar: string): Promise<Parser> {
  let pending = parsers.get(grammar);
  if (!pending) {
    const loading = (async () => {
      const started = (runtime ??= Parser.init());
      try {
        await started;
      } catch (error) {
        if (runtime === started) runtime = undefined;
        throw error;
      }
      const language = await Language.load(grammarFile(grammar));
      const parser   = new Parser();
      parser.setLanguage(language);
      return parser;
    })();
    pending = loading;
    parsers.set(grammar, loading);
    loading.catch(() => {
      if (parsers.get(grammar) === loading) parsers.delete(grammar);
    });
  }
  return pending;
}

// The platform's class of a WebAssembly trap or abort; the engine compiles without the WebAssembly library's types.
const RUNTIME_ERROR = (globalThis as unknown as { WebAssembly: { RuntimeError: new (message?: string) => Error } }).WebAssembly.RuntimeError;

let faulted = false;

/**
 * Whether a parse in this process threw from inside the runtime's WebAssembly, a trap or an abort
 * (`WebAssembly.RuntimeError`). The runtime restores none of its state when a call into it throws (`parse` holds no
 * `finally` around its call into the module, and an abort sets a flag the module keeps), and every grammar's parser
 * shares the one module, so after such a throw no parser of the process is known sound: a process that lives across
 * many generations ends rather than parse again (the history's workers, since 2026-11-20).
 */
export function runtimeFaulted(): boolean {
  return faulted;
}

/** Parses `source` with the named grammar. The caller owns the tree and should `delete()` it when done. */
export async function parseSource(grammar: string, source: string): Promise<Tree> {
  const parser = await grammarParser(grammar);
  let tree: Tree | null;
  try {
    tree = parser.parse(source);
  } catch (error) {
    if (error instanceof RUNTIME_ERROR) faulted = true;
    throw error;
  }
  if (!tree) {
    throw new Error(`tree-sitter produced no tree for the ${grammar} grammar`);
  }
  return tree;
}
